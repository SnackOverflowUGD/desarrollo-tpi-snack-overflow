# Plan de Desarrollo — Snack Overflow

> Plan de construcción guiado por la **Work Item List (WIL)** del TPI y el proceso híbrido
> OpenUP + Scrum + SDD (ADR-005). Cada Work Item se construye atravesando el **Pipeline SDD**.

## Estrategia: Risk-Value Lifecycle

Backlog único priorizado por **riesgo y valor**. Se atacan primero los módulos de mayor riesgo
técnico que **validan la arquitectura** (Pagos y la máquina de estados de Contratación — ejercitan
el Adapter de ADR-002 y la persistencia ACID de ADR-003), en paralelo con alto valor temprano
(Autenticación y Búsqueda).

## Work Item List

Prioridad: `1` = más alta. Estado inicial: todos **Pendiente**.

### G1 — Acceso y gestión de cuentas (RF-1)

| # | Work Item | Prioridad | Iteración |
|---|-----------|-----------|-----------|
| 1.1 | UC01: Registrarse | 1 | 1 |
| 1.2 | UC02: Autenticarse | 1 | 1 |
| 1.3 | UC03: Gestionar perfil | 2 | 2 |
| 1.4 | UC17: Gestionar perfiles (suspensión/baja) | 3 | 2 |

### G2 — Catálogo, publicación y agenda (RF-2, RF-4)

| # | Work Item | Prioridad | Iteración |
|---|-----------|-----------|-----------|
| 2.1 | UC04: Buscar prestadores | 1 | 1 |
| 2.2 | UC05: Publicar servicios | 1 | 2 |
| 2.3 | UC06: Gestionar agenda y disponibilidad | 2 | 2 |

### G3 — Contratación, ciclo de estados y mensajería (RF-5, RF-6)

| # | Work Item | Prioridad | Iteración |
|---|-----------|-----------|-----------|
| 3.1 | UC07: Solicitar contratación | 1 | 1 |
| 3.2 | UC08: Enviar propuesta o rechazar solicitud | 1 | 1 |
| 3.3 | UC09: Gestionar estados de la contratación | 1 | 1 |
| 3.4 | UC10: Cancelar contratación | 2 | 3 |
| 3.5 | UC11: Intercambiar mensajes | 3 | 3 |
| 3.6 | UC19: Notificar cambio de estado | 2 | 3 |
| 3.7 | UC20: Iniciar servicio | 1 | 3 |
| 3.8 | UC21: Responder propuesta de prestador | 2 | 3 |

### G4 — Pagos y liberación (RF-7)

| # | Work Item | Prioridad | Iteración |
|---|-----------|-----------|-----------|
| 4.1 | UC12: Pagar servicio | 1 | 2 |
| 4.2 | UC13: Confirmar finalización y liberar pago | 2 | 2 |

### G5 — Reputación y moderación (RF-3)

| # | Work Item | Prioridad | Iteración |
|---|-----------|-----------|-----------|
| 5.1 | UC14: Calificar prestador | 2 | 3 |
| 5.2 | UC15: Responder reseña | 2 | 3 |
| 5.3 | UC16: Moderar reseñas | 2 | 3 |

### G6 — Verificación de habilitaciones (RF-8)

| # | Work Item | Prioridad | Iteración |
|---|-----------|-----------|-----------|
| 6.1 | UC18: Verificar habilitaciones profesionales | 3 | 3 |

## Mapa de iteraciones (sprints de 1 semana)

- **Iteración 1 — Núcleo transaccional + acceso:** 1.1, 1.2, 2.1, 3.1, 3.2, 3.3.
  Valida arquitectura (máquina de estados base) y habilita el flujo mínimo cliente↔prestador.
- **Iteración 2 — Publicación, agenda y pagos:** 1.3, 1.4, 2.2, 2.3, 4.1, 4.2.
  Ejercita Adapter de pagos (ADR-002) y persistencia ACID (ADR-003).
- **Iteración 3 — Estados avanzados, reputación y habilitaciones:** 3.4–3.8, 5.1–5.3, 6.1.
  Completa Observer/notificaciones, moderación y verificación regulatoria.

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

No hay desarrollo iniciado. El primer Work Item a especificar es de **Iteración 1**
(sugerido: **UC02 Autenticarse** como base de seguridad, o **UC07/UC09** para validar temprano la
máquina de estados). Iniciar con el sub-agente Redactor del Pipeline SDD.
