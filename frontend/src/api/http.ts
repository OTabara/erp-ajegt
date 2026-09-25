// In development, same-origin Vite proxying keeps the session cookie and CSRF token together.
const API_URL = (import.meta.env.VITE_API_URL ?? "").replace(/\/$/, "");

export class ApiError extends Error {
  readonly status?: number;
  constructor(message: string, status?: number) { super(message); this.name = "ApiError"; this.status = status; }
}

async function getCsrf() {
  const response = await fetch(`${API_URL}/api/auth/csrf`, { credentials: "include", headers: { Accept: "application/json" } });
  if (!response.ok) throw new ApiError("Impossible de sécuriser la requête.", response.status);
  return await response.json() as { token: string; headerName: string };
}

export async function apiRequest<T>(path: string, init: RequestInit = {}): Promise<T> {
  const method = (init.method ?? "GET").toUpperCase();
  const headers = new Headers(init.headers);
  headers.set("Accept", "application/json");
  if (init.body && !(init.body instanceof URLSearchParams)) headers.set("Content-Type", "application/json");
  if (!["GET", "HEAD", "OPTIONS"].includes(method)) {
    const csrf = await getCsrf();
    headers.set(csrf.headerName, csrf.token);
  }
  let response: Response;
  try {
    response = await fetch(`${API_URL}${path}`, { ...init, method, headers, credentials: "include" });
  } catch {
    throw new ApiError("Impossible de joindre le serveur. Vérifiez que le backend est démarré.");
  }
  if (!response.ok) {
    let message = `La requête a échoué (${response.status}).`;
    try { const problem = await response.json() as { detail?: string; message?: string }; message = problem.detail ?? problem.message ?? message; } catch { /* réponse sans JSON */ }
    throw new ApiError(message, response.status);
  }
  if (response.status === 204) return undefined as T;
  return response.json() as Promise<T>;
}
