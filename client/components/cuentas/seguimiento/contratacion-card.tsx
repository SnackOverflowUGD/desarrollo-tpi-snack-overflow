"use client";

/**
 * Seguimiento item card (REQ-06/14/15). Shows the counterparty (prestador for a
 * cliente, cliente for a prestador), ubicación, fecha/franja, precio when
 * `presupuestada`+, the reused <EstadoBadge/> (6 states, REQ-15), a
 * "próximo paso" text by (rol, estado) and the contextual <AccionesContratacion/>.
 * The `contratacionId` comes from the item (REQ-13) — never typed by the user.
 */
import { copy } from "@/lib/copy/es-AR";
import type {
  ContratacionEstado,
  ContratacionListItem,
} from "@/lib/api/contrataciones";
import type { RolSeguimiento } from "@/lib/api/acciones-contratacion";
import { EstadoBadge } from "@/components/cuentas/bandeja/estado-badge";
import { AccionesContratacion } from "@/components/cuentas/acciones/acciones-contratacion";
import { LineaTiempoEstados } from "@/components/cuentas/seguimiento/linea-tiempo-estados";

function DatoLinea({ label, valor }: { label: string; valor: string }) {
  return (
    <p className="text-sm text-foreground">
      <span className="font-medium text-muted-foreground">{label}: </span>
      {valor}
    </p>
  );
}

/** "Próximo paso" text by (rol, estado), es-AR catalog (REQ-06). */
function proximoPaso(
  rol: RolSeguimiento,
  estado: ContratacionEstado,
): string | null {
  const p = copy.seguimiento.proximoPaso;
  if (estado === "finalizada") return p.finalizada;
  if (estado === "cancelada") return p.cancelada;

  if (rol === "cliente") {
    if (estado === "presupuestada") return p.clientePresupuestada;
    if (estado === "confirmada") return p.clienteConfirmada;
    return null;
  }
  // prestador
  if (estado === "confirmada") return p.prestadorConfirmada;
  if (estado === "en_curso") return p.prestadorEnCurso;
  return null;
}

const PRECIO_VISIBLE: ContratacionEstado[] = [
  "presupuestada",
  "confirmada",
  "en_curso",
  "finalizada",
];

export function ContratacionCard({
  item,
  rol,
}: {
  item: ContratacionListItem;
  rol: RolSeguimiento;
}) {
  // The counterparty label depends on the viewer's role.
  const contraparteLabel =
    rol === "cliente"
      ? copy.seguimiento.contraparteClienteLabel
      : copy.seguimiento.contraparteCliente;
  const contraparteValor =
    rol === "cliente" ? item.prestadorNombre : item.clienteNombre;

  const paso = proximoPaso(rol, item.estado);
  const mostrarPrecio =
    PRECIO_VISIBLE.includes(item.estado) &&
    item.precioEstimado != null;

  return (
    <li className="flex flex-col gap-4 rounded-lg border border-border bg-surface p-4 shadow-sm">
      <header className="flex flex-wrap items-start justify-between gap-2">
        <div className="flex flex-col gap-1">
          <h2 className="text-base font-semibold text-foreground">
            {contraparteLabel}
          </h2>
          <DatoLinea label={copy.seguimiento.ubicacionLabel} valor={item.ubicacion} />
        </div>
        <EstadoBadge estado={item.estado} />
      </header>

      <div className="flex flex-col gap-1">
        <DatoLinea label={contraparteLabel} valor={contraparteValor} />
        <DatoLinea label={copy.seguimiento.fechaLabel} valor={item.fecha} />
        <DatoLinea label={copy.seguimiento.franjaLabel} valor={item.franja} />
        {mostrarPrecio && (
          <>
            <DatoLinea
              label={copy.seguimiento.precioLabel}
              valor={`$${item.precioEstimado}`}
            />
            {item.fechaPropuesta && (
              <DatoLinea
                label={copy.seguimiento.fechaPropuestaLabel}
                valor={item.fechaPropuesta}
              />
            )}
            {item.franjaPropuesta && (
              <DatoLinea
                label={copy.seguimiento.franjaPropuestaLabel}
                valor={item.franjaPropuesta}
              />
            )}
            {item.justificacionPrecio && (
              <div className="mt-2 rounded-md bg-surface-sunken px-3 py-2 text-sm">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  {copy.seguimiento.justificacionLabel}
                </p>
                <p className="mt-1 text-foreground">
                  {item.justificacionPrecio}
                </p>
              </div>
            )}
          </>
        )}
      </div>

      {paso && (
        <p className="rounded-md bg-surface-sunken px-3 py-2 text-sm text-muted-foreground">
          {paso}
        </p>
      )}

      <AccionesContratacion
        contratacionId={item.id}
        rol={rol}
        estado={item.estado}
        nextPath="/cuenta/contrataciones"
      />

      <LineaTiempoEstados contratacionId={item.id} />
    </li>
  );
}
