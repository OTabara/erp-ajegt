import { useCallback, useEffect, useMemo, useState } from "react";
import type { FormEvent } from "react";
import { fetchContributions, recordContribution } from "../api/contributions";
import type { Contribution, ContributionDraft, ContributionType, PaymentMethod } from "../api/contributions";
import { ApiError } from "../api/http";
import { fetchMembers } from "../api/members";
import type { Member } from "../api/members";

const currentYear = new Date().getFullYear();
const months = ["Janvier", "Février", "Mars", "Avril", "Mai", "Juin", "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"];
const paymentMethods: { value: PaymentMethod; label: string }[] = [
  { value: "CASH", label: "Espèces" }, { value: "BANK_TRANSFER", label: "Virement" },
  { value: "CHEQUE", label: "Chèque" }, { value: "OTHER", label: "Autre" },
];
const formatAmount = (amount: number) => new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR" }).format(amount);

export default function Contributions() {
  const [year, setYear] = useState(currentYear);
  const [members, setMembers] = useState<Member[]>([]);
  const [items, setItems] = useState<Contribution[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [memberId, setMemberId] = useState("");
  const [type, setType] = useState<ContributionType>("ANNUAL");
  const [periodMonth, setPeriodMonth] = useState(new Date().getMonth() + 1);
  const [paidAt, setPaidAt] = useState(new Date().toISOString().slice(0, 10));
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("CASH");

  const reload = useCallback(async () => {
    setLoading(true); setError("");
    try { setItems(await fetchContributions(year)); }
    catch (cause) { setError(cause instanceof ApiError ? cause.message : "Le chargement des cotisations a échoué."); }
    finally { setLoading(false); }
  }, [year]);

  useEffect(() => { const timer = window.setTimeout(() => { void reload(); }, 0); return () => window.clearTimeout(timer); }, [reload]);
  useEffect(() => {
    let cancelled = false;
    fetchMembers().then(data => { if (!cancelled) setMembers(data.filter(member => member.status === "active")); })
      .catch(cause => { if (!cancelled) setError(cause instanceof ApiError ? cause.message : "Le chargement des membres a échoué."); });
    return () => { cancelled = true; };
  }, []);

  const total = useMemo(() => items.reduce((sum, item) => sum + item.amount, 0), [items]);
  const uniqueMembers = useMemo(() => new Set(items.map(item => item.memberId)).size, [items]);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setError(""); setNotice(""); setSaving(true);
    const draft: ContributionDraft = { memberId, type, periodYear: year, periodMonth: type === "MONTHLY" ? periodMonth : null, paidAt, paymentMethod };
    try {
      await recordContribution(draft);
      setNotice("Le paiement a été enregistré.");
      await reload();
    } catch (cause) { setError(cause instanceof ApiError ? cause.message : "L’enregistrement du paiement a échoué."); }
    finally { setSaving(false); }
  }

  return <>
    <div className="page-heading"><div><div className="eyebrow">TRÉSORERIE</div><h1>Cotisations</h1><p>Enregistrez et consultez les paiements des membres.</p></div>
      <label className="contribution-year">Année<select value={year} onChange={event => setYear(Number(event.target.value))}>{Array.from({ length: 7 }, (_, index) => currentYear + 1 - index).map(value => <option key={value}>{value}</option>)}</select></label>
    </div>
    <div className="contribution-stats" aria-label="Résumé annuel des cotisations">
      <div className="stat-card"><span className="stat-icon stat-icon-green" aria-hidden="true">€</span><span className="stat-copy"><span>Montant encaissé</span><strong>{formatAmount(total)}</strong></span><span className="stat-caption">en {year}</span></div>
      <div className="stat-card"><span className="stat-icon stat-icon-blue" aria-hidden="true">✓</span><span className="stat-copy"><span>Paiements reçus</span><strong>{items.length}</strong></span><span className="stat-caption">en {year}</span></div>
      <div className="stat-card"><span className="stat-icon stat-icon-sand" aria-hidden="true">♙</span><span className="stat-copy"><span>Membres à jour</span><strong>{uniqueMembers}</strong></span><span className="stat-caption">sur {members.length} actifs</span></div>
    </div>
    {error && <div className="page-error" role="alert"><span>{error}</span><button className="button button-secondary" onClick={() => void reload()}>Réessayer</button></div>}
    {notice && <p className="profile-notice" role="status">{notice}</p>}
    <div className="contribution-layout">
      <section className="members-panel contribution-form-panel"><div className="panel-heading"><div><h2>Enregistrer un paiement</h2><p>Le montant est calculé selon la formule choisie.</p></div></div>
        <form className="contribution-form" onSubmit={event => void submit(event)}>
          <label className="form-span">Membre<select required value={memberId} onChange={event => setMemberId(event.target.value)}><option value="">Choisir un membre actif</option>{members.map(member => <option key={member.id} value={member.id}>{member.firstName} {member.lastName}</option>)}</select></label>
          <label>Formule<select value={type} onChange={event => setType(event.target.value as ContributionType)}><option value="ANNUAL">Annuelle · 60 €</option><option value="MONTHLY">Mensuelle · 5 €</option></select></label>
          {type === "MONTHLY" && <label>Mois<select value={periodMonth} onChange={event => setPeriodMonth(Number(event.target.value))}>{months.map((month, index) => <option key={month} value={index + 1}>{month}</option>)}</select></label>}
          <label>Date du paiement<input required type="date" max={new Date().toISOString().slice(0, 10)} value={paidAt} onChange={event => setPaidAt(event.target.value)} /></label>
          <label>Mode de paiement<select value={paymentMethod} onChange={event => setPaymentMethod(event.target.value as PaymentMethod)}>{paymentMethods.map(method => <option key={method.value} value={method.value}>{method.label}</option>)}</select></label>
          <div className="contribution-amount"><span>Montant à enregistrer</span><strong>{formatAmount(type === "ANNUAL" ? 60 : 5)}</strong></div>
          <button className="button button-primary" disabled={saving || members.length === 0}>{saving ? "Enregistrement…" : "Enregistrer le paiement"}</button>
        </form>
      </section>
      <section className="members-panel contribution-history"><div className="panel-heading"><div><h2>Historique des paiements</h2><p>{items.length} paiement{items.length === 1 ? "" : "s"} enregistré{items.length === 1 ? "" : "s"} en {year}</p></div></div>
        {loading ? <div className="empty-state"><strong>Chargement…</strong></div> : items.length === 0 ? <div className="empty-state"><span>€</span><strong>Aucun paiement cette année</strong><p>Les paiements enregistrés apparaîtront ici.</p></div> : <div className="table-scroll"><table className="members-table"><thead><tr><th>Membre</th><th>Période</th><th>Montant</th><th>Payé le</th><th>Mode</th></tr></thead><tbody>{items.map(item => <tr key={item.id}><td><div className="member-name"><strong>{item.memberName}</strong><small>{item.memberEmail}</small></div></td><td>{item.type === "ANNUAL" ? `Annuel ${item.periodYear}` : `${months[(item.periodMonth ?? 1) - 1]} ${item.periodYear}`}</td><td><strong>{formatAmount(item.amount)}</strong></td><td>{new Intl.DateTimeFormat("fr-FR").format(new Date(`${item.paidAt}T12:00:00`))}</td><td>{paymentMethods.find(method => method.value === item.paymentMethod)?.label ?? "Autre"}</td></tr>)}</tbody></table></div>}
      </section>
    </div>
  </>;
}
