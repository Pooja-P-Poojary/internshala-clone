import React, { createContext, useContext, useState } from "react";

import eng from "../locales/eng.json";
import esp from "../locales/esp.json";
import hin from "../locales/hin.json";
import por from "../locales/por.json";
import chi from "../locales/chi.json";
import fre from "../locales/fre.json";

const translations: any = { eng, esp, hin, por, chi, fre };

interface LanguageContextType {
  language: string;
  t: (key: string) => string;
  changeLanguage: (lang: string, email?: string) => Promise<void>;
  otpRequired: boolean;
  setOtpRequired: (val: boolean) => void;
  pendingLanguage: string;
  setPendingLanguage: (val: string) => void;
}

const LanguageContext = createContext<LanguageContextType>({
  language: "eng",
  t: (key) => key,
  changeLanguage: async () => {},
  otpRequired: false,
  setOtpRequired: () => {},
  pendingLanguage: "",
  setPendingLanguage: () => {},
});

export const LanguageProvider = ({ children }: { children: React.ReactNode }) => {
  const [language, setLanguage] = useState("eng");
  const [otpRequired, setOtpRequired] = useState(false);
  const [pendingLanguage, setPendingLanguage] = useState("");

  const t = (key: string) => {
    return translations[language]?.[key] || key;
  };

 const changeLanguage = async (lang: string, email?: string) => {
  // Handle verified French
  if (lang === "fre_verified") {
    setLanguage("fre");
    setOtpRequired(false);
    setPendingLanguage("");
    return;
  }

  // Handle French - requires OTP
  if (lang === "fre") {
    setPendingLanguage("fre");
    setOtpRequired(true);
    if (email) {
      await fetch("http://localhost:5000/api/language/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
    }
    return;
  }

  // All other languages - change directly
  setLanguage(lang);
};

  const verifyOtpAndChange = async (otp: string, email: string) => {
    const res = await fetch("http://localhost:5000/api/language/verify-otp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ otp, email }),
    });
    const data = await res.json();
    if (data.success) {
      setLanguage(pendingLanguage);
      setOtpRequired(false);
      setPendingLanguage("");
    }
    return data;
  };

  return (
    <LanguageContext.Provider value={{
      language,
      t,
      changeLanguage,
      otpRequired,
      setOtpRequired,
      pendingLanguage,
      setPendingLanguage,
    }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);
export { LanguageContext };