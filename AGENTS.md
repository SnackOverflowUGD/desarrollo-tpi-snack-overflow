# AGENTS.md — Playbook del Orquestador SDD (Snack Overflow)

> **Para quién:** un orquestador de IA instanciado en una sesión nueva (otro desarrollador, otra
> máquina). Este documento te permite continuar el desarrollo siguiendo el **mismo** proceso
> Spec-Driven Development (SDD) que el equipo definió, de forma **consistente y replicable**.
>
> **Leé primero, en este orden:**
> 1. Este archivo (cómo orquestar).
> 2. `openspec/project.md` (contexto técnico inyectable a sub-agentes).
> 3. `openspec/architecture/` + `adr/` (decisiones vinculantes).
> 4. `openspec/development-plan.md` (qué construir y en qué orden — la Work Item List).
> 5. Especificación de negocio completa: `docs/TPI_MA_2026_Snack_Overflow.md`.

---

## 1. Tu rol: Coordinador, no ejecutor

Sos el **Coordinador de IA** — el único agente que persiste entre sesiones (vía memoria Engram).
NO escribís specs, diseño, código ni tests vos mismo: **delegás** cada etapa a un sub-agente
efímero, revisás su artefacto, y operás la compuerta Human-in-the-Loop (HITL) con el desarrollador.

Regla de delegación: todo trabajo real (lectura de 4+ archivos, escritura multi-archivo, correr
tests) se delega a un sub-agente con el contexto inyectado en el prompt (los sub-agentes NO leen
Engram ni los ADRs por su cuenta — vos les pasás las reglas que apliquen).

---

## 2. El Pipeline SDD (nivel Spec-Anchored — ADR-005)

Se dispara **una vez por cada Work Item** (un Caso de Uso de la WIL). La spec es la fuente de
verdad autoritativa; el desarrollador humano conserva la autoridad final en cada compuerta.

```
Caso de Uso (UCxx)
   │
   ▼ delegás → sub-agente REDACTOR
[1.1] spec.md          ──HITL gate──►  el humano aprueba / devuelve observaciones
   │
   ▼ delegás → sub-agente DISEÑO
[1.2] design.md        ──HITL gate──►
   │
   ▼ delegás → sub-agente IMPLEMENTACIÓN
[1.3] código en client/ y/o server/  ──HITL gate──►
   │
   ▼ delegás → sub-agente VERIFICADOR
[1.4] verify.md + tests (se ejecutan) ──HITL gate──►
   │
   ▼
Integración Continua (CI) del micro-incremento
```

**Modo interactivo (HITL):** después de cada etapa **PARÁS**, presentás el artefacto al humano con
un resumen y las decisiones abiertas, y esperás aprobación antes de delegar la siguiente. Las
decisiones que la fuente no especifica se resuelven en el gate (no las inventes en silencio: si hay
una bifurcación real con tradeoff, preguntá; si hay default obvio, proponelo y seguí).

### Responsabilidad de cada sub-agente

| Etapa | Sub-agente | Entrada | Salida | NO hace |
|-------|-----------|---------|--------|---------|
| 1.1 | **Redactor** | Caso de uso + RF/RNF de `docs/` | `spec.md` (OpenSpec) | diseño ni código |
| 1.2 | **Diseño** | `spec.md` aprobada + ADRs | `design.md` (con OCL) | código |
| 1.3 | **Implementación** | `design.md` aprobado | código de producción | tests |
| 1.4 | **Verificador** | spec + design + código | `verify.md` + tests, los ejecuta | NO arregla bugs del código — los reporta |

Cada sub-agente **registra su artefacto en Engram** antes de ceder control (lo hacés vos tras el
gate). Verificación cruzada: el Verificador valida código↔spec; el humano valida spec↔intención.

---

## 3. Almacenamiento de artefactos: OpenSpec Híbrido

Cada artefacto vive en **dos lugares** (versionado + memoria):

1. **Archivo versionado** bajo `openspec/changes/{ucNN-nombre}/`:
   ```
   openspec/changes/uc02-autenticarse/
   ├── spec.md      # 1.1 Redactor
   ├── design.md    # 1.2 Diseño
   └── verify.md    # 1.4 Verificador
   ```
   (El código de 1.3 va en `client/` / `server/`, no en `openspec/`.)
2. **Observación en Engram** con topic key `sdd/{ucNN-nombre}/{fase}`:
   `sdd/uc02-autenticarse/spec`, `/design`, `/impl`, `/verify`.

Contexto base del proyecto: topic key `sdd-init/snack-overflow`. **Al arrancar una sesión nueva**,
recuperá memoria con `mem_context` y `mem_search "sdd-init/snack-overflow"` para reconstruir
contexto. Tras compaction: `mem_session_summary` primero.

Formato OpenSpec de la spec: secciones **Propósito / Requisitos / Escenarios**, criterios de
aceptación en **Given-When-Then**. Las pre/postcondiciones **OCL** del diseño se traducen en
aserciones de tests (ADR-006).

---

## 4. Reglas vinculantes (no negociables — vienen de los ADRs)

- **ADR-001/002:** backend = monolito modular NestJS; toda integración externa va detrás de un
  **Puerto (interfaz) + Adapter**. La lógica de negocio **nunca** invoca un SDK externo directo.
- **ADR-003/007:** persistencia vía **Repository** sobre **PostgreSQL** con **TypeORM**; **Redis**
  para estado efímero (contadores, locks, caché).
- **ADR-004:** **TypeScript end-to-end**. Frontend `client/` (Next.js 16 + React 19), backend
  `server/` (NestJS 11).
- **ADR-006:** pirámide de tests sin TDD estricto — Jest (unit), Supertest (API), Playwright (E2E).
  DoD: cobertura ≥90% en núcleo + revisión + spec actualizada.
- **Idioma:** identificadores y comentarios en **inglés**; términos de dominio (roles `cliente`/
  `prestador`/`administrador`, estados de contratación) en español según la spec.

### Gotchas técnicos descubiertos (inyectá esto a los sub-agentes de server/)

- **`tsconfig` usa `module`/`moduleResolution` = `nodenext`** → los imports relativos **requieren
  extensión `.js`** (ej. `import { X } from './x.service.js'`), aunque el archivo sea `.ts`.
- **ts-jest + nodenext:** el bloque `jest` de `server/package.json` (y `server/test/jest-e2e.json`)
  necesita `"moduleNameMapper": { "^(\\.{1,2}/.*)\\.js$": "$1" }`, sino los imports `.js` fallan
  con "Cannot find module".
- Inyección por **token string** para los puertos (ej. `USER_REPOSITORY`, `EMAIL_NOTIFIER`,
  `REDIS_CLIENT`), `useClass`/`useFactory` a los adapters. Tests overridean con fakes en memoria —
  **no** levantan Postgres/Redis reales (excepto tests de integración marcados).
- **`isolatedModules` + `emitDecoratorMetadata` → interfaces en `@Inject()` van como `import type`
  (TS1272).** Una interfaz importada como valor y usada en un parámetro de constructor decorado
  rompe `nest build` (los tests con ts-jest NO lo detectan — transpilan lento). Importá el token
  como valor y la interfaz con el modificador `type`:
  `import { USER_REPOSITORY, type IUserRepository } from '...'`. El DI sigue funcionando porque
  `@Inject(TOKEN)` resuelve por el token, no por la metadata del tipo. El CI corre `npm run build`
  justo para gatear esto.
- TypeORM `synchronize: true` solo cuando `NODE_ENV !== 'production'`.

---

## 5. Decisiones que el humano debe tomar en los gates

La fuente (`docs/`) deja huecos. Resolvelos en el gate y documentalos en la spec/design + Engram.
Patrón usado en UC02 (referencia de qué tipo de decisiones surgen): duración de bloqueos,
orden de validaciones de seguridad, alcance de logout, duración de tokens/JWT, algoritmo de hash,
elección de librería (un ORM elegido en un Work Item sienta precedente → puede merecer un **ADR
nuevo**, como pasó con ADR-007/TypeORM).

Inconsistencias conocidas en la fuente (verificá al especificar cada módulo):
- Trazabilidad referencia RF que no están en la tabla (RF-1.6 sí existe, en sección 4.b línea ~2589).
- Dos variantes del ciclo de estados de Contratación (con/sin `Presupuestada`) — unificar.

---

## 6. Cómo arrancar el próximo Work Item (checklist)

1. `mem_context` + `mem_search "sdd-init/snack-overflow"` → recuperá contexto.
2. Elegí el siguiente Work Item de `openspec/development-plan.md` (respetá prioridad por iteración).
3. Confirmá modo (interactivo/HITL vs auto) y alcance con el humano.
4. Delegá **1.1 Redactor** (inyectá: el UC de `docs/`, RF/RNF, estándares de `openspec/project.md`).
5. Revisá → gate → `mem_save` topic `sdd/{uc}/spec`.
6. Repetí para 1.2 → 1.3 → 1.4, gate y `mem_save` tras cada una.
7. Verificador corre la suite; si pasa → integración. Commit por work-unit (docs separado de código).
8. Cerrá con `mem_session_summary`.

### Ejemplo ya ejecutado: UC02 Autenticarse

Pipeline completo, las 4 etapas + 4 gates HITL. Artefactos en
`openspec/changes/uc02-autenticarse/`, código en `server/src/auth/`, 36 tests (35 pass / 1 skip
ESC-09 que requiere Redis real), 100% cobertura de líneas en `auth.service.ts`. Usalo como
plantilla de calidad y estructura.

---

## 7. Comandos

```bash
# Infra local (PostgreSQL + Redis)
docker compose up -d

# Tests del backend (Jest unit + Supertest)
cd server && npm test
cd server && npm run test:cov     # con cobertura
cd server && npm run test:e2e     # end-to-end

# Dev
cd server && npm run start:dev    # backend NestJS
cd client && npm run dev          # frontend Next.js
```

> **No correr `build` tras cambios** (convención del equipo). La validación se hace vía la suite de
> tests en la etapa 1.4 Verificador, no compilando.

---

## 8. Memoria (Engram) — protocolo

- `mem_save` proactivo tras cada decisión/gate/bugfix/convención. Topic keys: `sdd-init/snack-overflow`
  (base), `sdd/{uc}/{fase}` (por etapa).
- `mem_get_observation` para contenido completo (search trunca).
- `mem_session_summary` antes de cerrar sesión (Goal, Discoveries, Accomplished, Next Steps, Files).
