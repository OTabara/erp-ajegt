import { useEffect, useMemo, useState } from "react";
import type { FormEvent } from "react";

type MemberStatus = "active" | "archived";

type Member = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  role: string;
  joinedAt: string;
  status: MemberStatus;
};

type MemberDraft = Omit<Member, "id" | "status">;

const STORAGE_KEY = "ajegt-erp-members-v1";
const roles = ["Membre", "Présidence", "Secrétariat", "Trésorerie", "Bureau"];
const filters = [
  { id: "active", label: "Membres actifs" },
  { id: "archived", label: "Archivés" },
  { id: "all", label: "Tous" },
] as const;

const demoMembers: Member[] = [
  { id: "demo-1", firstName: "Aïssatou", lastName: "Camara", email: "aissatou.camara@example.org", phone: "+33 6 00 00 00 01", role: "Présidence", joinedAt: "2024-09-12", status: "active" },
  { id: "demo-2", firstName: "Mamadou", lastName: "Bah", email: "mamadou.bah@example.org", phone: "+33 6 00 00 00 02", role: "Trésorerie", joinedAt: "2024-10-03", status: "active" },
  { id: "demo-3", firstName: "Fatoumata", lastName: "Diallo", email: "fatoumata.diallo@example.org", phone: "+33 6 00 00 00 03", role: "Secrétariat", joinedAt: "2025-01-18", status: "active" },
  { id: "demo-4", firstName: "Ibrahima", lastName: "Barry", email: "ibrahima.barry@example.org", phone: "+33 6 00 00 00 04", role: "Membre", joinedAt: `${new Date().getFullYear()}-03-06`, status: "active" },
  { id: "demo-5", firstName: "Mariama", lastName: "Soumah", email: "mariama.soumah@example.org", phone: "+33 6 00 00 00 05", role: "Membre", joinedAt: "2024-11-22", status: "archived" },
];

const emptyDraft: MemberDraft = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  role: "Membre",
  joinedAt: new Date().toISOString().slice(0, 10),
};

function loadMembers(): Member[] {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved === null) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(demoMembers));
      return demoMembers;
    }
    const parsed: unknown = JSON.parse(saved);
    return Array.isArray(parsed) ? parsed.filter(isMember) : demoMembers;
  } catch {
    return demoMembers;
  }
}

function isMember(value: unknown): value is Member {
  if (!value || typeof value !== "object") return false;
  const member = value as Partial<Member>;
  return typeof member.id === "string"
    && typeof member.firstName === "string"
    && typeof member.lastName === "string"
    && typeof member.email === "string"
    && typeof member.phone === "string"
    && typeof member.role === "string"
    && typeof member.joinedAt === "string"
    && (member.status === "active" || member.status === "archived");
}

function initials(member: Pick<Member, "firstName" | "lastName">) {
  return `${member.firstName.trim().charAt(0)}${member.lastName.trim().charAt(0)}`.toLocaleUpperCase("fr-FR");
}

function formatDate(value: string) {
  if (!value) return "—";
  return new Intl.DateTimeFormat("fr-FR", { day: "2-digit", month: "short", year: "numeric" }).format(new Date(`${value}T12:00:00`));
}

export default function Members() {
  const [members, setMembers] = useState<Member[]>([]);
  const [ready, setReady] = useState(false);
  const [filter, setFilter] = useState<(typeof filters)[number]["id"]>("active");
  const [query, setQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState<MemberDraft>(emptyDraft);
  const [error, setError] = useState("");

  useEffect(() => {
    setMembers(loadMembers());
    setReady(true);
  }, []);

  useEffect(() => {
    if (ready) localStorage.setItem(STORAGE_KEY, JSON.stringify(members));
  }, [members, ready]);

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

  function saveMember(event: FormEvent<HTMLFormElement>) {
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

    if (editingId) {
      setMembers((current) => current.map((member) => member.id === editingId ? { ...member, ...normalizedDraft } : member));
    } else {
      setMembers((current) => [{ id: crypto.randomUUID(), ...normalizedDraft, status: "active" }, ...current]);
    }
    closeModal();
  }

  function toggleArchive(member: Member) {
    setMembers((current) => current.map((item) => item.id === member.id
      ? { ...item, status: item.status === "active" ? "archived" : "active" }
      : item));
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
        <span><strong>Mode prototype</strong> — ces exemples sont fictifs et vos modifications restent dans ce navigateur.</span>
      </div>

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
              {displayedMembers.map((member) => (
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
              {displayedMembers.length === 0 && (
                <tr><td colSpan={6}><div className="empty-state"><span aria-hidden="true">♙</span><strong>{query ? "Aucun résultat" : "Aucun membre dans cette liste"}</strong><p>{query ? "Essayez un autre nom, e-mail ou rôle." : "Ajoutez un membre pour commencer à constituer l’annuaire."}</p>{!query && <button className="button button-secondary" onClick={openCreateModal}>Ajouter un membre</button>}</div></td></tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="table-footer"><span>{displayedMembers.length} membre{displayedMembers.length > 1 ? "s" : ""} affiché{displayedMembers.length > 1 ? "s" : ""}</span><span>Les exemples utilisent des adresses fictives.</span></div>
      </section>

      {isModalOpen && (
        <div className="modal-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) closeModal(); }}>
          <section className="member-modal" role="dialog" aria-modal="true" aria-labelledby="member-modal-title">
            <div className="modal-heading">
              <div><div className="eyebrow">DOSSIER ADHÉRENT</div><h2 id="member-modal-title">{editingId ? "Modifier le membre" : "Ajouter un membre"}</h2></div>
              <button className="icon-action modal-close" onClick={closeModal} aria-label="Fermer">×</button>
            </div>
            <p className="modal-intro">Renseignez les informations principales du membre.</p>
            <form onSubmit={saveMember}>
              <div className="form-grid">
                <label>Prénom<input autoFocus required maxLength={80} value={draft.firstName} onChange={(event) => setDraft({ ...draft, firstName: event.target.value })} placeholder="Ex. Aïssatou" /></label>
                <label>Nom<input required maxLength={80} value={draft.lastName} onChange={(event) => setDraft({ ...draft, lastName: event.target.value })} placeholder="Ex. Camara" /></label>
                <label className="form-span">Adresse e-mail<input required type="email" maxLength={160} value={draft.email} onChange={(event) => setDraft({ ...draft, email: event.target.value })} placeholder="prenom.nom@example.org" /></label>
                <label>Téléphone<input type="tel" maxLength={30} value={draft.phone} onChange={(event) => setDraft({ ...draft, phone: event.target.value })} placeholder="+33 6 …" /></label>
                <label>Rôle<select value={draft.role} onChange={(event) => setDraft({ ...draft, role: event.target.value })}>{roles.map((role) => <option key={role}>{role}</option>)}</select></label>
                <label>Date d’adhésion<input required type="date" value={draft.joinedAt} onChange={(event) => setDraft({ ...draft, joinedAt: event.target.value })} /></label>
              </div>
              {error && <p className="form-error" role="alert">{error}</p>}
              <div className="modal-actions"><button type="button" className="button button-secondary" onClick={closeModal}>Annuler</button><button type="submit" className="button button-primary">{editingId ? "Enregistrer les changements" : "Ajouter le membre"}</button></div>
            </form>
          </section>
        </div>
      )}
    </>
  );
}
