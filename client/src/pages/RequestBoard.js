import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { DEPARTMENTS, SEMESTERS } from '../data';

const catColors = {
  open: { bg:'#dcfce7', color:'#166534', label:'Open' },
  fulfilled: { bg:'#dbeafe', color:'#1d4ed8', label:'Fulfilled' },
};

export default function RequestBoard() {
  const { user, token } = useAuth();
  const navigate = useNavigate();
  const [requests, setRequests] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [filter, setFilter] = useState('all');
  const [form, setForm] = useState({ title:'', subject:'', department:'', semester:'', description:'' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get('/api/requests').then(res => { setRequests(res.data); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const res = await axios.post('/api/requests', form, { headers: { Authorization: `Bearer ${token}` } });
      setRequests(p => [res.data, ...p]);
      setForm({ title:'', subject:'', department:'', semester:'', description:'' });
      setShowForm(false);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to post request');
    }
  };

  const handleFulfill = async (id) => {
    try {
      const res = await axios.patch(`/api/requests/${id}/fulfill`, {}, { headers: { Authorization: `Bearer ${token}` } });
      setRequests(p => p.map(r => r._id === id ? res.data : r));
    } catch { }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this request?')) return;
    try {
      await axios.delete(`/api/requests/${id}`, { headers: { Authorization: `Bearer ${token}` } });
      setRequests(p => p.filter(r => r._id !== id));
    } catch { }
  };

  const filtered = requests.filter(r => {
    if (filter === 'open') return !r.fulfilled;
    if (filter === 'fulfilled') return r.fulfilled;
    return true;
  });

  const openCount = requests.filter(r => !r.fulfilled).length;

  return (
    <div style={s.page}>
      {/* Header */}
      <div style={s.header}>
        <div>
          <h2 style={s.title}>📋 Resource Request Board</h2>
          <p style={s.sub}>Can't find what you need? Post a request — let the community help you.</p>
        </div>
        {user
          ? <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
              {showForm ? '✕ Cancel' : '+ Post Request'}
            </button>
          : <button className="btn btn-outline" onClick={() => navigate('/login')}>Login to Request</button>
        }
      </div>

      {/* Stats */}
      <div style={s.statsRow}>
        {[
          { val: requests.length, label:'Total Requests', icon:'📋' },
          { val: openCount, label:'Open Requests', icon:'🟢' },
          { val: requests.length - openCount, label:'Fulfilled', icon:'✅' },
        ].map(stat => (
          <div key={stat.label} className="card" style={s.statCard}>
            <span style={{ fontSize:22 }}>{stat.icon}</span>
            <span style={{ fontSize:24, fontWeight:800, color:'#7B1C1C' }}>{stat.val}</span>
            <span style={{ fontSize:13, color:'#8a6a6a' }}>{stat.label}</span>
          </div>
        ))}
      </div>

      {/* Post Request Form */}
      {showForm && (
        <div className="card" style={s.formCard}>
          <h3 style={s.formTitle}>📝 Post a New Request</h3>
          <form onSubmit={handleSubmit} style={s.form}>
            <div style={s.row}>
              <div style={{ flex:1 }}>
                <label style={s.label}>What do you need? *</label>
                <input placeholder="e.g. Data Structures Unit 3 Notes" value={form.title} onChange={set('title')} required />
              </div>
              <div style={{ flex:1 }}>
                <label style={s.label}>Subject *</label>
                <input placeholder="e.g. Data Structures" value={form.subject} onChange={set('subject')} required />
              </div>
            </div>
            <div style={s.row}>
              <div style={{ flex:1 }}>
                <label style={s.label}>Department *</label>
                <select value={form.department} onChange={set('department')} required>
                  <option value="">Select Department</option>
                  {DEPARTMENTS.map(d => <option key={d}>{d}</option>)}
                </select>
              </div>
              <div style={{ flex:1 }}>
                <label style={s.label}>Semester</label>
                <select value={form.semester} onChange={set('semester')}>
                  <option value="">Select Semester</option>
                  {SEMESTERS.map(s => <option key={s}>{s}</option>)}
                </select>
              </div>
            </div>
            <div>
              <label style={s.label}>Additional Details</label>
              <textarea placeholder="Any specific topics, units, or details..." rows={3} value={form.description} onChange={set('description')} style={{ resize:'vertical' }} />
            </div>
            {error && <p className="error">⚠ {error}</p>}
            <button className="btn btn-primary" type="submit" style={{ alignSelf:'flex-start' }}>Post Request</button>
          </form>
        </div>
      )}

      {/* Filter Tabs */}
      <div style={s.tabRow}>
        {[['all','All Requests'], ['open','🟢 Open'], ['fulfilled','✅ Fulfilled']].map(([key, label]) => (
          <button key={key} onClick={() => setFilter(key)}
            style={{ ...s.tabBtn, ...(filter === key ? s.tabActive : {}) }}>
            {label}
          </button>
        ))}
      </div>

      {/* Requests List */}
      {loading ? (
        <p style={{ color:'#8a6a6a', textAlign:'center', marginTop:40 }}>Loading...</p>
      ) : filtered.length === 0 ? (
        <div style={s.empty}>
          <span style={{ fontSize:48 }}>📭</span>
          <p style={{ fontWeight:700, color:'#5c3d3d' }}>No requests yet</p>
          <p style={{ fontSize:14, color:'#8a6a6a' }}>Be the first to post a resource request</p>
        </div>
      ) : (
        <div style={s.list}>
          {filtered.map(r => (
            <div key={r._id} className="card" style={s.requestCard}>
              <div style={s.cardTop}>
                <div style={s.cardLeft}>
                  <span style={{ ...s.statusBadge, background: r.fulfilled ? catColors.fulfilled.bg : catColors.open.bg, color: r.fulfilled ? catColors.fulfilled.color : catColors.open.color }}>
                    {r.fulfilled ? '✅ Fulfilled' : '🟢 Open'}
                  </span>
                  <h3 style={s.reqTitle}>{r.title}</h3>
                  <div style={s.reqMeta}>
                    <span style={s.metaChip}>📚 {r.subject}</span>
                    <span style={s.metaChip}>🏛 {r.department}</span>
                    {r.semester && <span style={s.metaChip}>📅 {r.semester}</span>}
                    <span style={s.metaChip}>👤 {r.requesterName}</span>
                    <span style={s.metaChip}>🗓 {new Date(r.createdAt).toLocaleDateString('en-IN', { day:'numeric', month:'short', year:'numeric' })}</span>
                  </div>
                  {r.description && <p style={s.reqDesc}>{r.description}</p>}
                </div>
                <div style={s.cardActions}>
                  {user && !r.fulfilled && r.requestedBy !== user._id && (
                    <button className="btn btn-primary btn-sm" onClick={() => navigate('/upload')}>
                      📤 Fulfill Request
                    </button>
                  )}
                  {user && !r.fulfilled && r.requestedBy === user._id && (
                    <button className="btn btn-outline btn-sm" onClick={() => handleFulfill(r._id)}>
                      ✅ Mark Fulfilled
                    </button>
                  )}
                  {user && r.requestedBy === user._id && (
                    <button className="btn btn-danger btn-sm" onClick={() => handleDelete(r._id)}>🗑</button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

const s = {
  page: { maxWidth:1000, margin:'0 auto', padding:'32px 24px' },
  header: { display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:24 },
  title: { fontSize:24, fontWeight:800, color:'#7B1C1C' },
  sub: { fontSize:14, color:'#8a6a6a', marginTop:4 },
  statsRow: { display:'flex', gap:16, marginBottom:24, flexWrap:'wrap' },
  statCard: { display:'flex', flexDirection:'column', alignItems:'center', gap:4, padding:'16px 28px', flex:'0 0 auto' },
  formCard: { marginBottom:24 },
  formTitle: { fontSize:16, fontWeight:700, color:'#7B1C1C', marginBottom:16 },
  form: { display:'flex', flexDirection:'column', gap:16 },
  row: { display:'flex', gap:16 },
  label: { display:'block', fontSize:13, fontWeight:600, color:'#5c3d3d', marginBottom:6 },
  tabRow: { display:'flex', gap:8, marginBottom:20, borderBottom:'2px solid #e8d5c4' },
  tabBtn: { padding:'10px 20px', border:'none', background:'transparent', cursor:'pointer', fontSize:14, fontWeight:500, color:'#8a6a6a', borderBottom:'3px solid transparent', marginBottom:-2 },
  tabActive: { color:'#7B1C1C', borderBottom:'3px solid #7B1C1C', fontWeight:700 },
  list: { display:'flex', flexDirection:'column', gap:14 },
  requestCard: { padding:20 },
  cardTop: { display:'flex', justifyContent:'space-between', alignItems:'flex-start', gap:16 },
  cardLeft: { flex:1, display:'flex', flexDirection:'column', gap:8 },
  statusBadge: { display:'inline-block', padding:'3px 12px', borderRadius:20, fontSize:12, fontWeight:700, alignSelf:'flex-start' },
  reqTitle: { fontSize:16, fontWeight:700, color:'#2c1a1a' },
  reqMeta: { display:'flex', flexWrap:'wrap', gap:8 },
  metaChip: { fontSize:12, background:'#FDF6EC', border:'1px solid #e8d5c4', borderRadius:20, padding:'3px 10px', color:'#8a6a6a' },
  reqDesc: { fontSize:13, color:'#5c3d3d', lineHeight:1.6 },
  cardActions: { display:'flex', flexDirection:'column', gap:8, flexShrink:0 },
  empty: { textAlign:'center', padding:'60px 20px', display:'flex', flexDirection:'column', alignItems:'center', gap:10 },
};
