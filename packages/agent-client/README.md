# @dona/agent-client

La **única puerta** al agente de Dona. Dueño: Brian.

- `askDona(message, tema)` → `{ reply, thread }` — mete la identidad de Dona en cada mensaje.
- `agentHealth()` → `boolean` — no gasta nada.
- `AgentError` con `status` (0 = no se pudo conectar). Su texto nunca incluye la dirección ni la llave.

**Solo servidor** (rutas `apps/web/src/app/api/*`). Lee `AGENT_URL` y `AGENT_TOKEN` del entorno.

La identidad sale de `agent/identity.md`: `npm run identity` genera `src/identity.generated.ts`
(corre solo antes de `npm run dev` y `npm run build`). Para cambiar quién es Dona, edita el `.md`,
nunca el archivo generado.

Uso completo, API y reglas de seguridad: `docs/AGENTE.md`.
