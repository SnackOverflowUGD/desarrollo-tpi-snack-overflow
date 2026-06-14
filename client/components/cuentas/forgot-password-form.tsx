"use client";

/**
 * Forgot-password form (design §5.2, REQ-09 / ESC-UI-08). Email → request a
 * reset link. The backend always returns 200, so on success we show a NEUTRAL
 * message (role="status") that never confirms or denies the account's
 * existence (anti-enumeration). Only network/5xx surface a retryable banner.
 */
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert } from "@/components/ui/alert";
import { Field } from "@/components/ui/field";

import { copy } from "@/lib/copy/es-AR";
import { requestPasswordReset } from "@/lib/api/auth";
import { mapGlobalError } from "@/lib/errors/field-errors";

const forgotSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, copy.fieldErrors.email)
    .max(255, copy.fieldErrors.email)
    .regex(/^[^\s@]+@[^\s@]+\.[^\s@]+$/, copy.fieldErrors.email),
});

type ForgotFormValues = z.infer<typeof forgotSchema>;

export function ForgotPasswordForm() {
  const [globalError, setGlobalError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);
  const alertRef = useRef<HTMLDivElement>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotFormValues>({
    resolver: zodResolver(forgotSchema),
    mode: "onBlur",
    defaultValues: { email: "" },
  });

  useEffect(() => {
    if (globalError) alertRef.current?.focus();
  }, [globalError]);

  async function onSubmit(values: ForgotFormValues) {
    setGlobalError(null);
    const result = await requestPasswordReset({ email: values.email.trim() });

    if (result.ok) {
      // Always neutral — never reveals whether the email exists (REQ-09).
      setSent(true);
      return;
    }
    // network / server → retryable banner (REQ-10).
    setGlobalError(mapGlobalError(result));
  }

  if (sent) {
    return (
      <div className="flex flex-col gap-4">
        <Alert variant="info" role="status">
          {copy.forgot.neutralMessage}
        </Alert>
        <p className="text-center text-sm text-muted-foreground">
          {copy.forgot.backToLoginPrompt}{" "}
          <Link
            href="/login"
            className="font-medium text-primary underline-offset-4 hover:underline"
          >
            {copy.forgot.backToLoginLink}
          </Link>
        </p>
      </div>
    );
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
        id="email"
        label={copy.forgot.emailLabel}
        required
        help={copy.forgot.emailHelp}
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
            disabled={isSubmitting}
            {...register("email")}
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
        {isSubmitting ? copy.forgot.submitting : copy.forgot.submit}
      </Button>
    </form>
  );
}
