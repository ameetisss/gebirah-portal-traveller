import { createContext, useContext, useState } from "react";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem("userId"));
  const [userName, setUserName] = useState(localStorage.getItem("userName") || "User");
  const [userRole, setUserRole] = useState(localStorage.getItem("userRole") || "traveller");
  const [userId, setUserId] = useState(localStorage.getItem("userId"));

  async function login(identifier, method, role = "traveller") {
    try {
      const payload = method === "email" ? { email: identifier, role } : { phone: identifier, role };
      const res = await fetch("http://localhost:8000/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      
      const result = await res.json();
      if (result.status === "success") {
        const userData = result.data;
        const newId = userData.id;
        const newName = userData.full_name || "User";
        
        setUserId(newId);
        setUserName(newName);
        setUserRole(role);
        setIsLoggedIn(true);
        
        localStorage.setItem("userId", newId);
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
    setUserName("User");
    setUserId(null);
    localStorage.removeItem("userId");
    localStorage.removeItem("userName");
    localStorage.removeItem("userRole");
  }

  return (
    <AuthContext.Provider value={{
      isLoggedIn,
      userName,
      userRole,
      userId,
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
