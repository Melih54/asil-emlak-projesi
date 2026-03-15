import { useState, useEffect } from 'react';
import axios from 'axios';
import './About.css';

function About() {
  const [team, setTeam] = useState([]);

  useEffect(() => {
    // Veritabanından çalışanlarımızı çekiyoruz
    axios.get('http://localhost:8080/api/team')
      .then(res => setTeam(res.data))
      .catch(err => console.error("Ekip çekilirken hata:", err));
  }, []);

  return (
    <div className="about-container">
      
      {/* Şirket Hakkında Bilgi Alanı */}
      <div className="about-header-glass">
        <h1>Asil Emlak'a Hoş Geldiniz</h1>
        <p>
          15 yılı aşkın süredir emlak sektöründe faaliyet gösteren Asil Emlak, dürüstlük, şeffaflık ve müşteri memnuniyeti ilkeleriyle hizmet vermektedir. Düzce ve çevresindeki geniş portföyümüzle hayalinizdeki yuvayı bulmanıza veya yatırımlarınızı en kârlı şekilde değerlendirmenize yardımcı oluyoruz. Sadece bir gayrimenkul satmıyor, yeni bir yaşam alanı inşa ediyoruz.
        </p>
      </div>

      {/* Ekibimiz Alanı */}
      <div className="team-section">
        <h2>Uzman Ekibimizle Tanışın</h2>
        
        {team.length === 0 ? (
          <div style={{ textAlign: 'center', color: '#7f8c8d', fontSize: '18px' }}>
            Şu an sistemde kayıtlı personel bulunmamaktadır.
          </div>
        ) : (
          <div className="team-grid">
            {team.map(member => (
              <div className="team-card" key={member.id}>
                <div className="team-image-container">
                  {member.image_path ? (
                    <img src={`http://localhost:8080${member.image_path}`} alt={member.name} />
                  ) : (
                    <div style={{ width:'100%', height:'100%', display:'flex', alignItems:'center', justifyContent:'center', color:'#888' }}>Resim Yok</div>
                  )}
                </div>
                <div className="team-info">
                  <h3>{member.name}</h3>
                  <span className="team-role">{member.role}</span>
                  <p className="team-desc">{member.description}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}

export default About;