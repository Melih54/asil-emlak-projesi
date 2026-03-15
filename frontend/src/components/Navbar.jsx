import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './Navbar.css';
import logoImg from '/public/logo.png'; // Logonun yolu

function Navbar() {
  // 🔥 YENİ: Gece modu State'i 🔥
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Sayfa yüklendiğinde hafızadan müşterinin tercihini kontrol et
  useEffect(() => {
    const savedMode = localStorage.getItem('asilDarkMode');
    if (savedMode === 'true') {
      setIsDarkMode(true);
      document.body.classList.add('dark-mode');
    }
  }, []);

  // Butona basıldığında çalışacak şalter fonksiyonu
  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
    if (!isDarkMode) {
      document.body.classList.add('dark-mode');
      localStorage.setItem('asilDarkMode', 'true');
    } else {
      document.body.classList.remove('dark-mode');
      localStorage.setItem('asilDarkMode', 'false');
    }
  };

  return (
    <nav className="navbar">
      <div className="navbar-logo">
        {/* Logoya tıklayınca anasayfaya gider */}
        <Link to="/" style={{ textDecoration: 'none', color: 'inherit' }}>
          {/* 🔥 🔥 İŞTE BURASI: Orijinal logonun kendisi 🔥 🔥 */}
          <img 
            src={logoImg} 
            alt="Asil Emlak Logo" 
            className="logo-image-main"
          />
        </Link>
      </div>
      
      {/* 🔥 YENİ: MOBİL MENÜ BUTONU 🔥 */}
      <button className="mobile-menu-btn" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
        {isMobileMenuOpen ? '✕' : '☰'}
      </button>

      {/* 🔥 DİKKAT: className kısmını güncelledik ve tıklandığında menü kapansın diye onClick ekledik 🔥 */}
      <ul className={`navbar-links ${isMobileMenuOpen ? 'mobile-open' : ''}`}>
        <li onClick={() => setIsMobileMenuOpen(false)}><Link to="/">Anasayfa</Link></li>
        <li onClick={() => setIsMobileMenuOpen(false)}><Link to="/hakkimizda">Hakkımızda</Link></li>

        <li className="nav-dropdown">
          <Link to="/ilanlar" onClick={() => setIsMobileMenuOpen(false)}>İlanlar ▾</Link>
          <div className="dropdown-content">
            <Link to="/favoriler" onClick={() => setIsMobileMenuOpen(false)}>❤️ Favorilerim</Link>
          </div>
        </li>

        <li onClick={() => setIsMobileMenuOpen(false)}><Link to="/rehber">Emlak Rehberi</Link></li>
        <li onClick={() => setIsMobileMenuOpen(false)}><Link to="/iletisim">İletişim</Link></li>

        {/* 🔥 YENİ: GECE/GÜNDÜZ MODU BUTONU 🔥 */}
        <li style={{ display: 'flex', alignItems: 'center', marginLeft: '15px' }}>
          <button 
            onClick={toggleDarkMode} 
            style={{
              background: 'transparent',
              border: 'none',
              fontSize: '24px',
              cursor: 'pointer',
              padding: '5px',
              transition: 'transform 0.4s cubic-bezier(0.25, 0.8, 0.25, 1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
            title={isDarkMode ? "Gündüz Moduna Geç" : "Gece Moduna Geç"}
            // Üzerine gelince tatlı bir dönüş efekti yapsın
            onMouseOver={(e) => e.target.style.transform = 'rotate(30deg) scale(1.1)'}
            onMouseOut={(e) => e.target.style.transform = 'rotate(0deg) scale(1)'}
          >
            {isDarkMode ? '☀️' : '🌙'}
          </button>
        </li>
      </ul>
    </nav>
  );
}

export default Navbar;