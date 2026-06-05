package models

import "time"

type ItemUnit struct {
	ID        uint      `gorm:"primaryKey;column:id" json:"id"`
	Code      string    `gorm:"column:code" json:"code"`
	Name      string    `gorm:"column:name" json:"name"`
	CreatedAt time.Time `gorm:"column:created_at" json:"created_at"`
	UpdatedAt time.Time `gorm:"column:updated_at" json:"updated_at"`
}

func (ItemUnit) TableName() string {
	return "item_units"
}

type ItemCategory struct {
	ID        uint      `gorm:"primaryKey;column:id" json:"id"`
	Name      string    `gorm:"column:name" json:"name"`
	CreatedAt time.Time `gorm:"column:created_at" json:"created_at"`
	UpdatedAt time.Time `gorm:"column:updated_at" json:"updated_at"`
}

func (ItemCategory) TableName() string {
	return "item_categories"
}

type Item struct {
	ID          uint          `gorm:"primaryKey;column:id" json:"id"`
	UnitID      uint          `gorm:"column:unit_id" json:"unit_id"`
	CategoryID  *uint         `gorm:"column:category_id" json:"category_id"`
	SKU         string        `gorm:"column:sku" json:"sku"`
	Name        string        `gorm:"column:name" json:"name"`
	Description *string       `gorm:"column:description" json:"description"`
	IsActive    bool          `gorm:"column:is_active" json:"is_active"`
	CreatedAt   time.Time     `gorm:"column:created_at" json:"created_at"`
	UpdatedAt   time.Time     `gorm:"column:updated_at" json:"updated_at"`
	Unit        ItemUnit      `gorm:"foreignKey:UnitID" json:"unit"`
	Category    *ItemCategory `gorm:"foreignKey:CategoryID" json:"category"`
}

func (Item) TableName() string {
	return "items"
}
