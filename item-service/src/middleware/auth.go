package middleware

import (
	"strings"

	"inventory/item-service/src/config"

	"github.com/gofiber/fiber/v2"
	"github.com/golang-jwt/jwt/v5"
)

type Claims struct {
	Username string `json:"username"`
	Role     string `json:"role"`
	jwt.RegisteredClaims
}

func RequireRoles(cfg config.Config, allowedRoles ...string) fiber.Handler {
	allowed := map[string]bool{}
	for _, role := range allowedRoles {
		allowed[role] = true
	}
	return func(c *fiber.Ctx) error {
		header := c.Get("Authorization")
		if !strings.HasPrefix(header, "Bearer ") {
			return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"error": "missing bearer token"})
		}
		token, err := jwt.ParseWithClaims(strings.TrimPrefix(header, "Bearer "), &Claims{}, func(token *jwt.Token) (any, error) {
			return []byte(cfg.JWTSecret), nil
		}, jwt.WithValidMethods([]string{"HS256"}))
		if err != nil || !token.Valid {
			return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"error": "invalid token"})
		}
		claims, ok := token.Claims.(*Claims)
		if !ok || !allowed[claims.Role] {
			return c.Status(fiber.StatusForbidden).JSON(fiber.Map{"error": "role is not allowed"})
		}
		c.Locals("user_id", claims.Subject)
		c.Locals("user_name", claims.Username)
		c.Locals("user_role", claims.Role)
		return c.Next()
	}
}
