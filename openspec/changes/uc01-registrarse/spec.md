# UC01 — Registrarse (Spec)

## Propósito

Permite que un **visitante** (usuario sin sesión) cree una cuenta en la plataforma eligiendo el rol **Cliente** o **Prestador**. Es el único caso de uso junto con UC04 (Buscar prestadores) que no requiere sesión iniciada (UC02). Los datos personales recolectados son los mínimos necesarios (nombre, apellido, e-mail, teléfono, contraseña y rol). Si el rol es Prestador con oficio regulado, la cuenta nace en estado `pendiente_habilitacion` y delega en UC18 la verificación de matrícula.

## Requisitos

### Trazabilidad funcional

| Código | Prioridad | Descripción normativa |
|--------|-----------|-----------------------|
| RF-1.1 | Obligatorio | El sistema *deberá* permitir el registro de usuarios con dos roles diferenciados: cliente y prestador. |
| RF-1.3 | Obligatorio | El prestador *deberá* cargar y acreditar su matrícula profesional cuando el oficio lo requiera. |

### Trazabilidad no funcional

| Código | Descripción normativa | Impacto en UC01 |
|--------|----------------------|-----------------|
| RNF-S.1 | Mínimo privilegio | La cuenta nueva se crea con permisos mínimos según rol; no se almacenan datos sensibles innecesarios. |
| RNF-S.3 | Validación de identidad y matrícula | Prestador con oficio regulado nace en estado `pendiente_habilitacion`. |
| RNF-S.4 | Ley 25.326 datos personales | El e-mail se considera dato personal; la contraseña se almacena con hash Argon2id; no se registran datos sensibles en logs. |

### Reglas de negocio

| ID | Regla |
|----|-------|
| RN-REG-01 | Un visitante puede registrarse únicamente con los roles `cliente` o `prestador`. El rol es obligatorio y **no se puede modificar** tras la creación de la cuenta. |
| RN-REG-02 | El e-mail debe ser único en el sistema. Si ya existe una cuenta con el mismo e-mail, el registro se rechaza con HTTP 409 sin revelar datos de la cuenta existente. |
| RN-REG-03 | Son campos obligatorios: nombre, apellido, e-mail, teléfono, contraseña y rol. Todos deben cumplir el formato definido o el sistema rechaza con HTTP 422 indicando los campos a corregir. |
| RN-REG-04 | La contraseña se almacena con hash **Argon2id** (mismo criterio que RN-AUTH-08). |
| RN-REG-05 | Un Prestador con oficio regulado se crea en estado `pendiente_habilitacion` y **no puede acceder** a funcionalidades de prestador hasta que UC18 acredite su matrícula. |
| RN-REG-06 | Un Cliente o Prestador con oficio no regulado se crea en estado `activo` de forma inmediata y queda operativo según su rol. |

## Escenarios (Given-When-Then)

### ESC-01: Registro exitoso como Cliente

- **Dado** un visitante que accede al formulario de registro
- **Cuando** selecciona rol Cliente, completa todos los campos obligatorios con formato válido y confirma
- **Entonces** el sistema crea la cuenta en estado `activo`, persiste los datos con hash Argon2id, el usuario queda operativo como Cliente, y retorna HTTP 201 con confirmación

### ESC-02: Registro exitoso como Prestador (oficio no regulado)

- **Dado** un visitante que accede al formulario de registro
- **Cuando** selecciona rol Prestador, declara un oficio no regulado, completa los campos obligatorios y confirma
- **Entonces** el sistema crea la cuenta en estado `activo`, persiste los datos, el usuario queda operativo como Prestador, y retorna HTTP 201

### ESC-03: Registro como Prestador con oficio regulado (pendiente habilitación)

- **Dado** un visitante que accede al formulario de registro
- **Cuando** selecciona rol Prestador, declara un oficio regulado, completa los campos obligatorios y confirma
- **Entonces** el sistema crea la cuenta en estado `pendiente_habilitacion`, persiste los datos, informa que debe acreditar su matrícula (UC18), retorna HTTP 201 con estado pendiente; el usuario **no** queda operativo como Prestador

### ESC-04: Datos incompletos

- **Dado** un visitante completando el formulario de registro
- **Cuando** omite uno o más campos obligatorios y confirma
- **Entonces** el sistema identifica los campos faltantes, responde HTTP 422 con la lista de campos a corregir, y **no** crea ninguna cuenta

### ESC-05: Formato de datos inválido

- **Dado** un visitante completando el formulario de registro
- **Cuando** ingresa datos con formato incorrecto (e-mail sin arroba, contraseña < 8 caracteres, teléfono inválido) y confirma
- **Entonces** el sistema identifica los campos con error de formato, responde HTTP 422 con la lista de campos a corregir, y **no** crea ninguna cuenta

### ESC-06: Correo electrónico ya registrado

- **Dado** un visitante completando el formulario de registro
- **Cuando** ingresa un e-mail que ya pertenece a una cuenta existente y confirma
- **Entonces** el sistema responde HTTP 409 indicando que el e-mail ya está registrado (sin revelar datos de la cuenta existente), y **no** crea ninguna cuenta; el visitante puede corregir el e-mail o desistir

### ESC-07: Desistimiento tras correo duplicado

- **Dado** un visitante que recibe un error de e-mail duplicado (ESC-06)
- **Cuando** decide no continuar con el registro y cierra/cancela el formulario
- **Entonces** el sistema no crea ninguna cuenta; no se persiste ningún dato parcial; la operación finaliza sin efecto

## Fuera de alcance

- **Autenticación / inicio de sesión** — cubierto por UC02.
- **Recuperación de contraseña** — cubierto por UC02 (RF-1.6).
- **Verificación de matrícula del Prestador** — cubierto por UC18; UC01 solo dispara la necesidad.
- **Modificación de datos del perfil** — no existe UC en el documento fuente.
- **Suspensión / baja de cuenta** — cubierto por UC14 (Moderar usuario).
- **Verificación de e-mail** — no requerida por el documento fuente; se asume fuera de alcance.

## Preguntas abiertas / supuestos

| ID | Pregunta | Resolución (default) |
|----|----------|---------------------|
| PA-01 | ¿Longitud mínima de contraseña? | ✅ **8 caracteres** (resuelto HITL). |
| PA-02 | ¿El listado de oficios regulados es fijo o configurable? | ✅ **Fijo en seeds de BD** (resuelto HITL). |
| PA-03 | ¿Se requiere verificar el e-mail antes de activar la cuenta? | ✅ **No — registro inmediato** salvo oficio regulado (resuelto HITL). |
| PA-04 | ¿Rate limiting por IP para registro? | ✅ **No en esta iteración** (resuelto HITL). |
