// Fixtures are invented on purpose: real rules live in rules/ and are verified by the team.
import { test } from "node:test";
import assert from "node:assert/strict";
import { evaluate, parseRule, type RuleCard } from "../src/index.ts";

const card = (over: Partial<RuleCard>): RuleCard => ({
  id: "test", authority: "TEST", kind: "obligation", title: "t", requires: "r",
  applies_if: ["fact_a"], evidence: [], law: "ley de prueba", source: "https://example.test/ley",
  valid_from: "2026-01-01", verified_by: "equipo", ...over,
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
  const r = evaluate({ fact_a: true }, [card({ id: "sin-verificar", verified_by: "" })]);
  assert.deepEqual(r.unverified, ["sin-verificar"]);
});

test("parseRule rejects a card without an official source", () => {
  const yaml = "id: x\nauthority: SAT\nkind: obligation\ntitle: t\nrequires: r\napplies_if: [a]\nevidence: []\nlaw: l\nsource: no-es-url\nvalid_from: 2026-01-01\nverified_by: v\n";
  assert.throws(() => parseRule(yaml, "x.yaml"), /source must be an official URL/);
});

test("parseRule names the missing field", () => {
  assert.throws(() => parseRule("id: x\nkind: obligation\n", "x.yaml"), /missing field 'authority'/);
});
