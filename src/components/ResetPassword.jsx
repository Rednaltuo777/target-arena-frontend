import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import "../App.css";

export default function ResetPassword() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);
  const [hasSession, setHasSession] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const loadSession = async () => {
      const { data } = await supabase.auth.getSession();
      if (!isMounted) return;
      setHasSession(Boolean(data?.session));
      setChecking(false);
    };

    loadSession();

    return () => {
      isMounted = false;
    };
  }, []);

  const handleUpdatePassword = async (e) => {
    e.preventDefault();

    if (!hasSession) {
      setStatus("❌ Länken är ogiltig eller har gått ut");
      return;
    }

    if (password !== confirmPassword) {
      setStatus("❌ Lösenorden matchar inte");
      return;
    }

    setLoading(true);
    setStatus("");

    const { error } = await supabase.auth.updateUser({ password });

    setLoading(false);
    if (error) {
      setStatus("❌ Fel: " + error.message);
    } else {
      setStatus("✅ Lösenord uppdaterat. Du kan logga in");
      sessionStorage.removeItem("reset_password");
    }
  };

  return (
    <div className="page">
      <div className="card">
        <h1 style={{ fontSize: "28px", marginBottom: "10px", fontWeight: "700" }}>Nytt lösenord</h1>
        <p className="subtitle">Satt ett nytt lösenord för ditt konto</p>

        {checking ? (
          <p style={{ color: "#94a3b8" }}>Kontrollerar länken...</p>
        ) : (
          <form onSubmit={handleUpdatePassword} style={{ marginTop: "20px" }}>
            <input
              type="password"
              placeholder="Nytt lösenord"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
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
            <input
              type="password"
              placeholder="Bekräfta nytt lösenord"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
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
              disabled={loading || !hasSession}
              style={{
                width: "100%",
                padding: "12px",
                background: "#3b82f6",
                border: "none",
                borderRadius: "10px",
                color: "white",
                fontWeight: "600",
                cursor: loading || !hasSession ? "not-allowed" : "pointer",
                opacity: loading || !hasSession ? 0.7 : 1,
                transition: "all 0.3s ease",
                fontSize: "15px"
              }}
              onMouseEnter={(e) => !loading && hasSession && (e.target.style.background = "#2563eb", e.target.style.transform = "translateY(-2px)")}
              onMouseLeave={(e) => !loading && hasSession && (e.target.style.background = "#3b82f6", e.target.style.transform = "translateY(0)")}
            >
              {loading ? "Uppdaterar..." : "Spara nytt lösenord"}
            </button>
          </form>
        )}

        <button
          type="button"
          className="nav-btn"
          style={{ width: "100%", marginTop: "12px" }}
          onClick={() => window.location.href = "/"}
        >
          Till inloggning
        </button>

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
