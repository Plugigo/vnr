import React, { useEffect, useState, useRef } from 'react';
import { db } from '../firebase';
import { collection, addDoc, query, orderBy, onSnapshot, serverTimestamp } from 'firebase/firestore';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '../firebase';

export default function Participation() {
  const [user] = useAuthState(auth);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const chatEndRef = useRef(null);

  useEffect(() => {
    const q = query(collection(db, 'chat'), orderBy('createdAt', 'asc'));
    const unsub = onSnapshot(q, (snapshot) => {
      const newMessages = snapshot.docs.map(doc => ({ 
        id: doc.id, 
        ...doc.data() 
      }));
      setMessages(newMessages);
      setLoading(false);
    }, (error) => {
      console.error('Chat listener error:', error);
      setError('Failed to load messages: ' + error.message);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    setError('');
    if (!text.trim()) return;
    
    const messageText = text.trim();
    setText(''); // Clear immediately for better UX
    
    try {
      await addDoc(collection(db, 'chat'), {
        text: messageText,
        user: user.email,
        createdAt: serverTimestamp()
      });
      // Message sent successfully
    } catch (err) {
      console.error('Error sending message:', err);
      setError('Failed to send message: ' + err.message);
      setText(messageText); // Restore text if sending failed
    }
  };

  return (
    <div style={{padding:'2rem',maxWidth:600,margin:'0 auto',display:'flex',flexDirection:'column',height:'80vh'}}>
      <h2>Community Chat</h2>
      {error && <div style={{color:'red',marginBottom:'1rem',padding:'0.5rem',background:'#ffe6e6',borderRadius:'4px'}}>{error}</div>}
      <div style={{flex:1,overflowY:'auto',background:'#f5f5f5',borderRadius:'8px',padding:'1rem',marginBottom:'1rem',minHeight:300}}>
        {loading ? <p>Loading messages...</p> : (
          messages.length === 0 ? <p>No messages yet. Start the conversation!</p> : (
            <>
              <div style={{fontSize:'0.8rem',color:'#666',marginBottom:'0.5rem'}}>
                {messages.length} message{messages.length !== 1 ? 's' : ''} loaded
              </div>
              {messages.map(msg => (
                <div key={msg.id} style={{marginBottom:'1rem',padding:'0.5rem',background:'#fff',borderRadius:'6px',boxShadow:'0 1px 2px rgba(0,0,0,0.03)'}}>
                  <div style={{fontWeight:'bold',fontSize:'0.95rem',color:'#039be5'}}>{msg.user}</div>
                  <div style={{margin:'0.2rem 0'}}>{msg.text}</div>
                  <div style={{fontSize:'0.8rem',color:'#888'}}>
                    {msg.createdAt && msg.createdAt.toDate ? 
                      msg.createdAt.toDate().toLocaleString() : 
                      (msg.createdAt && msg.createdAt.seconds ? 
                        new Date(msg.createdAt.seconds*1000).toLocaleString() : 
                        'Just now'
                      )
                    }
                  </div>
                </div>
              ))}
            </>
          )
        )}
        <div ref={chatEndRef} />
      </div>
      <form onSubmit={handleSend} style={{display:'flex',gap:'0.5rem'}}>
        <input
          type="text"
          placeholder="Type your message..."
          value={text}
          onChange={e => setText(e.target.value)}
          style={{flex:1,padding:'0.7rem',border:'1px solid #ccc',borderRadius:'4px'}}
        />
        <button type="submit" style={{background:'#039be5',color:'#fff',border:'none',borderRadius:'4px',padding:'0.7rem 1.2rem',fontWeight:'bold'}}>Send</button>
      </form>
      {error && <div style={{color:'red',marginTop:'0.5rem'}}>{error}</div>}
    </div>
  );
} 