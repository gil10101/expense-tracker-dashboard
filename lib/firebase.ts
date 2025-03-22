import { initializeApp, getApp, getApps } from "firebase/app"
import { getAuth } from "firebase/auth"
import { getFirestore } from "firebase/firestore"
import { getStorage } from "firebase/storage"

// Your Firebase configuration
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
}

// Log Firebase configuration (with some masking for security)
console.log("Firebase config:", {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY ? "****" + process.env.NEXT_PUBLIC_FIREBASE_API_KEY.substr(-4) : "NOT SET",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "NOT SET",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "NOT SET",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET ? "CONFIGURED" : "NOT SET",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID ? "CONFIGURED" : "NOT SET",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID ? "CONFIGURED" : "NOT SET",
});

// Initialize Firebase
let firebaseApp
let firebaseAuth
let firebaseDb
let firebaseStorage

// Initialize Firebase regardless of environment
try {
  // Check if Firebase is already initialized
  if (!getApps().length) {
    if (!process.env.NEXT_PUBLIC_FIREBASE_API_KEY || !process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID) {
      console.error("Firebase environment variables are missing. Check your .env file.");
    }
    
    firebaseApp = initializeApp(firebaseConfig)
    console.log("Firebase initialized successfully with project ID:", process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID)
  } else {
    firebaseApp = getApp()
    console.log("Using existing Firebase app with project ID:", process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID)
  }

  // Initialize Firebase services
  firebaseAuth = getAuth(firebaseApp)
  console.log("Firebase Auth initialized")
  
  firebaseDb = getFirestore(firebaseApp)
  console.log("Firestore initialized")
  
  firebaseStorage = getStorage(firebaseApp)
  console.log("Firebase Storage initialized")
} catch (error) {
  console.error("Error initializing Firebase:", error)
}

// Export initialized services
export const app = firebaseApp
export const auth = firebaseAuth
export const db = firebaseDb
export const storage = firebaseStorage

// Function to check if Firebase is properly initialized
export function isFirebaseInitialized() {
  const initialized = !!firebaseAuth && !!firebaseDb && !!firebaseApp;
  console.log("Firebase initialization check:", initialized ? "INITIALIZED" : "NOT INITIALIZED");
  return initialized;
}

