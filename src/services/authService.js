/**
 * Auth Service — Firebase Authentication wrappers.
 * Provides clean async functions for signup, login, logout,
 * Google sign-in, and password reset.
 */
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  GoogleAuthProvider,
  signInWithPopup,
  sendPasswordResetEmail,
  updateProfile,
} from 'firebase/auth';
import { auth } from './firebase';

const googleProvider = new GoogleAuthProvider();

/**
 * Register with email, password, and display name.
 */
export async function signUp(email, password, displayName) {
  const result = await createUserWithEmailAndPassword(auth, email, password);
  if (displayName) {
    await updateProfile(result.user, { displayName });
  }
  return result.user;
}

/**
 * Sign in with email and password.
 */
export async function logIn(email, password) {
  const result = await signInWithEmailAndPassword(auth, email, password);
  return result.user;
}

/**
 * Sign in with Google popup.
 */
export async function signInWithGoogle() {
  const result = await signInWithPopup(auth, googleProvider);
  return result.user;
}

/**
 * Sign out the current user.
 */
export async function logOut() {
  await signOut(auth);
}

/**
 * Send a password reset email.
 */
export async function resetPassword(email) {
  await sendPasswordResetEmail(auth, email);
}
