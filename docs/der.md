# Diagrama Entidad-Relación (DER)

Modelo de datos de Snack Overflow, generado a partir del esquema vivo de la base
PostgreSQL (`snack_overflow`). El esquema lo crea TypeORM con `synchronize: true`
(no hay migraciones), por lo que esta es la fuente de verdad real.

## Relaciones

- **2 FKs declaradas** (constraint real en la base):
  - `servicios.prestador_id → prestadores.id`
  - `password_reset_tokens.user_id → users.id`
- **3 relaciones lógicas** (IDs `varchar`, sin constraint — TypeORM no las
  enforcea, se resuelven en la capa de aplicación). Van punteadas en el diagrama:
  - `contrataciones.prestador_id → prestadores.id`
  - `contrataciones.cliente_id → users.id`
  - `state_change_history.contratacion_id → contrataciones.id`

## Diagrama

```mermaid
erDiagram
    users ||--o{ password_reset_tokens : "tiene"
    prestadores ||--o{ servicios : "publica"

    contrataciones }o..|| prestadores : "prestador_id (lógico)"
    contrataciones }o..|| users : "cliente_id (lógico)"
    state_change_history }o..|| contrataciones : "contratacion_id (lógico)"

    users {
        uuid id PK
        varchar name
        varchar last_name
        varchar email
        varchar phone
        varchar password_hash
        enum role
        enum status
        enum provider_status "nullable"
        timestamptz created_at
        timestamptz updated_at
    }

    prestadores {
        uuid id PK
        varchar nombre_completo
        text oficios "nullable"
        varchar categoria
        numeric calificacion_promedio
        int cantidad_resenas
        jsonb zona_cobertura "nullable"
        varchar localidad "nullable"
        boolean cuenta_activa
        boolean tiene_servicios_publicados
        boolean visible
        jsonb disponibilidad_resumen "nullable"
        timestamp created_at
        timestamp updated_at
    }

    servicios {
        uuid id PK
        uuid prestador_id FK
        varchar categoria
        text descripcion
        numeric rango_precio_min "nullable"
        numeric rango_precio_max "nullable"
        boolean visible
        timestamp created_at
        timestamp updated_at
    }

    contrataciones {
        uuid id PK
        varchar prestador_id
        varchar cliente_id
        varchar ubicacion
        date fecha
        varchar franja
        text descripcion
        date fecha_propuesta "nullable"
        varchar franja_propuesta "nullable"
        numeric precio_estimado "nullable"
        enum estado
        timestamptz created_at
    }

    state_change_history {
        uuid id PK
        varchar contratacion_id
        enum estado_anterior "nullable"
        enum estado_nuevo
        timestamptz timestamp
    }

    password_reset_tokens {
        uuid id PK
        uuid user_id FK
        varchar token_hash
        timestamptz expires_at
        timestamptz used_at "nullable"
        timestamptz created_at
    }

    regulated_trades {
        uuid id PK
        varchar trade_name
        timestamptz created_at
    }
```

## Notas

- `regulated_trades` no tiene FK — es catálogo de oficios regulados, se valida por
  `trade_name` en el registro (UC01), no por relación.
- `prestadores` ≠ `users`: son tablas separadas, sin FK. `prestadores` es el modelo
  de lectura del catálogo (proyección de búsqueda), no la entidad de autenticación.
  Por eso `contrataciones.prestador_id` apunta lógicamente a ambas según el contexto.
- Enums Postgres (`USER-DEFINED`): `role`, `status`, `provider_status`, `estado`,
  `estado_anterior` / `estado_nuevo`.
</content>
</invoke>
