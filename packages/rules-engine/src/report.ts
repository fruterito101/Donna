// From loose facts to the report a person sees, and the brief Donna explains. Pure: no network,
// no disk — /api/report wires it to the request, the rules and the agent.
import { evaluate, publicReport, type FactCatalog, type Report, type ReportItem, type RuleCard } from "./index.ts";
import { buildProfile, type BuiltProfile, type RawProfile } from "./profile.ts";

/** A fact the report needs and nobody answered yet, with the question to ask in plain Spanish. */
export type Ask = { fact: string; question: string };

export type ReportResponse = {
  report: Report;
  /** the questions to ask the user, in order, ready to show */
  ask: Ask[];
  /** what was received but not used (unknown fact, unreadable value, low confidence) */
  notes: BuiltProfile["notes"];
  /** where each answer came from */
  origin: BuiltProfile["origin"];
  /** true when drafts are shown (development only): the screen must say so */
  drafts_shown: boolean;
  /** how many rules exist and how many are signed: lets the screen say «9 rules under review» */
  rules_total: number;
  rules_verified: number;
};

export function buildReport(
  input: { detected?: RawProfile; answered?: RawProfile },
  { rules, facts, showDrafts = false, on }: { rules: RuleCard[]; facts: FactCatalog; showDrafts?: boolean; on?: string },
): ReportResponse {
  const { profile, origin, notes } = buildProfile(input, facts);
  const full = evaluate(profile, rules, on);
  const report = showDrafts ? full : publicReport(full);
  const ask = report.questions.map((fact) => ({ fact, question: facts[fact]?.question ?? fact }));
  const rules_verified = rules.filter((r) => String(r.verified_by).trim()).length;
  return { report, ask, notes, origin, drafts_shown: showDrafts, rules_total: rules.length, rules_verified };
}

/** At most `max` chars. Never cut to a first sentence: a rule's conditions live in the rest (2026-10-28,
 *  Donna explained the R&D incentive without its conditions and overstated it). */
const clip = (text: string, max: number) => (text.length <= max ? text : `${text.slice(0, max - 1)}…`);

const line = (item: ReportItem) => {
  const r = item.rule;
  // A benefit keeps its whole text: its conditions are what stops Donna from promising it.
  // An obligation keeps its essentials; its law and its fine travel with it.
  let text = `- ${r.title} (${r.authority}): ${clip(r.requires, r.kind === "benefit" ? 600 : 200)} [${r.law}]`;
  if (r.consequence) text += ` Si no se cumple: ${clip(r.consequence.description, 110)}`;
  if (item.status === "needs_data") text += ` (aplica solo si se confirma: ${item.missing_facts.join(", ")})`;
  return text;
};

/** Donna's whole message (identity + brief) must stay under the agent's 4,000 chars (docs/COMUNICACION.md). */
export const MAX_BRIEF = 2_000;

/**
 * What Donna receives to explain a report. She explains ONLY these rules, in this order — money
 * first, then risk — and never adds a law that is not here (README §3, the engine decides).
 * Returns null when there is nothing to explain, so no call to the agent is spent.
 */
export function explainBrief(res: ReportResponse, maxChars: number = MAX_BRIEF): string | null {
  const { benefits, obligations } = res.report;
  if (!benefits.length && !obligations.length && !res.ask.length) return null;
  const blocks = [
    "Explica este informe a un founder que no sabe de leyes. Usa SOLO las reglas de abajo: no agregues leyes,",
    "artículos, cifras ni plazos. No hagas cálculos ni ejemplos con cifras. Di SIEMPRE las condiciones de cada",
    "beneficio: no prometas que le toca. Primero beneficios, luego obligaciones, luego preguntas. Breve, en español.",
    "No es opinión legal.",
    "",
    `BENEFICIOS (${benefits.length}):`,
    ...(benefits.length ? benefits.map(line) : ["- ninguno con la información actual"]),
    "",
    `OBLIGACIONES (${obligations.length}):`,
    ...(obligations.length ? obligations.map(line) : ["- ninguna con la información actual"]),
    "",
    `PREGUNTAS QUE FALTAN (${res.ask.length}):`,
    ...(res.ask.length ? res.ask.map((a) => `- ${a.question}`) : ["- ninguna"]),
  ];
  if (res.drafts_shown) blocks.push("", "AVISO: estas reglas son BORRADORES sin verificar; dilo al explicar.");
  // Over the cap, the last items give way to a count (the screen still shows them all).
  // 60 chars stay free for that note, so the result never passes the cap.
  const size = () => blocks.join("\n").length;
  if (size() > maxChars) {
    let left = 0;
    while (size() > maxChars - 60) {
      const i = blocks.findLastIndex((b) => b.startsWith("- ") && !b.startsWith("- ninguna") && !b.startsWith("- ninguno"));
      if (i < 0) break;
      blocks.splice(i, 1);
      left++;
    }
    blocks.push(`(+${left} punto(s) más en el informe en pantalla)`);
  }
  return blocks.join("\n");
}
