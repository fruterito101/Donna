// Donna's rule engine. Deterministic on purpose: the law comes from verified rule cards,
// never from the model (docs/ARQUITECTURA.md, principle 1). Contracts: docs/CONTRATOS.md.
import { parse } from "yaml";

export { buildProfile, type BuiltProfile, type FactInput, type ProfileNote, type RawProfile } from "./profile.ts";
export { buildReport, explainBrief, MAX_BRIEF, type Ask, type ReportResponse } from "./report.ts";

/** The yes/no facts about a startup (the PERFIL layer). `undefined` = not known yet. */
export type Profile = Record<string, boolean | undefined>;

/** One fact of the catalog (rules/_hechos.yaml): the yes/no question behind a fact name. */
export type Fact = {
  question: string; // what to ask the user, in plain Spanish
  signals?: string[]; // what in a landing or pitch hints at it
};
export type FactCatalog = Record<string, Fact>;

export const AUTHORITIES = ["SAT", "IMSS", "UIF", "DATOS", "PI", "ESTIMULO"] as const;
export const FREQUENCIES = ["once", "monthly", "bimonthly", "annual", "per_event"] as const;

/** What happens if the obligation is not met. Its own law and source: a fine is a number, and a number needs a source. */
export type Consequence = { description: string; law: string; source: string };

/** One verified rule card (one file in rules/). */
export type RuleCard = {
  id: string; // = the file name without .yaml
  authority: (typeof AUTHORITIES)[number];
  kind: "obligation" | "benefit";
  title: string;
  requires: string; // what the law asks, in plain Spanish
  applies_if: string[]; // facts that must ALL hold: «fact» = true, «!fact» = false
  evidence: string[]; // what to keep as proof
  law: string; // law and article
  source: string; // official URL
  source_quote?: string; // the exact words of the source that back the rule: verified by comparing, re-checked by the reader
  valid_from: string; // YYYY-MM-DD, when the law took effect
  verified_by: string; // who on the team checked it against the source; "" = not verified
  verified_on?: string; // YYYY-MM-DD, when they checked it; required once verified_by has a name
  valid_until?: string; // YYYY-MM-DD, after this day the rule is expired
  consequence?: Consequence;
  frequency?: (typeof FREQUENCIES)[number];
  /** extension fields: anyone (the source reader, a later tool) may add x_* data without changing the contract */
  [extension: `x_${string}`]: unknown;
};

export type ReportItem = {
  rule: RuleCard;
  /** applies: every fact holds · needs_data: some fact is unknown (we ask, never assume). */
  status: "applies" | "needs_data";
  missing_facts: string[];
};

export type Report = {
  obligations: ReportItem[];
  benefits: ReportItem[];
  /** Facts the rules need that the profile does not answer: what to ask the user. */
  questions: string[];
  /** Ids of matched rules nobody has verified yet: never shown in production. */
  unverified: string[];
  /** Ids of matched rules past their valid_until: never shown in production. */
  expired: string[];
};

const REQUIRED = [
  "id", "authority", "kind", "title", "requires", "applies_if", "evidence", "law", "source", "valid_from", "verified_by",
] as const;
const OPTIONAL = ["source_quote", "verified_on", "valid_until", "consequence", "frequency"] as const;
const KNOWN = new Set<string>([...REQUIRED, ...OPTIONAL]);

const ID = /^[a-z0-9]+(-[a-z0-9]+)*$/;
const FACT = /^[a-z0-9]+(_[a-z0-9]+)*$/;
// Which sources count as official is still open: Artur's reader will fetch them (docs/PENDIENTES.md).
const URL_RE = /^https?:\/\/\S+$/;

const isDate = (v: unknown): v is string =>
  typeof v === "string" && /^\d{4}-\d{2}-\d{2}$/.test(v) && new Date(`${v}T00:00:00Z`).toISOString().startsWith(v);
const isText = (v: unknown): v is string => typeof v === "string" && v.trim() !== "";
const isTextList = (v: unknown): v is string[] => Array.isArray(v) && v.every(isText);

/** «!fact» → fact. */
export const factName = (term: string) => (term.startsWith("!") ? term.slice(1) : term);

/** Parse and validate the fact catalog. Throws naming the fact and the field. */
export function parseFacts(yamlText: string, origin = "_hechos.yaml"): FactCatalog {
  const data = parse(yamlText) as Record<string, Partial<Fact>> | null;
  if (!data || typeof data !== "object" || Array.isArray(data)) throw new Error(`${origin}: not a YAML map of facts`);
  for (const [name, fact] of Object.entries(data)) {
    if (!FACT.test(name)) throw new Error(`${origin}: fact '${name}' must be lowercase words joined by _`);
    if (!fact || !isText(fact.question)) throw new Error(`${origin}: fact '${name}' needs a 'question'`);
    if (fact.signals !== undefined && !isTextList(fact.signals)) throw new Error(`${origin}: fact '${name}': signals must be a list of text`);
    for (const key of Object.keys(fact)) {
      if (key !== "question" && key !== "signals") throw new Error(`${origin}: fact '${name}': unknown field '${key}'`);
    }
  }
  return data as FactCatalog;
}

/**
 * Validate one rule card already read into an object (from YAML or from a sheet row).
 * Throws naming the field, so a bad card is never silently skipped. With `facts`, every
 * fact in applies_if must exist in the catalog: a typo would otherwise become a question forever.
 */
export function validateRule(data: unknown, origin = "rule", facts?: FactCatalog): RuleCard {
  if (!data || typeof data !== "object" || Array.isArray(data)) throw new Error(`${origin}: not a YAML object`);
  const card = data as Record<string, unknown>;
  const fail = (msg: string): never => {
    throw new Error(`${origin}: ${msg}`);
  };

  for (const key of Object.keys(card)) if (!KNOWN.has(key) && !/^x_[a-z0-9_]+$/.test(key)) fail(`unknown field '${key}' (extensions start with x_)`);
  for (const field of REQUIRED) if (card[field] === undefined || card[field] === null) fail(`missing field '${field}'`);

  if (!ID.test(String(card.id))) fail("id must be lowercase words joined by -");
  if (!AUTHORITIES.includes(card.authority as RuleCard["authority"])) fail(`authority must be one of ${AUTHORITIES.join(", ")}`);
  if (card.kind !== "obligation" && card.kind !== "benefit") fail("kind must be obligation or benefit");
  for (const field of ["title", "requires", "law"] as const) if (!isText(card[field])) fail(`${field} must be text`);

  if (!isTextList(card.applies_if) || card.applies_if.length === 0) fail("applies_if needs at least one fact");
  const terms = card.applies_if as string[];
  const seen = new Set<string>();
  for (const term of terms) {
    const name = factName(term);
    if (!FACT.test(name)) fail(`applies_if: '${term}' is not a fact name (write «fact» or «!fact»)`);
    if (seen.has(name)) fail(`applies_if: fact '${name}' appears twice`);
    seen.add(name);
    if (facts && !(name in facts)) fail(`applies_if: fact '${name}' is not in rules/_hechos.yaml`);
  }

  if (!isTextList(card.evidence)) fail("evidence must be a list of text");
  if (!URL_RE.test(String(card.source))) fail("source must be an official URL");
  if (card.source_quote !== undefined && !isText(card.source_quote)) fail("source_quote must be text");
  if (!isDate(card.valid_from)) fail("valid_from must be a date YYYY-MM-DD");

  if (typeof card.verified_by !== "string") fail("verified_by must be text (\"\" = not verified)");
  const verified = isText(card.verified_by);
  if (verified && card.verified_on === undefined) fail("verified_on is required once verified_by has a name");
  if (card.verified_on !== undefined) {
    if (!verified) fail("verified_on without verified_by: who checked it?");
    if (!isDate(card.verified_on)) fail("verified_on must be a date YYYY-MM-DD");
  }

  if (card.valid_until !== undefined) {
    if (!isDate(card.valid_until)) fail("valid_until must be a date YYYY-MM-DD");
    if ((card.valid_until as string) < (card.valid_from as string)) fail("valid_until is before valid_from");
  }

  if (card.consequence !== undefined) {
    const c = card.consequence as Record<string, unknown> | null;
    if (!c || typeof c !== "object" || Array.isArray(c)) fail("consequence must have description, law and source");
    for (const key of Object.keys(c!)) if (!["description", "law", "source"].includes(key)) fail(`consequence: unknown field '${key}'`);
    if (!isText(c!.description)) fail("consequence: missing 'description'");
    if (!isText(c!.law)) fail("consequence: missing 'law'");
    if (!URL_RE.test(String(c!.source))) fail("consequence: source must be an official URL");
  }

  if (card.frequency !== undefined && !FREQUENCIES.includes(card.frequency as RuleCard["frequency"] & string)) {
    fail(`frequency must be one of ${FREQUENCIES.join(", ")}`);
  }
  return card as RuleCard;
}

/** Parse and validate one rule card from YAML text. */
export function parseRule(yamlText: string, origin = "rule", facts?: FactCatalog): RuleCard {
  return validateRule(parse(yamlText), origin, facts);
}

const today = () => new Date().toISOString().slice(0, 10);

/** Cross a profile with the rules. Pure for a given `on` date: same input, same report. */
export function evaluate(profile: Profile, rules: RuleCard[], on: string = today()): Report {
  const report: Report = { obligations: [], benefits: [], questions: [], unverified: [], expired: [] };
  const questions = new Set<string>();

  for (const rule of rules) {
    const wants = (term: string) => !term.startsWith("!"); // «fact» wants true, «!fact» wants false
    // a known answer opposite to what the rule needs rules it out
    if (rule.applies_if.some((term) => profile[factName(term)] === !wants(term))) continue;
    const missing = rule.applies_if.map(factName).filter((fact) => profile[fact] === undefined);
    const item: ReportItem = { rule, status: missing.length ? "needs_data" : "applies", missing_facts: missing };
    (rule.kind === "obligation" ? report.obligations : report.benefits).push(item);
    missing.forEach((fact) => questions.add(fact));
    if (!String(rule.verified_by).trim()) report.unverified.push(rule.id);
    if (rule.valid_until && rule.valid_until < on) report.expired.push(rule.id);
  }
  report.questions = [...questions].sort();
  return report;
}

/**
 * The report a user may see: unverified and expired rules removed, and the questions only
 * the remaining rules need. Production shows only this (Brian, 2026-10-28).
 */
export function publicReport(report: Report): Report {
  const hidden = new Set([...report.unverified, ...report.expired]);
  const keep = (items: ReportItem[]) => items.filter((item) => !hidden.has(item.rule.id));
  const obligations = keep(report.obligations);
  const benefits = keep(report.benefits);
  const questions = new Set([...obligations, ...benefits].flatMap((item) => item.missing_facts));
  return { obligations, benefits, questions: [...questions].sort(), unverified: [], expired: [] };
}
