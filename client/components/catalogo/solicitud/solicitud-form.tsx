"use client";

/**
 * Hiring request form (CORAZÓN — ADR-07-03, REQ-02/03/05..13, ESC-UI-01/03..07).
 * Mirrors the login-form pattern: RHF + zod, mode:'onBlur', Field/Alert/Select
 * primitives, anti-double-submit. Submits to `crearSolicitud` (Route Handler)
 * and maps the discriminated result to UX. The token is never visible here —
 * it lives in the httpOnly cookie attached server-side by `backendFetch`.
 *
 * `prestadorId` comes from the route context and is NOT an editable field; it
 * is sent in the payload but never rendered as an input (REQ-02).
 */
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

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

import { copy } from "@/lib/copy/es-AR";
import { crearSolicitud } from "@/lib/api/contrataciones";
import {
  solicitudSchema,
  solicitudDefaults,
  hoyISO,
  type SolicitudFormValues,
} from "@/lib/validation/solicitud";
import { mapSolicitudError } from "@/lib/errors/field-errors";
import { SolicitudExito } from "@/components/catalogo/solicitud/solicitud-exito";

export function SolicitudForm({ prestadorId }: { prestadorId: string }) {
  const router = useRouter();

  const [globalError, setGlobalError] = useState<string | null>(null);
  // 404 → show "Volver a la búsqueda" alongside the banner (REQ-08).
  const [showVolverBusqueda, setShowVolverBusqueda] = useState(false);
  // After a 201 the form is replaced by the success panel (REQ-05).
  const [succeeded, setSucceeded] = useState(false);

  const alertRef = useRef<HTMLDivElement>(null);
  // `min` for the date picker — today's LOCAL date (REQ-03, blocks past dates).
  const minFecha = hoyISO();

  const {
    register,
    handleSubmit,
    control,
    setError,
    setFocus,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<SolicitudFormValues>({
    resolver: zodResolver(solicitudSchema),
    mode: "onBlur",
    defaultValues: solicitudDefaults,
  });

  // Move focus to the banner when it appears (§8, REQ-10/11).
  useEffect(() => {
    if (globalError) alertRef.current?.focus();
  }, [globalError]);

  async function onSubmit(values: SolicitudFormValues) {
    setGlobalError(null);
    setShowVolverBusqueda(false);

    const result = await crearSolicitud({
      ubicacion: values.ubicacion.trim(),
      prestadorId, // from route context — never user-editable (REQ-02/04)
      fecha: values.fecha,
      franja: values.franja,
      descripcion: values.descripcion.trim(),
    });

    if (result.ok) {
      // 201 → lock the form, show the success panel (REQ-05). No resend.
      setSucceeded(true);
      return;
    }

    const mapped = mapSolicitudError(result);

    if (mapped.redirect) {
      // 401 → treat as no session, preserve the destination (REQ-06).
      const next = `/prestadores/${prestadorId}/solicitar`;
      router.push(`/login?next=${encodeURIComponent(next)}`);
      return;
    }

    // 409/422 → inline under the offending field (keeps the rest of the data).
    if (mapped.field) {
      setError(mapped.field.key, {
        type: "server",
        message: mapped.field.message,
      });
      setFocus(mapped.field.key);
    }

    if (mapped.noDisponible) setShowVolverBusqueda(true);
    if (mapped.banner) setGlobalError(mapped.banner);
  }

  if (succeeded) {
    return <SolicitudExito prestadorId={prestadorId} />;
  }

  const busy = isSubmitting;

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      noValidate
      aria-busy={busy}
      className="flex flex-col gap-5"
    >
      {globalError && (
        <Alert ref={alertRef} variant="error" role="alert" tabIndex={-1}>
          <div className="flex flex-col gap-2">
            <span>{globalError}</span>
            {showVolverBusqueda && (
              <Link
                href="/prestadores"
                className="w-fit text-sm font-medium text-primary underline-offset-4 hover:underline"
              >
                {copy.solicitud.volverABusqueda}
              </Link>
            )}
          </div>
        </Alert>
      )}

      <Field
        id="ubicacion"
        label={copy.solicitud.ubicacionLabel}
        required
        help={copy.solicitud.ubicacionHelp}
        error={errors.ubicacion?.message}
      >
        {({ id, describedBy, invalid }) => (
          <Input
            id={id}
            type="text"
            autoComplete="off"
            aria-required="true"
            aria-invalid={invalid}
            aria-describedby={describedBy}
            disabled={busy}
            {...register("ubicacion")}
          />
        )}
      </Field>

      <Field
        id="fecha"
        label={copy.solicitud.fechaLabel}
        required
        help={copy.solicitud.fechaHelp}
        error={errors.fecha?.message}
      >
        {({ id, describedBy, invalid }) => (
          <div className="flex flex-col gap-1">
            <Input
              id={id}
              type="date"
              min={minFecha}
              aria-required="true"
              aria-invalid={invalid}
              aria-describedby={describedBy}
              disabled={busy}
              {...register("fecha")}
            />
            {watch("fecha") && (
              <p className="text-xs text-muted-foreground">
                {new Date(watch("fecha") + "T12:00:00").toLocaleDateString("es-AR", {
                  day: "2-digit",
                  month: "2-digit",
                  year: "numeric",
                })}
              </p>
            )}
          </div>
        )}
      </Field>

      <Field
        id="franja"
        label={copy.solicitud.franjaLabel}
        required
        error={errors.franja?.message}
      >
        {({ id, describedBy, invalid }) => (
          <Controller
            control={control}
            name="franja"
            render={({ field }) => (
              <Select
                value={field.value || undefined}
                onValueChange={field.onChange}
                disabled={busy}
              >
                <SelectTrigger
                  id={id}
                  aria-required="true"
                  aria-invalid={invalid}
                  aria-describedby={describedBy}
                  onBlur={field.onBlur}
                >
                  <SelectValue placeholder={copy.solicitud.franjaPlaceholder} />
                </SelectTrigger>
                <SelectContent>
                  {copy.solicitud.franjas.map((franja) => (
                    <SelectItem key={franja} value={franja}>
                      {franja}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
        )}
      </Field>

      <Field
        id="descripcion"
        label={copy.solicitud.descripcionLabel}
        required
        help={copy.solicitud.descripcionHelp}
        error={errors.descripcion?.message}
      >
        {({ id, describedBy, invalid }) => (
          <textarea
            id={id}
            rows={4}
            aria-required="true"
            aria-invalid={invalid}
            aria-describedby={describedBy}
            disabled={busy}
            className="flex w-full rounded-md border border-border-strong bg-surface px-3 py-2 text-foreground transition-colors placeholder:text-muted-foreground focus-visible:border-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring disabled:cursor-not-allowed disabled:bg-surface-sunken disabled:text-muted-foreground aria-[invalid=true]:border-error aria-[invalid=true]:focus-visible:outline-error"
            {...register("descripcion")}
          />
        )}
      </Field>

      <Button
        type="submit"
        size="lg"
        loading={busy}
        disabled={busy}
        className="w-full sm:w-auto"
      >
        {busy ? copy.solicitud.submitting : copy.solicitud.submit}
      </Button>
    </form>
  );
}
