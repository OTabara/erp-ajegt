import { useState } from "react";
import type { FormEvent, ReactNode } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/useAuth";
import { ApiError } from "../api/http";

export default function Login() {
  const { user, login } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  if (user) return <Navigate to="/members" replace />;
  async function submit(event: FormEvent) {
    event.preventDefault(); setError(""); setBusy(true);
    try { await login(email, password); navigate(location.state?.from?.pathname ?? "/members", { replace: true }); }
    catch (reason) { setError(reason instanceof ApiError ? reason.message : "Connexion impossible."); }
    finally { setBusy(false); }
  }
  return <AuthPage><h1>Connexion</h1><p className="auth-subtitle">Accédez à votre espace AJEGT.</p>
    <form className="auth-form" onSubmit={submit}>
      <label>Adresse e-mail<input autoComplete="email" type="email" required maxLength={160} value={email} onChange={e => setEmail(e.target.value)} /></label>
      <label>Mot de passe<input autoComplete="current-password" type="password" required value={password} onChange={e => setPassword(e.target.value)} /></label>
      <p className="auth-forgot"><Link to="/forgot-password">Mot de passe oublié ?</Link></p>
      {error && <p role="alert" className="auth-error">{error}</p>}
      <button className="button button-primary" disabled={busy}>{busy ? "Connexion…" : "Se connecter"}</button>
    </form>
    <p className="auth-switch">Pas encore de compte ? <Link to="/register">Faire une demande d’accès</Link></p>
  </AuthPage>;
}

export function AuthPage({ children }: { children: ReactNode }) {
  return <main className="auth-screen"><section className="auth-card"><div className="auth-brand"><span className="brand-mark">A</span><strong>AJEGT</strong></div>{children}</section></main>;
}
