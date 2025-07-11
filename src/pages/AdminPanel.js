import React, { useEffect, useState } from 'react';
import { db, collection, getDocs, getDoc, doc } from '../firebase';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '../firebase';

const COLLECTIONS = [
  { key: 'news', label: 'News & Announcements' },
  { key: 'bulletin', label: 'Bulletin Board' },
  { key: 'services', label: 'Services Directory' },
  { key: 'events', label: 'Events & Festivals' },
  { key: 'education', label: 'Education' },
  { key: 'agriculture', label: 'Agriculture' },
  { key: 'jobs', label: 'Jobs' },
  { key: 'culture', label: 'Culture' },
  { key: 'gallery', label: 'Gallery' },
  { key: 'health', label: 'Health' },
  { key: 'chat', label: 'Chat Messages' }
];

export default function AdminPanel() {
  const [user] = useAuthState(auth);
  const [isAdmin, setIsAdmin] = useState(false);
  const [counts, setCounts] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    getDoc(doc(db, 'users', user.uid)).then(docSnap => {
      if (docSnap.exists()) {
        setIsAdmin(docSnap.data().role === 'admin');
      }
    });
  }, [user]);

  useEffect(() => {
    async function fetchCounts() {
      setLoading(true);
      const newCounts = {};
      for (const col of COLLECTIONS) {
        const snap = await getDocs(collection(db, col.key));
        newCounts[col.key] = snap.size;
      }
      setCounts(newCounts);
      setLoading(false);
    }
    if (isAdmin) fetchCounts();
  }, [isAdmin]);

  if (!isAdmin) {
    return <div style={{padding:'2rem'}}><h2>Admin Panel</h2><p>Access denied. Admins only.</p></div>;
  }

  return (
    <div style={{padding:'2rem'}}>
      <h2>Admin Panel</h2>
      <p>Quick stats and management links for all sections.</p>
      {loading ? <p>Loading stats...</p> : (
        <div style={{display:'flex',flexWrap:'wrap',gap:'1.5rem'}}>
          {COLLECTIONS.map(col => (
            <div key={col.key} style={{background:'#f5f5f5',padding:'1rem 2rem',borderRadius:'8px',minWidth:200}}>
              <h3 style={{marginBottom:'0.5rem'}}>{col.label}</h3>
              <div style={{fontSize:'2rem',fontWeight:'bold',color:'#039be5'}}>{counts[col.key] ?? '-'}</div>
              <a href={`/${col.key}`} style={{color:'#039be5',textDecoration:'underline',fontSize:'1rem'}}>Go to {col.label}</a>
            </div>
          ))}
        </div>
      )}
    </div>
  );
} 