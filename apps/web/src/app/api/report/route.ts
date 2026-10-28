// Facts → report. The engine decides what the law asks (verified rules only); Donna, if asked,
// only explains that report — she never adds a law (README §3). The input is loose on purpose:
// `detected` comes from the reader, `answered` from the user (docs/CONTRATOS.md §3).
import { askDonna } from "@donna/agent-client";
import { buildReport, explainBrief, type RawProfile } from "@donna/rules-engine";
import { FACTS, RULES } from "@donna/rules-engine/rules";
import { currentVisitor } from "@/lib/visitor";

const MAX_BODY = 20_000; // bytes
const MAX_FACTS = 100; // per side
const EXPLAIN_TIMEOUT_MS = 60_000;

// Drafts (unverified rules) are visible ONLY in `next dev` with DONNA_SHOW_DRAFTS=1:
// production never shows them, whatever its environment says (Brian, 2026-10-28).
const showDrafts = () => process.env.NODE_ENV !== "production" && process.env.DONNA_SHOW_DRAFTS === "1";

const asFacts = (v: unknown): RawProfile | undefined | "bad" => {
  if (v === undefined || v === null) return undefined;
  if (typeof v !== "object" || Array.isArray(v)) return "bad";
  return Object.keys(v).length > MAX_FACTS ? "bad" : (v as RawProfile);
};

export async function POST(request: Request) {
  const text = await request.text();
  if (text.length > MAX_BODY) return Response.json({ error: `body over ${MAX_BODY} bytes` }, { status: 413 });
  let body: { detected?: unknown; answered?: unknown; explain?: unknown };
  try {
    body = JSON.parse(text || "{}");
  } catch {
    return Response.json({ error: "invalid JSON" }, { status: 400 });
  }
  const detected = asFacts(body.detected);
  const answered = asFacts(body.answered);
  if (detected === "bad" || answered === "bad") {
    return Response.json({ error: `detected and answered must be objects of at most ${MAX_FACTS} facts` }, { status: 400 });
  }

  const result = buildReport({ detected, answered }, { rules: RULES, facts: FACTS, showDrafts: showDrafts() });
  if (body.explain !== true) return Response.json({ ...result, explanation: null });

  // The report never depends on the agent: if Donna fails, the report still goes out.
  const brief = explainBrief(result);
  if (!brief) return Response.json({ ...result, explanation: null, explanation_error: "nothing to explain" });
  const visitorId = await currentVisitor();
  if (!visitorId) return Response.json({ ...result, explanation: null, explanation_error: "agent not configured" });
  try {
    const { reply } = await askDonna(brief, "informe", { visitorId, timeoutMs: EXPLAIN_TIMEOUT_MS });
    return Response.json({ ...result, explanation: reply });
  } catch (e) {
    // agent-client errors never carry the agent's address or key.
    return Response.json({ ...result, explanation: null, explanation_error: e instanceof Error ? e.message : "agent error" });
  }
}
