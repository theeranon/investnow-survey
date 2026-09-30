import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getAuth,
  signInWithPopup,
  GoogleAuthProvider,
  onAuthStateChanged,
  signOut as fbSignOut,
  User,
} from 'firebase/auth';
import firebaseConfig from '../../firebase-applet-config.json';

export const SCOPES = [
  'https://www.googleapis.com/auth/spreadsheets',
  'https://www.googleapis.com/auth/drive.file',
];

const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
export const auth = getAuth(app);

const provider = new GoogleAuthProvider();
SCOPES.forEach((scope) => provider.addScope(scope));

let isSigningIn = false;
let cachedAccessToken: string | null = null;

/**
 * Google only hands out the Sheets access token as part of the sign-in popup
 * result, and it is deliberately kept in memory rather than persisted. A page
 * reload therefore restores the Firebase user but not the token, so the user is
 * reported with a null token and the UI asks the admin to reconnect — dropping
 * the user entirely here made the admin screen look signed out for no reason.
 */
export const initAuth = (
  onAuthChange?: (user: User | null, token: string | null) => void
) => {
  return onAuthStateChanged(auth, async (user: User | null) => {
    if (!user) {
      cachedAccessToken = null;
    }
    if (isSigningIn) return;
    if (onAuthChange) onAuthChange(user, user ? cachedAccessToken : null);
  });
};

export const googleSignIn = async (): Promise<{ user: User; accessToken: string } | null> => {
  try {
    isSigningIn = true;
    const result = await signInWithPopup(auth, provider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    if (!credential?.accessToken) {
      throw new Error('ไม่สามารถรับ Access Token จาก Google OAuth ได้');
    }
    cachedAccessToken = credential.accessToken;
    return { user: result.user, accessToken: cachedAccessToken };
  } catch (error: unknown) {
    console.error('Google Sign In error:', error);
    throw error;
  } finally {
    isSigningIn = false;
  }
};

export const getAccessToken = async (): Promise<string | null> => {
  return cachedAccessToken;
};

export const logout = async () => {
  await fbSignOut(auth);
  cachedAccessToken = null;
};
