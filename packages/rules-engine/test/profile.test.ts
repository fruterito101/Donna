// Building the profile from loose input (the reader, a model, the user). Fixtures are invented.
import { test } from "node:test";
import assert from "node:assert/strict";
import { buildProfile, parseFacts, validateRule, evaluate } from "../src/index.ts";
import { toAnswer, toIsoDate } from "../src/normalize.ts";

const facts = parseFacts("tiene_empleados:\n  question: ¿?\ncobra_al_extranjero:\n  question: ¿?\nopera_activos_virtuales:\n  question: ¿?\n");

test("answers are read however they are written", () => {
  for (const v of [true, "sí", "Si", "SÍ.", "yes", "1", 1, "x", "verdadero"]) assert.equal(toAnswer(v), true, String(v));
  for (const v of [false, "no", "No.", "false", "0", 0, "falso"]) assert.equal(toAnswer(v), false, String(v));
  for (const v of [undefined, null, "", "no sé", "No se", "?", "desconocido", "N/A"]) assert.equal(toAnswer(v), undefined, String(v));
  for (const v of ["a veces", 7, "depende"]) assert.equal(toAnswer(v), null, String(v));
});

test("dates are read day-first, as in Mexico", () => {
  assert.equal(toIsoDate("28/10/2026"), "2026-10-28");
  assert.equal(toIsoDate("1-2-2026"), "2026-02-01");
  assert.equal(toIsoDate("2026/10/28"), "2026-10-28");
  assert.equal(toIsoDate("2026-10-28 00:00:00"), "2026-10-28");
  assert.equal(toIsoDate("ayer"), "ayer");
});

test("fact names are matched however they are spelled", () => {
  const { profile, notes } = buildProfile({ detected: { "Tiene Empleados": "sí", "cobra-al-extranjero": { value: "no" } } }, facts);
  assert.deepEqual(profile, { tiene_empleados: true, cobra_al_extranjero: false });
  assert.deepEqual(notes, []);
});

test("the user's answer beats the detection, and «no sé» does not erase it", () => {
  const { profile, origin } = buildProfile(
    { detected: { tiene_empleados: true, cobra_al_extranjero: true }, answered: { tiene_empleados: "no", cobra_al_extranjero: "no sé" } },
    facts,
  );
  assert.deepEqual(profile, { tiene_empleados: false, cobra_al_extranjero: true });
  assert.deepEqual(origin, { tiene_empleados: "answered", cobra_al_extranjero: "detected" });
});

test("what cannot be used is reported, never thrown and never guessed", () => {
  const { profile, notes } = buildProfile(
    { detected: { usa_blockchain: true, tiene_empleados: "depende", opera_activos_virtuales: { value: true, confidence: 0.2 } } },
    facts,
  );
  assert.deepEqual(profile, {});
  assert.deepEqual(notes.map((n) => `${n.fact}:${n.problem}`).sort(), [
    "opera_activos_virtuales:low_confidence", "tiene_empleados:unreadable_value", "usa_blockchain:unknown_fact",
  ]);
});

test("a low-confidence detection makes Donna ask instead of assuming", () => {
  const rule = validateRule({
    id: "r", authority: "UIF", kind: "obligation", title: "t", requires: "r", applies_if: ["opera_activos_virtuales"], evidence: [],
    law: "l", source: "https://example.test", valid_from: "2026-01-01", verified_by: "",
  }, "r");
  const { profile } = buildProfile({ detected: { opera_activos_virtuales: { value: "sí", confidence: 0.3, source: "pitch" } } }, facts);
  assert.deepEqual(evaluate(profile, [rule]).questions, ["opera_activos_virtuales"]);
});

test("without a catalog every fact is kept", () => {
  assert.deepEqual(buildProfile({ detected: { algo_nuevo: "sí" } }).profile, { algo_nuevo: true });
});

test("x_ extension fields are kept; other unknown fields still fail", () => {
  const base = { id: "r", authority: "SAT", kind: "obligation", title: "t", requires: "r", applies_if: ["a"], evidence: [],
    law: "l", source: "https://example.test", valid_from: "2026-01-01", verified_by: "" };
  assert.equal(validateRule({ ...base, x_consultada_el: "2026-10-28" }, "r").x_consultada_el, "2026-10-28");
  assert.throws(() => validateRule({ ...base, "x-mal": 1 }, "r"), /unknown field 'x-mal' \(extensions start with x_\)/);
});
