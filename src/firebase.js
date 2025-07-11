// src/firebase.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore, collection, doc, getDoc, getDocs, addDoc, updateDoc, deleteDoc, query, orderBy, onSnapshot, where } from "firebase/firestore";

// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyD1X5rezy8lOug0t5JGkRsyJn44YMTBeXg",
  authDomain: "vnr-360.firebaseapp.com",
  projectId: "vnr-360",
  storageBucket: "vnr-360.firebasestorage.app",
  messagingSenderId: "377928279541",
  appId: "1:377928279541:web:03c6eb70d8bc35e5476cbc",
  measurementId: "G-K0VGZ5FWFM"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);

// Test Firebase connectivity (only in development)
if (process.env.NODE_ENV === 'development') {
  console.log('Testing Firebase connection...');
  getDocs(collection(db, 'users'))
    .then(() => console.log('✅ Firebase connection successful'))
    .catch(err => console.error('❌ Firebase connection failed:', err.message));
}

// Export all Firestore functions for use in components
export { collection, doc, getDoc, getDocs, addDoc, updateDoc, deleteDoc, query, orderBy, onSnapshot, where };
