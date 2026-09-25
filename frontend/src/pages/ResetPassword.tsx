import { useState } from "react";
import type { FormEvent } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { confirmPasswordReset } from "../api/auth";
import { ApiError } from "../api/http";
import { AuthPage } from "./Login";

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token") ?? "";
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [completed, setCompleted] = useState(false);

  async function submit(event: FormEvent) {
    event.preventDefault(); setError("");
    if (password !== confirmation) { setError("Les deux mots de passe ne correspondent pas."); return; }
    setBusy(true);
    try { await confirmPasswordReset(token, password); setCompleted(true); }
    catch (reason) { setError(reason instanceof ApiError ? reason.message : "Réinitialisation impossible pour le moment."); }
    finally { setBusy(false); }
  }

  return <AuthPage><h1>Nouveau mot de passe</h1><p className="auth-subtitle">Choisissez un mot de passe d’au moins 12 caractères.</p>
    {completed ? <div className="auth-success" role="status">Votre mot de passe a été mis à jour. Vous pouvez vous connecter.</div>
      : !token ? <div className="auth-error" role="alert">Le lien est manquant. Demandez un nouveau lien.</div>
      : <form className="auth-form" onSubmit={submit}>
        <label>Nouveau mot de passe<input autoComplete="new-password" type="password" required minLength={12} maxLength={72} value={password} onChange={event => setPassword(event.target.value)} /></label>
        <label>Confirmer le mot de passe<input autoComplete="new-password" type="password" required minLength={12} maxLength={72} value={confirmation} onChange={event => setConfirmation(event.target.value)} /></label>
        {error && <p role="alert" className="auth-error">{error}</p>}
        <button className="button button-primary" disabled={busy}>{busy ? "Mise à jour…" : "Enregistrer le nouveau mot de passe"}</button>
      </form>}
    <p className="auth-switch"><Link to={completed || !token ? "/login" : "/forgot-password"}>{completed || !token ? "Retour à la connexion" : "Demander un nouveau lien"}</Link></p>
  </AuthPage>;
}
