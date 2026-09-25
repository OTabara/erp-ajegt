import { useCallback, useEffect, useMemo, useState } from "react";
import type { FormEvent } from "react";
import { createEvent, fetchEvents, setEventStatus, updateEvent } from "../api/events";
import type { EventDraft, EventItem, EventStatus } from "../api/events";
import { ApiError } from "../api/http";
import { useAuth } from "../auth/useAuth";

type Filter = "upcoming" | "past" | "drafts" | "cancelled";
const filters: { id: Filter; label: string }[] = [
  { id: "upcoming", label: "À venir" }, { id: "past", label: "Passés" },
  { id: "drafts", label: "Brouillons" }, { id: "cancelled", label: "Annulés" },
];
const statusLabel: Record<EventStatus, string> = { DRAFT: "Brouillon", PUBLISHED: "Publié", CANCELLED: "Annulé" };

function localDateTime(date: Date) {
  return new Date(date.getTime() - date.getTimezoneOffset() * 60_000).toISOString().slice(0, 16);
}
function formatDate(value: string) {
  return new Intl.DateTimeFormat("fr-FR", { weekday: "long", day: "numeric", month: "long", year: "numeric" }).format(new Date(value));
}
function formatTime(value: string) {
  return new Intl.DateTimeFormat("fr-FR", { hour: "2-digit", minute: "2-digit" }).format(new Date(value));
}
function eventDraft(event?: EventItem): EventDraft {
  const start = new Date();
  if (!event) { start.setDate(start.getDate() + 7); start.setHours(18, 0, 0, 0); }
  const end = new Date(start.getTime() + 2 * 60 * 60 * 1000);
  return event ? {
    title: event.title, description: event.description, location: event.location,
    startsAt: event.startsAt.slice(0, 16), endsAt: event.endsAt.slice(0, 16),
  } : { title: "", description: "", location: "", startsAt: localDateTime(start), endsAt: localDateTime(end) };
}

export default function Events() {
  const { user } = useAuth();
  const canManage = user?.role === "SECRETARY" || user?.role === "ADMIN";
  const [events, setEvents] = useState<EventItem[]>([]);
  const [filter, setFilter] = useState<Filter>("upcoming");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState<EventDraft>(() => eventDraft());
  const [modalError, setModalError] = useState("");

  const reload = useCallback(async () => {
    setLoading(true); setError("");
    try { setEvents(await fetchEvents()); }
    catch (cause) { setError(cause instanceof ApiError ? cause.message : "Le chargement des événements a échoué."); }
    finally { setLoading(false); }
  }, []);
  useEffect(() => { const timer = window.setTimeout(() => { void reload(); }, 0); return () => window.clearTimeout(timer); }, [reload]);
  useEffect(() => {
    if (!modalOpen) return;
    const onKeyDown = (event: KeyboardEvent) => { if (event.key === "Escape") setModalOpen(false); };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [modalOpen]);

  const visibleEvents = useMemo(() => {
    const now = Date.now();
    return events.filter(event => {
      if (filter === "drafts") return event.status === "DRAFT";
      if (filter === "cancelled") return event.status === "CANCELLED";
      if (event.status !== "PUBLISHED") return false;
      return filter === "upcoming" ? new Date(event.startsAt).getTime() >= now : new Date(event.startsAt).getTime() < now;
    });
  }, [events, filter]);

  function openCreate() { setEditingId(null); setDraft(eventDraft()); setModalError(""); setModalOpen(true); }
  function openEdit(event: EventItem) { setEditingId(event.id); setDraft(eventDraft(event)); setModalError(""); setModalOpen(true); }

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setSaving(true); setModalError(""); setError("");
    const payload: EventDraft = {
      ...draft,
      startsAt: draft.startsAt.length === 16 ? `${draft.startsAt}:00` : draft.startsAt,
      endsAt: draft.endsAt.length === 16 ? `${draft.endsAt}:00` : draft.endsAt,
    };
    try {
      const saved = editingId ? await updateEvent(editingId, payload) : await createEvent(payload);
      setEvents(items => editingId ? items.map(item => item.id === saved.id ? saved : item) : [...items, saved]);
      setModalOpen(false);
    } catch (cause) { setModalError(cause instanceof ApiError ? cause.message : "L’enregistrement de l’événement a échoué."); }
    finally { setSaving(false); }
  }

  async function changeStatus(event: EventItem, status: EventStatus) {
    setError("");
    try {
      const updated = await setEventStatus(event.id, status);
      setEvents(items => items.map(item => item.id === updated.id ? updated : item));
    } catch (cause) { setError(cause instanceof ApiError ? cause.message : "La mise à jour de l’événement a échoué."); }
  }

  return <>
    <div className="page-heading"><div><div className="eyebrow">VIE ASSOCIATIVE</div><h1>Événements</h1><p>{canManage ? "Créez et gérez les événements de l’association." : "Retrouvez les prochains rendez-vous de l’association."}</p></div>
      {canManage && <button className="button button-primary" onClick={openCreate}>＋ Créer un événement</button>}
    </div>
    {error && <div className="page-error" role="alert"><span>{error}</span><button className="button button-secondary" onClick={() => void reload()} disabled={loading}>Réessayer</button></div>}
    {canManage && <div className="member-tabs event-tabs" role="tablist" aria-label="Filtrer les événements">{filters.map(item => {
      const count = events.filter(event => item.id === "drafts" ? event.status === "DRAFT" : item.id === "cancelled" ? event.status === "CANCELLED" : event.status === "PUBLISHED" && (item.id === "upcoming" ? new Date(event.startsAt).getTime() >= Date.now() : new Date(event.startsAt).getTime() < Date.now())).length;
      return <button key={item.id} role="tab" aria-selected={filter === item.id} className={filter === item.id ? "member-tab selected" : "member-tab"} onClick={() => setFilter(item.id)}>{item.label}<span className="tab-count">{count}</span></button>;
    })}</div>}
    {loading ? <div className="members-panel empty-state"><strong>Chargement des événements…</strong></div> : visibleEvents.length === 0 ? <div className="members-panel empty-state"><span aria-hidden="true">▦</span><strong>{filter === "upcoming" ? "Aucun événement à venir" : "Aucun événement dans cette liste"}</strong><p>{canManage ? "Créez un événement pour commencer le calendrier associatif." : "Les prochains événements publiés apparaîtront ici."}</p>{canManage && <button className="button button-secondary" onClick={openCreate}>Créer un événement</button>}</div> :
      <section className="event-grid" aria-label="Liste des événements">{visibleEvents.map(event => <article className={`members-panel event-card event-${event.status.toLowerCase()}`} key={event.id}>
        <div className="event-card-top"><span className={`status-pill ${event.status === "PUBLISHED" ? "active" : "archived"}`}>{statusLabel[event.status]}</span>{canManage && <button className="icon-action" aria-label={`Modifier ${event.title}`} onClick={() => openEdit(event)}>✎</button>}</div>
        <div className="event-date"><strong>{formatDate(event.startsAt)}</strong><span>{formatTime(event.startsAt)}{new Date(event.endsAt).toDateString() === new Date(event.startsAt).toDateString() ? ` – ${formatTime(event.endsAt)}` : ` – ${formatDate(event.endsAt)} ${formatTime(event.endsAt)}`}</span></div>
        <h2>{event.title}</h2><p className="event-location"><span aria-hidden="true">⌖</span> {event.location}</p>
        {event.description && <p className="event-description">{event.description}</p>}
        {canManage && <div className="event-card-actions"><button className="button button-secondary" onClick={() => void changeStatus(event, event.status === "PUBLISHED" ? "CANCELLED" : "PUBLISHED")}>
          {event.status === "PUBLISHED" ? "Annuler l’événement" : event.status === "CANCELLED" ? "Republier" : "Publier"}
        </button></div>}
      </article>)}</section>}
    {modalOpen && <div className="modal-backdrop" onMouseDown={event => { if (event.target === event.currentTarget) setModalOpen(false); }}>
      <section className="member-modal" role="dialog" aria-modal="true" aria-labelledby="event-modal-title">
        <div className="modal-heading"><div><div className="eyebrow">CALENDRIER ASSOCIATIF</div><h2 id="event-modal-title">{editingId ? "Modifier l’événement" : "Créer un événement"}</h2></div><button className="icon-action modal-close" onClick={() => setModalOpen(false)} aria-label="Fermer">×</button></div>
        <p className="modal-intro">Les événements créés sont enregistrés en brouillon avant publication.</p>
        <form onSubmit={event => void save(event)}><div className="form-grid">
          <label className="form-span">Titre<input autoFocus required maxLength={120} value={draft.title} onChange={event => setDraft({ ...draft, title: event.target.value })} placeholder="Ex. Rencontre de rentrée" /></label>
          <label className="form-span">Lieu<input required maxLength={180} value={draft.location} onChange={event => setDraft({ ...draft, location: event.target.value })} placeholder="Adresse ou lieu de rendez-vous" /></label>
          <label>Date et heure de début<input required type="datetime-local" value={draft.startsAt} onChange={event => setDraft({ ...draft, startsAt: event.target.value })} /></label>
          <label>Date et heure de fin<input required type="datetime-local" min={draft.startsAt} value={draft.endsAt} onChange={event => setDraft({ ...draft, endsAt: event.target.value })} /></label>
          <label className="form-span">Description<textarea maxLength={500} rows={4} value={draft.description} onChange={event => setDraft({ ...draft, description: event.target.value })} placeholder="Informations utiles pour les participants" /></label>
        </div>
        {modalError && <p className="form-error" role="alert">{modalError}</p>}
        <div className="modal-actions"><button type="button" className="button button-secondary" onClick={() => setModalOpen(false)} disabled={saving}>Annuler</button><button type="submit" className="button button-primary" disabled={saving}>{saving ? "Enregistrement…" : editingId ? "Enregistrer les changements" : "Créer en brouillon"}</button></div>
        </form>
      </section>
    </div>}
  </>;
}
