import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Home.css'; // Kart tasarımları için

function Blog() {
  const [blogs, setBlogs] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    axios.get('http://localhost:8080/api/blogs')
      .then(res => setBlogs(res.data))
      .catch(err => console.error("Bloglar çekilemedi", err));
  }, []);

  return (
    <div style={{ maxWidth: '1200px', margin: '40px auto', padding: '0 20px', minHeight: '60vh' }}>
      <div style={{ textAlign: 'center', marginBottom: '50px', background: 'rgba(0,0,0,0.6)', padding: '40px', borderRadius: '15px', color: 'white' }}>
        <h1 style={{ margin: '0 0 10px 0', fontSize: '36px' }}>Emlak Rehberi & Haberler</h1>
        <p style={{ margin: 0, fontSize: '18px', color: '#e0e0e0' }}>Sektörel gelişmeler, yatırım tavsiyeleri ve emlak dünyasından son haberler.</p>
      </div>

      <div className="properties-grid">
        {blogs.map(blog => (
          <div className="property-card" key={blog.id} onClick={() => navigate(`/rehber/${blog.id}`)} style={{ cursor: 'pointer' }}>
            {blog.image_path ? (
              <img src={`http://localhost:8080${blog.image_path}`} alt={blog.title} className="property-image" />
            ) : (
              <div className="property-image" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f4f4f4', fontSize: '40px' }}>📰</div>
            )}
            <div className="property-info">
              <span className="property-type" style={{ background: '#333' }}>{new Date(blog.created_at).toLocaleDateString('tr-TR')}</span>
              <h3 className="property-title" style={{ marginTop: '15px', fontSize: '20px' }}>{blog.title}</h3>
              <p style={{ color: '#666', fontSize: '14px', lineHeight: '1.5', marginTop: '10px' }}>{blog.summary}</p>
              <span style={{ color: '#d32f2f', fontWeight: 'bold', fontSize: '14px', marginTop: '15px', display: 'inline-block' }}>Devamını Oku &rarr;</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Blog;