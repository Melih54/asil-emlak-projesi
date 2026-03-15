import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './PropertyDetail.css';
import './Home.css';

function PropertyDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [property, setProperty] = useState(null);
  const [mainImage, setMainImage] = useState('');
  
  const [similarProperties, setSimilarProperties] = useState([]);
  const [favorites, setFavorites] = useState(JSON.parse(localStorage.getItem('asilFavorites')) || []);

  // 🔥 KAYDIRMA (SWIPE) İÇİN STATELER 🔥
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);

  useEffect(() => {
    const fetchProperty = async () => {
      try {
        const response = await axios.get(`http://localhost:8080/api/properties/${id}`);
        setProperty(response.data);
        if (response.data.images && response.data.images.length > 0) {
          const kapakResmi = response.data.images.find(img => img.is_main) || response.data.images[0];
          setMainImage(kapakResmi.image_path);
        }

        const allRes = await axios.get(`http://localhost:8080/api/properties`);
        const allProps = allRes.data;
        const similar = allProps.filter(p => p.id !== parseInt(id) && p.type === response.data.type).slice(0, 3);
        setSimilarProperties(similar);

      } catch (error) { console.error("Hata:", error); }
    };
    fetchProperty();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [id]);

  // 🔥 İLERİ / GERİ GİTME FONKSİYONLARI 🔥
  const handleNextImage = () => {
    if (!property || !property.images || property.images.length <= 1) return;
    const currentIndex = property.images.findIndex(img => img.image_path === mainImage);
    const nextIndex = (currentIndex + 1) % property.images.length;
    setMainImage(property.images[nextIndex].image_path);
  };

  const handlePrevImage = () => {
    if (!property || !property.images || property.images.length <= 1) return;
    const currentIndex = property.images.findIndex(img => img.image_path === mainImage);
    const prevIndex = (currentIndex - 1 + property.images.length) % property.images.length;
    setMainImage(property.images[prevIndex].image_path);
  };

  // 🔥 KLAVYE (SAĞ/SOL OK) DİNLEYİCİSİ 🔥
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'ArrowRight') handleNextImage();
      if (e.key === 'ArrowLeft') handlePrevImage();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [mainImage, property]); // mainImage değiştikçe güncellenir

  // 🔥 FARE VE PARMAKLA KAYDIRMA (SWIPE) MANTIĞI 🔥
  const onDragStart = (e) => {
    setTouchEnd(null);
    setTouchStart(e.clientX || e.targetTouches[0].clientX);
  };

  const onDragMove = (e) => {
    setTouchEnd(e.clientX || e.targetTouches[0].clientX);
  };

  const onDragEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > 50;  // 50px sağdan sola çekerse
    const isRightSwipe = distance < -50; // 50px soldan sağa çekerse

    if (isLeftSwipe) handleNextImage();
    if (isRightSwipe) handlePrevImage();
  };

  const toggleFavorite = (e, propId) => {
    if(e) e.stopPropagation();
    let favs = [...favorites];
    if (favs.includes(propId)) { favs = favs.filter(f => f !== propId); } 
    else { favs.push(propId); }
    setFavorites(favs);
    localStorage.setItem('asilFavorites', JSON.stringify(favs));
  };

  const shareOnWhatsApp = () => {
    const url = window.location.href;
    const text = `Harika bir ilan buldum! ${property.title} - ${property.price.toLocaleString('tr-TR')} ₺. İncelemek için tıkla: \n${url}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
  };

  const copyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    alert('İlan linki kopyalandı!');
  };

  if (!property) return <div style={{textAlign: 'center', marginTop: '50px', fontSize:'20px', color:'white'}}>İlan yükleniyor...</div>;

  const isFav = favorites.includes(property.id);

  return (
    <div className="property-detail-container">
      <button className="back-btn" onClick={() => navigate(-1)}>&larr; Geri Dön</button>
      
      <div className="detail-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1>{property.title}</h1>
          <p className="detail-price">{property.price.toLocaleString('tr-TR')} ₺</p>
        </div>
        <button className="detail-fav-btn" onClick={() => toggleFavorite(null, property.id)} title={isFav ? "Favorilerden Çıkar" : "Favorilere Ekle"}>
          {isFav ? '❤️' : '🤍'}
        </button>
      </div>

      <div className="detail-content">
        
        {/* 🔥 YENİ: KAYDIRILABİLİR RESİM GALERİSİ 🔥 */}
        <div className="detail-image-box">
          {mainImage ? (
            <div 
              className="main-image-container"
              // Fare olayları (Bilgisayar)
              onMouseDown={onDragStart}
              onMouseMove={onDragMove}
              onMouseUp={onDragEnd}
              onMouseLeave={onDragEnd}
              // Dokunmatik olayları (Telefon)
              onTouchStart={onDragStart}
              onTouchMove={onDragMove}
              onTouchEnd={onDragEnd}
            >
              {/* Sol Ok */}
              {property.images.length > 1 && (
                <button className="image-nav-btn left" onClick={(e) => { e.stopPropagation(); handlePrevImage(); }}>&#10094;</button>
              )}
              
              {/* Ana Resim (draggable=false ile tarayıcının resmi indirme sürüklemesini engelledik) */}
              <img 
                src={`http://localhost:8080${mainImage}`} 
                alt={property.title} 
                className="detail-main-image" 
                draggable="false" 
              />

              {/* Sağ Ok */}
              {property.images.length > 1 && (
                <button className="image-nav-btn right" onClick={(e) => { e.stopPropagation(); handleNextImage(); }}>&#10095;</button>
              )}
            </div>
          ) : (
            <div className="no-image" style={{ height: '450px', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f4f4f4', borderRadius: '12px' }}>Resim Yok</div>
          )}

          {property.images && property.images.length > 1 && (
            <div className="thumbnail-list">
              {property.images.map((img) => (
                <img 
                  key={img.id}
                  src={`http://localhost:8080${img.image_path}`} 
                  alt="thumbnail"
                  className={`thumbnail-item ${img.image_path === mainImage ? 'active' : ''}`}
                  onClick={() => setMainImage(img.image_path)}
                  draggable="false"
                />
              ))}
            </div>
          )}
        </div>

        {/* BİLGİ KUTUSU (Değişmedi) */}
        <div className="detail-info-box">
          <h3>İlan Detayları</h3>
          <ul className="info-list">
            <li><strong>Konum:</strong> 📍 {property.location}</li>
            <li><strong>Durum:</strong> 🏷️ {property.type}</li>
            <li><strong>Oda Sayısı:</strong> 🛏️ {property.rooms}</li>
            <li><strong>İlan Tarihi:</strong> 📅 {new Date(property.created_at).toLocaleDateString('tr-TR')}</li>
          </ul>
          <p className="detail-description">{property.description}</p>
          <button className="contact-btn" onClick={() => navigate('/iletisim')}>Bize Ulaşın</button>
          
          <div style={{ display: 'flex', gap: '10px', marginTop: '15px' }}>
            <button onClick={shareOnWhatsApp} style={{ flex: 1, background: '#25d366', color: 'white', border: 'none', padding: '12px', borderRadius: '30px', cursor: 'pointer', fontWeight: 'bold' }}>💬 WhatsApp'ta Paylaş</button>
            <button onClick={copyLink} style={{ flex: 1, background: '#f0f0f0', color: '#333', border: 'none', padding: '12px', borderRadius: '30px', cursor: 'pointer', fontWeight: 'bold' }}>🔗 Linki Kopyala</button>
          </div>

          <div className="property-map-section">
            <h3>Konum</h3>
            <iframe title="property-map" className="map-iframe" loading="lazy" allowFullScreen src={`https://maps.google.com/maps?q=${encodeURIComponent(property.location)}&t=&z=14&ie=UTF8&iwloc=&output=embed`}></iframe>
          </div>
        </div>
      </div>

      {/* BENZER İLANLAR (Değişmedi) */}
      {similarProperties.length > 0 && (
        <div className="similar-properties-section">
          <h2>Bunlar da İlginizi Çekebilir</h2>
          <div className="similar-grid">
            {similarProperties.map(prop => (
              <div className="property-card" key={prop.id} onClick={() => navigate(`/ilan/${prop.id}`)}>
                <button className="fav-btn" onClick={(e) => toggleFavorite(e, prop.id)}>{favorites.includes(prop.id) ? '❤️' : '🤍'}</button>
                {prop.images && prop.images.length > 0 ? (<img src={`http://localhost:8080${prop.images[0].image_path}`} alt={prop.title} className="property-image" />) : (<div className="property-image" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f4f4f4' }}>Resim Yok</div>)}
                <div className="property-info">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}><span className="property-type">{prop.type}</span></div>
                  <p className="property-price">{prop.price.toLocaleString('tr-TR')} ₺</p>
                  <h3 className="property-title">{prop.title}</h3>
                  <div className="property-details"><span>📍 {prop.location}</span><span>🛏️ {prop.rooms}</span></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}

export default PropertyDetail;