import React, { useEffect, useState } from 'react';
import { db } from '../firebase';
import { collection, addDoc, query, orderBy, onSnapshot, updateDoc, doc, where } from 'firebase/firestore';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '../firebase';

const CATEGORIES = [
  { key: 'user', label: 'User Images' },
  { key: 'old', label: 'Old Photos' },
  { key: 'new', label: 'New Photos' },
  { key: 'drone', label: 'Drone/Panoramic' }
];

export default function Gallery() {
  const [user] = useAuthState(auth);
  const [images, setImages] = useState([]);
  const [category, setCategory] = useState(CATEGORIES[0].key);
  const [url, setUrl] = useState('');
  const [caption, setCaption] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);
  const [filter, setFilter] = useState(CATEGORIES[0].key);

  useEffect(() => {
    if (!user) return;
    db.collection('users').doc(user.uid).get().then(docSnap => {
      if (docSnap.exists) {
        setIsAdmin(docSnap.data().role === 'admin');
      }
    });
  }, [user]);

  useEffect(() => {
    setLoading(true);
    const q = query(
      collection(db, 'gallery'),
      where('category', '==', filter),
      orderBy('createdAt', 'desc')
    );
    const unsub = onSnapshot(q, (snapshot) => {
      setImages(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setLoading(false);
    });
    return () => unsub();
  }, [filter]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (!url || !caption) {
      setError('Image URL and caption are required.');
      return;
    }
    try {
      await addDoc(collection(db, 'gallery'), {
        url,
        caption,
        category,
        createdAt: new Date(),
        uploader: user.email,
        approved: false
      });
      setUrl('');
      setCaption('');
      setCategory(CATEGORIES[0].key);
      setSuccess('Image submitted for approval!');
    } catch (err) {
      setError('Failed to submit image.');
    }
  };

  const handleApprove = async (id) => {
    await updateDoc(doc(db, 'gallery', id), { approved: true });
  };

  return (
    <div style={{padding:'2rem'}}>
      <h2>Gallery & Memories</h2>
      <form onSubmit={handleSubmit} style={{marginBottom:'2rem',background:'#f5f5f5',padding:'1rem',borderRadius:'8px',maxWidth:500}}>
        <h3>Submit Image</h3>
        <select value={category} onChange={e => setCategory(e.target.value)} style={{width:'100%',padding:'0.5rem',marginBottom:'0.5rem'}}>
          {CATEGORIES.map(cat => <option key={cat.key} value={cat.key}>{cat.label}</option>)}
        </select>
        <input
          type="text"
          placeholder="Image URL"
          value={url}
          onChange={e => setUrl(e.target.value)}
          style={{width:'100%',padding:'0.5rem',marginBottom:'0.5rem',border:'1px solid #ccc',borderRadius:'4px'}}
        />
        <input
          type="text"
          placeholder="Caption"
          value={caption}
          onChange={e => setCaption(e.target.value)}
          style={{width:'100%',padding:'0.5rem',marginBottom:'0.5rem',border:'1px solid #ccc',borderRadius:'4px'}}
        />
        {error && <div style={{color:'red',marginBottom:'0.5rem'}}>{error}</div>}
        {success && <div style={{color:'green',marginBottom:'0.5rem'}}>{success}</div>}
        <button type="submit" style={{background:'#039be5',color:'#fff',border:'none',borderRadius:'4px',padding:'0.5rem 1rem'}}>Submit</button>
      </form>
      <div style={{marginBottom:'1rem'}}>
        <b>Filter by category: </b>
        {CATEGORIES.map(cat => (
          <button
            key={cat.key}
            onClick={() => setFilter(cat.key)}
            style={{marginRight:'0.5rem',background:filter===cat.key?'#039be5':'#eee',color:filter===cat.key?'#fff':'#333',border:'none',borderRadius:'4px',padding:'0.3rem 0.8rem'}}
          >
            {cat.label}
          </button>
        ))}
      </div>
      {loading ? <p>Loading images...</p> : (
        <div style={{display:'flex',flexWrap:'wrap',gap:'1rem'}}>
          {images.length === 0 && <p>No images in this category yet.</p>}
          {images.filter(img => img.approved || isAdmin).map(item => (
            <div key={item.id} style={{background:'#fff',padding:'1rem',borderRadius:'8px',boxShadow:'0 1px 4px rgba(0,0,0,0.05)',width:300}}>
              <img src={item.url} alt={item.caption} style={{width:'100%',maxHeight:180,objectFit:'cover',borderRadius:'6px',marginBottom:'0.5rem'}} />
              <div style={{fontWeight:'bold',marginBottom:'0.3rem'}}>{item.caption}</div>
              <div style={{fontSize:'0.9rem',color:'#888'}}>By {item.uploader} on {item.createdAt && item.createdAt.toDate && new Date(item.createdAt.seconds*1000).toLocaleString()}</div>
              <div style={{fontSize:'0.9rem',color:item.approved?'green':'orange'}}>
                {item.approved ? 'Approved' : 'Pending approval'}
              </div>
              {isAdmin && !item.approved && (
                <button onClick={() => handleApprove(item.id)} style={{marginTop:'0.5rem',background:'#039be5',color:'#fff',border:'none',borderRadius:'4px',padding:'0.3rem 1rem'}}>Approve</button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
} 