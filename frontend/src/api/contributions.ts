import { apiRequest } from "./http";

export type ContributionType = "ANNUAL" | "MONTHLY";
export type PaymentMethod = "CASH" | "BANK_TRANSFER" | "CHEQUE" | "OTHER";
export type Contribution = {
  id: string;
  memberId: string;
  memberName: string;
  memberEmail: string;
  type: ContributionType;
  periodYear: number;
  periodMonth: number | null;
  amount: number;
  paidAt: string;
  paymentMethod: PaymentMethod;
};
export type ContributionDraft = Omit<Contribution, "id" | "memberName" | "memberEmail" | "amount">;

export function fetchContributions(year: number) {
  return apiRequest<Contribution[]>(`/api/finance/contributions?year=${year}`);
}

export function recordContribution(draft: ContributionDraft) {
  return apiRequest<Contribution>("/api/finance/contributions", { method: "POST", body: JSON.stringify(draft) });
}
