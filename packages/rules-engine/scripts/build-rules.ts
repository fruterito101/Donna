// Validates rules/ and turns it into src/rules.generated.ts. Runs inside the web's own build
// (apps/web `npm run build`), the one Vercel runs: a broken rule breaks the build, so production
// keeps the last good deploy (Brian, 2026-10-28). `--check` writes nothing and fails if the
// committed file is stale.
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { loadRules, renderRulesModule } from "../src/load.ts";

const here = dirname(fileURLToPath(import.meta.url));
const rulesDir = join(here, "..", "..", "..", "rules");
const out = join(here, "..", "src", "rules.generated.ts");

let loaded;
try {
  loaded = loadRules(rulesDir);
} catch (e) {
  console.error(`rules: ✗ ${(e as Error).message}`);
  process.exit(1);
}

const { facts, rules } = loaded;
const day = new Date().toISOString().slice(0, 10);
const unverified = rules.filter((r) => !r.verified_by.trim()).length;
const expired = rules.filter((r) => r.valid_until && r.valid_until < day).map((r) => r.id);
const text = renderRulesModule(loaded);

if (process.argv.includes("--check")) {
  const current = existsSync(out) ? readFileSync(out, "utf8") : "";
  if (current !== text) {
    console.error("rules: ✗ src/rules.generated.ts is stale — run `npm run rules`");
    process.exit(1);
  }
} else {
  writeFileSync(out, text);
}
console.log(
  `rules: ${rules.length} rule(s) · ${rules.length - unverified} verified · ${unverified} unverified (hidden in production) · ` +
    `${Object.keys(facts).length} fact(s)`,
);
if (expired.length) console.warn(`rules: ⚠ expired, hidden in production: ${expired.join(", ")}`);
