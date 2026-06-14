# Verification Report — MI-11 "Verificación de la integración" (System E2E del flujo integrado)

**Fecha:** 2026-06-14
**Rama:** `main`
**Verificador:** Tester de sistema (WI MI-11)
**Suites / evidencia:** `client/e2e/sistema.spec.ts` (Playwright, Chromium) contra el stack VIVO + seedeado real (NestJS :3000 / Next :3001 / Postgres `snack_overflow`) · seed reproducible `server/scripts/seed-e2e.sh` · probes `curl` directos al backend y a través del BFF · `tsc --noEmit` + `npm run lint` + `npm run test:unit` (frontend) · regresión de la suite E2E completa.

---

## Veredicto final

**APROBADO** — el flujo integrado end-to-end pasa 7/7 contra datos reales, y en el camino se halló y **se corrigió un bug de integración REAL y bloqueante** (las transiciones de estado vía BFF devolvían 401 por un problema de routing de Next 16) que ningún E2E por-WI había detectado porque todos mockean o sólo prueban el camino 401.

Esto **cierra la observación recurrente OBS-01** de cada verify.md previo (UC04/UC07/UC08/UC09): "con la DB vacía las páginas SSR no renderean cards con datos, así que las interacciones reales no se prueban como E2E de sistema". Con el seed real, la cadena completa
`solicitada → presupuestada → confirmada → en_curso → finalizada` se ejercita sobre la UI real, con dos sesiones (cliente + prestador), sin un solo `page.route`.

- **System E2E (`sistema.spec.ts`, Chromium, 1 worker):** **7/7 pass.**
- **Regresión E2E (resto de la suite, Chromium):** **115/115 pass** — el fix de `next.config.ts` no rompió nada (registro, proxy público, loop auth BFF, etc.).
- **Frontend unit (vitest):** **286/286 pass** (incl. el fix de `acciones-contratacion`).
- **tsc --noEmit:** 0 errores. **lint:** 0 errores (1 warning pre-existente en `registro-form.tsx`, ajeno).

---

## 1. Bugs de integración hallados

### BUG-01 (BLOQUEANTE, CORREGIDO) — las transiciones de contratación vía BFF devolvían 401

**Síntoma:** `POST /api/contrataciones/{id}/proposal` (y por extensión `confirm`/`start`/`finish`/`reject`/`cancel`) a través del frontend :3001 devolvía `{"message":"Unauthorized","statusCode":401}` — el cuerpo del **backend**, no el sentinel del BFF (`{ok:false}`) — pese a que el MISMO token funcionaba perfecto golpeando el backend :3000 directo (200, `presupuestada`). El `GET /api/contrataciones` SÍ andaba con la misma cookie.

**Root cause (confirmado leyendo los docs locales de Next 16.2.9):** El `rewrites()` de `client/next.config.ts` devuelve un **array** → es un rewrite `afterFiles`. En el orden de resolución de Next:

> static files / **non-dynamic pages** se chequean ANTES de los `afterFiles` rewrites; las **dynamic routes** se chequean DESPUÉS.

- `app/api/contrataciones/route.ts` es un Route Handler **estático** ("non-dynamic page") → se resuelve ANTES del rewrite → **lo sombrea correctamente** (por eso el GET andaba).
- `app/api/contrataciones/[id]/proposal/route.ts` (y todos los `[id]/{...}`) son **dynamic routes** → se resuelven DESPUÉS del rewrite → el catch-all `/api/:path*` **gana** y forwardea `/contrataciones/{id}/proposal` directo al backend **SIN el Bearer** (el rewrite no puede leer la cookie httpOnly `so_session`) → el backend responde 401.

**Por qué nadie lo vio:** los E2E por-WI (`bandeja.spec.ts`, `seguimiento.spec.ts`) prueban estos handlers SOLO en el camino 401 (token forjado / sin cookie) y leen el 401 como "esperado". Nunca ejercieron una transición **autenticada exitosa** a través del BFF. MI-11, con seed real + flujo real, es exactamente lo que lo destapó.

**Fix (`client/next.config.ts`):** se acotó el `source` del rewrite con un negative-lookahead para EXCLUIR todo prefijo que tenga Route Handler local propio (`/api/auth/*`, `/api/contrataciones` y `/api/contrataciones/*`), de modo que esas rutas resuelvan al handler de filesystem que adjunta el Bearer. Todo lo demás bajo `/api/*` (registro, catálogo público) sigue proxeando directo.

```ts
source: "/api/:path((?!auth$|auth/|contrataciones$|contrataciones/).*)",
destination: `${BACKEND_URL}/:path`,
```

**Verificación del fix:** tras el cambio, `proposal/confirm/start/finish` vía BFF devuelven el estado correcto (probes + E2E 7/7); regresión 115/115 verde (el proxy sigue funcionando para lo que debe). Requiere reinicio del dev server (cambio de `next.config.ts` no hot-reloadea).

### BUG-02 (UX, no bloqueante, CORREGIDO) — botones de acción quedaban deshabilitados tras una transición exitosa

**Síntoma:** en `acciones-contratacion.tsx`, al ejecutar una acción con éxito (p.ej. "Iniciar"), el componente hacía `toast.success` + `router.refresh()` y retornaba **sin** `setBusy(null)`. Como `router.refresh()` es un refresh SOFT que re-corre el fetch server-side **sin remontar el client component**, el `busy` quedaba seteado y `disabled={busy !== null}` mantenía TODOS los botones de acción deshabilitados después de que la nueva card (con el nuevo estado y sus nuevas acciones) renderizaba. Un usuario real tendría que hacer reload duro antes de poder accionar de nuevo (p.ej. "Finalizar" tras "Iniciar").

**Fix:** agregar `setBusy(null)` en el camino `result.ok` antes de `router.refresh()`. 286 unit tests verdes tras el cambio.

> Hallado por el E2E de sistema (paso 7: iniciar → finalizar en la misma sesión). Sin el seed real + flujo real, este estado intermedio nunca se renderizaba en un test.

---

## 2. Observaciones (no bloquean)

### OBS-01 — el perfil público NO lista los servicios publicados (read-model incompleto del catálogo)
`TypeOrmPrestadorRepository.toPerfil()` (`server/src/catalogo/adapters/typeorm-prestador.repository.ts`) hardcodea `servicios: []` y `resenas: []` — NO joinea la tabla `servicios` (que sí existe y se seedea). `GET /catalogo/prestadores/:id` devuelve `servicios: []` aunque haya filas. En la UI el perfil muestra "Este prestador aún no publicó servicios". El paso 3 del E2E por eso asserta los datos que SÍ rendean (nombre, oficio, calificación, zona de cobertura, CTA "Solicitar", y ausencia de datos de contacto por RN-CAT-05) en lugar de servicios. Es un gap del read-model de UC05, no un bug de integración del flujo. Follow-up: joinear `servicios`/`resenas` en `toPerfil`.

### OBS-02 — `precioEstimado` se serializa como STRING ("18000.00"), no número
El backend serializa la columna Postgres `numeric` como string (`"18000.00"`) en `precioEstimado`. La card de seguimiento renderiza el valor crudo (`$18000.00`) y los probes deben comparar numéricamente (`Number(...)`). No rompe el flujo (la UI lo muestra bien) pero es una inconsistencia de tipo en el contrato JSON. Follow-up cosmético: castear a number en el DTO o formatear es-AR en la card.

### OBS-03 — la card de seguimiento muestra `prestadorId` (UUID) como contraparte del cliente
Mismo límite de DTO heredado documentado en UC09 OBS-04: para el cliente la card muestra `item.prestadorId` (UUID) porque el `ContratacionListItemDto` enriquece `clienteNombre` pero no `prestadorNombre`. No afecta el flujo ni la seguridad. Follow-up.

### OBS-04 — matriz cross-browser PENDIENTE (mismo diferido de todos los WI)
El E2E corre verde en **Chromium**. WebKit/Mobile Safari requieren `sudo npx playwright install-deps` (libs de sistema en Linux), no disponible en este entorno. El scope se fijó en `--project=chromium`. Lo corre el tester humano / CI con la imagen `mcr.microsoft.com/playwright`.

### OBS-05 — geocoding REAL (Nominatim), no stub → dependencia de red en la búsqueda
`OpenStreetMapGeocodingAdapter` pega a `nominatim.openstreetmap.org` en tiempo real. El availability SÍ es stub (`isAvailable` siempre `true`, UC06 pendiente), así que cualquier fecha futura + franja pasa. El seed sortea la imprevisibilidad del geocoding dándole al prestador un polígono de cobertura que cubre TODA Argentina (ver §3), por lo que cualquier coordenada que Nominatim devuelva para una ubicación argentina cae adentro y el filtro point-in-polygon matchea siempre. Si Nominatim está caído, la búsqueda devuelve `[]` (no error) y el paso 2 fallaría — limitación inherente, documentada.

---

## 3. Cómo se siembra el sistema (CLAVE — reutilizable)

Script reproducible: **`server/scripts/seed-e2e.sh`** (idempotente: resetea sus propias filas en cada corrida vía el marcador de email `e2e-mi11`).

**Por qué hace falta:** la búsqueda (UC04) sólo devuelve un prestador que exista como FILA en la tabla de catálogo `prestadores` con:
- `tiene_servicios_publicados = true` (REQUERIDO; sin esto no aparece en search),
- `categoria` = exactamente el `?oficio=` buscado (el repo hace `categoria = :oficio`),
- `cuenta_activa = true`, `visible = true`,
- `zona_cobertura` (GeoJSON `{ geometry, localidad }`) cuyo polígono CONTENGA la coordenada geocodeada del cliente.

Registrar un usuario con `role=prestador` (POST /auth/register) crea SOLO la fila en `users`; **NO** crea la fila de catálogo en `prestadores`. Por eso el seed:

1. **Registra cliente + prestador vía la API** (`POST http://localhost:3000/auth/register`) para que el hash de password (argon2id) sea válido para el login real. Passwords ≥8: `cliente1234` / `prestador1234`. El prestador usa un `trade` no regulado ("Electricista") para quedar `providerStatus=habilitado`.
2. **Resuelve el `users.id`** del prestador por SQL.
3. **Inserta por SQL** (`docker exec snack_overflow_db psql ...`): la fila `prestadores` (con `id = users.id`, `categoria='Electricista'`, `tiene_servicios_publicados=true`, y un `zona_cobertura` con polígono Argentina-wide `[[-74,-56],[-53,-56],[-53,-21],[-74,-21],[-74,-56]]`) + una fila `servicios`.
4. **Verifica** que `GET /catalogo/prestadores?oficio=Electricista&ubicacion=Posadas, Misiones, Argentina` devuelve al prestador sembrado (falla ruidosamente si no).

Credenciales sembradas (estables):
- Cliente : `cliente.e2e-mi11@snackoverflow.test` / `cliente1234`
- Prestador: `prestador.e2e-mi11@snackoverflow.test` / `prestador1234`
- Oficio: `Electricista` · Ubicación: `Posadas, Misiones, Argentina` · Franja: `Mañana (08–12)` (¡en-dash U+2013!)

**Correr:** `bash server/scripts/seed-e2e.sh` (o `--print` para ver credenciales). NO está cableado al arranque de producción.

---

## 4. El flujo integrado — pasos que pasan (7/7)

| # | Paso | Qué verifica (sobre el stack REAL) | Resultado |
|---|---|---|---|
| 1 | Cliente login real | `/login` → POST /api/auth/login → cookie `so_session` httpOnly seteada; redirect fuera de /login | **PASS** |
| 2 | Búsqueda | `/prestadores?oficio=Electricista&ubicacion=Posadas…` → la card del prestador sembrado aparece (geocoding real + filtro de cobertura) | **PASS** |
| 3 | Perfil | `/prestadores/[id]` → nombre/oficio/calificación/zona visibles; **sin datos de contacto (RN-CAT-05)**; CTA "Solicitar" habilitada | **PASS** |
| 4 | Solicitar | CTA → `/prestadores/[id]/solicitar` → form (fecha futura, franja, descripción) → 201 → panel "¡Solicitud enviada!"; estado `solicitada` | **PASS** |
| 5 | Prestador presupuesta | (2º contexto) login prestador → `/cuenta/solicitudes` muestra la solicitud (badge "Solicitada") → "Presupuestar" (precio) → toast éxito; probe BFF: estado `presupuestada`, precio 18000 | **PASS** |
| 6 | Cliente confirma | `/cuenta/contrataciones` → badge "Presupuestada" + precio visible → "Confirmar" → toast éxito; probe: estado `confirmada` | **PASS** |
| 7 | Prestador inicia + finaliza | "Iniciar" → `en_curso`; reload; "Finalizar" → diálogo `<ConfirmAccion>` (confirm label = "Finalizar") → toast éxito; probe: `finalizada`; visible bajo filtro "Terminadas" | **PASS** |

Manejo de las 2 sesiones: **2 browser contexts** (cliente + prestador), cada uno con login real por UI; cookies aisladas por contexto. La suite es **serial, 1 worker** (flujo stateful sobre una sola contratación) y NO usa `page.route` (tráfico real). El estado se asserta por el texto del `<EstadoBadge/>` (catálogo es-AR) y por probes in-page a `GET /api/contrataciones`.

---

## 5. Resultado de la verificación final

| Tarea | Comando | Resultado |
|---|---|---|
| Seed reproducible | `bash server/scripts/seed-e2e.sh` | OK — prestador sembrado aparece en search (auto-verificado) |
| System E2E | `npx playwright test e2e/sistema.spec.ts --project=chromium --workers=1` | **7/7 pass** |
| Regresión E2E | `npx playwright test --project=chromium --workers=1 --grep-invert "flujo integrado de sistema"` | **115/115 pass** |
| Frontend unit | `npm run test:unit` | **286/286 pass** |
| Frontend typecheck | `npx tsc --noEmit` | 0 errores |
| Frontend lint | `npm run lint` | 0 errores (1 warning ajeno pre-existente) |

---

## 6. Archivos creados / tocados

| Archivo | Tipo | Razón |
|---|---|---|
| `server/scripts/seed-e2e.sh` | Script (nuevo) | Seed reproducible: registra cliente+prestador vía API + inserta fila de catálogo `prestadores` (cobertura Argentina-wide) + servicio + verifica búsqueda |
| `client/e2e/sistema.spec.ts` | Tests (nuevo) | System E2E del happy path completo (7 pasos, 2 contextos, stack real, sin mocks) |
| `client/next.config.ts` | **Fix (BUG-01)** | Acotar el rewrite `/api/:path*` para no sombrear los Route Handlers dinámicos `/api/contrataciones/[id]/*` |
| `client/components/cuentas/seguimiento/acciones-contratacion.tsx` | **Fix (BUG-02)** | `setBusy(null)` en el camino de éxito (router.refresh es soft, no remonta) |
| `openspec/changes/mi11-verificacion-sistema/verify.md` | Doc | Este reporte |

---

## 7. Pendientes

- **OBS-04** matriz cross-browser (WebKit/Mobile Safari) — necesita `sudo playwright install-deps` / imagen Playwright; lo corre el humano/CI.
- **OBS-01** join de `servicios`/`resenas` en `toPerfil` (read-model de UC05).
- **OBS-02** tipo de `precioEstimado` (numeric→string) en el contrato JSON.
- **OBS-03** enriquecer `prestadorNombre` en el list DTO.
- **OBS-05** la búsqueda depende de Nominatim en vivo (availability ya es stub).
