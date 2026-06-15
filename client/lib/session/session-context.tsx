"use client";

/**
 * Client session context (design ADR-UC02-03). Exposes `useSession()` with a
 * non-sensitive snapshot of the session — NEVER the token (which is httpOnly).
 * The initial state is HYDRATED FROM THE SERVER via the `initial` prop (the
 * root layout reads the cookie/exp server-side), so the first render already
 * knows whether there is a session — no flash (ADR-UC02-01).
 *
 * `user` claims (email/role) are decoded from the JWT WITHOUT verifying its
 * signature and are decorative only; the backend remains the source of truth
 * for authorization.
 */
import * as React from "react";

export interface SessionUser {
  email?: string;
  role?: string;
  name?: string;
}

export type SessionStatus = "authenticated" | "anonymous";

export interface SessionState {
  status: SessionStatus;
  user?: SessionUser;
}

export interface SessionContextValue extends SessionState {
  /** Re-read the server-derived session (call after login). */
  refresh: () => void;
  /** Optimistically drop the local session (call on logout). */
  clear: () => void;
}

const SessionContext = React.createContext<SessionContextValue | null>(null);

const ANONYMOUS: SessionState = { status: "anonymous" };

export function SessionProvider({
  initial,
  children,
}: {
  initial: SessionState;
  children: React.ReactNode;
}) {
  // The server-hydrated `initial` is the source of truth and is re-derived on
  // every render (so router.refresh() after login/logout updates it without an
  // effect). We only keep a local `cleared` flag for the optimistic logout case
  // before the server round-trip lands.
  const [cleared, setCleared] = React.useState(false);

  const effective: SessionState = cleared ? ANONYMOUS : initial;

  // The React Compiler memoizes this; no manual useMemo needed.
  const value: SessionContextValue = {
    ...effective,
    // Re-adopt the server snapshot (pair with router.refresh()).
    refresh: () => setCleared(false),
    // Optimistically drop the local session (pair with router.refresh()).
    clear: () => setCleared(true),
  };

  return (
    <SessionContext.Provider value={value}>{children}</SessionContext.Provider>
  );
}

export function useSession(): SessionContextValue {
  const ctx = React.useContext(SessionContext);
  if (!ctx) {
    throw new Error("useSession must be used within a <SessionProvider>");
  }
  return ctx;
}
