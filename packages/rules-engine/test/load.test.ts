// Loading rules/ from disk: fixtures are written to a temp folder, never to the real rules/.
import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, writeFileSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { loadRules, renderRulesModule } from "../src/load.ts";

const CATALOG = "fact_a:\n  question: ¿a?\n";
const rule = (id: string, extra = "") =>
  `id: ${id}\nauthority: SAT\nkind: obligation\ntitle: t\nrequires: r\napplies_if: [fact_a]\nevidence: []\nlaw: l\n` +
  `source: https://example.test/ley\nvalid_from: 2026-01-01\nverified_by: ""\n${extra}`;

function folder(files: Record<string, string>): string {
  const dir = mkdtempSync(join(tmpdir(), "donna-rules-"));
  for (const [name, text] of Object.entries(files)) writeFileSync(join(dir, name), text);
  return dir;
}

test("loads every rule, sorted, and skips files starting with «_»", () => {
  const dir = folder({ "_hechos.yaml": CATALOG, "_plantilla.yaml": "not: a rule", "b-rule.yaml": rule("b-rule"), "a-rule.yaml": rule("a-rule"), "notas.txt": "x" });
  const { rules, facts } = loadRules(dir);
  assert.deepEqual(rules.map((r) => r.id), ["a-rule", "b-rule"]);
  assert.deepEqual(Object.keys(facts), ["fact_a"]);
});

test("without the fact catalog nothing loads", () => {
  assert.throws(() => loadRules(folder({ "a.yaml": rule("a") })), /the fact catalog is missing/);
});

test("the id must match the file name", () => {
  assert.throws(() => loadRules(folder({ "_hechos.yaml": CATALOG, "uif.yaml": rule("sat") })), /uif.yaml: id 'sat' must match the file name/);
});

test("every broken rule is reported at once, each by its file", () => {
  const dir = folder({
    "_hechos.yaml": CATALOG,
    "uno.yaml": rule("uno").replace("authority: SAT\n", ""),
    "dos.yaml": rule("dos").replace("[fact_a]", "[fact_zz]"),
    "tres.yaml": rule("tres"),
  });
  assert.throws(() => loadRules(dir), (e: Error) =>
    /2 rule\(s\) with errors/.test(e.message) &&
    /dos.yaml: applies_if: fact 'fact_zz' is not in/.test(e.message) &&
    /uno.yaml: missing field 'authority'/.test(e.message));
});

test("the real rules/ folder loads, and the committed generated module is up to date", () => {
  const here = dirname(fileURLToPath(import.meta.url));
  const loaded = loadRules(join(here, "..", "..", "..", "rules"));
  const committed = readFileSync(join(here, "..", "src", "rules.generated.ts"), "utf8");
  assert.equal(committed, renderRulesModule(loaded), "run `npm run rules` and commit src/rules.generated.ts");
});
