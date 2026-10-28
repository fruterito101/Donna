# Donna /app — modo Operate

## Entrega
Interfaz frontend guiada, no agente conectado. / conserva marketing y enlaza a /app; /app tiene shell propia y enlace de regreso. Una sola consulta local, sin historial inventado.

## Flujo y estados
Bienvenida vacía → elegir tema o aportar descripción → nombre → descripción → etapa → cobro/tema → revisión. Textos preparados reconocen acciones, no dan opiniones fiscales. No hay autoplay. «No estoy seguro» permanece pendiente.

Conversación, formulario Mi negocio, expediente (Resumen/Pendientes/Fuentes) y plantilla Documentos comparten estado en memoria. Guardar contexto actualiza expediente y resumen. Las tareas no acreditan cumplimiento legal. Nueva consulta y salida piden confirmación si hay trabajo; recargar o cerrar descarta la sesión.

Adjuntos PDF/texto de hasta 10 MB: validación local, solo metadatos, quitar y errores sin pérdida de contexto. No extracción, lectura ni subida. Resumen disponible al aportar datos: vista previa, copiar con resultado real y descarga .txt.

## Layout y accesibilidad
Desktop sidebar 232 px y expediente 360 px; tablet expediente desplegable; móvil navegación y expediente en paneles modales accesibles. Conversación con scroll independiente y composer en flujo. El scroll automático solo sigue mensajes cerca del final.

## Pendiente de integración
Conectar el agente mediante una frontera de servidor apropiada para este proyecto, identidad de visitante, manejo de errores y contratos acordados. No se llama al /api/chat del Next externo ni se presupone CORS/cookies. Faltan fuentes verificadas, lectura segura de documentos, política de datos, almacenamiento durable y autenticación si se acuerdan. No hay keys, Cloud, modelos ni conectores en esta entrega.
