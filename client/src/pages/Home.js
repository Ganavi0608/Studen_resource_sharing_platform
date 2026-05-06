import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import ResourceCard from '../components/ResourceCard';
import { DEPARTMENTS, CATEGORIES, SEMESTERS } from '../data';

export default function Home() {
  const { user } = useAuth();
  const [resources, setResources] = useState([]);
  const [search, setSearch] = useState('');
  const [department, setDepartment] = useState('');
  const [category, setCategory] = useState('');
  const [semester, setSemester] = useState('');
  const [sort, setSort] = useState('newest');
  const [activeTab, setActiveTab] = useState('all');

  useEffect(() => {
    axios.get('/api/resources', { params: { sort } })
      .then(res => setResources(res.data)).catch(() => {});
  }, [sort]);

  const trending = useMemo(() =>
    [...resources].sort((a, b) => (b.downloads || 0) - (a.downloads || 0)).slice(0, 6)
  , [resources]);

  const topRated = useMemo(() =>
    [...resources].filter(r => r.ratings?.length > 0)
      .sort((a, b) => {
        const avgA = a.ratings.reduce((s, r) => s + r.value, 0) / a.ratings.length;
        const avgB = b.ratings.reduce((s, r) => s + r.value, 0) / b.ratings.length;
        return avgB - avgA;
      }).slice(0, 6)
  , [resources]);

  const filtered = useMemo(() => resources.filter(r => {
    const q = search.toLowerCase();
    return (!search || r.title?.toLowerCase().includes(q) || r.subject?.toLowerCase().includes(q) || r.description?.toLowerCase().includes(q))
      && (!department || r.department === department)
      && (!category || r.category === category)
      && (!semester || r.semester === semester);
  }), [resources, search, department, category, semester]);

  const totalDownloads = resources.reduce((s, r) => s + (r.downloads || 0), 0);
  const totalViews = resources.reduce((s, r) => s + (r.views || 0), 0);
  const displayList = activeTab === 'trending' ? trending : activeTab === 'toprated' ? topRated : filtered;

  return (
    <div style={s.page}>
      {/* Hero */}
      <div style={s.hero}>
        <div style={s.heroInner}>
          <div style={s.heroBadge}>🎓 MERN Stack Academic Resource Portal</div>
          <h1 style={s.heroTitle}>Student Resource Sharing Platform</h1>
          <p style={s.heroSub}>
            A centralized web-based platform for students to upload, access and download study materials —
            notes, assignments, question papers and reference documents. Enhancing collaborative learning anytime, anywhere.
          </p>
          <div style={s.heroActions}>
            {user
              ? <Link to="/upload"><button className="btn btn-gold btn-lg">📤 Upload Resource</button></Link>
              : <Link to="/register"><button className="btn btn-gold btn-lg">🚀 Register as Student</button></Link>
            }
            <a href="#resources">
              <button className="btn btn-lg" style={s.browseBtn}>Browse Resources ↓</button>
            </a>
          </div>
        </div>
        <div style={s.statsRow}>
          {[
            { icon:'📁', val: resources.length, label:'Resources' },
            { icon:'⬇', val: totalDownloads, label:'Downloads' },
            { icon:'👁', val: totalViews, label:'Views' },
            { icon:'🏛', val: DEPARTMENTS.length, label:'Departments' },
          ].map(stat => (
            <div key={stat.label} style={s.statBox}>
              <span style={s.statIcon}>{stat.icon}</span>
              <span style={s.statVal}>{stat.val}</span>
              <span style={s.statLabel}>{stat.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Search & Filters */}
      <div id="resources" style={s.searchSection}>
        <div style={s.searchWrap}>
          <span style={s.searchIcon}>🔍</span>
          <input value={search} onChange={e => { setSearch(e.target.value); setActiveTab('all'); }}
            placeholder="Search by title, subject or description..." style={s.searchInput} />
          {search && <button onClick={() => setSearch('')} style={s.clearBtn}>✕</button>}
        </div>
        <div style={s.filterRow}>
          <select value={department} onChange={e => { setDepartment(e.target.value); setActiveTab('all'); }} style={s.select}>
            <option value="">All Departments</option>
            {DEPARTMENTS.map(d => <option key={d}>{d}</option>)}
          </select>
          <select value={semester} onChange={e => { setSemester(e.target.value); setActiveTab('all'); }} style={s.select}>
            <option value="">All Semesters</option>
            {SEMESTERS.map(s => <option key={s}>{s}</option>)}
          </select>
          <select value={category} onChange={e => { setCategory(e.target.value); setActiveTab('all'); }} style={s.select}>
            <option value="">All Categories</option>
            {CATEGORIES.map(c => <option key={c}>{c}</option>)}
          </select>
          <select value={sort} onChange={e => setSort(e.target.value)} style={s.select}>
            <option value="newest">🕐 Newest</option>
            <option value="downloads">⬇ Most Downloaded</option>
            <option value="views">👁 Most Viewed</option>
          </select>
          {(search || department || category || semester) && (
            <button className="btn btn-ghost btn-sm" onClick={() => { setSearch(''); setDepartment(''); setCategory(''); setSemester(''); }}>
              ✕ Clear
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div style={s.tabRow}>
        {[
          { key:'all', label:`📚 All (${filtered.length})` },
          { key:'trending', label:'🔥 Most Downloaded' },
          { key:'toprated', label:'⭐ Top Rated' },
        ].map(t => (
          <button key={t.key} onClick={() => setActiveTab(t.key)}
            style={{ ...s.tabBtn, ...(activeTab === t.key ? s.tabBtnActive : {}) }}>
            {t.label}
          </button>
        ))}
      </div>

      {/* Grid */}
      {displayList.length === 0 ? (
        <div style={s.empty}>
          <span style={{ fontSize:52 }}>📭</span>
          <p style={{ fontWeight:700, fontSize:16, color:'#5c3d3d' }}>No resources found</p>
          <p style={{ fontSize:14, color:'#8a6a6a' }}>Try adjusting your search or filters</p>
        </div>
      ) : (
        <div style={s.grid}>
          {displayList.map(r => <ResourceCard key={r._id} resource={r} />)}
        </div>
      )}
    </div>
  );
}

const s = {
  page: { maxWidth:1200, margin:'0 auto', padding:'0 24px 56px' },
  hero: { background:'linear-gradient(135deg, #7B1C1C 0%, #9e2a2a 60%, #7B1C1C 100%)', borderRadius:'0 0 28px 28px', padding:'52px 44px 40px', marginBottom:36, color:'#fff', borderBottom:'4px solid #C9A84C' },
  heroInner: { maxWidth:620, marginBottom:40 },
  heroBadge: { display:'inline-block', background:'rgba(201,168,76,0.2)', border:'1px solid rgba(201,168,76,0.4)', borderRadius:20, padding:'5px 16px', fontSize:13, fontWeight:600, color:'#e8c96a', marginBottom:18 },
  heroTitle: { fontSize:38, fontWeight:800, lineHeight:1.2, marginBottom:14, color:'#fff' },
  heroSub: { fontSize:15, color:'rgba(255,255,255,0.78)', lineHeight:1.7, marginBottom:30 },
  heroActions: { display:'flex', gap:14, flexWrap:'wrap' },
  browseBtn: { background:'rgba(255,255,255,0.12)', color:'#fff', border:'1.5px solid rgba(255,255,255,0.35)' },
  statsRow: { display:'flex', gap:14, flexWrap:'wrap' },
  statBox: { background:'rgba(0,0,0,0.2)', border:'1px solid rgba(201,168,76,0.3)', borderRadius:12, padding:'14px 28px', display:'flex', flexDirection:'column', alignItems:'center', gap:3, minWidth:110 },
  statIcon: { fontSize:22 },
  statVal: { fontSize:24, fontWeight:800, color:'#C9A84C' },
  statLabel: { fontSize:12, color:'rgba(255,255,255,0.65)' },
  searchSection: { marginBottom:20 },
  searchWrap: { position:'relative', marginBottom:14 },
  searchIcon: { position:'absolute', left:14, top:'50%', transform:'translateY(-50%)', fontSize:16 },
  searchInput: { paddingLeft:44, paddingRight:40, height:50, fontSize:15, borderRadius:12, borderColor:'#e8d5c4' },
  clearBtn: { position:'absolute', right:14, top:'50%', transform:'translateY(-50%)', background:'none', border:'none', cursor:'pointer', fontSize:16, color:'#8a6a6a' },
  filterRow: { display:'flex', gap:10, flexWrap:'wrap', alignItems:'center' },
  select: { width:'auto', flex:'0 0 auto', height:42, paddingTop:0, paddingBottom:0 },
  tabRow: { display:'flex', gap:8, marginBottom:24, borderBottom:'2px solid #e8d5c4' },
  tabBtn: { padding:'10px 20px', border:'none', background:'transparent', cursor:'pointer', fontSize:14, fontWeight:500, color:'#8a6a6a', borderBottom:'3px solid transparent', marginBottom:-2, transition:'all 0.2s' },
  tabBtnActive: { color:'#7B1C1C', borderBottom:'3px solid #7B1C1C', fontWeight:700 },
  grid: { display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(320px,1fr))', gap:20 },
  empty: { textAlign:'center', padding:'64px 20px', display:'flex', flexDirection:'column', alignItems:'center', gap:12 },
};
