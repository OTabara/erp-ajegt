import { useState } from "react";
import type { FormEvent } from "react";
import { Link } from "react-router-dom";
import { register } from "../api/auth";
import { ApiError } from "../api/http";
import { AuthPage } from "./Login";

export default function Register() {
  const [email, setEmail] = useState(""); const [displayName, setDisplayName] = useState(""); const [phone, setPhone] = useState(""); const [password, setPassword] = useState("");
  const [error, setError] = useState(""); const [sent, setSent] = useState(false); const [busy, setBusy] = useState(false);
  async function submit(event: FormEvent) {
    event.preventDefault(); setBusy(true); setError("");
    try { await register({ email, displayName, phone, password }); setSent(true); }
    catch (reason) { setError(reason instanceof ApiError ? reason.message : "La demande n’a pas pu être envoyée."); }
    finally { setBusy(false); }
  }
  return <AuthPage><h1>Demander un accès</h1><p className="auth-subtitle">Un responsable AJEGT validera votre inscription.</p>
    {sent ? <div className="auth-success" role="status"><strong>Demande envoyée</strong><p>Votre compte sera activé après approbation. Vous pourrez ensuite vous connecter.</p></div> :
      <form className="auth-form" onSubmit={submit}>
        <label>Nom complet<input autoComplete="name" required maxLength={100} value={displayName} onChange={e => setDisplayName(e.target.value)} /></label>
        <label>Adresse e-mail<input autoComplete="email" type="email" required maxLength={160} value={email} onChange={e => setEmail(e.target.value)} /></label>
        <label>Téléphone <small>(facultatif)</small><input autoComplete="tel" type="tel" maxLength={30} value={phone} onChange={e => setPhone(e.target.value)} /></label>
        <label>Mot de passe <small>(12 caractères minimum)</small><input autoComplete="new-password" type="password" required minLength={12} maxLength={72} value={password} onChange={e => setPassword(e.target.value)} /></label>
        {error && <p role="alert" className="auth-error">{error}</p>}
        <button className="button button-primary" disabled={busy}>{busy ? "Envoi…" : "Envoyer la demande"}</button>
      </form>}
    <p className="auth-switch"><Link to="/login">Retour à la connexion</Link></p>
  </AuthPage>;
}
