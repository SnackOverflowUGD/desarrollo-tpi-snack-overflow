# UC04 — Buscar prestadores (Spec)

## Propósito

Permite que un cliente (sin necesidad de autenticación — acceso público) busque y compare prestadores de oficios por tipo de servicio, zona de cobertura, cualificación y disponibilidad, y consulte su perfil público. UC04 es el punto de entrada al catálogo y no requiere sesión iniciada; junto con UC01 (Registrarse) son los únicos casos de uso de acceso público.

El caso de uso implementa el patrón **Strategy** para los algoritmos de ordenamiento de resultados (por calificación, distancia y disponibilidad), y accede al catálogo de servicios (RF-2.1) filtrado por zona de cobertura (RF-2.2).

## Requisitos

### Trazabilidad funcional

| Código | Prioridad | Descripción normativa |
|--------|-----------|----------------------|
| RF-2.1 | Obligatorio | El catálogo *deberá* cubrir las 7 categorías de servicios del Anexo A. |
| RF-2.2 | Obligatorio | La búsqueda *deberá* filtrar prestadores cuya zona de cobertura contiene la ubicación del cliente. |
| RF-2.3 | Obligatorio | Los resultados *deberán* admitir ordenamiento por calificación, distancia y disponibilidad. |
| RF-2.5 | Obligatorio | El perfil público *deberá* mostrar servicios, calificación promedio y reseñas recibidas. |

### Trazabilidad no funcional

| Código | Descripción normativa | Impacto en UC04 |
|--------|----------------------|-----------------|
| RNF-S.1 | El sistema *deberá* proteger los datos sensibles aplicando el principio de mínimo privilegio. | Los resultados de búsqueda solo exponen datos públicos del perfil del prestador (nombre, oficio, calificación, zona de cobertura). No se revelan datos de contacto sin una contratación en curso. |
| RNF-S.4 | El sistema *deberá* tratar los datos personales y financieros conforme a la Ley 25.326 de Protección de Datos Personales. | La ubicación ingresada por el cliente para la búsqueda no se persiste ni se asocia a su identidad. No se almacenan históricos de búsqueda. |
| RNF-O.1 | El sistema *deberá* completar la búsqueda y presentación de resultados en menos de 2 segundos (p95) ante 100 búsquedas concurrentes. | E1 del ATAM — búsqueda concurrente ≤2 s p95, ≤70% CPU. El módulo de búsqueda debe estar optimizado para consultas geográficas y de disponibilidad. |
| RNF-O.2 | La cobertura de tests del módulo de núcleo *deberá* ser ≥90%. | El módulo `catalogo` y sus componentes de búsqueda y ranking deben alcanzar ≥90% de cobertura de líneas. |

### Reglas de negocio

| ID | Regla |
|----|-------|
| RN-CAT-01 | Solo se muestran prestadores con cuenta **activa**, perfil **visible** y al menos un servicio **publicado (visible)** en el catálogo. El flag `tieneServiciosPublicados` es **mantenido por la aplicación**: se recalcula dentro de la misma transacción cada vez que un servicio se publica, oculta o elimina (soft-delete) — ya no es un campo poblado solo por seed. Prestadores suspendidos (RF-1.5) o sin servicios publicados no aparecen en resultados. |
| RN-CAT-02 | La coincidencia de zona de cobertura se determina por la relación entre la **ubicación del cliente** (coordenadas o localidad) y la **zona de cobertura configurada** por el prestador (UC06). Si el prestador no definió zona, se asume solo su localidad registrada. |
| RN-CAT-03 | El ordenamiento por defecto de los resultados es **por calificación descendente** (más alto primero). A igual calificación, se ordena por **cantidad de reseñas** descendente. |
| RN-CAT-04 | La **disponibilidad** reflejada en los resultados considera las franjas horarias configuradas por el prestador (UC06) **vigentes a la fecha de la consulta**, excluyendo períodos no disponibles y franjas ya reservadas con contrataciones en estado distinto de *finalizada* o *cancelada*. El ordenamiento por disponibilidad (cantidad de franjas libres en los próximos 7 días, DESC) SÍ está soportado; el **filtrado por una fecha específica NO está disponible** porque depende de la agenda real del prestador (UC06), aún no construida (ver PA-06). |
| RN-CAT-06 | La **paginación** devuelve en `total` la cantidad **real** de prestadores que satisfacen TODOS los criterios (`cuenta activa` + `servicios publicados` + `visible` + `categoria` exacta + `calificación mínima` + zona de cobertura que contiene la ubicación), no la cantidad de elementos de la página actual. El filtro por zona de cobertura (point-in-polygon) se aplica sobre el conjunto completo de candidatos ANTES de recortar la página solicitada, de modo que cada página se llena correctamente y `total` permite calcular la cantidad de páginas. |
| RN-CAT-05 | El perfil público del prestador muestra: nombre, oficio(s), calificación promedio, cantidad de reseñas, zona de cobertura, y lista de servicios publicados con descripción y rango de precios. No se muestra dirección particular, teléfono ni e-mail hasta que exista una contratación aceptada (UC21) entre el cliente y el prestador. |

### Puertos de repositorio (autogestión de prestador)

| ID | Regla |
|----|-------|
| REPO-PRESTADOR-UPDATE-01 | La interfaz `IPrestadorRepository` *deberá* exponer un método `update(id, data)` que persista ediciones de perfil (`oficios`/`categoria`, `localidad`, `zonaCobertura`, `disponibilidadResumen`, `visible`, `tieneServiciosPublicados`). Cuando cambia `localidad`, la `zonaCobertura` regenerada y el nuevo valor de `tieneServiciosPublicados` *deben* persistirse en la MISMA transacción que el resto de la actualización. |
| REPO-SERVICIO-CRUD-01 | La interfaz `IServicioRepository` *deberá* exponer métodos `create`, `update` y `delete`. `delete` *debe* ser un soft-delete (fijar `visible=false`, conservando la fila), nunca una eliminación física. |

## Escenarios (Given-When-Then)

### ESC-01: Búsqueda básica con resultados — flujo feliz

- **Dado** que existen prestadores activos con servicios publicados cuyas zonas de cobertura contienen la ubicación ingresada
- **Cuando** el cliente ingresa un oficio y una ubicación, y confirma la búsqueda
- **Entonces** el sistema retorna un listado de prestadores que coinciden con el oficio y cubren la ubicación, ordenados por calificación descendente por defecto, mostrando nombre, calificación promedio y disponibilidad resumida

### ESC-02: Ordenamiento por calificación

- **Dado** que el sistema mostró resultados de búsqueda
- **Cuando** el cliente selecciona ordenar por "calificación"
- **Entonces** el sistema reordena los resultados de mayor a menor calificación promedio, y a igual calificación por cantidad de reseñas descendente

### ESC-03: Ordenamiento por distancia

- **Dado** que el sistema mostró resultados de búsqueda
- **Cuando** el cliente selecciona ordenar por "distancia"
- **Entonces** el sistema reordena los resultados del prestador más cercano al más lejano respecto a la ubicación ingresada

### ESC-04: Ordenamiento por disponibilidad

- **Dado** que el sistema mostró resultados de búsqueda
- **Cuando** el cliente selecciona ordenar por "disponibilidad"
- **Entonces** el sistema reordena los resultados mostrando primero los prestadores con mayor cantidad de franjas horarias disponibles en los próximos 7 días

### ESC-05: Búsqueda sin resultados

- **Dado** que no existen prestadores cuya zona de cobertura contenga la ubicación ingresada para el oficio solicitado
- **Cuando** el cliente confirma la búsqueda
- **Entonces** el sistema informa que no se encontraron prestadores y sugiere ampliar los criterios (cambiar oficio, ubicación o eliminar filtros). El caso de uso se reanuda en el paso de ingreso de criterios.

### ESC-06: Consulta de perfil público

- **Dado** que el cliente visualiza los resultados de búsqueda
- **Cuando** selecciona un prestador de la lista
- **Entonces** el sistema muestra el perfil público del prestador con: nombre, oficio(s), calificación promedio, reseñas recibidas, zona de cobertura, y lista de servicios publicados con descripción y rango de precios estimado
- **Y** la lista de **servicios publicados** se carga efectivamente desde la base (los servicios `visible = true` del prestador), no se devuelve vacía
- **Nota:** las **reseñas** (`resenas`) se devuelven como lista vacía mientras no exista la entidad de reseñas (UC14, iteración 3); el contrato del perfil ya las contempla para cuando se construyan.

### ESC-07: Criterios de búsqueda vacíos o inválidos

- **Dado** que el cliente no ingresó un oficio o no ingresó una ubicación
- **Cuando** intenta confirmar la búsqueda
- **Entonces** el sistema muestra un mensaje indicando que el oficio y la ubicación son obligatorios y no ejecuta la búsqueda

### ESC-08: Búsqueda con múltiples filtros combinados

- **Dado** que existen prestadores activos en múltiples categorías y zonas
- **Cuando** el cliente ingresa oficio, ubicación y aplica el filtro de **calificación mínima** y selecciona ordenamiento por distancia
- **Entonces** el sistema aplica todos los filtros concurrentemente, ordena por distancia, y retorna solo los prestadores que cumplen todas las condiciones, con un `total` que refleja la cantidad real de coincidencias (RN-CAT-06)
- **Nota:** el **filtro por fecha específica** fue retirado del alcance (ver PA-06). Los filtros combinados soportados son: oficio + ubicación (obligatorios) + calificación mínima (opcional), más los tres ordenamientos (calificación / distancia / disponibilidad).

### ESC-09: El repositorio actualiza perfil + zona regenerada de forma atómica

- **Dado** un prestador persistido y una actualización que cambia `localidad` y `disponibilidadResumen`
- **Cuando** se invoca `repository.update(id, data)` dentro de una transacción
- **Entonces** todos los campos modificados, incluyendo la `zonaCobertura` regenerada, se commitean juntos
- **Y** una falla en cualquier campo revierte toda la actualización (sin estado parcial)

### ESC-10: El repositorio crea y actualiza un servicio

- **Dado** un `CreateServicioData` con `prestadorId`, `rangoPrecioMin`, `rangoPrecioMax`, `descripcion`, `visible`
- **Cuando** se invoca `repository.create(data)` y luego `repository.update(id, changes)`
- **Entonces** el servicio se persiste y luego refleja los campos actualizados
- **Y** la entidad retornada tiene un `id` generado

### ESC-11: El repositorio hace soft-delete de un servicio

- **Dado** un servicio visible persistido
- **Cuando** se invoca `repository.delete(id)`
- **Entonces** la fila sigue existiendo con `visible=false`
- **Y** ninguna fila se elimina físicamente de la tabla `servicios`

### ESC-12: El flag de publicación alterna la searchability

- **Dado** un prestador creado por la app con `tieneServiciosPublicados=false`
- **Cuando** publica su primer servicio visible y luego oculta/soft-deletea su último servicio visible
- **Entonces** `tieneServiciosPublicados` pasa a `true` en la primera publicación y a `false` tras ocultar el último
- **Y** la inclusión en búsqueda sigue el flag en consecuencia (cada recálculo commiteado en la transacción de la mutación)

## Fuera de alcance

- **Publicación de servicios en el catálogo** — cubierto por UC05 (Publicar servicios).
- **Gestión de agenda y disponibilidad** — cubierto por UC06 (Gestionar agenda y disponibilidad).
- **Solicitud de contratación** — cubierto por UC07 (Solicitar contratación).
- **Verificación de habilitaciones profesionales** — cubierto por UC18 (Verificar habilitaciones).
- **Geolocalización en tiempo real** — no hay requisito de tracking GPS en vivo; la ubicación del cliente se ingresa manualmente (localidad o coordenadas).
- **Reserva directa desde búsqueda** — UC04 es solo consulta; la reserva se inicia en UC07.

## Preguntas abiertas / supuestos

| ID | Estado | Resolución |
|----|--------|-----------|
| PA-01 | Supuesto | La ubicación del cliente se ingresa como texto de localidad + geocodificación aproximada, no como coordenadas GPS en tiempo real. Se asume que el servicio de geocodificación va detrás de un adaptador (ADR-002). |
| PA-02 | Supuesto | La "disponibilidad" en resultados de búsqueda muestra un indicador resumido (ej. "Disponible esta semana", "Próxima disponibilidad: 15/06"), no las franjas exactas. El detalle de franjas se ve al solicitar contratación (UC07). |
| PA-03 | Supuesto | Si el prestador no configuró zona de cobertura explícita (UC06), se asume su localidad de registro como zona de cobertura por defecto. |
| PA-04 | Pendiente | ¿El ordenamiento por defecto debe ser configurable por el cliente (guardar preferencia) o siempre calificación descendente? Se propone calificación descendente como default. |
| PA-05 | Resuelto | Se requiere paginación de resultados: 20 por página por defecto. `total` MUST reflejar la cantidad real de coincidencias tras aplicar el filtro de zona de cobertura sobre el conjunto completo de candidatos (RN-CAT-06), no la longitud de la página actual. |
| PA-06 | Resuelto | El **filtro por fecha de disponibilidad** se retira del alcance de UC04. Un filtrado por fecha real requiere la agenda por fecha del prestador (UC06), que aún no está construida; un control que se acepta pero se ignora induce al usuario a error. Se conserva el **ordenamiento por disponibilidad** (franjas libres en próximos 7 días, que sí funciona con el resumen de disponibilidad). El parámetro `fecha` se elimina de la UI, del query-string whitelist del cliente y del plumbing muerto del backend. |
