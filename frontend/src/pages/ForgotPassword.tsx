import { useState } from "react";
import type { FormEvent } from "react";
import { Link } from "react-router-dom";
import { requestPasswordReset } from "../api/auth";
import { ApiError } from "../api/http";
import { AuthPage } from "./Login";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(event: FormEvent) {
    event.preventDefault(); setError(""); setMessage(""); setBusy(true);
    try { setMessage((await requestPasswordReset(email)).message); }
    catch (reason) { setError(reason instanceof ApiError ? reason.message : "Demande impossible pour le moment."); }
    finally { setBusy(false); }
  }

  return <AuthPage><h1>Mot de passe oublié</h1><p className="auth-subtitle">Indiquez l’adresse e-mail associée à votre compte AJEGT.</p>
    {message ? <div className="auth-success" role="status">{message}</div> : <form className="auth-form" onSubmit={submit}>
      <label>Adresse e-mail<input autoComplete="email" type="email" required maxLength={160} value={email} onChange={event => setEmail(event.target.value)} /></label>
      {error && <p role="alert" className="auth-error">{error}</p>}
      <button className="button button-primary" disabled={busy}>{busy ? "Envoi…" : "Envoyer le lien"}</button>
    </form>}
    <p className="auth-switch"><Link to="/login">Retour à la connexion</Link></p>
  </AuthPage>;
}
