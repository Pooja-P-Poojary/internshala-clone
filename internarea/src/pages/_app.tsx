import Footer from "../Components/Fotter";
import Navbar from "../Components/Navbar";
import "../styles/globals.css";
import type { AppProps } from "next/app";
import { store } from "../store/store";
import { Provider, useDispatch } from "react-redux";
import { useEffect, useState } from "react";
import { auth } from "../firebase/firebase";
import { login, logout } from "../Feature/Userslice";
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { LanguageProvider } from "../Context/language_context";
import { getDeviceInfo } from "../utils/deviceinfo";
import LoginOTPModal from "../Components/LoginOTPModal";
import { signOut } from "firebase/auth";

function AuthListener() {
  const dispatch = useDispatch();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (authuser) => {
      if (authuser) {
        dispatch(
          login({
            uid: authuser.uid,
            photo: authuser.photoURL,
            name: authuser.displayName,
            email: authuser.email,
            phoneNumber: authuser.phoneNumber,
          })
        );

        try {
          const deviceInfo = getDeviceInfo();
          
          // Save login history
          const res = await fetch("http://localhost:5000/api/loginhistory/save", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
            userId: authuser.uid,
            email: authuser.email,
            browser: deviceInfo.browser,
            os: deviceInfo.os,
            deviceType: deviceInfo.deviceType,
            ipAddress: "fetched-on-backend",
          }),
        });

        const data = await res.json();
        // If Chrome - show OTP modal
        if (data.otpRequired) {
          localStorage.setItem("pendingOTP", "true");
          localStorage.setItem("pendingEmail", authuser.email || "");
        }

        // If mobile blocked
        if (data.blocked) {
          alert(data.message);
          await signOut(auth);
        }
        
        // Sync Firebase user to MongoDB (creates record if not exists)
        console.log("Firebase User:", authuser);
        console.log("Calling sync-firebase-user...");
        await fetch("/api/sync-firebase-user", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
          uid: authuser.uid,
          email: authuser.email,
          name: authuser.displayName,
          photo: authuser.photoURL,
        }),
      });
    } catch (error) {
    console.log("Login tracking error:", error);
  }

      } else {
        dispatch(logout());
      }
    });
  return () => unsubscribe();
  }, [dispatch]);
  
  return null;
}

export default function App({ Component, pageProps }: AppProps) {
  const [showOTPModal, setShowOTPModal] = useState(false);
  const [pendingEmail, setPendingEmail] = useState("");

  useEffect(() => {
    const pending = localStorage.getItem("pendingOTP");
    const email = localStorage.getItem("pendingEmail");
    const currentPath = window.location.pathname;

    // Don't show OTP modal on forgot password page
    if (pending === "true" && email && currentPath !== "/forgotpassword") {
      setShowOTPModal(true);
      setPendingEmail(email);
    }
  }, []);
  return (
    <Provider store={store}>
      <LanguageProvider>
        <AuthListener />
        <div className="bg-white">
          <ToastContainer />
          <Navbar />
          {showOTPModal && (
            <LoginOTPModal
              email={pendingEmail}
              onVerified={() => setShowOTPModal(false)}
            />
          )}
          <Component {...pageProps} />
          <Footer />
        </div>
      </LanguageProvider>
    </Provider>
  );
}