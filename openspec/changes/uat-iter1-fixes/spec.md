# UAT Iteración 1 — Lote de correcciones (Spec de cambio)

## Propósito

Cerrar los defectos reportados por el Tester en UAT sobre iteración 1. Son correcciones
de comportamiento observable; no alteran el grafo de transiciones, roles, ni contratos de
casos de uso ya especificados. Cada defecto se corrige con su test de regresión.

## Defectos cubiertos

| ID | Área | Síntoma reportado (UAT) | Resultado esperado |
|----|------|-------------------------|--------------------|
| UAT-01 | Backend `catalogo` (UC04) | Orden por distancia incorrecto: electricista en Posadas con orden por distancia muestra un prestador de San Vicente antes que uno de Posadas. | Con ubicación de referencia Posadas, los prestadores se ordenan por distancia ascendente real al punto de referencia; el más cercano (Posadas) aparece primero. |
| UAT-02 | Backend `catalogo` (UC04) | Prestadores muestran tag "Disponibles" sin estar disponibles. | El estado de disponibilidad reportado refleja la disponibilidad real; un prestador sin franjas disponibles no se marca como disponible. |
| UAT-03 | Frontend sesión/navbar | Tras iniciar sesión, el navbar/landing sigue mostrando "Registrarse" (estado anónimo) para cliente y prestador. | Tras login exitoso el navbar refleja el estado autenticado inmediatamente. |
| UAT-04 | Frontend routing (prestador) | La pantalla principal `/` es la landing para un prestador logueado; no hay acceso directo a sus contrataciones/solicitudes. | Un prestador logueado tiene acceso directo (redirect o CTA) a su bandeja de solicitudes desde `/`. |
| UAT-05 | Frontend routing (cliente) | La pantalla principal `/` es la landing para un cliente logueado; no hay acceso directo a la búsqueda. | Un cliente logueado tiene acceso directo (redirect o CTA) a la búsqueda de prestadores desde `/`. |
| UAT-06 | Frontend sesión/navbar | No se ve el nombre ni el perfil del usuario logueado en el navbar. | El navbar muestra el nombre (o identificador) del usuario autenticado y acceso a su perfil. |
| UAT-07 | Frontend formularios fecha | Los selectores de fecha están en formato estadounidense (mm/dd/aaaa) al solicitar servicio (UC07) y al presupuestar (UC08). | Los selectores de fecha se muestran en formato `dd/mm/aaaa`; el valor enviado al backend permanece `YYYY-MM-DD`. |

## Requisitos

- RN-UAT-01: El orden por distancia DEBE calcular distancia ascendente al punto de
  referencia de la búsqueda; ningún prestador más lejano puede preceder a uno más cercano.
- RN-UAT-02: El estado de disponibilidad expuesto NO DEBE marcar "disponible" cuando no
  existen franjas disponibles reales en el horizonte considerado.
- RN-UAT-03: El estado de sesión observable (navbar) DEBE reflejar la autenticación tras un
  login exitoso sin requerir recarga manual.
- RN-UAT-04/05: La ruta `/` DEBE ofrecer a un usuario autenticado un camino directo a su
  área principal según su rol (prestador → solicitudes; cliente → búsqueda).
- RN-UAT-06: El navbar autenticado DEBE mostrar el nombre del usuario; el JWT/sesión DEBE
  transportar ese dato.
- RN-UAT-07: Las entradas de fecha de UC07 y UC08 DEBEN presentarse en `dd/mm/aaaa`
  conservando el valor interno `YYYY-MM-DD` enviado al backend.

## Fuera de alcance

- El grafo de transiciones, roles autorizados y códigos HTTP (ya especificados).
- Recalcular disponibilidad en tiempo real desde la agenda (UAT-02 se corrige a nivel de
  consistencia del dato expuesto, no introduce un nuevo motor de agenda).

## Verificación

Cada defecto incorpora test de regresión (Jest en `server/`, Vitest en `client/`).
La suite completa + lint + `nest build` (gate CI) deben pasar antes de re-enviar a UAT.
