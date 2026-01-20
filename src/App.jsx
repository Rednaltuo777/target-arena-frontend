import { useState } from "react";
import AuthCallback from "./authCallback";
import Login from "./components/Login";
import UserBooking from "./UserBooking";

function App() {
  const [user, setUser] = useState(null);

  return (
    <>
      <AuthCallback onLogin={setUser} />
      {user ? <UserBooking user={user} onLogout={() => setUser(null)} /> : <Login />}
    </>
  );
}

export default App;
