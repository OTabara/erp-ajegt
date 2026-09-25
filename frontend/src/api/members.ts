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

const API_URL = (import.meta.env.VITE_API_URL ?? "http://127.0.0.1:8080").replace(/\/$/, "");

export class ApiError extends Error {
  readonly status?: number;

  constructor(message: string, status?: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  let response: Response;
  try {
    response = await fetch(`${API_URL}${path}`, {
      ...init,
      headers: { Accept: "application/json", ...(init?.body ? { "Content-Type": "application/json" } : {}), ...init?.headers },
    });
  } catch {
    throw new ApiError("Impossible de joindre le serveur. Vérifiez que le backend est démarré.");
  }

  if (!response.ok) {
    let message = `La requête a échoué (${response.status}).`;
    try {
      const problem = await response.json() as { detail?: string; message?: string };
      message = problem.detail ?? problem.message ?? message;
    } catch {
      // Keep the readable HTTP fallback when the server returned no JSON body.
    }
    throw new ApiError(message, response.status);
  }

  if (response.status === 204) return undefined as T;
  return response.json() as Promise<T>;
}

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
