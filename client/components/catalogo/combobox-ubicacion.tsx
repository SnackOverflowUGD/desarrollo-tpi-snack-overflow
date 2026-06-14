"use client";

import * as React from "react";
import { Popover as PopoverPrimitive } from "radix-ui";
import { Check, ChevronDown } from "lucide-react";

import { cn } from "@/lib/utils";
import { copy } from "@/lib/copy/es-AR";
import {
  filtrarUbicaciones,
  type Ubicacion,
} from "@/lib/catalogo/ubicaciones";

/**
 * Location combobox (UC04, REQ-01) — built from the Radix Popover that ships in
 * `radix-ui` (NO `cmdk`/`Command` in this repo, NO new deps). It re-themes the
 * exact tokens of the Oficio Select (border-strong, ring, surface-raised, etc.)
 * so the two search fields look identical.
 *
 * The user types → the static tree is filtered by `filtrarUbicaciones` (pure,
 * accent-insensitive) → arrow keys move a roving highlight (aria-activedescendant)
 * → Enter/click selects ONE entry. We surface only the short `label`, but the
 * value passed up is the full Nominatim-geocodable `value`
 * ("<Barrio>, <Ciudad>, Misiones, Argentina"), so the backend geocoding stays
 * unambiguous with NO backend change.
 *
 * Controlled like the Oficio Select (the trigger isn't a native input, so RHF
 * can't `register` it): the parent owns the value and gets it via `onChange`.
 * `triggerRef` is forwarded so a popular-oficio chip click can move focus here.
 */
interface ComboboxUbicacionProps {
  /** Current geocodable value held by RHF (the full string), or "". */
  value: string;
  /** Called with the selected geocodable `value` when the user picks an entry. */
  onChange: (value: string) => void;
  /** Field id (from <Field>) wired onto the trigger for the label's htmlFor. */
  id: string;
  /** aria-describedby (error/help id) from <Field>. */
  describedBy?: string;
  /** Whether the field is in an error state (from <Field>). */
  invalid?: boolean;
  disabled?: boolean;
  /** Forwarded so the chip-click flow can focus the trigger. */
  triggerRef?: React.Ref<HTMLButtonElement>;
}

const LISTBOX_ID = "ubicacion-listbox";

export function ComboboxUbicacion({
  value,
  onChange,
  id,
  describedBy,
  invalid = false,
  disabled = false,
  triggerRef,
}: ComboboxUbicacionProps) {
  const [open, setOpen] = React.useState(false);
  const [query, setQuery] = React.useState("");
  const [highlight, setHighlight] = React.useState(0);
  const inputRef = React.useRef<HTMLInputElement | null>(null);

  const resultados = React.useMemo(() => filtrarUbicaciones(query), [query]);

  // The label to show on the closed trigger: resolve the current value back to
  // its short label; fall back to the raw value (defensive, e.g. legacy URLs).
  const seleccionada = React.useMemo(
    () => resultados.find((u) => u.value === value),
    [resultados, value],
  );
  const triggerLabel = React.useMemo(() => {
    if (!value) return "";
    return filtrarUbicaciones("").find((u) => u.value === value)?.label ?? value;
  }, [value]);

  // Clamp the highlight into range at render time — the result set shrinks as
  // the user types. Deriving this (instead of a setState-in-effect) avoids the
  // cascading-render lint rule and is simpler.
  const highlightActivo =
    resultados.length === 0 ? 0 : Math.min(highlight, resultados.length - 1);

  function seleccionar(u: Ubicacion) {
    onChange(u.value);
    setOpen(false);
    setQuery("");
  }

  function onOpenChange(next: boolean) {
    setOpen(next);
    if (next) {
      // Reset the filter each open and focus the search input.
      setQuery("");
      setHighlight(0);
      // Defer until the popover content is mounted.
      requestAnimationFrame(() => inputRef.current?.focus());
    }
  }

  function onInputKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlight((h) => (resultados.length === 0 ? 0 : (h + 1) % resultados.length));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlight((h) =>
        resultados.length === 0 ? 0 : (h - 1 + resultados.length) % resultados.length,
      );
    } else if (e.key === "Enter") {
      e.preventDefault();
      const u = resultados[highlightActivo];
      if (u) seleccionar(u);
    } else if (e.key === "Escape") {
      // Let Radix close, but stop it from bubbling to a parent (e.g. dialog).
      setOpen(false);
    }
  }

  const activeId =
    open && resultados[highlightActivo]
      ? `ubicacion-opt-${resultados[highlightActivo].id}`
      : undefined;

  return (
    <PopoverPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <PopoverPrimitive.Trigger asChild>
        <button
          type="button"
          id={id}
          ref={triggerRef}
          role="combobox"
          aria-haspopup="listbox"
          aria-expanded={open}
          aria-controls={LISTBOX_ID}
          aria-required="true"
          aria-invalid={invalid}
          aria-describedby={describedBy}
          aria-label={copy.catalogo.ubicacionCombobox.aria}
          disabled={disabled}
          className={cn(
            "flex h-11 w-full items-center justify-between gap-2 rounded-md border border-border-strong bg-surface px-3 py-2 text-left text-foreground transition-colors md:h-10",
            "focus-visible:border-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
            "disabled:cursor-not-allowed disabled:bg-surface-sunken disabled:text-muted-foreground",
            "aria-[invalid=true]:border-error aria-[invalid=true]:focus-visible:outline-error",
          )}
        >
          <span className={cn("line-clamp-1", !triggerLabel && "text-muted-foreground")}>
            {triggerLabel || copy.catalogo.ubicacionPlaceholder}
          </span>
          <ChevronDown className="size-4 shrink-0 opacity-70" aria-hidden="true" />
        </button>
      </PopoverPrimitive.Trigger>

      <PopoverPrimitive.Portal>
        <PopoverPrimitive.Content
          align="start"
          sideOffset={4}
          className={cn(
            "z-50 w-[var(--radix-popover-trigger-width)] overflow-hidden rounded-md border border-border bg-surface-raised text-foreground shadow-md",
          )}
          // Keep focus on our input instead of Radix auto-focusing the content.
          onOpenAutoFocus={(e) => e.preventDefault()}
        >
          <div className="border-b border-border p-1">
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setHighlight(0);
              }}
              onKeyDown={onInputKeyDown}
              role="combobox"
              aria-expanded="true"
              aria-controls={LISTBOX_ID}
              aria-activedescendant={activeId}
              aria-autocomplete="list"
              autoComplete="off"
              placeholder={copy.catalogo.ubicacionCombobox.buscarPlaceholder}
              className={cn(
                "flex h-11 w-full rounded-sm bg-transparent px-2 py-2 text-foreground outline-none md:h-10",
                "placeholder:text-muted-foreground",
              )}
            />
          </div>

          <ul
            id={LISTBOX_ID}
            role="listbox"
            aria-label={copy.catalogo.ubicacionCombobox.aria}
            className="max-h-72 overflow-y-auto p-1"
          >
            {resultados.length === 0 ? (
              <li
                role="presentation"
                className="px-3 py-2 text-sm text-muted-foreground"
              >
                {copy.catalogo.ubicacionCombobox.sinResultados}
              </li>
            ) : (
              resultados.map((u, i) => {
                const selected = u.value === value || u === seleccionada;
                const active = i === highlightActivo;
                return (
                  <li
                    key={u.id}
                    id={`ubicacion-opt-${u.id}`}
                    role="option"
                    aria-selected={selected}
                    // Pointer down (not click) so we select before the input blurs.
                    onMouseDown={(e) => {
                      e.preventDefault();
                      seleccionar(u);
                    }}
                    onMouseEnter={() => setHighlight(i)}
                    className={cn(
                      "relative flex min-h-11 cursor-pointer items-center rounded-sm py-2 pr-8 pl-3 text-sm select-none md:min-h-9",
                      active && "bg-primary-subtle text-foreground",
                    )}
                  >
                    <span className="line-clamp-1">{u.label}</span>
                    {selected && (
                      <span className="absolute right-3 flex items-center">
                        <Check className="size-4 text-primary" aria-hidden="true" />
                      </span>
                    )}
                  </li>
                );
              })
            )}
          </ul>
        </PopoverPrimitive.Content>
      </PopoverPrimitive.Portal>
    </PopoverPrimitive.Root>
  );
}
