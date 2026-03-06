import { useEffect, useState } from "react";
import { supabase } from "./lib/supabase";
import "./App.css";

export default function UserBooking({ userRole, onLogout }) {
  const [weekStart, setWeekStart] = useState(getMonday(new Date()));
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSlots();
  }, [weekStart]);

  async function loadSlots() {
    setLoading(true);
    const startDate = weekStart.toISOString().slice(0, 10);
    const endDate = new Date(weekStart);
    endDate.setDate(endDate.getDate() + 6);
    const endDateStr = endDate.toISOString().slice(0, 10);

    const { data: available } = await supabase
      .from("available_slots")
      .select("*")
      .gte("date", startDate)
      .lte("date", endDateStr)
      .order("start_time", { ascending: true });

    const newSlots = [];
    for (const slot of available || []) {
      const slotStart = new Date(slot.start_time);
      const slotEnd = new Date(slot.end_time);

      const { count } = await supabase
        .from("bookings")
        .select("*", { count: "exact", head: true })
        .lt("start_time", slotEnd.toISOString())
        .gt("end_time", slotStart.toISOString());

      newSlots.push({
        id: slot.id,
        date: slot.date,
        start: slotStart,
        end: slotEnd,
        totalLanes: slot.total_lanes || 0,
        free: (slot.total_lanes || 0) - (count || 0),
      });
    }

    setSlots(newSlots);
    setLoading(false);
  }

  return (
    <div className="page">
      <div className="booking-container">
        <div className="booking-header">
          <h2 className="booking-title">📅 Bokning (veckovy)</h2>
          <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
            <button className="nav-btn" onClick={() => shiftWeek(-7)}>⬅ Föregående</button>
            <button className="nav-btn" onClick={() => shiftWeek(7)}>Nästa ➡</button>
            {(userRole === "admin" || userRole === "superadmin") && (
              <button className="nav-btn" onClick={() => window.location.href = "/admin"}>
                Admin
              </button>
            )}
            <button className="nav-btn" onClick={() => window.location.href = "/chat"}>
              Chatt
            </button>
            <button className="logout-btn" onClick={onLogout}>
              Logga ut
            </button>
          </div>
        </div>

        {loading ? (
          <p style={{ color: "#94a3b8" }}>Laddar tider...</p>
        ) : slots.length === 0 ? (
          <p style={{ color: "#94a3b8" }}>Inga tider skapade än.</p>
        ) : (
          <table className="slots-table">
            <thead>
              <tr>
                <th>Datum</th>
                <th>Tid (24h)</th>
                <th>Lediga banor</th>
              </tr>
            </thead>
            <tbody>
              {slots.map((s) => (
                <tr key={s.id}>
                  <td>{s.date}</td>
                  <td>
                    {s.start.toLocaleTimeString("sv-SE", { hour: "2-digit", minute: "2-digit" })}
                    {" – "}
                    {s.end.toLocaleTimeString("sv-SE", { hour: "2-digit", minute: "2-digit" })}
                  </td>
                  <td className={s.free > 0 ? "free-slots" : "free-slots full"}>{s.free}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );

  function shiftWeek(days) {
    const d = new Date(weekStart);
    d.setDate(d.getDate() + days);
    setWeekStart(getMonday(d));
  }
}

/* ===== Helpers ===== */

function getMonday(date) {
  const d = new Date(date);
  const day = d.getDay() || 7;
  if (day !== 1) d.setDate(d.getDate() - day + 1);
  d.setHours(0, 0, 0, 0);
  return d;
}

function pad(n) {
  return n.toString().padStart(2, "0");
}
