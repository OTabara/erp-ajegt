import { useEffect, useMemo, useState } from "react";
import type { FormEvent } from "react";
import { ApiError, createMember, fetchMembers, setMemberStatus, updateMember } from "../api/members";
import type { Member, MemberDraft } from "../api/members";

const roles = ["Membre", "Présidence", "Secrétariat", "Trésorerie", "Bureau"];
const filters = [
  { id: "active", label: "Membres actifs" },
  { id: "archived", label: "Archivés" },
  { id: "all", label: "Tous" },
] as const;

const emptyDraft: MemberDraft = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  role: "Membre",
  joinedAt: new Date().toISOString().slice(0, 10),
};

function initials(member: Pick<Member, "firstName" | "lastName">) {
  return `${member.firstName.trim().charAt(0)}${member.lastName.trim().charAt(0)}`.toLocaleUpperCase("fr-FR");
}

function formatDate(value: string) {
  if (!value) return "—";
  return new Intl.DateTimeFormat("fr-FR", { day: "2-digit", month: "short", year: "numeric" }).format(new Date(`${value}T12:00:00`));
}

export default function Members() {
  const [members, setMembers] = useState<Member[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [pageError, setPageError] = useState("");
  const [filter, setFilter] = useState<(typeof filters)[number]["id"]>("active");
  const [query, setQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState<MemberDraft>(emptyDraft);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    fetchMembers()
      .then((loadedMembers) => { if (!cancelled) setMembers(loadedMembers); })
      .catch((cause: unknown) => { if (!cancelled) setPageError(cause instanceof Error ? cause.message : "Le chargement des membres a échoué."); })
      .finally(() => { if (!cancelled) setIsLoading(false); });
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    if (!isModalOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsModalOpen(false);
        setError("");
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isModalOpen]);

  const activeMembers = members.filter((member) => member.status === "active");
  const archivedMembers = members.filter((member) => member.status === "archived");
  const displayedMembers = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase("fr-FR");
    return members
      .filter((member) => filter === "all" || member.status === filter)
      .filter((member) => `${member.firstName} ${member.lastName} ${member.email} ${member.role}`.toLocaleLowerCase("fr-FR").includes(normalizedQuery))
      .sort((left, right) => left.lastName.localeCompare(right.lastName, "fr"));
  }, [members, filter, query]);

  function openCreateModal() {
    setEditingId(null);
    setDraft({ ...emptyDraft, joinedAt: new Date().toISOString().slice(0, 10) });
    setError("");
    setIsModalOpen(true);
  }

  function openEditModal(member: Member) {
    setEditingId(member.id);
    setDraft({
      firstName: member.firstName,
      lastName: member.lastName,
      email: member.email,
      phone: member.phone,
      role: member.role,
      joinedAt: member.joinedAt,
    });
    setError("");
    setIsModalOpen(true);
  }

  function closeModal() {
    setIsModalOpen(false);
    setError("");
  }

  async function retryLoading() {
    setIsLoading(true);
    setPageError("");
    try {
      setMembers(await fetchMembers());
    } catch (cause: unknown) {
      setPageError(cause instanceof Error ? cause.message : "Le chargement des membres a échoué.");
    } finally {
      setIsLoading(false);
    }
  }

  async function saveMember(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const normalizedEmail = draft.email.trim().toLocaleLowerCase("fr-FR");
    if (members.some((member) => member.email.toLocaleLowerCase("fr-FR") === normalizedEmail && member.id !== editingId)) {
      setError("Cette adresse e-mail est déjà associée à un membre.");
      return;
    }

    const normalizedDraft = {
      ...draft,
      firstName: draft.firstName.trim(),
      lastName: draft.lastName.trim(),
      email: normalizedEmail,
      phone: draft.phone.trim(),
    };

    setIsSaving(true);
    setPageError("");
    try {
      const saved = editingId ? await updateMember(editingId, normalizedDraft) : await createMember(normalizedDraft);
      setMembers((current) => editingId
        ? current.map((member) => member.id === saved.id ? saved : member)
        : [saved, ...current]);
      closeModal();
    } catch (cause: unknown) {
      const message = cause instanceof ApiError ? cause.message : "L’enregistrement du membre a échoué.";
      setError(message);
    } finally {
      setIsSaving(false);
    }
  }

  async function toggleArchive(member: Member) {
    setPageError("");
    try {
      const updated = await setMemberStatus(member.id, member.status === "active" ? "archived" : "active");
      setMembers((current) => current.map((item) => item.id === updated.id ? updated : item));
    } catch (cause: unknown) {
      setPageError(cause instanceof Error ? cause.message : "La modification du statut a échoué.");
    }
  }

  return (
    <>
      <div className="page-heading">
        <div>
          <div className="eyebrow">VIE ASSOCIATIVE</div>
          <h1>Les membres</h1>
          <p>Retrouvez et gérez les membres de l’association.</p>
        </div>
        <button className="button button-primary" onClick={openCreateModal}>
          <span aria-hidden="true">＋</span> Ajouter un membre
        </button>
      </div>

      <div className="prototype-banner" role="note">
        <span className="prototype-banner-icon" aria-hidden="true">i</span>
        <span><strong>Mode prototype</strong> — données de démonstration stockées localement. N’utilisez pas de données personnelles réelles.</span>
      </div>

      {pageError && (
        <div className="page-error" role="alert">
          <span>{pageError}</span>
          <button className="button button-secondary" onClick={() => { void retryLoading(); }} disabled={isLoading}>
            {isLoading ? "Connexion…" : "Réessayer"}
          </button>
        </div>
      )}

      <section className="member-stats" aria-label="Résumé des membres">
        <div className="stat-card">
          <span className="stat-icon stat-icon-green" aria-hidden="true">♙</span>
          <span className="stat-copy"><span>Membres actifs</span><strong>{activeMembers.length}</strong></span>
          <span className="stat-caption">adhérents</span>
        </div>
        <div className="stat-card">
          <span className="stat-icon stat-icon-blue" aria-hidden="true">＋</span>
          <span className="stat-copy"><span>Cette année</span><strong>{activeMembers.filter((member) => member.joinedAt.startsWith(String(new Date().getFullYear()))).length}</strong></span>
          <span className="stat-caption">nouvelles adhésions</span>
        </div>
        <div className="stat-card">
          <span className="stat-icon stat-icon-sand" aria-hidden="true">▣</span>
          <span className="stat-copy"><span>Archives</span><strong>{archivedMembers.length}</strong></span>
          <span className="stat-caption">anciens membres</span>
        </div>
      </section>

      <section className="members-panel" aria-labelledby="members-list-title">
        <div className="panel-heading">
          <div>
            <h2 id="members-list-title">Annuaire</h2>
            <p>Consultez les dossiers et mettez-les à jour.</p>
          </div>
          <label className="search-control">
            <span className="search-symbol" aria-hidden="true">⌕</span>
            <span className="sr-only">Rechercher un membre</span>
            <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Nom, e-mail, rôle…" />
            {query && <button type="button" className="clear-search" onClick={() => setQuery("")} aria-label="Effacer la recherche">×</button>}
          </label>
        </div>

        <div className="member-tabs" role="tablist" aria-label="Filtrer les membres">
          {filters.map((item) => {
            const count = item.id === "active" ? activeMembers.length : item.id === "archived" ? archivedMembers.length : members.length;
            return (
              <button key={item.id} role="tab" aria-selected={filter === item.id} className={filter === item.id ? "member-tab selected" : "member-tab"} onClick={() => setFilter(item.id)}>
                {item.label}<span className="tab-count">{count}</span>
              </button>
            );
          })}
        </div>

        <div className="table-scroll">
          <table className="members-table">
            <thead><tr><th scope="col">Membre</th><th scope="col">Rôle</th><th scope="col">Contact</th><th scope="col">Adhésion</th><th scope="col">Statut</th><th scope="col"><span className="sr-only">Actions</span></th></tr></thead>
            <tbody>
              {isLoading && <tr><td colSpan={6}><div className="empty-state"><strong>Chargement des membres…</strong></div></td></tr>}
              {!isLoading && displayedMembers.map((member) => (
                <tr key={member.id}>
                  <td data-label="Membre">
                    <div className="member-identity">
                      <span className={`member-avatar avatar-${member.id.charCodeAt(member.id.length - 1) % 5}`}>{initials(member)}</span>
                      <span className="member-name"><strong>{member.firstName} {member.lastName}</strong><small>{member.email}</small></span>
                    </div>
                  </td>
                  <td data-label="Rôle"><span className="role-pill">{member.role}</span></td>
                  <td data-label="Contact" className="contact-cell">{member.phone || "—"}</td>
                  <td data-label="Adhésion" className="date-cell">{formatDate(member.joinedAt)}</td>
                  <td data-label="Statut"><span className={`status-pill ${member.status}`}>{member.status === "active" ? "Actif" : "Archivé"}</span></td>
                  <td data-label="Actions">
                    <div className="row-actions">
                      <button className="icon-action" onClick={() => openEditModal(member)} aria-label={`Modifier ${member.firstName} ${member.lastName}`} title="Modifier">✎</button>
                      <button className="text-action" onClick={() => toggleArchive(member)}>{member.status === "active" ? "Archiver" : "Réactiver"}</button>
                    </div>
                  </td>
                </tr>
              ))}
              {!isLoading && displayedMembers.length === 0 && (
                <tr><td colSpan={6}><div className="empty-state"><span aria-hidden="true">♙</span><strong>{query ? "Aucun résultat" : "Aucun membre dans cette liste"}</strong><p>{query ? "Essayez un autre nom, e-mail ou rôle." : "Ajoutez un membre pour commencer à constituer l’annuaire."}</p>{!query && <button className="button button-secondary" onClick={openCreateModal}>Ajouter un membre</button>}</div></td></tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="table-footer"><span>{displayedMembers.length} membre{displayedMembers.length > 1 ? "s" : ""} affiché{displayedMembers.length > 1 ? "s" : ""}</span><span>Environnement de démonstration local</span></div>
      </section>

      {isModalOpen && (
        <div className="modal-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) closeModal(); }}>
          <section className="member-modal" role="dialog" aria-modal="true" aria-labelledby="member-modal-title">
            <div className="modal-heading">
              <div><div className="eyebrow">DOSSIER ADHÉRENT</div><h2 id="member-modal-title">{editingId ? "Modifier le membre" : "Ajouter un membre"}</h2></div>
              <button className="icon-action modal-close" onClick={closeModal} aria-label="Fermer">×</button>
            </div>
            <p className="modal-intro">Renseignez les informations principales du membre.</p>
            <form onSubmit={(event) => { void saveMember(event); }}>
              <div className="form-grid">
                <label>Prénom<input autoFocus required maxLength={80} value={draft.firstName} onChange={(event) => setDraft({ ...draft, firstName: event.target.value })} placeholder="Ex. Aïssatou" /></label>
                <label>Nom<input required maxLength={80} value={draft.lastName} onChange={(event) => setDraft({ ...draft, lastName: event.target.value })} placeholder="Ex. Camara" /></label>
                <label className="form-span">Adresse e-mail<input required type="email" maxLength={160} value={draft.email} onChange={(event) => setDraft({ ...draft, email: event.target.value })} placeholder="prenom.nom@example.org" /></label>
                <label>Téléphone<input type="tel" maxLength={30} value={draft.phone} onChange={(event) => setDraft({ ...draft, phone: event.target.value })} placeholder="+33 6 …" /></label>
                <label>Rôle<select value={draft.role} onChange={(event) => setDraft({ ...draft, role: event.target.value })}>{roles.map((role) => <option key={role}>{role}</option>)}</select></label>
                <label>Date d’adhésion<input required type="date" value={draft.joinedAt} onChange={(event) => setDraft({ ...draft, joinedAt: event.target.value })} /></label>
              </div>
              {error && <p className="form-error" role="alert">{error}</p>}
              <div className="modal-actions"><button type="button" className="button button-secondary" onClick={closeModal} disabled={isSaving}>Annuler</button><button type="submit" className="button button-primary" disabled={isSaving}>{isSaving ? "Enregistrement…" : editingId ? "Enregistrer les changements" : "Ajouter le membre"}</button></div>
            </form>
          </section>
        </div>
      )}
    </>
  );
}
