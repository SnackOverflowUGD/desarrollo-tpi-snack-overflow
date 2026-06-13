
Trabajo Práctico Integrador  
Metodologías Avanzadas

Plataforma de Economía Colaborativa Basada en Oficios

**Nombre del grupo:** “Snack Overflow”  
**Docente tutor:** Ing. Edgardo A. Belloni

| Apellido y Nombre | Matrícula |
| ----- | :---: |
| Dos Santos, Mauricio | 67609 |
| Hillebrand, Giuliano | 67625 |
| Lezcano, León Joaquín | 67569 |
| Nieto Arboitte, Ignacio Tomás | 67760 |
| Pirovani, Antonella | 67539 |
| Romero, Micaela Denisse | 67542 |

# ÍNDICE DE CONTENIDOS 

[**DESARROLLO. PARTE I: (MODELOS DE) PROCESOS DE DESARROLLO DE SOFTWARE	8**](#desarrollo.-parte-i:-\(modelos-de\)-procesos-de-desarrollo-de-software)

[**GLOSARIO:	8**](#glosario:)

[1\. Síntesis de puntos clave de modelos de procesos de desarrollo de software	10](#1.-síntesis-de-puntos-clave-de-modelos-de-procesos-de-desarrollo-de-software)

[A. Modelos prescriptivos (o dirigidos por un plan)	11](#a.-modelos-prescriptivos-\(o-dirigidos-por-un-plan\))

[A.1. Modelo de cascada	11](#a.1.-modelo-de-cascada)

[A.1.1. STRADIS	12](#a.1.1.-stradis)

[A.1.2. V-Model	12](#a.1.2.-v-model)

[A.1.2.1. V-Modell XT	14](#a.1.2.1.-v-modell-xt)

[A.2. Proceso unificado	15](#a.2.-proceso-unificado)

[A.2.2.1. Rational Unified Process	16](#a.2.2.1.-rational-unified-process)

[A.2.2.2. OpenUP	16](#a.2.2.2.-openup)

[A.3. Proceso Evolutivo	17](#a.3.-proceso-evolutivo)

[A.3.1. Modelo espiral de Boehm	17](#a.3.1.-modelo-espiral-de-boehm)

[A.3.1.1. Win-Win	18](#a.3.1.1.-win-win)

[A.3.1.2. MBASE	20](#a.3.1.2.-mbase)

[B. Modelos de procesos ágiles	21](#b.-modelos-de-procesos-ágiles)

[B.1. Programación Extrema (eXtreme Programming)	21](#b.1.-programación-extrema-\(extreme-programming\))

[B.2. Scrum	22](#b.2.-scrum)

[B.3. Kanban	24](#b.3.-kanban)

[B.4. DevOps	25](#b.4.-devops)

[C. Prácticas	25](#c.-prácticas)

[C.1. Desarrollo incremental	25](#c.1.-desarrollo-incremental)

[C.2. Prototipado	26](#c.2.-prototipado)

[C.3. Integración y configuración	27](#c.3.-integración-y-configuración)

[C.4. Enfoques dirigidos por Artefactos	28](#c.4.-enfoques-dirigidos-por-artefactos)

[C.4.1. Ingeniería dirigida por modelos (MDE)	28](#c.4.1.-ingeniería-dirigida-por-modelos-\(mde\))

[C.4.2. Arquitectura dirigida por modelos (MDA)	28](#c.4.2.-arquitectura-dirigida-por-modelos-\(mda\))

[C.5. Spec-Driven Development (SDD)	30](#c.5.-spec-driven-development-\(sdd\))

[2\. Resumen a modo de CVs de los integrantes	32](#2.-resumen-a-modo-de-cvs-de-los-integrantes)

[Dos Santos, Mauricio	32](#dos-santos,-mauricio)

[Hillebrand, Giuliano	34](#hillebrand,-giuliano)

[Lezcano, León Joaquín	37](#lezcano,-león-joaquín)

[Nieto, Tomas	39](#nieto,-tomas)

[Pirovani, Antonella	40](#pirovani,-antonella)

[Romero, Micaela Denisse	42](#romero,-micaela-denisse)

[3\. Caso de estudio seleccionado: Plataforma de Economía Colaborativa Basada en Oficios	44](#3.-caso-de-estudio-seleccionado:-plataforma-de-economía-colaborativa-basada-en-oficios)

[Motivaciones para la selección	44](#motivaciones-para-la-selección)

[Visión del Proyecto	45](#visión-del-proyecto)

[Análisis de mercado / negocio	45](#análisis-de-mercado-/-negocio)

[Dominio del problema	45](#dominio-del-problema)

[Análisis de riesgos4. Caso de Estudio: Detalle y Alcance	45](#análisis-de-riesgos.-caso-de-estudio:-detalle-y-alcance)

[4.a. Descripción, contexto y requisitos del caso de estudio	45](#4.a.-descripción,-contexto-y-requisitos-del-caso-de-estudio)

[Antecedentes y contexto	45](#antecedentes-y-contexto)

[Descripción del sistema	46](#descripción-del-sistema)

[Alcance de Servicios	46](#alcance-de-servicios)

[Stakeholders	46](#stakeholders)

[REQUISITOS	48](#requisitos)

[Requisitos Funcionales Esenciales	48](#requisitos-funcionales-esenciales)

[Requisitos (Atributos de Calidad) NO Funcionales principales.	53](#requisitos-\(atributos-de-calidad\)-no-funcionales-principales.)

[Tipos de producto y de Tipo de Sistemas o Aplicaciones de Software involucrados	61](#tipos-de-producto-y-de-tipo-de-sistemas-o-aplicaciones-de-software-involucrados)

[4.b. Adaptación del caso a una realidad regional	61](#4.b.-adaptación-del-caso-a-una-realidad-regional)

[Legislaciones revisadas	61](#legislaciones-revisadas)

[Legislaciones a revisar	63](#legislaciones-a-revisar)

[Análisis de Mercado	63](#análisis-de-mercado)

[4.c. Ventajas y desventajas de aplicar cada proceso de desarrollo de software al caso de estudio	64](#4.c.-ventajas-y-desventajas-de-aplicar-cada-proceso-de-desarrollo-de-software-al-caso-de-estudio)

[Modelos dirigidos por un plan	66](#modelos-dirigidos-por-un-plan)

[STRADIS	66](#stradis)

[Rational Unified Process	66](#rational-unified-process)

[V-Modell XT	67](#v-modell-xt)

[Open UP	68](#open-up)

[Win Win	69](#win-win)

[MBASE	69](#mbase)

[Modelos de procesos ágiles	70](#modelos-de-procesos-ágiles)

[XP	70](#xp)

[Scrum	71](#scrum)

[Kanban	71](#kanban)

[DevOps	72](#devops)

[Análisis cualitativo	74](#análisis-cualitativo)

[Análisis cuantitativo	77](#análisis-cuantitativo)

[Subcriterios	77](#subcriterios)

[Ponderación de los subcriterios	79](#ponderación-de-los-subcriterios)

[Puntaje asignados por subcriterios	80](#puntaje-asignados-por-subcriterios)

[4.d. Procesos más convenientes de aplicar al caso de estudio	84](#4.d.-procesos-más-convenientes-de-aplicar-al-caso-de-estudio)

[Cuadro resumen del/los proceso/s seleccionado/s	86](#cuadro-resumen-del/los-proceso/s-seleccionado/s)

[5\. Simplificación y/o adaptación del proceso de desarrollo seleccionado	87](#5.-simplificación-y/o-adaptación-del-proceso-de-desarrollo-seleccionado)

[Disciplina: Ingeniería de Requerimientos	88](#disciplina:-ingeniería-de-requerimientos)

[Disciplina: Diseño (Arquitectónico y Detallado)	89](#disciplina:-diseño-\(arquitectónico-y-detallado\))

[Disciplina: Implementación	90](#disciplina:-implementación)

[Disciplina: Verificación y Validación	91](#disciplina:-verificación-y-validación)

[Disciplina: Evolución	92](#disciplina:-evolución)

[6\. Meta-modelo del proceso de desarrollo global	94](#6.-meta-modelo-del-proceso-de-desarrollo-global)

[Perspectiva estática (estructural)	94](#perspectiva-estática-\(estructural\))

[Meta-Modelo de Proceso Global (Producto del Trabajo):	95](#meta-modelo-de-proceso-global-\(producto-del-trabajo\):)

[Meta-Modelo de Fases del Proceso Global:	97](#meta-modelo-de-fases-del-proceso-global:)

[Meta-Modelo de Disciplinas del Proceso Global:	97](#meta-modelo-de-disciplinas-del-proceso-global:)

[Meta-Modelo de Roles del Proceso Global:	98](#meta-modelo-de-roles-del-proceso-global:)

[Equipo De Desarrollo (roles humanos):	99](#equipo-de-desarrollo-\(roles-humanos\):)

[Roles del pipeline SDD (no humanos):	99](#roles-del-pipeline-sdd-\(no-humanos\):)

[Asignación de Roles en el Equipo:	101](#asignación-de-roles-en-el-equipo)

[Meta-Modelo de Artefactos del Proceso Global:	102](#meta-modelo-de-artefactos-del-proceso-global:)

[Lista de Artefactos a Realizar	103](#lista-de-artefactos-a-realizar)

[Meta-Modelo de Artefactos del Proceso Global:	105](#meta-modelo-de-artefactos-del-proceso-global:-1)

[Perspectiva dinámica (comportamiento)	106](#perspectiva-dinámica-\(comportamiento\))

[Meta-Modelo del Ciclo de Vida de Desarrollo:	106](#meta-modelo-del-ciclo-de-vida-de-desarrollo:)

[Hitos por fase en OpenUp	107](#hitos-por-fase-en-openup)

[Meta-Modelo del Proceso de Desarrollo Global \- Fase de Inicio:	108](#meta-modelo-del-proceso-de-desarrollo-global---fase-de-inicio:)

[Meta-Modelo del Proceso de Desarrollo Global \- Fase de Elaboración:	110](#meta-modelo-del-proceso-de-desarrollo-global---fase-de-elaboración:)

[Meta-Modelo del Proceso de Desarrollo Global \- Fase de Construcción:	112](#meta-modelo-del-proceso-de-desarrollo-global---fase-de-construcción:)

[Meta-Modelo de Desarrollo de Sprint	114](#meta-modelo-de-desarrollo-de-sprint)

[Meta-Modelo del Pipeline SSD (1) (Asistido por AI):	115](#meta-modelo-del-pipeline-ssd-\(1\)-\(asistido-por-ai\):)

[Meta-Modelo del Pipeline SSD 1.1: Generar Spec Ejecutable Válida	117](#meta-modelo-del-pipeline-ssd-1.1:-generar-spec-ejecutable-válida)

[Meta-Modelo del Pipeline SSD 1.2: Generar Diseño Detallado Válido	118](#meta-modelo-del-pipeline-ssd-1.2:-generar-diseño-detallado-válido)

[Meta-Modelo del Pipeline SSD 1.3: Generar Código Fuente Válido	119](#meta-modelo-del-pipeline-ssd-1.3:-generar-código-fuente-válido)

[Meta-Modelo del Pipeline SSD 1.4: Generar Reporte de Validación Válido	120](#meta-modelo-del-pipeline-ssd-1.4:-generar-reporte-de-validación-válido)

[Meta-Modelo del Proceso de Desarrollo Global \- Fase de Transición:	121](#meta-modelo-del-proceso-de-desarrollo-global---fase-de-transición:)

[7\. Meta-modelo de la disciplina de Ingeniería de Requerimientos	123](#7.-meta-modelo-de-la-disciplina-de-ingeniería-de-requerimientos)

[Perspectiva dinámica (comportamiento)	124](#perspectiva-dinámica-\(comportamiento\)-1)

[Perspectiva estática (estructural)	125](#perspectiva-estática-\(estructural\)-1)

[Descripción de elementos	126](#descripción-de-elementos)

[8\. Meta-modelo de la disciplina de Diseño	126](#8.-meta-modelo-de-la-disciplina-de-diseño)

[Perspectiva dinámica (comportamiento)	127](#perspectiva-dinámica-\(comportamiento\)-2)

[Figura Nx \- Meta-modelo de Disciplina de Diseño	127](#figura-nx---meta-modelo-de-disciplina-de-diseño)

[Perspectiva estática (estructural)	128](#perspectiva-estática-\(estructural\)-2)

[Proceso para evaluar arquitecturas	129](#proceso-para-evaluar-arquitecturas)

[Descripción de elementos	130](#descripción-de-elementos-1)

[9\. Meta-modelo de la disciplina de Verificación (Prueba del Software)	130](#9.-meta-modelo-de-la-disciplina-de-verificación-\(prueba-del-software\))

[Perspectiva dinámica (comportamiento)	132](#perspectiva-dinámica-\(comportamiento\)-3)

[Perspectiva estática (estructural)	133](#perspectiva-estática-\(estructural\)-3)

[10\. Consideraciones preliminares: estándares, entornos, tecnologías y herramientas	134](#10.-consideraciones-preliminares:-estándares,-entornos,-tecnologías-y-herramientas)

[Estándares a considerar	134](#estándares-a-considerar)

[Entornos	135](#entornos)

[Tecnologías	136](#tecnologías)

[Herramientas a utilizar y/o integrar	138](#herramientas-a-utilizar-y/o-integrar)

[**DESARROLLO. PARTE II: CONCEPCIÓN, ELABORACIÓN Y CONSTRUCCIÓN DE SISTEMAS DE SW	141**](#desarrollo.-parte-ii:-concepción,-elaboración-y-construcción-de-sistemas-de-sw)

[11\. Ejecución del proceso de desarrollo	141](#11.-ejecución-del-proceso-de-desarrollo)

[11.a. Ingeniería de Requerimientos	141](#11.a.-ingeniería-de-requerimientos)

[Documento de Visión del Proyecto	141](#documento-de-visión-del-proyecto)

[Declaración del problema	142](#declaración-del-problema)

[Declaración de posicionamiento del producto	143](#declaración-de-posicionamiento-del-producto)

[Stakeholders y usuarios	143](#stakeholders-y-usuarios)

[Análisis de mercado / negocio	145](#análisis-de-mercado-/-negocio-1)

[Dominio del problema	146](#dominio-del-problema-1)

[Glosario de Dominio	147](#glosario-de-dominio)

[Lista de Riesgos del Proyecto	148](#lista-de-riesgos-del-proyecto)

[Requerimientos de Usuario	151](#requerimientos-de-usuario)

[Requerimientos de usuario del actor Cliente	151](#requerimientos-de-usuario-del-actor-cliente)

[Requerimientos de usuario del actor Prestador	152](#requerimientos-de-usuario-del-actor-prestador)

[Requerimientos de usuario del actor Administrador	152](#requerimientos-de-usuario-del-actor-administrador)

[Requerimientos del Sistema	153](#requerimientos-del-sistema)

[Trazabilidad entre requerimientos de usuario y requisitos del sistema	153](#trazabilidad-entre-requerimientos-de-usuario-y-requisitos-del-sistema)

[Requerimientos Funcionales (subclasificaciones y métricas)	154](#requerimientos-funcionales-\(subclasificaciones-y-métricas\))

[Requisitos funcionales nuevos: descripción y prioridad	155](#requisitos-funcionales-nuevos:-descripción-y-prioridad)

[Requerimientos funcionales ampliados: subclasificación y criterios de aceptación	157](#requerimientos-funcionales-ampliados:-subclasificación-y-criterios-de-aceptación)

[Requerimientos No Funcionales (subclasificaciones y métricas)	160](#requerimientos-no-funcionales-\(subclasificaciones-y-métricas\))

[Requerimientos no funcionales ampliados: subclasificación según Sommerville e ISO/IEC 25010	161](#requerimientos-no-funcionales-ampliados:-subclasificación-según-sommerville-e-iso/iec-25010)

[Requisitos no funcionales organizacionales incorporados en la Parte II	162](#requisitos-no-funcionales-organizacionales-incorporados-en-la-parte-ii)

[Diagrama de Casos de Uso	163](#diagrama-de-casos-de-uso)

[Tabla de trazabilidad de Caso de Uso con Requisitos Funcionales y Actor Primario	168](#tabla-de-trazabilidad-de-caso-de-uso-con-requisitos-funcionales-y-actor-primario)

[Especificación de Casos de Uso	169](#especificación-de-casos-de-uso)

[UC01: Registrarse	169](#uc01:-registrarse)

[UC02: Autenticarse	171](#uc02:-autenticarse)

[UC03: Gestionar perfil	172](#uc03:-gestionar-perfil)

[UC04: Buscar prestadores	173](#uc04:-buscar-prestadores)

[UC05: Publicar servicios	174](#uc05:-publicar-servicios)

[UC06: Gestionar agenda y disponibilidad	175](#uc06:-gestionar-agenda-y-disponibilidad)

[UC07: Solicitar contratación	176](#uc07:-solicitar-contratación)

[UC08: Enviar propuesta o rechazar solicitud	178](#uc08:-enviar-propuesta-o-rechazar-solicitud)

[UC09: Gestionar estados de la contratación	179](#uc09:-gestionar-estados-de-la-contratación)

[UC10: Cancelar contratación	180](#uc10:-cancelar-contratación)

[UC11: Intercambiar mensajes	182](#uc11:-intercambiar-mensajes)

[UC12: Pagar servicio	183](#uc12:-pagar-servicio)

[UC13: Confirmar finalización y liberar pago	184](#uc13:-confirmar-finalización-y-liberar-pago)

[UC14: Calificar prestador	185](#uc14:-calificar-prestador)

[UC15: Responder reseña	186](#uc15:-responder-reseña)

[UC16: Moderar reseñas	187](#uc16:-moderar-reseñas)

[UC17: Gestionar perfiles (suspensión/baja)	188](#uc17:-gestionar-perfiles-\(suspensión/baja\))

[UC18: Verificar habilitaciones profesionales	189](#uc18:-verificar-habilitaciones-profesionales)

[UC19: Notificar cambio de estado	191](#uc19:-notificar-cambio-de-estado)

[UC20: Iniciar servicio	191](#uc20:-iniciar-servicio)

[UC21: Responder propuesta de prestador	192](#uc21:-responder-propuesta-de-prestador)

[11.b. Diseño Arquitectónico	194](#11.b.-diseño-arquitectónico)

[Arquitecturas alternativas propuestas	194](#arquitecturas-alternativas-propuestas)

[Patrones arquitectónicos considerados (Buschmann, 1996\)	197](#patrones-arquitectónicos-considerados-\(buschmann,-1996\))

[Escenarios de evaluación	200](#escenarios-de-evaluación)

[Selección y evaluación de la arquitectura	203](#selección-y-evaluación-de-la-arquitectura)

[ADR-01: Estilo arquitectónico	207](#adr-01:-estilo-arquitectónico)

[ADR-02: Integración con sistemas externos	208](#adr-02:-integración-con-sistemas-externos)

[ADR-03: Persistencia	208](#adr-03:-persistencia)

[11.c. Diseño Detallado	209](#11.c.-diseño-detallado)

[Patrones de Diseño considerados (Gamma et al., 1994\)	209](#patrones-de-diseño-considerados-\(gamma-et-al.,-1994\))

[Modelos de diseño detallado	215](#modelos-de-diseño-detallado)

[Artefacto Interfaz	218](#artefacto-interfaz)

[11.d. Proyección del Desarrollo	219](?tab=t.0#heading=h.f6fvahenkpi3)

[**CONCLUSIONES	219**](#conclusiones)

[12\. Cumplimiento de los objetivos del trabajo	219](#12.-cumplimiento-de-los-objetivos-del-trabajo)

[13\. Limitaciones y trabajos futuros	220](#13.-limitaciones-y-trabajos-futuros)

[Limitaciones generales	220](#limitaciones-generales)

[Limitaciones de diseño	220](?tab=t.0#heading=h.ytgmrvtqxz1o)

[Limitaciones técnicas y operativas	220](#limitaciones-de-diseño,-técnicas-y-operativas)

[Limitaciones de herramientas y tecnologías propuestas	220](#limitaciones-de-herramientas-y-tecnologías-propuestas)

[Trabajos futuros (evolución potencial proyectada)	220](?tab=t.0#heading=h.718b6hlvlj2k)

[**Referencias	221**](#referencias)

[Anexo A: Profesiones y Regulaciones	228](#anexo-a:-profesiones-y-regulaciones)

[Instalaciones	228](#instalaciones)

[Estructura y exterior	229](#estructura-y-exterior)

[Espacios verdes	230](#espacios-verdes)

[Hogar y limpieza	231](#hogar-y-limpieza)

[Climatización	231](#climatización)

[Seguridad	232](#seguridad)

[Reparaciones generales	233](#reparaciones-generales)

[Notas	233](#notas)

[Anexo B: Modelo de calidad de producto ISO/IEC 25010	235](#anexo-b:-modelo-de-calidad-de-producto-iso/iec-25010)

[Anexo de coevaluación	237](#anexo-d:-coevaluación)

[Tabla de coevaluación	237](#co-evaluación-de-la-producción-respecto-a-los-criterios)

# INDICE DE TABLAS

[Tabla 1\. Requisitos Funcionales Esenciales	30](?tab=t.0#heading=h.3p2wlh5folkl)

[Tabla 2\. Requisitos no funcionales: Aceptabilidad.	32](?tab=t.0#heading=h.86shg3mxjk2f)

[Tabla 3\. Requisitos no funcionales: Fiabilidad y Seguridad	33](?tab=t.0#heading=h.gsvk1s5ddo30)

[Tabla 4\. Requisitos no funcionales: Eficiencia	34](?tab=t.0#heading=h.f7llyvwtwi0l)

[Tabla 5\. Requisitos no funcionales: Mantenibilidad	35](?tab=t.0#heading=h.ygcstlxl9ifb)

[Tabla 6\. Cuadro comparativo de ventajas y desventajas de los Modelos de Procesos propuestos	50](?tab=t.0#heading=h.jgr7r76t0zys)

[Tabla 7\. Ponderación de los subcriterios para el análisis cuantitativo	53](#ponderación-de-los-subcriterios-para-el-análisis-cuantitativo)

[Tabla 8\. Puntajes asignados por subcriterio	54](?tab=t.0#heading=h.3br07ru6zt9b)

[Tabla 9\. Profesiones cubiertas para categoría “Instalaciones”.	58](?tab=t.0#heading=h.cp2t0yg1r2m8)

[Tabla 10\. Profesiones cubiertas para categoría “Estructura y exterior”.	59](?tab=t.0#heading=h.qijvmrca31cz)

[Tabla 11\. Profesiones cubiertas para categoría “Espacios verdes”.	59](#heading)

[Tabla 12\. Profesiones cubiertas para categoría “Hogar y limpieza”.	60](#profesiones-cubiertas-para-categoría-“hogar-y-limpieza”.)

[Tabla 13\. Profesiones cubiertas para categoría “Climatización”.	60](#profesiones-cubiertas-para-categoría-“climatización”.)

[Tabla 14\. Profesiones cubiertas para categoría “Seguridad”.	61](#heading-1)

[Tabla 15\. Profesiones cubiertas para categoría “Reparaciones Generales”.	62](#heading-2)

# ÍNDICE DE ILUSTRACIONES 

# DECLARACIÓN DE USO DE INTELIGENCIA ARTIFICIAL

Para el desarrollo de este trabajo, el equipo utilizó como herramienta de apoyo la utilización de los modelos de inteligencia artificial **Claude (Sonnet 4.6, Opus 4.8)**, **Gemini (3.1 Pro)** y **NotebookLM (el cual utiliza Gemini como base)**. Sin embargo, el entorno de ambos modelos fue configurado para que utilice única y exclusivamente la bibliografía mencionada en las referencias. Para asegurarse de esto, el equipo validó en todo momento que la producción sea consistente con los conceptos teóricos encontrados en la bibliografía. Por lo tanto, toda producción generada por ambos modelos fue utilizada como base, nunca como producción final.

# DESARROLLO. PARTE I: (MODELOS DE) PROCESOS DE DESARROLLO DE SOFTWARE {#desarrollo.-parte-i:-(modelos-de)-procesos-de-desarrollo-de-software}

CONSIGNAS PARA PARTE I  
ELABORAR UN DOCUMENTO DE INFORME EN EL QUE…

1.- SINTETICEN PUNTOS CLAVE de (modelos de) procesos de desarrollo de software cubiertos u objeto de revisión autónoma en esta asignatura. Por ej. incluyan: Modelos Dirigidos por un Plan; Modelos Genéricos de Procesos de Desarrollo Componibles e Híbridos (Unified Process o variantes del mismo, por ej. Open UP); V-Model; Métodos Ágiles; entre otros.

# GLOSARIO: {#glosario:}

**Artefacto:** (1) Documento tangible y legible por máquina creado durante el desarrollo de software. (ISO/IEC/IEEE 2017, p. 35).  
**Compuerta de calidad:** Las compuertas de calidad son puntos de control predefinidos en el ciclo de vida del desarrollo de software, ubicadas en varias etapas del proyecto. En estos puntos, criterios específicos deben satisfacerse para poder avanzar a la siguiente fase. (Uzunova, N., Pavlič L.  y Beranič T 2024\. p. 2).  
**Herramienta:** (1) producto de software que ofrece soporte para los procesos del ciclo de vida del software y los sistemas. (2) Algo tangible, como una plantilla o un programa de software, que se utiliza para llevar a cabo una actividad con el fin de obtener un producto o un resultado. (ISO/IEC/IEEE 2017, p. 476).  
**Human in the loop:** Human-in-the-Loop (HITL) se refiere a un sistema o proceso en el que un ser humano participa activamente en el funcionamiento, la supervisión o la toma de decisiones de un sistema automatizado. En el contexto de la IA, HITL se refiere a la intervención de los seres humanos en algún momento del flujo de trabajo de la IA para garantizar la precisión, la seguridad, la responsabilidad o la toma de decisiones éticas. (Cole Stryker 2025\)  
**Modelo:** (1) Representación de un proceso, dispositivo o concepto del mundo real. (2) Representación de algo que omite ciertos aspectos del objeto modelado  
**Pipeline:** técnica de diseño de software o hardware en la que la salida de un proceso sirve como entrada para un segundo, la salida del segundo proceso sirve como entrada para un tercero, y así sucesivamente, a menudo con simultaneidad dentro de un mismo tiempo de ciclo.  (ISO/IEC/IEEE 2017, p. 321\)  
**Proceso:** (1) conjunto de actividades interrelacionadas o que interactúan entre sí, las cuales transforman los insumos en productos (ISO/IEC/IEEE 2017, p. 334).  
**Proceso de desarrollo de software:** (1) proceso en el cual las necesidades de usuario son traducidas a un producto de software. El proceso involucra traducir necesidades de usuario a requisitos de software, transformar los requisitos de software a un diseño, implementar el diseño en código, probar el código y, a veces, instalar y revisar el programa para su uso. Estas actividades se pueden superponer o realizar de forma iterativa (ISO/IEC/IEEE 2017, p. 417).  
**Práctica:** (1) tipo específico de actividad que contribuye a la ejecución de un proceso (ISO/IEC/IEEE 2017, p. 328).A  
**Técnica:** (1) un proceso sistemático definido utilizado por un recurso humano para realizar una actividad para producir un producto o resultado, o para entregar un servicio, y que puede emplear una o más herramientas (ISO/IEC/IEEE 2017, p. 460).

## 1\. Síntesis de puntos clave de modelos de procesos de desarrollo de software {#1.-síntesis-de-puntos-clave-de-modelos-de-procesos-de-desarrollo-de-software}

![][image1]

### ***A. Modelos prescriptivos (o dirigidos por un plan)*** {#a.-modelos-prescriptivos-(o-dirigidos-por-un-plan)}

	Según Sommerville (2016, p. 45), los procesos dirigidos por planes son procesos donde todas las actividades del proceso se planifican con antelación y el progreso se mide contra este plan.

#### **A.1. Modelo de cascada** {#a.1.-modelo-de-cascada}

Según Pressman y Maxim (2020, pp. 25-26), el modelo en cascada es un enfoque sistemático y secuencial (con posibilidad de utilizar retroalimentación entre fases, pero no es muy utilizado en la actualidad) del desarrollo de software.  
Se divide el modelo en las siguientes etapas:

1. Comunicación: inicialización del proyecto y recolección de requisitos.  
2. Planeación: estimación, programación y seguimiento.  
3. Modelado: análisis y diseño.  
4. Construcción: Programación de código y pruebas.  
5. Implementación: entrega, soporte y retroalimentación.

El modelo en cascada es apropiado cuando se aplica en…

* Sistemas integrados, donde el software se tiene que adaptar a las características del hardware con el que va a interactuar.  
* Sistemas críticos, donde el análisis de la seguridad y protección de la especificación y el diseño del software son una necesidad. Para que este análisis sea posible, necesitamos una documentación completa.  
* Grandes sistemas de software que forman parte de sistemas de ingeniería desarrollados por varias empresas asociadas. Es más fácil utilizar un modelo común para el hardware y software. Además, cuando intervienen varias empresas, puede ser necesario contar con especificaciones completas que permitan el desarrollo independiente de los distintos subsistemas.

El modelo en cascada no es apropiado cuando…

* Existe una comunicación informal entre los miembros del equipo.  
* Los requisitos de software cambian con rapidez.

Pressman y Maxim (2020, p. 26\) mencionan que el desarrollo en cascada tiene las siguientes desventajas:

* Es difícil para el cliente definir explícitamente todos los requisitos al comienzo del proyecto.  
* Una versión funcional del programa no estará disponible hasta muy tarde en la duración del proyecto.  
* Errores importantes pueden no ser detectados hasta que el programa funcional sea revisado.

##### ***A.1.1. STRADIS*** {#a.1.1.-stradis}

Según Whitten, Bentley y Barlow (1994) STRADIS es una metodología de desarrollo de sistemas creada por Structured Solutions (y comercializada por empresas como EDS y McDonnell Douglas) que las organizaciones adquieren en forma de manuales, software, capacitación y consultoría. Los puntos clave que definen el proceso de STRADIS son:

* **Fundamento Estructurado:** El proceso se basa en gran medida en técnicas de análisis y diseño estructurado, específicamente adoptando el enfoque propuesto por Gane y Sarson.  
* **Unidades de Diseño (Design Units):** STRADIS introdujo el concepto de “unidad de diseño”. Se trata de una colección autónoma de procesos, almacenes y flujos de datos que comparten atributos de diseño similares. Su principal ventaja es que permite que estas unidades se diseñen, construyan y prueben de manera independiente como si fueran un único subsistema.

##### ***A.1.2. V-Model*** {#a.1.2.-v-model}

Despa (2014, p. 44\) define al V-Model como una extensión del Modelo en Cascada.  
Teniendo en cuenta lo descrito por el autor Bucanac (1999), podemos definir al V-Model como un modelo de proceso (desarrollado originalmente para las fuerzas armadas alemanas) que define qué actividades deben realizarse, cómo se llevan a cabo y qué herramientas se utilizan.  
Se estructura en tres niveles:

* **El modelo de proceso del ciclo de vida:** responde a la pregunta “¿Qué hay que hacer?”. Los procedimientos establecen qué actividades deben realizarse, qué resultados deben producir estas actividades y qué contenido deben tener dichos resultados.  
* **La asignación de métodos:** responde a la pregunta “¿Cómo se hace?”. En este nivel se determina qué métodos se utilizarán para llevar a cabo las actividades del nivel de procedimiento.  
* **Los requisitos funcionales de las herramientas:** responde a la pregunta “¿Qué se utiliza para hacerlo?”. En este nivel se establece qué características funcionales deben tener las herramientas que se utilizan para realizar las actividades.

Se basa en cuatro submodelos fundamentales que cooperan entre sí:

* **Gestión de Proyectos (PM):** Planifica, monitorea y controla el proyecto  
* **Desarrollo del Sistema (SD):** Se encarga del desarrollo real del sistema o software  
* **Aseguramiento de la Calidad (QA):** Especifica requisitos de calidad y evalúa si los productos cumplen con los estándares  
* **Gestión de Configuración (CM):** Administra los productos generados, controla modificaciones y garantiza la integridad del sistema

Se divide en las siguientes etapas (dentro del submodelo de Desarrollo del Sistema)

* **Análisis de requisitos del sistema:** Se establecen los requisitos desde el punto de vista del usuario y del entorno externo.  
* **Diseño del sistema:** Se define la arquitectura del sistema y un plan de integración para dicha arquitectura.  
* **Análisis de requisitos de SW/HW:** Se actualizan los requisitos técnicos específicos para el software y el hardware basándose en la arquitectura.  
* **Diseño preliminar y detallado de SW:** Se diseña la arquitectura del software, sus interfaces y se detallan las especificaciones para cada módulo y base de datos.  
* **Implementación de SW:** Se realiza el código y se compila en forma ejecutable.  
* **Integración de SW y del Sistema:** Se integran módulos, bases de datos y componentes de hardware en pasos sucesivos hasta completar el sistema.  
* **Transición a la utilización:** Tareas necesarias para poner el sistema en operación en su entorno real.

Tiene las siguiente ventajas:

* **Soporta la adaptación (tailoring):** Es independiente de la organización y puede ajustarse específicamente a los criterios de cada proyecto al inicio de este.  
* **Asistencia concreta:** Provee instrucciones, recomendaciones y ejemplos detallados para implementar cada actividad a través de esquemas claros.  
* **Flexibilidad dinámica:** Permite añadir o eliminar métodos y herramientas de forma dinámica para mantenerse actualizado con las nuevas tecnologías.

Tiene las siguientes desventajas:

* **Orientación exclusiva a proyectos:** Es un modelo de ciclo de vida para proyectos individuales y no aborda las necesidades de mejora de procesos de toda la organización.  
* **Nivel de abstracción elevado:** Algunas actividades se describen de forma demasiado abstracta, dejando mucha incertidumbre sobre qué tareas están incluidas o excluidas.  
* **Incompleto en la práctica:** A pesar de sus pretensiones de completitud, carece de métodos definidos para ciertas actividades (como en el submodelo de Gestión de Configuración) y no institucionaliza los procesos en la organización una vez finalizado el proyecto.

##### ***A.1.2.1. V-Modell XT*** {#a.1.2.1.-v-modell-xt}

Rausch et al. (2005, pp. 132, 134-136) definen al V-Modell XT como un modelo de procesos genérico basado en el V-Model. La adaptación (tailoring) en el contexto del V-Modell XT implica la selección de uno de los tipos de proyecto compatibles, los módulos de proceso que se aplicarán y la estrategia de ejecución del proyecto que se utilizará.   
Durante el proceso de tailoring, el usuario puede elegir entre un conjunto de módulos de proceso. Los módulos de proceso seleccionados contienen todos los productos, actividades y demás elementos pertinentes. Se seleccionarán los módulos de proceso que se ajusten al perfil de aplicación actual.  
Una vez seleccionados los módulos de proceso y definido el tipo de proyecto, se le presentará al usuario una serie de estrategias para la ejecución del proyecto entre las que podrá elegir.  
	El V-Modell XT es un proceso centrado en los documentos. El enfoque centrado en los documentos tiene ventajas y desventajas.  
Además de las mencionadas en el modelo del cual se deriva este proceso, V-Modell XT tiene las siguiente ventajas:

* Una estructura de documentación y contenidos definida facilita la orientación en un proyecto complejo.  
* Las convenciones de nomenclatura estandarizadas y únicas son una ventaja para encontrar información rápidamente. Esto aumenta la transparencia y la comparabilidad del proyecto.  
* Las estructuras de repositorios estandarizadas permiten el almacenamiento centralizado y, por lo tanto, simplifican la gestión de versiones. 

Pero presenta las siguientes desventajas:

* Requieren un manejo cuidadoso en otros campos, como la gestión de la coherencia.  
* Si los proyectos se vuelven grandes, garantizar la coherencia de los documentos supone un reto especial.  
* Por otro lado, los documentos coherentes son uno de los requisitos previos más importantes para el mantenimiento a largo plazo de un sistema, su operación o su ampliación.

#### **A.2. Proceso unificado** {#a.2.-proceso-unificado}

Según Jacobson, Booch y Rumbaugh (2000, pp. 3-5), el Proceso Unificado representa una convergencia de los mejores rasgos de los modelos de procesos de software tradicionales, caracterizándose de una manera que implementa muchos de los principios de desarrollo ágil. Se define técnicamente como un marco de trabajo “dirigido por casos de uso, centrado en la arquitectura, iterativo e incremental”  
A diferencia de los modelos lineales, el proceso unificado se organiza en cinco fases que presentan una concurrencia:

* Comienzo: comunicación con el cliente y la planificación inicial.  
* Elaboración: expande los casos de uso y crea línea base arquitectónica.   
* Construcción: se implementan las características y funciones del incremento de software en código fuente.  
* Transición: comprende etapas finales de construcción y el inicio del despliegue (entrega y retroalimentación).  
* Producción: coincide con la actividad de despliegue del proceso genérico.

Tiene las siguientes ventajas:

* Enfatiza la documentación de calidad.  
* Involucramiento continuo del cliente.  
* Capacidad de acomodar cambios en requisitos.  
* Alta eficacia en proyectos de mantenimiento.

Tiene las siguientes desventajas:

* Los casos de uso no siempre son precisos.  
* Integración de incrementos de software.  
* La superposición de fases puede generar conflictos.  
* Requiere un equipo de desarrollo más avanzado.

##### ***A.2.2.1. Rational Unified Process***  {#a.2.2.1.-rational-unified-process}

	Kruchten (2003) define el RUP como una implementación específica y comercial del Proceso Unificado, desarrollada originalmente por Rational Software y posteriormente adquirida por IBM. A diferencia del UP genérico, el RUP se presenta como un producto configurable que puede adaptarse al tamaño, complejidad y naturaleza de cada proyecto.  
La estructura de RUP organiza el desarrollo en cuatro fases iterativas. La fase de inicio define el alcance del proyecto, identifica los casos de uso principales y evalúa la viabilidad del negocio. La fase de elaboración establece la arquitectura base del sistema y refina los requisitos. La fase de construcción desarrolla iterativamente los componentes del sistema hasta obtener un producto operativo. Finalmente, la fase de transición despliega el sistema al entorno del usuario final e incorpora la retroalimentación obtenida.   
Kruchten (2003) señala que el RUP se define técnicamente como un marco de trabajo dirigido por casos de uso, centrado en la arquitectura e iterativo e incremental. Los casos de uso guían el diseño y la implementación, mientras que la arquitectura actúa como columna vertebral del desarrollo. Adicionalmente, el proceso se organiza en nueve disciplinas que atraviesan todas las fases: modelado del negocio, requisitos, análisis y diseño, implementación, pruebas, despliegue, gestión de configuración y cambios, gestión del proyecto y entorno.   
Como ventajas el RUP ofrece una base de conocimiento detallada con plantillas, artefactos y ejemplos listos para usar; es altamente configurable, pudiendo recortarse para proyectos pequeños o ampliarse para sistemas de gran escala. También integra explícitamente la gestión de riesgos en cada iteración. Pero su complejidad lo hace difícil de adoptar sin capacitación especializada, puede generar burocracia excesiva si no se configura correctamente para el contexto del proyecto y, al tratarse de un producto comercial, su adopción completa implica costos de licenciamiento. 

##### ***A.2.2.2. OpenUP*** {#a.2.2.2.-openup}

	El Open Unified Process (OpenUP) es una implementación de código abierto del Proceso Unificado, desarrollada y mantenida por la Eclipse Foundation dentro del Eclipse Process Framework (EPF). Surge de una donación de IBM a la comunidad open source del núcleo de su proceso interno, originalmente denominado Basic Unified Process (BUP), que fue renombrado OpenUP en 2006 (Eclipse Foundation, 2012).  
A diferencia del RUP, OpenUP parte de un núcleo ágil al que se le agrega estructura, en lugar de partir de un proceso completo que luego se recorta. Su objetivo declarado es ser un proceso mínimo, suficiente y extensible: incluye únicamente el contenido esencial para el desarrollo de software, dejando fuera detalles específicos como el manejo de equipos grandes o la orientación tecnológica, los cuales pueden incorporarse mediante extensiones.  
En cuanto a su estructura, OpenUP organiza el ciclo de vida del proyecto en las mismas cuatro fases del UP: inicio, elaboración, construcción y transición. Una característica distintiva es que introduce el concepto de micro-incrementos, que son pequeñas unidades de trabajo de pocas horas o días de duración, permitiendo a los equipos gestionar el avance de manera continua y visible dentro de cada iteración.  
En cuanto a principios fundamentales, se guía por cuatro principios centrales que a su vez se alinean con el Manifiesto Ágil: colaborar para alinear intereses y construir una comprensión compartida; equilibrar prioridades en competencia para maximizar el valor entregado a los interesados; enfocarse en la arquitectura de manera temprana para minimizar riesgos; y evolucionar continuamente para obtener retroalimentación permanente.  
En cuanto a sus ventajas, preserva las características esenciales del proceso unificado, como el desarrollo iterativo, el uso de casos de uso, la gestión de riesgos y el enfoque centrado en la arquitectura, pero en una forma considerablemente más simple y accesible. En cuanto a sus desventajas, al ser un proceso mínimo por diseño, no cubre situaciones propias de proyectos de gran escala, como equipos distribuidos, cumplimiento normativo estricto o guía tecnológica específica, requiriendo extensiones o personalizaciones adicionales para esos contextos.

#### **A.3. Proceso Evolutivo** {#a.3.-proceso-evolutivo}

Según Pressman y Maxim (2020, pp. 29-31), el proceso evolutivo tiene como objetivo desarrollar software de alta calidad de forma iterativa o incremental. Sin embargo, también se puede utilizar para enfatizar la flexibilidad, extensibilidad y velocidad de desarrollo.

##### ***A.3.1. Modelo espiral de Boehm*** {#a.3.1.-modelo-espiral-de-boehm}

Además, Pressman y Maxim (2020, pp. 29-31) explican que este modelo, propuesto originalmente por Barry Boehm, es un modelo de proceso de software evolutivo que combina la naturaleza iterativa del prototipado con el aspecto controlado y sistemático del modelo en cascada. Nos permite un rápido desarrollo de versiones del software cada vez más completas.  
Usando este modelo, el software es desarrollado utilizando una serie de versiones evolutivas:

1. Durante las iteraciones tempranas, la versión puede ser un modelo o prototipo.  
2. Durante las iteraciones tardías, versiones cada vez más completas del sistema son producidas.

El modelo espiral se divide en una serie de actividades definidas por el equipo de desarrollo[^1]. Cada una de las actividades representa un segmento del espiral. Por cada revolución del espiral, un *Hito Clave* (una combinación de productos y condiciones del trabajo que se obtuvieron a lo largo del camino de la espiral) es alcanzado.

1. La primera revolución puede resultar en el desarrollo de las especificaciones de un producto.  
2. Las siguientes revoluciones pueden significar el desarrollo de un prototipo, y luego versiones más sofisticadas del hardware.

Los costos y la programación son ajustados en base a la retroalimentación de los usuarios luego de la entrega. Además, el administrador del proyecto ajusta el número de iteraciones planeadas para completar el software.  
Tiene como ventajas:

* Se puede adaptar para que aplique a lo largo de todo el ciclo de vida del software (no termina luego de la entrega final).  
* Es un enfoque realista del desarrollo de sistemas y software de gran escala.  
* Si la consideración de riesgos se realiza correctamente en todas las etapas, reduce los riesgos antes de que sean problemáticos.

Tiene como desventajas:

* Es difícil convencer a los clientes de que el enfoque evolutivo es controlable.  
* Requiere experiencia al momento de evaluar riesgos para ser exitosa, ya que si existe un riesgo mayor no identificado y gestionado, un problema ocurrirá sin dudar.

##### ***A.3.1.1. Win-Win*** {#a.3.1.1.-win-win}

	Una variante del modelo espiral propuesto por Boehm (1998), el Modelo Espiral previo sugiere la comunicación con el cliente para fijar los requisitos, en que simplemente se pregunta al cliente qué necesita y él proporciona la información para continuar; pero esto es en un contexto ideal que rara vez ocurre. Normalmente cliente y desarrollador entran en una negociación, se negocia coste frente a funcionalidad, rendimiento, calidad, etc.  
Las mejores negociaciones se basan en obtener «Victoria & Victoria» (Win & Win), es decir que el cliente gane obteniendo el producto que lo satisfaga, y el desarrollador también gane consiguiendo presupuesto y fecha de entrega realista.  
El modelo Win-Win define un conjunto de actividades de negociación al principio de cada paso alrededor de la espiral; se definen las siguientes actividades:

* Identificación del sistema o subsistemas clave de los directivos (saber qué quieren).  
* Determinación de **condiciones de victoria** de los directivos (saber qué necesitan y los satisface).  
* Negociación de las condiciones «victoria» de los directivos para obtener condiciones Win-Win (negociar para que ambos ganen).

El modelo Win & Win hace énfasis en la negociación inicial, también introduce 3 hitos en el proceso llamados **puntos de fijación**, que ayudan a establecer la completitud de un ciclo de la espiral, y proporcionan hitos de decisión antes de continuar el proyecto de desarrollo del software.

Ventajas

* **Reduce conflictos tempranos**: al explicitar las condiciones de victoria de cada stakeholder, se evitan malentendidos desde el inicio.  
* **Alinea expectativas**: cliente y desarrollador acuerdan alcance, costos, calidad y plazos de forma realista.

* **Mejora la aceptación del producto**: al negociar requisitos críticos, el resultado final tiende a satisfacer mejor a los actores clave.

Desventajas

* **Proceso de negociación costoso**: requiere tiempo, reuniones y participación activa de los stakeholders.  
* **Dependencia de la madurez de los actores**: si el cliente no tiene claridad o poder de decisión, la negociación se degrada.  
* **Escala mal en proyectos grandes**: muchos actores implican negociaciones complejas y lentas.

* **Poco formalismo técnico**: el foco está en el acuerdo, no en modelos o validaciones técnicas profundas.

##### ***A.3.1.2. MBASE*** {#a.3.1.2.-mbase}

El proceso MBASE (Model-Based Architecting and Software Engineering) surge como una evolución del modelo espiral propuesto por Boehm (1996). MBASE refuerza el enfoque del modelo espiral clásico incorporando modelos formales y semiformales como elementos centrales del proceso. En lugar de basar las decisiones únicamente en documentos narrativos, MBASE propone que cada avance significativo del proyecto esté sustentado por modelos consistentes, que representen de manera integrada los distintos puntos de vista del sistema.  
El proceso MBASE se apoya en cuatro modelos fundamentales, conocidos como los cuatro modelos ancla:

* **Modelo de Objetivos** (*Goals Mode*l): captura las necesidades, expectativas y criterios de éxito de los stakeholders, estableciendo el por qué del sistema.  
* **Modelo de Requisitos** (*Requirements Model*): traduce los objetivos en requisitos funcionales y no funcionales verificables.  
* **Modelo de Arquitectura** (*Architecture Model*): define la estructura del sistema, sus componentes, interfaces y decisiones arquitectónicas clave.  
* **Modelo de Planificación y Costos** (*Plans and Budgets Model*): integra cronogramas, estimaciones de esfuerzo, costos y asignación de recursos.

Estos modelos no se desarrollan de forma secuencial y aislada, sino que evolucionan dentro de cada ciclo de la espiral.  
MBASE introduce además puntos de anclaje (*anchor points*) que funcionan como hitos de control y decisión, similares en espíritu a los puntos de fijación del modelo Win-Win. Los principales anclajes son:

* **LCO** (*Life Cycle Objectives*): valida que los objetivos, alcance y viabilidad del sistema estén claramente definidos.  
* **LCA** (*Life Cycle Architecture*): asegura que la arquitectura propuesta es sólida, viable y capaz de soportar los requisitos críticos.  
* **IOC** (*Initial Operational Capability*): confirma que el sistema puede entrar en operación inicial con un nivel aceptable de calidad y riesgo.

Ventajas

* **Decisiones basadas en modelos**: reduce la improvisación y la subjetividad al usar modelos explícitos.  
* **Mejor control del riesgo**: los puntos de anclaje (LCO, LCA, IOC) actúan como filtros antes de avanzar.  
* **Adecuado para sistemas complejos**: especialmente útil en proyectos grandes, críticos o de larga duración.

Desventajas

* **Mayor costo inicial**: desarrollar y mantener modelos requiere más esfuerzo al comienzo.  
* **Curva de aprendizaje elevada**: no es recomendado para equipos poco experimentados.  
* **Sobrecarga para proyectos pequeños**: puede resultar excesivo cuando el sistema es simple.  
* **Menos foco explícito en la negociación humana**: asume que los objetivos ya están razonablemente consensuados.

### ***B. Modelos de procesos ágiles***  {#b.-modelos-de-procesos-ágiles}

Sommerville (2016, p. 75\) explica que al aplicar el enfoque utilizado por los modelos dirigidos por un plan, los cuales son muy cuidadosos al momento de planear el proyecto y rigurosos en los procesos de desarrollo, a organizaciones pequeñas y medianas, los costos extra que se generan son tan grandes que terminan dominando el proceso de desarrollo.  
Es en este contexto que se desarrollan los métodos ágiles, los cuales permiten al equipo de desarrollo concentrarse en el software en vez de en su diseño y documentación.

#### **B.1. Programación Extrema (eXtreme Programming)** {#b.1.-programación-extrema-(extreme-programming)}

La programación extrema propuesta por Beck y Andres (2004) se denomina así debido a que lleva las buenas prácticas (como el desarrollo iterativo) a un nivel extremo.  
La programación extrema utiliza las llamadas “historias de usuario” para expresar los requisitos. Estas historias son escenarios descritos por el usuario a partir de los cuales se conoce como debe funcionar el sistema.  
Este tipo de modelo refleja los principios del manifiesto ágil e implementa los siguientes principios:

* **Propiedad colectiva:** Las parejas de desarrolladores trabajan en todas las áreas del sistema, de modo que no se crean “islas de conocimiento” y todos los desarrolladores asumen la responsabilidad de todo el código. Cualquiera puede modificar cualquier cosa.  
* **Integración contínua:** tan pronto se completa el trabajo en una tarea, se integra a todo el sistema. Después de cada una de estas integraciones, se deben pasar todas las unidades de prueba del sistema.  
* **Planeamiento incremental:** los requisitos son registrados en “tarjetas de historia”. Las historias a incluir en una versión son determinadas por el tiempo disponible y su prioridad relativa. Los desarrolladores dividen estas historias en “tareas” de desarrollo.  
* **Cliente en el sitio:** un representante del usuario final del sistema debe estar disponible a tiempo completo para el equipo XP. En un proceso de programación extremo, el cliente es un miembro del equipo de desarrollo, y es responsable de comunicar al equipo los requisitos del sistema para su implementación.   
* **Programación en pares:** los desarrolladores trabajan en pares, revisando el trabajo del otro y brindándole apoyo mutuo para realizar un buen trabajo.  
* **Refactorización:** se espera que todos los desarrolladores re-factoricen el código continuamente el momento en que posibles mejoras del mismo se encuentren. Esto mantiene el código simple y mantenible.  
* **Diseño simple:** se lleva a cabo el diseño necesario para cumplir con los requisitos actuales, sin ir más allá. En primer lugar, se desarrolla el conjunto mínimo de funcionalidades útiles que aportan valor al negocio.   
* **Pequeñas actualizaciones:** las actualizaciones del sistema son frecuentes y añaden funciones de forma incremental.  
* **Ritmo sostenible:** no se considera aceptable realizar altas cantidades de horas extras, ya que el efecto neto suele ser una disminución de calidad en el código y de la productividad a mediano plazo.  
* **Desarrollo “test-first”:** un marco automatizado de unidades de prueba es utilizado para escribir pruebas para una nueva pieza de funcionalidad antes de que dicha funcionalidad sea implementada.

#### **B.2. Scrum** {#b.2.-scrum}

El método de desarrollo de software ágil Scrum es definido por Pressman y Maxim (2020, p. 42\) como un método cuyos principios son consistentes con el manifiesto ágil, donde el trabajo se lleva a cabo en periodos cortos de tiempo llamados sprints. El trabajo llevado a cabo durante un sprint es adaptado según los problemas presentes y es adaptado en tiempo real por el equipo de Scrum.  
Los equipos de Scrum están constituidos por no más de siete integrantes, de distintas disciplinas y son equipos autogestionados por las personas que lo integran.  
Los equipos de Scrum tiene definidos roles y elementos, estos incluyen:

* Sprint: Una iteración del desarrollo, por lo general de una longitud de 2 a 4 semanas.  
* Incremento potencialmente entregable: el incremento que se presenta luego de un sprint. La idea es que sea “potencialmente entregable”, que significa que se encuentra en un estado final y no requiere trabajo, como pruebas, para ser integrado al producto final. En la práctica, esto no siempre es posible.  
* Product Backlog: una lista “to do” con ítems que el equipo debe atender. Pueden ser definiciones de funciones de software, requisitos, historias de usuario, o descripciones de tareas suplementarias necesarias. Estas están ordenadas por orden de prioridad.  
* Scrum: Reunión diaria del equipo que sirve para revisar el progreso y prioriza el trabajo a realizarse en el día. Idealmente, debe ser una reunión corta cara a cara que incluya a todo el equipo.  
* Product Owner: Un individuo o grupo reducido cuyo trabajo es identificar requisitos, darles prioridad a estos, y revisar el backlog. Es el único que puede extender o terminar de forma prematura un sprint si el incremento no es aceptado.  
* Scrum Master: Es el encargado de asegurar que el proceso de Scrum se esté siguiendo de forma efectiva. Se encarga de interactuar con agentes externos al equipo que pertenezcan a la compañía y de asegurar que el equipo no se vea distraído por interferencias externas.  
* Velocidad: Un estimado de la cantidad de ítems del backlog que pueden ser cubiertos en un solo sprint. 

Antes de comenzar el desarrollo, el equipo trabaja con el product owner y cualquier otra parte interesada para establecer los ítems en el backlog. Luego los items son ordenados por prioridad teniendo en cuenta la importancia que le da el product owner y la complejidad de las tareas de ingeniería de software.  
Antes de cada sprint,  el product owner establece su objetivos para el incremento. El sprint master y el equipo de desarrollo seleccionan items para mover al backlog del sprint, también deciden qué roles se necesitan y quién va a ocuparlos.  
Durante las reuniones diarias (Scrum), los miembros del equipo actualizan a sus compañeros sobre las actividades que llevaron a cabo desde la última reunión, los obstáculos que se encontraron y sus planes para seguir con el desarrollo.  
Al finalizar un sprint, cuando el equipo determina que el incremento fue finalizado, se realiza una reunión para realizar una demo del incremento, durante esta reunión el product owner puede aceptar el incremento o no, si no es aceptado el product owner y las partes interesadas aportan feedback para el sprint siguiente.  
Idealmente antes de que se empiece a planificar el siguiente sprint, se realiza una reunión para evaluar el desempeño del equipo en el sprint anterior.

#### **B.3. Kanban** {#b.3.-kanban}

Kanban, originalmente sistematizado por Anderson (2010, pp. 11-15) como método de cambio evolutivo para equipos de tecnología, es clasificado por Pressman y Maxim (2020, pp. 48-49) como un marco de trabajo ágil orientado a optimizar el flujo de trabajo y mejorar la eficiencia mediante la visualización. A diferencia de marcos como Scrum, Kanban se basa en iteraciones de tiempo fijo y se centra en un flujo continuo de trabajo.  
Pressman destaca los siguientes elementos técnicos esenciales:

* Se utiliza un tablero visual dividido en columnas que representan las etapas del proceso (ej. “Por hacer”, “en desarrollo”, “pruebas”).  
* Cada elemento de trabajo (como una user story) se representa por una tarjeta que se mueve a través de las columnas del tablero.  
* Se establecen límites numéricos al número de tareas permitidas en cada columna simultáneamente. Esto ayuda a:  
  * Identificar cuellos de botella inmediatamente  
  * Evitar la sobrecarga del equipo y asegurar que las tareas se complementan antes de iniciar nuevas  
* Gestión de flujo, el objetivo primordial es que los elementos de trabajo se muevan de forma fluida y predecible desde la definición hasta la entrega.

Se destaca Kanban de otros marcos ágiles, de por ejemplo Kanban no prescribe roles específicos (como el Scrum Master), permitiendo que el equipo mantenga su estructura actual mientras mejora sus procesos. No requiere de reuniones de planificación de sprint o retrospectivas obligatorias con la frecuencia de Scrum, aunque fomenta la mejora continua basada en datos de rendimiento.  
Pressman menciona que Kanban es particularmente útil en escenario donde el trabajo llega de forma impredecible o requiere una respuesta rápida, tales cómo:

* Mantenimiento de software y soporte técnico  
* Equipo de operaciones  
* Proyectos donde las prioridades cambian con mucha frecuencia

#### **B.4. DevOps** {#b.4.-devops}

Pressman y Maxim (2020, pp. 50-51) explican que DevOps fue creado por Patrick DeBois, con el objetivo de combinar desarrollo y operaciones. Kim, Humble, Debois y Willis (2016, pp. 3-8) formalizan posteriormente los principios del movimiento en los "Tres Caminos": flujo, retroalimentación y aprendizaje continuo.  
 Este modelo intenta aplicar los métodos del desarrollo ágil a toda la cadena de suministro de software. Para esto, DevOps se basa en varias fases que se realizan iterativamente hasta que el producto deseado exista.

* **Desarrollo continuo:** las versiones entregables de software se dividen y desarrollan en varios sprints, y los incrementos se entregan a los miembros del equipo de desarrollo encargados del control de calidad para que los puedan probar.  
* **Pruebas continuas:** se utilizan herramientas de prueba automatizada para ayudar a los miembros del equipo a probar varios incrementos de código a la vez para asegurarse que no tengan fallos antes de la integración.  
* **Implementación continua:** en esta etapa, el código integrado se implementa (instala) en el entorno de producción, el cual puede incluir varios lugares en todo el mundo que deben estar preparados para recibir la nueva funcionalidad.  
* **Monitoreo continuo:** los miembros del equipo de desarrollo encargados de las operaciones ayudan a mejorar la calidad del software mediante el monitoreo de su rendimiento en el entorno de producción, y buscando problemas de forma proactiva antes de que los usuarios los encuentren.

DevOps mejora la experiencia de los clientes al responder rápidamente a los cambios en sus necesidades o deseos. Los productos no generan ingresos hasta que los consumidores tienen acceso a ellos, y DevOps puede acelerar los tiempos de implementación en las plataformas de producción. 

### ***C. Prácticas*** {#c.-prácticas}

	Aquí se detallan las prácticas que, si bien no serán consideradas para el análisis de procesos posterior, se tendrán en cuenta al momento de la simplificación y/o adaptación del proceso de desarrollo seleccionado.

#### **C.1. Desarrollo incremental** {#c.1.-desarrollo-incremental}

Sommerville (2016, pp. 49-51), explica que el desarrollo incremental se basa en la idea de desarrollar una implementación inicial, obtener retroalimentación de los usuarios y evolucionar el software a lo largo de varias versiones hasta que el sistema requerido haya sido desarrollado.  
Puede ser dirigido por un plan, ágil o (más comúnmente) una mezcla de ambos.  
El desarrollo incremental es útil cuando se aplica en…

* Sistemas cuyos requisitos cambian constantemente.

No es apropiado para…

* Sistemas críticos, donde una especificación completa y detallada es necesaria desde el primer momento.  
* Sistemas integrados, donde las especificaciones de hardware limitan la funcionalidad del software.

Además, tiene las siguientes desventajas:

* El progreso no es visible. Los administrativos necesitan entregas constantes para controlar el progreso.  
  * Si el sistema se desarrolla rápidamente, no es eficiente producir documentación que refleje cada versión del sistema.  
* La estructura del sistema tiende a degradarse cuando se añaden nuevos incrementos. Cambios regulares provocan código desordenado, lo que hace que implementar nuevas funciones sea más costoso y complicado.  
  * Se necesita una refactorización regular del software.

#### **C.2. Prototipado** {#c.2.-prototipado}

Pressman y Maxim (2020, pp. 26-29) explican que es común que los clientes sean capaces de dar una descripción general de los requerimientos, pero no detalles sobre la funcionalidad. En otros casos, el desarrollador puede estar inseguro de la eficiencia de un algoritmo, la adaptabilidad de un sistema operativo, o la forma en la que la interacción con el usuario debe llevarse a cabo. En estos casos el paradigma de prototipado es el mejor enfoque.  
El prototipado puede ser usado como técnica a ser implementada en el contexto de cualquier modelo de proceso.  
El paradigma de prototipado comienza con la Comunicación. Nos reunimos con las partes interesadas para definir los requisitos generales del sistema, identificamos si verdaderamente conocemos los requisitos y las áreas donde se requiere mayor indagación. La iteración se planea de forma rápida y  se realiza un diseño rápido que represente los aspectos del software que serán visibles para el usuario. Este diseño rápido lleva al desarrollo de un prototipo. Este prototipo es implementado y evaluado por las partes interesadas, quienes nos dan feedback que es utilizado para refinar los requisitos.  
Problemas:

* Las partes interesadas ven lo que parece ser una versión funcional del software y pueden llegar a ignorar que la arquitectura del prototipo también está evolucionando, ignorando así la calidad y mantenibilidad del software.  
* Existe la tentación de implementar un prototipo incompleto, si no se es cuidadoso estas decisiones se vuelven parte integral del sistema.

#### **C.3. Integración y configuración** {#c.3.-integración-y-configuración}

Sommerville (2016, pp. 52-54) explican que la Integración y Configuración se basa en componentes de software reutilizables y un marco integrador para la composición de estos componentes. Los componentes más usados son:

* Aplicaciones independientes: son sistemas de uso general que tienen muchas funciones, pero deben ser adaptados para el uso específico de cada aplicación.  
* Colecciones de objetos que son desarrollados como un componente o paquete para ser integrados en un marco de componentes (por ejemplo, Java Spring framework).  
* Servicios web que son desarrollados acorde a estándares de servicio y pueden ser accedidos de manera remota a través de internet.

Se divide en las siguientes etapas:

* Especificación de requisitos: los requisitos iniciales para el sistema son propuestos. No deben ser especificados en detalle, pero deben incluir descripciones breves de requisitos esenciales y funciones deseables.  
* Descubrimiento y evaluación de software: teniendo una descripción general de los requisitos, se realiza una búsqueda de componentes y sistemas que proveen la funcionalidad necesaria. Los componentes y sistemas candidatos se evalúan para conocer si son apropiados para incorporar al sistema.  
* Refinamiento de requisitos: se utiliza la información de los componentes y sistemas descubiertos para refinar los requisitos. Se modifican los requisitos para reflejar los componentes disponibles, y se redefine la especificación del sistema. Cuando las modificaciones son imposibles, el análisis de componentes se puede volver a realizar para encontrar soluciones alternativas.  
* Configuración del sistema de aplicación: en el caso de encontrar una aplicación comercial que cumpla con los requisitos, esta puede ser configurada y utilizada para crear el nuevo sistema.  
* Adaptación e integración de componentes: en el caso de que no exista un sistema comercial, se pueden modificar componentes reutilizables o desarrollar nuevos. Estos luego son integrados para crear el sistema.

Tiene las siguientes ventajas:

* Reduce la cantidad de software a desarrollar, reduciendo los costos y el riesgo.  
* La entrega del software es más rápida.

Tiene las siguientes desventajas:

* Los compromisos en los requisitos son inevitables, lo que puede llevar a un sistema que no cumple con las necesidades reales de los usuarios.  
* El control sobre el sistema se pierde ya que las nuevas versiones de los componentes reutilizables no pueden ser controlados.

#### **C.4. Enfoques dirigidos por Artefactos** {#c.4.-enfoques-dirigidos-por-artefactos}

##### ***C.4.1. Ingeniería dirigida por modelos (MDE)*** {#c.4.1.-ingeniería-dirigida-por-modelos-(mde)}

	La **Ingeniería Dirigida por Modelos (Model-Driven Engineering)** es un enfoque de desarrollo de software en el cual los modelos, y no los programas, son el principal producto del proceso de desarrollo. El software se genera automáticamente a partir de modelos, reduciendo la necesidad de programación manual (Sommerville, 2016 pp 158-159).

El objetivo central de la Ingeniería dirigida por modelos es elevar el nivel de abstracción de la **ingeniería de software**. En lugar de concentrarse en detalles de lenguajes de programación o plataformas específicas, los ingenieros trabajan con modelos que describen el sistema desde distintos puntos de vista, como su comportamiento, estructura o interacción con el entorno.En la práctica, **MDE** busca mejorar la productividad, la portabilidad y la consistencia de los sistemas, ya que los cambios realizados en los modelos pueden propagarse automáticamente al software generado.

##### ***C.4.2. Arquitectura dirigida por modelos (MDA)*** {#c.4.2.-arquitectura-dirigida-por-modelos-(mda)}

	Sommerville (2016, pp .159-162) define a la **Arquitectura Dirigida por Modelos (Model-Driven Architecture)** como un enfoque de diseño e implementación de software que coloca a los modelos como el principal artefacto  de desarrollo, relegando al código a un producto derivado. En **MDA**, el software ejecutable se obtiene mediante transformaciones automáticas aplicadas a modelos definidos en distintos niveles de abstracción.  
El objetivo central de **MDA** es que la lógica del sistema se exprese de manera independiente de la plataforma sobre la cual será ejecutado. Para ello, se propone la construcción  de tres tipos de modelos:

**Modelos fundamentales en MDA**

* **Modelo Independiente de la Computación (CIM – Computation Independent Model):**

  Representa el sistema desde el punto de vista del dominio y del negocio, sin considerar aspectos computacionales. Captura las abstracciones clave del dominio.

* **Modelo Independiente de Plataforma (PIM – Platform Independent Model):**

  Describe la estructura y el comportamiento del sistema sin referencia a tecnologías concretas. Suele expresarse mediante modelos UML que especifican componentes, relaciones y reacciones ante eventos.

* **Modelo Específico de Plataforma (PSM – Platform Specific Model):**

  Es una transformación del PIM que incorpora detalles tecnológicos concretos, como lenguajes, frameworks o bases de datos. Puede haber múltiples PSMs derivados de un mismo PIM.

A partir del **PSM**, se genera automáticamente el código ejecutable mediante generadores específicos de lenguaje y plataforma..

Es clave en la **MDA** que las transformaciones entre modelos pueden definirse y ejecutarse mediante herramientas. Esto permite generar un sistema funcional a partir de un modelo de alto nivel. En la práctica, la automatización completa es en raras ocasiones  posible, 

**Ventajas**

* Mayor nivel de abstracción.  
* Minimizar la codificación manual.  
* Reutilización de modelos independientes de plataforma.  
* Posibilidad de portar sistemas a nuevas tecnologías manteniendo un mismo PIM.

**Desventajas**

* Alto costo inicial en herramientas y definición de transformaciones.  
* Dependencia fuerte del soporte tecnológico disponible.  
* Automatización incompleta en sistemas reales.

##### ***C.5. Spec-Driven Development (SDD)*** {#c.5.-spec-driven-development-(sdd)}

A diferencia de los modelos anteriores, que constituyen **modelos de procesos**, el enfoque presentado en esta sección es un paradigma centrado en un artefacto específico que se instancian dentro de cualquier modelo de proceso tradicional. Se incluye aquí porque, en el contexto profesional de un integrante del equipo, se utilizó una instanciación concreta donde se utiliza.   
Piskala (2026) define el Spec-Driven Development (SDD) como un enfoque donde la especificación es el artefacto central y la única fuente de verdad. El código pasa a ser un detalle de implementación secundario que se deriva, genera o verifica a partir de esta. A diferencia de los documentos tradicionales estáticos, las especificaciones en SDD son ejecutables y obligatorias, lo que optimiza el trabajo con asistentes de código basados en Inteligencia Artificial. Piskala distingue tres niveles de rigor: *spec-first* (la especificación se escribe antes del código), *spec-anchored* (la especificación guía el desarrollo pero puede refinarse durante la implementación) y *spec-as-source* (la especificación es la fuente de verdad ejecutable del sistema).  
Esta caracterización ubica a SDD como un enfoque o paradigma —emparentado con los métodos formales, el *Model-Driven Engineering* y los paradigmas *\-Driven Development* (TDD, BDD, DDD)— y no como un modelo de ciclo de vida macro al nivel de Cascada o los modelos ágiles. Por ello, SDD es *ortogonal* a los modelos de proceso tradicionales: puede instanciarse dentro de cualquiera de ellos, redefiniendo a la especificación como artefacto autoritativo del proyecto.  
Böckeler (2025) sitúa al SDD como una de las prácticas clave de la ingeniería de software asistida por IA, dónde herramientas especializadas automatizan la generación de especificaciones, diseños y tareas a partir de la intención del desarrollador. Según Böckeler, SDD busca resolver el problema fundamental de que los asistentes de IA generan código que se desvía de la intención original del desarrollador cuando no existe una especificación formal que actúe como referencia compartida.

El modelo sigue un pipeline estructurado en fases secuenciales que típicamente incluyen:

1. **Exploración:** investigación del problema y análisis del contexto existente.  
2. **Especificación:** definición formal de requisitos, restricciones y escenarios.  
3. **Diseño:** decisiones arquitectónicas y enfoque técnico.  
4. **Descomposición:** división del trabajo en unidades implementables.  
5. **Implementación:** escritura del código, asistida por IA, en base a las especificaciones.  
6. **Verificación:** validación de que la implementación cumple la especificación.

Entre fases se aplican compuertas de validación humana (*Human in the Loop*) donde el desarrollador evalúa críticamente los artefactos generados antes de autorizar el avance a la siguiente fase. La generación de artefactos puede delegarse a agentes de IA especializados, mientras que el humano conserva la autoridad sobre las decisiones de diseño y la aceptación de los resultados. Para mitigar la pérdida de contexto entre fases (un problema inherente a los asistentes de IA con ventana de contexto limitada), el modelo contempla mecanismos de memoria persistente que preservan las decisiones y descubrimientos a lo largo del proceso.

**Tiene las siguientes ventajas:**

* Genera documentación extensa y detallada (especificaciones, diseños, descomposición de tareas) como subproducto natural del proceso, resolviendo una de las principales debilidades de los métodos ágiles: la falta de documentación sistemática.  
* Los mecanismos de memoria persistente permiten que el conocimiento acumulado durante el desarrollo no se pierda entre fases del pipeline ni entre sesiones de trabajo.  
* Las compuertas de validación humana actúan como mecanismos de evaluación y mitigación de riesgos entre cada fase, comparable al análisis de riesgos del modelo en Espiral.  
* Al ejecutarse por funcionalidad (no por proyecto completo), el pipeline puede completarse en plazos cortos, produciendo versiones funcionales con rapidez comparable al desarrollo incremental.  
* El costo de incorporar cambios en las fases tempranas es bajo, ya que los asistentes de IA pueden regenerar especificaciones y diseños rápidamente, a diferencia del retrabajo manual del modelo en cascada.

**Tiene las siguientes desventajas:**

* Requiere que el desarrollador humano posea un nivel de experiencia técnica y arquitectónica alto para validar críticamente los artefactos generados por la IA en cada compuerta.  
* Depende de herramientas de IA especializadas, lo que eleva la barrera de entrada y la curva de aprendizaje respecto a modelos tradicionales.  
* Las compuertas de validación involucran al desarrollador como validador técnico, no necesariamente al usuario final o cliente, alejándose del principio ágil de compromiso constante del cliente.  
* Un cambio drástico y tardío en los requerimientos del negocio, aunque menos costoso que en cascada gracias a la asistencia de IA, aún requiere retroceder e invalidar artefactos de fases previas.

2.- ELABOREN UN RESUMEN SINTÉTICO, y a modo de CV ACTUALIZADO a mayo de 2026, de las experiencias y conocimientos de cada integrante del Grupo de TPI aplicando el/los proceso/s revisados en el punto 1\. 

## 2\. Resumen a modo de CVs de los integrantes {#2.-resumen-a-modo-de-cvs-de-los-integrantes}

##### ***Dos Santos, Mauricio*** {#dos-santos,-mauricio}

Estudiante de Ingeniería en Informática. Actualmente no poseo experiencia laboral formal, mi perfil está orientado en la aplicación de conocimientos técnicos y metodológicos a través de proyectos académicos y formación continua.  
**FORMACIÓN ACADÉMICA**

* INGENIERÍA EN INFORMÁTICA. Universidad Gastón Dachary (UGD) 2022 \- Actualidad | Posadas. Misiones, Argentina.

**EXPERIENCIA ACADÉMICA Y PROYECTOS**

* **Modelo de Cascada:** se realizó una aproximación al uso de este proceso en un contexto académico en las siguientes situaciones:  
  * Durante las asignaturas “Análisis de Sistemas” y “Diseño de Sistemas” en el año 2024, se aplicó la metodología STRADIS (Whitten, Bentley y Barlow, 1994\) — basada en el análisis y diseño estructurado de Gane y Sarson (1979) — para definir y desarrollar de forma integral el escenario  “Dirección de Infraestructura Escolar”.   
  * Durante la asignatura "Diseño de Sistemas" en el año 2025, se aplicó la metodología STRADIS (Whitten, Bentley y Barlow, 1994\) — basada en el análisis y diseño estructurado de Gane y Sarson (1979) — para definir y desarrollar de forma integral el escenario “El Garage Uniformes”.   
* **Integración y Configuración:** se realizó una aproximación al uso de este proceso para el desarrollo de proyectos en un contexto académico.  
  * Durante la asignatura “Programación Avanzada II” en 2024, se desarrolló una aplicación basada en Java, recopilando y buscando de forma autónoma colecciones de objetos, los cuales se integraron utilizando el marco de componentes Java Spring Framework.  
  * Durante la asignatura “Arquitectura de Computadoras” en el 2023, se definió y desarrolló el proyecto “Roomba”, el cual implementa una aplicación basada en C y JavaScript para la cual se debió recopilar e implementar librerías.   
  * Durante la asignatura "Diseño de Sistemas" (caso de “El Garage Uniformes”) en el año 2025, seleccionamos el ERP Odoo como alternativa tecnológica. Esto permitió adaptar el proceso tradicional en cascada de STRADIS hacia un modelo enfocado en la configuración, adaptación e integración de un paquete de software comercial, siguiendo la decisión estratégica de "comprar vs. hacer" (Whitten, Bentley y Barlow, 1994\) en la fase de selección descrita por Whitten.  
* **Desarrollo Incremental:** se realizó una aproximación al uso de este proceso para el desarrollo de proyectos en un contexto académico:  
  * Durante la asignatura “Arquitectura de Computadoras” en el 2023, se desarrolló una aplicación basada en C, HTML y JavaScript, desarrollando incrementos de forma semanal en el proyecto “Roomba”.  
  * Durante la asignatura “Introducción al Diseño y Desarrollo de Videojuegos” 2025 y 2026, se desarrollaron dos proyectos (uno basado en el motor de videojuegos GameMaker, y otro en el motor Unity), con entregas incrementales presentadas semanalmente.   
* **Prototipado**: se realizó una aproximación al uso de este proceso en un contexto académico en las siguientes situaciones:  
  * Durante la asignatura “Diseño de Sistemas” en 2024, se ejecutó la actividad de Construir prototipos de descubrimiento correspondiente a la fase de Definición de la metodología STRADIS según Whitten, Bentley y Barlow (1994). El objetivo fue diseñar las interfaces de usuario y validar requerimientos para el proyecto “Dirección de Infraestructura Escolar”.  
  * Durante la asignatura “Arquitectura de Computadoras” en 2023, se definió y desarrolló el proyecto “Roomba”, el cual implementa un prototipo de aplicación y un prototipo de hardware basado en Arduino, el cual es controlado por dicha aplicación.  
  * Durante la asignatura “Introducción al Diseño y Desarrollo de Videojuegos” en 2025 y 2026, se desarrollaron dos proyectos, donde se crearon prototipos para comprobar el funcionamiento de distintas mecánicas y funciones a implementar. 

**FORMACIÓN COMPLEMENTARIA**

* No corresponde.

**HABILIDADES TÉCNICAS Y HERRAMIENTAS**

* **Gestión y Colaboración:** Discord, Slack.  
* **Control de Versiones:** GitHub.  
* **Lenguajes de Programación:** C, Java, Javascript, Python, GML.  
* **Base de Datos y Low-Code:** MySQL y Oracle APEX.  
* **Entornos de Desarrollo:** NetBeans, Visual Studio Code, Dev C++,GameMaker.  
* **Modelado y Diseño:** LucidChart, Draw.io.  
* **Documentación y Ofimática:** Office (Word, Excel), Google Drive (Docs, Sheets).  
   

##### ***Hillebrand, Giuliano*** {#hillebrand,-giuliano}

Desarrollador de Software y estudiante de Ingeniería en Informática. Cuento con experiencia profesional en RELEX SRL desde octubre de 2024, enfocada en el desarrollo e implementación de sistemas ERP, integraciones de software, automatización de procesos e IA aplicada en entornos productivos. Mi perfil combina la formación académica con la práctica profesional en equipos ágiles y procesos de desarrollo dirigidos por especificación.  
**FORMACIÓN ACADÉMICA**

* INGENIERÍA EN INFORMÁTICA. Universidad Gastón Dachary (UGD) 2022 \- Actualidad | Posadas. Misiones, Argentina.

**EXPERIENCIA ACADÉMICA Y PROYECTOS**

* **Desarrollo Dirigido por un Plan (Modelo en Cascada):** se realizó una aproximación al uso de este proceso en un contexto académico en las siguientes situaciones:  
  * Durante las asignaturas "Análisis de Sistemas" y "Diseño de Sistemas" en el año 2025, se aplicó la metodología STRADIS (Whitten, Bentley y Barlow, 1994\) — basada en el análisis y diseño estructurado de Gane y Sarson (1979) — para definir y desarrollar de forma integral el escenario "El Garage Uniformes", una fábrica textil y tienda de uniformes.  
* **Integración y Configuración:** se realizó una aproximación al uso de este proceso en contextos profesional y académico:  
  * Durante mi desempeño profesional en la empresa RELEX SRL, participé en el desarrollo e implementación de sistemas ERP (O'Leary, 2000\) basados en Odoo (Odoo S.A., s.f.) para clientes de diversos sectores, evaluando funcionalidades existentes de la plataforma, configurando módulos estándar según requerimientos e integrando sistemas externos mediante APIs.  
  * Durante la asignatura "Diseño de Sistemas" (caso de “El Garage Uniformes”), seleccionamos el ERP Odoo como alternativa tecnológica. Esto permitió adaptar el proceso tradicional en cascada de STRADIS hacia un modelo enfocado en la configuración, adaptación e integración de un paquete de software comercial, siguiendo la decisión estratégica de "comprar vs. hacer" (Whitten, Bentley y Barlow, 1994\) en la fase de selección descrita por Whitten.  
* **Desarrollo Incremental:** se realizó una aproximación al uso de este proceso para el desarrollo de proyectos en un contexto profesional:  
  * Durante mis prácticas profesionales en RELEX SRL, desarrollé un módulo backend para una aplicación de telemedicina basada en TypeScript (Express.js), construyendo el sistema desde cero, priorizando los endpoints más críticos (emisión de receta electrónica) en el primer incremento y agregando funcionalidades en cada iteración sucesiva, con verifiación del equipo en cada entrega.  
* **Prototipado:** se realizó una aproximación al uso de este proceso en un contexto académico y profesional en las siguientes situaciones:  
  * Durante mi desempeño profesional en RELEX SRL, utilicé n8n (n8n GmbH, s.f.) como herramienta de prototipado rápido en el desarrollo de integraciones entre Odoo y sistemas externos, construyendo flujos funcionales para validar la viabilidad técnica y obtener retroalimentación temprana del cliente antes de la implementación definitiva.  
  * Durante la asignatura “Análisis de Sistemas” en 2025, se ejecutó la actividad de Construir prototipos de descubrimiento correspondiente a la fase de Definición de la metodología STRADIS según Whitten (Whitten, Bentley y Barlow, 1994). El objetivo fue modelar reportes y validar requisitos del modelo de datos para el proyecto “El Garage Uniformes”.  
* **Métodos Ágiles (Scrum/Kanban):** se realizó una aproximación sostenida al uso de estos procesos en un contexto profesional:  
  * Durante mi desempeño profesional en RELEX SRL desde octubre de 2024, participé activamente en equipos ágiles con sprints semanales, planificación, *dailies*, retrospectivas y demos a clientes. Los requisitos se especificaron mediante Historias de Usuario, la priorización se realizaba con Scrum Poker y la gestión del backlog y las tareas se organizaban mediante tablero Kanban para múltiples proyectos concurrentes.  
* **Proceso Híbrido \- Spec-Driven Development (SDD):** se realizó una aproximación al uso de este enfoque en un contexto profesional, mediante una instanciación concreta adaptada a Odoo:  
  * Durante mi desempeño profesional en RELEX SRL, apliqué un modelo de desarrollo dirigido por especificación o **Spec-Driven Development** (Piskala, 2026; Böckeler, 2025), basado en el ecosistema de código abierto **AI Gentle Stack** (Buscaglia, 2026a), adaptado a Odoo. Este enfoque aborda tres problemas recurrentes del desarrollo asistido por IA: la amnesia entre sesiones, la saturación de la ventana de contexto y la concentración de responsabilidades en un único agente. El proceso sigue un pipeline estructurado en fases secuenciales — exploración, especificación, diseño, tareas, implementación y verificación — orquestadas por un coordinador de IA que delega cada fase a sub-agentes especialistas efímeros. Entre fases, se aplican compuertas de verifiación humana (Human in the Loop) donde el desarrollador evalúa críticamente los artefactos generados — especificaciones, decisiones de diseño y código — antes de autorizar el avance a la siguiente fase. La memoria persistente entre fases y sesiones se resuelve mediante **Engram** (Buscaglia, 2026b), una base de datos local que almacena decisiones, contexto y descubrimientos, permitiendo que cada sub-agente acceda al conocimiento acumulado sin necesidad de cargar toda la conversación previa. El resultado es un proceso híbrido que combina la rigurosidad de un modelo dirigido por plan en las fases de especificación y diseño con entregas incrementales en la implementación y prácticas ágiles en la gestión diaria.

**FORMACIÓN COMPLEMENTARIA**

* **Curso de DEVOPS \- Nivel Introductorio** | Silicon Misiones | 2025 (16 horas)  
* **Programación Web Full Stack** | Silicon Misiones | 2025 (130 horas)  
* **Diplomatura en Ciberseguridad** | Universidad Gastón Dachary | 2023 (40 horas)  
* **Programa de Competencias Laborales y Sociales** | Silicon Misiones | 2024 (20 horas)  
* **Curso de Prompt Engineering** | Silicon Misiones | 2024 (20 horas)

**HABILIDADES TÉCNICAS Y HERRAMIENTAS**

* **Gestión y Colaboración:** Discord, Trello, Notion, Slack, Teams.  
* **Control de Versiones:** Git, GitHub, GitLab.  
* **Lenguajes de Programación:** C, Java, Python, JavaScript, TypeScript.  
* **Frameworks:** FastAPI, Express.js, Spring Boot, Odoo.  
* **Base de Datos:** MySQL, PostgreSQL, Supabase.  
* **Integraciones y Automatización:** n8n, APIs REST.  
* **DevOps e Infraestructura:** Docker, Linux.  
* **Entornos de Desarrollo:** NetBeans, Visual Studio.  
* **Modelado y Diseño:** LucidChart, PlantUML, Mermaid.  
* **Documentación y Ofimática:** Office y LibreOffice (Procesador de texto, Hojas de cálculo), Google Drive, OneDrive.

##### ***Lezcano, León Joaquín*** 	 {#lezcano,-león-joaquín}

Estudiante de Ingeniería en Informática. Actualmente no poseo experiencia laboral formal, mi perfil está orientado en la aplicación de conocimientos técnicos y metodológicos a través de proyectos académicos y formación continua.  
**FORMACIÓN ACADÉMICA**

* INGENIERÍA EN INFORMÁTICA. Universidad Gastón Dachary (UGD) 2022 \- Actualidad | Posadas. Misiones, Argentina.

**EXPERIENCIA ACADÉMICA Y PROYECTOS**

* **Modelo de Cascada:** se realizó una aproximación al uso de este proceso en un contexto académico en las siguientes situaciones:  
  * Durante las asignaturas "Análisis de Sistemas" y "Diseño de Sistemas" en el año 2024, se aplicó la metodología STRADIS (Whitten, Bentley y Barlow, 1994\) — basada en el análisis y diseño estructurado de Gane y Sarson (1979)— para definir y desarrollar de forma integral el escenario  “Dirección de Infraestructura Escolar”.   
* **Desarrollo Incremental:** se realizó una aproximación al uso de este proceso para el desarrollo de proyectos en un contexto académico:  
  * Durante la asignatura “Arquitectura de Computadoras” en el año 2023, se desarrolló una aplicación basada en Python, desarrollando incrementos de forma semanal en el proyecto “Aula Automatizada”.   
  * Durante la asignatura “Introducción al Diseño y Desarrollo de Videojuegos” 2025 y 2026, se desarrollaron dos proyectos (uno basado en el motor de videojuegos GameMaker, y otro en el motor Unity), con entregas incrementales presentadas semanalmente.   
* **Integración y Configuración:** se realizó una aproximación al uso de este proceso para el desarrollo de proyectos en un contexto académico.  
  * Durante la asignatura “Programación Avanzada II” en el año 2024, se desarrolló una aplicación basada en Java, recopilando y buscando de forma autónoma colecciones de objetos, los cuales se integraron utilizando el marco de componentes Java Spring framework.   
  * Durante la asignatura “Arquitectura de Computadoras” en el año 2023, se definió y desarrolló el proyecto “Aula Automatizada”, el cual implementa una aplicación basada en Python, para la cual se debió recopilar e implementar librerías.  
* **Prototipado**: se realizó una aproximación al uso de este proceso en un contexto académico en las siguientes situaciones:  
  * Durante la asignatura “Diseño de Sistemas” en el año 2024, se ejecutó la actividad de Construir prototipos de descubrimiento correspondiente a la fase de Definición de la metodología STRADIS según Whitten, Bentley y Barlow (1994). El objetivo fue diseñar las interfaces de usuario y validar requerimientos para el proyecto “Dirección de Infraestructura Escolar”..  
  * Durante la asignatura “Arquitectura de Computadoras” en el año 2023, se definió y desarrolló el proyecto “Aula Automatizada”, el cual implementa un prototipo de aplicación y un prototipo de hardware basado en Arduino, el cual es controlado por dicha aplicación.  
  * Durante la asignatura “Introducción al Diseño y Desarrollo de Videojuegos” 2025 y 2026, se desarrollaron dos proyectos, donde se crearon prototipos para comprobar el funcionamiento de distintas mecánicas y funciones a implementar. 

**FORMACIÓN COMPLEMENTARIA**

* No corresponde.

**HABILIDADES TÉCNICAS Y HERRAMIENTAS**

* **Gestión y Colaboración:** Discord, Trello, Notion.  
* **Control de Versiones:** GitHub.  
* **Lenguajes de Programación:** C, Java, LUA, Python.  
* **Base de Datos y Low-Code:** MySQL, Oracle APEX.  
* **Entornos de Desarrollo:** NetBeans, Visual Studio.  
* **Modelado y Diseño:** LucidChart.  
* **Documentación y Ofimática:** Office y LibreOffice (Procesador de texto, Hojas de cálculo), Google Drive, OneDrive.

##### ***Nieto, Tomas*** {#nieto,-tomas}

Estudiante de Ingeniería en Informática. Actualmente no poseo experiencia laboral formal, mi perfil está orientado en la aplicación de conocimientos técnicos y metodológicos a través de proyectos académicos y formación continua.  
**FORMACIÓN ACADÉMICA**

* INGENIERÍA EN INFORMÁTICA. Universidad Gastón Dachary (UGD) 2023 \- Actualidad | Posadas. Misiones, Argentina.

**EXPERIENCIA ACADÉMICA Y PROYECTOS**

* **Modelo de Cascada:** se realizó una aproximación al uso de este proceso en un contexto académico en las siguientes situaciones:  
  * Durante las asignaturas "Análisis de Sistemas" y "Diseño de Sistemas" en el año 2024, se aplicó la metodología STRADIS (Whitten, Bentley y Barlow, 1994\) — basada en el análisis y diseño estructurado de Gane y Sarson (1979)— para definir y desarrollar de forma integral el escenario “Instituto Cambridge Classes”.  
* **Integración y Configuración:** se realizó una aproximación al uso de este proceso para el desarrollo de proyectos en un contexto académico.  
  * Durante la asignatura “Programación Avanzada II” en el año 2025, se desarrolló una aplicación de “Gestión Veterinaria” basada en Java, recopilando y buscando de forma autónoma colecciones de objetos, los cuales se integraron utilizando el marco de componentes Java Spring framework.  
* **Prototipado:** se realizó una aproximación al uso de este proceso en un contexto académico en las siguientes situaciones:  
  * Durante la asignatura “Diseño de Sistemas” en el año 2024, se ejecutó la actividad de Construir prototipos de descubrimiento correspondiente a la fase de Definición de la metodología STRADIS según Whitten, Bentley y Barlow (1994). El objetivo fue diseñar las interfaces de usuario y validar requerimientos para el proyecto “Instituto Cambridge Classes”.  
  * Durante la asignatura “Arquitectura de Computadoras” en el año 2024, se definió y desarrolló el proyecto “Pava Inteligente”, el cual implementa un prototipo de aplicación y un prototipo de hardware basado en Arduino, el cual es controlado por dicha aplicación.

**FORMACIÓN COMPLEMENTARIA**

* No corresponde.

**HABILIDADES TÉCNICAS Y HERRAMIENTAS**

* **Gestión y Colaboración:** Discord, Trello,  Notion.  
* **Control de versiones:** GitHub.  
* **Lenguajes de Programación:** C,C++, Java, Python.  
* **Base de Datos y Low-Code:** MySQL.  
* **Entornos de Desarrollo:** NetBeans, Visual Studio, Godot.  
* **Modelado y Diseño:** LucidChart, Drawio.    
* **Documentación y Ofimática:** Office (Word, Excel), LibreOffice (Procesador de texto), Google Drive.

##### ***Pirovani, Antonella*** {#pirovani,-antonella}

Estudiante de Ingeniería en Informática. Actualmente no poseo experiencia laboral formal, mi perfil está orientado en la aplicación de conocimientos técnicos y metodológicos a través de proyectos académicos y formación continua.  
**FORMACIÓN ACADÉMICA**

* INGENIERÍA EN INFORMÁTICA. Universidad Gastón Dachary (UGD) 2022 \- Actualidad | Posadas. Misiones, Argentina.

**EXPERIENCIA ACADÉMICA Y PROYECTOS**

* **Modelo de Cascada:** se realizó una aproximación al uso de este proceso en un contexto académico en las siguientes situaciones:  
  * Durante las asignaturas "Análisis de Sistemas" y "Diseño de Sistemas" en el año 2024, se aplicó la metodología STRADIS (Whitten, Bentley y Barlow, 1994\) — basada en el análisis y diseño estructurado de Gane y Sarson (1979)— para definir y desarrollar de forma integral el escenario  “Dirección de Infraestructura Escolar”.   
  * Durante la asignatura "Diseño de Sistemas" en el año 2025, se aplicó la metodología STRADIS (Whitten, Bentley y Barlow, 1994\) — basada en el análisis y diseño estructurado de Gane y Sarson (1979)— para definir y desarrollar de forma integral el escenario “El Garage Uniformes”.  
* **Desarrollo Incremental:** se realizó una aproximación al uso de este proceso para el desarrollo de proyectos en un contexto académico:  
  * Durante la asignatura “Arquitectura de Computadoras” en el año 2023, se desarrolló una aplicación basada en C, desarrollando incrementos de forma semanal en el proyecto “Roomba”.  
  * Durante la asignatura “Introducción al Diseño y Desarrollo de Videojuegos” 2025 y 2026, se desarrollaron dos proyectos (uno basado en el motor de videojuegos GameMaker, y otro en el motor Unity), con entregas incrementales presentadas semanalmente.   
* **Integración y Configuración:** se realizó una aproximación al uso de este proceso para el desarrollo de proyectos en un contexto académico.  
  * Durante la asignatura “Programación Avanzada II” en el año 2024, se desarrolló una aplicación basada en Java, recopilando y buscando de forma autónoma colecciones de objetos, los cuales se integraron utilizando el marco de componentes Java Spring framework.  
  * Durante la asignatura “Arquitectura de Computadoras” en el año 2023, se definió y desarrolló el proyecto “Roomba”, el cual implementa una aplicación basada en C, para la cual se debió recopilar e implementar librerías.   
  * Durante la asignatura "Diseño de Sistemas" (caso de “El Garage Uniformes”) en el año 2025, seleccionamos el ERP Odoo como alternativa tecnológica. Esto permitió adaptar el proceso tradicional en cascada de STRADIS hacia un modelo enfocado en la configuración, adaptación e integración de un paquete de software comercial, siguiendo la decisión estratégica de "comprar vs. hacer" (Whitten, Bentley y Barlow, 1994\) en la fase de selección descrita por Whitten.  
* **Prototipado**: se realizó una aproximación al uso de este proceso en un contexto académico en las siguientes situaciones:  
  * Durante la asignatura “Diseño de Sistemas” en el año 2024, se ejecutó la actividad de Construir prototipos de descubrimiento correspondiente a la fase de Definición de la metodología STRADIS según Whitten, Bentley y Barlow (1994). El objetivo fue diseñar las interfaces de usuario y validar requerimientos para el proyecto “Dirección de Infraestructura Escolar”.  
  * Durante la asignatura “Arquitectura de Computadoras” en el año 2023, se definió y desarrolló el proyecto “Roomba”, el cual implementa un prototipo de aplicación y un prototipo de hardware basado en Arduino, el cual es controlado por dicha aplicación.  
  * Durante la asignatura “Introducción al Diseño y Desarrollo de Videojuegos” en 2025 y 2026, se desarrollaron dos proyectos, donde se crearon prototipos para comprobar el funcionamiento de distintas mecánicas y funciones a implementar. 

**FORMACIÓN COMPLEMENTARIA**

* No corresponde. 

**HABILIDADES TÉCNICAS Y HERRAMIENTAS**

* **Gestión y Colaboración:** Discord, Trello, Notion.  
* **Control de Versiones:** GitHub.  
* **Lenguajes de Programación:** C, Java, Python.  
* **Base de Datos y Low-Code:** MySQL y Oracle APEX.  
* **Entornos de Desarrollo:** NetBeans, Visual Studio.  
* **Modelado y Diseño:** LucidChart.    
* **Documentación y Ofimática:** Office y LibreOffice (Procesador de texto, Hojas de cálculo), Google Drive, OneDrive.

##### ***Romero, Micaela Denisse*** {#romero,-micaela-denisse}

Estudiante de Ingeniería en Informática. Actualmente no poseo experiencia laboral formal, mi perfil está orientado en la aplicación de conocimientos técnicos y metodológicos a través de proyectos académicos y formación continua.  
**FORMACIÓN ACADÉMICA**

* **INGENIERÍA EN INFORMÁTICA. Universidad Gastón Dachary** (UGD) 2022 \- Actualidad | Posadas. Misiones, Argentina.

**EXPERIENCIA ACADÉMICA Y PROYECTOS**

* **Modelo de Cascada:** se realizó una aproximación al uso de este proceso en un contexto académico en las siguientes situaciones:  
  * Durante las asignaturas "Análisis de Sistemas" y "Diseño de Sistemas" en el año 2024, se aplicó la metodología STRADIS (Whitten, Bentley y Barlow, 1994\) — basada en el análisis y diseño estructurado de Gane y Sarson (1979)— para definir y desarrollar de forma integral el escenario  “Dirección de Infraestructura Escolar”.   
  * Durante la asignatura "Diseño de Sistemas" en el año 2025, se aplicó la metodología STRADIS (Whitten, Bentley y Barlow, 1994\) — basada en el análisis y diseño estructurado de Gane y Sarson (1979)— para definir y desarrollar de forma integral el escenario “La Despensa Gaby”.   
* **Desarrollo Incremental:** se realizó una aproximación al uso de este proceso para el desarrollo de proyectos en un contexto académico:  
  * Durante la asignatura “Arquitectura de Computadoras” en el año 2023, se desarrolló una aplicación basada en C y Arduino IDE ejecutada sobre la plataforma Arduino Uno, desarrollando incrementos de forma semanal en el proyecto “Sistema Automatizado de Riego para Plantas Hidropónicas”.  
  * Durante la asignatura “Introducción al Diseño y Desarrollo de Videojuegos” en el año 2025, se desarrolló en GameMaker un proyecto “Byte & Bash” con entregas incrementales presentadas semanalmente.   
* **Integración y Configuración:** se realizó una aproximación al uso de este proceso para el desarrollo de proyectos en un contexto académico.  
  * Durante la asignatura “Programación Avanzada II” en el año 2024, se desarrolló una aplicación basada en Java, recopilando y buscando de forma autónoma colecciones de objetos. La integración y el almacenamiento de la información se realizó mediante JPA, para el ORM y para la persistencia de datos en un motor MySQL.  
  * Durante la asignatura “Arquitectura de Computadoras” en el año 2023, se desarrolló una aplicación basada en C y Arduino IDE ejecutada sobre la plataforma Arduino Uno, desarrollando incrementos de forma semanal en el proyecto “Sistema Automatizado de Riego para Plantas Hidropónicas”. Se utilizó librerías de Arduino para sensores de humedad, u otras funciones específicas para la funcionalidad del sistema.  
* **Prototipado**: se realizó una aproximación al uso de este proceso en un contexto académico en las siguientes situaciones:  
  * Durante la asignatura “Diseño de Sistemas” en 2024, se ejecutó la actividad de Construir prototipos de descubrimiento correspondiente a la fase de Definición de la metodología STRADIS según Whitten, Bentley y Barlow (1994). El objetivo fue diseñar las interfaces de usuario y validar requerimientos para el proyecto “Dirección de Infraestructura Escolar”.  
  * Durante la asignatura “Arquitectura de Computadoras” en el año 2023, se definió y desarrolló el proyecto “Sistema Automatizado de Riego para Plantas Hidropónicas”, el cual implementa un prototipo de aplicación y un prototipo de hardware basado en Arduino, el cual es controlado por dicha aplicación.  
  * Durante la asignatura “Introducción al Diseño y Desarrollo de Videojuegos” en el año 2025, se desarrolló un proyecto “Byte & Bash”, donde se crearon prototipos para comprobar el funcionamiento de distintas mecánicas y funciones a implementar. 

**FORMACIÓN COMPLEMENTARIA**

* No corresponde.

**HABILIDADES TÉCNICAS Y HERRAMIENTAS**

* **Gestión y Colaboración:** Discord.  
* **Control de versiones:** GitHub.  
* **Lenguajes de Programación:** C, Java, GML.  
* **Base de Datos y Low-Code:** MySQL y Oracle APEX.  
* **Entornos de Desarrollo:** NetBeans, GameMaker.  
* **Modelado y Diseño:** LucidChart y Drawio.  
* **Documentación y Ofimática:** Office (Word, Excel), Google Drive.

## 3\. Caso de estudio seleccionado: Plataforma de Economía Colaborativa Basada en Oficios {#3.-caso-de-estudio-seleccionado:-plataforma-de-economía-colaborativa-basada-en-oficios}

### ***Motivaciones para la selección*** {#motivaciones-para-la-selección}

La elección de la **Plataforma de Economía Colaborativa Basada en Oficios** como caso de estudio se fundamenta en la necesidad de transformar un sector que, en el contexto de la provincia de Misiones, opera mayoritariamente bajo la informalidad: los clientes recurren a publicaciones en Facebook Marketplace, grupos de WhatsApp o recomendaciones verbales para contratar servicios técnicos como plomería, electricidad, carpintería o mantenimiento de equipos de climatización.  
Desde la perspectiva técnica, según Sommerville el sistema se clasifica como un **Producto de Software Genérico** (Sommerville, 2016, pp. 20-21), es decir, no responde a las necesidades de un único cliente, sino que se diseña como una solución de mercado escalable, abierta a cualquier prestador y consumidor de la región. Esto lo convierte en un caso de estudio pertinente para analizar y comparar distintos modelos de procesos de desarrollo, dado que involucra requerimientos de múltiples stakeholders, integración de servicios externos (pagos, geolocalización, verificación de identidad) y atributos de calidad exigentes (seguridad, disponibilidad, usabilidad).  
Además, el caso resulta innovador en el medio local, donde no existe una plataforma consolidada que aborde esta problemática de forma integral.

## Visión del Proyecto {#visión-del-proyecto}

## Análisis de mercado / negocio {#análisis-de-mercado-/-negocio}

## Dominio del problema {#dominio-del-problema}

## Análisis de riesgos. Caso de Estudio: Detalle y Alcance {#análisis-de-riesgos.-caso-de-estudio:-detalle-y-alcance}

### ***4.a. Descripción, contexto y requisitos del caso de estudio*** {#4.a.-descripción,-contexto-y-requisitos-del-caso-de-estudio}

##### ***Antecedentes y contexto*** {#antecedentes-y-contexto}

En la provincia de Misiones, la contratación de servicios técnicos calificados opera de manera fragmentada (en múltiples plataformas divididas por ejemplo por tipo de servicio) e informal. Los clientes buscan prestadores a través de publicaciones en redes sociales, grupos de WhatsApp o recomendaciones de conocidos, mientras que los prestadores gestionan su agenda y cartera de clientes mediante cuadernos físicos o conversaciones de mensajería. Esta dinámica genera problemas concretos: falta de trazabilidad en las contrataciones, imposibilidad de verificar la identidad o calificación del prestador, ausencia de mecanismos de reputación, y dificultades para coordinar disponibilidad horaria y zonas de cobertura entre localidades como Posadas, Garupá y Oberá.

##### ***Descripción del sistema*** {#descripción-del-sistema}

El caso de estudio propone el desarrollo de una plataforma SaaS (Software as a Service) que centralice la contratación de servicios técnicos calificados en Misiones. Sommerville (2016, p. 512\) define SaaS como un modelo en el cual el software se despliega en un servidor remoto y los usuarios acceden a él a través de un navegador web, eliminando la necesidad de instalación local y facilitando la actualización y el mantenimiento centralizado. El sistema conecta dos actores principales: los clientes que necesitan contratar un servicio y los prestadores que ofrecen sus competencias técnicas. Todo esto se realiza a través de una interfaz web accesible desde cualquier dispositivo.

##### ***Alcance de Servicios*** {#alcance-de-servicios}

La plataforma cubre servicios que se prestan de manera presencial en domicilios particulares, vinculados al mantenimiento, reparación, mejora o cuidado del hogar y sus instalaciones. Se contempla como evolución futura la extensión a consorcios de edificios y comercios. [\[Ir Anexo A: Profesiones y Regulaciones\]](#anexo-a:-profesiones-y-regulaciones)

Las categorías de servicios contempladas, con ejemplos representativos, son:

- **Instalaciones**: electricista, gasista, plomero.  
- **Estructura y exterior**: techista, albañil, pintor, vidriero.  
- **Espacios verdes**: jardinero, cortador de pasto, fumigador.  
- **Hogar y limpieza**: empleado doméstico, limpieza profunda.  
- **Climatización**: instalación y reparación de aire acondicionado, calefacción.  
- **Seguridad**: cerrajero, instalación de cámaras y alarmas.  
- **Reparaciones generales**: carpintero, herrero, soldador, técnico.

##### ***Stakeholders*** {#stakeholders}

Los usuarios interesados en el sistema son:

* **Clientes**: individuos que necesitan contratar un servicio técnico especializado para su hogar o negocio.  
* **Prestadores de Servicios**: técnicos calificados que desean ofrecer sus servicios, gestionar su agenda y construir reputación profesional en su oficio.  
* **Equipo de desarrollo**: grupo “Snack Overflow”, responsable del diseño, desarrollo y mantenimiento de la plataforma.  
* **Administradores de la plataforma:** responsables de la verificación de identidades, moderación de contenido y gestión operativa.

##### 

##### ***REQUISITOS*** {#requisitos}

Según Sommerville (2016, p. 205\) los requisitos del sistema se pueden clasificar en funcionales o no funcionales. Los describe cómo:

**Requisitos funcionales:** Son declaraciones de los servicios que el sistema debe proporcionar, cómo debe reaccionar ante determinadas entradas y cómo debe comportarse en situaciones específicas. En algunos casos, los requisitos funcionales también pueden indicar explícitamente lo que el sistema no debe hacer.

**Requisitos no funcionales:** Son restricciones sobre los servicios o funciones que ofrece el sistema. Incluyen restricciones de tiempo, restricciones en el proceso de desarrollo y restricciones impuestas por estándares. Los requisitos no funcionales suelen aplicarse al sistema en su conjunto, en lugar de a características o servicios individuales.

##### ***Requisitos Funcionales Esenciales*** {#requisitos-funcionales-esenciales}

**Criterios de priorización**  
Siguiendo los criterios de esencialidad de (Sommerville, 2016\) y aplicando la técnica MoSCoW descrita por (Wiegers & Hokanson, 2023), la prioridad se definió en base a cuánto contribuye cada requisito a los objetivos de negocio:

* Se clasificó como **Obligatorio (*Must have*)** todo requisito que   
  * (a) sostiene el flujo núcleo de búsqueda, contratación y pago, sin el cual la plataforma no cumple su propósito;   
  * (b) resulta exigido por la normativa aplicable;   
  * (c) constituye condición mínima de seguridad y moderación para operar. En la especificación, estos requisitos se redactan utilizando el verbo mandatario "deberá" (*shall*).  
* Se marcaron como **Deseables (*Should have*)** aquellas funciones que mejoran la experiencia o amplían el alcance, pero cuya ausencia no impide el éxito del lanzamiento. En la especificación, estos se redactan utilizando el verbo "debería" (*should*).  
* Se consideran **Opcionales (Could have)** los requisitos que agregan valor adicional de tipo incremental o conveniencia, pero cuyo impacto es limitado en relación con los objetivos centrales. Estos pueden incorporarse si existen recursos disponibles, ya que su postergación no afecta ni la operatividad básica ni la viabilidad del lanzamiento inicial. En la especificación, se redactan utilizando el verbo “podría” (could).

1. ###### *Requisitos Funcionales Esenciales*

| Código | Prioridad | Descripción |
| :---- | :---- | :---- |
| **RF-1** |  | **Gestión de usuarios y perfiles** |
| RF-1.1 | Obligatorio | El sistema *deberá* permitir el registro de usuarios con dos roles diferenciados: cliente y prestador. |
| RF-1.2 | Obligatorio | El sistema *deberá* autenticar al usuario mediante e-mail y contraseña. |
| RF-1.3 | Obligatorio | El prestador *deberá* cargar y acreditar su matrícula profesional cuando el oficio lo requiera. |
| RF-1.4 | Obligatorio | El usuario *deberá* poder editar su perfil (datos personales, foto, descripción y zona de cobertura). |
| RF-1.5 | Obligatorio | El administrador *deberá* poder suspender o dar de baja perfiles que incumplan las políticas de la plataforma. |
| **RF-2** |  | **Catálogo de servicios y búsqueda** |
| RF-2.1 | Obligatorio | El sistema *deberá* categorizar los servicios por oficio (plomería, electricidad, carpintería, etc.). |
| RF-2.2 | Obligatorio | El sistema *deberá* permitir filtrar prestadores por zona geográfica mediante geolocalización. |
| RF-2.3 | Deseable | El sistema *debería* permitir ordenar los resultados por calificación, distancia y disponibilidad del prestador. |
| RF-2.4 | Obligatorio | El prestador *deberá* poder publicar los servicios que ofrece, con descripción y rango de precios estimado. |
| **RF-3** |  | **Sistema de reputación** |
| RF-3.1 | Obligatorio | El cliente *deberá* poder calificar al prestador al finalizar una contratación mediante escala numérica y reseña textual. |
| RF-3.2 | Obligatorio | El sistema *deberá* calcular y mostrar la calificación promedio en el perfil del prestador. |
| RF-3.3 | Deseable | El prestador *debería* poder responder las reseñas recibidas. |
| RF-3.4 | Deseable | El administrador *debería* poder moderar reseñas con contenido inapropiado. |
| **RF-4** |  | **Agenda y disponibilidad** |
| RF-4.1 | Obligatorio | El prestador *deberá* poder configurar franjas horarias de disponibilidad por día de la semana. |
| RF-4.2 | Obligatorio | El sistema *deberá* bloquear automáticamente las franjas ya reservadas. |
| RF-4.3 | Deseable | El prestador *debería* poder marcar días o períodos como no disponibles (vacaciones, feriados). |
| **RF-5** |  | **Comunicación** |
| RF-5.1 | Obligatorio | El sistema *deberá* proveer un canal de comunicación directa entre cliente y prestador. |
| RF-5.2 | Deseable | El sistema *debería* registrar el historial de conversaciones vinculado a cada contratación. |
| RF-5.3 | Obligatorio | El sistema *deberá* notificar al usuario receptor cuando reciba un mensaje nuevo. |
| **RF-6** |  | **Contratación y seguimiento** |
| RF-6.1 | Obligatorio | El cliente *deberá* poder enviar una solicitud de servicio indicando ubicación, prestador, fecha, franja horaria y descripción del problema. |
| RF-6.2 | Obligatorio | El prestador *deberá* poder aceptar, rechazar o proponer una alternativa a la solicitud recibida. |
| RF-6.3 | Obligatorio | El prestador *deberá* poder enviar al cliente un precio estimado de mano de obra (sin materiales ni repuestos incluidos). |
| RF-6.4 | Obligatorio | El sistema *deberá* gestionar los estados de la contratación (solicitada, confirmada, en curso, finalizada, cancelada). |
| RF-6.5 | Deseable | El sistema *debería* notificar a las partes en cada cambio de estado de la contratación. |
| RF-6.6 | Obligatorio | El cliente y el prestador *deberán* poder cancelar una contratación conforme a las políticas de cancelación definidas. |
| **RF-7** |  | **Pagos** |
| RF-7.1 | Obligatorio | El sistema *deberá* integrar una pasarela de pago que acepte tarjetas y transferencias; debería además soportar QR y billeteras virtuales. |
| RF-7.2 | Deseable | El sistema *debería* retener el pago hasta la confirmación de finalización del servicio por parte del prestador. |
| RF-7.3 | Obligatorio | El sistema *deberá* emitir un comprobante digital por cada transacción. |
| RF-7.4 | Deseable | El sistema *debería* gestionar reembolsos conforme a las políticas de cancelación definidas. |
| **RF-8** |  | **Verificación de habilitaciones profesionales** |
| RF-8.1 | Obligatorio | El sistema *deberá* verificar las habilitaciones, matrículas y certificaciones del prestador según su profesión, consultando los organismos reguladores correspondientes. |
| RF-8.2 | Obligatorio | El sistema *deberá* validar la vigencia de la matrícula ante el organismo correspondiente para profesiones con matrícula obligatoria (gasista, fumigador). |
| RF-8.3 | Obligatorio | El sistema *deberá* solicitar y almacenar la documentación habilitante para profesiones con habilitación municipal o jurisdiccional (electricista, cerrajero). |
| RF-8.4 | Obligatorio | El sistema *deberá* permitir el alta por autodeclaración, complementada por el sistema de reputación y calificaciones (RF-3), para profesiones no reguladas formalmente (jardinero, empleado doméstico). |
| RF-8.5 | Deseable | El sistema *debería* notificar al prestador cuando sus habilitaciones estén próximas a vencer. |

##### ***Requisitos (Atributos de Calidad) NO Funcionales principales.*** {#requisitos-(atributos-de-calidad)-no-funcionales-principales.}

Siguiendo los atributos esenciales de calidad del software definidos por Sommerville (2016, p. 22):

* **Aceptabilidad (Acceptability):** Debe ser aceptable para el tipo de usuario al que esté destinado. Esto significa que debe ser entendible, utilizable y compatible con otros sistemas que los usuarios utilicen.  
* **Confiabilidad y Seguridad (Dependability and Security):** La confiabilidad incluye un rango de características como la fiabilidad, seguridad de la información (security) y seguridad funcional (safety). El software confiable no debe causar daños físicos ni económicos en caso de falla del sistema, y debe ser seguro    
* **Eficiencia (Efficiency):** El software no debe desperdiciar los recursos del sistema, como la memoria o los ciclos del procesador. Por lo tanto, la eficiencia abarca aspectos como tiempo de respuesta, el tiempo de procesamiento y la utilización óptima de recursos.  
* **Mantenibilidad (Maintainability):** El software debe escribirse de tal forma que pueda evolucionar para cumplir con las necesidades cambiantes de los usuarios. Este atributo es crítico, ya que el cambio es un requisito inevitable en el entorno de lógica de negocio de las empresas.

En base a la definición del autor, se definieron los siguientes requisitos:

###### 

***Aceptabilidad***

2. ###### *Requisitos no funcionales: Aceptabilidad.*

**Criterios de priorización**   
Se consideran **Obligatorios** los atributos que condicionan la adopción inicial del sistema por el usuario objetivo: usabilidad sin capacitación previa (dado el perfil heterogéneo de clientes y prestadores) y compatibilidad con los dispositivos y navegadores predominantes en la región.   
Se marcó como **Deseable** la minimización de pasos en el flujo de contratación porque mejora la conversión pero no impide completar la tarea.

| Código | Prioridad | Descripción | Métrica | Objetivo |
| :---- | :---- | :---- | :---- | :---- |
| RNF-A.1 | Obligatorio | El sistema *deberá* ser usable sin capacitación previa por usuarios mayores de 18 años con alfabetización digital básica. | Tasa de completitud de tareas clave (registro, búsqueda, contratación) sin asistencia. | Más del 85% de usuarios completaron el flujo en el primer intento. |
| RNF-A.2 | Obligatorio | El sistema *deberá* ser compatible con los dispositivos y navegadores predominantes en la región. | Cobertura de navegadores y sistemas operativos soportados respecto a la cuota de mercado regional. | Funcionamiento verificado en Chrome, Firefox y Safari (últimas 2 versiones estables) en sus versiones de escritorio y móvil. Errores críticos de compatibilidad: 0\. |
| RNF-A.3 | Deseable | El sistema *debería* minimizar la cantidad de pasos necesarios para contratar un servicio. | Cantidad de pasos (pantallas/acciones) desde búsqueda hasta confirmación de contratación. | 5 pasos o menos para completar una contratación. |

###### 

***Confiabilidad y Seguridad***

3. ###### *Requisitos no funcionales: Confiabilidad y Seguridad*

**Criterios de priorización**   
Se priorizaron como **Obligatorios** todos los atributos asociados a cumplimiento legal, protección de datos, validación de identidad y matrícula de prestadores, y disponibilidad mínima para atender urgencias domiciliarias. El incumplimiento de cualquiera de estos atributos expone al proyecto a riesgos legales, reputacionales o de seguridad del usuario que impiden operar.   
Se marcó como **Deseable** el registro auditable con hash de integridad (RNF-S.7) porque aporta trazabilidad adicional pero no es condición legal para el lanzamiento.

| Código | Prioridad | Descripción | Métrica | Objetivo |
| :---- | :---- | :---- | :---- | :---- |
| RNF-S.1 | Obligatorio | El sistema *deberá* proteger los datos sensibles aplicando el principio de mínimo privilegio. | Cantidad de roles con acceso a datos personales no públicos. | Solo el prestador asignado accede a datos de contacto del cliente; datos financieros accesibles sólo por el módulo de pagos. |
| RNF-S.2 | Obligatorio | El sistema *deberá* preservar la confidencialidad del historial de mensajes entre las partes de la contratación. | Accesos no autorizados detectados en auditoría. | 0 accesos de terceros a conversaciones ajenas. |
| RNF-S.3 | Obligatorio | El sistema *deberá* validar la identidad y matrícula del prestador antes de habilitarlo para operar. | Porcentaje de prestadores activos con verificación completada. | 100% de prestadores activos verificados antes de operar. |
| RNF-S.4 | Obligatorio | El sistema *deberá* tratar los datos personales y financieros conforme a la Ley 25.326 de Protección de Datos Personales. | Resultado de auditoría de cumplimiento legal. | Cumplimiento total verificado en auditoría semestral. |
| RNF-S.5 | Obligatorio | El sistema *deberá* garantizar alta disponibilidad para atender urgencias domiciliarias. | Porcentaje de uptime mensual. | \>= 99.5% de disponibilidad mensual (máximo \~3.6 horas de caída/mes). |
| RNF-S.6 | Obligatorio | La plataforma *deberá* delimitar legalmente su responsabilidad respecto a los servicios contratados. | Existencia y aceptación obligatoria de términos de servicio. | 100% de usuarios deben aceptar los términos antes de operar; revisión legal anual. |
| RNF-S.7 | Deseable | El sistema *debería* almacenar las verificaciones de habilitaciones con registro íntegro y auditable. | Registros de verificación con hash de integridad y timestamp. | 100% de verificaciones con registro auditable e inmutable. |
| RNF-S.8 | Obligatorio | El sistema *deberá* revalidar periódicamente las habilitaciones del prestador y suspenderlo automáticamente al vencer. | Frecuencia de revalidación automática. | Revalidación cada 90 días; suspensión automática si la habilitación venció. |

###### 

***Eficiencia***

4. ###### *Requisitos no funcionales: Eficiencia*

**Criterios de priorización**   
Se clasificó como **Obligatorio** el tiempo de respuesta de las búsquedas (RNF-E.1) porque impacta directamente en la tasa de abandono del flujo núcleo: si la búsqueda no responde con fluidez, el usuario no llega a contratar.   
Los atributos de consumo eficiente de recursos bajo carga y funcionamiento en condiciones de conectividad limitada se marcaron como **Deseables** porque optimizan la operación a escala y en escenarios adversos, pero no son condición para que el sistema opere en el contexto inicial de lanzamiento regional.

| Código | Prioridad | Descripción | Métrica | Objetivo |
| :---- | :---- | :---- | :---- | :---- |
| RNF-E.1 | Obligatorio | El sistema *deberá* resolver las búsquedas de prestadores sin afectar la experiencia del usuario. | Tiempo de respuesta del servidor (p95). | \<= 2 segundos para búsquedas con filtros para por lo menos 95% de las búsquedas. |
| RNF-E.2 | Deseable | El sistema *debería* procesar reservas y pagos con uso eficiente de recursos. | Uso de CPU y memoria por transacción bajo carga. | Soportar como mínimo 100 transacciones concurrentes sin superar el 70% de uso de CPU/memoria del servidor. |
| RNF-E.3 | Deseable | El sistema *debería* ser funcional en condiciones de conectividad limitada. | Tamaño de página y recursos descargados para operaciones críticas. | Páginas principales \<= 1 MB; funcionalidad básica operativa con conexiones de 1 Mbps. |

***Mantenibilidad***

5. ###### *Requisitos no funcionales: Mantenibilidad*

**Criterios de priorización**   
Se priorizaron como **Deseables** los atributos que preparan al sistema para evolucionar (incorporar nuevas categorías y zonas, absorber cambios regulatorios, desacoplar integraciones externas): son inversiones arquitectónicas que aportan valor a mediano plazo y facilitan la expansión geográfica prevista, pero el sistema puede operar sin ellas en su versión inicial.   
Se marcó como **Opcional** la integración de anuncios publicitarios (RNF-M.3) porque representa una línea de monetización diferible a fases posteriores y no guarda relación con el propósito núcleo de la plataforma.

| Código | Prioridad | Descripción | Métrica | Objetivo |
| :---- | :---- | :---- | :---- | :---- |
| RNF-M.1 | Deseable | El sistema *debería* facilitar la incorporación de nuevas categorías de servicio y zonas geográficas. | Esfuerzo estimado para agregar una nueva categoría o zona. | \<= 8 horas de desarrollo para incorporar una nueva categoría con sus reglas de validación. |
| RNF-M.2 | Deseable | La arquitectura *debería* soportar cambios en el modelo de negocio o regulaciones. | Porcentaje del código afectado por un cambio regulatorio típico. | Un cambio regulatorio (nuevo ente, nueva matrícula) debe impactar \<= 5% de los módulos del sistema. |
| RNF-M.3 | Opcional | El sistema *podría* integrar anuncios publicitarios sin degradar la experiencia del usuario. | Incremento en tiempo de carga atribuible a anuncios. | Los anuncios no deben incrementar el tiempo de carga en más de 500 ms. |
| RNF-M.4 | Deseable | Los componentes de integración con servicios externos *deberían* estar desacoplados de la lógica de negocio. | Tiempo para reemplazar un proveedor externo (pagos, mensajería, geolocalización). | \<= 40 horas de desarrollo para sustituir cualquier integración externa sin modificar la lógica de negocio. |

#### **Tipos de producto y de Tipo de Sistemas o Aplicaciones de Software involucrados** {#tipos-de-producto-y-de-tipo-de-sistemas-o-aplicaciones-de-software-involucrados}

Se categoriza como un **Producto de Software Genérico** (Sommerville, 2016, pp. 20-21), ya que no está diseñado para una organización o cliente en específico, sino que cualquier persona que quiera ofrecer sus servicios puede utilizarlo. Asimismo, se clasifica como una **Aplicación Basada en Transacciones Interactivas** (Sommerville, 2016, pp. 24-25), cuyo núcleo es procesar reservas y pagos entre múltiples usuarios distribuidos en la región.

Usando como referencia la taxonomía de clasificación para la economía colaborativa (CoE) basada en plataformas digitales propuesta por Kovács et al. (2021, p. 1\) podemos clasificarla como un **sistema producto-servicio,** porque el cliente accede temporalmente a una competencia técnica sin que se produzca transferencia de propiedad/bien. Al ser los prestadores individuos privados que ofrecen servicios a través de un intermediario digital, la plataforma se corresponde con la Sharing Economy (SE). Dentro de esta subcategoría, los autores identifican el segmento de servicios profesionales y personales; también denominado gig economy u on-demand economy.  

Además, coincide con las cuatro características primarias de los negocios basados en economía colaborativa propuestas por Szegedi (2019):

1. La actividad es implementada a través de una página web, una aplicación o una plataforma online.  
2. Permite transacciones entre pares (P2P). Es decir, no se necesita un intermediario.  
3. Provee acceso temporal a bienes y servicios sin un cambio de propiedad.  
4. Los medios, servicios, habilidades o recursos sin utilizar se ponen en uso.

### ***4.b. Adaptación del caso a una realidad regional*** {#4.b.-adaptación-del-caso-a-una-realidad-regional}

*Incluir legislación/es revisadas y a revisar; organizaciones y stakeholders contactados y a contactar y entrevistar, indagar, revisión de aplicaciones existentes en el dominio (análisis de mercado), etc.*

##### ***Legislaciones revisadas*** {#legislaciones-revisadas}

**Marco legal y regulatorio:**

Ley N° 25.326 de Protección de los Datos Personales (2000):

A continuación se realiza una síntesis de los artículos más importantes aplicables a nuestro caso de estudio.

1. **Principios sobre los datos:** los datos deben ser ciertos, adecuados, pertinentes, no excesivos, exactos y actualizados. No pueden usarse para fines distintos a los que motivaron su recolección, y deben destruirse cuando ya no sean necesarios.  
2. **Consentimiento:** el tratamiento de datos personales es ilícito cuando el titular no hubiera prestado su consentimiento libre, expreso e informado, el que deberá constar por escrito o por un medio equivalente. Hay excepciones, como cuando los datos provienen de fuentes públicas o derivan de una relación contractual.  
3. **Datos sensibles:** ninguna persona puede ser obligada a proporcionar datos sensibles, y queda prohibida la formación de archivos que almacenen información que directa o indirectamente los revele.  
4. **Derechos de los titulares:** los ciudadanos tienen derecho a conocer qué datos se tienen sobre ellos, corregir datos inexactos y eliminar datos cuando corresponda.  
5. **Seguridad y confidencialidad:** el responsable del archivo debe adoptar las medidas técnicas y organizativas necesarias para garantizar la seguridad y confidencialidad de los datos, evitando su adulteración, pérdida o acceso no autorizado.

Ley N° 27.078, Argentina Digital (2014): marco regulatorio para servicios de tecnología de la información.

A continuación se realiza una síntesis de los artículos más importantes aplicables a nuestro caso de estudio.

1. **Inviolabilidad de las comunicaciones (Art. 5):** los mensajes e intercambios entre clientes y prestadores dentro de la plataforma son inviolables. Solo un juez puede ordenar su interceptación. Esto es relevante ya que nuestra plataforma incluirá un sistema de mensajería.  
2. **Servicio Universal (Arts. 18 y 19):** el Estado debe garantizar que los potenciales usuarios de la plataforma tengan acceso a Internet en condiciones justas, lo que impacta directamente en el alcance real del sistema.  
3. **Derechos de los usuarios de servicios TIC (Art. 59):**  
* **Inc. c:** Tener acceso a toda la información relacionada con el ofrecimiento o prestación de los servicios.  
* **Inc. e:** presentar, sin requerimientos previos innecesarios, peticiones y quejas ante el licenciatario y recibir una respuesta respetuosa, oportuna, adecuada y veraz.  
* **Inc. f:** la protección de los datos personales que ha suministrado al licenciatario, los cuales no pueden ser utilizados para fines distintos a los autorizados, de conformidad con las disposiciones vigentes. (complementado por la ley 25.326).  
4. **Obligaciones de los licenciatarios de Servicios de TIC (Art. 62):**  
* **Inc. b:** no incluir en los contratos cláusulas que restrinjan o condicionen en modo alguno a los usuarios la libertad de elección de otro licenciatario o que condicionen la rescisión del mismo o la desconexión de cualquier servicio adicional contratado.  
* **Inc. f:** garantizar a los usuarios la confidencialidad de los mensajes transmitidos y el secreto de las comunicaciones.

##### ***Legislaciones a revisar*** {#legislaciones-a-revisar}

Normativa provincial y municipal de habilitaciones profesionales: verificar qué oficios requieren matrícula habilitante en Misiones (instaladores de gas, electricistas matriculados, etc.) y cómo la plataforma debería validar esas habilitaciones.

Régimen fiscal aplicable: obligaciones impositivas para prestadores que operan a través de la plataforma (monotributo, facturación electrónica vía ARCA).

##### ***Análisis de Mercado*** {#análisis-de-mercado}

El análisis de mercado se llevó a cabo mediante búsquedas en la web de aplicaciones y servicios de software que incluyeran, al menos, una funcionalidad de conexión entre proveedor y cliente, con el objetivo de ofrecer servicios de oficio. Teniendo esto en cuenta, encontramos los siguientes proveedores de servicios similares a nuestro caso de estudio:

* **Clickie (s.f.):** Sólo funciona en Ciudad Autónoma de Buenos Aires (CABA) y Córdoba.  
* **Tegu (s.f.):** Sólo funciona en Córdoba Capital, y utiliza WhatsApp como medio de funcionamiento.  
* **MercadoLibre Servicios (s.f.):** Si bien es un servicio que funciona en todo el país, está orientado principalmente a las grandes ciudades, como CABA. Esto ocasiona que, al ser un cliente de una provincia o ciudad pequeña, lo más probable es que sea difícil encontrar profesionales por este medio. Esto presenta una oportunidad ya que, al centrarnos en Misiones, cubriremos un nicho con poca representación.  
* **MannoApp (s.f.):** Sólo funciona en CABA, Área Metropolitana de Buenos Aires (AMBA), Córdoba, Mendoza, Salta, Rosario, Corrientes y Resistencia.  
* **Home Solution (s.f.):** Si bien el servicio es similar a nuestro caso de estudio, presenta una distinción: en Home Solution, los clientes describen sus proyectos y son los profesionales los que se comunican con ellos para ofrecer sus servicios, teniendo que realizar un pago para establecer dicho contacto.  
* **Qxm (s.f.):** Similar a Home Solution, en este sistema los clientes son los que describen sus proyectos, y los proveedores de servicios son quienes se comunican.  
* **Zolvers (s.f.):** Tiene un funcionamiento similar a Home Solution y Qxm.

(c) Considerando criterios generales y sub criterios de estos que hayan definido en particular; ANALICEN VENTAJAS Y DESVENTAJAS DE APLICAR \-CADA UNO DE LOS PROCESOS DE DESARROLLO DE SOFTWARE REVISADOS EN EL PUNTO 1- AL CASO DE ESTUDIO ADAPTADO. Justificar cada análisis realizado. Se espera se utilice \-además de la bibliografía de referencia cubierta en la asignatura- la bibliografía adicional recomendada; como ser: (Despa, 2014\) y (Sarker et al., 2015). Luego, sinteticen en un cuadro comparativo el análisis de ventajas y desventajas realizado. Idealmente, se debería realizar tanto análisis cualitativo como cuantitativo.

### ***4.c. Ventajas y desventajas de aplicar cada proceso de desarrollo de software al caso de estudio*** {#4.c.-ventajas-y-desventajas-de-aplicar-cada-proceso-de-desarrollo-de-software-al-caso-de-estudio}

Las ventajas y desventajas se definieron teniendo en cuenta la bibliografía adicional de los autores Despa (2014, pp. 51-54) y Sarker et al. (2015, pp. 62-68), adaptando las ventajas y desventajas mencionadas al caso de estudio.

Se tomaron en cuenta las siguientes preguntas al momento de definir las ventajas y desventajas:

* EXP: ¿El equipo tiene experiencia utilizando el modelo de proceso?

  * Al tener experiencia utilizando el modelo de proceso, se facilita la organización del grupo de desarrollo, y se conocen de mejor forma los objetivos del modelo y cómo lograrlos. Caso contrario, se debe utilizar tiempo que podría ser utilizado para el desarrollo en asimilar completamente los conceptos a implementar.

* PLN: ¿Se necesita una planificación extensa antes de comenzar el desarrollo?

  * La necesidad de una planificación extensa es, en este caso de estudio, poco necesaria, ya que el sistema no es crítico y no contamos con un cliente con el cual validar completamente los requisitos. Por lo tanto, un modelo de proceso que permita comenzar el desarrollo lo antes posible sería más apropiado.

* DOC: ¿Produce una documentación extensa?

  * Una buena documentación permite a los integrantes del equipo de desarrollo poder recordar y entender de mejor manera las decisiones tomadas anteriormente. Además, permite conocer más profundamente el funcionamiento y la extensión del proyecto. Sin embargo, una gran cantidad de documentación puede significar menos tiempo utilizado para desarrollar el proyecto y, teniendo en cuenta nuestro caso de uso, puede no ser muy útil, ya que el equipo cuenta con comunicación informal.

* CHA: ¿Es fácil adaptarse a los cambios?

  * Los cambios son inevitables, por lo que un modelo de proceso que nos permita afrontar dichos cambios sin necesidad de realizar una gran cantidad de retrabajo o modificar de forma extensa el proyecto es más valioso.

* USR: ¿Implica continuamente al usuario?

  * En nuestro caso de estudio, no contamos con el contacto de un representante del usuario del sistema final, por lo que se debería asignar tiempo a encontrar uno (aumentando la complejidad del proyecto), o asignar a uno de los integrantes del grupo de desarrollo como representante, lo que sería más sencillo pero significaría que el usuario final podría no estar fielmente representado.

* VER: ¿Produce una versión funcional rápidamente?

  * Con una versión funcional del software temprana, podemos validar los requisitos especificados, modificarlos en el caso de ser necesario, o incluso encontrar nuevos. Además de encontrar y solucionar posibles problemas antes de que necesiten una gran cantidad de retrabajo.

#### **Modelos dirigidos por un plan** {#modelos-dirigidos-por-un-plan}

##### ***STRADIS*** {#stradis}

**Ventajas**

* Todos los miembros del equipo de desarrollo cuentan con experiencia utilizando este modelo de proceso, lo que facilita la organización. \[EXP\]  
* Ya que, en el escenario planteado, no tenemos un representante del usuario final externo al equipo de desarrollo, la poca interacción del usuario con el modelo de cascada permite al equipo centrarse en el desarrollo del sistema. \[USR\]

**Desventajas**

* El tener una planificación extensa, que es una característica de este modelo. No es necesaria para este escenario ya que el sistema no es crítico y no contamos con un cliente con el cual validar completamente los requisitos. \[PLN\]  
* Las ventajas relacionadas con la completitud de documentación para que la colaboración entre distintos grupos de desarrollo sea óptima no será aprovechada, ya que el equipo de desarrollo tiene un contacto informal entre sí. \[DOC\]  
* Si bien una correcta aplicación del modelo significa que deberían ocurrir pocos cambios durante el desarrollo, el modelo presenta poca compatibilidad con los cambios de requisitos y tolerancia baja a los errores de diseño y planeación. Es por esto que requiere un análisis extenso del escenario y planificación antes de comenzar el desarrollo. El caso de estudio, al ser un sistema no-crítico, podría omitir este análisis extenso y enfocarse en el diseño y desarrollo de funcionalidades. \[CHA\]  
* Una versión funcional del programa sería entregada en las etapas tardías del proyecto. \[VER\]

##### ***Rational Unified Process*** {#rational-unified-process}

**Ventajas**

* Mediante el desarrollo de prototipos durante la fase de Elaboración y versiones funcionales en la fase de Construcción, se validan los supuestos de diseño y se recibe retroalimentación de los interesados antes de la entrega final. \[VER\]

**Desventajas**

* Requiere de profesionales altamente calificados, ya que es necesario contar con personal con un alto nivel de especialización y experiencia técnica para implementarlo. El equipo no presenta ningún integrante con experiencia utilizando este modelo. \[EXP\]  
* Aunque busca la validación, el modelo asume una participación de los interesados muy estructurada. Por lo que tener un solo representante del equipo puede ser muy poco representativo de las necesidades reales, ya que el proceso se vuelve demasiado introspectivo y técnico \[USR\]  
* Exige una documentación y formalismo significativos. Genera una gran cantidad de artefactos (modelos de casos de uso, diagramas de arquitectura, documentos de diseño) que consumen tiempo y recursos que podrían dedicarse directamente al desarrollo de código \[DOC\]  
* La adaptación a cambios radicales una vez superada la fase de Elaboración puede ser difícil, ya que está muy ligado a la arquitectura elegida, lo cual puede ser un inconveniente en nuestro caso. \[CHA\]

##### ***V-Modell XT*** {#v-modell-xt}

**Ventajas**

* El proceso de tailoring permite seleccionar únicamente los módulos de proceso relevantes para el proyecto, lo que reduce la carga innecesaria y adapta el modelo a las necesidades reales del caso de estudio. \[PLN\]

**Desventajas**

* La selección de módulos de proceso, tipos de proyecto y estrategias de ejecución durante el tailoring implica una planificación extensa antes de comenzar el desarrollo. \[PLN\]  
* Al ser un modelo centrado en documentos, una parte considerable del tiempo del equipo se destinaría a producir y mantener documentación, reduciendo el tiempo disponible para el desarrollo efectivo del software. \[DOC\]  
* La poca experiencia del equipo con el V-Modell XT implicaría una curva de aprendizaje significativa para comprender sus conceptos, fases y artefactos, consumiendo tiempo que podría destinarse al desarrollo. \[EXP\]  
* El modelo no está orientado a producir versiones funcionales del software de forma temprana, lo que dificulta la validación temprana de requisitos \[VER\]  
* El modelo define una secuencia estructurada de productos de trabajo y decisiones que, una vez completados, son difíciles de modificar sin afectar la consistencia del resto de la documentación y el desarrollo asociado, lo que implica un retrabajo considerable ante cambios en los requisitos. \[CHA\]  
* Al no contar con un representante del usuario externo, uno de los integrantes del equipo debería asumir ese rol las interacciones que el modelo establece entre contratante y contratista, lo que podría no representar fielmente al usuario final y afectar la calidad de los productos de trabajo generados. \[USR\] 

##### ***Open UP*** {#open-up}

**Ventajas**

* Al partir de un núcleo ágil y ser un proceso mínimo por diseño, no requiere una planificación exhaustiva antes de comenzar el desarrollo, permitiendo iniciar el trabajo efectivo más rápidamente que otros procesos derivados del UP. \[PLN\]  
* El concepto de micro-incrementos permite obtener unidades de trabajo funcionales en períodos cortos de tiempo, facilitando la validación temprana de requisitos y la detección oportuna de problemas antes de que requieran retrabajo significativo. \[VER\]  
* El principio de evolución continua para obtener retroalimentación permanente, combinado con el desarrollo iterativo, permite incorporar cambios en los requisitos sin necesidad de modificar extensamente lo ya desarrollado. \[CHA\]  
* Al ser considerablemente más simple y accesible que el RUP completo, la curva de aprendizaje del equipo sería menor, reduciendo el tiempo necesario para asimilar los conceptos del proceso. \[EXP\]  
* No impone una producción documental extensa, lo que permite al equipo de desarrollo asignar más tiempo al desarrollo efectivo del software dado el tamaño y naturaleza del caso de estudio. \[DOC\]

**Desventajas**

* Al no contar con un representante del usuario externo, uno de los integrantes del equipo debería asumir ese rol para aplicar el principio de colaboración y alineamiento de intereses, lo que podría no representar fielmente al usuario final. \[USR\]  
* La poca experiencia del equipo con conceptos propios del Proceso Unificado, la gestión de riesgos y el enfoque centrado en arquitectura temprana, podría consumir tiempo adicional para asimilarlos correctamente durante las primeras iteraciones. \[EXP\]

##### ***Win Win***  {#win-win}

**Ventajas**

* Los puntos de fijación definidos en cada ciclo de la espiral permiten obtener versiones o estados funcionales del sistema de forma periódica, facilitando la validación incremental de los requisitos especificados. \[VER\]  
* La capacidad de renegociar condiciones en cada vuelta de la espiral nos permite adaptarse a cambios en los requisitos sin necesidad de rehacer extensamente lo ya desarrollado. \[CHA\]

**Desventajas**

* La poca experiencia del equipo con las actividades de negociación propias del modelo podría consumir mucho tiempo  y producir acuerdos poco precisos. \[EXP\]  
* El proceso de negociación al inicio de cada ciclo requiere tiempo y participación activa, lo que retrasa el comienzo efectivo del desarrollo en cada iteración. \[PLN\]  
* Al no contar con un cliente o representante del usuario externo, uno de los integrantes del equipo debería asumir ese rol para poder llevar a cabo las negociaciones. Lo que afectaría la calidad de las negociaciones. \[USR\]

##### ***MBASE***  {#mbase}

**Ventajas**

* Lo iterativo del proceso, permite incorporar cambios en los requisitos o en la arquitectura sin necesidad de rehacer extensamente lo ya desarrollado. \[CHA\]

**Desventajas**

* Los puntos de anclaje LCO, LCA e IOC aportan a un esfuerzo considerable antes de tener una versión funcional, dificultando la validación incremental de los requisitos antes de continuar con el desarrollo. \[VER\]  
* La curva de aprendizaje del proceso es elevada; la poca experiencia del equipo con modelos formales y semiformales, así como con los puntos de anclaje LCO, LCA e IOC, consumiría mucho tiempo que podría destinarse al desarrollo. \[EXP\]  
* La creación y mantenimiento continuo de los modelos de objetivos, requisitos, arquitectura y planificación implica una producción documental y modelada considerable, reduciendo el tiempo disponible para el desarrollo del software. \[DOC\]  
* El proceso está diseñado para sistemas complejos, críticos o de larga duración, por lo que su aplicación en el caso de estudio propuesto resultaría excesiva y poco justificada dado el tamaño y la naturaleza no crítica del sistema. \[PLN\]

#### **Modelos de procesos ágiles** {#modelos-de-procesos-ágiles}

##### ***XP*** {#xp}

**Ventajas**

* La programación en pares implica que dos programadores desarrollen código a la vez, lo que reduce el número de fallos y malas prácticas, disminuyendo la cantidad de cambios a gran escala. \[CHA\]  
* No se tiene un énfasis en la creación de documentación. En el caso de estudio propuesto, esto permite asignar más tiempo al desarrollo del software. \[DOC\]  
* Este modelo presenta entregas frecuentes de código funcional. \[VER\]  
* Las historias de usuario permiten una fácil comprensión de los requisitos. Ya que el sistema final pretende ser simple en su funcionamiento, sería posible abarcar todos los escenarios posibles mediante estas historias. \[DOC\]

**Desventajas**

* Ningún integrante cuenta con experiencia a la hora de usar este modelo. \[EXP\]  
* Es necesario escribir pruebas antes de programar. Ningún integrante del equipo de desarrollo cuenta con experiencia al momento de desarrollar pruebas, lo que implicaría dedicar tiempo a aprender a cómo realizarlas antes de poder empezar a programar. \[EXP\]  
* Se necesitan reuniones frecuentes. Los integrantes del equipo de desarrollo no poseen el mismo itinerario, lo que significa que las reuniones pueden ser difíciles de organizar. \[PLN\]  
* Se debe implicar continuamente al usuario, ya que él es quien decide la prioridad de las tareas, y provee un feedback constante. \[USR\]

##### ***Scrum*** {#scrum}

**Ventajas**

* Este modelo solo requiere una planificación general antes de comenzar el desarrollo, ya que la mayor parte de la planificación se realiza durante el desarrollo y de forma incremental. \[PLN\]  
* La capacidad de adaptarse a los cambios de este modelo de proceso es útil ya que durante el desarrollo del proyecto probablemente ocurran situaciones inesperadas. \[CHA\]  
* No se tiene un énfasis en la creación de documentación. En el caso de estudio propuesto, esto permite asignar más tiempo al desarrollo del software. \[DOC\]  
* Esta metodología permite entregar productos en ciclos cortos de tiempo. \[VER\]  
* Las reuniones constantes permiten al equipo de desarrollo determinar prioridades de las funciones restantes, el posible tiempo que tomaría implementar dichas funcionalidades, además de conocer la situación general del proyecto.  
* El equipo de desarrollo cuenta con una comunicación informal constante, lo que facilita la aplicación del modelo de proceso. 

**Desventajas**

* La poca experiencia del equipo al momento de organización de reuniones diarias, junto con la actividad de estimar tiempos y prioridades de las historias de usuario podrían ocupar más tiempo del esperado por el equipo de desarrollo. \[EXP\]  
* La poca experiencia del equipo de desarrollo con la estimación de tiempos y dificultad de las distintas funcionalidades a implementar significa que éstas llevarán mucho tiempo y además pueden no ser precisas. \[EXP\]  
* Debido a no tener un cliente con el cual interactuar, uno de los integrantes del equipo de desarrollo debería tomar el rol de cliente. Sin embargo, esto no representaría de forma fiel al usuario final. \[USR\]

##### ***Kanban*** {#kanban}

**Ventajas**

* Optimización del flujo de trabajo: permite a los equipos visualizar las etapas del proceso (ej. “Por hacer”, “en desarrollo”, “pruebas”) mediante un tablero visual, facilitando la detección inmediata de cuellos de botella en tiempo real, optimizando el flujo de trabajo entre módulos del sistema (pagos, agendas, etc). \[PLN\]  
* Reducción de la sobrecarga (límites de WIP): asegura que el equipo se enfoque en terminar las tareas antes de iniciar nuevas. Evita la pérdida de utilidad del servicio de planes extensos y reduce el esfuerzo en tareas que no aportan valor inmediato. \[PLN\]  
* Al no exigir roles rígidos el modelo es más flexible para el equipo de desarrollo por su baja burocracia, permite que éstos dediquen más tiempo al diseño y desarrollo técnico que a la gestión del proceso. \[PLN\]  
* Permite una respuesta inmediata a los cambios en las necesidades del negocio, ya que el equipo puede reordenar las prioridades del backlog en cualquier momento antes de que una tarea entre desarrollo (por ejemplo, cómo se visualiza o puntúa la reputación de un trabajador). \[CHA\]

**Desventajas**

* Dificultad en la previsibilidad a largo plazo: debido a su naturaleza de flujo continuo y la ausencia de iteraciones de tiempo fijo, puede ser más complejo estimar fechas de finalización exactas para proyectos grandes en comparación con modelos planificados. \[PLN\]  
* Riesgo de falta de disciplina: El equipo no mantiene una disciplina rigurosa con los límites WIP y la actualización del tablero, el sistema puede degradarse rápidamente hacia el caos. \[EXP\]  
* El equipo de desarrollo no tiene experiencia usando la metodología Kanban o una aproximación del proceso, únicamente con herramientas que facilitan su uso como Notion o Trello. \[EXP\].  
* Gestión de dependencias técnicas: Al no enfatizar el diseño arquitectónico exhaustivo inicial, la integración técnica de módulos críticos **(como asegurar que la valoración impacte correctamente en el perfil del trabajador tras un pago confirmado**) puede volverse compleja y generar errores de integración tardíos si no se planifica correctamente**.** \[DOC\] (Pressman y Maxim, 2020, pp. 48-50).

##### ***DevOps*** {#devops}

**Ventajas**

* Permite el trabajo colaborativo entre equipos y la co-ubicación; tiene una planificación incremental y continua, lo que evita el "retrabajo" de planes extensos que quedan obsoletos. \[PLN\]  
* El modelo entrelaza las actividades de especificación, desarrollo y validación, lo que nos permite adaptar los requisitos a medida que avanza el proyecto en lugar de realizar una ingeniería de requisitos extensa al comienzo del proyecto. Esto es relevante ya que los requisitos probablemente cambien conforme los usuarios interactúen con las primeras versiones de la plataforma. \[CHA\]  
* El modelo permite realizar múltiples revisiones tanto sobre la aplicación completa como sobre funcionalidades específicas. Esto resulta conveniente para un sistema con módulos diferenciados (gestión de usuarios, catálogo, reputación, agenda, pagos), donde cada módulo puede ser revisado y ajustado de forma independiente en cada iteración. \[CHA\]  
* Se obtienen versiones funcionales del sistema desde etapas tempranas del proyecto, lo que permite validar supuestos de diseño y recibir retroalimentación continua. \[VER\]

**Desventajas**

* Tiene una curva de aprendizaje y exigencia de perfiles híbridos, ya que para implementarlo con éxito requiere personal con habilidades muy específicas. El equipo no presenta ningún integrante con experiencia utilizando este modelo. \[EXP\]  
* El modelo exige que prácticamente cualquier elemento que impacte el producto sea representado como código. Esto demanda un gran esfuerzo inicial significativo en tiempo y recursos para configurar inicialmente el proyecto. \[DOC\]   
* Los incrementos tienen el objetivo de ser utilizados por el usuario con el fin de ganar experiencia y tener en claro posibles requisitos para incrementos futuros. En nuestro caso, utilizar a uno de los integrantes del equipo de desarrollo como representante del usuario final no sería una representación fiel, ya que el representante a su vez está diseñando el producto. \[USR\]  
* El ecosistema técnico de DevOps cambia constantemente, lo que obliga al equipo a dedicar tiempo continuo al mantenimiento de su propio conjunto de herramientas y al aprendizaje de nuevas tecnologías. \[EXP\]

#### **Análisis cualitativo** {#análisis-cualitativo}

Se desarrolló un análisis cualitativo comparando los modelos de procesos propuestos contra los subcriterios definidos a continuación:  
*Subcriterios:* 

| *\#* | *Etiqueta* | *Pregunta* |
| ----- | ----- | ----- |
| *1* | *sub\_EXP* | *¿El equipo cuenta con experiencia previa o una curva de aprendizaje baja con este modelo?* |
| *2* | *sub\_PLN* | *¿El modelo permite comenzar el desarrollo sin una planificación exhaustiva previa?* |
| *3* | *sub\_DOC* | *¿El modelo evita imponer una producción documental o de modelos formales significativa?* |
| *4* | *sub\_CHA* | *¿El modelo permite incorporar cambios en los requisitos sin generar retrabajo extenso?* |
| *5* | *sub\_VER* | *¿El modelo produce versiones funcionales del software en etapas tempranas del proyecto?* |
| *6* | *sub\_APT* | *¿El modelo es apto para el desarrollo de un sistema web no crítico de tamaño pequeño?* |

Las justificaciones de los **SI** o **NO** dadas a las etiquetas (**sub\_*EXP, sub\_PLN, sub\_DOC, sub\_CHA, sub\_VER****)* que encontramos en la matriz de análisis cualitativo se encuentran expresadas en las ventajas y desventajas de cada proceso, definidas anteriormente. 

Para la etiqueta **sub\_APT** (Aptitud para el tipo de sistema), definida a partir de las características del sistema a construir —no crítico, de tamaño pequeño y corta duración—, se tomó como referencia los criterios como la criticidad del sistema, su tamaño y la previsibilidad de sus requisitos. Se realizó una justificación para cada proceso:

* **STRADIS**: Diseñado para sistemas grandes con requisitos estables y bien definidos desde el inicio.

* **RUP**: Diseñado para proyectos grandes con equipos especializados; excesivo para un sistema web pequeño. 

* **V-Modell XT**: Orientado a proyectos gubernamentales. 

* **OpenUP**: Diseñado explícitamente como proceso mínimo para equipos pequeños con sistemas web.

* **Win-Win**: Orientada a que requieran negociaciones complejas con múltiples stakeholders en sistemas.

* **MBASE**: Diseñado para sistemas complejos, críticos o de larga duración.

* **XP**: Diseñado para equipos pequeños con entregas frecuentes de software web. 

* **Scrum**: Utilizado para desarrollo web no crítico con equipos pequeños. 

* **Kanban**: Apto para flujos de trabajo continuos en sistemas web de tamaño pequeño.

* **DevOps**: Técnicamente apto para el proyecto, pero diseñado para equipos con infraestructura y perfiles híbridos especializados. 

*Matriz de Análisis Cualitativo*

| Etiqueta | [STRADIS](#stradis) | [RUP](#rational-unified-process) | [V-Modell XT](#v-modell-xt) | [OpenUP](#open-up) | [Win-Win](#win-win) | [MBASE](#mbase) | [XP](#xp) | [Scrum](#scrum) | [Kanban](#kanban) | [DevOps](#devops) |
| :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| **sub\_EXP** | **SI** | **NO** | **NO** | **NO** | **NO** | **NO** | **NO** | **NO** | **NO** | **NO** |
| **sub\_PLN** | **NO** | **NO** | **NO** | **SI** | **NO** | **NO** | **NO** | **SI** | **SI** | **SI** |
| **sub\_DOC** | **NO** | **NO** | **NO** | **SI** | **SI** | **NO** | **SI** | **SI** | **NO** | **NO** |
| **sub\_CHA** | **NO** | **NO** | **NO** | **SI** | **SI** | **SI** | **SI** | **SI** | **SI** | **SI** |
| **sub\_VER** | **NO** | **SI** | **NO** | **SI** | **SI** | **SI** | **SI** | **SI** | **NO** | **SI** |
| **sub\_APT** | **NO** | **NO** | **NO** | **SI** | **NO** | **NO** | **SI** | **SI** | **SI** | **NO** |
| **Total de “NO”** | **5** | **5** | **6** | **1** | **3** | **4** | **2** | **1** | **3** | **3** |

Según la matriz análisis cualitativo, evaluando los procesos específicos con respecto a las etiquetas mencionadas, se procedió a la elección de aquellos que demostraron un mayor nivel de cobertura. Nos basamos en un criterio de aceptación de un **máximo de dos valores negativos totales “NO”**, los procesos que resultaron aptos como posibles procesos específicos son:

* **OpenUP**: 1 “NO”  
* **XP (eXtreme Programming):** 2 “NO”  
* **Scrum:** 1 “NO”

#### **Análisis cuantitativo** {#análisis-cuantitativo}

##### ***Subcriterios*** {#subcriterios}

Para realizar el análisis cuantitativo, se tuvieron en cuenta los siguientes subcriterios:

1. **Interés en aplicar la metodología:** se tiene en cuenta el grado de disposición del equipo de desarrollo a aplicar el modelo de proceso.  
   * Una mayor disposición por parte del equipo de desarrollo a aprender y/o aplicar el modelo de proceso implica que es más probable que la implementación del modelo se realice de manera efectiva, sostenida en el tiempo y con menor resistencia al cambio, favoreciendo su correcta adopción, la mejora continua de los procesos y el cumplimiento de los objetivos del proyecto.  
     * **Mínimo: 1** (El equipo tiene poca disposición de aplicar el modelo de proceso).  
     * **Máximo: 5** (El equipo tiene alta disposición de aplicar el modelo de proceso).  
2. **Esfuerzo de planificación inicial:** se tiene en cuenta el grado de trabajo de planificación necesario antes de comenzar el desarrollo.  
   * Una planificación inicial extensa es, en nuestro caso de estudio, poco útil, ya que el software objetivo no pretende ser de gran complejidad. Además, el equipo de desarrollo presenta una comunicación informal.  
     * **Mínimo: 1** (El modelo conlleva mucha planificación inicial)  
     * **Máximo: 5** (El modelo conlleva poca planificación inicial).  
3. **Tolerancia a los cambios:** se tiene en cuenta si el modelo tiene un proceso definido para manejar cambios; el grado de reestructuración del plan al momento de agregar o quitar funcionalidades; y el impacto de incorporar cambios en las etapas avanzadas.  
   * Los cambios serán inevitables, por lo que es necesario contar con un modelo de proceso que sea robusto ante los cambios.  
     * **Mínimo: 1** (Los cambios implican mucho retrabajo).  
     * **Máximo: 5** (Los cambios implican poco retrabajo).  
4. **Documentación:** se tiene en cuenta la cantidad de documentación que el modelo produce; el nivel de especificación de la documentación (o de sus iteraciones); y el grado de esfuerzo que significa mantener la documentación actualizada durante el proyecto.  
   * Gran cantidad de documentación tiene, en nuestro caso de estudio, una prioridad baja, ya que el equipo de desarrollo tiene una comunicación informal.  
     * **Mínimo: 1** (El modelo genera mucha documentación/La documentación requiere un alto grado de rigor).  
     * **Máximo: 5** (El modelo genera poca documentación/La documentación requiere un menor grado de rigor).  
5. **Entrega de versiones funcionales:** se tiene en cuenta la frecuencia con la que el modelo produce versiones funcionales del software a lo largo del desarrollo, y qué tan temprano se obtiene la primera de ellas.  
   * Contar con versiones funcionales de manera temprana y frecuente permite validar los requisitos especificados, detectar problemas antes de que requieran retrabajo significativo y obtener retroalimentación continua sobre el sistema en construcción.  
     * **Mínimo: 1** (El modelo no produce versiones funcionales hasta etapas avanzadas del proyecto).  
     * **Máximo: 5** (El modelo produce versiones funcionales de manera temprana y frecuente a lo largo del desarrollo).

##### ***Ponderación de los subcriterios*** {#ponderación-de-los-subcriterios}

| Criterio | Subcriterio | Grado de importancia | Peso(0 \< Peso \< 1\) |
| ----- | ----- | :---: | :---: |
| Equipo de desarrollo | Interés en aplicar la metodología | 15% | 0.15 |
| Planificación | Esfuerzo de planificación inicial | 25% | 0.25 |
| Cambios | Tolerancia a los cambios | 25% | 0.25 |
| Documentación | Documentación | 15% | 0.15 |
| Versiones | Entrega de versiones funcionales | 20% | 0.20 |
| **Total de criterio** |  | **100.00%** | **1.00** |

6. ###### *Ponderación de los subcriterios para el análisis cuantitativo* {#ponderación-de-los-subcriterios-para-el-análisis-cuantitativo}

##### ***Puntaje asignados por subcriterios*** {#puntaje-asignados-por-subcriterios}

7. ###### *Puntajes asignados por subcriterio*

| Criterio | Subcriterio | Peso | OpenUP |  | XP |  | SCRUM |  |
| ----- | ----- | :---: | ----- | :---: | ----- | :---: | ----- | :---: |
|  |  |  | **Puntaje** | **Valor** | **Puntaje** | **Valor** | **Puntaje** | **Valor** |
| Equipo de desarrollo | Interés en aplicar la metodología | 0.15 | 4 | 0.60 | 1 | 0.15 | 5 | 0.75 |
|  |  |  |  |  |  |  |  |  |
| Planificación | Esfuerzo de planificación inicial | 0.25 | 5 | 1.25 | 3 | 0.75 | 4 | 1.00 |
|  |  |  |  |  |  |  |  |  |
| Cambios | Tolerancia a los cambios | 0.25 | 5 | 1.25 | 5 | 1.25 | 4 | 1.00 |
|  |  |  |  |  |  |  |  |  |
| Documentación | Documentación | 0.15 | 4 | 0.60 | 5 | 0.75 | 4 | 0.60 |
|  |  |  |  |  |  |  |  |  |
| Versiones | Entrega de versiones funcionales | 0.20 | 5 | 1.00 | 3 | 0.60 | 4 | 0.80 |
| **TOTAL** |  |  | **4.70** |  | **3.50** |  | **4.15** |  |

***Justificaciones de los puntajes asignados:*** 

* Interés en aplicar la metodología:

  * **OpenUP (4 puntos):** El equipo tiene interés en aprenderlo porque considera que se ajusta al tipo de desarrollo. 

  * **XP (1 puntos):** El equipo no tiene interés en realizar la programación a pares y considera que no es un proceso utilizado actualmente.

  * **SCRUM (5 puntos):** El equipo considera que es un proceso altamente utilizado en la industria y quiere aprenderlo. 

* Esfuerzo de planificación inicial:

  * **OpenUP (5 puntos):** Al ser un proceso ágil no requiere una planificación exhaustiva antes de comenzar el desarrollo, permitiendo iniciar el trabajo de desarrollo más rápido. 

  * **XP (3 puntos):** Si bien el proyecto no exige una planificación extensa, se requiere organizar reuniones frecuentes, definir historias de usuario y establecer un esquema de pruebas desde el inicio, lo que implica un esfuerzo previo lo que hace que pierda punto de eficiencia. 

  * **SCRUM (4 puntos):** Solo requiere una planificación general inicial (backlog), ya que la mayor parte se realiza de forma incremental durante el desarrollo a través de la planificación de cada sprint.

* Tolerancia a los cambios:

  * **OpenUP (5 puntos):** La evolución continua para obtener retroalimentación permanente y el desarrollo iterativo, permite incorporar cambios en los requisitos sin necesidad de modificar extensamente lo ya desarrollado.

  * **XP (5 puntos):** El cambio se acepta mediante lanzamientos regulares del sistema a los clientes, refactorización para evitar la degeneración del código e integración continua de nuevas funcionalidades. 

  * **SCRUM (4 puntos):** El modelo es adaptable entre sprints, permitiendo reordenar el backlog ante cambios. Sin embargo, incorporar cambios dentro de un sprint en curso implica retrabajo y puede afectar los compromisos asumidos para esa iteración.

* Documentación:

  * **OpenUP (4 puntos):** No impone una producción documental extensa, permitiendo al equipo asignar más tiempo al desarrollo. Aunque mantiene ciertos artefactos propios del Proceso Unificado como casos de uso.

  * **XP (5 puntos):** El modelo tiene un énfasis mínimo en documentación formal, priorizando el código funcional y la comunicación directa entre los integrantes del equipo por sobre los artefactos documentales. 

  * **SCRUM (4 puntos):** No enfatiza la documentación formal, pero sus artefactos principales como el product backlog y los registros de cada sprint requieren mantenimiento continuo a lo largo del proyecto.

* Entrega de versiones funcionales:

  * **OpenUP (5 puntos):** Los micro-incrementos producen versiones funcionales en períodos cortos. 

  * **XP (3 puntos):** Asignamos un puntaje de 3 teniendo en cuenta que a diferencia de OpenUP y SCRUM, XP plantea el uso de desarrollo dirigido por pruebas 

  * **SCRUM (4 puntos):** Produce una versión funcional al final de cada sprint. Aunque la primera entrega no ocurre hasta completar el primer sprint**.** 

(d) DETERMINEN EL/LOS PROCESO/S MÁS CONVENIENTE/S DE APLICAR AL CASO DE ESTUDIO ADAPTADO. Justificar de forma sintética la respuesta. Aporte en un único cuadro resumen el/los proceso/s seleccionado/s como más conveniente/s de aplicar al caso de estudio. 

### ***4.d. Procesos más convenientes de aplicar al caso de estudio*** {#4.d.-procesos-más-convenientes-de-aplicar-al-caso-de-estudio}

*Determinar y justificar de forma sintética el/los proceso/s más conveniente/s de aplicar al caso de estudio adaptado, a partir del análisis cualitativo y cuantitativo de la sección 4.c. Aportar un único cuadro resumen con el/los proceso/s seleccionado/s.*

A partir del análisis cualitativo, los procesos que resultaron aptos según el criterio de aceptación de un máximo de dos valores negativos fueron OpenUP (1 “NO”), Scrum (1 “NO”) y XP (2 “NO”). El análisis cuantitativo refinó esta selección mediante puntajes ponderados, donde **OpenUP obtuvo 4.70 puntos**, **Scrum 4.15** y XP 3.50, ubicando a OpenUP como ganador y a Scrum como segundo más conveniente.

No obstante, el caso de estudio presenta dos dimensiones complementarias que ningún proceso individual cubre por completo:

1. **Ciclo de vida y disciplinas técnicas.** La plataforma de economía colaborativa basada en oficios es un sistema web con módulos diferenciados (gestión de usuarios, catálogo, reputación, agenda, pagos) que requiere arquitectura temprana, gestión explícita de riesgos y trazabilidad ligera entre requisitos, diseño e implementación. OpenUP cubre estas necesidades preservando las características esenciales del Proceso Unificado —desarrollo iterativo, casos de uso, gestión de riesgos y arquitectura temprana— en una forma considerablemente más simple y accesible que el RUP (Eclipse Foundation, 2012).  
     
2. **Gestión del proyecto y cadencia de trabajo.** El equipo es pequeño (seis integrantes), distribuido, con comunicación informal, agendas heterogéneas y sin disponibilidad de un cliente o representante de usuario externo. Esto demanda una capa de gestión liviana y predecible que OpenUP no prescribe explícitamente. Scrum aporta esa capa: sprints de duración fija, ceremonias mínimas (*planning*, daily, *review*, *retrospective*), roles operativos y un *product backlog* priorizado por valor de negocio.  
     
3. **Productividad operativa por incremento.** Spec-Driven Development (SDD) asistido por IA eleva la productividad del desarrollo sin sacrificar trazabilidad, al tratar a la especificación como artefacto autoritativo y única fuente de verdad (Piskala, 2026; Böckeler, 2025). SDD es ortogonal a los modelos de proceso y se instancia dentro de los micro-incrementos de OpenUP, complementándolo a nivel operativo mediante un pipeline de fases con compuertas de validación humana (Human-in-the-Loop) y memoria persistente entre sesiones (Buscaglia, 2026a, 2026b).  

El proceso XP pese a haber pasado el filtro cualitativo, se descarta de forma explícita: el equipo **no tiene interés en aplicar programación a pares** (puntaje 1 sobre 5 en el subcriterio de interés del equipo) ni cuenta con experiencia en TDD estricto, y su valor agregado sobre la combinación OpenUP \+ Scrum es marginal frente al costo de adopción.

En consecuencia, **se selecciona como conveniente al caso de estudio un proceso híbrido** conformado por OpenUP como proceso base, Scrum como capa de gestión de proyecto y SDD como práctica transversal de operación intra-incremento. Esta combinación preserva la estructura de fases y disciplinas del Proceso Unificado, incorpora una cadencia de trabajo predecible, y aprovecha la asistencia de IA bajo supervisión humana para acelerar la implementación sin perder rigor en la especificación.

##### ***Cuadro resumen del/los proceso/s seleccionado/s*** {#cuadro-resumen-del/los-proceso/s-seleccionado/s}

| Capa | Proceso/Práctica seleccionada | Aporte específico al caso de estudio | Fuente principal |
| :---- | :---- | :---- | :---- |
| Base — Ciclo de vida y disciplinas técnicas | **OpenUP** | Fases del Proceso Unificado (Inicio, Elaboración, Construcción, Transición); micro-incrementos como unidades de trabajo de horas/días; arquitectura temprana y enfoque en riesgos; conjunto mínimo y suficiente de disciplinas para un sistema web no crítico de tamaño pequeño-mediano. | Eclipse Foundation (2012); Jacobson, Booch y Rumbaugh (2000) |
| Capa — Cadencia y compuerta de calidad | **Scrum** (elementos adoptados mínimos: *Sprint* de una semana, *Sprint Backlog*, *Definition of Done*) | Sprint de duración fija (1 semana) como contenedor temporal de los micro-incrementos de OpenUP; Sprint Backlog como vista operativa de los work items del ciclo; DoD como compuerta de calidad obligatoria antes de marcar un work item como terminado.  Se descarta Product Owner formal, Scrum Master formal, Daily, Backlog Refinement, Sprint Review separado y Sprint Retrospective. Su costo de mantenimiento no se justifica en un equipo pequeño con comunicación cara a cara y sin cliente externo.  | COLOCAR REFERENCIA DE SCRUM (Antes se referenciaba a Pressman & Maxim, ver) |
| Práctica transversal intra-incremento | **Spec-Driven Development asistido por IA** | Especificación ejecutable como fuente de verdad consumible por agentes de IA; pipeline estructurado en fases (exploración, especificación, diseño, tareas, implementación, verificación) con compuertas Human-in-the-Loop entre fases; memoria persistente que preserva decisiones y contexto entre sesiones e integrantes. | Piskala (2026); Böckeler (2025); Buscaglia (2026a, 2026b) |

5.- ANALICEN CÓMO DEBIERA SIMPLIFICARSE Y/O ADAPTARSE EL PROCESO DE DESARROLLO SELECCIONADO EN EL PUNTO 4 (d). Indicar en cuáles disciplinas y actividades fundamentales qué (métodos, técnicas, heurísticas y/o herramientas, etc.) descartarán o incorporarán justificadamente.

## 5\. Simplificación y/o adaptación del proceso de desarrollo seleccionado {#5.-simplificación-y/o-adaptación-del-proceso-de-desarrollo-seleccionado}

*Indicar, por cada disciplina o actividad fundamental (Especificación, Desarrollo, Verificación/Validación, Evolución), qué métodos, técnicas, heurísticas o herramientas se descartan o incorporan al proceso seleccionado en 4.d, y justificar cada decisión.*

El proceso híbrido seleccionado en 4.d (OpenUP como base, Scrum como aporte mínimo de ritmo de trabajo y compuerta de calidad, SDD como práctica operativa intra-iteración) se adapta al caso de estudio por disciplina, indicando qué métodos, técnicas y herramientas del proceso original se conservan, cuáles se descartan y cuáles se incorporan. Las decisiones se justifican contra los rasgos del caso, ya que tenemos un equipo pequeño con comunicación informal, junto con un sistema web no crítico, ausencia de cliente externo y necesidad de incorporar cambios sin un retrabajo extenso.

	El equipo adopta el nivel **Spec-Anchored** de SDD: las especificaciones ejecutables evolucionan en paralelo con el código y actúan como fuente de verdad autoritativa, pero el desarrollador conserva la autoridad de decisión en las compuertas Human-in-the-Loop, donde valida cada artefacto generado y, si no cumple los criterios, comunica observaciones que el Coordinador de IA reincorpora reinstanciando al sub-agente. Se descarta *spec-first* porque la spec no es un documento estático previo sino vivo, y *spec-as-source* porque el diseño y el código siguen siendo artefactos validados de primera clase y no meras derivaciones automáticas de la spec. La elección responde al perfil del equipo, de experiencia intermedia, que necesita las compuertas HITL para auditar lo generado por la IA sin asumir la madurez de especificación que exige Spec-as-Source.

La especificación ejecutable sigue el estándar **OpenSpec** (Fission AI, 2026), pensado para ser consumido por agentes de IA en lugar de leído como prosa. Sus rasgos clave son: estructura fija en Markdown (propósito, requisitos y escenarios) que el agente parsea sin ambigüedad; requisitos en lenguaje normativo ("deberá", *shall*, conforme al punto 4.a) que actúan como contrato verificable; criterios de aceptación en formato Given-When-Then de los que el sub-agente verificador deriva los tests automatizados; y versionado de la spec junto al código en el repositorio, manteniéndola como documentación viva del sistema. La preservación de decisiones y contexto entre sesiones, en cambio, no recae en la spec sino en la Memoria Persistente descrita más abajo.

Del marco Scrum se adoptan únicamente tres elementos: **Sprint de una semana** como ventana temporal que contiene los micro-incrementos de OpenUP, **Sprint Backlog** como vista operativa de los work items del ciclo actual, y **DoD (Definition of Done)** como compuerta formal de calidad. Los restantes elementos de Scrum (Product Owner formal, Scrum Master formal, Daily Scrum, Backlog Refinement ceremonial, Sprint Review separado del incremento OpenUP, Sprint Retrospective) se descartan, ya que en un equipo pequeño con comunicación directa y sin cliente externo el costo de mantenerlos supera el valor que aportan, dado que las iteraciones cortas no dan margen para absorber ese peso, la priorización y la mejora continua se resuelven con mecanismos más livianos detallados por disciplina. 

##### ***Disciplina: Ingeniería de Requerimientos*** {#disciplina:-ingeniería-de-requerimientos}

**Se conservan de OpenUP:**

* Casos de uso como artefacto principal de captura del comportamiento del sistema, alineados con el énfasis del Proceso Unificado en el desarrollo dirigido por casos de uso (Eclipse Foundation, 2012),  (Jacobson, Booch y Rumbaugh, 2000).  
* Documento de visión (*Vision*) acotado y glosario del dominio, ambos en formato breve.  
* Lista de riesgos asociados a requisitos, mantenida y revisada en cada iteración.

**Se incorporan de Scrum:**

* *Sprint Backlog* como vista operativa de los work items comprometidos para el ciclo actual, derivada de la Work Item List de OpenUP.

**Se incorporan de SDD:**

* Especificaciones ejecutables por funcionalidad, en formato estructurado (contexto, requisitos, restricciones y criterios de aceptación), derivadas del caso de uso correspondiente y consumibles por agentes de IA (Piskala, 2026; Buscaglia, 2026a).  
* Memoria persistente del dominio compartida entre sesiones e integrantes, que preserva decisiones, descubrimientos y razonamientos a lo largo del proyecto (Buscaglia, 2026b).

**Se descartan:**

* Documentos de Especificación de Requisitos extensos al estilo IEEE 830 o RUP completo, ya que no aportan valor en un proyecto pequeño con comunicación informal y agregan carga de mantenimiento.  
* Modelos de análisis de objetos detallados en esta disciplina.   
* Historias de usuario como artefacto formal paralelo a los casos de uso, estos introducen duplicación de la captura de requisitos sin valor adicional cuando el caso de uso ya describe el comportamiento.  
* *Product Backlog* priorizado como artefacto Scrum dedicado, ya que la priorización por valor se canaliza directamente sobre la Work Item List de OpenUP, sin sesiones formales de *backlog refinement* ni rol de Product Owner.  
* Clasificación **FURPS+** que OpenUP prescribe para los *System-Wide Requirements*: se la reemplaza por la subclasificación de requisitos no funcionales de Sommerville (2016) y el vocabulario del modelo ISO/IEC 25010 trabajados en la asignatura, que cubren las mismas categorías de atributos de calidad, mantienen la comparabilidad con los RNF ya especificados en 4.a y se alinean con los estándares adoptados en el punto 10\.

##### ***Disciplina: Diseño (Arquitectónico y Detallado)*** {#disciplina:-diseño-(arquitectónico-y-detallado)}

**Se conservan de OpenUP:**

* Foco temprano en arquitectura como mecanismo central de mitigación de riesgos, en línea con el principio de OpenUP de “enfocarse en la arquitectura de manera temprana” (Eclipse Foundation, 2012).  
* Vista lógica del sistema mediante diagramas UML de clases.   
* Identificación y aplicación de patrones arquitectónicos (Buschmann et al., 1996\) y patrones de diseño (Gamma et al., 1994\) en los módulos donde aporten valor.  
* Método de evaluación de arquitecturas alternativas mediante escenarios de calidad.

**Se incorporan de SDD:**

* Decisiones de arquitectura registradas como *Architecture Decision Records* (ADRs) cortos, persistidos en memoria y consumibles por agentes de IA en fases posteriores del pipeline.  
* Diseño detallado generado de forma asistida por sub-agentes especializados a partir de la especificación, con revisión humana obligatoria antes de aceptar el artefacto (Buscaglia, 2026; Piskala, 2026).

**Se descartan en general de los procesos/prácticas:**

* Modelado UML exhaustivo de interacciones, secuencia y comunicación para la totalidad de las funcionalidades: se conserva únicamente en módulos críticos (pagos, reputación), donde la complejidad lo justifica; el resto se modela de forma mínima.

##### ***Disciplina: Implementación*** {#disciplina:-implementación}

**Se conservan de OpenUP:**

* Implementación organizada en micro-incrementos, definidos como unidades de trabajo de pocas horas o días que producen avance funcional verificable (Eclipse Foundation, 2012).  
* Integración continua de los micro-incrementos al producto del sprint.

**Se incorporan de Scrum:**

* *Sprint* de una semana como contenedor temporal de los micro-incrementos. La duración corta privilegia ciclos de retroalimentación rápidos y se alinea con la disponibilidad parcial de los integrantes.  
* *Sprint Backlog* como lista operativa de work items comprometidos para el ciclo.  
* *Sprint Planning* en formato simplificado como evento de apertura del sprint, en el que el equipo selecciona los work items del *Sprint Backlog* que entran al ciclo.    
* *Definition of Done* como compuerta formal de calidad obligatoria antes de marcar un work item como terminado.

**Se incorporan de SDD:**

* Pipeline de implementación estructurado, donde la especificación dispara la generación asistida de tareas y código por parte de sub-agentes de IA, seguida de revisión y refinamiento humano antes de la integración (Piskala, 2026; Böckeler, 2025).  
* Coordinador de IA que delega cada fase a sub-agentes especialistas efímeros, con compuertas Human-in-the-Loop entre fases (Buscaglia, 2026a).  
* Convenciones de código y estándares del proyecto persistidos en memoria compartida para que cada agente los respete en cada generación, evitando la deriva entre sesiones (Buscaglia, 2026b).

**Se descartan en general de los procesos/prácticas:**

* Test-Driven Development estricto como precondición de la implementación: se incorpora testing automatizado, pero no se exige test-first para todas las funcionalidades.  
* *Daily Scrum* como ceremonias formales.   
* *Definition of Ready* como compuerta formal, en un proyecto sin Product Owner externo, el equipo decide caso a caso si un work item tiene suficiente contexto para entrar al sprint. 

##### ***Disciplina: Verificación y Validación*** {#disciplina:-verificación-y-validación}

**Se conservan de OpenUP:**

* Pruebas por incremento, incluyendo unitarias e integración, ejecutadas contra los casos de uso correspondientes.  
* Validación incremental con representantes del usuario (asumidos por integrantes del equipo) al final de cada iteración.

**Se incorporan de Scrum:**

* *Definition of Done* como compuerta de calidad obligatoria antes de marcar un work item como terminado, incluyendo cobertura de tests, revisión de código y documentación de la especificación actualizada.

**Se incorporan de SDD:**

* Tests automatizados derivados de los criterios de aceptación de la especificación, aprovechando que la spec es ejecutable y verificable (Piskala, 2026).  
* Verificación cruzada en dos planos, donde el sub-agente verificador valida que el código cumpla la spec; el desarrollador humano valida que la spec capture correctamente la intención del usuario.  
* Compuerta Human-in-the-Loop obligatoria para aceptar todo artefacto generado por IA antes de fusionarse al *main*. (Buscaglia, 2026a).

**Se descartan** **en general de los procesos/prácticas:**

* *Sprint Review* como ceremonia separada con Product Owner externo, la validación del incremento ocurre dentro de la propia compuerta DoD y de la validación incremental de OpenUP, sin un evento ceremonial adicional.

##### ***Disciplina: Evolución*** {#disciplina:-evolución}

**Se conservan de OpenUP:**

* La evolución continua como uno de los cuatro principios fundamentales del proceso, materializada en retroalimentación permanente y desarrollo iterativo (Eclipse Foundation, 2012).  
* Refactorización dentro de cada iteración cuando los micro-incrementos exponen oportunidades de mejora estructural.

**Se incorporan de SDD:**

* Versionado de las especificaciones en paralelo con el código, donde cada cambio de requisito implica actualizar la spec antes que el código, manteniendo la spec como fuente de verdad viva (Piskala, 2026).  
* Memoria persistente que preserva decisiones, descubrimientos y razones a lo largo del proyecto, evitando pérdida de contexto entre sprints o entre integrantes y mitigando el problema de “amnesia entre sesiones” típico de los asistentes de IA (Buscaglia, 2026b).  
* Capacidad de regenerar artefactos derivados (diseño detallado, lista de tareas, código) cuando cambia la spec, reduciendo el costo del retrabajo respecto a métodos tradicionales donde cada artefacto se mantiene manualmente.

**Se descartan en general de los procesos/prácticas:**

* Mantenimiento separado de documentación post-entrega, la especificación viva, versionada y ejecutable cumple el rol de documentación del sistema, evitando duplicación y desincronización entre código y documentos.  
* *Sprint Retrospective* como ceremonia formal de cierre, ya que la mejora continua se canaliza a través de la retroalimentación permanente prevista por OpenUP y de las observaciones que el equipo deja en la memoria persistente del SDD a lo largo del ciclo, sin una reunión dedicada al final del sprint.  
* *Backlog Refinement* como ceremonia formal periódica, ya que la evolución de los requisitos se materializa actualizando directamente las especificaciones ejecutables y la Work Item List cuando aparece un cambio, sin sesiones dedicadas y sin rol de Product Owner que las conduzca.

6.- ELABOREN UN META-MODELO DEL PROCESO DE DESARROLLO GLOBAL FINALMENTE SIMPLIFICADO Y/O ADAPTADO. Es decir, construir un Modelo del Modelo de Proceso (o combinación de Procesos) seleccionado(s) como conveniente(s) de aplicar al producto SW, y que fuera finalmente simplificado y/o adaptado en punto 5\. Identificar y utilizar los Tipos de Diagramas de UML que considere convenientes para cada perspectiva relevante. Aportar breve descripción de elementos (al menos, actividades fundamentales, pero también podrían incluirse roles, artefactos, etc.).

## 

## 6\. Meta-modelo del proceso de desarrollo global {#6.-meta-modelo-del-proceso-de-desarrollo-global}

*Construir el meta-modelo del proceso global simplificado/adaptado del punto 5, cubriendo perspectivas estática y dinámica con los diagramas UML correspondientes. Acompañar con descripción breve de actividades fundamentales, roles y artefactos.*  
***Referencias de colores***

| *Modelos estáticos* | *Modelos dinámicos* |
| ----- | ----- |
| ![][image2] | ![][image3] |

### ***Perspectiva estática (estructural)*** {#perspectiva-estática-(estructural)}

#### **Meta-Modelo de Proceso Global (Producto del Trabajo):**  {#meta-modelo-de-proceso-global-(producto-del-trabajo):}

***![][image4]***  
*Figura Nx \- Meta-modelo de Proceso Global (Producto del Trabajo).*  
*(Diagrama en alta resolución)*  
El diagrama presenta la vista estática del meta-modelo del proceso adoptado, modelado como un diagrama de clases UML.   
El meta-modelo organiza los conceptos centrales del proceso en seis partes: Roles, Requisitos, Diseño, Implementación, Verificación y Validación, Eventos, reflejando la estructura de disciplinas del proceso y sus interrelaciones.   
El objetivo del diagrama es mostrar qué entidades participan en el proceso, cómo se relacionan entre sí y qué produce cada rol. Compuesto por: 

* **Roles**: Distingue entre roles humanos y componentes del pipeline de IA. El Equipo de Desarrollo agrupa al Desarrollador y al Coordinador de IA mediante composición.   
* **Artefactos de Requisitos:** Agrupa los artefactos que capturan y organizan el conocimiento del dominio y el trabajo pendiente.   
* **Artefactos de Diseño**. Agrupa los ADRs, registrados por el Arquitecto y consumidos por el pipeline a través de la Memoria Persistente, y el Diseño Detallado, generado por el Sub-agente de Diseño y validado por el Desarrollador antes de continuar el pipeline.  
* **Artefactos de Implementación:** Modela la jerarquía de granularidad del producto: el Producto de Software se compone de Incrementos, cada uno compuesto a su vez de Micro-incrementos. El Desarrollador produce los micro-incrementos y el sprint los acumula como incremento entregable al cierre del ciclo.  
* **Artefactos de Verificación y Validación:** Distingue entre Tests Automatizados y Tests Manuales. El Definition of Done actúa como compuerta formal que valida el incremento antes de marcarlo como terminado. Los Criterios de Aceptación son la base sobre la que se construyen los tests unitarios automatizados.  
* **La Memoria Persistente** es el artefacto transversal del proceso   
* **Eventos:** El Sprint es el único evento modelado en el meta-modelo — es el contenedor temporal que produce el incremento al cierre de cada ciclo de una semana.

#### **Meta-Modelo de Fases del Proceso Global:** {#meta-modelo-de-fases-del-proceso-global:}

***![][image5]***  
*Figura Nx \- Meta-modelo de Fases del Proceso Global.*  
*(Diagrama en alta resolución)*

El diagrama es una vista estática de la jerarquía de fases del ciclo de vida del proceso, modelada como un diagrama de clases UML.   
La clase abstracta *Fase* actúa como concepto padre del cual se especializan las cuatro fases de OpenUP (Inicio, Elaboración, Construcción y Transición)  mediante relaciones de herencia.   
Los detalles de propósito, hitos de salida y artefactos propios se detallan en sus respectivos meta-modelos dinámicos.

#### **Meta-Modelo de Disciplinas del Proceso Global:** {#meta-modelo-de-disciplinas-del-proceso-global:}

###### *![][image6]*

*Figura Nx \- Meta-modelo de Disciplinas del Proceso Global.*  
*(Diagrama en alta resolución)*  
El diagrama es una vista estática de la jerarquía de disciplinas del proceso, modelada como un diagrama de clases UML.   
La clase abstracta *Disciplina* actúa como concepto padre del cual se especializan las cinco disciplinas adoptadas (Ingeniería de Requisitos, Diseño, Implementación, Verificación y Validación) mediante relaciones de herencia.  
 Cada disciplina agrupa las actividades, artefactos y roles que le corresponden dentro del proceso, cuyos detalles se desarrollan en sus respectivos meta-modelos.

#### **Meta-Modelo de Roles del Proceso Global:** {#meta-modelo-de-roles-del-proceso-global:}

![][image7]  
*Figura Nx \- Meta-modelo de Roles del Proceso Global.*  
*(Diagrama en alta resolución)*

El diagrama presenta la vista estática de la jerarquía de roles del proceso, modelada como un diagrama de clases UML. La clase abstracta Rol actúa como concepto padre del cual se especializan todos los roles del proceso mediante relaciones de herencia.   
El Equipo de Desarrollo es un rol compuesto que agrupa al Desarrollador y al Coordinador IA, reflejando que ambos operan como unidad en la ejecución del pipeline SDD.   
El Coordinador IA a su vez contiene mediante composición a los cuatro sub-agentes especializados, modelando que estos no son roles independientes sino componentes efímeros que el Coordinador instancia y descarta a lo largo del pipeline.   
Las siguientes tablas describen cada rol dentro del proceso: 

##### ***Equipo De Desarrollo (roles humanos):***  {#equipo-de-desarrollo-(roles-humanos):}

| Rol | Origen | Descripción |
| ----- | ----- | ----- |
| 1\. Administrador de Proyecto  | OpenUP | Coordina el plan de iteraciones, mantiene la Work Item List priorizada y monitorea el avance general del proyecto. Asigna tareas, pero no controla al equipo, el seguimiento se apoya en el Sprint Backlog y la Definition of Done como indicadores de progreso. |
| 2\. Arquitecto | OpenUP | Define y evalúa la arquitectura del sistema. Produce ADRs y  la vista lógica UML. Revisa y aprueba el diseño detallado generado por el pipeline antes de su integración. Resuelve dudas arquitectónicas de los desarrolladores durante la ejecución del pipeline SDD.  |
| 3\. Analista | OpenUP | Elabora los casos de uso, las especificaciones ejecutables y el glosario del dominio. Mantiene la lista de riesgos actualizada en cada iteración. |
| 4\. Desarrollador | OpenUP | Implementa los micro-incrementos y revisa el código generado por el pipeline antes de fusionarlo al main. Opera la compuerta Human-in-the-Loop dentro del pipeline.  |
| 5\. Tester | OpenUP | Diseña y valida los tests automatizados para las los work items integrados y la integración del producto continuo. |

##### ***Roles del pipeline SDD (no humanos):***  {#roles-del-pipeline-sdd-(no-humanos):}

| Componente | Tipo | Descripción |
| ----- | ----- | ----- |
| 6\. Coordinador de AI | Agente persistente | Punto de entrada del pipeline. Recibe el caso de uso del Desarrollador, consulta la Memoria Persistente para recuperar ADRs, convenciones de código y contexto del dominio, y delega la ejecución a cada sub-agente en orden. Gestiona los ciclos de feedback cuando un Human-in-the-Loop rechaza un artefacto, re-instanciando el sub-agente correspondiente con las observaciones incorporadas. Es el único componente del pipeline que persiste entre sesiones.  |
| 7\. Sub-agente redactor | Agente efímero | Genera la especificación ejecutable a partir del caso de uso detallado provisto por el Desarrollador. Consulta la Memoria Persistente para incorporar el contexto del dominio, las decisiones previas y las convenciones del proyecto antes de redactar. Su output es contexto, requisitos, restricciones y criterios de aceptación que son revisados por el Desarrollador antes de continuar el pipeline. |
| 8\. Sub-agente de diseño | Agente efímero | Genera el diseño detallado a partir de la especificación ejecutable aprobada. Consulta la Memoria Persistente para respetar los ADRs registrados y mantener consistencia con la arquitectura base definida en Elaboración. Su output es la estructura de clases, responsabilidades de cada componente y lista de tareas ordenadas que son revisadas por el Desarrollador antes de continuar el pipeline. En caso de ser necesario el Desarrollador puede comunicarse con el Arquitecto.  |
| 9\. Sub-agente de implementación | Agente efímero | Genera el código fuente a partir del diseño detallado aprobado. Consulta la Memoria Persistente para respetar las convenciones de código persistentes y evitar inconsistencia entre sesiones. Su output es revisado por el Desarrollador. Puede ser re-instanciado por el Coordinador de IA si el Sub-agente verificador detecta fallos en los tests atribuibles al código. |
| 10\. Sub-agente verificador | Agente efímero | Deriva los tests automatizados directamente de los criterios de aceptación de la especificación ejecutable, los ejecuta contra el código generado y produce el reporte de validación con los resultados. Su output es revisado por el Desarrollador antes de cerrar el pipeline. |

##### ***Asignación de Roles en el Equipo*** {#asignación-de-roles-en-el-equipo}

Dado que el equipo es pequeño y el proceso adoptado exige que todos los integrantes sean capaces de ejercer cualquier rol, la asignación no es fija ni permanente. En lugar de asignar un rol por persona, los roles se distribuyen por fase según la demanda de trabajo de cada etapa.  
En las fases tempranas (exploración y especificación) predominan los roles de Arquitecto y Analista, por lo que la mayor parte del equipo se concentra en esas responsabilidades de forma colaborativa. A medida que el proceso avanza hacia las fases de diseño e implementación, emergen con mayor peso los roles de Desarrollador y Tester, redistribuyendo el equipo en consecuencia. El rol de Administrador de Proyecto es transversal a todas las fases.  
Este esquema flexible garantiza que ningún rol se convierta en un cuello de botella, que todos los integrantes comprendan el proceso de forma integral, y que la carga de trabajo se distribuya equitativamente según las necesidades de cada iteración.

#### **Meta-Modelo de Artefactos del Proceso Global:** {#meta-modelo-de-artefactos-del-proceso-global:}

![][image8]

*Figura Nx \- Meta-modelo de Artefactos del Proceso Global.*  
*(Diagrama en alta resolución)*

El diagrama presenta la vista estática de la jerarquía de artefactos del proceso, modelada como un diagrama de clases UML. La clase abstracta *Artefacto* actúa como concepto padre del cual se especializan todos los artefactos del proceso mediante relaciones de herencia, organizando en un único modelo los productos de trabajo de las cinco disciplinas. Se detalla cada artefacto a continuación: 

##### ***Lista de Artefactos a Realizar*** {#lista-de-artefactos-a-realizar}

1. **Architecture Design Records (ADR) (General):** un ADR es como una bitácora o un diario de decisiones técnicas que mantiene viva la memoria del proyecto. En nuestro trabajo, se acopla con SDD aunque no es exclusivo de la misma, son una práctica útil para reforzar la disciplina de trabajar guiado por especificaciones para dejar en claro cómo esas especificaciones se transforman en una arquitectura.  
2. **Arquitectura de Software**  
3. **Criterios de Aceptación (SDD):** son el puente entre la especificación y las pruebas, garantizando que cada funcionalidad se implemente de forma precisa y comprobable.  
4. **Caso de Uso (OpenUp):** describe una secuencia de interacciones entre el sistema y uno o más actores, capturando el comportamiento del sistema desde la perspectiva del usuario sin especificar cómo lo implementa internamente.  
5. **Código Fuente (General):** este artefacto define el comportamiento de un programa. Es texto legible por humanos y luego se compila o interpreta para que la máquina pueda ejecutarlo.  
6. **Definition of Done (DoD) (Scrum):** Es un acuerdo dentro del equipo que define qué significa que un trabajo está realmente terminado. Es una lista de criterios claros y verificables que cada incremento de producto debe cumplir para considerarse terminado.  
7. **Diseño Detallado (OpenUp aplica SDD):** es el artefacto que se especifica con precisión cómo se va a construir cada componente del sistema. Más allá de la arquitectura general, define aspectos como la estructura interna de las clases, interacciones entre módulos, esquema de BD e interfaces entre componentes. Es el puente entre la arquitectura de alto nivel y la implementación real.  
8. **Documento de Visión (OpenUp):** el propósito de este artefacto es recoger, analizar y definir las necesidades de alto nivel y las características del sistema desde la perspectiva de los stakeholders, sirve como referencia para alinear a todos los participantes sobre qué problema se va a resolver y por qué.  
9. **Especificación (OpenUp):** es el artefacto que documenta de forma detallada los requerimientos funcionales y no funcionales del sistema. Se centra en la recopilación y organización de todos los requisitos que envuelven el proyecto.   
10. **Especificación Ejecutable**  
11. **Glosario del dominio (OpenUp):** es un artefacto que recopila y define los términos clave que se usan dentro del proyecto.  
12. **Incremento (General):** es una versión del sistema que agrega nueva funcionalidad sobre la anterior. Cada incremento es una porción funcional y probada del producto final. Permite un feedback y reducir riesgos.  
13. **Interfaz:**  
14. **Micro-incremento (OpenUp):** se refiere a pequeñas entregas de valor que el equipo produce dentro de una iteración. Es un resultado tangible y verificable que contribuye al avance del proyecto y puede ser evaluado al final de la iteración.  
15. **Modelado de Base de Datos**  
16. **Lista de Riesgos (OpenUp):** Es un artefacto de gestión que sirve para identificar, registrar y dar seguimiento a los posibles problemas que pueden afectar al proyecto.   
17. **Memoria Persistente (SDD):** este artefacto es el almacenamiento de datos, es decir cómo se guardan los datos que se mantienen guardados incluso después de que el sistema o la aplicación se apaga. La memoria persiste conserva la información de manera persistente.  
18. **Producto de Software**  
19. **Sprint Backlog (Scrum):** es el plan de acción del equipo para el Sprint, una lista viva que conecta los objetivos con las tareas concretas.  
    1. **Work Item List (OpenUp):** es el backlog del proyecto en OpenUP, una lista viva que guía el trabajo del equipo. Es una lista priorizada de elementos de trabajo que el equipo debe realizar para cumplir con los objetivos del proyecto.  
20. Test  
21. **Test Automatizado (SDD):** Es la ejecución de pruebas sobre el software mediante herramientas o scripts sin intervención manual.  
22. **Test de Integración**  
23. **Test de Sistema**  
24. **Test Unitario**

##### **Meta-Modelo de Artefactos del Proceso Global:** {#meta-modelo-de-artefactos-del-proceso-global:-1}

##### ![][image9]

*Figura Nx \- Meta-modelo de Eventos del Proceso Global.*  
*(Diagrama en alta resolución)*

El diagrama presenta la vista estática de la jerarquía de eventos del proceso, modelada como un diagrama de clases UML.   
La clase abstracta *Evento* se especializa en Evento Planificado, del cual hereda el Sprint como único evento formal adoptado del framework Scrum. El Sprint contiene mediante composición al Sprint Planning (el evento de apertura simplificado donde el equipo selecciona los work items del ciclo) y al Sprint Backlog (el artefacto operativo que materializa esa selección como vista de trabajo del ciclo actual). La decisión de modelar únicamente eventos planificados responde al descarte explícito de las ceremonias formales de Scrum, conservando solo el Sprint y su planning como contenedor temporal y punto de coordinación del ciclo de desarrollo. 

## Perspectiva dinámica (comportamiento) {#perspectiva-dinámica-(comportamiento)}

### ***Meta-Modelo del Ciclo de Vida de Desarrollo:***  {#meta-modelo-del-ciclo-de-vida-de-desarrollo:}

*![][image10]*  
*Figura Nx \- Meta-modelo del Ciclo de Vida de Desarrollo.*  
*(Diagrama en alta resolución)*

El diagrama presenta la vista dinámica del ciclo de vida del proceso híbrido adoptado, modelado como un diagrama de actividad UML. Siguiendo la estructura del Proceso Unificado, el ciclo de vida se organiza en cuatro fases secuenciales (Inicio, Elaboración, Construcción y Transición) cada una con hitos de salida explícitos que deben cumplirse antes de avanzar a la siguiente. Reflejando el principio de OpenUP de enfocarse en la arquitectura de manera temprana y evolucionar el sistema de forma continua, garantizando que cada fase aporte valor verificable antes de comprometer recursos en la siguiente.

La decisión de modelar cada fase como un ciclo responde a la naturaleza iterativa del proceso; si los hitos de una fase no se cumplen, el equipo permanece en ella hasta resolverlos. Esto es particularmente relevante en las fases de Inicio y Elaboración, donde los hitos de viabilidad y mitigación de riesgos arquitectónicos son precondición para que el pipeline SDD opere con contexto suficiente en Construcción. Cada fase se desarrolla en detalle en su propio meta-modelo. 

#### **Hitos por fase en OpenUp** {#hitos-por-fase-en-openup}

	Los hitos de salida (*milestone*) funciona como punto de decisión de “continuar o no” para cada fase de OpenUP:

| Inicio | Elaboración | Construcción | Transición |
| :---: | :---: | :---: | :---: |
| ***Lifecycle Objetives*** | ***Lifecycle Architecture*** | ***Initial Operational Capability*** | ***Product Release*** |
| ¿Vale la pena hacer el proyecto?Se decide si continuar o cancelar | ¿La arquitectura es sólida?Se valida la arquitectura y se mitigan riesgos | ¿El sistema está completo?Listo para entregar al equipo de transición | ¿El cliente acepta el producto?Entrega final y cierre del ciclo |

##### 

### ***Meta-Modelo del Proceso de Desarrollo Global \- Fase de Inicio:*** {#meta-modelo-del-proceso-de-desarrollo-global---fase-de-inicio:}

***![][image11]***  
*Figura Nx \- Meta-modelo del Proceso de Desarrollo Global \- Fase de Inicio.*  
 *(Diagrama en alta resolución)*

El diagrama presenta la **Vista Dinámica de la Fase de Inicio** del proceso, modelada como un diagrama de actividad UML. Esta fase se ejecuta una única vez al comienzo del proyecto y tiene como propósito establecer las bases sobre las cuales operarán las fases subsiguientes. En línea con lo que establece OpenUP, el objetivo central de esta fase es **determinar la viabilidad del proyecto** y lograr un acuerdo compartido sobre el **alcance y la visión del sistema** antes de comenzar. El diagrama refleja dos bloques de actividades paralelas: 

* El primero agrupa la producción de los artefactos fundacionales del proyecto (el Documento de Visión, el Glosario del Dominio y la Lista de Riesgos inicial) que pueden elaborarse de forma concurrente ya que no presentan dependencias entre sí.   
* El segundo bloque captura las actividades de configuración del entorno de trabajo. Donde entran la identificación y refinamiento inicial de requisitos, detallada en el **meta-modelo de Ingeniería de Requerimientos**; la configuración de la Memoria Persistente, que desde esta instancia comienza a acumular el contexto del dominio necesario para que el pipeline SDD opere de forma coherente entre sesiones; y la creación de la Work Item List inicial, que materializa el backlog de trabajo del proyecto a partir de los casos de uso identificados.

El hito de salida de esta fase, representado en el diagrama del ciclo de vida global, es la confirmación de que el alcance es viable y que el equipo comparte una visión común del sistema a construir

### ***Meta-Modelo del Proceso de Desarrollo Global \- Fase de Elaboración:*** {#meta-modelo-del-proceso-de-desarrollo-global---fase-de-elaboración:}

***![][image12]***  
*Figura Nx \- Meta-modelo del Proceso de Desarrollo Global \- Fase de Elaboración.*  
*(Diagrama en alta resolución)*

El diagrama presenta la vista dinámica de la Fase de Elaboración, cuyo propósito central en OpenUP es establecer y validar la arquitectura base del sistema como mecanismo principal de mitigación de riesgos técnicos. A diferencia de la Fase de Inicio, esta fase ya opera dentro del ciclo iterativo, ya que puede repetirse si los hitos arquitectónicos no se cumplen al cierre de la iteración.

El diagrama modela cuatro actividades paralelas que el equipo ejecuta de forma concurrente: el refinamiento de requisitos, detallado en el meta-modelo de Ingeniería de Requerimientos; el desarrollo de la arquitectura, detallado en el meta-modelo de Diseño; la configuración y refinamiento de la Memoria Persistente, donde se registran los ADRs y convenciones de código que el pipeline SDD consumirá en Construcción y el desarrollo de la documentación del proyecto.

### ***Meta-Modelo del Proceso de Desarrollo Global \- Fase de Construcción:*** {#meta-modelo-del-proceso-de-desarrollo-global---fase-de-construcción:}

![][image13]  
*Figura Nx \- Meta-modelo del Proceso de Desarrollo Global \- Fase de Construcción.*  
*(Diagrama en alta resolución)*

El diagrama presenta la vista dinámica de la Fase de Construcción, es donde se materializa el desarrollo incremental del sistema. En línea con el principio de evolución continua de OpenUP, esta fase se organiza en sprints de una semana que contienen los work items comprometidos para el ciclo. El diagrama modela cuatro actividades paralelas: 

* El refinamiento continuo de requisitos, desarrollando los casos de uso que van alimentar el pipeline;   
* El proceso de desarrollo organizado en sprints, detallado en el meta-modelo de pipeline SDD;   
* La configuración y refinamiento de la Memoria Persistente, que se actualiza con cada decisión y descubrimiento del ciclo para evitar pérdida de contexto entre sesiones;   
* Y el desarrollo de la documentación del proyecto. 

El proceso de desarrollo se descompone en tres pasos secuenciales (apertura del sprint, asignación de work items y desarrollo) cuyo detalle operativo se delega al meta-modelo del pipeline SDD para mantener la legibilidad del diagrama global.

### 

### ***Meta-Modelo de Desarrollo de Sprint*** {#meta-modelo-de-desarrollo-de-sprint}

*![][image14]*  
*Figura Nx \- Meta-modelo de Desarrollo de Sprint*  
*(Diagrama en alta resolución)*

#### **Meta-Modelo del Pipeline SSD (1) (Asistido por AI):** {#meta-modelo-del-pipeline-ssd-(1)-(asistido-por-ai):}

*![][image15]*  
*Figura Nx \- Meta-modelo del Pipeline SSD (Asistido por AI)*  
*(Diagrama en alta resolución)*

El diagrama presenta la vista dinámica del pipeline SDD, que constituye la unidad operativa central del proceso de implementación. Este pipeline se dispara una vez por cada micro-incremento dentro del sprint y orquesta la colaboración entre el Developer humano, el Coordinador de IA y cuatro sub-agentes especializados (Redactor, Diseño, Implementación y Verificador)  que operan de forma efímera y secuencial. Su ejecución repetida a lo largo del sprint es lo que produce el avance incremental del producto, donde cada micro-incremento que completa el pipeline exitosamente se integra de forma continua al producto del sprint, de modo que al cierre del ciclo el incremento entregable es la acumulación de todos los micro-incrementos verificados.

El flujo comienza cuando el Developer entrega el Caso de Uso correspondiente al micro-incremento al Coordinador de IA. Este consulta la Memoria Persistente para recuperar el contexto acumulado del proyecto (ADRs, convenciones de código, decisiones anteriores) y contextualiza a cada sub-agente antes de instanciarlo. La cadena de generación sigue cuatro pasos secuenciales:

* El Sub-agente Redactor genera la **Spec Ejecutable Válida** a partir del Caso de Uso (especificado en Meta-modelo pipeline SDD 1.1).  
* El Sub-agente de Diseño genera el **Diseño Detallado Válido** a partir de la Spec (especificado en Meta-modelo pipeline SDD 1.2).  
* El Sub-agente de Implementación genera el **Código Fuente Válido** a partir del diseño (especificado en Meta-modelo pipeline SDD 1.3).  
* El Sub-agente Verificador deriva los tests de los criterios de aceptación de la Spec, los ejecuta contra el código y genera el **Reporte de Validación Válido** (especificado en Meta-modelo pipeline SDD 1.4).

Cada sub-agente registra su artefacto en la Memoria Persistente antes de ceder el control, garantizando que el contexto se acumule progresivamente a lo largo del sprint y entre sprints.

Entre cada par de sub-agentes existe una compuerta Human-in-the-Loop donde el Developer valida el artefacto generado. Si el artefacto no cumple los criterios de la compuerta, el Developer comunica sus observaciones al Coordinador de IA, que re-instancia el sub-agente correspondiente con el feedback incorporado, repitiendo el ciclo tantas veces como sea necesario hasta obtener aprobación. Este mecanismo garantiza que ningún artefacto generado por IA avance al siguiente paso sin validación humana explícita. 

El pipeline cierra con la integración continua del micro-incremento al producto del sprint.

#### **Meta-Modelo del Pipeline SSD 1.1: Generar Spec Ejecutable Válida**  {#meta-modelo-del-pipeline-ssd-1.1:-generar-spec-ejecutable-válida}

![][image16]  
*Figura Nx \- Meta-modelo del Pipeline SSD 1.1*   
*(Diagrama en alta resolución)*

#### 

#### **Meta-Modelo del Pipeline SSD 1.2: Generar Diseño Detallado Válido** {#meta-modelo-del-pipeline-ssd-1.2:-generar-diseño-detallado-válido}

![][image17]  
*Figura Nx \- Meta-modelo del Pipeline SSD 1.2*   
*(Diagrama en alta resolución)*

#### **Meta-Modelo del Pipeline SSD 1.3: Generar Código Fuente Válido** {#meta-modelo-del-pipeline-ssd-1.3:-generar-código-fuente-válido}

![][image18]  
*Figura Nx \- Meta-modelo del Pipeline SSD 1.3*  
*(Diagrama en alta resolución)*

#### 

#### **Meta-Modelo del Pipeline SSD 1.4: Generar Reporte de Validación Válido** {#meta-modelo-del-pipeline-ssd-1.4:-generar-reporte-de-validación-válido}

![][image19]  
*Figura Nx \- Meta-modelo del Pipeline SSD 1.4*  
*(Diagrama en alta resolución)*

### ***Meta-Modelo del Proceso de Desarrollo Global \- Fase de Transición:*** {#meta-modelo-del-proceso-de-desarrollo-global---fase-de-transición:}

*![][image20]*  
*Figura Nx \- Meta-modelo del Proceso de Desarrollo Global \- Fase de Transición.*  
 *(Diagrama en alta resolución)* 

El diagrama presenta la vista dinámica de la Fase de Transición, que constituye el cierre de cada iteración completa del ciclo de vida. A diferencia de las fases anteriores, cuyo foco es construir el sistema incrementalmente, esta fase tiene como propósito verificar que todos los incrementos producidos durante la Fase de Construcción funcionan de forma coherente como producto integrado y dejarlo en condiciones de ser entregado. 

En el contexto del proceso híbrido adoptado, donde no existe un cliente externo formal, la entrega se entiende como la producción de un incremento funcional, verificado y documentado que cumple los objetivos comprometidos para la iteración.

El diagrama modela tres actividades paralelas que el equipo ejecuta de forma concurrente tras el planeamiento de la iteración: el proceso de verificación final, detallado en el meta-modelo de Verificación, que valida la cobertura de specs, la ejecución completa de los tests y la consistencia del sistema integrado; la finalización de la documentación del proyecto, que incluye actualizar las specs ejecutables, los ADRs y la Memoria Persistente para reflejar el estado real del sistema al cierre de la iteración; y la preparación para el despliegue, que agrupa las actividades técnicas necesarias para dejar el incremento listo para ser puesto en funcionamiento. 

Una vez completadas estas tres actividades en paralelo, el flujo converge en el despliegue de la versión, que marca el hito de cierre de la iteración y habilita el inicio de una nueva vuelta por el ciclo de vida si el proyecto así lo requiere.

La decisión de modelar el despliegue como actividad de cierre secuencial refleja que ninguna versión puede desplegarse sin que la verificación, la documentación y la preparación técnica estén completas simultáneamente. Esto es coherente con el principio de calidad continua que atraviesa todo el proceso y con el rol de la Definition of Done como compuerta formal. 

7.- ELABOREN UN META-MODELO DEL PROCESO DE INGENIERÍA O DISCIPLINA DE REQUERIMIENTOS INCLUIDA EN EL PROCESO DE DESARROLLO GLOBAL FINALMENTE SIMPLIFICADO Y/O ADAPTADO (el del punto 6). Identificar y utilizar los tipos de diagramas de UML que sean convenientes para incluso modelar principales flujos de trabajo en la disciplina. Aportar breve descripción de elementos (al menos, actividades o tareas principales, pero también podrían incluirse roles, artefactos, etc.).

## 7\. Meta-modelo de la disciplina de Ingeniería de Requerimientos {#7.-meta-modelo-de-la-disciplina-de-ingeniería-de-requerimientos}

*Meta-modelo de la (sub)disciplina de Requerimientos dentro del proceso global. Incluir diagramas UML para flujo de trabajo (ej. Actividades) y estructura (ej. Clases).*

La disciplina de Ingeniería de Requerimientos dentro del proceso híbrido que adoptamos se organiza en dos momentos diferenciados.

En la fase de Inicio (Conception) de OpenUp, el analista realiza en paralelo la elaboración de los artefactos Documento de Visión y el Glosario de Dominio, dado que ambos son independientes entre sí. Una vez disponibles, se identifican los Casos de Uso principales y se elaboran sus especificaciones, conformando el núcleo del modelo de requisitos del sistema.

En la fase Construcción (Construction) de OpenUp, el analista detalla el Caso de Uso correspondiente al Work Item seleccionado en cada Sprint. Este detalle es el insumo que dispara el pipeline SDD descrito en el Meta-modelo del punto 6\. La disciplina permanece activa durante todo el proyecto (no se cierra al finalizar Conception).

### ***Perspectiva dinámica (comportamiento)*** {#perspectiva-dinámica-(comportamiento)-1}

![][image21]  
*Figura Nx \- Meta-modelo de Ingeniería de Requisitos*  
*(Diagrama en alta resolución)*

##### 

El diagrama de clases muestra los elementos estructurales de la disciplina y sus relaciones. El rol central es el Analista, quien es responsable de todos los artefactos de la disciplina. El Administrador de Proyecto interviene sobre la Work Item List y la Lista de Riesgos, que si bien están relacionadas con los requisitos, pertenecen al dominio de planificación del proyecto. 

### ***Perspectiva estática (estructural)*** {#perspectiva-estática-(estructural)-1}

##### ***![][image22]***

*Figura Nx \- Meta-modelo de Ingeniería de Requerimientos*  
*(Diagrama en alta resolución)*

##### ***Descripción de elementos*** {#descripción-de-elementos}

**Roles *(*explicado en punto 6 *“[Roles humanos](#equipo-de-desarrollo-\(roles-humanos\):)”)***

* Administrador de Proyecto  
* Analista

**Artefactos (explicado en punto 6 *[“Lista de Artefactos a Realizar”](?tab=t.0#bookmark=id.d0cgt4rg4st9)*)**

* Caso de Uso  
* Documento de Visión  
* Glosario de Dominio  
* Lista de Riesgos   
* Memoria Persistente  
* Work Item List

8.- ELABOREN UN META-MODELO DEL PROCESO O DISCIPLINA DE DISEÑO INCLUIDA EN EL PROCESO DE DESARROLLO GLOBAL FINALMENTE SIMPLIFICADO Y/O ADAPTADO (el del punto 6). Identificar y utilizar los tipos de diagramas de UML que sean convenientes para incluso modelar principales flujos de trabajo en la (sub)disciplina. Aportar breve descripción de elementos (al menos, actividades o tareas principales, pero también podrían incluirse roles, artefactos, etc.). **Garantizar que se incluye algún método de evaluación de arquitecturas de software alternativas.**

## 8\. Meta-modelo de la disciplina de Diseño {#8.-meta-modelo-de-la-disciplina-de-diseño}

*Meta-modelo de la (sub)disciplina de Diseño (Arquitectónico y Detallado). Debe incluir explícitamente un método de evaluación de arquitecturas alternativas (ej. ATAM de Kazman, Klein & Clements 2010).*

### ***Perspectiva dinámica (comportamiento)*** {#perspectiva-dinámica-(comportamiento)-2}

*![][image23]*

##### *Figura Nx \- Meta-modelo de Disciplina de Diseño* {#figura-nx---meta-modelo-de-disciplina-de-diseño}

*(Diagrama en alta resolución)*

	El diagrama de clases muestra los elementos estructurales de la disciplina de diseño, es el **Arquitecto** que se encarga de realizar las especificaciones de **Arquitectura de Software**, identificar los casos donde se pueden aplicar **Patrones de diseño**, especificar la **Interfaz** de cada componente y construir el **Modelo de Base de Datos** que permita soportar el sistema.

### ***Perspectiva estática (estructural)*** {#perspectiva-estática-(estructural)-2}

*![][image24]*  
*Figura Nx \- Meta-modelo de Disciplina de Diseño*  
*(Diagrama en alta resolución)*

##### ***Proceso para evaluar arquitecturas*** {#proceso-para-evaluar-arquitecturas}

Al momento de evaluar las arquitecturas alternativas a implementar se hará uso del Metodo de Analisis de Compromisos Arquitectónicos (ATAM) \[\], que consistirá en las siguientes actividades:

1. **Recolección y priorización de requisitos y escenarios:**

Para comenzar con la evaluación, el equipo de desarrollo debe usar todos los **requerimientos** (funcionales y no funcionales), **restricciones** y **características del entorno** para formular **escenarios** que representen las funciones más críticas del sistema.  
Una vez tenemos los escenarios, el equipo debe decidir qué prioridad le va a dar a cada uno teniendo en cuenta los **atributos de calidad** más importantes para el sistema.

2. **Descripción de arquitecturas candidatas:**

Teniendo en cuenta estos escenarios priorizados, los requerimientos, restricciones y el entorno, además de sus conocimientos sobre diseño arquitectónico y experiencias pasadas el equipo se encarga de describir las arquitecturas que pueden estar sujetas a la implementación.  
Las descripciones de las arquitecturas deben darse en base a los atributos de calidad que prioriza y los que se descuidan en cambio.

3. **Análisis específico de atributos de calidad:**

Las arquitecturas propuestas son utilizadas para proyectar la implementación del sistema haciendo uso de estas y son evaluadas según los requerimientos que tengan que ver con cada atributo de calidad.  
Cada atributo de calidad es evaluado según los requerimientos obtenidos anteriormente de forma individual, separar la evaluación de cada atributo es muy útil ya que deja que los desarrolladores que tengan más experiencia en ciertos atributos puedan aportar haciendo uso de su expertiz.  
Este análisis debe resultar en la definición de características que va a tener el sistema (junto a un valor que las mida) en cada atributo de calidad pertinente.  
Por ejemplo: “El sistema va a requerir 4 personas para mantenimiento”, “El sistema tiene un tiempo de respuesta de 40ms en promedio”

4. **Identificar puntos sensibles:**

El equipo de desarrollo utiliza los análisis de atributos para identificar cómo los cambios en ciertos elementos de cada arquitectura propuesta afectan a los resultados de los mismos, por ejemplo podríamos evaluar como introducir el uso de RAID 10 en lugar de RAID 5 afecta al tiempo de respuesta de consultas.  
Esta actividad busca generar una **lista de puntos sensibles.**

5. **.Identificar Compromisos:**

Una vez tenemos la lista de puntos sensibles, para identificar los compromisos que significan cada decisión arquitectónica tenemos que identificar los puntos sensibles que afectan a **más de un atributo de calidad.**  
Finalmente, al obtener los compromisos de aplicar cada arquitectura, podemos usarlos para determinar la arquitectura a utilizar.

##### ***Descripción de elementos*** {#descripción-de-elementos-1}

**Roles *(explicado en punto 6 “[Roles humanos](#equipo-de-desarrollo-\(roles-humanos\):)”)***

* Arquitecto  
  **Artefactos (explicado en punto 6 *[“Lista de Artefactos a Realizar”](?tab=t.0#bookmark=id.d0cgt4rg4st9)*)**  
* Arquitectura de software  
* Patrón de diseño  
* Modelo de Base de Datos  
* Interfaz

9.- ELABOREN UN META-MODELO DEL PROCESO O DISCIPLINA DE VERIFICACIÓN (PRUEBA DEL SOFTWARE) INCLUIDA EN EL PROCESO DE DESARROLLO GLOBAL FINALMENTE SIMPLIFICADO Y/O ADAPTADO (el del punto 6). Identificar y utilizar los tipos de diagramas de UML que sean convenientes para incluso modelar principales flujos de trabajo en la (sub)disciplina. Aportar breve descripción de elementos (al menos, actividades o tareas principales, pero también podrían incluirse roles, artefactos, etc.).

## 9\. Meta-modelo de la disciplina de Verificación (Prueba del Software) {#9.-meta-modelo-de-la-disciplina-de-verificación-(prueba-del-software)}

El diagrama de actividades presenta la vista dinámica de la disciplina de prueba del software, modelando el flujo de verificación a lo largo de un sprint. El proceso opera de forma cíclica en tres niveles de granularidad progresivos:  
A nivel de **micro-incremento**, por cada porción de código desarrollada, el flujo delega el control al **Subagente Verificador**, quien ejecuta un **Test Unitario** de forma automática antes de avanzar.  
A nivel de **Work Item**, una vez que no quedan micro-incrementos pendientes para una tarea, el entorno de integración continua **(CI/CD)** dispara automáticamente el **Test de Integración** y el  Work Item se marca como completado .  
A nivel de Sistema, al resolver todos los Work Items y proceder con la integración continua del incremento global, el **Tester** (humano), toma el control para ejecutar el **Test de Sistema** sobre el **producto** antes de cerrar el sprint*.*

### 

### ***Perspectiva dinámica (comportamiento)***  {#perspectiva-dinámica-(comportamiento)-3}

### ***![][image25]***

*Figura Nx \- Meta-modelo de disciplina de Verificación*  
*(Diagrama en alta resolución)*  
El diagrama de clases muestra los elementos estructurales de la disciplina y sus relaciones, destacando la clara división de responsabilidades entre agentes de IA y humanos. El **Coordinador de IA** orquesta al **Subagente Verificador**, quien es responsable de generar y realizar los **Tests Automatizados** (específicamente, los **Tests Unitarios**). Actuando como compuerta de calidad “*human-in-the-loop”*, el **Desarrollador** debe validar estos tests automatizados generados por la IA.  
Por otro lado, el Tester humano se encarga de generar y realizar los **Tests Manuales** (que agrupan los **Tests de Integración y de Sistema**). A su vez, el modelo establece una estricta trazabilidad de verificación: los Tests Unitarios verifican los **Micro-incrementos**, los Tests de Integración verifican los **Work Items**, y los Tests de Sistema validan el **Producto de Software** final.

### ***Perspectiva estática (estructural)***  {#perspectiva-estática-(estructural)-3}

![][image26]  
*Figura Nx \- Meta-modelo de disciplina de Verificación*  
*(Diagrama en alta resolución)*  
***Descripción de elementos***  
**Roles *(explicado en punto 6 “[Roles humanos](#equipo-de-desarrollo-\(roles-humanos\):)”)***

* Coordinador de IA   
* Subagente Verificador  
* Desarrollador  
* Tester

**Artefactos**

* Test Automatizado  
* Test Manual  
* Test Unitario  
* Test de Integración  
* Test de Sistema

10.- ANALICEN BREVEMENTE CONSIDERACIONES PRELIMINARES ACERCA DE ESTÁNDARES A TENER EN CUENTA, ENTORNOS, TECNOLOGÍAS Y HERRAMIENTAS A UTILIZAR Y/O INTEGRAR PARA LA IMPLEMENTACIÓN DEL PRODUCTO SOFTWARE A DESARROLLAR.

## 10\. Consideraciones preliminares: estándares, entornos, tecnologías y herramientas {#10.-consideraciones-preliminares:-estándares,-entornos,-tecnologías-y-herramientas}

Las definiciones de esta sección fijan el marco normativo y técnico de referencia para la Parte II, alineado con el proceso híbrido adoptado en el punto 5 y con los requisitos no funcionales priorizados en 4.a. Las decisiones concretas de implementación se reajustan en 11.d una vez definido el diseño arquitectónico.

##### ***Estándares a considerar*** {#estándares-a-considerar}

Se adopta un conjunto acotado de estándares **de acceso público**, suficiente para un sistema web transaccional no crítico pero que media pagos y datos personales. La selección prioriza el modelo de calidad que estructura los RNF de 4.a y la normativa de seguridad y cumplimiento aplicable, evitando la carga documental que el equipo descartó explícitamente en el punto 5\.

| Estándar | Ámbito | Relevancia para el caso de estudio |
| :---- | :---- | :---- |
| ISO/IEC 25010:2011 \- SQuaRE (International Organization for Standardization, 2011\) | Modelo de calidad del producto | Define los atributos de calidad (fiabilidad, eficiencia, seguridad, mantenibilidad, usabilidad) sobre los que se organizan los RNF de 4.a y los escenarios de evaluación de arquitectura de 11.b. |
| PCI DSS | Seguridad de datos de medios de pago | Aplicable al mediar pagos con tarjeta; el cumplimiento se mitiga delegando el procesamiento en una pasarela certificada (ver Tecnologías) (PCI Security Standards Council, 2024). |
| WCAG 2.1 \- W3C (Kirkpatrick et al., 2018\) | Accesibilidad web | Soporta el RNF de **aceptabilidad** (usabilidad) frente a la diversidad de usuarios de oficios en la región. |
| Ley N.° 25.326 (2000) y Ley N.° 27.078 (2014) (Argentina) | Normativa sectorial nacional | Protección de datos personales y servicios TIC, ya analizadas en 4.b; condicionan el tratamiento de datos, la mensajería y el consentimiento. |

##### ***Entornos*** {#entornos}

Se propone una cadena de promoción de cuatro entornos, con avance entre etapas regulado por la *Definition of Done* y la compuerta Human-in-the-Loop (revisión mediante una *solicitud de incorporación de cambios*, en inglés Pull Request) definidas en el punto 5:

* **Desarrollo (local):** una instancia por integrante, contenedorizada con Docker para garantizar paridad de dependencias entre las distintas máquinas del equipo y eliminar el problema de “funciona en mi máquina”.  
* **Integración continua (CI):** entorno efímero que se activa con cada publicación de cambios en el repositorio; ejecuta la compilación del software, el análisis estático de código (verificación automática de estilo y errores comunes) y la batería de pruebas automatizadas como precondición de la compuerta de calidad.  
* **Staging (pruebas):** réplica del entorno de producción donde se realiza la validación incremental de fin de iteración y la validación con el representante de usuario (asumido por integrantes del equipo).  
* **Producción:** despliegue final del incremento aprobado.

De forma transversal opera el **entorno del pipeline SDD**: el coordinador de IA y los sub-agentes efímeros, apoyados en la memoria persistente que conserva decisiones, ADRs y convenciones de código entre sesiones e integrantes.

##### ***Tecnologías*** {#tecnologías}

Las tecnologías de esta sección son **preliminares y tentativas**: constituyen un conjunto tecnológico candidato que sirve de referencia para las consideraciones de esta etapa, pero **la decisión concreta queda supeditada a la selección de la arquitectura en 11.b y se confirma o ajusta en 11.d** (Consideraciones de Implementación). Se las incluye aquí porque condicionan los estándares y herramientas ya enunciados, no como compromiso cerrado.  
A modo de candidato preliminar se propone un conjunto tecnológico homogéneo, con **TypeScript como único lenguaje en todas las capas** (cliente y servidor). La razón no es solo de comodidad: un único lenguaje compartido por todas las capas reduciría la carga cognitiva de un equipo pequeño con roles rotativos y, sobre todo, **simplificaría el contexto que el pipeline SDD inyecta a los sub-agentes**, evitando la deriva entre generaciones y favoreciendo la mantenibilidad (RNF). Cada capa se justifica contra los RNF priorizados.

| Capa | Tecnología propuesta | Justificación (vínculo con RNF) |
| :---- | :---- | :---- |
| Frontend | **Next.js** (Vercel, 2026), **React** (Meta Platforms, 2025\) y **TypeScript** (Microsoft, 2026b)  | Aplicación de página única (interfaz que se actualiza sin recargar) con renderizado del lado del servidor y diseño adaptable, con prioridad a dispositivos móviles, atendiendo la **aceptabilidad** y la conectividad variable del contexto regional (Misiones). |
| Backend | **NestJS** (Myśliwiec, 2026\) sobre **Node.js** (OpenJS Foundation, 2026b) y **TypeScript**, con API de tipo REST (Fielding, 2000\)  | Lenguaje compartido con el frontend (**mantenibilidad**); arquitectura modular alineada con el diseño por componentes y los micro-incrementos de OpenUP. |
| Base de datos | **PostgreSQL** (PostgreSQL Global Development Group, 2026\) | Garantías ACID (atomicidad, consistencia, aislamiento y durabilidad de las transacciones) para reservas y pagos, núcleo de la **fiabilidad** del sistema producto-servicio. |
| Caché / sesiones | **Redis** (Redis Ltd., 2026\) | Reduce la latencia en consultas frecuentes y mantiene la **eficiencia** bajo carga concurrente. |
| Integraciones | **Mercado Pago** como pasarela de pago (Mercado Pago, s.f.), proveedor de notificaciones (correo electrónico y avisos automáticos al dispositivo), geolocalización/mapas, mensajería en tiempo real | Mercado Pago es la pasarela regional dominante en Argentina y **delega el cumplimiento PCI DSS**; las demás cubren la mensajería (sujeta a la Ley 27.078) y el descubrimiento geográfico de prestadores. |
| Seguridad (transversal) | OAuth2 (Hardt, 2012\) / JWT (Jones et al., 2015), credenciales protegidas con funciones de *hash* —almacenamiento cifrado e irreversible— (argon2: Biryukov et al., 2021; bcrypt: Provos y Mazières, 1999), cifrado TLS (Rescorla, 2018\) en tránsito, cifrado de datos sensibles en reposo | Sostiene el RNF de **seguridad** y el cumplimiento de la Ley 25.326. |

##### ***Herramientas a utilizar y/o integrar*** {#herramientas-a-utilizar-y/o-integrar}

Las herramientas se eligen para instrumentar las compuertas del proceso adaptado (la solicitud de incorporación de cambios, la integración continua y la *Definition of Done* materializan las compuertas Human-in-the-Loop del punto 5\) y para operar el pipeline SDD.

| Categoría | Herramienta | Uso en el proceso |
| :---- | :---- | :---- |
| Gestión y trabajo colaborativo | **GitHub Projects** (GitHub, s.f.) / **Trello** (Atlassian, s.f.)  | Tablero de la *Work Item List* y vista operativa del *Sprint Backlog*. |
| Control de versiones | **Git** (Software Freedom Conservancy, 2026\) \+ **GitHub** (GitHub, s.f.)  | Flujo de trabajo basado en ramas, con la *solicitud de incorporación de cambios* (Pull Request) como compuerta Human-in-the-Loop antes de integrar a la rama principal. |
| Integración y entrega continua | **GitHub Actions** (GitHub, s.f.)  | Compilación, análisis estático de código, ejecución de pruebas y despliegue a los entornos de pre-producción y producción, condicionado por la *Definition of Done*. |
| Modelado UML | **PlantUML** (Roques, 2026\) \+ **Mermaid** (Sveidqvist, 2026\)  | Vista lógica, diagramas de clases, casos de uso y meta-modelos del proceso. |
| Entorno de desarrollo | **Visual Studio Code** (Microsoft, 2026c)  | Entorno de desarrollo integrado (IDE) principal del equipo; punto de integración del coordinador de IA. |
| Pipeline de IA (SDD) | **OpenCode** (Anomaly Innovations, 2026; agente con selección de modelo por fase) \+ **Engram** (Buscaglia, 2026b; memoria persistente)  | OpenCode actúa como coordinador y orquesta sub-agentes especialistas efímeros (diseño, implementación, verificación), asignando un modelo distinto por fase del SDD (uno potente para diseño, uno rápido para implementación, uno económico para exploración); Engram provee la memoria compartida de decisiones, ADRs y convenciones entre sesiones e integrantes. |
| Pruebas | **Vitest** (VoidZero, 2026\) / **Jest** (OpenJS Foundation, 2026a) (pruebas unitarias), **Supertest** (Lad, s.f.) (pruebas de API), **Playwright** (Microsoft, 2026a) (pruebas de extremo a extremo) | Pruebas automatizadas derivadas de los criterios de aceptación de la especificación, base de la disciplina de V\&V. |
| Contenedores | **Docker** / **Docker Compose** (Docker, 2026a, 2026b)  | Paridad entre los entornos de desarrollo, integración continua, pre-producción y producción. |

# 

# DESARROLLO. PARTE II: CONCEPCIÓN, ELABORACIÓN Y CONSTRUCCIÓN DE SISTEMAS DE SW {#desarrollo.-parte-ii:-concepción,-elaboración-y-construcción-de-sistemas-de-sw}

CONSIGNAS PARA PARTE II  
COMPLETAR EL DOCUMENTO DE TP INTEGRADO INCORPORANDO INFORME, ESPECIFICACIONES Y MODELOS CORRESPONDIENTES LUEGO DE QUE…

11.- EJECUTEN EL MODELO DE PROCESO DE DESARROLLO FINALMENTE SIMPLIFICADO Y/O ADAPTADO, de manera que de forma general se cubra (al menos parcialmente) lo siguiente:

## 11\. Ejecución del proceso de desarrollo {#11.-ejecución-del-proceso-de-desarrollo}

### ***11.a. Ingeniería de Requerimientos*** {#11.a.-ingeniería-de-requerimientos}

Conforme a la adaptación de la disciplina definida en el punto 5, los artefactos de esta sección son: un documento de **Visión acotado** (con sus restricciones) y **glosario del dominio**, una **lista de riesgos** mantenida y revisada en cada iteración, los **casos de uso** como artefacto principal de captura del comportamiento del sistema, según la plantilla de OpenUP (Eclipse Foundation, 2012; Jacobson, Booch y Rumbaugh, 2000), y la reutilización ampliada de los requerimientos ya identificados en 4.a. Se descartaron el formato de documentación IEEE 830 y las historias de usuario como artefacto paralelo, según lo justificado en el punto 5\.

#### **Documento de Visión del Proyecto** {#documento-de-visión-del-proyecto}

Este documento define el alcance y la intención del producto para todos los stakeholders, en formato breve según OpenUP. No reemplaza la especificación de requerimientos: el detalle de comportamiento se captura en los casos de uso y en las especificaciones ejecutables por funcionalidad.

##### ***Declaración del problema*** {#declaración-del-problema}

| Elemento | Descripción |
| :---- | :---- |
| **El problema de** | la contratación informal y fragmentada de servicios técnicos calificados, gestionada mediante redes sociales, grupos de WhatsApp y recomendaciones verbales |
| **afecta a** | clientes que necesitan servicios para su hogar y prestadores de oficios de la provincia de Misiones (Posadas, Garupá, Oberá y localidades vecinas) |
| **cuyo impacto es** | falta de trazabilidad de las contrataciones, imposibilidad de verificar identidad y habilitaciones del prestador, ausencia de mecanismos de reputación y dificultad para coordinar disponibilidad horaria y zonas de cobertura |
| **una solución exitosa sería** | una plataforma SaaS que centralice la búsqueda, contratación, pago y calificación de servicios de oficios, con verificación de identidad y habilitaciones profesionales |

##### ***Declaración de posicionamiento del producto*** {#declaración-de-posicionamiento-del-producto}

| Elemento | Descripción |
| :---- | :---- |
| **Para** | clientes y prestadores de servicios técnicos calificados de Misiones |
| **quienes** | necesitan contratar (u ofrecer) servicios de oficios con confianza, trazabilidad y coordinación de agenda |
| **el producto** | es una plataforma SaaS de economía colaborativa basada en oficios |
| **que** | centraliza el flujo completo de búsqueda, contratación, comunicación, pago y reputación en un único sistema accesible desde cualquier dispositivo |
| **a diferencia de** | Facebook Marketplace, grupos de WhatsApp y la recomendación verbal, que no ofrecen verificación, reputación ni trazabilidad |
| **nuestro producto** | verifica identidad del prestador y habilitaciones profesionales ante los organismos reguladores, construye reputación auditable y retiene el pago hasta la confirmación de finalización del servicio |

##### ***Stakeholders y usuarios*** {#stakeholders-y-usuarios}

Se retoman los stakeholders identificados en 4.a:

| Stakeholder | Descripción | Responsabilidad |
| :---- | :---- | :---- |
| **Clientes** | Usuario principal | Encontrar y contratar prestadores confiables, con agenda y pago seguros |
| **Prestadores de servicios** | Usuario principal | Ofrecer servicios, gestionar agenda y construir reputación profesional |
| **Administradores de la plataforma** | Usuario de soporte | Verificar identidades y habilitaciones, moderar contenido, gestionar la operación |
| **Equipo de desarrollo** | Proveedor | Construir y mantener la plataforma. |

**Características principales**  
Cada característica *(feature)* traza a los módulos de requerimientos funcionales de 4.a, lo que garantiza la trazabilidad entre la visión y la especificación:

###### *Features del producto y trazabilidad a requisitos funcionales*

| ID | Feature | RF relacionados | Plazo de Aplicación |
| :---- | :---- | :---- | :---- |
| F-1 | Registro, autenticación y perfiles con roles diferenciados | RF-1 | Inmediata |
| F-2 | Catálogo de servicios y búsqueda por oficio y zona geográfica | RF-2 | Inmediata |
| F-3 | Sistema de reputación con calificaciones y reseñas | RF-3 | Cercana |
| F-4 | Agenda y gestión de disponibilidad del prestador | RF-4 | Cercana |
| F-5 | Comunicación directa entre cliente y prestador | RF-5 | Lejana |
| F-6 | Contratación con estados trazables y políticas de cancelación | RF-6 | Cercana |
| F-7 | Pagos electrónicos con retención hasta confirmación | RF-7 | Inmediata |
| F-8 | Verificación de habilitaciones profesionales ante organismos reguladores | RF-8 | Lejana |

**Restricciones.** Conforme al contenido que OpenUP prescribe para este artefacto, se enuncian las restricciones contra las cuales se verificó la consistencia de las features anteriores. Se mantienen en formato breve;

###### *Restricciones del proyecto y del entorno*

| Tipo | Restricción |
| :---- | :---- |
| **Normativa** | Cumplimiento de la Ley 25.326 de Protección de Datos Personales y de la Ley 27.078; cumplimiento PCI DSS delegado en una pasarela de pagos certificada. |
| **Técnica** | Conjunto tecnológico candidato homogéneo (TypeScript en todas las capas), supeditado a la selección de arquitectura;  accesibilidad conforme WCAG 2.1. |
| **De proceso** | Todo artefacto generado con asistencia de IA atraviesa la compuerta Human-in-the-Loop antes de integrarse a la rama principal (RNF-O.1). |

##### ***Análisis de mercado / negocio*** {#análisis-de-mercado-/-negocio-1}

Se sintetiza el análisis realizado en 4.b. Los actores relevados en el dominio (Clickie, Tegu, MannoApp, MercadoLibre Servicios, Home Solution, Qxm y Zolvers) presentan dos limitaciones consistentes respecto a nuestro caso: **cobertura geográfica concentrada** en CABA, Córdoba y otros grandes centros urbanos, sin presencia consolidada en Misiones.   
De este relevamiento se desprende la oportunidad de negocio: un nicho regional sin representación, con demanda real canalizada hoy por medios informales. El producto se posiciona como **Producto de Software Genérico** dentro de la *sharing economy*, en el segmento de servicios profesionales y personales o *gig economy* (Kovács et al., 2021), cumpliendo las cuatro características primarias de los negocios de economía colaborativa enunciadas por Szegedi (2019).  
El modelo de ingresos previsto para la versión inicial es la **comisión por contratación concretada**, cobrada sobre el pago procesado por la plataforma (RF-7). Este modelo alinea el ingreso de la plataforma con el éxito de la transacción y no impone barreras de entrada a los prestadores, **a diferencia del modelo de pago por contacto observado en parte de la competencia**. Como línea de monetización diferible se identificó la publicidad (RNF-M.3, clasificada como opcional).

##### ***Dominio del problema*** {#dominio-del-problema-1}

El dominio se estructura mediante un proceso central que conecta a los dos actores principales a través de la plataforma. Los conceptos centrales del dominio se definen en el siguiente glosario de dominio y, para las profesiones reguladas, en el Anexo A, que cataloga las profesiones cubiertas y sus regulaciones.

##### 

##### 

#### **Glosario de Dominio** {#glosario-de-dominio}

1. **Calificación**: Valoración en escala 1–5, acompañada de una reseña, que el cliente emite sobre una contratación finalizada y que construye la reputación del prestador (RF-3).  
2. **Contratación**: Acuerdo entre un cliente y un prestador para la ejecución de un servicio, gestionado por la plataforma a través de una máquina de estados explícita (RF-6).  
3. **Franja horaria**: Intervalo de disponibilidad que el prestador define en su agenda y que el cliente selecciona al solicitar una contratación (RF-4, RF-6.1).  
4. **Habilitación** profesional: Matrícula o certificación exigida por un organismo regulador para ejercer determinadas profesiones; condición para que el prestador pueda operar en la plataforma (RF-8, Anexo A).  
5. **Máquina de estados**: Conjunto de estados válidos de la contratación (solicitada, confirmada, en curso, finalizada, cancelada) y de las transiciones permitidas entre ellos, que gobierna qué acciones están disponibles para cada actor (RF-6.4).  
6. **Oficio**: Actividad técnica calificada ofrecida como servicio; las categorías y profesiones cubiertas se catalogan en el Anexo A.  
7. **Prestador**: Usuario que ofrece servicios de oficios a través de la plataforma, con identidad verificada y, cuando su profesión lo exige, habilitación profesional acreditada (RF-1.3, RF-8)

#### **Lista de Riesgos del Proyecto** {#lista-de-riesgos-del-proyecto}

| Impacto |  |
| ----- | :---- |
| Muy bajo | 1 |
| Bajo | 2 |
| Medio | 3 |
| Alto | 4 |
| Muy alto | 5 |

La probabilidad de cada riesgo está puntuada del 1 al 10 donde 1 es un 10% de probabilidad de que ocurra mientras que un 10 es un 100%. El Impacto es medido según la siguiente tabla:

| Riesgo ID | FechaIdentificado | Titulo | Descripción | Tipo | Impacto | Probabilidad | Magnitud | Estrategia de mitigación |
| :---- | :---- | ----- | ----- | :---- | :---- | :---- | :---- | :---- |
| **R-1** | 01/06/2026 | Arraigo de canales informales  | Baja adopción por arraigo de los canales informales (WhatsApp, anuncio verbal) | Negocio  | 3 | 4 | 12 | Lanzamiento focalizado por localidad y categoría; costo de entrada nulo para prestadores; el pago retenido como diferencial de confianza |
| **R-2** | 01/06/2026 | Demora en integración de pasarela de pagos  | La integración con la pasarela de pagos demora o limita el flujo de retención y liberación | Técnico | 5 | 6 | 30 | Prueba de concepto temprana en la fase de Elaboración; capa de abstracción de pagos desacoplada (RNF-M.4) |
| **R-3** | 01/06/2026 | Falta de verificación sistemática de matrículas  | Los organismos reguladores no ofrecen medios sistemáticos de verificación de matrículas | Técnico  | 4 | 2 | 8 | Verificación documental manual asistida por administradores como mecanismo de respaldo (RF-8.3); registro auditable (RNF-S.7) |
| **R-4** | 01/06/2026 | Desviación de calidad en artefactos con IA  | Desviación de calidad en artefactos generados con asistencia de IA | Técnico | 3 | 4 | 6 | Compuerta Human-in-the-Loop obligatoria antes de integrar; convenciones persistidas en memoria compartida, DoD con revisión cruzada |
| **R-5** | 01/06/2026 | Incumplimiento Ley 25.326  | Incumplimiento de la Ley 25.326 en el tratamiento de datos personales y sensibles | Negocio | 5 | 1 | 5 | RNF-S.4 como requisito obligatorio, principio de mínimo privilegio (RNF-S.1), revisión legal de términos de servicio (RNF-S.6) |
| **R-6** | 01/06/2026 | Subestimación del alcance por sprint  | Subestimación del alcance comprometido por sprint | Cronograma  | 2 | 2 | 4 | Replanificación al inicio de cada sprint. los work items no terminados retornan a la Work Item List repriorizada |

#### **Requerimientos de Usuario** {#requerimientos-de-usuario}

Los requerimientos de usuario son declaraciones en lenguaje natural de los servicios que el sistema debe proveer y las restricciones bajo las cuales debe operar, redactadas para ser comprensibles por los stakeholders sin conocimiento técnico. Se identifican por actor. Conforme al punto 5, no se utilizan historias de usuario como artefacto paralelo: estos enunciados se refinan directamente en los casos de uso y en los requerimientos del sistema.

##### ***Requerimientos de usuario del actor Cliente*** {#requerimientos-de-usuario-del-actor-cliente}

Código: “RU-C. N°X”: Requerimiento de Usuario-Cliente N°X

| Código | Enunciado |
| :---- | :---- |
| RU-C.1 | El cliente podrá registrarse en la plataforma y mantener su perfil con datos personales y de contacto. |
| RU-C.2 | El cliente podrá buscar prestadores por oficio, zona geográfica, calificación y disponibilidad. |
| RU-C.3 | El cliente podrá solicitar la contratación de un servicio indicando ubicación, fecha, franja horaria y descripción del problema. |
| RU-C.4 | El cliente podrá comunicarse con el prestador a través de la plataforma antes, durante y después del servicio. Y deberá ser notificado cuando se le mande un mensaje |
| RU-C.5 | El cliente podrá pagar el servicio con medios electrónicos a través de la plataforma y recibir un comprobante. |
| RU-C.6 | El cliente podrá calificar al prestador al finalizar el servicio y consultar las reseñas de otros clientes. |
| RU-C.7 | El cliente podrá cancelar una contratación conforme a las políticas de cancelación y, de corresponder, recibir el reembolso. |
| RU-C.8 | El cliente podrá seguir el estado de sus contrataciones y ser notificado de cada cambio. |

##### ***Requerimientos de usuario del actor Prestador*** {#requerimientos-de-usuario-del-actor-prestador}

Código: “RU-C. N°X”: Requerimiento de Usuario-Prestador N°X

| Código | Enunciado |
| :---- | :---- |
| RU-P.1 | El prestador podrá registrarse acreditando su identidad y, cuando su oficio lo requiera, su matrícula o habilitación profesional. |
| RU-P.2 | El prestador podrá publicar los servicios que ofrece, con descripción y rango de precios estimado. |
| RU-P.3 | El prestador podrá gestionar su agenda de disponibilidad y sus zonas de cobertura. |
| RU-P.4 | El prestador podrá aceptar, rechazar o proponer alternativas a las solicitudes de contratación recibidas. |
| RU-P.5 | El prestador podrá enviar al cliente un precio estimado de mano de obra antes de confirmar la contratación. |
| RU-P.6 | El prestador podrá cobrar al cliente a través de la plataforma una vez confirmada la finalización del servicio. |
| RU-P.7 | El prestador podrá construir su reputación profesional a través de las reseñas de usuarios con los que haya trabajado y responder las reseñas recibidas. |
| RU-P.8 | El prestador será notificado cuando sus habilitaciones profesionales estén próximas a vencer. |

##### ***Requerimientos de usuario del actor Administrador*** {#requerimientos-de-usuario-del-actor-administrador}

Código: “RU-C. N°X”: Requerimiento de Usuario-Administrador N°X

| Código | Enunciado |
| :---- | :---- |
| RU-A.1 | El administrador podrá verificar la identidad y las habilitaciones profesionales de los prestadores antes de habilitarlos para operar. |
| RU-A.2 | El administrador podrá moderar reseñas y respuestas que incumplan las políticas de la plataforma. |
| RU-A.3 | El administrador podrá suspender o dar de baja perfiles que incumplan las políticas de la plataforma. |

#### **Requerimientos del Sistema** {#requerimientos-del-sistema}

Los requerimientos del sistema constituyen descripciones más detalladas de las funciones, servicios y restricciones operacionales, y definen lo que debe implementarse (Sommerville, 2016). En este trabajo, los requerimientos del sistema son los **requisitos funcionales y no funcionales especificados en 4.a y ampliados en esta sección**, redactados con verbos mandatarios según la convención MoSCoW adoptada (Wiegers & Hokanson, 2023).  
Conforme a la práctica SDD incorporada en el punto 5, cada caso de uso se deriva además en una **especificación ejecutable por funcionalidad**, en formato estructurado (contexto, requisitos, restricciones y criterios de aceptación), consumible por los agentes de IA durante la implementación (Piskala, 2026; Buscaglia, 2026a). La siguiente tabla establece la trazabilidad entre los requerimientos de usuario y los requisitos del sistema que los refinan:

##### ***Trazabilidad entre requerimientos de usuario y requisitos del sistema*** {#trazabilidad-entre-requerimientos-de-usuario-y-requisitos-del-sistema}

| N° | Req. de usuario | Requisitos del sistema que lo refinan |
| :---: | :---- | :---- |
| \- | Usuario Cliente |  |
| 1 | RU-C.1 | RF-1.1, RF-1.2, RF-1.3, RF-1.4 |
| 2 | RU-C.2 | RF-2.1, RF-2.2, RF-2.3 |
| 3 | RU-C.3 | RF-6.1 |
| 4 | RU-C.4 | RF-5.1, RF-5.2, RF-5.3 |
| 5 | RU-C.5 | RF-7.1, RF-7.3 |
| 6 | RU-C.6 | RF-3.1, RF-3.2 |
| 7 | RU-C.7 | RF-6.6, RF-7.4 |
| \- | Usuario Prestador |  |
| 8 | RU-C.8 | RF-6.4, RF-6.5 |
| 9 | RU-P.1 | RF-1.1, RF-1.3, RF-8.1, RF-8.2, RF-8.3, RF-8.4 |
| 10 | RU-P.2 | RF-2.4 |
| 11 | RU-P.3 | RF-1.4, RF-2.6 (nuevo), RF-4.1, RF-4.2, RF-4.3 |
| 12 | RU-P.4 | RF-6.2 |
| 13 | RU-P.5 | RF-6.3 |
| 14 | RU-P.6 | RF-7.2 |
| 15 | RU-P.7 | RF-3.2, RF-3.3 |
| 16 | RU-P.8 | RF-8.5 |
| \- | Usuario Administrador |  |
| 17 | RU-A.1 | RF-8.1, RF-8.2, RF-8.3, RF-8.4 |
| 18 | RU-A.2 | RF-3.4 |
| 19 | RU-A.3 | RF-1.5 |

#### **Requerimientos Funcionales (subclasificaciones y métricas)** {#requerimientos-funcionales-(subclasificaciones-y-métricas)}

*Reutilizar y ampliar los RF definidos en 4.a, agregando subclasificaciones.*  
Se reutilizan los requisitos funcionales especificados en 4.a (Tabla 1), cuyas descripciones y prioridades se mantienen sin cambios, y se los amplía en dos sentidos. Primero, se agrega una **subclasificación por naturaleza de la función**, elaborada por el equipo. Sommerville (2016, p. 105\) define los requisitos funcionales como enunciados de los *servicios que el sistema debe proveer* y de *cómo debe comportarse ante determinadas situaciones*, pero no propone una taxonomía de ellos; partiendo de esa definición, el equipo distingue cinco categorías según la naturaleza de la función: a) ***Interacción de usuario*** (servicios operados directamente por un actor); b) ***Lógica de negocio*** (reglas y procesos internos); c) ***Integración externa*** (interacción con sistemas de terceros); d) ***Notificación*** (avisos generados por el sistema) y; e) ***Administración y moderación*** (operación de la plataforma). **Destinado a anticipar en qué componente de la arquitectura se realizará cada requisito**: cada naturaleza orienta la asignación del RF a la capa o módulo correspondiente del diseño arquitectónico de 11.b —presentación, lógica de negocio, capa de integración por adaptadores y mecanismos de notificación— y, con ello, el diseño detallado de 11.c. Segundo, se asocia a cada requisito un **criterio de aceptación medible**, que se incorpora a la especificación ejecutable de la funcionalidad correspondiente y sirve de base para derivar los tests automatizados previstos en la disciplina de Verificación y Validación.  
	Adicionalmente, la elaboración de los casos de uso permitió identificar cinco requisitos funcionales no contemplados en 4.a, que se incorporan con la marca **(nuevo)**: RF-1.6, RF-2.5, RF-2.6, RF-6.7 y RF-7.5. Como estos cinco no figuran en la Tabla 1 de 4.a, se especifican a continuación con su descripción normativa y su prioridad, al mismo nivel que los requisitos originales; su prioridad se asigna por coherencia con el requisito al que cada uno se vincula.

##### ***Requisitos funcionales nuevos: descripción y prioridad*** {#requisitos-funcionales-nuevos:-descripción-y-prioridad}

| N° | Código | Prioridad | Descripción |
| :---- | :---- | :---- | :---- |
| 1 | RF-1.6 | Obligatorio | El sistema *deberá* permitir la recuperación de la contraseña mediante un token de un solo uso enviado por e-mail (contraparte de RF-1.2). |
| 2 | RF-2.5 | Obligatorio | El sistema *deberá* exponer un perfil público del prestador que muestre sus servicios, su calificación promedio y las reseñas recibidas (soporte de RF-3.2). |
| 3 | RF-2.6 | Obligatorio | El sistema deberá permitir al prestador definir y editar su zona de cobertura (radio, localidades o área), utilizada para filtrar las búsquedas (soporte de RF-2.2). |
| 4 | RF-6.7 | Deseable | El cliente y el prestador *deberían* poder consultar su historial completo de contrataciones, con su estado y fecha. |
| 5 | RF-6.8 | Obligatorio | El prestador *deberá* poder registrar el inicio efectivo del trabajo sobre una contratación confirmada, pasando su estado a *en curso*. |
| 6 | RF-6.9 | Obligatorio | El cliente *deberá* poder aceptar o rechazar la propuesta alternativa enviada por el prestador cuando la contratación está en estado *solicitada* con propuesta registrada. |
| 7 | RF-7.5 | Deseable | El sistema *debería* iniciar la liberación del pago al prestador una vez confirmada la finalización del servicio (contraparte de RF-7.2). |

##### ***Requerimientos funcionales ampliados: subclasificación y criterios de aceptación*** {#requerimientos-funcionales-ampliados:-subclasificación-y-criterios-de-aceptación}

| Código | Subclasificación | Criterio de aceptación (métrica) |
| :---- | :---- | :---- |
| RF-1.1 | Interacción de usuario y Lógica de Negocio | El registro con rol cliente o prestador se completa y persiste; el usuario queda operativo según su rol. |
| RF-1.2 | Lógica de negocio | Credenciales válidas otorgan sesión; tras 5 intentos fallidos consecutivos la cuenta se bloquea temporalmente. |
| RF-1.3 | Interacción de usuario | El prestador con oficio regulado no tiene acceso a ninguna funcionalidad de prestador hasta que su matrícula cargada sea acreditada. |
| RF-1.4 | Interacción de usuario | Toda edición de perfil persiste y se refleja en el perfil público en el siguiente acceso. |
| RF-1.5 | Administración y moderación | Un perfil suspendido pierde acceso y visibilidad en el catálogo en menos de 1 minuto. |
| RF-1.6 (nuevo) | Lógica de negocio | La recuperación de contraseña emite un token de un solo uso por e-mail, con expiración a los 30 minutos. |
| RF-2.1 | Lógica de negocio | El catálogo cubre las 7 categorías de servicios definidas en el Anexo A. |
| RF-2.2 | Integración externa | La búsqueda filtra prestadores cuya zona de cobertura contiene la ubicación del cliente. |
| RF-2.3 | Lógica de negocio | Los resultados admiten ordenamiento por calificación, distancia y disponibilidad. |
| RF-2.4 | Interacción de usuario | La publicación de un servicio con descripción y rango de precios queda visible en el catálogo. |
| RF-2.5 (nuevo) | Interacción de usuario | El perfil público del prestador muestra servicios, calificación promedio y reseñas recibidas. |
| RF-2.6 | Interacción de usuario | El prestador podrá definir y editar su zona de cobertura (radio, localidades o área) |
| RF-3.1 | Interacción de usuario | La calificación (escala 1–5 y reseña) solo está disponible para contrataciones en estado finalizado; una por contratación. |
| RF-3.2 | Lógica de negocio | El promedio del prestador se calcula y publica al confirmarse cada nueva calificación. |
| RF-3.3 | Interacción de usuario | El prestador puede publicar una única respuesta por reseña recibida. |
| RF-3.4 | Administración y moderación | Una reseña moderada deja de ser visible públicamente y el hecho queda registrado. |
| RF-4.1 | Interacción de usuario | El prestador configura franjas por día de la semana y estas se reflejan en su disponibilidad pública. |
| RF-4.2 | Lógica de negocio | Una franja reservada no puede ser seleccionada por otro cliente: 0 reservas duplicadas. |
| RF-4.3 | Interacción de usuario | Los períodos marcados como no disponibles quedan excluidos de la búsqueda y la reserva. |
| RF-5.1 | Interacción de usuario y Lógica de Negocios | Cliente y prestador vinculados por una solicitud o contratación pueden intercambiar mensajes. |
| RF-5.2 | Lógica de negocio | El historial de mensajes queda asociado a la contratación y es recuperable por ambas partes. |
| RF-5.3 | Notificación | El receptor es notificado de un nuevo mensaje en menos de 1 minuto. |
| RF-6.1 | Interacción de usuario | La solicitud exige ubicación, prestador, fecha, franja y descripción; sin esos campos no se envía. |
| RF-6.2 | Interacción de usuario | El prestador puede enviar propuesta (fecha, franja y precio) o rechazar la solicitud; ambas acciones quedan registradas y se notifica al cliente. |
| RF-6.3 | Interacción de usuario | El precio estimado de mano de obra registrado en la propuesta queda visible para el cliente en la contratación en estado *presupuestada*. |
| RF-6.4 | Lógica de negocio | La contratación solo admite las transiciones válidas entre los 6 estados definidos; toda transición inválida es rechazada. |
| RF-6.5 | Notificación | Cada transición de estado genera una notificación a ambas partes. |
| RF-6.6 | Lógica de negocio | La cancelación se procesa conforme a la política vigente según el estado y la antelación. |
| RF-6.7 (nuevo) | Interacción de usuario | Cliente y prestador pueden consultar su historial completo de contrataciones con estado y fecha. |
| RF-6.8 (nuevo) | Interacción de usuario | El prestador registra el inicio efectivo del trabajo; la contratación transiciona de *confirmada* a *en curso* con fecha y hora registradas. |
| RF-6.9 (nuevo) | Interacción de usuario | El cliente acepta o rechaza la propuesta del prestador; la contratación transiciona de *presupuestada* a *confirmada* (acepta) o *cancelada* (rechaza). |
| RF-7.1 | Integración externa | El pago se procesa vía pasarela con tarjeta y transferencia; el resultado (aprobado/rechazado) se refleja en la contratación. |
| RF-7.2 | Lógica de negocio | El monto pagado queda retenido y no es transferido al prestador antes de la confirmación de finalización. |
| RF-7.3 | Lógica de negocio | El 100% de las transacciones genera comprobante digital descargable. |
| RF-7.4 | Lógica de negocio | El reembolso por cancelación elegible se inicia automáticamente conforme a la política aplicable. |
| RF-7.5 (nuevo) | Lógica de negocio | Confirmada la finalización del servicio, la liberación del pago al prestador se inicia en menos de 24 horas. |
| RF-8.1 | Integración externa | Toda alta de prestador dispara la verificación correspondiente a su profesión según el Anexo A. |
| RF-8.2 | Integración externa | Para profesiones con matrícula obligatoria, la vigencia se valida ante el organismo antes de habilitar al prestador. |
| RF-8.3 | Administración y moderación | La documentación habilitante se almacena asociada al perfil y es revisable por el administrador. |
| RF-8.4 | Lógica de negocio | Las profesiones no reguladas admiten alta por autodeclaración, identificada como tal en el perfil. |
| RF-8.5 | Notificación | El prestador es notificado del vencimiento de su habilitación con al menos 30 días de antelación. |

#### **Requerimientos No Funcionales (subclasificaciones y métricas)** {#requerimientos-no-funcionales-(subclasificaciones-y-métricas)}

*Reutilizar y ampliar los RNF definidos en 4.a, agregando subclasificaciones y métricas faltantes.*  
Se reutilizan los requerimientos no funcionales especificados en 4.a (Tablas 2 a 5), que ya cuentan con métrica y objetivo, y se los amplía con la **subclasificación de Sommerville (2016)**, que distingue requerimientos *de **producto*** (especifican el comportamiento del sistema: usabilidad, eficiencia, confiabilidad, protección), ***organizacionales*** (derivan de políticas y procedimientos de la organización que desarrolla u opera el sistema) y ***externos*** (derivan de factores externos, como legislación o regulaciones). Se indica además la característica de calidad correspondiente del modelo **ISO/IEC 25010 (SQuaRE)**, cuyo catálogo completo de características y subcaracterísticas se detalla en el **Anexo B** y opera como glosario único de referencia a lo largo del trabajo.

##### ***Requerimientos no funcionales ampliados: subclasificación según Sommerville e ISO/IEC 25010*** {#requerimientos-no-funcionales-ampliados:-subclasificación-según-sommerville-e-iso/iec-25010}

| Código | Subclasificación | Característica ISO/IEC 25010 |
| :---- | :---- | :---- |
| RNF-A.1 | De producto: usabilidad | Usabilidad (operabilidad, capacidad de aprendizaje) |
| RNF-A.2 | De producto: usabilidad | Portabilidad (adaptabilidad) |
| RNF-A.3 | De producto: usabilidad | Usabilidad (operabilidad) |
| RNF-S.1 | De producto: protección | Seguridad (confidencialidad) |
| RNF-S.2 | De producto: protección | Seguridad (confidencialidad) |
| RNF-S.3 | De producto: protección | Seguridad (autenticidad) |
| RNF-S.4 | Externo: legislativo (Ley 25.326) | Seguridad (confidencialidad, integridad) |
| RNF-S.5 | De producto: confiabilidad | Fiabilidad (disponibilidad) |
| RNF-S.6 | Externo: legislativo | Seguridad (responsabilidad) |
| RNF-S.7 | De producto: protección | Seguridad (no repudio, responsabilidad) |
| RNF-S.8 | De producto: protección | Seguridad (autenticidad) |
| RNF-E.1 | De producto: eficiencia (desempeño) | Eficiencia de desempeño (comportamiento temporal) |
| RNF-E.2 | De producto: eficiencia (recursos) | Eficiencia de desempeño (utilización de recursos, capacidad) |
| RNF-E.3 | De producto: eficiencia (desempeño) | Eficiencia de desempeño (comportamiento temporal) |
| RNF-M.1 | De producto: mantenibilidad | Mantenibilidad (modificabilidad) |
| RNF-M.2 | De producto: mantenibilidad | Mantenibilidad (modificabilidad) |
| RNF-M.3 | De producto: eficiencia (desempeño) | Eficiencia de desempeño (comportamiento temporal) |
| RNF-M.4 | De producto: mantenibilidad | Mantenibilidad (modularidad, modificabilidad) |

Como ampliación, la ejecución del proceso adaptado introduce dos requisitos no funcionales **organizacionales de desarrollo**, derivados de la incorporación de SDD asistido por IA y de la Definition of Done definidas en el punto 5\. Su naturaleza es de proceso: restringen cómo se construye el sistema, no su comportamiento en operación.

##### ***Requisitos no funcionales organizacionales incorporados en la Parte II*** {#requisitos-no-funcionales-organizacionales-incorporados-en-la-parte-ii}

| Código | Prioridad | Descripción | Métrica | Objetivo |
| :---- | :---- | :---- | :---- | :---- |
| RNF-O.1 (nuevo) | Obligatorio | Todo artefacto generado con asistencia de IA (especificación, diseño, código, tests) *deberá* ser revisado y aprobado por un integrante humano antes de integrarse a la rama principal. | Porcentaje de integraciones con revisión humana registrada. | 100% de las integraciones pasan por la compuerta *Human-in-the-Loop*. |
| RNF-O.2 (nuevo) | Obligatorio | Los criterios de aceptación de cada especificación *deberán* derivar en tests automatizados que se ejecuten como parte de la Definition of Done. | Cobertura de criterios de aceptación con test automatizados asociado en los módulos del flujo núcleo. | ≥ 90% de los criterios de aceptación de los módulos núcleo (RF-1, RF-2, RF-6, RF-7) cubiertos por tests. |

#### **Diagrama de Casos de Uso** {#diagrama-de-casos-de-uso}

El diagrama de caso de uso modela los tres actores humanos (Cliente, Prestador y Administrador) y los dos sistemas externos con los que interactúa la plataforma (la pasarela de pagos y los organismos reguladores). Los casos de uso se derivan de los requerimientos del usuario y agrupan los requisitos funcionales por objetivo del actor. El modelo de casos de uso se presenta en siete vistas complementarias:

* Una vista general del modelo, con la totalidad de los actores y casos de uso.  
* Las vistas restantes descomponen el modelo por agrupamiento funcional, alineadas con los requisitos funcionales que cada conjunto refina.

**![][image27]**

*Figura Nx — Casos de Uso — Vista general del modelo*

**![][image28]**

*Figura Nx — Casos de Uso — Acceso y gestión de cuentas (RF-1)*

**![][image29]**

*Figura Nx — Casos de Uso — Catálogo, publicación y agenda (RF-2, RF-4)*

**![][image30]**

*Figura Nx — Casos de Uso — Contratación, ciclo de estados y mensajería (RF-5, RF-6)*

**![][image31]**

*Figura Nx — Casos de Uso — Pagos y liberación (RF-7)*

**![][image32]**

*Figura Nx — Casos de Uso — Reputación y moderación (RF-3)*

**![][image33]**

*Figura Nx — Casos de Uso — Verificación de habilitaciones profesionales (RF-8)*

#### **Tabla de trazabilidad de Caso de Uso con Requisitos Funcionales y Actor Primario**  {#tabla-de-trazabilidad-de-caso-de-uso-con-requisitos-funcionales-y-actor-primario}

| Caso de uso | Actor primario | RF relacionados |
| :---- | :---- | :---- |
| UC01 Registrarse | Cliente, Prestador | RF-1.1, RF-1.3 |
| UC02 Autenticarse | Cliente, Prestador, Administrador | RF-1.2, RF-1.6 |
| UC03 Gestionar perfil | Cliente, Prestador | RF-1.4 |
| UC04 Buscar prestadores | Cliente | RF-2.1, RF-2.2, RF-2.3, RF-2.5 |
| UC05 Publicar servicios | Prestador | RF-2.4 |
| UC06 Gestionar agenda y disponibilidad | Prestador | RF-4.1, RF-4.2, RF-4.3 |
| UC07 Solicitar contratación | Cliente | RF-6.1 |
| UC08 Enviar propuesta o rechazar solicitud | Prestador | RF-6.2, RF-6.3 |
| UC09 Gestionar estados de la contratación | Sistema (cliente y prestador) | RF-6.4, RF-6.7 |
| UC10 Cancelar contratación | Cliente, Prestador | RF-6.6, RF-7.4 |
| UC11 Intercambiar mensajes | Cliente, Prestador | RF-5.1, RF-5.2, RF-5.3 |
| UC12 Pagar servicio | Cliente | RF-7.1, RF-7.2, RF-7.3 |
| UC13 Confirmar finalización y liberar pago | Prestador | RF-7.2, RF-7.5 |
| UC14 Calificar prestador | Cliente | RF-3.1, RF-3.2 |
| UC15 Responder reseña | Prestador | RF-3.3 |
| UC16 Moderar reseñas | Administrador | RF-3.4 |
| UC17 Gestionar perfiles | Administrador | RF-1.5 |
| UC18 Verificar habilitaciones profesionales | Administrador | RF-8.1, RF-8.2, RF-8.3, RF-8.4, RF-8.5 |
| UC19 Notificar cambio de estado | Sistema | RF-6.5 |
| UC20 Iniciar servicio | Prestador | RF-6.8 |
| UC21 Responder propuesta de prestador | Cliente | RF-6.9 |

#### **Especificación de Casos de Uso** {#especificación-de-casos-de-uso}

Cada caso de uso se especifica conforme a la plantilla de OpenUP, con los campos:

* Nombre  
* Breve descripción  
* Actores  
* Precondiciones  
* Flujo básico de eventos,  
* Flujos alternativos  
* Escenarios clave  
* Requisitos especiales  
* Postcondiciones   
* Y donde corresponda puntos de extensión. 

Los flujos se redactan en formato de diálogo actor↔sistema. La autenticación (UC02) constituye la precondición común de todo caso de uso que opera sobre una sesión iniciada; solo UC01 (Registrarse) y UC04 (Buscar prestadores) admiten acceso sin autenticación. 

##### ***UC01: Registrarse*** {#uc01:-registrarse}

**Nombre:** Registrarse.  
**Breve descripción:** Describe cómo un visitante crea una cuenta en la plataforma, eligiendo el rol Cliente o Prestador, para quedar operativo según ese rol.  
**Actores:** Cliente, Prestador.  
**Precondiciones:** Ninguna. El caso de uso es de libre acceso; no exige sesión iniciada (no requiere UC02).

**Flujo básico de eventos:**

1. El visitante solicita registrarse en la plataforma.  
2. El sistema presenta el formulario de alta y solicita el rol (Cliente o Prestador), los datos personales y de contacto y las credenciales.  
3. El visitante selecciona el rol, completa los datos y confirma.  
4. El sistema valida que los datos obligatorios estén completos, que el formato sea correcto y que el correo no esté ya registrado.  
5. El sistema crea la cuenta, la persiste y la asocia al rol elegido.  
6. El sistema deja al usuario operativo según su rol y le confirma el alta. El caso de uso finaliza con éxito.

**Flujos alternativos:**  
4.1 Datos incompletos o inválidos. Si en el paso 4 faltan datos obligatorios o el formato es incorrecto, entonces:

1. El sistema indica los campos a corregir.  
2. El caso de uso se reanuda en el paso 3\.

4.2 Correo ya registrado. Si en el paso 4 el correo ya existe, entonces:

1. El sistema informa que la cuenta ya existe.  
2. El caso de uso se reanuda en el paso 3 o finaliza con una condición de falla si el visitante desiste.

5.1 Alta de prestador con oficio regulado. Si en el paso 5 el rol es Prestador y el oficio declarado es regulado, entonces:

1. El sistema crea la cuenta pero la marca como no habilitada para operar.  
2. El sistema indica que debe acreditar su matrícula y dispara la verificación de habilitaciones (UC18).  
3. El caso de uso finaliza con éxito en estado pendiente de habilitación.

**Escenarios clave:** Alta de prestador con oficio regulado, que queda pendiente de habilitación hasta acreditar matrícula.  
**Requisitos especiales:** 

* RF-1.1 (el registro con rol cliente o prestador se completa y persiste, y el usuario queda operativo según su rol)   
* RF-1.3 (el prestador con oficio regulado no tiene acceso a ninguna funcionalidad de prestador hasta que su matrícula cargada sea acreditada).

**Postcondiciones:**

* Finalización exitosa: existe una cuenta persistida y asociada a un rol; si el oficio es regulado, queda en estado pendiente de habilitación.  
* Condición de falla: no se crea ninguna cuenta.

##### ***UC02: Autenticarse*** {#uc02:-autenticarse}

**Nombre:** Autenticarse.  
**Breve descripción:** Describe cómo un usuario registrado inicia sesión con sus credenciales para acceder a las funciones correspondientes a su rol. Es precondición común de todos los casos de uso que operan sobre una sesión iniciada.  
**Actores:** Cliente, Prestador, Administrador.  
**Precondiciones:** El usuario posee una cuenta registrada y activa.

**Flujo básico de eventos:**

1. El usuario solicita iniciar sesión.  
2. El sistema presenta el formulario de credenciales (correo y contraseña).  
3. El usuario ingresa sus credenciales y confirma.  
4. El sistema valida las credenciales contra la cuenta registrada.  
5. El sistema reinicia el contador de intentos fallidos, abre la sesión y habilita las funciones correspondientes al rol. El caso de uso finaliza con éxito.

**Flujos alternativos:**  
4.1 Credenciales inválidas. Si en el paso 4 las credenciales no son válidas, entonces:

1. El sistema incrementa el contador de intentos fallidos consecutivos y notifica el error sin revelar qué dato es incorrecto.  
2. El caso de uso se reanuda en el paso 3\.

4.2 Bloqueo temporal por intentos fallidos. Si en el paso 4.1 el contador alcanza 5 intentos fallidos consecutivos, entonces:

1. El sistema bloquea temporalmente la cuenta y lo informa.  
2. El caso de uso finaliza con una condición de falla.

4.3 Recuperación de contraseña. Si en el paso 3 el usuario indica que olvidó su contraseña, entonces:

1. El sistema solicita el correo.  
2. El sistema envía por e-mail un token de un solo uso, con expiración a los 30 minutos.  
3. El usuario abre el enlace, define una nueva contraseña y confirma.  
4. El sistema valida el token; si está vigente y no fue usado, actualiza la contraseña.  
5. El caso de uso se reanuda en el paso 3\.

4.3.1 Token vencido o ya utilizado. Si en el paso 4 del flujo 4.3 el token expiró o ya fue usado, entonces:

1. El sistema rechaza la operación e invita a solicitar uno nuevo.  
2. El caso de uso finaliza con una condición de falla.

**Escenarios clave:** Bloqueo temporal tras 5 intentos fallidos consecutivos; recuperación de contraseña por token de un solo uso.  
**Requisitos especiales:**

* RF-1.2 (credenciales válidas otorgan sesión; tras 5 intentos fallidos consecutivos la cuenta se bloquea temporalmente)  
* RF-1.6 (la recuperación de contraseña emite un token de un solo uso por e-mail, con expiración a los 30 minutos).

**Postcondiciones:**

* Finalización exitosa: la sesión queda abierta y las funciones del rol habilitadas.  
* Condición de falla: no se abre sesión y, si corresponde, se bloquea la cuenta temporalmente.

##### ***UC03: Gestionar perfil*** {#uc03:-gestionar-perfil}

**Nombre:** Gestionar perfil.  
**Breve descripción:** Describe cómo un usuario consulta y edita los datos de su perfil, que se reflejan en su perfil público.  
**Actores:** Cliente, Prestador.  
**Precondiciones:** El actor está autenticado (UC02).

**Flujo básico de eventos:**

1. El actor solicita ver su perfil.  
2. El sistema muestra los datos actuales del perfil.  
3. El actor edita los datos que desea modificar y confirma.  
4. El sistema valida el formato y la consistencia de los datos.  
5. El sistema persiste los cambios y los refleja en el perfil público.  
6. El sistema confirma la actualización. El caso de uso finaliza con éxito.

**Flujos alternativos:**  
4.1 Datos inválidos. Si en el paso 4 algún dato es inválido, entonces:

1. El sistema indica los campos a corregir.  
2. El caso de uso se reanuda en el paso 3\.

**Escenarios clave:** Edición de datos de contacto que se reflejan en el perfil público en el siguiente acceso.  
**Requisitos especiales:** 

* RF-1.4 (toda edición de perfil persiste y se refleja en el perfil público en el siguiente acceso).

**Postcondiciones:**

* Finalización exitosa: los datos del perfil quedan actualizados y publicados.  
* Condición de falla: el perfil permanece sin cambios.

##### ***UC04: Buscar prestadores*** {#uc04:-buscar-prestadores}

**Nombre:** Buscar prestadores.  
**Breve descripción:** Describe cómo un cliente busca y compara prestadores por oficio, zona, cualificación y disponibilidad, y consulta su perfil público.  
**Actores:** Cliente.  
**Precondiciones:** Ninguna. El caso de uso es de acceso público; no exige sesión iniciada (no requiere UC02).

**Flujo básico de eventos:**

1. El cliente indica el oficio buscado y su ubicación, y opcionalmente filtros adicionales.  
2. El sistema busca prestadores cuya zona de cobertura contiene la ubicación del cliente, dentro de las categorías del catálogo.  
3. El sistema presenta los resultados con calificación promedio y disponibilidad, admitiendo ordenamiento por calificación, distancia y disponibilidad.  
4. El cliente selecciona un prestador.  
5. El sistema muestra el perfil público con servicios, calificación promedio y reseñas recibidas. El caso de uso finaliza con éxito.

**Flujos alternativos:**  
2.1 Sin resultados. Si en el paso 2 no hay prestadores cuya zona de cobertura contenga la ubicación, entonces:

1. El sistema informa que no se encontraron prestadores y sugiere ampliar los criterios.  
2. El caso de uso se reanuda en el paso 1\.  
   

**Escenarios clave:** Búsqueda filtrada por zona de cobertura que contiene la ubicación del cliente, con ordenamiento por calificación, distancia y disponibilidad.  
**Requisitos especiales:** 

* RF-2.1 (el catálogo cubre las 7 categorías de servicios del Anexo A)  
* RF-2.2 (la búsqueda filtra prestadores cuya zona de cobertura contiene la ubicación del cliente)  
* RF-2.3 (los resultados admiten ordenamiento por calificación, distancia y disponibilidad)  
* RF-2.5 (el perfil público muestra servicios, calificación promedio y reseñas recibidas).

**Postcondiciones:**

* Finalización exitosa: el cliente obtiene un listado de prestadores y, en su caso, el perfil público de uno de ellos.  
* Condición de falla: el caso de uso es de solo consulta.

##### ***UC05: Publicar servicios*** {#uc05:-publicar-servicios}

**Nombre:** Publicar servicios.  
**Breve descripción:** Describe cómo un prestador pública en el catálogo los servicios que ofrece, con descripción y rango de precios estimado.  
**Actores:** Prestador.  
**Precondiciones:** El actor está autenticado (UC02) y, si su oficio es regulado, está habilitado (UC18).

**Flujo básico de eventos:**

1. El prestador solicita publicar un servicio.  
2. El sistema presenta el formulario con categoría, descripción y rango de precios estimado.  
3. El prestador completa los datos y confirma.  
4. El sistema valida los datos obligatorios y que la categoría pertenezca al catálogo.  
5. El sistema persiste el servicio y lo deja visible en el catálogo.  
6. El sistema confirma la publicación. El caso de uso finaliza con éxito.

**Flujos alternativos:**  
4.1 Datos inválidos. Si en el paso 4 faltan datos obligatorios o son inconsistentes, entonces:

1. El sistema indica los campos a corregir.  
2. El caso de uso se reanuda en el paso 3\.

4.2 Prestador no habilitado. Si en el paso 4 el prestador tiene un oficio regulado y no está habilitado, entonces:

1. El sistema impide la publicación e informa que debe acreditar su matrícula.  
2. El caso de uso finaliza con una condición de falla.

**Escenarios clave:** Publicación de un servicio con descripción y rango de precios que queda visible en el catálogo.  
**Requisitos especiales:**

* RF-2.4 (la publicación de un servicio con descripción y rango de precios queda visible en el catálogo).   
* Se relaciona con RF-1.3 en cuanto a la habilitación previa del prestador regulado.

**Postcondiciones:**

* Finalización exitosa: el servicio queda publicado y visible.  
* Condición de falla: el servicio no se publica.

##### ***UC06: Gestionar agenda y disponibilidad*** {#uc06:-gestionar-agenda-y-disponibilidad}

**Nombre:** Gestionar agenda y disponibilidad.  
**Breve descripción:** Describe cómo un prestador configura sus franjas horarias y períodos de no disponibilidad, que determinan qué puede reservar el cliente.  
**Actores:** Prestador.  
**Precondiciones:** El actor está autenticado (UC02).

**Flujo básico de eventos:**

1. El prestador solicita gestionar su agenda.  
2. El sistema muestra la disponibilidad configurada por día de la semana.  
3. El prestador define o modifica franjas por día y marca períodos como no disponibles, y confirma.  
4. El sistema valida que las franjas no se solapen con franjas ya reservadas.  
5. El sistema persiste la configuración y la refleja en la disponibilidad pública, excluyendo de la búsqueda y la reserva los períodos no disponibles.  
6. El sistema confirma la actualización. El caso de uso finaliza con éxito.

**Flujos alternativos:**  
4.1 Solapamiento o conflicto. Si en el paso 4 las franjas se solapan o son inconsistentes, entonces:

1. El sistema indica el conflicto.  
2. El caso de uso se reanuda en el paso 3\.

4.2 Franja con reserva activa. Si en el paso 4 el prestador intenta eliminar una franja que ya tiene una contratación, entonces:

1. El sistema impide la modificación de esa franja e informa la causa.  
2. El caso de uso se reanuda en el paso 3\.

**Escenarios clave:** Configuración de franjas por día de la semana, reflejadas en la disponibilidad pública; exclusión de períodos no disponibles de la búsqueda y la reserva.  
**Requisitos especiales:** 

* RF-4.1 (el prestador configura franjas por día de la semana, reflejadas en su disponibilidad pública)  
* RF-4.2 (una franja reservada no puede ser seleccionada por otro cliente: 0 reservas duplicadas)  
* RF-4.3 (los períodos no disponibles quedan excluidos de la búsqueda y la reserva).

**Postcondiciones:** 

* Finalización exitosa : la disponibilidad pública refleja la nueva configuración.   
* Condición de falla:  la agenda permanece sin cambios.

##### ***UC07: Solicitar contratación*** {#uc07:-solicitar-contratación}

**Nombre:** Solicitar contratación.  
**Breve descripción:** Describe cómo un cliente solicita la contratación de un servicio a un prestador, indicando ubicación, fecha, franja y descripción, lo que crea la contratación en estado *solicitada*.  
**Actores:** Cliente.  
**Precondiciones:** El actor está autenticado (UC02). El cliente ha seleccionado un prestador con disponibilidad publicada.

**Flujo básico de eventos:**

1. El cliente solicita contratar a un prestador.  
2. El sistema presenta el formulario de solicitud con prestador, ubicación, fecha, franja horaria y descripción del problema.  
3. El cliente completa todos los campos requeridos y confirma.  
4. El sistema valida que estén presentes la ubicación, el prestador, la fecha, la franja y la descripción.  
5. El sistema verifica que la franja seleccionada siga disponible y la reserva, evitando duplicación.  
6. El sistema crea la contratación en estado *solicitada* invocando la gestión de estados (UC09).  
7. El sistema confirma al cliente el envío de la solicitud y la deja visible para el prestador. El caso de uso finaliza con éxito.

**Flujos alternativos:**   
4.1 Campos faltantes. Si en el paso 4 falta alguno de los campos obligatorios (ubicación, prestador, fecha, franja o descripción), entonces:   
1\. El sistema impide el envío e indica los campos a completar.   
2\. El caso de uso se reanuda en el paso 3\.   
5.1 Franja ya no disponible. Si en el paso 5 la franja fue tomada por otra contratación o el prestador la quitó, entonces:   
1\. El sistema informa que la franja ya no está disponible y ofrece elegir otra.   
2\. El caso de uso se reanuda en el paso 2\.

**Escenarios clave:** Creación de la contratación en estado *solicitada* con reserva de la franja sin duplicación.  
**Requisitos especiales:** 

* RF-6.1 (la solicitud exige ubicación, prestador, fecha, franja y descripción; sin esos campos no se envía). Se apoya en RF-4.2 para evitar reservas duplicadas. Dispara la transición inicial gobernada por UC09.

**Postcondiciones:** 

* Finalización exitosa: existe una contratación en estado *solicitada* con la franja reservada y visible para el prestador.   
* Condición de falla: no se crea la contratación y la franja no se reserva.

##### ***UC08: Enviar propuesta o rechazar solicitud*** {#uc08:-enviar-propuesta-o-rechazar-solicitud}

**Nombre:** Enviar propuesta o rechazar solicitud.  
**Breve descripción:** Describe cómo un prestador responde a una solicitud recibida, enviando una propuesta con las condiciones del servicio (fecha, franja horaria y precio estimado de mano de obra) o rechazándola. El envío de propuesta cambia el estado de la contratación a *presupuestada*, dejándola en espera de la aceptación del cliente.  
**Actores:** Prestador.   
**Precondiciones:** El actor está autenticado (UC02). Existe una contratación en estado *solicitada* dirigida al prestador.

**Flujo básico de eventos:**

1. El prestador abre una solicitud recibida.  
2. El sistema muestra el detalle de la solicitud y ofrece las dos acciones: enviar propuesta o rechazar.  
3. El prestador selecciona enviar propuesta y completa los campos de la propuesta: fecha, franja horaria y precio estimado de mano de obra.  
4. El sistema valida que los campos estén completos y registra la propuesta dejándola visible para el cliente.  
5. El sistema solicita a la gestión de estados (UC09) la transición de *solicitada* a *presupuestada*.  
6. Al cambiar el estado se dispara una notificación al cliente que genera el UC19. El caso de uso finaliza con éxito.

**Flujos alternativos:**  
3.1 Rechazar la solicitud: Si en el paso 3 el prestador rechaza, entonces:

1. El sistema solicita (UC09) la transición de estado *solicitada* a *cancelada*.   
2. El caso de uso finaliza con éxito en estado *cancelada*.

5.1 Transición inválida: Si en el paso 5 la contratación ya no está en estado *solicitada*, entonces:

1. El caso de uso UC09 rechaza la transición y el sistema informa que la solicitud ya no puede responderse.  
2. El caso de uso finaliza con una condición de falla.

**Escenarios clave:** Envío de propuesta con transición a *presupuestada* y registro de fecha, franja horaria y precio estimado; rechazo de la solicitud con transición a *cancelada*.  
**Requisitos especiales:**

* RF-6.2 (el prestador puede enviar una propuesta con fecha, franja horaria y precio estimado, o rechazar la solicitud).  
* RF-6.3 (el precio estimado de mano de obra queda registrado y visible para el cliente en la propuesta).

**Postcondiciones:**

* Finalización exitosa: la contratación queda en estado *presupuestada* (propuesta enviada) o *cancelada* (rechazar).  
* Condición de falla: el estado no cambia por una transición inválida.

##### ***UC09: Gestionar estados de la contratación*** {#uc09:-gestionar-estados-de-la-contratación}

**Nombre:** Gestionar estados de la contratación.  
**Breve descripción:** Comportamiento del sistema que centraliza la máquina de estados de la contratación. Recibe las solicitudes de transición disparadas por otros casos de uso, admite únicamente las transiciones válidas y rechaza toda transición inválida. No es iniciado directamente por un actor humano.  
**Actores:** Sistema (actor primario). Participan indirectamente Cliente y Prestador como destinatarios de las consultas de estado y del historial.  
**Precondiciones:** Existe una contratación con un estado vigente entre los definidos (*solicitada*, *presupuestada*, *confirmada*, *en curso*, *finalizada*, *cancelada*).

**Flujo básico de eventos:**

1. Un caso de uso del flujo de contratación (UC07, UC08, UC21, UC10, UC13 o UC20) solicita al sistema una transición de estado sobre una contratación.  
2. El sistema identifica el estado actual de la contratación y la transición requerida. Las transiciones de inicio provienen de UC07 (crea en *solicitada*), UC08 (envía propuesta → *presupuestada*), UC21 (acepta → *confirmada* / rechaza → *cancelada*), UC20 (*confirmada* → *en curso*), UC10 (→ *cancelada*) y UC13 (→ *finalizada*).  
3. El sistema verifica que la transición pertenezca al conjunto de transiciones válidas de la máquina de estados.  
4. El sistema aplica la transición, persiste el nuevo estado y registra la fecha del cambio en el historial.  
5. El sistema invoca UC19 (Notificar cambio de estado) mediante la relación «include», que avisa a ambas partes.  
6. El sistema deja la contratación consultable por ambas partes en su historial completo, con estado y fecha. El caso de uso finaliza con éxito.

**Flujos alternativos:**  
3.1 Transición inválida. Si en el paso 3 la transición no pertenece al conjunto de transiciones válidas, entonces:

1. El sistema rechaza la transición y conserva el estado actual.  
2. El sistema informa el rechazo al caso de uso solicitante.  
3. El caso de uso finaliza con una condición de falla.

**Escenarios clave:** Aplicación de las transiciones del ciclo de vida (*solicitada* → *confirmada* → *en curso* → *finalizada*) y de la cancelación; rechazo de transiciones inválidas.  
**Requisitos especiales:**

* RF-6.4 (la contratación solo admite las transiciones válidas entre los 5 estados; toda transición inválida es rechazada)  
* RF-6.7 (cliente y prestador pueden consultar su historial completo de contrataciones con estado y fecha).

**Postcondiciones:**

* Finalización exitosa: la contratación queda en un nuevo estado válido y el cambio queda registrado en el historial.  
* Condición de falla: el estado permanece sin cambios por una transición inválida.

**Casos de uso incluidos:** UC19 (Notificar cambio de estado), mediante la relación «include». La inclusión es incondicional: toda transición válida notifica a ambas partes (RF-6.5), por lo que el comportamiento es obligatorio y no opcional.

##### ***UC10: Cancelar contratación*** {#uc10:-cancelar-contratación}

**Nombre:** Cancelar contratación.  
**Breve descripción:** Describe cómo un cliente o un prestador cancela una contratación, lo que la lleva al estado *cancelada* y, según la política aplicable, inicia el reembolso correspondiente.  
**Actores:** Cliente, Prestador.  
**Precondiciones:** El actor está autenticado (UC02). Existe una contratación en un estado que admite cancelación.

**Flujo básico de eventos:**

1. El actor solicita cancelar una contratación.  
2. El sistema muestra la política de cancelación aplicable según el estado y la antelación, y solicita confirmación.  
3. El actor confirma la cancelación.  
4. El sistema evalúa la política vigente y determina la elegibilidad de reembolso.  
5. El sistema solicita a la gestión de estados (UC09) la transición al estado *cancelada* y libera la franja reservada.  
6. Si la cancelación es elegible para reembolso y hubo un pago retenido, el sistema inicia automáticamente el reembolso conforme a la política aplicable.  
7. El sistema confirma la cancelación; la notificación a la otra parte la genera UC19 al registrarse el cambio de estado. El caso de uso finaliza con éxito.

**Flujos alternativos:**  
4.1 Cancelación no permitida. Si en el paso 4 el estado actual no admite cancelación (por ejemplo, *finalizada*), entonces:

1. El sistema informa que la contratación no puede cancelarse.  
2. El caso de uso finaliza con una condición de falla.

5.1 Transición inválida. Si en el paso 5 UC09 rechaza la transición a *cancelada*, entonces:

1. El sistema informa el rechazo y conserva el estado.  
2. El caso de uso finaliza con una condición de falla.

**Escenarios clave:** Cancelación elegible con inicio automático del reembolso del pago retenido.  
**Requisitos especiales:** 

* RF-6.6 (la cancelación se procesa conforme a la política vigente según el estado y la antelación)  
* RF-7.4 (el reembolso por cancelación elegible se inicia automáticamente conforme a la política aplicable).

**Postcondiciones:**

* Finalización exitosa: la contratación queda en estado *cancelada*, la franja se libera y, de corresponder, el reembolso queda iniciado.  
* Condición de falla: el estado permanece sin cambios.

##### ***UC11: Intercambiar mensajes*** {#uc11:-intercambiar-mensajes}

**Nombre:** Intercambiar mensajes.  
**Breve descripción:** Describe cómo el cliente y el prestador vinculados por una solicitud o contratación intercambian mensajes a través de la plataforma, con historial recuperable.  
**Actores:** Cliente, Prestador.  
**Precondiciones:** El actor está autenticado (UC02). Existe una solicitud o contratación que vincula al cliente y al prestador.

**Flujo básico de eventos:**

1. El actor abre la conversación asociada a una solicitud o contratación.  
2. El sistema muestra el historial de mensajes asociado a esa contratación.  
3. El actor redacta un mensaje y lo envía.  
4. El sistema persiste el mensaje asociándolo a la contratación.  
5. El sistema entrega el mensaje y notifica al receptor en menos de 1 minuto. El caso de uso finaliza con éxito.

**Flujos alternativos:**  
3.1 Mensaje vacío. Si en el paso 3 el mensaje no tiene contenido válido, entonces:

1. El sistema impide el envío y menciona al usuario que debe escribir un mensaje.  
2. El caso de uso se reanuda en el paso 3\.

**Escenarios clave:** Intercambio de mensajes con historial asociado a la contratación y notificación al receptor en menos de 1 minuto.  
**Requisitos especiales:**

* RF-5.1 (cliente y prestador vinculados por una solicitud o contratación pueden intercambiar mensajes).  
* RF-5.2 (el historial queda asociado a la contratación y es recuperable por ambas partes).  
* RF-5.3 (el receptor es notificado de un mensaje nuevo en menos de 1 minuto).

**Postcondiciones:**

* Finalización exitosa: el mensaje queda persistido en el historial y notificado al receptor.  
* Condición de falla: el mensaje no se envía.

##### ***UC12: Pagar servicio*** {#uc12:-pagar-servicio}

**Nombre:** Pagar servicio.  
**Breve descripción:** Describe cómo un cliente paga el servicio a través de la plataforma mediante la pasarela de pagos; el monto queda retenido hasta la confirmación de finalización y se emite comprobante.  
**Actores:** Cliente. Pasarela de Pagos (sistema externo, actor secundario).  
**Precondiciones:** El actor está autenticado (UC02). Existe una contratación en estado *confirmada* o *en curso* pendiente de pago.

**Flujo básico de eventos:**

1. El cliente solicita pagar el servicio de una contratación.  
2. El sistema muestra el monto y los medios de pago disponibles (tarjeta y transferencia).  
3. El cliente selecciona el medio de pago e ingresa los datos requeridos.  
4. El sistema envía la transacción a la Pasarela de Pagos.  
5. La Pasarela de Pagos procesa el cobro y devuelve el resultado aprobado.  
6. El sistema registra el resultado en la contratación y retiene el monto, sin transferirlo al prestador.  
7. El sistema confirma el pago. El caso de uso finaliza con éxito.

**Flujos alternativos:**  
5.1 Pago rechazado. Si en el paso 5 la Pasarela de Pagos devuelve un resultado rechazado, entonces:

1. El sistema registra el rechazo en la contratación e informa al cliente.  
2. El caso de uso se reanuda en el paso 2 o finaliza con una condición de falla si el cliente desiste.

5.2 Sin respuesta de la pasarela. Si en el paso 5 la Pasarela de Pagos no responde dentro del tiempo previsto, entonces:

1. El sistema reintenta la consulta del estado de la transacción.  
2. Si tras los reintentos no hay confirmación, el sistema deja el pago como pendiente, no retiene fondos como aprobados e informa al cliente.  
3. El caso de uso finaliza con una condición de falla.

**Escenarios clave:** Pago aprobado con monto retenido y comprobante emitido; manejo del rechazo y de la falta de respuesta de la pasarela.  
**Requisitos especiales:** 

* RF-7.1 (el pago se procesa vía pasarela con tarjeta y transferencia; el resultado aprobado/rechazado se refleja en la contratación).  
* RF-7.2 (el monto pagado queda retenido y no es transferido al prestador antes de la confirmación de finalización).  
* RF-7.3 (el 100% de las transacciones genera comprobante digital descargable).

**Postcondiciones:**

* Finalización exitosa: el pago queda aprobado y retenido, con comprobante disponible.  
* Condición de falla: no hay pago aprobado ni fondos retenidos.

##### ***UC13: Confirmar finalización y liberar pago*** {#uc13:-confirmar-finalización-y-liberar-pago}

**Nombre:** Confirmar finalización y liberar pago.  
**Breve descripción:** Describe cómo el prestador confirma la finalización del servicio, lo que lleva la contratación a *finalizada* e inicia la liberación del pago retenido hacia el prestador a través de la pasarela.  
**Actores:** Prestador (actor primario). Pasarela de Pagos (sistema externo, actor secundario).  
**Precondiciones:** El actor está autenticado (UC02). Existe una contratación en estado *en curso* con un pago retenido.

**Flujo básico de eventos:**

1. El prestador confirma la finalización del servicio.  
2. El sistema solicita a la gestión de estados (UC09) la transición al estado *finalizada*.  
3. El sistema instruye a la Pasarela de Pagos la liberación del monto retenido hacia el prestador, iniciándola en menos de 24 horas.  
4. La Pasarela de Pagos confirma el inicio de la liberación.  
5. El sistema registra la liberación en la contratación.  
6. El sistema confirma la finalización; la notificación al cliente la genera UC19 al registrarse el cambio de estado, y habilita la calificación (UC14). El caso de uso finaliza con éxito.

**Flujos alternativos:**  
2.1 Transición inválida. Si en el paso 2 la contratación no está en estado *en curso*, entonces:

1. UC09 rechaza la transición y el sistema informa que no puede confirmarse la finalización.  
2. El caso de uso finaliza con una condición de falla.

3.1 Falla en la liberación. Si en el paso 3 la Pasarela de Pagos rechaza o no responde a la instrucción de liberación, entonces:

1. El sistema deja la liberación como pendiente, la registra para reintento y notifica la incidencia.  
2. El caso de uso finaliza con éxito en cuanto al estado *finalizada*, con la liberación marcada como pendiente.

**Escenarios clave:** Confirmación de finalización con transición a *finalizada* y liberación del pago iniciada en menos de 24 horas; manejo de la falla de liberación.  
**Requisitos especiales:** 

* RF-7.2 (el monto retenido se transfiere al prestador solo tras la confirmación de finalización).  
* RF-7.5 (confirmada la finalización, la liberación del pago se inicia en menos de 24 horas).

**Postcondiciones:**

* Finalización exitosa: la contratación queda en estado *finalizada* y la liberación del pago, iniciada o pendiente de reintento.  
* Condición de falla: el estado no cambia por una transición inválida.

##### ***UC14: Calificar prestador*** {#uc14:-calificar-prestador}

**Nombre:** Calificar prestador.  
**Breve descripción:** Describe cómo un cliente califica al prestador tras una contratación finalizada, con una valoración en escala 1–5 y una reseña, lo que recalcula la reputación del prestador.  
**Actores:** Cliente (actor primario).  
**Precondiciones:** El actor está autenticado (UC02). Existe una contratación en estado *finalizada* del cliente que aún no ha sido calificada.

**Flujo básico de eventos:**

1. El cliente solicita calificar una contratación finalizada.  
2. El sistema presenta el formulario de calificación (escala 1–5 y reseña).  
3. El cliente ingresa la valoración y la reseña, y confirma.  
4. El sistema valida que la contratación esté *finalizada* y que no exista ya una calificación para ella.  
5. El sistema persiste la calificación y recalcula y publica el promedio del prestador.  
6. El sistema confirma la calificación. El caso de uso finaliza con éxito.

**Flujos alternativos:**  
4.1 Contratación no finalizada. Si en el paso 4 la contratación no está en estado *finalizada*, entonces:

1. El sistema impide la calificación e informa la causa.  
2. El caso de uso finaliza con una condición de falla.

4.2 Contratación ya calificada. Si en el paso 4 ya existe una calificación para esa contratación, entonces:

1. El sistema informa que solo se admite una calificación por contratación.  
2. El caso de uso finaliza con una condición de falla.

**Escenarios clave:** Calificación única por contratación finalizada con recálculo del promedio del prestador.  
**Requisitos especiales:** 

* RF-3.1 (la calificación 1–5 y reseña solo está disponible para contrataciones en estado *finalizada*; una por contratación).  
* RF-3.2 (el promedio del prestador se recalcula y publica al confirmarse cada nueva calificación).

**Postcondiciones:**

* Finalización exitosa: la calificación queda registrada y el promedio del prestador, recalculado y publicado.  
* Condición de falla: no se registra calificación.

##### ***UC15: Responder reseña*** {#uc15:-responder-reseña}

**Nombre:** Responder reseña.  
**Breve descripción:** Describe cómo un prestador publica una única respuesta a una reseña recibida.  
**Actores:** Prestador (actor primario).  
**Precondiciones:** El actor está autenticado (UC02). Existe una reseña recibida por el prestador que aún no tiene respuesta.

**Flujo básico de eventos:**

1. El prestador abre una reseña recibida.  
2. El sistema muestra la reseña y ofrece redactar una respuesta.  
3. El prestador redacta la respuesta y confirma.  
4. El sistema valida que la reseña no tenga ya una respuesta.  
5. El sistema persiste la respuesta y la publica junto a la reseña. El caso de uso finaliza con éxito.

**Flujos alternativos:**  
4.1 Reseña ya respondida. Si en el paso 4 la reseña ya tiene una respuesta, entonces:

1. El sistema informa que solo se admite una respuesta por reseña.  
2. El caso de uso finaliza con una condición de falla.  
   

**Escenarios clave:** Publicación de una única respuesta por reseña recibida.  
**Requisitos especiales:** 

* RF-3.3 (el prestador puede publicar una única respuesta por reseña recibida).

**Postcondiciones:**

* Finalización exitosa: la respuesta queda publicada junto a la reseña.  
* Condición de falla: no se publica respuesta.

##### ***UC16: Moderar reseñas*** {#uc16:-moderar-reseñas}

**Nombre:** Moderar reseñas.  
**Breve descripción:** Describe cómo un administrador modera una reseña que incumple las políticas, retirándola de la vista pública y dejando registro del hecho.  
**Actores:** Administrador (actor primario).  
**Precondiciones:** El actor está autenticado (UC02) con rol Administrador.

**Flujo básico de eventos:**

1. El administrador selecciona una reseña reportada o detectada como contraria a las políticas.  
2. El sistema muestra el contenido de la reseña y las opciones de moderación.  
3. El administrador confirma la moderación indicando el motivo.  
4. El sistema retira la reseña de la vista pública y registra el hecho de moderación con su motivo y autor.  
5. El sistema confirma la moderación. El caso de uso finaliza con éxito.

**Flujos alternativos:**  
3.1 Cancelar la moderación. Si en el paso 3 el administrador desiste, entonces:

1. El sistema mantiene la reseña visible.  
2. El caso de uso finaliza sin cambios.

**Escenarios clave:** Moderación que retira la reseña de la vista pública y deja el hecho registrado.  
**Requisitos especiales:**

* RF-3.4 (una reseña moderada deja de ser visible públicamente y el hecho queda registrado).

**Postcondiciones:**

* Finalización exitosa: la reseña deja de ser visible públicamente y el hecho queda registrado.  
* Condición de falla: la reseña permanece visible.

##### ***UC17: Gestionar perfiles (suspensión/baja)*** {#uc17:-gestionar-perfiles-(suspensión/baja)}

**Nombre:** Gestionar perfiles.  
**Breve descripción:** Describe cómo un administrador suspende o da de baja perfiles que incumplen las políticas, lo que retira su acceso y su visibilidad en el catálogo.  
**Actores:** Administrador (actor primario).  
**Precondiciones:** El actor está autenticado (UC02) con rol Administrador. Existe un perfil objeto de la acción.

**Flujo básico de eventos:**

1. El administrador selecciona el perfil a gestionar.  
2. El sistema muestra el perfil y las acciones disponibles (suspender o dar de baja).  
3. El administrador selecciona la acción, indica el motivo y confirma.  
4. El sistema aplica la suspensión o baja, retira el acceso del perfil y su visibilidad en el catálogo en menos de 1 minuto, y registra el motivo.  
5. El sistema confirma la acción. El caso de uso finaliza con éxito.

**Flujos alternativos:**  
3.1 Cancelar la acción. Si en el paso 3 el administrador desiste, entonces:

1. El sistema mantiene el perfil sin cambios.  
2. El caso de uso finaliza sin cambios.

**Escenarios clave:** Suspensión de un perfil con pérdida de acceso y visibilidad en el catálogo en menos de 1 minuto.  
**Requisitos especiales:**

* RF-1.5 (un perfil suspendido pierde acceso y visibilidad en el catálogo en menos de 1 minuto).

**Postcondiciones:**

* Finalización exitosa: el perfil queda suspendido o dado de baja, sin acceso ni visibilidad.  
* Condición de falla: el perfil permanece sin cambios.

##### ***UC18: Verificar habilitaciones profesionales*** {#uc18:-verificar-habilitaciones-profesionales}

**Nombre:** Verificar habilitaciones profesionales.  
**Breve descripción:** Describe cómo el administrador verifica la identidad y las habilitaciones de un prestador, validando la vigencia de la matrícula ante el organismo regulador cuando la profesión lo exige, antes de habilitarlo para operar.  
**Actores:** Administrador (actor primario). Organismo Regulador (sistema externo, actor secundario).  
**Precondiciones:** El actor está autenticado (UC02) con rol Administrador. Existe un alta de prestador pendiente de verificación; toda alta de prestador dispara la verificación según el Anexo A.

**Flujo básico de eventos:**

1. El sistema presenta al administrador las altas de prestador pendientes de verificación, con la documentación habilitante almacenada asociada al perfil.  
2. El administrador selecciona un prestador y revisa su documentación.  
3. Si la profesión exige matrícula obligatoria, el sistema valida la vigencia de la matrícula ante el Organismo Regulador.  
4. El Organismo Regulador devuelve el estado de la matrícula (vigente).  
5. El administrador confirma la verificación.  
6. El sistema habilita al prestador para operar y registra el resultado. El caso de uso finaliza con éxito.

**Flujos alternativos:**  
3.1 Profesión no regulada. Si en el paso 3 la profesión no es regulada, entonces:

1. El sistema admite el alta por autodeclaración y la identifica como tal en el perfil.  
2. El caso de uso se reanuda en el paso 5\.

4.1 Matrícula no vigente. Si en el paso 4 el Organismo Regulador informa que la matrícula no está vigente, entonces:

1. El sistema mantiene al prestador como no habilitado e informa la causa.  
2. El caso de uso finaliza con una condición de falla.

4.2 Sin respuesta del organismo. Si en el paso 4 el Organismo Regulador no responde, entonces:

1. El sistema deja la verificación como pendiente y la registra para reintento.  
2. El caso de uso finaliza con una condición de falla provisoria.

**Escenarios clave:** Validación de vigencia de matrícula ante el Organismo Regulador antes de habilitar; alta por autodeclaración para profesiones no reguladas.  
**Requisitos especiales:**

* RF-8.1 (toda alta de prestador dispara la verificación correspondiente a su profesión según el Anexo A).  
* RF-8.2 (para profesiones con matrícula obligatoria, la vigencia se valida ante el organismo antes de habilitar).  
* RF-8.3 (la documentación habilitante se almacena asociada al perfil y es revisable por el administrador).  
* RF-8.4 (las profesiones no reguladas admiten alta por autodeclaración, identificada como tal).  
* RF-8.5 (el prestador es notificado del vencimiento de su habilitación con al menos 30 días de antelación).

**Postcondiciones:**

* Finalización exitosa: el prestador queda habilitado para operar y el resultado, registrado.  
* Condición de falla: el prestador permanece no habilitado.

##### ***UC19: Notificar cambio de estado*** {#uc19:-notificar-cambio-de-estado}

**Nombre:** Notificar cambio de estado.  
**Breve descripción:** Comportamiento del sistema, incluido por UC09 (Gestionar estados de la contratación). Ante cada transición de estado válida genera la notificación correspondiente a ambas partes.  
**Actores:** Sistema (actor primario). Cliente y Prestador son los destinatarios de la notificación.  
**Precondiciones:** UC09 aplicó y persistió una transición de estado válida e invoca este caso de uso de forma incluida.

**Flujo básico de eventos:**

1. El sistema recibe de UC09 (mediante «include») el aviso de una transición de estado recién persistida.  
2. El sistema determina el nuevo estado y las partes involucradas (cliente y prestador).  
3. El sistema compone y envía la notificación del cambio de estado a ambas partes. El caso de uso finaliza con éxito.

**Flujos alternativos:**  
3.1 Fallo de envío. Si en el paso 3 la notificación a alguna de las partes no puede entregarse, entonces:

1. El sistema registra el fallo y la programa para reintento.  
2. El caso de uso finaliza con una condición de falla parcial, sin afectar el estado ya registrado por UC09.

**Escenarios clave:** Notificación a ambas partes ante cada transición de estado registrada.  
**Requisitos especiales:** 

* RF-6.5 (cada transición de estado genera una notificación a ambas partes). Es incluido por UC09 y se ejecuta de forma incondicional en cada transición válida.

**Postcondiciones:**

* Finalización exitosa: ambas partes quedan notificadas del cambio de estado.  
* Condición de falla: la notificación queda pendiente de reintento, sin afectar el estado de la contratación.

##### ***UC20: Iniciar servicio*** {#uc20:-iniciar-servicio}

**Nombre:** Iniciar servicio.  
**Breve descripción:** Describe cómo un prestador registra el inicio efectivo del trabajo sobre una contratación confirmada, llevando su estado de *confirmada* a *en curso*.  
**Actores:** Prestador (actor primario).  
**Precondiciones:** El actor está autenticado (UC02). Existe una contratación en estado *confirmada* asignada al prestador.

**Flujo básico de eventos:**

1. El prestador abre la contratación confirmada.  
2. El sistema muestra el detalle de la contratación y ofrece la acción "Iniciar servicio".  
3. El prestador selecciona "Iniciar servicio".  
4. El sistema solicita a la gestión de estados (UC09) la transición de *confirmada* a *en curso*.  
5. El sistema registra la fecha y hora de inicio efectivo del servicio.  
6. La notificación al cliente la genera UC19 al registrarse el cambio de estado. El caso de uso finaliza con éxito.

**Flujos alternativos:**  
4.1 Transición inválida. Si en el paso 4 la contratación ya no se encuentra en estado *confirmada*, entonces:

1. UC09 rechaza la transición y el sistema informa que el servicio no puede iniciarse desde el estado actual.  
2. El caso de uso finaliza con una condición de falla.

**Escenarios clave:** Inicio del servicio por el prestador con transición *confirmada* → *en curso* y notificación al cliente.  
**Requisitos especiales:** 

* RF-6.8 (el prestador registra el inicio efectivo del trabajo cuando la contratación está en estado *confirmada*).

**Postcondiciones:**

* Finalización exitosa: la contratación queda en estado *en curso* con fecha y hora de inicio registradas.  
* Condición de falla: el estado permanece sin cambios por una transición inválida.

##### ***UC21: Responder propuesta de prestador*** {#uc21:-responder-propuesta-de-prestador}

**Nombre:** Responder propuesta de prestador.  
**Breve descripción:** Describe cómo un cliente acepta o rechaza la propuesta enviada por un prestador (fecha, franja horaria y precio estimado de mano de obra), resolviendo la contratación que se encuentra en estado *presupuestada* a la espera de su decisión.

**Actores:** Cliente (actor primario).  
**Precondiciones:** El actor está autenticado (UC02). Existe una contratación en estado *presupuestada* con una propuesta del prestador registrada y pendiente de respuesta por parte del cliente.  
**Flujo básico de eventos:**

1. El cliente abre la contratación con propuesta pendiente.  
2. El sistema muestra el detalle de la propuesta del prestador (fecha, franja horaria y precio estimado de mano de obra) y ofrece las acciones: aceptar o rechazar.  
3. El cliente selecciona aceptar.  
4. El sistema solicita a la gestión de estados (UC09) la transición de *presupuestada* a *confirmada*.  
5. La notificación al prestador la genera UC19 al registrarse el cambio de estado. El caso de uso finaliza con éxito.

**Flujos alternativos:**  
3.1 Rechazar la propuesta. Si en el paso 3 el cliente rechaza, entonces:

1. El sistema solicita a UC09 la transición de *presupuestada* a *cancelada*.  
2. El caso de uso finaliza con éxito en estado *cancelada*.

4.1 Transición inválida. Si en el paso 4 la contratación ya no se encuentra en estado *presupuestada*, entonces:

1. UC09 rechaza la transición y el sistema informa que la propuesta ya no puede responderse.  
2. El caso de uso finaliza con una condición de falla.

**Escenarios clave:** Aceptación de la propuesta con transición *presupuestada* → *confirmada* y notificación al prestador; rechazo de la propuesta con transición *presupuestada* → *cancelada*.  
**Requisitos especiales:**

* RF-6.9 (el cliente puede aceptar o rechazar la propuesta del prestador cuando la contratación está en estado *presupuestada*).

**Postcondiciones:**

* Finalización exitosa: la contratación queda en estado *confirmada* (aceptar) o *cancelada* (rechazar).  
* Condición de falla: el estado permanece sin cambios por una transición inválida.

### ***11.b. Diseño Arquitectónico*** {#11.b.-diseño-arquitectónico}

El diseño arquitectónico se desarrolla dentro de la Fase de Elaboración del proceso adoptado en el punto 5, como concreción de la tarea “*Envision the Architecture”* de OpenUP, cuyo propósito es estabilizar la arquitectura base del sistema con suficiente detalle para comunicar la arquitectura al equipo de desarrollo y como principal mecanismo de mitigación del riesgo técnico, esta arquitectura irá evolucionando a medida que el desarrollo continúa y (Eclipse Foundation, 2012).  
La selección entre arquitecturas alternativas aplica el Método de Análisis de Compromisos Arquitectónicos (ATAM) definido en el meta-modelo de la disciplina de Diseño (punto 8); los atributos de calidad se nombran según el modelo ISO/IEC 25010 adoptado en el punto 10, manteniendo la comparabilidad con los RNF priorizados en 4.a.  
La estructura de cada alternativa se documenta mediante la **vista lógica** del modelo 4+1 de Kruchten (1995), apoyada en la vista de casos de uso ya presentados en 11.a.

##### ***Arquitecturas alternativas propuestas*** {#arquitecturas-alternativas-propuestas}

A partir de los RNF priorizados en 4.a (principalmente seguridad y fiabilidad (RNF-S), eficiencia de desempeño (RNF-E) y mantenibilidad (RNF-M)) y del tipo de aplicación identificado, un sistema de procesamiento de transacciones con acceso compartido a una base de datos (Sommerville, 2016, pp. 185-187), se proponen tres arquitecturas alternativas.   
Las tres alternativas comparten la capa de presentación (aplicación de página única en Next.js \+ React bajo el patrón MVC), se diferencian en la organización de la capa de aplicación y en el tratamiento de las integraciones con sistemas externos (pasarela de pagos, mensajería, organismo regulador). Cada alternativa se documenta con su vista lógica.

**Alternativa A: Monolito en capas (Capas \+ MVC):** Organiza el backend NestJS como un único desplegable estructurado en tres capas (presentación, aplicación/lógica de negocio y acceso a datos) sobre un esquema PostgreSQL único, con Redis como caché de consultas frecuentes. Los módulos de negocio invocan **directamente** a los proveedores externos. Combina los patrones *por Capas* y *Cliente-Servidor*, con *MVC* en el cliente. 

* **Prioriza** la simplicidad, el tiempo de puesta en marcha, la modularidad interna (RNF-M.1, RNF-M.2) y la facilidad para ser implementada con los micro-incrementos de OpenUP.  
* **Sacrifica** la sustituibilidad de proveedores (RNF-M.4: un cambio de proveedor impacta el módulo de negocio), el escalado independiente por módulo (RNF-E.2) y el aislamiento de fallos.

**![][image34]**

*Figura Nx — Vista lógica · Alternativa A: Monolito en capas (Capas \+ MVC)*

**Alternativa B: Monolito modular \+ Broker (Puertos y Adaptadores).** Conserva el desplegable único y la estructura en capas de la Alternativa A, pero introduce una **capa de integración** en la que cada proveedor externo queda detrás de un adaptador que implementa un puerto (interfaz estable) del módulo de negocio, y antepone una fachada REST a los módulos. Combina *Capas* \+ *Cliente-Servidor* \+ *Broker* (Buschmann et al., 1996\) \+ *MVC*; el desacople por puertos es la aplicación del principio de inversión de dependencias a nivel arquitectónico. 

* **Prioriza** la sustituibilidad de proveedores (RNF-M.4: reemplazar una integración en ≤ 40h sin modificar la lógica de negocio), la seguridad (RNF-S: aísla las integraciones y acota las partes del sistema propensas a un ataque) y conserva la simplicidad operativa y el alto tiempo de actividad propios de un monolito (RNF-S.5).   
* **Sacrifica** simplicidad estructural y mantiene el escalado acoplado al desplegable único.

**![][image35]**

*Figura Nx — Vista lógica · Alternativa B: Monolito modular \+ Broker (Puertos y Adaptadores)*

**Alternativa C: Microservicios orientados a eventos.** Descompone cada dominio en un servicio independiente con su propia base de datos (*database-per-service*), expuestos tras un *API Gateway*, con comunicación asíncrona a través de un bus de eventos. Combina *Microservicios* \+ *Event-Driven* \+ *Broker* \+ *API Gateway*. 

* **Prioriza** el escalado y el despliegue independientes por servicio, haciendo uso eficiente de los recursos (RNF-E.2) y el aislamiento de fallos y de seguridad por dominio.   
* **Sacrifica** la simplicidad y el tiempo de actividad operacional (más piezas móviles y consistencia eventual, que complica las transacciones de pago ACID exigidas por RNF-S.5), además, tiene un costo de operación elevado para un equipo pequeño. 

**![][image36]**

*Figura Nx — Vista lógica · Alternativa C: Microservicios orientados a eventos (Event-Driven \+ API Gateway \+ Broker)*

##### ***Patrones arquitectónicos considerados (Buschmann, 1996\)*** {#patrones-arquitectónicos-considerados-(buschmann,-1996)}

Las arquitecturas anteriores se construyen combinando patrones del catálogo *Pattern-Oriented Software Architecture* (Buschmann et al., 1996\) y de la lista de patrones comunes para sistemas de información de Sommerville (2016, pp. 176-182). Cada patrón se describe con su intención, el atributo de calidad ISO/IEC 25010 que favorece y el que penaliza, y su uso en el caso de estudio.

| Patrón | Intención / cuándo usarlo | Favorece  | Penaliza  | Uso en el caso |
| :---- | :---- | :---- | :---- | :---- |
| **Capas (Layers)** | Organizar el sistema en capas con responsabilidades crecientes; cada capa usa servicios de la inferior. | Mantenibilidad, portabilidad (RNF-M.1, RNF-M.2) | Eficiencia de desempeño: la indirección entre capas agrega latencia (RNF-E.1) | Estructura base de las tres alternativas (presentación / negocio / datos). |
| **Cliente-Servidor** | Distribuir funcionalidad entre proveedores de servicios y consumidores sobre la red. | Eficiencia (distribución de carga), escalabilidad | Eficiencia dependiente de la red; complejidad de gestión | Aplicación (cliente) ↔ backend (servidor) vía API REST en todas las alternativas. |
| **MVC** | Separar presentación, lógica e interacción en la capa de cliente. | Usabilidad y mantenibilidad de la interfaz (RNF-A.1, RNF-A.2) | Sobrecarga para interfaces triviales | Frontend Next.js \+ React. |
| **Broker (Puertos y Adaptadores)** | Mediar entre componentes desacoplando a los clientes de la implementación concreta de un servicio. | Mantenibilidad (RNF-M.4), seguridad (RNF-S: aísla integraciones) | Eficiencia (Wrapper), complejidad estructural | Capa de integración de la Alternativa B; *API Gateway* \+ bus de la Alternativa C. |
| **Repositorio (Repository)** | Centralizar el acceso a datos compartidos de forma consistente. | Fiabilidad: transacciones atómicas para pagos y reservas (RNF-S.5) | Acoplamiento al esquema; punto único de contención | PostgreSQL como repositorio transaccional (Alternativas A y B). |

##### ***Escenarios de evaluación*** {#escenarios-de-evaluación}

*Escenarios importantes para el caso de estudio a utilizar en la evaluación.*  
Siguiendo el primer paso del método ATAM (punto 8), los atributos de calidad se concretan en **escenarios de calidad** verificables. Un escenario de calidad se especifica con seis elementos (Bass, Clements y Kazman): fuente del estímulo, estímulo, artefacto afectado, entorno, respuesta y medida de la respuesta. Los escenarios se organizan en un árbol de utilidad por característica de ISO/IEC 25010 y se priorizan según su importancia para el negocio y su dificultad arquitectónica. Los escenarios seleccionados constituyen los requisitos arquitectónicamente significativos del sistema y derivan de los casos de uso de 11.a y de los RNF de 4.a.

| \# | Escenario | Característica ISO/IEC 25010 | Estímulo  | →  | Respuesta (medida) | RNF | Prioridad |
| :---: | ----- | ----- | ----- | :---: | ----- | :---: | :---: |
| **E1** | Búsqueda concurrente de prestadores | Eficiencia de desempeño | 100 usuarios buscan en simultáneo | → | Resultados servidos en ≤ 2 segundos (p95); con ≤ 70% de utilización de CPU/memoria | RNF-E.1, RNF-E.2 | Alta |
| **E2** | Pago de un servicio | Seguridad \+ Fiabilidad | El cliente paga | → | Transacción atómica (ACID), datos sensibles cifrados, disponibilidad ≥ 99,5% mensual | RNF-S.1, RNF-S.2, RNF-S.5 | Alta |
| **E3** | Sustitución de la pasarela de pagos | Mantenibilidad | El negocio decide cambiar de proveedor de pagos | → | Integración reemplazada en ≤ 40 horas sin modificar la lógica de negocio | RNF-M.4 | Alta |
| **E4** | Alta de una nueva categoría de servicio | Mantenibilidad | Se incorpora una categoría | → | Operativa con ≤ 8 horas de desarrollo | RNF-M.1 | Media |
| **E5** | Suspensión por habilitación vencida | Seguridad | Se detecta una habilitación vencida (varía dependiendo el tipo de habilitación). | → | Suspensión del prestador de forma automatizada en ≤ 24 horas. | RNF-S.8 | Media |

**Paso 3: Análisis por escenario y atributo de calidad.**

##### ***Selección y evaluación de la arquitectura*** {#selección-y-evaluación-de-la-arquitectura}

La evaluación aplica las cinco actividades del método ATAM definidas en el punto 8\. Los escenarios priorizados (paso 1\) y las arquitecturas candidatas (paso 2\) ya quedaron establecidos en las subsecciones anteriores. El paso 3 analiza cómo responde cada alternativa a cada escenario; los pasos 4 y 5 identifican los puntos sensibles y los puntos de compromiso. La valoración es cualitativa, siguiendo el siguiente sistema de colores, apropiada para una evaluación inicial en papel:

|  | Favorable |
| :---- | :---: |
|  | Aceptable |
|  | Desfavorable |

| Escenario (atributo) | A: (Monolito en capas) | B: Monolito modular \+ Broker | C: Microservicios |
| :---- | :---: | :---: | :---: |
| E1: Búsqueda concurrente (eficiencia) | \~ (escalado vertical \+ caché) | \~ (escalado vertical \+ caché) | \+ (escalado horizontal por servicio) |
| E2: Pago de servicio (seguridad \+ fiabilidad) | \+ (ACID en esquema único) | \+ (ACID \+ integraciones aisladas) | − (transacción distribuida, consistencia eventual) |
| E3: Sustituir pasarela (mantenibilidad) | − (acoplamiento directo al proveedor) | \+ (adaptador detrás de un puerto) | \+ (servicio aislado) |
| E4: Nueva categoría (mantenibilidad) | \+ (módulo interno) | \+ (módulo interno) | \~ (coordinación entre servicios) |
| E5: Suspensión por vencimiento (seguridad) | \+ | \+ | \+ |
| Restricción: Simplicidad y costo operativo (equipo pequeño, 4.d) | \+ | \+ | − (sobrecarga operacional alta) |
| Totales | Favorables: 4Aceptables: 1Desfavorables: 1 | Favorables: 5Aceptables: 1Desfavorables: 0 | Favorables: 3Aceptables: 1Desfavorables: 2 |

**Paso 4: Puntos sensibles (sensitivity points).**  
Elementos arquitectónicos en los que una variación afecta significativamente a un atributo de calidad:

1. El **número de réplicas/instancias del backend**, sensible a la eficiencia bajo concurrencia (E1, RNF-E.2);  
2. La **capa de integración con proveedores externos**, sensible a la mantenibilidad (E3, RNF-M.4);  
3. La **estrategia de consistencia de datos** (transacción única frente a transacción distribuida), sensible a la fiabilidad de los pagos (E2, RNF-S.5);  
4. La **capa de cifrado y validación**, sensible a la seguridad (E2, RNF-S.1/S.2).

**Paso 5: Puntos de compromiso (tradeoff points).**  
Elementos sensibles a más de un atributo simultáneamente:

1. La **granularidad del despliegue** (monolitos A,B frente a microservicios C)  
* Favorable: mejora la eficiencia y el escalado.  
* Desfavorable: degrada la fiabilidad/tiempo de actividad y la simplicidad operativa.   
2. La **capa de cifrado y validación** (seguridad frente a rendimiento)  
* Favorable: refuerza la seguridad.  
* Desfavorable: Incrementa la latencia y el tiempo de respuesta.

**Arquitectura seleccionada: Alternativa B (Monolito modular \+ Broker)**  
Se selecciona esta arquitectura ya que la misma supera a las demás en los escenarios de prioridad alta sin incurrir en el costo de la alternativa C (Microservicios orientados a eventos).  
Esta alternativa presenta el mejor rendimiento en E2 (transacciones ACID en un esquema único, integraciones aisladas) y en E3 (sustitución de proveedor detrás de un puerto), donde la alternativa A (Capas \+ MVC) es claramente deficiente. Frente a la alternativa A, su única desventaja es una complejidad estructural moderada, la cual es justificada por RNF-M.4 (requisito obligatorio en 4.a).  
El punto de compromiso de la granularidad del despliegue se resuelve a favor del monolito modular porque, para este caso, el tiempo de actividad y la simplicidad operativa (RNF-S.5 y los rasgos del equipo definidos en 4.d) pesan más que el escalado independiente; este último puede diferirse e introducirse de forma evolutiva si es necesario.

**Documentación de Architecture Decision Records (ADRs)**  
La arquitectura seleccionada y sus fundamentos se registran como *Architecture Decision Records* (ADR), siguiendo el formato ligero propuesto por Nygard (2011) y documentado en Pressman y Maxim (2020, p. 186): **título, estado, contexto, decisión y consecuencias**, persistidos en la Memoria Persistente del pipeline SDD (punto 5\) para su consumo en la Fase de Construcción.  
Como mecanismos arquitectónicos transversales (Eclipse Foundation, 2012\) se fijan: **persistencia** (ORM sobre PostgreSQL, caché en Redis), **seguridad** (OAuth2/JWT, cifrado TLS en tránsito y en reposo, principio de mínimo privilegio), **comunicación** (API REST interna y adaptadores hacia proveedores externos) y **manejo de errores y reintentos**.

#### **ADR-01: Estilo arquitectónico** {#adr-01:-estilo-arquitectónico}

| Título | Estilo Arquitectónico | ADR \# | 1 |
| ----: | :---- | ----: | :---: |
| **Estado** | Aceptada en Fase de Elaboración |  |  |
| **Contexto** | El producto es un sistema de procesamiento de transacciones con acceso compartido a una base de datos. Entre los RNF de prioridad alta pesan la disponibilidad y la simplicidad operativa (RNF-S.5). La evaluación ATAM identificó la **granularidad del despliegue** (monolito frente a microservicios) como punto de compromiso: los microservicios mejoran el escalado y la eficiencia, pero degradan la fiabilidad, el tiempo de actividad y la simplicidad, con un costo operativo desproporcionado para el equipo de desarrollo. En el escenario E2 (pago), la consistencia ACID sobre un esquema único supera a la transacción distribuida. |  |  |
| **Decisión** | Se adopta un **monolito modular estructurado en capas** (*Capas* \+ *Cliente-Servidor*), como un único desplegable. |  |  |
| **Consecuencias** | Despliegue y operación simples y alto tiempo de actividad (RNF-S.5), coherentes con los micro-incrementos de OpenUP y la utilización para contexto al pipeline SDD (un solo desplegable, un solo lenguaje). En contrapartida, el escalado horizontal queda acoplado al desplegable único; podrá introducirse de forma evolutiva si se requiere. |  |  |

#### 

#### **ADR-02: Integración con sistemas externos** {#adr-02:-integración-con-sistemas-externos}

| Título | Integración con sistemas externos | ADR \# | 2 |
| ----: | :---- | ----: | :---: |
| **Estado** | Aceptada en Fase de Elaboración |  |  |
| **Contexto** | El sistema integra proveedores externos volátiles (pasarela de pagos, mensajería, organismo regulador). El RNF-M.4 exige sustituir un proveedor en ≤40 h sin modificar la lógica de negocio, y la **capa de integración** es un punto sensible para la mantenibilidad. |  |  |
| **Decisión** | A cada proveedor externo se accede mediante **puertos y adaptadores** (patrón *Broker*; Buschmann et al., 1996), con una fachada REST entre los módulos. |  |  |
| **Consecuencias** | Sustituibilidad de proveedores en ≤ 40 horas (RNF-M.4), aislamiento de las integraciones y menor superficie de ataque (RNF-S). El costo es una mayor complejidad estructural. |  |  |

#### **ADR-03: Persistencia** {#adr-03:-persistencia}

| Título | Persistencia | ADR \# | 3 |
| ----: | :---- | ----: | :---: |
| **Estado** | Aceptada en Fase de Elaboración |  |  |
| **Contexto** | El núcleo de contratación y pagos exige transacciones atómicas ACID y disponibilidad ≥ 99,5% mensual (RNF-S.5). La **estrategia de consistencia de datos** es un punto sensible para la fiabilidad de los pagos la transacción distribuida con consistencia eventual se descartó por complicar los pagos ACID. En paralelo, el escenario E1 exige búsquedas concurrentes en ≤ 2 segundos (RNF-E.1). |  |  |
| **Decisión** | **Repositorio transaccional único en PostgreSQL** (patrón *Repository*) para el núcleo de contratación y pagos, con **Redis** como caché de consultas frecuentes. |  |  |
| **Consecuencias** | Fiabilidad de los pagos por atomicidad ACID (RNF-S.5) y eficiencia de las búsquedas frecuentes vía caché (RNF-E.1). Introduce acoplamiento al esquema y un punto único de contención. |  |  |

##### 

### ***11.c. Diseño Detallado*** {#11.c.-diseño-detallado}

El diseño detallado concreta la tarea *Design the Solution* de OpenUP, donde se describen los elementos del sistema de modo que realicen el comportamiento requerido y encajen dentro de la arquitectura ya definida (Eclipse Foundation, 2012). Toma como entradas la arquitectura seleccionada en 11.b y las especificaciones de casos de uso de 11.a, y produce el modelo de diseño. Los patrones de diseño refinan los componentes de la arquitectura: no reorganizan el sistema, sino que distribuyen responsabilidades sobre las clases del dominio ya identificadas.

##### ***Patrones de Diseño considerados (Gamma et al., 1994\)*** {#patrones-de-diseño-considerados-(gamma-et-al.,-1994)}

Los patrones se clasifican por propósito en creacionales, estructurales y de comportamiento, y se describen mediante cuatro elementos esenciales: nombre, problema, solución y consecuencias (Gamma et al., 1994). La tabla los instancia sobre las clases del dominio del caso, indicando qué decisión arquitectónica de 11.b refina cada uno.

| Patrón (categoría) | Problema en el dominio | Solución (roles concretos) | Consecuencias | Refina / sirve a |
| ----- | ----- | ----- | ----- | ----- |
| **State** (comportamiento) | El comportamiento de la contratación depende de su estado. | **Context:**Contratacion;  **State:**EstadoContratacion **ConcreteState:** Solicitada, Confirmada, EnCurso, Finalizada, Cancelada. | Elimina los condicionales sobre el estado; cada estado encapsula sus transiciones válidas. | Módulo Contratación y Estados (RF-6); Máquina de estados de UC09. |
| **Observer** (comportamiento) | Avisar a ambas partes ante cada cambio de estado sin acoplar a los receptores. | **Subject:** Contratacion **Observer:** Observador **ConcreteObserver**: NotificadorCliente, NotificadorPrestador. | Desacopla emisor y receptores; permite notificación incondicional a múltiples interesados. | Realiza el «include» UC09 (“Gestionar estados de la contratación”) → UC19 (“Notificar cambio de estado”) (RF-6.5). |
| **Adapter** (estructural)  \+ **Factory** (creacional) | Aislar las API de proveedores externos intercambiables (pagos, mensajería) tras una interfaz estable. | **Target:** PasarelaPago **Adapter:** AdaptadorMercadoPago **Adaptee:** SDK del proveedor **Factory:** FabricaPasarela | Sustituir un proveedor es un cambio local (RNF-M.4); agrega una indirección. | Realiza la capa Broker del ADR-02. |
| **Strategy** (comportamiento) | Algoritmos intercambiables para: orden de búsqueda, política de cancelación. | **Context:** BuscadorPrestadores; **Strategy:** EstrategiaRanking; **ConcreteStrategy:** RankingPorCercania, RankingPorReputacion, RankingPorPrecio. | El algoritmo varía en tiempo de ejecución, independiente del cliente. | Catálogo de UC04 (“Buscar prestadores”); UC10 (“Cancelar contratación”). |
| **Facade** (estructural) | Ofrecer un punto de entrada unificado y simplificado a los módulos del backend. | **Facade:** fachada REST / API Gateway interno de la arquitectura. | Reduce el acoplamiento entre el cliente y el subsistema; da soporte natural a la arquitectura en capas. | Frontera entre presentación ↔ aplicación de la arquitectura . |

Aplicamos los patrones seleccionados en los siguientes diagramas, dichos diagramas usan los roles concretos del dominio, no los nombres genéricos del catálogo.

![][image37]

*Figura Nx — Clases de diseño · Patrones State y Observer sobre Contratación*

**![][image38]**

*Figura Nx — Clases de diseño · Patrón Adapter (+ Factory) en la capa de integración*

**![][image39]**

*Figura Nx — Clases de diseño · Patrón Strategy (orden de resultados de búsqueda)*

##### ***Modelos de diseño detallado*** {#modelos-de-diseño-detallado}

Conforme al proceso de diseño orientado a objetos de Sommerville (2016, cap. 7), el diseño se documenta con **modelos estructurales** (diagramas de clases, ya presentados en la subsección anterior con los roles de cada patrón) y **modelos dinámicos** (diagramas de secuencia y de máquina de estados). Siguiendo el punto 5, el modelado dinámico se reserva para los módulos críticos.

La **máquina de estados** de la contratación da soporte al patrón State y fija las transiciones válidas. Toda transición dispara una notificación al cliente y prestador involucrados.(UC19, «include» UC09).

![][image40]  
*Figura Nx — Máquina de estados · Ciclo de vida de la Contratación*   
Los **diagramas de secuencia** detallan los dos flujos más críticos: el pago de un servicio (UC12), donde se observan en colaboración los patrones Adapter y Factory y los flujos alternativos de rechazo y de falta de respuesta de la pasarela; y la notificación de cambio de estado (UC09 → UC19), donde colaboran State y Observer.

**![][image41]**

*Figura Nx — Secuencia · Pago de un servicio (UC12)*  
![][image42]

*Figura Nx — Secuencia · Notificación de cambio de estado (UC09 → UC19)*

#### **Artefacto Interfaz** {#artefacto-interfaz}

Las **interfaces** de las operaciones críticas se especifican con OCL (Object Constraint Language), definiendo precondiciones y postcondiciones verificables sin exponer la implementación (Sommerville, 2016, cap. 7); estas restricciones se traducen en aserciones de los tests automatizados de 11.d.

context Contratacion::aceptar()

pre:  self.estado.oclIsTypeOf(Solicitada)

post: self.estado.oclIsTypeOf(Confirmada)

and self.observadores-\>forAll(o | o.notificado)

context ModuloPagos::pagar(c : Contratacion)

pre:  c.estado.oclIsTypeOf(Confirmada) and c.pago-\>isEmpty()

post: result.aprobado implies c.pago.estado \= 'retenido'

### ***11.d. Proyección del Desarrollo***

La proyección del desarrollo cierra la Parte II: organiza la construcción del producto sobre la arquitectura seleccionada en 11.b (monolito modular \+ Broker) y el diseño detallado de 11.c, instanciando el ciclo de vida del proceso híbrido del punto 6, confirmando el marco tecnológico tentativo del punto 10 y materializando la disciplina de Verificación y Validación del punto 9\. Se apoya en las tareas de OpenUP *Plan the Project*, *Plan Iteration*, *Manage Iteration* y *Develop Solution Increment* (Eclipse Foundation, 2012).

#### **Planificación de ciclos de desarrollo**

El desarrollo se organiza de forma iterativa e incremental en las cuatro fases de OpenUP, cada una compuesta por iteraciones de duración acotada que producen una versión funcional del sistema. El trabajo se gestiona desde una *Work Items List* única priorizada por **riesgo y valor** (*Risk-Value Lifecycle*): primero los elementos de mayor riesgo técnico junto con los de mayor valor para el usuario. Cada fase cierra con un **hito** (Boehm, 1996\) que actúa como compuerta de paso/falla; si el hito no se cumple, se ejecutan más iteraciones en la fase antes de avanzar.

| Fase | Objetivo | Contenido para el caso de estudio | Hito de salida (qué válida) |
| :---: | ----- | ----- | ----- |
| **Inicio** | Alcance y viabilidad | Visión, casos de uso del núcleo, lista de riesgos. | **LCO** (*Lifecycle Objectives*): acuerdo sobre alcance y objetivos; decisión de continuar o cancelar |
| **Elaboración** | Estabilizar la arquitectura | Arquitectura B (11.b), diseño detallado del núcleo (11.c), ADR-01/02/03, configuración de la memoria persistente y prueba de concepto ejecutable del flujo de pago | **LCA** (*Lifecycle Architecture*): arquitectura estable, ejecutable y riesgos críticos resueltos |
| **Construcción** | Construir el producto | Sprints de una semana; cada micro-incremento se diseña, implementa, prueba e integra mediante el pipeline SDD (Spec-Driven Development); requisitos funcionales priorizados por riesgo-valor; integración continua | **IOC** (*Initial Operational Capability*): funcionalidad completa, lista para transición (beta testing) |
| **Transición** | Entregar | Verificación final del producto integrado (clientes definido en punto 5), despliegue en *staging* y producción, documentación viva actualizada | **Product Release**: se decide si los objetivos se cumplieron y si iniciar un nuevo ciclo de desarrollo |

Conforme al proceso híbrido del punto 6, la Fase de Construcción organiza el trabajo en **Sprints de una semana** que contienen los micro-incrementos de OpenUP; el *Sprint Backlog* del ciclo se deriva de la *Work Item List*. En la tarea “Planeamiento de Iteración” se asignan los work items a completar durante el sprint.  
El **orden de prioridad por riesgo-valor** ubica primero los módulos de mayor riesgo técnico, que validan la arquitectura: **pagos (RF-7: UC12, UC13)** y la **máquina de estados de la contratación (RF-6: UC07–UC10, UC20, UC21)**, que ejercitan el patrón Adapter de ADR-02 y la persistencia ACID de ADR-03 sobre el ciclo de estados (*solicitada → presupuestada → confirmada → en curso → finalizada / cancelada*). En paralelo se desarrollan los módulos de alto valor temprano **autenticación y cuentas (RF-1)** y **búsqueda y catálogo (RF-2, RF-4)**, y posteriormente **reputación y moderación (RF-3)** y **verificación de habilitaciones (RF-8)**.

#### **Consideraciones de Implementación**

Teniendo en cuenta la arquitectura seleccionada, se confirma el conjunto tecnológico que el punto 10 había fijado como tentativo. Sobre la base de las cuestiones de implementación, se precisan los siguientes aspectos:

* **Reutilización de software**: A nivel de diseño, se adoptan patrones arquitectónicos (11.b) y patrones de diseño GoF (11.c). A nivel de objetos, se integran librerías del ecosistema TypeScript/NestJS. Además, se incorporan componentes NestJS, ORM y el SDK de la pasarela de pago consumido a través de un Adapter.   
* **Gestión de la configuración:** Versionado con Git y GitHub (GitHub, s.f.), ensamblado y compilación del sistema, gestión de cambios y de entregas, y seguimiento de incidencias. Las especificaciones ejecutables se versionan en paralelo con el código (práctica SDD), evitando la desincronización entre documentación y producto.  
* **Separación entre el entorno de desarrollo y el de ejecución (host-target):** El equipo programa en sus propias computadoras, con el editor Visual Studio Code (Microsoft, 2026c), y ejecuta el sistema sobre un entorno destino. Empaquetarlo con todas sus dependencias mediante contenedores.  
* **Software de código abierto y licencias:** Antes de incorporar una dependencia se revisa el tipo de licencia y se evalúa su compatibilidad con el producto.  
* **Integración continua:** El entorno de CI ejecuta la compilación, el análisis estático (revisión automática del código sin ejecutarlo, que detecta errores de estilo, errores comunes y posibles vulnerabilidades) y la batería de pruebas automatizadas (el conjunto de tests unitarios y de integración) como compuerta previa a la fusión a la rama principal, integrada con la revisión *Human-in-the-Loop* (Pull Request) del punto 5\.

La siguiente tabla confirma el rol de cada tecnología del punto 10 dentro de la arquitectura B y los patrones de 11.c:

| Capa / tecnología | Rol en la arquitectura / patrón | RNF que sostiene |
| ----- | ----- | ----- |
| Next.js \+ React \+ TypeScript (frontend) | Capa de presentación, patrón MVC | RNF-A.1, RNF-A.2 |
| NestJS \+ Node.js \+ TypeScript, API REST (backend) | Módulos de negocio \+ Facade (fachada REST) | RNF-M.1, RNF-M.2 |
| Capa de integración | Adapters \+ Factory (realiza ADR-02, Broker) | RNF-M.4, RNF-S |
| PostgreSQL | Repositorio transaccional ACID (ADR-03) | RNF-S.5 |
| Redis | Caché de consultas frecuentes | RNF-E.1, RNF-E.2 |
| Mercado Pago y proveedores externos | *Adaptee* detrás de un Adapter | RNF-S, RNF-M.4 |
| OAuth2/JWT, Argon2/bcrypt, TLS | Mecanismo transversal de seguridad | RNF-S.1, RNF-S.2, RNF-S.4 |

#### **Estrategias de Prueba del Software**

La estrategia de prueba aplica la disciplina de Verificación y Validación del punto 9 y se basa en los tipos de prueba de Sommerville (2016, cap. 8\) y en el principio de prueba concurrente de OpenUP, según el cual la prueba acompaña al desarrollo y no es una fase final (Eclipse Foundation, 2012).  
Se adopta el **testing automatizado** pero **no el Test-Driven Development estricto**: no se exige escribir las pruebas antes que el código para toda funcionalidad. Esta decisión se tomó y justificó basándonos principalmente en los rasgos del equipo.  
Los niveles de prueba se corresponden con los tres niveles de granularidad del meta-modelo de Verificación:

| Nivel | Qué prueba | Herramienta | Responsable | Granularidad (punto 9\) |
| :---: | ----- | ----- | ----- | ----- |
| **Unitaria** | Objetos y métodos individuales; las pre/postcondiciones OCL de 11.c se codifican como aserciones | Jest (OpenJS Foundation, 2026a) | Sub-agente Verificador | Por micro-incremento |
| **Integración** | Grupos de objetos y la API REST | Supertest (Lad, s.f.) | Entorno de CI/CD | Por *Work Item* |
| **Sistema / E2E** | Flujos completos sobre el producto integrado | Playwright (Microsoft, 2026a) | Tester (humano) | Al cierre del sprint |

**Cuestiones a tener en cuenta para el desarrollo:**

* **Pruebas basadas en escenarios** (*scenario testing*): los casos de prueba se derivan de los casos de uso de 11.a, cubriendo los flujos básicos y alternativos de, por ejemplo, el UC12 (Pagar servicio), los caminos de pago rechazado y de falta de respuesta de la pasarela).  
* **Pirámide de pruebas:** predominio de pruebas unitarias, una capa intermedia de pruebas de integración y un conjunto acotado de pruebas de sistema/E2E.  
* **Del diseño a las pruebas:** las condiciones que cada operación debe cumplir antes y después de ejecutarse, definidas en el diseño detallado (11.c) (por ejemplo, en Contratacion::aceptar() y ModuloPagos::pagar()`),` se convierten directamente en comprobaciones dentro de los tests. Del mismo modo, los criterios de aceptación de cada especificación se transforman en pruebas automáticas, alcanzando la cobertura que exige RNF-O.2 (≥90 % de los criterios en los módulos del núcleo).  
* **Pruebas de atributos de calidad (no funcionales):** los escenarios de evaluación de 11.b se reutilizan como base de pruebas no funcionales E1 (carga y desempeño, con pruebas de estrés para RNF-E.2) y E2 (seguridad y fiabilidad de pagos).  
* **Compuerta de calidad:** la *Definition of Done* exige cobertura de tests, revisión de código y especificación actualizada antes de marcar un *Work Item* como terminado. La **verificación cruzada** (punto 5\) distingue dos planos: el Sub-agente Verificador valida que el código cumpla la especificación, y el desarrollador humano valida que la especificación capture la intención del usuario, mediante la compuerta Human-in-the-Loop previa a la fusión a la rama principal.  
* **Validación con el usuario:** al no existir un cliente externo, el rol de usuario lo asumen integrantes del equipo, que realizan la validación incremental al cierre de cada iteración y la aceptación final en la Fase de Transición, sin una ceremonia de *Sprint Review* separada.

#### 

#### **Work Item List**

***Aclaración***: Están resaltados en color lila los work items tomados para la primera iteración. 

| \# | Nombre / Descripción | Prioridad | Estado | Iteración objetivo | Material de referencia |
| :---: | ----- | :---: | :---: | :---: | :---: |
| **G1** | Acceso y gestión de cuentas (RF-1) |  |  |  | UC01 |
| **1.1** | UC01: Registrarse | 1 | Pendiente | 1 | UC02 |
| **1.2** | UC02: Autenticarse | 1 | Pendiente | 1 | UC03 |
| **1.3** | UC03: Gestionar perfil | 2 | Pendiente | 2 | UC17 |
| **1.4** | UC17: Gestionar perfiles (suspensión/baja) | 3 | Pendiente | 2 |  |
| **G2** | Catálogo, publicación y agenda (RF-2, RF-4) |  |  |  | UC04 |
| **2.1** | UC04: Buscar prestadores | 1 | Pendiente | 1 | UC05 |
| **2.2** | UC05: Publicar servicios | 1 | Pendiente | 2 | UC06 |
| **2.3** | UC06: Gestionar agenda y disponibilidad | 2 | Pendiente | 2 |  |
| **G3** | Contratación, ciclo de estados y mensajería (RF-5, RF-6) |  |  |  | UC07 |
| **3.1** | UC07: Solicitar contratación | 1 | Pendiente | 1 | UC08 |
| **3.2** | UC08: Enviar propuesta o rechazar solicitud | 1 | Pendiente | 1 | UC09 |
| **3.3** | UC09: Gestionar estados de la contratación | 1 | Pendiente | 1 | UC10 |
| **3.4** | UC10: Cancelar contratación | 2 | Pendiente | 3 | UC11 |
| **3.5** | UC11: Intercambiar mensajes | 3 | Pendiente | 3 | UC19 |
| **3.6** | UC19: Notificar cambio de estado | 2 | Pendiente | 3 | UC20 |
| **3.7** | UC20: Iniciar servicio | 1 | Pendiente | 3 | UC21 |
| **3.8** | UC21: Responder propuesta de prestador | 2 | Pendiente | 3 |  |
| **G4** | Pagos y liberación (RF-7) |  |  |  | UC12 |
| **4.1** | UC12: Pagar servicio | 1 | Pendiente | 2 | UC13 |
| **4.2** | UC13: Confirmar finalización y liberar pago | 2 | Pendiente | 2 |  |
| **G5** | Reputación y moderación (RF-3) |  |  |  | UC14 |
| **5.1** | UC14: Calificar prestador | 2 | Pendiente | 3 | UC15 |
| **5.2** | UC15: Responder reseña | 2 | Pendiente | 3 | UC16 |
| **5.3** | UC16: Moderar reseñas | 2 | Pendiente | 3 |  |
| **G6** | Verificación de habilitaciones (RF-8) |  |  |  | UC18 |
| **6.1** | UC18: Verificar habilitaciones profesionales | 3 | Pendiente | 3 |  |

#### **Roles Asignados para la primera iteración**

| Rol | Inicio | Elaboración | Costrucción | Transición |
| ----- | ----- | ----- | ----- | :---: |
| **Administrador de Proyecto** | A. Pirovani | A. Pirovani | A. Pirovani | **\-** |
| **Arquitecto** | Todos | G. Hillebrand y T. Nieto | G. Hillebrand | **\-** |
| **Analista** | Todos | L. Lezcano, M. Romero y M. Dos Santos | A. Pirovani | **\-** |
| **Desarrollador** | **\-** | **\-** | M. Romero, G. Hillebrand y T. Nieto | **\-** |
| **Tester** | **\-** | **\-** | L. Lezcano y M. Dos Santos | **\-** |

##### ***Aclaraciones:*** 

* En inicio todos los integrantes participan como Arquitectos y Analistas para definir tanto el alcance como la visión del sistema de forma colaborativa.

#### **Planificación del Desarrollo del Sprint N°1**

**Fecha de Inicio:** 12/06/2026  
**Fecha de Fin:** 16/06/2026  
**Objetivo del Sprint:** Obtener una primera iteración funcional en los casos de uso 1, 2, 4, 7, 8 y 9\. 

#### **Sprint Backlog** 

**MI:** Micro-incremento			  
**Orden de ejecución:**

* Se desarrollan primero los modelos de datos (MI-01.1, MI-04.1, MI-07.1, MI-09.1) antes de los endpoints.  
* Se desarrollan los endpoints antes que las UIs.  
* De esta manera, cada pipeline tiene el contexto de lo que integra.		

**Aclaración Full-stack:** MI-07.2 y MI-08.2 agrupan el endpoint y la UI porque la lógica de presentación es dependiente del contrato de la API. Por lo tanto, separarlos generaría dos pipelines muy delgados sin valor entregable real por sí solos.

| Sprint \#1 |  |  |  |  |  |
| ----- | ----- | ----- | ----- | ----- | ----- |
| **\#** | **Nombre** | **Descripción** | **Capa** | **Encargado** | **Depende de** |
| **UC01** | Registrarse |  |  |  | \- |
| **MI-01.1** | Modelo y persistencia de usuario | Entidad usuario, validaciones de dominio, repositorio y migración de base de datos | Backend | Romero | \- |
| **MI-01.2** | Endpoint de registro | POST /auth/register con validación, hashing de contraseña y respuesta con token | Backend | Romero | MI-01.1 |
| **MI-01.3** | UI formulario de registro | Pantalla de registro con campos, validaciones en cliente e integración con endpoint | Frontend | Romero | MI-01.2 |
| **MI-01.4** | Integración del work item al producto de sprint |  | Integración | Romero | MI-01.1, MI-01.2, MI-01.3 |
| **UC02** | Autenticarse |  |  |  | UC01 |
| **MI-02.1** | Lógica de autenticación y JWT | Validación de credenciales, generación y verificación de tokens JWT, manejo de sesión | Backend | Hillebrand | MI-01.1 |
| **MI-02.2** | UI login y manejo de sesión | Pantalla de login, almacenamiento de token, redirección por rol y logout | Frontend | Hillebrand | MI-02.1 |
| **MI-02.3** | Integración del work item al producto de sprint |  | Integración | Hillebrand | MI-02.1, MI-02.2 |
| **UC4** | Buscar Prestadores |  |  |  | \- |
| **MI-04.1** | Modelo y repositorio de prestador | Entidad Prestador, atributos de perfil, repositorio con consultas de búsqueda y filtrado | Backend | Nieto | \- |
| **MI-04.2** | Endpoint de búsqueda y filtros | GET /prestadores con parámetros de búsqueda por nombre, categoría, ubicación y disponibilidad | Backend | Nieto | MI-04.1 |
| **MI-04.3** | UI listado y perfil de prestador | Pantalla de resultados con filtros, tarjetas de prestador y vista de perfil detallado | Frontend | Nieto | MI-02.2, MI-04.2 |
| **MI-04.4** | Integración del work item al producto de sprint |  | Integración | Nieto | MI-04.1, MI-04.2, MI-04.3 |
| **UC07** | Solicitar contratación |  |  |  | UC01, UC04, UC09 |
| **MI-07.1** | Modelo y lógica de solicitud | Entidad Solicitud, estado inicial, relación con usuario y prestador, reglas de negocio | Backend | Pirovani | MI-01.1, MI-04.1 |
| **MI-07.2** | Endpoint crear solicitud y UI | POST /solicitudes, validaciones, notificación al prestador y formulario de solicitud en cliente | Full-stack | Pirovani | MI-02.2, MI-07.1, MI-09.1 |
| **MI-07.3** | Integración del work item al producto de sprint |  | Integración | Pirovani | MI-07.1, MI-07.2 |
| **UC08** | Enviar propuesta o rechazar solicitud |  |  |  | UC07, UC09 |
| **MI-08.1** | Lógica de propuesta y rechazo | Reglas de negocio para propuesta (precio, condiciones) y rechazo con motivo, validaciones de estado previo | Backend | Pirovani | MI-07.1, MI-09.1 |
| **MI-08.2** | Endpoints y UI de respuesta del prestador | PUT /solicitudes/:id/propuesta y /rechazar, pantalla de bandeja del prestador con acciones | Full-stack | Pirovani | MI-08.1, MI-09.2, MI-07.2 |
| **MI-08.3** | Integración del work item al producto de sprint |  | Integración | Pirovani | MI-08.1, MI-08.2 |
| **UC09** | Gestionar estados de la contratación |  |  |  | \- |
| **MI-09.1** | Máquina de estados de contratación | Definición de estados (pendiente → propuesta → aceptada → en curso → finalizada / cancelada), transiciones y guardas | Backend | Pirovani | \- |
| **MI-09.2** | Endpoints de transición de estado | PUT /contrataciones/:id/estado con validación de transición permitida y registro de historial | Backend | Pirovani | MI-09.1, MI-07.1 |
| **MI-09.3** | UI gestión y seguimiento | Panel de contrataciones activas, cambio de estado por rol (cliente / prestador) e historial de estados | Frontend | Pirovani | MI-09.2, MI-08.2, MI-02.2 |
| **MI-09.4** | Integración del work item al producto de sprint |  | Integración | Pirovani | MI-09.1, MI-09.2, MI-09.3 |
| **MI-10** | Integración del sprint al producto continuo |  | Integración | Todos | UC01, UC02, UC04, UC07, UC08, UC09 |
| **MI-11** | Verificación de la integración |  | Testing | Lezcano, Dos Santos | MI-10 |

# CONCLUSIONES {#conclusiones}

## 12\. Cumplimiento de los objetivos del trabajo {#12.-cumplimiento-de-los-objetivos-del-trabajo}

	Teniendo en cuenta los objetivos especificados al comienzo del documento de Trabajo Práctico Integrador, como equipo creemos que fue posible alcanzar (en mayor o menor medida) todos los objetivos propuestos:

* **Asimilar aspectos de diversidad en la ingeniería de software:** Se logró un análisis inicial de distintos procesos de desarrollo (tanto genéricos como específicos), definiendo cuáles de estos modelos son los más aptos para utilizar en nuestro escenario.  
* **Identificar y caracterizar sistemas de software.**  
* **Seleccionar sistemáticamente procesos para desarrollar productos software:** Se utilizó un análisis tanto cualitativo como cuantitativo para determinar los procesos más convenientes de aplicar al caso de uso, además de una definición estructurada y sistemática de los conceptos y características que se toman o se dejan de dichos procesos seleccionados.  
* **Asimilar aspectos inherentes a actividades fundamentales de la ingeniería del software en procesos de desarrollo.**  
* **Asimilar concepto de visibilidad de procesos de desarrollo. Construcción de meta-modelos:** Además de los meta-modelos especificados en las consignas del trabajo, se desarrollaron más meta-modelos a medida que fueron considerados necesarios (por ejemplo, para el pipeline SDD), con el objetivo de ser lo más claro posible al momento de describir el proceso a aplicar.  
* **Concebir, elaborar, proyectar y construir productos software de calidad:** Debido a la utilización de SDD como principal forma de desarrollo, podemos asegurarnos que el producto de software será de calidad, debido a que este proceso de desarrollo prioriza una especificación correcta y de buena calidad antes que parches y modificaciones directas en el código. Además, la gran cantidad de validaciones que debe completar una producción antes de ser considerada como terminada nos asegura que el código es de buena calidad.

## 13\. Limitaciones y trabajos futuros {#13.-limitaciones-y-trabajos-futuros}

##### ***Limitaciones generales*** {#limitaciones-generales}

	La principal limitación al momento de desarrollar el trabajo fue el tiempo, lo que ocasionó que no fuese posible realizar más de una iteración al momento de ejecutar el proceso de desarrollo global finalmente simplificado y/o adaptado.

##### ***Limitaciones de diseño, técnicas y operativas*** {#limitaciones-de-diseño,-técnicas-y-operativas}

Gran parte del esfuerzo al momento de definir el proceso de desarrollo por parte del equipo fue destinado a aprender, simplificar y adaptar el proceso SDD (pipeline), debido a ser una tecnología nueva tanto para el equipo como en general. Además, debido al auge de popularidad del desarrollo utilizando IA, se dificulta la búsqueda de documentación sobre el proceso de desarrollo de buena calidad. Gran parte de la utilización de IA como herramienta de soporte fue durante este proceso, tanto para buscar información general sobre SDD (para comprender el modelo de forma informal), como para recopilar posibles fuentes útiles para referenciar.

##### ***Limitaciones de herramientas y tecnologías propuestas*** {#limitaciones-de-herramientas-y-tecnologías-propuestas}

Una limitación derivada del uso de esta nueva tecnología fue, al momento de ejecutar el Sprint definido, ya que parte equipo del equipo de desarrollo nunca había utilizado las herramientas de apoyo para SDD, lo que implicó un proceso de aprendizaje de uso y configuración del entorno de desarrollo.  
Otra limitación es que no todo el equipo posee una suscripción de como mínimo un modelo de IA de pago, lo que limitó el número de integrantes que podían ser parte del equipo de desarrollo.

# Referencias {#referencias}

Anderson, D. J. (2010). \*Kanban: Successful evolutionary change for your technology business\*. Blue Hole Press.

Anomaly Innovations. (2026). \*OpenCode\* \[Software\]. GitHub. [https://github.com/sst/opencode](https://github.com/sst/opencode)

Atlassian. (s.f.). \*Trello\* \[Software\]. Recuperado el 30 de mayo de 2026, de [https://trello.com/](https://trello.com/)

Beck, K. y Andres, C. (2004). \*Extreme programming explained: Embrace change\* (2.ª ed.). Addison-Wesley.

Biryukov, A., Dinu, D., Khovratovich, D. y Josefsson, S. (2021). \*Argon2 Memory-Hard Function for Password Hashing and Proof-of-Work Applications\* (Request for Comments N.º 9106). Internet Research Task Force (IRTF). [https://datatracker.ietf.org/doc/html/rfc9106](https://datatracker.ietf.org/doc/html/rfc9106)

Böckeler, B. (15 de octubre de 2025). Understanding spec-driven development: Kiro, spec-kit, and Tessl. \*[MartinFowler.com](http://MartinFowler.com)\*. https://martinfowler.com/articles/exploring-gen-ai/sdd-3-tools.html

Boehm, B. (1998). Using the WINWIN Spiral Model: A case study. Computer, 31(7), 33–44.

Boehm, B. (1996). Anchoring the software process. IEEE Software, 13(4), 73–82.    
https://www.kiv.zcu.cz/\~brada/files/aswi/cteni/boehm1996anchoring.pdf

Buscaglia, A. (2026a). \*AI Gentle Stack\* (Versión 1.20.1) \[Software\]. GitHub. https://github.com/Gentleman-Programming/gentle-ai

Buscaglia, A. (2026b). \*Engram\* \[Software\]. GitHub. https://github.com/Gentleman-Programming/engram

Clickie. (s.f.). \*Clickie — Servicios a domicilio\*. Recuperado el 19 de abril de 2026, de https://clickie.com.ar/

Despa, M. L. (2014). Comparative study on software development methodologies. \*Database Systems Journal\*, \*5\*(3), 37-56.

Eclipse Foundation. (2012). *OpenUP v1.5.1.5*. [https://archive.eclipse.org/epf/downloads/OpenUP/published/openup\_published\_1.5.1.5\_20121212/openup/](https://archive.eclipse.org/epf/downloads/OpenUP/published/openup_published_1.5.1.5_20121212/openup/) 

Gane, C. y Sarson, T. (1979). \*Structured systems analysis: Tools and techniques\*. Prentice-Hall.

GitHub. (s.f.). \*GitHub\* \[Software\]. Recuperado el 30 de mayo de 2026, de [https://github.com/](https://github.com/)

Haerder, T. y Reuter, A. (1983). Principles of transaction-oriented database recovery. \*ACM Computing Surveys\*, \*15\*(4), 287-317. [https://doi.org/10.1145/289.291](https://doi.org/10.1145/289.291)

Hardt, D. (Ed.). (2012). \*The OAuth 2.0 Authorization Framework\* (Request for Comments N.º 6749). Internet Engineering Task Force (IETF). [https://datatracker.ietf.org/doc/html/rfc6749](https://datatracker.ietf.org/doc/html/rfc6749)

Home Solution. (s.f.). \*Home Solution\*. Recuperado el 19 de abril de 2026, de [https://www.homesolution.net/](https://www.homesolution.net/)

International Organization for Standardization. (2011). *Systems and software engineering — Systems and software Quality Requirements and Evaluation (SQuaRE) — System and software quality models* (ISO/IEC 25010:2011). ISO.

International Organization for Standardization. (2017). *Systems and software engineering — Vocabulary* (ISO/IEC/IEEE 24765:2017). ISO. 

Jacobson, I., Booch, G. y Rumbaugh, J. (2000). \*El proceso unificado de desarrollo de software\*. Addison-Wesley.

Johansson, C. & Bucanac, C. (1999). The V-Model. Editorial: University of Karlskrona/Ronneby. 

Jones, M., Bradley, J. y Sakimura, N. (2015). \*JSON Web Token (JWT)\* (Request for Comments N.º 7519). Internet Engineering Task Force (IETF). [https://datatracker.ietf.org/doc/html/rfc7519](https://datatracker.ietf.org/doc/html/rfc7519)

Kovács, T. Z., David, F., Nagy, A., Szűcs, I. y Nábrádi, A. (2021). An analysis of the demand-side, platform-based collaborative economy: Creation of a clear classification taxonomy. \*Sustainability\*, \*13\*(5), 2817\. [https://www.mdpi.com/2071-1050/13/5/2817](https://www.mdpi.com/2071-1050/13/5/2817)

Kim, G., Humble, J., Debois, P. y Willis, J. (2016). \*The DevOps handbook: How to create world-class agility, reliability, and security in technology organizations\*. IT Revolution Press.

Kruchten, P. (2003). *The rational unified process: An introduction* (3.ª ed.). Addison-Wesley. 

Kirkpatrick, A., O'Connor, J., Campbell, A. y Cooper, M. (Eds.). (2018). \*Web Content Accessibility Guidelines (WCAG) 2.1\* \[Recomendación W3C\]. World Wide Web Consortium (W3C). [https://www.w3.org/TR/WCAG21/](https://www.w3.org/TR/WCAG21/)

Lad. (s.f.). \*Supertest\* \[Software\]. GitHub. [https://github.com/ladjs/supertest](https://github.com/ladjs/supertest)

Ley N° 25.326, Protección de los Datos Personales. (4 de octubre de 2000). Boletín Oficial de la República Argentina. https://servicios.infoleg.gob.ar/infolegInternet/anexos/60000-64999/64790/norma.htm

Ley N° 27.078, Argentina Digital. (16 de diciembre de 2014). Boletín Oficial de la República Argentina. https://servicios.infoleg.gob.ar/infolegInternet/anexos/235000-239999/239771/norma.htm

MannoApp. (s.f.). \*MannoApp\*. Recuperado el 19 de abril de 2026, de https://www.mannoapp.com/

Mercado Libre. (s.f.). \*Servicios\*. Recuperado el 19 de abril de 2026, de https://servicios.mercadolibre.com.ar/

Mercado Pago. (s.f.). \*Mercado Pago\* \[Software\]. Recuperado el 30 de mayo de 2026, de [https://www.mercadopago.com.ar/](https://www.mercadopago.com.ar/)

Meta Platforms, Inc. (2025). \*React\* \[Software\]. GitHub. [https://github.com/facebook/react](https://github.com/facebook/react)

Microsoft. (2026a). \*Playwright\* \[Software\]. GitHub. [https://github.com/microsoft/playwright](https://github.com/microsoft/playwright)

Microsoft. (2026b). \*TypeScript\* \[Software\]. GitHub. [https://github.com/microsoft/TypeScript](https://github.com/microsoft/TypeScript)

Microsoft. (2026c). \*Visual Studio Code\* \[Software\]. [https://code.visualstudio.com/](https://code.visualstudio.com/)

Myśliwiec, K. (2026). \*NestJS\* \[Software\]. GitHub. [https://github.com/nestjs/nest](https://github.com/nestjs/nest)

n8n GmbH. (s.f.). \*n8n — Workflow automation tool\*. Recuperado el 19 de abril de 2026, de https://n8n.io/

Odoo S.A. (s.f.). \*Odoo — Open source ERP and CRM\*. Recuperado el 19 de abril de 2026, de https://www.odoo.com/

O'Leary, D. E. (2000). \*Enterprise resource planning systems: Systems, life cycle, electronic commerce and risk\*. Cambridge University Press.

OpenJS Foundation. (2026a). \*Jest\* \[Software\]. GitHub. [https://github.com/jestjs/jest](https://github.com/jestjs/jest)

OpenJS Foundation. (2026b). \*Node.js\* \[Software\]. [https://nodejs.org/](https://nodejs.org/)

PCI Security Standards Council. (2024). \*Payment Card Industry Data Security Standard\* (Versión 4.0.1). PCI Security Standards Council. [https://www.pcisecuritystandards.org/document\_library/](https://www.pcisecuritystandards.org/document_library/)

Piskala, D. B. (2026). Spec-driven development: From code to contract in the age of AI coding assistants. \*arXiv\*. https://arxiv.org/abs/2602.00180

PostgreSQL Global Development Group. (2026). \*PostgreSQL\* \[Software\]. [https://www.postgresql.org/](https://www.postgresql.org/)

Pressman, R. S. y Maxim, B. R. (2020). \*Software engineering: A practitioner's approach\* (9.ª ed.). McGraw-Hill.

Provos, N. y Mazières, D. (1999). A future-adaptable password scheme. En \*Proceedings of the 1999 USENIX Annual Technical Conference, FREENIX Track\* (pp. 81-91). USENIX Association. [https://www.usenix.org/legacy/events/usenix99/provos.html](https://www.usenix.org/legacy/events/usenix99/provos.html)

Qxm. (s.f.). \*Qxm — Presupuestos de profesionales\*. Recuperado el 19 de abril de 2026, de https://www.qxm.com.ar/

Rausch, Andreas & Bartelt, Christian & Ternité, Thomas & Kuhrmann, Marco. (2005). The V-Modell XT Applied–Model-Driven and Document-Centric Development. 

Redis Ltd. (2026). \*Redis\* \[Software\]. GitHub. [https://github.com/redis/redis](https://github.com/redis/redis)

Rescorla, E. (2018). \*The Transport Layer Security (TLS) Protocol Version 1.3\* (Request for Comments N.º 8446). Internet Engineering Task Force (IETF). [https://datatracker.ietf.org/doc/html/rfc8446](https://datatracker.ietf.org/doc/html/rfc8446)

Roques, A. (2026). \*PlantUML\* \[Software\]. GitHub. [https://github.com/plantuml/plantuml](https://github.com/plantuml/plantuml)

Sarker, I. H., Faruque, F., Hossen, U. y Rahman, A. (2015). A survey of software development process models in modern software engineering. \*International Journal of Software Engineering and Its Applications\*, \*9\*(11), 55-70.

Software Freedom Conservancy. (2026). \*Git\* \[Software\]. [https://git-scm.com/](https://git-scm.com/)

Sommerville, I. (2016). \*Software engineering\* (10.ª ed.). Pearson.

Stahl, T., Völter, M., Bettin, J., Haase, A., & Helsen, S. (2006). “Model-driven software development: Technology, engineering, management”. John Wiley & Sons. 

Stryker, C. (2025) ¿Qué es human-in-the-loop?. IBM Think [https://www.ibm.com/es-es/think/topics/human-in-the-loop](https://www.ibm.com/es-es/think/topics/human-in-the-loop)

Sveidqvist, K. (2026). \*Mermaid\* \[Software\]. GitHub. [https://github.com/mermaid-js/mermaid](https://github.com/mermaid-js/mermaid)

Szegedi, L. (2019). Digitális Platformok Mint A Sharing Economy Munkáltatói? Ars Boni. https://arsboni.hu/digitalis-platformok-mint-a-sharing-economy-munkaltatoi/

Vercel. (2026). \*Next.js\* \[Software\]. GitHub. [https://github.com/vercel/next.js](https://github.com/vercel/next.js)

VoidZero. (2026). \*Vitest\* \[Software\]. GitHub. [https://github.com/vitest-dev/vitest](https://github.com/vitest-dev/vitest)

Tegu. (s.f.). \*Tegu\*. Recuperado el 19 de abril de 2026, de https://tegu.com.ar/

Universidad Gastón Dachary. (s.f.). \*Ingeniería en Informática\*. Recuperado el 19 de abril de 2026, de [https://www.ugd.edu.ar/carreras/ingenieria-en-informatica](https://www.ugd.edu.ar/carreras/ingenieria-en-informatica)

Uzunova, N., Pavlič L.  y Beranič T (2024) Quality Gates in Software Development: Concepts, Definition and Tools. https://ceur-ws.org/Vol-3845/paper06.pdf

Whitten, J. L., Bentley, L. D. y Barlow, V. M. (1994). Systems analysis and design methods (3.ª ed.). Richard D. Irwin.

Zolvers. (s.f.). \*Zolvers\*. Recuperado el 19 de abril de 2026, de [https://www.zolvers.com](https://www.zolvers.com/)

## Anexo A: Profesiones y Regulaciones {#anexo-a:-profesiones-y-regulaciones}

A continuación se detalla, para cada profesión cubierta por la plataforma, la regulación aplicable en la provincia de Misiones y los organismos de validación correspondientes. La información se presenta agrupada por las categorías definidas en el Alcance de Servicios.

Las columnas de cada tabla son:

- **Habilitación obligatoria:** indica si existe una matrícula, licencia o registro legalmente exigido para ejercer la profesión en Misiones.  
- **Organismo regulador:** entidad nacional, provincial o municipal que emite o controla la habilitación.  
- **Normativa:** ley, decreto o resolución que sustenta el requisito.  
- **Validación en la plataforma:** mecanismo que la plataforma implementa para verificar al proveedor según su nivel de regulación.

### ***Instalaciones*** {#instalaciones}

8. ###### *Profesiones cubiertas para categoría “Instalaciones”.*

| Profesión | Habilitación obligatoria | Organismo regulador | Normativa | Validación en la plataforma |
| ----- | ----- | ----- | ----- | ----- |
| Gasista | Sí (matrícula de 1ra, 2da o 3ra categoría) | ENARGAS, tramitada ante GASNEA (distribuidora regional) | Ley Nacional 24.076; NAG-200 | Matrícula habilitante con vigencia. Vence el 31/03 de cada año. |
| Electricista (con título técnico) | Sí | CPIM (Consejo Profesional de Ingeniería de Misiones) | Ley Provincial I N.° 11 (ex 627/72) | Matrícula del CPIM vigente. |
| Electricista (idóneo, sin título) | No obligatoria | \-- | \-- | Autodeclaración \+ reputación. Para instalaciones nuevas que requieran conexión a EMSA se necesita profesional matriculado en el CPIM. |
| Plomero | No | \-- | \-- | Autodeclaración \+ reputación. Si el trabajo involucra gas (calefón, termotanque), requiere gasista matriculado. |

   

### ***Estructura y exterior*** {#estructura-y-exterior}

9. ###### *Profesiones cubiertas para categoría “Estructura y exterior”.*

| Profesión | Habilitación obligatoria | Organismo regulador | Normativa | Validación en la plataforma |
| ----- | ----- | ----- | ----- | ----- |
| Albañil | No | \-- | \-- | Autodeclaración \+ reputación. Para obras con permisos municipales, el plano debe ser firmado por profesional del CPIM. |
| Techista | No | \-- | \-- | Autodeclaración \+ reputación |
| Pintor | No | \-- | \-- | Autodeclaración \+ reputación |
| Vidriero | No | \-- | \-- | Autodeclaración \+ reputación |

### ***Espacios verdes*** {#espacios-verdes}

10. ###### *Profesiones cubiertas para categoría “Espacios verdes”.*

| Profesión | Habilitación obligatoria | Organismo regulador | Normativa | Validación en la plataforma |
| ----- | ----- | ----- | ----- | ----- |
| Jardinero | No | \-- | \-- | Autodeclaración \+ reputación. Si aplica agroquímicos, requiere habilitación bajo Ley Provincial 2980\. |
| Cortador de pasto | No | \-- | \-- | Autodeclaración \+ reputación |
| Fumigador / Control de plagas | Sí (habilitación provincial) | Ministerio de Ecología de Misiones, Dpto. de Control Ambiental | Ley Provincial 2980; Decreto 2867/93 | Número de habilitación provincial vigente como aplicador o empresa de control de plagas. |

    ######  {#heading}

### ***Hogar y limpieza*** {#hogar-y-limpieza}

11. ###### *Profesiones cubiertas para categoría “Hogar y limpieza”.* {#profesiones-cubiertas-para-categoría-“hogar-y-limpieza”.}

| Profesión | Habilitación obligatoria | Organismo regulador | Normativa | Validación en la plataforma |
| ----- | ----- | ----- | ----- | ----- |
| Empleado doméstico | No profesional; sí laboral para el empleador | ARCA (ex AFIP), Registro de Casas Particulares | Ley Nacional 26.844 | No se valida al trabajador. La plataforma informa al empleador su obligación legal de registro en ARCA. |
| Limpieza profunda | No | \-- | \-- | Autodeclaración \+ reputación |

### ***Climatización*** {#climatización}

12. ###### *Profesiones cubiertas para categoría “Climatización”.* {#profesiones-cubiertas-para-categoría-“climatización”.}

| Profesión | Habilitación obligatoria | Organismo regulador | Normativa | Validación en la plataforma |
| ----- | ----- | ----- | ----- | ----- |
| Técnico en aire acondicionado (doméstico) | No obligatoria; certificación recomendada | OPROZ (Oficina Programa Ozono) / IARAA | Protocolo de Montreal; Enmienda de Kigali | Certificación voluntaria en manejo seguro de refrigerantes (OPROZ/IARAA). Recomendada, no exigible. |
| Técnico en calefacción a gas | Sí (es gasista a efectos regulatorios) | ENARGAS, tramitada ante GASNEA | Ley Nacional 24.076; NAG-200 | Misma matrícula que gasista. |

### ***Seguridad*** {#seguridad}

13. ###### *Profesiones cubiertas para categoría “Seguridad”.*

| Profesión | Habilitación obligatoria | Organismo regulador | Normativa | Validación en la plataforma |
| ----- | ----- | ----- | ----- | ----- |
| Cerrajero | No | \-- | \-- | Autodeclaración \+ reputación. Habilitación comercial municipal si opera con local. |
| Instalador de cámaras/alarmas (con monitoreo) | Sí (como empresa de seguridad privada) | Dirección de Seguridad Privada, Policía de Misiones | Ley provincial (SAIJ LPA0007273) | Habilitación de la Dirección de Seguridad Privada de la Policía de Misiones. |
| Instalador de cámaras/alarmas (sin monitoreo) | Zona gris regulatoria | \-- | \-- | Autodeclaración \+ reputación. La regulación aplica a empresas de seguridad privada con monitoreo; la instalación sin servicio de vigilancia no está claramente comprendida. |

######  {#heading-1}

### ***Reparaciones generales*** {#reparaciones-generales}

14. ###### *Profesiones cubiertas para categoría “Reparaciones Generales”.*

| Profesión | Habilitación obligatoria | Organismo regulador | Normativa | Validación en la plataforma |
| ----- | ----- | ----- | ----- | ----- |
| Carpintero | No | \-- | \-- | Autodeclaración \+ reputación |
| Herrero | No | \-- | \-- | Autodeclaración \+ reputación |
| Soldador (trabajos domésticos) | No | \-- | \-- | Autodeclaración \+ reputación |
| Soldador (estructural/industrial) | Sí (certificación sectorial) | IAS / INTI | IRAM-IAS U 500-138 | Certificación IAS/IRAM verificable si la declara. No aplica a trabajos domésticos. |

######  {#heading-2}

### ***Notas*** {#notas}

Consideraciones para el desarrollo

- **Electricista idóneo:** Misiones no cuenta con una ley provincial de seguridad eléctrica como Córdoba (Ley 10.281) o Buenos Aires. La distinción entre electricista titulado e idóneo es relevante para el onboarding.  
- **Fumigador:** El organismo correcto en Misiones es el Dpto. de Control Ambiental del Ministerio de Ecología, no SENASA (que regula fumigación cuarentenaria/agropecuaria).  
- **Empleado doméstico:** La plataforma no habilita al trabajador sino que debe advertir al empleador sobre sus obligaciones legales bajo la Ley 26.844.  
- **Instalador de cámaras:** Existe una zona gris entre instalación de equipos (servicio técnico) y prestación de servicios de seguridad privada (regulado por la Policía de Misiones).

## Anexo B: Modelo de calidad de producto ISO/IEC 25010 {#anexo-b:-modelo-de-calidad-de-producto-iso/iec-25010}

La norma ISO/IEC 25010:2011 (SQuaRE) define dos modelos de calidad: el de **calidad en uso** —cinco características relativas al uso del producto en un contexto determinado— y el de **calidad de producto**, que es el adoptado en este trabajo para nombrar y organizar los requisitos no funcionales (4.a y 11.a) y los atributos evaluados en el análisis de arquitectura por escenarios (ATAM, 11.b). Este anexo reúne el catálogo completo de ese modelo para servir de glosario único de referencia y evitar duplicar definiciones a lo largo del informe.  
El modelo de calidad de producto se compone de **ocho características**, subdivididas en **treinta y una subcaracterísticas**. Las definiciones precisas de cada subcaracterística se encuentran en el vocabulario normativo SEVOCAB (ISO/IEC/IEEE 24765:2017), conforme al criterio de citado adoptado en la asignatura.

| Característica | Definición (ISO/IEC 25010:2011) | Subcaracterísticas |
| :---- | :---- | :---- |
| **Adecuación funcional** | Grado en que el producto proporciona funciones que satisfacen necesidades declaradas e implícitas cuando se usa bajo condiciones especificadas. | Completitud funcional; Corrección funcional; Pertinencia funcional |
| **Eficiencia de desempeño** | Desempeño relativo a la cantidad de recursos utilizados bajo condiciones determinadas. | Comportamiento temporal; Utilización de recursos; Capacidad |
| **Compatibilidad** | Grado en que dos o más sistemas o componentes pueden intercambiar información y/o ejecutar sus funciones compartiendo el mismo entorno de hardware o software. | Coexistencia; Interoperabilidad |
| **Usabilidad** | Grado en que el producto puede ser usado por usuarios específicos para alcanzar objetivos con efectividad, eficiencia y satisfacción en un contexto de uso especificado. | Reconocibilidad de la adecuación; Capacidad de aprendizaje; Operabilidad; Protección contra errores de usuario; Estética de la interfaz de usuario; Accesibilidad |
| **Fiabilidad** | Grado en que el sistema o producto desempeña las funciones especificadas bajo condiciones determinadas durante un período de tiempo determinado. | Madurez; Disponibilidad; Tolerancia a fallos; Capacidad de recuperación |
| **Seguridad** | Grado en que el producto protege la información y los datos, de modo que personas u otros sistemas tengan el grado de acceso apropiado a su tipo y nivel de autorización. | Confidencialidad; Integridad; No repudio; Responsabilidad; Autenticidad |
| **Mantenibilidad** | Grado de eficacia y eficiencia con que el producto puede ser modificado para corregirlo, mejorarlo o adaptarlo a cambios en el entorno y en los requisitos. | Modularidad; Reusabilidad; Analizabilidad; Modificabilidad; Capacidad de prueba |
| **Portabilidad** | Grado de eficacia y eficiencia con que un producto puede ser transferido de un entorno de hardware, software u operacional a otro. | Adaptabilidad; Capacidad de instalación; Capacidad de reemplazo |

INCLUYAN UN ANEXO, donde co evalúen su producción respecto de los siguientes criterios consignados para el trabajo.

## Anexo C: Ejemplo de Spec Ejecutable

---

**UC01 — Registrarse (Spec)**

**Propósito**

Permite que un **visitante** (usuario sin sesión) cree una cuenta en la plataforma eligiendo el rol **Cliente** o **Prestador**. Es el único caso de uso junto con UC04 (Buscar prestadores) que no requiere sesión iniciada (UC02). Los datos personales recolectados son los mínimos necesarios (nombre, apellido, e-mail, teléfono, contraseña y rol). Si el rol es Prestador con oficio regulado, la cuenta nace en estado pendiente\_habilitacion y delega en UC18 la verificación de matrícula.

**Requisitos**

**Trazabilidad funcional**

| Código | Prioridad | Descripción normativa |
| :---- | :---- | :---- |
| RF-1.1 | Obligatorio | El sistema *deberá* permitir el registro de usuarios con dos roles diferenciados: cliente y prestador. |
| RF-1.3 | Obligatorio | El prestador *deberá* cargar y acreditar su matrícula profesional cuando el oficio lo requiera. |

**Trazabilidad no funcional**

| Código | Descripción normativa | Impacto en UC01 |
| :---- | :---- | :---- |
| RNF-S.1 | Mínimo privilegio | La cuenta nueva se crea con permisos mínimos según rol; no se almacenan datos sensibles innecesarios. |
| RNF-S.3 | Validación de identidad y matrícula | Prestador con oficio regulado nace en estado pendiente\_habilitacion. |
| RNF-S.4 | Ley 25.326 datos personales | El e-mail se considera dato personal; la contraseña se almacena con hash Argon2id; no se registran datos sensibles en logs. |

**Reglas de negocio**

| ID | Regla |
| :---- | :---- |
| RN-REG-01 | Un visitante puede registrarse únicamente con los roles cliente o prestador. El rol es obligatorio y **no se puede modificar** tras la creación de la cuenta. |
| RN-REG-02 | El e-mail debe ser único en el sistema. Si ya existe una cuenta con el mismo e-mail, el registro se rechaza con HTTP 409 sin revelar datos de la cuenta existente. |
| RN-REG-03 | Son campos obligatorios: nombre, apellido, e-mail, teléfono, contraseña y rol. Todos deben cumplir el formato definido o el sistema rechaza con HTTP 422 indicando los campos a corregir. |
| RN-REG-04 | La contraseña se almacena con hash **Argon2id** (mismo criterio que RN-AUTH-08). |
| RN-REG-05 | Un Prestador con oficio regulado se crea en estado pendiente\_habilitacion y **no puede acceder** a funcionalidades de prestador hasta que UC18 acredite su matrícula. |
| RN-REG-06 | Un Cliente o Prestador con oficio no regulado se crea en estado activo de forma inmediata y queda operativo según su rol. |

**Escenarios (Given-When-Then)**

**ESC-01: Registro exitoso como Cliente**

* **Dado** un visitante que accede al formulario de registro  
* **Cuando** selecciona rol Cliente, completa todos los campos obligatorios con formato válido y confirma  
* **Entonces** el sistema crea la cuenta en estado activo, persiste los datos con hash Argon2id, el usuario queda operativo como Cliente, y retorna HTTP 201 con confirmación

**ESC-02: Registro exitoso como Prestador (oficio no regulado)**

* **Dado** un visitante que accede al formulario de registro  
* **Cuando** selecciona rol Prestador, declara un oficio no regulado, completa los campos obligatorios y confirma  
* **Entonces** el sistema crea la cuenta en estado activo, persiste los datos, el usuario queda operativo como Prestador, y retorna HTTP 201

**ESC-03: Registro como Prestador con oficio regulado (pendiente habilitación)**

* **Dado** un visitante que accede al formulario de registro  
* **Cuando** selecciona rol Prestador, declara un oficio regulado, completa los campos obligatorios y confirma  
* **Entonces** el sistema crea la cuenta en estado pendiente\_habilitacion, persiste los datos, informa que debe acreditar su matrícula (UC18), retorna HTTP 201 con estado pendiente; el usuario **no** queda operativo como Prestador

**ESC-04: Datos incompletos**

* **Dado** un visitante completando el formulario de registro  
* **Cuando** omite uno o más campos obligatorios y confirma  
* **Entonces** el sistema identifica los campos faltantes, responde HTTP 422 con la lista de campos a corregir, y **no** crea ninguna cuenta

**ESC-05: Formato de datos inválido**

* **Dado** un visitante completando el formulario de registro  
* **Cuando** ingresa datos con formato incorrecto (e-mail sin arroba, contraseña \< 8 caracteres, teléfono inválido) y confirma  
* **Entonces** el sistema identifica los campos con error de formato, responde HTTP 422 con la lista de campos a corregir, y **no** crea ninguna cuenta

**ESC-06: Correo electrónico ya registrado**

* **Dado** un visitante completando el formulario de registro  
* **Cuando** ingresa un e-mail que ya pertenece a una cuenta existente y confirma  
* **Entonces** el sistema responde HTTP 409 indicando que el e-mail ya está registrado (sin revelar datos de la cuenta existente), y **no** crea ninguna cuenta; el visitante puede corregir el e-mail o desistir

**ESC-07: Desistimiento tras correo duplicado**

* **Dado** un visitante que recibe un error de e-mail duplicado (ESC-06)  
* **Cuando** decide no continuar con el registro y cierra/cancela el formulario  
* **Entonces** el sistema no crea ninguna cuenta; no se persiste ningún dato parcial; la operación finaliza sin efecto

**Fuera de alcance**

* **Autenticación / inicio de sesión** — cubierto por UC02.  
* **Recuperación de contraseña** — cubierto por UC02 (RF-1.6).  
* **Verificación de matrícula del Prestador** — cubierto por UC18; UC01 solo dispara la necesidad.  
* **Modificación de datos del perfil** — no existe UC en el documento fuente.  
* **Suspensión / baja de cuenta** — cubierto por UC14 (Moderar usuario).  
* **Verificación de e-mail** — no requerida por el documento fuente; se asume fuera de alcance.

**Preguntas abiertas / supuestos**

| ID | Pregunta | Resolución (default) |
| :---- | :---- | :---- |
| PA-01 | ¿Longitud mínima de contraseña? | ✅ **8 caracteres** (resuelto HITL). |
| PA-02 | ¿El listado de oficios regulados es fijo o configurable? | ✅ **Fijo en seeds de BD** (resuelto HITL). |
| PA-03 | ¿Se requiere verificar el e-mail antes de activar la cuenta? | ✅ **No — registro inmediato** salvo oficio regulado (resuelto HITL). |
| PA-04 | ¿Rate limiting por IP para registro? | ✅ **No en esta iteración** (resuelto HITL). |

---

## Anexo D: Coevaluación {#anexo-d:-coevaluación}

*Coevaluación del equipo sobre la producción del TPI respecto de los siguientes criterios de evaluación general:*

* Completitud y Puntualidad.  
* Adecuación de la producción a los lineamientos (objetivos, consignas y criterios) que la fundamentan.  
* Estructura o lógica interna del informe elaborado: portada, índice/s de contenido, figuras, tablas y ecuaciones, capítulos de introducción, desarrollo y conclusiones; con esquema enumerado de capítulos, secciones y subsecciones, y numeración de páginas.  
* Redacción clara y sin errores gramaticales y ortográficos.  
* Numeración de Figuras, Tablas o Cuadros, y Ecuaciones.  
* Precisión en el empleo de nociones básicas, y reconocimiento de nexos entre aspectos conceptuales y prácticos.  
* Correctitud y coherencia del análisis, comparación, integración y síntesis creativas de los contenidos cubiertos.  
* Ajustado manejo de la bibliografía y CITAS correspondientes. Honrar autor/es refiriendo a su obra (incluir en la cita: el número de página en la obra desde la que parafrasean argumentos).

##### ***Co-evaluación de la producción respecto a los criterios*** {#co-evaluación-de-la-producción-respecto-a-los-criterios}

* **Completitud y puntualidad:** El trabajo fue entregado una semana más tarde que la fecha de entrega inicialmente definida, pero se lograron finalizar todas las actividades solicitadas con un grado de completitud similar en todas ellas.  
* **Adecuación de la producción a los lineamientos que la fundamentan:** El trabajo cumple con los objetivos propuestos y se adecúa a las consignas y criterios propuestos.  
* **Estructura o lógica interna del informe elaborado:** Se utilizó una estructura similar en todo el trabajo, siguiendo el orden de actividades propuesto por la consigna del Trabajo Práctico Integrador. Se utilizaron todas las herramientas propuestas por este criterio (portada, índice general, índice de tablas y figuras, etc.).  
* **Redacción clara y sin errores gramaticales y ortográficos:** La redacción utiliza lenguaje técnico cuando es necesario, pero manteniendo un grado de claridad aceptable. No presenta errores gramaticales ni ortográficos.  
* **Precisión en el empleo de nociones básicas, y reconocimiento de nexos entre aspectos conceptuales y prácticos:** Se logró demostrar en el trabajo el conocimiento de las nociones básicas. Si bien el desarrollo del proceso presentó algunas dificultades, fue posible conectar en todo momento los conceptos teóricos con el aspecto práctico.  
* **Correctitud y coherencia del análisis, comparación, integración y síntesis creativas de los contenidos cubiertos:** El equipo de desarrollo tuvo como prioridad durante este trabajo comprender y analizar las distintas alternativas planteadas, así como también el porqué de la selección de una alternativa comparada a la otra. Como consecuencia de esto, el análisis, integración y síntesis creativa de los contenidos cubiertos fueron realizados de forma correcta y coherente.  
* **Ajustado manejo de la bibliografía y CITAS correspondientes. Honrar autor/es refiriendo a su obra:** Se utilizó, además de la bibliografía propuesta, múltiples fuentes externas actualizadas. Toda la bibliografía fue citada correctamente.  
  Además, si bien se utilizó la inteligencia artificial como soporte para el desarrollo del trabajo, se hizo mención de esto de forma honesta y transparente al comienzo del documento. Además, en todo momento se revisó lo generado por múltiples integrantes.

[^1]:  El marco genérico utilizado por Pressman se compone de las mismas actividades que las encontradas en el modelo en cascada: Comunicación, Planeación, Modelado, Construcción y Desarrollo. [\[2, pp. 29–30\]](https://www.zotero.org/google-docs/?1GQ6TH)