import { Link } from 'react-router-dom';
import './Footer.css';

function Footer() {
  return (
    <footer className="footer">
      <div className="footer-container">
        
        {/* 1. Sütun: Hakkımızda & Logo */}
        <div className="footer-section about">
          <img src="/logo.png" alt="Asil Emlak Logo" className="footer-logo" />
          <p>
            Düzce'nin en güvenilir emlak platformu. Hayalinizdeki evi bulmanız için profesyonel ekibimizle her zaman yanınızdayız.
          </p>
        </div>

        {/* 2. Sütun: Hızlı Linkler */}
        <div className="footer-section links">
          <h3>Hızlı Linkler</h3>
          <ul>
            <li><Link to="/">Anasayfa</Link></li>
            <li><Link to="/ilanlar">Tüm İlanlar</Link></li>
            <li><Link to="/iletisim">İletişim</Link></li>
          </ul>
        </div>

        {/* 3. Sütun: İletişim Bilgileri */}
        <div className="footer-section contact">
          <h3>İletişim</h3>
          <p>📍 Merkez / Düzce</p>
          <p>📞 +90 (555) 123 45 67</p>
          <p>✉️ info@asilemlak.com</p>
        </div>

      </div>
      
      {/* En alt telif hakkı kısmı */}
      <div className="footer-bottom">
        <p>&copy; {new Date().getFullYear()} Asil Emlak Düzce. Tüm Hakları Saklıdır.</p>
      </div>
    </footer>
  );
}

export default Footer;