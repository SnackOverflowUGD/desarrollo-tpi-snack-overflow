# Snack Overflow — Plataforma de Servicios de Oficios

Repositorio de código de la solución desarrollada por el equipo **Snack Overflow** para el
Trabajo Práctico Integrador (TPI) de Metodologías Ágiles / Procesos de Desarrollo (2026).

> **Especificación completa del proyecto:** [`docs/TPI_MA_2026_Snack_Overflow.md`](docs/TPI_MA_2026_Snack_Overflow.md)
> y diagramas (PlantUML / Mermaid) en [`docs/`](docs/).

---

## 1. Qué es

Plataforma **SaaS** web de **economía colaborativa basada en oficios** que centraliza la
contratación de servicios técnicos calificados a domicilio en la provincia de **Misiones**
(Posadas, Garupá, Oberá). Reemplaza la operatoria informal actual (Facebook Marketplace, grupos
de WhatsApp, recomendaciones verbales) por un marketplace de dos lados que conecta **clientes**
con **prestadores** de servicios (electricistas, gasistas, plomeros, jardineros, etc.).

### Actores

| Actor | Rol |
|-------|-----|
| **Cliente** | Busca y contrata servicios. |
| **Prestador** | Ofrece competencias, gestiona agenda y construye reputación. |
| **Administrador** | Verifica identidades, modera contenido, gestión operativa. |
| **Sistemas externos** | Pasarela de pagos (Mercado Pago), organismos reguladores. |

### Alcance funcional (módulos)

1. **Acceso y gestión de cuentas** (RF-1) — registro, autenticación, perfiles, suspensión/baja.
2. **Catálogo, publicación y agenda** (RF-2, RF-4) — búsqueda geolocalizada, publicación, disponibilidad.
3. **Contratación, ciclo de estados y mensajería** (RF-5, RF-6) — solicitud, propuestas, máquina de estados, chat.
4. **Pagos y liberación** (RF-7) — pasarela, retención hasta confirmación, comprobantes.
5. **Reputación y moderación** (RF-3) — calificaciones, reseñas, moderación.
6. **Verificación de habilitaciones profesionales** (RF-8) — validación de matrículas y documentación.

---

## 2. Arquitectura

**Alternativa seleccionada (vía ATAM): B — Monolito modular + Broker** (Puertos y Adaptadores).
Único desplegable en capas, con una capa de integración donde cada proveedor externo queda
detrás de un adaptador. Elegida por superar las alternativas A (monolito plano) y C
(microservicios) en los escenarios de calidad prioritarios sin el costo operativo de C.

| Capa | Tecnología |
|------|-----------|
| Frontend | **Next.js + React + TypeScript** (SPA/SSR, mobile-first) — `client/` |
| Backend | **NestJS + Node.js + TypeScript** (API REST + Facade) — `server/` |
| Integración | Adapters + Factory (realiza ADR-002) |
| Base de datos | **PostgreSQL** (transaccional ACID) |
| Caché / sesiones | **Redis** |
| Pagos | **Mercado Pago** (tras Adapter; delega PCI DSS) |
| Seguridad | OAuth2 / JWT, Argon2/bcrypt, TLS |

**Principio rector:** TypeScript end-to-end en todas las capas.

**Patrones de diseño (GoF):** State + Observer (máquina de estados de Contratación),
Adapter + Factory (integraciones externas / pagos), Strategy (ranking de búsqueda y políticas de
cancelación), Facade (frontera presentación ↔ aplicación).

Detalle: [`openspec/architecture/`](openspec/architecture/) y los ADRs en
[`openspec/architecture/adr/`](openspec/architecture/adr/).

---

## 3. Proceso de desarrollo

Proceso **híbrido**: **OpenUP** (ciclo de vida y disciplinas) + **Scrum** (cadencia mínima,
sprints de 1 semana) + **SDD asistido por IA** (Spec-Driven Development, nivel *Spec-Anchored*).

Las cuatro fases OpenUP (Inicio → Elaboración → Construcción → Transición) cierran en los hitos
LCO, LCA, IOC y Product Release. Durante Construcción, cada micro-incremento atraviesa el
**Pipeline SDD**:

```
Caso de Uso → [1.1 Redactor] → spec → [1.2 Diseño] → diseño → [1.3 Implementación] → código → [1.4 Verificador] → reporte → CI
                    ▲ HITL gate      ▲ HITL gate          ▲ HITL gate            ▲ HITL gate
```

Cada compuerta es **Human-in-the-Loop**: el desarrollador aprueba o devuelve observaciones. Los
artefactos se versionan en el repositorio (formato **OpenSpec**) y se registran en **memoria
persistente** (Engram) — almacenamiento **híbrido**.

Plan de desarrollo y Work Item List: [`openspec/development-plan.md`](openspec/development-plan.md).

---

## 4. Estructura del repositorio

```
.
├── client/                  # Frontend Next.js + React + TypeScript
├── server/                  # Backend NestJS + TypeScript
├── docker-compose.yml       # PostgreSQL + Redis (entorno local)
├── docs/                    # Especificación del TPI + diagramas (PlantUML/Mermaid)
└── openspec/                # Artefactos SDD versionados (OpenSpec Híbrido)
    ├── project.md           # Contexto de proyecto para los sub-agentes SDD
    ├── development-plan.md   # Work Item List + iteraciones + proceso
    ├── architecture/        # Vista lógica + patrones + ADRs
    │   └── adr/             # Architecture Decision Records
    ├── specs/               # Specs ejecutables por capacidad (se completan en Construcción)
    └── changes/             # Cambios OpenSpec en curso (se completan en Construcción)
```

---

## 5. Entorno de desarrollo

```bash
# Infraestructura local (PostgreSQL + Redis)
docker compose up -d

# Backend
cd server && npm install && npm run start:dev

# Frontend
cd client && npm install && npm run dev
```

**Pruebas:** Jest/Vitest (unitarias), Supertest (integración/API), Playwright (E2E).
**CI/CD:** GitHub Actions (build, análisis estático, tests, deploy).

---

## 6. Equipo

Dos Santos Mauricio · Hillebrand Giuliano · Lezcano León Joaquín · Nieto Arboitte Ignacio Tomás ·
Pirovani Antonella · Romero Micaela Denisse.
