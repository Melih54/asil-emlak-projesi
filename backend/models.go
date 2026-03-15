package main

import "time"

// User: Yönetici (Admin) tablosunu temsil eder
type User struct {
	ID           uint      `gorm:"primaryKey" json:"id"`
	Username     string    `json:"username"`
	PasswordHash string    `json:"-"` // "-" işareti şifrenin API yanıtlarında asla görünmemesini sağlar (Güvenlik)
	CreatedAt    time.Time `json:"created_at"`
}

// Property: İlanlar tablosunu temsil eder
type Property struct {
	ID          uint      `gorm:"primaryKey" json:"id"`
	Title       string    `json:"title"`
	Description string    `json:"description"`
	Price       float64   `json:"price"`
	Type        string    `json:"type"`
	Rooms       string    `json:"rooms"`
	Location    string    `json:"location"`
	CreatedAt   time.Time `json:"created_at"`
	Badge       string    `json:"badge"`
	Images      []Image   `gorm:"foreignKey:PropertyID" json:"images"` // Bir ilanın birden fazla resmi olabilir
}

// Image: Resimler tablosunu temsil eder
type Image struct {
	ID         uint   `gorm:"primaryKey" json:"id"`
	PropertyID uint   `json:"property_id"`
	ImagePath  string `json:"image_path"`
	IsMain     bool   `json:"is_main"`
}

// Message: İletişim mesajlarını temsil eder
type Message struct {
	ID        uint      `gorm:"primaryKey" json:"id"`
	Name      string    `json:"name"`
	Email     string    `json:"email"`
	Phone     string    `json:"phone"`
	Message   string    `json:"message"`
	IsRead    bool      `json:"is_read"`
	CreatedAt time.Time `json:"created_at"`
}
