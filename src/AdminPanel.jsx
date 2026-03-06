import { useEffect, useState } from "react";
import { supabase } from "./lib/supabase";
import "./App.css";

export default function AdminPanel({ onLogout }) {
  const [ranges, setRanges] = useState([]);
  const [date, setDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [lanes, setLanes] = useState(1);
  const [loading, setLoading] = useState(true);

  // 🔄 Ladda tider
  const loadRanges = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("available_slots")
      .select("*")
      .order("start_time", { ascending: true });

    if (!error) setRanges(data || []);
    setLoading(false);
  };

  useEffect(() => {
    loadRanges();
  }, []);

  // ➕ Skapa ny tid
  const createTime = async () => {
    if (!date || !startTime) {
      alert("Fyll i datum och starttid");
      return;
    }

    const start = new Date(`${date}T${startTime}:00`);
    const end = new Date(start);
    end.setMinutes(end.getMinutes() + 100);

    const { error } = await supabase.from("available_slots").insert({
      date,
      start_time: start.toISOString(),
      end_time: end.toISOString(),
      total_lanes: lanes,
    });

    if (error) {
      alert("Fel vid skapande av tid");
      console.error(error);
    } else {
      setStartTime("");
      loadRanges();
    }
  };

  const deleteTime = async (slotId) => {
    if (!window.confirm("Radera denna tid?")) return;

    const { error } = await supabase
      .from("available_slots")
      .delete()
      .eq("id", slotId);

    if (error) {
      alert("Fel vid radering av tid");
      console.error(error);
      return;
    }

    loadRanges();
  };

  return (
    <div className="page">
      <div className="booking-container">
        <div className="booking-header">
          <h1 className="booking-title">🛠 Adminpanel</h1>
          <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
            <button className="nav-btn" onClick={() => window.location.href = "/"}>
              Tillbaka
            </button>
            <button className="nav-btn" onClick={() => window.location.href = "/chat"}>
              Chatt
            </button>
            <button className="logout-btn" onClick={onLogout}>
              Logga ut
            </button>
          </div>
        </div>

        <h2 style={{ marginTop: 0 }}>➕ Skapa ny tid (100 min)</h2>

        <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
          <input
            type="date"
            lang="sv-SE"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />

          <input
            type="time"
            step="60"
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
          />

          <label style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ color: "#94a3b8", fontSize: "13px" }}>Antal banor</span>
            <select
              value={lanes}
              onChange={(e) => setLanes(Number(e.target.value))}
              style={{
                padding: "8px 12px",
                borderRadius: "10px",
                border: "1px solid #1e293b",
                background: "#0f172a",
                color: "#e5e7eb",
                fontWeight: 600,
                minWidth: 90,
                appearance: "none",
                backgroundImage: "linear-gradient(45deg, transparent 50%, #94a3b8 50%), linear-gradient(135deg, #94a3b8 50%, transparent 50%)",
                backgroundPosition: "calc(100% - 16px) 50%, calc(100% - 11px) 50%",
                backgroundSize: "5px 5px, 5px 5px",
                backgroundRepeat: "no-repeat",
                paddingRight: "30px",
              }}
            >
            {Array.from({ length: 9 }, (_, i) => i + 1).map((value) => (
              <option key={value} value={value}>
                {value} bana{value === 1 ? "" : "or"}
              </option>
            ))}
            </select>
          </label>

          <button className="nav-btn" onClick={createTime}>Skapa tid</button>
        </div>

        <h2 style={{ marginTop: 30 }}>📋 Skapade tider</h2>
        {loading ? (
          <p style={{ color: "#94a3b8" }}>Laddar tider...</p>
        ) : ranges.length === 0 ? (
          <p style={{ color: "#94a3b8" }}>Inga tider skapade än.</p>
        ) : (
          <ul style={{ margin: 0, paddingLeft: 18 }}>
            {ranges.map((r) => (
              <li key={r.id} style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
                <span>
                  {new Date(r.start_time).toLocaleString("sv-SE", {
                    weekday: "short",
                    year: "numeric",
                    month: "2-digit",
                    day: "2-digit",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                  {" – "}
                  {new Date(r.end_time).toLocaleTimeString("sv-SE", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                  {" | "}
                  Banor: {r.total_lanes}
                </span>
                <button className="logout-btn" style={{ padding: "6px 12px" }} onClick={() => deleteTime(r.id)}>
                  Radera
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
