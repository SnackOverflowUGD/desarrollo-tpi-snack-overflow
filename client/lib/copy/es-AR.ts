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
} as const;

export type Copy = typeof copy;
