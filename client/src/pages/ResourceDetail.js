import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

export default function ResourceDetail() {
  const { id } = useParams();
  const { user, token } = useAuth();
  const navigate = useNavigate();
  const [resource, setResource] = useState(null);
  const [allResources, setAllResources] = useState([]);
  const [comments, setComments] = useState([]);
  const [commentText, setCommentText] = useState('');
  const [userRating, setUserRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('preview');
  const [copied, setCopied] = useState(false); // eslint-disable-line
  const [bookmarked, setBookmarked] = useState(false);

  useEffect(() => {
    axios.get('/api/resources').then(res => {
      const found = res.data.find(r => r._id === id);
      if (found) { setResource(found); setComments(found.comments || []); }
      setAllResources(res.data);
      setLoading(false);
    }).catch(() => setLoading(false));

    // Check bookmark
    const saved = JSON.parse(localStorage.getItem('srsp_bookmarks') || '[]');
    setBookmarked(saved.includes(id));
  }, [id]);

  const related = allResources.filter(r =>
    r._id !== id && (r.subject === resource?.subject || r.department === resource?.department)
  ).slice(0, 3);

  const handleComment = async (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    try {
      const res = await axios.post(`/api/resources/${id}/comment`, { text: commentText }, { headers: { Authorization: `Bearer ${token}` } });
      setComments(res.data);
      setCommentText('');
    } catch { }
  };

  const handleRating = async (value) => {
    if (!user) return alert('Please login to rate');
    setUserRating(value);
    try {
      await axios.post(`/api/resources/${id}/rate`, { value }, { headers: { Authorization: `Bearer ${token}` } });
    } catch { }
  };

  const handleDownload = () => {
    const a = document.createElement('a');
    a.href = `http://localhost:5000/api/resources/${id}/download`;
    a.download = resource.originalName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleBookmark = () => {
    const saved = JSON.parse(localStorage.getItem('srsp_bookmarks') || '[]');
    const updated = bookmarked ? saved.filter(i => i !== id) : [...saved, id];
    localStorage.setItem('srsp_bookmarks', JSON.stringify(updated));
    setBookmarked(!bookmarked);
  };

  if (loading) return <div style={s.center}>Loading...</div>;
  if (!resource) return <div style={s.center}>Resource not found. <button className="btn btn-outline btn-sm" onClick={() => navigate('/')}>Go Back</button></div>;

  const ext = resource.originalName?.toLowerCase().split('.').pop();
  const previewUrl = `http://localhost:5000/api/resources/${id}/preview`;
  const googleUrl = `https://docs.google.com/viewer?url=${encodeURIComponent(previewUrl)}&embedded=true`;
  const isPdf = ext === 'pdf';
  const isImage = ['png','jpg','jpeg','gif'].includes(ext);
  const isOffice = ['doc','docx','ppt','pptx','xls','xlsx'].includes(ext);
  const isTxt = ext === 'txt';

  const allRatings = [...(resource.ratings || []), ...(userRating ? [{ value: userRating }] : [])];
  const avg = allRatings.length ? (allRatings.reduce((s, r) => s + r.value, 0) / allRatings.length).toFixed(1) : null;

  const catColors = { 'Notes':'#dbeafe', 'Assignment':'#fef9c3', 'Question Paper':'#fce7f3', 'Reference':'#dcfce7' };
  const catText   = { 'Notes':'#1e40af', 'Assignment':'#92400e', 'Question Paper':'#9d174d', 'Reference':'#166534' };

  return (
    <div style={s.page}>
      {/* Top bar */}
      <div style={s.topBar}>
        <button className="btn btn-ghost btn-sm" onClick={() => navigate('/')} style={{ color:'#fff' }}>← Back</button>
        <div style={s.topTitle}>{resource.title}</div>
        <div style={{ display:'flex', gap:8 }}>
          <button onClick={handleBookmark} style={{ ...s.iconBtn, color: bookmarked ? '#C9A84C' : 'rgba(255,255,255,0.7)' }}>
            {bookmarked ? '🔖 Saved' : '🔖 Save'}
          </button>
          <button className="btn btn-gold btn-sm" onClick={handleDownload}>⬇ Download</button>
        </div>
      </div>

      <div style={s.layout}>
        {/* LEFT — Reader */}
        <div style={s.reader}>
          <div style={s.tabs}>
            {['preview', 'info'].map(tab => (
              <button key={tab} onClick={() => setActiveTab(tab)}
                style={{ ...s.tab, ...(activeTab === tab ? s.tabActive : {}) }}>
                {tab === 'preview' ? '👁 Preview' : 'ℹ Info'}
              </button>
            ))}
          </div>

          {activeTab === 'preview' && (
            <div style={s.previewBox}>
              {isPdf && <iframe src={previewUrl} style={s.iframe} title={resource.title} />}
              {isImage && <img src={previewUrl} alt={resource.title} style={{ maxWidth:'100%', borderRadius:8 }} />}
              {isOffice && <iframe src={googleUrl} style={s.iframe} title={resource.title} />}
              {isTxt && <iframe src={previewUrl} style={s.iframe} title={resource.title} />}
              {!isPdf && !isImage && !isOffice && !isTxt && (
                <div style={s.noPreview}>
                  <span style={{ fontSize:56 }}>📄</span>
                  <p style={{ fontWeight:700, fontSize:16 }}>{resource.originalName}</p>
                  <p style={{ color:'#8a6a6a', fontSize:14 }}>This file type cannot be previewed in the browser.</p>
                  <button className="btn btn-primary" onClick={handleDownload} style={{ marginTop:12 }}>⬇ Download to View</button>
                </div>
              )}
            </div>
          )}

          {activeTab === 'info' && (
            <div style={s.infoBox}>
              <div style={s.infoGrid}>
                {[
                  ['📚 Subject', resource.subject],
                  ['🏛 Department', resource.department],
                  ['📂 Category', resource.category],
                  ['👤 Uploaded By', resource.uploadedBy?.name],
                  ['⬇ Downloads', resource.downloads],
                  ['🗓 Uploaded On', new Date(resource.createdAt).toLocaleDateString('en-IN', { day:'numeric', month:'long', year:'numeric' })],
                  ['📄 File Name', resource.originalName],
                ].map(([label, value]) => (
                  <div key={label} style={s.infoRow}>
                    <span style={s.infoLabel}>{label}</span>
                    <span style={s.infoValue}>{value}</span>
                  </div>
                ))}
              </div>
              {resource.description && (
                <div style={s.descBox}>
                  <p style={s.infoLabel}>📝 Description</p>
                  <p style={{ fontSize:14, color:'#2c1a1a', lineHeight:1.7, marginTop:6 }}>{resource.description}</p>
                </div>
              )}
              <button className="btn btn-primary" onClick={handleDownload} style={{ marginTop:20, width:'100%', justifyContent:'center' }}>
                ⬇ Download File
              </button>

              {/* Related Resources */}
              {related.length > 0 && (
                <div style={s.relatedBox}>
                  <h4 style={s.relatedTitle}>📎 Related Resources</h4>
                  {related.map(r => (
                    <div key={r._id} onClick={() => navigate(`/resource/${r._id}`)} style={s.relatedItem}>
                      <div style={s.relatedDot} />
                      <div>
                        <p style={s.relatedName}>{r.title}</p>
                        <p style={s.relatedMeta}>{r.subject} · {r.category}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* RIGHT — Sidebar */}
        <div style={s.sidebar}>
          <div style={s.sideCard}>
            <span style={{ ...s.catBadge, background: catColors[resource.category], color: catText[resource.category] }}>
              {resource.category}
            </span>
            <h2 style={s.sideTitle}>{resource.title}</h2>
            <p style={s.sideMeta}>by {resource.uploadedBy?.name} · {resource.department}</p>

            <div style={s.ratingRow}>
              {[1,2,3,4,5].map(star => (
                <span key={star} onClick={() => handleRating(star)} onMouseEnter={() => setHover(star)} onMouseLeave={() => setHover(0)}
                  style={{ fontSize:22, cursor:'pointer', color: star <= (hover || userRating || Math.round(parseFloat(avg||0))) ? '#C9A84C' : '#e8d5c4', transition:'color 0.1s' }}>★</span>
              ))}
              {avg && <span style={{ fontSize:13, color:'#8a6a6a', marginLeft:6 }}>{avg}/5 ({allRatings.length})</span>}
            </div>
            {!user && <p style={{ fontSize:12, color:'#8a6a6a' }}>Login to rate this resource</p>}

            <div style={{ display:'flex', gap:8, marginTop:12 }}>
              <button onClick={handleBookmark} className="btn btn-outline btn-sm" style={{ flex:1, justifyContent:'center', color: bookmarked ? '#C9A84C' : '#7B1C1C', borderColor: bookmarked ? '#C9A84C' : '#7B1C1C' }}>
                {bookmarked ? '🔖 Saved' : '🔖 Save'}
              </button>
            </div>
          </div>

          {/* Comments */}
          <div style={s.sideCard}>
            <h3 style={s.commentsTitle}>💬 Discussion ({comments.length})</h3>
            <div style={s.commentsList}>
              {comments.length === 0 && <p style={s.noComment}>No comments yet. Start the discussion!</p>}
              {comments.map((c, i) => (
                <div key={i} style={s.comment}>
                  <div style={s.cAvatar}>{c.name?.[0]}</div>
                  <div style={{ flex:1 }}>
                    <span style={s.cName}>{c.name}</span>
                    <p style={s.cText}>{c.text}</p>
                  </div>
                </div>
              ))}
            </div>
            {user ? (
              <form onSubmit={handleComment} style={s.cForm}>
                <textarea value={commentText} onChange={e => setCommentText(e.target.value)}
                  placeholder="Share your thoughts..." rows={3} style={{ resize:'none' }} />
                <button className="btn btn-primary btn-sm" type="submit" style={{ alignSelf:'flex-end' }}>Post Comment</button>
              </form>
            ) : (
              <p style={s.noComment}>Please <span style={{ color:'#7B1C1C', fontWeight:700, cursor:'pointer' }} onClick={() => navigate('/login')}>login</span> to comment.</p>
            )}
          </div>

          {/* Related in sidebar */}
          {related.length > 0 && (
            <div style={s.sideCard}>
              <h3 style={s.commentsTitle}>📎 Related Resources</h3>
              {related.map(r => (
                <div key={r._id} onClick={() => navigate(`/resource/${r._id}`)} style={s.relatedItem}>
                  <div style={s.relatedDot} />
                  <div>
                    <p style={s.relatedName}>{r.title}</p>
                    <p style={s.relatedMeta}>{r.subject} · {r.category} · ⬇ {r.downloads}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

const s = {
  page: { minHeight:'100vh', background:'#FDF6EC' },
  center: { textAlign:'center', padding:60, color:'#8a6a6a' },
  topBar: { background:'#7B1C1C', padding:'12px 28px', display:'flex', alignItems:'center', justifyContent:'space-between', gap:16, position:'sticky', top:68, zIndex:90 },
  topTitle: { fontSize:15, fontWeight:700, color:'#fff', flex:1, textAlign:'center', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' },
  iconBtn: { background:'transparent', border:'1px solid rgba(255,255,255,0.3)', borderRadius:8, padding:'6px 12px', cursor:'pointer', fontSize:13, color:'rgba(255,255,255,0.85)', fontWeight:600 },
  layout: { display:'grid', gridTemplateColumns:'1fr 340px', gap:0, height:'calc(100vh - 132px)' },
  reader: { display:'flex', flexDirection:'column', borderRight:'1px solid #e8d5c4', overflow:'hidden' },
  tabs: { display:'flex', borderBottom:'1px solid #e8d5c4', background:'#fff' },
  tab: { padding:'12px 24px', border:'none', background:'transparent', cursor:'pointer', fontSize:14, fontWeight:500, color:'#8a6a6a', borderBottom:'3px solid transparent' },
  tabActive: { color:'#7B1C1C', borderBottom:'3px solid #7B1C1C', fontWeight:700 },
  previewBox: { flex:1, overflow:'hidden', background:'#f5ead6' },
  iframe: { width:'100%', height:'100%', border:'none' },
  noPreview: { display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', height:'100%', gap:10, color:'#2c1a1a' },
  infoBox: { padding:24, overflowY:'auto', flex:1 },
  infoGrid: { display:'flex', flexDirection:'column', gap:14 },
  infoRow: { display:'flex', justifyContent:'space-between', alignItems:'center', padding:'10px 0', borderBottom:'1px solid #f5ead6' },
  infoLabel: { fontSize:13, fontWeight:600, color:'#8a6a6a' },
  infoValue: { fontSize:13, color:'#2c1a1a', fontWeight:500, textAlign:'right', maxWidth:'60%' },
  descBox: { marginTop:20, background:'#fdf9ee', borderRadius:10, padding:16, border:'1px solid #e8d5c4' },
  relatedBox: { marginTop:24 },
  relatedTitle: { fontSize:14, fontWeight:700, color:'#7B1C1C', marginBottom:12 },
  relatedItem: { display:'flex', alignItems:'flex-start', gap:10, padding:'10px 0', borderBottom:'1px solid #f5ead6', cursor:'pointer' },
  relatedDot: { width:8, height:8, borderRadius:'50%', background:'#C9A84C', marginTop:5, flexShrink:0 },
  relatedName: { fontSize:13, fontWeight:600, color:'#2c1a1a' },
  relatedMeta: { fontSize:12, color:'#8a6a6a', marginTop:2 },
  sidebar: { overflowY:'auto', display:'flex', flexDirection:'column', gap:0 },
  sideCard: { padding:20, borderBottom:'1px solid #e8d5c4', background:'#fff' },
  catBadge: { display:'inline-block', padding:'3px 12px', borderRadius:20, fontSize:12, fontWeight:700, marginBottom:10 },
  sideTitle: { fontSize:16, fontWeight:800, color:'#2c1a1a', lineHeight:1.4, marginBottom:6 },
  sideMeta: { fontSize:13, color:'#8a6a6a', marginBottom:12 },
  ratingRow: { display:'flex', alignItems:'center', gap:2, marginBottom:6 },
  commentsTitle: { fontSize:15, fontWeight:700, color:'#7B1C1C', marginBottom:14 },
  commentsList: { display:'flex', flexDirection:'column', gap:12, maxHeight:260, overflowY:'auto', marginBottom:14 },
  noComment: { fontSize:13, color:'#8a6a6a', textAlign:'center', padding:'10px 0' },
  comment: { display:'flex', gap:10, alignItems:'flex-start' },
  cAvatar: { width:30, height:30, borderRadius:'50%', background:'#7B1C1C', color:'#C9A84C', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:700, fontSize:12, flexShrink:0 },
  cName: { fontSize:13, fontWeight:700, color:'#2c1a1a', display:'block', marginBottom:2 },
  cText: { fontSize:13, color:'#5c3d3d', lineHeight:1.5 },
  cForm: { display:'flex', flexDirection:'column', gap:8 },
};
