import { useEffect, useState } from "react";
import { supabase } from "./supabaseClient";
import AdminPanel from "./AdminPanel";
import UserBooking from "./UserBooking";

export default function App() {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user);
    });

    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null);
      }
    );

    return () => listener.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single()
      .then(({ data, error }) => {
        if (error) {
          console.error(error);
        } else {
          setProfile(data);
        }
        setLoading(false);
      });
  }, [user]);

  if (loading) return <p>⏳ Laddar...</p>;
  if (!user) return <p>❌ Inte inloggad</p>;
  if (!profile) return <p>⚠️ Kunde inte läsa profil</p>;

  if (!profile.approved) {
    return <p>⏳ Ditt konto väntar på godkännande av admin.</p>;
  }

  if (profile.role === "admin") {
    return <AdminPanel />;
  }

  return <UserBooking />;
}
