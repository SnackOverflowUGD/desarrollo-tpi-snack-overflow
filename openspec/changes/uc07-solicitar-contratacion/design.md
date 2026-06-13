# Design: UC07 — Solicitar Contratación

## Technical Approach

Nuevo módulo NestJS `contratacion/` bajo `server/src/` siguiendo la misma estructura del módulo `auth/` existente (controller → application/service → ports → adapters → domain). Contratacion se persiste como entidad TypeORM con estado inicial `solicitada` seteado vía puerto a UC09. La reserva de franja y creación de contratación son una sola transacción atómica con `QueryRunner` de TypeORM.

## Architecture Decisions

| Decisión | Opciones | Trade-off | Resolución |
|----------|----------|-----------|-----------|
| Modelo de estado | Enum TypeORM vs value object | +1 columna simple, acoplamiento mínimo con UC09 | **Enum** en columna `estado`. UC07 solo usa `solicitada`. |
| Atomicidad | TypeORM QueryRunner vs Saga | Saga es overkill para 2 ops en misma DB | **QueryRunner** con commit/rollback explícito |
| Integración UC09 | Puerto `ContratacionStateMachine` | Permite mockear en tests sin instanciar UC09 | Método `transitionTo(contratacionId, estado)` |
| Integración agenda | Puerto `AvailabilityService` | Desacopla disponibilidad de lógica de contratación | Métodos `reserve()` y `release()` |
| Ubicación | Texto libre (spec) | Sin geocodificación en esta iteración | String en DTO y entidad |

## Data Flow

```
Cliente JWT ──POST /contrataciones──► Controller ──DTO──► Service
                                                             │
              ┌──────────────────────────────────────────────┤
              ▼                                              │
     QueryRunner (transaction begin)                         │
              │                                              │
              ├── 1. Valida prestador activo (UserRepo)      │
              ├── 2. Valida fecha ≥ hoy                      │
              ├── 3. Verifica franja (AvailabilityService)   │
              ├── 4. Reserva franja (AvailabilityService)    │
              ├── 5. Crea Contratacion (Repository)          │
              ├── 6. Invoca UC09 → estado solicitada (SMC)   │
              │                                              │
     OK ──Commit ──► 201 Created                             │
     FAIL ──Rollback + releaseSlot ──► 409 / 422 / 500       │
```

## File Changes

| File | Action | Description |
|------|--------|-------------|
| `server/src/contratacion/contratacion.module.ts` | Create | Módulo NestJS con providers, imports, controllers |
| `server/src/contratacion/contratacion.controller.ts` | Create | `POST /contrataciones` con JwtAuthGuard |
| `server/src/contratacion/application/contratacion.service.ts` | Create | Lógica de validación, reserva atómica, creación |
| `server/src/contratacion/application/contratacion.service.spec.ts` | Create | Tests unitarios con fakes en memoria |
| `server/src/contratacion/domain/contratacion.entity.ts` | Create | Entidad TypeORM (tabla `contrataciones`) |
| `server/src/contratacion/domain/contratacion-estado.enum.ts` | Create | Enum `ContratacionEstado` |
| `server/src/contratacion/ports/contratacion-repository.port.ts` | Create | Interfaz repo |
| `server/src/contratacion/ports/state-machine.port.ts` | Create | Interfaz para UC09 (stub hasta implementación) |
| `server/src/contratacion/ports/availability-service.port.ts` | Create | Interfaz para módulo agenda |
| `server/src/contratacion/adapters/typeorm-contratacion.repository.ts` | Create | Adapter TypeORM |
| `server/src/contratacion/dto/create-contratacion.dto.ts` | Create | DTO con class-validator |
| `server/src/contratacion/dto/contratacion-response.dto.ts` | Create | DTO de respuesta |
| `server/src/app.module.ts` | Modify | Importar `ContratacionModule` + entidad en `entities[]` |

Total: 13 new, 1 modified.

## Interfaces / Contracts

```typescript
// ── Ports ──
export const CONTRATACION_REPOSITORY = 'CONTRATACION_REPOSITORY';
export interface IContratacionRepository {
  save(contratacion: Contratacion): Promise<Contratacion>;
}

export const STATE_MACHINE = 'STATE_MACHINE';
export interface IContratacionStateMachine {
  transitionTo(contratacionId: string, estado: ContratacionEstado): Promise<void>;
}

export const AVAILABILITY_SERVICE = 'AVAILABILITY_SERVICE';
export interface IAvailabilityService {
  isAvailable(prestadorId: string, fecha: string, franja: string): Promise<boolean>;
  reserve(prestadorId: string, fecha: string, franja: string, contratacionId: string): Promise<void>;
  release(prestadorId: string, fecha: string, franja: string): Promise<void>;
}

// ── Entity (TypeORM) ──
@Entity('contrataciones')
export class Contratacion {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column() ubicacion: string;
  @Column({ name: 'prestador_id' }) prestadorId: string;
  @Column({ name: 'cliente_id' }) clienteId: string;
  @Column({ type: 'date' }) fecha: string;
  @Column() franja: string;
  @Column('text') descripcion: string;
  @Column({ type: 'enum', enum: ContratacionEstado, default: ContratacionEstado.SOLICITADA })
  estado: ContratacionEstado;
  @CreateDateColumn({ type: 'timestamptz', name: 'created_at' })
  createdAt: Date;
}

// ── DTOs ──
export class CreateContratacionDto {
  @IsString() @IsNotEmpty() ubicacion: string;
  @IsUUID() @IsNotEmpty() prestadorId: string;
  @IsDateString() @IsNotEmpty() fecha: string;
  @IsString() @IsNotEmpty() franja: string;
  @IsString() @IsNotEmpty() descripcion: string;
}
```

## Testing Strategy

| Layer | What | Approach |
|-------|------|----------|
| Unit | `ContratacionService` | Fakes de todos los puertos. Un test por escenario spec (ESC-01..07). Cobertura ≥90%. |
| API | `POST /contrataciones` | Supertest con módulo NestJS de test. Auth simulado vía JwtAuthGuard override. |
| E2E | Flujo completo | `server/test/contratacion.e2e-spec.ts` con base PostgreSQL real. |

## Migration / Rollout

No migration required. Tabla `contrataciones` se crea automáticamente con `synchronize: true` en desarrollo.

## Open Questions

- [ ] UC09 aún no existe. El adapter `ContratacionStateMachine` será un stub funcional hasta que UC09 se implemente. ¿Puerto definitivo de UC09?
- [ ] `AvailabilityService` asume módulo agenda como servicio NestJS interno (mismo proceso). Si resulta ser servicio externo, el adapter cambiará, el puerto no.
- [ ] Franja horaria se modela como string `"08:00-09:00"`. Si agenda usa formato diferente, normalizar en el adapter.
