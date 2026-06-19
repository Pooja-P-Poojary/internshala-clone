// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyC7VosA1EFkXsbKVqstligFQwSYok1gOKc",
  authDomain: "internshala-clone-36d62.firebaseapp.com",
  projectId: "internshala-clone-36d62",
  storageBucket: "internshala-clone-36d62.firebasestorage.app",
  messagingSenderId: "632606293380",
  appId: "1:632606293380:web:f0b3834231447708d631d1"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();
export { auth, provider };