import { useState, useEffect } from 'react';
import axios from 'axios';
import ResourceCard from '../components/ResourceCard';

export default function Bookmarks() {
  const [bookmarked, setBookmarked] = useState([]);

  useEffect(() => {
    const ids = JSON.parse(localStorage.getItem('srsp_bookmarks') || '[]');
    if (ids.length === 0) return;
    axios.get('/api/resources').then(res => {
      setBookmarked(res.data.filter(r => ids.includes(r._id)));
    }).catch(() => {});
  }, []);

  return (
    <div style={s.page}>
      <h2 style={s.title}>🔖 Saved Resources</h2>
      <p style={s.sub}>Resources you've bookmarked for later</p>
      {bookmarked.length === 0 ? (
        <div style={s.empty}>
          <span style={{ fontSize:52 }}>🔖</span>
          <p style={{ fontWeight:700, fontSize:16, color:'#5c3d3d' }}>No saved resources yet</p>
          <p style={{ fontSize:14, color:'#8a6a6a' }}>Click the Save button on any resource to bookmark it</p>
        </div>
      ) : (
        <div style={s.grid}>
          {bookmarked.map(r => <ResourceCard key={r._id} resource={r} />)}
        </div>
      )}
    </div>
  );
}

const s = {
  page: { maxWidth:1200, margin:'0 auto', padding:'32px 24px' },
  title: { fontSize:24, fontWeight:800, color:'#7B1C1C' },
  sub: { fontSize:14, color:'#8a6a6a', marginTop:4, marginBottom:28 },
  grid: { display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(320px,1fr))', gap:20 },
  empty: { textAlign:'center', padding:'64px 20px', display:'flex', flexDirection:'column', alignItems:'center', gap:12 },
};
