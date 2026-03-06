import { useState, useEffect } from "react";
import Login from "./components/Login";
import FullNamePrompt from "./components/FullNamePrompt";
import ResetPassword from "./components/ResetPassword";
import BackgroundRotator from "./components/BackgroundRotator";
import UserBooking from "./UserBooking";
import CancelBooking from "./CancelBooking";
import AdminPanel from "./AdminPanel";
import Chat from "./Chat";
import { supabase } from "./lib/supabase";

export default function App() {
  const [user, setUser] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [fullName, setFullName] = useState("");
  const [loading, setLoading] = useState(true);
  const [forceReset, setForceReset] = useState(false);

  // Superadmin email
  const SUPERADMIN_EMAIL = "rednaltuo@gmail.com";

  // Kolla om det är cancel-route
  const isCancel = window.location.pathname === "/cancel";
  const isAdmin = window.location.pathname === "/admin";
  const isChat = window.location.pathname === "/chat";
  const isReset = window.location.pathname === "/reset";
  const isRecovery = window.location.hash.includes("type=recovery") || new URLSearchParams(window.location.search).get("type") === "recovery";

  useEffect(() => {
    const hasRecoveryFlag = window.location.hash.includes("type=recovery") || new URLSearchParams(window.location.search).get("type") === "recovery";
    if (hasRecoveryFlag) {
      sessionStorage.setItem("reset_password", "1");
      setForceReset(true);
    } else if (sessionStorage.getItem("reset_password") === "1") {
      setForceReset(true);
    }

    async function initAuth() {
      const { data } = await supabase.auth.getSession();
      
      if (data?.session) {
        const userData = data.session.user;
        setUser(userData);

        const isSuperadmin = userData.email === SUPERADMIN_EMAIL;
        let resolvedRole = isSuperadmin ? "superadmin" : "user";

        const { data: dbUser } = await supabase
          .from("users")
          .select("id, role, full_name")
          .eq("email", userData.email)
          .maybeSingle();

        if (dbUser) {
          if (isSuperadmin && dbUser.role !== "superadmin") {
            await supabase
              .from("users")
              .update({ role: "superadmin", approved: true })
              .eq("id", dbUser.id);
          }

          resolvedRole = isSuperadmin ? "superadmin" : dbUser.role || "user";
          setFullName(dbUser.full_name || "");
        } else {
          await supabase.from("users").insert({
            email: userData.email,
            user_id: userData.id,
            role: resolvedRole,
            approved: isSuperadmin,
          });
          setFullName("");
        }

        setUserRole(resolvedRole);
      }
      
      setLoading(false);
    }
    
    initAuth();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setUserRole(null);
    setLoading(false);
  };

  return (
    <>
      <BackgroundRotator />
      <div className="app-shell">
      {isCancel ? (
        <CancelBooking />
      ) : (isReset || isRecovery || forceReset) ? (
        <ResetPassword />
      ) : loading ? (
        <div className="page">
          <div className="card">
            <p style={{ color: "#94a3b8" }}>Laddar...</p>
          </div>
        </div>
      ) : !user ? (
        <Login />
      ) : !fullName ? (
        <FullNamePrompt user={user} onSaved={setFullName} />
      ) : isChat ? (
        <div className="page">
          <div className="booking-container" style={{ maxWidth: "900px" }}>
            <div className="booking-header">
              <h1 className="booking-title">💬 Chatt</h1>
              <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
                <button className="nav-btn" onClick={() => window.location.href = "/"}>
                  Tillbaka
                </button>
                {(userRole === "admin" || userRole === "superadmin") && (
                  <button className="nav-btn" onClick={() => window.location.href = "/admin"}>
                    Admin
                  </button>
                )}
                <button className="logout-btn" onClick={handleLogout}>
                  Logga ut
                </button>
              </div>
            </div>
            <Chat user={user} userRole={userRole} fullName={fullName} />
          </div>
        </div>
      ) : (isAdmin && (userRole === "admin" || userRole === "superadmin")) ? (
        <AdminPanel user={user} userRole={userRole} onLogout={handleLogout} fullName={fullName} />
      ) : (
        <UserBooking user={user} userRole={userRole} onLogout={handleLogout} fullName={fullName} />
      )}
      </div>
    </>
  );
}
