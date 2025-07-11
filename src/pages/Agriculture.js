import React, { useEffect, useState } from 'react';
import { db } from '../firebase';
import { collection, addDoc, query, orderBy, onSnapshot, doc, updateDoc } from 'firebase/firestore';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '../firebase';

const TYPES = [
  { key: 'advisory', label: 'Crop Advisory' },
  { key: 'mandi', label: 'Mandi Rates' },
  { key: 'scheme', label: 'Govt. Schemes' }
];

export default function Agriculture() {
  const [user] = useAuthState(auth);
  const [items, setItems] = useState([]);
  const [type, setType] = useState(TYPES[0].key);
  const [title, setTitle] = useState('');
  const [desc, setDesc] = useState('');
  const [link, setLink] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);
  const [editId, setEditId] = useState(null);
  const [editType, setEditType] = useState(TYPES[0].key);
  const [editTitle, setEditTitle] = useState('');
  const [editDesc, setEditDesc] = useState('');
  const [editLink, setEditLink] = useState('');
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
    setLoading(true);
    const q = query(collection(db, 'agriculture'), orderBy('type'));
    const unsub = onSnapshot(q, (snapshot) => {
      setItems(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (!title || !desc) {
      setError('Title and description are required.');
      return;
    }
    try {
      await addDoc(collection(db, 'agriculture'), {
        type,
        title,
        desc,
        link,
        createdAt: new Date(),
        addedBy: user.email
      });
      setTitle('');
      setDesc('');
      setLink('');
      setType(TYPES[0].key);
      setSuccess('Item added!');
    } catch (err) {
      setError('Failed to add item.');
    }
  };

  const startEdit = (item) => {
    setEditId(item.id);
    setEditType(item.type);
    setEditTitle(item.title);
    setEditDesc(item.desc);
    setEditLink(item.link || '');
    setEditError('');
    setEditSuccess('');
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setEditError('');
    setEditSuccess('');
    if (!editTitle || !editDesc) {
      setEditError('Title and description are required.');
      return;
    }
    try {
      await updateDoc(doc(db, 'agriculture', editId), {
        type: editType,
        title: editTitle,
        desc: editDesc,
        link: editLink
      });
      setEditSuccess('Item updated!');
      setTimeout(() => setEditId(null), 1000);
    } catch (err) {
      setEditError('Failed to update item.');
    }
  };

  return (
    <div style={{padding:'2rem'}}>
      <h2>Agriculture & Farmer Support</h2>
      {isAdmin && (
        <form onSubmit={handleSubmit} style={{marginBottom:'2rem',background:'#f5f5f5',padding:'1rem',borderRadius:'8px',maxWidth:500}}>
          <h3>Add Advisory/Mandi Rate/Scheme</h3>
          <select value={type} onChange={e => setType(e.target.value)} style={{width:'100%',padding:'0.5rem',marginBottom:'0.5rem'}}>
            {TYPES.map(t => <option key={t.key} value={t.key}>{t.label}</option>)}
          </select>
          <input
            type="text"
            placeholder="Title"
            value={title}
            onChange={e => setTitle(e.target.value)}
            style={{width:'100%',padding:'0.5rem',marginBottom:'0.5rem',border:'1px solid #ccc',borderRadius:'4px'}}
          />
          <textarea
            placeholder="Description"
            value={desc}
            onChange={e => setDesc(e.target.value)}
            style={{width:'100%',padding:'0.5rem',marginBottom:'0.5rem',border:'1px solid #ccc',borderRadius:'4px',minHeight:60}}
          />
          <input
            type="text"
            placeholder="Link (optional)"
            value={link}
            onChange={e => setLink(e.target.value)}
            style={{width:'100%',padding:'0.5rem',marginBottom:'0.5rem',border:'1px solid #ccc',borderRadius:'4px'}}
          />
          {error && <div style={{color:'red',marginBottom:'0.5rem'}}>{error}</div>}
          {success && <div style={{color:'green',marginBottom:'0.5rem'}}>{success}</div>}
          <button type="submit" style={{background:'#039be5',color:'#fff',border:'none',borderRadius:'4px',padding:'0.5rem 1rem'}}>Add</button>
        </form>
      )}
      {loading ? <p>Loading info...</p> : (
        <div>
          {TYPES.map(t => (
            <div key={t.key} style={{marginBottom:'2rem'}}>
              <h3>{t.label}</h3>
              {items.filter(i => i.type === t.key).length === 0 && <p>No items yet.</p>}
              {items.filter(i => i.type === t.key).map(item => (
                <div key={item.id} style={{background:'#fff',marginBottom:'1rem',padding:'1rem',borderRadius:'8px',boxShadow:'0 1px 4px rgba(0,0,0,0.05)'}}>
                  {isAdmin && editId === item.id ? (
                    <form onSubmit={handleEditSubmit} style={{marginBottom:'1rem'}}>
                      <select value={editType} onChange={e => setEditType(e.target.value)} style={{width:'100%',padding:'0.5rem',marginBottom:'0.5rem'}}>
                        {TYPES.map(t => <option key={t.key} value={t.key}>{t.label}</option>)}
                      </select>
                      <input
                        type="text"
                        placeholder="Title"
                        value={editTitle}
                        onChange={e => setEditTitle(e.target.value)}
                        style={{width:'100%',padding:'0.5rem',marginBottom:'0.5rem',border:'1px solid #ccc',borderRadius:'4px'}}
                      />
                      <textarea
                        placeholder="Description"
                        value={editDesc}
                        onChange={e => setEditDesc(e.target.value)}
                        style={{width:'100%',padding:'0.5rem',marginBottom:'0.5rem',border:'1px solid #ccc',borderRadius:'4px',minHeight:60}}
                      />
                      <input
                        type="text"
                        placeholder="Link (optional)"
                        value={editLink}
                        onChange={e => setEditLink(e.target.value)}
                        style={{width:'100%',padding:'0.5rem',marginBottom:'0.5rem',border:'1px solid #ccc',borderRadius:'4px'}}
                      />
                      {editError && <div style={{color:'red',marginBottom:'0.5rem'}}>{editError}</div>}
                      {editSuccess && <div style={{color:'green',marginBottom:'0.5rem'}}>{editSuccess}</div>}
                      <button type="submit" style={{background:'#039be5',color:'#fff',border:'none',borderRadius:'4px',padding:'0.5rem 1rem',marginRight:'0.5rem'}}>Save</button>
                      <button type="button" onClick={() => setEditId(null)} style={{background:'#eee',color:'#333',border:'none',borderRadius:'4px',padding:'0.5rem 1rem'}}>Cancel</button>
                    </form>
                  ) : (
                    <>
                      <h4 style={{margin:'0 0 0.5rem 0'}}>{item.title}</h4>
                      <div style={{color:'#444',marginBottom:'0.5rem'}}>{item.desc}</div>
                      {item.link && <div><a href={item.link} target="_blank" rel="noopener noreferrer">More Info</a></div>}
                      <div style={{fontSize:'0.9rem',color:'#888'}}>Added by {item.addedBy} on {item.createdAt && item.createdAt.toDate && new Date(item.createdAt.seconds*1000).toLocaleString()}</div>
                      {isAdmin && (
                        <button onClick={() => startEdit(item)} style={{marginTop:'0.5rem',background:'#039be5',color:'#fff',border:'none',borderRadius:'4px',padding:'0.3rem 1rem'}}>Edit</button>
                      )}
                    </>
                  )}
                </div>
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  );
} 