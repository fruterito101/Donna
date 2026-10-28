// Turns a spreadsheet exported as CSV (one rule per row) into rule cards. Whoever writes the law
// does not need to know YAML (Brian, 2026-10-28). Node only: used by scripts/import-rules.ts.
import { existsSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import { basename, join } from "node:path";
import { stringify } from "yaml";
import { validateRule, type FactCatalog, type RuleCard } from "./index.ts";

/** Columns of the sheet, in the contract's order (docs/CONTRATOS.md §1). */
export const COLUMNS = [
  "id", "authority", "kind", "title", "requires", "applies_if", "evidence", "law", "source", "valid_from",
  "verified_by", "source_quote", "verified_on", "valid_until", "frequency", "consequence_description", "consequence_law", "consequence_source",
] as const;
const REQUIRED_COLUMNS = COLUMNS.slice(0, 11);
const LISTS = new Set(["applies_if", "evidence"]);

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

/** One sheet row → a rule object in the contract's key order, empty optional cells left out. */
export function rowToRule(cells: Record<string, string>): Record<string, unknown> {
  const rule: Record<string, unknown> = {};
  for (const col of COLUMNS) {
    if (col.startsWith("consequence_")) continue;
    const value = (cells[col] ?? "").trim();
    if (LISTS.has(col)) rule[col] = splitList(value);
    else if (col === "verified_by") rule[col] = value; // "" = not verified, still a required field
    else if (value !== "" || REQUIRED_COLUMNS.includes(col as (typeof REQUIRED_COLUMNS)[number])) rule[col] = value;
  }
  const consequence: Record<string, string> = {};
  for (const key of ["description", "law", "source"]) {
    const value = (cells[`consequence_${key}`] ?? "").trim();
    if (value) consequence[key] = value;
  }
  if (Object.keys(consequence).length) rule.consequence = consequence; // a partial one fails validation, naming the part
  return rule;
}

export type ImportResult = { created: string[]; updated: string[]; unchanged: string[]; notInSheet: string[] };

/**
 * Validate EVERY row first and write only if all of them pass: a half-imported sheet would
 * leave rules/ in a state nobody wrote. Errors name the row as the spreadsheet numbers it.
 * Rules in rules/ that the sheet no longer has are reported, never deleted.
 */
export function importSheet(csvText: string, rulesDir: string, facts: FactCatalog, write = true): ImportResult {
  const [header, ...rows] = parseCsv(csvText);
  if (!header) throw new Error("the sheet is empty");
  const columns = header.map((h) => h.trim());
  const errors: string[] = [];
  const unknown = columns.filter((c) => c && !COLUMNS.includes(c as (typeof COLUMNS)[number]));
  const absent = REQUIRED_COLUMNS.filter((c) => !columns.includes(c));
  if (unknown.length) errors.push(`header: unknown column(s) ${unknown.join(", ")} — use the ones in rules/_plantilla.csv`);
  if (absent.length) errors.push(`header: missing column(s) ${absent.join(", ")}`);
  if (errors.length) throw new Error(errors.join("\n- "));

  const cards: RuleCard[] = [];
  const ids = new Map<string, number>();
  rows.forEach((cellsRow, i) => {
    const line = i + 2; // the header is row 1
    if (cellsRow.every((c) => c.trim() === "")) return;
    const cells = Object.fromEntries(columns.map((c, j) => [c, cellsRow[j] ?? ""]));
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

  const result: ImportResult = { created: [], updated: [], unchanged: [], notInSheet: [] };
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
