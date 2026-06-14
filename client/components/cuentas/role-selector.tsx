"use client";

import { User, Wrench } from "lucide-react";

import { cn } from "@/lib/utils";
import { copy } from "@/lib/copy/es-AR";
import type { Role } from "@/lib/api/auth";

/**
 * Segmented, mandatory role selector (REQ-01). Implemented as an ARIA
 * radiogroup so it is keyboard-navigable with arrow keys (§8). Each option
 * carries an icon + label + description (not color-only). The component is
 * controlled by the form.
 */
const OPTIONS: {
  value: Role;
  label: string;
  description: string;
  Icon: typeof User;
}[] = [
  {
    value: "cliente",
    label: copy.registro.roleCliente,
    description: copy.registro.roleClienteDesc,
    Icon: User,
  },
  {
    value: "prestador",
    label: copy.registro.rolePrestador,
    description: copy.registro.rolePrestadorDesc,
    Icon: Wrench,
  },
];

interface RoleSelectorProps {
  value: Role | "";
  onChange: (value: Role) => void;
  describedBy?: string;
  invalid?: boolean;
}

export function RoleSelector({
  value,
  onChange,
  describedBy,
  invalid,
}: RoleSelectorProps) {
  function handleKeyDown(event: React.KeyboardEvent<HTMLDivElement>) {
    if (
      event.key === "ArrowRight" ||
      event.key === "ArrowDown" ||
      event.key === "ArrowLeft" ||
      event.key === "ArrowUp"
    ) {
      event.preventDefault();
      const currentIndex = OPTIONS.findIndex((o) => o.value === value);
      const forward = event.key === "ArrowRight" || event.key === "ArrowDown";
      const nextIndex =
        currentIndex < 0
          ? 0
          : (currentIndex + (forward ? 1 : OPTIONS.length - 1)) %
            OPTIONS.length;
      onChange(OPTIONS[nextIndex].value);
    }
  }

  return (
    <div
      role="radiogroup"
      aria-label={copy.registro.roleLegend}
      aria-describedby={describedBy}
      aria-invalid={invalid || undefined}
      onKeyDown={handleKeyDown}
      className="grid grid-cols-2 gap-3"
    >
      {OPTIONS.map(({ value: optValue, label, description, Icon }) => {
        const selected = value === optValue;
        return (
          <button
            key={optValue}
            type="button"
            role="radio"
            aria-checked={selected}
            // Roving tabindex: selected option is tabbable; if none selected,
            // the first option is tabbable so the group is reachable.
            tabIndex={selected || (value === "" && optValue === "cliente") ? 0 : -1}
            onClick={() => onChange(optValue)}
            className={cn(
              "flex min-h-[44px] flex-col items-start gap-1 rounded-md border p-3 text-left transition-colors",
              "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
              selected
                ? "border-primary bg-primary-subtle"
                : "border-border-strong bg-surface hover:bg-surface-sunken",
            )}
          >
            <span className="flex items-center gap-2 font-medium text-foreground">
              <Icon className="size-4 text-primary" aria-hidden="true" />
              {label}
            </span>
            <span className="text-xs text-muted-foreground">{description}</span>
          </button>
        );
      })}
    </div>
  );
}
