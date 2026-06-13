# UC02 — Autenticarse (Spec)

## Propósito

Permite que un usuario registrado (Cliente, Prestador o Administrador) inicie sesión en la plataforma ingresando su e-mail y contraseña, obteniendo un token de sesión (JWT) que habilita las funciones correspondientes a su rol. UC02 es **precondición común** de casi todos los demás casos de uso; solo UC01 (Registrarse) y UC04 (Buscar prestadores) admiten acceso sin sesión iniciada.

El caso de uso también cubre el subproceso de **recuperación de contraseña** mediante token de un solo uso (RF-1.6), ya que ese flujo es la única vía para restablecer credenciales dentro del mismo punto de entrada de autenticación.

## Requisitos

### Trazabilidad funcional

| Código | Prioridad | Descripción normativa |
|--------|-----------|----------------------|
| RF-1.2 | Obligatorio | El sistema *deberá* autenticar al usuario mediante e-mail y contraseña. Credenciales válidas otorgan sesión; tras 5 intentos fallidos **consecutivos** la cuenta se bloquea temporalmente. |
| RF-1.6 | Obligatorio | El sistema *deberá* permitir la recuperación de la contraseña mediante un token de un solo uso enviado por e-mail, con expiración a los 30 minutos. |

### Trazabilidad no funcional

| Código | Descripción normativa | Impacto en UC02 |
|--------|----------------------|-----------------|
| RNF-S.1 | El sistema *deberá* proteger los datos sensibles aplicando el principio de mínimo privilegio. | El token JWT debe codificar únicamente el rol y el identificador de usuario; no incluye datos personales. Cada endpoint valida que el rol del token tenga permiso para la operación. |
| RNF-S.2 | El sistema *deberá* preservar la confidencialidad del historial de mensajes. | La contraseña nunca se almacena en texto plano; se aplica hash Argon2/bcrypt. El canal de comunicación usa TLS. |
| RNF-S.3 | El sistema *deberá* validar la identidad y matrícula del prestador antes de habilitarlo para operar. | Un Prestador con oficio regulado puede autenticarse, pero su JWT incluye el estado `pendiente_habilitacion`; los endpoints de prestador lo rechazarán hasta que UC18 complete la verificación. |
| RNF-S.4 | El sistema *deberá* tratar los datos personales y financieros conforme a la Ley 25.326 de Protección de Datos Personales. | El e-mail se considera dato personal; no se registra en logs de acceso más allá del mínimo necesario para auditoría. La respuesta de error ante credenciales inválidas no revela cuál campo es incorrecto (e-mail vs. contraseña). |

### Reglas de negocio

| ID | Regla |
|----|-------|
| RN-AUTH-01 | Solo se puede autenticar un usuario con cuenta **registrada y activa**. Una cuenta suspendida (RF-1.5) no puede obtener sesión. El estado de suspensión se verifica **antes** que las credenciales, para no revelar si éstas eran válidas (decisión HITL PA-06). |
| RN-AUTH-02 | El mensaje de error ante credenciales inválidas es genérico; **nunca** revela si el e-mail no existe o si la contraseña es incorrecta. |
| RN-AUTH-03 | El contador de intentos fallidos es **consecutivo**: se reinicia en el momento en que el usuario inicia sesión con éxito. |
| RN-AUTH-04 | Tras **5 intentos fallidos consecutivos**, la cuenta se bloquea temporalmente por **30 minutos**, transcurridos los cuales el bloqueo se levanta **automáticamente** (decisión HITL PA-01). No requiere intervención del Administrador. |
| RN-AUTH-05 | El token de recuperación de contraseña es de un solo uso y expira a los **30 minutos** de emitido. Un token vencido o ya utilizado es rechazado. Se admiten como máximo **3 solicitudes de recuperación por hora** por cuenta (rate limiting, PA-07). |
| RN-AUTH-06 | El JWT emitido tras login exitoso codifica como mínimo: identificador de usuario, rol (`cliente` \| `prestador` \| `administrador`) y estado de habilitación del prestador cuando aplique. La invalidación de sesión es **solo por expiración del claim `exp`**; no hay logout explícito ni blocklist (decisión HITL PA-02). |
| RN-AUTH-07 | El prestador con oficio regulado puede autenticarse; la restricción de operación es responsabilidad de los endpoints de cada CDU posterior (no de UC02). UC02 solo emite el JWT con el estado correcto. |
| RN-AUTH-08 | La contraseña se almacena con hash **Argon2id** (decisión HITL PA-05). |

## Escenarios (Given-When-Then)

### ESC-01: Login exitoso — flujo básico

- **Dado** que un usuario registrado con cuenta activa abre el formulario de inicio de sesión
- **Cuando** ingresa su e-mail y contraseña correctos y confirma
- **Entonces** el sistema valida las credenciales, reinicia el contador de intentos fallidos, emite un JWT firmado con el rol del usuario y retorna HTTP 200 con el token; la sesión queda abierta

### ESC-02: Login exitoso — Prestador con oficio regulado pendiente de habilitación

- **Dado** que un Prestador con oficio regulado cuya matrícula aún no fue acreditada (estado `pendiente_habilitacion`) intenta autenticarse
- **Cuando** ingresa credenciales válidas y confirma
- **Entonces** el sistema emite un JWT que refleja el estado `pendiente_habilitacion`; retorna HTTP 200; el usuario puede iniciar sesión pero los endpoints de funcionalidad de prestador rechazan sus requests con HTTP 403

### ESC-03: Credenciales inválidas — primer intento fallido

- **Dado** que un usuario registrado tiene el contador de intentos fallidos en N < 4
- **Cuando** ingresa una combinación de e-mail y/o contraseña incorrectos
- **Entonces** el sistema incrementa el contador de intentos fallidos en 1, responde con HTTP 401 y un mensaje genérico que no revela qué campo es incorrecto, y no abre sesión

### ESC-04: Bloqueo temporal por 5 intentos fallidos consecutivos

- **Dado** que un usuario registrado tiene exactamente 4 intentos fallidos consecutivos previos
- **Cuando** ingresa credenciales inválidas por quinta vez consecutiva
- **Entonces** el sistema incrementa el contador a 5, bloquea temporalmente la cuenta por 30 minutos, responde con HTTP 423 (Locked) con un mensaje que informa el bloqueo, y no abre sesión

### ESC-05: Intento de login con cuenta suspendida

- **Dado** que un usuario cuya cuenta fue suspendida por un Administrador (RF-1.5) intenta autenticarse
- **Cuando** ingresa sus credenciales (correctas o no)
- **Entonces** el sistema verifica la suspensión **antes** de validar las credenciales, rechaza el intento sin emitir token y responde con HTTP 403 y un mensaje que indica que la cuenta está suspendida (no revela si las credenciales eran válidas)

### ESC-06: Recuperación de contraseña — token válido

- **Dado** que un usuario registrado olvidó su contraseña y solicita recuperarla
- **Cuando** el sistema recibe el e-mail, envía el token de un solo uso por e-mail (expiración: 30 minutos), el usuario abre el enlace, define una nueva contraseña y el token está vigente y no fue usado
- **Entonces** el sistema actualiza la contraseña con hash (Argon2/bcrypt), invalida el token, y retorna HTTP 200; el usuario puede autenticarse con la nueva contraseña

### ESC-07: Recuperación de contraseña — token vencido

- **Dado** que el usuario abre un enlace de recuperación de contraseña cuyo token expiró (más de 30 minutos) o ya fue utilizado
- **Cuando** intenta confirmar la nueva contraseña
- **Entonces** el sistema rechaza la operación con HTTP 400/410 y un mensaje que invita a solicitar un nuevo token; no actualiza la contraseña

### ESC-08: Recuperación de contraseña — e-mail no registrado

- **Dado** que alguien solicita recuperación de contraseña con un e-mail que no corresponde a ninguna cuenta
- **Cuando** el sistema procesa la solicitud
- **Entonces** el sistema responde con HTTP 200 con el mismo mensaje genérico de confirmación de envío (no revela si el e-mail existe), y no envía ningún e-mail; esto previene enumeración de usuarios (RNF-S.4)

### ESC-09: Login exitoso tras bloqueo temporal expirado

- **Dado** que la cuenta de un usuario fue bloqueada temporalmente (ESC-04) y el período de bloqueo expiró
- **Cuando** el usuario ingresa credenciales válidas
- **Entonces** el sistema acepta el login, reinicia el contador de intentos fallidos a 0, emite JWT y retorna HTTP 200

### ESC-10: Reinicio de contador tras login exitoso

- **Dado** que un usuario tiene N intentos fallidos previos (N < 5) y la cuenta no está bloqueada
- **Cuando** ingresa credenciales válidas y confirma
- **Entonces** el sistema reinicia el contador de intentos fallidos consecutivos a 0, emite JWT y retorna HTTP 200

## Fuera de alcance

- **Registro de cuenta nueva** — cubierto por UC01 (Registrarse).
- **Verificación de matrícula del Prestador** — cubierta por UC18; UC02 solo consume el estado resultante.
- **Suspensión/baja de cuenta por Administrador** — cubierta por UC14 (Moderar usuario).
- **Gestión de tokens OAuth2 de terceros** (login con Google/Facebook, etc.) — no mencionada en el documento fuente; se asume fuera de alcance para el TPI.
- **Invalidación explícita de sesión (logout)** — no hay un UC dedicado al cierre de sesión en el documento fuente; se asume manejo por expiración de JWT. Ver Preguntas abiertas.
- **Autenticación multifactor (MFA)** — no referenciada en el documento fuente.

## Preguntas abiertas / supuestos

| ID | Estado | Resolución |
|----|--------|-----------|
| PA-01 | ✅ Resuelto (HITL) | Bloqueo temporal de **30 min con auto-expiración**, sin intervención de Admin. → RN-AUTH-04. |
| PA-02 | ✅ Resuelto (HITL) | **Solo expiración de JWT** por claim `exp`; sin logout explícito ni blocklist. Fuera de alcance de UC02. → RN-AUTH-06. |
| PA-03 | ✅ Resuelto (default) | Cuenta bloqueada responde **HTTP 423 (Locked)**. → ESC-04. |
| PA-04 | Supuesto (a confirmar en diseño) | **JWT de prestador:** se asume un claim `status` = `pendiente_habilitacion`; cada endpoint downstream valida. → RN-AUTH-07. |
| PA-05 | ✅ Resuelto (default) | Hash **Argon2id**. → RN-AUTH-08. |
| PA-06 | ✅ Resuelto (HITL) | **Suspensión se verifica antes que credenciales.** → RN-AUTH-01, ESC-05. |
| PA-07 | ✅ Resuelto (default) | Rate limiting de recuperación: **3 solicitudes/hora por cuenta**. → RN-AUTH-05. |
