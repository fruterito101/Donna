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

Una regla = un archivo. Valeria puede llenarlas en una tabla (hoja de cálculo o Word) con estas
columnas y un dev las convierte.

| Campo | Qué es | Ejemplo de forma |
|---|---|---|
| `id` | nombre corto, único, en minúsculas con guiones | `uif-activos-virtuales` |
| `authority` | `SAT` · `IMSS` · `UIF` · `DATOS` · `PI` · `ESTIMULO` | `UIF` |
| `kind` | `obligation` (obligación) o `benefit` (beneficio) | `obligation` |
| `title` | título corto para la pantalla | |
| `requires` | qué pide la ley, en español claro | |
| `applies_if` | lista de **hechos del perfil** que deben ser todos verdaderos | `[opera_activos_virtuales]` |
| `evidence` | qué guardar como prueba | `[...]` |
| `law` | ley y artículo exactos | |
| `source` | enlace **oficial** (empieza con `https://`) | |
| `valid_from` | fecha de vigencia `AAAA-MM-DD` | |
| `verified_by` | quién la comprobó contra la fuente; vacío = no verificada | |

El motor rechaza una regla sin `source` oficial o sin algún campo, y nombra el campo que falta. Una
regla con `verified_by` vacío sale marcada en el informe y **no puede llegar a la demo**.

## 2 · La lista de hechos — la define Valeria, la programa Brian

Cada hecho es una pregunta de sí/no sobre la startup, con un nombre en código. Propuesta inicial
(Valeria la ajusta):

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
  unverified: string[];        // ids de reglas sin verificar: no mostrar en la demo
};
type ReportItem = {
  rule: RuleCard;              // la regla completa, con su fuente y su fecha
  status: "applies" | "needs_data";
  missing_facts: string[];
};
```

La web muestra cada `ReportItem` con `rule.title`, `rule.requires`, `rule.law`, `rule.source` y
`rule.valid_from`. La explicación en lenguaje claro la pide el backend al agente (`docs/AGENTE.md` §6).

## 6 · Pendiente de fijar

- ⬜ Los tres aprueban esta v0 (o la cambian).
- ⬜ El formato del **pitch corregido** y del **COMPLIANCE.md** (Artur propone).
