import { useCallback, useEffect, useState } from "react";
import type { FormEvent } from "react";
import { getProfile, updateProfile } from "../api/auth";
import type { MemberProfile } from "../api/auth";
import { ApiError } from "../api/http";
import { useAuth } from "../auth/useAuth";

const roleLabels: Record<MemberProfile["role"], string> = {
  MEMBER: "Membre", SECRETARY: "Secrétaire", TREASURER: "Trésorier", ADMIN: "Administrateur",
};

export default function Profile() {
  const { refresh } = useAuth();
  const [profile, setProfile] = useState<MemberProfile | null>(null);
  const [displayName, setDisplayName] = useState(""); const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(true); const [saving, setSaving] = useState(false);
  const [error, setError] = useState(""); const [notice, setNotice] = useState("");
  const load = useCallback(async () => {
    try { const result = await getProfile(); setProfile(result); setDisplayName(result.displayName); setPhone(result.phone); setError(""); }
    catch (cause) { setError(cause instanceof ApiError ? cause.message : "Le profil n’a pas pu être chargé."); }
    finally { setLoading(false); }
  }, []);
  useEffect(() => { const timer = window.setTimeout(() => { void load(); }, 0); return () => window.clearTimeout(timer); }, [load]);

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setSaving(true); setError(""); setNotice("");
    try {
      const updated = await updateProfile({ displayName: displayName.trim(), phone: phone.trim() });
      setProfile(updated); setDisplayName(updated.displayName); setPhone(updated.phone);
      await refresh(); setNotice("Ton profil a été mis à jour.");
    } catch (cause) { setError(cause instanceof ApiError ? cause.message : "La mise à jour du profil a échoué."); }
    finally { setSaving(false); }
  }

  return <section>
    <div className="page-heading"><div><div className="eyebrow">MON ESPACE</div><h1>Mon profil</h1><p>Consulte et mets à jour tes coordonnées personnelles.</p></div></div>
    {error && <p className="page-error" role="alert">{error}</p>}
    {notice && <p className="profile-notice" role="status">{notice}</p>}
    {loading ? <div className="members-panel profile-loading" role="status">Chargement du profil…</div> : profile && <div className="profile-grid">
      <section className="members-panel profile-summary"><div className="profile-avatar">{profile.displayName.slice(0, 1).toLocaleUpperCase("fr-FR")}</div><h2>{profile.displayName}</h2><p>{profile.email}</p><span className="role-pill">{roleLabels[profile.role]}</span><small>Compte créé le {new Intl.DateTimeFormat("fr-FR", { dateStyle: "long" }).format(new Date(profile.createdAt))}</small></section>
      <form className="members-panel profile-form" onSubmit={save}>
        <div className="panel-heading"><div><h2>Informations personnelles</h2><p>Ces changements n’affectent que ton compte.</p></div></div>
        <div className="profile-fields">
          <label>Nom complet<input autoComplete="name" required maxLength={100} value={displayName} onChange={event => setDisplayName(event.target.value)} /></label>
          <label>Adresse e-mail<input type="email" value={profile.email} readOnly aria-describedby="email-help" /><small id="email-help">L’adresse utilisée pour te connecter ne peut pas être modifiée ici.</small></label>
          <label>Téléphone<input autoComplete="tel" type="tel" maxLength={30} value={phone} onChange={event => setPhone(event.target.value)} /></label>
          <label>Rôle<input value={roleLabels[profile.role]} readOnly /><small>Seul un responsable peut modifier les rôles.</small></label>
        </div>
        <div className="profile-actions"><button className="button button-primary" disabled={saving}>{saving ? "Enregistrement…" : "Enregistrer les modifications"}</button></div>
      </form>
    </div>}
  </section>;
}
