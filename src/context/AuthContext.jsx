import { createContext, useContext, useState } from "react";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userName, setUserName] = useState("Traveller");
  const [userRole, setUserRole] = useState("traveller");

  function login(identifier, method, role = "traveller") {
    if (method === "email") {
      const raw = identifier.split("@")[0];
      setUserName(raw.charAt(0).toUpperCase() + raw.slice(1));
    } else {
      setUserName(role === "requester" ? "Requester" : role === "gebirah" ? "Gebirah" : role === "volunteer" ? "Volunteer" : "Traveller");
    }
    setUserRole(role);
    setIsLoggedIn(true);
  }

  function logout() {
    setIsLoggedIn(false);
    setUserRole("traveller");
    setUserName("Traveller");
  }

  return (
    <AuthContext.Provider value={{
      isLoggedIn,
      userName,
      userRole,
      login,
      logout,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
