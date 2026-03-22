import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom'; // Çıkış butonu için eklendi
import axios from 'axios';
import logoImg from '/public/logo.png'; // Logonun yolu

function Info() {
  const [ilanlar, setIlanlar] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // 🔥 BÜYÜK SİHİR BURADA: Sayfayı tamamen "Standalone" (Bağımsız) Yapmak 🔥
  useEffect(() => {
    // 1. Siteyi kontrol eden elementleri bul
    const navbar = document.querySelector('.navbar');
    const footer = document.querySelector('footer') || document.querySelector('.footer');

    // 2. Bu sayfaya özel "Karanlık, İzole ve Odaklanmış" temayı zorla (CSS'i ezer)
    document.body.style.setProperty('background-image', 'none', 'important');
    document.body.style.setProperty('background-color', '#000000', 'important');
    
    // Menüyü ve Alt kısmı (Footer) gizle
    if (navbar) navbar.style.setProperty('display', 'none', 'important');
    if (footer) footer.style.setProperty('display', 'none', 'important');

    // 3. Kullanıcı bu sayfadan (Portalden) çıkınca her şeyi eski SİTE haline geri döndür
    return () => {
      document.body.style.removeProperty('background-image');
      document.body.style.removeProperty('background-color');
      if (navbar) navbar.style.removeProperty('display'); 
      if (footer) footer.style.removeProperty('display');
    };
  }, []);

  // Go API'den (Senin kendi backendinden) verileri çekiyoruz
  useEffect(() => {
    axios.get('http://localhost:8080/api/properties')
      .then(res => {
        setIlanlar(res.data);
        setLoading(false);
      })
      .catch(err => {
        console.error("API hatası:", err);
        setLoading(false);
      });
  }, []);

  // Hızlı Erişim Linkleri
  const kisayollar = [
    { isim: "Sahibinden", link: "https://shbd.io/s/MX46btVz", ikon: "🏠" },
    { isim: "Web Tapu", link: "https://webtapu.tkgm.gov.tr/", ikon: "📝" },
    { isim: "Parsel Sorgu", link: "https://parselsorgu.tkgm.gov.tr/", ikon: "📍" },
    { isim: "e-Devlet", link: "https://www.turkiye.gov.tr/", ikon: "🏛️" },
    { isim: "Düzce Bld.", link: "https://www.duzce.bel.tr/", ikon: "🏢" },
    { isim: "WhatsApp", link: "https://web.whatsapp.com", ikon: "💬" },
  ];

  return (
    <div style={{ backgroundColor: '#0a0a0a', color: '#fff', minHeight: '100vh', padding: '40px 20px', fontFamily: 'Arial, sans-serif', position: 'relative' }}>
      
      {/* SİTEYE GERİ DÖNÜŞ BUTONU (Menüyü gizlediğimiz için lazım olacak) */}
      <button 
        onClick={() => navigate('/')}
        style={{ position: 'absolute', top: '20px', left: '20px', background: 'transparent', color: '#888', border: '1px solid #333', padding: '8px 15px', borderRadius: '5px', cursor: 'pointer', transition: '0.3s' }}
        onMouseOver={(e) => { e.target.style.color = '#fff'; e.target.style.borderColor = '#d32f2f'; }}
        onMouseOut={(e) => { e.target.style.color = '#888'; e.target.style.borderColor = '#333'; }}
      >
        ← Siteye Dön
      </button>

      <center>
        {/* Logo */}
        <img src={logoImg} alt="Asil Emlak" style={{ maxWidth: '300px', marginBottom: '40px' }} />
        
        {/* Google Search Bar */}
        <form action="https://www.google.com/search" method="get" style={{ marginBottom: '50px' }}>
          <input 
            name="q"
            placeholder="Google'da ara..." 
            style={{ 
              width: '100%', 
              maxWidth: '650px', 
              padding: '16px 25px', 
              borderRadius: '30px', 
              border: '2px solid #222', 
              backgroundColor: '#151515',
              color: 'white',
              fontSize: '18px',
              outline: 'none',
              boxShadow: '0 4px 15px rgba(0,0,0,0.5)'
            }}
          />
        </form>

        {/* Hızlı Kısayollar Alanı */}
        <h3 style={{ color: '#666', fontWeight: '400', letterSpacing: '2px', marginBottom: '20px', fontSize: '14px' }}>HIZLI İŞLEMLER</h3>
        <div style={{ display: 'flex', gap: '15px', justifyContent: 'center', flexWrap: 'wrap', maxWidth: '800px', marginBottom: '50px' }}>
          {kisayollar.map((item, index) => (
            <a key={index} href={item.link} target="_blank" rel="noreferrer" style={{
              backgroundColor: '#151515',
              color: '#ccc',
              textDecoration: 'none',
              padding: '15px 20px',
              borderRadius: '12px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              width: '100px',
              borderBottom: '3px solid transparent',
              transition: '0.3s'
            }}
            onMouseOver={(e) => { e.currentTarget.style.borderBottom = '3px solid #d32f2f'; e.currentTarget.style.color = '#fff'; }}
            onMouseOut={(e) => { e.currentTarget.style.borderBottom = '3px solid transparent'; e.currentTarget.style.color = '#ccc'; }}
            >
              <span style={{ fontSize: '24px', marginBottom: '8px' }}>{item.ikon}</span>
              <span style={{ fontSize: '12px', fontWeight: 'bold', textTransform: 'uppercase', textAlign: 'center' }}>{item.isim}</span>
            </a>
          ))}
        </div>

        {/* Go API'den Gelen İlanlar */}
        <h3 style={{ color: '#666', fontWeight: '400', letterSpacing: '2px', marginBottom: '20px', fontSize: '14px' }}>GÜNCEL PORTFÖYÜMÜZ</h3>
        <div style={{ display: 'flex', gap: '20px', justifyContent: 'center', flexWrap: 'wrap', maxWidth: '1000px' }}>
          {loading ? (
            <p style={{ color: '#d32f2f' }}>İlanlar yükleniyor...</p>
          ) : (
            ilanlar.map(ilan => (
              <div key={ilan.id} style={{ 
                backgroundColor: '#151515', 
                borderLeft: '4px solid #d32f2f', 
                padding: '20px', 
                borderRadius: '10px', 
                width: '280px',
                textAlign: 'left',
                boxShadow: '0 5px 15px rgba(0,0,0,0.3)'
              }}>
                <h3 style={{ marginTop: '0', fontSize: '16px', color: '#eee' }}>{ilan.title}</h3>
                <p style={{ color: '#d32f2f', fontSize: '20px', fontWeight: 'bold', margin: '10px 0' }}>
                  {ilan.price.toLocaleString('tr-TR')} ₺
                </p>
                <p style={{ color: '#888', margin: '0', fontSize: '13px' }}>
                  📍 {ilan.location}
                </p>
              </div>
            ))
          )}
        </div>
      </center>
    </div>
  );
}

export default Info;