import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Home.css';

function Properties() {
  const [properties, setProperties] = useState([]);
  const navigate = useNavigate();

  // 🔥 YENİ: Gelişmiş Filtre Stateleri 🔥
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [roomFilter, setRoomFilter] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  
  const [favorites, setFavorites] = useState(JSON.parse(localStorage.getItem('asilFavorites')) || []);

  useEffect(() => {
    const fetchProperties = async () => {
      try {
        const response = await axios.get('http://localhost:8080/api/properties');
        setProperties(response.data);
      } catch (error) {
        console.error("İlanlar çekilirken hata oluştu:", error);
      }
    };
    fetchProperties();
  }, []);

  const toggleFavorite = (e, propId) => {
    e.stopPropagation();
    let favs = [...favorites];
    if (favs.includes(propId)) {
      favs = favs.filter(f => f !== propId);
    } else {
      favs.push(propId);
    }
    setFavorites(favs);
    localStorage.setItem('asilFavorites', JSON.stringify(favs));
  };

  // 🔥 YENİ: Gelişmiş Filtreleme Mantığı 🔥
  const filteredProperties = properties.filter((prop) => {
    const matchesSearch = prop.title.toLowerCase().includes(searchTerm.toLowerCase()) || prop.location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === '' || prop.type === typeFilter;
    const matchesRoom = roomFilter === '' || prop.rooms.includes(roomFilter);
    const matchesMinPrice = minPrice === '' || prop.price >= parseFloat(minPrice);
    const matchesMaxPrice = maxPrice === '' || prop.price <= parseFloat(maxPrice);
    
    return matchesSearch && matchesType && matchesRoom && matchesMinPrice && matchesMaxPrice;
  });

  return (
    <div style={{ maxWidth: '1200px', margin: '40px auto', padding: '0 20px', minHeight: '60vh' }}>
      
      <div style={{ textAlign: 'center', marginBottom: '40px', background: 'rgba(0,0,0,0.6)', padding: '30px', borderRadius: '15px', color: 'white', backdropFilter: 'blur(10px)' }}>
        <h1 style={{ margin: '0 0 10px 0', fontSize: '36px', textShadow: '2px 2px 5px rgba(0,0,0,0.5)' }}>Tüm İlanlarımız</h1>
        <p style={{ margin: 0, fontSize: '18px', color: '#e0e0e0' }}>Düzce ve çevresindeki en güncel satılık ve kiralık portföyümüz.</p>
      </div>

      {/* 🔥 YENİ: GELİŞMİŞ ARAMA ÇUBUĞU 🔥 */}
      <div className="filter-container" style={{ display: 'flex', flexWrap: 'wrap', gap: '15px' }}>
        <input 
          type="text" 
          className="filter-input" 
          placeholder="Kelime veya Konum..." 
          style={{ flex: '1 1 250px' }}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <select className="filter-select" style={{ flex: '1 1 150px' }} value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}>
          <option value="">Tümü (Satılık/Kiralık)</option>
          <option value="Satılık">Satılık</option>
          <option value="Kiralık">Kiralık</option>
        </select>
        <select className="filter-select" style={{ flex: '1 1 120px' }} value={roomFilter} onChange={(e) => setRoomFilter(e.target.value)}>
          <option value="">Oda Sayısı</option>
          <option value="1+1">1+1</option>
          <option value="2+1">2+1</option>
          <option value="3+1">3+1</option>
          <option value="4+1">4+1 ve üzeri</option>
        </select>
        <input 
          type="number" 
          className="filter-input" 
          placeholder="Min Fiyat (₺)" 
          style={{ flex: '1 1 130px' }}
          value={minPrice}
          onChange={(e) => setMinPrice(e.target.value)}
        />
        <input 
          type="number" 
          className="filter-input" 
          placeholder="Max Fiyat (₺)" 
          style={{ flex: '1 1 130px' }}
          value={maxPrice}
          onChange={(e) => setMaxPrice(e.target.value)}
        />
      </div>

      {/* İlanlar Grid Yapısı */}
      {filteredProperties.length === 0 ? (
        <div className="no-results" style={{ marginTop: '30px', background: 'rgba(255,255,255,0.9)', padding: '40px', borderRadius: '15px', textAlign: 'center', color: '#333' }}>
          Aradığınız kriterlere uygun ilan bulunamadı. Lütfen filtreleri esnetin.
        </div>
      ) : (
        <div className="properties-grid" style={{ marginTop: '30px' }}>
          {filteredProperties.map((prop) => (
            <div className="property-card" key={prop.id} onClick={() => navigate(`/ilan/${prop.id}`)}>
              <button className="fav-btn" onClick={(e) => toggleFavorite(e, prop.id)}>
                {favorites.includes(prop.id) ? '❤️' : '🤍'}
              </button>
              {prop.badge && (
                <div className={`property-badge badge-${prop.badge.toLowerCase()}`}>
                  {prop.badge === 'Yeni' ? 'Yeni Eklendi' : 
                   prop.badge === 'Acil' ? 'Acil Satılık' : 
                   prop.badge === 'Fiyat' ? 'Fiyatı Düştü!' : 'Kelepir Fırsat'}
                </div>
              )}
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

export default Properties;