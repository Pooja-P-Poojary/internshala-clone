import { useState } from "react";
import { useLanguage } from "../Context/language_context";
import { useSelector } from "react-redux";
import { selectuser } from "../Feature/Userslice";

const languages = [
  { code: "eng", label: "English", flag: "🇬🇧" },
  { code: "esp", label: "Spanish", flag: "🇪🇸" },
  { code: "hin", label: "Hindi", flag: "🇮🇳" },
  { code: "por", label: "Portuguese", flag: "🇧🇷" },
  { code: "chi", label: "Chinese", flag: "🇨🇳" },
  { code: "fre", label: "French", flag: "🇫🇷" },
];

export default function LanguageSelector() {
  const { language, changeLanguage, otpRequired, setOtpRequired, pendingLanguage } = useLanguage();
  const user = useSelector(selectuser);

  const [showOtpModal, setShowOtpModal] = useState(false);
  const [otp, setOtp] = useState("");
  const [otpMessage, setOtpMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLanguageChange = async (code: string) => {
    if (code === "fre") {
      if (!user?.email) {
        alert("Please login first to switch to French!");
        return;
      }
      setShowOtpModal(true);
      setOtpMessage("");

      // Send OTP
      await fetch("https://internshala-clone-63g9.onrender.com/api/language/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: user.email }),
      });

      setOtpMessage("OTP sent to your email!");
      return;
    }

    // For other languages change directly
    await changeLanguage(code);
  };

  const handleVerifyOtp = async () => {
  if (!otp) {
    setOtpMessage("Please enter OTP!");
    return;
  }

  setLoading(true);

  try {
    const res = await fetch("https://internshala-clone-63g9.onrender.com/api/language/verify-otp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ otp, email: user.email }),
    });

    const data = await res.json();

    if (data.success) {
      // ← Directly set language to French
      await changeLanguage("fre_verified");
      setShowOtpModal(false);
      setOtp("");
      setOtpMessage("");
    } else {
      setOtpMessage("❌ Invalid OTP! Please try again.");
    }
  } catch (error) {
    setOtpMessage("❌ Something went wrong!");
  }

  setLoading(false);
};

  return (
    <>
      {/* Language Selector Dropdown */}
      <select
        value={language}
        onChange={(e) => handleLanguageChange(e.target.value)}
        style={{
          padding: "6px 10px",
          borderRadius: "6px",
          border: "1px solid #ddd",
          fontSize: "14px",
          cursor: "pointer",
          backgroundColor: "#fff",
          color: "#333",
        }}
      >
        {languages.map((lang) => (
          <option key={lang.code} value={lang.code}>
            {lang.flag} {lang.label}
          </option>
        ))}
      </select>

      {/* OTP Modal for French */}
      {showOtpModal && (
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
          zIndex: 1000,
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
              🇫🇷 French Language Verification
            </h3>
            <p style={{ color: "#555", marginBottom: "20px", fontSize: "14px" }}>
              An OTP has been sent to <strong>{user?.email}</strong>
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
                fontSize: "20px",
                textAlign: "center",
                letterSpacing: "8px",
                border: "2px solid #0055cc",
                borderRadius: "8px",
                marginBottom: "15px",
                boxSizing: "border-box",
              }}
            />

            {otpMessage && (
              <p style={{
                color: otpMessage.includes("❌") ? "red" : "green",
                marginBottom: "15px",
                fontSize: "14px",
              }}>
                {otpMessage}
              </p>
            )}

            <button
              onClick={handleVerifyOtp}
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
              onClick={() => {
                setShowOtpModal(false);
                setOtp("");
                setOtpMessage("");
              }}
              style={{
                width: "100%",
                padding: "10px",
                backgroundColor: "#f5f5f5",
                color: "#333",
                border: "1px solid #ddd",
                borderRadius: "8px",
                fontSize: "16px",
                cursor: "pointer",
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </>
  );
}