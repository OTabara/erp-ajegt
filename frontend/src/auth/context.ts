import { createContext } from "react";
import type { SessionUser } from "../api/auth";

export type AuthContextValue = { user: SessionUser | null; loading: boolean; login: (email: string, password: string) => Promise<void>; logout: () => Promise<void>; refresh: () => Promise<void> };
export const AuthContext = createContext<AuthContextValue | null>(null);
