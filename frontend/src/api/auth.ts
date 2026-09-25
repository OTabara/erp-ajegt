import { apiRequest } from "./http";

export type AccountRole = "MEMBER" | "SECRETARY" | "TREASURER" | "ADMIN";
export type SessionUser = { id: string; email: string; displayName: string; role: AccountRole };
export type MemberProfile = { email: string; displayName: string; phone: string; role: AccountRole; createdAt: string };
export type PendingRegistration = { id: string; email: string; displayName: string; createdAt: string };

export const getSession = () => apiRequest<SessionUser>("/api/auth/session");
export async function login(email: string, password: string) {
  await apiRequest<void>("/api/auth/login", { method: "POST", body: new URLSearchParams({ email, password }) });
  return getSession();
}
export const logout = () => apiRequest<void>("/api/auth/logout", { method: "POST" });
export const register = (data: { email: string; displayName: string; phone?: string; password: string }) =>
  apiRequest<{ message: string }>("/api/auth/register", { method: "POST", body: JSON.stringify(data) });
export const getProfile = () => apiRequest<MemberProfile>("/api/auth/profile");
export const updateProfile = (data: Pick<MemberProfile, "displayName" | "phone">) =>
  apiRequest<MemberProfile>("/api/auth/profile", { method: "PATCH", body: JSON.stringify(data) });
export const getPendingRegistrations = () => apiRequest<PendingRegistration[]>("/api/auth/pending-registrations");
export const approveRegistration = (id: string, role: AccountRole) => apiRequest<void>(`/api/auth/pending-registrations/${encodeURIComponent(id)}/approve`, { method: "POST", body: JSON.stringify({ role }) });
export const rejectRegistration = (id: string) => apiRequest<void>(`/api/auth/pending-registrations/${encodeURIComponent(id)}/reject`, { method: "POST" });
