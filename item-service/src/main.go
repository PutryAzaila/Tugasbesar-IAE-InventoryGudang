package main

import (
	"log"
	"time"

	"inventory/item-service/src/config"
	"inventory/item-service/src/database"
	"inventory/item-service/src/routes"

	"github.com/gofiber/fiber/v2"
)

func main() {
	cfg := config.Load()
	db, err := database.Connect(cfg)
	if err != nil {
		log.Fatal(err)
	}

	app := fiber.New(fiber.Config{
		AppName:               "item-service",
		DisableStartupMessage: true,
		ReadTimeout:           10 * time.Second,
		WriteTimeout:          20 * time.Second,
		IdleTimeout:           60 * time.Second,
	})
	routes.Register(app, db, cfg)

	log.Printf("item-service listening on :%s", cfg.Port)
	log.Fatal(app.Listen(":" + cfg.Port))
}
