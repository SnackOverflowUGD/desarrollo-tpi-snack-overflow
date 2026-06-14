import type { Metadata } from "next";
import { Search } from "lucide-react";

import { copy } from "@/lib/copy/es-AR";
import {
  type CriteriosBusqueda,
  DEFAULT_ORDEN,
  DEFAULT_PAGE_SIZE,
} from "@/lib/catalogo/tipos";
import { criteriosFromSearchParams } from "@/lib/catalogo/query-params";
import { buscarPrestadores } from "@/lib/api/catalogo";

import { BarraBusqueda } from "@/components/catalogo/barra-busqueda";
import { FiltrosPanel } from "@/components/catalogo/filtros-panel";
import { ResultadosLista } from "@/components/catalogo/resultados-lista";
import { EstadoVacio } from "@/components/catalogo/estado-vacio";
import { EstadoError } from "@/components/catalogo/estado-error";

export const metadata: Metadata = {
  title: `${copy.catalogo.title} · ${copy.app.title}`,
  description: copy.app.description,
};

// Search results are dynamic per query and depend on searchParams.
export const dynamic = "force-dynamic";

/**
 * Public provider listing (Server Component, ADR-04-01/03/04, REQ-01/02/05/06/10,
 * ESC-UI-01/02/03/04/07). The URL is the source of truth: `await searchParams`
 * → criteriosFromSearchParams → (guard) fetch server-side. Renders the bar +
 * filters (hydrated from the URL) and the matching state.
 */
export default async function PrestadoresPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const parsed = criteriosFromSearchParams(sp);

  // Guard (ADR-04-03): without BOTH oficio and ubicacion we do NOT fetch.
  const hasCriterios = Boolean(parsed.oficio && parsed.ubicacion);

  // Materialize defaults for the components that hydrate from the URL.
  const criterios: CriteriosBusqueda = {
    oficio: parsed.oficio ?? "",
    ubicacion: parsed.ubicacion ?? "",
    orden: parsed.orden ?? DEFAULT_ORDEN,
    calificacionMin: parsed.calificacionMin,
    page: parsed.page ?? 1,
    pageSize: parsed.pageSize ?? DEFAULT_PAGE_SIZE,
  };

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-8 px-4 py-8">
      <header className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold text-foreground">
          {copy.catalogo.title}
        </h1>
        <p className="text-sm text-muted-foreground">
          {copy.catalogo.subtitle}
        </p>
      </header>

      <div className="rounded-lg border border-border bg-surface p-4 sm:p-6">
        <BarraBusqueda
          defaults={{ oficio: criterios.oficio, ubicacion: criterios.ubicacion }}
          filtros={criterios}
          mostrarSugerencias={!hasCriterios}
        />
      </div>

      {hasCriterios ? (
        <div className="flex flex-col gap-6 lg:grid lg:grid-cols-[16rem_1fr] lg:gap-8">
          <div className="lg:sticky lg:top-4 lg:self-start">
            <FiltrosPanel criterios={criterios} />
          </div>
          <Resultados criterios={criterios} />
        </div>
      ) : (
        <EstadoInicial />
      )}
    </div>
  );
}

/**
 * Initial neutral state before any search (deep-link / first visit). Solid
 * surface card (DESIGN-SYSTEM §5.3/§6) — NOT a dashed placeholder, which read
 * as an unfinished build artifact. The actionable popular-oficio chips live in
 * the search panel above (BarraBusqueda mostrarSugerencias); this card carries
 * the guiding copy and gives the pre-search view enough presence.
 */
function EstadoInicial() {
  return (
    <div className="flex flex-col items-center gap-3 rounded-lg border border-border bg-surface px-6 py-16 text-center">
      <Search className="size-10 text-muted-foreground" aria-hidden="true" />
      <p className="text-base font-semibold text-foreground">
        {copy.catalogo.inicial.titulo}
      </p>
      <p className="max-w-md text-sm text-muted-foreground">
        {copy.catalogo.inicial.cuerpo}
      </p>
    </div>
  );
}

/** Fetches server-side and maps the discriminated result to a state (ADR-04-04). */
async function Resultados({ criterios }: { criterios: CriteriosBusqueda }) {
  const res = await buscarPrestadores(criterios);

  if (!res.ok) {
    // 'network' | 'server' | 'bad_request' → neutral retryable error.
    return <EstadoError />;
  }

  if (res.data.total === 0) {
    return (
      <EstadoVacio oficio={criterios.oficio} ubicacion={criterios.ubicacion} />
    );
  }

  return <ResultadosLista criterios={criterios} resultado={res.data} />;
}
