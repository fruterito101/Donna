# Comunicación con Donna — guía para el equipo y sus agentes de IA

**Para quién:** quien construya algo que hable con Donna (la web, la lectura, la voz, los entregables) y
el agente de IA que le ayude a programar. Si eres un agente de IA: lee la sección 0 completa antes de
escribir una línea, y sigue los ejemplos tal cual.

**Qué resuelve:** cómo **mandar** algo a Donna, cómo **recibir** su respuesta y cómo **verificar** que
funciona, sin exponer ninguna llave ni dato privado. Si algo de aquí ya no es cierto, se corrige en un PR.

Relacionados: [`AGENTE.md`](AGENTE.md) (la API de Donna en detalle) · [`CONTRATOS.md`](CONTRATOS.md)
(los formatos entre piezas) · [`ARQUITECTURA.md`](ARQUITECTURA.md) (las capas).

---

## 0 · Las reglas que no se rompen

1. **El navegador nunca habla con Donna.** Habla con una ruta de nuestro servidor (`/api/...`), y esa
   ruta habla con Donna a través de `@donna/agent-client`. Nunca un `fetch` a Donna desde un componente.
2. **Las llaves viven solo en variables de entorno del servidor.** Nunca en el código, en un commit, en
   una prueba, en un log, en un mensaje de error ni con prefijo `NEXT_PUBLIC_`.
3. **Quién es el visitante lo dice `currentVisitor()`**, nunca el cuerpo de la petición, un parámetro
   de la URL ni la IP. El navegador no elige conversación.
4. **Siempre `askDonna()`**: mete la identidad de Donna en el mensaje y firma al visitante. Nunca armes
   la petición a mano.
5. **La ley la decide el motor de reglas, no Donna.** A Donna se le pide que *explique* lo que el motor
   ya decidió; nunca que decida qué ley aplica.
6. **Nunca le preguntes a Donna por su plataforma o su infraestructura**, ni lo pongas en código, docs o
   demo. Para este repo es «el agente de Donna», un servicio externo.
7. **Si una llave se filtra** (commit, captura, chat), avisa a Brian **de inmediato**: la revoca en
   segundos. No la «arregles» borrando el commit.

## 1 · El mapa

```
 NAVEGADOR                     NUESTRO SERVIDOR (apps/web)                       DONNA
 ─────────                     ──────────────────────────                        ─────
 fetch("/api/chat",  ───────▶  route.ts                                          
   { message })                 ├─ currentVisitor()  → id del visitante         
                                │   (cookie httpOnly firmada; la crea la 1ª vez)  
                                └─ askDonna(message, tema, { visitorId }) ──────▶ /v1/chat
                                    · pone la identidad de Donna                   · su hilo y su memoria
                                    · pone la llave (AGENT_TOKEN)                    son SOLO de ese visitante
                                    · firma al visitante (AGENT_SIGNING_SECRET)
 ◀── { reply } ◀─────────────── devuelve solo el texto ◀───────────────────────── { reply, thread }
```

Lo que **nunca** cruza hacia el navegador: la dirección de Donna, las llaves, el id del visitante (va
en una cookie que ningún script puede leer) y cualquier detalle de un error interno.

## 2 · Las llaves

| Variable | Qué es | En local, con el simulado | En local, con Donna real | En producción |
|---|---|---|---|---|
| `AGENT_URL` | dónde está Donna | `http://127.0.0.1:8787` | te la pasa Brian en privado | la pone Brian en Vercel |
| `AGENT_TOKEN` | la llave para hablar con Donna | `dev-mock-key` | **tu llave de desarrollo propia** (Brian te la pasa en privado) | la de producción, solo en Vercel |
| `AGENT_SIGNING_SECRET` | firma la cookie del visitante y su identidad ante Donna | `dev-signing-secret` | `dev-signing-secret` (con tu llave propia no se usa para identificarte) | el de producción, solo en Vercel |

- Van en `apps/web/.env.local`, que git ignora. Nunca en otro archivo.
- **Cada dev tiene su propia llave de desarrollo.** Con ella eres *tu propio cliente* de Donna: tus
  pruebas no se mezclan con las de los visitantes reales, no puedes hacerte pasar por un visitante, y
  Brian puede revocarla sola sin tocar producción. Tiene fecha de vencimiento y un tope de 6 mensajes
  por minuto.
- **Las vistas previas de Vercel (las ramas) no tienen llaves, a propósito:** ahí `/api/chat` responde
  `503 service not configured`. Las llaves de producción solo existen en Producción.

## 3 · Arrancar

### Modo A — con el simulado (sin llaves, sin costo)

```bash
npm install
npm run mock          # terminal 1 — un Donna de mentira en http://127.0.0.1:8787
npm run dev           # terminal 2 — la web en http://localhost:3000
```

`apps/web/.env.local`:

```bash
AGENT_URL=http://127.0.0.1:8787
AGENT_TOKEN=dev-mock-key
AGENT_SIGNING_SECRET=dev-signing-secret
```

El simulado responde `(simulado) Soy Donna… Recibí: «…»`. Sirve para construir la interfaz y las rutas.
**No recuerda conversaciones ni separa visitantes**: eso solo se prueba con Donna real (modo B).

### Modo B — con Donna real y tu llave

Igual que el modo A pero sin `npm run mock`, y con `AGENT_URL` y `AGENT_TOKEN` de los que te pasó Brian.
Cada mensaje gasta del cupo real: úsalo para probar de punta a punta, no para iterar la interfaz.

⚠️ Con tu llave de desarrollo **eres un solo cliente**: todos los «visitantes» de tu `localhost` son tú
y comparten conversación. Es a propósito (tu llave no puede hacerse pasar por nadie). La separación
entre visitantes existe con la llave de producción, y Brian la verifica en producción tras cada despliegue.

## 4 · Cómo MANDAR

### Una ruta nueva que habla con Donna (la plantilla)

Toda ruta que hable con Donna sigue esta forma. Cópiala y cambia solo lo marcado.

```ts
// apps/web/src/app/api/<tu-ruta>/route.ts
import { askDonna, AgentError } from "@donna/agent-client";
import { currentVisitor } from "@/lib/visitor";

export async function POST(request: Request) {
  // 1 · valida la entrada (nunca confíes en el cuerpo)
  const body = await request.json().catch(() => null);
  const text = typeof body?.text === "string" ? body.text.trim() : "";
  if (!text) return Response.json({ error: "text is required" }, { status: 400 });

  // 2 · quién es el visitante: SOLO de aquí
  const visitorId = await currentVisitor();
  if (!visitorId) return Response.json({ error: "service not configured" }, { status: 503 });

  // 3 · habla con Donna: el segundo argumento es el hilo DENTRO del espacio del visitante
  try {
    const { reply } = await askDonna(text, "<tu-hilo>", { visitorId }); // ← "web", "informe", "voz"…
    return Response.json({ reply });
  } catch (e) {
    const status = e instanceof AgentError && e.status === 400 ? 400 : 502;
    return Response.json({ error: e instanceof Error ? e.message : "agent error" }, { status });
  }
}
```

- **El hilo (`tema`) es un nombre fijo por función**, no por persona: `"web"` para el chat, `"informe"`
  para explicar un informe, `"voz"` para la conversación hablada. La separación por persona ya la hace
  `currentVisitor()`.
- Máximo 4,000 caracteres por mensaje (la ruta del chat responde 413 si se pasa).

### Pedirle que explique un informe (su papel de asesora)

```ts
import { evaluate } from "@donna/rules-engine";

const report = evaluate(profile, rules); // el motor decide la ley
const { reply } = await askDonna(
  "Explica este informe a un founder en lenguaje claro. Usa SOLO estas reglas, cita la fuente de " +
    "cada una y no agregues obligaciones que no estén aquí:\n" + JSON.stringify(report),
  "informe",
  { visitorId },
);
```

### Desde el navegador

```ts
const res = await fetch("/api/chat", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ message }), // solo el mensaje: nada de hilo ni de id
});
const data = await res.json(); // { reply } o { error }
```

## 5 · Cómo RECIBIR

| De | Llega | Forma |
|---|---|---|
| `askDonna()` en el servidor | lo que respondió Donna | `{ reply: string, thread: string }` · `reply` es **Markdown** |
| `/api/chat` en el navegador | la respuesta o el error | `{ reply }` con 200 · `{ error }` con 400 / 413 / 502 / 503 |
| un fallo de Donna | una excepción | `AgentError` con `status` (0 = no se pudo conectar). Su texto **nunca** trae la dirección ni la llave |

**Para la voz (ElevenLabs):** `reply` es Markdown. Antes de convertirlo en audio, quita `**`, `#`,
viñetas y tablas; la llamada a ElevenLabs va **en el servidor**, con `ELEVENLABS_API_KEY` en
`.env.local`, igual que las llaves de Donna.

## 6 · Cómo VERIFICAR

Con `npm run dev` corriendo (modo A o B):

```bash
# 1 · el chat responde (y crea la cookie del visitante)
curl -s -c /tmp/visitante-a -b /tmp/visitante-a http://localhost:3000/api/chat \
  -H 'Content-Type: application/json' -d '{"message":"Hola, ¿quién eres?"}'
# → {"reply":"…Donna…"}

# 2 · la cookie es httpOnly y firmada (no se imprime su valor)
grep -c '#HttpOnly_.*donna_visitor' /tmp/visitante-a      # → 1

# 3 · SOLO modo B: Donna recuerda la conversación
curl -s -c /tmp/visitante-a -b /tmp/visitante-a http://localhost:3000/api/chat \
  -H 'Content-Type: application/json' -d '{"message":"Mi startup se llama Prueba123. Recuérdalo."}'
curl -s -c /tmp/visitante-a -b /tmp/visitante-a http://localhost:3000/api/chat \
  -H 'Content-Type: application/json' -d '{"message":"¿Cómo se llama mi startup?"}'
# → debe responder «Prueba123»

rm -f /tmp/visitante-a
```

Que **dos visitantes no se vean entre sí** no se puede probar con tu llave de desarrollo (con ella
eres un solo cliente, §3). Lo cubren las pruebas automáticas (`npm test`) y Brian lo verifica en
producción tras cada despliegue.

**Antes de pedir revisión de un PR:**

```bash
npm test && npm run build                       # en verde, o el PR lo dice
git diff main... | grep -E '^\+' \
  | grep -nE 'f3k_[A-Za-z0-9]{8}|AGENT_(TOKEN|SIGNING_SECRET|URL)=' \
  | grep -vE 'dev-mock-key|dev-signing-secret|127\.0\.0\.1:8787' \
  && echo "🔴 HAY UNA LLAVE EN EL CAMBIO" || echo "🟢 sin llaves"
```

## 7 · Errores y qué hacer

| Ves | Significa | Haz |
|---|---|---|
| `503 service not configured` | falta `AGENT_SIGNING_SECRET` (o estás en una vista previa de Vercel) | revisa `.env.local`; en una vista previa es lo esperado |
| `502 AGENT_URL and AGENT_TOKEN must be set` | faltan variables | revisa `.env.local` y reinicia `npm run dev` |
| `502 agent unreachable (…)` | Donna no responde: simulado apagado o sin red | `npm run mock`, o usa el modo A |
| `502 agent answered HTTP 401` | llave equivocada o revocada | pídele a Brian que la revise; no la cambies por otra que «encontraste» |
| `502 agent answered HTTP 429` | pasaste el tope de 6 mensajes por minuto | espera un minuto |
| `400` / `413` | mensaje vacío o de más de 4,000 caracteres | valida antes de mandar |

## 8 · Cómo se conecta con lo que construye cada quien

| Pieza | Habla con Donna | Cómo, sin bloquearse |
|---|---|---|
| **Lectura** (Firecrawl + PDF) | no | devuelve `ReadResult` ([`CONTRATOS.md`](CONTRATOS.md) §4) a quien la llame; nunca habla con Donna |
| **Perfil y motor** | no | convierten `ReadResult` en `Report` ([`CONTRATOS.md`](CONTRATOS.md) §3 y §5) |
| **Informe** (`/api/report`) | sí, para explicar | mientras no exista, construye la pantalla con un `Report` de ejemplo y `evaluate()` de `@donna/rules-engine` |
| **Chat** (`/api/chat`) | sí | ya existe: úsalo tal cual desde el navegador |
| **Voz** | sí, a través de una ruta | una ruta nueva con la plantilla de §4 (hilo `"voz"`) + ElevenLabs en el servidor |
| **Entregables** | opcional | si Donna redacta algo, con la plantilla de §4; el contenido legal sale del `Report`, no de Donna |

## 9 · Lo que nunca se hace

- Llamar a Donna desde un componente del navegador, o desde cualquier lugar sin `askDonna()`.
- Poner una llave, la dirección de Donna o un secreto en código, pruebas, docs, commits o logs.
- Mandar el hilo o el id del visitante desde el navegador, o usar la IP como identidad.
- Imprimir `process.env` o devolver un error interno completo al navegador.
- Pedirle a Donna que decida qué ley aplica, o escribir texto legal de un modelo como si fuera una regla.
- Preguntarle a Donna por su plataforma, su modelo o su infraestructura.

## 10 · Instrucciones para tu agente de IA (copiar y pegar)

```text
Trabajas en el repo de Donna. Antes de escribir código lee docs/COMUNICACION.md completo.
Reglas: (1) el navegador nunca llama a Donna: crea una ruta en apps/web/src/app/api/ que use
askDonna() de @donna/agent-client; (2) el visitante sale SOLO de currentVisitor() de @/lib/visitor,
nunca del body, la URL o la IP; (3) las llaves solo en variables de entorno del servidor: nunca las
escribas, imprimas, loguees ni pongas en pruebas, y nunca uses NEXT_PUBLIC_ para ellas; si te falta
una, detente y pídela; (4) el segundo argumento de askDonna es un hilo fijo por función ("web",
"informe", "voz"); (5) la ley la decide @donna/rules-engine, Donna solo explica; (6) no hables de la
plataforma ni la infraestructura del agente. Para probar sin llaves usa el simulado (npm run mock).
Antes de terminar: npm test && npm run build en verde, y el chequeo de llaves de la sección 6.
```

## 11 · Si algo se filtra o deja de funcionar

Avisa a Brian. Él puede **suspender, revocar o rotar** cualquier llave de desarrollo en segundos, sin
tocar producción, y cada cambio queda registrado. Una llave revocada no vuelve: se crea otra.
