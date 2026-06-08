package main

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"os"
	"strconv"
	"sync"
	"time"

	"github.com/gofiber/fiber/v2"
	"github.com/golang-jwt/jwt/v5"
)

type StockItem struct {
	ID          int    `json:"id"`
	ItemID      int    `json:"item_id"`
	LocationID  int    `json:"location_id"`
	Quantity    int    `json:"quantity"`
	MinQuantity int    `json:"min_quantity"`
	Status      string `json:"status"`
}

type Notification struct {
	ID        int       `json:"id"`
	Type      string    `json:"type"`
	Message   string    `json:"message"`
	IsRead    bool      `json:"is_read"`
	CreatedAt time.Time `json:"created_at"`
}

var (
	notifications  []Notification
	notificationID = 1
	mu             sync.Mutex
)

func main() {
	app := fiber.New()

	stockServiceURL := getEnv("STOCK_SERVICE_URL", "http://stock-service:3004")
	jwtSecret := getEnv("JWT_SECRET", "change-me-in-production")
	lowStockLimit := getEnvInt("LOW_STOCK_LIMIT", 10)
	pollInterval := getEnvInt("POLL_INTERVAL_SECONDS", 30)

	go startStockPolling(stockServiceURL, jwtSecret, lowStockLimit, pollInterval)

	app.Get("/", func(c *fiber.Ctx) error {
		return c.JSON(fiber.Map{
			"service": "notification-service",
			"status":  "running",
		})
	})

	app.Get("/notifications", func(c *fiber.Ctx) error {
		mu.Lock()
		defer mu.Unlock()

		if notifications == nil {
			notifications = []Notification{}
		}

		return c.JSON(fiber.Map{
			"data": notifications,
		})
	})

	app.Patch("/notifications/:id/read", func(c *fiber.Ctx) error {
		id, err := strconv.Atoi(c.Params("id"))
		if err != nil {
			return c.Status(400).JSON(fiber.Map{
				"error": "invalid notification id",
			})
		}

		mu.Lock()
		defer mu.Unlock()

		for i := range notifications {
			if notifications[i].ID == id {
				notifications[i].IsRead = true

				return c.JSON(fiber.Map{
					"message": "notification marked as read",
					"data":    notifications[i],
				})
			}
		}

		return c.Status(404).JSON(fiber.Map{
			"error": "notification not found",
		})
	})

	log.Println("notification-service running on port 3008")
	log.Fatal(app.Listen(":3008"))
}

func startStockPolling(stockServiceURL string, jwtSecret string, lowStockLimit int, intervalSeconds int) {
	ticker := time.NewTicker(time.Duration(intervalSeconds) * time.Second)
	defer ticker.Stop()

	for {
		checkLowStock(stockServiceURL, jwtSecret, lowStockLimit)
		<-ticker.C
	}
}

func checkLowStock(stockServiceURL string, jwtSecret string, lowStockLimit int) {
	url := stockServiceURL + "/stock"

	token, err := generateInternalToken(jwtSecret)
	if err != nil {
		log.Println("failed to generate internal token:", err)
		return
	}

	req, err := http.NewRequest("GET", url, nil)
	if err != nil {
		log.Println("failed to create request:", err)
		return
	}

	req.Header.Set("Authorization", "Bearer "+token)

	client := &http.Client{
		Timeout: 10 * time.Second,
	}

	resp, err := client.Do(req)
	if err != nil {
		log.Println("failed to connect stock-service:", err)
		return
	}
	defer resp.Body.Close()

	if resp.StatusCode >= 400 {
		log.Println("stock-service returned status:", resp.StatusCode)
		return
	}

	var items []StockItem

	if err := json.NewDecoder(resp.Body).Decode(&items); err != nil {
		log.Println("failed to decode stock response:", err)
		return
	}

	for _, item := range items {
		limit := item.MinQuantity

		if limit == 0 {
			limit = lowStockLimit
		}

		if item.Quantity <= limit {
			message := fmt.Sprintf(
				"Low stock detected for item ID %d. Current stock: %d, minimum stock: %d",
				item.ItemID,
				item.Quantity,
				limit,
			)

			addNotification("LOW_STOCK", message)
		}
	}
}

func generateInternalToken(jwtSecret string) (string, error) {
	claims := jwt.MapClaims{
		"sub":      "notification-service",
		"username": "notification-service",
		"role":     "admin",
		"iat":      time.Now().Unix(),
		"exp":      time.Now().Add(1 * time.Hour).Unix(),
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)

	return token.SignedString([]byte(jwtSecret))
}

func addNotification(notificationType string, message string) {
	mu.Lock()
	defer mu.Unlock()

	for _, notif := range notifications {
		if notif.Message == message && !notif.IsRead {
			return
		}
	}

	notification := Notification{
		ID:        notificationID,
		Type:      notificationType,
		Message:   message,
		IsRead:    false,
		CreatedAt: time.Now(),
	}

	notifications = append(notifications, notification)
	notificationID++
}

func getEnv(key string, defaultValue string) string {
	value := os.Getenv(key)

	if value == "" {
		return defaultValue
	}

	return value
}

func getEnvInt(key string, defaultValue int) int {
	value := os.Getenv(key)

	if value == "" {
		return defaultValue
	}

	parsed, err := strconv.Atoi(value)
	if err != nil {
		return defaultValue
	}

	return parsed
}