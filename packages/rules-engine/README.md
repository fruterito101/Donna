# @donna/rules-engine

El motor de reglas: **perfil (hechos sí/no) + reglas verificadas → informe**. Dueño: Brian.

Determinista a propósito: la misma entrada da siempre el mismo informe, y ningún modelo de IA decide
qué ley aplica (`docs/ARQUITECTURA.md` §1).

- `evaluate(profile, rules)` → `Report` — una regla aplica si todos sus hechos son verdaderos; un
  «no» conocido la descarta; un hecho desconocido la deja en `needs_data` y lo agrega a `questions`
  (pregunta, no supone); una regla sin `verified_by` sale en `unverified`.
- `parseRule(yaml, origen)` → `RuleCard` — valida la regla y nombra el campo que falta.

Formatos: `docs/CONTRATOS.md`. Pruebas: `npm test` (runner nativo de Node, sin dependencias extra).

**Siguiente paso:** una función que cargue todas las reglas de `rules/*.yaml` (saltando los archivos
que empiezan con `_`) — ver `docs/ESTADO.md`.
