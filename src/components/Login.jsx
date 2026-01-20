import { useState } from "react";
import { supabase } from "../lib/supabase";
import "../App.css";

export default function Login() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);

  const sendMagicLink = async (e) => {
    e.preventDefault();
    setLoading(true);
    setStatus("");

    const redirectUrl = window.location.hostname === 'localhost' 
      ? 'http://localhost:5173' 
      : 'https://bokatargetarena.se'
    
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: redirectUrl
      }
    });

    setLoading(false);
    if (error) {
      setStatus("❌ Fel: " + error.message);
    } else {
      setStatus("✅ Kolla din e-post för inloggningslänk");
      setEmail("");
    }
  };

  return (
    <div className="page">
      <div className="card">
        <h1 style={{ fontSize: "32px", marginBottom: "10px", fontWeight: "700" }}>🎯 Target Arena</h1>
        <p className="subtitle">Boka din tid på banan</p>

        <form onSubmit={sendMagicLink} style={{ marginTop: "30px" }}>
          <input
            type="email"
            placeholder="Din e-postadress"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={{
              width: "100%",
              padding: "12px 16px",
              borderRadius: "10px",
              border: "1px solid #1e293b",
              background: "#1a1f35",
              color: "#e5e7eb",
              fontSize: "14px",
              marginBottom: "16px",
              outline: "none",
              transition: "all 0.3s ease"
            }}
            onFocus={(e) => e.target.style.borderColor = "#475569"}
            onBlur={(e) => e.target.style.borderColor = "#1e293b"}
          />
          <button 
            type="submit"
            disabled={loading}
            style={{
              width: "100%",
              padding: "12px",
              background: "#3b82f6",
              border: "none",
              borderRadius: "10px",
              color: "white",
              fontWeight: "600",
              cursor: loading ? "not-allowed" : "pointer",
              opacity: loading ? 0.7 : 1,
              transition: "all 0.3s ease",
              fontSize: "15px"
            }}
            onMouseEnter={(e) => !loading && (e.target.style.background = "#2563eb", e.target.style.transform = "translateY(-2px)")}
            onMouseLeave={(e) => !loading && (e.target.style.background = "#3b82f6", e.target.style.transform = "translateY(0)")}
          >
            {loading ? "Skickar..." : "Skicka inloggningslänk"}
          </button>
        </form>

        {status && (
          <p style={{
            marginTop: "20px",
            padding: "12px",
            borderRadius: "8px",
            background: status.includes("✅") ? "rgba(16, 185, 129, 0.1)" : "rgba(239, 68, 68, 0.1)",
            color: status.includes("✅") ? "#10b981" : "#ef4444",
            fontSize: "14px"
          }}>
            {status}
          </p>
        )}
      </div>
    </div>
  );
}
