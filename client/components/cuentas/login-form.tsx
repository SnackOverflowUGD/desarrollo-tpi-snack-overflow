"use client";

/**
 * Login form (design §5.1, REQ-01/02/03/08/11, ESC-UI-01..05/10). Mirrors the
 * registro-form pattern: RHF + zod, mode:'onBlur', Field/Alert primitives,
 * anti-double-submit. Submits to `loginUser` (Route Handler) and maps the
 * discriminated result to UX. The token is never visible here — it lives in
 * the httpOnly cookie set server-side.
 */
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff, KeyRound } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert } from "@/components/ui/alert";
import { Field } from "@/components/ui/field";

import { copy } from "@/lib/copy/es-AR";
import { loginUser } from "@/lib/api/auth";
import {
  loginSchema,
  loginDefaults,
  type LoginFormValues,
} from "@/lib/validation/login";
import { mapValidationErrors, mapLoginError } from "@/lib/errors/field-errors";
import { useSession } from "@/lib/session/session-context";
import { safeRedirectTarget } from "@/lib/session/next-redirect";
import { DEMO_ACCOUNTS, DEMO_PASSWORD } from "@/lib/demo/demo-credentials";

export function LoginForm({ next }: { next?: string }) {
  const { refresh } = useSession();

  const [globalError, setGlobalError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  // Demo-credentials helper (PoC only). Toggled by the key icon; picking an
  // account autofills the form so anyone can log in without knowing the seed.
  const [showDemo, setShowDemo] = useState(false);
  // After a successful 200 the form is locked until redirect (REQ-02/08).
  const [submitted, setSubmitted] = useState(false);
  // After 423 the submit stays disabled (no immediate retry, REQ-03/ESC-UI-03).
  const [lockedOut, setLockedOut] = useState(false);

  const alertRef = useRef<HTMLDivElement>(null);

  const {
    register,
    handleSubmit,
    setValue,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    mode: "onBlur",
    defaultValues: loginDefaults,
  });

  // Move focus to the banner when it appears (§8, REQ-11).
  useEffect(() => {
    if (globalError) alertRef.current?.focus();
  }, [globalError]);

  const locked = isSubmitting || submitted || lockedOut;

  // PoC helper: autofill the form with a demo account, then clear any prior error.
  function fillDemo(email: string) {
    setValue("email", email, { shouldValidate: true });
    setValue("password", DEMO_PASSWORD, { shouldValidate: true });
    setGlobalError(null);
    setShowDemo(false);
  }

  async function onSubmit(values: LoginFormValues) {
    setGlobalError(null);

    const result = await loginUser({
      email: values.email.trim(),
      password: values.password,
    });

    if (result.ok) {
      // Session is set (cookie). We must delay the navigation just enough for
      // the browser to commit the Set-Cookie to the cookie jar — navigating
      // immediately can lose the cookie because fetch() resolves before the
      // browser's cookie service finishes processing the response headers.
      // Once committed, a full page load ensures the server renders the
      // authenticated navbar (router.push() would serve stale RSC layout data
      // cached before login).
      setSubmitted(true);
      refresh();
      await new Promise((r) => setTimeout(r, 80));
      window.location.href = safeRedirectTarget(next);
      return;
    }

    switch (result.kind) {
      case "validation": {
        // 422 inline by field; non-mappable items go to the banner.
        const { fields, global } = mapValidationErrors(result.raw);
        for (const [key, message] of Object.entries(fields)) {
          if (key === "email" || key === "password") {
            setError(key, { type: "server", message });
          }
        }
        if (global.length > 0) setGlobalError(global[0]);
        break;
      }
      case "invalid_credentials": {
        // 401: generic banner, clear password, keep email (REQ-03/ESC-UI-02).
        setGlobalError(mapLoginError(result));
        setValue("password", "");
        break;
      }
      case "locked": {
        // 423: banner + disable submit permanently (ESC-UI-03).
        setGlobalError(mapLoginError(result));
        setLockedOut(true);
        break;
      }
      default:
        // 'suspended' (403), 'network', 'server' → banner, retry allowed.
        setGlobalError(mapLoginError(result));
    }
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      noValidate
      aria-busy={isSubmitting}
      className="flex flex-col gap-5"
    >
      {/* Demo-credentials helper (PoC only). */}
      <div className="relative flex justify-end">
        <button
          type="button"
          onClick={() => setShowDemo((s) => !s)}
          aria-expanded={showDemo}
          aria-label="Ver credenciales de demo"
          title="Ver credenciales de demo"
          className="inline-flex items-center gap-1.5 rounded-md border border-border px-2.5 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
        >
          <KeyRound className="size-3.5" aria-hidden="true" />
          Credenciales demo
        </button>

        {showDemo && (
          <div className="absolute right-0 top-full z-10 mt-2 w-72 rounded-lg border border-border bg-surface p-3 shadow-lg">
            <p className="mb-2 text-xs text-muted-foreground">
              Usuarios demo — contraseña{" "}
              <code className="rounded bg-muted px-1 py-0.5 font-mono">
                {DEMO_PASSWORD}
              </code>
              . Tocá uno para completar el formulario.
            </p>
            <ul className="flex max-h-64 flex-col gap-1 overflow-y-auto">
              {DEMO_ACCOUNTS.map((acc) => (
                <li key={acc.email}>
                  <button
                    type="button"
                    onClick={() => fillDemo(acc.email)}
                    disabled={locked}
                    className="flex w-full flex-col items-start rounded-md px-2 py-1.5 text-left hover:bg-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring disabled:opacity-50"
                  >
                    <span className="text-sm font-medium text-foreground">
                      {acc.label}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {acc.email}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {globalError && (
        <Alert ref={alertRef} variant="error" role="alert" tabIndex={-1}>
          {globalError}
        </Alert>
      )}

      <Field
        id="email"
        label={copy.login.emailLabel}
        required
        help={copy.login.emailHelp}
        error={errors.email?.message}
      >
        {({ id, describedBy, invalid }) => (
          <Input
            id={id}
            type="email"
            inputMode="email"
            autoComplete="email"
            aria-required="true"
            aria-invalid={invalid}
            aria-describedby={describedBy}
            disabled={locked}
            {...register("email")}
          />
        )}
      </Field>

      <Field
        id="password"
        label={copy.login.passwordLabel}
        required
        error={errors.password?.message}
      >
        {({ id, describedBy, invalid }) => (
          <div className="relative">
            <Input
              id={id}
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              aria-required="true"
              aria-invalid={invalid}
              aria-describedby={describedBy}
              disabled={locked}
              className="pr-11"
              {...register("password")}
            />
            <button
              type="button"
              onClick={() => setShowPassword((s) => !s)}
              aria-label={
                showPassword ? copy.login.passwordHide : copy.login.passwordShow
              }
              aria-pressed={showPassword}
              disabled={locked}
              className="absolute inset-y-0 right-0 flex w-11 items-center justify-center text-muted-foreground hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
            >
              {showPassword ? (
                <EyeOff className="size-4" aria-hidden="true" />
              ) : (
                <Eye className="size-4" aria-hidden="true" />
              )}
            </button>
          </div>
        )}
      </Field>

      <div className="flex justify-end">
        <Link
          href="/recuperar-contrasena"
          className="text-sm font-medium text-primary underline-offset-4 hover:underline"
        >
          {copy.login.forgotLink}
        </Link>
      </div>

      <Button
        type="submit"
        size="lg"
        loading={isSubmitting}
        disabled={locked}
        className="w-full"
      >
        {isSubmitting ? copy.login.submitting : copy.login.submit}
      </Button>
    </form>
  );
}
