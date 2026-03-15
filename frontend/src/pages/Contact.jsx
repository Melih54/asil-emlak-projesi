import { useState } from 'react';
import axios from 'axios';
import './Contact.css';

function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:8080/api/messages', formData);
      alert('Mesajınız başarıyla gönderildi! En kısa sürede size dönüş yapacağız.');
      setFormData({ name: '', email: '', phone: '', message: '' });
    } catch (error) {
      console.error("Mesaj gönderilirken hata:", error);
      alert('Mesaj gönderilemedi. Lütfen daha sonra tekrar deneyiniz.');
    }
  };

  return (
    <div className="contact-page-wrapper">
      
      {/* Üst Karşılama Alanı */}
      <div className="contact-header-glass">
        <h1>Bize Ulaşın</h1>
        <p>Hayalinizdeki evi bulmak veya gayrimenkulünüzü değerinde satmak için bir mesaj uzağınızdayız.</p>
      </div>

      <div className="contact-content-grid">
        
        {/* SOL SÜTUN: Bilgiler, Açıklama ve Harita */}
        <div className="contact-info-side">
          <h2>Asil Emlak Düzce</h2>
          
          <p className="contact-description">
            Yılların verdiği tecrübe ve bölgeye hakim uzman kadromuzla, Düzce ve çevresindeki tüm emlak ihtiyaçlarınız için yanınızdayız. Satılık, kiralık, arsa veya iş yeri yatırımlarınızda size en doğru, şeffaf ve kazançlı yönlendirmeyi yapmak birinci önceliğimizdir. Bizi ofisimizde ziyaret edebilir, bir kahvemizi içebilirsiniz.
          </p>

          <div className="info-details-list">
            <div className="info-item">
              <div className="info-icon">📍</div>
              <div className="info-text">
                <h4>Ofis Adresimiz</h4>
                <p>Merkez / Düzce, Türkiye</p>
              </div>
            </div>
            
            <div className="info-item">
              <div className="info-icon">📞</div>
              <div className="info-text">
                <h4>Telefon Numarası</h4>
                <p>+90 (555) 123 45 67</p>
              </div>
            </div>

            <div className="info-item">
              <div className="info-icon">✉️</div>
              <div className="info-text">
                <h4>E-Posta Adresi</h4>
                <p>info@asilemlak.com</p>
              </div>
            </div>
          </div>

          {/* Google Haritalar Gömülü Kodu (Düzce Merkezi Gösterir) */}
          <div className="map-container">
            <iframe 
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d1509.3268915400968!2d31.1574644207958!3d40.835567738947056!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x409d755cd29b27bd%3A0x3d1b72dc888e6d9b!2zQXptaW1pbGxpLCBBeWTEsW5wxLFuYXIgQ2QuIE46MTkvQSwgODEwMTAgRMO8emNl!5e0!3m2!1str!2str!4v1773506662724!5m2!1str!2str" 
              width="100%" 
              height="250" 
              style={{ border: 0, display: 'block' }} 
              allowFullScreen="" 
              loading="lazy" 
              referrerPolicy="no-referrer-when-downgrade"
              title="Asil Emlak Konum"
            ></iframe>
          </div>
        </div>

        {/* SAĞ SÜTUN: İletişim Formu */}
        <div className="contact-form-side">
          <h2>Mesaj Gönderin</h2>
          <form onSubmit={handleSubmit} className="contact-form">
            <div className="form-group">
              <label>Adınız Soyadınız:</label>
              <input type="text" name="name" value={formData.name} onChange={handleChange} required placeholder="Örn: Ahmet Yılmaz" />
            </div>

            <div className="form-group">
              <label>E-Posta Adresiniz:</label>
              <input type="email" name="email" value={formData.email} onChange={handleChange} required placeholder="Örn: ahmet@ornek.com" />
            </div>

            <div className="form-group">
              <label>Telefon Numaranız:</label>
              <input type="tel" name="phone" value={formData.phone} onChange={handleChange} placeholder="Örn: 0555 123 45 67" />
            </div>

            <div className="form-group">
              <label>Mesajınız:</label>
              <textarea name="message" value={formData.message} onChange={handleChange} required placeholder="Size nasıl yardımcı olabiliriz? Lütfen detayları buraya yazın..."></textarea>
            </div>

            <button type="submit" className="send-btn">Mesajı Gönder</button>
          </form>
        </div>

      </div>
    </div>
  );
}

export default Contact;