# Spec — MI-01.3 UI Registro (UC01)

**Trazabilidad:** UC01 Registrarse · RF-1.1 (registro con rol cliente/prestador) · RF-1.3 (prestador con oficio regulado requiere habilitación) · RNF-A.1 (>85% completitud al 1er intento) · RNF-A.2 (Chrome/Firefox/Safari últimas 2 versiones desktop+móvil) · RNF-A.3 (≤5 pasos contratación).

---

## Propósito

Esta UI implementa el formulario de registro de UC01 en el cliente Next.js (`client/`). Permite que un visitante sin sesión cree una cuenta como **cliente** o **prestador** consumiendo el endpoint ya construido `POST /auth/register`. El alcance es exclusivamente frontend: validación cliente, presentación del formulario, manejo de respuestas del backend (201, 409, 422, 400) y redirección post-registro. La lógica de negocio, persistencia y reglas de validación del servidor están fuera de alcance de esta especificación.

---

## Requisitos

### REQ-01 — Selector de rol obligatorio e inmutable

El formulario presenta un selector segmentado con exactamente dos opciones: **Cliente** y **Prestador** (valores de backend: `cliente` | `prestador`). El campo `role` es obligatorio y debe estar seleccionado para habilitar el envío. Una vez que el formulario se envía con éxito (201), el rol ya no es editable en ninguna pantalla de este flujo. **No** se expone la opción `administrador` (RN-REG-01).

### REQ-02 — Campos del formulario y validación cliente

Los siguientes campos se presentan siempre (independientemente del rol):

| Campo UI | Campo backend | Obligatorio | Validación cliente |
|---|---|---|---|
| Nombre | `name` | Sí | No vacío, ≤100 caracteres |
| Apellido | `lastName` | Sí | No vacío, ≤100 caracteres |
| E-mail | `email` | Sí | Formato de e-mail válido (debe incluir `@`), ≤255 caracteres |
| Teléfono | `phone` | Sí | No vacío, formato AR tolerante (acepta con/sin `+54`, espacios, guiones), ≤30 caracteres |
| Contraseña | `password` | Sí | Mínimo 8 caracteres (PA-01), máximo 128 caracteres |

La validación cliente se ejecuta en `onBlur` por campo y antes del envío. Complementa —nunca reemplaza— la validación del servidor (RN-REG-03). Cada campo incluye una etiqueta `HelpText` siempre visible (no oculta en hover) que indica el formato esperado: contraseña ("mínimo 8 caracteres"), teléfono ("formato AR, con o sin +54"), e-mail.

### REQ-03 — Campo oficio condicional para prestador

Cuando el visitante selecciona el rol **Prestador**, el campo `trade` (Oficio) se muestra de forma condicional. Este campo es:

- Obligatorio para el rol prestador; su ausencia impide el envío del formulario (UI previene antes de llegar al servidor).
- Implementado como un selector (`<select>` o combobox) con el catálogo de oficios fijo (según seeds de BD, PA-02).
- Oculto/no presente cuando el rol es **Cliente** (el campo no se envía al backend).

El campo `trade` no existe en el payload cuando `role === 'cliente'`.

### REQ-04 — Aviso de habilitación pendiente para oficio regulado

Cuando el visitante selecciona un oficio catalogado como regulado, la UI muestra de forma inmediata (sin esperar el envío) un aviso inline con fondo `warning-subtle` e ícono de reloj:

> "Si tu oficio requiere matrícula, tu cuenta quedará pendiente de habilitación hasta que la acredites."

Este aviso cumple con RN-REG-05 y la guía de ayuda contextual (DESIGN-SYSTEM §5.12). El aviso aparece debajo del selector de oficio, antes del botón de envío. No bloquea el envío del formulario.

### REQ-05 — Medidor de fuerza de contraseña

El campo `password` incluye un medidor de fuerza visual (progress bar o indicador de nivel: débil / media / fuerte) que se actualiza en tiempo real conforme el visitante escribe. El medidor es informativo y no bloquea el envío siempre que se cumplan los 8 caracteres mínimos. Incluye un toggle de visibilidad (icono ojo) para mostrar/ocultar el valor.

### REQ-06 — Mapeo de respuesta 201 a UX (éxito)

Ante una respuesta HTTP 201 del backend:

- **Si `providerStatus === null` o `providerStatus === 'habilitado'`** (cliente o prestador con oficio no regulado): mostrar un toast de éxito ("¡Tu cuenta fue creada! Ya podés ingresar.") y redirigir al flujo de login (UC02) o home público.
- **Si `providerStatus === 'pendiente_habilitacion'`** (prestador con oficio regulado, ESC-03): mostrar un mensaje en pantalla (no solo toast) con fondo `warning-subtle` que indique el estado pendiente y el siguiente paso para acreditar matrícula. El mensaje puede reproducir el campo `message` del backend traducido al español. Luego redirigir al login.

En ambos casos el formulario queda bloqueado tras el éxito (no se puede reenviar).

### REQ-07 — Mapeo de respuesta 422 a errores inline por campo

Ante HTTP 422, el cuerpo contiene `{ statusCode: 422, message: string[], error: "Unprocessable Entity" }`. La capa de presentación:

1. Parsea cada string del array `message` para extraer el campo al que corresponde y lo mapea al input del formulario correspondiente.
2. Muestra el mensaje de error traducido al español bajo el campo afectado, con borde `error`, ícono de alerta, `aria-invalid="true"` y `aria-describedby` apuntando al id del mensaje de error (DESIGN-SYSTEM §5.2).
3. Si un mensaje no puede asociarse a ningún campo, se muestra en un resumen de errores encima del formulario con `role="alert"` y el foco se mueve al resumen.
4. El formulario retiene todos los valores ya ingresados (no se limpia).

Satisface ESC-04 (datos incompletos) y ESC-05 (formato inválido).

### REQ-08 — Mapeo de respuesta 409 a error inline en campo email

Ante HTTP 409 (email duplicado, RN-REG-02), la UI:

1. Muestra el error exclusivamente bajo el campo `email` ("Este e-mail ya está registrado. ¿Querés ingresar en su lugar?"), con un link al flujo de login.
2. No destruye el resto del formulario: todos los demás campos conservan sus valores.
3. No revela datos de la cuenta existente (no exponer ningún detalle adicional).

Satisface ESC-06 (correo duplicado).

### REQ-09 — Estado de envío y prevención de doble submit

Durante el envío (`fetch` en curso), el botón "Crear cuenta" entra en estado `loading` (spinner + texto, ancho estable, `aria-busy="true"`). Los campos quedan en `aria-disabled`. Una vez iniciado el envío no puede dispararse una segunda solicitud hasta recibir respuesta. Satisface el patrón `Form submitting` de DESIGN-SYSTEM §6.

### REQ-10 — Accesibilidad WCAG 2.1 AA

El formulario cumple los requisitos de DESIGN-SYSTEM §8:

- Todos los campos tienen `<label>` visible con `for` asociado y `aria-required="true"`.
- Campos con error: `aria-invalid="true"` + `aria-describedby` al id del error.
- Resumen de errores globales: `role="alert"` (assertive).
- Toasts: `role="status"` (polite) para éxito; `role="alert"` para error.
- Foco visible (`focus-visible`) sobre todo control interactivo; anillo `ring` 2px + offset 2px.
- Orden de tabulación lógico (DOM = orden visual).
- Targets táctiles ≥44×44px en mobile.
- Inputs con `font-size ≥ 16px` para evitar zoom iOS (Safari).
- Contraste de texto ≥4.5:1 en modos claro y oscuro según tokens de DESIGN-SYSTEM §2.5.
- El selector de rol y el selector de oficio son navegables por teclado.
- El atributo `lang="es-AR"` está presente en el documento raíz.

### REQ-11 — Compatibilidad de navegadores (RNF-A.2)

El formulario funciona sin errores críticos (layout roto, acción bloqueada, pérdida de datos) en Chrome, Firefox y Safari en sus últimas 2 versiones estables, en desktop y móvil (Android + iOS).

### REQ-12 — Flujo ≤5 pasos (RNF-A.3)

El formulario de registro es una pantalla única (1 paso de interacción del usuario). No introduce pasos adicionales ni wizards que excedan el presupuesto de ≤5 pasos del flujo completo de contratación.

---

## Escenarios

### ESC-UI-01 — Registro exitoso como cliente (201 → toast + redirect)

**Satisface:** UC01 ESC-01, RN-REG-06, REQ-01, REQ-06

```
Dado   un visitante que accede a la pantalla de registro
Cuando selecciona rol "Cliente",
       completa nombre, apellido, e-mail, teléfono y contraseña (≥8 chars)
       con formato válido
       y hace clic en "Crear cuenta"
Entonces
  - el botón entra en estado loading (spinner, `aria-busy="true"`)
  - el backend responde 201 con `providerStatus: null`
  - se muestra un toast de éxito con `role="status"` ("Tu cuenta fue creada exitosamente.")
  - la UI redirige al flujo de login (UC02)
  - el formulario queda bloqueado (no reenvío posible)
```

### ESC-UI-02 — Registro exitoso como prestador con oficio regulado (201 + pendiente_habilitacion)

**Satisface:** UC01 ESC-03, RN-REG-05, REQ-03, REQ-04, REQ-06

```
Dado   un visitante que accede a la pantalla de registro
Cuando selecciona rol "Prestador",
       elige un oficio catalogado como regulado (ej. "Gasista")
Entonces
  - el campo "Oficio" se vuelve visible al seleccionar rol Prestador
  - aparece inmediatamente un aviso inline con fondo `warning-subtle` e ícono de reloj
    indicando habilitación pendiente hasta acreditar matrícula

Cuando completa todos los campos obligatorios incluido `trade`
       y hace clic en "Crear cuenta"
Entonces
  - el backend responde 201 con `providerStatus: "pendiente_habilitacion"`
  - la UI muestra un mensaje destacado en pantalla (fondo `warning-subtle`) que comunica
    el estado pendiente y el próximo paso (acreditar matrícula)
  - la UI redirige al login después de mostrar el mensaje
```

### ESC-UI-03 — Validación cliente previa al submit: contraseña corta y e-mail malformado

**Satisface:** UC01 ESC-05, RN-REG-03, PA-01, REQ-02, REQ-07

```
Dado   un visitante completando el formulario de registro
Cuando ingresa una contraseña de menos de 8 caracteres
       y sale del campo (onBlur)
Entonces
  - el campo `password` muestra borde `error`, ícono de alerta y ErrorText
    "La contraseña debe tener al menos 8 caracteres."
  - el campo tiene `aria-invalid="true"` y `aria-describedby` al id del error

Cuando ingresa una dirección de e-mail sin "@" (ej. "usuariodominio.com")
       y sale del campo (onBlur)
Entonces
  - el campo `email` muestra borde `error` y ErrorText
    "Ingresá un e-mail válido (ej. nombre@dominio.com)."

Cuando intenta enviar el formulario con alguno de estos errores presentes
Entonces
  - el submit es bloqueado en el cliente (no se realiza ninguna solicitud HTTP)
  - el foco se mueve al primer campo con error
```

### ESC-UI-04 — Respuesta 422 mapeada a errores inline por campo

**Satisface:** UC01 ESC-04, ESC-05, RN-REG-03, REQ-07

```
Dado   un visitante que completa el formulario con datos que superan la validación cliente
       pero son rechazados por el servidor (ej. `name` con más de 100 chars,
       o `phone` con formato inválido no detectado en cliente)
Cuando el backend responde HTTP 422 con
       { "statusCode": 422, "message": ["name debe tener máximo 100 caracteres", ...], "error": "Unprocessable Entity" }
Entonces
  - la UI parsea el array `message` y mapea cada item al campo correspondiente
  - bajo cada campo afectado aparece ErrorText en español (no el string crudo del backend)
    con borde `error`, `aria-invalid="true"` y `aria-describedby` al id del error
  - si algún mensaje no puede mapearse a un campo, aparece en un resumen con `role="alert"`
    encima del formulario y el foco se mueve al resumen
  - todos los valores previamente ingresados en los campos NO afectados se conservan
  - el botón de envío vuelve al estado default (no loading)
```

### ESC-UI-05 — Respuesta 409: e-mail duplicado con datos conservados

**Satisface:** UC01 ESC-06, ESC-07, RN-REG-02, REQ-08

```
Dado   un visitante que completa el formulario con un e-mail ya registrado en el sistema
Cuando hace clic en "Crear cuenta"
       y el backend responde HTTP 409
       { "statusCode": 409, "message": "An account with this email already exists.", "error": "Conflict" }
Entonces
  - el campo `email` muestra borde `error` y ErrorText en español:
    "Este e-mail ya está registrado. ¿Querés ingresar?" con un link al flujo de login
  - el campo `email` tiene `aria-invalid="true"` y `aria-describedby` al id del error
  - NO se muestra ningún dato de la cuenta existente (RN-REG-02)
  - todos los demás campos del formulario conservan sus valores (nombre, apellido, teléfono,
    contraseña, rol, oficio si aplica)
  - el visitante puede corregir el e-mail y volver a enviar, o navegar al login

Dado   el mismo escenario anterior
Cuando el visitante decide no continuar y cierra la pantalla
Entonces
  - no se crea ninguna cuenta (postcondición de falla de UC01 ESC-07)
  - no se persiste ningún dato parcial (comportamiento del backend ya garantizado)
```

### ESC-UI-06 — Prestador sin oficio: la UI previene el envío

**Satisface:** UC01 RN-REG-03, REQ-03

```
Dado   un visitante que selecciona rol "Prestador"
       y no selecciona ningún oficio en el campo `trade` (visible y obligatorio)
Cuando intenta hacer clic en "Crear cuenta"
Entonces
  - el submit es bloqueado en el cliente (no se realiza ninguna solicitud HTTP)
  - el campo `trade` muestra borde `error` y ErrorText "Seleccioná tu oficio."
  - el campo tiene `aria-invalid="true"` y `aria-describedby` al id del error
  - el foco se mueve al campo `trade`
```

---

## Fuera de alcance

- **Login / inicio de sesión (UC02):** cubierto por MI-02.x.
- **Recuperación de contraseña (UC02 RF-1.6):** fuera de este work item.
- **Verificación de matrícula (UC18):** la UI solo dispara la necesidad (REQ-04, REQ-06); el flujo de acreditación es otro caso de uso.
- **Gestión de perfil (UC03):** edición de datos post-registro.
- **Suspensión/baja de cuenta (UC14):** moderación de usuarios.
- **Verificación de e-mail previa a activación:** explícitamente fuera de alcance (PA-03).
- **Rate limiting en frontend:** no requerido en esta iteración (PA-04).
- **Rol `administrador`:** no expuesto en el selector de la UI (REQ-01).
