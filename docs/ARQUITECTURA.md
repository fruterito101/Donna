# Arquitectura de Donna

Cómo está hecha Donna por dentro y qué vive en cada carpeta. Los formatos entre piezas están en
`docs/CONTRATOS.md`; el avance, en `docs/ESTADO.md`.

## 1 · El principio que ordena todo

> **La ley la decide el motor con reglas verificadas. El agente solo la explica.**

Un modelo de IA puede citar de memoria un artículo que no existe (lo medimos en pruebas). Por eso la
decisión «esto te aplica» es código determinista sobre reglas con fuente y fecha, y el agente recibe
ese resultado para contarlo en lenguaje claro.

Los cuatro principios del producto:
1. La IA no inventa reglas: solo explica normas verificadas.
2. Un cálculo no es una conclusión jurídica: todo resultado muestra sus supuestos.
3. Sin datos suficientes, se dice (el motor pregunta en vez de suponer).
4. Cada regla tiene versión y vigencia.

## 2 · Las cinco capas y el flujo de la información

```
 ENTRADAS                         CAPAS                                  SALIDAS
 landing URL ─┐
              ├─▶ 1 LEER ─────▶ 2 PERFIL ─────▶ 3 REGLAS ─────▶ 4 EXPLICAR ─┬─▶ informe (web)
 pitch PDF ───┘   texto limpio    hechos sí/no    informe         el agente  ├─▶ voz
                  con su fecha                    determinista    de Donna    ├─▶ COMPLIANCE.md
                                                                             └─▶ pitch corregido
                                  5 ATENDER: el usuario pregunta ──▶ /api/chat ──▶ el agente
```

| Capa | Entra | Hace | Sale | Dónde vive | Dueño | Estado |
|---|---|---|---|---|---|---|
| 1 · Leer | URL, PDF | trae el texto de la landing y de las fuentes oficiales | `ReadResult` | `packages/reader/` | Artur | ⬜ por crear |
| 2 · Perfil | `ReadResult` | saca los hechos sí/no según la lista de Valeria | `Profile` | backend (`apps/web/src/app/api/`) | Brian (código) · Valeria (hechos) | ⬜ |
| 3 · Reglas | `Profile` + `rules/` | cruza hechos con reglas verificadas | `Report` | `packages/rules-engine/` | Brian | 🟡 v0: motor y pruebas; falta cargar `rules/` |
| 4 · Explicar | `Report` | lo explica en lenguaje claro, sin agregar reglas | texto | `packages/agent-client/` → agente | Brian | 🟢 conexión lista |
| 5 · Atender | pregunta del usuario | conversa con memoria de la sesión | respuesta | `/api/chat`, Telegram | Brian · Artur | 🟢 `/api/chat` funciona |
| Salidas | `Report` + texto | pantalla, voz, archivos | informe, audio, `.md` | `apps/web/` | Artur | ⬜ |

## 3 · El monorepo

npm workspaces. Una sola instalación en la raíz (`npm install`).

| Carpeta | Qué es | Tecnología |
|---|---|---|
| `apps/web` | la app: páginas (frontend) y rutas `/api/*` (backend) | Next.js 16.4 · React 19 · Tailwind 4 |
| `packages/agent-client` | única puerta al agente, solo servidor | TypeScript, sin dependencias |
| `packages/rules-engine` | motor de reglas, puro y probado | TypeScript + `yaml` |
| `packages/reader` | lectura con Firecrawl + PDF | (por crear) |
| `rules/` | reglas verificadas, una por archivo | YAML |
| `agent/identity.md` | identidad de Donna; se convierte en código con `npm run identity` | Markdown |
| `bots/telegram` | el bot @Dona101Bot | Python, solo librería estándar |
| `mock/` | agente simulado | Node, sin dependencias |

Los paquetes exportan TypeScript directo; Next los compila (`transpilePackages` en
`apps/web/next.config.ts`). Las pruebas corren con el runner nativo de Node (`npm test`).

## 4 · Dónde se ejecuta cada cosa

| Pieza | Dónde |
|---|---|
| La web y su backend | Vercel — https://donna-mx.vercel.app, conectada a la rama `main`, directorio raíz `apps/web` |
| El agente | servicio externo, privado; se llega por `AGENT_URL` |
| El bot de Telegram | servidor privado del equipo (lo opera Brian) |

## 5 · Seguridad

- Las llaves viven solo en variables de entorno del servidor (`apps/web/.env.local` en local, el
  panel de Vercel en producción). `.gitignore` excluye todo `.env*`.
- El navegador nunca habla con el agente: habla con `/api/chat`.
- **Datos del usuario (propuesta para la demo):** no guardar los pitches ni las landings que suba, y
  decirlo en pantalla. Pendiente de decisión del equipo (`docs/PREGUNTAS.md` D6).
