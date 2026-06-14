import type { Metadata } from "next";

import { ResetPasswordForm } from "@/components/cuentas/reset-password-form";
import { copy } from "@/lib/copy/es-AR";

export const metadata: Metadata = {
  title: `${copy.reset.title} · ${copy.app.title}`,
  description: copy.app.description,
};

/**
 * Reset-password screen shell (UC02, REQ-09 / ESC-UI-09). Server Component;
 * reads the `token` search param (Promise in Next 16) and passes it to the
 * interactive <ResetPasswordForm/>, which handles the missing/expired cases.
 */
export default async function RestablecerContrasenaPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string | string[] }>;
}) {
  const { token } = await searchParams;
  const tokenParam = Array.isArray(token) ? token[0] : token;

  return (
    <div className="flex flex-1 items-center justify-center px-4 py-10">
      <div className="w-full max-w-md rounded-lg border border-border bg-surface p-6 shadow-sm sm:p-8">
        <header className="mb-6 flex flex-col gap-1">
          <h1 className="text-2xl font-semibold text-foreground">
            {copy.reset.title}
          </h1>
          <p className="text-sm text-muted-foreground">{copy.reset.subtitle}</p>
        </header>

        <ResetPasswordForm token={tokenParam} />
      </div>
    </div>
  );
}
