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

const line = (item: ReportItem) => {
  const r = item.rule;
  const parts = [`- ${r.title} (${r.authority}) — ${r.requires}`, `  Ley: ${r.law} · Fuente: ${r.source}`];
  if (r.source_quote) parts.push(`  Cita: «${r.source_quote}»`);
  if (r.consequence) parts.push(`  Si no se cumple: ${r.consequence.description} (${r.consequence.law})`);
  if (item.status === "needs_data") parts.push(`  Aplica solo si se confirma: ${item.missing_facts.join(", ")}`);
  return parts.join("\n");
};

/**
 * What Donna receives to explain a report. She explains ONLY these rules, in this order — money
 * first, then risk — and never adds a law that is not here (README §3, the engine decides).
 * Returns null when there is nothing to explain, so no call to the agent is spent.
 */
export function explainBrief(res: ReportResponse): string | null {
  const { benefits, obligations } = res.report;
  if (!benefits.length && !obligations.length && !res.ask.length) return null;
  const blocks = [
    "Explica este informe de cumplimiento a un founder que no sabe de leyes. Usa SOLO las reglas de abajo:",
    "no agregues leyes, artículos, cifras ni plazos que no estén aquí. Si algo no está, di que no lo tienes.",
    "Empieza por los beneficios (el dinero que puede estar dejando ir), sigue con las obligaciones (el riesgo),",
    "y termina con las preguntas que faltan. Breve, claro, en español. Recuerda que no es una opinión legal.",
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
  return blocks.join("\n");
}
