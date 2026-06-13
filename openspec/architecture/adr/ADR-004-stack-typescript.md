# ADR-004 — Stack: TypeScript end-to-end (Next.js + NestJS)

- **Estado:** Aceptada (Fase de Elaboración)
- **Formato:** Nygard
- **Relacionada con:** ADR-001, ADR-002

## Contexto

El equipo es pequeño (6) y los roles **rotan por fase**, por lo que cualquier integrante puede
tener que tocar cualquier capa. Además, el pipeline SDD inyecta contexto a sub-agentes de IA: a
menor heterogeneidad de lenguajes/frameworks, menor contexto y menos errores. La arquitectura B ya
fija una SPA de presentación y un backend modular.

## Decisión

Usar **TypeScript como único lenguaje en todas las capas**:

- **Frontend:** Next.js + React + TypeScript (`client/`).
- **Backend:** NestJS + Node.js + TypeScript, API REST (`server/`).
- Tipos y contratos compartibles entre capas.

## Consecuencias

- (+) Menor carga cognitiva para el equipo rotativo; contexto SDD más simple.
- (+) NestJS provee modularidad e inyección de dependencias alineadas a ADR-001/002.
- (+) Ecosistema único de tooling (ESLint, Prettier, Jest).
- (−) Dependencia del ecosistema Node/TS; sin diversidad de runtimes para cargas especializadas
  (aceptable dado el alcance).
- (−) Next.js 16 / React 19 son versiones recientes con cambios disruptivos → consultar docs de la
  versión antes de codear (ver `client/AGENTS.md`).
