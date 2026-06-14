# Snack Overflow — Design System & UX/UI Baseline

> **Fuente única de verdad de diseño.** Este documento define la identidad visual, los tokens y los
> patrones de interacción de la aplicación web. Cuando se construyan las pantallas, la interfaz debe
> ser visual y conductualmente **consistente** en toda la app. Los desarrolladores implementan
> contra este documento, no contra criterio propio.
>
> Stack objetivo: **Next.js 16 (App Router) + React 19 + Tailwind CSS v4 + shadcn/ui** en `client/`.
> Tokens expresados como variables CSS Tailwind v4 (`@theme`). Idioma de la UI: **español (Argentina,
> registro rioplatense neutro-formal)**.
>
> **Este documento NO contiene código de componentes.** Es una especificación. Los snippets CSS de
> `@theme` son la definición canónica de los tokens, no implementación de UI.

---

## 0. Cómo leer este documento

| Sección | Para qué |
|---------|----------|
| 1 | Lenguaje de marca y principios — el "por qué" detrás de cada decisión |
| 2 | Sistema de color (tokens + roles + contraste WCAG) |
| 3 | Tipografía |
| 4 | Espaciado, radios, sombras, grilla, breakpoints |
| 5 | Patrones de componentes (botones, forms, cards, badges, navegación, ayuda, atajos, undo…) |
| 6 | Patrones de estado (loading / empty / error / sin resultados) |
| 7 | Blueprints de pantallas clave (wireframes low-fi) |
| 8 | Línea base de accesibilidad (WCAG 2.1 AA) |
| 9 | Responsive + i18n (es-AR) + matriz de navegadores |
| 10 | Handoff de implementación (capas, qué NO hacer) |
| 11 | Validación de RNF-A (usabilidad >85%, matriz de navegadores, conteo de pasos ≤5) |

Regla de oro: **ningún color, espaciado, radio o sombra ad-hoc.** Si no está en este documento, no
existe. Si hace falta uno nuevo, se agrega acá primero.

---

## 1. Marca y lenguaje de diseño

### 1.1 Personalidad

Snack Overflow conecta vecinos de Misiones con oficios de confianza. La marca **no** es un dashboard
SaaS frío ni un marketplace genérico azul-violeta. Es **cercana, terrenal y confiable** — el equivalente
digital de la recomendación de un vecino, pero con la prolijidad de una plataforma seria.

El concepto rector es **"tierra colorada"**: el color del suelo misionero como ancla de identidad. Es
cálido, inconfundiblemente local, y semánticamente correcto para un producto de trabajo manual y
oficios. Sobre esa base cálida, un sistema neutro de tinta-pizarra aporta seriedad y legibilidad, y un
verde sobrio comunica disponibilidad y confianza verificada.

**Tono de voz:** directo, respetuoso, sin jerga técnica. Trata de "vos" (rioplatense) sin caer en
slang. "Buscá tu oficio", "Pedí un presupuesto", "Tu solicitud está en curso". Honesto en los errores:
nunca culpa al usuario.

### 1.2 Valores de marca → traducción visual

| Valor | Cómo se ve |
|-------|-----------|
| **Confianza** | Estados siempre visibles y nombrados, badges de verificación, jerarquía clara, sin patrones oscuros. Calificaciones y reseñas con peso visual. |
| **Localidad / calidez** | Paleta tierra colorada + verde monte. Fotografía y avatares reales. Lenguaje de barrio, no corporativo. |
| **Facilidad de contratación** | Camino de contratación lineal y siempre legible (un estado, un próximo paso). CTA primario inconfundible. Fricción mínima en formularios. |

### 1.3 Principios de diseño (vinculantes)

1. **Claridad antes que densidad.** Una acción primaria por pantalla. El usuario siempre sabe en qué
   estado está y cuál es el próximo paso. (Crítico en el flujo de contratación, UC07–UC09.)
2. **El estado es el producto.** La máquina de estados de la contratación es la columna vertebral de la
   UX. Cada estado tiene un color, un nombre y una acción asociada — nunca un estado mudo.
3. **Calidez con rigor.** Cálido en color y voz; riguroso en alineación, contraste y tipografía. La
   calidez no es excusa para la imprecisión.
4. **Móvil primero, pulgar primero.** El público busca y contrata desde el teléfono. Targets táctiles
   ≥44px, acciones primarias al alcance del pulgar.
5. **Confianza por transparencia.** Mostrar calificaciones, reseñas, estado de habilitación y el
   historial de estados. Nunca ocultar información que ayude a decidir. Los datos de contacto se
   revelan sólo cuando el flujo lo permite (UC04 RN-CAT-05).

---

## 2. Sistema de color

Paleta construida sobre tres ejes: **tierra colorada** (primary), **tinta pizarra** (neutral), y
**verde monte** (accent / confianza). Semánticos completos. Modos claro y oscuro.

### 2.1 Roles y tokens (modo claro)

| Rol | Token semántico | Hex | Uso |
|-----|-----------------|-----|-----|
| **Primary** | `--color-primary` | `#B8431F` | CTA principal, links activos, marca. Tierra colorada quemada. |
| Primary hover | `--color-primary-hover` | `#9A3417` | Estado hover/pressed del primary. |
| Primary subtle | `--color-primary-subtle` | `#FBEDE7` | Fondos suaves, chips seleccionados, hover de filas. |
| On primary | `--color-on-primary` | `#FFFFFF` | Texto sobre primary. |
| **Secondary** | `--color-secondary` | `#1F3A34` | Verde monte oscuro. Botones secundarios sólidos, headers de sección. |
| Secondary subtle | `--color-secondary-subtle` | `#E7F0EC` | Fondos de secciones secundarias. |
| On secondary | `--color-on-secondary` | `#FFFFFF` | Texto sobre secondary. |
| **Accent** | `--color-accent` | `#0E8C5A` | Verde confianza/disponibilidad. Badges "verificado", "disponible". |
| Accent subtle | `--color-accent-subtle` | `#E2F4EC` | Fondo de badges/áreas de éxito leve. |
| **Background** | `--color-background` | `#FBFAF7` | Fondo de página. Blanco cálido (no #FFF puro), evoca papel. |
| **Surface** | `--color-surface` | `#FFFFFF` | Cards, modales, inputs. |
| Surface raised | `--color-surface-raised` | `#FFFFFF` | Capas elevadas (popovers) — se distingue por sombra, no color. |
| Surface sunken | `--color-surface-sunken` | `#F2EFEA` | Fondos de zonas hundidas (code, skeleton base). |
| **Foreground** | `--color-foreground` | `#1C1917` | Texto principal. Casi-negro cálido (stone-900). |
| Muted foreground | `--color-muted-foreground` | `#5C5550` | Texto secundario, captions, placeholders. |
| **Border** | `--color-border` | `#E5E0D8` | Bordes de cards, separadores. |
| Border strong | `--color-border-strong` | `#CBC3B8` | Bordes de inputs, divisores con más peso. |
| **Ring** | `--color-ring` | `#B8431F` | Anillo de foco (= primary). |

### 2.2 Semánticos (estado del sistema)

| Rol | Token | Hex | Subtle (fondo) | On |
|-----|-------|-----|----------------|----|
| **Success** | `--color-success` | `#0E8C5A` | `--color-success-subtle` `#E2F4EC` | `#FFFFFF` |
| **Warning** | `--color-warning` | `#B7791F` | `--color-warning-subtle` `#FBF1DC` | `#1C1917` |
| **Error** | `--color-error` | `#C2331F` | `--color-error-subtle` `#FBE7E3` | `#FFFFFF` |
| **Info** | `--color-info` | `#1F5E8C` | `--color-info-subtle` `#E3EEF5` | `#FFFFFF` |

> Nota de diseño: `success` y `accent` comparten valor (verde monte) intencionalmente — "disponible"
> y "todo bien" son el mismo lenguaje visual. `error` (`#C2331F`) es un rojo distinto del primary
> (`#B8431F`, más anaranjado/marrón) para que un botón destructivo NUNCA se confunda con el CTA de
> marca. Verificar en pantalla durante implementación que la diferencia sea perceptible.

### 2.3 Colores de estado de contratación

La máquina de estados (UC07–UC09) tiene seis estados. Cada uno mapea a un token de badge. **Usar
SIEMPRE estos colores para estados de contratación** — no improvisar.

| Estado (enum) | Etiqueta UI (es) | Token de badge | Color base | Semántica visual |
|---------------|------------------|----------------|-----------|------------------|
| `SOLICITADA` | "Solicitada" | `--color-state-solicitada` | `#1F5E8C` (info) | Esperando respuesta del prestador. Neutro-informativo. |
| `PRESUPUESTADA` | "Presupuestada" | `--color-state-presupuestada` | `#B7791F` (warning) | Hay propuesta; requiere acción del cliente. Llama la atención. |
| `CONFIRMADA` | "Confirmada" | `--color-state-confirmada` | `#0E8C5A` (success) | Acordada, agendada. Positivo. |
| `EN_CURSO` | "En curso" | `--color-state-encurso` | `#B8431F` (primary) | Trabajo en ejecución. Activo, color de marca. |
| `FINALIZADA` | "Finalizada" | `--color-state-finalizada` | `#5C5550` (muted) | Terminal exitoso. Sobrio, "cerrado". |
| `CANCELADA` | "Cancelada" | `--color-state-cancelada` | `#C2331F` (error) | Terminal negativo. |

> **Importante (contrato real):** los estados `RECHAZADA` y `ACEPTADA` **NO existen** en el sistema.
> El rechazo del prestador (UC08) lleva la contratación a `CANCELADA`. La aceptación del cliente lleva
> de `PRESUPUESTADA` a `CONFIRMADA`. No crear badges para estados inexistentes.

Cada badge de estado usa fondo `*-subtle` + texto en el color base (o invertido para los oscuros). Los
estados terminales (`FINALIZADA`, `CANCELADA`) van en estilo "apagado" (menor saturación visual) para
comunicar que ya no hay acciones disponibles.

### 2.4 Modo oscuro

| Token | Light | Dark |
|-------|-------|------|
| `--color-background` | `#FBFAF7` | `#1A1715` |
| `--color-surface` | `#FFFFFF` | `#252019` |
| `--color-surface-sunken` | `#F2EFEA` | `#15110F` |
| `--color-foreground` | `#1C1917` | `#F5F1EA` |
| `--color-muted-foreground` | `#5C5550` | `#A89E94` |
| `--color-border` | `#E5E0D8` | `#3A332C` |
| `--color-border-strong` | `#CBC3B8` | `#4D4439` |
| `--color-primary` | `#B8431F` | `#E07A4F` (aclarado para contraste sobre fondo oscuro) |
| `--color-primary-hover` | `#9A3417` | `#EC9069` |
| `--color-primary-subtle` | `#FBEDE7` | `#3A241C` |
| `--color-accent` / `--color-success` | `#0E8C5A` | `#2BB57C` |
| `--color-warning` | `#B7791F` | `#E0A53A` |
| `--color-error` | `#C2331F` | `#E76A52` |
| `--color-info` | `#1F5E8C` | `#5BA0CE` |

Los `*-subtle` en oscuro se derivan oscureciendo (≈12–18% L sobre el fondo), no aclarando. Los estados
de contratación reusan los semánticos dark equivalentes.

### 2.5 Contraste (WCAG 2.1 AA)

Objetivo: **≥4.5:1** texto normal, **≥3:1** texto grande (≥24px o ≥19px bold) y componentes/bordes.

| Combinación | Ratio aprox. | Cumple |
|-------------|-------------|--------|
| `foreground #1C1917` sobre `background #FBFAF7` | ~15.8:1 | AAA |
| `muted-foreground #5C5550` sobre `surface #FFFFFF` | ~6.9:1 | AA |
| `on-primary #FFF` sobre `primary #B8431F` | ~4.7:1 | AA (texto normal) ✓ |
| `on-error #FFF` sobre `error #C2331F` | ~5.0:1 | AA ✓ |
| `warning #B7791F` sobre `warning-subtle #FBF1DC` | ~3.4:1 | AA grande / íconos ✓ (usar texto ≥bold o ≥19px) |
| `info #1F5E8C` sobre `info-subtle #E3EEF5` | ~5.6:1 | AA ✓ |
| `success #0E8C5A` sobre `success-subtle #E2F4EC` | ~3.6:1 | AA grande ✓; para texto normal usar `#0A6E47` |

> Regla operativa: el texto de los badges `*-subtle` debe ser el color base **oscurecido un paso** si
> no alcanza 4.5:1 en tamaño normal. Para `success`/`warning` sobre subtle, usar tono "deep"
> (`success-deep #0A6E47`, `warning-deep #92600F`) en texto pequeño. Definir estos dos como tokens
> auxiliares.

#### Contraste en modo oscuro (verificado)

El modo oscuro es un **tema de primera clase** (toggle `next-themes`, §2.6), por lo que WCAG 2.1 AA se
verifica con el **mismo rigor** que el modo claro. Cada rol semántico y cada badge de estado alcanza
**≥4.5:1** en texto normal y **≥3:1** en texto grande / componentes UI, usando los tokens dark de §2.4.

| Combinación (tokens dark) | Ratio aprox. | Cumple |
|---------------------------|-------------|--------|
| `foreground #F5F1EA` sobre `background #1A1715` | ~15.8:1 | AAA |
| `foreground #F5F1EA` sobre `surface #252019` | ~14.4:1 | AAA |
| `muted-foreground #A89E94` sobre `background #1A1715` | ~6.8:1 | AA |
| `muted-foreground #A89E94` sobre `surface #252019` | ~6.1:1 | AA |
| `primary #E07A4F` (link/texto) sobre `background #1A1715` | ~6.0:1 | AA ✓ |
| `primary #E07A4F` sobre `surface #252019` | ~5.4:1 | AA ✓ |
| `accent`/`success #2BB57C` sobre `surface #252019` | ~6.2:1 | AA ✓ |
| `warning #E0A53A` sobre `surface #252019` | ~7.4:1 | AA ✓ |
| `error #E76A52` sobre `surface #252019` | ~5.1:1 | AA ✓ |
| `info #5BA0CE` sobre `surface #252019` | ~5.7:1 | AA ✓ |
| Anillo de foco `ring #E07A4F` sobre `background #1A1715` | ~6.0:1 | AA (UI ≥3:1) ✓ |

**Badges de estado de contratación en oscuro** (texto = semántico dark sobre su `*-subtle` dark, que se
deriva oscureciendo ≈12–18% L sobre el fondo, §2.4):

| Badge | Par (texto sobre subtle dark) | Ratio aprox. | Cumple |
|-------|-------------------------------|-------------|--------|
| `Solicitada` (info) | `#5BA0CE` sobre `state-solicitada-subtle #13283A` | ~5.3:1 | AA ✓ |
| `Presupuestada` (warning) | `#E0A53A` sobre `state-presupuestada-subtle #33280E` | ~6.6:1 | AA ✓ |
| `Confirmada` (success) | `#2BB57C` sobre `state-confirmada-subtle #13352A` | ~5.1:1 | AA ✓ |
| `En curso` (primary) | `#E07A4F` sobre `state-encurso-subtle #3A241C` | ~4.9:1 | AA ✓ |
| `Finalizada` (muted) | `#A89E94` sobre `surface #252019` | ~6.1:1 | AA ✓ |
| `Cancelada` (error) | `#E76A52` sobre `state-cancelada-subtle #351A14` | ~5.0:1 | AA ✓ |

> **Corrección crítica de uso — botón primario en oscuro.** `on-primary #FFFFFF` sobre el `primary`
> aclarado de dark (`#E07A4F`) da solo **~3.0:1**, que **NO** cumple AA para texto. En modo oscuro el
> texto sobre `primary`/`primary-hover` debe ser **tinta oscura** (`--color-foreground` invertido
> `#1A1715` → ~6.0:1), no blanco. Por eso `--color-on-primary` se **redefine bajo `.dark`** a `#1A1715`
> (ver §2.6). El blanco sobre primary solo es válido en modo claro (4.7:1). Misma lógica aplica a
> `on-secondary` si el secondary se aclarara; con los valores actuales el secondary dark mantiene texto
> claro.
>
> Regla operativa dark: los `*-subtle` dark se derivan oscureciendo (no aclarando) hasta que el texto
> semántico sobre ellos alcance ≥4.5:1; los valores de la tabla son el piso. Verificar en pantalla con
> herramienta de contraste durante implementación, igual que en claro.

### 2.6 Definición canónica `@theme` (Tailwind v4)

> Esta es la **única** forma válida de declarar los tokens. Va en `app/globals.css`. Los nombres de
> token aquí son el contrato; los componentes los consumen vía utilidades Tailwind (`bg-primary`,
> `text-muted-foreground`, etc.).

```css
@import "tailwindcss";

@theme {
  /* ---- Color: superficies y texto ---- */
  --color-background: #FBFAF7;
  --color-surface: #FFFFFF;
  --color-surface-sunken: #F2EFEA;
  --color-foreground: #1C1917;
  --color-muted-foreground: #5C5550;
  --color-border: #E5E0D8;
  --color-border-strong: #CBC3B8;
  --color-ring: #B8431F;

  /* ---- Color: marca ---- */
  --color-primary: #B8431F;
  --color-primary-hover: #9A3417;
  --color-primary-subtle: #FBEDE7;
  --color-on-primary: #FFFFFF;
  --color-secondary: #1F3A34;
  --color-secondary-subtle: #E7F0EC;
  --color-on-secondary: #FFFFFF;
  --color-accent: #0E8C5A;
  --color-accent-subtle: #E2F4EC;

  /* ---- Color: semánticos ---- */
  --color-success: #0E8C5A;
  --color-success-deep: #0A6E47;
  --color-success-subtle: #E2F4EC;
  --color-warning: #B7791F;
  --color-warning-deep: #92600F;
  --color-warning-subtle: #FBF1DC;
  --color-error: #C2331F;
  --color-error-subtle: #FBE7E3;
  --color-info: #1F5E8C;
  --color-info-subtle: #E3EEF5;

  /* ---- Color: estados de contratación (UC07-09) ---- */
  --color-state-solicitada: #1F5E8C;
  --color-state-presupuestada: #B7791F;
  --color-state-confirmada: #0E8C5A;
  --color-state-encurso: #B8431F;
  --color-state-finalizada: #5C5550;
  --color-state-cancelada: #C2331F;

  /* ---- Tipografía ---- */
  --font-display: "Fraunces", "Georgia", serif;
  --font-sans: "Figtree", "system-ui", sans-serif;
  --font-mono: "IBM Plex Mono", "ui-monospace", monospace;

  /* ---- Radios ---- */
  --radius-sm: 0.25rem;   /*  4px  */
  --radius-md: 0.5rem;    /*  8px  */
  --radius-lg: 0.75rem;   /* 12px  */
  --radius-xl: 1rem;      /* 16px  */
  --radius-full: 9999px;

  /* ---- Sombras ---- */
  --shadow-xs: 0 1px 2px 0 rgb(28 25 23 / 0.05);
  --shadow-sm: 0 1px 3px 0 rgb(28 25 23 / 0.08), 0 1px 2px -1px rgb(28 25 23 / 0.08);
  --shadow-md: 0 4px 12px -2px rgb(28 25 23 / 0.10), 0 2px 6px -2px rgb(28 25 23 / 0.06);
  --shadow-lg: 0 12px 28px -6px rgb(28 25 23 / 0.14), 0 4px 10px -4px rgb(28 25 23 / 0.08);
}

/* Modo oscuro: overrides bajo .dark (estrategia class — next-themes) */
.dark {
  --color-background: #1A1715;
  --color-surface: #252019;
  --color-surface-sunken: #15110F;
  --color-foreground: #F5F1EA;
  --color-muted-foreground: #A89E94;
  --color-border: #3A332C;
  --color-border-strong: #4D4439;
  --color-primary: #E07A4F;
  --color-primary-hover: #EC9069;
  --color-primary-subtle: #3A241C;
  /* on-primary se invierte en dark: blanco sobre primary aclarado da solo ~3:1 (falla AA).
     Tinta oscura sobre #E07A4F da ~6:1. Ver §2.5 "Corrección crítica de uso". */
  --color-on-primary: #1A1715;
  --color-accent: #2BB57C;
  --color-success: #2BB57C;
  --color-success-deep: #2BB57C;   /* en dark el "deep" no oscurece: el texto va sobre subtle oscuro */
  --color-warning: #E0A53A;
  --color-warning-deep: #E0A53A;
  --color-error: #E76A52;
  --color-info: #5BA0CE;
  /* estados de contratación dark: subtle derivado oscureciendo el semántico sobre el fondo */
  --color-state-solicitada-subtle: #13283A;
  --color-state-presupuestada-subtle: #33280E;
  --color-state-confirmada-subtle: #13352A;
  --color-state-encurso-subtle: #3A241C;
  --color-state-cancelada-subtle: #351A14;
  /* el texto de cada badge usa el semántico dark equivalente; ratios verificados en §2.5 */
}
```

> Estrategia de tema: **class-based** (`.dark`), no `prefers-color-scheme` solo, para permitir toggle
> manual. Usar `next-themes`. El `globals.css` actual del repo usa `@theme inline` con Geist/Arial —
> debe reemplazarse por esta definición.

---

## 3. Tipografía

### 3.1 Familias (Google Fonts — vía `next/font/google`)

| Rol | Familia | Por qué |
|-----|---------|--------|
| **Display / Headings** | **Fraunces** | Serif "óptica" con carácter, cálida y editorial. Da personalidad local-artesanal sin perder seriedad. Evita el look genérico de sans neutras. |
| **Body / UI** | **Figtree** | Sans humanista, redondeada, muy legible en tamaños chicos y en español. Cálida pero neutra para datos. |
| **Mono** | **IBM Plex Mono** | Para IDs, montos en tablas, código de error. Sólo donde aporta. |

> Prohibido Inter, Roboto, Arial, system-ui como fuente de marca. Geist (default del scaffold) se
> reemplaza. Cargar Fraunces con `axes` óptico si se usa variable font, pesos 400/500/600.

### 3.2 Escala tipográfica (mobile-first, base 16px = 1rem)

| Token | Tamaño | Line-height | Peso | Familia | Uso |
|-------|--------|-------------|------|---------|-----|
| `display` | 2.5rem (40px) / 3rem desktop | 1.1 | 600 | Fraunces | Hero / landing. |
| `h1` | 2rem (32px) | 1.15 | 600 | Fraunces | Título de página. |
| `h2` | 1.5rem (24px) | 1.2 | 600 | Fraunces | Sección. |
| `h3` | 1.25rem (20px) | 1.3 | 600 | Fraunces | Subsección, título de card. |
| `body-lg` | 1.125rem (18px) | 1.6 | 400 | Figtree | Texto introductorio. |
| `body` | 1rem (16px) | 1.6 | 400 | Figtree | Texto base. **Nunca <16px en inputs (evita zoom iOS).** |
| `body-sm` | 0.875rem (14px) | 1.5 | 400 | Figtree | Texto secundario, metadatos de card. |
| `label` | 0.875rem (14px) | 1.4 | 500 | Figtree | Etiquetas de formulario, botones. |
| `caption` | 0.75rem (12px) | 1.4 | 500 | Figtree | Badges, timestamps, ayudas. |
| `mono-sm` | 0.875rem | 1.5 | 400 | IBM Plex Mono | IDs, montos en contexto técnico. |

Reglas: máximo ~70 caracteres por línea en bloques de texto (`max-w-prose`). Headings en Fraunces con
`letter-spacing: -0.01em`. Body en Figtree con tracking normal. Números de precio/calificación pueden
usar `font-variant-numeric: tabular-nums` para alineación en listas.

---

## 4. Espaciado, radios, sombras, grilla, breakpoints

### 4.1 Escala de espaciado (base 4px — la de Tailwind)

Usar la escala nativa de Tailwind (`1`=4px, `2`=8px, `3`=12px, `4`=16px, `6`=24px, `8`=32px,
`12`=48px, `16`=64px). **No usar valores arbitrarios** (`p-[13px]` prohibido salvo excepción
documentada). Ritmo vertical de secciones: `24/32/48px`. Padding interno de cards: `16–24px`.

### 4.2 Radios

| Token | Valor | Uso |
|-------|-------|-----|
| `rounded-sm` (4px) | inputs pequeños, chips | |
| `rounded-md` (8px) | botones, inputs, badges | Default de la mayoría de controles. |
| `rounded-lg` (12px) | cards, modales | |
| `rounded-xl` (16px) | contenedores hero, sheets | |
| `rounded-full` | avatares, badges de estado pill, botón ícono | |

Estética: radios medios (8–12px). Ni cuadrado-brutalista ni excesivamente redondeado. Coherente con
la calidez sobria de la marca.

### 4.3 Sombras

Sombras suaves y cálidas (tinte stone, no negro puro): `shadow-xs/sm/md/lg` definidas en `@theme`.
Cards en reposo: `shadow-sm`. Hover de card clickeable: `shadow-md` + leve `transl-y`. Modales:
`shadow-lg`. Evitar sombras duras y oscuras (rompen la calidez). En dark mode, reducir opacidad y
preferir bordes + elevación por superficie.

### 4.4 Grilla de layout

- **Contenedor máximo de contenido:** `max-w-6xl` (~1152px) centrado, con `px-4` (mobile) → `px-6`
  (tablet) → `px-8` (desktop).
- **Búsqueda + resultados (UC04):** layout de 12 columnas en desktop → sidebar de filtros (3–4 cols) +
  resultados (8–9 cols). En mobile los filtros colapsan a un sheet/drawer.
- **Grilla de cards de prestador:** 1 col (mobile) → 2 (tablet) → 3 (desktop ≥1024px).
- **Gutter:** `gap-4` (mobile) → `gap-6` (desktop).

### 4.5 Breakpoints (mobile-first)

| Nombre | Min-width | Notas |
|--------|-----------|-------|
| (base) | 0 | Mobile. Diseño primario. |
| `sm` | 640px | Teléfono grande / portrait tablet. |
| `md` | 768px | Tablet. Aparece sidebar de filtros. |
| `lg` | 1024px | Desktop. Grilla de 3 columnas, nav horizontal completa. |
| `xl` | 1280px | Desktop amplio. |

---

## 5. Patrones de componentes

> Descripciones de comportamiento y apariencia. La implementación usa **shadcn/ui** como capa de
> primitivas (Button, Input, Dialog, etc.) re-themed con los tokens de §2–4. No reimplementar
> primitivas desde cero.

### 5.1 Botones

**Variantes:**

| Variante | Apariencia | Uso |
|----------|-----------|-----|
| `primary` | Fondo `primary`, texto `on-primary`. | Acción principal. **Una por pantalla.** "Buscar", "Pedir presupuesto", "Aceptar propuesta". |
| `secondary` | Fondo `secondary` (verde monte) o borde + texto secondary. | Acción secundaria de igual peso. |
| `outline` | Borde `border-strong`, texto `foreground`, fondo transparente. | Acciones neutras. "Cancelar", "Volver". |
| `ghost` | Sin borde, hover `surface-sunken`. | Acciones terciarias, íconos en toolbar. |
| `destructive` | Fondo `error`, texto blanco. | "Cancelar contratación", "Rechazar". Siempre con confirmación. |
| `link` | Texto `primary` subrayado al hover. | Navegación inline. |

**Tamaños:** `sm` (h-36px), `md` (h-40px, default), `lg` (h-48px, CTAs móviles). **Altura mínima táctil
44px en mobile** → en mobile el `md` sube a 44px.

**Estados (todos obligatorios):** default, hover, active/pressed, focus-visible (anillo `ring` 2px +
offset 2px), disabled (opacidad 50% + `cursor-not-allowed`, sin hover), loading (spinner + texto, ancho
estable, `aria-busy`). Botón nunca cambia de tamaño entre estados.

### 5.2 Inputs y formularios + validación

**Anatomía de campo:** `Label` (arriba, `label` token, obligatorio visible) → `Input/Select/Textarea`
→ `HelpText` (caption, gris) o `ErrorText` (caption, color `error`). Campos obligatorios marcados con
asterisco + `aria-required`.

**Estados de input:**

| Estado | Apariencia |
|--------|-----------|
| Default | Borde `border-strong`, fondo `surface`. |
| Focus | Borde `primary` + anillo `ring`. |
| Error | Borde `error`, ícono de alerta, `ErrorText` visible, `aria-invalid="true"`, `aria-describedby` → id del error. |
| Disabled | Fondo `surface-sunken`, texto `muted-foreground`. |
| Success (opcional) | Borde `success` + check, sólo cuando aporta (ej. e-mail disponible). |

**Contrato de errores de validación (422) — mapeo a UI:**

El backend (NestJS + class-validator) devuelve **422** con cuerpo:
```json
{ "statusCode": 422, "message": ["campo regla", "..."], "error": "Unprocessable Entity" }
```
`message` es un **array de strings, uno por regla fallida**. La capa de presentación debe:
1. Parsear cada string para extraer el **nombre del campo** (primer token) y mapearlo al input
   correspondiente, mostrando el mensaje bajo ese campo (no un alert global).
2. Si un mensaje no se puede asociar a un campo, mostrarlo en un **resumen de errores** arriba del form
   (`role="alert"`), con foco movido al resumen.
3. Mostrar mensajes en **español**, traducidos desde el catálogo de mensajes (no el string crudo del
   backend, que viene en inglés de class-validator). Mantener un diccionario campo→mensaje-es.

**Mapeo de otros códigos HTTP a UX:**

| Código | Flujo | UX |
|--------|-------|-----|
| 422 | Registro (UC01 ESC-04/05), solicitud (UC07), propuesta (UC08) | Errores por campo, inline. |
| 409 | E-mail duplicado (UC01 ESC-06); franja ya tomada (UC07) | Error inline en el campo relevante (e-mail / franja) + sugerencia. No destruir lo cargado. |
| 401 | Credenciales inválidas (UC02 ESC-03) | Mensaje **genérico** ("E-mail o contraseña incorrectos") — nunca decir cuál. Banner sobre el form. |
| 423 | Cuenta bloqueada (UC02 ESC-04) | Banner: "Cuenta bloqueada temporalmente. Probá de nuevo en ~30 min." Deshabilitar submit. |
| 403 | Cuenta suspendida (UC02 ESC-05); prestador no habilitado | Banner con motivo + canal de soporte. |
| 404 | Prestador no encontrado (UC07) | Toast + volver a resultados. |
| 410/400 | Token de recuperación vencido (UC02 ESC-07) | Pantalla con CTA "Solicitar nuevo enlace". |

**Validación cliente:** validar formato en `onBlur` y antes de enviar (e-mail con @, contraseña ≥8
chars UC01 PA-01, teléfono AR). La validación cliente **complementa** pero no reemplaza la del servidor.

### 5.3 Cards

| Tipo | Contenido | Notas |
|------|-----------|-------|
| **Card resumen de prestador** (UC04 resultados) | Avatar, nombre, oficio(s) como chips, ⭐ calificación promedio + (N reseñas), badge de disponibilidad, zona de cobertura, badge "Verificado" si habilitado. Toda la card es clickeable → perfil. | `shadow-sm`, hover `shadow-md` + `-translate-y-0.5`. Borde `border`. |
| **Card de contratación** (panel de seguimiento) | Servicio/prestador o cliente, fecha/franja, **badge de estado** prominente, precio (si presupuestada+), próximo paso/acción. | El badge de estado es el elemento de mayor jerarquía. |
| **Perfil de prestador** (UC04 ESC-06) | Header con avatar grande, nombre, oficios, calificación, zona; secciones: servicios publicados (con descripción + rango de precio), reseñas. Datos de contacto **ocultos** hasta contratación aceptada (RN-CAT-05). | Layout de 2 columnas en desktop. |

### 5.4 Barra de búsqueda + filtros (UC04)

- **Barra principal:** dos campos obligatorios — **Oficio** (combobox con las 7 categorías RF-2.1) +
  **Ubicación** (texto de localidad) — y botón `primary` "Buscar". En mobile, full-width apilado; en
  desktop, inline. Validación: ambos requeridos (UC04 ESC-07) → error inline si falta alguno.
- **Filtros adicionales (UC04 ESC-08):** calificación mínima (slider/estrellas), disponibilidad
  (fecha), categoría. En desktop: sidebar persistente. En mobile: botón "Filtros" → drawer/sheet con
  los filtros aplicados como chips removibles.
- **Ordenamiento (UC04 ESC-02/03/04):** selector segmentado o dropdown — "Calificación" (default
  RN-CAT-03), "Distancia", "Disponibilidad". Estado activo claramente marcado.
- **Chips de filtro activo:** removibles (×), arriba de los resultados. CTA "Limpiar filtros".
- **Limpiar filtros (reset de la vista):** una sola afordancia `ghost` junto a los chips.
  **"Limpiar filtros"** quita *todos* los filtros adicionales (calificación, disponibilidad,
  categoría) y los chips activos, dejando solo Oficio + Ubicación, y vuelve a página 1. (Se eliminó el
  botón separado "Restablecer": como no hay control de `pageSize` y `orden` ausente cae al default
  "Calificación", producía el mismo resultado observable que "Limpiar" — duplicado confuso.) Reset no
  destruye datos: solo afecta la vista de búsqueda; no requiere confirmación.

### 5.5 Rating / estrellas

- 5 estrellas, soporta medias (relleno parcial). Color `warning` (ámbar) para estrellas llenas, `border`
  para vacías. Acompañar SIEMPRE del número (`4,8`) y la cantidad de reseñas (`(124)`) — el número es la
  fuente de verdad accesible. Formato decimal con **coma** (es-AR).
- Variantes: `display` (solo lectura, en cards/perfil) y `input` (selección, en formulario de reseña —
  fuera de estos UCs pero el patrón queda definido). El input debe ser navegable por teclado y tener
  `aria-label` por estrella.

### 5.6 Badges

| Familia | Uso | Estilo |
|---------|-----|--------|
| **Estado de contratación** | `Solicitada / Presupuestada / Confirmada / En curso / Finalizada / Cancelada` | Pill, fondo `*-subtle`, texto color base (deep si hace falta contraste), `caption` peso 600. Ver §2.3. Incluir punto de color o ícono para no depender sólo del color. |
| **Verificación / habilitación** | "Verificado", "Pendiente de habilitación" (UC01 RN-REG-05) | Verde `accent` con ícono check / ámbar `warning` con reloj. |
| **Categoría/oficio** | Electricista, Plomero, etc. | Neutro `surface-sunken` + texto `foreground`. Chips. |
| **Disponibilidad** (UC04 PA-02) | "Disponible esta semana", "Próxima: 15/06" | `accent-subtle` / `warning-subtle` según urgencia. |

**No depender del color solo** (WCAG 1.4.1): todo badge de estado lleva además texto y, donde aplica,
un ícono o punto. El color refuerza, no comunica en exclusiva.

### 5.7 Navegación por rol

La barra de navegación cambia según el rol del JWT (`cliente | prestador | administrador`). Pública
(sin sesión) para UC01/UC04.

| Contexto | Nav (desktop = top bar; mobile = bottom tab bar / drawer) |
|----------|-----------------------------------------------------------|
| **Público / sin sesión** | Logo · Buscar · [Ingresar] [Registrarse]. (UC04 y UC01 son públicos.) |
| **Cliente** | Buscar · Mis contrataciones · Mensajes · Avatar(menú: perfil, salir). |
| **Prestador** | Bandeja (solicitudes) · Mis servicios · Agenda · Mensajes · Avatar. Si `pendiente_habilitacion`: banner global persistente + acceso restringido (acciones de prestador deshabilitadas con tooltip). |
| **Administrador** | Moderación · Habilitaciones · Usuarios · Métricas · Avatar. Estética más "panel" (densa). |

Patrón mobile: **bottom tab bar** (3–5 destinos máx, targets ≥44px) para Cliente y Prestador; drawer
para destinos secundarios. Admin puede usar drawer lateral. Indicador de destino activo claro (color
`primary` + label).

### 5.8 Modales / Dialogs

shadcn `Dialog`. Overlay `rgb(28 25 23 / 0.5)`. Card `surface`, `rounded-lg`, `shadow-lg`, `max-w-md`.
Foco atrapado dentro (focus trap), `Esc` cierra, click en overlay cierra (salvo confirmaciones
destructivas). Título `h3`, `aria-labelledby`. Acción primaria a la derecha. **Confirmaciones
destructivas** (cancelar contratación, rechazar) usan AlertDialog con botón `destructive` y resumen de
la consecuencia. En mobile, los modales largos se vuelven **sheet** (bottom drawer).

### 5.9 Toasts / notificaciones

Esquina inferior (mobile) / superior-derecha (desktop). Tipos: success, error, info, warning (colores
semánticos, `*-subtle` + ícono). Auto-dismiss 4–6s (errores: persistentes con cierre manual).
`role="status"` (polite) para info/success, `role="alert"` (assertive) para error. Usados para
confirmaciones de transición de estado (UC09 Observer: "Tu solicitud fue presupuestada", "Contratación
confirmada"). Máximo apilado: 3.

### 5.10 Paginación (UC04 PA-05)

Resultados de búsqueda paginados a **20 por página** (asumido en spec). Patrón: paginación numérica en
desktop (Anterior · 1 2 3 … · Siguiente) o "Cargar más" / scroll infinito en mobile. Mostrar total de
resultados ("32 prestadores"). El control de página es navegable por teclado, página actual con
`aria-current="page"`.

### 5.11 Avatares

`rounded-full`. Tamaños: `xs`(24) `sm`(32) `md`(40) `lg`(64, perfil). Fallback: iniciales sobre fondo
derivado determinísticamente del nombre (paleta de tierras/verdes, nunca colores semánticos). Imagen con
`object-cover` y `alt` con el nombre. Badge de verificación superpuesto (esquina) si el prestador está
habilitado.

### 5.12 Ayuda al usuario (help facilities)

La ayuda al usuario es uno de los **4 design issues** de accesibilidad que la cátedra exige resolver
*desde el diseño* (Pressman: tiempo de respuesta, ayuda, manejo de errores, etiquetado de comandos).
No es una sección de soporte aparte: es un conjunto de afordancias **embebidas y contextuales** que
sostienen el principio "reconocer > recordar" (Mandel A.2) y el RNF-A.1 (usable sin capacitación).

| Mecanismo | Patrón | Dónde aparece |
|-----------|--------|---------------|
| **Tooltip contextual** | Ícono `?` (`HelpCircle` de lucide) junto a etiquetas no obvias. Hover/focus muestra `Tooltip` shadcn; en mobile, tap. Texto `caption`, breve, sin jerga. Tiene `aria-describedby` enlazado al control. **Nunca** es la única fuente de una instrucción crítica. | Campos ambiguos: "Franja" (UC07), "Calificación mínima" (filtros UC04), "Oficio regulado / matrícula" (UC01 RN-REG-05), acción deshabilitada del prestador pendiente (§5.7). |
| **Ayuda inline (HelpText)** | Línea `caption` gris bajo el campo (anatomía §5.2), siempre visible, no oculta tras hover. Explica formato o expectativa. | Forms: contraseña ("mínimo 8 caracteres"), teléfono ("formato AR, con o sin +54"), e-mail, fecha (">= hoy"), precio (">0"). |
| **Guía de estado / próximo paso** | Cada card de contratación declara en texto qué significa el estado y qué sigue — ya presente como "Próximo paso: …" (§7.7). Formaliza la ayuda como parte del badge de estado: el estado **explica**, no solo etiqueta. | Panel de seguimiento (UC09), bandeja del prestador (UC08). Atado a la máquina `SOLICITADA→PRESUPUESTADA→CONFIRMADA→EN_CURSO→FINALIZADA/CANCELADA`: cada estado dice su acción esperada. |
| **Onboarding / empty-state guía** | El empty state (§6) cumple doble función: ayuda de primer uso. Título + descripción + CTA que enseña qué hacer la primera vez ("Todavía no tenés solicitudes. Cuando un cliente te contacte, vas a verlo acá."). Para el primer login de un rol, el empty state es la pantalla de aprendizaje. | Bandeja vacía (prestador), "Mis contrataciones" vacío (cliente), resultados antes de la primera búsqueda. |
| **Punto de acceso a Ayuda / FAQ** | Entrada persistente "Ayuda" en el menú del avatar (todos los roles) y en el footer público → página de FAQ/ayuda buscable. El canal de soporte de los errores 403 (§5.2) apunta acá: se formaliza como **destino único de ayuda**, no un mailto suelto. | Menú de usuario (§5.7), footer, banners 403/423. |

**Reglas de la ayuda:**
- La ayuda **complementa**, nunca sustituye un diseño claro: si un campo necesita un párrafo de ayuda
  para entenderse, primero se simplifica el campo.
- Accesible: tooltips operables por teclado (focus, no solo hover), con `role="tooltip"` y vínculo
  `aria-describedby`; no comunican información crítica solo por hover (WCAG 1.4.13).
- Consistente con la voz de marca (§1.1): cálida, directa, sin jerga, trato de "vos".
- La ayuda contextual prioriza los puntos de mayor fricción medidos en la validación (§11): si una
  tarea cae por debajo del umbral del RNF-A.1, se agrega/ajusta ayuda en ese punto.

### 5.13 Atajos de teclado y access keys (mnemónicos)

Para **reducir la carga de memoria** (Mandel A.2) y mejorar la eficiencia del usuario frecuente
(Tognazzini), las acciones primarias tienen atajos **mnemónicos** — la tecla evoca la acción, no es
arbitraria. Los atajos son un **acelerador opcional**: nunca son la única forma de ejecutar una acción
(toda acción sigue siendo operable con Tab/Enter, §8).

| Atajo | Acción | Contexto | Mnemónico |
|-------|--------|----------|-----------|
| `/` | Foco a la barra de búsqueda | Búsqueda (UC04), global con sesión | convención web de "buscar" |
| `Alt+B` | Ejecutar **B**uscar | Barra de búsqueda con criterios cargados | **B**uscar |
| `Alt+P` | **P**edir presupuesto | Perfil de prestador (UC07) | **P**edir |
| `Alt+E` | **E**nviar (solicitud / propuesta / formulario) | Forms con foco dentro (UC07, UC08) | **E**nviar |
| `Alt+A` | **A**ceptar propuesta | Panel de seguimiento, estado `PRESUPUESTADA` (UC09) | **A**ceptar |
| `Alt+F` | Abrir/cerrar **F**iltros | Resultados de búsqueda (UC04) | **F**iltros |
| `Esc` | Cerrar modal / drawer / tooltip; cancelar edición de filtro | Global | escape |
| `g` luego `c` | Ir a "Mis **c**ontrataciones" | Con sesión (cliente) | **g**o → **c** |
| `g` luego `b` | Ir a **B**andeja (solicitudes) | Con sesión (prestador) | **g**o → **b** |
| `?` | Abrir panel de atajos / ayuda (§5.12) | Global | convención "?" = ayuda |

**Reglas:**
- Usar `Alt+<letra>` como access keys (`accesskey` HTML o handler) para no chocar con atajos del
  navegador/lector de pantalla; los `g` + tecla son secuencias estilo "goto" sin modificador.
- El atajo se **muestra** en el tooltip del control (§5.12) y en el panel `?`, para que sea descubrible
  (reconocer > recordar): el usuario no tiene que memorizarlo, lo ve.
- Respetar el contexto: un atajo de acción solo dispara si su acción está disponible y visible (ej.
  `Alt+A` no hace nada si el estado no es `PRESUPUESTADA`).
- No interceptar teclas mientras el foco está en un campo de texto, salvo `/` y `Esc` con la semántica
  esperada. Suspender atajos globales dentro de inputs.
- Accesibilidad: los access keys no sustituyen el orden de tabulación lógico (§8); son aceleradores.

### 5.14 Reversibilidad y deshacer (undo)

Mandel A.1 ("usuario en control") exige que las acciones sean **reversibles** siempre que el dominio lo
permita — no basta con *advertir*. La política se define por tipo de acción contra la máquina de estados
real (`SOLICITADA→PRESUPUESTADA→CONFIRMADA→EN_CURSO→FINALIZADA/CANCELADA`):

| Acción | Reversible | Patrón |
|--------|-----------|--------|
| **Editar filtros / vista de búsqueda** | Sí | "Limpiar filtros" (§5.4). Reversible directo, sin confirmación. |
| **Quitar un chip de filtro** | Sí | El chip se puede volver a aplicar; opcional toast con "Deshacer" (re-agrega el filtro). |
| **Cancelar contratación / Rechazar solicitud (→ `CANCELADA`)** | No (transición terminal del dominio) | **Confirm-reversible de dos tiempos:** (1) `AlertDialog` (§5.8) que resume la consecuencia con lenguaje claro ("Vas a cancelar la contratación con *Nombre* del 15/06. Esta acción no se puede deshacer."), botón `destructive`, foco por defecto en "Volver"; (2) tras confirmar, **grace-period**: toast persistente "Contratación cancelada · **Deshacer**" durante ~6–8s; el botón Deshacer revierte al estado previo y la transición a `CANCELADA` recién se **commitea** al expirar la ventana. Solo si el dominio no admite ventana de gracia (commit inmediato) se degrada a confirmación pura — y se **declara el trade-off** de irreversibilidad con su justificación. |
| **Enviar propuesta (`SOLICITADA→PRESUPUESTADA`)** | Reversible vía corrección | No es destructiva, pero permitir "Editar propuesta" mientras siga `PRESUPUESTADA` (re-enviar corrige precio/fecha). Equivale a un undo funcional. |
| **Aceptar propuesta (`PRESUPUESTADA→CONFIRMADA`)** | Confirmar antes de comprometer | `AlertDialog` con resumen (precio, fecha, prestador) antes de confirmar; el botón primario es "Confirmar contratación", no un click suelto. |

**Reglas:**
- Preferir **deshacer (grace-period)** sobre confirmación cuando el dominio lo permita: menos fricción,
  más control real (Tognazzini). La confirmación sola es el último recurso, no el patrón por defecto.
- El "Deshacer" del toast es operable por teclado y anunciado con `role="status"` (§5.9).
- Para acciones genuinamente irreversibles por regla de negocio, la UI **declara** la irreversibilidad
  en el `AlertDialog` (no la esconde) y pone el foco inicial en la opción segura ("Volver").
- Nunca un patrón oscuro: el botón seguro no se disfraza ni se entierra; la consecuencia se enuncia
  honestamente (§1.1, "nunca culpa al usuario").

---

## 6. Patrones de estado

| Estado | Patrón |
|--------|--------|
| **Loading (skeletons)** | Skeletons que reflejan el layout final (cards de prestador, filas). Fondo `surface-sunken` con shimmer sutil. No spinners full-page salvo navegación inicial. `aria-busy="true"` en el contenedor. |
| **Empty state (sin datos aún)** | Ilustración/ícono cálido + título + descripción + CTA. Ej. bandeja del prestador vacía: "Todavía no tenés solicitudes. Cuando un cliente te contacte, vas a verlo acá." |
| **No-results (UC04 ESC-05)** | "No encontramos prestadores para *[oficio]* en *[ubicación]*." + sugerencias accionables: cambiar oficio, ampliar ubicación, quitar filtros (botones). **No es un error** — tono neutro/útil. El form de búsqueda permanece visible y editable (el CDU se reanuda en ingreso de criterios). |
| **Error state (fallo de carga/red)** | Mensaje honesto + botón "Reintentar". Para errores de servidor (5xx): "Algo salió mal de nuestro lado." Nunca culpar al usuario. Distinguir de no-results. |
| **Form submitting** | Botón en estado loading, campos en `aria-disabled`, sin doble-submit. |
| **Partial / stale** | Si hay datos viejos durante refetch, mostrarlos atenuados con indicador de actualización en vez de skeleton (evita parpadeo). |

---

## 7. Blueprints de pantallas clave (low-fi)

> Wireframes textuales. Layout y jerarquía, no estilo final. Mobile-first; se indica el cambio en
> desktop donde aplica.

### 7.1 Registro (UC01)

```
┌─────────────────────────────────────┐
│  ◀ Snack Overflow            (logo)  │
├─────────────────────────────────────┤
│  Creá tu cuenta            (h1)      │
│  ¿Ya tenés cuenta? Ingresá (link)    │
│                                      │
│  ┌── Rol (RN-REG-01, no editable) ──┐│
│  │ ( ) Cliente    ( ) Prestador     ││  ← selector segmentado, obligatorio
│  └──────────────────────────────────┘│
│  Nombre*        [____________]       │
│  Apellido*      [____________]       │
│  E-mail*        [____________]       │  ← 409 dup → error inline acá
│  Teléfono*      [____________]       │  ← formato AR
│  Contraseña*    [__________] 👁       │  ← ≥8 chars, medidor de fuerza
│                                      │
│  · si Rol=Prestador ↓ (condicional) │
│  Oficio*        [▼ catálogo      ]   │
│  · si oficio regulado: aviso ────────│
│    "Tu cuenta quedará pendiente de   │  ← warning-subtle (RN-REG-05)
│     habilitación hasta acreditar tu  │
│     matrícula."                      │
│                                      │
│  [        Crear cuenta        ]      │  ← primary, full-width, lg
│  Al registrarte aceptás… (caption)   │
└─────────────────────────────────────┘
```
Desktop: card centrada `max-w-md`. Errores 422 inline por campo. 201 → toast éxito + redirect (login o
home según estado).

### 7.2 Login + recuperación (UC02)

```
┌─────────────────────────────────────┐
│           Snack Overflow             │
│   Ingresá a tu cuenta       (h1)     │
│                                      │
│  [banner error genérico si 401/423]  │  ← role=alert, mensaje genérico
│  E-mail*        [____________]       │
│  Contraseña*    [__________] 👁       │
│              ¿Olvidaste tu clave?    │  ← link → flujo recuperación
│  [          Ingresar          ]      │  ← primary lg
│  ─────────── o ───────────           │
│  ¿No tenés cuenta? Registrate (link) │
└─────────────────────────────────────┘

Recuperación (paso 1 — pedir enlace):
  E-mail* [______]  [Enviar enlace]
  → SIEMPRE muestra "Si el e-mail existe, te enviamos un enlace"
    (UC02 ESC-08: no revela existencia)

Recuperación (paso 2 — nueva clave, vía token):
  Nueva contraseña* / Repetir*  [Guardar]
  token vencido (ESC-07) → pantalla "Enlace expirado" + [Pedir nuevo enlace]
```

### 7.3 Búsqueda + resultados (UC04)

```
MOBILE                              DESKTOP (lg)
┌───────────────────────┐          ┌───────────────────────────────────────────┐
│ nav pública / cliente │          │ Logo  Buscar      [Ingresar][Registrarse]  │
├───────────────────────┤          ├───────────────────────────────────────────┤
│ Oficio  [▼          ] │          │ [Oficio ▼][Ubicación______][Buscar]  Orden▼ │
│ Ubicación [________]  │          ├──────────────┬──────────────────────────────┤
│ [     Buscar      ]   │          │ FILTROS      │  32 prestadores · Orden: ⭐  │
│ [Filtros] Orden: ⭐ ▼ │          │ Calif. mín   │ ┌──────┐┌──────┐┌──────┐     │
├───────────────────────┤          │  ★★★★☆       │ │ card ││ card ││ card │     │
│ chips filtro activo × │          │ Disponib.    │ └──────┘└──────┘└──────┘     │
│ ┌───────────────────┐ │          │  [fecha]     │ ┌──────┐┌──────┐┌──────┐     │
│ │ [av] Nombre       │ │          │ Categoría    │ │ card ││ card ││ card │     │
│ │ Electricista ⭐4,8 │ │          │  ☐ ...       │ └──────┘└──────┘└──────┘     │
│ │ (124) · Posadas   │ │          │ [Limpiar]    │  ◀ 1 2 3 … ▶                 │
│ │ ✓Verif · Disp.    │ │          └──────────────┴──────────────────────────────┘
│ └───────────────────┘ │
│ ◀ 1 2 3 ▶ / Cargar +  │   Sin resultados → ver §6 (ESC-05): mensaje útil + sugerencias, form visible.
└───────────────────────┘
```

### 7.4 Perfil de prestador (UC04 ESC-06)

```
┌───────────────────────────────────────────────┐
│ ◀ Volver a resultados                          │
├───────────────────────────────────────────────┤
│  [avatar lg]  Nombre Apellido      ✓ Verificado │
│               Electricista · Gasista            │
│               ⭐ 4,8 (124 reseñas) · Posadas     │
│               [   Pedir presupuesto   ]  (UC07) │  ← primary; CTA al flujo de contratación
├───────────────────────┬───────────────────────┤
│ SERVICIOS PUBLICADOS   │ RESEÑAS                │
│ ┌───────────────────┐  │ ⭐⭐⭐⭐⭐ "..." — Juan   │
│ │ Instalación …      │  │ ⭐⭐⭐⭐☆ "..." — Ana    │
│ │ desc + $ rango     │  │ …                      │
│ └───────────────────┘  │                        │
│ Zona de cobertura: …   │                        │
│ ⚠ Contacto visible al  │                        │  ← RN-CAT-05: tel/email ocultos
│   confirmar contrat.   │                        │     hasta contratación aceptada
└───────────────────────┴───────────────────────┘
```

### 7.5 Solicitar contratación (UC07)

```
┌─────────────────────────────────────┐
│  Pedir presupuesto a Nombre          │
│  Electricista · ⭐4,8                 │
├─────────────────────────────────────┤
│  Ubicación*    [_______________]     │  ← texto libre, no vacío
│  Fecha*        [📅 dd/mm/aaaa  ]     │  ← ≥ hoy (422 si pasada)
│  Franja*       [▼ 08:00–09:00  ]     │  ← franjas disponibles; 409 si tomada
│  Describí el   [                ]     │
│  problema*     [                ]     │  ← textarea, no vacío
│                                      │
│  [        Enviar solicitud      ]    │  ← primary
│  (resumen: a quién, cuándo)          │
└─────────────────────────────────────┘
Éxito (201) → estado SOLICITADA. Redirect a panel de seguimiento + toast.
Errores: 422 inline por campo · 409 franja → error en Franja + "Elegí otro horario" · 404 → toast.
```

### 7.6 Bandeja del prestador (UC08 — propuesta / rechazo)

```
┌─────────────────────────────────────┐
│  Bandeja · Solicitudes               │
│  [Solicitadas •2][En curso][Histor.] │  ← tabs por estado
├─────────────────────────────────────┤
│ ┌─ Card solicitud (SOLICITADA) ────┐ │
│ │ [av] Cliente · Posadas           │ │
│ │ "Se cortó la luz en…" (desc)     │ │
│ │ Pedido: 15/06 · 08:00–09:00      │ │
│ │ 🔵 Solicitada                    │ │  ← badge estado
│ │ [ Enviar propuesta ] [Rechazar]  │ │  ← primary + destructive(ghost)
│ └──────────────────────────────────┘ │
└─────────────────────────────────────┘

"Enviar propuesta" → modal/sheet:
   Fecha propuesta*  [📅] (≥hoy)
   Franja propuesta* [____] (no vacío)
   Precio estimado*  [$ ___] (>0; 422 si ≤0)
   [Enviar propuesta]  → estado PRESUPUESTADA (200)

"Rechazar" → AlertDialog confirmación (sin motivo; spec no lo pide)
   → estado CANCELADA (200). Confirm + grace-period "Deshacer" (§5.14):
     el commit a CANCELADA recién al expirar la ventana ~6–8s.
```

### 7.7 Panel de seguimiento de estados (UC09)

```
┌─────────────────────────────────────────────────┐
│  Mis contrataciones        [Todas ▼ filtro estado]│
├─────────────────────────────────────────────────┤
│ ┌── Card contratación ─────────────────────────┐ │
│ │ Electricista · Nombre        🟡 Presupuestada │ │  ← badge prominente
│ │ 15/06 · 08:00–09:00 · $ 12.000 (propuesta)    │ │
│ │ Próximo paso: revisá la propuesta             │ │
│ │ [ Aceptar ] [ Rechazar ]   (cliente, UC21)    │ │  ← acción depende del estado
│ └───────────────────────────────────────────────┘ │
│ ┌──────────────────────────────────────────────┐ │
│ │ Plomero · Nombre              🔴 En curso      │ │
│ │ Línea de tiempo (historial de estados) ▾       │ │  ← Solicitada→Presup.→Confirmada→En curso
│ └──────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────┘

Timeline de estados (expandible): muestra StateChangeHistory ordenado por timestamp,
cada transición con su badge de color y fecha/hora (es-AR). Estados terminales
(Finalizada/Cancelada) sin acciones, estilo apagado. Notificaciones de cambio (Observer
UC09) llegan como toast in-app.
```

---

## 8. Línea base de accesibilidad (WCAG 2.1 AA)

- **Contraste:** texto ≥4.5:1, texto grande/UI ≥3:1. Verificado en §2.5 para **ambos temas** (claro y
  oscuro, con sus tablas de ratios). Estados nunca comunicados **solo** por color (1.4.1) — siempre +
  texto/ícono. Badges de estado incluyen etiqueta textual.
- **Foco:** `focus-visible` siempre visible — anillo `ring` 2px + offset 2px sobre todo control
  interactivo. Nunca `outline: none` sin reemplazo. Orden de tabulación lógico (DOM = orden visual).
- **Teclado:** toda acción operable por teclado. Modales con focus-trap y `Esc`. Dropdowns/combobox
  navegables con flechas (shadcn lo provee). Skip-link "Saltar al contenido" al inicio del `body`.
  Atajos mnemónicos / access keys para acciones primarias (§5.13) — aceleradores opcionales, no
  reemplazan la navegación por Tab.
- **ARIA:** landmarks (`header`, `nav`, `main`, `footer`); forms con `label`/`for`, errores con
  `aria-invalid` + `aria-describedby`; resúmenes de error con `role="alert"`; toasts con
  `role="status"`/`alert`; estado de carga con `aria-busy`; página activa de paginación con
  `aria-current="page"`.
- **Targets táctiles:** ≥44×44px en mobile (2.5.5 AAA, lo adoptamos como baseline). Espaciado entre
  targets ≥8px.
- **Movimiento:** respetar `prefers-reduced-motion` — desactivar transiciones no esenciales,
  shimmer de skeleton y animaciones de entrada.
- **Texto:** escalable hasta 200% sin pérdida de contenido; inputs ≥16px (evita zoom iOS). Idioma del
  documento `lang="es-AR"`.
- **Imágenes:** `alt` significativo (avatares = nombre; decorativas = `alt=""`).

---

## 9. Responsive + contenido / i18n (es-AR)

- **Mobile-first:** estilos base = mobile; ampliar con `sm/md/lg/xl`. Filtros → drawer en mobile; nav
  → bottom tab bar. CTAs full-width en mobile, auto en desktop.
- **Matriz de navegadores (RNF-A.2):** Chrome/Chromium, Firefox y Safari en sus **últimas 2 versiones**,
  en **desktop y móvil** (Android + iOS), con **0 errores críticos** de compatibilidad. Detalle y
  criterio de verificación en §11.2.
- **Idioma:** español rioplatense, registro neutro-formal con "vos" ("Buscá", "Pedí", "Ingresá"). Sin
  slang. Microcopy honesto y breve. Consistencia de términos: "prestador", "contratación",
  "presupuesto", "solicitud" — usar SIEMPRE los mismos. Catálogo de strings centralizado (preparar
  para i18n aunque haya un solo idioma).
- **Etiquetas de estado:** siempre en minúscula con mayúscula inicial en UI: "Solicitada",
  "Presupuestada", "Confirmada", "En curso", "Finalizada", "Cancelada". Nunca exponer el enum
  (`EN_CURSO`) ni términos muertos (`RECHAZADA`, `ACEPTADA`).
- **Fechas:** formato `dd/mm/aaaa` y `dd 'de' MMMM` para legible. Hora 24h (`08:00–09:00`). Zona
  horaria America/Argentina/Buenos_Aires (UTC-3). Usar `Intl.DateTimeFormat('es-AR')`.
- **Moneda:** peso argentino, `Intl.NumberFormat('es-AR', { style:'currency', currency:'ARS' })` →
  `$ 12.000` (punto miles, coma decimal). Calificaciones con coma: `4,8`.
- **Teléfonos:** formato AR; validación tolerante (acepta con/sin +54, espacios, guiones).
- **Vacíos/largos:** diseñar para nombres largos (truncado con `title`), oficios múltiples (wrap de
  chips), descripciones largas (clamp + "ver más").

---

## 10. Handoff de implementación

### 10.1 Capas (de tokens a pantallas)

```
1. Design tokens        → app/globals.css  (@theme de §2.6 — ÚNICA fuente de tokens)
2. Primitivas (shadcn)  → components/ui/*   (Button, Input, Dialog, Badge… re-themed con tokens)
3. Componentes compuestos → components/*    (PrestadorCard, EstadoBadge, SearchBar, RatingStars,
                                              ContratacionCard, RoleNav…) — combinan primitivas
4. Features por dominio → components/<dominio>/ o co-located por ruta (cuentas, catalogo, contratacion)
5. Pantallas / rutas    → app/**            (App Router; Server Components por defecto, Client sólo
                                              donde hay interactividad)
```

- **EstadoBadge** es un componente compuesto único que recibe el enum de estado y renderiza
  color + etiqueta es + ícono. Centraliza el mapeo de §2.3 — ningún otro lugar decide el color de un
  estado.
- Mensajes de error (mapa campo→texto-es, códigos HTTP→UX) viven en un módulo central de i18n/errores,
  consumido por todos los forms. El parseo del 422 (§5.2) se hace una sola vez en la capa de API.
- Iconografía: una sola librería (sugerido **lucide-react**, ya alineado con shadcn). No mezclar sets.

### 10.2 Qué NO hacer

- ❌ **Colores ad-hoc.** Nada de `bg-[#ff0000]`, `text-red-500`, hex inline. Sólo tokens (`bg-primary`,
  `text-error`, `bg-state-presupuestada`). Si falta un color, se agrega a `@theme` primero.
- ❌ **Estilos inline** (`style={{}}`) salvo valores genuinamente dinámicos (ej. ancho de barra de
  progreso calculado).
- ❌ **Espaciados/radios arbitrarios** (`p-[13px]`, `rounded-[7px]`) sin justificación documentada.
- ❌ **Reimplementar primitivas** que shadcn ya provee (botón, input, dialog, toast…).
- ❌ **Más de un CTA primario** por pantalla.
- ❌ **Comunicar estado sólo por color** (siempre + texto/ícono).
- ❌ **Exponer enums crudos o estados muertos** (`EN_CURSO`, `RECHAZADA`, `ACEPTADA`) en la UI.
- ❌ **`outline: none`** sin un foco visible de reemplazo.
- ❌ Fuentes genéricas (Inter/Roboto/Arial/Geist) como fuente de marca — usar Fraunces + Figtree.
- ❌ Strings de UI hardcodeados sin pasar por el catálogo de copy.

### 10.3 Dependencias a incorporar (cuando se implemente — no ahora)

`shadcn/ui` (primitivas), `next-themes` (toggle dark), `lucide-react` (íconos), `next/font/google`
(Fraunces, Figtree, IBM Plex Mono). Validación de forms: alinear con lo que se elija (react-hook-form +
zod recomendado, pero fuera del alcance de este baseline).

---

## 11. Validación de RNF-A

Los RNF-A del TPI son obligatorios y **exigen evidencia medible**, no solo un diseño "consistente con"
ellos (Pressman, validación de interfaz pp.242-243/255: medir tareas, errores, recuperación, tiempo).
Esta sección define el aparato de validación que convierte las aserciones de diseño en evidencia
auditable.

### 11.1 RNF-A.1 — Usable sin capacitación (>85% al primer intento)

**Métrica:** porcentaje de participantes que **completan la tarea sin ayuda externa al primer intento**.
Umbral de aprobación: **>85%** por tarea.

**Plan de test de usabilidad (moderado o no moderado):**
- **Participantes:** 5–8 por rol relevante (cliente, prestador), sin exposición previa al producto
  (proxy de "sin capacitación").
- **Tareas evaluadas** (mapeadas a los UCs núcleo):
  1. **Registro** (UC01): crear una cuenta de cliente y una de prestador con oficio regulado.
  2. **Búsqueda** (UC04): encontrar un prestador de un oficio en una localidad y abrir su perfil.
  3. **Contratación** (UC07→UC09): pedir un presupuesto, y como cliente aceptar la propuesta hasta
     `CONFIRMADA`.
- **Métricas observables por tarea** (Pressman): tasa de éxito al 1er intento (criterio del >85%),
  número de errores, capacidad de **recuperación** del error (volver al camino sin asistencia), y
  tiempo a completar (referencial, no umbral).
- **Criterio de éxito de la tarea:** llegar al estado/objetivo esperado (cuenta creada / perfil abierto
  / contratación `SOLICITADA` y luego `CONFIRMADA`) sin intervención del moderador.
- **Iteración:** toda tarea por debajo del 85% dispara una corrección de diseño focalizada (típicamente
  ayuda contextual §5.12, microcopy §9, o jerarquía §1.3) y un re-test de esa tarea.

### 11.2 RNF-A.2 — Compatibilidad de navegadores y dispositivos

Matriz objetivo soportada, con criterio de **0 errores críticos de compatibilidad** (layout roto,
acción bloqueada o pérdida de datos):

| Navegador | Versiones | Desktop | Móvil |
|-----------|-----------|---------|-------|
| **Chrome** (y Chromium: Edge) | últimas 2 estables | ✓ | ✓ (Android) |
| **Firefox** | últimas 2 estables | ✓ | ✓ (Android) |
| **Safari** | últimas 2 estables | ✓ (macOS) | ✓ (iOS) |

- El stack (Next.js 16 / React 19 / Tailwind v4) ya cubre estos motores; esta matriz lo **declara** como
  objetivo de QA, no lo asume.
- Señales de diseño ya tomadas para Safari iOS: inputs ≥16px para evitar zoom automático (§3.2),
  targets táctiles ≥44px (§8).
- Verificación: smoke test de los 3 flujos núcleo (11.1) en cada combinación navegador×dispositivo de
  la matriz antes de cada entrega.

### 11.3 RNF-A.3 — Flujo búsqueda → confirmar contratación en ≤5 pasos

Conteo explícito del camino del cliente, contando cada **acción/pantalla deliberada** del usuario (las
respuestas del prestador son esperas, no pasos del cliente):

| # | Paso (acción del usuario) | Pantalla / blueprint |
|---|---------------------------|----------------------|
| 1 | Cargar Oficio + Ubicación y **Buscar** | Búsqueda (§7.3, UC04) |
| 2 | Abrir el **perfil** del prestador desde resultados | Perfil (§7.4) |
| 3 | **Pedir presupuesto** y enviar la solicitud | Solicitar contratación (§7.5, UC07) → `SOLICITADA` |
| — | *(espera: el prestador envía propuesta → `PRESUPUESTADA`, UC08)* | — (no cuenta como paso del cliente) |
| 4 | Revisar la propuesta y **Aceptar** | Panel de seguimiento (§7.7, UC09) → `CONFIRMADA` |

**Total: 4 pasos del usuario** (búsqueda → confirmación), **≤5 ✓**. El paso 2 es opcional si la card de
resultados ofrece "Pedir presupuesto" directo (quedaría en 3). La espera por la propuesta del prestador
es asíncrona y no computa como paso de interacción del cliente.

---

*Fin del baseline. Cambios a este documento requieren acuerdo del equipo — es la fuente única de verdad
de diseño. Trazabilidad: UC01 (registro), UC02 (login/recuperación), UC04 (búsqueda/perfil), UC07–UC09
(contratación y estados).*
