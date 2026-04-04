import { createContext, useContext, useState } from "react";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem("travellerId"));
  const [userName, setUserName] = useState(localStorage.getItem("userName") || "Traveller");
  const [userRole, setUserRole] = useState(localStorage.getItem("userRole") || "traveller");
  const [travellerId, setTravellerId] = useState(localStorage.getItem("travellerId"));

  async function login(identifier, method, role = "traveller") {
    try {
      const payload = method === "email" ? { email: identifier } : { phone: identifier };
      const res = await fetch("http://localhost:8000/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      
      const result = await res.json();
      if (result.status === "success") {
        const userData = result.data;
        const newId = userData.id;
        const newName = userData.full_name || "Traveller";
        
        setTravellerId(newId);
        setUserName(newName);
        setUserRole(role);
        setIsLoggedIn(true);
        
        localStorage.setItem("travellerId", newId);
        localStorage.setItem("userName", newName);
        localStorage.setItem("userRole", role);
      } else {
        console.error("Login failed:", result.detail);
      }
    } catch (e) {
      console.error("Login error:", e);
    }
  }

  function logout() {
    setIsLoggedIn(false);
    setUserRole("traveller");
    setUserName("Traveller");
    setTravellerId(null);
    localStorage.removeItem("travellerId");
    localStorage.removeItem("userName");
    localStorage.removeItem("userRole");
  }

  return (
    <AuthContext.Provider value={{
      isLoggedIn,
      userName,
      userRole,
      travellerId,
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
