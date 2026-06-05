package routes

import (
	"inventory/item-service/src/config"
	"inventory/item-service/src/controllers"
	"inventory/item-service/src/middleware"

	"github.com/gofiber/fiber/v2"
	"gorm.io/gorm"
)

func Register(app *fiber.App, db *gorm.DB, cfg config.Config) {
	items := controllers.NewItemController(db)
	app.Get("/health", func(c *fiber.Ctx) error {
		return c.JSON(fiber.Map{"status": "ok", "service": "item-service"})
	})

	protected := app.Group("/", middleware.RequireRoles(cfg, "admin", "manager"))
	protected.Get("/items", items.List)
	protected.Post("/items", items.Create)
	protected.Get("/items/:id", items.Show)
	protected.Put("/items/:id", items.Update)
	protected.Delete("/items/:id", items.Delete)
	protected.Get("/item-units", items.Units)
	protected.Get("/item-categories", items.Categories)
}
