import { apiRequest } from "./http";

export type EventStatus = "DRAFT" | "PUBLISHED" | "CANCELLED";
export type EventItem = {
  id: string;
  title: string;
  description: string;
  location: string;
  startsAt: string;
  endsAt: string;
  status: EventStatus;
};
export type EventDraft = Omit<EventItem, "id" | "status">;

export const fetchEvents = () => apiRequest<EventItem[]>("/api/events");
export const createEvent = (draft: EventDraft) => apiRequest<EventItem>("/api/events", { method: "POST", body: JSON.stringify(draft) });
export const updateEvent = (id: string, draft: EventDraft) => apiRequest<EventItem>(`/api/events/${encodeURIComponent(id)}`, { method: "PUT", body: JSON.stringify(draft) });
export const setEventStatus = (id: string, status: EventStatus) => apiRequest<EventItem>(`/api/events/${encodeURIComponent(id)}/status`, { method: "PATCH", body: JSON.stringify({ status }) });
