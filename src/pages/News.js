import React, { useEffect, useState } from 'react';
import { db } from '../firebase';
import { collection, addDoc, query, orderBy, onSnapshot, doc, updateDoc } from 'firebase/firestore';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '../firebase';

export default function News() {
  const [user] = useAuthState(auth);
  const [news, setNews] = useState([]);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);
  const [editId, setEditId] = useState(null);
  const [editTitle, setEditTitle] = useState('');
  const [editContent, setEditContent] = useState('');
  const [editError, setEditError] = useState('');
  const [editSuccess, setEditSuccess] = useState('');

  useEffect(() => {
    if (!user) return;
    db.collection('users').doc(user.uid).get().then(docSnap => {
      if (docSnap.exists) {
        setIsAdmin(docSnap.data().role === 'admin');
      }
    });
  }, [user]);

  useEffect(() => {
    const q = query(collection(db, 'news'), orderBy('createdAt', 'desc'));
    const unsub = onSnapshot(q, (snapshot) => {
      setNews(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (!title || !content) {
      setError('Title and content are required.');
      return;
    }
    try {
      await addDoc(collection(db, 'news'), {
        title,
        content,
        createdAt: new Date(),
        author: user.email
      });
      setTitle('');
      setContent('');
      setSuccess('News posted!');
    } catch (err) {
      setError('Failed to post news.');
    }
  };

  const startEdit = (item) => {
    setEditId(item.id);
    setEditTitle(item.title);
    setEditContent(item.content);
    setEditError('');
    setEditSuccess('');
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setEditError('');
    setEditSuccess('');
    if (!editTitle || !editContent) {
      setEditError('Title and content are required.');
      return;
    }
    try {
      await updateDoc(doc(db, 'news', editId), {
        title: editTitle,
        content: editContent
      });
      setEditSuccess('News updated!');
      setTimeout(() => setEditId(null), 1000);
    } catch (err) {
      setEditError('Failed to update news.');
    }
  };

  return (
    <div style={{padding:'2rem'}}>
      <h2>News & Announcements</h2>
      {isAdmin && (
        <form onSubmit={handleSubmit} style={{marginBottom:'2rem',background:'#f5f5f5',padding:'1rem',borderRadius:'8px',maxWidth:500}}>
          <h3>Post News</h3>
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
          <button type="submit" style={{background:'#039be5',color:'#fff',border:'none',borderRadius:'4px',padding:'0.5rem 1rem'}}>Post</button>
        </form>
      )}
      {loading ? <p>Loading news...</p> : (
        <div>
          {news.length === 0 && <p>No news or announcements yet.</p>}
          {news.map(item => (
            <div key={item.id} style={{background:'#fff',marginBottom:'1rem',padding:'1rem',borderRadius:'8px',boxShadow:'0 1px 4px rgba(0,0,0,0.05)'}}>
              {isAdmin && editId === item.id ? (
                <form onSubmit={handleEditSubmit} style={{marginBottom:'1rem'}}>
                  <input
                    type="text"
                    value={editTitle}
                    onChange={e => setEditTitle(e.target.value)}
                    style={{width:'100%',padding:'0.5rem',marginBottom:'0.5rem',border:'1px solid #ccc',borderRadius:'4px'}}
                  />
                  <textarea
                    value={editContent}
                    onChange={e => setEditContent(e.target.value)}
                    style={{width:'100%',padding:'0.5rem',marginBottom:'0.5rem',border:'1px solid #ccc',borderRadius:'4px',minHeight:80}}
                  />
                  {editError && <div style={{color:'red',marginBottom:'0.5rem'}}>{editError}</div>}
                  {editSuccess && <div style={{color:'green',marginBottom:'0.5rem'}}>{editSuccess}</div>}
                  <button type="submit" style={{background:'#039be5',color:'#fff',border:'none',borderRadius:'4px',padding:'0.5rem 1rem',marginRight:'0.5rem'}}>Save</button>
                  <button type="button" onClick={() => setEditId(null)} style={{background:'#eee',color:'#333',border:'none',borderRadius:'4px',padding:'0.5rem 1rem'}}>Cancel</button>
                </form>
              ) : (
                <>
                  <h4 style={{margin:'0 0 0.5rem 0'}}>{item.title}</h4>
                  <div style={{color:'#444',marginBottom:'0.5rem'}}>{item.content}</div>
                  <div style={{fontSize:'0.9rem',color:'#888'}}>By {item.author} on {item.createdAt && item.createdAt.toDate && item.createdAt.toDate().toLocaleString()}</div>
                  {isAdmin && (
                    <button onClick={() => startEdit(item)} style={{marginTop:'0.5rem',background:'#039be5',color:'#fff',border:'none',borderRadius:'4px',padding:'0.3rem 1rem'}}>Edit</button>
                  )}
                </>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
} 