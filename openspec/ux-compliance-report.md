# UX Compliance Report — `client/DESIGN-SYSTEM.md`

> Auditoría del baseline de diseño UI contra la rúbrica `openspec/ux-compliance-rubric.md`
> (Mandel 3 reglas de oro + sub-principios · Usabilidad Tognazzini · Accesibilidad WCAG 2.1 AA ·
> RNF-A del TPI). Fuente cátedra confirmada vía NotebookLM ("Metodologías Avanzadas — UGD") y
> `cq7-5_research.md` (Pressman & Maxim 9ª ed., Cap. 12).
>
> Fecha: 2026-06-13 · Auditor: agente UX/accesibilidad · Método: lectura del baseline + cotejo literal
> contra rúbrica. No se modificó ningún artefacto de diseño ni código.

---

## Veredicto

**COMPLIANT-WITH-GAPS (cumple con observaciones).**

El baseline es de calidad alta y poco común: cubre con patrones concretos las 3 reglas de oro de
Mandel, los 14 principios de Tognazzini y casi todo WCAG 2.1 AA con detalle real (no aserciones
vacías). Es auditablemente serio: tiene tabla de contraste con ratios, contrato de foco, mapeo de
errores HTTP→UX, y estados nombrados+coloreados+icónicos.

Las brechas son **acotadas y de nivel diseño**, no estructurales. Ninguna invalida el cumplimiento de
las áreas obligatorias (Mandel A, WCAG C, RNF-A D), pero **tres gaps obligatorios** deben cerrarse para
poder *demostrar* cumplimiento ante la cátedra y los RNF: (1) el contraste de **dark mode no está
verificado** (solo light), (2) **ayuda al usuario / help facilities** no existe como patrón, y (3) los
RNF-A.1/A.3 (usable sin capacitación, ≤5 pasos) **no tienen evidencia de medición** en el baseline.

---

## A. Mandel — 3 Reglas de Oro (OBLIGATORIO)

### A.1 — Place the user in control (6 principios)

| Criterio | Estado | Evidencia | Gap |
|----------|--------|-----------|-----|
| Modos que no fuerzan acciones | ✅ | §6 No-results "**No es un error**… el form permanece visible y editable"; §1.3 P1 "una acción primaria por pantalla". No hay modos obligatorios artificiales. | — |
| Interacción flexible | 🟡 | §8 Teclado: "toda acción operable por teclado" + mouse/táctil (§8 targets). | No menciona explícitamente multimodalidad (voz, multitouch gestos) ni rutas alternativas para una misma tarea; Pressman pide "múltiples mecanismos según preferencia". |
| Interrumpible y reversible (undo) | 🟡 | §5.8 "`Esc` cierra", overlay cierra; §6 "sin doble-submit"; §7.6 "Rechazar → acción irreversible: advertir". | **Falta patrón de undo/deshacer** real. Las acciones de estado (cancelar contratación, rechazar) son irreversibles y solo se *advierte* — no hay undo ni grace-period. Pressman lista "undoable" como principio. Aceptable si el dominio lo impide, pero debería declararse el trade-off. |
| Streamline + personalización por skill | 🟡 | §5.7 nav por rol (cliente/prestador/admin); §5.10 paginación; "Admin… estética más densa". | Adaptación por **rol**, no por **nivel de habilidad/skill**. No hay shortcuts de teclado para usuarios avanzados, ni macros, ni preferencias guardadas. |
| Ocultar internals técnicos | ✅ | §9 "Nunca exponer el enum (`EN_CURSO`)…"; §5.2 "no el string crudo del backend… traducir desde catálogo es"; §10.2 ❌ "Exponer enums crudos". Excelente. | — |
| Interacción directa con objetos | ✅ | §5.3 "Toda la card es clickeable → perfil"; §5.4 chips removibles (×); §5.5 rating input navegable; §7.7 timeline expandible. | — |

**Sub-veredicto A.1: 🟡 Parcial (cumple sustancialmente, 3 de 6 con matices).**

### A.2 — Reduce the user's memory load (5 principios)

| Criterio | Estado | Evidencia | Gap |
|----------|--------|-----------|-----|
| Reducir memoria de corto plazo | ✅ | §1.3 P2 "El estado es el producto… un estado, un próximo paso"; §7.7 "Próximo paso: revisá la propuesta"; §7.5 "(resumen: a quién, cuándo)". Reconocer > recordar. | — |
| Defaults significativos (+ reset) | 🟡 | §5.4 orden default "Calificación (RN-CAT-03)"; §5.10 "20 por página". | Hay defaults pero **no hay opción reset documentada** ("Limpiar filtros" §5.4 es parcial — limpia filtros, no restaura defaults globales). Pressman pide reset explícito. |
| Shortcuts intuitivos (mnemónicos) | ❌ | — | **No existe ningún atajo de teclado mnemónico** en todo el baseline. Único keyboard es `Esc`/Tab/flechas (navegación, no mnemónicos atados a acción). Gap claro contra Mandel A.2. |
| Layout por metáfora del mundo real | ✅ | §1.1 "tierra colorada… recomendación de un vecino"; §5.4 búsqueda oficio+ubicación (metáfora directorio); §7.7 "Línea de tiempo (historial de estados)" = metáfora temporal. | — |
| Divulgación progresiva | ✅ | §5.3 contacto oculto hasta contratación (RN-CAT-05); §7.4 "ver más" clamp; §7.7 timeline expandible (▾); §9 "descripciones largas (clamp + ver más)". | — |

**Sub-veredicto A.2: 🟡 Parcial (1 No cumple: shortcuts mnemónicos).**

### A.3 — Make the interface consistent (3 principios)

| Criterio | Estado | Evidencia | Gap |
|----------|--------|-----------|-----|
| Contexto de tarea visible (títulos, íconos, color coding; de dónde / a dónde) | ✅ | §2.3 color coding de estados; §5.6 badges con texto+ícono+punto; §7.4 "◀ Volver a resultados"; §5.7 "indicador de destino activo". | — |
| Consistencia en toda la línea de producto | ✅ | Premisa central del doc: §0 "consistente en toda la app", "fuente única de verdad"; §10.1 capas; EstadoBadge "ningún otro lugar decide el color de un estado". Modelo de consistencia ejemplar. | — |
| No romper modelos interactivos esperados | ✅ | §5 "usar shadcn/ui… No reimplementar primitivas"; §9 consistencia de términos ("prestador", "contratación" siempre iguales); §5.8 patrones de modal estándar. | — |

**Sub-veredicto A.3: ✅ Cumple (la regla más fuerte del baseline).**

> **A — Veredicto global Mandel (OBLIGATORIO): 🟡 PARCIAL-ALTO.** Las 3 reglas están presentes y bien
> instrumentadas. Brechas concretas de prioridad media: ausencia de **shortcuts mnemónicos** (A.2),
> **undo/reversibilidad** real (A.1) y **reset de defaults** (A.2).

---

## B. Usabilidad — Tognazzini (14 principios)

| Principio | Estado | Evidencia / Gap |
|-----------|--------|-----------------|
| Anticipation | ✅ | §5.2 validación `onBlur`; §6 empty/no-results con CTA del próximo paso; §7.7 "Próximo paso". |
| Communication (estado de toda actividad) | ✅ | §5.1 estados de botón (loading/aria-busy); §5.9 toasts por transición de estado; §6 loading/error/partial. Fuerte. |
| Consistency | ✅ | Ver A.3. |
| Controlled Autonomy | ✅ | §5.7 nav por rol con restricciones (prestador pendiente: acciones deshabilitadas con tooltip); §5.8 confirmaciones destructivas. |
| Efficiency (del usuario) | 🟡 | §1.3 P4 "pulgar primero", §5.4 filtros/orden. Pero sin shortcuts ni bulk actions; eficiencia para usuario frecuente limitada (liga con A.2). |
| Flexibility | 🟡 | §5.4 mobile drawer vs desktop sidebar; orden múltiple. Falta flexibilidad de mecanismo de entrada (ver A.1). |
| Focus | ✅ | §1.3 P1 "una acción primaria por pantalla"; §10.2 ❌ ">1 CTA primario". |
| Human Interface Objects (reusar) | ✅ | §5 shadcn/ui; §10.3 lucide-react única librería de íconos. Explícito. |
| Latency Reduction | 🟡 | §6 skeletons, partial/stale "datos atenuados + indicador". Cubre *percepción* de latencia. **No menciona** optimistic UI ni multitasking (proceder mientras opera) que Tognazzini pide. |
| Learnability | ✅ | §1.1 metáfora; §9 microcopy honesto/breve; RNF-A.1 referido. Liga con D. |
| Metaphors | ✅ | Ver A.2 (tierra colorada, directorio, timeline). |
| Readability (jóvenes y mayores) | ✅ | §3.2 base 16px, line-height 1.6, máx ~70 car/línea; §8 escalable 200%, inputs ≥16px. Muy cuidado. |
| Track State (retomar sesión) | 🟡 | §7.7 panel de seguimiento + timeline persistente (estado del *dominio* se retoma). **No** describe persistencia de sesión/draft de formularios (retomar un form a medio llenar). |
| Visible Navigation | ✅ | §5.7 nav por rol, bottom tab bar mobile, destino activo; §7 breadcrumbs "Volver". |

**Nielsen don'ts:** ✅ texto breve (§9), ✅ mobile-first sin scroll forzado innecesario, ✅ no depende
de funciones del browser (§8 skip-link, nav propia), ✅ §1.3 P3 "Calidez con rigor… la calidez no es
excusa" (estética no supera función), ✅ §10.2 enlaces/CTA explícitos.

> **B — Veredicto: ✅ CUMPLE (con 5 parciales de matiz).** Los parciales (Efficiency, Flexibility,
> Latency, Track State) convergen en dos temas: **shortcuts/usuario avanzado** y **persistencia de
> draft/optimistic UI**. No son bloqueantes (B no es obligatorio) pero son las mejoras de mayor ROI.

---

## C. Accesibilidad — WCAG 2.1 AA (OBLIGATORIO)

| Criterio | Estado | Evidencia | Gap |
|----------|--------|-----------|-----|
| Contraste texto ≥4.5:1 / grande ≥3:1 (1.4.3) | 🟡 | §2.5 tabla con ratios calculados (foreground 15.8:1, on-primary 4.7:1, etc.) + regla "deep" para badges. Riguroso. | **Solo verifica modo CLARO.** §2.4 dark mode da hex pero **§2.5 no tiene ratios para dark**. `on-primary #FFF` sobre primary light está al límite (4.7:1); dark `#E07A4F` necesita verificación. **Gap obligatorio.** |
| No depender solo del color (1.4.1) | ✅ | §5.6 "todo badge de estado lleva además texto y… ícono o punto"; §8 explícito; §10.2 ❌ "Comunicar estado sólo por color". Ejemplar. | — |
| Foco visible (2.4.7) | ✅ | §8 "focus-visible siempre visible — anillo ring 2px + offset 2px"; §10.2 ❌ "outline: none sin reemplazo"; §5.1 focus-visible obligatorio. | — |
| Navegación por teclado (2.1.1) | ✅ | §8 "toda acción operable por teclado", focus-trap modales, Esc, flechas en combobox, skip-link, orden DOM=visual. | — |
| ARIA / roles / landmarks (4.1.2, 1.3.1) | ✅ | §8 landmarks header/nav/main/footer; label/for; aria-invalid+aria-describedby; role=alert/status; aria-busy; aria-current. Cobertura completa. | — |
| Targets táctiles ≥44px (2.5.5) | ✅ | §1.3 P4, §5.1 "altura mínima táctil 44px", §5.7 "targets ≥44px", §8 "≥44×44px… espaciado ≥8px". | — |
| Alternativas textuales (1.1.1) | ✅ | §8 "alt significativo (avatares=nombre; decorativas alt="")"; §5.11 avatar alt=nombre; §5.5 rating con número como fuente accesible. | — |
| Movimiento / reduced-motion (2.3.3) | ✅ | §8 "respetar prefers-reduced-motion — desactivar transiciones, shimmer, animaciones". | — |
| Reflow / texto 200% (1.4.4, 1.4.10) | ✅ | §8 "escalable hasta 200% sin pérdida"; mobile-first responsive §9. | — |
| Idioma del documento (3.1.1) | ✅ | §8 `lang="es-AR"`. | — |
| Manejo de errores accesible (3.3.1/3.3.3) | ✅ | §5.2 errores por campo + resumen role=alert + foco al resumen + aria-invalid/describedby. Cumple Pressman p.260 (lenguaje claro, consejo, sin culpar) — §6 "Nunca culpar al usuario". | — |

> **C — Veredicto WCAG AA (OBLIGATORIO): 🟡 PARCIAL.** Cobertura AA muy completa y bien especificada —
> **un solo gap obligatorio real**: el **contraste del modo oscuro no está verificado** (§2.5 cubre
> solo light). Como el baseline ofrece dark como feature de primera clase (§2.4, toggle next-themes),
> WCAG AA aplica también a dark. **Alta prioridad.**

---

## D. RNF-A del TPI (OBLIGATORIOS A.1/A.2; deseable A.3)

| Criterio | Estado | Evidencia | Gap |
|----------|--------|-----------|-----|
| RNF-A.1 — usable sin capacitación (>85% al 1er intento) | 🟡 | El diseño *apunta* a esto: §1.3 claridad, RNF-A.1 nombrado implícitamente vía learnability, metáfora, microcopy. | El baseline **no incorpora medición ni criterio de validación de interfaz** (Pressman p.243/255: tareas completadas, errores, recuperación). No hay sección de validación UX ni plan de user testing para *demostrar* el >85%. **Gap obligatorio** — el RNF exige métrica. |
| RNF-A.2 — compat. Chrome/Firefox/Safari (últimas 2, desktop+móvil) | 🟡 | Stack moderno (Next.js/React/Tailwind), §9 mobile-first, §3.2 "inputs ≥16px (evita zoom iOS)" (señal de awareness Safari iOS). | **No declara explícitamente** la matriz de navegadores objetivo ni "0 errores críticos de compatibilidad". Implícito en el stack, no especificado. Documentar la matriz. |
| RNF-A.3 — ≤5 pasos búsqueda→confirmar contratación (deseable) | 🟡 | Flujo trazable en §7: búsqueda (7.3) → perfil (7.4) → solicitar (7.5) → propuesta (7.6) → aceptar (7.7). | El baseline **no cuenta los pasos ni declara el conteo ≤5**. A ojo: buscar(1)→resultado/perfil(2)→pedir presupuesto(3)→esperar propuesta→aceptar(4) ≈ dentro de 5, pero **no está medido/declarado**. Agregar el conteo explícito. |
| ISO 25010 operabilidad/aprendibilidad/adaptabilidad | ✅ | Operabilidad (C teclado/foco), aprendibilidad (B Learnability), adaptabilidad (§9 responsive, §2.4 dark). | — |

> **D — Veredicto RNF-A (OBLIGATORIO): 🟡 PARCIAL.** El diseño es *consistente con* los RNF pero el
> baseline **no incluye el aparato de validación/medición** que los RNF obligatorios exigen demostrar
> (A.1 métrica >85%, A.2 matriz de navegadores, A.3 conteo de pasos). Gap de *evidencia*, no de diseño.

---

## E. Validación de interfaz (Pressman pp.242-243, 255) — transversal

| Criterio | Estado | Evidencia | Gap |
|----------|--------|-----------|-----|
| El diseño permite medir tareas/errores/recuperación/tiempo | ❌ | — | No hay sección de validación UX. El baseline define la interfaz pero **no define cómo se validará** (user testing, métricas observables). Liga directo con RNF-A.1. Recomendado agregar, aunque E no sea obligatorio per se, sostiene la evidencia de D. |
| Help facilities (Pressman p.260, 1 de los 4 design issues) | ❌ | — | **No existe ningún patrón de ayuda al usuario** (tooltip contextual salvo el del prestador deshabilitado, FAQ, ayuda buscable, onboarding). Pressman lista "user help facilities" como uno de los 4 tópicos comunes que impactan accesibilidad. **Gap notable.** |
| Response time / variabilidad (Pressman p.259) | 🟡 | §6 skeletons, partial/stale atenuado mitigan *percepción*. | No declara presupuestos de tiempo de respuesta ni manejo de variabilidad (Pressman: baja variabilidad > latencia uniforme alta). De diseño, mencionar targets. |
| Command/label labeling | ✅ | §9 consistencia de términos; §2.3 etiquetas de estado en es; §10.2 catálogo de copy. Cubre el 4º design issue. |

---

## Recomendaciones priorizadas (nivel diseño — sin código)

### P0 — Obligatorias (cerrar para cumplir A/C/D)

1. **Verificar contraste en modo oscuro (C, WCAG AA).** Agregar a §2.5 una tabla de ratios para los
   pares dark (`foreground #F5F1EA`/`background #1A1715`, `on-primary` sobre `primary #E07A4F`,
   badges `*-subtle` dark, semánticos dark). Si algún par <4.5:1 (texto) o <3:1 (UI), ajustar el token.
   Es el único gap WCAG AA bloqueante.
2. **Agregar patrón de Ayuda al usuario (E, accesibilidad p.260).** Definir en §5 o §6 un patrón de
   help: tooltips contextuales en campos no obvios, micro-ayuda inline, y un punto de acceso a
   FAQ/soporte (ya hay "canal de soporte" en 403 §5.2 — formalizarlo como patrón). Sin esto falta uno
   de los 4 design issues que la cátedra exige.
3. **Incorporar sección de Validación UX + métricas (D RNF-A.1, E).** Agregar §11 "Validación" con:
   plan de user testing, métricas observables (tareas completadas al 1er intento, errores,
   recuperación, tiempo) y el umbral >85% del RNF-A.1. Convierte la aserción en evidencia auditable.
4. **Declarar matriz de navegadores (D RNF-A.2).** Una línea en §9: Chrome/Firefox/Safari últimas 2,
   desktop+móvil, 0 errores críticos. El stack ya lo soporta; falta explicitarlo.
5. **Declarar y contar pasos del flujo de contratación ≤5 (D RNF-A.3).** En §7 agregar el conteo
   explícito búsqueda→confirmar y verificar que ≤5 (deseable). Hoy es trazable pero no medido.

### P1 — Mandel (cerrar para fortalecer A — obligatorio)

6. **Definir shortcuts mnemónicos (A.2).** Al menos para acciones frecuentes (buscar, enviar). Mandel
   A.2 lo lista; hoy ausente por completo. Documentar el set en §8 o §5.1.
7. **Definir reversibilidad / undo o grace-period (A.1).** Para acciones destructivas (cancelar
   contratación, rechazar) que hoy solo se *advierten*: o bien un undo con ventana corta, o declarar
   explícitamente el trade-off de irreversibilidad con su justificación de dominio.
8. **Opción reset de defaults (A.2).** Diferenciar "Limpiar filtros" de un "restablecer a valores por
   defecto" (orden, página) explícito.

### P2 — Tognazzini / robustez (mejora, no bloqueante)

9. **Track State de formularios (B).** Persistir borradores de forms largos (solicitud UC07, propuesta
   UC08) para retomar sesión — refuerza Track State y RNF-A.1.
10. **Optimistic UI / latency reduction (B).** Declarar para transiciones de estado: aplicar el cambio
    optimista y reconciliar, en vez de bloquear esperando 200 (Tognazzini Latency Reduction).
11. **Multimodalidad de entrada (A.1/Flexibility).** Mencionar soporte de gestos táctiles donde aporte
    (swipe en cards mobile) como interacción flexible alternativa.

---

## Cross-check NotebookLM

**Accesible.** Se cambió el perfil del MCP a la cuenta personal (`nlm login switch personal`) y se
consultó el notebook **"Metodologías Avanzadas — UGD"** (id `7a402a83…`, 73 fuentes).

**Confirmó:** la respuesta del notebook coincide **literalmente** con el rubric y con
`cq7-5_research.md`:
- Las **3 reglas de oro de Mandel** y sus sub-principios (control / memoria / consistencia) — idénticos
  a la sección A del rubric, citando Pressman pp.238-241.
- Los **14 principios de Tognazzini** — lista idéntica a la sección B.
- **Accesibilidad**: definición Pressman p.237 + **WCAG (W3C)** como referencia normativa (p.259), y
  los **4 design issues** (tiempo de respuesta, ayuda, manejo de errores, etiquetado de comandos).
- **Validación de interfaz**: 3 dimensiones (soportar tareas / facilidad de uso-aprendizaje /
  aceptación) + métricas de user testing (p.243, p.255).

**Agregó / matizó (nada que el rubric omita, pero refuerza dos gaps de este reporte):**
- El notebook enfatiza los **4 design issues comunes** como criterio que la cátedra exige establecer
  "desde el inicio, no al final". Esto valida que la **ausencia de Help facilities** (P0-2) y la falta
  de **targets de tiempo de respuesta** (E) son gaps reales contra la cátedra, no invención del auditor.
- Reafirma los **don'ts de Nielsen** (estética no supera función, no texto voluminoso) — el baseline
  los cumple.

Conclusión del cross-check: **el rubric refleja fielmente la cátedra; no hay criterios adicionales que
el rubric omita.** La auditoría se sostiene sobre A–E tal como están.

---

*Reporte generado sin modificar `client/DESIGN-SYSTEM.md` ni código. Trazabilidad de fuentes: rúbrica
`openspec/ux-compliance-rubric.md`, cátedra `cq7-5_research.md` (Pressman & Maxim 9ª ed. Cap. 12),
NotebookLM "Metodologías Avanzadas — UGD".*
