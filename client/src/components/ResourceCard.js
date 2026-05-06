import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const catClass = { 'Notes':'badge-notes', 'Assignment':'badge-assignment', 'Question Paper':'badge-question', 'Reference':'badge-reference' };
const catIcon  = { 'Notes':'📝', 'Assignment':'📋', 'Question Paper':'📄', 'Reference':'📖' };

export default function ResourceCard({ resource, onDelete }) {
  const { user, token } = useAuth();
  const navigate = useNavigate();
  const [comments, setComments]         = useState(resource.comments || []);
  const [commentText, setCommentText]   = useState('');
  const [showComments, setShowComments] = useState(false);
  const [userRating, setUserRating]     = useState(0);
  const [hover, setHover]               = useState(0);
  const [downloads, setDownloads]       = useState(resource.downloads || 0);
  const [bookmarked, setBookmarked] = useState(() => {
    const saved = JSON.parse(localStorage.getItem('srsp_bookmarks') || '[]');
    return saved.includes(resource._id);
  });

  const handleBookmark = () => {
    const saved = JSON.parse(localStorage.getItem('srsp_bookmarks') || '[]');
    const updated = bookmarked ? saved.filter(i => i !== resource._id) : [...saved, resource._id];
    localStorage.setItem('srsp_bookmarks', JSON.stringify(updated));
    setBookmarked(!bookmarked);
  };

  const [showPreview, setShowPreview] = useState(false);

  const allRatings = [...(resource.ratings || []), ...(userRating ? [{ value: userRating }] : [])];
  const avg = allRatings.length ? (allRatings.reduce((s, r) => s + r.value, 0) / allRatings.length).toFixed(1) : null;

  const handleDownload = () => {
    const a = document.createElement('a');
    a.href = `http://localhost:5000/api/resources/${resource._id}/download`;
    a.download = resource.originalName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setDownloads(d => d + 1);
  };

  const handleRating = async (value) => {
    if (!user) return alert('Please login to rate');
    setUserRating(value);
    try {
      await axios.post(`/api/resources/${resource._id}/rate`, { value }, { headers: { Authorization: `Bearer ${token}` } });
    } catch { }
  };

  const handleToggleComments = async () => {
    if (!showComments) {
      try {
        const res = await axios.get(`/api/resources/${resource._id}/comments`);
        setComments(res.data);
      } catch { }
    }
    setShowComments(v => !v);
  };

  const handleComment = async (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    try {
      const res = await axios.post(
        `/api/resources/${resource._id}/comment`,
        { text: commentText },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setComments(res.data);
      setCommentText('');
    } catch {
      setComments(p => [...p, { name: user.name, text: commentText }]);
      setCommentText('');
    }
  };

  return (
    <div style={s.card}>
      <div style={s.top}>
        <span className={`badge ${catClass[resource.category]}`}>
          {catIcon[resource.category]} {resource.category}
        </span>
        {onDelete && (
          <button className="btn btn-danger btn-sm" onClick={() => onDelete(resource._id)}>🗑</button>
        )}
      </div>

      <h3 style={s.title} onClick={() => navigate(`/resource/${resource._id}`)}>{resource.title}</h3>
      <p style={s.meta}>📚 {resource.subject} &nbsp;·&nbsp; 🏛 {resource.department}</p>
      {resource.description && <p style={s.desc}>{resource.description}</p>}

      <div style={s.chips}>
        <span style={s.chip}>👤 {resource.uploadedBy?.name}</span>
        <span style={s.chip}>⬇ {downloads}</span>
        <span style={s.chip}>👁 {resource.views || 0} views</span>
        {resource.semester && <span style={s.chip}>📅 {resource.semester}</span>}
        <span style={s.chip}>🗓 {new Date(resource.createdAt).toLocaleDateString('en-IN', { day:'numeric', month:'short', year:'numeric' })}</span>
      </div>

      <div style={s.ratingRow}>
        {[1,2,3,4,5].map(star => (
          <span
            key={star}
            onClick={() => handleRating(star)}
            onMouseEnter={() => setHover(star)}
            onMouseLeave={() => setHover(0)}
            style={{ fontSize:20, cursor:'pointer', color: star <= (hover || userRating || Math.round(parseFloat(avg || 0))) ? '#C9A84C' : '#e8d5c4', transition:'color 0.1s' }}
          >★</span>
        ))}
        {avg && <span style={s.avgText}>{avg}/5 ({allRatings.length})</span>}
      </div>

      <div style={s.actions}>
        <button className="btn btn-primary btn-sm" onClick={handleDownload}>⬇ Download</button>
        <button className="btn btn-outline btn-sm" onClick={() => navigate(`/resource/${resource._id}`)}>👁 Preview</button>
        <button className="btn btn-outline btn-sm" onClick={handleBookmark}
          style={{ color: bookmarked ? '#C9A84C' : '#7B1C1C', borderColor: bookmarked ? '#C9A84C' : '#7B1C1C' }}>
          {bookmarked ? '🔖 Saved' : '🔖 Save'}
        </button>
        <button className="btn btn-outline btn-sm" onClick={handleToggleComments}>
          💬 {comments.length}
        </button>
      </div>

      {/* Preview Modal */}
      {showPreview && (
        <div style={s.overlay} onClick={() => setShowPreview(false)}>
          <div style={s.modal} onClick={e => e.stopPropagation()}>
            <div style={s.modalHeader}>
              <span style={s.modalTitle}>📄 {resource.title}</span>
              <button className="btn btn-ghost btn-sm" onClick={() => setShowPreview(false)} style={{ color:'#C9A84C' }}>✕ Close</button>
            </div>
            {(() => {
              const name = resource.originalName?.toLowerCase() || '';
              const previewUrl = `http://localhost:5000/api/resources/${resource._id}/preview`;
              const googleUrl = `https://docs.google.com/viewer?url=${encodeURIComponent(`http://localhost:5000/api/resources/${resource._id}/preview`)}&embedded=true`;
              if (name.endsWith('.pdf') || name.endsWith('.png') || name.endsWith('.jpg') || name.endsWith('.jpeg') || name.endsWith('.gif') || name.endsWith('.txt')) {
                return <iframe src={previewUrl} style={s.iframe} title={resource.title} />;
              } else if (name.endsWith('.doc') || name.endsWith('.docx') || name.endsWith('.ppt') || name.endsWith('.pptx') || name.endsWith('.xls') || name.endsWith('.xlsx')) {
                return <iframe src={googleUrl} style={s.iframe} title={resource.title} />;
              } else {
                return (
                  <div style={s.noPreview}>
                    <span style={{ fontSize:48 }}>📄</span>
                    <p style={{ fontWeight:600, color:'#2c1a1a' }}>{resource.originalName}</p>
                    <p style={{ fontSize:13, color:'#8a6a6a', marginBottom:16 }}>Preview not available for this file type.</p>
                    <button className="btn btn-primary" onClick={handleDownload}>⬇ Download to View</button>
                  </div>
                );
              }
            })()}
          </div>
        </div>
      )}

      {showComments && (
        <div style={s.commentBox}>
          {comments.length === 0 && <p style={s.noComment}>No comments yet.</p>}
          {comments.map((c, i) => (
            <div key={i} style={s.comment}>
              <div style={s.cAvatar}>{c.name?.[0]}</div>
              <div>
                <span style={s.cName}>{c.name}</span>
                <p style={s.cText}>{c.text}</p>
              </div>
            </div>
          ))}
          {user ? (
            <form onSubmit={handleComment} style={s.cForm}>
              <input value={commentText} onChange={e => setCommentText(e.target.value)} placeholder="Add a comment..." style={{ flex:1 }} />
              <button className="btn btn-primary btn-sm" type="submit">Post</button>
            </form>
          ) : (
            <p style={s.noComment}>Login to comment.</p>
          )}
        </div>
      )}
    </div>
  );
}

const s = {
  card: { background:'#fff', borderRadius:14, padding:20, border:'1px solid #e8d5c4', boxShadow:'0 2px 8px rgba(123,28,28,0.06)', display:'flex', flexDirection:'column', gap:11 },
  top: { display:'flex', justifyContent:'space-between', alignItems:'center' },
  title: { fontSize:15, fontWeight:700, color:'#7B1C1C', lineHeight:1.4, cursor:'pointer', textDecoration:'underline dotted' },
  meta: { fontSize:13, color:'#8a6a6a' },
  desc: { fontSize:13, color:'#5c3d3d', lineHeight:1.6 },
  chips: { display:'flex', flexWrap:'wrap', gap:7 },
  chip: { fontSize:12, background:'#FDF6EC', border:'1px solid #e8d5c4', borderRadius:20, padding:'3px 10px', color:'#8a6a6a' },
  ratingRow: { display:'flex', alignItems:'center', gap:3 },
  avgText: { fontSize:13, color:'#8a6a6a', marginLeft:8 },
  actions: { display:'flex', gap:10, flexWrap:'wrap' },
  overlay: { position:'fixed', top:0, left:0, right:0, bottom:0, background:'rgba(0,0,0,0.7)', zIndex:1000, display:'flex', alignItems:'center', justifyContent:'center', padding:20 },
  modal: { background:'#fff', borderRadius:16, width:'100%', maxWidth:860, height:'85vh', display:'flex', flexDirection:'column', overflow:'hidden', boxShadow:'0 20px 60px rgba(0,0,0,0.3)' },
  modalHeader: { display:'flex', justifyContent:'space-between', alignItems:'center', padding:'14px 20px', borderBottom:'1px solid #e8d5c4', background:'#7B1C1C' },
  modalTitle: { fontSize:14, fontWeight:700, color:'#C9A84C', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', maxWidth:'80%' },
  iframe: { flex:1, border:'none', width:'100%' },
  noPreview: { flex:1, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:10, padding:40 },
  commentBox: { borderTop:'1px solid #f5ead6', paddingTop:12, display:'flex', flexDirection:'column', gap:10 },
  noComment: { fontSize:13, color:'#8a6a6a', textAlign:'center' },
  comment: { display:'flex', gap:10 },
  cAvatar: { width:28, height:28, borderRadius:'50%', background:'#7B1C1C', color:'#C9A84C', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:700, fontSize:12, flexShrink:0 },
  cName: { fontSize:13, fontWeight:600, color:'#2c1a1a' },
  cText: { fontSize:13, color:'#5c3d3d', marginTop:2 },
  cForm: { display:'flex', gap:8 },
};
