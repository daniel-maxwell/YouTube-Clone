// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth, signInWithPopup, GoogleAuthProvider, onAuthStateChanged, User } from "firebase/auth";
import { getFunctions } from "firebase/functions";

// The web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDU7RqYsiXR6N-eNPTmN-t7AW0h2knYvxw",
  authDomain: "yt-clone-357a6.firebaseapp.com",
  projectId: "yt-clone-357a6",
  appId: "1:393869496761:web:0d40a3a5033a32955f6668",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
export const functions = getFunctions(app, 'europe-west2');

/**
 * Signs the user in with a Google popup.
 * @returns A promise that resolves with the user's credentias.
 */
export function signInWithGoogle() {
    return signInWithPopup(auth, new GoogleAuthProvider());
}

/**
 * Signs the user out.
 * @returns A promise that resolves when the user is signed out.
 */
export function signOut() {
    return auth.signOut();
}

/**
 * Trigger a callback when user auth state changes.
 * @returns A function to unsubscribe from the callback.
 */
export function onAuthStateChangedHelper(callback: (user: User | null) => void) {
    return onAuthStateChanged(auth, callback);
}