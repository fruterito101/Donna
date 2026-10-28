# Admisión Donna — chat conectado, voz y operaciones pendientes

## Decisiones resueltas
SÍ agente de Donna desde el servidor Next existente + voz ElevenLabs pendiente. NO ElevenLabs Agents, NO otro LLM, NO speechSynthesis. Chat conectado por proxy; registros locales, sin micrófono ni entrega al despacho.

## Proxy actual
POST /api/donna/chat admite exclusivamente {message:string}, trim y máximo 4000 caracteres/24 KB de cuerpo UTF8. Same-origin obligatorio, sin CORS abierto. Servidor usa DONNA_BACKEND_ORIGIN opcional (no VITE_), default público confirmado https://donna-mx.vercel.app y ruta fija /api/chat; no redirects. Next mantiene askDonna/currentVisitor, hilo e identidad, sin claves compartidas ni contrato alterado. Solo cookie donna_visitor de cada request y solo Set-Cookie donna_visitor de respuesta; HttpOnly/SameSite/Secure/Path/Max-Age preservados, sin jar global ni logs. Cache-Control no-store, timeout 25 s, errores públicos 429/503/red y reintento manual. Nunca AGENT_URL, signing secret ni token en cliente.

La nueva admisión usa una ficha central de ejemplo independiente (Circuito / Ana Torres, personaje de ejemplo / ana@circuito.example), identificada y editable. «Comenzar conversación» envía una vez admissionMessage con datos_contexto por acción explícita, sin autoenvío ni checkbox inicial para el ejemplo. Reabrir conserva ediciones; no copia información real del workspace. No se envía contacto en la introducción; conversación posterior solo transmite lo que la persona escribe. Respuestas en texto sin HTML ejecutable; no completan ficha ni consentimiento. Una solicitud pendiente por sesión cliente.

## Esquema del prospecto
`isExample` conserva la procedencia de ejemplo aun tras editar; tabla (sin sexta columna) y detalle lo identifican, sin confundirlo con un prospecto real. Consentimiento final obligatorio, nunca preseleccionado ni derivado del inicio del chat. `id` identifica el intento de registro y evita duplicación. `context`: startup, description, stage, topics, notes[], documents[] (solo nombres; pendientes de lectura). Contacto: person, role, email, phone. Perfilado: need, goal, urgency, sin inferencias. `destination`, `status` inicial Pendiente de integración, `createdAt`; `consent`: authorized=true, destination, at. Snapshot congelado e independiente de futuras ediciones. Autorización no preseleccionada, mínimos validados; desconocidos pendientes. La ficha puede contener datos personales: hoy solo memoria y se descarta al recargar.

## Flujo futuro desde servidor
1. Endpoint público conectado con contrato {message}/{reply}; Next controla currentVisitor/askDonna. El proxy no puede elegir hilo ni tema. Un hilo dedicado de admisión distinto exige acuerdo posterior en Next; no se afirma segregación de hilos desde este frontend. La dirección privada nunca se llama desde navegador.
2. Pasar solo el contexto aprobado, identificar al asistente como IA y mantener incertidumbres. Confirmar normalización de respuesta Markdown a texto pronunciable (sin introducir hechos o citas) antes de TTS.
3. TTS ElevenLabs en servidor con ELEVENLABS_API_KEY y ELEVENLABS_VOICE_ID. Claves privadas jamás VITE_, frontend ni bundle. Configuración segura mediante conexión/secrets del servidor, nunca campos de la app ni chat. Validar formato y voz, errores, cancelación y reproducción; no activar micrófono hasta servicio real y autorización adecuada. Elegir entrada de voz y su tratamiento por separado, no asumir STT incluido.
4. Implementar autenticación de operadores y autorización por despacho, aislamiento de visitantes y tenants, almacenamiento durable con acceso restringido y tratamiento/borrado de datos acordados.
5. Acordar autorización de compartir, destinatario real y aviso de tratamiento con revisión legal; la etiqueta Galicia no verifica alianza ni permiso de representación.
6. Entrega auditable: validación del destinatario, registro fechado de consentimiento/versiones/contexto enviado, idempotencia servidor, errores y acuse. «Enviado» solo tras confirmación real, no por click. Definir canales reales sin inventar contactos.

## Límites presentes
Sin Cloud, DB, AI gateway, claves del agente, conectores de voz, TTS ni auth operadores. /operaciones es vista de la misma visita, no sistema compartido por operadores. No datos reales precargados ni scoring. La autorización local no sustituye una política legal ni una entrega efectiva. Cookie firmada/almacenamiento del Next dependen de su contrato, no de la memoria de esta UI; reiniciar consulta local no borra ni rota identidad upstream.

## Verificación realizada
Una consulta técnica sin datos personales a través del proxy localhost: HTTP 200 con reply, no-store y cookie donna_visitor HttpOnly/Secure/SameSite=Lax, sin imprimir valor. UI mock de loading/error/retry/admisión y registro local conservado. Preview alojada responde HTTP 401 sin sesión accesible: handler compilado en esa preview no pudo verificarse end-to-end; no se publicó.