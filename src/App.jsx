import { useState } from "react";
import Login from "./components/Login";
import UserBooking from "./UserBooking";
import AuthCallback from "./authCallback";

export default function App() {
  const [user, setUser] = useState(null);

  const handleLogin = (userData) => {
    setUser(userData);
  };

  const handleLogout = async () => {
    setUser(null);
  };

  return (
    <>
      <AuthCallback onLogin={handleLogin} />
      
      {!user ? (
        <Login />
      ) : (
        <UserBooking user={user} onLogout={handleLogout} />
      )}
    </>
  );
}
