// Importing the rules spreadsheet. Fixtures are invented; they go to a temp folder.
import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { parseFacts } from "../src/index.ts";
import { parseCsv, importSheet, COLUMNS } from "../src/sheet.ts";
import { loadRules } from "../src/load.ts";

const CATALOG = "fact_a:\n  question: ¿a?\nfact_b:\n  question: ¿b?\n";
const facts = parseFacts(CATALOG);
const HEADER = COLUMNS.join(";");
const row = (cells: Partial<Record<(typeof COLUMNS)[number], string>>) => {
  const base = {
    id: "uno", authority: "SAT", kind: "obligation", title: "Título", requires: "Pide algo", applies_if: "fact_a",
    evidence: "acta", law: "Ley X art. 1", source: "https://example.test/ley", valid_from: "2026-01-01", verified_by: "",
  };
  const all = { ...base, ...cells } as Record<string, string>;
  return COLUMNS.map((c) => {
    const v = all[c] ?? "";
    return /[;"\n]/.test(v) ? `"${v.replace(/"/g, '""')}"` : v;
  }).join(";");
};
const rulesDir = () => {
  const dir = mkdtempSync(join(tmpdir(), "donna-sheet-"));
  writeFileSync(join(dir, "_hechos.yaml"), CATALOG);
  return dir;
};

test("parseCsv: Excel in Spanish («;», BOM, CRLF, quotes, line breaks inside a cell)", () => {
  const rows = parseCsv('\uFEFFa;b\r\n"x;1";"di ""hola""\r\notra"\r\n');
  assert.deepEqual(rows, [["a", "b"], ["x;1", 'di "hola"\r\notra']]);
});

test("parseCsv: Google Sheets («,»)", () => {
  assert.deepEqual(parseCsv("a,b\n1,\"2,3\"\n"), [["a", "b"], ["1", "2,3"]]);
});

test("a sheet becomes rule files the loader accepts, lists split by «|» or line breaks", () => {
  const dir = rulesDir();
  const csv = [HEADER,
    row({ applies_if: "fact_a | !fact_b", evidence: "acta\ncontrato" }),
    row({ id: "dos", verified_by: "Valeria", verified_on: "2026-10-28", frequency: "monthly", source_quote: "Artículo 2; texto",
      consequence_description: "multa", consequence_law: "art. 2", consequence_source: "https://example.test/multa" }),
  ].join("\n");
  const r = importSheet(csv, dir, facts);
  assert.deepEqual(r.created.sort(), ["dos", "uno"]);
  const { rules } = loadRules(dir);
  const uno = rules.find((x) => x.id === "uno")!;
  assert.deepEqual(uno.applies_if, ["fact_a", "!fact_b"]);
  assert.deepEqual(uno.evidence, ["acta", "contrato"]);
  assert.equal("verified_on" in uno, false, "empty optional cells are left out");
  assert.equal(rules.find((x) => x.id === "dos")!.source_quote, "Artículo 2; texto");
  assert.deepEqual(rules.find((x) => x.id === "dos")!.consequence, { description: "multa", law: "art. 2", source: "https://example.test/multa" });
  assert.deepEqual(importSheet(csv, dir, facts).unchanged.sort(), ["dos", "uno"], "re-importing the same sheet changes nothing");
});

test("one bad row writes NOTHING and every error names its spreadsheet row", () => {
  const dir = rulesDir();
  const csv = [HEADER, row({}), row({ id: "dos", authority: "SHCP" }), row({ id: "tres", applies_if: "fact_typo" })].join("\n");
  assert.throws(() => importSheet(csv, dir, facts), (e: Error) =>
    /2 row\(s\) with errors, nothing was written/.test(e.message) && /row 3 \(dos\)/.test(e.message) && /row 4 \(tres\)/.test(e.message));
  assert.deepEqual(readdirSync(dir), ["_hechos.yaml"]);
});

test("a repeated id across rows is rejected", () => {
  assert.throws(() => importSheet([HEADER, row({}), row({})].join("\n"), rulesDir(), facts), /row 3: id 'uno' already used in row 2/);
});

test("a missing required column is rejected; an unknown one is ignored with a warning", () => {
  assert.throws(() => importSheet("id;title\nx;t\n", rulesDir(), facts), /missing column\(s\) authority/);
  const r = importSheet([HEADER + ";Notas de Valeria", row({}) + ";revisar"].join("\n"), rulesDir(), facts);
  assert.deepEqual(r.created, ["uno"]);
  assert.match(r.warnings.join(), /«Notas de Valeria» is not part of the contract: ignored/);
});

test("a sheet written in Spanish, as a person would, imports to the strict form", () => {
  const dir = rulesDir();
  const header = "Título;Autoridad;Tipo;Qué pide;Aplica si;Evidencia;Ley;Fuente;Cita;Vigente desde;Verificado por;Fecha de verificación;Frecuencia;Multa;Ley de la multa;Fuente de la multa;x_consultada_el";
  const line = 'Aviso de Privacidad;sat;Obligación;Pide algo;"Fact A\nno fact_b";acta;Ley X;https://example.test/ley;Artículo 1;1/1/2026;Valeria;28/10/2026;Mensual;multa;art. 2;https://example.test/multa;2026-10-28';
  const r = importSheet(`${header}\n${line}\n`, dir, facts);
  assert.deepEqual(r.created, ["aviso-de-privacidad"]);
  assert.match(r.warnings.join(), /no id, using «aviso-de-privacidad» from the title/);
  const rule = loadRules(dir).rules[0];
  assert.equal(rule.authority, "SAT");
  assert.equal(rule.kind, "obligation");
  assert.deepEqual(rule.applies_if, ["fact_a", "!fact_b"]);
  assert.equal(rule.valid_from, "2026-01-01");
  assert.equal(rule.verified_on, "2026-10-28");
  assert.equal(rule.frequency, "monthly");
  assert.equal(rule.source_quote, "Artículo 1");
  assert.equal(rule.x_consultada_el, "2026-10-28");
  assert.deepEqual(rule.consequence, { description: "multa", law: "art. 2", source: "https://example.test/multa" });
});

test("a value the importer cannot map still fails, named by the strict validator", () => {
  assert.throws(() => importSheet([HEADER, row({ authority: "Hacienda" })].join("\n"), rulesDir(), facts), /row 2 \(uno\): authority must be one of/);
});

test("rules in the folder but not in the sheet are reported, never deleted", () => {
  const dir = rulesDir();
  importSheet([HEADER, row({}), row({ id: "dos" })].join("\n"), dir, facts);
  const r = importSheet([HEADER, row({})].join("\n"), dir, facts);
  assert.deepEqual(r.notInSheet, ["dos"]);
  assert.ok(readFileSync(join(dir, "dos.yaml"), "utf8").includes("id: dos"));
});
