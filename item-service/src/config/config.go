package config

import (
	"fmt"
	"os"
)

type Config struct {
	Port      string
	JWTSecret string
	DBHost    string
	DBPort    string
	DBName    string
	DBUser    string
	DBPass    string
}

func Load() Config {
	return Config{
		Port:      env("PORT", "3002"),
		JWTSecret: env("JWT_SECRET", "change-me-in-production"),
		DBHost:    env("DB_HOST", "localhost"),
		DBPort:    env("DB_PORT", "3306"),
		DBName:    env("DB_NAME", "item_db"),
		DBUser:    env("DB_USER", "item_user"),
		DBPass:    env("DB_PASSWORD", "item_pass"),
	}
}

func (c Config) DSN() string {
	return fmt.Sprintf("%s:%s@tcp(%s:%s)/%s?charset=utf8mb4&parseTime=True&loc=Local", c.DBUser, c.DBPass, c.DBHost, c.DBPort, c.DBName)
}

func env(key, fallback string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}
	return fallback
}
