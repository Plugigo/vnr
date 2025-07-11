import React, { useEffect, useState } from 'react';
import { db, collection, addDoc, query, orderBy, onSnapshot, doc, updateDoc, getDoc } from '../firebase';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '../firebase';

export default function Events() {
  const [user] = useAuthState(auth);
  const [events, setEvents] = useState([]);
  const [title, setTitle] = useState('');
  const [date, setDate] = useState('');
  const [desc, setDesc] = useState('');
  const [image, setImage] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);
  const [editId, setEditId] = useState(null);
  const [editTitle, setEditTitle] = useState('');
  const [editDate, setEditDate] = useState('');
  const [editDesc, setEditDesc] = useState('');
  const [editImage, setEditImage] = useState('');
  const [editError, setEditError] = useState('');
  const [editSuccess, setEditSuccess] = useState('');

  useEffect(() => {
    if (!user) return;
    getDoc(doc(db, 'users', user.uid)).then(docSnap => {
      if (docSnap.exists()) {
        setIsAdmin(docSnap.data().role === 'admin');
      }
    });
  }, [user]);

  useEffect(() => {
    setLoading(true);
    const q = query(collection(db, 'events'), orderBy('date'));
    const unsub = onSnapshot(q, (snapshot) => {
      setEvents(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (!title || !date || !desc) {
      setError('Title, date, and description are required.');
      return;
    }
    try {
      await addDoc(collection(db, 'events'), {
        title,
        date,
        desc,
        image,
        createdAt: new Date(),
        addedBy: user.email
      });
      setTitle('');
      setDate('');
      setDesc('');
      setImage('');
      setSuccess('Event added!');
    } catch (err) {
      setError('Failed to add event.');
    }
  };

  const startEdit = (item) => {
    setEditId(item.id);
    setEditTitle(item.title);
    setEditDate(item.date);
    setEditDesc(item.desc);
    setEditImage(item.image || '');
    setEditError('');
    setEditSuccess('');
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setEditError('');
    setEditSuccess('');
    if (!editTitle || !editDate || !editDesc) {
      setEditError('Title, date, and description are required.');
      return;
    }
    try {
      await updateDoc(doc(db, 'events', editId), {
        title: editTitle,
        date: editDate,
        desc: editDesc,
        image: editImage
      });
      setEditSuccess('Event updated!');
      setTimeout(() => setEditId(null), 1000);
    } catch (err) {
      setEditError('Failed to update event.');
    }
  };

  return (
    <div style={{padding:'2rem'}}>
      <h2>Events & Festivals</h2>
      {isAdmin && (
        <form onSubmit={handleSubmit} style={{marginBottom:'2rem',background:'#f5f5f5',padding:'1rem',borderRadius:'8px',maxWidth:500}}>
          <h3>Add Event</h3>
          <input
            type="text"
            placeholder="Event Title"
            value={title}
            onChange={e => setTitle(e.target.value)}
            style={{width:'100%',padding:'0.5rem',marginBottom:'0.5rem',border:'1px solid #ccc',borderRadius:'4px'}}
          />
          <input
            type="date"
            value={date}
            onChange={e => setDate(e.target.value)}
            style={{width:'100%',padding:'0.5rem',marginBottom:'0.5rem',border:'1px solid #ccc',borderRadius:'4px'}}
          />
          <textarea
            placeholder="Description"
            value={desc}
            onChange={e => setDesc(e.target.value)}
            style={{width:'100%',padding:'0.5rem',marginBottom:'0.5rem',border:'1px solid #ccc',borderRadius:'4px',minHeight:80}}
          />
          <input
            type="text"
            placeholder="Image URL (optional)"
            value={image}
            onChange={e => setImage(e.target.value)}
            style={{width:'100%',padding:'0.5rem',marginBottom:'0.5rem',border:'1px solid #ccc',borderRadius:'4px'}}
          />
          {error && <div style={{color:'red',marginBottom:'0.5rem'}}>{error}</div>}
          {success && <div style={{color:'green',marginBottom:'0.5rem'}}>{success}</div>}
          <button type="submit" style={{background:'#039be5',color:'#fff',border:'none',borderRadius:'4px',padding:'0.5rem 1rem'}}>Add</button>
        </form>
      )}
      {loading ? <p>Loading events...</p> : (
        <div>
          {events.length === 0 && <p>No upcoming events yet.</p>}
          {events.map(item => (
            <div key={item.id} style={{background:'#fff',marginBottom:'1rem',padding:'1rem',borderRadius:'8px',boxShadow:'0 1px 4px rgba(0,0,0,0.05)'}}>
              {isAdmin && editId === item.id ? (
                <form onSubmit={handleEditSubmit} style={{marginBottom:'1rem'}}>
                  <input
                    type="text"
                    placeholder="Event Title"
                    value={editTitle}
                    onChange={e => setEditTitle(e.target.value)}
                    style={{width:'100%',padding:'0.5rem',marginBottom:'0.5rem',border:'1px solid #ccc',borderRadius:'4px'}}
                  />
                  <input
                    type="date"
                    value={editDate}
                    onChange={e => setEditDate(e.target.value)}
                    style={{width:'100%',padding:'0.5rem',marginBottom:'0.5rem',border:'1px solid #ccc',borderRadius:'4px'}}
                  />
                  <textarea
                    placeholder="Description"
                    value={editDesc}
                    onChange={e => setEditDesc(e.target.value)}
                    style={{width:'100%',padding:'0.5rem',marginBottom:'0.5rem',border:'1px solid #ccc',borderRadius:'4px',minHeight:80}}
                  />
                  <input
                    type="text"
                    placeholder="Image URL (optional)"
                    value={editImage}
                    onChange={e => setEditImage(e.target.value)}
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
                  <div style={{color:'#444',marginBottom:'0.5rem'}}><b>Date:</b> {item.date}</div>
                  <div style={{color:'#444',marginBottom:'0.5rem'}}>{item.desc}</div>
                  {item.image && <img src={item.image} alt="event" style={{maxWidth:'100%',maxHeight:200,margin:'0.5rem 0',borderRadius:'8px'}} />}
                  <div style={{fontSize:'0.9rem',color:'#888'}}>Added by {item.addedBy} on {item.createdAt && item.createdAt.toDate && new Date(item.createdAt.seconds*1000).toLocaleString()}</div>
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