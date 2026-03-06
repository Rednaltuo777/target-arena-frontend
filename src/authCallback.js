import { useEffect, useRef } from "react"
import { supabase } from "./lib/supabase"

export default function AuthCallback({ onLogin }) {
  const hasInitialized = useRef(false)

  useEffect(() => {
    if (hasInitialized.current) return
    hasInitialized.current = true

    const init = async () => {
      const { data } = await supabase.auth.getSession()
      if (data?.session) {
        onLogin(data.session.user)
      }
    }

    init()
  }, [])

  return null
}
