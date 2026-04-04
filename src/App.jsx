import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { TripProvider } from "./context/TripContext";
import { VolunteerProvider } from "./context/VolunteerContext";
import Login               from "./pages/Login";
import Dashboard           from "./pages/Dashboard";
import MyTrip              from "./pages/MyTrip";
import History             from "./pages/History";
import VolunteerLogin       from "./pages/volunteer/VolunteerLogin";
import VolunteerDashboard   from "./pages/volunteer/VolunteerDashboard";
import VolunteerAssignments from "./pages/volunteer/VolunteerAssignments";
import VolunteerHistory     from "./pages/volunteer/VolunteerHistory";

function ProtectedRoute({ children, redirectTo = "/login" }) {
  const { isLoggedIn } = useAuth();
  return isLoggedIn ? children : <Navigate to={redirectTo} replace />;
}

function AppRoutes() {
  return (
    <Routes>
      {/* Traveller routes */}
      <Route path="/"          element={<Navigate to="/login" replace />} />
      <Route path="/login"     element={<Login />} />
      <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
      <Route path="/trip"      element={<ProtectedRoute><MyTrip /></ProtectedRoute>} />
      <Route path="/history"   element={<ProtectedRoute><History /></ProtectedRoute>} />

      {/* Volunteer routes */}
      <Route path="/volunteer/login"       element={<VolunteerLogin />} />
      <Route path="/volunteer/dashboard"   element={<ProtectedRoute redirectTo="/volunteer/login"><VolunteerDashboard /></ProtectedRoute>} />
      <Route path="/volunteer/assignments" element={<ProtectedRoute redirectTo="/volunteer/login"><VolunteerAssignments /></ProtectedRoute>} />
      <Route path="/volunteer/history"     element={<ProtectedRoute redirectTo="/volunteer/login"><VolunteerHistory /></ProtectedRoute>} />

      <Route path="*" element={<Navigate to="/login" replace />} />
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
