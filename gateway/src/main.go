package main

import (
	"bytes"
	"crypto/hmac"
	"crypto/sha256"
	"encoding/base64"
	"encoding/json"
	"errors"
	"log"
	"net/http"
	"os"
	"path"
	"strings"
	"time"

	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/cors"
	"github.com/gofiber/fiber/v2/middleware/proxy"
)

type Claims struct {
	Sub      string `json:"sub"`
	Username string `json:"username"`
	Role     string `json:"role"`
	Exp      int64  `json:"exp"`
}

type Route struct {
	Prefix       string
	Target       string
	AllowedRoles map[string]bool
}

func main() {
	jwtSecret := env("JWT_SECRET", "change-me-in-production")
	historyURL := strings.TrimRight(env("HISTORY_SERVICE_URL", ""), "/")
	routes := []Route{
		{Prefix: "/auth", Target: env("AUTH_SERVICE_URL", "")},
		{Prefix: "/items", Target: env("ITEM_SERVICE_URL", ""), AllowedRoles: roles("admin", "manager")},
		{Prefix: "/suppliers", Target: env("SUPPLIER_SERVICE_URL", ""), AllowedRoles: roles("admin", "manager")},
		{Prefix: "/stock", Target: env("STOCK_SERVICE_URL", ""), AllowedRoles: roles("admin", "manager")},
		{Prefix: "/stock-movements", Target: env("STOCK_SERVICE_URL", ""), AllowedRoles: roles("admin", "manager")},
		{Prefix: "/reports", Target: env("REPORT_SERVICE_URL", ""), AllowedRoles: roles("admin")},
		{Prefix: "/history", Target: env("HISTORY_SERVICE_URL", ""), AllowedRoles: roles("admin")},
		{Prefix: "/notifications", Target: env("NOTIFICATION_SERVICE_URL", ""), AllowedRoles: roles("admin", "manager")},
	}

	app := fiber.New(fiber.Config{
		AppName:               "inventory-gateway",
		DisableStartupMessage: true,
		ReadTimeout:           10 * time.Second,
		WriteTimeout:          30 * time.Second,
		IdleTimeout:           60 * time.Second,
	})
	app.Use(cors.New(cors.Config{
		AllowOrigins: "*",
		AllowHeaders: "Authorization, Content-Type",
		AllowMethods: "GET,POST,PUT,PATCH,DELETE,OPTIONS",
	}))

	app.Get("/health", func(c *fiber.Ctx) error {
		return c.JSON(fiber.Map{"status": "ok", "service": "gateway"})
	})

	app.All("/*", func(c *fiber.Ctx) error {
		for _, route := range routes {
			if !matchesPrefix(c.Path(), route.Prefix) {
				continue
			}

			var actor *Claims
			if len(route.AllowedRoles) > 0 {
				claims, err := authenticate(c, jwtSecret)
				if err != nil {
					return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"error": err.Error()})
				}
				if !route.AllowedRoles[claims.Role] {
					return c.Status(fiber.StatusForbidden).JSON(fiber.Map{"error": "role is not allowed"})
				}
				c.Request().Header.Set("X-User-Id", claims.Sub)
				c.Request().Header.Set("X-User-Name", claims.Username)
				c.Request().Header.Set("X-User-Role", claims.Role)
				actor = claims
			}

			if err := proxy.Do(c, strings.TrimRight(route.Target, "/")+c.OriginalURL()); err != nil {
				return c.Status(fiber.StatusBadGateway).JSON(fiber.Map{"error": "upstream service unavailable"})
			}
			if actor != nil && shouldAudit(c.Method(), c.Path(), route.Prefix) {
				go sendAudit(historyURL, actor, c.Get("Authorization"), c.Method(), c.Path(), string(c.Request().URI().QueryString()), c.Response().StatusCode())
			}
			return nil
		}
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{"error": "route not found"})
	})

	addr := ":" + env("PORT", "8080")
	log.Printf("gateway listening on %s", addr)
	log.Fatal(app.Listen(addr))
}

func authenticate(c *fiber.Ctx, secret string) (*Claims, error) {
	header := c.Get("Authorization")
	if !strings.HasPrefix(header, "Bearer ") {
		return nil, errors.New("missing bearer token")
	}
	return parseJWT(strings.TrimPrefix(header, "Bearer "), secret)
}

func parseJWT(token, secret string) (*Claims, error) {
	parts := strings.Split(token, ".")
	if len(parts) != 3 {
		return nil, errors.New("invalid token")
	}
	headerPayload, err := base64.RawURLEncoding.DecodeString(parts[0])
	if err != nil {
		return nil, errors.New("invalid token header")
	}
	var header struct {
		Alg string `json:"alg"`
	}
	if err := json.Unmarshal(headerPayload, &header); err != nil || header.Alg != "HS256" {
		return nil, errors.New("invalid token algorithm")
	}
	signingInput := parts[0] + "." + parts[1]
	mac := hmac.New(sha256.New, []byte(secret))
	mac.Write([]byte(signingInput))
	expected := mac.Sum(nil)
	actual, err := base64.RawURLEncoding.DecodeString(parts[2])
	if err != nil || !hmac.Equal(actual, expected) {
		return nil, errors.New("invalid token signature")
	}

	payload, err := base64.RawURLEncoding.DecodeString(parts[1])
	if err != nil {
		return nil, errors.New("invalid token payload")
	}
	var claims Claims
	if err := json.Unmarshal(payload, &claims); err != nil {
		return nil, errors.New("invalid token claims")
	}
	if claims.Exp > 0 && time.Now().Unix() > claims.Exp {
		return nil, errors.New("token expired")
	}
	if claims.Sub == "" || claims.Role == "" {
		return nil, errors.New("token missing required claims")
	}
	return &claims, nil
}

func shouldAudit(method, requestPath, prefix string) bool {
	if prefix == "/history" || prefix == "/auth" || method == fiber.MethodOptions {
		return false
	}
	return method != fiber.MethodGet || prefix == "/reports"
}

func sendAudit(historyURL string, actor *Claims, authHeader, method, requestPath, rawQuery string, status int) {
	if historyURL == "" {
		return
	}
	entityType := strings.TrimPrefix(path.Clean(requestPath), "/")
	if entityType == "." {
		entityType = "unknown"
	}
	payload := map[string]any{
		"actor_id":    actor.Sub,
		"actor_name":  actor.Username,
		"actor_role":  actor.Role,
		"service":     "gateway",
		"action":      method + " " + requestPath,
		"entity_type": strings.Split(entityType, "/")[0],
		"metadata": map[string]any{
			"status": status,
			"query":  rawQuery,
		},
	}
	body, _ := json.Marshal(payload)
	req, err := http.NewRequest(http.MethodPost, historyURL+"/history", bytes.NewReader(body))
	if err != nil {
		return
	}
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Authorization", authHeader)
	req.Header.Set("X-User-Id", actor.Sub)
	req.Header.Set("X-User-Name", actor.Username)
	req.Header.Set("X-User-Role", actor.Role)
	client := http.Client{Timeout: 2 * time.Second}
	resp, err := client.Do(req)
	if err == nil {
		_ = resp.Body.Close()
	}
}

func roles(values ...string) map[string]bool {
	out := map[string]bool{}
	for _, value := range values {
		out[value] = true
	}
	return out
}

func matchesPrefix(pathValue, prefix string) bool {
	return pathValue == prefix || strings.HasPrefix(pathValue, prefix+"/")
}

func env(key, fallback string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}
	return fallback
}
