import React, { useEffect, useState } from 'react';
import { db } from '../firebase';
import { collection, addDoc, query, orderBy, onSnapshot, updateDoc, doc, where } from 'firebase/firestore';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '../firebase';

const CATEGORIES = [
  { key: 'classifieds', label: 'Classifieds (Buy/Sell/Rent)' },
  { key: 'matrimonials', label: 'Matrimonials' },
  { key: 'lostfound', label: 'Lost & Found' }
];

export default function BulletinBoard() {
  const [user] = useAuthState(auth);
  const [posts, setPosts] = useState([]);
  const [category, setCategory] = useState(CATEGORIES[0].key);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
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
      collection(db, 'bulletin'),
      where('category', '==', filter),
      orderBy('createdAt', 'desc')
    );
    const unsub = onSnapshot(q, (snapshot) => {
      setPosts(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setLoading(false);
    });
    return () => unsub();
  }, [filter]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (!title || !content) {
      setError('Title and content are required.');
      return;
    }
    try {
      await addDoc(collection(db, 'bulletin'), {
        title,
        content,
        category,
        createdAt: new Date(),
        author: user.email,
        approved: false
      });
      setTitle('');
      setContent('');
      setCategory(CATEGORIES[0].key);
      setSuccess('Post submitted for approval!');
    } catch (err) {
      setError('Failed to submit post.');
    }
  };

  const handleApprove = async (id) => {
    await updateDoc(doc(db, 'bulletin', id), { approved: true });
  };

  return (
    <div style={{padding:'2rem'}}>
      <h2>Community Bulletin Board</h2>
      <form onSubmit={handleSubmit} style={{marginBottom:'2rem',background:'#f5f5f5',padding:'1rem',borderRadius:'8px',maxWidth:500}}>
        <h3>Post to Bulletin Board</h3>
        <select value={category} onChange={e => setCategory(e.target.value)} style={{width:'100%',padding:'0.5rem',marginBottom:'0.5rem'}}>
          {CATEGORIES.map(cat => <option key={cat.key} value={cat.key}>{cat.label}</option>)}
        </select>
        <input
          type="text"
          placeholder="Title"
          value={title}
          onChange={e => setTitle(e.target.value)}
          style={{width:'100%',padding:'0.5rem',marginBottom:'0.5rem',border:'1px solid #ccc',borderRadius:'4px'}}
        />
        <textarea
          placeholder="Content"
          value={content}
          onChange={e => setContent(e.target.value)}
          style={{width:'100%',padding:'0.5rem',marginBottom:'0.5rem',border:'1px solid #ccc',borderRadius:'4px',minHeight:80}}
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
      {loading ? <p>Loading posts...</p> : (
        <div>
          {posts.length === 0 && <p>No posts in this category yet.</p>}
          {posts.map(item => (
            <div key={item.id} style={{background:'#fff',marginBottom:'1rem',padding:'1rem',borderRadius:'8px',boxShadow:'0 1px 4px rgba(0,0,0,0.05)'}}>
              <h4 style={{margin:'0 0 0.5rem 0'}}>{item.title}</h4>
              <div style={{color:'#444',marginBottom:'0.5rem'}}>{item.content}</div>
              <div style={{fontSize:'0.9rem',color:'#888'}}>By {item.author} on {item.createdAt && item.createdAt.toDate && new Date(item.createdAt.seconds*1000).toLocaleString()}</div>
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