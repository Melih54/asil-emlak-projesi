import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Home.css'; // Kart tasarımlarını anasayfadan çekiyoruz

function Favorites() {
  const [properties, setProperties] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    // Hafızadan favori ID'lerini al
    const favs = JSON.parse(localStorage.getItem('asilFavorites')) || [];
    setFavorites(favs);

    if (favs.length > 0) {
      axios.get('http://localhost:8080/api/properties').then(res => {
        // Sadece ID'si favoriler listesinde olan ilanları filtrele
        const favProps = res.data.filter(p => favs.includes(p.id));
        setProperties(favProps);
      });
    }
  }, []);

  const toggleFavorite = (e, id) => {
    e.stopPropagation(); // Kartın içine girilmesini engeller
    let favs = JSON.parse(localStorage.getItem('asilFavorites')) || [];
    
    // Zaten favoriyse çıkar
    if (favs.includes(id)) {
      favs = favs.filter(favId => favId !== id);
    } else {
      favs.push(id);
    }
    
    localStorage.setItem('asilFavorites', JSON.stringify(favs));
    setFavorites(favs);
    // Ekranda anında güncellenmesi için listeyi filtrele
    setProperties(properties.filter(p => favs.includes(p.id)));
  };

  return (
    <div style={{ maxWidth: '1200px', margin: '40px auto', padding: '0 20px', minHeight: '50vh' }}>
      <h2 style={{ borderBottom: '2px solid #d32f2f', paddingBottom: '15px', color: 'white' }}>❤️ Favori İlanlarım</h2>
      
      {properties.length === 0 ? (
        <div style={{ fontSize: '18px', color: '#e0e0e0', marginTop: '30px', background: 'rgba(0,0,0,0.5)', padding: '30px', borderRadius: '15px', textAlign: 'center' }}>
          Henüz favorilere eklediğiniz bir ilan bulunmuyor. Anasayfadan beğendiğiniz evlerin kalp ikonuna tıklayarak buraya ekleyebilirsiniz.
        </div>
      ) : (
        <div className="properties-grid" style={{ marginTop: '30px' }}>
          {properties.map((prop) => (
            <div className="property-card" key={prop.id} onClick={() => navigate(`/ilan/${prop.id}`)}>
                {/* 🔥 İLAN ETİKETİ 🔥 */}
                  {prop.badge && (
                    <div className={`property-badge badge-${prop.badge.toLowerCase()}`}>
                      {prop.badge === 'Yeni' ? 'Yeni Eklendi' : 
                       prop.badge === 'Acil' ? 'Acil Satılık' : 
                       prop.badge === 'Fiyat' ? 'Fiyatı Düştü!' : 'Kelepir Fırsat'}
                    </div>
                  )}
              {/* Kalp Butonu */}
              <button className="fav-btn" onClick={(e) => toggleFavorite(e, prop.id)}>
                {favorites.includes(prop.id) ? '❤️' : '🤍'}
              </button>
              
              {prop.images && prop.images.length > 0 ? (
                <img src={`http://localhost:8080${prop.images[0].image_path}`} alt={prop.title} className="property-image" />
              ) : (
                <div className="property-image" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f4f4f4' }}>Resim Yok</div>
              )}
              <div className="property-info">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                  <span className="property-type">{prop.type}</span>
                </div>
                <p className="property-price">{prop.price.toLocaleString('tr-TR')} ₺</p>
                <h3 className="property-title">{prop.title}</h3>
                <div className="property-details">
                  <span>📍 {prop.location}</span>
                  <span>🛏️ {prop.rooms}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Favorites;