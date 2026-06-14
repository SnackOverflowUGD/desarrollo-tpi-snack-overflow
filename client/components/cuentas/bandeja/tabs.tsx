"use client";

/**
 * Simple accessible tabs for the bandeja (Pendientes / Activas / Terminadas).
 * Keyboard navigable: ArrowLeft/ArrowRight to switch, Home/End for first/last.
 */
import { useRef, KeyboardEvent } from "react";

import { copy } from "@/lib/copy/es-AR";

interface TabItem {
  id: "pendientes" | "activas" | "terminadas";
  label: string;
}

export function BandejaTabs({
  activeTab,
  onChange,
}: {
  activeTab: "pendientes" | "activas" | "terminadas";
  onChange: (tab: "pendientes" | "activas" | "terminadas") => void;
}) {
  const tabs: TabItem[] = [
    { id: "pendientes", label: copy.bandeja.tabs.pendientes },
    { id: "activas", label: copy.bandeja.tabs.activas },
    { id: "terminadas", label: copy.bandeja.tabs.terminadas },
  ];

  const buttonRefs = useRef<(HTMLButtonElement | null)[]>([]);

  // Focus management for keyboard navigation
  const focusTab = (index: number) => {
    buttonRefs.current[index]?.focus();
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLButtonElement>, index: number) => {
    switch (e.key) {
      case "ArrowRight":
        e.preventDefault();
        focusTab((index + 1) % tabs.length);
        break;
      case "ArrowLeft":
        e.preventDefault();
        focusTab((index - 1 + tabs.length) % tabs.length);
        break;
      case "Home":
        e.preventDefault();
        focusTab(0);
        break;
      case "End":
        e.preventDefault();
        focusTab(tabs.length - 1);
        break;
      default:
        break;
    }
  };

  return (
    <nav
      aria-label={copy.bandeja.title}
      className="flex gap-1 border-b border-border mb-4"
      role="tablist"
    >
      {tabs.map((tab, index) => {
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            ref={(el) => (buttonRefs.current[index] = el)}
            role="tab"
            aria-selected={isActive}
            aria-controls={`panel-${tab.id}`}
            id={`tab-${tab.id}`}
            tabIndex={isActive ? 0 : -1}
            onClick={() => onChange(tab.id)}
            onKeyDown={(e) => handleKeyDown(e, index)}
            className={`
              px-4 py-2 text-sm font-medium transition-colors
              rounded-t-md focus-visible:outline-none focus-visible:ring-2
              focus-visible:ring-ring focus-visible:ring-offset-2
              ${
                isActive
                  ? "bg-background text-foreground border-b-2 border-primary -mb-px"
                  : "text-muted-foreground hover:text-foreground"
              }
            `}
          >
            {tab.label}
          </button>
        );
      })}
    </nav>
  );
}