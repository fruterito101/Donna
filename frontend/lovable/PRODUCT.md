# Donna — Producto

Donna ayuda a devs, builders, freelancers de software y founders en México, sin conocimientos fiscales o legales, a entender qué revisar, qué oportunidades explorar y qué información preparar para su contador.

## Modelo
- Cruza hechos del negocio con reglas verificadas. El agente explica; no decide por sí mismo qué ley aplica.
- Cada salida separa: hechos confirmados, preguntas pendientes y asuntos para revisión profesional.
- Si no hay fuente legal verificada se escribe "Fuente pendiente de verificación". Nunca se inventan artículos, montos, plazos ni citas.
- Entrada prevista del producto: página web y presentación del negocio.

## Áreas de preparación
Estrategias fiscales para ti y tus clientes · Estructura de tu empresa · Contratos · Protección de lo que construyes · Negocio listo para crecer. Donna orienta la preparación; no optimiza ni decide.

## Alcance actual
Landing con recorrido automático del producto (caso "Nube Clara", no es cliente real), preservado, y conversación real con el agente Donna existente en /app. Sin base de datos ni autenticación de operadores. Sin política de datos acordada: no afirmarla. No mostrar avisos de "ficticio" en la página; una sola línea de alcance en el pie.

## Interfaz guiada de sesión local
- /app empieza vacío, sin autoenvíos. Indicación «Agente Donna · conversación por texto», esperando solo durante una solicitud real y error/reintento explícito si falla. Respuestas en texto seguro, sin fallback fingido.
- Conversación, Mi negocio y expediente comparten el contexto aportado por la persona. «No estoy seguro» sigue siendo información pendiente; ninguna respuesta permite inferir hechos fiscales.
- PDF/texto hasta 10 MB por archivo: selección local y metadatos, siempre «Pendiente de lectura». Sin extracción ni envío a servidores.
- Resumen mediante plantilla desde datos aportados; tareas marcables no acreditan cumplimiento legal. Fuentes vacías sin integración verificada.
- Estado solo en memoria durante la visita a /app. Nueva consulta y salida piden confirmación cuando hay trabajo; recargar descarta el contexto.

## Referentes funcionales (no de marca)
Conversación + documento + revisión estructurada + entregables; fuentes consultables; conversación junto al elemento generado. No copiar marcas ni prometer integraciones.

## Segunda línea comercial — prospectos perfilados para despachos
- CTA «Contactar a un Profesional» prepara una ficha escrita desde una copia del contexto de la consulta. Destinatario inicial: «Despacho Galicia Abogados Fiscales», etiqueta solicitada, no alianza verificada ni representación oficial.
- Chat real con Donna existente: contexto de admisión revisado y aportado explícitamente, una pregunta cada vez; nunca rellenar contacto, hechos o autorización desde respuestas del modelo. Registros siguen LOCALES, sin envío al despacho ni auth. «Voz pendiente de conexión»: ElevenLabs TTS sigue pendiente; no ElevenLabs Agents ni otro modelo.
- Contacto mínimo válido y autorización explícita no preseleccionada antes de registrar. Datos desconocidos siguen pendientes; no inferir necesidad, presupuesto o urgencia. No pedir RFC, CURP ni ingresos exactos.
- Registros inmutables en memoria de la visita: contexto autorizado, contacto, destino, fecha y consentimiento. Estado «Pendiente de integración»; nunca «Enviado». Cambiar de vista o de ruta SPA conserva consulta y ficha; nueva consulta no borra registros autorizados. Recargar descarta la sesión.
- /operaciones muestra únicamente filas registradas por esta visita, sin métricas inventadas ni operadores conectados. No afirmar privacidad legal, protección autenticada ni entrega efectiva.
