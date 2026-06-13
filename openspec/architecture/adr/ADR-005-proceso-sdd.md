# ADR-005 — Proceso: híbrido OpenUP + Scrum + SDD Spec-Anchored

- **Estado:** Aceptada (Fase de Inicio / Elaboración)
- **Formato:** Nygard
- **Relacionada con:** ADR-006

## Contexto

Selección de proceso con análisis cuantitativo ponderado: **OpenUP 4.70**, Scrum 4.15, XP 3.50. XP
descartado (sin interés en pair programming —1/5— ni experiencia en TDD estricto). El equipo
necesita un ciclo de vida con hitos arquitectónicos claros (riesgo técnico alto en pagos), cadencia
ágil ligera, y aprovechar asistencia de IA de forma gobernada.

## Decisión

Proceso **híbrido**:

- **OpenUP** como base: fases **Inicio → Elaboración → Construcción → Transición** con hitos
  **LCO → LCA → IOC → Product Release**. Disciplinas: Requerimientos (CDU como artefacto principal),
  Diseño, Implementación, V&V, Evolución. Roles rotativos por fase.
- **Scrum mínimo** (solo 3-4 elementos): sprint de 1 semana, Sprint Backlog, Sprint Planning
  simplificado, Definition of Done. Se descartan PO/SM formales, Daily, Refinement, Review/Retro.
- **SDD nivel Spec-Anchored**: la spec ejecutable (formato **OpenSpec**) es la fuente de verdad
  autoritativa, pero el desarrollador conserva autoridad en las compuertas HITL.

**Pipeline SDD** (una corrida por micro-incremento, disparada por un Caso de Uso):

```
1.1 Redactor      → Spec ejecutable válida (OpenSpec, Given-When-Then)
1.2 Diseño        → Diseño detallado válido (respeta ADRs, OCL en interfaces críticas)
1.3 Implementación→ Código fuente válido
1.4 Verificador   → Reporte de validación (tests derivados de criterios de aceptación)
→ Integración continua del micro-incremento
```

Entre cada par de sub-agentes hay una **compuerta Human-in-the-Loop**. El **Coordinador de IA** es
el único agente persistente; los cuatro sub-agentes son efímeros. Cada artefacto se registra en
**memoria persistente (Engram)** antes de ceder control.

**Almacenamiento de artefactos: híbrido** — archivo versionado en `openspec/` + observación en Engram.

## Consecuencias

- (+) Hitos arquitectónicos explícitos gobiernan el riesgo técnico antes de construir.
- (+) Trazabilidad CDU → spec → diseño → código → tests; spec viva versionada.
- (+) IA gobernada por compuertas humanas; memoria persistente sobrevive entre sesiones.
- (−) Overhead de proceso por micro-incremento; requiere disciplina en las compuertas.
- (−) Dependencia de la calidad del contexto inyectado (`openspec/project.md`).
