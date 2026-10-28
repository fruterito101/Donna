// Fixtures are invented on purpose: real rules live in rules/ and are verified by the team.
import { test } from "node:test";
import assert from "node:assert/strict";
import { evaluate, parseRule, parseFacts, publicReport, validateRule, type RuleCard } from "../src/index.ts";

const card = (over: Partial<RuleCard>): RuleCard => ({
  id: "test", authority: "SAT", kind: "obligation", title: "t", requires: "r",
  applies_if: ["fact_a"], evidence: [], law: "ley de prueba", source: "https://example.test/ley",
  valid_from: "2026-01-01", verified_by: "equipo", verified_on: "2026-10-28", ...over,
});

test("a rule applies when every fact is true", () => {
  const r = evaluate({ fact_a: true, fact_b: true }, [card({ applies_if: ["fact_a", "fact_b"] })]);
  assert.equal(r.obligations.length, 1);
  assert.equal(r.obligations[0].status, "applies");
});

test("a known 'no' rules the rule out", () => {
  const r = evaluate({ fact_a: false }, [card({})]);
  assert.equal(r.obligations.length, 0);
});

test("an unknown fact asks instead of assuming", () => {
  const r = evaluate({ fact_a: true }, [card({ applies_if: ["fact_a", "fact_b"] })]);
  assert.equal(r.obligations[0].status, "needs_data");
  assert.deepEqual(r.questions, ["fact_b"]);
});

test("benefits are kept apart from obligations", () => {
  const r = evaluate({ fact_a: true }, [card({ id: "b", kind: "benefit" })]);
  assert.equal(r.benefits.length, 1);
  assert.equal(r.obligations.length, 0);
});

test("a matched rule nobody verified is flagged", () => {
  const r = evaluate({ fact_a: true }, [card({ id: "sin-verificar", verified_by: "", verified_on: undefined })]);
  assert.deepEqual(r.unverified, ["sin-verificar"]);
});

test("parseRule rejects a card without an official source", () => {
  const yaml = "id: x\nauthority: SAT\nkind: obligation\ntitle: t\nrequires: r\napplies_if: [a]\nevidence: []\nlaw: l\nsource: no-es-url\nvalid_from: 2026-01-01\nverified_by: v\n";
  assert.throws(() => parseRule(yaml, "x.yaml"), /source must be an official URL/);
});

test("parseRule names the missing field", () => {
  assert.throws(() => parseRule("id: x\nkind: obligation\n", "x.yaml"), /missing field 'authority'/);
});

// ── contract v1 (Brian, 2026-10-28) ──

const valid = () => ({ ...card({}) }) as Record<string, unknown>;
const facts = parseFacts("fact_a:\n  question: ¿a?\nfact_b:\n  question: ¿b?\n");

test("«!fact» applies when the fact is false", () => {
  const r = evaluate({ fact_a: true, fact_b: false }, [card({ applies_if: ["fact_a", "!fact_b"] })]);
  assert.equal(r.obligations[0].status, "applies");
});

test("«!fact» rules the rule out when the fact is true", () => {
  const r = evaluate({ fact_a: true, fact_b: true }, [card({ applies_if: ["fact_a", "!fact_b"] })]);
  assert.equal(r.obligations.length, 0);
});

test("an unknown «!fact» asks by its bare name", () => {
  const r = evaluate({ fact_a: true }, [card({ applies_if: ["fact_a", "!fact_b"] })]);
  assert.deepEqual(r.questions, ["fact_b"]);
  assert.deepEqual(r.obligations[0].missing_facts, ["fact_b"]);
});

test("a rule asking a fact and its negation is rejected", () => {
  assert.throws(() => validateRule({ ...valid(), applies_if: ["fact_a", "!fact_a"] }, "x"), /fact 'fact_a' appears twice/);
});

test("a fact missing from the catalog is rejected, naming it", () => {
  assert.throws(() => validateRule({ ...valid(), applies_if: ["fact_c"] }, "x", facts), /fact 'fact_c' is not in rules\/_hechos.yaml/);
  assert.doesNotThrow(() => validateRule({ ...valid(), applies_if: ["fact_a", "!fact_b"] }, "x", facts));
});

test("an unknown field is rejected (a typo would silently drop it)", () => {
  assert.throws(() => validateRule({ ...valid(), verifed_by: "x" }, "x"), /unknown field 'verifed_by'/);
});

test("authority must be one of the six", () => {
  assert.throws(() => validateRule({ ...valid(), authority: "SHCP" }, "x"), /authority must be one of/);
});

test("verified_by with a name needs verified_on, and a date needs a name", () => {
  assert.throws(() => validateRule({ ...valid(), verified_on: undefined }, "x"), /verified_on is required/);
  assert.throws(() => validateRule({ ...valid(), verified_by: "" }, "x"), /verified_on without verified_by/);
});

test("dates must be real days", () => {
  assert.throws(() => validateRule({ ...valid(), valid_from: "2026-02-30" }, "x"), /valid_from must be a date/);
  assert.throws(() => validateRule({ ...valid(), valid_until: "2025-12-31" }, "x"), /valid_until is before valid_from/);
});

test("a consequence needs its own law and source", () => {
  const consequence = { description: "multa", law: "art. 1", source: "https://example.test/multa" };
  assert.doesNotThrow(() => validateRule({ ...valid(), consequence }, "x"));
  assert.throws(() => validateRule({ ...valid(), consequence: { description: "multa", law: "art. 1" } }, "x"), /consequence: source/);
  assert.throws(() => validateRule({ ...valid(), consequence: { description: "multa", source: consequence.source } }, "x"), /consequence: missing 'law'/);
});

test("frequency must be one of the known ones", () => {
  assert.doesNotThrow(() => validateRule({ ...valid(), frequency: "monthly" }, "x"));
  assert.throws(() => validateRule({ ...valid(), frequency: "mensual" }, "x"), /frequency must be one of/);
});

test("a rule past its valid_until is flagged expired", () => {
  const r = evaluate({ fact_a: true }, [card({ id: "vieja", valid_until: "2026-06-30" })], "2026-10-28");
  assert.deepEqual(r.expired, ["vieja"]);
  assert.deepEqual(evaluate({ fact_a: true }, [card({ valid_until: "2026-12-31" })], "2026-10-28").expired, []);
});

test("publicReport hides unverified and expired rules and the questions only they needed", () => {
  const rules = [
    card({ id: "ok", applies_if: ["fact_a"] }),
    card({ id: "draft", verified_by: "", verified_on: undefined, applies_if: ["fact_a", "fact_b"] }),
    card({ id: "old", kind: "benefit", valid_until: "2026-06-30" }),
  ];
  const full = evaluate({ fact_a: true }, rules, "2026-10-28");
  assert.deepEqual(full.questions, ["fact_b"]);
  const shown = publicReport(full);
  assert.deepEqual(shown.obligations.map((i) => i.rule.id), ["ok"]);
  assert.deepEqual(shown.benefits, []);
  assert.deepEqual(shown.questions, []);
});

test("parseFacts needs a question for every fact", () => {
  assert.throws(() => parseFacts("fact_a:\n  signals: [x]\n"), /fact 'fact_a' needs a 'question'/);
});

test("source_quote is optional text", () => {
  assert.doesNotThrow(() => validateRule({ ...valid(), source_quote: "Artículo 1. …" }, "x"));
  assert.throws(() => validateRule({ ...valid(), source_quote: "" }, "x"), /source_quote must be text/);
});
