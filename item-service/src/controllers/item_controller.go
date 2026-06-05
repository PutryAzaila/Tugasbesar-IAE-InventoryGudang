package controllers

import (
	"errors"
	"strings"

	"inventory/item-service/src/models"

	"github.com/gofiber/fiber/v2"
	"gorm.io/gorm"
)

type ItemController struct {
	db *gorm.DB
}

type ItemInput struct {
	UnitID      uint    `json:"unit_id"`
	CategoryID *uint   `json:"category_id"`
	SKU         string  `json:"sku"`
	Name        string  `json:"name"`
	Description *string `json:"description"`
	IsActive    *bool   `json:"is_active"`
}

func NewItemController(db *gorm.DB) *ItemController {
	return &ItemController{db: db}
}

func (ctl *ItemController) List(c *fiber.Ctx) error {
	var items []models.Item
	if err := ctl.db.Preload("Unit").Preload("Category").Order("id desc").Find(&items).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": err.Error()})
	}
	return c.JSON(items)
}

func (ctl *ItemController) Create(c *fiber.Ctx) error {
	input, err := parseItemInput(c)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": err.Error()})
	}
	item := models.Item{
		UnitID:      input.UnitID,
		CategoryID:  input.CategoryID,
		SKU:         input.SKU,
		Name:        input.Name,
		Description: input.Description,
		IsActive:    true,
	}
	if input.IsActive != nil {
		item.IsActive = *input.IsActive
	}
	if err := ctl.db.Create(&item).Error; err != nil {
		return c.Status(fiber.StatusConflict).JSON(fiber.Map{"error": err.Error()})
	}
	return ctl.respondItem(c.Status(fiber.StatusCreated), item.ID)
}

func (ctl *ItemController) Show(c *fiber.Ctx) error {
	return ctl.respondItem(c, c.Params("id"))
}

func (ctl *ItemController) respondItem(c *fiber.Ctx, id any) error {
	var item models.Item
	if err := ctl.db.Preload("Unit").Preload("Category").First(&item, id).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return c.Status(fiber.StatusNotFound).JSON(fiber.Map{"error": "item not found"})
		}
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": err.Error()})
	}
	return c.JSON(item)
}

func (ctl *ItemController) Update(c *fiber.Ctx) error {
	input, err := parseItemInput(c)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": err.Error()})
	}
	var item models.Item
	if err := ctl.db.First(&item, c.Params("id")).Error; err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{"error": "item not found"})
	}
	item.UnitID = input.UnitID
	item.CategoryID = input.CategoryID
	item.SKU = input.SKU
	item.Name = input.Name
	item.Description = input.Description
	if input.IsActive != nil {
		item.IsActive = *input.IsActive
	}
	if err := ctl.db.Save(&item).Error; err != nil {
		return c.Status(fiber.StatusConflict).JSON(fiber.Map{"error": err.Error()})
	}
	return ctl.Show(c)
}

func (ctl *ItemController) Delete(c *fiber.Ctx) error {
	result := ctl.db.Delete(&models.Item{}, c.Params("id"))
	if result.Error != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": result.Error.Error()})
	}
	if result.RowsAffected == 0 {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{"error": "item not found"})
	}
	return c.SendStatus(fiber.StatusNoContent)
}

func (ctl *ItemController) Units(c *fiber.Ctx) error {
	var units []models.ItemUnit
	if err := ctl.db.Order("code asc").Find(&units).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": err.Error()})
	}
	return c.JSON(units)
}

func (ctl *ItemController) Categories(c *fiber.Ctx) error {
	var categories []models.ItemCategory
	if err := ctl.db.Order("name asc").Find(&categories).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": err.Error()})
	}
	return c.JSON(categories)
}

func parseItemInput(c *fiber.Ctx) (ItemInput, error) {
	var input ItemInput
	if err := c.BodyParser(&input); err != nil {
		return input, errors.New("invalid json body")
	}
	input.SKU = strings.TrimSpace(input.SKU)
	input.Name = strings.TrimSpace(input.Name)
	if input.UnitID == 0 || input.SKU == "" || input.Name == "" {
		return input, errors.New("unit_id, sku, and name are required")
	}
	if input.Description != nil {
		value := strings.TrimSpace(*input.Description)
		input.Description = &value
	}
	return input, nil
}
