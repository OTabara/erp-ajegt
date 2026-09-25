import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";

import AppLayout from "./components/AppLayout";
import Archives from "./pages/Archives";
import Dashboard from "./pages/Dashboard";
import Events from "./pages/Events";
import Login from "./pages/Login";
import Members from "./pages/Members";
import News from "./pages/News";
import Offices from "./pages/Offices";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route element={<AppLayout />}>
          <Route index element={<Navigate to="/members" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="members" element={<Members />} />
          <Route path="offices" element={<Offices />} />
          <Route path="events" element={<Events />} />
          <Route path="news" element={<News />} />
          <Route path="archives" element={<Archives />} />
        </Route>
        <Route path="*" element={<Navigate to="/members" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
