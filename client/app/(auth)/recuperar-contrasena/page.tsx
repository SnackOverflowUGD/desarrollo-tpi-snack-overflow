import type { Metadata } from "next";

import { ForgotPasswordForm } from "@/components/cuentas/forgot-password-form";
import { copy } from "@/lib/copy/es-AR";

export const metadata: Metadata = {
  title: `${copy.forgot.title} · ${copy.app.title}`,
  description: copy.app.description,
};

/**
 * Forgot-password screen shell (UC02, REQ-09). Server Component; only the
 * interactive <ForgotPasswordForm/> hydrates. Centered card, max-w-md.
 */
export default function RecuperarContrasenaPage() {
  return (
    <div className="flex flex-1 items-center justify-center px-4 py-10">
      <div className="w-full max-w-md rounded-lg border border-border bg-surface p-6 shadow-sm sm:p-8">
        <header className="mb-6 flex flex-col gap-1">
          <h1 className="text-2xl font-semibold text-foreground">
            {copy.forgot.title}
          </h1>
          <p className="text-sm text-muted-foreground">{copy.forgot.subtitle}</p>
        </header>

        <ForgotPasswordForm />
      </div>
    </div>
  );
}
