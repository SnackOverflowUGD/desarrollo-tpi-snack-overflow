# UX Compliance Rubric — para verificar `client/DESIGN-SYSTEM.md`

> Research compilado de la cátedra (Metodologías Avanzadas) + RNF del TPI, para que el agente
> verificador audite el baseline de diseño UI contra las buenas prácticas exigidas. Fuentes:
> Pressman & Maxim 9ª ed. Cap. 12 (citado por la cátedra en el Cuestionario 7.5) + TPI RNF-A + WCAG 2.1.
>
> **Fuente cátedra (literal):** `~/Facultad/Vault/10_Materias/Metodologias Avanzadas/Entregas/Cuestionario7-5_Unidad2/`
> (`cq7-5_research.md` tiene las citas con página). **NotebookLM:** notebook *"Metodologías Avanzadas"*,
> cuenta personal `giulianohillebrand@gmail.com` (puede requerir `nlm login switch` al perfil personal).

## A. Las 3 Reglas de Oro de Mandel (Pressman p.238) — eje central

El baseline debe demostrar, con patrones concretos, cada regla y sus sub-principios:

### A.1 — Place the user in control (poner al usuario en control) — 6 principios
- Modos de interacción que no fuerzan acciones innecesarias/indeseadas.
- Interacción flexible.
- Interacción interrumpible y reversible (undo).
- Streamline + personalización a medida que sube la skill.
- Ocultar los internals técnicos al usuario casual.
- Interacción directa con objetos en pantalla.

### A.2 — Reduce the user's memory load (reducir carga de memoria) — 5 principios
- Reducir demanda de memoria de corto plazo.
- Defaults significativos (+ opción reset).
- Shortcuts intuitivos (mnemónicos atados a la acción).
- Layout basado en metáfora del mundo real.
- Divulgación progresiva de información (jerárquica).

### A.3 — Make the interface consistent (consistencia) — 3 principios
- Contexto de la tarea actual visible (títulos, íconos, color coding; de dónde vengo / a dónde puedo ir).
- Consistencia a través de toda la línea de producto (mismas reglas de diseño en toda la app).
- No cambiar modelos interactivos ya esperados sin razón de peso.

## B. Principios de Usabilidad de Tognazzini (Pressman pp.257-258) — 14
Anticipation · Communication (estado de toda actividad) · Consistency · Controlled Autonomy ·
Efficiency (del usuario, no del dev) · Flexibility · Focus · Human Interface Objects (reusar) ·
Latency Reduction · Learnability · Metaphors · Readability (jóvenes y mayores) · Track State
(retomar sesión) · Visible Navigation.

**Nielsen don'ts (p.259):** no forzar a leer texto voluminoso · no obligar a scrollear salvo
inevitable · no depender de funciones del browser para navegar · la estética no debe superar a la
función · no obligar a buscar en pantalla cómo enlazar a otro contenido.

## C. Accesibilidad (Pressman p.237, p.259 + WCAG)
- **Definición:** grado en que personas con necesidades especiales (visual, auditiva, mayores,
  cognitiva) pueden percibir, entender, navegar e interactuar con el producto.
- **Lineamiento normativo:** **WCAG 2.1 (W3C)** — citado explícitamente por el TPI (línea ~2338) como
  soporte del RNF de aceptabilidad. Verificar nivel **AA**: contraste, foco visible, navegación por
  teclado, ARIA/roles, targets táctiles, alternativas textuales.
- **4 design issues que afectan accesibilidad (p.259):** tiempo de respuesta del sistema, facilidades
  de ayuda, manejo de información de error, etiquetado de comandos.

## D. RNF del TPI (obligatorios — Tabla 2 Aceptabilidad)
- **RNF-A.1 (Obligatorio):** usable **sin capacitación previa** (alfabetización digital básica).
  Métrica: >85% completan registro/búsqueda/contratación al primer intento.
- **RNF-A.2 (Obligatorio):** compatible con Chrome/Firefox/Safari (últimas 2 versiones, desktop+móvil),
  0 errores críticos de compatibilidad.
- **RNF-A.3 (Deseable):** minimizar pasos → **≤5 pasos** desde búsqueda hasta confirmar contratación.
- ISO/IEC 25010: usabilidad (operabilidad, aprendizibilidad) + portabilidad (adaptabilidad).

## E. Validación UX (Pressman pp.242-243, 255) — qué debe permitir medir el diseño
Interface validation: (1) implementa cada tarea correctamente, (2) fácil de usar/aprender,
(3) aceptación del usuario. Métricas observables: tareas completadas/tiempo, errores y recuperación,
tiempo en ayuda, secuencia de acciones.

## Cómo verificar (instrucciones para el agente verificador)
1. Leer `client/DESIGN-SYSTEM.md` (el baseline a auditar).
2. Para CADA criterio A–D, marcar **Cumple / Parcial / No cumple / No aplica** con evidencia citando
   la sección del baseline. La regla de Mandel (A) y WCAG AA (C) + RNF-A (D) son **obligatorias**.
3. **Cross-check NotebookLM**: consultar el notebook *"Metodologías Avanzadas"* (cuenta
   `giulianohillebrand@gmail.com`) para confirmar que los criterios de la cátedra coinciden con A–E
   y capturar cualquier lineamiento adicional que el notebook tenga y este rubric no.
4. Cross-check contra el cuestionario fuente (`cq7-5_research.md`) si hay dudas de literalidad.
5. Entregar un **reporte de cumplimiento** con: tabla por criterio, gaps concretos, y recomendaciones
   accionables para el baseline (sin implementar código).
