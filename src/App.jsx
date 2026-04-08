import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { TripProvider } from "./context/TripContext";
import { RequestProvider } from "./context/RequestContext";
import { VolunteerProvider } from "./context/VolunteerContext";
import Login     from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import MyTrip    from "./pages/MyTrip";
import History   from "./pages/History";
import RequesterPortal from "./pages/RequesterPortal";
import RequesterHistory from "./pages/RequesterHistory";
import GebirahPortal from "./pages/GebirahPortal";
import GebirahDashboard from "./pages/GebirahDashboard";
import GebirahRequests from "./pages/GebirahRequests";
import GebirahTravellers from "./pages/GebirahTravellers";
import GebirahHandovers from "./pages/GebirahHandovers";
import VolunteerPortal from "./pages/VolunteerPortal";
import VolunteerDashboard from "./pages/VolunteerDashboard";
import VolunteerAvailability from "./pages/VolunteerAvailability";
import VolunteerHistory from "./pages/VolunteerHistory";

function ProtectedRoute({ children, allowRoles }) {
  const { isLoggedIn, userRole } = useAuth();
  if (!isLoggedIn) return <Navigate to="/login" replace />;
  if (allowRoles && !allowRoles.includes(userRole)) {
    return <Navigate to={userRole === "requester" ? "/requester" : userRole === "gebirah" ? "/gebirah" : userRole === "volunteer" ? "/volunteer" : "/dashboard"} replace />;
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
