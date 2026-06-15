"use client";

/**
 * DateInput — controlled text input that displays dates in dd/mm/yyyy format
 * while storing/emitting values as YYYY-MM-DD (ISO 8601).
 *
 * Designed to work with react-hook-form's Controller pattern so the RHF field
 * value is always YYYY-MM-DD (matching backend and zod schemas), while the user
 * sees and types in the locale-friendly dd/mm/aaaa format.
 */
import { useRef, useState } from "react";

import { cn } from "@/lib/utils";

// ---------------------------------------------------------------------------
// Pure conversion helpers (exported for unit testing)
// ---------------------------------------------------------------------------

/**
 * Converts an ISO date string ("YYYY-MM-DD") to display format ("dd/mm/yyyy").
 * Returns an empty string for any falsy or unrecognised input.
 */
export function toDisplay(isoDate: string): string {
  if (!isoDate) return "";
  const match = isoDate.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!match) return "";
  const [, year, month, day] = match;
  return `${day}/${month}/${year}`;
}

/**
 * Converts a display date string ("dd/mm/yyyy") to ISO format ("YYYY-MM-DD").
 * Returns an empty string for any falsy or unrecognised input.
 */
export function toISO(display: string): string {
  if (!display) return "";
  const match = display.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (!match) return "";
  const [, day, month, year] = match;
  return `${year}-${month}-${day}`;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export interface DateInputProps {
  id?: string;
  name?: string;
  /** Controlled value in YYYY-MM-DD format (from RHF). */
  value: string;
  /** Called with YYYY-MM-DD whenever the user completes a valid date. */
  onChange: (isoDate: string) => void;
  onBlur?: () => void;
  disabled?: boolean;
  className?: string;
  /** Minimum allowed date in YYYY-MM-DD format (not enforced in UI, only schema). */
  min?: string;
  "aria-required"?: string | boolean;
  "aria-invalid"?: string | boolean;
  "aria-describedby"?: string;
}

/**
 * A text input that shows dd/mm/aaaa to the user but keeps YYYY-MM-DD in the
 * form state. Partial input is allowed while typing; conversion happens on blur.
 *
 * Design: while the user is focused/editing we use a local `draft` state.
 * When not editing, the displayed value is derived from the ISO `value` prop.
 * This avoids the setState-in-effect anti-pattern.
 */
export function DateInput({
  id,
  name,
  value,
  onChange,
  onBlur,
  disabled,
  className,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  min,
  ...ariaProps
}: DateInputProps) {
  // `draft` holds the raw text while the user is actively typing.
  // `null` means "not editing" → derive display from the `value` prop.
  const [draft, setDraft] = useState<string | null>(null);
  const isEditing = useRef(false);

  // The value shown in the input:
  //   • while editing: whatever the user typed (draft)
  //   • otherwise: the formatted ISO value from RHF
  const displayed = draft !== null ? draft : toDisplay(value);

  function handleFocus() {
    isEditing.current = true;
    // Seed the draft with the current display so the user can edit in-place.
    setDraft(toDisplay(value));
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const raw = e.target.value;
    setDraft(raw);

    // If the user typed a complete dd/mm/yyyy, emit immediately.
    const iso = toISO(raw);
    if (iso) {
      onChange(iso);
    } else if (raw === "") {
      onChange("");
    }
    // Otherwise keep the RHF value as-is until blur.
  }

  function handleBlur() {
    isEditing.current = false;
    const current = draft ?? "";
    setDraft(null); // exit editing mode → display derives from prop again

    const iso = toISO(current);
    if (iso) {
      onChange(iso);
    } else if (current === "") {
      onChange("");
    } else {
      // Invalid partial input: emit empty so the schema marks the field invalid.
      onChange("");
    }
    onBlur?.();
  }

  return (
    <input
      type="text"
      inputMode="numeric"
      id={id}
      name={name}
      value={displayed}
      onChange={handleChange}
      onFocus={handleFocus}
      onBlur={handleBlur}
      disabled={disabled}
      placeholder="dd/mm/aaaa"
      autoComplete="off"
      data-slot="input"
      className={cn(
        "flex h-11 w-full rounded-md border border-border-strong bg-surface px-3 py-2 text-foreground transition-colors md:h-10",
        "placeholder:text-muted-foreground",
        "focus-visible:border-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
        "disabled:cursor-not-allowed disabled:bg-surface-sunken disabled:text-muted-foreground",
        "aria-[invalid=true]:border-error aria-[invalid=true]:focus-visible:outline-error",
        className,
      )}
      {...ariaProps}
    />
  );
}
