import { useEffect, useState } from "react";
import { supabase } from "./supabaseClient";
import "./App.css";

export default function UserBooking() {
  const [weekStart, setWeekStart] = useState(getMonday(new Date()));
  const [slots, setSlots] = useState([]);
  const TOTAL_LANES = 9;

  useEffect(() => {
    loadSlots();
  }, [weekStart]);

  async function loadSlots() {
    const newSlots = [];

    for (let day = 0; day < 7; day++) {
      const date = new Date(weekStart);
      date.setDate(date.getDate() + day);

      for (let hour = 10; hour <= 21; hour++) {
        const start = new Date(date);
        start.setHours(hour, 0, 0, 0);

        const end = new Date(start);
        end.setMinutes(90);

        const { count } = await supabase
          .from("bookings")
          .select("*", { count: "exact", head: true })
          .lt("start_time", end.toISOString())
          .gt("end_time", start.toISOString());

        newSlots.push({
          date: date.toISOString().slice(0, 10),
          time: `${pad(hour)}:00 – ${pad(end.getHours())}:${pad(end.getMinutes())}`,
          free: TOTAL_LANES - (count || 0),
        });
      }
    }

    setSlots(newSlots);
  }

  return (
    <div className="page">
      <div className="booking-container">
        <div className="booking-header">
          <h2 className="booking-title">📅 Bokning (veckovy)</h2>
          <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
            <button className="nav-btn" onClick={() => shiftWeek(-7)}>⬅ Föregående</button>
            <button className="nav-btn" onClick={() => shiftWeek(7)}>Nästa ➡</button>
          </div>
        </div>

        <table className="slots-table">
          <thead>
            <tr>
              <th>Datum</th>
              <th>Tid (24h)</th>
              <th>Lediga banor</th>
            </tr>
          </thead>
          <tbody>
            {slots.map((s, i) => (
              <tr key={i}>
                <td>{s.date}</td>
                <td>{s.time}</td>
                <td className={s.free > 0 ? "free-slots" : "free-slots full"}>{s.free}</td>
              </tr>
            ))}
          </tbody>
        </table>
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
