# ADR-006 — Estrategia de pruebas: pirámide automatizada sin TDD estricto

- **Estado:** Aceptada (Fase de Elaboración)
- **Formato:** Nygard
- **Relacionada con:** ADR-005

## Contexto

El RNF-O.2 fija cobertura ≥90% de criterios en módulos del núcleo. El equipo no tiene experiencia
en TDD estricto y lo descartó al elegir el proceso (ADR-005). El pipeline SDD incluye un sub-agente
**Verificador** que deriva tests de los criterios de aceptación (Given-When-Then) y las
pre/postcondiciones **OCL** del diseño.

## Decisión

Adoptar **testing automatizado en pirámide, sin TDD estricto**:

| Nivel | Herramienta | Quién / cuándo |
|-------|------------|----------------|
| Unitarias | **Jest** (o Vitest) | Sub-agente Verificador, por micro-incremento |
| Integración / API | **Supertest** | CI/CD, por Work Item |
| E2E / sistema | **Playwright** | Tester humano, al cierre del sprint |

La **Definition of Done** exige: cobertura de tests + revisión de código + spec actualizada. Las
pre/postcondiciones OCL se traducen en aserciones. **Verificación cruzada de dos planos:** el
Verificador valida código contra spec; el humano valida que la spec capture la intención.

## Consecuencias

- (+) Cobertura objetivo medible (≥90% núcleo); regresión protegida por CI.
- (+) Tests derivados automáticamente de criterios de aceptación → trazabilidad.
- (−) Sin la disciplina de diseño emergente del TDD; el diseño viene del sub-agente Diseño.
- (−) Riesgo de tests escritos "para pasar" → mitigado por la verificación cruzada humana.
