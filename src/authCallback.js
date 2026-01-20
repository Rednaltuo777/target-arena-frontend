import { useEffect, useRef } from "react"
import { supabase } from "./lib/supabase"

export default function AuthCallback({ onLogin }) {
  const hasInitialized = useRef(false)

  useEffect(() => {
    if (hasInitialized.current) return
    hasInitialized.current = true

    const init = async () => {
      const { data, error } = await supabase.auth.getSession()
      console.log("BOOT SESSION:", data?.session)

      if (error) {
        console.error("Session error:", error)
        return
      }

      if (data?.session) {
        onLogin(data.session.user)
      }
    }

    init()

    const { data } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        console.log("AUTH EVENT:", _event, session)
        if (session) {
          onLogin(session.user)
        }
      }
    )

    return () => {
      data?.subscription?.unsubscribe()
    }
  }, [])

  return null
}
