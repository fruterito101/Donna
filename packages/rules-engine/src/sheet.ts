// Turns a spreadsheet exported as CSV (one rule per row) into rule cards. Whoever writes the law
// does not need to know YAML (Brian, 2026-10-28). Node only: used by scripts/import-rules.ts.
import { existsSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import { basename, join } from "node:path";
import { stringify } from "yaml";
import { validateRule, type FactCatalog, type RuleCard } from "./index.ts";
import { plain, toFactName, toId, toIsoDate } from "./normalize.ts";

/** Columns of the sheet, in the contract's order (docs/CONTRATOS.md §1). */
export const COLUMNS = [
  "id", "authority", "kind", "title", "requires", "applies_if", "evidence", "law", "source", "valid_from",
  "verified_by", "source_quote", "verified_on", "valid_until", "frequency", "consequence_description", "consequence_law", "consequence_source",
] as const;
const REQUIRED_COLUMNS = COLUMNS.filter((c) => c !== "id").slice(0, 10); // id may be left blank: it comes from the title
const LISTS = new Set(["applies_if", "evidence"]);
const DATES = new Set(["valid_from", "verified_on", "valid_until"]);

/** Spanish (and loose) column names → the contract's. Compared after plain() + «_». */
const ALIASES: Record<string, (typeof COLUMNS)[number]> = {
  autoridad: "authority", tipo: "kind", clase: "kind", titulo: "title", nombre: "title",
  requiere: "requires", que_pide: "requires", exige: "requires", obligacion: "requires", descripcion: "requires",
  aplica_si: "applies_if", aplica_a: "applies_if", hechos: "applies_if", condiciones: "applies_if",
  evidencia: "evidence", pruebas: "evidence", ley: "law", norma: "law", articulo: "law", fundamento: "law",
  fuente: "source", enlace: "source", link: "source", url: "source", cita: "source_quote", cita_textual: "source_quote",
  vigente_desde: "valid_from", vigencia: "valid_from", desde: "valid_from",
  verificado_por: "verified_by", verifico: "verified_by", reviso: "verified_by", revisado_por: "verified_by",
  verificado_el: "verified_on", fecha_verificacion: "verified_on", fecha_de_verificacion: "verified_on", revisado_el: "verified_on",
  vigente_hasta: "valid_until", hasta: "valid_until", frecuencia: "frequency", periodicidad: "frequency",
  consecuencia: "consequence_description", multa: "consequence_description", sancion: "consequence_description",
  consecuencia_ley: "consequence_law", ley_de_la_multa: "consequence_law", ley_multa: "consequence_law", ley_sancion: "consequence_law",
  consecuencia_fuente: "consequence_source", fuente_de_la_multa: "consequence_source", fuente_multa: "consequence_source", fuente_sancion: "consequence_source",
};

/** The column a header means, or null. x_* columns are extensions and pass through. */
function columnOf(header: string): string | null {
  const key = toFactName(header);
  if (key.startsWith("x_")) return key;
  if ((COLUMNS as readonly string[]).includes(key)) return key;
  return ALIASES[key] ?? null;
}

const KIND: Record<string, string> = { obligacion: "obligation", obligation: "obligation", o: "obligation", beneficio: "benefit", benefit: "benefit", b: "benefit", estimulo: "benefit" };
const AUTHORITY: Record<string, string> = {
  sat: "SAT", imss: "IMSS", uif: "UIF", datos: "DATOS", datos_personales: "DATOS", privacidad: "DATOS",
  pi: "PI", propiedad_intelectual: "PI", impi: "PI", indautor: "PI", marca: "PI",
  estimulo: "ESTIMULO", estimulos: "ESTIMULO", i_d: "ESTIMULO", estimulo_i_d: "ESTIMULO", estimulo_fiscal: "ESTIMULO",
};
const FREQUENCY: Record<string, string> = {
  once: "once", unica: "once", una_vez: "once", unica_vez: "once", monthly: "monthly", mensual: "monthly",
  bimonthly: "bimonthly", bimestral: "bimonthly", annual: "annual", anual: "annual",
  per_event: "per_event", por_evento: "per_event", por_operacion: "per_event", cada_operacion: "per_event", cada_vez: "per_event",
};
/** Loose value → the contract's, or the value unchanged so the strict validator names it. */
const mapTo = (table: Record<string, string>, v: string) => table[toFactName(v)] ?? v;

/** «no tiene empleados» / «!Tiene empleados» / «tiene empleados» → «!tiene_empleados» / «tiene_empleados». */
function toTerm(item: string): string {
  const p = plain(item);
  const negated = p.startsWith("!") || p.startsWith("no ");
  return (negated ? "!" : "") + toFactName(p.replace(/^!\s*|^no /, ""));
}

/**
 * RFC 4180 CSV with the separator guessed from the header: Excel in Spanish exports «;»,
 * Google Sheets «,». Quoted cells may hold the separator, quotes ("") and line breaks.
 */
export function parseCsv(text: string): string[][] {
  const src = text.replace(/^﻿/, ""); // Excel's UTF-8 mark
  const header = src.slice(0, src.search(/\r?\n|$/));
  const count = (ch: string) => header.split(ch).length - 1;
  const sep = [";", ",", "\t"].sort((a, b) => count(b) - count(a))[0];

  const rows: string[][] = [];
  let row: string[] = [];
  let cell = "";
  let quoted = false;
  for (let i = 0; i < src.length; i++) {
    const ch = src[i];
    if (quoted) {
      if (ch === '"' && src[i + 1] === '"') (cell += '"'), i++;
      else if (ch === '"') quoted = false;
      else cell += ch;
    } else if (ch === '"') quoted = true;
    else if (ch === sep) row.push(cell), (cell = "");
    else if (ch === "\n" || ch === "\r") {
      if (ch === "\r" && src[i + 1] === "\n") i++;
      row.push(cell), rows.push(row), (row = []), (cell = "");
    } else cell += ch;
  }
  if (quoted) throw new Error("the CSV ends inside quotes: a cell opened \" and never closed it");
  if (cell !== "" || row.length) row.push(cell), rows.push(row);
  return rows;
}

/** A list cell: items separated by «|» or by line breaks inside the cell. */
const splitList = (cell: string) => cell.split(/\||\r?\n/).map((s) => s.trim()).filter(Boolean);

/** One sheet row (keys already mapped to the contract) → a rule object in the contract's key order. */
export function rowToRule(cells: Record<string, string>): Record<string, unknown> {
  const rule: Record<string, unknown> = {};
  for (const col of COLUMNS) {
    if (col.startsWith("consequence_")) continue;
    let value = (cells[col] ?? "").trim();
    if (col === "id" && value === "") value = toId(cells.title);
    else if (col === "id") value = toId(value);
    if (col === "kind") value = mapTo(KIND, value);
    if (col === "authority") value = mapTo(AUTHORITY, value);
    if (col === "frequency" && value) value = mapTo(FREQUENCY, value);
    if (DATES.has(col) && value) value = toIsoDate(value);
    if (col === "applies_if") rule[col] = splitList(value).map(toTerm);
    else if (LISTS.has(col)) rule[col] = splitList(value);
    else if (col === "verified_by") rule[col] = value; // "" = not verified, still a required field
    else if (value !== "" || REQUIRED_COLUMNS.includes(col as (typeof REQUIRED_COLUMNS)[number]) || col === "id") rule[col] = value;
  }
  const consequence: Record<string, string> = {};
  for (const key of ["description", "law", "source"]) {
    const value = (cells[`consequence_${key}`] ?? "").trim();
    if (value) consequence[key] = value;
  }
  if (Object.keys(consequence).length) rule.consequence = consequence; // a partial one fails validation, naming the part
  for (const [key, value] of Object.entries(cells)) if (key.startsWith("x_") && value.trim()) rule[key] = value.trim();
  return rule;
}

export type ImportResult = { created: string[]; updated: string[]; unchanged: string[]; notInSheet: string[]; warnings: string[] };

/**
 * Validate EVERY row first and write only if all of them pass: a half-imported sheet would
 * leave rules/ in a state nobody wrote. Errors name the row as the spreadsheet numbers it.
 * Rules in rules/ that the sheet no longer has are reported, never deleted.
 */
export function importSheet(csvText: string, rulesDir: string, facts: FactCatalog, write = true): ImportResult {
  const [header, ...rows] = parseCsv(csvText);
  if (!header) throw new Error("the sheet is empty");
  const warnings: string[] = [];
  const columns = header.map((h) => {
    const col = h.trim() ? columnOf(h) : null;
    if (h.trim() && !col) warnings.push(`column «${h.trim()}» is not part of the contract: ignored`);
    return col;
  });
  const absent = REQUIRED_COLUMNS.filter((c) => !columns.includes(c));
  if (absent.length) throw new Error(`header: missing column(s) ${absent.join(", ")} — see rules/_plantilla.csv`);
  const errors: string[] = [];

  const cards: RuleCard[] = [];
  const ids = new Map<string, number>();
  rows.forEach((cellsRow, i) => {
    const line = i + 2; // the header is row 1
    if (cellsRow.every((c) => c.trim() === "")) return;
    const cells = Object.fromEntries(columns.flatMap((c, j) => (c ? [[c, cellsRow[j] ?? ""]] : [])));
    if (!(cells.id ?? "").trim() && (cells.title ?? "").trim()) warnings.push(`row ${line}: no id, using «${toId(cells.title)}» from the title`);
    try {
      const card = validateRule(rowToRule(cells), `row ${line} (${cells.id || "no id"})`, facts);
      if (ids.has(card.id)) throw new Error(`row ${line}: id '${card.id}' already used in row ${ids.get(card.id)}`);
      ids.set(card.id, line);
      cards.push(card);
    } catch (e) {
      errors.push((e as Error).message);
    }
  });
  if (errors.length) throw new Error(`${errors.length} row(s) with errors, nothing was written:\n- ${errors.join("\n- ")}`);

  const result: ImportResult = { created: [], updated: [], unchanged: [], notInSheet: [], warnings };
  for (const card of cards) {
    const path = join(rulesDir, `${card.id}.yaml`);
    const text = stringify(card, { lineWidth: 0 });
    const before = existsSync(path) ? readFileSync(path, "utf8") : null;
    if (before === text) result.unchanged.push(card.id);
    else (before === null ? result.created : result.updated).push(card.id);
    if (write && before !== text) writeFileSync(path, text);
  }
  result.notInSheet = readdirSync(rulesDir)
    .filter((f) => f.endsWith(".yaml") && !f.startsWith("_"))
    .map((f) => basename(f, ".yaml"))
    .filter((id) => !ids.has(id))
    .sort();
  return result;
}
