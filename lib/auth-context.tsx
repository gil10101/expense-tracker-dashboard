"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import {
  type User,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  sendPasswordResetEmail,
  updateProfile,
  updateEmail,
  updatePassword,
  reauthenticateWithCredential,
  EmailAuthProvider,
  GoogleAuthProvider,
  signInWithPopup,
} from "firebase/auth"
import { doc, setDoc, getDoc, serverTimestamp } from "firebase/firestore"
import { auth, db, isFirebaseInitialized } from "./firebase"

interface UserProfile {
  id: string
  email: string
  displayName?: string
  photoURL?: string
  createdAt?: any
  updatedAt?: any
  settings?: {
    currency?: string
    language?: string
    theme?: string
    notifications?: {
      budgetAlerts?: boolean
      weeklyReports?: boolean
    }
  }
}

interface AuthContextType {
  user: User | null
  userProfile: UserProfile | null
  loading: boolean
  error: Error | null
  authError: string | null
  login: (email: string, password: string) => Promise<User>
  loginWithGoogle: () => Promise<User>
  signup: (email: string, password: string, displayName?: string) => Promise<User>
  logout: () => Promise<void>
  resetPassword: (email: string) => Promise<void>
  updateUserProfile: (displayName: string, photoURL?: string) => Promise<void>
  updateUserEmail: (email: string, password: string) => Promise<void>
  updateUserPassword: (currentPassword: string, newPassword: string) => Promise<void>
  updateUserSettings: (settings: Partial<UserProfile["settings"]>) => Promise<void>
  clearError: () => void
  refreshToken: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const [authError, setAuthError] = useState<string | null>(null)
  const [isInitialized, setIsInitialized] = useState(false)

  // Check if Firebase is initialized
  useEffect(() => {
    const checkFirebase = () => {
      const initialized = isFirebaseInitialized()
      setIsInitialized(initialized)

      if (!initialized) {
        console.log("Firebase not initialized yet, retrying...")
        setTimeout(checkFirebase, 500)
      } else {
        console.log("Firebase initialized successfully")
      }
    }

    checkFirebase()
  }, [])

  // Set up auth state listener once Firebase is initialized
  useEffect(() => {
    if (!isInitialized) return

    console.log("Setting up auth state change listener")
    const unsubscribe = onAuthStateChanged(
      auth,
      async (user) => {
        if (user) {
          console.log("Auth state changed: User authenticated")
          setUser(user)

          // Fetch user profile from Firestore
          try {
            const userDoc = await getDoc(doc(db, "users", user.uid))
            if (userDoc.exists()) {
              setUserProfile({ id: user.uid, ...userDoc.data() } as UserProfile)
            } else {
              // Create user profile if it doesn't exist
              const newProfile: UserProfile = {
                id: user.uid,
                email: user.email || "",
                displayName: user.displayName || "",
                photoURL: user.photoURL || "",
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp(),
                settings: {
                  currency: "USD",
                  language: "en",
                  theme: "system",
                  notifications: {
                    budgetAlerts: true,
                    weeklyReports: true,
                  },
                },
              }

              await setDoc(doc(db, "users", user.uid), newProfile)
              setUserProfile(newProfile)
            }
          } catch (err) {
            console.error("Error fetching user profile:", err)
          }
        } else {
          console.log("Auth state changed: No user")
          setUser(null)
          setUserProfile(null)
        }
        setLoading(false)
      },
      (error) => {
        console.error("Auth state change error:", error)
        setError(error)
        setAuthError(error.message)
        setLoading(false)
      },
    )

    return () => {
      console.log("Cleaning up auth state change listener")
      unsubscribe()
    }
  }, [isInitialized])

  const login = async (email: string, password: string) => {
    if (!isInitialized) {
      throw new Error("Firebase authentication is not initialized yet")
    }

    try {
      setLoading(true)
      setError(null)
      setAuthError(null)
      const userCredential = await signInWithEmailAndPassword(auth, email, password)
      return userCredential.user
    } catch (err: any) {
      console.error("Login error:", err)
      setError(err)
      setAuthError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }

  const loginWithGoogle = async () => {
    if (!isInitialized) {
      throw new Error("Firebase authentication is not initialized yet")
    }

    try {
      setLoading(true)
      setError(null)
      setAuthError(null)
      const provider = new GoogleAuthProvider()
      const userCredential = await signInWithPopup(auth, provider)
      return userCredential.user
    } catch (err: any) {
      console.error("Google login error:", err)
      setError(err)
      setAuthError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }

  const signup = async (email: string, password: string, displayName?: string) => {
    if (!isInitialized) {
      throw new Error("Firebase authentication is not initialized yet")
    }

    try {
      setLoading(true)
      setError(null)
      setAuthError(null)
      const userCredential = await createUserWithEmailAndPassword(auth, email, password)

      // Update profile if displayName is provided
      if (displayName && userCredential.user) {
        await updateProfile(userCredential.user, { displayName })
      }

      return userCredential.user
    } catch (err: any) {
      console.error("Signup error:", err)
      setError(err)
      setAuthError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }

  const logout = async () => {
    if (!isInitialized) {
      throw new Error("Firebase authentication is not initialized yet")
    }

    try {
      setLoading(true)
      setError(null)
      setAuthError(null)
      await signOut(auth)
    } catch (err: any) {
      console.error("Logout error:", err)
      setError(err)
      setAuthError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }

  const resetPassword = async (email: string) => {
    if (!isInitialized) {
      throw new Error("Firebase authentication is not initialized yet")
    }

    try {
      setLoading(true)
      setError(null)
      setAuthError(null)
      await sendPasswordResetEmail(auth, email)
    } catch (err: any) {
      console.error("Reset password error:", err)
      setError(err)
      setAuthError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }

  const updateUserProfile = async (displayName: string, photoURL?: string) => {
    if (!isInitialized) {
      throw new Error("Firebase authentication is not initialized yet")
    }

    try {
      setLoading(true)
      setError(null)
      setAuthError(null)

      if (!user) throw new Error("No user logged in")

      // Update Firebase Auth profile
      await updateProfile(user, {
        displayName,
        photoURL: photoURL || user.photoURL,
      })

      // Update Firestore profile
      if (userProfile) {
        const userRef = doc(db, "users", user.uid)
        await setDoc(
          userRef,
          {
            displayName,
            photoURL: photoURL || userProfile.photoURL || "",
            updatedAt: serverTimestamp(),
          },
          { merge: true },
        )

        // Update local state
        setUserProfile({
          ...userProfile,
          displayName,
          photoURL: photoURL || userProfile.photoURL || "",
        })
      }
    } catch (err: any) {
      console.error("Update profile error:", err)
      setError(err)
      setAuthError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }

  const updateUserEmail = async (email: string, password: string) => {
    if (!isInitialized) {
      throw new Error("Firebase authentication is not initialized yet")
    }

    try {
      setLoading(true)
      setError(null)
      setAuthError(null)

      if (!user) throw new Error("No user logged in")

      // Re-authenticate user before changing email
      const credential = EmailAuthProvider.credential(user.email!, password)
      await reauthenticateWithCredential(user, credential)

      // Update email in Firebase Auth
      await updateEmail(user, email)

      // Update email in Firestore
      if (userProfile) {
        const userRef = doc(db, "users", user.uid)
        await setDoc(
          userRef,
          {
            email,
            updatedAt: serverTimestamp(),
          },
          { merge: true },
        )

        // Update local state
        setUserProfile({
          ...userProfile,
          email,
        })
      }
    } catch (err: any) {
      console.error("Update email error:", err)
      setError(err)
      setAuthError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }

  const updateUserPassword = async (currentPassword: string, newPassword: string) => {
    if (!isInitialized) {
      throw new Error("Firebase authentication is not initialized yet")
    }

    try {
      setLoading(true)
      setError(null)
      setAuthError(null)

      if (!user) throw new Error("No user logged in")
      if (!user.email) throw new Error("User has no email")

      // Re-authenticate user before changing password
      const credential = EmailAuthProvider.credential(user.email, currentPassword)
      await reauthenticateWithCredential(user, credential)

      // Update password
      await updatePassword(user, newPassword)
    } catch (err: any) {
      console.error("Update password error:", err)
      setError(err)
      setAuthError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }

  const updateUserSettings = async (settings: Partial<UserProfile["settings"]>) => {
    if (!isInitialized) {
      throw new Error("Firebase authentication is not initialized yet")
    }

    try {
      setLoading(true)
      setError(null)

      if (!user) throw new Error("No user logged in")
      if (!userProfile) throw new Error("No user profile found")

      // Update settings in Firestore
      const userRef = doc(db, "users", user.uid)
      await setDoc(
        userRef,
        {
          settings: {
            ...userProfile.settings,
            ...settings,
          },
          updatedAt: serverTimestamp(),
        },
        { merge: true },
      )

      // Update local state
      setUserProfile({
        ...userProfile,
        settings: {
          ...userProfile.settings,
          ...settings,
        },
      })
    } catch (err: any) {
      console.error("Update settings error:", err)
      setError(err)
      throw err
    } finally {
      setLoading(false)
    }
  }

  const clearError = () => {
    setError(null)
    setAuthError(null)
  }

  const refreshToken = async () => {
    if (!isInitialized) {
      throw new Error("Firebase authentication is not initialized yet")
    }

    try {
      if (user) {
        await user.getIdToken(true)
      }
    } catch (err: any) {
      console.error("Error refreshing token:", err)
      setError(err)
      throw err
    }
  }

  const value = {
    user,
    userProfile,
    loading,
    error,
    authError,
    login,
    loginWithGoogle,
    signup,
    logout,
    resetPassword,
    updateUserProfile,
    updateUserEmail,
    updateUserPassword,
    updateUserSettings,
    clearError,
    refreshToken,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

