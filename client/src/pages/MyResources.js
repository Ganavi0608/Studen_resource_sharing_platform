import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import ResourceCard from '../components/ResourceCard';

export default function MyResources() {
  const { user, token } = useAuth();
  const [myResources, setMyResources] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get('/api/resources')
      .then(res => {
        setMyResources(res.data.filter(r => r.uploadedBy?._id === user._id));
        setLoading(false);
      })
      .catch(() => setLoading(false));
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

  return (
    <div style={s.page}>
      <div style={s.header}>
        <div>
          <h2 style={s.title}>My Uploads</h2>
          <p style={s.sub}>Resources you've shared with the college community</p>
        </div>
        <Link to="/upload"><button className="btn btn-primary">📤 Upload New</button></Link>
      </div>

      <div style={s.statsRow}>
        {[
          { icon:'📁', val: myResources.length, label:'Uploaded' },
          { icon:'⬇', val: totalDownloads, label:'Total Downloads' },
          { icon:'⭐', val: '4.5', label:'Avg Rating' },
          { icon:'💬', val: myResources.reduce((s,r) => s + (r.comments?.length || 0), 0), label:'Comments' },
        ].map(stat => (
          <div key={stat.label} className="card" style={s.statCard}>
            <span style={s.statIcon}>{stat.icon}</span>
            <span style={s.statVal}>{stat.val}</span>
            <span style={s.statLabel}>{stat.label}</span>
          </div>
        ))}
      </div>

      {loading ? (
        <p style={{ textAlign:'center', color:'#8a6a6a', marginTop:40 }}>Loading...</p>
      ) : myResources.length === 0 ? (
        <div style={s.empty}>
          <span style={{ fontSize:52 }}>📭</span>
          <p style={{ fontWeight:700, fontSize:16, color:'#5c3d3d' }}>No uploads yet</p>
          <p style={{ fontSize:14, color:'#8a6a6a' }}>Be the first to share resources with your peers</p>
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
  header: { display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:28 },
  title: { fontSize:24, fontWeight:800, color:'#7B1C1C' },
  sub: { fontSize:14, color:'#8a6a6a', marginTop:4 },
  statsRow: { display:'flex', gap:16, marginBottom:28, flexWrap:'wrap' },
  statCard: { display:'flex', flexDirection:'column', alignItems:'center', gap:4, padding:'18px 32px', flex:'0 0 auto' },
  statIcon: { fontSize:24 },
  statVal: { fontSize:26, fontWeight:800, color:'#7B1C1C' },
  statLabel: { fontSize:13, color:'#8a6a6a' },
  grid: { display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(320px,1fr))', gap:20 },
  empty: { textAlign:'center', padding:'64px 20px', display:'flex', flexDirection:'column', alignItems:'center', gap:12 },
};
