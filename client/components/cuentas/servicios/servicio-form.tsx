"use client";

/**
 * Servicio create/edit form (PSM-REQ-05/07). Mirrors the RHF + zod +
 * Field/Alert/Button conventions of presupuestar-form. Submits to
 * `crearServicio`/`actualizarServicio` (the /api/prestadores/me/servicios BFF),
 * which attach the session Bearer server-side. Maps the discriminated result to
 * UX and NEVER throws for business 4xx. On success, calls `onSaved` so the
 * parent re-fetches the (server-rendered) list.
 */
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Alert } from "@/components/ui/alert";
import { Field } from "@/components/ui/field";
import { toast } from "@/components/ui/toaster";

import { copy } from "@/lib/copy/es-AR";
import {
  crearServicio,
  actualizarServicio,
  type MiServicio,
} from "@/lib/api/prestador-me";
import {
  servicioSchema,
  servicioDefaults,
  servicioDefaultsFrom,
  buildCrearServicioPayload,
  buildActualizarServicioPayload,
  type ServicioFormValues,
} from "@/lib/validation/servicio";

const LOGIN_PATH = "/login";

export function ServicioForm({
  servicio,
  onCancel,
  onSaved,
}: {
  servicio?: MiServicio;
  onCancel: () => void;
  onSaved: () => void;
}) {
  const router = useRouter();
  const c = copy.cuenta.servicios;
  const isEdit = Boolean(servicio);

  const [globalError, setGlobalError] = useState<string | null>(null);
  const alertRef = useRef<HTMLDivElement>(null);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<ServicioFormValues>({
    resolver: zodResolver(servicioSchema),
    mode: "onBlur",
    defaultValues: servicio ? servicioDefaultsFrom(servicio) : servicioDefaults,
  });

  const visible = watch("visible");

  useEffect(() => {
    if (globalError) alertRef.current?.focus();
  }, [globalError]);

  async function onSubmit(values: ServicioFormValues) {
    setGlobalError(null);

    const result = servicio
      ? await actualizarServicio(
          servicio.id,
          buildActualizarServicioPayload(values),
        )
      : await crearServicio(buildCrearServicioPayload(values));

    if (result.ok) {
      toast.success(isEdit ? c.exitoEditar : c.exitoCrear);
      onSaved();
      return;
    }

    switch (result.kind) {
      case "unauthorized":
        router.push(
          `${LOGIN_PATH}?next=${encodeURIComponent("/cuenta/servicios")}`,
        );
        return;
      case "no_disponible":
        setGlobalError(c.noDisponible);
        onSaved(); // refresh the list to reflect the real state
        return;
      case "validation":
        setGlobalError(c.validacionGenerica);
        return;
      default:
        setGlobalError(c.errorAccion);
    }
  }

  const busy = isSubmitting;

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      noValidate
      aria-busy={busy}
      className="flex flex-col gap-4 rounded-md border border-border bg-surface-raised p-4"
    >
      {globalError && (
        <Alert ref={alertRef} variant="error" role="alert" tabIndex={-1}>
          {globalError}
        </Alert>
      )}

      <Field
        id="servicio-categoria"
        label={c.categoriaLabel}
        required
        help={c.categoriaHelp}
        error={errors.categoria?.message}
      >
        {({ id, describedBy, invalid }) => (
          <Input
            id={id}
            placeholder={c.categoriaPlaceholder}
            aria-required="true"
            aria-invalid={invalid}
            aria-describedby={describedBy}
            disabled={busy}
            {...register("categoria")}
          />
        )}
      </Field>

      <Field
        id="servicio-descripcion"
        label={c.descripcionLabel}
        required
        help={c.descripcionHelp}
        error={errors.descripcion?.message}
      >
        {({ id, describedBy, invalid }) => (
          <Textarea
            id={id}
            rows={3}
            placeholder={c.descripcionPlaceholder}
            aria-required="true"
            aria-invalid={invalid}
            aria-describedby={describedBy}
            disabled={busy}
            {...register("descripcion")}
          />
        )}
      </Field>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field
          id="servicio-precio-min"
          label={c.precioMinLabel}
          error={errors.rangoPrecioMin?.message}
        >
          {({ id, describedBy, invalid }) => (
            <Input
              id={id}
              type="number"
              inputMode="decimal"
              min={0}
              step="0.01"
              placeholder={c.precioPlaceholder}
              aria-invalid={invalid}
              aria-describedby={describedBy}
              disabled={busy}
              {...register("rangoPrecioMin")}
            />
          )}
        </Field>

        <Field
          id="servicio-precio-max"
          label={c.precioMaxLabel}
          error={errors.rangoPrecioMax?.message}
        >
          {({ id, describedBy, invalid }) => (
            <Input
              id={id}
              type="number"
              inputMode="decimal"
              min={0}
              step="0.01"
              placeholder={c.precioPlaceholder}
              aria-invalid={invalid}
              aria-describedby={describedBy}
              disabled={busy}
              {...register("rangoPrecioMax")}
            />
          )}
        </Field>
      </div>

      <label
        htmlFor="servicio-visible"
        className="flex items-center gap-2 text-sm font-medium text-foreground"
      >
        <input
          id="servicio-visible"
          type="checkbox"
          checked={visible}
          disabled={busy}
          onChange={(e) => setValue("visible", e.target.checked)}
          className="size-4"
        />
        {c.visibleLabel}
      </label>

      <div className="flex flex-wrap gap-3">
        <Button type="submit" loading={busy} disabled={busy}>
          {busy ? c.guardando : c.guardar}
        </Button>
        <Button type="button" variant="ghost" disabled={busy} onClick={onCancel}>
          {c.cancelar}
        </Button>
      </div>
    </form>
  );
}
