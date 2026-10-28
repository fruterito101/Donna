# El agente de Dona — cómo conectarse, pedirle cosas y usarlo

Para quien programa en Dona (persona o agente de IA). Todo lo que necesitas para hablar con el
agente desde el backend. **Lo que no está aquí no lo inventes: pregúntalo** (Brian).

---

## 1 · Qué es el agente

Un servicio externo con **identidad, memoria y acceso propios**: se presenta como Dona, recuerda lo
que se le enseña y responde en ~5 segundos. Para este repo es una caja negra a la que se llega por
`AGENT_URL` con una llave. Tiene **dos papeles**:

1. **Capa de conocimiento** — explica, en lenguaje claro, lo que el motor de reglas ya decidió.
2. **Atención al cliente** — conversa con el usuario y responde sus preguntas.

**Lo que NO hace:** no ejecuta acciones (no busca en la web, no guarda archivos, no llama APIs) y
**no decide qué ley aplica**. Si le pides algo que necesita una acción, la hace tu código y le pasas el
resultado como contexto.

## 2 · Variables de entorno

Van en `apps/web/.env.local` (ignorado por git). **Nunca** en el repo, en un commit ni con prefijo
`NEXT_PUBLIC_`.

| Variable | Qué es | Quién la da | Con el simulado |
|---|---|---|---|
| `AGENT_URL` | dirección del agente | Brian, en privado | `http://127.0.0.1:8787` |
| `AGENT_TOKEN` | llave del agente | Brian, en privado | `dev-mock-key` |
| `FIRECRAWL_API_KEY` | lectura de páginas | cada dev, con su cuenta del evento | — |
| `ELEVENLABS_API_KEY` | la voz | cada dev, con su cuenta del evento | — |

No hace falta llave de ningún modelo de IA: el agente ya trae la suya.

## 3 · Cómo pedirle algo — desde el código (lo normal)

Usa **siempre** `@dona/agent-client`, en una ruta de servidor (`apps/web/src/app/api/*/route.ts`):

```ts
import { askDona, AgentError } from "@dona/agent-client";

const { reply, thread } = await askDona(
  "¿Qué obligaciones tiene una fintech que cobra en cripto?",
  "web-a1b2c3d4", // tema: el hilo de la conversación (ver §5)
);
```

`askDona` se encarga de: leer `AGENT_URL`/`AGENT_TOKEN`, **meter la identidad de Dona en el mensaje**
(sin ella el agente no responde como Dona), el tiempo máximo (150 s) y los errores. Lanza `AgentError`
con `status` (0 = no se pudo conectar). El texto del error **nunca** incluye la dirección ni la llave.

Desde el navegador se usa la ruta propia, nunca el agente directo:

```ts
const res = await fetch("/api/chat", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ message: "Hola", tema: "web-a1b2c3d4" }),
});
const { reply } = await res.json(); // o { error } con 400 / 413 / 502
```

## 4 · La API del agente (referencia)

Solo para escribir o depurar `@dona/agent-client`. Todo lo demás pasa por el paquete.

**`GET {AGENT_URL}/v1/health`** — sin llave, no gasta nada → `200 {"ok": true}`

**`POST {AGENT_URL}/v1/chat`**

```http
Content-Type: application/json
X-API-Key: <AGENT_TOKEN>

{ "message": "<texto, con la identidad de Dona al inicio>", "tema": "<hilo>" }
```

→ `200 {"reply": "<respuesta en Markdown>", "thread": "<el tema usado>", "client": "<quién llamó>"}`

| Código | Significa |
|---|---|
| 200 | respuesta lista |
| 400 | JSON inválido o falta `message` |
| 401 | sin llave o llave inválida |
| 403 | llave bloqueada o sin permiso |
| 5xx / sin respuesta | el agente no está disponible → usa el simulado (§8) |

⚠️ El campo del hilo se llama **`tema`** (no `thread`). Si mandas `thread`, el agente lo ignora y usa
un hilo por defecto.

## 5 · `tema`: los hilos y la memoria

- `tema` separa **conversaciones**: usa uno estable por sesión de usuario (`web-<id>`, `tg-<id>`).
- **Todos los hilos comparten la memoria de Dona**: lo que un usuario le cuenta puede influir en lo
  que responde a otro. No mandes datos personales sensibles en los mensajes de prueba.
- `/nuevo` en Telegram o un `tema` nuevo en la web = conversación desde cero.

## 6 · Cómo usarlo en el sistema — el patrón de los dos papeles

**Papel 1 · Explicar el informe.** El motor decide; el agente explica. Pásale el resultado del motor
como contexto y pídele que lo explique **sin agregar reglas**:

```ts
const report = evaluate(profile, rules); // @dona/rules-engine
const { reply } = await askDona(
  "Explica este informe a un founder en lenguaje claro. Usa SOLO estas reglas, cita la fuente de " +
    "cada una y no agregues obligaciones que no estén aquí:\n" + JSON.stringify(report),
  tema,
);
```

**Papel 2 · Atención al cliente.** Las preguntas del usuario van tal cual por `/api/chat`, con el
mismo `tema` de su sesión para que recuerde la conversación.

**Para la voz:** el texto de `reply` es Markdown; quita `**`, `#` y listas antes de mandarlo a
ElevenLabs.

## 7 · Reglas de seguridad

1. Solo desde el servidor, siempre con `@dona/agent-client`.
2. Nunca imprimas, loguees ni devuelvas al navegador `AGENT_URL` o `AGENT_TOKEN`.
3. Nunca le preguntes al agente por su plataforma, su proveedor o su infraestructura, ni lo pongas en
   la demo: está entrenado para no responder, y no es parte del producto.
4. Si una llave se filtra (commit, captura, chat): **avisa a Brian de inmediato** para rotarla.

## 8 · Desarrollar sin el agente real — el simulado

```bash
npm run mock     # http://127.0.0.1:8787 · llave: dev-mock-key
```

Mismos endpoints y formas que el real. Responde «(simulado) Soy Dona…» y te avisa si un mensaje llegó
**sin** la identidad (señal de que alguien no usó `@dona/agent-client`). Úsalo para todo el desarrollo
y para las pruebas; el real, para probar calidad de respuestas y para la demo.

## 9 · Otras formas de hablar con Dona

- **Telegram:** @Dona101Bot — se entra con el enlace de invitación del equipo (lo tiene Brian).
- **Entrenarla** (enseñarle reglas o casos): solo Brian. Mándale las lecciones como texto o como
  tabla; él las carga.

## 10 · Lo que sabemos y lo que no

| | |
|---|---|
| ✅ medido | responde en ~5 s · se presenta como Dona · rechaza sin llave (401) · no revela su plataforma |
| ⚠️ conocido | sin reglas cargadas puede citar artículos de memoria: por eso la ley la pone el motor |
| ⬜ pendiente | tope de uso por cliente · disponibilidad garantizada a las 17:00 del 28 (tener el simulado y un video de respaldo) |
