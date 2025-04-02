// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  // authDomain: "dating-app-8b47a.firebaseapp.com",
  authDomain: "connectia.live",
  projectId: "dating-app-8b47a",
  storageBucket: "dating-app-8b47a.firebasestorage.app",
  messagingSenderId: "406894078804",
  appId: "1:406894078804:web:586470425709e20dd1f6c1"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);