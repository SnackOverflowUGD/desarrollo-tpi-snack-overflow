# ADR-007 — ORM: TypeORM

- **Estado:** Aceptada (Construcción — emergente de UC02, decisión de proyecto)
- **Formato:** Nygard
- **Relacionada con:** ADR-003 (persistencia), ADR-004 (stack)

## Contexto

ADR-003 fija el patrón **Repository** sobre PostgreSQL, pero no elige una herramienta de mapeo
concreta. El primer Work Item que toca persistencia (UC02 Autenticarse) obliga a decidir el ORM,
y la elección **sienta precedente para los 6 módulos de dominio**. Candidatos: TypeORM y Prisma.

## Decisión

Adoptar **TypeORM** como ORM del backend para todos los módulos.

- Patrón **DataMapper** + `Repository<T>` nativo, que se envuelve detrás de los puertos del dominio
  (p. ej. `IUserRepository`) sin fricción — la lógica de negocio depende del puerto, no de TypeORM.
- Integración madura vía `@nestjs/typeorm` (módulos, inyección de repositorios).
- Entidades como clases TypeScript con decoradores, coherente con el estilo NestJS.

## Consecuencias

- (+) Encaja directo con los puertos/adaptadores de ADR-002/003; el adaptador es un wrapper fino.
- (+) Un solo ORM en todo el backend → menor carga cognitiva (coherente con ADR-004).
- (+) Migraciones y entidades versionadas junto al código.
- (−) Type-safety inferior a Prisma (queries no totalmente tipadas); se mitiga con DTOs validados.
- (−) Acopla las entidades al runtime de TypeORM (decoradores). Sustituir el ORM impactaría solo a
  los adaptadores, no al dominio (gracias a los puertos).
