# Contratos — los formatos que conectan las piezas

**Versión v0 · propuesta del 27-oct.** Se fijan los tres juntos (Brian, Artur, Valeria) antes de
construir en paralelo. Un contrato que cambia sin avisar rompe el trabajo de otra persona: cualquier
cambio se propone en `docs/ESTADO.md` → Bloqueos. Los tipos viven en
`packages/rules-engine/src/index.ts` — si este documento y el código difieren, **manda el código** y
este documento se corrige.

```
   Valeria ──[Regla]──────────────┐
                                  ▼
   Artur ──[Texto leído]──▶ Brian: PERFIL ──[Perfil]──▶ MOTOR ──[Informe]──▶ Artur: web · voz · archivos
                                  ▲                                  │
   Valeria ──[Lista de hechos]────┘                                  └──▶ el agente lo explica
```

---

## 1 · La regla (`rules/*.yaml`) — la llena Valeria, la lee el motor

Una regla = un archivo, y **el nombre del archivo es su `id`**. Valeria las llena en una hoja de
cálculo con estas columnas (`rules/_plantilla.csv`) y `npm run rules:import -- hoja.csv` las convierte
(`rules/README.md`). **v1 · 28-oct** (Brian): se agregan `verified_on`, `valid_until`, `frequency`,
`consequence`, `source_quote` y la negación `!hecho`.

| Campo | Qué es | Ejemplo de forma |
|---|---|---|
| `id` | nombre corto, único, en minúsculas con guiones = nombre del archivo | `uif-activos-virtuales` |
| `authority` | `SAT` · `IMSS` · `UIF` · `DATOS` · `PI` · `ESTIMULO` | `UIF` |
| `kind` | `obligation` (obligación) o `benefit` (beneficio) | `obligation` |
| `title` | título corto para la pantalla | |
| `requires` | qué pide la ley, en español claro | |
| `applies_if` | **hechos del catálogo** (§2) que deben cumplirse todos: `hecho` = sí, `!hecho` = no. Un «o» se escribe como dos reglas | `[ofrece_servicios_de_activos_virtuales, "!factura_en_mexico"]` |
| `evidence` | qué guardar como prueba | `[...]` |
| `law` | ley y artículo exactos | |
| `source` | la página **oficial** exacta (empieza con `https://`) | |
| `source_quote` | *opcional* · el texto **exacto** de la fuente que respalda la regla: quien verifica compara la cita con la página, la lectura de fuentes puede comprobar que sigue ahí, y el agente explica citándola | `Artículo 17. …` |
| `valid_from` | desde cuándo está vigente la ley, `AAAA-MM-DD` | |
| `verified_by` | quién la comprobó contra la fuente; vacío = no verificada | |
| `verified_on` | cuándo la comprobó, `AAAA-MM-DD` — **obligatorio** en cuanto `verified_by` tiene nombre | |
| `valid_until` | *opcional* · desde el día siguiente la regla está vencida | |
| `frequency` | *opcional* · `once` · `monthly` · `bimonthly` · `annual` · `per_event` | `monthly` |
| `consequence` | *opcional* · qué pasa si no se cumple: `description`, `law` y `source` propios (una multa es un número, y un número necesita fuente) | |

**Campos de extensión:** cualquier campo que empiece con `x_` (por ejemplo `x_consultada_el`) se acepta y se
conserva sin tocar este contrato: así otra pieza puede anotar datos en una regla. Otro campo desconocido sí
rompe el build (una errata como `verifed_by` borraría el dato en silencio).

**Una regla mal escrita rompe el build** (`npm run build` de `apps/web`, el que corre Vercel): falta un
campo, un campo desconocido, una fecha que no existe, un hecho fuera del catálogo o un `id` distinto al
nombre del archivo. El error nombra el archivo y el campo, y producción se queda con el último despliegue
bueno. Una regla **sin verificar o vencida** sí se carga, pero **no se muestra en producción** (§5).

## 2 · La lista de hechos — la define Valeria, la programa Brian

Cada hecho es una pregunta de sí/no sobre la startup, con un nombre en código. Vive en
**`rules/_hechos.yaml`** (el catálogo): cada hecho con su `question` (lo que Donna pregunta cuando no
se sabe) y sus `signals`. Una regla solo puede usar hechos del catálogo. Propuesta inicial (Valeria la
ajusta en el catálogo):

| Hecho | Pregunta | Señales en un pitch (ejemplos) |
|---|---|---|
| `cobra_al_extranjero` | ¿cobra a clientes fuera de México? | «clientes en EE. UU.», precios en USD |
| `guarda_datos_personales` | ¿guarda datos de personas? | registro de usuarios, perfiles, correos |
| `ofrece_servicios_de_activos_virtuales` | ¿compra, vende, guarda o envía cripto **de sus clientes**? | exchange, wallet para usuarios, custodia |
| `recibe_pagos_en_cripto` | ¿le pagan con cripto por lo que vende? | «aceptamos cripto», USDT, stablecoins |
| `tiene_ingresos` | ¿ya cobra por lo que vende? | precios, planes de pago |
| `infraestructura_en_mexico` | ¿servidores, equipo y personas están en México? | hosting en México |
| `desarrolla_software` | ¿crea su propio software? | app, plataforma, SaaS, modelo propio |
| `hace_id_tecnologico` | ¿desarrolla tecnología nueva con incertidumbre técnica? | modelo propio, algoritmo nuevo, I+D |
| `tiene_empleados` | ¿contrata personas? | «equipo de N», vacantes |
| `factura_en_mexico` | ¿emite facturas en México? | precios en MXN, clientes mexicanos |
| `tiene_marca_propia` | ¿usa un nombre o logo comercial? | nombre del producto |

## 3 · El perfil — sale de PERFIL, entra al motor

```ts
type Profile = Record<string, boolean | undefined>;
// { cobra_al_extranjero: true, recibe_pagos_en_cripto: true, hace_id_tecnologico: undefined, ... }
```

`undefined` = no se sabe todavía. El motor **pregunta en vez de suponer**.

**Lo que llega de afuera es flexible** (28-oct, Brian): el perfil lo arman la lectura, un modelo que
extrae o el usuario contestando, y nadie controla esa forma. `buildProfile({ detected, answered }, FACTS)`
la convierte en el `Profile` estricto y **nunca truena**:

| Llega | Se entiende como |
|---|---|
| `true` · `"sí"` · `"Si"` · `"yes"` · `1` · `"x"` | sí |
| `false` · `"no"` · `"falso"` · `0` | no |
| `undefined` · `null` · `""` · `"no sé"` · `"?"` · `"N/A"` | no se sabe → Donna pregunta |
| `{ value, source?, confidence?, evidence? }` | el valor, con su origen; con `confidence` menor a 0.5 (ajustable) → no se sabe |
| `"Tiene Empleados"`, `"cobra-al-extranjero"` | el hecho del catálogo, sin importar mayúsculas, acentos ni separadores |

La respuesta del usuario (`answered`) **manda** sobre lo detectado (`detected`), y un «no sé» del usuario no
borra lo detectado. Lo que no se puede usar (un hecho fuera del catálogo, un valor ilegible, una detección
con poca confianza) sale en `notes`: se reporta, nunca se adivina.

## 4 · El texto leído — sale de Artur (lector), entra a PERFIL

```ts
type ReadResult = {
  url: string;          // la landing leída
  markdown: string;     // su texto limpio
  pitchText?: string;   // el texto del PDF, si lo subieron
  fetchedAt: string;    // fecha ISO de la lectura
};
```

## 5 · El informe — sale del motor, entra a la web, la voz y los archivos

```ts
type Report = {
  obligations: ReportItem[];   // lo que le exige la ley
  benefits: ReportItem[];      // lo que podría aprovechar
  questions: string[];         // hechos que faltan: preguntarle al usuario
  unverified: string[];        // ids de reglas sin verificar: no se muestran en producción
  expired: string[];           // ids de reglas vencidas (valid_until): no se muestran en producción
};
type ReportItem = {
  rule: RuleCard;              // la regla completa, con su fuente y su fecha
  status: "applies" | "needs_data";
  missing_facts: string[];
};
```

**Producción muestra solo `publicReport(report)`**: quita las reglas sin verificar y las vencidas, y
las preguntas que solo ellas pedían. La web obtiene el texto de cada pregunta de `FACTS[hecho].question`
(`@donna/rules-engine/rules`).

La web muestra cada `ReportItem` con `rule.title`, `rule.requires`, `rule.law`, `rule.source` y
`rule.valid_from`. La explicación en lenguaje claro la pide el backend al agente (`docs/AGENTE.md` §6).

## 5-bis · La comprobación de fuentes nunca bloquea

Cuando la lectura de fuentes compruebe una regla contra su página oficial (con Firecrawl y su llave), el
resultado es un **estado**, nunca un error: `comprobada` (la cita sigue en la página) · `no_encontrada` (la
página cambió: la regla se marca para revisión) · `sin_comprobar` (no hay llave, Firecrawl no respondió o no
se ha corrido). Ningún estado detiene el informe ni el build; se guarda en la regla como campo `x_`.

## 5-ter · `POST /api/report` — lo que llama la web

La web (o la lectura) manda los hechos como los tenga; el backend corre el motor y devuelve el informe listo
para pintar. Código: `apps/web/src/app/api/report/route.ts` · lógica pura: `buildReport` y `explainBrief`
en `packages/rules-engine/src/report.ts`.

```ts
// petición — todo opcional; flexible como en §3
{ detected?: RawProfile,   // lo que sacó la lectura de la página y del pitch
  answered?: RawProfile,   // lo que contestó el usuario: manda sobre lo detectado
  explain?: boolean }      // true = Donna explica el informe en lenguaje claro

// respuesta
{ report: Report,                      // §5, ya filtrado: en producción SOLO reglas firmadas
  ask: { fact, question }[],           // lo que falta preguntar, en español, listo para mostrar
  notes: ProfileNote[],                // lo recibido que no se pudo usar (nunca se adivina)
  origin: Record<hecho, "answered" | "detected">,
  drafts_shown: boolean,               // true solo en desarrollo: la pantalla debe decirlo
  rules_total: number, rules_verified: number,   // p. ej. «9 reglas, 0 firmadas»
  explanation: string | null,          // el texto de Donna, si se pidió
  explanation_error?: string }         // por qué no hay explicación; el informe sale igual
```

- **La explicación nunca bloquea el informe:** si Donna no responde, `explanation` es `null` y llega
  `explanation_error`. Si no hay nada que explicar, no se le llama (no se gasta la suscripción).
- **Donna explica, no decide:** recibe solo las reglas del informe —cada **beneficio con su texto completo** (sus
  condiciones son lo que impide prometerlo), cada obligación con lo esencial, su ley y su multa— y la instrucción de
  no agregar leyes, cifras ni plazos, **no hacer cálculos ni ejemplos con cifras** y decir siempre las condiciones. Abre con los beneficios y cierra con las obligaciones.
  El resumen mide **como máximo 2,000 caracteres** (`MAX_BRIEF`): con la identidad de Donna el mensaje queda bajo
  los 4,000 que acepta el agente. Si no cabe todo, nombra cuántos puntos más hay en pantalla. La cita y el enlace
  no viajan a Donna: los muestra la pantalla.
- **Borradores en desarrollo:** con `next dev` y `DONNA_SHOW_DRAFTS=1` el informe incluye las reglas sin
  firmar (`drafts_shown: true`). En producción eso no tiene efecto, aunque la variable exista.
- **Límites:** cuerpo ≤ 20 KB (413), `detected` y `answered` deben ser objetos de ≤ 100 hechos (400).

## 6 · Pendiente de fijar

- ⬜ Los tres aprueban esta versión (o la cambian). §1 pasó a v1 el 28-oct por decisión de Brian.
- ⬜ El formato del **pitch corregido** y del **COMPLIANCE.md** (Artur propone).
