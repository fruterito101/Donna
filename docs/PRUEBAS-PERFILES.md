<!-- Informe de pruebas exploratorias con cuatro perfiles ficticios; no es una revisión jurídica. -->
# Donna: feedback de cuatro perfiles

Fecha: 28 de octubre de 2026. Cuatro subagentes simularon software developers, product managers, freelancers y vibecoders. Estas perspectivas no sustituyen entrevistas con usuarios reales. Los resultados describen la versión de Next probada durante la sesión; no certifican cambios posteriores ni el frontend independiente de Lovable.

## Alcance y ejecución

Se instaló con `npm ci` y se inició el monorepo con `npm run dev`. La web disponible es el chat de prueba de Next, no la landing de Lovable. No contiene carga de URL/PDF, pantalla de informe ni exportación.

Los intentos HTTP de los subagentes encontraron restricciones del entorno. El coordinador centralizó tres pruebas reales a `/api/chat` y `/api/report` (`explain:false`) y cada subagente evaluó la evidencia de su caso. El cuarto caso se envió mediante el navegador real y el subagente vibecoder evaluó la respuesta completa y la captura. No se hicieron pasar inspecciones de código por clics.

| Perfil | Producto y etapa | Chat | Informe |
|---|---|---|---|
| Software developer | NébulaNotas: SaaS de IA en MVP, 12 testers, dos cofundadores, sin ventas ni empleados | HTTP 200; 66.02 s | HTTP 200; 0.23 s |
| Product manager | NubeTurno: SaaS B2B lanzado, 20 clientes mexicanos y cuatro empleados; expansión futura | HTTP 200; 42.52 s | HTTP 200; aproximadamente 0.23 s |
| Freelancer | Dev independiente operativo, dos clientes de EEUU, facturas y cobros bancarios USD | HTTP 200; 32.32 s | HTTP 200; 0.22 s |
| Vibecoder | MesaLista: idea con landing y 15 correos en lista de espera, sin ingresos ni empleados | Envío y respuesta comprobados en navegador; servidor HTTP 200; 25.4 s | No se ejecutó para este caso |

El motor cargó nueve reglas, cuatro marcadas como verificadas en el repositorio. No se habilitaron borradores. No se verificó independientemente la corrección o vigencia de esas reglas.

## Lo que dice cada perfil

### Software developer

Le sirve la separación antes de beta / antes del primer cobro y el checklist para profesionales. Donna respetó que dos cofundadores no implican empleados y no prometió incentivos por usar IA.

Fricciones: el chat agregó temas sin trazabilidad al informe; clasificó datos como sensibles sin soporte visible; afirmó ausencia de gastos documentados y de proyecto técnico sin que el caso lo dijera. El motor mantuvo I+D como dato desconocido. La espera fue de 66 segundos.

Petición: checklist exportable al repositorio con acciones, evidencia, etapa, fuentes y estado de verificación.

### Product manager

Le sirve recibir prioridades, documentos para reunir y una distinción entre operación actual y expansión.

Fricciones: el chat y el motor dieron selecciones y siguientes preguntas distintas; que una obligación aplique no indica si está pendiente; el plan carece de responsables y criterios de cierre. El chat escribió inicialmente NubeTurbo y se corrigió a NubeTurno.

Petición: convertir el informe del motor en tareas con fuente, cumplimiento actual, responsable y evidencia de cierre.

### Freelancer

Le sirve que Donna reconozca una actividad ya operativa y proponga reunir facturas, contratos y estados bancarios para el contador.

Fricciones: la respuesta añadió temas fiscales e internacionales fuera del informe y sin fuentes; mezcló datos confirmados y suposiciones bajo la etiqueta «Confirmado»; el encabezado de la web solo menciona startups y no explica cómo obtener un expediente.

Petición: entrada específica para trabajadores independientes y resultado respaldado por el motor, con lo confirmado, condicionado y pendiente claramente separados.

### Vibecoder

Le sirve que Donna limite el resultado a tres pasos y diferencie validación de cobro.

Fricciones: Markdown literal, urgencia ambigua entre «ahora» y «30 días», afirmaciones sin enlaces oficiales y temas adicionales poco pertinentes para la etapa.

Petición: tres acciones simples con «haz ahora / puede esperar», el hecho que activa cada una, fuente y dato pendiente.

## Hallazgos comunes, por prioridad

1. Vincular las respuestas legales del chat al informe del motor. En estas pruebas `/api/chat` recibió solo el mensaje: el informe se solicitó por separado, por lo que el chat no estaba explicando ese resultado. La divergencia es del flujo disponible; las pruebas no evalúan una integración del chat con un informe que aún no está conectada.
2. No convertir datos desconocidos en afirmaciones. Conservar estados como `needs_data` y distinguir «aplica» de «cumplido» o «pendiente».
3. Mostrar fuentes, fechas y cobertura. El motor sí devuelve esta información; la UI actual no la muestra como informe.
4. Presentar acciones y exportación según etapa y perfil. Renderizar Markdown y enlaces de forma legible.
5. Mejorar espera y contexto. El chat tardó de 25 a 66 segundos; todas fueron mediciones exploratorias, sin benchmark ni aislamiento de concurrencia.

## Límites

La llave de desarrollo comparte conversación intencionalmente. Donna llamó «Artur» a varios personajes ficticios: eso no demuestra una fuga entre usuarios de producción. No se validó aislamiento, carga, accesibilidad completa, persistencia, lectura Firecrawl/PDF, voz ni exportación. No se hicieron cambios al producto y no se ejecutaron `npm test` ni `npm run build`.

## Evidencia

- [Software developer](evidencias/perfiles-2026-10-28/donna-software-evidence.json)
- [Product manager](evidencias/perfiles-2026-10-28/donna-product-evidence.json)
- [Freelancer](evidencias/perfiles-2026-10-28/donna-freelancer-evidence.json)
- [Respuesta completa en navegador](evidencias/perfiles-2026-10-28/donna-browser-test.txt)
- [Captura de la respuesta](evidencias/perfiles-2026-10-28/donna-browser-test.png)
