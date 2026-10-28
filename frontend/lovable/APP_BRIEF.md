# Donna /app — modo Operate

## Entrega
Conversación real con Donna existente mediante proxy same-origin, sin otro modelo. / conserva marketing y enlaza a /app; /app tiene shell propia y enlace de regreso. Una consulta de visita, sin historial inventado.

## Flujo y estados
Bienvenida vacía → mensaje/tema explícito → solicitud real → reply del backend Donna en texto seguro. Sin autoenvíos, una solicitud pendiente entre consulta y admisión, errores claros y reintento explícito sin duplicar turno. Mi negocio se completa por formulario separado; la IA no confirma hechos. No hay autoplay. «No estoy seguro» permanece pendiente.

Conversación, formulario Mi negocio, expediente (Resumen/Pendientes/Fuentes) y plantilla Documentos comparten estado en memoria. Guardar contexto actualiza expediente y resumen. Las tareas no acreditan cumplimiento legal. Nueva consulta y salida piden confirmación si hay trabajo; recargar o cerrar descarta la sesión.

Adjuntos PDF/texto de hasta 10 MB: validación local, solo metadatos, quitar y errores sin pérdida de contexto. No extracción, lectura ni subida. Resumen disponible al aportar datos: vista previa, copiar con resultado real y descarga .txt.

## Layout y accesibilidad
Desktop sidebar 232 px y expediente 360 px; tablet expediente desplegable; móvil navegación y expediente en paneles modales accesibles. Conversación con scroll independiente y composer en flujo. El scroll automático solo sigue mensajes cerca del final.

## Pendiente de integración
Proxy implementado: navegador → POST /api/donna/chat → servidor → https://donna-mx.vercel.app/api/chat, origen público confirmado. Solo {message}, trim, máximo 4000 caracteres y 24 KB UTF8; origen same-origin obligatorio, redirects bloqueados, no-store, timeout 25 s. Solo cookie donna_visitor reenviada y solo Set-Cookie homónima devuelta, con atributos preservados. Next conserva askDonna/currentVisitor y sus claves; no contratos modificados ni identidad global. No hay docs/ARQUITECTURA.md en este checkout; el contrato descrito por el usuario y una consulta técnica HTTP 200 son la evidencia disponible. Faltan voz, fuentes verificadas, lectura segura, política de datos, almacenamiento durable y autenticación operadores.

## Captación y centro de prospectos — alcance actual local
CTA Phone «Contactar a un Profesional» en sidebar desktop/móvil → ficha escrita Información → Revisar → Registrar. Al abrir una nueva admisión precarga únicamente una ficha de ejemplo válida y editable: Circuito, Ana Torres (personaje de ejemplo), CEO y ana@circuito.example. No copia datos reales de la consulta ni modifica Mi negocio o el chat principal; reabrir conserva el borrador en curso. Regreso sin pérdida de consulta; cancelación sin prospecto.

Campos mínimos: startup, persona, descripción y un canal de contacto válido. Cargo, necesidad, objetivo y urgencia pueden quedar pendientes. «Contexto de ejemplo · editable» solo en admisión. «Comenzar conversación» aporta el contexto de ejemplo mediante admissionMessage en una única solicitud explícita, sin checkbox inicial ni autoenvío; foco al composer. Para fichas no de ejemplo permanece la revisión inicial. ficha y autorización siguen explícitas. Voz deshabilitada con «Voz pendiente de conexión»; no hay micrófono ni llamada simulada. Asistente de admisión con IA, no humano ni representante del despacho.

Autorización explícita de contacto/compartir con «Despacho Galicia Abogados Fiscales», no preseleccionada. Registro local, idempotente, con snapshot inmutable y consentimiento fechado; estado «Pendiente de integración», no entregado. Store por instancia del provider raíz, solo memoria, sin mezcla SSR ni persistencia. Nueva consulta conserva registros; recargar descarta todo.

/operaciones: shell Operate, «Centro de prospectos», cinco columnas exactas Nombre de la startup / Contacto / Descripción del negocio / Contexto / Dirigido a. Búsqueda, ficha completa en panel accesible y contadores derivados. Enlace SPA «Vista operativa» desde app, sin «Descartar consulta»; volver preserva workspace. Vista de sesión sin auth ni acceso multiusuario.

Segunda línea comercial: prospectos perfilados para despachos. Donna conectado por contrato {message}; el navegador no selecciona hilo/visitante/tema. El proxy no crea otro hilo: el Next conserva su contrato de identidad. ElevenLabs TTS y operación durable pendientes. Detalles en INTAKE_INTEGRATION.md.
Los registros procedentes de esta ficha conservan isExample=true y se identifican como «Prospecto de ejemplo» en la primera columna y el detalle, sin añadir columnas. Revisión final y consentimiento de registro siguen obligatorios y no preseleccionados; ElevenLabs sigue pendiente.
