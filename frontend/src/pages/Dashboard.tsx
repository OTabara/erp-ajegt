import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../auth/useAuth";
import { getPendingRegistrations } from "../api/auth";
import type { PendingRegistration } from "../api/auth";
import { ApiError } from "../api/http";

const dateFormat = new Intl.DateTimeFormat("fr-FR", { dateStyle: "medium" });

export default function Dashboard() {
  const { user } = useAuth();
  const isManager = user?.role === "ADMIN" || user?.role === "SECRETARY";
  const [pending, setPending] = useState<PendingRegistration[]>([]);
  const [loading, setLoading] = useState(isManager);
  const [error, setError] = useState("");

  const reload = useCallback(async () => {
    if (!isManager) return;
    setLoading(true); setError("");
    try { setPending(await getPendingRegistrations()); }
    catch (cause) { setError(cause instanceof ApiError ? cause.message : "Les demandes en attente n’ont pas pu être chargées."); }
    finally { setLoading(false); }
  }, [isManager]);

  useEffect(() => { if (isManager) { const timer = window.setTimeout(() => { void reload(); }, 0); return () => window.clearTimeout(timer); } }, [isManager, reload]);

  return <section className="dashboard-page">
    <div className="dashboard-welcome"><div><div className="eyebrow">ESPACE ASSOCIATIF AJEGT</div><h1>Bonjour{user?.displayName ? `, ${user.displayName.split(" ")[0]}` : ""}</h1><p>Retrouvez les espaces et les actions utiles à la vie de l’association.</p></div></div>

    {isManager && <section className="dashboard-action-panel members-panel" aria-labelledby="dashboard-requests-title">
      <div className="panel-heading"><div><div className="eyebrow">SUIVI ADMINISTRATIF</div><h2 id="dashboard-requests-title">Demandes d’accès</h2><p>Les inscriptions qui attendent une décision.</p></div><Link className="button button-secondary" to="/registration-requests">Gérer les demandes <span aria-hidden="true">→</span></Link></div>
      {error && <div className="page-error" role="alert"><span>{error}</span><button className="button button-secondary" onClick={() => void reload()}>Réessayer</button></div>}
      {loading ? <div className="dashboard-loading" role="status">Chargement des demandes…</div>
        : pending.length === 0 ? <div className="dashboard-empty-action"><span aria-hidden="true">✓</span><div><strong>Tout est à jour</strong><p>Aucune inscription n’attend votre approbation.</p></div></div>
        : <div className="dashboard-pending"><strong>{pending.length} demande{pending.length === 1 ? "" : "s"} à examiner</strong><ul>{pending.slice(0, 3).map(item => <li key={item.id}><span><b>{item.displayName}</b><small>{item.email}</small></span><time dateTime={item.createdAt}>{dateFormat.format(new Date(item.createdAt))}</time></li>)}</ul></div>}
    </section>}

    <div className="dashboard-section-heading"><div><div className="eyebrow">VIE ASSOCIATIVE</div><h2>Explorer les espaces</h2><p>Accédez aux informations et activités de l’association.</p></div></div>
    <div className="dashboard-spaces">
      <Link className="dashboard-space-card" to="/events"><span className="dashboard-space-icon teal" aria-hidden="true">▦</span><span><strong>Événements</strong><small>Activités et rencontres de l’association</small></span><b aria-hidden="true">→</b></Link>
      <Link className="dashboard-space-card" to="/offices"><span className="dashboard-space-icon gold" aria-hidden="true">▤</span><span><strong>Bureaux</strong><small>Mandats et responsabilités</small></span><b aria-hidden="true">→</b></Link>
      <Link className="dashboard-space-card" to="/news"><span className="dashboard-space-icon blue" aria-hidden="true">▧</span><span><strong>Actualités</strong><small>Les nouvelles de l’AJEGT</small></span><b aria-hidden="true">→</b></Link>
      <Link className="dashboard-space-card" to="/archives"><span className="dashboard-space-icon slate" aria-hidden="true">▣</span><span><strong>Archives</strong><small>Documents et mémoire associative</small></span><b aria-hidden="true">→</b></Link>
    </div>
    <div className="dashboard-profile-link"><span><strong>Vos coordonnées sont-elles à jour ?</strong><small>Vous pouvez les consulter et les modifier dans votre profil.</small></span><Link to="/profile">Mon profil <span aria-hidden="true">→</span></Link></div>
  </section>;
}
