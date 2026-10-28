# rules/ — las reglas de ley de Donna

Cada archivo `.yaml` es **una regla verificada**: una obligación o un beneficio que la ley mexicana
le aplica a una startup tecnológica, con su fuente oficial y su fecha. Es lo que el motor
(`packages/rules-engine`) cruza con el perfil de cada startup, y es lo que **donamos** como open source.

## Por qué existen

Un modelo de IA puede citar de memoria un artículo que no existe. Por eso Donna no deja que la IA
decida la ley: la decide una regla escrita y verificada por una persona del equipo, y la IA solo la
explica.

## Qué hay aquí

| Archivo | Qué es |
|---|---|
| `<id>.yaml` | una regla. El nombre del archivo es su `id` |
| `_hechos.yaml` | el **catálogo de hechos**: las preguntas de sí/no que las reglas pueden usar en `applies_if` |
| `_plantilla.csv` | la fila de encabezados de la hoja de cálculo |
| `_plantilla.yaml` | la plantilla para escribir una regla a mano |

## Cómo se agregan reglas — desde una hoja de cálculo (la forma normal)

1. Abre `_plantilla.csv` en Excel o Google Sheets: **una fila por regla**, una columna por campo
   (`docs/CONTRATOS.md` §1). Las listas (`applies_if`, `evidence`) van en una celda, separadas por `|`
   o en líneas distintas dentro de la celda.
2. Exporta como CSV (Excel en español usa `;`, Google Sheets usa `,`: los dos sirven).
   **La hoja puede estar en español:** encabezados como `Título`, `Autoridad`, `Tipo`, `Aplica si`,
   `Fuente`, `Cita`, `Verificado por`; valores como `obligación`, `beneficio`, `sat`, `mensual`; fechas
   `28/10/2026`; hechos como `tiene empleados` o `no factura en méxico`. Si no pones `id`, sale del título.
   Una columna que no es del contrato (tus notas) se ignora con un aviso; una que empieza con `x_` se guarda.
3. `npm run rules:import -- ruta/a/la-hoja.csv`. Crea un `<id>.yaml` por fila y regenera lo que usa
   la web. **Si una sola fila está mal, no escribe nada** y dice qué fila (como la numera la hoja) y qué
   campo. Corrige y vuelve a correrlo: importar la misma hoja dos veces no cambia nada.
4. Una regla que está aquí pero ya no en la hoja **no se borra**: el comando la nombra y la borras tú.

## Cómo se escribe una a mano

1. Copia `_plantilla.yaml` con el nombre de la regla (`uif-activos-virtuales.yaml`).
2. Llena **todos** los campos obligatorios; borra los opcionales que no uses.
3. Corre `npm run rules` (valida y regenera) y `npm test`.

## Lo que el motor exige

- **`source` es la página oficial exacta** (SAT, DOF, IMSS, UIF, IMPI, INDAUTOR…), nunca un blog.
  Qué dominios cuentan como oficiales se decide junto con la lectura de fuentes de Artur
  (`docs/PENDIENTES.md`).
- **`verified_by` lleva el nombre de quien la comprobó contra esa fuente, y `verified_on` la fecha.**
  Vacío = no verificada: se carga, pero **no se muestra en producción**.
- **`source_quote` lleva el texto exacto de la fuente** que respalda la regla. Verificar es comparar:
  ¿la página dice esto?, ¿la regla dice lo mismo que la cita?
- `applies_if` solo usa hechos de `_hechos.yaml`: `hecho` = la respuesta es sí, `!hecho` = es no.
  ¿Necesitas un hecho nuevo? Agrégalo primero al catálogo.
- **Una regla mal escrita rompe el build**: Vercel no despliega y producción se queda con la versión
  anterior. El error nombra el archivo y el campo.

## Lo que nunca va aquí

- Texto legal escrito por un modelo de IA sin verificar contra la fuente.
- Reglas «de ejemplo» con datos inventados: confunden al motor y al lector. Los ejemplos de prueba
  viven en `packages/rules-engine/test/`.
- Los archivos que empiezan con `_` no son reglas: el motor no los carga como reglas.
