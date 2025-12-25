// firebaseConfig.js (inside your screens folder or project folder)
import { initializeApp } from 'firebase/app';
import { getAuth, initializeAuth, getReactNativePersistence } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';  // Import AsyncStorage

// Your Firebase configuration object
const firebaseConfig = {
    apiKey: "AIzaSyDMKWwpSqm1VLSoE0NQGDM6iHbsZejy6OE",
    authDomain: "emoticare-feb2c.firebaseapp.com",
    projectId: "emoticare-feb2c",
    storageBucket: "emoticare-feb2c.firebasestorage.app",
    messagingSenderId: "436068705503",
    appId: "1:436068705503:web:3225dcc5be56677087756a",
    measurementId: "G-6CE1499H4P"
  };

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Auth with persistence
const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage),  // Enable AsyncStorage persistence
});

// Initialize Firestore
const firestore = getFirestore(app);

export { auth, firestore };  // Export auth and firestore
