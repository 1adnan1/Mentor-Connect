import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore, serverTimestamp } from "firebase/firestore";

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAz95w6pfWS2GLGTEtDjd9TUxxgGexA3xk",
  authDomain: "mentor-login-auth.firebaseapp.com",
  projectId: "mentor-login-auth",
  storageBucket: "mentor-login-auth.appspot.com", // Fix the typo here
  messagingSenderId: "755291833002",
  appId: "1:755291833002:web:327fb4c1c72a5c848ec6d3",
  measurementId: "G-L32EEMZPZ7"
};

// Initialize Firebase App
const app = initializeApp(firebaseConfig);

// Initialize Auth and Firestore
export const auth = getAuth(app);
export const db = getFirestore(app); 
export default app;
export { serverTimestamp };
