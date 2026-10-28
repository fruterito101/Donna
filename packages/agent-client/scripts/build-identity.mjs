// Turns agent/identity.md (the single source of Dona's identity) into src/identity.generated.ts.
// Runs before `npm run dev` and `npm run build`; the generated file is committed so a fresh clone builds.
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, "..", "..", "..");
const source = readFileSync(join(root, "agent", "identity.md"), "utf8");
const start = source.indexOf("## ");
if (start < 0) throw new Error("agent/identity.md has no '## ' section: nothing to send as identity");
const identity = source.slice(start).trim();

const out = join(here, "..", "src", "identity.generated.ts");
writeFileSync(
  out,
  "// GENERATED from agent/identity.md by `npm run identity` — edit that file, not this one.\n" +
    `export const IDENTITY = ${JSON.stringify(identity)};\n`,
);
console.log(`identity: ${identity.length} chars → packages/agent-client/src/identity.generated.ts`);
