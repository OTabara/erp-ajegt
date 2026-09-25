import { BrowserRouter, Navigate, Outlet, Route, Routes, useLocation } from "react-router-dom";

import AppLayout from "./components/AppLayout";
import Archives from "./pages/Archives";
import Dashboard from "./pages/Dashboard";
import Events from "./pages/Events";
import Login from "./pages/Login";
import Members from "./pages/Members";
import News from "./pages/News";
import Offices from "./pages/Offices";
import Register from "./pages/Register";
import RegistrationRequests from "./pages/RegistrationRequests";
import Profile from "./pages/Profile";
import { AuthProvider } from "./auth/AuthContext";
import { useAuth } from "./auth/useAuth";

function RequireAuth() {
  const { user, loading } = useAuth(); const location = useLocation();
  if (loading) return <div className="auth-loading" role="status">Chargement de votre session…</div>;
  return user ? <Outlet /> : <Navigate to="/login" replace state={{ from: location }} />;
}

function RequireManager() {
  const { user } = useAuth();
  return user?.role === "ADMIN" || user?.role === "SECRETARY" ? <Outlet /> : <Navigate to="/members" replace />;
}

function App() {
  return (
    <BrowserRouter><AuthProvider>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route element={<RequireAuth />}><Route element={<AppLayout />}>
          <Route index element={<Navigate to="/members" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="members" element={<Members />} />
          <Route path="profile" element={<Profile />} />
          <Route path="offices" element={<Offices />} />
          <Route path="events" element={<Events />} />
          <Route path="news" element={<News />} />
          <Route path="archives" element={<Archives />} />
          <Route element={<RequireManager />}><Route path="registration-requests" element={<RegistrationRequests />} /></Route>
        </Route></Route>
        <Route path="*" element={<Navigate to="/members" replace />} />
      </Routes>
    </AuthProvider></BrowserRouter>
  );
}

export default App;
