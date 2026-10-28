# @donna/rules-engine

El motor de reglas: **perfil (hechos sí/no) + reglas verificadas → informe**. Dueño: Brian.

Determinista a propósito: la misma entrada da siempre el mismo informe, y ningún modelo de IA decide
qué ley aplica (`docs/ARQUITECTURA.md` §1).

- `evaluate(profile, rules, on?)` → `Report` — una regla aplica si todos sus hechos se cumplen
  (`hecho` = sí, `!hecho` = no); una respuesta contraria la descarta; un hecho desconocido la deja en
  `needs_data` y lo agrega a `questions` (pregunta, no supone); una regla sin `verified_by` sale en
  `unverified` y una pasada su `valid_until` en `expired`.
- `publicReport(report)` → lo único que se muestra en producción: sin reglas sin verificar ni vencidas.
- `validateRule(objeto, origen, catálogo?)` / `parseRule(yaml, …)` → `RuleCard` — valida la regla y
  nombra el campo que falla. `parseFacts(yaml)` valida el catálogo.
- `@donna/rules-engine/rules` → `RULES` y `FACTS`, **generados** de `rules/` (`src/rules.generated.ts`,
  no se edita a mano). Es lo que importa la web: no lee el disco en producción.
- `@donna/rules-engine/load` → `loadRules(carpeta)` (solo Node) — carga el catálogo y todas las reglas,
  salta los archivos que empiezan con `_` y reporta **todos** los errores juntos.

Comandos:

| Comando | Qué hace |
|---|---|
| `npm run rules` | valida `rules/` y regenera `src/rules.generated.ts` (también corre dentro del build de `apps/web`) |
| `npm run rules:import -- hoja.csv` | convierte la hoja de reglas en `rules/*.yaml`; no escribe nada si una fila falla |
| `npm test` | pruebas (runner nativo de Node); una de ellas falla si el archivo generado quedó viejo |

Formatos: `docs/CONTRATOS.md`.
