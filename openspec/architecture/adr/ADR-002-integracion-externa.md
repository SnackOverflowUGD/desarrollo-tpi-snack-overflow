# ADR-002 — Integración con sistemas externos: Puertos y Adaptadores (Broker)

- **Estado:** Aceptada (Fase de Elaboración)
- **Formato:** Nygard
- **Relacionada con:** ADR-001, ADR-004 (Mercado Pago como Adaptee)

## Contexto

La plataforma depende de proveedores externos intercambiables: pasarela de pagos, geolocalización
/ mapas, mensajería en tiempo real, notificaciones y consulta a organismos reguladores. El RNF-M.4
exige poder **sustituir un proveedor en ≤40 h**, y los RNF de seguridad exigen minimizar la
superficie de ataque de las integraciones. Acoplar la lógica de negocio a los SDKs de cada
proveedor violaría ambos.

## Decisión

Introducir una **capa de integración** basada en el patrón **Puertos y Adaptadores** (estilo
Broker), con **fachada REST**:

- Cada capacidad externa se define como un **puerto** (interfaz del dominio): p. ej. `PasarelaPago`.
- Cada proveedor concreto se implementa como un **Adapter** (`AdaptadorMercadoPago`) sobre el SDK
  del proveedor (Adaptee).
- La selección de adaptador se realiza con un **Factory** (`FabricaPasarela`).
- **La lógica de negocio nunca invoca un SDK externo directamente** — solo a través del puerto.

## Consecuencias

- (+) Sustituibilidad de proveedores en ≤40 h (RNF-M.4); proveedor aislado tras una interfaz.
- (+) Menor superficie de ataque; el cumplimiento PCI DSS se delega al proveedor de pagos.
- (+) Testeable: los puertos se mockean en pruebas unitarias.
- (−) Mayor complejidad estructural (interfaces + adaptadores + factories) frente al acceso directo.
