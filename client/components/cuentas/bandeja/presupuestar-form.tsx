"use client";

/**
 * Proposal form (CORAZÓN — ADR-08-04/05, REQ-04/05/07/11/12/14, ESC-UI-02/04/05).
 * Mirrors the UC07 solicitud-form: RHF + zod, mode:'onBlur', Field/Alert/Button
 * primitives, anti-double-submit. Submits to `enviarPropuesta` (Route Handler)
 * and maps the discriminated result to UX. The token is never visible here.
 *
 * `contratacionId` comes from the selected item context and is NOT an editable
 * field; it is NEVER sent in the payload (REQ-04). The date picker fixes
 * `min={hoyISO()}` and the price input `min` > 0 to prevent the 422 (REQ-07).
 */
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert } from "@/components/ui/alert";
import { Field } from "@/components/ui/field";
import { toast } from "@/components/ui/toaster";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { copy } from "@/lib/copy/es-AR";
import { enviarPropuesta } from "@/lib/api/contrataciones";
import {
  proposalSchema,
  proposalDefaults,
  type ProposalFormValues,
} from "@/lib/validation/proposal";
import { hoyISO } from "@/lib/validation/solicitud";
import { mapResponderError } from "@/lib/errors/field-errors";

export function PresupuestarForm({
  contratacionId,
  fechaPedida,
  franjaPedida,
  onDone,
}: {
  contratacionId: string;
  fechaPedida?: string;
  franjaPedida?: string;
  onDone?: () => void;
}) {
  const router = useRouter();

  const [globalError, setGlobalError] = useState<string | null>(null);
  // After a 200 the form is locked (no resend, REQ-05).
  const [succeeded, setSucceeded] = useState(false);

  const alertRef = useRef<HTMLDivElement>(null);
  // `min` for the date picker — today's LOCAL date (REQ-07, blocks past dates).
  const minFecha = hoyISO();

  const {
    register,
    handleSubmit,
    control,
    setError,
    setFocus,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<ProposalFormValues>({
    resolver: zodResolver(proposalSchema),
    mode: "onBlur",
    // Prefill date/franja with the client's request so the prestador confirms
    // or adjusts (REQ-04 "MAY prefill").
    defaultValues: {
      ...proposalDefaults,
      fecha: fechaPedida ?? "",
      franja: franjaPedida ?? "",
    },
  });

  useEffect(() => {
    if (globalError) alertRef.current?.focus();
  }, [globalError]);

  async function onSubmit(values: ProposalFormValues) {
    setGlobalError(null);

    const result = await enviarPropuesta(contratacionId, {
      // id/prestadorId are NEVER in the payload (REQ-04).
      precioEstimado: values.precioEstimado,
      fecha: values.fecha,
      franja: values.franja,
    });

    if (result.ok) {
      // 200 → lock the form, announce success, refresh the inbox (REQ-05).
      setSucceeded(true);
      toast.success(copy.bandeja.exitoPresupuestar);
      router.refresh();
      return;
    }

    const mapped = mapResponderError(result);

    if (mapped.redirect) {
      const next = "/cuenta/solicitudes";
      router.push(`/login?next=${encodeURIComponent(next)}`);
      return;
    }

    if (mapped.field) {
      setError(mapped.field.key, {
        type: "server",
        message: mapped.field.message,
      });
      setFocus(mapped.field.key);
    }

    if (mapped.banner) setGlobalError(mapped.banner);
    // 404/409 → refresh the inbox to reflect the real state (REQ-10/11).
    if (mapped.refresh) router.refresh();
  }

  const busy = isSubmitting;

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      noValidate
      aria-busy={busy}
      className="flex flex-col gap-4"
    >
      {globalError && (
        <Alert ref={alertRef} variant="error" role="alert" tabIndex={-1}>
          {globalError}
        </Alert>
      )}

      <Field
        id={`precio-${contratacionId}`}
        label={copy.bandeja.precioLabel}
        required
        error={errors.precioEstimado?.message}
      >
        {({ id, describedBy, invalid }) => (
          <Input
            id={id}
            type="number"
            inputMode="decimal"
            min={1}
            step="0.01"
            placeholder={copy.bandeja.precioPlaceholder}
            aria-required="true"
            aria-invalid={invalid}
            aria-describedby={describedBy}
            disabled={busy || succeeded}
            {...register("precioEstimado", { valueAsNumber: true })}
          />
        )}
      </Field>

      <Field
        id={`fecha-${contratacionId}`}
        label={copy.bandeja.fechaLabel}
        required
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
              disabled={busy || succeeded}
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
        id={`franja-${contratacionId}`}
        label={copy.bandeja.franjaLabel}
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
                disabled={busy || succeeded}
              >
                <SelectTrigger
                  id={id}
                  aria-required="true"
                  aria-invalid={invalid}
                  aria-describedby={describedBy}
                  onBlur={field.onBlur}
                >
                  <SelectValue placeholder={copy.bandeja.franjaPlaceholder} />
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

      <div className="flex flex-wrap gap-3">
        <Button
          type="submit"
          loading={busy}
          disabled={busy || succeeded}
        >
          {busy ? copy.bandeja.presupuestando : copy.bandeja.enviarPropuesta}
        </Button>
        {onDone && !succeeded && (
          <Button
            type="button"
            variant="ghost"
            disabled={busy}
            onClick={onDone}
          >
            {copy.bandeja.cancelarAccion}
          </Button>
        )}
      </div>
    </form>
  );
}
