# rules/ — las reglas de ley de Dona

Cada archivo `.yaml` es **una regla verificada**: una obligación o un beneficio que la ley mexicana
le aplica a una startup tecnológica, con su fuente oficial y su fecha. Es lo que el motor
(`packages/rules-engine`) cruza con el perfil de cada startup, y es lo que **donamos** como open source.

## Por qué existen

Un modelo de IA puede citar de memoria un artículo que no existe. Por eso Dona no deja que la IA
decida la ley: la decide una regla escrita y verificada por una persona del equipo, y la IA solo la
explica.

## Cómo se escribe una

1. Copia `_plantilla.yaml` con el nombre de la regla (`uif-activos-virtuales.yaml`).
2. Llena **todos** los campos. El formato completo está en `docs/CONTRATOS.md` §1.
3. **`source` es un enlace oficial** (SAT, DOF, IMSS, UIF, IMPI, INDAUTOR…), nunca un blog.
4. **`verified_by` lleva el nombre de quien la comprobó contra esa fuente.** Vacío = no verificada:
   el informe la marca y no puede llegar a la demo.
5. Corre `npm test`: el motor rechaza una regla con un campo faltante y te dice cuál.

¿No programas? Llena las reglas en una tabla (hoja de cálculo o Word) con las columnas de
`docs/CONTRATOS.md` §1 y pásala a un dev: se convierten en minutos.

## Lo que nunca va aquí

- Texto legal escrito por un modelo de IA sin verificar contra la fuente.
- Reglas «de ejemplo» con datos inventados: confunden al motor y al lector. Los ejemplos de prueba
  viven en `packages/rules-engine/test/`.
- Los archivos que empiezan con `_` (como la plantilla) el motor los salta.
