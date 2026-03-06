import { useState, useEffect } from "react";
import "./App.css";

export default function CancelBooking() {
  const [status, setStatus] = useState("loading");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const bookingId = params.get("id");

    if (!bookingId) {
      setStatus("error");
      setMessage("Ogiltigt boknings-ID");
      return;
    }

    cancelBooking(bookingId);
  }, []);

  async function cancelBooking(bookingId) {
    try {
      const response = await fetch("/api/cancel-booking", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bookingId }),
      });

      const data = await response.json();

      if (response.ok) {
        setStatus("success");
        setMessage("Din bokning har avbokats!");
        // Redirect to home after 2 seconds to refresh bookings
        setTimeout(() => {
          window.location.href = "/";
        }, 2000);
      } else {
        setStatus("error");
        setMessage("Avbokningen misslyckades: " + data.error);
      }
    } catch (error) {
      setStatus("error");
      setMessage("Ett fel uppstod vid avbokning");
      console.error(error);
    }
  }

  return (
    <div className="page">
      <div className="card">
        <h1 style={{ fontSize: "32px", marginBottom: "20px", fontWeight: "700" }}>
          🎯 Target Arena
        </h1>

        {status === "loading" && (
          <div>
            <p style={{ fontSize: "16px", color: "#94a3b8" }}>
              Avbokar din bokning...
            </p>
          </div>
        )}

        {status === "success" && (
          <div>
            <div
              style={{
                fontSize: "48px",
                marginBottom: "20px",
              }}
            >
              ✅
            </div>
            <p
              style={{
                fontSize: "18px",
                color: "#10b981",
                fontWeight: "600",
                marginBottom: "20px",
              }}
            >
              {message}
            </p>
            <p style={{ fontSize: "14px", color: "#94a3b8" }}>
              Du kan nu stänga den här sidan.
            </p>
            <a
              href="/"
              style={{
                display: "inline-block",
                marginTop: "20px",
                padding: "12px 24px",
                background: "#3b82f6",
                color: "white",
                textDecoration: "none",
                borderRadius: "8px",
                fontWeight: "600",
              }}
            >
              Tillbaka till startsidan
            </a>
          </div>
        )}

        {status === "error" && (
          <div>
            <div
              style={{
                fontSize: "48px",
                marginBottom: "20px",
              }}
            >
              ❌
            </div>
            <p
              style={{
                fontSize: "18px",
                color: "#ef4444",
                fontWeight: "600",
                marginBottom: "20px",
              }}
            >
              {message}
            </p>
            <a
              href="/"
              style={{
                display: "inline-block",
                marginTop: "20px",
                padding: "12px 24px",
                background: "#3b82f6",
                color: "white",
                textDecoration: "none",
                borderRadius: "8px",
                fontWeight: "600",
              }}
            >
              Tillbaka till startsidan
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
