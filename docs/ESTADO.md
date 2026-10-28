# ESTADO — dónde vamos

⭐ **La fuente de verdad del avance de Donna.** Si eres una persona o un agente de IA que llega al
proyecto, después del README lee esto. Si trabajaste, **actualízalo antes de irte** (sección 7).

**Actualizado:** 2026-10-27, noche · **Demo:** 2026-10-28, 17:00 · Sandbox Hub, Polanco

---

## 1 · En una línea

La asesora (el agente) ya funciona y el repo está listo para construir; **el producto todavía no
existe**: faltan las reglas, la lectura, el perfil, la web real, la voz y los entregables.

## 2 · Avance por pieza

| # | Pieza | Estado | Dueño | Dónde |
|---|---|---|---|---|
| 1 | El agente: identidad, memoria, API | 🟢 funciona | Brian | externo · `docs/AGENTE.md` |
| 2 | Puerta al agente (`@donna/agent-client`) | 🟢 funciona | Brian | `packages/agent-client/` |
| 3 | Backend `/api/chat` | 🟢 funciona (probado con el simulado) | Brian | `apps/web/src/app/api/chat/` |
| 4 | Bot de Telegram @Dona101Bot | 🟢 funciona | Brian | `bots/telegram/` |
| 5 | Agente simulado para desarrollar | 🟢 funciona | Brian | `mock/` |
| 6 | Motor de reglas | 🟡 v0: lógica + 7 pruebas; falta leer `rules/` | Brian | `packages/rules-engine/` |
| 7 | Reglas de ley verificadas | 🔴 0 de 25-40 | Valeria | `rules/` |
| 8 | Lista de hechos del perfil | 🟡 propuesta en `CONTRATOS.md` §2 | Valeria | `docs/CONTRATOS.md` |
| 9 | Perfil (código que saca los hechos) | 🔴 no existe | Brian | backend |
| 10 | Lectura: Firecrawl + PDF | 🔴 no existe | Artur | `packages/reader/` |
| 11 | Web del producto | 🟡 base Next + página de prueba | Artur | `apps/web/` |
| 12 | Voz con ElevenLabs | 🔴 no existe | Artur | — |
| 13 | Entregables: informe, COMPLIANCE.md, pitch corregido | 🔴 no existe | Artur | — |
| 14 | Pitch, guion, aviso legal | 🔴 no existe | Valeria | — |

`██████░░░░░░░░` **5 de 14 en verde, 3 a medias.** Lo verde es la infraestructura; lo que el jurado
evalúa es lo rojo.

## 3 · Tareas por persona

### Brian — el agente, el motor y el backend
- [x] Agente con identidad propia y API con llave
- [x] `@donna/agent-client` + `/api/chat` + simulado
- [x] Motor de reglas v0 con pruebas
- [ ] Motor: cargar las reglas de `rules/*.yaml` (saltar los que empiezan con `_`)
- [ ] Perfil: convertir `ReadResult` en `Profile` con la lista de hechos de Valeria
- [ ] `/api/report`: URL + PDF → lectura → perfil → motor → explicación → `Report`
- [ ] Entrenar al agente con las reglas verificadas y los 3 casos
- [ ] Tope de uso del agente · servidor disponible el 28 a las 17:00

### Artur — la lectura y el producto
- [ ] `packages/reader`: landing con Firecrawl → `ReadResult` (`CONTRATOS.md` §4)
- [ ] Leer el texto del PDF del pitch
- [ ] La web: pegar URL, subir PDF, ver el informe, preguntar (reemplaza la página de prueba)
- [ ] La voz con ElevenLabs: leer el resumen y responder
- [ ] Entregables: descargar informe, COMPLIANCE.md y pitch corregido
- [ ] Publicar las 3 landings ficticias en una URL (Firecrawl lee URLs)
- [ ] Video de respaldo de la demo completa

### Valeria — idea, legal, reglas y perfil
- [ ] Llevar el debate de las 23 preguntas 🔴 (`docs/PREGUNTAS.md`)
- [ ] Ajustar la lista de hechos del perfil (`CONTRATOS.md` §2)
- [ ] 10 reglas hoy, 25-40 mañana, con fuente oficial y fecha (tabla → un dev las convierte)
- [ ] Verificar el estímulo a I+D: artículo correcto, porcentaje, años de antecedentes
- [ ] Los 3 casos ficticios (startup de IA, fintech cripto, freelance que exporta)
- [ ] Aviso legal del informe · pitch y guion de 3 min · 3 entrevistas en la sede

### Los tres
- [ ] Aprobar los contratos v0 (`docs/CONTRATOS.md`)
- [ ] Confirmar el registro de los tres en MLH (sin él no se compite)
- [ ] 28-oct: integrar 13:00-15:00 · **congelar 15:00** · ensayar 3 veces · **demo 17:00**

## 4 · Bloqueos

| Bloqueo | Bloquea a | Lo destraba | Desde |
|---|---|---|---|
| Contratos v0 sin aprobar | todos (trabajo en paralelo) | los tres, 30 min | 27-oct |
| 0 reglas verificadas | motor, entrenamiento, demo | Valeria | 27-oct |
| Lista de hechos sin confirmar | perfil | Valeria | 27-oct |
| Con qué se hace la web (¿Lovable?) | web | Artur | 27-oct |

## 5 · Decisiones tomadas

| Fecha | Decisión | Por qué | Quién |
|---|---|---|---|
| 27-oct | Se llama **Donna**; repo público, licencia **MIT** | el hackathon pide donar el proyecto | Brian |
| 27-oct | Retos: **ElevenLabs + Firecrawl** (+ MLH open source por la licencia) | el premio más alto + leer la web con créditos gratis | Brian |
| 27-oct | La ley la decide el **motor con reglas verificadas**; el agente solo explica | un modelo puede citar artículos de memoria (medido) | equipo |
| 27-oct | El agente tiene dos papeles: **conocimiento** y **atención al cliente** | una sola asesora para explicar y conversar | Brian |
| 27-oct | Monorepo **Next.js 16 + Tailwind 4**: frontend + backend + capa del agente | un solo repo, un solo despliegue | Brian |
| 27-oct | Brian y Artur escriben **todo el código**; Valeria lleva idea, legal, reglas y perfil | cada quien en lo que sabe | Brian |
| 27-oct | Fuera del hackathon: estrategia financiera, pipeline de ventas, leads, Monte Carlo | solo hay 4 h de construcción el 28 | equipo |
| 27-oct | Donna en Telegram con su **propio bot**, acceso por enlace de invitación | probarla sin instalar nada | Brian |

## 6 · Bitácora

- **2026-10-27 noche** — Se definió la idea (documento de Artur + libreta + retroalimentación). Se creó
  el agente de Donna con identidad propia, su API con llave y su bot de Telegram. Se armó el monorepo:
  Next.js + Tailwind, puerta al agente, motor de reglas v0 (7 pruebas en verde), simulado, `/api/chat`
  probado de punta a punta con el simulado, y esta documentación.

## 7 · Cómo actualizar este archivo (personas y agentes de IA)

Al terminar una sesión de trabajo:
1. **Sección 2:** cambia el estado de la pieza que tocaste (🔴 → 🟡 → 🟢) y su nota.
2. **Sección 3:** marca `[x]` lo terminado; agrega tareas nuevas en la persona dueña.
3. **Sección 4:** agrega lo que te bloqueó (qué, a quién, quién lo destraba) o quita lo resuelto.
4. **Sección 5:** si se decidió algo, una fila con su **por qué**.
5. **Sección 6:** una línea con la fecha, qué se hizo y cómo se probó.
6. Cambia la fecha de **Actualizado** arriba.

Nunca borres filas de Decisiones ni de Bitácora: son la historia. Nunca escribas aquí llaves, URLs
privadas ni datos personales.
