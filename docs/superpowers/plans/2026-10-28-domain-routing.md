# Domain Routing Implementation Plan

> **For agentic workers:** Use superpowers:executing-plans to implement this plan inline. Steps use checkbox syntax for tracking.

**Goal:** Serve the approved landing, app and professional-contact URLs from the existing Next deployment without changing its agent credentials.

**Architecture:** Prerender the existing TanStack frontend at build time and publish only its HTML and client assets through Next public files and explicit rewrites. Keep Next API routes authoritative; the frontend chat alias validates the original same-origin request and calls the existing handler directly. Preserve TanStack navigation and shared in-memory session state.

**Tech Stack:** Next 16.4, TanStack Start, Vite, npm workspaces, Node tests and Vitest.

**Spec:** `docs/DOMINIO.md`, approved in chat on 2026-10-28.

## Global Constraints

- Landing `/`, app `/app`, contact center `/professional-contact`; `/operaciones` remains compatible.
- Keep `/api/chat`, `/api/report`, signed visitor cookies and server credentials.
- Preserve the source frontend and its standalone development mode.
- No public deployment or merge until the concrete change is tested and reviewable.

## Review Focus

- Direct refreshes and query strings on all approved paths must serve the matching page.
- Asset requests must return CSS/JS rather than the HTML fallback.
- Cross-origin, oversized or malformed chat bodies must never reach the agent.
- The chat alias must not recursively request the public domain or discard the signed visitor cookie.
- Prerendering must never include visitor/session data, and existing navigation must retain session state.

### Task 1: Publishable frontend and route boundary

**Files:** frontend package/config, new professional-contact route, workspace/intake links, routing tests, `scripts/build-frontend.mjs`, root workspace/lockfile, `apps/web/next.config.ts` and package scripts.

**Interfaces:** `npm run build:next -w @donna/frontend` produces prerendered HTML/client assets. The build script validates required outputs then installs them under `apps/web/public/donna` (ignored). Next rewrites only the four approved paths and the matching asset prefix.

- [x] Add a route regression asserting professional-contact resolves to its own route and operations remains compatible; observe the new case fail.
- [x] Register the route and update operational links/blocker exemptions.
- [x] Add a controlled frontend export mode with explicit page allowlist and fail-on-error prerendering.
- [x] Add frontend to npm workspaces and build it from the Next dev/build scripts; copy validated client files only.
- [x] Configure explicit Next rewrites; remove the obsolete test homepage.
- [x] Verify frontend tests, types and generated HTML/assets. Commit the tested task.

### Task 2: Same-origin chat alias

**Files:** frontend request validator/proxy, exports, `apps/web/src/app/api/donna/chat/route.ts`, request tests.

**Interfaces:** `readDonnaMessage(Request): Promise<string | Response>` validates origin, content type, streamed body size and message shape. Both standalone proxy and Next alias use it. The alias passes a clean message to existing `POST /api/chat` inside the original request context, so signing and cookies remain local to the visitor.

- [x] Add validator tests for foreign origin, oversized streamed body and trimmed valid message; observe missing-validator failures.
- [x] Extract validation without relaxing existing behavior and reuse it in both handlers.
- [x] Preserve no-store and existing API error behavior; no self-fetch or replacement of the agent client.
- [x] Verify request and proxy tests, frontend types and Next build. Commit the tested task.

### Task 3: Deployment integration proof and handoff

**Files:** `scripts/domain.integration.test.mjs`, package scripts, domain/readme/state documentation.

**Interfaces:** `npm run test:domain` runs against an already-built Next app and local mock agent only. It starts and stops its own processes; verifies page bodies/assets, malformed and cross-origin requests, and valid chat/cookie continuity.

- [x] Run built-artifact checks against the previous build to observe missing routes/landing or alias failure before the integrated build is produced.
- [x] Run all package/frontend tests, types, production build and the deployed-shape checks.
- [x] Check the resulting pages and navigation in the browser with the mock backend; capture evidence.
- [x] Document exact routing/build commands and prototype limitations; update the state log.
- [x] Request a fresh whole-branch review and resolve important findings: independent review completed without actionable findings.
- [x] Push feature branch `feat/domain-routing`.
- [ ] Create PR: GitHub connector returned 403 (Resource not accessible by integration); local gh CLI has no authenticated session. Open https://github.com/fruterito101/Donna/pull/new/feat/domain-routing. Public deployment remains unconfirmed.
