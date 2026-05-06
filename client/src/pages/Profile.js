import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import ResourceCard from '../components/ResourceCard';

export default function Profile() {
  const { user, token } = useAuth();
  const [myResources, setMyResources] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get('/api/resources')
      .then(res => {
        setMyResources(res.data.filter(r => r.uploadedBy?._id === user._id));
        setLoading(false);
      }).catch(() => setLoading(false));
  }, [user._id]);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this resource?')) return;
    try {
      await axios.delete(`/api/resources/${id}`, { headers: { Authorization: `Bearer ${token}` } });
      setMyResources(p => p.filter(r => r._id !== id));
    } catch (err) {
      alert(err.response?.data?.message || 'Delete failed');
    }
  };

  const totalDownloads = myResources.reduce((s, r) => s + (r.downloads || 0), 0);
  const totalViews = myResources.reduce((s, r) => s + (r.views || 0), 0);
  const totalComments = myResources.reduce((s, r) => s + (r.comments?.length || 0), 0);
  const allRatings = myResources.flatMap(r => r.ratings || []);
  const avgRating = allRatings.length ? (allRatings.reduce((s, r) => s + r.value, 0) / allRatings.length).toFixed(1) : 'N/A';

  return (
    <div style={s.page}>
      {/* Profile Header */}
      <div style={s.header}>
        <div style={s.avatarBig}>{user.name[0].toUpperCase()}</div>
        <div style={s.headerInfo}>
          <h2 style={s.name}>{user.name}</h2>
          <p style={s.meta}>🎓 {user.department} · {user.year}</p>
          <p style={s.meta}>📧 {user.email} · 🪪 ID: {user.studentId}</p>
        </div>
        <Link to="/upload" style={{ marginLeft:'auto' }}>
          <button className="btn btn-primary">📤 Upload Resource</button>
        </Link>
      </div>

      {/* Stats */}
      <div style={s.statsRow}>
        {[
          { icon:'📁', val: myResources.length, label:'Uploads', color:'#7B1C1C' },
          { icon:'⬇', val: totalDownloads, label:'Downloads', color:'#1d4ed8' },
          { icon:'👁', val: totalViews, label:'Views', color:'#166534' },
          { icon:'💬', val: totalComments, label:'Comments', color:'#92400e' },
          { icon:'⭐', val: avgRating, label:'Avg Rating', color:'#C9A84C' },
        ].map(stat => (
          <div key={stat.label} className="card" style={s.statCard}>
            <span style={{ fontSize:26 }}>{stat.icon}</span>
            <span style={{ fontSize:26, fontWeight:800, color: stat.color }}>{stat.val}</span>
            <span style={{ fontSize:13, color:'#8a6a6a' }}>{stat.label}</span>
          </div>
        ))}
      </div>

      {/* My Uploads */}
      <h3 style={s.sectionTitle}>My Uploads</h3>
      {loading ? (
        <p style={{ color:'#8a6a6a' }}>Loading...</p>
      ) : myResources.length === 0 ? (
        <div style={s.empty}>
          <span style={{ fontSize:48 }}>📭</span>
          <p style={{ fontWeight:700, color:'#5c3d3d' }}>No uploads yet</p>
          <Link to="/upload"><button className="btn btn-primary" style={{ marginTop:8 }}>📤 Upload Now</button></Link>
        </div>
      ) : (
        <div style={s.grid}>
          {myResources.map(r => <ResourceCard key={r._id} resource={r} onDelete={handleDelete} />)}
        </div>
      )}
    </div>
  );
}

const s = {
  page: { maxWidth:1200, margin:'0 auto', padding:'32px 24px' },
  header: { display:'flex', alignItems:'center', gap:20, background:'#fff', borderRadius:16, padding:24, border:'1px solid #e8d5c4', marginBottom:24 },
  avatarBig: { width:72, height:72, borderRadius:'50%', background:'#7B1C1C', color:'#C9A84C', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:800, fontSize:28, flexShrink:0 },
  headerInfo: { display:'flex', flexDirection:'column', gap:6 },
  name: { fontSize:22, fontWeight:800, color:'#2c1a1a' },
  meta: { fontSize:14, color:'#8a6a6a' },
  statsRow: { display:'flex', gap:16, marginBottom:32, flexWrap:'wrap' },
  statCard: { display:'flex', flexDirection:'column', alignItems:'center', gap:4, padding:'20px 28px', flex:'0 0 auto' },
  sectionTitle: { fontSize:18, fontWeight:800, color:'#7B1C1C', marginBottom:16 },
  grid: { display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(320px,1fr))', gap:20 },
  empty: { textAlign:'center', padding:'48px 20px', display:'flex', flexDirection:'column', alignItems:'center', gap:10 },
};
