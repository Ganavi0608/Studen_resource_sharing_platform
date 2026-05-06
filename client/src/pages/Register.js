import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { DEPARTMENTS } from '../data';

export default function Register() {
  const [form, setForm] = useState({ name:'', studentId:'', email:'', department:'', year:'', password:'', confirm:'' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!form.name || !form.studentId || !form.email || !form.department || !form.year || !form.password)
      return setError('All fields are required');
    if (!/^[A-Z0-9]{4,12}$/i.test(form.studentId))
      return setError('Student ID must be 4–12 alphanumeric characters');
    if (form.password.length < 6)
      return setError('Password must be at least 6 characters');
    if (form.password !== form.confirm)
      return setError('Passwords do not match');
    setLoading(true);
    const err = await register(form);
    setLoading(false);
    if (err) return setError(err);
    navigate('/');
  };

  return (
    <div style={s.page}>
      <div style={s.left}>
        <div style={s.shield}>🎓</div>
        <h1 style={s.collegeName}>Join EduShare</h1>
        <p style={s.tagline}>Register with your college credentials</p>
        <div style={s.dividerLine} />
        <div style={s.steps}>
          {[['1','Fill in your student details'],['2','Use your college email'],['3','Start sharing & accessing resources']].map(([num, text]) => (
            <div key={num} style={s.step}>
              <div style={s.stepNum}>{num}</div>
              <span style={s.stepText}>{text}</span>
            </div>
          ))}
        </div>
      </div>

      <div style={s.right}>
        <div style={s.formWrap}>
          <h2 style={s.formTitle}>Student Registration</h2>
          <p style={s.formSub}>Create your college portal account</p>

          <form onSubmit={handleSubmit} style={s.form}>
            <div style={s.row}>
              <div style={{ flex:1 }}>
                <label style={s.label}>Full Name</label>
                <input placeholder="As per college records" value={form.name} onChange={set('name')} required />
              </div>
              <div style={{ flex:1 }}>
                <label style={s.label}>Student ID</label>
                <input placeholder="e.g. CS2021045" value={form.studentId} onChange={set('studentId')} required />
              </div>
            </div>
            <div>
              <label style={s.label}>College Email</label>
              <input type="email" placeholder="studentid@college.edu" value={form.email} onChange={set('email')} required />
            </div>
            <div style={s.row}>
              <div style={{ flex:1 }}>
                <label style={s.label}>Department</label>
                <select value={form.department} onChange={set('department')} required>
                  <option value="">Select Department</option>
                  {DEPARTMENTS.map(d => <option key={d}>{d}</option>)}
                </select>
              </div>
              <div style={{ flex:'0 0 130px' }}>
                <label style={s.label}>Year</label>
                <select value={form.year} onChange={set('year')} required>
                  <option value="">Year</option>
                  {['1st Year','2nd Year','3rd Year','4th Year'].map(y => <option key={y}>{y}</option>)}
                </select>
              </div>
            </div>
            <div style={s.row}>
              <div style={{ flex:1 }}>
                <label style={s.label}>Password</label>
                <input type="password" placeholder="Min 6 characters" value={form.password} onChange={set('password')} required />
              </div>
              <div style={{ flex:1 }}>
                <label style={s.label}>Confirm Password</label>
                <input type="password" placeholder="Repeat password" value={form.confirm} onChange={set('confirm')} required />
              </div>
            </div>
            {error && <p className="error">⚠ {error}</p>}
            <button className="btn btn-primary" type="submit" disabled={loading} style={s.submitBtn}>
              {loading ? 'Creating Account...' : 'Create Account →'}
            </button>
          </form>

          <p style={s.footer}>Already registered? <Link to="/login" style={s.link}>Login here</Link></p>
        </div>
      </div>
    </div>
  );
}

const s = {
  page: { display:'flex', minHeight:'calc(100vh - 68px)' },
  left: { width:380, background:'#7B1C1C', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', padding:'48px 36px', flexShrink:0 },
  shield: { fontSize:56, marginBottom:12 },
  collegeName: { fontSize:24, fontWeight:800, color:'#C9A84C', textAlign:'center', marginBottom:6 },
  tagline: { fontSize:13, color:'rgba(255,255,255,0.65)', textAlign:'center', marginBottom:24 },
  dividerLine: { width:60, height:2, background:'#C9A84C', borderRadius:2, marginBottom:28, opacity:0.6 },
  steps: { display:'flex', flexDirection:'column', gap:18, width:'100%' },
  step: { display:'flex', alignItems:'center', gap:14 },
  stepNum: { width:30, height:30, borderRadius:'50%', background:'#C9A84C', color:'#7B1C1C', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:800, fontSize:14, flexShrink:0 },
  stepText: { fontSize:14, color:'rgba(255,255,255,0.85)' },
  right: { flex:1, background:'#FDF6EC', display:'flex', alignItems:'center', justifyContent:'center', padding:40, overflowY:'auto' },
  formWrap: { width:'100%', maxWidth:520 },
  formTitle: { fontSize:24, fontWeight:800, color:'#7B1C1C', marginBottom:4 },
  formSub: { fontSize:14, color:'#8a6a6a', marginBottom:24 },
  form: { display:'flex', flexDirection:'column', gap:16 },
  row: { display:'flex', gap:14 },
  label: { display:'block', fontSize:13, fontWeight:600, color:'#5c3d3d', marginBottom:6 },
  submitBtn: { width:'100%', justifyContent:'center', height:46, marginTop:4, fontSize:15 },
  footer: { textAlign:'center', marginTop:20, fontSize:14, color:'#8a6a6a' },
  link: { color:'#7B1C1C', fontWeight:700 },
};
