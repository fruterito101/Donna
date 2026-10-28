# Pendientes — lo que falta decidir y revisar

⭐ **La única lista de lo que sigue abierto.** Si algo está pendiente, vive aquí; si no está aquí, no
está pendiente. Las preguntas completas, con su porqué y su propuesta, viven en
[`PREGUNTAS.md`](PREGUNTAS.md): aquí solo va una línea y el enlace, para no tener dos copias que digan
cosas distintas.

**Actualizado:** 2026-10-28, 12:30 · **Demo:** 2026-10-28, 17:00 · congelar a las 15:00

**Prioridad:** 🔴 sin esto no se puede construir o presentar · 🟡 antes de la demo · 🟢 después.

---

## 1 · 🔴 Urgente — frena el trabajo de hoy

| # | Pendiente | Qué frena | Lo destraba |
|---|---|---|---|
| D2 | ¿Quién verifica cada regla de ley, y contra qué fuente? | **todo**: sin reglas verificadas el motor no tiene qué cruzar y la demo no tiene contenido | Valeria |
| — | **Verificar y firmar los 9 borradores** de `rules/` (hay 0 firmados; sin firma no se muestran). Cada uno trae sus dudas en `x_nota` | la demo: el informe sale vacío en producción | Valeria (o quien compare con la fuente) |
| — | Faltan reglas para llegar a 25-40 (hay 9) | el alcance de los 6 temas | Valeria |
| — | Aprobar los contratos ([`CONTRATOS.md`](CONTRATOS.md)); la regla ya es v1 (28-oct) | trabajar en paralelo sin romper la parte del otro | los tres |
| — | Confirmar el catálogo de hechos ([`rules/_hechos.yaml`](../rules/_hechos.yaml)): cada regla solo puede usar hechos de ahí | el paso PERFIL y las reglas | Valeria |
| — | Aprobar el [`README.md`](../README.md) como la definición de Donna | que los tres construyan la misma idea | los tres |
| D1 | ¿Qué aviso legal exacto lleva cada informe, y quién lo redacta? | el informe: es lo que separa «herramienta» de «asesoría sin cédula» | Valeria |
| D4 | ¿Qué significaba «lineamientos/prompts/policies»? ¿Quién lo dijo? | qué es el `COMPLIANCE.md` | quien lo dijo |
| E5 | Plan B si algo no responde a las 17:00 (propuesta: video + respuestas guardadas) | la demo | Artur |
| F1 | ¿Qué se dona exactamente? (propuesta: motor, reglas y web) | el pitch y la licencia | los tres |
| G1 | ¿Quién presenta y cuánto dura? | el guion | los tres |
| H1 | ¿Cuántas horas tiene cada quien hoy? | el plan del día | los tres |
| H2 | ¿Los tres están registrados en MLH? Sin registro no se compite | competir | los tres |
| H3 | ¿Dónde coordinamos (chat, tablero)? | la comunicación | los tres |

## 2 · 🟡 Antes de la demo

| # | Pendiente | Lo destraba |
|---|---|---|
| A4 | ¿Qué palabra describe a Donna? Valeria notó que «asesora» roza la asesoría regulada; falta elegir | Valeria |
| B2 | ¿En qué etapa está el personaje de la demo: idea, MVP o ya factura? Cambia qué obligaciones aplican | Valeria |
| C4 | ¿Leemos también su repositorio de GitHub? Es evidencia de I+D, pero cuesta tiempo | los tres |
| D3 | ¿Tenemos contador o abogado aliado? ¿Lo nombramos en la demo? | Valeria |
| D5 | «Propiedad intelectual»: ¿la del usuario o la nuestra al donar? | Valeria |
| D6 | ¿Qué hacemos con los pitches que suben? (propuesta: no guardar nada y decirlo en pantalla) | los tres |
| E3 | ¿Voz solo para leer el informe, o conversación hablada? | Artur |
| E4 | ¿Gemma 4 para sacar los hechos del pitch? (suma un reto, ~1 h) | Brian |
| F3 | ¿Cómo contamos el agente en el pitch? | Valeria |
| G2 | ¿Cuál es el momento «wow»? (propuesta: pegar una página y oír en voz el estímulo y la UIF) | los tres |
| G3 | ¿Qué número mostramos? Solo con fuente | Valeria |
| — | ¿Sumamos algún reto opcional (Gemma 4, n8n, MojoAuth, Lovable)? | los tres |
| — | DOF: medir los términos de uso y el límite de peticiones de SIDOF antes de usarlo en producción | Brian |
| — | ¿Qué cuenta como **fuente oficial** en una regla? Hoy el motor acepta cualquier `https://`. Se decide junto con la lectura de Artur, que lee las páginas oficiales con Firecrawl para fechar cada regla ([`DEFINICION.md`](DEFINICION.md)) | Brian y Artur |

## 3 · 🟢 Después del hackathon

| # | Pendiente |
|---|---|
| F2 | ¿Las reglas llevan una licencia de datos (ej. CC-BY) además del MIT del código? |
| G4 | ¿El nombre «Donna» se queda? ¿Qué historia cuenta? |
| H4 | ¿Qué pasa con Donna después del 28: producto o solo hackathon? ¿Cómo se reparte? |
| — | DOF, lo que sigue del cliente: el **MCP** (consultar publicaciones, una nota, buscar), el **vigilante de reglas** (marca «posible reforma: revisar» cuando el DOF publica algo de una ley que cita una regla), la skill `/dof` y la memoria en bloque (cada pieza marcada «publicación oficial, no revisada») |

## 4 · Por revisar — ya está hecho de una forma, falta confirmarla

| Qué | Cómo está hoy | Lo confirma |
|---|---|---|
| Publicación del dominio integrado | Distribución aprobada e implementada en la rama `feat/domain-routing`; falta revisión, merge a `main` y comprobación del despliegue público | Artur y Brian |
| E2 · formato de las reglas y lenguaje del motor | reglas en YAML, escritas desde una hoja de cálculo (`npm run rules:import`), y motor en TypeScript, el mismo lenguaje del backend | Brian y Artur |
| Formato del `COMPLIANCE.md` y del pitch corregido | sin proponer | Artur |
| Titular de la licencia MIT | `LICENSE` dice «Copyright (c) 2026 Fruterito», el nombre de la cuenta de GitHub. ¿Queda así, o «Brian, Artur y Valeria», o «los autores de Donna»? Es quién aparece como autor de lo donado | los tres |
| La licencia en cada paquete | la raíz declara `MIT`; `apps/web`, `agent-client`, `rules-engine` y `dof` no declaran ninguna. Si alguien los toma por separado, no ve la licencia | Brian |
| Qué cubre la MIT | todo lo que está en el repo: código, reglas (`rules/`) y la identidad de Donna (`agent/identity.md`). **No** cubre el agente, que es un servicio externo y no se dona (ver F1) | los tres |

---

## Cómo se usa este archivo

1. **Cerrar un pendiente:** escribe la respuesta en [`PREGUNTAS.md`](PREGUNTAS.md) debajo de su
   pregunta (o en el archivo que corresponda), **borra la fila de aquí** y deja una línea en la
   Bitácora de [`ESTADO.md`](ESTADO.md).
2. **Abrir uno:** una fila en la sección de su prioridad, con qué frena y quién lo destraba.
3. **Cambia la fecha de Actualizado.**
