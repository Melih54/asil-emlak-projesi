import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// YENİ: Küresel tasarım ve animasyon dosyamızı içeri aktarıyoruz
import './index.css'; 

import Home from './pages/Home';
import Properties from './pages/Properties';
import Contact from './pages/Contact';
import Admin from './pages/Admin';
import PropertyDetail from './pages/PropertyDetail';

import Navbar from './components/Navbar'; 
import Footer from './components/Footer'; 
import WhatsAppButton from './components/WhatsAppButton'; 
import CookieBanner from './components/CookieBanner';
import About from './pages/About';
import Favorites from './pages/Favorites';
import Blog from './pages/Blog';
import BlogDetail from './pages/BlogDetail';

function App() {
  return (
    <Router>
      <Navbar /> 
      
      {/* YENİ: className="page-transition" ekleyerek sayfaların yumuşak açılmasını sağladık */}
      <div className="page-transition" style={{ padding: '20px 50px', minHeight: '60vh' }}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/ilanlar" element={<Properties />} />
          <Route path="/ilan/:id" element={<PropertyDetail />} />
          <Route path="/iletisim" element={<Contact />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/cookie" element={<CookieBanner />} />
          <Route path="/hakkimizda" element={<About />} />
          <Route path="/favoriler" element={<Favorites />} />
          <Route path="/rehber" element={<Blog />} />
          <Route path="/rehber/:id" element={<BlogDetail />} />
        </Routes>
      </div>

      <Footer />
      <WhatsAppButton />
      <CookieBanner />
    </Router>
  );
}

export default App;