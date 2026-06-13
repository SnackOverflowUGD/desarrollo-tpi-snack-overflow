# Design: UC08 — Enviar propuesta o rechazar solicitud

## Technical Approach

Extiende el módulo `contratacion` existente con dos endpoints (`POST /contrataciones/:id/proposal` y `POST /contrataciones/:id/reject`) siguiendo el mismo patrón Controller → Service → Ports/Adapters. Las operaciones son simples UPDATE de una contratación existente — sin transacción atómica (no hay reserva de slot ni QueryRunner). La validación de estado se hace en service; la máquina de estados (UC09, stub) se invoca después de persistir.

## Architecture Decisions

| Decisión | Opciones | Trade-off | Resolución |
|---|---|---|---|
| **Transacción** | QueryRunner vs simple save | QueryRunner da rollback pero no hay operaciones externas que compensar | `save` simple, sin QueryRunner |
| **Nuevas columnas** | Tabla separada `propuestas` vs columnas nullable en `contrataciones` | Tabla separada es más normalizada pero agrega JOIN y migración más compleja | Columnas `fecha_propuesta`, `franja_propuesta`, `precio_estimado` nullable en `contrataciones` |
| **findById** | Repository.findById() vs QueryBuilder inline | QueryBuilder inline duplica lógica de acceso a datos | Agregar `findById` al puerto `IContratacionRepository` y al adapter TypeORM |
| **Validación autoría** | 403 vs 404 para prestadorId no coincide | 404 no revela existencia (seguridad por oscuridad) | 404 cuando el prestadorId no coincide — sigue la spec |
| **DTOs** | DTO separado vs inline @Body() params | DTO permite validación declarativa con class-validator | `SendProposalDto` con `@IsNumber`/`@IsDateString`/`@Min(0.01)` |

## Data Flow

### Proposal flow

```
POST /contrataciones/:id/proposal { fecha, franja, precioEstimado }
  │
  ▼
ContratacionController.sendProposal()
  ← extrae user.sub, user.role de JWT
  │
  ▼
ContratacionService.sendProposal(id, dto, userId, role)
  ├── role !== PRESTADOR ──► 403
  ├── contratacion = repo.findById(id) — null? ──► 404
  ├── contratacion.prestadorId !== userId ──► 404
  ├── contratacion.estado !== SOLICITADA ──► 409
  ├── dto.fecha < today || dto.precioEstimado <= 0 ──► 422
  ├── entity.fechaPropuesta = dto.fecha
  ├── entity.franjaPropuesta = dto.franja
  ├── entity.precioEstimado = dto.precioEstimado
  ├── repo.save(entity)
  ├── stateMachine.transitionTo(id, PRESUPUESTADA)
  └── return ContratacionResponseDto
```

### Reject flow

```
POST /contrataciones/:id/reject
  │
  ▼
ContratacionController.reject()
  ← extrae user.sub, user.role de JWT
  │
  ▼
ContratacionService.reject(id, userId, role)
  ├── role !== PRESTADOR ──► 403
  ├── contratacion = repo.findById(id) — null? ──► 404
  ├── contratacion.prestadorId !== userId ──► 404
  ├── contratacion.estado !== SOLICITADA ──► 409
  ├── stateMachine.transitionTo(id, CANCELADA)
  └── return ContratacionResponseDto
```

## File Changes

| File | Action | Description |
|------|--------|-------------|
| `server/src/contratacion/dto/send-proposal.dto.ts` | Create | DTO with `fecha` (date ≥ hoy), `franja`, `precioEstimado` (> 0) |
| `server/src/contratacion/domain/contratacion.entity.ts` | Modify | Add `fechaPropuesta`, `franjaPropuesta`, `precioEstimado` columns (nullable) |
| `server/src/contratacion/ports/contratacion-repository.port.ts` | Modify | Add `findById(id: string): Promise<Contratacion \| null>` |
| `server/src/contratacion/adapters/typeorm-contratacion.repository.ts` | Modify | Implement `findById` via `this.repo.findOneBy({ id })` |
| `server/src/contratacion/contratacion.controller.ts` | Modify | Add `sendProposal()` and `reject()` endpoints |
| `server/src/contratacion/application/contratacion.service.ts` | Modify | Add `sendProposal()` and `reject()` methods |
| `server/src/contratacion/dto/contratacion-response.dto.ts` | Modify | Add `fechaPropuesta`, `franjaPropuesta`, `precioEstimado` fields |
| `server/src/contratacion/application/contratacion.service.spec.ts` | Modify | Add test suites for both new methods |

## Interfaces / Contracts

### IContratacionRepository (modified)

```typescript
export interface IContratacionRepository {
  save(contratacion: Contratacion): Promise<Contratacion>;
  findById(id: string): Promise<Contratacion | null>;  // ← NEW
}
```

### SendProposalDto (new)

```typescript
import { IsDateString, IsNotEmpty, IsNumber, IsString, Min } from 'class-validator';

export class SendProposalDto {
  @IsDateString() @IsNotEmpty()
  fecha: string;

  @IsString() @IsNotEmpty()
  franja: string;

  @IsNumber() @Min(0.01)
  precioEstimado: number;
}
```

### Contratacion entity (new columns)

```typescript
@Column({ type: 'date', name: 'fecha_propuesta', nullable: true })
fechaPropuesta: string | null;

@Column({ type: 'varchar', length: 50, name: 'franja_propuesta', nullable: true })
franjaPropuesta: string | null;

@Column({ type: 'decimal', precision: 10, scale: 2, name: 'precio_estimado', nullable: true })
precioEstimado: number | null;
```

### Service method signatures (new)

```typescript
async sendProposal(
  id: string,
  dto: SendProposalDto,
  userId: string,
  role: UserRole,
): Promise<ContratacionResponseDto>;

async reject(
  id: string,
  userId: string,
  role: UserRole,
): Promise<ContratacionResponseDto>;
```

## Testing Strategy

| Layer | What | Approach |
|-------|------|----------|
| Unit | `sendProposal()` - éxito con datos válidos | Mock `findById`, `save`, `transitionTo`; assert response |
| Unit | `sendProposal()` - rol incorrecto → 403 | `role = CLIENTE` → assert `ForbiddenException` |
| Unit | `sendProposal()` - prestadorId mismatch → 404 | Otro userId → assert `NotFoundException` |
| Unit | `sendProposal()` - estado no SOLICITADA → 409 | Estado `PRESUPUESTADA` → assert `ConflictException` |
| Unit | `sendProposal()` - fecha pasada → 422 | `fecha < today` → assert `UnprocessableEntityException` |
| Unit | `sendProposal()` - precioEstimado <= 0 → 422 | `precioEstimado = 0` → assert `UnprocessableEntityException` |
| Unit | `reject()` - éxito | Mock `findById`, `transitionTo`; assert 200 |
| Unit | `reject()` - contratación no existe → 404 | `findById` null → assert `NotFoundException` |
| Unit | `reject()` - estado no SOLICITADA → 409 | Estado `ACEPTADA` → assert `ConflictException` |
| Unit | `reject()` - prestadorId mismatch → 404 | Otro userId → assert `NotFoundException` |
| API | Proposal exitosa | Supertest `POST /contrataciones/:id/proposal` con auth |
| API | Reject exitoso | Supertest `POST /contrataciones/:id/reject` con auth |

## Migration / Rollout

No migration required. TypeORM `synchronize: true` (no-prod) crea las columnas nullable automáticamente. Los registros existentes tendrán `fechaPropuesta = null`, `franjaPropuesta = null`, `precioEstimado = null`.

## Open Questions

None.
