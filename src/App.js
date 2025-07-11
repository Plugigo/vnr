import React, { useState, useEffect } from "react";
import './App.css';
import './common.css';
import { BrowserRouter as Router, Routes, Route, Link, Navigate } from "react-router-dom";
import { auth, db } from "./firebase";
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, onAuthStateChanged } from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
// Import placeholder pages
import News from "./pages/News";
import BulletinBoard from "./pages/BulletinBoard";
import ServicesDirectory from "./pages/ServicesDirectory";
import Events from "./pages/Events";
import Education from "./pages/Education";
import Agriculture from "./pages/Agriculture";
import Jobs from "./pages/Jobs";
import Culture from "./pages/Culture";
import Gallery from "./pages/Gallery";
import Health from "./pages/Health";
import Participation from "./pages/Participation";
import AdminPanel from "./pages/AdminPanel";
import ErrorBoundary from "./ErrorBoundary";

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
      // Store user info in Firestore with role
      await setDoc(doc(db, "users", userCredential.user.uid), {
        uid: userCredential.user.uid,
        email: userCredential.user.email,
        role: email === "admin@vnr.com" ? "admin" : "user",
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

function Sidebar({ user, isAdmin, onLogout }) {
  return (
    <div className="sidebar" style={{width:220,background:'#282c34',color:'#fff',height:'100vh',position:'fixed',top:0,left:0,display:'flex',flexDirection:'column',padding:'1rem 0',overflowY:'auto'}}>
      <h2 style={{textAlign:'center',marginBottom:'2rem',fontSize:'1.3rem'}}>VNR-360</h2>
      <nav style={{display:'flex',flexDirection:'column',gap:'1rem',flex:1}}>
        <Link to="/news" style={{color:'#fff',textDecoration:'none',padding:'0.5rem 1.5rem'}}>News</Link>
        <Link to="/bulletin" style={{color:'#fff',textDecoration:'none',padding:'0.5rem 1.5rem'}}>Bulletin Board</Link>
        <Link to="/services" style={{color:'#fff',textDecoration:'none',padding:'0.5rem 1.5rem'}}>Services Directory</Link>
        <Link to="/events" style={{color:'#fff',textDecoration:'none',padding:'0.5rem 1.5rem'}}>Events</Link>
        <Link to="/education" style={{color:'#fff',textDecoration:'none',padding:'0.5rem 1.5rem'}}>Education</Link>
        <Link to="/agriculture" style={{color:'#fff',textDecoration:'none',padding:'0.5rem 1.5rem'}}>Agriculture</Link>
        <Link to="/jobs" style={{color:'#fff',textDecoration:'none',padding:'0.5rem 1.5rem'}}>Jobs</Link>
        <Link to="/culture" style={{color:'#fff',textDecoration:'none',padding:'0.5rem 1.5rem'}}>Culture</Link>
        <Link to="/gallery" style={{color:'#fff',textDecoration:'none',padding:'0.5rem 1.5rem'}}>Gallery</Link>
        <Link to="/health" style={{color:'#fff',textDecoration:'none',padding:'0.5rem 1.5rem'}}>Health</Link>
        <Link to="/participation" style={{color:'#fff',textDecoration:'none',padding:'0.5rem 1.5rem'}}>Participation</Link>
        {isAdmin && <Link to="/admin" style={{color:'#fff',textDecoration:'none',padding:'0.5rem 1.5rem'}}>Admin Panel</Link>}
      </nav>
      <div style={{marginTop:'auto',textAlign:'center'}}>
        <button onClick={onLogout} style={{background:'#039be5',color:'#fff',border:'none',borderRadius:'4px',padding:'0.5rem 1rem',marginBottom:'1rem'}}>Logout</button>
      </div>
    </div>
  );
}

function Dashboard({ user, isAdmin, onLogout }) {
  return (
    <div style={{marginLeft:220,padding:'2rem'}}>
      <h2>Dashboard</h2>
      <p>Welcome, <b>{user.email}</b>!</p>
      <p>Use the sidebar to navigate through the portal features.</p>
    </div>
  );
}

function App() {
  const [showSplash, setShowSplash] = useState(true);
  const [page, setPage] = useState("login");
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setShowSplash(false), 2000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (u) => {
      if (u) {
        setUser(u);
        // Fetch user role from Firestore
        const userDoc = await getDoc(doc(db, "users", u.uid));
        let role = "user";
        if (userDoc.exists()) {
          role = userDoc.data().role || "user";
        } else if (u.email === "admin@vnr.com") {
          role = "admin";
        }
        setIsAdmin(role === "admin");
        setPage("dashboard");
      } else {
        setUser(null);
        setIsAdmin(false);
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

  if (!user) {
    if (page === "signup") return <SignupPage onSwitch={() => setPage("login") } onSignup={() => setPage("login") } />;
    return <LoginPage onSwitch={() => setPage("signup")} onLogin={() => setPage("dashboard")} />;
  }

  return (
    <ErrorBoundary>
      <Router>
        <Sidebar user={user} isAdmin={isAdmin} onLogout={handleLogout} />
        <div style={{marginLeft:220}}>
          <Routes>
            <Route path="/" element={<Dashboard user={user} isAdmin={isAdmin} onLogout={handleLogout} />} />
            <Route path="/news" element={<News />} />
            <Route path="/bulletin" element={<BulletinBoard />} />
            <Route path="/services" element={<ServicesDirectory />} />
            <Route path="/events" element={<Events />} />
            <Route path="/education" element={<Education />} />
            <Route path="/agriculture" element={<Agriculture />} />
            <Route path="/jobs" element={<Jobs />} />
            <Route path="/culture" element={<Culture />} />
            <Route path="/gallery" element={<Gallery />} />
            <Route path="/health" element={<Health />} />
            <Route path="/participation" element={<Participation />} />
            {isAdmin && <Route path="/admin" element={<AdminPanel />} />}
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </div>
      </Router>
    </ErrorBoundary>
  );
}

export default App;
