# Cambios en curso (OpenSpec)

Carpeta de **cambios activos**: cada Work Item en desarrollo abre aquí su carpeta con los
artefactos del Pipeline SDD antes de integrarse y consolidarse en `../specs/`.

## Estructura de un cambio

```
changes/{uc-nombre}/
├── proposal.md   # intención y alcance del cambio
├── spec.md       # delta de spec (Redactor)
├── design.md     # diseño detallado (Diseño) — respeta ADRs, OCL
├── tasks.md      # checklist de implementación
└── verify.md     # reporte de validación (Verificador)
```

Al cerrar el cambio (DoD cumplida + CI verde), el delta de spec se consolida en `../specs/` y los
artefactos se archivan / registran en Engram (`sdd/{uc}/{fase}`).

> Vacío por diseño: no hay cambios iniciados.
