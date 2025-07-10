import React, { useEffect, useState } from 'react';
import { db } from '../firebase';
import { collection, addDoc, query, orderBy, onSnapshot } from 'firebase/firestore';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '../firebase';

const CATEGORIES = [
  'Panchayat Office',
  'Doctors',
  'Electricians',
  'Farmers',
  'Tailors',
  'Shops',
  'Vendors',
  'Others'
];

export default function ServicesDirectory() {
  const [user] = useAuthState(auth);
  const [services, setServices] = useState([]);
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [name, setName] = useState('');
  const [contact, setContact] = useState('');
  const [address, setAddress] = useState('');
  const [hours, setHours] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);
  const [filter, setFilter] = useState('All');

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
    const q = query(collection(db, 'services'), orderBy('category'));
    const unsub = onSnapshot(q, (snapshot) => {
      setServices(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (!name || !contact || !category) {
      setError('Name, contact, and category are required.');
      return;
    }
    try {
      await addDoc(collection(db, 'services'), {
        name,
        contact,
        address,
        hours,
        category,
        createdAt: new Date(),
        addedBy: user.email
      });
      setName('');
      setContact('');
      setAddress('');
      setHours('');
      setCategory(CATEGORIES[0]);
      setSuccess('Service added!');
    } catch (err) {
      setError('Failed to add service.');
    }
  };

  const categoriesToShow = ['All', ...CATEGORIES];
  const filteredServices = filter === 'All' ? services : services.filter(s => s.category === filter);

  return (
    <div style={{padding:'2rem'}}>
      <h2>Local Services Directory</h2>
      {isAdmin && (
        <form onSubmit={handleSubmit} style={{marginBottom:'2rem',background:'#f5f5f5',padding:'1rem',borderRadius:'8px',maxWidth:500}}>
          <h3>Add Service/Business</h3>
          <select value={category} onChange={e => setCategory(e.target.value)} style={{width:'100%',padding:'0.5rem',marginBottom:'0.5rem'}}>
            {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
          </select>
          <input
            type="text"
            placeholder="Name"
            value={name}
            onChange={e => setName(e.target.value)}
            style={{width:'100%',padding:'0.5rem',marginBottom:'0.5rem',border:'1px solid #ccc',borderRadius:'4px'}}
          />
          <input
            type="text"
            placeholder="Contact (phone)"
            value={contact}
            onChange={e => setContact(e.target.value)}
            style={{width:'100%',padding:'0.5rem',marginBottom:'0.5rem',border:'1px solid #ccc',borderRadius:'4px'}}
          />
          <input
            type="text"
            placeholder="Address (optional)"
            value={address}
            onChange={e => setAddress(e.target.value)}
            style={{width:'100%',padding:'0.5rem',marginBottom:'0.5rem',border:'1px solid #ccc',borderRadius:'4px'}}
          />
          <input
            type="text"
            placeholder="Working hours (optional)"
            value={hours}
            onChange={e => setHours(e.target.value)}
            style={{width:'100%',padding:'0.5rem',marginBottom:'0.5rem',border:'1px solid #ccc',borderRadius:'4px'}}
          />
          {error && <div style={{color:'red',marginBottom:'0.5rem'}}>{error}</div>}
          {success && <div style={{color:'green',marginBottom:'0.5rem'}}>{success}</div>}
          <button type="submit" style={{background:'#039be5',color:'#fff',border:'none',borderRadius:'4px',padding:'0.5rem 1rem'}}>Add</button>
        </form>
      )}
      <div style={{marginBottom:'1rem'}}>
        <b>Filter by category: </b>
        {categoriesToShow.map(cat => (
          <button
            key={cat}
            onClick={() => setFilter(cat)}
            style={{marginRight:'0.5rem',background:filter===cat?'#039be5':'#eee',color:filter===cat?'#fff':'#333',border:'none',borderRadius:'4px',padding:'0.3rem 0.8rem'}}
          >
            {cat}
          </button>
        ))}
      </div>
      {loading ? <p>Loading services...</p> : (
        <div>
          {filteredServices.length === 0 && <p>No services in this category yet.</p>}
          {filteredServices.map(item => (
            <div key={item.id} style={{background:'#fff',marginBottom:'1rem',padding:'1rem',borderRadius:'8px',boxShadow:'0 1px 4px rgba(0,0,0,0.05)'}}>
              <h4 style={{margin:'0 0 0.5rem 0'}}>{item.name}</h4>
              <div style={{color:'#444',marginBottom:'0.5rem'}}><b>Category:</b> {item.category}</div>
              <div style={{color:'#444',marginBottom:'0.5rem'}}><b>Contact:</b> {item.contact}</div>
              {item.address && <div style={{color:'#444',marginBottom:'0.5rem'}}><b>Address:</b> {item.address}</div>}
              {item.hours && <div style={{color:'#444',marginBottom:'0.5rem'}}><b>Working hours:</b> {item.hours}</div>}
              <div style={{fontSize:'0.9rem',color:'#888'}}>Added by {item.addedBy} on {item.createdAt && item.createdAt.toDate && new Date(item.createdAt.seconds*1000).toLocaleString()}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
} 