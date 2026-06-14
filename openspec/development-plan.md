# Plan de Desarrollo — Snack Overflow

> Plan de construcción guiado por la **Work Item List (WIL)** del TPI y el proceso híbrido
> OpenUP + Scrum + SDD (ADR-005). Cada Work Item se construye atravesando el **Pipeline SDD**.

## Estrategia: Risk-Value Lifecycle

Backlog único priorizado por **riesgo y valor**. Se atacan primero los módulos de mayor riesgo
técnico que **validan la arquitectura** (Pagos y la máquina de estados de Contratación — ejercitan
el Adapter de ADR-002 y la persistencia ACID de ADR-003), en paralelo con alto valor temprano
(Autenticación y Búsqueda).

## Work Item List

Prioridad: `1` = más alta. **Estado:** 🟢 = backend integrado a `main` · ⏳ = pendiente.
Nota: los WI de Iteración 1 tienen el **backend integrado**; las **UIs (frontend) quedan pendientes**
(el `client/` es todavía el scaffold de Next.js).

### G1 — Acceso y gestión de cuentas (RF-1)

| # | Work Item | Prioridad | Iteración | Estado |
|---|-----------|-----------|-----------|--------|
| 1.1 | UC01: Registrarse | 1 | 1 | 🟢 Backend en `main` · UI ⏳ |
| 1.2 | UC02: Autenticarse | 1 | 1 | 🟢 Backend en `main` · UI ⏳ |
| 1.3 | UC03: Gestionar perfil | 2 | 2 | ⏳ Pendiente |
| 1.4 | UC17: Gestionar perfiles (suspensión/baja) | 3 | 2 | ⏳ Pendiente |

### G2 — Catálogo, publicación y agenda (RF-2, RF-4)

| # | Work Item | Prioridad | Iteración | Estado |
|---|-----------|-----------|-----------|--------|
| 2.1 | UC04: Buscar prestadores | 1 | 1 | 🟢 Backend en `main` · UI ⏳ |
| 2.2 | UC05: Publicar servicios | 1 | 2 | ⏳ Pendiente |
| 2.3 | UC06: Gestionar agenda y disponibilidad | 2 | 2 | ⏳ Pendiente |

### G3 — Contratación, ciclo de estados y mensajería (RF-5, RF-6)

| # | Work Item | Prioridad | Iteración | Estado |
|---|-----------|-----------|-----------|--------|
| 3.1 | UC07: Solicitar contratación | 1 | 1 | 🟢 Backend en `main` · UI ⏳ |
| 3.2 | UC08: Enviar propuesta o rechazar solicitud | 1 | 1 | 🟢 Backend en `main` · UI ⏳ |
| 3.3 | UC09: Gestionar estados de la contratación | 1 | 1 | 🟢 Backend en `main` · UI ⏳ |
| 3.4 | UC10: Cancelar contratación | 2 | 3 | ⏳ Pendiente |
| 3.5 | UC11: Intercambiar mensajes | 3 | 3 | ⏳ Pendiente |
| 3.6 | UC19: Notificar cambio de estado | 2 | 3 | ⏳ Pendiente |
| 3.7 | UC20: Iniciar servicio | 1 | 3 | ⏳ Pendiente |
| 3.8 | UC21: Responder propuesta de prestador | 2 | 3 | ⏳ Pendiente |

### G4 — Pagos y liberación (RF-7)

| # | Work Item | Prioridad | Iteración | Estado |
|---|-----------|-----------|-----------|--------|
| 4.1 | UC12: Pagar servicio | 1 | 2 | ⏳ Pendiente |
| 4.2 | UC13: Confirmar finalización y liberar pago | 2 | 2 | ⏳ Pendiente |

### G5 — Reputación y moderación (RF-3)

| # | Work Item | Prioridad | Iteración | Estado |
|---|-----------|-----------|-----------|--------|
| 5.1 | UC14: Calificar prestador | 2 | 3 | ⏳ Pendiente |
| 5.2 | UC15: Responder reseña | 2 | 3 | ⏳ Pendiente |
| 5.3 | UC16: Moderar reseñas | 2 | 3 | ⏳ Pendiente |

### G6 — Verificación de habilitaciones (RF-8)

| # | Work Item | Prioridad | Iteración | Estado |
|---|-----------|-----------|-----------|--------|
| 6.1 | UC18: Verificar habilitaciones profesionales | 3 | 3 | ⏳ Pendiente |

## Mapa de iteraciones (sprints de 1 semana)

- **Iteración 1 — Núcleo transaccional + acceso:** 1.1, 1.2, 2.1, 3.1, 3.2, 3.3.
  Valida arquitectura (máquina de estados base) y habilita el flujo mínimo cliente↔prestador.
  **Estado: backend integrado a `main` (PRs #1–#4 + UC01/UC02 previos). UIs pendientes.**
- **Iteración 2 — Publicación, agenda y pagos:** 1.3, 1.4, 2.2, 2.3, 4.1, 4.2.
  Ejercita Adapter de pagos (ADR-002) y persistencia ACID (ADR-003).
- **Iteración 3 — Estados avanzados, reputación y habilitaciones:** 3.4–3.8, 5.1–5.3, 6.1.
  Completa Observer/notificaciones, moderación y verificación regulatoria.

## Sprint N°1 (12/06/2026 – 16/06/2026)

**Objetivo:** primera iteración funcional de UC01, UC02, UC04, UC07, UC08 y UC09.

**Estado del Sprint:** el **backend** de los 6 work items está integrado a `main` por PRs
(`#1` UC07, `#2` UC08, `#3` UC09, `#4` UC04; UC01/UC02 integrados antes). Cada merge pasó la
compuerta CI (lint, build, unit + cobertura, e2e con Postgres+Redis). **Las UIs (frontend) del
sprint quedan pendientes** — el `client/` sigue siendo el scaffold de Next.js.

### Sprint Backlog (micro-incrementos, MI)

**Orden de ejecución:** modelos de datos → endpoints → UIs (cada pipeline hereda el contexto que integra).
**Estado:** ✅ en `main` · 🟡 parcial (backend sí / UI no) · ⏳ pendiente.

| # | Nombre | Capa | Encargado | Depende de | Estado |
|---|--------|------|-----------|------------|--------|
| **MI-01.1** | Modelo y persistencia de usuario | Backend | Romero | — | ✅ |
| **MI-01.2** | Endpoint de registro (`POST /auth/register`) | Backend | Romero | MI-01.1 | ✅ |
| **MI-01.3** | UI formulario de registro | Frontend | Romero | MI-01.2 | ✅ |
| **MI-01.4** | Integración del WI al producto de sprint | Integración | Romero | 01.1–01.3 | 🟡 |
| **MI-02.1** | Lógica de autenticación y JWT | Backend | Hillebrand | MI-01.1 | ✅ |
| **MI-02.2** | UI login y manejo de sesión | Frontend | Hillebrand | MI-02.1 | ✅ |
| **MI-02.3** | Integración del WI al producto de sprint | Integración | Hillebrand | 02.1–02.2 | 🟡 |
| **MI-04.1** | Modelo y repositorio de prestador | Backend | Nieto | — | ✅ |
| **MI-04.2** | Endpoint de búsqueda y filtros | Backend | Nieto | MI-04.1 | ✅ |
| **MI-04.3** | UI listado y perfil de prestador | Frontend | Nieto | MI-02.2, MI-04.2 | ✅ |
| **MI-04.4** | Integración del WI al producto de sprint | Integración | Nieto | 04.1–04.3 | 🟡 |
| **MI-07.1** | Modelo y lógica de solicitud | Backend | Pirovani | MI-01.1, MI-04.1 | ✅ |
| **MI-07.2** | Endpoint crear solicitud + UI | Full-stack | Pirovani | MI-02.2, 07.1, 09.1 | ✅ |
| **MI-07.3** | Integración del WI al producto de sprint | Integración | Pirovani | 07.1–07.2 | 🟡 |
| **MI-08.1** | Lógica de propuesta y rechazo | Backend | Pirovani | MI-07.1, MI-09.1 | ✅ |
| **MI-08.2** | Endpoints + UI de respuesta del prestador | Full-stack | Pirovani | 08.1, 09.2, 07.2 | ✅ |
| **MI-08.3** | Integración del WI al producto de sprint | Integración | Pirovani | 08.1–08.2 | 🟡 |
| **MI-09.1** | Máquina de estados de contratación | Backend | Pirovani | — | ✅ |
| **MI-09.2** | Endpoints de transición de estado | Backend | Pirovani | MI-09.1, MI-07.1 | ✅ |
| **MI-09.3** | UI gestión y seguimiento | Frontend | Pirovani | 09.2, 08.2, 02.2 | ✅ |
| **MI-09.4** | Integración del WI al producto de sprint | Integración | Pirovani | 09.1–09.3 | 🟡 |
| **MI-10** | Integración del sprint al producto continuo | Integración | Todos | UC01,02,04,07,08,09 | ✅ |
| **MI-11** | Verificación de la integración | Testing | Lezcano, Dos Santos | MI-10 | ✅ |

> **MI-10/MI-11:** integración continua a `main` completa (CI: unit + build + e2e reales por PR).
> Verificación de **sistema/E2E (Playwright)** cerrada: `client/e2e/sistema.spec.ts` corre el flujo
> integrado end-to-end (registro→login→búsqueda→perfil→solicitar→presupuestar→confirmar→iniciar→
> finalizar) contra el stack vivo + seed real (`server/scripts/seed-e2e.sh`), 7/7 verde. Detectó y
> cerró un bug de integración bloqueante (BFF auth en transiciones, ver `uc09`/commit fix). Pendiente
> menor: matriz cross-browser (WebKit/Mobile Safari requieren `sudo playwright install-deps`).

## Roles por fase (asignación inicial)

| Rol | Inicio | Elaboración | Construcción |
|-----|--------|-------------|--------------|
| Admin. de Proyecto | A. Pirovani | A. Pirovani | A. Pirovani |
| Arquitecto | Todos | G. Hillebrand, T. Nieto | G. Hillebrand |
| Analista | Todos | L. Lezcano, M. Romero, M. Dos Santos | A. Pirovani |
| Desarrollador | — | — | M. Romero, G. Hillebrand, T. Nieto |
| Tester | — | — | L. Lezcano, M. Dos Santos |

## Cómo se construye cada Work Item (Pipeline SDD)

Por cada Work Item (un Caso de Uso), el Coordinador de IA dispara el pipeline una vez:

1. **Redactor** → spec ejecutable OpenSpec (`openspec/changes/{uc}/` y `openspec/specs/`).
2. **HITL gate** → el desarrollador aprueba o devuelve observaciones.
3. **Diseño** → diseño detallado (respeta ADRs, OCL en interfaces críticas).
4. **HITL gate**.
5. **Implementación** → código en `client/` y/o `server/`.
6. **HITL gate**.
7. **Verificador** → tests derivados de los criterios Given-When-Then + reporte.
8. **HITL gate** → **CI** integra el micro-incremento.

**Definition of Done:** cobertura de tests (≥90% núcleo) + revisión de código + spec actualizada
+ artefactos registrados en Engram (`sdd/{uc}/{fase}`).

## Próximo paso

Sprint 1 **completo e integrado** a `main`: backend (UC01/02/04/07/08/09) + todas las UIs
(MI-01.3/02.2/04.3/07.2/08.2/09.3) + verificación de sistema (MI-11). Cola de trabajo:

1. ✅ **UIs de Sprint 1**: MI-01.3, MI-02.2, MI-04.3, MI-07.2, MI-08.2, MI-09.3 — todas mergeadas.
2. ✅ **Verificación de sistema** (MI-11): `client/e2e/sistema.spec.ts` flujo integrado 7/7 verde.
3. **Follow-ups menores (no bloqueantes):** matriz cross-browser E2E (`sudo playwright install-deps`);
   timeline de historial de estados (endpoint `GET /contrataciones/:id` con `state_change_history`);
   enriquecer `ContratacionListItemDto` con `prestadorNombre` (hoy la card del cliente muestra el UUID).
4. **Iteración 2:** UC03, UC17, UC05, UC06, UC12, UC13 (vía Pipeline SDD).
