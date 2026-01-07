import { useEffect, useState } from "react";
import { supabase } from "./supabaseClient";

export default function AdminPanel() {
  const [ranges, setRanges] = useState([]);
  const [date, setDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [lanes, setLanes] = useState(1);

  // 🔄 Ladda tider
  const loadRanges = async () => {
    const { data, error } = await supabase
      .from("bookings")
      .select("*")
      .order("start_time", { ascending: true });

    if (!error) setRanges(data || []);
  };

  useEffect(() => {
    loadRanges();
  }, []);

  // ➕ Skapa ny tid
  const createTime = async () => {
    if (!date || !startTime || !endTime) {
      alert("Fyll i datum och tider");
      return;
    }

    const start = new Date(`${date}T${startTime}:00`);
    const end = new Date(`${date}T${endTime}:00`);

    if (end <= start) {
      alert("Sluttid måste vara efter starttid");
      return;
    }

    const { error } = await supabase.from("bookings").insert({
      start_time: start.toISOString(),
      end_time: end.toISOString(),
      lanes: lanes,
    });

    if (error) {
      alert("Fel vid skapande av tid");
      console.error(error);
    } else {
      setStartTime("");
      setEndTime("");
      loadRanges();
    }
  };

  return (
    <div style={{ padding: 20 }}>
      <h1>🛠 Adminpanel</h1>

      {/* ➕ Skapa ny tid */}
      <h2>➕ Skapa ny tid</h2>

      <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
        />

        <input
          type="time"
          step="60"
          value={startTime}
          onChange={(e) => setStartTime(e.target.value)}
        />

        <input
          type="time"
          step="60"
          value={endTime}
          onChange={(e) => setEndTime(e.target.value)}
        />

        <input
          type="number"
          min="1"
          value={lanes}
          onChange={(e) => setLanes(Number(e.target.value))}
          style={{ width: 60 }}
        />

        <button onClick={createTime}>Skapa tid</button>
      </div>

      {/* 📋 Skapade tider */}
      <h2 style={{ marginTop: 30 }}>📋 Skapade tider</h2>

      <ul>
        {ranges.map((r) => (
          <li key={r.id}>
            {new Date(r.start_time).toLocaleString("sv-SE", {
              weekday: "short",
              year: "numeric",
              month: "2-digit",
              day: "2-digit",
              hour: "2-digit",
              minute: "2-digit",
            })}
            {" – "}
            {new Date(r.end_time).toLocaleString("sv-SE", {
              hour: "2-digit",
              minute: "2-digit",
            })}
            {" | "}
            Banor: {r.lanes}
          </li>
        ))}
      </ul>
    </div>
  );
}
