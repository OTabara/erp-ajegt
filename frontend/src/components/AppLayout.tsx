import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/useAuth";

const navigation = [
  { to: "/dashboard", label: "Vue d’ensemble", icon: "⌂" },
  { to: "/members", label: "Membres", icon: "♙" },
  { to: "/profile", label: "Mon profil", icon: "◉" },
  { to: "/offices", label: "Bureaux", icon: "▤" },
  { to: "/events", label: "Événements", icon: "▦" },
  { to: "/news", label: "Actualités", icon: "▧" },
  { to: "/archives", label: "Archives", icon: "▣" },
];

export default function AppLayout() {
  const { user, logout } = useAuth(); const navigate = useNavigate();
  const items = user?.role === "ADMIN" || user?.role === "SECRETARY" ? [...navigation, { to: "/registration-requests", label: "Demandes d’accès", icon: "✉" }] : navigation;
  return (
    <div className="erp-shell">
      <aside className="sidebar">
        <NavLink className="brand" to="/members" aria-label="AJEGT, accueil">
          <span className="brand-mark" aria-hidden="true">A</span>
          <span className="brand-copy">
            <strong>AJEGT</strong>
            <small>ESPACE ASSOCIATIF</small>
          </span>
        </NavLink>

        <div className="sidebar-label">MENU PRINCIPAL</div>
        <nav className="nav-links" aria-label="Navigation principale">
          {items.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) => `nav-link${isActive ? " active" : ""}`}
            >
              <span className="nav-icon" aria-hidden="true">{item.icon}</span>
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-bottom">
          <div className="workspace-card">
            <span className="workspace-dot" />
            <span><strong>AJEGT Toulouse</strong><small>Association</small></span>
          </div>
          <div className="prototype-note">Version de travail · données locales</div>
        </div>
      </aside>

      <div className="main-column">
        <header className="topbar">
          <div className="topbar-context">Association des Jeunes et Étudiants Guinéens de Toulouse</div>
          <div className="account-chip">
            <span className="avatar">{user?.displayName?.slice(0, 1).toUpperCase() ?? "A"}</span>
            <span className="account-name">{user?.displayName}</span>
            <button className="text-action" onClick={async () => { await logout(); navigate("/login"); }}>Déconnexion</button>
          </div>
        </header>
        <main className="page-content"><Outlet /></main>
        <footer className="page-footer">AJEGT <span>·</span> Gestion associative</footer>
      </div>
    </div>
  );
}
