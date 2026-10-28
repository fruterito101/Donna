# Donna

**Tu asesora de cumplimiento para startups tecnológicas en México.**

> **Donna lee tu startup y te dice qué te exige la ley mexicana, qué dinero estás dejando ir y qué
> documentar — con la fuente oficial de cada cosa — y te lo deja listo para tu contador.**

Donna **no firma opiniones legales ni fiscales**: prepara el trabajo para que un profesional con cédula
lo revise. Proyecto de **Hacktoberfest México 2026** (Mexico Tech Week · Mobil3 + MLH) · licencia **MIT** ·
demo el **28 de octubre de 2026, 17:00**.

⭐ **Este README es la fuente de verdad de QUÉ es Donna y CÓMO funciona.** Lo leen personas y agentes
de IA antes de tocar nada. Si algo aquí ya no es cierto, se corrige en un PR — nunca se deja para después.

| Si quieres saber… | Lee |
|---|---|
| qué es Donna, para quién, cómo funciona, el mapa | **este archivo** |
| cómo vamos: tareas, avance, bloqueos | [`docs/ESTADO.md`](docs/ESTADO.md) |
| qué falta decidir o revisar | [`docs/PENDIENTES.md`](docs/PENDIENTES.md) |
| cómo arrancarlo en tu máquina | [§ 8](#8--arrancar-en-3-minutos) |

---

## 1 · Qué es Donna

Donna es un **diagnóstico**: entras con lo que tu startup ya tiene (su página web y su pitch), Donna lo
lee y sales con un informe. **Enseña mientras explica** cada punto, pero no es un curso: la parte de
academia queda para una fase 2.

| Donna SÍ | Donna NO |
|---|---|
| lee tu página y tu pitch y entiende qué haces, cómo cobras y a quién | firma una opinión fiscal o legal |
| te dice qué obligaciones te aplican: SAT · IMSS · UIF · datos personales · propiedad intelectual | dice que «tienes derecho» a un beneficio: lo señala **con sus condiciones** |
| te señala dinero que puedes estar dejando ir, como el estímulo fiscal a la investigación y desarrollo (I+D) | inventa una regla: si no la tiene, lo dice |
| te dice qué evidencia guardar y qué te falta | hace trámites por ti |
| te lo explica en voz y responde tus preguntas | adivina un dato de tu startup: si no lo sabe, te pregunta |

## 2 · Para quién es

| | Respuesta | Por qué |
|---|---|---|
| **Quién la usa y quién paga** | el **founder** de la startup | es quien carga el riesgo y quien deja ir el dinero |
| **El contador** | aliado, no cliente | recibe el expediente ya armado y trabaja más rápido |
| **País** | solo México | la ley de cada país es distinta |
| **Precio de partida** | gratis · $299 · $1,499 MXN al mes | una propuesta para validar con entrevistas, no un precio fijado |

**El personaje de la demo:** el founder de una startup de software con inteligencia artificial que
además cobra en cripto. Lo elegimos porque una sola persona toca tres temas a la vez: **SAT**
(impuestos), **UIF** (la Unidad de Inteligencia Financiera, que vigila a quien ofrece servicios con cripto) y el
**estímulo a I+D**.

## 3 · Qué te dice primero

**Abre con el dinero y cierra con el riesgo.**

1. *«Estás dejando ir un estímulo fiscal por investigación y desarrollo»* — lo que puedes ganar.
2. *«Esto le debes al SAT»* · *«si además ofreces servicios con cripto a tus clientes, te falta avisar a la UIF»* —
   lo que te puede meter en problemas. Ojo: la ley de la UIF alcanza a quien **ofrece** comprar, vender, guardar o
   enviar cripto de sus clientes; solo **recibir** cripto como pago no aparece en esa fracción. Donna lo distingue
   y, si no sabe cuál es tu caso, te pregunta.

Por qué en ese orden: «recupera dinero» engancha más que «evita multas», aunque las multas sean lo más
frecuente. El informe guarda los dos por separado (`benefits` y `obligations`); la web y la voz muestran
primero los beneficios.

## 4 · Cómo funciona, paso a paso

```
 ① El founder pega la URL de su página y sube el PDF de su pitch
        │
 ② LEER ─────────── trae el texto limpio de la página y del PDF, con su fecha
        │
 ③ PERFIL ───────── lo convierte en hechos de sí/no:
        │           ¿cobra en cripto? ¿cobra al extranjero? ¿hace I+D? ¿tiene empleados?…
        │           si un hecho no se sabe, Donna PREGUNTA en vez de suponer
        │
 ④ MOTOR ────────── cruza esos hechos con las REGLAS DE LEY verificadas
        │           (cada regla: qué pide, a quién aplica, artículo, enlace oficial, fecha,
        │            quién la verificó)
        │
 ⑤ INFORME ──────── beneficios (el dinero) · obligaciones (el riesgo) · lo que falta preguntar
        │
 ⑥ EXPLICAR ─────── el agente de Donna lo cuenta en lenguaje claro, y en voz
        │
 ⑦ ENTREGAR ─────── el founder se lleva el informe y su COMPLIANCE.md
                    (la lista de qué documentar, para guardarla en su repositorio)

     y en cualquier momento: el founder PREGUNTA ──▶ Donna responde (web, voz, Telegram)
```

| Paso | Qué entra | Qué sale | Dónde vive | Lo construye |
|---|---|---|---|---|
| ② Leer | URL + PDF | texto leído (`ReadResult`) | `packages/reader/` (con Firecrawl) | Artur |
| ③ Perfil | texto leído | hechos sí/no (`Profile`) | backend, `apps/web/src/app/api/` | Brian (código) · Valeria (qué hechos) |
| ④ Motor | perfil + `rules/` | informe (`Report`) | `packages/rules-engine/` | Brian |
| ④ Reglas | la ley, verificada | un archivo `.yaml` por regla | `rules/` | Valeria (contenido) |
| ⑥ Explicar | informe | texto claro | `packages/agent-client/` → el agente | Brian |
| ⑥ Voz | texto | audio | con ElevenLabs | Artur |
| ⑦ Entregar | informe | pantalla, informe, `COMPLIANCE.md` | `apps/web/` | Artur |

Los formatos exactos de lo que pasa de un paso a otro están en [`docs/CONTRATOS.md`](docs/CONTRATOS.md).

### ⭐ La regla que ordena todo: la ley la decide el motor, nunca la IA

Un modelo de IA puede citar de memoria un artículo de ley que no existe — **nos pasó en las pruebas**.
Por eso la decisión «esto te aplica» la toma el motor, que es código determinista, con reglas que una
persona del equipo comprobó contra la fuente oficial. El agente **solo explica** lo que el motor ya
decidió. Una regla sin verificar sale marcada y **no llega a la demo**.

## 5 · El mapa

### Quién le pasa qué a quién

Donna son piezas que construyen personas distintas. Lo que las une son los **contratos**: el formato
exacto en que cada quien le entrega su parte al siguiente. Si un contrato cambia sin avisar, se rompe el
trabajo de otra persona — por eso se cambian solo en un PR que lo diga.

```
   Valeria ──[reglas de ley]──────────────┐
   Valeria ──[lista de hechos sí/no]──┐   │
                                      ▼   ▼
   Artur ──[texto leído]──▶ Brian: PERFIL ──▶ MOTOR ──[informe]──▶ Artur: web · voz · archivos
                                                  │
                                                  └──▶ Brian: el agente lo explica
```

### Dónde vive la verdad

| Archivo | Responde | Se actualiza cuando… |
|---|---|---|
| `README.md` | qué es Donna y cómo funciona | cambia la idea o el flujo |
| [`docs/ESTADO.md`](docs/ESTADO.md) | cómo vamos: avance, tareas, bloqueos, decisiones, bitácora | alguien termina de trabajar |
| [`docs/PENDIENTES.md`](docs/PENDIENTES.md) | qué falta decidir o revisar, y quién lo destraba | se abre o se cierra un pendiente |
| [`docs/PREGUNTAS.md`](docs/PREGUNTAS.md) | cada pregunta de diseño, su porqué y su respuesta | se responde una pregunta |
| [`docs/CONTRATOS.md`](docs/CONTRATOS.md) | los formatos entre piezas | los tres aprueban un cambio |
| [`docs/ARQUITECTURA.md`](docs/ARQUITECTURA.md) | las capas por dentro y dónde corre cada cosa | cambia una capa |
| [`docs/COMUNICACION.md`](docs/COMUNICACION.md) | cómo hablar con Donna desde el código: mandar, recibir, verificar, sin exponer nada | cambia cómo se habla con Donna |
| [`docs/AGENTE.md`](docs/AGENTE.md) | la API de Donna en detalle | cambia la conexión |
| [`docs/DEFINICION.md`](docs/DEFINICION.md) | el producto completo: mercado, patrocinadores, más allá de la demo | cambia la visión |

Si dos archivos se contradicen: sobre **qué es Donna** manda este README; sobre **el avance** manda
`docs/ESTADO.md`; sobre **un formato** manda el código de `packages/rules-engine/src/`.

### El repositorio

```
Donna/
├── apps/web/                 la app — Next.js 16 + Tailwind 4: páginas y rutas /api/* (backend)
├── packages/
│   ├── agent-client/         la única puerta al agente (solo servidor)
│   ├── rules-engine/         el motor: perfil + reglas → informe
│   └── reader/               (por crear) lectura de la página con Firecrawl y del PDF
├── rules/                    las reglas de ley verificadas, una por archivo (YAML) — se donan
├── agent/identity.md         quién es Donna — viaja con cada mensaje al agente
├── bots/telegram/            Donna en Telegram
├── mock/                     agente simulado para desarrollar sin llaves
└── docs/                     la documentación del proyecto (tabla de arriba)
```

## 6 · Qué entra en la demo del 28 de octubre

| Seguro | Si da tiempo | Fuera del hackathon |
|---|---|---|
| informe · voz · `COMPLIANCE.md` | pitch corregido · enviar a revisión profesional | academia · estrategia financiera · ventas · prospectos · otros países |

- **Temas de ley:** los 6 — SAT, IMSS, UIF, datos personales, propiedad intelectual y estímulo a I+D —
  con pocas reglas de cada uno: mostrar el alcance completo luce más que profundizar en uno solo.
- **Tres startups ficticias** para que la demo no dependa de una real: ① software con IA que hace I+D ·
  ② fintech que cobra en cripto · ③ desarrollador freelance que vende al extranjero.

## 7 · De dónde partimos y dónde vamos

La idea nació el 27 de octubre de tres fuentes: la propuesta de Artur (enseñar, simular, documentar),
la libreta del equipo (un diagnóstico con entregables) y la retroalimentación del arranque del evento.
Valeria resolvió esa tensión la misma noche: **Donna diagnostica y enseña al explicar**. Sus respuestas
están en [`docs/PREGUNTAS.md`](docs/PREGUNTAS.md); este README las toma como punto de partida.

El avance real vive en [`docs/ESTADO.md`](docs/ESTADO.md) y lo que falta decidir en
[`docs/PENDIENTES.md`](docs/PENDIENTES.md). No se copian aquí: un número copiado envejece.

**Pruébala:** https://donna-mx.vercel.app — hoy es una página de prueba para conversar con Donna; el
informe todavía no existe.

## 8 · Arrancar en 3 minutos

Requisitos: **Node.js 22.18 o mayor** y npm.

```bash
git clone https://github.com/fruterito101/Donna.git
cd Donna
npm install
npm run mock          # terminal 1 — agente simulado, no necesita llaves
npm run dev           # terminal 2 — abre http://localhost:3000
```

Crea `apps/web/.env.local` con estas variables. Con el simulado, estos valores funcionan tal cual:

```bash
AGENT_URL=http://127.0.0.1:8787
AGENT_TOKEN=dev-mock-key
AGENT_SIGNING_SECRET=dev-signing-secret
```

Para hablar con **el agente real**, Brian te pasa en privado `AGENT_URL`, `AGENT_TOKEN` y `AGENT_SIGNING_SECRET`. Nunca se
suben al repo. Todas las variables están en [`docs/AGENTE.md`](docs/AGENTE.md#variables-de-entorno).

```bash
npm test              # pruebas
npm run build         # compila todo (debe pasar antes de un PR)
```

## 9 · Cómo se sube un cambio

Donna va a ser un producto, así que cada cambio entra limpio:

1. **Un PR, un propósito.** Todo lo que viene dentro sirve a ese propósito. Lo que no, va en otro PR o
   se anota en [`docs/PENDIENTES.md`](docs/PENDIENTES.md). Nada regado.
2. **Todo PR empieza con `## Por qué`**: qué problema resuelve y por qué ahora. La plantilla de PR ya
   trae las secciones.
3. **Poco a poco:** PRs chicos que se pueden revisar, no uno enorme al final.
4. **Verificado antes de pedir revisión:** `npm test` y `npm run build` en verde. Si algo no se probó, el PR lo dice.
5. **La documentación viaja con el cambio:** si el PR cambia qué es Donna, actualiza este README; si
   avanza el trabajo, `docs/ESTADO.md`.

Rama por tarea (`feat/<área>-<qué>`, `docs/<qué>`) → PR a `main` → otra persona revisa → merge. Nunca
directo a `main`. Detalle para agentes de IA en [`AGENTS.md`](AGENTS.md).

## 10 · Equipo

| Persona | Rol |
|---|---|
| **Brian** | dev — el agente, el perfil, el motor de reglas y el backend |
| **Artur** | dev — la lectura con Firecrawl, la web, la voz y los entregables |
| **Valeria** | la idea, la parte legal, las reglas de ley y la lista de hechos del perfil |

¿Eres un agente de IA? Empieza por [`AGENTS.md`](AGENTS.md).

**Patrocinadores que usamos:** **Firecrawl** (leer la web) · **ElevenLabs** (la voz de Donna) · **MLH**
(open source).
