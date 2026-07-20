"use client";

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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PasswordStrengthMeter } from "@/components/ui/password-strength";
import { RoleSelector } from "@/components/cuentas/role-selector";
import { toast } from "@/components/ui/toaster";

import { copy } from "@/lib/copy/es-AR";
import { TRADES, isRegulatedTrade } from "@/lib/trades";
import { UBICACIONES } from "@/lib/catalogo/ubicaciones";
import { registerUser, type RegisterPayload } from "@/lib/api/auth";
import { postRegistroRedirect } from "@/lib/cuenta/onboarding";
import {
  registroSchema,
  registroDefaults,
  type RegistroFormValues,
} from "@/lib/validation/registro";
import {
  mapValidationErrors,
  map409,
  mapGlobalError,
} from "@/lib/errors/field-errors";

// Redirect target after a successful 201. Login is built later (MI-02.2);
// a transient 404 on this branch is acceptable per coordinator resolution S3.
const LOGIN_PATH = "/login";

export function RegistroForm() {
  const router = useRouter();
  const [globalError, setGlobalError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  // After a successful 201 the form is locked until redirect (REQ-06).
  const [submitted, setSubmitted] = useState(false);
  const [pendingMessage, setPendingMessage] = useState<string | null>(null);

  const alertRef = useRef<HTMLDivElement>(null);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    setError,
    clearErrors,
    setFocus,
    formState: { errors, isSubmitting },
  } = useForm<RegistroFormValues>({
    resolver: zodResolver(registroSchema),
    mode: "onBlur",
    defaultValues: registroDefaults,
  });

  const role = watch("role");
  const password = watch("password");
  const trade = watch("trade");
  const localidad = watch("localidad");
  const isPrestador = role === "prestador";
  const showRegulatedNotice = isPrestador && trade !== "" && isRegulatedTrade(trade);

  // Show all UBICACIONES entries (cities + barrios like "Posadas — Centro").
  // Barrios use the "Ciudad — Barrio" label; the backend extracts the ciudad for coordinates.
  const LOCALIDADES = [...UBICACIONES].sort((a, b) => {
    if (a.ciudad !== b.ciudad) return a.ciudad.localeCompare(b.ciudad);
    if (a.barrio === null) return -1;
    if (b.barrio === null) return 1;
    return a.barrio.localeCompare(b.barrio);
  });

  // Move focus to the global error summary when it appears (§8, REQ-07.3).
  useEffect(() => {
    if (globalError) alertRef.current?.focus();
  }, [globalError]);

  const locked = isSubmitting || submitted;

  async function onSubmit(values: RegistroFormValues) {
    setGlobalError(null);

    // Build the payload: omit `trade` and `localidad` entirely for clientes (REQ-03, OCL P3).
    const payload: RegisterPayload = {
      name: values.name.trim(),
      lastName: values.lastName.trim(),
      email: values.email.trim(),
      phone: values.phone.trim(),
      password: values.password,
      role: values.role as RegisterPayload["role"],
      ...(values.role === "prestador"
        ? { trade: values.trade, localidad: values.localidad }
        : {}),
    };

    const result = await registerUser(payload);

    if (result.ok) {
      setSubmitted(true);
      const { role: registeredRole, providerStatus, message } = result.data;

      if (providerStatus === "pendiente_habilitacion") {
        // Surface the backend message in-screen (not just a toast) before redirect.
        setPendingMessage(message || copy.registro.regulatedNotice);
        toast.success(copy.registro.pendingTitle, { description: message });
      } else {
        toast.success(copy.registro.successToast);
      }

      // A newly registered ACTIVE prestador is guided (after login) to the
      // non-mandatory "completá tu perfil" onboarding step (ONBOARDING-REQ-01);
      // clientes and pending prestadores just land on /login.
      router.push(postRegistroRedirect(registeredRole, providerStatus));
      return;
    }

    switch (result.kind) {
      case "validation": {
        const { fields, global } = mapValidationErrors(result.raw);
        for (const [key, message] of Object.entries(fields)) {
          setError(key as keyof RegistroFormValues, { type: "server", message });
        }
        if (global.length > 0) setGlobalError(global[0]);
        break;
      }
      case "conflict": {
        // 409 duplicate email -> inline on email; keep all other values (REQ-08).
        setError("email", { type: "server", message: map409().fields.email });
        setFocus("email");
        break;
      }
      default:
        setGlobalError(mapGlobalError(result));
    }
  }

  // When switching back to cliente, drop any trade/localidad value/errors (REQ-03).
  function handleRoleChange(next: RegistroFormValues["role"]) {
    setValue("role", next, { shouldValidate: true });
    clearErrors("role");
    if (next === "cliente") {
      setValue("trade", "");
      clearErrors("trade");
      setValue("localidad", "");
      clearErrors("localidad");
    }
  }

  // Account already created: show the pending-habilitation panel before redirect.
  if (submitted && pendingMessage) {
    return (
      <Alert variant="warning" role="status">
        <p className="font-medium">{copy.registro.pendingTitle}</p>
        <p className="mt-1">{pendingMessage}</p>
      </Alert>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-5">
      {globalError && (
        <Alert ref={alertRef} variant="error" role="alert" tabIndex={-1}>
          {globalError}
        </Alert>
      )}

      {/* Role selector (REQ-01) */}
      <Field
        id="role"
        label={copy.registro.roleLegend}
        required
        help={copy.registro.roleHint}
        error={errors.role?.message}
      >
        {({ describedBy, invalid }) => (
          <RoleSelector
            value={role}
            onChange={handleRoleChange}
            describedBy={describedBy}
            invalid={invalid}
          />
        )}
      </Field>

      <Field
        id="name"
        label={copy.registro.nameLabel}
        required
        error={errors.name?.message}
      >
        {({ id, describedBy, invalid }) => (
          <Input
            id={id}
            autoComplete="given-name"
            aria-required="true"
            aria-invalid={invalid}
            aria-describedby={describedBy}
            disabled={locked}
            {...register("name")}
          />
        )}
      </Field>

      <Field
        id="lastName"
        label={copy.registro.lastNameLabel}
        required
        error={errors.lastName?.message}
      >
        {({ id, describedBy, invalid }) => (
          <Input
            id={id}
            autoComplete="family-name"
            aria-required="true"
            aria-invalid={invalid}
            aria-describedby={describedBy}
            disabled={locked}
            {...register("lastName")}
          />
        )}
      </Field>

      <Field
        id="email"
        label={copy.registro.emailLabel}
        required
        help={copy.registro.emailHelp}
        error={errors.email?.message}
      >
        {({ id, describedBy, invalid }) => (
          <div className="flex flex-col gap-1">
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
            {/* On 409, offer the path to login while keeping data (REQ-08). */}
            {errors.email?.type === "server" && (
              <Link
                href={LOGIN_PATH}
                className="self-start text-xs font-medium text-primary underline-offset-4 hover:underline"
              >
                {copy.emailTakenLink}
              </Link>
            )}
          </div>
        )}
      </Field>

      <Field
        id="phone"
        label={copy.registro.phoneLabel}
        required
        help={copy.registro.phoneHelp}
        error={errors.phone?.message}
      >
        {({ id, describedBy, invalid }) => (
          <Input
            id={id}
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            aria-required="true"
            aria-invalid={invalid}
            aria-describedby={describedBy}
            disabled={locked}
            {...register("phone")}
          />
        )}
      </Field>

      <Field
        id="password"
        label={copy.registro.passwordLabel}
        required
        help={copy.registro.passwordHelp}
        error={errors.password?.message}
      >
        {({ id, describedBy, invalid }) => (
          <div className="flex flex-col gap-2">
            <div className="relative">
              <Input
                id={id}
                type={showPassword ? "text" : "password"}
                autoComplete="new-password"
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
                  showPassword
                    ? copy.registro.passwordHide
                    : copy.registro.passwordShow
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
            <PasswordStrengthMeter value={password} />
          </div>
        )}
      </Field>

      {/* Conditional trade select for prestador (REQ-03) */}
      {isPrestador && (
        <Field
          id="trade"
          label={copy.registro.tradeLabel}
          required
          help={copy.registro.tradeHelp}
          error={errors.trade?.message}
        >
          {({ id, describedBy, invalid }) => (
            <Select
              value={trade}
              onValueChange={(value) => {
                setValue("trade", value, { shouldValidate: true });
                clearErrors("trade");
              }}
              disabled={locked}
            >
              <SelectTrigger
                id={id}
                aria-required="true"
                aria-invalid={invalid}
                aria-describedby={describedBy}
              >
                <SelectValue placeholder={copy.registro.tradePlaceholder} />
              </SelectTrigger>
              <SelectContent>
                {TRADES.map((t) => (
                  <SelectItem key={t.value} value={t.value}>
                    {t.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </Field>
      )}

      {/* Conditional localidad select for prestador */}
      {isPrestador && (
        <Field
          id="localidad"
          label={copy.registro.localidadLabel}
          required
          help={copy.registro.localidadHelp}
          error={errors.localidad?.message}
        >
          {({ id, describedBy, invalid }) => (
            <Select
              value={localidad}
              onValueChange={(value) => {
                setValue("localidad", value, { shouldValidate: true });
                clearErrors("localidad");
              }}
              disabled={locked}
            >
              <SelectTrigger
                id={id}
                aria-required="true"
                aria-invalid={invalid}
                aria-describedby={describedBy}
              >
                <SelectValue placeholder={copy.registro.localidadPlaceholder} />
              </SelectTrigger>
              <SelectContent>
                {LOCALIDADES.map((u) => (
                  <SelectItem key={u.id} value={u.label}>
                    {u.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </Field>
      )}

      {/* Regulated-trade notice (REQ-04) — appears immediately, before the CTA. */}
      {showRegulatedNotice && (
        <Alert variant="warning" role="note">
          {copy.registro.regulatedNotice}
        </Alert>
      )}

      <Button type="submit" size="lg" loading={isSubmitting} disabled={locked} className="w-full">
        {isSubmitting ? copy.registro.submitting : copy.registro.submit}
      </Button>

      <p className="text-center text-xs text-muted-foreground">
        {copy.registro.terms}
      </p>
    </form>
  );
}
