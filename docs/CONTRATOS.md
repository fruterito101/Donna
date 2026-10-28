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
`consequence` y la negación `!hecho`.

| Campo | Qué es | Ejemplo de forma |
|---|---|---|
| `id` | nombre corto, único, en minúsculas con guiones = nombre del archivo | `uif-activos-virtuales` |
| `authority` | `SAT` · `IMSS` · `UIF` · `DATOS` · `PI` · `ESTIMULO` | `UIF` |
| `kind` | `obligation` (obligación) o `benefit` (beneficio) | `obligation` |
| `title` | título corto para la pantalla | |
| `requires` | qué pide la ley, en español claro | |
| `applies_if` | **hechos del catálogo** (§2) que deben cumplirse todos: `hecho` = sí, `!hecho` = no. Un «o» se escribe como dos reglas | `[opera_activos_virtuales, "!factura_en_mexico"]` |
| `evidence` | qué guardar como prueba | `[...]` |
| `law` | ley y artículo exactos | |
| `source` | la página **oficial** exacta (empieza con `https://`) | |
| `valid_from` | desde cuándo está vigente la ley, `AAAA-MM-DD` | |
| `verified_by` | quién la comprobó contra la fuente; vacío = no verificada | |
| `verified_on` | cuándo la comprobó, `AAAA-MM-DD` — **obligatorio** en cuanto `verified_by` tiene nombre | |
| `valid_until` | *opcional* · desde el día siguiente la regla está vencida | |
| `frequency` | *opcional* · `once` · `monthly` · `bimonthly` · `annual` · `per_event` | `monthly` |
| `consequence` | *opcional* · qué pasa si no se cumple: `description`, `law` y `source` propios (una multa es un número, y un número necesita fuente) | |

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
| `opera_activos_virtuales` | ¿recibe, guarda o transfiere cripto? | «pagos en cripto», wallet, stablecoins |
| `hace_id_tecnologico` | ¿desarrolla tecnología nueva con incertidumbre técnica? | modelo propio, algoritmo nuevo, I+D |
| `tiene_empleados` | ¿contrata personas? | «equipo de N», vacantes |
| `factura_en_mexico` | ¿emite facturas en México? | precios en MXN, clientes mexicanos |
| `tiene_marca_propia` | ¿usa un nombre o logo comercial? | nombre del producto |

## 3 · El perfil — sale de PERFIL, entra al motor

```ts
type Profile = Record<string, boolean | undefined>;
// { cobra_al_extranjero: true, opera_activos_virtuales: true, hace_id_tecnologico: undefined, ... }
```

`undefined` = no se sabe todavía. El motor **pregunta en vez de suponer**.

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

## 6 · Pendiente de fijar

- ⬜ Los tres aprueban esta versión (o la cambian). §1 pasó a v1 el 28-oct por decisión de Brian.
- ⬜ El formato del **pitch corregido** y del **COMPLIANCE.md** (Artur propone).
