import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const handleLogout = () => { logout(); navigate('/login'); };

  const isActive = (path) => pathname === path;

  return (
    <nav style={s.nav}>
      <Link to="/" style={s.brand}>
        <span style={s.crest}>🎓</span>
        <div>
          <div style={s.brandName}>EduShare</div>
          <div style={s.brandSub}>College Resource Portal</div>
        </div>
      </Link>

      <div style={s.links}>
        {[['/', 'Browse'], ['/requests', '📋 Requests'], ...(user ? [['/upload', 'Upload'], ['/my-resources', 'My Files'], ['/bookmarks', '🔖 Saved'], ['/profile', '👤 Profile']] : [])].map(([path, label]) => (
          <Link key={path} to={path} style={{ ...s.link, ...(isActive(path) ? s.linkActive : {}) }}>
            {label}
            {isActive(path) && <span style={s.activeDot} />}
          </Link>
        ))}
      </div>

      <div style={s.right}>
        {user ? (
          <>
            <div style={s.userInfo}>
              <div style={s.avatar}>{user.name[0].toUpperCase()}</div>
              <div>
                <div style={s.userName}>{user.name}</div>
                <div style={s.userId}>ID: {user.studentId}</div>
              </div>
            </div>
            <button className="btn btn-danger btn-sm" onClick={handleLogout} style={{ fontWeight: 600 }}>🚪 Logout</button>
          </>
        ) : (
          <>
            <Link to="/login"><button className="btn btn-ghost btn-sm">Login</button></Link>
            <Link to="/register"><button className="btn btn-primary btn-sm">Register</button></Link>
          </>
        )}
      </div>
    </nav>
  );
}

const s = {
  nav: { display:'flex', alignItems:'center', justifyContent:'space-between', padding:'0 32px', height:68, background:'#7B1C1C', position:'sticky', top:0, zIndex:100, boxShadow:'0 2px 12px rgba(0,0,0,0.2)' },
  brand: { display:'flex', alignItems:'center', gap:10 },
  crest: { fontSize:28 },
  brandName: { fontSize:17, fontWeight:800, color:'#C9A84C', letterSpacing:0.5 },
  brandSub: { fontSize:10, color:'rgba(255,255,255,0.6)', letterSpacing:1, textTransform:'uppercase' },
  links: { display:'flex', alignItems:'center', gap:4 },
  link: { fontSize:14, fontWeight:500, color:'rgba(255,255,255,0.75)', padding:'8px 14px', borderRadius:8, position:'relative', transition:'all 0.2s' },
  linkActive: { color:'#C9A84C', background:'rgba(201,168,76,0.12)' },
  activeDot: { position:'absolute', bottom:2, left:'50%', transform:'translateX(-50%)', width:4, height:4, borderRadius:'50%', background:'#C9A84C' },
  right: { display:'flex', alignItems:'center', gap:12 },
  userInfo: { display:'flex', alignItems:'center', gap:10 },
  avatar: { width:36, height:36, borderRadius:'50%', background:'#C9A84C', color:'#7B1C1C', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:800, fontSize:15 },
  userName: { fontSize:13, fontWeight:600, color:'#fff' },
  userId: { fontSize:11, color:'rgba(255,255,255,0.55)' },
};
