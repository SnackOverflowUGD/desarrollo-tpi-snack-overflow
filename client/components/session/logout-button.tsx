"use client";

/**
 * Logout action (design §6, REQ-06 / ESC-UI-06). POSTs to /api/auth/logout
 * (clears the httpOnly cookie), drops the local session, then navigates to
 * /login and refreshes so the layout re-hydrates as anonymous.
 */
import { useState } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { useSession } from "@/lib/session/session-context";
import { copy } from "@/lib/copy/es-AR";

const LOGOUT_ENDPOINT = "/api/auth/logout";

export function LogoutButton({ className }: { className?: string }) {
  const router = useRouter();
  const { clear } = useSession();
  const [pending, setPending] = useState(false);

  async function handleLogout() {
    setPending(true);
    try {
      await fetch(LOGOUT_ENDPOINT, { method: "POST" });
    } catch {
      // Even if the request fails, drop the client session and leave the area.
    }
    clear();
    router.push("/login");
    router.refresh();
  }

  return (
    <Button
      type="button"
      variant="outline"
      onClick={handleLogout}
      loading={pending}
      disabled={pending}
      className={className}
    >
      {pending ? copy.session.loggingOut : copy.session.logout}
    </Button>
  );
}
