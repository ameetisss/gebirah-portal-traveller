import { createContext, useContext, useState } from "react";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userName, setUserName] = useState("Traveller");

  function login(identifier, method) {
    if (method === "email") {
      const raw = identifier.split("@")[0];
      setUserName(raw.charAt(0).toUpperCase() + raw.slice(1));
    } else {
      setUserName("Traveller");
    }
    setIsLoggedIn(true);
  }

  return (
    <AuthContext.Provider value={{
      isLoggedIn,
      userName,
      login,
      logout: () => setIsLoggedIn(false),
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
