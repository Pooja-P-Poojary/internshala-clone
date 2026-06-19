import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { selectuser } from "../../Feature/Userslice";
import { useLanguage } from "../../Context/language_context";

interface LoginRecord {
  _id: string;
  browser: string;
  os: string;
  deviceType: string;
  ipAddress: string;
  loginTime: string;
  status: string;
}

export default function LoginHistory() {
  const [history, setHistory] = useState<LoginRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const user = useSelector(selectuser);
  const { t } = useLanguage();

  useEffect(() => {
    if (user?.uid) {
      fetchHistory();
    } else {
      setLoading(false);
    }
  }, [user]);

  const fetchHistory = async () => {
    try {
      const res = await fetch(
        `https://internshala-clone-63g9.onrender.com/api/loginhistory/${user.uid}`
      );
      const data = await res.json();
      if (data.success) {
        setHistory(data.history);
      }
    } catch (error) {
      console.log("Error fetching history:", error);
    }
    setLoading(false);
  };

  if (!user) {
    return (
      <div style={{ textAlign: "center", marginTop: "100px" }}>
        <h2 style={{ color: "#000" }}>{t("loginToViewHistory")}</h2>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: "900px", margin: "40px auto", padding: "20px" }}>
      <h1 style={{ color: "#000", fontWeight: "bold", marginBottom: "20px" }}>
        🔐 {t("loginHistory")}
      </h1>

      <p style={{ color: "#555", marginBottom: "20px" }}>
        {t("showingHistoryFor")} <strong>{user.email}</strong>
      </p>

      {loading ? (
        <p style={{ color: "#555" }}>{t("loading")}</p>
      ) : history.length === 0 ? (
        <div style={{
          textAlign: "center",
          padding: "40px",
          backgroundColor: "#f9f9f9",
          borderRadius: "8px",
          color: "#555"
        }}>
          <p>{t("noLoginHistory")}</p>
          <p style={{ fontSize: "14px" }}>{t("historyWillAppear")}</p>
        </div>
      ) : (
        <table style={{
          width: "100%",
          borderCollapse: "collapse",
          boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
          borderRadius: "8px",
          overflow: "hidden",
        }}>
          <thead>
            <tr style={{ backgroundColor: "#0055cc", color: "#fff" }}>
              <th style={{ padding: "12px", textAlign: "left" }}>{t("browser")}</th>
              <th style={{ padding: "12px", textAlign: "left" }}>{t("os")}</th>
              <th style={{ padding: "12px", textAlign: "left" }}>{t("device")}</th>
              <th style={{ padding: "12px", textAlign: "left" }}>{t("ipAddress")}</th>
              <th style={{ padding: "12px", textAlign: "left" }}>{t("time")}</th>
              <th style={{ padding: "12px", textAlign: "left" }}>{t("status")}</th>
            </tr>
          </thead>
          <tbody>
            {history.map((record, index) => (
              <tr key={record._id} style={{
                backgroundColor: index % 2 === 0 ? "#f9f9f9" : "#fff",
                borderBottom: "1px solid #ddd",
              }}>
                <td style={{ padding: "12px", color: "#000000" }}>{record.browser}</td>
                <td style={{ padding: "12px", color: "#000000" }}>{record.os}</td>
                <td style={{ padding: "12px", color: "#000000" }}>{record.deviceType}</td>
                <td style={{ padding: "12px", color: "#000000" }}>{record.ipAddress}</td>
                <td style={{ padding: "12px", color: "#000000" }}>
                  {new Date(record.loginTime).toLocaleString()}
                </td>
                <td style={{ padding: "12px" }}>
                  <span style={{
                    padding: "4px 8px",
                    borderRadius: "4px",
                    backgroundColor: record.status === "success" ? "#d4edda" : "#f8d7da",
                    color: record.status === "success" ? "#155724" : "#721c24",
                    fontWeight: "bold",
                    fontSize: "12px",
                  }}>
                    {record.status === "success" ? t("success") : t("blocked")}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <div style={{ marginTop: "20px" }}>
        <a href="/profile" style={{ color: "#0055cc" }}>
          ← {t("backToProfile")}
        </a>
      </div>
    </div>
  );
}