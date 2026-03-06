import { useState } from "react";
import { supabase } from "../lib/supabase";
import "../App.css";

export default function FullNamePrompt({ user, onSaved }) {
  const [fullName, setFullName] = useState("");
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);

  const saveName = async (e) => {
    e.preventDefault();
    const trimmed = fullName.trim().replace(/\s+/g, " ");

    if (trimmed.split(" ").length < 2) {
      setStatus("❌ Ange både förnamn och efternamn");
      return;
    }

    setLoading(true);
    setStatus("");

    const { error } = await supabase
      .from("users")
      .update({ full_name: trimmed, chat_name: trimmed })
      .eq("email", user.email);

    setLoading(false);

    if (error) {
      setStatus("❌ Kunde inte spara namn: " + error.message);
      return;
    }

    setStatus("✅ Namn sparat");
    onSaved(trimmed);
  };

  return (
    <div className="page">
      <div className="card" style={{ maxWidth: "520px" }}>
        <h1 style={{ fontSize: "28px", marginBottom: "8px", fontWeight: "700" }}>👤 Ange ditt namn</h1>
        <p className="subtitle" style={{ marginBottom: "20px" }}>
          Första gången du loggar in behöver du skriva in ditt för- och efternamn.
          Namnet visas på bokningar och kan endast ändras av administratör.
        </p>

        <form onSubmit={saveName}>
          <input
            type="text"
            placeholder="Förnamn Efternamn"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
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
          >
            {loading ? "Sparar..." : "Spara namn"}
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
