"use client";

import { useMemo } from "react";

import { cn } from "@/lib/utils";
import { copy } from "@/lib/copy/es-AR";
import {
  passwordStrength,
  type StrengthLevel,
} from "@/lib/validation/password-strength";

/**
 * Password strength meter (REQ-05). Informative, non-blocking. The bar width is
 * a genuinely dynamic value — the one inline-style exception allowed by §10.2.
 * Color uses tokens (never hex); level is also stated in text so it is not
 * color-only (WCAG 1.4.1).
 */
const LEVEL_COLOR: Record<StrengthLevel, string> = {
  weak: "bg-error",
  medium: "bg-warning",
  strong: "bg-success",
};

const LEVEL_LABEL: Record<StrengthLevel, string> = {
  weak: copy.passwordStrength.weak,
  medium: copy.passwordStrength.medium,
  strong: copy.passwordStrength.strong,
};

const LEVEL_TEXT: Record<StrengthLevel, string> = {
  weak: "text-error",
  medium: "text-warning-deep dark:text-warning",
  strong: "text-success-deep dark:text-success",
};

export function PasswordStrengthMeter({ value }: { value: string }) {
  const { score, level } = useMemo(() => passwordStrength(value), [value]);

  if (value.length === 0) return null;

  const widthPct = (score / 4) * 100;

  return (
    <div className="flex flex-col gap-1" aria-live="polite">
      <div
        className="h-1.5 w-full overflow-hidden rounded-full bg-surface-sunken"
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={4}
        aria-valuenow={score}
        aria-label={copy.passwordStrength.label}
      >
        <div
          className={cn("h-full rounded-full transition-all", LEVEL_COLOR[level])}
          style={{ width: `${widthPct}%` }}
        />
      </div>
      <span className={cn("text-xs font-medium", LEVEL_TEXT[level])}>
        {copy.passwordStrength.label}: {LEVEL_LABEL[level]}
      </span>
    </div>
  );
}
