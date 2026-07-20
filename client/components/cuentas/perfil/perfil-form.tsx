"use client";

/**
 * Prestador profile-edit form (PSM-REQ-02/03/04). Mirrors the RHF + zod +
 * Field/Alert/Button conventions of registro-form / presupuestar-form. Submits
 * to `updateProfile` (the /api/prestadores/me BFF), which attaches the session
 * Bearer server-side — the token is never visible here. Maps the discriminated
 * result to UX and NEVER throws for business 4xx.
 *
 * `oficios` is a multi-checkbox over the curated TRADES labels; `localidad` is a
 * Select over the same UBICACIONES labels the registro form submits (so the UI
 * can never send an unknown localidad the backend would reject).
 */
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/alert";
import { Field } from "@/components/ui/field";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "@/components/ui/toaster";

import { copy } from "@/lib/copy/es-AR";
import { TRADES } from "@/lib/trades";
import { UBICACIONES } from "@/lib/catalogo/ubicaciones";
import { updateProfile, type MiPerfil } from "@/lib/api/prestador-me";
import {
  perfilSchema,
  perfilDefaultsFrom,
  buildActualizarPerfilPayload,
  DISPONIBILIDAD_ESTADOS,
  type PerfilFormValues,
} from "@/lib/validation/perfil";

const LOGIN_PATH = "/login";
const SERVICIOS_PATH = "/cuenta/servicios";

// Same ordering the registro form uses (city, then barrios alphabetically).
const LOCALIDADES = [...UBICACIONES].sort((a, b) => {
  if (a.ciudad !== b.ciudad) return a.ciudad.localeCompare(b.ciudad);
  if (a.barrio === null) return -1;
  if (b.barrio === null) return 1;
  return a.barrio.localeCompare(b.barrio);
});

export function PerfilForm({ perfil }: { perfil: MiPerfil }) {
  const router = useRouter();
  const c = copy.cuenta.perfil;

  const [globalError, setGlobalError] = useState<string | null>(null);
  const [tieneServicios, setTieneServicios] = useState(
    perfil.tieneServiciosPublicados,
  );
  const alertRef = useRef<HTMLDivElement>(null);

  const {
    handleSubmit,
    watch,
    setValue,
    clearErrors,
    formState: { errors, isSubmitting },
  } = useForm<PerfilFormValues>({
    resolver: zodResolver(perfilSchema),
    mode: "onBlur",
    defaultValues: perfilDefaultsFrom(perfil),
  });

  const oficios = watch("oficios");
  const localidad = watch("localidad");
  const disponibilidad = watch("disponibilidad");
  const visible = watch("visible");

  useEffect(() => {
    if (globalError) alertRef.current?.focus();
  }, [globalError]);

  function toggleOficio(label: string, checked: boolean) {
    const next = checked
      ? [...oficios, label]
      : oficios.filter((o) => o !== label);
    setValue("oficios", next, { shouldValidate: true });
    clearErrors("oficios");
  }

  async function onSubmit(values: PerfilFormValues) {
    setGlobalError(null);

    const result = await updateProfile(buildActualizarPerfilPayload(values));

    if (result.ok) {
      setTieneServicios(result.data.tieneServiciosPublicados);
      toast.success(c.exito);
      router.refresh();
      return;
    }

    switch (result.kind) {
      case "unauthorized":
        router.push(`${LOGIN_PATH}?next=${encodeURIComponent("/cuenta/perfil")}`);
        return;
      case "forbidden":
        setGlobalError(c.soloPrestadores);
        return;
      case "validation":
        setGlobalError(c.validacionGenerica);
        return;
      default:
        setGlobalError(c.errorGuardar);
    }
  }

  const busy = isSubmitting;

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      noValidate
      aria-busy={busy}
      className="flex flex-col gap-6"
    >
      {globalError && (
        <Alert ref={alertRef} variant="error" role="alert" tabIndex={-1}>
          {globalError}
        </Alert>
      )}

      {/* Not-searchable-until-published notice (PSM-REQ-10). */}
      {!tieneServicios && (
        <Alert variant="warning" role="note">
          <p>{c.sinServiciosAviso}</p>
          <Link
            href={SERVICIOS_PATH}
            className="mt-1 inline-block font-medium underline underline-offset-4"
          >
            {c.irAServicios}
          </Link>
        </Alert>
      )}

      {/* Oficios — multi-checkbox over the curated TRADES labels. */}
      <Field
        id="oficios"
        label={c.oficiosLabel}
        required
        help={c.oficiosHelp}
        error={errors.oficios?.message}
      >
        {({ describedBy, invalid }) => (
          <fieldset
            aria-describedby={describedBy}
            aria-invalid={invalid}
            className="grid grid-cols-2 gap-2 sm:grid-cols-3"
          >
            {TRADES.map((t) => {
              const checked = oficios.includes(t.label);
              return (
                <label
                  key={t.value}
                  className="flex items-center gap-2 rounded-md border border-border px-3 py-2 text-sm"
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    disabled={busy}
                    onChange={(e) => toggleOficio(t.label, e.target.checked)}
                    className="size-4"
                  />
                  {t.label}
                </label>
              );
            })}
          </fieldset>
        )}
      </Field>

      {/* Localidad — Select over the same labels registro submits. */}
      <Field
        id="localidad"
        label={c.localidadLabel}
        required
        help={c.localidadHelp}
        error={errors.localidad?.message}
      >
        {({ id, describedBy, invalid }) => (
          <Select
            value={localidad || undefined}
            onValueChange={(value) => {
              setValue("localidad", value, { shouldValidate: true });
              clearErrors("localidad");
            }}
            disabled={busy}
          >
            <SelectTrigger
              id={id}
              aria-required="true"
              aria-invalid={invalid}
              aria-describedby={describedBy}
            >
              <SelectValue placeholder={c.localidadPlaceholder} />
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

      {/* Disponibilidad — Select over the 3 enum estados (PSM-REQ-04). */}
      <Field
        id="disponibilidad"
        label={c.disponibilidadLabel}
        required
        help={c.disponibilidadHelp}
        error={errors.disponibilidad?.message}
      >
        {({ id, describedBy, invalid }) => (
          <Select
            value={disponibilidad || undefined}
            onValueChange={(value) => {
              setValue(
                "disponibilidad",
                value as PerfilFormValues["disponibilidad"],
                { shouldValidate: true },
              );
              clearErrors("disponibilidad");
            }}
            disabled={busy}
          >
            <SelectTrigger
              id={id}
              aria-required="true"
              aria-invalid={invalid}
              aria-describedby={describedBy}
            >
              <SelectValue placeholder={c.disponibilidadPlaceholder} />
            </SelectTrigger>
            <SelectContent>
              {DISPONIBILIDAD_ESTADOS.map((estado) => (
                <SelectItem key={estado} value={estado}>
                  {c.disponibilidadOpciones[estado]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </Field>

      {/* Visibility toggle (PSM-REQ-02). Rendered directly (not via Field) so
          the checkbox owns its single label — no duplicated caption. */}
      <div className="flex flex-col gap-1.5">
        <label
          htmlFor="visible"
          className="flex items-center gap-2 text-sm font-medium text-foreground"
        >
          <input
            id="visible"
            type="checkbox"
            checked={visible}
            disabled={busy}
            aria-describedby="visible-help"
            onChange={(e) => setValue("visible", e.target.checked)}
            className="size-4"
          />
          {c.visibleLabel}
        </label>
        <p id="visible-help" className="text-xs text-muted-foreground">
          {c.visibleHelp}
        </p>
      </div>

      <Button
        type="submit"
        size="lg"
        loading={busy}
        disabled={busy}
        className="w-full sm:w-auto"
      >
        {busy ? c.guardando : c.guardar}
      </Button>
    </form>
  );
}
