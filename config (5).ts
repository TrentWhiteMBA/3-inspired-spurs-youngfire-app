import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// Check whether Firebase credentials are configured in environment variables
const apiKey = import.meta.env.VITE_FIREBASE_API_KEY;
const projectId = import.meta.env.VITE_FIREBASE_PROJECT_ID;
export const isMockFirebaseMode = !apiKey || !projectId || apiKey.includes('DummyKey');

let appInstance: any = null;
let authInstance: any = null;
let dbInstance: any = null;
let storageInstance: any = null;
let googleProviderInstance: any = null;

if (!isMockFirebaseMode) {
  try {
    const firebaseConfig = {
      apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
      authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || `${projectId}.firebaseapp.com`,
      projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
      storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || `${projectId}.appspot.com`,
      messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "366479892932",
      appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:366479892932:web:youngfireapplet"
    };

    appInstance = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
    authInstance = getAuth(appInstance);
    dbInstance = getFirestore(appInstance);
    storageInstance = getStorage(appInstance);
    googleProviderInstance = new GoogleAuthProvider();
  } catch (err) {
    console.warn('[Firebase] Initialization failed, engaging Local Demo Mock Mode:', err);
  }
}

// Fallback Mock Implementations for Local Demo Mode
if (!appInstance) {
  // Safe mock app
  appInstance = {
    name: '[DEMO_MOCK_APP]',
    options: {}
  };

  // Safe mock auth
  authInstance = {
    currentUser: {
      uid: 'demo_trent_white',
      email: 'trent@joshuahouseofworship.org',
      displayName: 'Trent D. White',
      photoURL: '/image_4.png'
    },
    onAuthStateChanged: (cb: any) => {
      // Simulate authenticated state with demo user
      const savedUser = localStorage.getItem('youngfire_user_session');
      if (savedUser) {
        try {
          const u = JSON.parse(savedUser);
          cb({
            uid: u.id || 'demo_user',
            email: u.email,
            displayName: u.name,
            photoURL: u.avatar
          });
        } catch {
          cb(authInstance.currentUser);
        }
      } else {
        cb(authInstance.currentUser);
      }
      return () => {};
    },
    signOut: async () => {
      localStorage.removeItem('youngfire_user_session');
      return Promise.resolve();
    }
  };

  // Safe mock firestore
  dbInstance = {
    type: 'mock-firestore',
    collection: (name: string) => ({
      name,
      doc: (id: string) => ({
        id,
        get: async () => ({ exists: () => false, data: () => null }),
        set: async () => Promise.resolve(),
        update: async () => Promise.resolve(),
        delete: async () => Promise.resolve()
      }),
      get: async () => ({ docs: [], empty: true }),
      add: async (data: any) => ({ id: `mock_${Date.now()}`, ...data })
    })
  };

  // Safe mock storage
  storageInstance = {
    type: 'mock-storage',
    ref: () => ({
      put: async () => Promise.resolve(),
      getDownloadURL: async () => Promise.resolve('/image_2.png')
    })
  };

  googleProviderInstance = class MockGoogleAuthProvider {};
}

export const app = appInstance;
export const auth = authInstance;
export const db = dbInstance;
export const storage = storageInstance;
export const googleProvider = googleProviderInstance;

// Mock-safe sign in / sign out helpers
export const mockSignInWithPopup = async (_auth: any, _provider: any) => {
  if (!isMockFirebaseMode && typeof signInWithPopup === 'function') {
    return signInWithPopup(_auth, _provider);
  }
  // Local Demo Auth Success
  const demoUser = {
    uid: 'demo_user_trent',
    displayName: 'Trent D. White',
    email: 'trent@joshuahouseofworship.org',
    photoURL: '/image_4.png'
  };
  localStorage.setItem('youngfire_user_session', JSON.stringify({
    id: 'roster_trent',
    name: 'Trent D. White',
    email: 'trent@joshuahouseofworship.org',
    role: 'Lead Facilitator & Overseer',
    group: 'Men On Fire',
    avatar: '/image_4.png'
  }));
  return { user: demoUser };
};

export const mockSignOut = async (_auth: any) => {
  if (!isMockFirebaseMode && typeof signOut === 'function') {
    return signOut(_auth);
  }
  localStorage.removeItem('youngfire_user_session');
  return Promise.resolve();
};

export { mockSignInWithPopup as signInWithPopup, mockSignOut as signOut };
export default app;
