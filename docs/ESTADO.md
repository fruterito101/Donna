# ESTADO — dónde vamos

⭐ **La fuente de verdad del avance de Donna.** Qué es Donna vive en el `README.md`; lo que falta
decidir, en `docs/PENDIENTES.md`. Si eres una persona o un agente de IA que llega al
proyecto, después del README lee esto. Si trabajaste, **actualízalo antes de irte** (sección 7).

**Actualizado:** 2026-10-28, 02:00 · **Demo:** 2026-10-28, 17:00 · Sandbox Hub, Polanco

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
| 27-oct | Donna **diagnostica** y enseña al explicar; la academia es fase 2 (A1) | la demo muestra un diagnóstico con entregables | Valeria |
| 27-oct | Abre con el **dinero** (estímulo a I+D) y cierra con el **riesgo** (UIF/SAT) (A2) | «recupera dinero» engancha más que «evita multas» | Valeria |
| 27-oct | Usa y paga el **founder**; el contador es aliado (A3) | el founder carga el riesgo | Valeria |
| 27-oct | Personaje de la demo: founder de SaaS/IA que cobra en cripto (B1) | toca SAT, UIF e I+D a la vez | Valeria |
| 27-oct | Demo segura: informe + voz + COMPLIANCE.md · los 6 temas · 3 casos ficticios (C1-C3) | 4 horas de construcción | Valeria |
| 28-oct | Todo PR lleva `## Por qué` y un solo propósito; se sube poco a poco | Donna va a ser un producto | Brian |

## 6 · Bitácora

- **2026-10-27 noche** — Se definió la idea (documento de Artur + libreta + retroalimentación). Se creó
  el agente de Donna con identidad propia, su API con llave y su bot de Telegram. Se armó el monorepo:
  Next.js + Tailwind, puerta al agente, motor de reglas v0 (7 pruebas en verde), simulado, `/api/chat`
  probado de punta a punta con el simulado, y esta documentación.
- **2026-10-28 madrugada** — Valeria respondió A1-A3, B1-B5 y C1-C5 (`docs/PREGUNTAS.md`). El `README.md`
  pasa a ser la fuente de verdad de qué es Donna (paso a paso y mapa) y nace `docs/PENDIENTES.md` con
  todo lo que sigue abierto. Regla nueva: un PR, un propósito, con su porqué.
- **2026-10-28 madrugada** — Cada visitante de la web tiene su propia conversación: su llave es una cookie
  firmada que crea el servidor, y ante el agente es un cliente aparte con identidad firmada. Antes el
  navegador elegía el hilo y se podía leer una conversación ajena. Probado: 12/12 pruebas, 2 sabotajes
  cazados, y de punta a punta contra el agente real (un visitante no ve lo de otro; una cookie falsa
  empieza de cero).
- **2026-10-28 mañana** — Guía `docs/COMUNICACION.md`: cómo mandar, recibir y verificar con Donna sin
  exponer nada, con instrucciones para el agente de IA de quien programa. `currentVisitor()` es el único
  lugar que dice quién es el visitante. Cada dev tiene su propia llave de desarrollo (la de Artur, creada
  y probada desde internet: es su propio cliente y no puede hacerse pasar por un visitante).

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
