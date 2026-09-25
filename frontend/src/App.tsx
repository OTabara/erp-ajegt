import { BrowserRouter, Navigate, Outlet, Route, Routes } from "react-router-dom";

import AppLayout from "./components/AppLayout";
import Archives from "./pages/Archives";
import Dashboard from "./pages/Dashboard";
import Contributions from "./pages/Contributions";
import Events from "./pages/Events";
import FinanceTransactions from "./pages/FinanceTransactions";
import ForgotPassword from "./pages/ForgotPassword";
import Login from "./pages/Login";
import Members from "./pages/Members";
import News from "./pages/News";
import Offices from "./pages/Offices";
import Register from "./pages/Register";
import RegistrationRequests from "./pages/RegistrationRequests";
import Profile from "./pages/Profile";
import ResetPassword from "./pages/ResetPassword";
import { AuthProvider } from "./auth/AuthContext";
import { useAuth } from "./auth/useAuth";

function RequireAuth() {
  const { user, loading } = useAuth();
  if (loading) return <div className="auth-loading" role="status">Chargement de votre session…</div>;
  return user ? <Outlet /> : <Navigate to="/login" replace />;
}

function RequireManager() {
  const { user } = useAuth();
  return user?.role === "ADMIN" || user?.role === "SECRETARY" ? <Outlet /> : <Navigate to="/dashboard" replace />;
}

function RequireTreasurer() {
  const { user } = useAuth();
  return user?.role === "ADMIN" || user?.role === "TREASURER" ? <Outlet /> : <Navigate to="/dashboard" replace />;
}

function App() {
  return (
    <BrowserRouter><AuthProvider>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route element={<RequireAuth />}><Route element={<AppLayout />}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="members" element={<Members />} />
          <Route path="profile" element={<Profile />} />
          <Route path="offices" element={<Offices />} />
          <Route path="events" element={<Events />} />
          <Route path="news" element={<News />} />
          <Route path="archives" element={<Archives />} />
          <Route element={<RequireTreasurer />}><Route path="contributions" element={<Contributions />} /></Route>
          <Route element={<RequireTreasurer />}><Route path="finance" element={<FinanceTransactions />} /></Route>
          <Route element={<RequireManager />}><Route path="registration-requests" element={<RegistrationRequests />} /></Route>
        </Route></Route>
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </AuthProvider></BrowserRouter>
  );
}

export default App;
