# AGENTS.md — instrucciones para agentes de IA (y personas) que trabajan en Dona

Este repositorio lo programan personas **y** agentes de IA. Si eres un agente, este archivo es tu
punto de partida: léelo completo antes de tocar nada.

## 1 · Qué es esto, en una línea

**Dona** lee la landing y el pitch de una startup tecnológica mexicana y le dice qué le exige la ley,
qué beneficios está dejando ir y qué documentar — con la fuente oficial de cada cosa — listo para su
contador o abogado. Proyecto del Hacktoberfest México 2026; demo el **28 de octubre de 2026, 17:00**.

## 2 · Orden de lectura (antes de escribir código)

1. `README.md` — qué es, cómo arrancar, mapa del repo.
2. **`docs/ESTADO.md`** — ⭐ dónde vamos: tareas por persona, bloqueos, decisiones, bitácora. **Es la fuente de verdad del avance.**
3. `docs/ARQUITECTURA.md` — las capas, el flujo de la información, qué vive en cada carpeta.
4. `docs/CONTRATOS.md` — los formatos que conectan las piezas (regla, perfil, informe).
5. `docs/AGENTE.md` — **solo si tu tarea toca al agente**: cómo conectarse, pedirle cosas y usarlo.
6. `docs/DEFINICION.md` — el producto completo (alcance, mercado, patrocinadores).
7. `apps/web/AGENTS.md` — ⚠️ esta versión de Next.js (16.4) cambia APIs: lee su documentación local en `node_modules/next/dist/docs/` antes de escribir código de Next.

## 3 · Reglas que no se rompen

1. **Nunca escribas una llave, token, URL privada o contraseña en el repo**, en un commit, un issue o un log. Los valores reales viven en `apps/web/.env.local` (ignorado por git) y los comparte Brian en privado. Si necesitas uno y no lo tienes, **detente y pídelo**: no lo inventes ni lo busques.
2. **El agente solo se llama desde el servidor**, siempre a través de `@dona/agent-client`. Nunca desde un componente de cliente, nunca con variables `NEXT_PUBLIC_*`.
3. **La IA no decide qué ley aplica.** Lo decide `@dona/rules-engine` con las reglas verificadas de `rules/`. El agente solo **explica** lo que el motor ya decidió. Nunca agregues texto legal escrito por un modelo como si fuera una regla.
4. **Los contratos de `docs/CONTRATOS.md` no se cambian solos.** Si tu tarea necesita cambiar uno, propónlo en `docs/ESTADO.md` (sección Bloqueos) y avisa: rompe el trabajo de otra persona.
5. **Respeta los dueños** (sección 4). Si tu tarea cae en la parte de otra persona, déjalo anotado en `docs/ESTADO.md` en vez de reescribirla.
6. **No hables del proveedor ni de la infraestructura del agente** en código, comentarios, docs o pitch. Para este repo es «el agente de Dona», un servicio externo al que se llega por `AGENT_URL`.
7. **Al terminar una sesión de trabajo, actualiza `docs/ESTADO.md`**: marca lo hecho, lo que quedó a medias, lo que te bloqueó y una línea en la Bitácora. Un agente que trabaja y no deja rastro obliga al siguiente a adivinar.
8. **Verifica antes de decir «listo»**: `npm test` y `npm run build` en verde. Si no corriste algo, dilo.

## 4 · Quién es dueño de qué

| Persona | Rol | Carpetas que le pertenecen |
|---|---|---|
| **Brian** | dev — el agente y el motor | `packages/agent-client/` · `packages/rules-engine/` · `agent/` · `bots/` · `apps/web/src/app/api/` (backend) |
| **Artur** | dev — la lectura y el producto | `apps/web/` (frontend) · `packages/reader/` (Firecrawl + PDF) · la voz (ElevenLabs) · los entregables |
| **Valeria** | idea, legal y perfil (no programa) | `rules/` (contenido de las reglas) · `docs/PREGUNTAS.md` · la lista de hechos del perfil |

Si eres el agente de Brian o de Artur, trabaja en sus carpetas. Lo que Valeria entrega (reglas en una
tabla, lista de hechos) lo pasa a código un dev.

## 5 · Comandos

```bash
npm install          # una vez, en la raíz
npm run mock         # agente simulado en http://127.0.0.1:8787 (sin llave real, sin costo)
npm run dev          # la web en http://localhost:3000
npm test             # pruebas de los paquetes
npm run build        # compila todo; debe quedar en verde antes de un PR
```

## 6 · Idioma y estilo

- **Documentación y textos de la app:** español.
- **Código, nombres de variables, commits:** inglés.
- Cada archivo nuevo empieza con un comentario de una o dos líneas que dice para qué existe.
- Commits: `tipo(área): qué cambia` — ej. `feat(engine): load rules from rules/`.

## 7 · Flujo de cambios

Rama por tarea (`feat/<área>-<qué>`) → PR a `main` → otra persona revisa → merge. Nunca empujes
directo a `main`. Un PR lleva: qué cambia, cómo se probó y qué actualizaste en `docs/ESTADO.md`.
