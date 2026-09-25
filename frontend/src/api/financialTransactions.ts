import { apiRequest } from "./http";
import type { PaymentMethod } from "./contributions";

export type FinancialTransactionType = "INCOME" | "EXPENSE";
export type FinancialTransaction = {
  id: string;
  type: FinancialTransactionType;
  category: string;
  description: string;
  amount: number;
  transactionDate: string;
  paymentMethod: PaymentMethod;
};
export type FinancialTransactionDraft = Omit<FinancialTransaction, "id"> & { periodYear: number };

export function fetchFinancialTransactions(year: number) {
  return apiRequest<FinancialTransaction[]>(`/api/finance/transactions?year=${year}`);
}

export function createFinancialTransaction(draft: FinancialTransactionDraft) {
  return apiRequest<FinancialTransaction>("/api/finance/transactions", { method: "POST", body: JSON.stringify(draft) });
}
