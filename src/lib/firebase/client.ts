// src/lib/firebase/client.ts
import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  projectId: "courseforge-y5ymc",
  appId: "1:114082963667:web:3bc06cf3634f0da03db426",
  storageBucket: "courseforge-y5ymc.firebasestorage.app",
  apiKey: "AIzaSyAmduNNtQiXZNK5FeCamHfgaMZYMRzkXKc",
  authDomain: "courseforge-y5ymc.firebaseapp.com",
  messagingSenderId: "114082963667",
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const db = getFirestore(app);

export { app, db };
