import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Home.css';

const heroSlides = [
  { id: 1, image: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80", title: "Hayalinizdeki Evi Asil Emlak'ta Bulun", subtitle: "En güncel satılık ve kiralık gayrimenkul ilanları tek tık uzağınızda." },
  { id: 2, image: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80", title: "Lüks ve Konfor Bir Arada", subtitle: "Size ve ailenize en uygun, modern yaşam alanlarını keşfedin." },
  { id: 3, image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80", title: "Güvenilir Yatırımın Adresi", subtitle: "Değer kazanan lokasyonlarda geleceğinize güvenle yatırım yapın." }
];

function Home() {
  const [properties, setProperties] = useState([]);
  const [infoCards, setInfoCards] = useState([]);
  const [latestBlogs, setLatestBlogs] = useState([]); 
  
  // 🔥 YENİ: Canlı RSS Haberlerini Tutacak State 🔥
  const [liveNews, setLiveNews] = useState([]);

  const navigate = useNavigate();
  const sliderRef = useRef(null);

  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [currentSlide, setCurrentSlide] = useState(0);
  const [favorites, setFavorites] = useState(JSON.parse(localStorage.getItem('asilFavorites')) || []);

  useEffect(() => {
    const slideTimer = setInterval(() => {
      setCurrentSlide((prev) => (prev === heroSlides.length - 1 ? 0 : prev + 1));
    }, 5000);
    return () => clearInterval(slideTimer);
  }, []);

  // 1. Kendi Veritabanımızdan Gelen Veriler
  useEffect(() => {
    const fetchData = async () => {
      try {
        const propRes = await axios.get('http://localhost:8080/api/properties');
        setProperties(propRes.data);

        const cardRes = await axios.get('http://localhost:8080/api/info-cards');
        setInfoCards(cardRes.data);

        const blogRes = await axios.get('http://localhost:8080/api/blogs');
        setLatestBlogs(blogRes.data.slice(0, 2));

      } catch (error) {
        console.error("Veriler çekilirken hata oluştu:", error);
      }
    };
    fetchData();
  }, []);

  // 🔥 2. YENİ: Dışarıdan Canlı Haber Çeken Bot (RSS) 🔥
  useEffect(() => {
    const fetchLiveNews = async () => {
      try {
        // NTV Ekonomi RSS adresini, rss2json API'si üzerinden çekiyoruz
        const rssUrl = 'https://www.ntv.com.tr/ekonomi.rss';
        const apiUrl = `https://api.rss2json.com/v1/api.json?rss_url=${rssUrl}`;
        
        const res = await axios.get(apiUrl);
        if (res.data && res.data.items) {
          // Gelen yüzlerce haberden sadece en güncel ilk 3 tanesini alıyoruz
          setLiveNews(res.data.items.slice(0, 4));
        }
      } catch (error) {
        console.error("Canlı haberler çekilirken hata oluştu:", error);
      }
    };
    fetchLiveNews();
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

  const filteredProperties = properties.filter((prop) => {
    const matchesSearch = prop.title.toLowerCase().includes(searchTerm.toLowerCase()) || prop.location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === '' || prop.type === typeFilter;
    return matchesSearch && matchesType;
  });

  const slideLeft = () => { if (sliderRef.current) sliderRef.current.scrollBy({ left: -350, behavior: 'smooth' }); };
  const slideRight = () => { if (sliderRef.current) sliderRef.current.scrollBy({ left: 350, behavior: 'smooth' }); };

  return (
    <div>
      {/* HERO SLIDER */}
      <div className="hero-carousel">
        {heroSlides.map((slide, index) => (
          <div key={slide.id} className={`hero-slide ${index === currentSlide ? 'active' : ''}`} style={{ backgroundImage: `url(${slide.image})` }}>
            <div className="hero-slide-overlay"><h1>{slide.title}</h1><p>{slide.subtitle}</p></div>
          </div>
        ))}
        <div className="hero-dots">{heroSlides.map((_, index) => (<div key={index} className={`hero-dot ${index === currentSlide ? 'active' : ''}`} onClick={() => setCurrentSlide(index)}></div>))}</div>
      </div>
      {/* BİLGİ KARTLARI */}
      <div className="important-info-section">
        {infoCards && infoCards.map((card) => (
          <div className="info-box" key={card.id}><div className="info-box-icon">{card.icon}</div><div className="info-box-content"><h4>{card.title}</h4><p>{card.description}</p></div></div>
        ))}
      </div>
      {/* FİLTRELEME ÇUBUĞU */}
      <div className="filter-container">
        <input type="text" className="filter-input" placeholder="İlan başlığı veya konum ara..." style={{ flex: 2 }} value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
        <select className="filter-select" style={{ flex: 1 }} value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}>
          <option value="">Tümü (Satılık & Kiralık)</option>
          <option value="Satılık">Sadece Satılık</option>
          <option value="Kiralık">Sadece Kiralık</option>
        </select>
      </div>



      {/* İLANLAR (SLIDER) */}
      <div className="properties-section">
        <h2>Öne Çıkan İlanlar</h2>
        {filteredProperties.length === 0 ? (
          <div className="no-results">İlan bulunamadı.</div>
        ) : (
          <div className="slider-wrapper">
            <button className="slider-btn prev" onClick={slideLeft}>&#10094;</button>
            <div className="slider-track" ref={sliderRef}>
              {filteredProperties.map((prop) => (
                <div className="property-card" key={prop.id} onClick={() => navigate(`/ilan/${prop.id}`)}>
                  <button className="fav-btn" onClick={(e) => toggleFavorite(e, prop.id)}>{favorites.includes(prop.id) ? '❤️' : '🤍'}</button>
                  {prop.badge && (<div className={`property-badge badge-${prop.badge.toLowerCase()}`}>{prop.badge === 'Yeni' ? 'Yeni Eklendi' : prop.badge === 'Acil' ? 'Acil Satılık' : prop.badge === 'Fiyat' ? 'Fiyatı Düştü!' : 'Kelepir Fırsat'}</div>)}
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
            <button className="slider-btn next" onClick={slideRight}>&#10095;</button>
          </div>
        )}
      </div>

      {/* 🔥 YENİ: OTOMATİK HABER BOTU BÖLÜMÜ 🔥 */}
      {liveNews.length > 0 && (
        <div className="live-news-section" style={{ marginTop: '20px', marginBottom: '40px', padding: '30px', background: '#f8f9fa', borderRadius: '15px', border: '1px solid #e9ecef' }}>
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '25px' }}>
            <span style={{ fontSize: '24px', marginRight: '10px', animation: 'pulse 1.5s infinite' }}>🔴</span>
            <h2 style={{ margin: 0, fontSize: '24px', color: '#000' }}>Piyasalardan Son Dakika (Canlı)</h2>
          </div>
          
          <div className="properties-grid">
            {liveNews.map((news, index) => (
              <a 
                href={news.link} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="property-card" 
                key={index} 
                style={{ textDecoration: 'none', display: 'block', height: '100%' }}
              >
                {news.thumbnail ? (
                  <img src={news.thumbnail} alt={news.title} className="property-image" style={{ height: '180px' }} />
                ) : (
                  <div className="property-image" style={{ height: '180px', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#333', color: 'white', fontSize: '40px' }}>📰</div>
                )}
                <div className="property-info" style={{ height: 'calc(100% - 180px)', display: 'flex', flexDirection: 'column' }}>
                  <span className="property-type" style={{ background: '#d32f2f', alignSelf: 'flex-start' }}>Haber Merkezi</span>
                  <h3 className="property-title" style={{ marginTop: '15px', fontSize: '18px', lineHeight: '1.4', flex: 1 }}>{news.title}</h3>
                  <span style={{ color: '#888', fontSize: '12px', marginTop: '15px', display: 'block', borderTop: '1px solid #eee', paddingTop: '10px' }}>
                    📅 {new Date(news.pubDate).toLocaleDateString('tr-TR')}
                  </span>
                </div>
              </a>
            ))}
          </div>
        </div>
      )}

      {/* BİZİM EMLAK REHBERİMİZ (Admin Panelinden Eklenenler) */}
      {latestBlogs.length > 0 && (
        <div className="blog-section" style={{ marginBottom: '40px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px', borderBottom: '2px solid #f0f0f0', paddingBottom: '15px' }}>
            <h2 style={{ margin: 0, fontSize: '28px', color: '#000' }}>Asil Emlak Rehberi</h2>
            <button onClick={() => navigate('/rehber')} style={{ background: 'transparent', border: '2px solid #d32f2f', color: '#d32f2f', padding: '8px 20px', borderRadius: '30px', cursor: 'pointer', fontWeight: 'bold', transition: 'all 0.3s' }} onMouseOver={(e) => { e.target.style.background = '#d32f2f'; e.target.style.color = 'white'; }} onMouseOut={(e) => { e.target.style.background = 'transparent'; e.target.style.color = '#d32f2f'; }}>Tümünü Gör &rarr;</button>
          </div>
          
          <div className="properties-grid">
            {latestBlogs.map(blog => (
              <div className="property-card" key={blog.id} onClick={() => navigate(`/rehber/${blog.id}`)} style={{ cursor: 'pointer' }}>
                {blog.image_path ? (<img src={`http://localhost:8080${blog.image_path}`} alt={blog.title} className="property-image" />) : (<div className="property-image" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f4f4f4', fontSize: '40px' }}>📰</div>)}
                <div className="property-info">
                  <span className="property-type" style={{ background: '#333' }}>{new Date(blog.created_at).toLocaleDateString('tr-TR')}</span>
                  <h3 className="property-title" style={{ marginTop: '15px', fontSize: '20px' }}>{blog.title}</h3>
                  <p style={{ color: '#666', fontSize: '14px', lineHeight: '1.5', marginTop: '10px' }}>{blog.summary}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SAYAÇLAR */}
      <div className="stats-section">
        <div className="stat-box"><h3>15+</h3><p>Yıllık Tecrübe</p></div>
        <div className="stat-box"><h3>1.250+</h3><p>Satılan & Kiralanan Emlak</p></div>
        <div className="stat-box"><h3>3.500+</h3><p>Mutlu Müşteri</p></div>
        <div className="stat-box"><h3>{properties.length}</h3><p>Aktif Güncel İlan</p></div>
      </div>

    </div>
  );
}

export default Home;