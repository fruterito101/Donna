// Visitor isolation: the cookie and the agent signature. The vectors were computed with Python's
// hmac/hashlib, the same algorithm the agent uses, so a mismatch between web and agent fails here.
import { test } from "node:test";
import assert from "node:assert/strict";
import { clientIdFor, clientSignature, newVisitorId, readVisitor, signVisitor } from "../src/index.ts";

const VID = "0123456789abcdef0123456789abcdef";
const SECRET = "test-secret";

test("client id and signature match the agent's algorithm (vector from Python)", () => {
  assert.equal(clientIdFor(VID), "v3eb1bd439947eb762998e566");
  assert.equal(
    clientSignature(clientIdFor(VID), SECRET),
    "08c955462d14d53f4a5dca0dbfa1d33a3e4e3bd4e1127139e96227175563a7d6",
  );
});

test("the cookie carries the id and its signature", () => {
  assert.equal(
    signVisitor(VID, SECRET),
    `${VID}.38bc18705e5708bdd4b897befda3dd1476531f6c2f177c5c7c3bde6635454784`,
  );
  assert.equal(readVisitor(signVisitor(VID, SECRET), SECRET), VID);
});

test("a forged, tampered or foreign cookie is rejected", () => {
  const good = signVisitor(VID, SECRET);
  const otherId = "ffffffffffffffffffffffffffffffff";
  assert.equal(readVisitor(`${otherId}.${good.split(".")[1]}`, SECRET), null); // someone else's id
  assert.equal(readVisitor(signVisitor(VID, "another-secret"), SECRET), null); // signed elsewhere
  assert.equal(readVisitor(`${VID}.${"0".repeat(64)}`, SECRET), null);
  assert.equal(readVisitor("web-1234", SECRET), null); // the old browser-chosen thread name
  assert.equal(readVisitor(undefined, SECRET), null);
  assert.equal(readVisitor(good, ""), null); // no secret configured → nobody passes
});

test("visitor ids are 128 random bits and do not repeat", () => {
  const ids = new Set(Array.from({ length: 1000 }, newVisitorId));
  assert.equal(ids.size, 1000);
  for (const id of ids) assert.match(id, /^[0-9a-f]{32}$/);
});

test("two visitors never share a client id", () => {
  assert.notEqual(clientIdFor(newVisitorId()), clientIdFor(newVisitorId()));
  assert.ok(clientIdFor(VID).length <= 32); // the agent truncates ids at 32
});
