import { useEffect, useState } from "react";
import { useRouter } from "next/router";

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

interface Resume {
  _id: string;
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
  paymentStatus: string;
  amountPaid: number;
  createdAt: string;
}

export default function ResumeViewPage() {
  const router = useRouter();
  const { id } = router.query;

  const [resume, setResume] = useState<Resume | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!id) return;
    const fetchResume = async () => {
      try {
        const res = await fetch(`https://internshala-clone-63g9.onrender.com/api/resume/${id}`);
        const data = await res.json();
        if (!res.ok) { setError(data.message); return; }
        setResume(data.resume);
      } catch {
        setError("Failed to load resume.");
      } finally {
        setLoading(false);
      }
    };
    fetchResume();
  }, [id]);

  if (loading) return (
    <div style={{ textAlign: "center", padding: "80px", color: "#555", fontSize: "16px" }}>
      Loading resume...
    </div>
  );

  if (error) return (
    <div style={{ textAlign: "center", padding: "80px", color: "red", fontSize: "16px" }}>
      {error}
    </div>
  );

  if (!resume) return null;

  const initials = resume.fullName
    .split(" ")
    .map((w) => w[0] || "")
    .join("")
    .substring(0, 2)
    .toUpperCase();

  return (
    <div style={{ maxWidth: "860px", margin: "40px auto", padding: "0 20px 80px" }}>

      {/* ── Top bar ── */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
        <button
          onClick={() => router.back()}
          style={{
            padding: "8px 18px",
            backgroundColor: "#fff",
            border: "1px solid #333",
            borderRadius: "5px",
            cursor: "pointer",
            fontSize: "14px",
          }}
        >
          ← Back
        </button>
        <button
          onClick={() => window.print()}
          style={{
            padding: "8px 18px",
            backgroundColor: "#005aff",
            color: "#fff",
            border: "none",
            borderRadius: "5px",
            cursor: "pointer",
            fontSize: "14px",
            fontWeight: "bold",
          }}
        >
          🖨 Print / Save PDF
        </button>
      </div>

      {/* ══════════════ RESUME ══════════════ */}
      <div
        id="resume-print"
        style={{
          backgroundColor: "#ffffff",
          boxShadow: "0 4px 24px rgba(0,0,0,0.12)",
          borderRadius: "8px",
          overflow: "hidden",
          fontFamily: "Arial, sans-serif",
        }}
      >

        {/* ── Header ── */}
        <div style={{
          backgroundColor: "#0f0e0c",
          padding: "32px 40px",
          display: "flex",
          alignItems: "center",
          gap: "24px",
        }}>
          {/* Avatar */}
          {resume.photoUrl ? (
            <img
              src={resume.photoUrl}
              alt="Photo"
              style={{
                width: "80px", height: "80px",
                borderRadius: "50%",
                objectFit: "cover",
                border: "3px solid #c9963a",
                flexShrink: 0,
              }}
            />
          ) : (
            <div style={{
              width: "80px", height: "80px",
              borderRadius: "50%",
              backgroundColor: "#c9963a",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: "28px", fontWeight: "bold", color: "#0f0e0c",
              flexShrink: 0,
            }}>
              {initials}
            </div>
          )}

          {/* Name + contacts */}
          <div>
            <h1 style={{ color: "#ffffff", fontSize: "26px", fontWeight: "bold", margin: 0 }}>
              {resume.fullName}
            </h1>
            {resume.skills.length > 0 && (
              <p style={{ color: "#f0d898", fontSize: "14px", margin: "4px 0 0" }}>
                {resume.skills.slice(0, 3).join(" · ")}
              </p>
            )}
            <div style={{ display: "flex", gap: "20px", marginTop: "10px", flexWrap: "wrap" }}>
              {resume.phone && (
                <span style={{ color: "#cccccc", fontSize: "13px" }}>📞 {resume.phone}</span>
              )}
              {resume.location && (
                <span style={{ color: "#cccccc", fontSize: "13px" }}>📍 {resume.location}</span>
              )}
              {resume.linkedin && (
                <span style={{ color: "#cccccc", fontSize: "13px" }}>🔗 {resume.linkedin}</span>
              )}
            </div>
          </div>
        </div>

        {/* ── Body ── */}
        <div style={{ display: "grid", gridTemplateColumns: "260px 1fr" }}>

          {/* ── Sidebar ── */}
          <div style={{
            backgroundColor: "#f7f5f0",
            padding: "28px",
            borderRight: "1px solid #e2ddd4",
          }}>

            {/* Education */}
            {resume.education.length > 0 && resume.education[0].degree && (
              <>
                <SectionTitle title="Education" />
                {resume.education.map((edu, i) => (
                  <div key={i} style={{ marginBottom: "14px" }}>
                    <p style={{ fontWeight: "bold", fontSize: "13px", color: "#0f0e0c", margin: 0 }}>
                      {edu.degree}
                    </p>
                    <p style={{ fontSize: "12px", color: "#666", margin: "2px 0 0" }}>
                      {edu.institution}
                      {edu.year ? ` · ${edu.year}` : ""}
                      {edu.grade ? ` · ${edu.grade}` : ""}
                    </p>
                  </div>
                ))}
              </>
            )}

            {/* Skills */}
            {resume.skills.length > 0 && (
              <>
                <SectionTitle title="Skills" />
                <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                  {resume.skills.map((skill) => (
                    <span key={skill} style={{
                      backgroundColor: "#0f0e0c",
                      color: "#faf8f3",
                      padding: "3px 10px",
                      borderRadius: "4px",
                      fontSize: "11px",
                      fontWeight: "500",
                    }}>
                      {skill}
                    </span>
                  ))}
                </div>
              </>
            )}

            {/* Certifications */}
            {resume.certifications && (
              <>
                <SectionTitle title="Certifications" />
                {resume.certifications.split("\n").filter(Boolean).map((cert, i) => (
                  <p key={i} style={{ fontSize: "12px", color: "#444", margin: "0 0 6px" }}>
                    • {cert}
                  </p>
                ))}
              </>
            )}

          </div>

          {/* ── Main ── */}
          <div style={{ padding: "28px" }}>

            {/* Summary */}
            {resume.summary && (
              <>
                <SectionTitle title="Profile Summary" />
                <p style={{ fontSize: "13px", color: "#444", lineHeight: "1.6", marginBottom: "20px" }}>
                  {resume.summary}
                </p>
              </>
            )}

            {/* Experience */}
            {resume.experience.length > 0 && resume.experience[0].title && (
              <>
                <SectionTitle title="Experience" />
                {resume.experience.map((exp, i) => (
                  <div key={i} style={{ marginBottom: "18px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                      <p style={{ fontWeight: "bold", fontSize: "14px", color: "#0f0e0c", margin: 0 }}>
                        {exp.title}
                      </p>
                      {exp.duration && (
                        <p style={{ fontSize: "12px", color: "#888", margin: 0, flexShrink: 0, marginLeft: "12px" }}>
                          {exp.duration}
                        </p>
                      )}
                    </div>
                    <p style={{ fontSize: "12px", color: "#c9963a", fontWeight: "500", margin: "2px 0" }}>
                      {exp.company}{exp.location ? ` · ${exp.location}` : ""}
                    </p>
                    {exp.description && (
                      <p style={{ fontSize: "12px", color: "#555", lineHeight: "1.5", margin: "6px 0 0" }}>
                        {exp.description}
                      </p>
                    )}
                  </div>
                ))}
              </>
            )}

          </div>
        </div>

        {/* ── Footer ── */}
        <div style={{
          backgroundColor: "#0f0e0c",
          padding: "10px 40px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}>
          <span style={{ fontSize: "11px", color: "#888" }}>
            Generated on {new Date(resume.createdAt).toLocaleDateString("en-IN")}
          </span>
          <span style={{ fontSize: "10px", color: "#c9963a", fontWeight: "bold", letterSpacing: "1px" }}>
            ★ INTERNHUB PREMIUM RESUME
          </span>
        </div>

      </div>

      {/* ── Print styles ── */}
      <style>{`
        @media print {
          body * { visibility: hidden; }
          #resume-print, #resume-print * { visibility: visible; }
          #resume-print { position: absolute; left: 0; top: 0; width: 100%; }
        }
      `}</style>

    </div>
  );
}

// ── Reusable section title ─────────────────────────────────────
function SectionTitle({ title }: { title: string }) {
  return (
    <p style={{
      fontSize: "10px",
      fontWeight: "bold",
      letterSpacing: "2px",
      textTransform: "uppercase",
      color: "#c9963a",
      borderBottom: "1.5px solid #f0d898",
      paddingBottom: "5px",
      marginBottom: "12px",
      marginTop: "20px",
    }}>
      {title}
    </p>
  );
}