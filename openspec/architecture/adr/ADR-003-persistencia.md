# ADR-003 — Persistencia: PostgreSQL transaccional único + Redis caché

- **Estado:** Aceptada (Fase de Elaboración)
- **Formato:** Nygard
- **Relacionada con:** ADR-001

## Contexto

Los pagos y la máquina de estados de la contratación exigen garantías **ACID** (RNF-S.5): no se
puede liberar un pago ni avanzar un estado sobre datos inconsistentes. Simultáneamente, las
búsquedas con filtros deben responder en ≤2 s p95 (RNF-E.1) bajo ≥100 transacciones concurrentes
(RNF-E.2). Un único almacén relacional satisface la consistencia; las lecturas frecuentes
necesitan aceleración.

## Decisión

- **Repositorio transaccional único en PostgreSQL** accedido mediante el patrón **Repository**
  sobre un ORM. Toda operación crítica (pago, transición de estado) es transaccional ACID.
- **Redis** como caché de consultas frecuentes y almacén de sesiones.

## Consecuencias

- (+) Fiabilidad de pagos y transiciones de estado por garantías ACID (RNF-S.5).
- (+) Eficiencia de búsquedas vía caché (RNF-E.1, RNF-E.2).
- (+) Modelo de datos único, simple de razonar y respaldar.
- (−) Acoplamiento al esquema compartido y punto único de contención → mitigar con índices,
  réplicas de lectura y disciplina de caché (invalidación).
