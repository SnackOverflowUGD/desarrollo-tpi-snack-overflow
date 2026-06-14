import type { Metadata } from "next";
import Link from "next/link";

import { LoginForm } from "@/components/cuentas/login-form";
import { copy } from "@/lib/copy/es-AR";

export const metadata: Metadata = {
  title: `${copy.login.title} · ${copy.app.title}`,
  description: copy.app.description,
};

/**
 * Login screen shell (UC02, REQ-12 / ESC-UI-07). Server Component: only the
 * interactive <LoginForm/> hydrates. Centered card, max-w-md. Reads the
 * `next` search param (Promise in Next 16) and forwards it to the form so a
 * post-login redirect can return the user to the route they originally wanted.
 */
export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string | string[] }>;
}) {
  const { next } = await searchParams;
  const nextParam = Array.isArray(next) ? next[0] : next;

  return (
    <div className="flex flex-1 items-center justify-center px-4 py-10">
      <div className="w-full max-w-md rounded-lg border border-border bg-surface p-6 shadow-sm sm:p-8">
        <header className="mb-6 flex flex-col gap-1">
          <h1 className="text-2xl font-semibold text-foreground">
            {copy.login.title}
          </h1>
          <p className="text-sm text-muted-foreground">
            {copy.login.subtitlePrompt}{" "}
            <Link
              href="/registro"
              className="font-medium text-primary underline-offset-4 hover:underline"
            >
              {copy.login.subtitleLink}
            </Link>
          </p>
        </header>

        <LoginForm next={nextParam} />
      </div>
    </div>
  );
}
