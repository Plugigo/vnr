import React, { useState, useEffect } from "react";
import './App.css';

import { auth, db } from "./firebase";
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, onAuthStateChanged } from "firebase/auth";
import { collection, addDoc } from "firebase/firestore";

function SplashScreen() {
  return (
    <div className="splash-screen" style={{display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',height:'100vh',background:'#039be5',color:'#fff'}}>
      <h1 style={{fontSize:'2.5rem',marginBottom:'1rem'}}>Welcome to VNR-360</h1>
      <p style={{fontSize:'1.2rem'}}>Loading...</p>
    </div>
  );
}



function LoginPage({ onSwitch, onLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    try {
      await signInWithEmailAndPassword(auth, email, password);
      onLogin();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="login-page" style={{display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',height:'100vh',background:'#f5f5f5'}}>
      <div style={{background:'#fff',padding:'2rem',borderRadius:'8px',boxShadow:'0 2px 8px rgba(0,0,0,0.1)',minWidth:'300px'}}>
        <h2 style={{marginBottom:'1.5rem',color:'#039be5'}}>Login</h2>
        <form onSubmit={handleLogin}>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            style={{width:'100%',padding:'0.5rem',marginBottom:'1rem',border:'1px solid #ccc',borderRadius:'4px'}}
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            style={{width:'100%',padding:'0.5rem',marginBottom:'1rem',border:'1px solid #ccc',borderRadius:'4px'}}
            required
          />
          {error && <div style={{color:'red',marginBottom:'1rem'}}>{error}</div>}
          <button type="submit" style={{width:'100%',padding:'0.7rem',background:'#039be5',color:'#fff',border:'none',borderRadius:'4px',fontWeight:'bold',fontSize:'1rem'}}>Login</button>
        </form>
        <p style={{marginTop:'1rem'}}>Don't have an account? <button style={{color:'#039be5',background:'none',border:'none',cursor:'pointer'}} onClick={onSwitch}>Sign up</button></p>
      </div>
    </div>
  );
}

function SignupPage({ onSwitch, onSignup }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSignup = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      // Store user info in Firestore
      await addDoc(collection(db, "users"), {
        uid: userCredential.user.uid,
        email: userCredential.user.email,
        createdAt: new Date()
      });
      setSuccess("Signup successful! You can now log in.");
      setTimeout(() => onSignup(), 1500);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="signup-page" style={{display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',height:'100vh',background:'#f5f5f5'}}>
      <div style={{background:'#fff',padding:'2rem',borderRadius:'8px',boxShadow:'0 2px 8px rgba(0,0,0,0.1)',minWidth:'300px'}}>
        <h2 style={{marginBottom:'1.5rem',color:'#039be5'}}>Sign Up</h2>
        <form onSubmit={handleSignup}>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            style={{width:'100%',padding:'0.5rem',marginBottom:'1rem',border:'1px solid #ccc',borderRadius:'4px'}}
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            style={{width:'100%',padding:'0.5rem',marginBottom:'1rem',border:'1px solid #ccc',borderRadius:'4px'}}
            required
          />
          {error && <div style={{color:'red',marginBottom:'1rem'}}>{error}</div>}
          {success && <div style={{color:'green',marginBottom:'1rem'}}>{success}</div>}
          <button type="submit" style={{width:'100%',padding:'0.7rem',background:'#039be5',color:'#fff',border:'none',borderRadius:'4px',fontWeight:'bold',fontSize:'1rem'}}>Sign Up</button>
        </form>
        <p style={{marginTop:'1rem'}}>Already have an account? <button style={{color:'#039be5',background:'none',border:'none',cursor:'pointer'}} onClick={onSwitch}>Login</button></p>
      </div>
    </div>
  );
}

function Dashboard({ user, onLogout }) {
  return (
    <div style={{display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',height:'100vh',background:'#e3f2fd'}}>
      <div style={{background:'#fff',padding:'2rem',borderRadius:'8px',boxShadow:'0 2px 8px rgba(0,0,0,0.1)',minWidth:'300px',textAlign:'center'}}>
        <h2 style={{color:'#039be5'}}>Dashboard</h2>
        <p>Welcome, <b>{user.email}</b>!</p>
        <button onClick={onLogout} style={{marginTop:'1rem',padding:'0.7rem',background:'#039be5',color:'#fff',border:'none',borderRadius:'4px',fontWeight:'bold',fontSize:'1rem'}}>Logout</button>
      </div>
    </div>
  );
}


function App() {
  const [showSplash, setShowSplash] = useState(true);
  const [page, setPage] = useState("login"); // 'login' | 'signup' | 'dashboard'
  const [user, setUser] = useState(null);

  useEffect(() => {
    const timer = setTimeout(() => setShowSplash(false), 2000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      if (u) {
        setUser(u);
        setPage("dashboard");
      } else {
        setUser(null);
        setPage("login");
      }
    });
    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    await signOut(auth);
    setPage("login");
  };

  if (showSplash) return <SplashScreen />;

  if (user && page === "dashboard") return <Dashboard user={user} onLogout={handleLogout} />;

  if (page === "signup") return <SignupPage onSwitch={() => setPage("login") } onSignup={() => setPage("login") } />;

  return <LoginPage onSwitch={() => setPage("signup")} onLogin={() => setPage("dashboard")} />;
}

export default App;
