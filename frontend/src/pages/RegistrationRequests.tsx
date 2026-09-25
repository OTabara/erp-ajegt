import { useCallback, useEffect, useState } from "react";
import { approveRegistration, getPendingRegistrations, rejectRegistration } from "../api/auth";
import type { AccountRole, PendingRegistration } from "../api/auth";
import { ApiError } from "../api/http";
import { useAuth } from "../auth/useAuth";

export default function RegistrationRequests() {
  const { user } = useAuth(); const [items, setItems] = useState<PendingRegistration[]>([]); const [error, setError] = useState(""); const [busy, setBusy] = useState("");
  const [roles, setRoles] = useState<Record<string, AccountRole>>({});
  const reload = useCallback(async () => { try { setItems(await getPendingRegistrations()); setError(""); } catch (e) { setError(e instanceof ApiError ? e.message : "Chargement impossible."); } }, []);
  useEffect(() => { const timer = window.setTimeout(() => { void reload(); }, 0); return () => window.clearTimeout(timer); }, [reload]);
  async function decide(item: PendingRegistration, approve: boolean) {
    setBusy(item.id); setError("");
    try { if (approve) await approveRegistration(item.id, roles[item.id] ?? "MEMBER"); else await rejectRegistration(item.id); await reload(); }
    catch (e) { setError(e instanceof ApiError ? e.message : "La demande n’a pas pu être traitée."); }
    finally { setBusy(""); }
  }
  return <section><div className="page-heading"><div><div className="eyebrow">ADMINISTRATION</div><h1>Demandes d’accès</h1><p>Validez les inscriptions avant d’ouvrir l’accès à l’application.</p></div><button className="button button-secondary" onClick={() => void reload()}>Actualiser</button></div>
    {error && <p className="page-error" role="alert">{error}</p>}
    <div className="members-panel"><div className="panel-heading"><div><h2>En attente</h2><p>{items.length} demande{items.length === 1 ? "" : "s"}</p></div></div>
      {items.length === 0 ? <div className="empty-state"><span>✓</span><strong>Aucune demande en attente</strong><p>Les nouvelles inscriptions apparaîtront ici.</p></div> : <div className="approval-list">{items.map(item => <article className="approval-row" key={item.id}><div><strong>{item.displayName}</strong><span>{item.email}</span><small>Reçue le {new Date(item.createdAt).toLocaleDateString("fr-FR")}</small></div><div className="approval-actions">
        {user?.role === "ADMIN" && <label className="sr-only" htmlFor={`role-${item.id}`}>Rôle à attribuer</label>}
        {user?.role === "ADMIN" && <select id={`role-${item.id}`} value={roles[item.id] ?? "MEMBER"} onChange={e => setRoles({ ...roles, [item.id]: e.target.value as AccountRole })}><option value="MEMBER">Membre</option><option value="SECRETARY">Secrétaire</option><option value="TREASURER">Trésorier</option><option value="ADMIN">Administrateur</option></select>}
        <button className="button button-secondary" disabled={busy === item.id} onClick={() => void decide(item, false)}>Refuser</button><button className="button button-primary" disabled={busy === item.id} onClick={() => void decide(item, true)}>{busy === item.id ? "…" : "Approuver"}</button>
      </div></article>)}</div>}</div>
  </section>;
}
