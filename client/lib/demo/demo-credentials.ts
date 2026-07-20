/**
 * Demo credentials shown by the login helper (PoC only — NEVER ship to prod).
 * Mirrors the accounts created by `server/scripts/seed-demo.sh`. All accounts
 * share the same password. Keep this list in sync with that seed script.
 */
export const DEMO_PASSWORD = "demo1234";

export type DemoRole = "cliente" | "prestador";

export type DemoAccount = {
  role: DemoRole;
  /** Short human label shown in the helper (e.g. "Electricista", "Cliente"). */
  label: string;
  email: string;
};

export const DEMO_ACCOUNTS: DemoAccount[] = [
  { role: "cliente", label: "Cliente (Camila)", email: "demo.cliente@demo.snackoverflow.test" },
  { role: "cliente", label: "Cliente (Ana)", email: "demo.cliente.ana@demo.snackoverflow.test" },
  { role: "cliente", label: "Cliente (Pablo)", email: "demo.cliente.pablo@demo.snackoverflow.test" },
  { role: "prestador", label: "Electricista (Ramiro)", email: "prestador.electricista@demo.snackoverflow.test" },
  { role: "prestador", label: "Plomero (Diego)", email: "prestador.plomero@demo.snackoverflow.test" },
  { role: "prestador", label: "Carpintero (Martín)", email: "prestador.carpintero@demo.snackoverflow.test" },
  { role: "prestador", label: "Gasista (Lucía)", email: "prestador.gasista@demo.snackoverflow.test" },
  { role: "prestador", label: "Pintor (Andrés)", email: "prestador.pintor@demo.snackoverflow.test" },
  { role: "prestador", label: "Cerrajero (Sofía)", email: "prestador.cerrajero@demo.snackoverflow.test" },
];
