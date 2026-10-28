// Builds the strict Profile the engine needs from whatever the reader, an extraction model or the
// user sends. Never throws: what it cannot use it reports, so the caller can ask or log it.
import type { FactCatalog, Profile } from "./index.ts";
import { toAnswer, toFactName } from "./normalize.ts";

/** One fact as anyone may send it: a bare answer, or the answer with where it came from. */
export type FactInput =
  | boolean
  | number
  | string
  | null
  | undefined
  | { value: unknown; source?: string; confidence?: number; evidence?: string };

export type RawProfile = Record<string, FactInput>;

export type ProfileNote = {
  /** the fact name as it arrived */
  fact: string;
  problem: "unknown_fact" | "unreadable_value" | "low_confidence";
  value?: unknown;
};

export type BuiltProfile = {
  profile: Profile;
  /** where each known answer came from: «answered» beats «detected» */
  origin: Record<string, "answered" | "detected">;
  /** what was received but not used — never silently dropped */
  notes: ProfileNote[];
};

export type ProfileOptions = {
  /** detected facts below this confidence are treated as unknown, so Donna asks. A default, tune it. */
  minConfidence?: number;
};

function read(raw: RawProfile | undefined, facts: FactCatalog | undefined, minConfidence: number, notes: ProfileNote[]) {
  const out: Record<string, boolean | undefined> = {};
  for (const [key, input] of Object.entries(raw ?? {})) {
    const name = toFactName(key);
    if (facts && !(name in facts)) {
      notes.push({ fact: key, problem: "unknown_fact", value: input });
      continue;
    }
    const wrapped = input !== null && typeof input === "object";
    const answer = toAnswer(wrapped ? input.value : input);
    if (answer === null) {
      notes.push({ fact: key, problem: "unreadable_value", value: wrapped ? input.value : input });
      continue;
    }
    if (wrapped && typeof input.confidence === "number" && input.confidence < minConfidence && answer !== undefined) {
      notes.push({ fact: key, problem: "low_confidence", value: input.confidence });
      continue;
    }
    if (answer !== undefined || !(name in out)) out[name] = answer;
  }
  return out;
}

/**
 * detected = what the reader or a model inferred from the landing and the pitch.
 * answered = what the user said. A user's answer always wins over a detection; an «I don't know»
 * from the user does not erase what was detected.
 */
export function buildProfile(
  input: { detected?: RawProfile; answered?: RawProfile },
  facts?: FactCatalog,
  { minConfidence = 0.5 }: ProfileOptions = {},
): BuiltProfile {
  const notes: ProfileNote[] = [];
  const detected = read(input.detected, facts, minConfidence, notes);
  const answered = read(input.answered, facts, 0, notes);
  const profile: Profile = {};
  const origin: BuiltProfile["origin"] = {};
  for (const [name, value] of Object.entries(detected)) {
    if (value !== undefined) (profile[name] = value), (origin[name] = "detected");
  }
  for (const [name, value] of Object.entries(answered)) {
    if (value !== undefined) (profile[name] = value), (origin[name] = "answered");
  }
  return { profile, origin, notes };
}
