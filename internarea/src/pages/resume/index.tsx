import { useState } from "react";
import { useRouter } from "next/router";
import { useSelector } from "react-redux";
import { selectuser } from "../../Feature/Userslice";

// ── Types ──────────────────────────────────────────────────────
interface Education {
  degree: string;
  institution: string;
  year: string;
  grade: string;
}

interface Experience {
  title: string;
  company: string;
  duration: string;
  location: string;
  description: string;
}

interface ResumeForm {
  fullName: string;
  phone: string;
  location: string;
  linkedin: string;
  photoUrl: string;
  summary: string;
  education: Education[];
  experience: Experience[];
  skills: string[];
  certifications: string;
}

type Step = "form" | "otp" | "payment" | "success";

// ── Styles ─────────────────────────────────────────────────────
const s = {
  page: {
    maxWidth: "680px",
    margin: "40px auto",
    padding: "0 20px 60px",
  } as React.CSSProperties,

  card: {
    backgroundColor: "#ffffff",
    borderRadius: "8px",
    boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
    padding: "30px",
    marginBottom: "20px",
  } as React.CSSProperties,

  heading: {
    color: "#000000",
    fontWeight: "bold",
    fontSize: "22px",
    marginBottom: "6px",
  } as React.CSSProperties,

  subheading: {
    color: "#000000",
    fontWeight: "bold",
    fontSize: "16px",
    marginBottom: "14px",
    marginTop: "20px",
  } as React.CSSProperties,

  label: {
    display: "block",
    color: "#000000",
    fontWeight: "bold",
    fontSize: "13px",
    marginBottom: "5px",
  } as React.CSSProperties,

  input: {
    width: "100%",
    padding: "10px",
    border: "1px solid #333",
    borderRadius: "5px",
    color: "#000000",
    fontSize: "14px",
    marginBottom: "14px",
    boxSizing: "border-box",
  } as React.CSSProperties,

  textarea: {
    width: "100%",
    padding: "10px",
    border: "1px solid #333",
    borderRadius: "5px",
    color: "#000000",
    fontSize: "14px",
    marginBottom: "14px",
    minHeight: "80px",
    resize: "vertical",
    boxSizing: "border-box",
  } as React.CSSProperties,

  row: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "12px",
  } as React.CSSProperties,

  btnPrimary: {
    width: "100%",
    padding: "11px",
    backgroundColor: "#005aff",
    color: "#ffffff",
    border: "none",
    borderRadius: "5px",
    fontSize: "15px",
    fontWeight: "bold",
    cursor: "pointer",
    marginTop: "6px",
  } as React.CSSProperties,

  btnOutline: {
    padding: "9px 20px",
    backgroundColor: "#ffffff",
    color: "#333",
    border: "1px solid #333",
    borderRadius: "5px",
    fontSize: "14px",
    cursor: "pointer",
  } as React.CSSProperties,

  btnSmall: {
    padding: "7px 14px",
    backgroundColor: "#f0f0f0",
    color: "#333",
    border: "1px solid #ccc",
    borderRadius: "5px",
    fontSize: "13px",
    cursor: "pointer",
  } as React.CSSProperties,

  btnDanger: {
    padding: "4px 10px",
    backgroundColor: "#fff0f0",
    color: "#cc0000",
    border: "1px solid #ffcccc",
    borderRadius: "4px",
    fontSize: "12px",
    cursor: "pointer",
  } as React.CSSProperties,

  dynamicItem: {
    backgroundColor: "#f9f9f9",
    border: "1px solid #ddd",
    borderRadius: "6px",
    padding: "14px",
    marginBottom: "10px",
  } as React.CSSProperties,

  error: {
    color: "red",
    fontWeight: "bold",
    marginTop: "10px",
    fontSize: "14px",
  } as React.CSSProperties,

  success: {
    color: "green",
    fontWeight: "bold",
    marginTop: "10px",
    fontSize: "14px",
  } as React.CSSProperties,

  otpBox: {
    display: "flex",
    gap: "10px",
    margin: "16px 0",
  } as React.CSSProperties,

  otpDigit: {
    width: "48px",
    height: "52px",
    textAlign: "center",
    fontSize: "22px",
    fontWeight: "bold",
    border: "1.5px solid #333",
    borderRadius: "6px",
    color: "#000",
  } as React.CSSProperties,

  stepBar: {
    display: "flex",
    justifyContent: "space-between",
    marginBottom: "28px",
    backgroundColor: "#ffffff",
    borderRadius: "8px",
    boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
    overflow: "hidden",
  } as React.CSSProperties,
};

// ── Empty templates ────────────────────────────────────────────
const emptyEdu = (): Education => ({ degree: "", institution: "", year: "", grade: "" });
const emptyExp = (): Experience => ({ title: "", company: "", duration: "", location: "", description: "" });

// ══════════════════════════════════════════════════════════════
export default function ResumePage() {
  const router = useRouter();

  const [step, setStep]     = useState<Step>("form");
  const [loading, setLoading] = useState(false);
  const [error, setError]   = useState("");
  const [message, setMessage] = useState("");

  // Form state
  const [form, setForm] = useState<ResumeForm>({
    fullName: "", phone: "", location: "", linkedin: "",
    photoUrl: "", summary: "", education: [emptyEdu()],
    experience: [emptyExp()], skills: [], certifications: "",
  });
  const [skillInput, setSkillInput] = useState("");

  // OTP state
  const [otpDigits, setOtpDigits] = useState(["", "", "", "", "", ""]);
  const [countdown, setCountdown]  = useState(0);

  // Payment state
  const [orderId, setOrderId]     = useState("");
  const [resumeId, setResumeId]   = useState("");
  
  const user = useSelector(selectuser);
  const email = user?.email;

  // ── Step indicator ───────────────────────────────────────────
  const steps: { key: Step; label: string }[] = [
    { key: "form",    label: "1. Details"  },
    { key: "otp",     label: "2. Verify"   },
    { key: "payment", label: "3. Payment"  },
    { key: "success", label: "4. Resume"   },
  ];

  // ── Form helpers ─────────────────────────────────────────────
  const setField = (field: keyof ResumeForm, value: any) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const updateEdu = (i: number, field: keyof Education, value: string) => {
    const updated = [...form.education];
    updated[i] = { ...updated[i], [field]: value };
    setField("education", updated);
  };

  const updateExp = (i: number, field: keyof Experience, value: string) => {
    const updated = [...form.experience];
    updated[i] = { ...updated[i], [field]: value };
    setField("experience", updated);
  };

  const addSkill = () => {
    const trimmed = skillInput.trim();
    if (trimmed && !form.skills.includes(trimmed)) {
      setField("skills", [...form.skills, trimmed]);
      setSkillInput("");
    }
  };

  const removeSkill = (skill: string) =>
    setField("skills", form.skills.filter((s) => s !== skill));

  // ── OTP helpers ──────────────────────────────────────────────
  const handleOtpInput = (index: number, value: string) => {
    if (!/^\d?$/.test(value)) return;
    const updated = [...otpDigits];
    updated[index] = value;
    setOtpDigits(updated);
    if (value && index < 5) {
      document.getElementById(`otp-${index + 1}`)?.focus();
    }
  };

  const handleOtpKey = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !otpDigits[index] && index > 0) {
      document.getElementById(`otp-${index - 1}`)?.focus();
    }
  };

  const startCountdown = () => {
    setCountdown(30);
    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) { clearInterval(interval); return 0; }
        return prev - 1;
      });
    }, 1000);
  };

 // ── Step 1 → Send OTP ────────────────────────────────────────
const handleSendOtp = async () => {
  setError("");
  if (!form.fullName || !form.phone || !form.summary || form.skills.length === 0) {
    setError("Please fill in all required fields.");
    return;
  }
  setLoading(true);
  try {
    const res = await fetch("https://internshala-clone-63g9.onrender.com/api/resume/send-otp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    const data = await res.json();
    if (!res.ok) { setError(data.message); return; }
    setStep("otp");
    startCountdown();
  } catch {
    setError("Server error. Please try again.");
  } finally {
    setLoading(false);
  }
};

// ── Step 2 → Verify OTP ──────────────────────────────────────
const handleVerifyOtp = async () => {
  setError("");
  const otp = otpDigits.join("");
  if (otp.length < 6) { setError("Please enter all 6 digits."); return; }
  setLoading(true);
  try {
    const res = await fetch("https://internshala-clone-63g9.onrender.com/api/resume/verify-otp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, otp }),
    });
    const data = await res.json();
    if (!res.ok) { setError(data.message); return; }

    const orderRes = await fetch("https://internshala-clone-63g9.onrender.com/api/resume/create-order", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    const orderData = await orderRes.json();
    if (!orderRes.ok) { setError(orderData.message); return; }

    setOrderId(orderData.orderId);
    setStep("payment");
  } catch {
    setError("Server error. Please try again.");
  } finally {
    setLoading(false);
  }
};

// ── Resend OTP ───────────────────────────────────────────────
const handleResendOtp = async () => {
  setError("");
  setOtpDigits(["", "", "", "", "", ""]);
  setLoading(true);
  try {
    const res = await fetch("https://internshala-clone-63g9.onrender.com/api/resume/send-otp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    const data = await res.json();
    if (!res.ok) { setError(data.message); return; }
    startCountdown();
  } catch {
    setError("Server error. Please try again.");
  } finally {
    setLoading(false);
  }
};

// ── Step 3 → Razorpay payment ────────────────────────────────
const handlePayment = () => {
  setError("");
  const options = {
    key:         process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
    amount:      5000,
    currency:    "INR",
    name:        "InternHub",
    description: "Premium Resume Builder",
    order_id:    orderId,
    handler: async (response: any) => {
      setLoading(true);
      try {
        const res = await fetch("https://internshala-clone-63g9.onrender.com/api/resume/verify-payment", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email,
            razorpay_order_id:   response.razorpay_order_id,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature:  response.razorpay_signature,
            resumeData:          form,
          }),
        });
        
        const data = await res.json();

        
        if (!res.ok) { setError(data.message); return; }
        setResumeId(data.resumeId);
        setStep("success");
      } catch {
        setError("Payment verification failed. Contact support.");
      } finally {
        setLoading(false);
      }
    },
    prefill: { email, contact: form.phone, name: form.fullName },
    theme:   { color: "#005aff" },
  };

if (!(window as any).Razorpay) {
  alert("Razorpay SDK not loaded");
  return;
}
  
  const rzp = new (window as any).Razorpay(options);
  rzp.on("payment.failed", (response: any) => {
    setError(`Payment failed: ${response.error.description}`);
  });
  rzp.open();
};

  // ══════════════════════════════════════════════════════════════
  return (
    <>
      {/* Razorpay SDK */}
      <script src="https://checkout.razorpay.com/v1/checkout.js" />

      <div style={s.page}>
        {/* ── Page title ── */}
        <h1 style={{ ...s.heading, fontSize: "26px", marginBottom: "4px" }}>
          Resume Builder
        </h1>
        <p style={{ color: "#555", marginBottom: "24px", fontSize: "14px" }}>
          Premium feature · ₹50 per resume · Auto-attached to your profile
        </p>

        {/* ── Step bar ── */}
        <div style={s.stepBar}>
          {steps.map((st) => (
            <div
              key={st.key}
              style={{
                flex: 1,
                padding: "12px 8px",
                textAlign: "center",
                fontSize: "13px",
                fontWeight: "bold",
                color: step === st.key ? "#005aff"
                  : steps.findIndex((x) => x.key === step) >
                    steps.findIndex((x) => x.key === st.key)
                  ? "green" : "#999",
                borderBottom: step === st.key ? "3px solid #005aff" : "3px solid transparent",
              }}
            >
              {st.label}
            </div>
          ))}
        </div>

        {/* ════════════ STEP 1 — FORM ════════════ */}
        {step === "form" && (
          <>
            {/* Personal info */}
            <div style={s.card}>
              <h2 style={s.heading}>Personal Information</h2>
              <p style={{ color: "#555", fontSize: "13px", marginBottom: "20px" }}>
                These details will appear on your resume.
              </p>

              <label style={s.label}>Full Name *</label>
              <input style={s.input} placeholder="Priya Sharma"
                value={form.fullName} onChange={(e) => setField("fullName", e.target.value)} />

              <div style={s.row}>
                <div>
                  <label style={s.label}>Phone *</label>
                  <input style={s.input} placeholder="+91 98765 43210"
                    value={form.phone} onChange={(e) => setField("phone", e.target.value)} />
                </div>
                <div>
                  <label style={s.label}>Location</label>
                  <input style={s.input} placeholder="Mumbai, Maharashtra"
                    value={form.location} onChange={(e) => setField("location", e.target.value)} />
                </div>
              </div>

              <label style={s.label}>LinkedIn URL</label>
              <input style={s.input} placeholder="linkedin.com/in/priya-sharma"
                value={form.linkedin} onChange={(e) => setField("linkedin", e.target.value)} />

              <label style={s.label}>Profile Photo URL</label>
              <input style={s.input} placeholder="https://..."
                value={form.photoUrl} onChange={(e) => setField("photoUrl", e.target.value)} />

              <label style={s.label}>Professional Summary *</label>
              <textarea style={s.textarea} placeholder="Brief overview of your profile and career goals..."
                value={form.summary} onChange={(e) => setField("summary", e.target.value)} />
            </div>

            {/* Education */}
            <div style={s.card}>
              <h2 style={s.heading}>Education</h2>
              {form.education.map((edu, i) => (
                <div key={i} style={s.dynamicItem}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "10px" }}>
                    <span style={{ fontWeight: "bold", fontSize: "13px", color: "#333" }}>
                      Education {i + 1}
                    </span>
                    {form.education.length > 1 && (
                      <button style={s.btnDanger}
                        onClick={() => setField("education", form.education.filter((_, idx) => idx !== i))}>
                        Remove
                      </button>
                    )}
                  </div>
                  <div style={s.row}>
                    <div>
                      <label style={s.label}>Degree / Course</label>
                      <input style={s.input} placeholder="B.Tech Computer Science"
                        value={edu.degree} onChange={(e) => updateEdu(i, "degree", e.target.value)} />
                    </div>
                    <div>
                      <label style={s.label}>Institution</label>
                      <input style={s.input} placeholder="IIT Bombay"
                        value={edu.institution} onChange={(e) => updateEdu(i, "institution", e.target.value)} />
                    </div>
                    <div>
                      <label style={s.label}>Year</label>
                      <input style={s.input} placeholder="2021–2025"
                        value={edu.year} onChange={(e) => updateEdu(i, "year", e.target.value)} />
                    </div>
                    <div>
                      <label style={s.label}>Grade / CGPA</label>
                      <input style={s.input} placeholder="8.5 / 10"
                        value={edu.grade} onChange={(e) => updateEdu(i, "grade", e.target.value)} />
                    </div>
                  </div>
                </div>
              ))}
              <button style={s.btnSmall}
                onClick={() => setField("education", [...form.education, emptyEdu()])}>
                + Add Education
              </button>
            </div>

            {/* Experience */}
            <div style={s.card}>
              <h2 style={s.heading}>Experience</h2>
              {form.experience.map((exp, i) => (
                <div key={i} style={s.dynamicItem}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "10px" }}>
                    <span style={{ fontWeight: "bold", fontSize: "13px", color: "#333" }}>
                      Experience {i + 1}
                    </span>
                    {form.experience.length > 1 && (
                      <button style={s.btnDanger}
                        onClick={() => setField("experience", form.experience.filter((_, idx) => idx !== i))}>
                        Remove
                      </button>
                    )}
                  </div>
                  <div style={s.row}>
                    <div>
                      <label style={s.label}>Job Title / Role</label>
                      <input style={s.input} placeholder="Frontend Intern"
                        value={exp.title} onChange={(e) => updateExp(i, "title", e.target.value)} />
                    </div>
                    <div>
                      <label style={s.label}>Company</label>
                      <input style={s.input} placeholder="Google"
                        value={exp.company} onChange={(e) => updateExp(i, "company", e.target.value)} />
                    </div>
                    <div>
                      <label style={s.label}>Duration</label>
                      <input style={s.input} placeholder="Jun 2024 – Aug 2024"
                        value={exp.duration} onChange={(e) => updateExp(i, "duration", e.target.value)} />
                    </div>
                    <div>
                      <label style={s.label}>Location</label>
                      <input style={s.input} placeholder="Bengaluru"
                        value={exp.location} onChange={(e) => updateExp(i, "location", e.target.value)} />
                    </div>
                  </div>
                  <label style={s.label}>Description</label>
                  <textarea style={s.textarea} placeholder="Key responsibilities and achievements..."
                    value={exp.description} onChange={(e) => updateExp(i, "description", e.target.value)} />
                </div>
              ))}
              <button style={s.btnSmall}
                onClick={() => setField("experience", [...form.experience, emptyExp()])}>
                + Add Experience
              </button>
            </div>

            {/* Skills */}
            <div style={s.card}>
              <h2 style={s.heading}>Skills & Certifications</h2>

              <label style={s.label}>Skills *</label>
              <div style={{ display: "flex", gap: "8px", marginBottom: "10px" }}>
                <input
                  style={{ ...s.input, marginBottom: 0, flex: 1 }}
                  placeholder="e.g. React"
                  value={skillInput}
                  onChange={(e) => setSkillInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && addSkill()}
                />
                <button style={s.btnSmall} onClick={addSkill}>Add</button>
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginBottom: "16px" }}>
                {form.skills.map((skill) => (
                  <span key={skill} style={{
                    backgroundColor: "#005aff",
                    color: "#fff",
                    padding: "4px 12px",
                    borderRadius: "20px",
                    fontSize: "13px",
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                  }}>
                    {skill}
                    <span style={{ cursor: "pointer", fontWeight: "bold" }}
                      onClick={() => removeSkill(skill)}>×</span>
                  </span>
                ))}
              </div>

              <label style={s.label}>Certifications & Achievements</label>
              <textarea style={s.textarea}
                placeholder="Google Data Analytics Certificate, Hackathon Winner..."
                value={form.certifications}
                onChange={(e) => setField("certifications", e.target.value)} />
            </div>

            {error && <p style={s.error}>{error}</p>}
            <button style={s.btnPrimary} onClick={handleSendOtp} disabled={loading}>
              {loading ? "Sending OTP..." : "Continue to Verification →"}
            </button>
          </>
        )}

        {/* ════════════ STEP 2 — OTP ════════════ */}
        {step === "otp" && (
          <div style={s.card}>
            <h2 style={s.heading}>Email Verification</h2>
            <p style={{ color: "#555", fontSize: "14px", marginBottom: "16px" }}>
              A 6-digit OTP has been sent to <strong>{email}</strong>
            </p>

            <div style={{
              backgroundColor: "#f0f9ff",
              border: "1px solid #0099ff",
              borderRadius: "6px",
              padding: "14px 16px",
              marginBottom: "16px",
              fontSize: "13px",
              color: "#333",
            }}>
              ✉️ Check your inbox and enter the OTP below. Valid for 10 minutes.
            </div>

            <label style={s.label}>Enter OTP</label>
            <div style={s.otpBox}>
              {otpDigits.map((digit, i) => (
                <input
                  key={i}
                  id={`otp-${i}`}
                  style={s.otpDigit}
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleOtpInput(i, e.target.value)}
                  onKeyDown={(e) => handleOtpKey(i, e)}
                />
              ))}
            </div>

            {/* Resend */}
            <p style={{ fontSize: "13px", color: "#555", marginBottom: "16px" }}>
              Didn't receive it?{" "}
              {countdown > 0 ? (
                <span style={{ color: "red", fontWeight: "bold" }}>Resend in {countdown}s</span>
              ) : (
                <span
                  style={{ color: "#005aff", cursor: "pointer", fontWeight: "bold" }}
                  onClick={handleResendOtp}
                >
                  Resend OTP
                </span>
              )}
            </p>

            {error && <p style={s.error}>{error}</p>}

            <div style={{ display: "flex", gap: "10px" }}>
              <button style={s.btnOutline} onClick={() => setStep("form")}>← Back</button>
              <button style={{ ...s.btnPrimary, marginTop: 0, flex: 1 }}
                onClick={handleVerifyOtp} disabled={loading}>
                {loading ? "Verifying..." : "Verify & Continue →"}
              </button>
            </div>
          </div>
        )}

        {/* ════════════ STEP 3 — PAYMENT ════════════ */}
        {step === "payment" && (
          <div style={s.card}>
            <h2 style={s.heading}>Complete Payment</h2>
            <p style={{ color: "#555", fontSize: "14px", marginBottom: "20px" }}>
              One-time fee to generate and attach your resume to your profile.
            </p>

            {/* Price box */}
            <div style={{
              backgroundColor: "#f0f9ff",
              border: "1px solid #005aff",
              borderRadius: "8px",
              padding: "20px",
              marginBottom: "20px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}>
              <div>
                <p style={{ fontWeight: "bold", color: "#000", fontSize: "16px" }}>
                  Resume Builder
                </p>
                <p style={{ color: "#555", fontSize: "13px" }}>
                  Premium · One-time · Auto-attached to profile
                </p>
              </div>
              <p style={{ fontSize: "28px", fontWeight: "bold", color: "#005aff" }}>₹50</p>
            </div>

            {/* Checklist */}
            {["ATS-optimised resume layout", "PDF download", "Shareable resume link", "Auto-fill for future applications"].map((item) => (
              <p key={item} style={{ fontSize: "14px", color: "#333", marginBottom: "8px" }}>
                ✅ {item}
              </p>
            ))}

            <div style={{
              backgroundColor: "#f0fff0",
              border: "1px solid #00aa00",
              borderRadius: "6px",
              padding: "10px 14px",
              margin: "16px 0",
              fontSize: "13px",
              color: "#006600",
              fontWeight: "bold",
            }}>
              ✔ Email verified successfully. You're cleared to pay.
            </div>

            {error && <p style={s.error}>{error}</p>}

            <div style={{ display: "flex", gap: "10px" }}>
              <button style={s.btnOutline} onClick={() => setStep("otp")}>← Back</button>
              <button
                style={{ ...s.btnPrimary, marginTop: 0, flex: 1, backgroundColor: "#006600" }}
                onClick={handlePayment}
                disabled={loading}
              >
                {loading ? "Processing..." : "🔒 Pay ₹50 via Razorpay"}
              </button>
            </div>
          </div>
        )}

        {/* ════════════ STEP 4 — SUCCESS ════════════ */}
        {step === "success" && (
          <>
            <div style={{
              backgroundColor: "#f0fff0",
              border: "1px solid #00aa00",
              borderRadius: "8px",
              padding: "30px",
              textAlign: "center",
              marginBottom: "20px",
            }}>
              <p style={{ fontSize: "40px", marginBottom: "10px" }}>🎉</p>
              <h2 style={{ color: "#006600", fontWeight: "bold", fontSize: "20px", marginBottom: "6px" }}>
                Resume Created Successfully!
              </h2>
              <p style={{ color: "#555", fontSize: "14px" }}>
                Payment confirmed · Resume saved and attached to your profile.
              </p>
            </div>

            <div style={s.card}>
              <p style={{ fontSize: "14px", color: "#333", marginBottom: "16px" }}>
                Resume ID: <strong style={{ color: "#005aff" }}>{resumeId}</strong>
              </p>
              <div style={{ display: "flex", gap: "10px" }}>
                <button style={s.btnPrimary}
                  onClick={() => router.push(`/resume/${resumeId}`)}>
                  View My Resume
                </button>
                <button style={s.btnOutline}
                  onClick={() => router.push("/dashboard")}>
                  Go to Dashboard
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </>
  );
}