import { useState } from "react";
import { useSelector } from "react-redux";
import { selectuser } from "../../Feature/Userslice";
import { useLanguage } from "../../Context/language_context";

const plans = [
  { name: "FREE", labelKey: "free", price: 0, applications: 1, color: "#6b7280" },
  { name: "BRONZE", labelKey: "bronze", price: 100, applications: 3, color: "#cd7f32" },
  { name: "SILVER", labelKey: "silver", price: 300, applications: 5, color: "#c0c0c0" },
  { name: "GOLD", labelKey: "gold", price: 1000, applications: -1, color: "#ffd700" },
];

export default function Subscription() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const user = useSelector(selectuser);
  const { t } = useLanguage();

  const checkTime = () => {
    const now = new Date();
    const hours = now.getHours();
    const minutes = now.getMinutes();
    const totalMinutes = hours * 60 + minutes;
    const start = 10 * 60;
    const end = 11 * 60;
    return totalMinutes >= start && totalMinutes < end;
  };

  const handlePayment = async (plan: any) => {
    if (plan.price === 0) {
      setMessage(t("alreadyFreePlan"));
      return;
    }

    if (!user) {
      setMessage("❌ " + t("loginToSubscribe"));
      return;
    }

    if (!checkTime()) {
      alert(t("paymentTimeAlert"));
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      const res = await fetch("https://internshala-clone-63g9.onrender.com/api/payment/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan: plan.name }),
      });

      const data = await res.json();

      if (!res.ok) {
        setMessage("❌ " + (data.message || data.error || t("somethingWentWrong")));
        setLoading(false);
        return;
      }

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: data.amount,
        currency: "INR",
        name: "InternArea",
        description: `${t(plan.labelKey)} Plan Subscription`,
        order_id: data.id,
        prefill: {
          email: user.email,
          name: user.name,
        },
        handler: async (response: any) => {
          try {
            const verify = await fetch("https://internshala-clone-63g9.onrender.com/api/payment/verify-payment", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                plan: plan.name,
                userId: user.uid,
                email: user.email,
              }),
            });

            const result = await verify.json();

            if (result.success) {
              setMessage(`✅ ${t(plan.labelKey)} ${t("planActivated")}`);
            } else {
              setMessage("❌ " + result.message);
            }
          } catch (error) {
            setMessage("❌ " + t("paymentVerificationFailed"));
          }
          setLoading(false);
        },
        modal: {
          ondismiss: () => {
            setMessage("❌ " + t("paymentCancelled"));
            setLoading(false);
          }
        },
        theme: { color: "#0055cc" },
      };

      const razor = new (window as any).Razorpay(options);
      razor.open();

    } catch (error) {
      setMessage("❌ " + t("somethingWentWrong"));
      setLoading(false);
    }
  };

  const handleUnsubscribe = async () => {
    if (!user) return;
    const confirm = window.confirm(t("unsubscribeConfirm"));
    if (!confirm) return;

    try {
      const res = await fetch("https://internshala-clone-63g9.onrender.com/api/payment/unsubscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.uid }),
      });
      const data = await res.json();
      if (data.success) {
        setMessage("✅ " + t("unsubscribeSuccess"));
      }
    } catch (error) {
      setMessage("❌ " + t("somethingWentWrong"));
    }
  };

  return (
    <div style={{ maxWidth: "1000px", margin: "40px auto", padding: "20px" }}>

      <h1 style={{
        textAlign: "center",
        color: "#000",
        fontSize: "32px",
        fontWeight: "bold",
        marginBottom: "10px"
      }}>
        {t("choosePlan")}
      </h1>

      <p style={{ textAlign: "center", color: "#555", marginBottom: "10px" }}>
        ⏰ {t("paymentTime")}
      </p>

      {!user && (
        <p style={{ textAlign: "center", color: "red", marginBottom: "20px" }}>
          ⚠️ {t("loginToSubscribe")}
        </p>
      )}

      {message && (
        <p style={{
          textAlign: "center",
          fontWeight: "bold",
          fontSize: "16px",
          color: message.includes("✅") ? "green" : "red",
          marginBottom: "20px",
          padding: "10px",
          backgroundColor: message.includes("✅") ? "#f0fff0" : "#fff0f0",
          borderRadius: "8px",
          border: message.includes("✅") ? "1px solid green" : "1px solid red",
        }}>
          {message}
        </p>
      )}

      <div style={{
        display: "flex",
        gap: "20px",
        flexWrap: "wrap",
        justifyContent: "center"
      }}>
        {plans.map((plan) => (
          <div key={plan.name} style={{
            border: `2px solid ${plan.color}`,
            borderRadius: "12px",
            padding: "30px 20px",
            width: "200px",
            textAlign: "center",
            backgroundColor: "#fff",
            boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
            transition: "transform 0.2s",
          }}>
            <h2 style={{
              color: plan.color,
              fontSize: "22px",
              marginBottom: "10px",
              fontWeight: "bold"
            }}>
              {t(plan.labelKey)}
            </h2>

            <p style={{
              fontSize: "28px",
              fontWeight: "bold",
              color: "#000",
              marginBottom: "10px"
            }}>
              {plan.price === 0 ? t("free") : `₹${plan.price}/mo`}
            </p>

            <p style={{ color: "#555", marginBottom: "20px", fontSize: "14px" }}>
              {plan.applications === -1 ? t("unlimited") : plan.applications} {t("applicationsPerMonth")}
            </p>

            <button
              onClick={() => handlePayment(plan)}
              disabled={loading || plan.price === 0}
              style={{
                padding: "10px 20px",
                backgroundColor: plan.price === 0 ? "#e5e7eb" : plan.color,
                color: plan.price === 0 ? "#6b7280" : "#fff",
                border: "none",
                borderRadius: "8px",
                cursor: plan.price === 0 ? "not-allowed" : "pointer",
                fontWeight: "bold",
                width: "100%",
                fontSize: "16px",
                opacity: loading ? 0.7 : 1,
              }}
            >
              {loading ? t("processing") : plan.price === 0 ? t("currentPlan") : t("subscribe")}
            </button>

            {plan.price !== 0 && (
              <button
                onClick={handleUnsubscribe}
                style={{
                  marginTop: "10px",
                  padding: "8px 20px",
                  backgroundColor: "#fff",
                  color: "red",
                  border: "1px solid red",
                  borderRadius: "8px",
                  cursor: "pointer",
                  fontWeight: "bold",
                  width: "100%",
                  fontSize: "14px",
                }}
              >
                {t("unsubscribe")}
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}