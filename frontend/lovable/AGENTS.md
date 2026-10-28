<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

## Project rules
- Landing is a single route (`src/routes/index.tsx`) composed from `src/components/donna/*`; demo case data and report text live in `src/lib/donna-case.ts` so rules are unit-tested.
- Browser chat calls only /api/donna/chat; its server handler proxies the existing Donna Next backend with fixed server-controlled origin, bounded input, same-origin validation and only donna_visitor cookies. No new model, AI gateway or agent keys.
- Product/design rules live in PRODUCT.md, DESIGN.md and LANDING_BRIEF.md; read before changing copy or styling.
- The /app leaf owns its marketing-free workspace shell; all session state and guided transitions use src/lib/donna-workspace.ts to keep uncertainty and summary rules testable.
- Local file selection retains metadata only, never parses or uploads files; summaries derive from shared user-supplied session state so profile edits remain synchronized.
- SessionProvider above the root Outlet owns workspace and intake reducers per render instance, never a mutable module singleton, so SPA handoffs preserve data without SSR visitor leakage.
- The state-free session context lives in a separate module from the refreshed provider so live component updates retain the provider/consumer identity without sharing visitor state globally.
- Intake registration uses a pure consent-validated, idempotent reducer and frozen snapshots independent of workspace edits; chat replies never populate structured facts or consent, and leads never use browser storage or external delivery.
- /operaciones owns a marketing-free operational shell; /app to /operaciones is a non-destructive SPA handoff exempt from the consultation navigation blocker.
- Root-owned chat hooks share a per-provider pending-request lock; explicit retries reuse the user turn without a scripted assistant fallback or duplicate lead.
- Admission chat and intake information use sibling forms with explicit button types so chat actions and cancellation cannot submit or restore the intake draft.
- New CTA admission drafts come from the central example factory and retain their example provenance through immutable registration; reopening never replaces an active draft or reads workspace data.
- The call simulation owns only modal-local timers; the sidebar CTA never opens intake until the explicit text handoff, so visual calls cannot send chat or mutate session records.

## Integrated Next deployment
- The root npm workspace and lockfile own installation. The source Bun lockfile is provenance only for this deployment.
- `scripts/build-frontend.mjs` prerenders an explicit route allowlist and copies client artifacts only. Next owns all runtime APIs.
- `/professional-contact` is the canonical operations URL; `/operaciones` remains compatible. Keep workspace handoffs non-destructive for both paths.
- `readDonnaMessage` is shared by the standalone proxy and the local Next alias. Never loosen the origin/body boundary to resolve hosting differences.
