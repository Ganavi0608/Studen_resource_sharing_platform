import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const err = await login(form);
    setLoading(false);
    if (err) return setError(err);
    navigate('/');
  };

  return (
    <div style={s.page}>
      <div style={s.left}>
        <div style={s.shield}>🎓</div>
        <h1 style={s.collegeName}>EduShare Portal</h1>
        <p style={s.tagline}>Your College Academic Resource Hub</p>
        <div style={s.dividerLine} />
        <div style={s.featureList}>
          {[['📝','Notes & Study Material'],['📄','Previous Year Papers'],['📋','Assignments & Solutions'],['📖','Reference Books'],['⭐','Rate & Review Resources'],['💬','Discuss with Peers']].map(([icon, text]) => (
            <div key={text} style={s.feature}>
              <span style={s.featureIcon}>{icon}</span>
              <span style={s.featureText}>{text}</span>
            </div>
          ))}
        </div>
      </div>

      <div style={s.right}>
        <div style={s.formWrap}>
          <h2 style={s.formTitle}>Student Login</h2>
          <p style={s.formSub}>Access your college resource portal</p>

          <form onSubmit={handleSubmit} style={s.form}>
            <div>
              <label style={s.label}>College Email</label>
              <input type="email" placeholder="yourname@college.edu" value={form.email} onChange={e => setForm({...form, email: e.target.value})} required />
            </div>
            <div>
              <label style={s.label}>Password</label>
              <input type="password" placeholder="Enter your password" value={form.password} onChange={e => setForm({...form, password: e.target.value})} required />
            </div>
            {error && <p className="error">⚠ {error}</p>}
            <button className="btn btn-primary" type="submit" disabled={loading} style={s.submitBtn}>
              {loading ? 'Logging in...' : 'Login to Portal →'}
            </button>
          </form>

          <p style={s.footer}>New student? <Link to="/register" style={s.link}>Create your account</Link></p>
          <div style={s.notice}>🔒 Only registered college students can access this portal</div>
        </div>
      </div>
    </div>
  );
}

const s = {
  page: { display:'flex', minHeight:'calc(100vh - 68px)' },
  left: { width:420, background:'#7B1C1C', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', padding:'48px 40px', flexShrink:0 },
  shield: { fontSize:64, marginBottom:12 },
  collegeName: { fontSize:26, fontWeight:800, color:'#C9A84C', textAlign:'center', marginBottom:6 },
  tagline: { fontSize:13, color:'rgba(255,255,255,0.65)', textAlign:'center', marginBottom:24, letterSpacing:0.5 },
  dividerLine: { width:60, height:2, background:'#C9A84C', borderRadius:2, marginBottom:28, opacity:0.6 },
  featureList: { display:'flex', flexDirection:'column', gap:14, width:'100%' },
  feature: { display:'flex', alignItems:'center', gap:12 },
  featureIcon: { fontSize:18, width:32, textAlign:'center' },
  featureText: { fontSize:14, color:'rgba(255,255,255,0.8)', fontWeight:500 },
  right: { flex:1, background:'#FDF6EC', display:'flex', alignItems:'center', justifyContent:'center', padding:40 },
  formWrap: { width:'100%', maxWidth:420 },
  formTitle: { fontSize:26, fontWeight:800, color:'#7B1C1C', marginBottom:4 },
  formSub: { fontSize:14, color:'#8a6a6a', marginBottom:28 },
  form: { display:'flex', flexDirection:'column', gap:18 },
  label: { display:'block', fontSize:13, fontWeight:600, color:'#5c3d3d', marginBottom:6 },
  submitBtn: { width:'100%', justifyContent:'center', height:46, marginTop:4, fontSize:15 },
  footer: { textAlign:'center', marginTop:22, fontSize:14, color:'#8a6a6a' },
  link: { color:'#7B1C1C', fontWeight:700 },
  notice: { marginTop:20, background:'#fdf3d7', border:'1px solid #e8c96a', borderRadius:8, padding:'10px 14px', fontSize:12, color:'#92400e', textAlign:'center' },
};
