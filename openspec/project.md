# Contexto de Proyecto — Snack Overflow

> Este documento es la **fuente de verdad de contexto** que se inyecta a los sub-agentes del
> pipeline SDD (Redactor, Diseño, Implementación, Verificador). Mantener compacto y actualizado.
> Las decisiones arquitectónicas vinculantes viven en `architecture/adr/`.

## Propósito

Plataforma SaaS de economía colaborativa basada en oficios — marketplace de dos lados que conecta
**clientes** con **prestadores** de servicios técnicos a domicilio en Misiones. Ver visión
completa en `../docs/TPI_MA_2026_Snack_Overflow.md`.

## Stack técnico (vinculante)

| Capa | Tecnología | Ubicación |
|------|-----------|-----------|
| Frontend | Next.js 16 + React 19 + TypeScript | `client/` |
| Backend | NestJS 11 + Node.js + TypeScript (API REST) | `server/` |
| Base de datos | PostgreSQL 15 (ACID) | `docker-compose.yml` |
| Caché | Redis 7 | `docker-compose.yml` |
| Pagos | Mercado Pago (tras Adapter) | — |
| Auth | OAuth2 / JWT + Argon2/bcrypt | — |
| Tests | Jest (unit), Supertest (API), Playwright (E2E) | `server/test/`, `client/` |

**Principio rector:** TypeScript end-to-end. Un solo lenguaje en todas las capas para reducir la
carga cognitiva del equipo rotativo y simplificar el contexto inyectado a los sub-agentes SDD.

## Arquitectura (ADR-001 / 002 / 003)

Monolito **modular** en capas (único desplegable) + capa de integración **Broker** (Puertos y
Adaptadores) + persistencia transaccional única en PostgreSQL con Redis como caché.

- Backend organizado por **módulos de dominio** alineados a los grupos funcionales:
  `cuentas`, `catalogo`, `contratacion`, `pagos`, `reputacion`, `habilitaciones`.
- Toda integración externa (pagos, geolocalización, mensajería, organismos) se accede **solo** a
  través de un **puerto** (interfaz) con un **adaptador** concreto. Nunca invocar SDKs de
  proveedores directamente desde la lógica de negocio.
- Acceso a datos vía **Repository** sobre ORM. Operaciones de pago son ACID, transaccionales.

## Patrones de diseño obligatorios

| Patrón | Aplicación |
|--------|-----------|
| **State** | Máquina de estados de `Contratacion` (Solicitada → Confirmada → EnCurso → Finalizada / Cancelada). Sin condicionales sobre el estado. |
| **Observer** | Notificación a cliente y prestador ante cada cambio de estado de Contratación. |
| **Adapter + Factory** | Integraciones externas intercambiables (Mercado Pago, mensajería). Realiza el Broker de ADR-002. |
| **Strategy** | Algoritmos de ranking de búsqueda (cercanía / reputación / precio) y políticas de cancelación. |
| **Facade** | Frontera presentación ↔ aplicación (API REST del backend). |

## Convenciones de código

- **Idioma del código:** identificadores y comentarios en **inglés**; el dominio (entidades,
  estados) puede conservar términos del negocio si aclaran (`Contratacion`, `Prestador`).
- Lint/format: ESLint + Prettier (configs ya presentes en `client/` y `server/`).
- Tests junto al código (`*.spec.ts`); E2E en su carpeta dedicada.
- **No invocar SDKs externos fuera de un adaptador.**

## Reglas del pipeline SDD

1. Nivel **Spec-Anchored**: la spec es la fuente de verdad autoritativa, pero el desarrollador
   humano conserva autoridad en cada compuerta HITL.
2. Formato de spec: **OpenSpec** (propósito / requisitos / escenarios). Criterios de aceptación en
   **Given-When-Then**. Las pre/postcondiciones OCL del diseño se traducen en aserciones de tests.
3. Cada sub-agente registra su artefacto en **memoria persistente (Engram)** antes de ceder
   control. Almacenamiento **híbrido**: archivo versionado en `openspec/` + observación en Engram.
4. **Definition of Done:** cobertura de tests (objetivo ≥90% en módulos del núcleo) + revisión de
   código + spec actualizada.
5. No se adopta TDD estricto (ADR-006); sí pirámide de pruebas automatizada.

## Topic keys de Engram (memoria persistente)

- `sdd-init/snack-overflow` — contexto base, stack, proceso (este documento).
- `sdd/{nombre-cambio}/{fase}` — artefactos por micro-incremento (proposal, spec, design, tasks, verify).
- ADRs persistidos individualmente (ver `architecture/adr/`).
