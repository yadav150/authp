/* ============================================================
   Auth Service – Firebase Authentication Methods
   Wraps Firebase Auth SDK calls. Returns promises.
   Errors are returned with human-readable messages.
   ============================================================ */

import { auth } from './firebase-config.js';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  sendPasswordResetEmail,
  onAuthStateChanged,
  updateProfile
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import { getFirebaseErrorMessage } from './utils.js';

/**
 * Sign up a new user with email and password.
 * @param {string} email
 * @param {string} password
 * @param {string} [displayName] - optional display name
 * @returns {Promise<object>} user credential
 */
export async function signUpWithEmail(email, password, displayName) {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    // Set display name if provided
    if (displayName && userCredential.user) {
      await updateProfile(userCredential.user, { displayName });
    }
    return userCredential;
  } catch (error) {
    throw new Error(getFirebaseErrorMessage(error.code));
  }
}

/**
 * Sign in a user with email and password.
 * @param {string} email
 * @param {string} password
 * @returns {Promise<object>} user credential
 */
export async function signInWithEmail(email, password) {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return userCredential;
  } catch (error) {
    throw new Error(getFirebaseErrorMessage(error.code));
  }
}

/**
 * Sign in with Google pop-up.
 * @returns {Promise<object>} user credential
 */
export async function signInWithGoogle() {
  const provider = new GoogleAuthProvider();
  try {
    const result = await signInWithPopup(auth, provider);
    return result;
  } catch (error) {
    // If user cancels or popup blocked, still a controlled error
    throw new Error(getFirebaseErrorMessage(error.code));
  }
}

/**
 * Sign out the current user.
 * @returns {Promise<void>}
 */
export async function logout() {
  try {
    await signOut(auth);
  } catch (error) {
    throw new Error(getFirebaseErrorMessage(error.code));
  }
}

/**
 * Send password reset email.
 * @param {string} email
 * @returns {Promise<void>}
 */
export async function resetPassword(email) {
  try {
    await sendPasswordResetEmail(auth, email);
  } catch (error) {
    throw new Error(getFirebaseErrorMessage(error.code));
  }
}

/**
 * Get the currently signed-in user (or null).
 * @returns {object|null}
 */
export function getCurrentUser() {
  return auth.currentUser;
}

/**
 * Listen for auth state changes.
 * @param {function} callback - receives user or null
 * @returns {function} unsubscribe function
 */
export function onAuthChange(callback) {
  return onAuthStateChanged(auth, callback);
}
