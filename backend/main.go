package main

import (
	"fmt"
	"log"
	"net/http"
	"os"
	"path/filepath"
	"time"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"golang.org/x/crypto/bcrypt"
	"gorm.io/driver/mysql"
	"gorm.io/gorm"
)

var DB *gorm.DB

// ==========================================
// 🔥 EKSİK OLAN TEMEL MODELLER EKLENDİ 🔥
// ==========================================
type User struct {
	ID           uint   `gorm:"primaryKey" json:"id"`
	Username     string `json:"username"`
	PasswordHash string `json:"password_hash"`
}

type Image struct {
	ID         uint   `gorm:"primaryKey" json:"id"`
	PropertyID uint   `json:"property_id"`
	ImagePath  string `json:"image_path"`
	IsMain     bool   `json:"is_main"`
}

type Property struct {
	ID          uint      `gorm:"primaryKey" json:"id"`
	Title       string    `json:"title"`
	Description string    `json:"description"`
	Price       float64   `json:"price"`
	Type        string    `json:"type"`
	Rooms       string    `json:"rooms"`
	Location    string    `json:"location"`
	Badge       string    `json:"badge"`
	Images      []Image   `gorm:"foreignKey:PropertyID;constraint:OnUpdate:CASCADE,OnDelete:CASCADE;" json:"images"`
	CreatedAt   time.Time `json:"created_at"`
}

type Message struct {
	ID        uint      `gorm:"primaryKey" json:"id"`
	Name      string    `json:"name"`
	Phone     string    `json:"phone"`
	Email     string    `json:"email"`
	Content   string    `json:"content"`
	CreatedAt time.Time `json:"created_at"`
}

// ==========================================
// DİĞER MODELLER
// ==========================================
type InfoCard struct {
	ID          uint   `gorm:"primaryKey" json:"id"`
	Icon        string `json:"icon"`
	Title       string `json:"title"`
	Description string `json:"description"`
}

type TeamMember struct {
	ID          uint   `gorm:"primaryKey" json:"id"`
	Name        string `json:"name"`
	Role        string `json:"role"`
	Description string `json:"description"`
	ImagePath   string `json:"image_path"`
}

type BlogPost struct {
	ID        uint      `gorm:"primaryKey" json:"id"`
	Title     string    `json:"title"`
	Summary   string    `json:"summary"` // Kartta görünecek kısa özet
	Content   string    `json:"content"` // Yazının tamamı
	ImagePath string    `json:"image_path"`
	CreatedAt time.Time `json:"created_at"`
}

// --- VERİTABANI BAĞLANTISI ---
func connectDatabase() {
	// DİKKAT: Şifren ve DB adın doğru olmalı. DB önceden phpMyAdmin'de açılmış olmalı!
	dsn := "root:123456@tcp(127.0.0.1:3306)/asilemlak_db?charset=utf8mb4&parseTime=True&loc=Local"
	database, err := gorm.Open(mysql.Open(dsn), &gorm.Config{})

	if err != nil {
		log.Fatal("Veritabanına bağlanılamadı! Hata: ", err)
	}

	DB = database
	// Artık modeller eksiksiz, AutoMigrate sorunsuz çalışacak!
	DB.AutoMigrate(&User{}, &Property{}, &Image{}, &Message{}, &InfoCard{}, &TeamMember{}, &BlogPost{})
	fmt.Println("Veritabanı bağlantısı başarıyla kuruldu ve tablolar oluşturuldu!")
}

// Profesyonel ve Güvenli Admin Oluşturma
func initAdmin() {
	var count int64
	DB.Model(&User{}).Count(&count)
	if count == 0 {
		adminPass := os.Getenv("ASIL_ADMIN_PASSWORD")
		if adminPass == "" {
			adminPass = "Asil12345"
		}

		hashedPassword, _ := bcrypt.GenerateFromPassword([]byte(adminPass), bcrypt.DefaultCost)
		admin := User{Username: "admin", PasswordHash: string(hashedPassword)}
		DB.Create(&admin)
		fmt.Println("Varsayılan Admin hesabı oluşturuldu!")
	}
}

func initInfoCards() {
	var count int64
	DB.Model(&InfoCard{}).Count(&count)
	if count == 0 {
		cards := []InfoCard{
			{Icon: "📈", Title: "Kira Artış Oranı", Description: "TÜFE ortalamasına göre belirlenen resmi tavan zam oranı bu ay için %55.91 olarak açıklanmıştır."},
			{Icon: "🏛️", Title: "Tapu ve Takip İşlemleri", Description: "Alım, satım ve kiralama süreçlerindeki tüm resmi evrak ve tapu işlemlerinizi uzman ekibimizle güvenle takip ediyoruz."},
			{Icon: "🤝", Title: "Ücretsiz Ekspertiz", Description: "Evinizin veya arsanızın güncel piyasa değerini öğrenmek için uzman ekibimizden hemen ücretsiz destek alın."},
		}
		DB.Create(&cards)
		fmt.Println("Varsayılan Bilgi Kartları oluşturuldu!")
	}
}

func initBlogs() {
	var count int64
	DB.Model(&BlogPost{}).Count(&count)
	if count == 0 {
		blogs := []BlogPost{
			{Title: "2026 Yılında Konut Kredisi Faizleri Düşecek Mi?", Summary: "Merkez Bankası'nın son kararları ışığında emlak piyasası değerlendirmesi ve ev alma zamanlaması üzerine uzman görüşlerimiz...", Content: "Uzmanlarımıza göre 2026 yılının ikinci yarısında faizlerde gevşeme bekleniyor. Bu durum fiyatların artmasına sebep olabileceği için, şu an nakitte olan veya uygun oranlı kredi bulan yatırımcılar için büyük bir fırsat penceresi açık... (Örnek Makale)", CreatedAt: time.Now()},
			{Title: "Bölgede Yatırım Yapılabilecek En İyi 3 Mahalle", Summary: "Değeri hızla artan bölgeler, yeni imar planları ve arsa yatırımı tavsiyeleri.", Content: "Son açıklanan otoyol ve hastane projeleriyle birlikte şehrin kuzey yakasındaki araziler %40 değer kazandı. Eğer orta vadeli bir yatırım düşünüyorsanız... (Örnek Makale)", CreatedAt: time.Now()},
		}
		DB.Create(&blogs)
		fmt.Println("Varsayılan Blog Yazıları oluşturuldu!")
	}
}

// --- CONTROLLER FONKSİYONLARI ---

func login(c *gin.Context) {
	var input struct {
		Username string `json:"username"`
		Password string `json:"password"`
	}
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"hata": "Geçersiz giriş bilgisi"})
		return
	}
	var user User
	if err := DB.Where("username = ?", input.Username).First(&user).Error; err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"hata": "Kullanıcı adı veya şifre hatalı!"})
		return
	}
	if err := bcrypt.CompareHashAndPassword([]byte(user.PasswordHash), []byte(input.Password)); err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"hata": "Kullanıcı adı veya şifre hatalı!"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"mesaj": "Giriş Başarılı", "token": "asil_emlak_onayli_giris_123"})
}

func getProperties(c *gin.Context) {
	var properties []Property
	DB.Preload("Images").Order("created_at desc").Find(&properties)
	c.JSON(http.StatusOK, properties)
}

func getProperty(c *gin.Context) {
	id := c.Param("id")
	var property Property
	if err := DB.Preload("Images").First(&property, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"hata": "İlan bulunamadı"})
		return
	}
	c.JSON(http.StatusOK, property)
}

func createProperty(c *gin.Context) {
	var newProperty Property
	if err := c.ShouldBindJSON(&newProperty); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"hata": err.Error()})
		return
	}
	newProperty.CreatedAt = time.Now()
	DB.Create(&newProperty)
	c.JSON(http.StatusCreated, newProperty)
}

func deleteProperty(c *gin.Context) {
	id := c.Param("id")
	if err := DB.Delete(&Property{}, id).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"hata": "İlan silinemedi"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"mesaj": "İlan silindi"})
}

func updateProperty(c *gin.Context) {
	id := c.Param("id")
	var property Property

	if err := DB.Preload("Images").First(&property, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"hata": "İlan bulunamadı"})
		return
	}

	var input Property
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"hata": "Geçersiz veri"})
		return
	}

	err := DB.Transaction(func(tx *gorm.DB) error {
		if err := tx.Model(&property).Updates(Property{
			Title:       input.Title,
			Description: input.Description,
			Price:       input.Price,
			Type:        input.Type,
			Rooms:       input.Rooms,
			Location:    input.Location,
			Badge:       input.Badge,
		}).Error; err != nil {
			return err
		}

		if len(input.Images) > 0 {
			if err := tx.Model(&property).Association("Images").Replace(input.Images); err != nil {
				return err
			}
		} else {
			if err := tx.Model(&property).Association("Images").Clear(); err != nil {
				return err
			}
		}
		return nil
	})

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"hata": "Güncelleme başarısız: " + err.Error()})
		return
	}

	DB.Preload("Images").First(&property, id)
	c.JSON(http.StatusOK, property)
}

func uploadImage(c *gin.Context) {
	file, err := c.FormFile("image")
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"hata": "Resim alınamadı"})
		return
	}
	os.MkdirAll("uploads", os.ModePerm)
	filename := fmt.Sprintf("%d_%s", time.Now().Unix(), filepath.Base(file.Filename))
	filepath := "uploads/" + filename
	if err := c.SaveUploadedFile(file, filepath); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"hata": "Resim kaydedilemedi"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"image_url": "/" + filepath})
}

func createMessage(c *gin.Context) {
	var newMessage Message
	if err := c.ShouldBindJSON(&newMessage); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"hata": "Geçersiz veri"})
		return
	}
	newMessage.CreatedAt = time.Now()
	DB.Create(&newMessage)
	c.JSON(http.StatusCreated, gin.H{"mesaj": "Alındı"})
}

func getMessages(c *gin.Context) {
	var messages []Message
	DB.Order("created_at desc").Find(&messages)
	c.JSON(http.StatusOK, messages)
}

func getInfoCards(c *gin.Context) {
	var cards []InfoCard
	DB.Find(&cards)
	c.JSON(http.StatusOK, cards)
}

func updateInfoCard(c *gin.Context) {
	id := c.Param("id")
	var card InfoCard
	if err := DB.First(&card, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"hata": "Kart bulunamadı"})
		return
	}
	var input InfoCard
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"hata": "Geçersiz veri"})
		return
	}
	DB.Model(&card).Updates(input)
	c.JSON(http.StatusOK, gin.H{"mesaj": "Güncellendi"})
}

func getTeamMembers(c *gin.Context) {
	var members []TeamMember
	DB.Find(&members)
	c.JSON(http.StatusOK, members)
}

func createTeamMember(c *gin.Context) {
	var newMember TeamMember
	if err := c.ShouldBindJSON(&newMember); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"hata": "Geçersiz veri"})
		return
	}
	DB.Create(&newMember)
	c.JSON(http.StatusCreated, newMember)
}

func updateTeamMember(c *gin.Context) {
	id := c.Param("id")
	var member TeamMember
	if err := DB.First(&member, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"hata": "Bulunamadı"})
		return
	}
	var input TeamMember
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"hata": "Geçersiz veri"})
		return
	}
	DB.Model(&member).Updates(input)
	c.JSON(http.StatusOK, member)
}

func deleteTeamMember(c *gin.Context) {
	id := c.Param("id")
	if err := DB.Delete(&TeamMember{}, id).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"hata": "Silinemedi"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"mesaj": "Silindi"})
}

func getBlogs(c *gin.Context) {
	var blogs []BlogPost
	DB.Order("created_at desc").Find(&blogs)
	c.JSON(http.StatusOK, blogs)
}

func getBlog(c *gin.Context) {
	id := c.Param("id")
	var blog BlogPost
	if err := DB.First(&blog, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"hata": "Yazı bulunamadı"})
		return
	}
	c.JSON(http.StatusOK, blog)
}

func createBlog(c *gin.Context) {
	var newBlog BlogPost
	if err := c.ShouldBindJSON(&newBlog); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"hata": "Geçersiz veri"})
		return
	}
	newBlog.CreatedAt = time.Now()
	DB.Create(&newBlog)
	c.JSON(http.StatusCreated, newBlog)
}

func deleteBlog(c *gin.Context) {
	id := c.Param("id")
	if err := DB.Delete(&BlogPost{}, id).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"hata": "Silinemedi"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"mesaj": "Silindi"})
}

// ==========================================
// ANA FONKSİYON (MOTORU ÇALIŞTIRMA)
// ==========================================
func main() {
	// 1. Veritabanına Bağlan ve Tabloları Oluştur
	connectDatabase()

	// 2. Varsayılan Verileri Doldur (Kontağı Çevir!)
	initAdmin()
	initInfoCards()
	initBlogs() // 🔥 EKSİK OLAN BUYDU, EKLENDİ! 🔥

	// 3. Router ve CORS Ayarları
	router := gin.Default()
	router.Use(cors.New(cors.Config{
		AllowOrigins:     []string{"http://localhost:3000", "http://localhost:5173", "*"}, // Mobilden girmek için * eklendi
		AllowMethods:     []string{"GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Accept", "Authorization"},
		AllowCredentials: true,
		MaxAge:           12 * time.Hour,
	}))

	router.Static("/uploads", "./uploads")

	// 4. API Rotaları
	api := router.Group("/api")
	{
		api.POST("/login", login)

		api.GET("/properties", getProperties)
		api.GET("/properties/:id", getProperty)
		api.POST("/properties", createProperty)
		api.DELETE("/properties/:id", deleteProperty)
		api.PUT("/properties/:id", updateProperty)

		api.POST("/upload", uploadImage)

		api.POST("/messages", createMessage)
		api.GET("/messages", getMessages)

		api.GET("/info-cards", getInfoCards)
		api.PUT("/info-cards/:id", updateInfoCard)

		api.GET("/team", getTeamMembers)
		api.POST("/team", createTeamMember)
		api.PUT("/team/:id", updateTeamMember)
		api.DELETE("/team/:id", deleteTeamMember)

		api.GET("/blogs", getBlogs)
		api.GET("/blogs/:id", getBlog)
		api.POST("/blogs", createBlog)
		api.DELETE("/blogs/:id", deleteBlog)
	}

	fmt.Println("🚀 Sunucu http://localhost:8080 adresinde çalışıyor...")
	router.Run(":8080")
}
