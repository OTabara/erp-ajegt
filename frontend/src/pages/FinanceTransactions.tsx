import { useCallback, useEffect, useMemo, useState } from "react";
import type { FormEvent } from "react";
import { createFinancialTransaction, fetchFinancialTransactions } from "../api/financialTransactions";
import type { FinancialTransaction, FinancialTransactionDraft, FinancialTransactionType } from "../api/financialTransactions";
import { fetchContributions } from "../api/contributions";
import type { Contribution } from "../api/contributions";
import type { PaymentMethod } from "../api/contributions";
import { ApiError } from "../api/http";

const currentYear = new Date().getFullYear();
const formatAmount = (amount: number) => new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR" }).format(amount);
const methods: { value: PaymentMethod; label: string }[] = [
  { value: "CASH", label: "Espèces" }, { value: "BANK_TRANSFER", label: "Virement" },
  { value: "CHEQUE", label: "Chèque" }, { value: "OTHER", label: "Autre" },
];
const paymentMethodLabel = (value: PaymentMethod) => methods.find(method => method.value === value)?.label ?? "Autre";
const csvCell = (value: string | number) => `"${String(value).replaceAll('"', '""')}"`;

export default function FinanceTransactions() {
  const [year, setYear] = useState(currentYear);
  const [items, setItems] = useState<FinancialTransaction[]>([]);
  const [contributions, setContributions] = useState<Contribution[]>([]);
  const [type, setType] = useState<FinancialTransactionType>("INCOME");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [transactionDate, setTransactionDate] = useState(new Date().toISOString().slice(0, 10));
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("CASH");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const reload = useCallback(async () => {
    setLoading(true); setError("");
    try {
      const [transactions, payments] = await Promise.all([fetchFinancialTransactions(year), fetchContributions(year)]);
      setItems(transactions);
      setContributions(payments);
    }
    catch (cause) { setError(cause instanceof ApiError ? cause.message : "Le chargement des opérations a échoué."); }
    finally { setLoading(false); }
  }, [year]);
  useEffect(() => { const timer = window.setTimeout(() => { void reload(); }, 0); return () => window.clearTimeout(timer); }, [reload]);

  const rows = useMemo(() => [
    ...items.map(item => ({ id: item.id, type: item.type, category: item.category, description: item.description, amount: item.amount, transactionDate: item.transactionDate, paymentMethod: item.paymentMethod })),
    ...contributions.map(item => ({
      id: `contribution-${item.id}`, type: "INCOME" as const, category: "Cotisation",
      description: `${item.memberName} · ${item.type === "ANNUAL" ? `annuelle ${item.periodYear}` : `mensuelle ${item.periodMonth}/${item.periodYear}`}`,
      amount: item.amount, transactionDate: item.paidAt, paymentMethod: item.paymentMethod,
    })),
  ].sort((left, right) => right.transactionDate.localeCompare(left.transactionDate)), [contributions, items]);
  const totals = useMemo(() => rows.reduce((result, item) => {
    result[item.type] += item.amount;
    return result;
  }, { INCOME: 0, EXPENSE: 0 }), [rows]);
  const balance = totals.INCOME - totals.EXPENSE;

  function exportCsv() {
    const csvRows: (string | number)[][] = [
      ["Bilan financier AJEGT", year],
      ["Recettes, cotisations incluses (€)", totals.INCOME.toFixed(2).replace(".", ",")],
      ["Dépenses (€)", totals.EXPENSE.toFixed(2).replace(".", ",")],
      ["Solde (€)", balance.toFixed(2).replace(".", ",")],
      [],
      ["Type", "Catégorie", "Libellé", "Montant (€)", "Date", "Mode de paiement"],
      ...rows.map(item => [
        item.type === "INCOME" ? "Recette" : "Dépense", item.category, item.description,
        `${item.type === "EXPENSE" ? "-" : ""}${item.amount.toFixed(2).replace(".", ",")}`,
        item.transactionDate, paymentMethodLabel(item.paymentMethod),
      ]),
    ];
    const content = `\uFEFF${csvRows.map(row => row.map(csvCell).join(";")).join("\r\n")}`;
    const url = URL.createObjectURL(new Blob([content], { type: "text/csv;charset=utf-8" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = `bilan-financier-ajegt-${year}.csv`;
    link.click();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setError(""); setNotice(""); setSaving(true);
    const draft: FinancialTransactionDraft = { type, category: category.trim(), description: description.trim(), amount: Number(amount), transactionDate, paymentMethod, periodYear: year };
    try {
      await createFinancialTransaction(draft);
      setNotice(type === "INCOME" ? "La recette a été enregistrée." : "La dépense a été enregistrée.");
      setCategory(""); setDescription(""); setAmount("");
      await reload();
    } catch (cause) { setError(cause instanceof ApiError ? cause.message : "L’enregistrement de l’opération a échoué."); }
    finally { setSaving(false); }
  }

  return <>
    <div className="page-heading no-print"><div><div className="eyebrow">TRÉSORERIE</div><h1>Recettes et dépenses</h1><p>Suivez les entrées et sorties de fonds de l’association.</p></div>
      <div className="finance-report-actions"><label className="contribution-year">Année<select value={year} onChange={event => setYear(Number(event.target.value))}>{Array.from({ length: 7 }, (_, index) => currentYear + 1 - index).map(value => <option key={value}>{value}</option>)}</select></label><button className="button button-secondary" disabled={loading || Boolean(error)} onClick={exportCsv}>Exporter CSV</button><button className="button button-primary" disabled={loading || Boolean(error)} onClick={() => window.print()}>Imprimer / PDF</button></div>
    </div>
    <header className="finance-report-header print-only"><div className="eyebrow">AJEGT · TRÉSORERIE</div><h1>Bilan financier {year}</h1><p>Association des Jeunes et Étudiants Guinéens de Toulouse</p><small>Généré le {new Intl.DateTimeFormat("fr-FR", { dateStyle: "long" }).format(new Date())}</small></header>
    <div className="contribution-stats finance-summary" aria-label="Résumé financier annuel">
      <div className="stat-card"><span className="stat-icon stat-icon-green" aria-hidden="true">↙</span><span className="stat-copy"><span>Recettes</span><strong>{formatAmount(totals.INCOME)}</strong></span><span className="stat-caption">en {year}</span></div>
      <div className="stat-card"><span className="stat-icon stat-icon-sand" aria-hidden="true">↗</span><span className="stat-copy"><span>Dépenses</span><strong>{formatAmount(totals.EXPENSE)}</strong></span><span className="stat-caption">en {year}</span></div>
      <div className="stat-card"><span className="stat-icon stat-icon-blue" aria-hidden="true">＝</span><span className="stat-copy"><span>Solde</span><strong>{formatAmount(balance)}</strong></span><span className="stat-caption">recettes − dépenses</span></div>
    </div>
    {error && <div className="page-error" role="alert"><span>{error}</span><button className="button button-secondary" onClick={() => void reload()}>Réessayer</button></div>}
    {notice && <p className="profile-notice" role="status">{notice}</p>}
    <div className="contribution-layout">
      <section className="members-panel contribution-form-panel no-print"><div className="panel-heading"><div><h2>Enregistrer une opération</h2><p>Ajoutez une recette ou une dépense.</p></div></div>
        <form className="contribution-form" onSubmit={event => void submit(event)}>
          <label>Type<select value={type} onChange={event => setType(event.target.value as FinancialTransactionType)}><option value="INCOME">Recette</option><option value="EXPENSE">Dépense</option></select></label>
          <label>Catégorie<input required maxLength={60} value={category} onChange={event => setCategory(event.target.value)} placeholder={type === "INCOME" ? "Ex. Don, subvention" : "Ex. Transport, matériel"} /></label>
          <label className="form-span">Libellé<input required maxLength={160} value={description} onChange={event => setDescription(event.target.value)} placeholder="Objet de l’opération" /></label>
          <label>Montant (€)<input required type="number" min="0.01" step="0.01" value={amount} onChange={event => setAmount(event.target.value)} placeholder="0,00" /></label>
          <label>Date<input required type="date" max={new Date().toISOString().slice(0, 10)} value={transactionDate} onChange={event => setTransactionDate(event.target.value)} /></label>
          <label className="form-span">Mode de paiement<select value={paymentMethod} onChange={event => setPaymentMethod(event.target.value as PaymentMethod)}>{methods.map(method => <option key={method.value} value={method.value}>{method.label}</option>)}</select></label>
          <button className="button button-primary" disabled={saving}>{saving ? "Enregistrement…" : "Enregistrer l’opération"}</button>
        </form>
      </section>
      <section className="members-panel contribution-history"><div className="panel-heading"><div><h2>Journal financier</h2><p>{rows.length} opération{rows.length === 1 ? "" : "s"} en {year}</p></div></div>
        {loading ? <div className="empty-state"><strong>Chargement…</strong></div> : rows.length === 0 ? <div className="empty-state"><span>€</span><strong>Aucune opération cette année</strong><p>Les recettes, cotisations et dépenses apparaîtront ici.</p></div> : <div className="table-scroll"><table className="members-table"><thead><tr><th>Type</th><th>Catégorie et libellé</th><th>Montant</th><th>Date</th><th>Mode</th></tr></thead><tbody>{rows.map(item => <tr key={item.id}><td><span className={`status-pill ${item.type === "INCOME" ? "active" : "archived"}`}>{item.type === "INCOME" ? "Recette" : "Dépense"}</span></td><td><div className="member-name"><strong>{item.category}</strong><small>{item.description}</small></div></td><td><strong>{item.type === "EXPENSE" ? "−" : "+"}{formatAmount(item.amount)}</strong></td><td>{new Intl.DateTimeFormat("fr-FR").format(new Date(`${item.transactionDate}T12:00:00`))}</td><td>{paymentMethodLabel(item.paymentMethod)}</td></tr>)}</tbody></table></div>}
      </section>
    </div>
  </>;
}
