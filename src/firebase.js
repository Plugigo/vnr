// src/firebase.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

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
