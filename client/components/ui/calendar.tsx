"use client";

/**
 * Calendar — lightweight month-grid date picker with no external dependencies
 * beyond radix-ui (used only for styling patterns). Renders a simple month grid
 * with prev/next month navigation, weekday headers, and clickable day cells.
 *
 * Design: local state tracks the displayed month/year. The parent controls the
 * selected value via `selected` (YYYY-MM-DD) and `onSelect`. Days outside the
 * current month are dimmed.
 */
import * as React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { cn } from "@/lib/utils";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const WEEKDAYS = ["Do", "Lu", "Ma", "Mi", "Ju", "Vi", "Sa"] as const;

/**
 * Return the number of days in a given month (0‑indexed month — 0 = January).
 */
function daysInMonth(year: number, month: number): number {
  // Day 0 of next month = last day of this month.
  return new Date(year, month + 1, 0).getDate();
}

/**
 * Return the day-of-week (0 = Sunday) for the first day of the month.
 */
function firstDayOfMonth(year: number, month: number): number {
  return new Date(year, month, 1).getDay();
}

/**
 * Format a Date as YYYY-MM-DD.
 */
function formatISO(year: number, month: number, day: number): string {
  const mm = String(month + 1).padStart(2, "0");
  const dd = String(day).padStart(2, "0");
  return `${year}-${mm}-${dd}`;
}

/**
 * Parse YYYY-MM-DD into its parts. Returns null for invalid input.
 */
function parseISO(iso: string): { y: number; m: number; d: number } | null {
  const m = iso.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!m) return null;
  const y = Number(m[1]);
  const mo = Number(m[2]) - 1;
  const d = Number(m[3]);
  if (mo < 0 || mo > 11 || d < 1) return null;
  return { y, m: mo, d };
}

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

export interface CalendarProps {
  /** Currently selected date in YYYY-MM-DD format. */
  selected?: string;
  /** Called with YYYY-MM-DD when the user picks a day. */
  onSelect: (isoDate: string) => void;
  /** Minimum selectable date in YYYY-MM-DD (default: none). */
  fromDate?: string;
  /** Maximum selectable date in YYYY-MM-DD (default: none). */
  toDate?: string;
  className?: string;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function Calendar({
  selected,
  onSelect,
  fromDate,
  toDate,
  className,
}: CalendarProps) {
  // Derive the initial displayed month from the selected date, or default to
  // today.
  const parsed = selected ? parseISO(selected) : null;
  const today = new Date();
  const [viewYear, setViewYear] = React.useState(
    parsed?.y ?? today.getFullYear(),
  );
  const [viewMonth, setViewMonth] = React.useState(
    parsed?.m ?? today.getMonth(),
  );

  const todayISO = formatISO(
    today.getFullYear(),
    today.getMonth(),
    today.getDate(),
  );

  // Available bounds as dates (minY, minM, minD etc).
  const from = fromDate ? parseISO(fromDate) : undefined;
  const to = toDate ? parseISO(toDate) : undefined;

  function isDisabled(year: number, month: number, day: number): boolean {
    const date = new Date(year, month, day);
    if (from) {
      const fromDateObj = new Date(from.y, from.m, from.d);
      if (date < fromDateObj) return true;
    }
    if (to) {
      const toDateObj = new Date(to.y, to.m, to.d);
      if (date > toDateObj) return true;
    }
    return false;
  }

  function prevMonth() {
    if (viewMonth === 0) {
      setViewYear((y) => y - 1);
      setViewMonth(11);
    } else {
      setViewMonth((m) => m - 1);
    }
  }

  function nextMonth() {
    if (viewMonth === 11) {
      setViewYear((y) => y + 1);
      setViewMonth(0);
    } else {
      setViewMonth((m) => m + 1);
    }
  }

  const days = daysInMonth(viewYear, viewMonth);
  const firstDay = firstDayOfMonth(viewYear, viewMonth);
  // Total cells = firstDay offset + days, padded to a full week row.
  const totalCells = Math.ceil((firstDay + days) / 7) * 7;

  // Month name for the header.
  const monthName = new Date(viewYear, viewMonth).toLocaleDateString("es-AR", {
    month: "long",
    year: "numeric",
  });

  return (
    <div className={cn("w-full", className)}>
      {/* Header: month/year label + nav buttons */}
      <div className="flex items-center justify-between px-1 pb-2">
        <button
          type="button"
          onClick={prevMonth}
          aria-label="Mes anterior"
          className="inline-flex size-7 items-center justify-center rounded-md text-foreground hover:bg-surface-sunken"
        >
          <ChevronLeft className="size-4" />
        </button>
        <span className="text-sm font-medium capitalize text-foreground">
          {monthName}
        </span>
        <button
          type="button"
          onClick={nextMonth}
          aria-label="Mes siguiente"
          className="inline-flex size-7 items-center justify-center rounded-md text-foreground hover:bg-surface-sunken"
        >
          <ChevronRight className="size-4" />
        </button>
      </div>

      {/* Weekday header */}
      <div className="mb-1 grid grid-cols-7">
        {WEEKDAYS.map((d) => (
          <div
            key={d}
            className="flex h-8 items-center justify-center text-xs font-medium text-muted-foreground"
          >
            {d}
          </div>
        ))}
      </div>

      {/* Day grid */}
      <div className="grid grid-cols-7">
        {Array.from({ length: totalCells }, (_, i) => {
          const day = i - firstDay + 1;
          const isOutside = day < 1 || day > days;

          if (isOutside) {
            return <div key={i} className="h-8 w-full" aria-hidden="true" />;
          }

          const iso = formatISO(viewYear, viewMonth, day);
          const isSelected = iso === selected;
          const isToday = iso === todayISO;
          const disabled = isDisabled(viewYear, viewMonth, day);

          return (
            <button
              key={iso}
              type="button"
              disabled={disabled}
              aria-label={`${day}/${viewMonth + 1}/${viewYear}`}
              aria-selected={isSelected}
              onClick={() => onSelect(iso)}
              className={cn(
                "flex h-8 w-full items-center justify-center rounded-md text-sm transition-colors",
                isSelected &&
                  "bg-primary text-on-primary font-medium hover:bg-primary-hover",
                !isSelected &&
                  !disabled &&
                  "text-foreground hover:bg-surface-sunken",
                !isSelected && isToday && "font-semibold text-primary",
                disabled &&
                  "cursor-not-allowed text-muted-foreground opacity-40",
              )}
            >
              {day}
            </button>
          );
        })}
      </div>
    </div>
  );
}
