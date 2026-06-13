# Arquitectura — Snack Overflow

> Vista lógica (modelo 4+1 de Kruchten). Decisiones vinculantes en [`adr/`](adr/).
> Diagramas fuente en `../../docs/11_Ejecucion/11.b_Diseno_Arquitectonico/` y `11.c_Diseno_Detallado/`.

## Estilo

**Monolito modular en capas + Broker de integración** (ADR-001, ADR-002). Único desplegable,
tres capas, con una capa de integración de puertos y adaptadores para todo proveedor externo.

```
┌─────────────────────────────────────────────────────────┐
│  Presentación — Next.js + React (SPA/SSR, MVC)  client/  │
└───────────────────────────┬─────────────────────────────┘
                            │ REST (Facade)
┌───────────────────────────▼─────────────────────────────┐
│  Aplicación — NestJS (server/)                           │
│  ┌─────────┬──────────┬──────────────┬──────────┐        │
│  │ cuentas │ catalogo │ contratacion │  pagos   │  ...   │  ← módulos de dominio
│  └─────────┴──────────┴──────┬───────┴────┬─────┘        │
│                              │            │              │
│  Capa de integración (Broker — Puertos y Adaptadores)    │
│   PasarelaPago ◄ AdaptadorMercadoPago    Geo / Msg / ... │
└───────────┬──────────────────────────────┬──────────────┘
            │ Repository (ORM)              │ SDKs externos
┌───────────▼──────────┐         ┌──────────▼──────────────┐
│ PostgreSQL (ACID)    │  Redis  │ Mercado Pago, mapas, ... │
└──────────────────────┘ (caché) └─────────────────────────┘
```

## Módulos de dominio (capa de aplicación)

| Módulo | Grupo funcional | RF |
|--------|-----------------|-----|
| `cuentas` | Acceso y gestión de cuentas | RF-1 |
| `catalogo` | Catálogo, publicación y agenda | RF-2, RF-4 |
| `contratacion` | Contratación, ciclo de estados, mensajería | RF-5, RF-6 |
| `pagos` | Pagos y liberación | RF-7 |
| `reputacion` | Reputación y moderación | RF-3 |
| `habilitaciones` | Verificación de habilitaciones | RF-8 |

## Patrones de diseño (GoF)

| Patrón | Roles del dominio | Diagrama fuente |
|--------|-------------------|-----------------|
| **State** | Context `Contratacion`; State `EstadoContratacion`; ConcreteState `Solicitada, Confirmada, EnCurso, Finalizada, Cancelada` | `11.c.1`, `11.c.4` |
| **Observer** | Subject `Contratacion`; ConcreteObserver `NotificadorCliente, NotificadorPrestador` (UC09 → UC19) | `11.c.1`, `11.c.6` |
| **Adapter + Factory** | Target `PasarelaPago`; Adapter `AdaptadorMercadoPago`; Factory `FabricaPasarela` | `11.c.2` |
| **Strategy** | Context `BuscadorPrestadores`; ConcreteStrategy `RankingPorCercania, RankingPorReputacion, RankingPorPrecio`; también política de cancelación | `11.c.3` |
| **Facade** | Fachada REST / frontera presentación ↔ aplicación | `11.b` |

## Máquina de estados de Contratación

```
Solicitada ──(UC08 propuesta)──► Confirmada ──(UC20 iniciar)──► EnCurso ──(UC13 confirmar)──► Finalizada
    │                                │                              │
    └────────────(UC10 cancelar)─────┴──────────────────────────────┘──► Cancelada
```

> El documento describe dos variantes del ciclo (con y sin estado intermedio `Presupuestada`).
> **Pendiente de unificación** al modelar la spec del módulo `contratacion` (ver hallazgos abajo).

Toda transición dispara notificación a ambas partes (Observer). Interfaces críticas especificadas
en **OCL** — p. ej. `Contratacion::aceptar()` pre: `estado = Solicitada`, post: `estado = Confirmada`
y todos los observadores notificados. Las pre/postcondiciones OCL se traducen en aserciones de tests.

## Atributos de calidad rectores (ATAM E1–E5)

| Esc. | Escenario | Objetivo |
|------|-----------|----------|
| E1 | Búsqueda concurrente | ≤2 s p95, ≤70% CPU |
| E2 | Pago | ACID, cifrado, ≥99.5% uptime |
| E3 | Sustitución de pasarela | ≤40 h (ADR-002) |
| E4 | Nueva categoría | ≤8 h |
| E5 | Suspensión por habilitación vencida | ≤24 h, automatizado |

## Mecanismos transversales

- **Persistencia:** Repository sobre ORM (PostgreSQL) + caché Redis (ADR-003).
- **Seguridad:** OAuth2/JWT, TLS en tránsito y reposo, mínimo privilegio, hash Argon2/bcrypt.
- **Comunicación:** REST interna + adaptadores hacia el exterior.
- **Errores:** manejo y reintentos en la capa de integración.

## Hallazgos abiertos (resolver al especificar)

1. **Inconsistencia de RF:** la trazabilidad CDU↔RF referencia RF-1.6, RF-2.5, RF-6.7/6.8/6.9,
   RF-7.5 que no figuran en la tabla de requisitos. Verificar al redactar specs de cada módulo.
2. **Dos variantes del ciclo de estados** de Contratación (con/sin `Presupuestada`). Unificar.
3. **RNF-O.2** (cobertura ≥90%) citado en pruebas sin tabla de RNF de Operatividad. Asumido en ADR-006.
