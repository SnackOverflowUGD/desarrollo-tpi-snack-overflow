# UC07 — Solicitar contratación (Spec)

## Propósito

Permite que un **cliente autenticado** solicite un servicio a un prestador indicando ubicación, fecha, franja horaria y descripción del problema. El sistema verifica disponibilidad de la franja, la reserva, y crea la contratación en estado **solicitada** vía UC09 (gestión de estados). La solicitud queda visible para el prestador.

## Trazabilidad funcional

| Código | Prioridad | Descripción |
|--------|-----------|-------------|
| RF-6.1 | Obligatorio | El cliente *deberá* poder enviar una solicitud indicando ubicación, prestador, fecha, franja y descripción. |
| RF-4.2 | Obligatorio | El sistema *deberá* bloquear franjas ya reservadas para evitar duplicación. |

## Trazabilidad no funcional

| Código | Aplicación |
|--------|-----------|
| RNF-S.1 | Solo un cliente autenticado (JWT con rol `cliente`) puede crear una contratación. |
| RNF-S.4 | Los datos de la solicitud (ubicación, descripción) se tratan como datos personales; no se exponen a terceros no autorizados. |

## Reglas de negocio

| ID | Regla |
|----|-------|
| RN-CON-01 | Solo un **cliente autenticado** (rol `cliente` en JWT) puede solicitar contratación. |
| RN-CON-02 | Campos obligatorios: **ubicación, prestador, fecha, franja horaria, descripción**. Sin ellos no se envía. |
| RN-CON-03 | La contratación se crea en estado **solicitada** invocando UC09. UC07 no implementa la máquina de estados. |
| RN-CON-04 | La reserva de franja (vía módulo agenda/disponibilidad) y la creación de la contratación son **atómicas**: si falla una, no ocurre ninguna. |
| RN-CON-05 | El prestador destino debe estar **activo y visible** en el catálogo. |
| RN-CON-06 | La fecha debe ser **hoy o futura**. Una fecha pasada se rechaza. |

## Escenarios (Given-When-Then)

### ESC-01: Solicitud exitosa — flujo básico

- **Dado** un cliente autenticado que seleccionó un prestador con disponibilidad publicada
- **Cuando** completa ubicación, prestador, fecha, franja y descripción, y confirma
- **Entonces** el sistema valida los campos, verifica que la franja esté disponible, la reserva, invoca UC09 para crear la contratación en estado *solicitada*, y retorna HTTP 201 con los datos de la contratación

### ESC-02: Campos obligatorios faltantes

- **Dado** un cliente autenticado que completa el formulario de solicitud
- **Cuando** omite al menos uno de los campos obligatorios y confirma
- **Entonces** el sistema rechaza el envío con HTTP 422 y una lista de los campos faltantes; no se crea contratación ni se reserva franja

### ESC-03: Franja ya no disponible

- **Dado** un cliente autenticado que selecciona una franja que fue tomada entre la carga del formulario y la confirmación
- **Cuando** el sistema verifica la disponibilidad de la franja
- **Entonces** el sistema informa que la franja ya no está disponible con HTTP 409, ofrece elegir otra, y no crea la contratación

### ESC-04: Cliente no autenticado

- **Dado** un usuario sin sesión activa (sin JWT o JWT inválido)
- **Cuando** intenta acceder al formulario de solicitud o enviar una
- **Entonces** el sistema rechaza con HTTP 401; no se procesa la solicitud

### ESC-05: Prestador inactivo o inexistente

- **Dado** un cliente autenticado que selecciona un prestador
- **Cuando** el prestador fue suspendido, desactivado, o el ID no existe
- **Entonces** el sistema rechaza con HTTP 404 y no crea la contratación

### ESC-06: Fecha en el pasado

- **Dado** un cliente autenticado
- **Cuando** selecciona una fecha anterior a la fecha actual
- **Entonces** el sistema rechaza con HTTP 422 indicando que la fecha debe ser hoy o futura

### ESC-07: Falla en reserva de franja (rollback)

- **Dado** un cliente autenticado con datos válidos y franja disponible
- **Cuando** el sistema reserva la franja exitosamente pero la creación en UC09 falla (error de base de datos, timeout)
- **Entonces** el sistema **revierte** la reserva de la franja y retorna HTTP 500; no queda estado inconsistente

## Fuera de alcance

- **Envío de propuesta o rechazo** por el prestador — UC08.
- **Gestión de estados** de contratación — UC09 (máquina de estados).
- **Notificación** al prestador — UC19 (se dispara desde UC09 al crearse la contratación).
- **Cancelación** de contratación — UC10.
- **Gestión de agenda y disponibilidad** del prestador — UC06.

## Preguntas abiertas / supuestos

| ID | Estado | Resolución |
|----|--------|-----------|
| PC-01 | Supuesto | **Reserva atómica:** se asume que el puerto de agenda/disponibilidad soporta reserva transaccional con rollback. Se definirá en diseño. → RN-CON-04. |
| PC-02 | Supuesto | **Identidad del prestador:** el cliente selecciona al prestador por su ID desde el catálogo (UC04). El sistema valida existencia y estado activo. → RN-CON-05. |
| PC-03 | Supuesto | **Ubicación como texto libre** (dirección escrita por el cliente). Sin geocodificación en esta iteración. |
