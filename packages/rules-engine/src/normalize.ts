// Loose → strict. What reaches the engine from outside (the reader, an extraction model, a user,
// a spreadsheet) comes in many shapes; it is normalized here, at the edge, so the core stays strict
// (Brian, 2026-10-28: «que no sea tan rígido en la forma y detección»).

/** Lowercase, no accents, trimmed, inner spaces collapsed: «  Obligación » → «obligacion». */
export const plain = (s: unknown): string =>
  String(s ?? "")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .trim()
    .replace(/\s+/g, " ");

/** Any spelling of a fact name → its catalog form: «Cobra al extranjero» → «cobra_al_extranjero». */
export const toFactName = (s: unknown): string =>
  plain(s)
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");

/** A title → an id: «Aviso a la UIF» → «aviso-a-la-uif». */
export const toId = (s: unknown): string =>
  plain(s)
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

/**
 * A date as people type it → YYYY-MM-DD. Accepts 2026-10-28, 2026/10/28, 28/10/2026, 28-10-2026,
 * 28.10.2026 and a trailing time («2026-10-28 00:00:00»). Day-first, as in Mexico. Anything else
 * is returned unchanged, so the strict validator names it.
 */
export function toIsoDate(s: unknown): string {
  const text = String(s ?? "").trim().replace(/[ T]\d{1,2}:\d{2}(:\d{2})?.*$/, "");
  let m = text.match(/^(\d{4})[-/.](\d{1,2})[-/.](\d{1,2})$/);
  if (m) return `${m[1]}-${m[2].padStart(2, "0")}-${m[3].padStart(2, "0")}`;
  m = text.match(/^(\d{1,2})[-/.](\d{1,2})[-/.](\d{4})$/);
  if (m) return `${m[3]}-${m[2].padStart(2, "0")}-${m[1].padStart(2, "0")}`;
  return text;
}

const YES = new Set(["si", "s", "yes", "y", "true", "verdadero", "1", "x"]);
const NO = new Set(["no", "n", "false", "falso", "0"]);
const UNKNOWN = new Set(["", "no se", "nose", "ns", "?", "unknown", "desconocido", "n/a", "na", "null", "undefined", "tal vez", "quizas"]);

/** A yes/no as anyone may send it → true · false · undefined (unknown) · null (unreadable). */
export function toAnswer(v: unknown): boolean | undefined | null {
  if (v === true || v === false) return v;
  if (v === undefined || v === null) return undefined;
  if (typeof v === "number") return v === 1 ? true : v === 0 ? false : null;
  const p = plain(v).replace(/[.!¡¿]/g, "");
  if (YES.has(p)) return true;
  if (NO.has(p)) return false;
  if (UNKNOWN.has(p)) return undefined;
  return null;
}
