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
- Frontend only: no backend, auth or AI calls in the current delivery; the guided workspace must not call the external Next /api/chat endpoint.
- Product/design rules live in PRODUCT.md, DESIGN.md and LANDING_BRIEF.md; read before changing copy or styling.
- The /app leaf owns its marketing-free workspace shell; all session state and guided transitions use src/lib/donna-workspace.ts to keep uncertainty and summary rules testable.
- Local file selection retains metadata only, never parses or uploads files; summaries derive from shared user-supplied session state so profile edits remain synchronized.
