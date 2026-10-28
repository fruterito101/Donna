// Dona's rule engine — v0. Deterministic on purpose: the law comes from verified rule cards,
// never from the model (docs/ARQUITECTURA.md, principle 1). Contracts: docs/CONTRATOS.md.
import { parse } from "yaml";

/** The yes/no facts about a startup (the PERFIL layer). `undefined` = not known yet. */
export type Profile = Record<string, boolean | undefined>;

/** One verified rule card (one file in rules/). */
export type RuleCard = {
  id: string;
  authority: string; // SAT · IMSS · UIF · DATOS · PI · ESTIMULO
  kind: "obligation" | "benefit";
  title: string;
  requires: string; // what the law asks, in plain Spanish
  applies_if: string[]; // profile facts that must ALL be true
  evidence: string[]; // what to keep as proof
  law: string; // law and article
  source: string; // official URL
  valid_from: string; // YYYY-MM-DD
  verified_by: string; // who on the team checked it against the source; "" = not verified
};

export type ReportItem = {
  rule: RuleCard;
  /** applies: every fact is true · needs_data: some fact is unknown (we ask, never assume). */
  status: "applies" | "needs_data";
  missing_facts: string[];
};

export type Report = {
  obligations: ReportItem[];
  benefits: ReportItem[];
  /** Facts the rules need that the profile does not answer: what to ask the user. */
  questions: string[];
  /** Ids of matched rules nobody has verified yet: must not reach a demo. */
  unverified: string[];
};

const REQUIRED: (keyof RuleCard)[] = [
  "id", "authority", "kind", "title", "requires", "applies_if", "evidence", "law", "source", "valid_from", "verified_by",
];

/** Parse and validate one rule card. Throws naming the field, so a bad card is never silently skipped. */
export function parseRule(yamlText: string, origin = "rule"): RuleCard {
  const data = parse(yamlText) as Partial<RuleCard> | null;
  if (!data || typeof data !== "object") throw new Error(`${origin}: not a YAML object`);
  for (const field of REQUIRED) {
    if (data[field] === undefined || data[field] === null) throw new Error(`${origin}: missing field '${field}'`);
  }
  if (data.kind !== "obligation" && data.kind !== "benefit") throw new Error(`${origin}: kind must be obligation or benefit`);
  if (!Array.isArray(data.applies_if) || data.applies_if.length === 0) throw new Error(`${origin}: applies_if needs at least one fact`);
  if (!Array.isArray(data.evidence)) throw new Error(`${origin}: evidence must be a list`);
  if (!/^https?:\/\//.test(String(data.source))) throw new Error(`${origin}: source must be an official URL`);
  return data as RuleCard;
}

/** Cross a profile with the rules. Pure: same input, same report. */
export function evaluate(profile: Profile, rules: RuleCard[]): Report {
  const report: Report = { obligations: [], benefits: [], questions: [], unverified: [] };
  const questions = new Set<string>();

  for (const rule of rules) {
    if (rule.applies_if.some((fact) => profile[fact] === false)) continue; // a known "no" rules it out
    const missing = rule.applies_if.filter((fact) => profile[fact] === undefined);
    const item: ReportItem = { rule, status: missing.length ? "needs_data" : "applies", missing_facts: missing };
    (rule.kind === "obligation" ? report.obligations : report.benefits).push(item);
    missing.forEach((fact) => questions.add(fact));
    if (!String(rule.verified_by).trim()) report.unverified.push(rule.id);
  }
  report.questions = [...questions].sort();
  return report;
}
