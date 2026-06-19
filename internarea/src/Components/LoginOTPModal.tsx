import { useState } from "react";
import { auth } from "../firebase/firebase";
import { signOut } from "firebase/auth";

interface Props {
  email: string;
  onVerified: () => void;
}

export default function LoginOTPModal({ email, onVerified }: Props) {
  const [otp, setOtp] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleVerify = async () => {
    if (!otp) {
      setMessage("Please enter OTP!");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("https://internshala-clone-63g9.onrender.com/api/loginhistory/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp }),
      });

      const data = await res.json();

      if (data.success) {
        localStorage.removeItem("pendingOTP");
        localStorage.removeItem("pendingEmail");
        onVerified();
      } else {
        setMessage("❌ " + data.message);
      }
    } catch (error) {
      setMessage("❌ Something went wrong!");
    }

    setLoading(false);
  };

  const handleCancel = async () => {
    localStorage.removeItem("pendingOTP");
    localStorage.removeItem("pendingEmail");
    await signOut(auth);
  };

  return (
    <div style={{
      position: "fixed",
      top: 0,
      left: 0,
      width: "100%",
      height: "100%",
      backgroundColor: "rgba(0,0,0,0.5)",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      zIndex: 9999,
    }}>
      <div style={{
        backgroundColor: "#fff",
        padding: "30px",
        borderRadius: "12px",
        width: "350px",
        textAlign: "center",
        boxShadow: "0 4px 20px rgba(0,0,0,0.3)",
      }}>
        <h3 style={{ color: "#0055cc", marginBottom: "10px" }}>
          🔐 Chrome Login Verification
        </h3>
        <p style={{ color: "#555", marginBottom: "20px", fontSize: "14px" }}>
          OTP sent to <strong>{email}</strong>
        </p>

        <input
          type="text"
          placeholder="Enter OTP"
          value={otp}
          onChange={(e) => setOtp(e.target.value)}
          maxLength={6}
          style={{
            width: "100%",
            padding: "10px",
            fontSize: "24px",
            textAlign: "center",
            letterSpacing: "8px",
            border: "2px solid #0055cc",
            borderRadius: "8px",
            marginBottom: "15px",
            boxSizing: "border-box",
            color:"#000",
          }}
        />

        {message && (
          <p style={{
            color: message.includes("❌") ? "red" : "green",
            marginBottom: "15px",
            fontSize: "14px",
          }}>
            {message}
          </p>
        )}

        <button
          onClick={handleVerify}
          disabled={loading}
          style={{
            width: "100%",
            padding: "10px",
            backgroundColor: "#0055cc",
            color: "#fff",
            border: "none",
            borderRadius: "8px",
            fontSize: "16px",
            cursor: "pointer",
            marginBottom: "10px",
          }}
        >
          {loading ? "Verifying..." : "Verify OTP"}
        </button>

        <button
          onClick={handleCancel}
          style={{
            width: "100%",
            padding: "10px",
            backgroundColor: "#fff",
            color: "#000000",
            border: "1px solid #ddd",
            fontWeight:"bold",
            borderRadius: "8px",
            fontSize: "16px",
            cursor: "pointer",
            opacity: 1,
            WebkitTextFillColor: "#000000"
          }}
        >
          Cancel Login
        </button>
      </div>
    </div>
  );
}