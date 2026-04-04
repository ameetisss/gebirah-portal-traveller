import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { TripProvider } from "./context/TripContext";
import { VolunteerProvider } from "./context/VolunteerContext";

// Traveller Pages
import Login               from "./pages/Login";
import Dashboard           from "./pages/Dashboard";
import MyTrip              from "./pages/MyTrip";
import History             from "./pages/History";

// Volunteer Pages
import VolunteerLogin       from "./pages/volunteer/VolunteerLogin";
import VolunteerDashboard   from "./pages/volunteer/VolunteerDashboard";
import VolunteerAssignments from "./pages/volunteer/VolunteerAssignments";
import VolunteerHistory     from "./pages/volunteer/VolunteerHistory";

// Requester Pages
import RequesterPortal     from "./pages/RequesterPortal";
import RequesterHistory    from "./pages/RequesterHistory";

function ProtectedRoute({ children, allowRoles, redirectTo = "/login" }) {
  const { isLoggedIn, userRole } = useAuth();
  
  if (!isLoggedIn) {
    return <Navigate to={redirectTo} replace />;
  }
  
  // If role-based access is specified, check the user's role
  if (allowRoles && !allowRoles.includes(userRole)) {
    // Redirect authorized users to their respective dashboards if they lack permission
    if (userRole === "requester") return <Navigate to="/requester" replace />;
    if (userRole === "volunteer") return <Navigate to="/volunteer/dashboard" replace />;
    return <Navigate to="/dashboard" replace />; // Default for "traveller"
  }
  
  return children;
}

function AppRoutes() {
  return (
    <Routes>
      {/* Shared routes */}
      <Route path="/"         element={<Navigate to="/login" replace />} />
      <Route path="/login"    element={<Login />} />
      
      {/* Traveller routes */}
      <Route path="/dashboard" element={<ProtectedRoute allowRoles={["traveller"]}><Dashboard /></ProtectedRoute>} />
      <Route path="/trip"     element={<ProtectedRoute allowRoles={["traveller"]}><MyTrip /></ProtectedRoute>} />
      <Route path="/history"  element={<ProtectedRoute allowRoles={["traveller"]}><History /></ProtectedRoute>} />
      
      {/* Volunteer routes */}
      <Route path="/volunteer/login"       element={<VolunteerLogin />} />
      <Route path="/volunteer/dashboard"   element={<ProtectedRoute allowRoles={["volunteer"]} redirectTo="/volunteer/login"><VolunteerDashboard /></ProtectedRoute>} />
      <Route path="/volunteer/assignments" element={<ProtectedRoute allowRoles={["volunteer"]} redirectTo="/volunteer/login"><VolunteerAssignments /></ProtectedRoute>} />
      <Route path="/volunteer/history"     element={<ProtectedRoute allowRoles={["volunteer"]} redirectTo="/volunteer/login"><VolunteerHistory /></ProtectedRoute>} />
      
      {/* Requester routes */}
      <Route path="/requester"       element={<ProtectedRoute allowRoles={["requester"]}><RequesterPortal /></ProtectedRoute>} />
      <Route path="/request-history" element={<ProtectedRoute allowRoles={["requester"]}><RequesterHistory /></ProtectedRoute>} />
      
      {/* Catch-all redirection */}
      <Route path="*"         element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <TripProvider>
        <VolunteerProvider>
          <BrowserRouter>
            <AppRoutes />
          </BrowserRouter>
        </VolunteerProvider>
      </TripProvider>
    </AuthProvider>
  );
}
