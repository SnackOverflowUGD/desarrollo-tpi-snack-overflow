"use client";

/**
 * Reset-password form (design §5.3, REQ-09 / ESC-UI-09). Takes the one-time
 * `token` from the URL. Missing token → "Enlace expirado" screen. On 200 →
 * success message then redirect to /login. On invalid_token → expired screen
 * with a CTA back to /recuperar-contrasena. 422 → inline on newPassword.
 */
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert } from "@/components/ui/alert";
import { Field } from "@/components/ui/field";

import { copy } from "@/lib/copy/es-AR";
import { resetPassword } from "@/lib/api/auth";
import {
  resetPasswordSchema,
  resetPasswordDefaults,
  type ResetPasswordFormValues,
} from "@/lib/validation/reset-password";
import { mapResetValidation, mapGlobalError } from "@/lib/errors/field-errors";

function ExpiredLinkScreen() {
  return (
    <div className="flex flex-col gap-4">
      <Alert variant="warning" role="status">
        <p className="font-medium">{copy.reset.expiredTitle}</p>
        <p className="mt-1">{copy.reset.expiredBody}</p>
      </Alert>
      <Button asChild size="lg" className="w-full">
        <Link href="/recuperar-contrasena">{copy.reset.expiredCta}</Link>
      </Button>
    </div>
  );
}

export function ResetPasswordForm({ token }: { token: string | undefined }) {
  const router = useRouter();

  const [globalError, setGlobalError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [expired, setExpired] = useState(false);
  const [done, setDone] = useState(false);

  const alertRef = useRef<HTMLDivElement>(null);

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordSchema),
    mode: "onBlur",
    defaultValues: resetPasswordDefaults,
  });

  useEffect(() => {
    if (globalError) alertRef.current?.focus();
  }, [globalError]);

  // Missing/empty token: the link is unusable — show the expired screen.
  if (!token || token.trim() === "") {
    return <ExpiredLinkScreen />;
  }

  if (expired) {
    return <ExpiredLinkScreen />;
  }

  if (done) {
    return (
      <Alert variant="info" role="status">
        {copy.reset.success}
      </Alert>
    );
  }

  async function onSubmit(values: ResetPasswordFormValues) {
    setGlobalError(null);
    const result = await resetPassword({
      token: token as string,
      newPassword: values.newPassword,
    });

    if (result.ok) {
      setDone(true);
      router.push("/login");
      return;
    }

    switch (result.kind) {
      case "invalid_token":
        setExpired(true);
        break;
      case "validation": {
        const { newPassword, global } = mapResetValidation(result.raw);
        if (newPassword) {
          setError("newPassword", { type: "server", message: newPassword });
        }
        if (global) setGlobalError(global);
        break;
      }
      default:
        // network / server → retryable banner (REQ-10).
        setGlobalError(mapGlobalError(result));
    }
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      noValidate
      aria-busy={isSubmitting}
      className="flex flex-col gap-5"
    >
      {globalError && (
        <Alert ref={alertRef} variant="error" role="alert" tabIndex={-1}>
          {globalError}
        </Alert>
      )}

      <Field
        id="newPassword"
        label={copy.reset.newPasswordLabel}
        required
        error={errors.newPassword?.message}
      >
        {({ id, describedBy, invalid }) => (
          <div className="relative">
            <Input
              id={id}
              type={showPassword ? "text" : "password"}
              autoComplete="new-password"
              aria-required="true"
              aria-invalid={invalid}
              aria-describedby={describedBy}
              disabled={isSubmitting}
              className="pr-11"
              {...register("newPassword")}
            />
            <button
              type="button"
              onClick={() => setShowPassword((s) => !s)}
              aria-label={
                showPassword ? copy.reset.passwordHide : copy.reset.passwordShow
              }
              aria-pressed={showPassword}
              disabled={isSubmitting}
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

      <Field
        id="confirmPassword"
        label={copy.reset.confirmPasswordLabel}
        required
        error={errors.confirmPassword?.message}
      >
        {({ id, describedBy, invalid }) => (
          <Input
            id={id}
            type={showPassword ? "text" : "password"}
            autoComplete="new-password"
            aria-required="true"
            aria-invalid={invalid}
            aria-describedby={describedBy}
            disabled={isSubmitting}
            {...register("confirmPassword")}
          />
        )}
      </Field>

      <Button
        type="submit"
        size="lg"
        loading={isSubmitting}
        disabled={isSubmitting}
        className="w-full"
      >
        {isSubmitting ? copy.reset.submitting : copy.reset.submit}
      </Button>
    </form>
  );
}
