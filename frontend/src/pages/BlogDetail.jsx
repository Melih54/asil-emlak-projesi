import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

function BlogDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [blog, setBlog] = useState(null);

  useEffect(() => {
    axios.get(`http://localhost:8080/api/blogs/${id}`)
      .then(res => setBlog(res.data))
      .catch(err => console.error(err));
    window.scrollTo(0,0);
  }, [id]);

  if (!blog) return <div style={{textAlign: 'center', marginTop: '50px', color:'white'}}>Yükleniyor...</div>;

  return (
    <div style={{ maxWidth: '900px', margin: '40px auto', padding: '0 20px', minHeight: '60vh' }}>
      <button onClick={() => navigate(-1)} style={{ background: 'none', border: 'none', color: '#d32f2f', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer', marginBottom: '20px' }}>&larr; Rehbere Dön</button>
      
      <div style={{ background: 'white', padding: '40px', borderRadius: '15px', boxShadow: '0 10px 30px rgba(0,0,0,0.2)' }}>
        <h1 style={{ margin: '0 0 15px 0', color: '#000', fontSize: '32px' }}>{blog.title}</h1>
        <p style={{ color: '#888', borderBottom: '1px solid #eee', paddingBottom: '20px', marginBottom: '30px' }}>
          📅 Yayınlanma: {new Date(blog.created_at).toLocaleDateString('tr-TR')}
        </p>
        
        {blog.image_path && (
          <img src={`http://localhost:8080${blog.image_path}`} alt="blog" style={{ width: '100%', borderRadius: '10px', marginBottom: '30px', maxHeight: '400px', objectFit: 'cover' }} />
        )}
        
        <div style={{ color: '#444', fontSize: '18px', lineHeight: '1.8', whiteSpace: 'pre-wrap' }}>
          {blog.content}
        </div>

        {/* Yazıyı Paylaş Butonu */}
        <button 
          onClick={() => { navigator.clipboard.writeText(window.location.href); alert('Yazı linki kopyalandı!'); }} 
          style={{ marginTop: '40px', background: '#f0f0f0', border: 'none', padding: '12px 25px', borderRadius: '30px', cursor: 'pointer', fontWeight: 'bold' }}
        >
          🔗 Bu Yazıyı Paylaş
        </button>
      </div>
    </div>
  );
}

export default BlogDetail;