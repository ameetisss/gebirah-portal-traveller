import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { TripProvider } from "./context/TripContext";
import { VolunteerProvider } from "./context/VolunteerContext";
import { RequestProvider } from "./context/RequestContext";

// Shared Pages
import Login     from "./pages/Login";

// Traveller Pages
import Dashboard from "./pages/Dashboard";
import MyTrip    from "./pages/MyTrip";
import History   from "./pages/History";

// Requester Pages
import RequesterPortal from "./pages/RequesterPortal";
import RequesterHistory from "./pages/RequesterHistory";

// Gebirah Pages
import GebirahPortal from "./pages/GebirahPortal";
import GebirahDashboard from "./pages/GebirahDashboard";
import GebirahRequests from "./pages/GebirahRequests";
import GebirahTravellers from "./pages/GebirahTravellers";
import GebirahHandovers from "./pages/GebirahHandovers";

// Volunteer Pages
import VolunteerPortal from "./pages/VolunteerPortal";
import VolunteerDashboard from "./pages/VolunteerDashboard";
import VolunteerAvailability from "./pages/VolunteerAvailability";
import VolunteerHistory from "./pages/VolunteerHistory";

// Legacy Volunteer Pages (Old routes)
import VolunteerLogin       from "./pages/volunteer/VolunteerLogin";
import LegacyVolunteerDashboard   from "./pages/volunteer/VolunteerDashboard";
import VolunteerAssignments from "./pages/volunteer/VolunteerAssignments";
import LegacyVolunteerHistory     from "./pages/volunteer/VolunteerHistory";

function ProtectedRoute({ children, allowRoles, redirectTo = "/login" }) {
  const { isLoggedIn, userRole } = useAuth();
  if (!isLoggedIn) return <Navigate to="/login" replace />;
  if (allowRoles && !allowRoles.includes(userRole)) {
    return <Navigate to={userRole === "requester" ? "/requester" : userRole === "gebirah" ? "/gebirah" : userRole === "volunteer" ? "/volunteer" : "/dashboard"} replace />;
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
      <Route path="/volunteer/dashboard"   element={<ProtectedRoute allowRoles={["volunteer"]} redirectTo="/volunteer/login"><LegacyVolunteerDashboard /></ProtectedRoute>} />
      <Route path="/volunteer/assignments" element={<ProtectedRoute allowRoles={["volunteer"]} redirectTo="/volunteer/login"><VolunteerAssignments /></ProtectedRoute>} />
      <Route path="/volunteer/history"     element={<ProtectedRoute allowRoles={["volunteer"]} redirectTo="/volunteer/login"><LegacyVolunteerHistory /></ProtectedRoute>} />
      
      {/* Requester routes */}
      <Route path="/requester"       element={<ProtectedRoute allowRoles={["requester"]}><RequesterPortal /></ProtectedRoute>} />
      <Route path="/request-history" element={<ProtectedRoute allowRoles={["requester"]}><RequesterHistory /></ProtectedRoute>} />
      <Route path="/gebirah" element={<ProtectedRoute allowRoles={["gebirah"]}><GebirahPortal /></ProtectedRoute>}>
        <Route index element={<GebirahDashboard />} />
        <Route path="requests" element={<GebirahRequests />} />
        <Route path="travellers" element={<GebirahTravellers />} />
        <Route path="handovers" element={<GebirahHandovers />} />
      </Route>
      <Route path="/volunteer" element={<ProtectedRoute allowRoles={["volunteer"]}><VolunteerPortal /></ProtectedRoute>}>
        <Route index element={<VolunteerDashboard />} />
        <Route path="availability" element={<VolunteerAvailability />} />
        <Route path="history" element={<VolunteerHistory />} />
      </Route>
      <Route path="*"         element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <RequestProvider>
        <VolunteerProvider>
          <TripProvider>
            <BrowserRouter>
              <AppRoutes />
            </BrowserRouter>
          </TripProvider>
        </VolunteerProvider>
      </RequestProvider>
    </AuthProvider>
  );
}
