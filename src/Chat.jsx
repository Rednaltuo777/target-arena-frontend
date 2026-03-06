import { useEffect, useState } from "react";
import { supabase } from "./lib/supabase";
import "./App.css";

export default function Chat({ user, userRole, fullName }) {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [slots, setSlots] = useState([]);
  const [selectedSlotId, setSelectedSlotId] = useState(null);
  const [unreadBySlot, setUnreadBySlot] = useState({});

  useEffect(() => {
    loadSlots();
  }, []);

  useEffect(() => {
    if (!selectedSlotId) return;

    loadMessages(selectedSlotId);
    markRead(selectedSlotId);

    const messagesSubscription = supabase
      .channel(`messages-slot-${selectedSlotId}`)
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'messages',
        filter: `slot_id=eq.${selectedSlotId}`
      }, (payload) => {
        if (payload.eventType === 'INSERT') {
          setMessages(prev => [...prev, payload.new]);
          markRead(selectedSlotId);
          refreshUnread();
        } else if (payload.eventType === 'DELETE') {
          setMessages(prev => prev.filter(m => m.id !== payload.old.id));
          refreshUnread();
        }
      })
      .subscribe();

    return () => {
      messagesSubscription.unsubscribe();
    };
  }, [selectedSlotId]);

  async function loadSlots() {
    const today = new Date().toISOString().split("T")[0];
    const { data } = await supabase
      .from("available_slots")
      .select("*")
      .gte("date", today)
      .order("start_time", { ascending: true });

    const slotList = data || [];
    setSlots(slotList);

    const params = new URLSearchParams(window.location.search);
    const paramSlot = Number(params.get("slotId"));

    if (!selectedSlotId && slotList.length > 0) {
      if (paramSlot && slotList.some(s => s.id === paramSlot)) {
        setSelectedSlotId(paramSlot);
      } else {
        setSelectedSlotId(slotList[0].id);
      }
    }

    if (slotList.length > 0) {
      refreshUnread(slotList.map(s => s.id));
    }
  }

  async function loadMessages(slotId) {
    setLoading(true);
    const { data, error } = await supabase
      .from("messages")
      .select("*")
      .eq("slot_id", slotId)
      .order("created_at", { ascending: true });

    if (!error && data) {
      setMessages(data);
    }
    setLoading(false);
  }

  async function markRead(slotId) {
    if (!slotId) return;
    await supabase
      .from("chat_reads")
      .upsert({
        user_id: user.id,
        slot_id: slotId,
        last_seen_at: new Date().toISOString()
      }, { onConflict: "user_id,slot_id" });
  }

  async function refreshUnread(slotIdsParam) {
    const slotIds = slotIdsParam || slots.map(s => s.id);
    if (slotIds.length === 0) return;

    const { data: reads } = await supabase
      .from("chat_reads")
      .select("slot_id, last_seen_at")
      .eq("user_id", user.id)
      .in("slot_id", slotIds);

    const readMap = {};
    (reads || []).forEach(r => {
      readMap[r.slot_id] = r.last_seen_at;
    });

    const { data: messagesData } = await supabase
      .from("messages")
      .select("slot_id, created_at")
      .in("slot_id", slotIds)
      .order("created_at", { ascending: false });

    const latestMap = {};
    (messagesData || []).forEach(m => {
      if (!latestMap[m.slot_id]) {
        latestMap[m.slot_id] = m.created_at;
      }
    });

    const unread = {};
    slotIds.forEach(id => {
      const latest = latestMap[id];
      const lastSeen = readMap[id];
      if (!latest) {
        unread[id] = false;
        return;
      }
      if (!lastSeen) {
        unread[id] = true;
        return;
      }
      unread[id] = new Date(latest) > new Date(lastSeen);
    });

    setUnreadBySlot(unread);
  }

  async function sendMessage(e) {
    e.preventDefault();
    if (!newMessage.trim() || !fullName || !selectedSlotId) return;

    const { error } = await supabase
      .from("messages")
      .insert({
        user_email: user.email,
        user_name: fullName,
        slot_id: selectedSlotId,
        message: newMessage.trim()
      });

    if (!error) {
      setNewMessage("");
    }
  }

  async function deleteMessage(messageId) {
    const { error } = await supabase
      .from("messages")
      .delete()
      .eq("id", messageId);

    if (error) {
      console.error("Delete error:", error);
    }
  }

  const selectedSlot = slots.find(s => s.id === selectedSlotId);

  return (
    <div style={{
      padding: "20px",
      background: "rgba(30, 41, 59, 0.5)",
      borderRadius: "12px",
      margin: "0 auto"
    }}>
      <div style={{ marginBottom: "15px" }}>
        <label style={{ display: "block", color: "#94a3b8", fontSize: "13px", marginBottom: "6px" }}>
          Välj bokningsbar tid
        </label>
        <select
          value={selectedSlotId || ""}
          onChange={(e) => setSelectedSlotId(Number(e.target.value))}
          style={{
            width: "100%",
            padding: "10px",
            borderRadius: "8px",
            border: "1px solid #1e293b",
            background: "#1a1f35",
            color: "#e5e7eb",
            fontSize: "14px"
          }}
        >
          {slots.length === 0 && (
            <option value="" disabled>Inga tider skapade än</option>
          )}
          {slots.map((slot) => {
            const start = new Date(slot.start_time);
            const end = new Date(slot.end_time);
            const label = `${slot.date} ${start.toLocaleTimeString("sv-SE", { hour: "2-digit", minute: "2-digit" })}-${end.toLocaleTimeString("sv-SE", { hour: "2-digit", minute: "2-digit" })} • ${slot.activity_type || "Precision C"}`;
            return (
              <option key={slot.id} value={slot.id}>
                {unreadBySlot[slot.id] ? "● " : ""}{label}
              </option>
            );
          })}
        </select>
      </div>

      <div style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: "15px",
        flexWrap: "wrap",
        gap: "10px"
      }}>
        <h3 style={{ margin: 0, color: "#e5e7eb" }}>💬 Chatt</h3>
        <span style={{ color: "#94a3b8", fontSize: "13px" }}>
          Inloggad som: {fullName}
        </span>
      </div>

      {selectedSlot && (
        <div style={{
          marginBottom: "10px",
          color: "#94a3b8",
          fontSize: "13px"
        }}>
          {selectedSlot.date} • {new Date(selectedSlot.start_time).toLocaleTimeString("sv-SE", { hour: "2-digit", minute: "2-digit" })}
          -{new Date(selectedSlot.end_time).toLocaleTimeString("sv-SE", { hour: "2-digit", minute: "2-digit" })}
          {selectedSlot.activity_type ? ` • ${selectedSlot.activity_type}` : ""}
        </div>
      )}

      <div style={{
        height: "60vh",
        maxHeight: "500px",
        minHeight: "300px",
        overflowY: "auto",
        background: "#0f172a",
        borderRadius: "8px",
        padding: "15px",
        marginBottom: "15px",
        border: "1px solid #1e293b"
      }}>
        {loading ? (
          <p style={{ color: "#94a3b8", textAlign: "center" }}>Laddar meddelanden...</p>
        ) : messages.length === 0 ? (
          <p style={{ color: "#94a3b8", textAlign: "center" }}>Inga meddelanden än. Var först att skriva!</p>
        ) : (
          messages.map((msg) => {
            const isOwnMessage = msg.user_email === user.email;
            const timestamp = new Date(msg.created_at).toLocaleString("sv-SE", {
              hour: "2-digit",
              minute: "2-digit",
              day: "2-digit",
              month: "2-digit"
            });

            return (
              <div
                key={msg.id}
                style={{
                  marginBottom: "12px",
                  padding: "10px",
                  background: isOwnMessage ? "rgba(59, 130, 246, 0.1)" : "rgba(30, 41, 59, 0.5)",
                  borderRadius: "8px",
                  borderLeft: isOwnMessage ? "3px solid #3b82f6" : "3px solid #64748b"
                }}
              >
                <div style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: "5px"
                }}>
                  <span style={{
                    fontWeight: "600",
                    color: isOwnMessage ? "#3b82f6" : "#cbd5e1",
                    fontSize: "13px"
                  }}>
                    {msg.user_name}
                  </span>
                  <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                    <span style={{ color: "#64748b", fontSize: "11px" }}>
                      {timestamp}
                    </span>
                    {(userRole === "admin" || userRole === "superadmin") && (
                      <button
                        onClick={() => deleteMessage(msg.id)}
                        style={{
                          padding: "2px 8px",
                          background: "#ef4444",
                          border: "none",
                          borderRadius: "4px",
                          color: "white",
                          fontSize: "11px",
                          cursor: "pointer"
                        }}
                      >
                        Radera
                      </button>
                    )}
                  </div>
                </div>
                <p style={{
                  margin: 0,
                  color: "#e5e7eb",
                  fontSize: "14px",
                  wordBreak: "break-word"
                }}>
                  {msg.message}
                </p>
              </div>
            );
          })
        )}
      </div>

      <form onSubmit={sendMessage} style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Skriv ett meddelande..."
          style={{
            flex: "1 1 200px",
            minWidth: "200px",
            padding: "12px",
            borderRadius: "8px",
            border: "1px solid #1e293b",
            background: "#1a1f35",
            color: "#e5e7eb",
            fontSize: "14px"
          }}
        />
        <button 
          type="submit"
          className="primary"
          style={{ width: "auto", padding: "12px 24px", marginBottom: 0, flexShrink: 0 }}
          disabled={!newMessage.trim() || !fullName || !selectedSlotId}
        >
          Skicka
        </button>
      </form>
    </div>
  );
}
