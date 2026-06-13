# ADR-001 — Estilo arquitectónico: Monolito modular en capas

- **Estado:** Aceptada (Fase de Elaboración)
- **Formato:** Nygard
- **Relacionada con:** ADR-002, ADR-003

## Contexto

La solución debe sostener uptime ≥99.5% mensual (RNF-S.5), pagos ACID (RNF-S), búsquedas ≤2 s p95
(RNF-E.1) y ser operada por un equipo pequeño y rotativo de 6 personas. Se evaluaron tres
alternativas con **ATAM** sobre escenarios de calidad E1–E5 (ISO/IEC 25010):

- **A — Monolito en capas (plano):** simple, pero invoca proveedores externos directamente →
  débil sustituibilidad (RNF-M.4) y aislamiento de fallos. Resultado ATAM: 4 favorables / 1 aceptable / 1 desfavorable.
- **B — Monolito modular + Broker:** desplegable único en capas + capa de integración con
  puertos/adaptadores. Resultado ATAM: **5 favorables / 1 aceptable / 0 desfavorables**.
- **C — Microservicios orientados a eventos:** escalado independiente, pero sacrifica ACID de
  pagos (consistencia eventual), uptime y costo operativo. Resultado ATAM: 3 / 1 / 2.

## Decisión

Adoptar **Alternativa B: monolito modular estructurado en capas** (Capas + Cliente-Servidor),
como **único desplegable**. La capa de aplicación se organiza en módulos de dominio cohesivos
(`cuentas`, `catalogo`, `contratacion`, `pagos`, `reputacion`, `habilitaciones`).

El punto de compromiso de **granularidad de despliegue** se resuelve a favor del monolito: uptime
y simplicidad operativa pesan más que el escalado independiente, que es diferible.

## Consecuencias

- (+) Operación simple y alto uptime (RNF-S.5); pagos ACID en un esquema único.
- (+) Menor costo operativo, adecuado a un equipo pequeño.
- (−) Escalado horizontal acoplado al desplegable (mitigable con réplicas tras balanceador).
- (−) Riesgo de erosión de la modularidad → se impone disciplina de módulos + Broker (ADR-002).
