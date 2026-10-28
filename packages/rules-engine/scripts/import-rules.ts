// `npm run rules:import -- hoja.csv` — turns the rules spreadsheet (exported as CSV) into
// rules/*.yaml, then regenerates what the web imports. Writes nothing if any row is wrong.
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { loadRules, renderRulesModule, CATALOG_FILE } from "../src/load.ts";
import { parseFacts } from "../src/index.ts";
import { importSheet } from "../src/sheet.ts";

const here = dirname(fileURLToPath(import.meta.url));
const rulesDir = join(here, "..", "..", "..", "rules");
const file = process.argv[2];
if (!file) {
  console.error("usage: npm run rules:import -- path/to/sheet.csv");
  process.exit(1);
}

try {
  const facts = parseFacts(readFileSync(join(rulesDir, CATALOG_FILE), "utf8"), CATALOG_FILE);
  const r = importSheet(readFileSync(resolve(process.env.INIT_CWD ?? process.cwd(), file), "utf8"), rulesDir, facts);
  console.log(`import: ${r.created.length} new · ${r.updated.length} updated · ${r.unchanged.length} unchanged`);
  for (const w of r.warnings) console.warn(`import: ⚠ ${w}`);
  if (r.notInSheet.length) console.warn(`import: ⚠ in rules/ but not in the sheet (kept): ${r.notInSheet.join(", ")}`);
  writeFileSync(join(here, "..", "src", "rules.generated.ts"), renderRulesModule(loadRules(rulesDir)));
  console.log("import: src/rules.generated.ts regenerated");
} catch (e) {
  console.error(`import: ✗ ${(e as Error).message}`);
  process.exit(1);
}
