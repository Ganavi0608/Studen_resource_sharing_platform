import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { DEPARTMENTS, CATEGORIES, SEMESTERS } from '../data';

export default function Upload() {
  const { user, token } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ title:'', description:'', subject:'', department: user?.department || '', semester:'', category:'' });
  const [file, setFile] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [drag, setDrag] = useState(false);

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));

  const handleFile = (f) => {
    if (f && f.size > 20 * 1024 * 1024) return setError('File must be under 20MB');
    setFile(f); setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) return setError('Please select a file');
    if (!form.category) return setError('Please select a category');
    setError(''); setLoading(true);
    
    try {
      const formData = new FormData();
      formData.append('file', file);
      Object.entries(form).forEach(([k, v]) => formData.append(k, v));
      await axios.post('/api/resources', formData, {
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' }
      });
      setLoading(false);
      setSuccess(true);
    } catch (err) {
      setLoading(false);
      setError(err.response?.data?.message || 'Upload failed. Please try again.');
    }
  };

  if (success) return (
    <div style={s.page}>
      <div style={s.successCard}>
        <div style={s.successIcon}>✅</div>
        <h2 style={s.successTitle}>Uploaded Successfully!</h2>
        <p style={s.successSub}>"{form.title}" is now available to all students.</p>
        <div style={{ display:'flex', gap:12, justifyContent:'center', marginTop:8 }}>
          <button className="btn btn-primary" onClick={() => navigate('/')}>Browse Resources</button>
          <button className="btn btn-outline" onClick={() => { setSuccess(false); setForm({ title:'', description:'', subject:'', department: user?.department || '', category:'', referenceLinks:'' }); setFile(null); }}>
            Upload Another
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div style={s.page}>
      <div style={s.header}>
        <h2 style={s.title}>📤 Upload Resource</h2>
        <p style={s.sub}>Share your study materials with fellow students</p>
      </div>

      <div style={s.layout}>
        <div className="card" style={s.formCard}>
          <form onSubmit={handleSubmit} style={s.form}>
            <div>
              <label style={s.label}>Resource Title *</label>
              <input placeholder="e.g. Data Structures Complete Notes Unit 1-5" value={form.title} onChange={set('title')} required />
            </div>
            <div>
              <label style={s.label}>Description</label>
              <textarea placeholder="What does this resource cover? (optional)" rows={3} value={form.description} onChange={set('description')} style={{ resize:'vertical' }} />
            </div>
            <div style={s.row}>
              <div style={{ flex:1 }}>
                <label style={s.label}>Subject *</label>
                <input placeholder="e.g. Data Structures" value={form.subject} onChange={set('subject')} required />
              </div>
              <div style={{ flex:1 }}>
                <label style={s.label}>Department *</label>
                <select value={form.department} onChange={set('department')} required>
                  <option value="">Select</option>
                  {DEPARTMENTS.map(d => <option key={d}>{d}</option>)}
                </select>
              </div>
            </div>
            <div style={s.row}>
              <div style={{ flex:1 }}>
                <label style={s.label}>Semester</label>
                <select value={form.semester} onChange={set('semester')}>
                  <option value="">Select Semester</option>
                  {SEMESTERS.map(s => <option key={s}>{s}</option>)}
                </select>
              </div>
              <label style={s.label}>Category *</label>
              <div style={s.catGrid}>
                {CATEGORIES.map(c => (
                  <div key={c} onClick={() => setForm(f => ({ ...f, category: c }))} style={{ ...s.catOpt, ...(form.category === c ? s.catSel : {}) }}>
                    {c === 'Notes' ? '📝' : c === 'Assignment' ? '📋' : c === 'Question Paper' ? '📄' : '📖'} {c}
                  </div>
                ))}
              </div>
            </div>

            <div>
              <label style={s.label}>🔗 Reference Links (YouTube, websites, etc.)</label>
              <input 
                placeholder="https://youtube.com/watch?v=..., https://example.com/..." 
                value={form.referenceLinks} 
                onChange={set('referenceLinks')}
                style={{ fontSize: 13 }}
              />
              <p style={{ fontSize: 11, color: '#8a6a6a', marginTop: 4 }}>Separate multiple links with commas</p>
            </div>

            <div
              onDragOver={e => { e.preventDefault(); setDrag(true); }}
              onDragLeave={() => setDrag(false)}
              onDrop={e => { e.preventDefault(); setDrag(false); handleFile(e.dataTransfer.files[0]); }}
              onClick={() => document.getElementById('fi').click()}
              style={{ ...s.drop, ...(drag ? s.dropActive : {}), ...(file ? s.dropFilled : {}) }}
            >
              <input id="fi" type="file" onChange={e => handleFile(e.target.files[0])} style={{ display:'none' }} />
              {file ? (
                <>
                  <span style={{ fontSize:32 }}>📄</span>
                  <p style={{ fontWeight:600, fontSize:14, color:'#2c1a1a' }}>{file.name}</p>
                  <p style={{ fontSize:12, color:'#8a6a6a' }}>{(file.size/1024/1024).toFixed(2)} MB</p>
                  <button type="button" className="btn btn-ghost btn-sm" onClick={e => { e.stopPropagation(); setFile(null); }}>Remove</button>
                </>
              ) : (
                <>
                  <span style={{ fontSize:38 }}>📁</span>
                  <p style={{ fontSize:14, color:'#5c3d3d' }}>Drag & drop or <span style={{ color:'#7B1C1C', fontWeight:700 }}>browse file</span></p>
                  <p style={{ fontSize:12, color:'#8a6a6a' }}>PDF, DOCX, PPTX, ZIP — Max 20MB</p>
                </>
              )}
            </div>

            {error && <p className="error">⚠ {error}</p>}
            <button className="btn btn-primary" type="submit" disabled={loading} style={{ width:'100%', justifyContent:'center', height:46 }}>
              {loading ? '⏳ Uploading...' : '📤 Upload Resource'}
            </button>
          </form>
        </div>

        <div style={s.sidebar}>
          <div className="card">
            <h4 style={s.sideTitle}>👤 Uploading as</h4>
            <div style={s.uploaderRow}>
              <div style={s.uAvatar}>{user?.name?.[0]}</div>
              <div>
                <p style={{ fontWeight:700, fontSize:14, color:'#2c1a1a' }}>{user?.name}</p>
                <p style={{ fontSize:12, color:'#8a6a6a' }}>{user?.email}</p>
              </div>
            </div>
          </div>
          <div className="card" style={{ marginTop:16 }}>
            <h4 style={s.sideTitle}>📌 Tips</h4>
            <ul style={{ listStyle:'none', display:'flex', flexDirection:'column', gap:9, marginTop:8 }}>
              {['Use a clear descriptive title', 'PDF format works best', 'Add description for better discovery', 'Pick the correct category', 'Max file size is 20MB'].map(t => (
                <li key={t} style={{ fontSize:13, color:'#5c3d3d' }}>✓ {t}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

const s = {
  page: { maxWidth:1000, margin:'0 auto', padding:'32px 24px' },
  header: { marginBottom:28 },
  title: { fontSize:24, fontWeight:800, color:'#7B1C1C' },
  sub: { fontSize:14, color:'#8a6a6a', marginTop:4 },
  layout: { display:'grid', gridTemplateColumns:'1fr 260px', gap:24, alignItems:'start' },
  formCard: { padding:28 },
  form: { display:'flex', flexDirection:'column', gap:20 },
  label: { display:'block', fontSize:13, fontWeight:600, color:'#5c3d3d', marginBottom:6 },
  row: { display:'flex', gap:16 },
  catGrid: { display:'grid', gridTemplateColumns:'1fr 1fr', gap:10, marginTop:4 },
  catOpt: { padding:'12px 14px', border:'2px solid #e8d5c4', borderRadius:10, cursor:'pointer', fontSize:13, fontWeight:600, textAlign:'center', color:'#5c3d3d', transition:'all 0.2s', background:'#FDF6EC' },
  catSel: { border:'2px solid #7B1C1C', background:'#fdf3d7', color:'#7B1C1C' },
  drop: { border:'2px dashed #e8d5c4', borderRadius:12, padding:'28px 20px', textAlign:'center', cursor:'pointer', display:'flex', flexDirection:'column', alignItems:'center', gap:8, transition:'all 0.2s', background:'#FDF6EC' },
  dropActive: { border:'2px dashed #7B1C1C', background:'#fdf3d7' },
  dropFilled: { border:'2px solid #C9A84C', background:'#fdf9ee' },
  sidebar: { position:'sticky', top:84 },
  sideTitle: { fontSize:14, fontWeight:700, color:'#7B1C1C' },
  uploaderRow: { display:'flex', alignItems:'center', gap:12, marginTop:12 },
  uAvatar: { width:38, height:38, borderRadius:'50%', background:'#7B1C1C', color:'#C9A84C', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:800, fontSize:16 },
  successCard: { textAlign:'center', padding:'80px 20px', display:'flex', flexDirection:'column', alignItems:'center', gap:14 },
  successIcon: { fontSize:64 },
  successTitle: { fontSize:26, fontWeight:800, color:'#7B1C1C' },
  successSub: { fontSize:15, color:'#8a6a6a' },
};
