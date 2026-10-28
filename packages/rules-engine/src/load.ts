// Reads rules/ from disk. Node only: the web never calls this at runtime — it imports the
// RULES/FACTS that scripts/build-rules.ts generates from it at build time.
import { readdirSync, readFileSync, existsSync } from "node:fs";
import { join, basename } from "node:path";
import { parseFacts, parseRule, type FactCatalog, type RuleCard } from "./index.ts";

export const CATALOG_FILE = "_hechos.yaml";

export type LoadedRules = { facts: FactCatalog; rules: RuleCard[] };

/**
 * Load the fact catalog and every rule card of a folder. Files starting with «_» are not
 * rules (the template, the catalog). Collects EVERY error and throws them together, so whoever
 * writes the rules fixes them in one pass instead of one per build.
 */
export function loadRules(dir: string): LoadedRules {
  const catalogPath = join(dir, CATALOG_FILE);
  if (!existsSync(catalogPath)) throw new Error(`${catalogPath}: the fact catalog is missing`);
  const facts = parseFacts(readFileSync(catalogPath, "utf8"), CATALOG_FILE);

  const errors: string[] = [];
  const rules: RuleCard[] = [];
  const files = readdirSync(dir).filter((f) => f.endsWith(".yaml") && !f.startsWith("_")).sort();
  for (const file of files) {
    try {
      const rule = parseRule(readFileSync(join(dir, file), "utf8"), file, facts);
      // id = file name: two cards can never share an id, and the file is found from the report
      if (rule.id !== basename(file, ".yaml")) throw new Error(`${file}: id '${rule.id}' must match the file name`);
      rules.push(rule);
    } catch (e) {
      errors.push((e as Error).message);
    }
  }
  if (errors.length) throw new Error(`${errors.length} rule(s) with errors:\n- ${errors.join("\n- ")}`);
  return { facts, rules };
}

/** The TypeScript module the web imports: the loaded catalog and rules as data. */
export function renderRulesModule({ facts, rules }: LoadedRules): string {
  return (
    "// GENERATED from rules/ by `npm run rules` — edit rules/*.yaml, never this file.\n" +
    'import type { FactCatalog, RuleCard } from "./index.ts";\n\n' +
    `export const FACTS: FactCatalog = ${JSON.stringify(facts, null, 2)};\n\n` +
    `export const RULES: RuleCard[] = ${JSON.stringify(rules, null, 2)};\n`
  );
}
