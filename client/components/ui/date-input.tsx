"use client";

/**
 * DateInput — controlled date input with dual interaction:
 *   1. Text input: type dd/mm/aaaa directly (converts on blur)
 *   2. Calendar button: opens a popover calendar for visual date picking
 *
 * The controlled value is always YYYY-MM-DD (ISO 8601), matching the backend
 * and zod schemas. The user sees and types in dd/mm/aaaa.
 */
import { useRef, useState } from "react";
import { CalendarIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
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
  /** Minimum allowed date in YYYY-MM-DD format. */
  min?: string;
  /** Maximum allowed date in YYYY-MM-DD format. */
  max?: string;
  "aria-required"?: React.AriaAttributes["aria-required"];
  "aria-invalid"?: React.AriaAttributes["aria-invalid"];
  "aria-describedby"?: string;
}

/**
 * A text input + calendar popover that shows dd/mm/aaaa to the user but keeps
 * YYYY-MM-DD in the form state. Partial text input is allowed while typing;
 * conversion happens on blur. The calendar button opens a month-grid popover
 * for visual month-by-month selection.
 */
export function DateInput({
  id,
  name,
  value,
  onChange,
  onBlur,
  disabled,
  className,
  min,
  max,
  ...ariaProps
}: DateInputProps) {
  // `draft` holds the raw text while the user is actively typing.
  // `null` means "not editing" → derive display from the `value` prop.
  const [draft, setDraft] = useState<string | null>(null);
  // Calendar popover open state.
  const [open, setOpen] = useState(false);
  const isEditing = useRef(false);
  const inputRef = useRef<HTMLInputElement>(null);

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

  function handleCalendarSelect(isoDate: string) {
    onChange(isoDate);
    setDraft(null);
    setOpen(false);
    // Refocus the text input so the user can continue keyboard entry.
    inputRef.current?.focus();
  }

  return (
    <div className={cn("relative flex items-center gap-0", className)}>
      <input
        type="text"
        inputMode="numeric"
        id={id}
        name={name}
        ref={inputRef}
        value={displayed}
        onChange={handleChange}
        onFocus={handleFocus}
        onBlur={handleBlur}
        disabled={disabled}
        placeholder="dd/mm/aaaa"
        autoComplete="off"
        data-slot="input"
        className={cn(
          "flex h-11 w-full rounded-md border border-border-strong bg-surface px-3 py-2 pr-10 text-foreground transition-colors md:h-10",
          "placeholder:text-muted-foreground",
          "focus-visible:border-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
          "disabled:cursor-not-allowed disabled:bg-surface-sunken disabled:text-muted-foreground",
          "aria-[invalid=true]:border-error aria-[invalid=true]:focus-visible:outline-error",
        )}
        {...ariaProps}
      />

      {/* Calendar toggle button — overlaid inside the input area */}
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            disabled={disabled}
            aria-label="Seleccionar fecha"
            className="absolute right-1 top-1/2 -translate-y-1/2 size-9 text-muted-foreground hover:text-foreground"
          >
            <CalendarIcon className="size-4" />
          </Button>
        </PopoverTrigger>
        <PopoverContent align="end" className="w-auto p-3">
          <Calendar
            selected={value}
            onSelect={handleCalendarSelect}
            fromDate={min}
            toDate={max}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}
