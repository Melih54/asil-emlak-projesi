import { useState, useEffect } from 'react';
import axios from 'axios';
import './Admin.css';

function Admin() {
  const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem('adminToken'));
  const [loginData, setLoginData] = useState({ username: '', password: '' });

  // Sekmeler
  const [activeTab, setActiveTab] = useState('ilan');
  const [messages, setMessages] = useState([]);
  const [properties, setProperties] = useState([]);
  const [infoCards, setInfoCards] = useState([]);
  const [team, setTeam] = useState([]);
  const [blogs, setBlogs] = useState([]); // 🔥 YENİ: Blog listesi

  // İlan Form Verileri
  const [formData, setFormData] = useState({ title: '', description: '', price: '', type: 'Satılık', rooms: '', location: '', badge: '' });
  const [imageFiles, setImageFiles] = useState([]); 
  const [editingId, setEditingId] = useState(null);

  // Ekip Form Verileri
  const [teamFormData, setTeamFormData] = useState({ name: '', role: '', description: '', image_path: '' });
  const [teamImageFile, setTeamImageFile] = useState(null);
  const [editingTeamId, setEditingTeamId] = useState(null);

  // 🔥 YENİ: Blog Form Verileri 🔥
  const [blogFormData, setBlogFormData] = useState({ title: '', summary: '', content: '', image_path: '' });
  const [blogImageFile, setBlogImageFile] = useState(null);
  const [editingBlogId, setEditingBlogId] = useState(null);

  // Giriş / Çıkış
  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:8080/api/login', loginData);
      localStorage.setItem('adminToken', response.data.token);
      setIsAuthenticated(true);
    } catch (error) { alert('Hata: Kullanıcı adı veya şifre yanlış!'); }
  };
  const handleLogout = () => { localStorage.removeItem('adminToken'); setIsAuthenticated(false); };
  const handleLoginChange = (e) => setLoginData({ ...loginData, [e.target.name]: e.target.value });

  // Veri Çekme
  useEffect(() => {
    const fetchData = async () => {
      if (!isAuthenticated) return;
      try {
        if (activeTab === 'mesajlar') {
          const res = await axios.get('http://localhost:8080/api/messages');
          setMessages(res.data || []);
        } else if (activeTab === 'ilanYonet') {
          const res = await axios.get('http://localhost:8080/api/properties');
          setProperties(res.data || []);
        } else if (activeTab === 'ayarlar') {
          const res = await axios.get('http://localhost:8080/api/info-cards');
          setInfoCards(res.data || []);
        } else if (activeTab === 'ekip') {
          const res = await axios.get('http://localhost:8080/api/team');
          setTeam(res.data || []);
        } else if (activeTab === 'blog') {
          // 🔥 YENİ: Blog verilerini çek 🔥
          const res = await axios.get('http://localhost:8080/api/blogs');
          setBlogs(res.data || []);
        }
      } catch (error) { console.error("Veri çekme hatası:", error); }
    };
    fetchData();
  }, [activeTab, isAuthenticated]);

  // --- İLAN İŞLEMLERİ ---
  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });
  const handleFileChange = (e) => setImageFiles(Array.from(e.target.files));
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const uploadedImages = [];
      if (imageFiles.length > 0) {
        alert("Resimler yükleniyor, lütfen bekleyin...");
        const uploadPromises = imageFiles.map(async (file, index) => {
          const uploadData = new FormData(); uploadData.append('image', file);
          const uploadRes = await axios.post('http://localhost:8080/api/upload', uploadData);
          uploadedImages.push({ image_path: uploadRes.data.image_url, is_main: index === 0 });
        });
        await Promise.all(uploadPromises);
      }
      const dataToSend = { ...formData, price: parseFloat(formData.price), images: uploadedImages };
      if (editingId) { await axios.put(`http://localhost:8080/api/properties/${editingId}`, dataToSend); alert('İlan güncellendi!'); } 
      else { await axios.post('http://localhost:8080/api/properties', dataToSend); alert('İlan eklendi!'); }
      setFormData({ title: '', description: '', price: '', type: 'Satılık', rooms: '', location: '', badge: '' });
      setImageFiles([]); setEditingId(null); 
      if(document.getElementById('imageInput')) document.getElementById('imageInput').value = '';
      setActiveTab('ilanYonet');
    } catch (error) { alert('Hata oluştu.'); }
  };
  const handleDelete = async (id) => { if(window.confirm("Emin misiniz?")) { await axios.delete(`http://localhost:8080/api/properties/${id}`); setProperties(properties.filter(prop => prop.id !== id)); } };
  const handleEdit = (prop) => { setFormData({ title: prop.title, description: prop.description, price: prop.price, type: prop.type, rooms: prop.rooms, location: prop.location, badge: prop.badge || '' }); setEditingId(prop.id); setImageFiles([]); setActiveTab('ilan'); };

  // --- EKİP İŞLEMLERİ ---
  const handleTeamChange = (e) => setTeamFormData({ ...teamFormData, [e.target.name]: e.target.value });
  const handleTeamFileChange = (e) => setTeamImageFile(e.target.files[0]);
  const handleTeamSubmit = async (e) => {
    e.preventDefault();
    try {
      let imageUrl = teamFormData.image_path;
      if (teamImageFile) {
        const uploadData = new FormData(); uploadData.append('image', teamImageFile);
        const uploadRes = await axios.post('http://localhost:8080/api/upload', uploadData); imageUrl = uploadRes.data.image_url;
      }
      const dataToSend = { ...teamFormData, image_path: imageUrl };
      if (editingTeamId) { await axios.put(`http://localhost:8080/api/team/${editingTeamId}`, dataToSend); alert('Güncellendi!'); } 
      else { await axios.post('http://localhost:8080/api/team', dataToSend); alert('Eklendi!'); }
      const res = await axios.get('http://localhost:8080/api/team'); setTeam(res.data || []);
      setTeamFormData({ name: '', role: '', description: '', image_path: '' }); setTeamImageFile(null); setEditingTeamId(null);
      if(document.getElementById('teamImageInput')) document.getElementById('teamImageInput').value = '';
    } catch (error) { alert('Hata oluştu.'); }
  };
  const handleTeamDelete = async (id) => { if(window.confirm("Emin misiniz?")) { await axios.delete(`http://localhost:8080/api/team/${id}`); setTeam(team.filter(m => m.id !== id)); } };
  const handleTeamEdit = (m) => { setTeamFormData({ name: m.name, role: m.role, description: m.description, image_path: m.image_path }); setEditingTeamId(m.id); };

  // --- 🔥 YENİ: BLOG İŞLEMLERİ 🔥 ---
  const handleBlogChange = (e) => setBlogFormData({ ...blogFormData, [e.target.name]: e.target.value });
  const handleBlogFileChange = (e) => setBlogImageFile(e.target.files[0]);
  const handleBlogSubmit = async (e) => {
    e.preventDefault();
    try {
      let imageUrl = blogFormData.image_path;
      if (blogImageFile) {
        const uploadData = new FormData(); uploadData.append('image', blogImageFile);
        const uploadRes = await axios.post('http://localhost:8080/api/upload', uploadData); imageUrl = uploadRes.data.image_url;
      }
      const dataToSend = { ...blogFormData, image_path: imageUrl };
      
      // Blog API'sinde PUT metodunu Go tarafında yazmamıştık (şimdilik sil/ekle ile veya post ile id'ye göre ilerliyoruz),
      // Ama eğer backend'i buna uyarladıysan çalışır. Biz yeni yazı ekleme odaklı gidelim:
      await axios.post('http://localhost:8080/api/blogs', dataToSend);
      alert('Blog yazısı başarıyla eklendi!');
      
      const res = await axios.get('http://localhost:8080/api/blogs'); setBlogs(res.data || []);
      setBlogFormData({ title: '', summary: '', content: '', image_path: '' }); setBlogImageFile(null);
      if(document.getElementById('blogImageInput')) document.getElementById('blogImageInput').value = '';
    } catch (error) { alert('Hata oluştu.'); }
  };
  const handleBlogDelete = async (id) => { if(window.confirm("Bu yazıyı silmek istediğinize emin misiniz?")) { await axios.delete(`http://localhost:8080/api/blogs/${id}`); setBlogs(blogs.filter(b => b.id !== id)); } };

  // --- GİRİŞ EKRANI ---
  if (!isAuthenticated) return (
    <div className="login-container">
      <h2>Yönetici Girişi</h2>
      <form onSubmit={handleLogin} className="admin-form">
        <div className="form-group"><label>Kullanıcı Adı:</label><input type="text" name="username" value={loginData.username} onChange={handleLoginChange} required /></div>
        <div className="form-group"><label>Şifre:</label><input type="password" name="password" value={loginData.password} onChange={handleLoginChange} required /></div>
        <button type="submit" className="submit-btn">Giriş Yap</button>
      </form>
    </div>
  );

  // --- YÖNETİCİ PANELİ ---
  return (
    <div className="admin-container" style={{ marginTop: '20px' }}>
      <button onClick={handleLogout} className="logout-btn">Güvenli Çıkış Yap</button>
      <h2 style={{ textAlign: 'center', marginBottom: '20px' }}>Yönetici Paneli</h2>

      {/* SEKMELER */}
      <div className="admin-tabs" style={{ flexWrap: 'wrap' }}>
        <button className={`tab-btn ${activeTab === 'ilan' ? 'active' : ''}`} onClick={() => { setActiveTab('ilan'); setEditingId(null); setFormData({ title: '', description: '', price: '', type: 'Satılık', rooms: '', location: '', badge: '' }); }}>{editingId ? 'İlanı Güncelle' : 'Yeni İlan Ekle'}</button>
        <button className={`tab-btn ${activeTab === 'ilanYonet' ? 'active' : ''}`} onClick={() => setActiveTab('ilanYonet')}>İlanları Yönet</button>
        <button className={`tab-btn ${activeTab === 'mesajlar' ? 'active' : ''}`} onClick={() => setActiveTab('mesajlar')}>Gelen Mesajlar</button>
        <button className={`tab-btn ${activeTab === 'ayarlar' ? 'active' : ''}`} onClick={() => setActiveTab('ayarlar')}>Site Ayarları</button>
        <button className={`tab-btn ${activeTab === 'ekip' ? 'active' : ''}`} onClick={() => { setActiveTab('ekip'); setEditingTeamId(null); }}>Ekibimizi Yönet</button>
        {/* 🔥 YENİ: BLOG SEKMESİ 🔥 */}
        <button className={`tab-btn ${activeTab === 'blog' ? 'active' : ''}`} onClick={() => setActiveTab('blog')}>Emlak Rehberi (Blog)</button>
      </div>

      {/* İLAN EKLEME FORMU */}
      {activeTab === 'ilan' && (
        <form onSubmit={handleSubmit} className="admin-form">
          <div className="form-group"><label>İlan Başlığı:</label><input type="text" name="title" value={formData.title} onChange={handleChange} required /></div>
          <div className="form-group"><label>Açıklama:</label><textarea name="description" value={formData.description} onChange={handleChange} required></textarea></div>
          <div className="form-group"><label>Fiyat (₺):</label><input type="number" name="price" value={formData.price} onChange={handleChange} required /></div>
          <div className="form-group"><label>Durum:</label><select name="type" value={formData.type} onChange={handleChange}><option value="Satılık">Satılık</option><option value="Kiralık">Kiralık</option></select></div>
          <div className="form-group"><label>Oda Sayısı:</label><input type="text" name="rooms" value={formData.rooms} onChange={handleChange} required placeholder="Örn: 3+1" /></div>
          <div className="form-group"><label>Konum (İl/İlçe):</label><input type="text" name="location" value={formData.location} onChange={handleChange} required /></div>
          <div className="form-group">
            <label>Dikkat Çekici Etiket:</label>
            <select name="badge" value={formData.badge} onChange={handleChange}>
              <option value="">-- Etiket Yok --</option>
              <option value="Yeni">Yeni Eklendi</option>
              <option value="Acil">Acil Satılık</option>
              <option value="Fiyat">Fiyatı Düştü!</option>
              <option value="Firsat">Kelepir Fırsat</option>
            </select>
          </div>
          <div className="form-group">
            <label>İlan Resimleri (Lütfen birden fazla seçin):</label>
            <input type="file" id="imageInput" accept="image/*" multiple onChange={handleFileChange} required={!editingId} />
          </div>
          <button type="submit" className="submit-btn" style={{width:'100%'}}>{editingId ? 'Değişiklikleri Kaydet' : 'İlanı Yükle'}</button>
        </form>
      )}

      {/* İLANLARI YÖNET */}
      {activeTab === 'ilanYonet' && (
        <div className="admin-property-list">
          {properties.length === 0 ? <div className="no-messages">İlan bulunmuyor.</div> : properties.map((prop) => (
            <div className="admin-prop-item" key={prop.id}>
              <div className="admin-prop-info"><h4>{prop.title}</h4><p>{prop.location} | {prop.price.toLocaleString('tr-TR')} ₺</p></div>
              <div className="admin-prop-actions">
                <button className="action-btn edit-btn" onClick={() => handleEdit(prop)}>Düzenle</button>
                <button className="action-btn delete-btn" onClick={() => handleDelete(prop.id)}>Sil</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* MESAJLAR VE AYARLAR */}
      {activeTab === 'mesajlar' && (
        <div className="messages-list">
          {messages.length === 0 ? <div className="no-messages">Mesaj bulunmuyor.</div> : messages.map((msg) => (
            <div className="message-card" key={msg.id}><div className="message-header"><h3>{msg.name}</h3></div><div className="message-contact-info">📧 {msg.email} | 📞 {msg.phone}</div><div className="message-body">{msg.message}</div></div>
          ))}
        </div>
      )}
      {activeTab === 'ayarlar' && (
        <div className="admin-property-list">
          {infoCards.map((card) => (
            <div className="admin-prop-item" key={card.id} style={{ display: 'block', marginBottom: '15px' }}>
              <div style={{ display: 'flex', gap: '15px', marginBottom: '10px' }}>
                <input type="text" value={card.icon} onChange={(e) => { const newCards = [...infoCards]; newCards.find(c => c.id === card.id).icon = e.target.value; setInfoCards(newCards); }} style={{ width: '60px', textAlign: 'center' }} />
                <input type="text" value={card.title} onChange={(e) => { const newCards = [...infoCards]; newCards.find(c => c.id === card.id).title = e.target.value; setInfoCards(newCards); }} style={{ flex: 1 }} />
              </div>
              <textarea value={card.description} onChange={(e) => { const newCards = [...infoCards]; newCards.find(c => c.id === card.id).description = e.target.value; setInfoCards(newCards); }} style={{ width: '100%', minHeight: '60px' }} />
              <button className="submit-btn" style={{ width: '100%', marginTop: '10px' }} onClick={async () => { await axios.put(`http://localhost:8080/api/info-cards/${card.id}`, card); alert('Güncellendi!'); }}>Kaydet</button>
            </div>
          ))}
        </div>
      )}

      {/* EKİP YÖNETİMİ */}
      {activeTab === 'ekip' && (
        <div>
          <form onSubmit={handleTeamSubmit} className="admin-form" style={{ marginBottom: '40px', paddingBottom: '30px', borderBottom: '2px solid #eee' }}>
            <h3 style={{ marginTop: 0 }}>Yeni Personel Ekle</h3>
            <div className="form-group"><label>Ad Soyad:</label><input type="text" name="name" value={teamFormData.name} onChange={handleTeamChange} required /></div>
            <div className="form-group"><label>Unvan (Rol):</label><input type="text" name="role" value={teamFormData.role} onChange={handleTeamChange} required /></div>
            <div className="form-group"><label>Açıklama:</label><textarea name="description" value={teamFormData.description} onChange={handleTeamChange} required></textarea></div>
            <div className="form-group"><label>Profil Fotoğrafı:</label><input type="file" id="teamImageInput" accept="image/*" onChange={handleTeamFileChange} required /></div>
            <button type="submit" className="submit-btn">Personeli Ekle</button>
          </form>
          <div className="admin-property-list">
            {team.map((member) => (
              <div className="admin-prop-item" key={member.id}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                  {member.image_path ? <img src={`http://localhost:8080${member.image_path}`} style={{ width: '50px', height: '50px', borderRadius: '50%' }} /> : <div style={{ width: '50px', height: '50px', borderRadius: '50%', background: '#eee' }}></div>}
                  <div className="admin-prop-info"><h4 style={{ margin: 0 }}>{member.name}</h4><p style={{ margin: 0 }}>{member.role}</p></div>
                </div>
                <div className="admin-prop-actions">
                  <button className="action-btn delete-btn" onClick={() => handleTeamDelete(member.id)}>Sil</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 🔥 YENİ: BLOG YÖNETİMİ 🔥 */}
      {activeTab === 'blog' && (
        <div>
          <form onSubmit={handleBlogSubmit} className="admin-form" style={{ marginBottom: '40px', paddingBottom: '30px', borderBottom: '2px solid #eee' }}>
            <h3 style={{ marginTop: 0 }}>Yeni Blog / Haber Ekle</h3>
            <div className="form-group">
              <label>Yazı Başlığı:</label>
              <input type="text" name="title" value={blogFormData.title} onChange={handleBlogChange} required placeholder="Örn: 2026 Emlak Trendleri" />
            </div>
            <div className="form-group">
              <label>Kısa Özet (Kartlarda görünür):</label>
              <textarea name="summary" value={blogFormData.summary} onChange={handleBlogChange} required placeholder="Özet..." style={{minHeight: '60px'}}></textarea>
            </div>
            <div className="form-group">
              <label>Yazının Tamamı (İçerik):</label>
              <textarea name="content" value={blogFormData.content} onChange={handleBlogChange} required placeholder="Makalenin tamamını buraya yapıştırın..." style={{minHeight: '150px'}}></textarea>
            </div>
            <div className="form-group">
              <label>Kapak Fotoğrafı:</label>
              <input type="file" id="blogImageInput" accept="image/*" onChange={handleBlogFileChange} required />
            </div>
            <button type="submit" className="submit-btn" style={{width: '100%'}}>Yazıyı Yayımla</button>
          </form>

          <h3 style={{ marginBottom: '20px' }}>Mevcut Yazılar</h3>
          <div className="admin-property-list">
            {blogs.length === 0 ? <div className="no-messages">Henüz yazı bulunmuyor.</div> : blogs.map((blog) => (
              <div className="admin-prop-item" key={blog.id}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                  {blog.image_path ? (
                    <img src={`http://localhost:8080${blog.image_path}`} style={{ width: '60px', height: '60px', borderRadius: '8px', objectFit: 'cover' }} />
                  ) : (
                    <div style={{ width: '60px', height: '60px', borderRadius: '8px', background: '#eee', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>📰</div>
                  )}
                  <div className="admin-prop-info">
                    <h4 style={{ margin: '0 0 5px 0' }}>{blog.title}</h4>
                    <p style={{ margin: 0, color: '#666', fontSize: '12px' }}>{new Date(blog.created_at).toLocaleDateString('tr-TR')}</p>
                  </div>
                </div>
                <div className="admin-prop-actions">
                  <button className="action-btn delete-btn" onClick={() => handleBlogDelete(blog.id)}>Sil</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}

export default Admin;