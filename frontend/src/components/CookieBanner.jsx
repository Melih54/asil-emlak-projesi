import { useState, useEffect } from 'react';
import './CookieBanner.css';

function CookieBanner() {
  // Başlangıçta banner'ı gösterme (false)
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Sayfa yüklendiğinde tarayıcının hafızasını kontrol et
    const cookieConsent = localStorage.getItem('asilEmlakCookieConsent');
    
    // Eğer hafızada 'kabul edildi' bilgisi yoksa banner'ı göster
    if (!cookieConsent) {
      setIsVisible(true);
    }
  }, []);

  const handleAccept = () => {
    // Kullanıcı kabul ettiğinde hafızaya kaydet
    localStorage.setItem('asilEmlakCookieConsent', 'true');
    // Banner'ı ekrandan gizle
    setIsVisible(false);
  };

  // Eğer isVisible false ise (yani kullanıcı daha önce onay verdiyse veya yeni tıkladıysa) hiçbir şey çizme
  if (!isVisible) {
    return null;
  }

  return (
    <div className="cookie-banner-container">
      <p className="cookie-text">
        <strong>🍪 Çerez Politikası ve KVKK Aydınlatma Metni</strong>
        Sizlere daha iyi bir hizmet sunabilmek, sitemizdeki deneyiminizi kişiselleştirmek ve analizler yapabilmek için çerezler (cookies) kullanıyoruz. Sitemizi kullanmaya devam ederek çerez kullanımına izin vermiş olursunuz. Detaylı bilgi için <a href="#">Çerez Politikamızı</a> inceleyebilirsiniz.
      </p>
      <button onClick={handleAccept} className="cookie-accept-btn">
        Anladım ve Kabul Ediyorum
      </button>
    </div>
  );
}

export default CookieBanner;