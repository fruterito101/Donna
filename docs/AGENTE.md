# El agente de Donna — cómo conectarse, pedirle cosas y usarlo

Para quien programa en Donna (persona o agente de IA). Todo lo que necesitas para hablar con el
agente desde el backend. **Lo que no está aquí no lo inventes: pregúntalo** (Brian).

---

## 1 · Qué es el agente

Un servicio externo con **identidad, memoria y acceso propios**: se presenta como Donna, recuerda lo
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
| `AGENT_TOKEN` | llave del agente: **cada dev recibe la suya, de desarrollo**; la de producción vive solo en Vercel | Brian, en privado | `dev-mock-key` |
| `AGENT_SIGNING_SECRET` | firma la cookie de cada visitante y su identidad ante el agente (§5) | Brian, en privado | cualquier texto, ej. `dev-signing-secret` |
| `FIRECRAWL_API_KEY` | lectura de páginas | cada dev, con su cuenta del evento | — |
| `ELEVENLABS_API_KEY` | la voz | cada dev, con su cuenta del evento | — |

No hace falta llave de ningún modelo de IA: el agente ya trae la suya.

## 3 · Cómo pedirle algo — desde el código (lo normal)

⭐ La guía paso a paso para el equipo (plantilla de ruta, cómo recibir, cómo verificar, errores) es
[`COMUNICACION.md`](COMUNICACION.md). Aquí va solo lo esencial.

Usa **siempre** `@donna/agent-client`, en una ruta de servidor (`apps/web/src/app/api/*/route.ts`):

```ts
import { askDonna, AgentError } from "@donna/agent-client";

const { reply } = await askDonna(
  "¿Qué obligaciones tiene una fintech que cobra en cripto?",
  "web", // tema: el hilo DENTRO del espacio de ese visitante (ver §5)
  { visitorId }, // de la cookie del visitante — nunca del cuerpo de la petición
);
```

`askDonna` se encarga de: leer `AGENT_URL`/`AGENT_TOKEN`, **meter la identidad de Donna en el mensaje**
(sin ella el agente no responde como Donna), **firmar la identidad del visitante** con
`AGENT_SIGNING_SECRET`, el tiempo máximo (150 s) y los errores. Lanza `AgentError` con `status`
(0 = no se pudo conectar). El texto del error **nunca** incluye la dirección ni la llave.

Desde el navegador se usa la ruta propia, nunca el agente directo. **El navegador no elige hilo**:
solo manda el mensaje.

```ts
const res = await fetch("/api/chat", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ message: "Hola" }),
});
const { reply } = await res.json(); // o { error } con 400 / 413 / 502 / 503
```

## 4 · La API del agente (referencia)

Solo para escribir o depurar `@donna/agent-client`. Todo lo demás pasa por el paquete.

**`GET {AGENT_URL}/v1/health`** — sin llave, no gasta nada → `200 {"ok": true}`

**`POST {AGENT_URL}/v1/chat`**

```http
Content-Type: application/json
X-API-Key: <AGENT_TOKEN>
X-Client-Id: <v + 24 hex del sha256 del visitante>
X-Client-Sig: <HMAC-SHA256(AGENT_SIGNING_SECRET, X-Client-Id) en hex>

{ "message": "<texto, con la identidad de Donna al inicio>", "tema": "<hilo>" }
```

→ `200 {"reply": "<respuesta en Markdown>", "thread": "<el tema usado>", "client": "<quién llamó>"}`

| Código | Significa |
|---|---|
| 200 | respuesta lista |
| 400 | JSON inválido o falta `message` |
| 401 | sin llave, llave inválida o firma del visitante inválida |
| 403 | llave bloqueada o sin permiso |
| 5xx / sin respuesta | el agente no está disponible → usa el simulado (§8) |

⚠️ El campo del hilo se llama **`tema`** (no `thread`). Si mandas `thread`, el agente lo ignora y usa
un hilo por defecto.

## 5 · Cada visitante, su conversación

- **La llave de cada visitante es una cookie**: la primera vez, `/api/chat` crea un id aleatorio de
  128 bits y lo guarda en la cookie `donna_visitor` (`HttpOnly`, `Secure`, `SameSite=lax`, 30 días),
  firmada con `AGENT_SIGNING_SECRET`. Ningún script del navegador la puede leer, y una cookie
  alterada o inventada no pasa: ese visitante empieza una conversación nueva.
- **Ante el agente, cada visitante es un cliente aparte** (`X-Client-Id` firmado): su propio hilo y
  su propia memoria. Nadie puede leer ni continuar la conversación de otro, aunque adivine nombres.
- **El navegador no elige el hilo.** Antes lo elegía, y mandando el nombre de un hilo ajeno se podía
  leer esa conversación (medido el 2026-10-28). Por eso `tema` ya no se acepta desde el navegador.
- **No usamos la IP como llave**: en un evento todos salen por la misma IP del wifi y caerían en la
  misma conversación; en el celular la IP cambia y se perdería el hilo.
- Borrar la cookie = conversación desde cero. `/nuevo` hace lo mismo en Telegram.

## 6 · Cómo usarlo en el sistema — el patrón de los dos papeles

**Papel 1 · Explicar el informe.** El motor decide; el agente explica. Pásale el resultado del motor
como contexto y pídele que lo explique **sin agregar reglas**:

```ts
const report = evaluate(profile, rules); // @donna/rules-engine
const { reply } = await askDonna(
  "Explica este informe a un founder en lenguaje claro. Usa SOLO estas reglas, cita la fuente de " +
    "cada una y no agregues obligaciones que no estén aquí:\n" + JSON.stringify(report),
  tema,
);
```

**Papel 2 · Atención al cliente.** Las preguntas del usuario van tal cual por `/api/chat`; su cookie
hace que Donna recuerde su conversación.

**Para la voz:** el texto de `reply` es Markdown; quita `**`, `#` y listas antes de mandarlo a
ElevenLabs.

## 7 · Reglas de seguridad

1. Solo desde el servidor, siempre con `@donna/agent-client`.
2. Nunca imprimas, loguees ni devuelvas al navegador `AGENT_URL`, `AGENT_TOKEN` ni `AGENT_SIGNING_SECRET`.
3. La identidad del visitante sale **solo** de su cookie, nunca del cuerpo de la petición.
4. Nunca le preguntes al agente por su plataforma, su proveedor o su infraestructura, ni lo pongas en
   la demo: está entrenado para no responder, y no es parte del producto.
5. Si una llave se filtra (commit, captura, chat): **avisa a Brian de inmediato** para rotarla.

## 8 · Desarrollar sin el agente real — el simulado

```bash
npm run mock     # http://127.0.0.1:8787 · llave: dev-mock-key
```

Mismos endpoints y formas que el real. Responde «(simulado) Soy Donna…» y te avisa si un mensaje llegó
**sin** la identidad (señal de que alguien no usó `@donna/agent-client`). Úsalo para todo el desarrollo
y para las pruebas; el real, para probar calidad de respuestas y para la demo.

## 9 · Otras formas de hablar con Donna

- **Telegram:** @Dona101Bot — se entra con el enlace de invitación del equipo (lo tiene Brian).
- **Entrenarla** (enseñarle reglas o casos): solo Brian. Mándale las lecciones como texto o como
  tabla; él las carga.

## 10 · Lo que sabemos y lo que no

| | |
|---|---|
| ✅ medido | responde en ~5 s · se presenta como Donna · rechaza sin llave (401) · no revela su plataforma |
| ⚠️ conocido | sin reglas cargadas puede citar artículos de memoria: por eso la ley la pone el motor |
| ⬜ pendiente | tope de uso por cliente · disponibilidad garantizada a las 17:00 del 28 (tener el simulado y un video de respaldo) |
