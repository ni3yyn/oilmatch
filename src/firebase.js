// src/firebase.js
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from 'firebase/auth';


const firebaseConfig = {
    apiKey: "AIzaSyA4ipatIdZu0AzZBVOCfb2lPz8XwjpHMLo",
    authDomain: "oilmatch-1aa9c.firebaseapp.com",
    projectId: "oilmatch-1aa9c",
    storageBucket: "oilmatch-1aa9c.firebasestorage.app",
    messagingSenderId: "32381340534",
    appId: "1:32381340534:web:7e3ba9f8fa237e2ba28857",
    measurementId: "G-H5LQPSE4WC"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);


export { db, auth };
export { collection, addDoc, serverTimestamp } from 'firebase/firestore';
