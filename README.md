# Dona

**Tu asesora de cumplimiento para startups tecnológicas en México.**

Dona lee la landing y el pitch de tu startup y te dice **qué te exige la ley** (SAT, IMSS, UIF, datos
personales, propiedad intelectual), **qué beneficios estás dejando ir** (como el estímulo a la
investigación y desarrollo) y **qué tienes que documentar** — cada cosa con su fuente oficial y su
fecha — y te deja un expediente listo para tu contador o abogado.

> Dona no firma opiniones legales ni fiscales: prepara el trabajo para que un profesional con cédula
> lo revise.

Proyecto de **Hacktoberfest México 2026** (Mexico Tech Week · Mobil3 + MLH). Licencia **MIT**.

---

## Estado

🚧 En construcción para la demo del **28 de octubre de 2026, 17:00**. El avance real, las tareas y los
bloqueos viven en **[`docs/ESTADO.md`](docs/ESTADO.md)**.

## Arrancar en 3 minutos

Requisitos: **Node.js 22.18 o mayor** y npm.

```bash
git clone https://github.com/fruterito101/Dona.git
cd Dona
npm install
npm run mock          # terminal 1 — agente simulado, no necesita llaves
npm run dev           # terminal 2 — abre http://localhost:3000
```

Crea `apps/web/.env.local` con estas variables. Con el simulado, estos valores funcionan tal cual:

```bash
AGENT_URL=http://127.0.0.1:8787
AGENT_TOKEN=dev-mock-key
```

Para hablar con **el agente real**, Brian te pasa en privado `AGENT_URL` y `AGENT_TOKEN`. Nunca se
suben al repo. Todas las variables están en [`docs/AGENTE.md`](docs/AGENTE.md#variables-de-entorno).

```bash
npm test              # pruebas
npm run build         # compila todo (debe pasar antes de un PR)
```

## Cómo funciona

```
 landing URL ─┐                                              ┌─▶ informe con fuente y fecha
              ├─▶ LEER ──▶ PERFIL ──▶ REGLAS ──▶ EXPLICAR ───┼─▶ la asesora en voz
 pitch PDF ───┘  Firecrawl  hechos     motor      el agente   ├─▶ COMPLIANCE.md para tu repo
                            sí/no      + reglas   de Dona     └─▶ pitch corregido
                                       verificadas
```

La ley la decide el **motor de reglas** con reglas verificadas; el **agente** solo la explica. Detalle
en [`docs/ARQUITECTURA.md`](docs/ARQUITECTURA.md).

## Mapa del repositorio

```
Dona/
├── apps/web/                 Next.js 16 + Tailwind 4 — frontend y backend (rutas /api/*)
├── packages/
│   ├── agent-client/         la única puerta al agente (solo servidor)
│   ├── rules-engine/         el motor de reglas — perfil + reglas → informe
│   └── reader/               (por crear) lectura de landing con Firecrawl y del PDF
├── rules/                    las reglas de ley verificadas (YAML) — se donan
├── agent/identity.md         quién es Dona — viaja con cada mensaje al agente
├── bots/telegram/            el bot @Dona101Bot
├── mock/                     agente simulado para desarrollar sin llaves
└── docs/                     ⭐ el lugar seguro del proyecto
    ├── ESTADO.md             avance, tareas, bloqueos, decisiones, bitácora
    ├── ARQUITECTURA.md       capas y flujo de información
    ├── CONTRATOS.md          los formatos entre piezas
    ├── AGENTE.md             cómo conectarse y usar al agente
    ├── DEFINICION.md         el producto: alcance, mercado, patrocinadores
    └── PREGUNTAS.md          las decisiones de diseño por debatir
```

## Equipo

| Persona | Rol |
|---|---|
| **Brian** | dev — el agente, el motor de reglas y el backend |
| **Artur** | dev — la lectura con Firecrawl, la web, la voz y los entregables |
| **Valeria** | la idea, la parte legal, las reglas y el perfil |

¿Eres un agente de IA? Empieza por [`AGENTS.md`](AGENTS.md).

## Patrocinadores que usamos

**Firecrawl** (leer la web) · **ElevenLabs** (la voz de Dona) · **MLH** (open source).
