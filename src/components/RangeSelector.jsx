import { useEffect, useState } from "react"
import { supabase } from "../lib/supabase"

export default function RangeSelector({ onSelect }) {
  const [ranges, setRanges] = useState([])
  const [selectedId, setSelectedId] = useState(null)

  useEffect(() => {
    const loadRanges = async () => {
      const { data, error } = await supabase
        .from("ranges")
        .select("*")
        .eq("active", true)
        .order("name")

      if (error) {
        console.error("Kunde inte ladda banor:", error)
      } else {
        setRanges(data)
      }
    }

    loadRanges()
  }, [])

  const handleClick = (range) => {
    setSelectedId(range.id)
    onSelect(range)
  }

  return (
    <div style={{ marginTop: 20 }}>
      <h3>Välj bana</h3>

      <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
        {ranges.map((range) => (
          <button
            key={range.id}
            onClick={() => handleClick(range)}
            style={{
              padding: "10px 16px",
              borderRadius: 6,
              border: "1px solid #444",
              cursor: "pointer",
              backgroundColor:
                range.id === selectedId ? "#4caf50" : "#222",
              color: "white",
            }}
          >
            {range.name}
          </button>
        ))}
      </div>
    </div>
  )
}
