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

// Initialize Firebase
let firebaseApp
let firebaseAuth
let firebaseDb
let firebaseStorage

// Initialize Firebase regardless of environment
try {
  // Check if Firebase is already initialized
  if (!getApps().length) {
    firebaseApp = initializeApp(firebaseConfig)
    console.log("Firebase initialized successfully")
  } else {
    firebaseApp = getApp()
    console.log("Using existing Firebase app")
  }

  // Initialize Firebase services
  firebaseAuth = getAuth(firebaseApp)
  firebaseDb = getFirestore(firebaseApp)
  firebaseStorage = getStorage(firebaseApp)
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
  return !!firebaseAuth && !!firebaseDb && !!firebaseApp
}

