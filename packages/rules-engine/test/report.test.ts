// The report a person sees and the brief Donna explains. Fixtures are invented.
import { test } from "node:test";
import assert from "node:assert/strict";
import { buildReport, explainBrief, parseFacts, validateRule, type RuleCard } from "../src/index.ts";

const facts = parseFacts("fact_a:\n  question: ¿Pregunta A?\nfact_b:\n  question: ¿Pregunta B?\n");
const rule = (over: Record<string, unknown>): RuleCard =>
  validateRule({
    id: "r", authority: "SAT", kind: "obligation", title: "Regla", requires: "pide algo", applies_if: ["fact_a"], evidence: [],
    law: "Ley X art. 1", source: "https://example.test/ley", valid_from: "2026-01-01", verified_by: "Valeria", verified_on: "2026-10-28", ...over,
  }, "r");
const signed = rule({ id: "firmada", title: "Obligación firmada", applies_if: ["fact_a", "fact_b"] });
const draft = rule({ id: "borrador", kind: "benefit", title: "Beneficio borrador", verified_by: "", verified_on: undefined });

test("production shows only signed rules, and asks in plain Spanish", () => {
  const r = buildReport({ detected: { fact_a: "sí" } }, { rules: [signed, draft], facts });
  assert.deepEqual(r.report.obligations.map((i) => i.rule.id), ["firmada"]);
  assert.deepEqual(r.report.benefits, []);
  assert.deepEqual(r.ask, [{ fact: "fact_b", question: "¿Pregunta B?" }]);
  assert.equal(r.drafts_shown, false);
  assert.deepEqual([r.rules_total, r.rules_verified], [2, 1]);
});

test("drafts are shown only when asked, and flagged", () => {
  const r = buildReport({ detected: { fact_a: true } }, { rules: [signed, draft], facts, showDrafts: true });
  assert.deepEqual(r.report.benefits.map((i) => i.rule.id), ["borrador"]);
  assert.equal(r.drafts_shown, true);
  assert.match(explainBrief(r)!, /BORRADORES sin verificar/);
});

test("the user's answer reaches the report over a detection", () => {
  const r = buildReport({ detected: { fact_a: true, fact_b: true }, answered: { fact_a: "no" } }, { rules: [signed], facts });
  assert.deepEqual(r.report.obligations, []);
  assert.equal(r.origin.fact_a, "answered");
});

test("Donna's brief carries only the report's rules, money first, with law, source and quote", () => {
  const benefit = rule({ id: "dinero", kind: "benefit", title: "El beneficio", source_quote: "Artículo 1. Texto." });
  const r = buildReport({ answered: { fact_a: "sí", fact_b: "sí" } }, { rules: [signed, benefit], facts });
  const brief = explainBrief(r)!;
  assert.ok(brief.indexOf("El beneficio") < brief.indexOf("Obligación firmada"), "benefits come first");
  assert.match(brief, /\[Ley X art\. 1\]/);
  assert.match(brief, /no agregues leyes/);
});

test("nothing to explain → no brief, so no call to the agent", () => {
  assert.equal(explainBrief(buildReport({ answered: { fact_a: "no" } }, { rules: [signed], facts })), null);
});

test("the brief stays under the cap however many rules apply, saying how many it left out", () => {
  const many = Array.from({ length: 30 }, (_, i) =>
    rule({ id: `r${i}`, title: `Regla número ${i}`, requires: "Pide algo bastante largo. ".repeat(10) }));
  const r = buildReport({ answered: { fact_a: "sí", fact_b: "sí" } }, { rules: many, facts });
  const brief = explainBrief(r)!;
  assert.ok(brief.length <= 2000, `brief is ${brief.length} chars`);
  assert.match(brief, /\(\+\d+ punto\(s\) más en el informe en pantalla\)/);
  assert.match(brief, /no agregues leyes/, "the instruction is never cut");
});

test("Donna gets a rule's whole text, conditions included, and is told not to calculate", () => {
  const benefit = rule({ id: "dinero", kind: "benefit", title: "El beneficio", requires: "Un crédito del 30%. Solo sobre lo que exceda el promedio." });
  const brief = explainBrief(buildReport({ answered: { fact_a: "sí" } }, { rules: [benefit], facts }))!;
  assert.match(brief, /Solo sobre lo que exceda el promedio\./, "the second sentence carries the condition");
  assert.match(brief, /No hagas cálculos ni ejemplos con cifras/);
  assert.match(brief, /Di SIEMPRE las condiciones/);
});

test("Donna is told to frame every point for review, never as a verdict (the landing's voice)", () => {
  const brief = explainBrief(buildReport({ answered: { fact_a: "sí", fact_b: "sí" } }, { rules: [signed], facts }))!;
  assert.match(brief, /PARA REVISAR con su contador/);
  assert.match(brief, /nunca digas «debes», «te obliga»/);
  assert.match(brief, /PARA REVISIÓN PROFESIONAL \(1\)/);
  assert.match(brief, /No es un dictamen/);
});
