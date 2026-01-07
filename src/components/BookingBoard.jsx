import { useEffect, useState } from "react"
import { supabase } from "../lib/supabase"

export default function BookingBoard() {
  const [ranges, setRanges] = useState([])
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState("")

  useEffect(() => {
    loadData()
  }, [])

  async function loadData() {
    setLoading(true)

    const { data: rangesData } = await supabase
      .from("ranges")
      .select("*")
      .eq("active", true)
      .order("name")

    const { data: bookingsData } = await supabase
      .from("bookings")
      .select("*")

    setRanges(rangesData || [])
    setBookings(bookingsData || [])
    setLoading(false)
  }

  async function createBooking(rangeId) {
    setMessage("")

    const start = new Date()
    start.setMinutes(0, 0, 0)
    start.setHours(start.getHours() + 1)

    const end = new Date(start)
    end.setMinutes(end.getMinutes() + 90)

    const { error } = await supabase.from("bookings").insert({
      range_id: rangeId,
      start_time: start.toISOString(),
      end_time: end.toISOString()
    })

    if (error) {
      setMessage("❌ Bokning misslyckades (tid upptagen eller max 1 bokning)")
    } else {
      setMessage("✅ Bokning skapad")
      loadData()
    }
  }

  if (loading) return <p>Laddar bokningar…</p>

  return (
    <div>
      <h2>Bokning – 25 m banor</h2>
      {message && <p>{message}</p>}

      {ranges.map(range => (
        <div key={range.id} style={{ marginBottom: 20 }}>
          <strong>{range.name}</strong>

          <button
            style={{ marginLeft: 10 }}
            onClick={() => createBooking(range.id)}
          >
            Boka nästa lediga (90 min)
          </button>

          <ul>
            {bookings
              .filter(b => b.range_id === range.id)
              .map(b => (
                <li key={b.id}>
                  {new Date(b.start_time).toLocaleString()} –{" "}
                  {new Date(b.end_time).toLocaleTimeString()}
                </li>
              ))}
          </ul>
        </div>
      ))}
    </div>
  )
}
