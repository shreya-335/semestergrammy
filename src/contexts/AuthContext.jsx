'use client'

import { createContext, useContext, useState, useEffect } from 'react';
import { auth, db } from '../firebase/config';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  sendPasswordResetEmail
} from 'firebase/auth';
import { doc, setDoc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import toast from 'react-hot-toast';

const AuthContext = createContext({});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userSemesters, setUserSemesters] = useState([]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUser(user);
        await loadUserSemesters(user.uid);
      } else {
        setUser(null);
        setUserSemesters([]);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const loadUserSemesters = async (userId) => {
    try {
      const q = query(
        collection(db, 'semesterAccess'),
        where('userId', '==', userId)
      );
      const snapshot = await getDocs(q);
      const semesters = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setUserSemesters(semesters);
    } catch (error) {
      console.error('Error loading user semesters:', error);
    }
  };

  const signIn = async (email, password) => {
    try {
      const result = await signInWithEmailAndPassword(auth, email, password);
      toast.success('Welcome back! 🎉');
      return result;
    } catch (error) {
      console.error('Sign in error:', error);
      throw error;
    }
  };

  const signUp = async (email, password, displayName) => {
    try {
      const result = await createUserWithEmailAndPassword(auth, email, password);
      
      // Create user profile
      await setDoc(doc(db, 'users', result.user.uid), {
        email: email,
        displayName: displayName,
        createdAt: new Date(),
        lastLogin: new Date()
      });

      toast.success('Account created successfully! 🎉');
      return result;
    } catch (error) {
      console.error('Sign up error:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      toast.success('Logged out successfully');
    } catch (error) {
      console.error('Logout error:', error);
      toast.error('Error logging out');
    }
  };

  const resetPassword = async (email) => {
    try {
      await sendPasswordResetEmail(auth, email);
      toast.success('Password reset email sent!');
    } catch (error) {
      console.error('Password reset error:', error);
      throw error;
    }
  };

  const hasAccessToSemester = (semesterId) => {
    return userSemesters.some(semester => semester.semesterId === semesterId);
  };

  const value = {
    user,
    loading,
    userSemesters,
    signIn,
    signUp,
    logout,
    resetPassword,
    hasAccessToSemester,
    loadUserSemesters
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
