/**
 * Centralized UI copy (es-AR, rioplatense neutral-formal, voseo without slang).
 * DESIGN-SYSTEM §9: every UI string lives here — nothing is hardcoded in
 * components. Prepared for future i18n (single locale today).
 */
export const copy = {
  app: {
    title: "Snack Overflow",
    description:
      "Conectá con oficios de confianza en Misiones. Creá tu cuenta para pedir o brindar servicios.",
  },

  a11y: {
    skipToContent: "Saltar al contenido",
  },

  landing: {
    eyebrow: "Snack Overflow",
    title: "Oficios de confianza, cerca tuyo",
    subtitle:
      "Conectamos vecinos de Misiones con prestadores verificados. Pedí un presupuesto o sumate como prestador.",
    cta: "Creá tu cuenta",
    loginPrompt: "¿Ya tenés cuenta?",
    loginLink: "Ingresá",
  },

  registro: {
    title: "Creá tu cuenta",
    loginPrompt: "¿Ya tenés cuenta?",
    loginLink: "Ingresá",
    terms: "Al registrarte aceptás los términos y la política de privacidad.",

    roleLegend: "¿Cómo te registrás?",
    roleHint: "Esta elección no se puede cambiar después.",
    roleCliente: "Cliente",
    roleClienteDesc: "Quiero contratar servicios",
    rolePrestador: "Prestador",
    rolePrestadorDesc: "Ofrezco mi oficio",

    nameLabel: "Nombre",
    lastNameLabel: "Apellido",
    emailLabel: "E-mail",
    emailHelp: "Ej. nombre@dominio.com",
    phoneLabel: "Teléfono",
    phoneHelp: "Formato AR, con o sin +54",
    passwordLabel: "Contraseña",
    passwordHelp: "Mínimo 8 caracteres",
    passwordShow: "Mostrar contraseña",
    passwordHide: "Ocultar contraseña",

    tradeLabel: "Oficio",
    tradeHelp: "Elegí el oficio que ofrecés",
    tradePlaceholder: "Seleccioná tu oficio",

    regulatedNotice:
      "Si tu oficio requiere matrícula, tu cuenta quedará pendiente de habilitación hasta que la acredites.",

    submit: "Crear cuenta",
    submitting: "Creando cuenta…",

    // Success / 201
    successTitle: "¡Tu cuenta fue creada!",
    successToast: "Tu cuenta fue creada exitosamente. Ya podés ingresar.",
    pendingTitle: "Cuenta creada — pendiente de habilitación",
  },

  login: {
    title: "Ingresá a tu cuenta",
    subtitlePrompt: "¿Todavía no tenés cuenta?",
    subtitleLink: "Creá una",

    emailLabel: "E-mail",
    emailHelp: "Ej. nombre@dominio.com",
    passwordLabel: "Contraseña",
    passwordShow: "Mostrar contraseña",
    passwordHide: "Ocultar contraseña",

    forgotLink: "¿Olvidaste tu contraseña?",

    submit: "Ingresar",
    submitting: "Ingresando…",

    // Banner messages (role="alert"). Catálogo es-AR del spec §"Catálogo de mensajes".
    errors: {
      // 401 — GENÉRICO, anti-enumeración (RNF-S.4): nunca revela qué campo falló.
      invalidCredentials: "E-mail o contraseña incorrectos.",
      // 403 — incluye canal de contacto a soporte.
      suspended:
        "Tu cuenta está suspendida. Escribinos a soporte@snackoverflow.com.",
      // 423 — bloqueo temporal; el submit queda deshabilitado.
      locked:
        "Cuenta bloqueada temporalmente por demasiados intentos. Probá de nuevo en unos 30 minutos.",
    },
  },

  forgot: {
    title: "Recuperá tu contraseña",
    subtitle:
      "Ingresá tu e-mail y, si está registrado, te enviamos un enlace para restablecerla.",
    backToLoginPrompt: "¿Te acordaste?",
    backToLoginLink: "Volvé a ingresar",

    emailLabel: "E-mail",
    emailHelp: "Ej. nombre@dominio.com",

    submit: "Enviar enlace",
    submitting: "Enviando…",

    // Mensaje neutro (role="status") — NO confirma ni niega la existencia de la cuenta.
    neutralMessage:
      "Si ese e-mail está registrado, te enviamos un enlace para restablecer tu contraseña.",
  },

  reset: {
    title: "Elegí una nueva contraseña",
    subtitle: "Tu nueva contraseña debe tener al menos 8 caracteres.",

    newPasswordLabel: "Nueva contraseña",
    confirmPasswordLabel: "Repetí la contraseña",
    passwordShow: "Mostrar contraseña",
    passwordHide: "Ocultar contraseña",

    submit: "Guardar contraseña",
    submitting: "Guardando…",

    // Éxito (role="status") antes de redirigir a /login.
    success: "Tu contraseña fue actualizada. Ya podés ingresar.",

    // Validación cliente (zod).
    passwordShort: "La contraseña debe tener al menos 8 caracteres.",
    mismatch: "Las contraseñas no coinciden.",

    // Pantalla "Enlace expirado" (token vencido/usado o ausente).
    expiredTitle: "Enlace expirado",
    expiredBody: "El enlace expiró o ya fue usado. Pedí uno nuevo.",
    expiredCta: "Pedir un nuevo enlace",
  },

  session: {
    logout: "Cerrar sesión",
    loggingOut: "Cerrando sesión…",
  },

  // Field-level error messages (es-AR), keyed by backend field name.
  // Never surface the raw English class-validator string (REQ-07.3).
  fieldErrors: {
    name: "Ingresá tu nombre (máximo 100 caracteres).",
    lastName: "Ingresá tu apellido (máximo 100 caracteres).",
    email: "Ingresá un e-mail válido (ej. nombre@dominio.com).",
    phone: "Ingresá un teléfono válido (formato AR, con o sin +54).",
    password: "La contraseña debe tener entre 8 y 128 caracteres.",
    role: "Elegí si te registrás como cliente o prestador.",
    trade: "Seleccioná tu oficio.",
    // Generic required-field message (login: password no aplica longitud mínima).
    required: "Este campo es obligatorio.",
  },

  // Specific inline messages
  emailTaken: "Este e-mail ya está registrado. ¿Querés ingresar?",
  emailTakenLink: "Ir a ingresar",

  // Global (banner) error messages — role="alert" summary.
  globalErrors: {
    generic: "Revisá los datos del formulario.",
    badRequest: "Faltan datos obligatorios. Revisá el formulario.",
    network: "No pudimos conectarnos. Revisá tu conexión e intentá de nuevo.",
    server: "Algo salió mal de nuestro lado. Intentá de nuevo en unos minutos.",
  },

  passwordStrength: {
    weak: "Débil",
    medium: "Media",
    strong: "Fuerte",
    label: "Fuerza de la contraseña",
  },

  // UC04 — Public provider search + profile (spec §"Catálogo de mensajes").
  catalogo: {
    // Listing screen shell.
    title: "Buscá prestadores",
    subtitle: "Encontrá oficios de confianza en tu zona.",

    // Search bar.
    oficioLabel: "Oficio",
    oficioPlaceholder: "Ej. Electricista",
    oficioHelp: "Escribí el oficio que necesitás.",
    ubicacionLabel: "Ubicación",
    ubicacionPlaceholder: "Ciudad, barrio o dirección",
    ubicacionHelp: "Indicá dónde necesitás el servicio.",
    buscar: "Buscar",
    buscando: "Buscando…",

    // Client validation errors (REQ-01, ESC-UI-02).
    errors: {
      oficioRequerido: "Elegí un oficio.",
      ubicacionRequerida: "Ingresá una ubicación.",
    },

    // Filters panel (REQ-02, ESC-UI-04).
    filtros: {
      title: "Filtros",
      abrir: "Filtros",
      cerrar: "Cerrar",
      ordenLabel: "Ordenar por",
      ordenCalificacion: "Calificación",
      ordenDistancia: "Distancia",
      ordenDisponibilidad: "Disponibilidad",
      calificacionMinLabel: "Calificación mínima",
      calificacionMinTodas: "Todas",
      calificacionMinValor: "{n} estrellas o más",
      fechaLabel: "Disponible desde",
      limpiar: "Limpiar filtros",
      restablecer: "Restablecer",
    },

    // Initial empty state before any search (deep-link / first visit, ADR-04-03).
    inicial: {
      titulo: "Buscá un oficio en tu zona",
      cuerpo: "Elegí un oficio e ingresá una ubicación para ver prestadores.",
    },

    // Empty result state (200 with data:[] — neutral, NOT an error; ESC-UI-03).
    vacio: {
      // {oficio}/{ubicacion} interpolated at render time.
      titulo: "No encontramos prestadores para {oficio} en {ubicacion}.",
      cuerpo:
        "Probá con otro oficio, ampliá la ubicación o quitá filtros.",
      // Always-present location guidance (covers geocoding-fail without diagnosing it, S4).
      guiaUbicacion:
        "Si no aparece nada, revisá o precisá la ubicación e intentá de nuevo.",
      cambiarOficio: "Probá con otro oficio.",
      ampliarUbicacion: "Ampliá o precisá la ubicación.",
      quitarFiltros: "Quitá filtros para ver más resultados.",
    },

    // Network / 5xx error state (role="alert"; ESC-UI-07).
    error: {
      titulo: "Algo salió mal de nuestro lado.",
      cuerpo: "Intentá de nuevo en unos minutos.",
      reintentar: "Reintentar",
    },

    // Results list (REQ-05/06).
    resultados: {
      // {total} interpolated; plural handled by the component.
      totalSingular: "{total} prestador",
      totalPlural: "{total} prestadores",
      distancia: "A {km} km",
    },

    // Pagination (REQ-06).
    paginacion: {
      anterior: "Anterior",
      siguiente: "Siguiente",
      paginaActual: "Página {n}",
      irAPagina: "Ir a la página {n}",
      label: "Paginación de resultados",
    },

    // Availability badge labels (REQ-04). `proximaPrefijo` gets the date appended.
    disponibilidad: {
      disponibleEstaSemana: "Disponible esta semana",
      proximaPrefijo: "Próxima",
      sinDisponibilidad: "Sin disponibilidad",
    },

    // Accessible rating template (REQ-03/11). {valor} already es-AR-formatted.
    calificacionAccesible: "{valor} de 5, {N} reseñas",
    estrellasAria: "Calificación",

    // Profile screen (REQ-07/08, ESC-UI-05).
    perfil: {
      volver: "Volver a la búsqueda",
      zonaTitulo: "Zona de cobertura",
      serviciosTitulo: "Servicios",
      resenasTitulo: "Reseñas",
      sinResenas: "Todavía no hay reseñas.",
      sinServicios: "Este prestador aún no publicó servicios.",
      precioDesde: "Desde ${min}",
      precioHasta: "Hasta ${max}",
      precioRango: "${min} – ${max}",
      precioConsultar: "Precio a consultar",
      clienteAnonimo: "Cliente",
      // CTA "Solicitar" — placeholder to UC07/UC08 (REQ-08, ADR-04-06).
      solicitar: "Solicitar",
      solicitarProximamente:
        "El flujo de contratación estará disponible próximamente.",
    },

    // Profile not-found screen (404 / 400 collapsed; REQ-09, ESC-UI-06).
    noEncontrado: {
      titulo: "No encontramos este prestador.",
      cuerpo: "Volvé a la búsqueda para encontrar otros prestadores.",
    },
  },

  // UC07 — Solicitar contratación (spec §"Catálogo de mensajes", REQ-01..14).
  // S1: `franja` is FREE TEXT in the backend (DTO `franja: string`, non-empty;
  // availability is validated server-side → 409 if taken). The select below is
  // a curated es-AR convenience; the value SENT is the string literal, NOT an
  // enum the backend enforces.
  solicitud: {
    // Page / form shell.
    title: "Solicitar contratación",
    // {prestador} interpolated with the provider's readable name (REQ-02).
    subtitle: "Completá los datos para solicitarle a {prestador}.",
    // Readable target line; {prestador} / {oficio} interpolated (REQ-02).
    paraPrestador: "Le estás solicitando a {prestador}",

    // Field labels (REQ-02, REQ-13).
    ubicacionLabel: "Ubicación del trabajo",
    ubicacionHelp: "¿Dónde se realiza el trabajo? Ciudad, barrio o dirección.",
    fechaLabel: "Fecha",
    fechaHelp: "Elegí hoy o una fecha futura.",
    franjaLabel: "Franja horaria",
    franjaPlaceholder: "Elegí una franja",
    descripcionLabel: "Descripción del problema",
    descripcionHelp: "Contanos qué necesitás resolver.",

    submit: "Enviar solicitud",
    submitting: "Enviando…",

    // Curated time slots (S1). Values are FREE-TEXT strings sent to the backend.
    franjas: [
      "Mañana (08–12)",
      "Mediodía (12–14)",
      "Tarde (14–18)",
      "Noche (18–22)",
    ],

    // Client / 400 field errors (spec §"Catálogo de mensajes").
    errors: {
      ubicacionRequerida: "Ingresá la ubicación del trabajo.",
      franjaRequerida: "Elegí una franja horaria.",
      descripcionRequerida: "Contanos qué necesitás resolver.",
      fechaRequerida: "Elegí una fecha.",
      fechaPasada: "La fecha debe ser hoy o una fecha futura.",
    },

    // CTA copy by user context (REQ-01, ESC-UI-02).
    cta: {
      anonimo: "Iniciá sesión para solicitar a este prestador.",
      prestador: "Solo los clientes pueden solicitar una contratación.",
    },

    // Outcome messages (REQ-05/08/09/11).
    exito:
      "¡Solicitud enviada! El prestador la recibirá y te responderá con una propuesta.",
    exitoTitulo: "¡Solicitud enviada!",
    volverAlPerfil: "Volver al perfil",
    // 409 — actionable, NOT a generic error (REQ-09).
    franjaOcupada:
      "Esa franja ya no está disponible. Elegí otra franja para tu solicitud.",
    // 404 — provider no longer available (REQ-08).
    noDisponible:
      "Este prestador ya no está disponible para recibir solicitudes. Volvé a la búsqueda.",
    volverABusqueda: "Volver a la búsqueda",
    // network / 5xx (REQ-11) — non-technical, no traces.
    redServer:
      "No pudimos enviar tu solicitud. Revisá tu conexión e intentá de nuevo.",
    // 400 fallback summary (role="alert") when no field maps (REQ-10).
    validacionGenerica: "Revisá los datos del formulario.",
  },

  // UC08 — Bandeja del prestador + responder (spec §"Catálogo de mensajes",
  // REQ-02..15). Every string here is es-AR; nothing is hardcoded in components.
  bandeja: {
    // Page / shell (REQ-02).
    title: "Solicitudes recibidas",
    subtitle: "Respondé las solicitudes pendientes de tus clientes.",

    // Per-item labels (REQ-02).
    clienteLabel: "Cliente",
    ubicacionLabel: "Ubicación",
    fechaLabel: "Fecha pedida",
    franjaLabel: "Franja pedida",
    descripcionLabel: "Descripción",
    precioLabel: "Precio estimado",

    // Estado badges — texto SIEMPRE visible (WCAG 1.4.1, REQ-15).
    badges: {
      solicitada: "Solicitada",
      presupuestada: "Presupuestada",
      confirmada: "Confirmada",
      cancelada: "Cancelada",
      en_curso: "En curso",
      finalizada: "Finalizada",
    },

    // Empty state (200 with [] — neutral, NOT an error; REQ-03, ESC-UI-07).
    vacio: "No tenés solicitudes pendientes por ahora.",

    // Error listing (network / 5xx — role="alert"; REQ-03, ESC-UI-07).
    errorListar:
      "No pudimos cargar tus solicitudes. Revisá tu conexión e intentá de nuevo.",
    reintentar: "Reintentar",

    // Presupuestar action (REQ-04/05/07).
    presupuestar: "Presupuestar",
    presupuestando: "Enviando…",
    precioPlaceholder: "Ej. 15000",
    franjaPlaceholder: "Elegí una franja",
    enviarPropuesta: "Enviar propuesta",
    cancelarAccion: "Cancelar",

    // Reject action (REQ-06).
    rechazar: "Rechazar",
    rechazando: "Rechazando…",
    confirmarRechazar:
      "¿Seguro que querés rechazar esta solicitud? No se puede deshacer.",
    confirmarRechazarSi: "Sí, rechazar",

    // Outcome messages (spec §"Catálogo de mensajes", REQ-05/06/09..12).
    exitoPresupuestar:
      "¡Propuesta enviada! El cliente la revisará y te confirmará.",
    exitoRechazar: "Rechazaste la solicitud. El cliente fue notificado.",
    // 409 — actionable, NOT a system failure (REQ-11).
    estadoCambiado:
      "Esta solicitud ya no se puede responder porque su estado cambió. Actualizamos tu bandeja.",
    // 404 — no longer available / foreign (REQ-10).
    noDisponible: "Esta solicitud ya no está disponible.",
    // 403 — non-prestador (prevented client-side; REQ-09).
    forbidden: "Solo los prestadores pueden responder solicitudes.",
    // network / 5xx (REQ-12) — non-technical, no traces.
    errorResponder:
      "No pudimos enviar tu respuesta. Revisá tu conexión e intentá de nuevo.",

    // Client validation errors (REQ-07, ESC-UI-05).
    errors: {
      precioInvalido: "El precio estimado debe ser mayor a cero.",
      precioRequerido: "Ingresá un precio estimado.",
      fechaRequerida: "Elegí una fecha.",
      fechaPasada: "La fecha de la propuesta debe ser hoy o una fecha futura.",
      franjaRequerida: "Elegí una franja horaria para la propuesta.",
    },
  },

  // ───────────────────────────────────────────────────────────────────────
  // UC09 — seguimiento y gestión de estados (spec §Catálogo, REQ-06/09/11/12).
  // ───────────────────────────────────────────────────────────────────────
  seguimiento: {
    // Page / shell (REQ-05).
    title: "Mis contrataciones",
    subtitle: "Seguí el estado de tus contrataciones y gestioná cada paso.",

    // Per-item labels (REQ-06).
    contraparteClienteLabel: "Prestador",
    contraparteCliente: "Cliente",
    ubicacionLabel: "Ubicación",
    fechaLabel: "Fecha",
    franjaLabel: "Franja",
    precioLabel: "Precio estimado",

    // Filter (REQ-05 — activas vs. terminadas).
    filtroLabel: "Filtrar por estado",
    filtroActivas: "Activas",
    filtroTerminadas: "Terminadas",
    filtroTodas: "Todas",

    // "Próximo paso" por (rol, estado) — catálogo es-AR EXACTO (REQ-06).
    proximoPaso: {
      clientePresupuestada:
        "El prestador te envió una propuesta. Revisala y confirmá o rechazá.",
      clienteConfirmada:
        "Confirmaste la contratación. El prestador registrará el inicio del trabajo.",
      prestadorConfirmada:
        "Acordado. Cuando arranques el trabajo, registrá el inicio.",
      prestadorEnCurso:
        "Trabajo en curso. Cuando termines, confirmá la finalización.",
      finalizada: "Servicio finalizado.",
      cancelada: "Esta contratación fue cancelada.",
    },

    // Action labels (REQ-07).
    acciones: {
      confirmar: "Confirmar",
      iniciar: "Iniciar",
      finalizar: "Finalizar",
      cancelar: "Cancelar",
      rechazar: "Rechazar",
    },

    // Success messages — catálogo es-AR (REQ-11).
    exito: {
      confirmar:
        "¡Listo! Confirmaste la propuesta. El prestador va a iniciar el trabajo.",
      iniciar:
        "Registraste el inicio del trabajo. La contratación está en curso.",
      finalizar: "Confirmaste la finalización del servicio. ¡Gracias!",
      cancelar: "Cancelaste la contratación.",
    },

    // Confirmation prompts for irreversible actions (REQ-09).
    confirmar: {
      finalizar: "¿Confirmás que el servicio finalizó? No se puede deshacer.",
      cancelar:
        "¿Seguro que querés cancelar esta contratación? No se puede deshacer.",
      si: "Sí, confirmar",
      no: "No, volver",
    },

    // Outcome mapping (REQ-12/13).
    // 409 — actionable, NOT a system failure (REQ-12).
    estadoCambiado:
      "Esta acción ya no es posible porque el estado de la contratación cambió. Actualizamos tu vista.",
    // 404 — no longer available / foreign (REQ-13).
    noDisponible: "Esta contratación ya no está disponible.",
    // 403 — prevented client-side via accionesPara (REQ-07).
    forbidden:
      "No tenés permiso para realizar esta acción sobre la contratación.",
    // Empty state (200 with [] — neutral, NOT an error; ESC-UI-10).
    vacio: "Todavía no tenés contrataciones.",
    // network / 5xx listing (role="alert"; ESC-UI-10).
    errorListar:
      "No pudimos cargar tus contrataciones. Revisá tu conexión e intentá de nuevo.",
    reintentar: "Reintentar",
    // network / 5xx acting (REQ-12) — non-technical, no traces.
    errorAccionar:
      "No pudimos completar la acción. Revisá tu conexión e intentá de nuevo.",
  },
} as const;

export type Copy = typeof copy;
