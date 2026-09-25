export type MemberStatus = "active" | "archived";

export type Member = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  role: string;
  joinedAt: string;
  status: MemberStatus;
};

export type MemberDraft = Omit<Member, "id" | "status">;

type ApiMember = Omit<Member, "status"> & { status: "ACTIVE" | "ARCHIVED" };

import { apiRequest as request } from "./http";
export { ApiError } from "./http";

function fromApi(member: ApiMember): Member {
  return { ...member, status: member.status === "ACTIVE" ? "active" : "archived" };
}

export async function fetchMembers(): Promise<Member[]> {
  const members = await request<ApiMember[]>("/api/members?status=all");
  return members.map(fromApi);
}

export async function createMember(draft: MemberDraft): Promise<Member> {
  const member = await request<ApiMember>("/api/members", { method: "POST", body: JSON.stringify(draft) });
  return fromApi(member);
}

export async function updateMember(id: string, draft: MemberDraft): Promise<Member> {
  const member = await request<ApiMember>(`/api/members/${encodeURIComponent(id)}`, { method: "PUT", body: JSON.stringify(draft) });
  return fromApi(member);
}

export async function setMemberStatus(id: string, status: MemberStatus): Promise<Member> {
  const member = await request<ApiMember>(`/api/members/${encodeURIComponent(id)}/status`, {
    method: "PATCH",
    body: JSON.stringify({ status: status === "active" ? "ACTIVE" : "ARCHIVED" }),
  });
  return fromApi(member);
}
