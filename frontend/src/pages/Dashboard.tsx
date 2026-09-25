import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../auth/useAuth";
import { ApiError, fetchMembers } from "../api/members";
import type { Member } from "../api/members";
import { getPendingRegistrations } from "../api/auth";
import type { PendingRegistration } from "../api/auth";

const dateFormat = new Intl.DateTimeFormat("fr-FR", { dateStyle: "medium" });
const formatDate = (value: string) => dateFormat.format(new Date(`${value}T00:00:00`));

export default function Dashboard() {
  const { user } = useAuth();
  const isManager = user?.role === "ADMIN" || user?.role === "SECRETARY";
  const [members, setMembers] = useState<Member[]>([]);
  const [pending, setPending] = useState<PendingRegistration[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const reload = useCallback(async () => {
    setLoading(true); setError("");
    try {
      const [loadedMembers, loadedRequests] = await Promise.all([
        fetchMembers(), isManager ? getPendingRegistrations() : Promise.resolve([]),
      ]);
      setMembers(loadedMembers); setPending(loadedRequests);
    } catch (cause) {
      setError(cause instanceof ApiError ? cause.message : "Le tableau de bord n’a pas pu être chargé.");
    } finally { setLoading(false); }
  }, [isManager]);
  useEffect(() => { const timer = window.setTimeout(() => { void reload(); }, 0); return () => window.clearTimeout(timer); }, [reload]);

  const active = useMemo(() => members.filter(member => member.status === "active"), [members]);
  const year = new Date().getFullYear();
  const joinedThisYear = useMemo(() => active.filter(member => member.joinedAt.startsWith(String(year)))
    .sort((a, b) => b.joinedAt.localeCompare(a.joinedAt)), [active, year]);
  const recent = joinedThisYear.slice(0, 6);
  const stats = [
    { label: "Membres actifs", value: active.length, note: "Dans l’annuaire", icon: "♙", color: "teal" },
    { label: "Nouvelles adhésions", value: joinedThisYear.length, note: `Depuis janvier ${year}`, icon: "＋", color: "gold" },
    { label: "Membres archivés", value: members.length - active.length, note: "Conservés dans l’historique", icon: "▤", color: "slate" },
    ...(isManager ? [{ label: "Demandes à traiter", value: pending.length, note: "Inscriptions en attente", icon: "✉", color: "amber" }] : []),
  ];

  return <section className="dashboard-page">
    <div className="dashboard-welcome"><div><div className="eyebrow">VOTRE ASSOCIATION EN UN COUP D’ŒIL</div><h1>Bonjour{user?.displayName ? `, ${user.displayName.split(" ")[0]}` : ""}</h1><p>Retrouvez les informations récentes de l’AJEGT.</p></div><Link className="button button-secondary" to="/members">Voir l’annuaire <span aria-hidden="true">→</span></Link></div>
    {error && <div className="page-error" role="alert"><span>{error}</span><button className="button button-secondary" onClick={() => void reload()}>Réessayer</button></div>}
    <div className="dashboard-stats" aria-label="Statistiques de l’association">{stats.map(stat => <article className="dashboard-stat" key={stat.label}><span className={`dashboard-stat-icon ${stat.color}`} aria-hidden="true">{stat.icon}</span><div><small>{stat.label}</small><strong>{loading ? "—" : stat.value}</strong><span>{stat.note}</span></div></article>)}</div>
    <div className="dashboard-panels">
      <section className="members-panel dashboard-recent" aria-labelledby="recent-members-title"><div className="panel-heading"><div><h2 id="recent-members-title">Dernières adhésions</h2><p>Les membres actifs inscrits cette année</p></div><Link className="dashboard-panel-link" to="/members">Tout voir <span aria-hidden="true">→</span></Link></div>
        {loading ? <div className="dashboard-loading" role="status">Chargement des données…</div> : recent.length === 0 ? <div className="empty-state"><span>♙</span><strong>Aucune nouvelle adhésion cette année</strong><p>Les nouvelles adhésions apparaîtront ici.</p></div> : <ul className="dashboard-member-list">{recent.map((member, index) => <li key={member.id}><span className={`member-avatar avatar-${index % 5}`} aria-hidden="true">{member.firstName.slice(0, 1)}{member.lastName.slice(0, 1)}</span><span className="dashboard-member-name"><strong>{member.firstName} {member.lastName}</strong><small>{member.role}</small></span><time dateTime={member.joinedAt}>{formatDate(member.joinedAt)}</time></li>)}</ul>}
      </section>
      <section className="dashboard-shortcuts" aria-labelledby="shortcuts-title"><div className="panel-heading"><div><h2 id="shortcuts-title">Accès rapides</h2><p>Les espaces utiles au quotidien</p></div></div><div className="shortcut-list">
        <Link to="/members"><span className="shortcut-icon teal">♙</span><span><strong>Annuaire des membres</strong><small>Rechercher une personne</small></span><b aria-hidden="true">→</b></Link>
        <Link to="/profile"><span className="shortcut-icon blue">◉</span><span><strong>Mon profil</strong><small>Mettre à jour mes coordonnées</small></span><b aria-hidden="true">→</b></Link>
        {isManager && <Link to="/registration-requests"><span className="shortcut-icon gold">✉</span><span><strong>Demandes d’accès</strong><small>{pending.length} en attente</small></span><b aria-hidden="true">→</b></Link>}
      </div></section>
    </div>
    <section className="dashboard-events-note"><span aria-hidden="true">▦</span><p>Les prochains événements s’afficheront ici dès que leur calendrier sera disponible.</p><Link to="/events">Voir les événements</Link></section>
  </section>;
}
