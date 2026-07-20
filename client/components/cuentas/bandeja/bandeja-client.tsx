"use client";

/**
 * Client wrapper for BandejaSolicitudes — manages active tab state.
 * Receives all items from server and filters client-side.
 */
import { useState } from "react";
import { BandejaSolicitudes } from "@/components/cuentas/bandeja/bandeja-solicitudes";
import type { ContratacionListItem } from "@/lib/api/contrataciones";

type Tab = "pendientes" | "activas" | "terminadas";

interface BandejaClientProps {
  items: ContratacionListItem[];
}

export function BandejaClient({ items }: BandejaClientProps) {
  const [activeTab, setActiveTab] = useState<Tab>("pendientes");

  return (
    <BandejaSolicitudes
      items={items}
      activeTab={activeTab}
      onTabChange={setActiveTab}
    />
  );
}