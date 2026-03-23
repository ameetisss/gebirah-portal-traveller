import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { TripProvider } from "./context/TripContext";
import Login     from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import MyTrip    from "./pages/MyTrip";
import History   from "./pages/History";
import RequesterPortal from "./pages/RequesterPortal";
import RequesterHistory from "./pages/RequesterHistory";

function ProtectedRoute({ children, allowRoles }) {
  const { isLoggedIn, userRole } = useAuth();
  if (!isLoggedIn) return <Navigate to="/login" replace />;
  if (allowRoles && !allowRoles.includes(userRole)) {
    return <Navigate to={userRole === "requester" ? "/requester" : "/dashboard"} replace />;
  }
  return children;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/"         element={<Navigate to="/login" replace />} />
      <Route path="/login"    element={<Login />} />
      <Route path="/dashboard" element={<ProtectedRoute allowRoles={["traveller"]}><Dashboard /></ProtectedRoute>} />
      <Route path="/trip"     element={<ProtectedRoute allowRoles={["traveller"]}><MyTrip /></ProtectedRoute>} />
      <Route path="/history"  element={<ProtectedRoute allowRoles={["traveller"]}><History /></ProtectedRoute>} />
      <Route path="/requester" element={<ProtectedRoute allowRoles={["requester"]}><RequesterPortal /></ProtectedRoute>} />
      <Route path="/request-history" element={<ProtectedRoute allowRoles={["requester"]}><RequesterHistory /></ProtectedRoute>} />
      <Route path="*"         element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <TripProvider>
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </TripProvider>
    </AuthProvider>
  );
}
