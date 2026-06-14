import type { Metadata } from "next";
import Link from "next/link";

import { RegistroForm } from "@/components/cuentas/registro-form";
import { copy } from "@/lib/copy/es-AR";

export const metadata: Metadata = {
  title: `${copy.registro.title} · ${copy.app.title}`,
  description: copy.app.description,
};

/**
 * Registration screen shell (UC01, blueprint §7.1). Server Component: only the
 * interactive <RegistroForm/> hydrates. Centered card, max-w-md.
 */
export default function RegistroPage() {
  return (
    <div className="flex flex-1 items-center justify-center px-4 py-10">
      <div className="w-full max-w-md rounded-lg border border-border bg-surface p-6 shadow-sm sm:p-8">
        <header className="mb-6 flex flex-col gap-1">
          <h1 className="text-2xl font-semibold text-foreground">
            {copy.registro.title}
          </h1>
          <p className="text-sm text-muted-foreground">
            {copy.registro.loginPrompt}{" "}
            <Link
              href="/login"
              className="font-medium text-primary underline-offset-4 hover:underline"
            >
              {copy.registro.loginLink}
            </Link>
          </p>
        </header>

        <RegistroForm />
      </div>
    </div>
  );
}
