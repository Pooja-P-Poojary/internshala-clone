import { useState } from "react";
import { useLanguage } from "../../Context/language_context";

export default function ForgotPassword() {
  const [identifier, setIdentifier] = useState("");
  const [message, setMessage] = useState("");
  const [warning, setWarning] = useState("");
  const { t } = useLanguage();

  const handleSubmit = async () => {
    const lastReset = localStorage.getItem("lastPasswordReset");
    const today = new Date().toDateString();

    if (lastReset === today) {
      setWarning(t("oncePerDay"));
      return;
    }

    const res = await fetch("/api/forgotpassword", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ identifier }),
    });

    const data = await res.json();

    if (res.ok) {
      localStorage.setItem("lastPasswordReset", today);
      setWarning("");
      setMessage(t("passwordResetSuccess"));
    } else {
      setWarning(data.message);
    }
  };

  return (
    <div style={{
      maxWidth: "400px",
      margin: "50px auto",
      padding: "30px",
      backgroundColor: "#ffffff",
      borderRadius: "8px",
      boxShadow: "0 2px 10px rgba(0,0,0,0.1)"
    }}>
      <h2 style={{ color: "#000000", fontWeight: "bold", marginBottom: "20px" }}>
        {t("forgotPassword")}
      </h2>

      <input
        type="text"
        placeholder={t("enterEmailOrPhone")}
        value={identifier}
        onChange={(e) => setIdentifier(e.target.value)}
        style={{
          width: "100%",
          padding: "10px",
          marginBottom: "15px",
          border: "1px solid #333",
          borderRadius: "5px",
          color: "#000000",
          fontSize: "16px"
        }}
      />

      <button
        onClick={handleSubmit}
        style={{
          width: "100%",
          padding: "10px",
          backgroundColor: "#005aff",
          color: "#ffffff",
          border: "none",
          borderRadius: "5px",
          fontSize: "16px",
          cursor: "pointer"
        }}
      >
        {t("resetPassword")}
      </button>

      {warning && (
        <p style={{ color: "red", marginTop: "10px", fontWeight: "bold" }}>
          {warning}
        </p>
      )}
      {message && (
        <p style={{ color: "green", marginTop: "10px", fontWeight: "bold" }}>
          {message}
        </p>
      )}
    </div>
  );
}