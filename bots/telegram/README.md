# bots/telegram — Dona en Telegram (@Dona101Bot)

Un bot pequeño que recibe mensajes privados y se los pasa al agente de Dona con su identidad, igual
que la app. Solo librería estándar de Python. Dueño: Brian.

- **Entrar:** con el enlace de invitación del equipo (lo comparte Brian). Quien no lo tiene recibe
  «estoy en pruebas privadas».
- **Comandos:** `/start` · `/nuevo` (conversación desde cero) · `/id`.
- **Configuración** (variables de entorno, nunca en el repo): `DONA_BOT_TOKEN`, `AGENT_URL`,
  `AGENT_TOKEN`, `DONA_BOT_ALLOWED`, `DONA_BOT_INVITE`, `STATE_PATH`, `IDENTITY_PATH` — descritas en
  el encabezado de `dona_bot.py`.
- Lo despliega y opera Brian.
