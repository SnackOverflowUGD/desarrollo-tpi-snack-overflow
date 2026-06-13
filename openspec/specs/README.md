# Specs ejecutables (OpenSpec)

Specs vivas por **capacidad**, fuente de verdad autoritativa (nivel Spec-Anchored, ADR-005). Se
completan durante la fase de Construcción, una por Work Item, generadas por el sub-agente Redactor
del Pipeline SDD.

## Estructura de una spec

```
specs/{capacidad}/spec.md
```

Cada `spec.md` sigue el formato OpenSpec:

- **Propósito** — qué capacidad cubre y por qué.
- **Requisitos** — referencia a los RF/RNF y al/los Caso(s) de Uso.
- **Escenarios** — criterios de aceptación en **Given-When-Then**.

Las pre/postcondiciones OCL del diseño se traducen en aserciones de los tests del Verificador.

> Vacío por diseño: no hay desarrollo iniciado. Ver `../development-plan.md` para el orden.
