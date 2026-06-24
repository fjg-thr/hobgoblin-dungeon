# Cursor Bugbot Review Guide

Use this file as repository-specific guidance when reviewing PRs for the
Hobgoblin Ruin prototype.

## Deployment boundary

- Cursor Bugbot is a hosted review service. This file only supplies review
  context after it is merged to the default branch.
- Confirm service enablement outside the repo when possible: Cursor dashboard or
  organization settings, GitHub App access for `fjg-thr/hobgoblin-dungeon`, and
  a smoke review on a live PR.
- If you cannot access those settings, say so. Do not claim hosted Bugbot is
  enabled based only on repository files.
- Manual top-level PR triggers supported by Cursor docs: `cursor review` or
  `bugbot run`. For diagnostics, use `cursor review verbose=true` or
  `bugbot run verbose=true` to surface request IDs and additional logs.

## Project shape

- Next.js app with React client bootstrapping in `src/app/page.tsx` and
  `src/game/GameCanvas.tsx`.
- Phaser 4 scene logic is concentrated in `src/game/scenes/DungeonScene.ts`.
- Runtime asset references live in `src/game/assets/manifest.ts`; audio loaded
  by the scene comes from `assetManifest.audio`.
- Generated assets live under `public/assets/**`. Generator and processor
  scripts include `tools/generate_audio_sfx.mjs`,
  `scripts/generate-retro-soundtrack.mjs`, `tools/process_assets.py`, and the
  other focused `tools/process_*.mjs` / `tools/generate_*.mjs` scripts.

## Review priorities

1. Gameplay regressions in `DungeonScene.ts`: movement/collision, camera follow,
   spawning, enemy contact damage, projectile lifetime, seeker ammo, blast
   effects, power-up durations, score, death/game-over state, and restart.
2. Asset integrity: manifest keys, sprite dimensions, frames-per-row metadata,
   audio keys, generated PNG/JSON pairs, and public paths must stay in sync.
3. React/Next integration: keep Phaser loaded client-side only, destroy the game
   on unmount, preserve full-screen resize behavior, and avoid server-only APIs
   in client components.
4. UX and accessibility surfaces: DOM pages should use semantic elements and
   existing `src/app/globals.css` patterns. Phaser-only controls should preserve
   clear pointer zones, keyboard/mouse affordances, readable overlays, and
   responsive placement inside the canvas.
5. Performance risk: avoid per-frame object allocation or unbounded tweens,
   timers, particles, sounds, event handlers, and retained Phaser objects.
6. Metadata and docs: check README/control docs and app metadata when related
   behavior changes.

## Known baseline notes

- README says `Space` or `J` fires, but the current scene binds keyboard shooting
  to `SPACE`; pointer/click firing also works. Flag only PRs that touch controls
  or worsen the mismatch.
- README documents standard ammo and power-ups, but seeker ammo is code-defined
  progression behavior. Review seeker changes against the code path, not only
  README wording.
- README describes blast as rare late-game, while `POWERUP_CONFIG` currently
  unlocks it earlier. Treat this as an existing docs/code mismatch unless a PR
  intentionally changes blast progression.
- `public/assets/audio/audio-manifest.json` is auxiliary; runtime audio source of
  truth is `assetManifest.audio` in `src/game/assets/manifest.ts`.
- `src/app/layout.tsx` references `/opengraph-image.png`; the baseline may not
  include that file. Block only PRs that touch share-image behavior or make this
  worse.
- `next lint` is not reliable with the current Next baseline. Prefer build and
  TypeScript checks below.
- Existing dependency audit advisories may appear during `npm ci`; do not block
  unrelated PRs solely on unchanged baseline advisories.

## Verification to request or run

- Install: `npm ci`
- Production build: `npm run build`
- Type check: `npx tsc --noEmit`
- Whitespace check for changed files: `git diff --check`
- Asset changes: run the exact generator/processor script for the touched asset
  family and confirm generated metadata dimensions match Phaser loading code.
- Manual smoke for gameplay PRs: start screen, movement with WASD/arrows, mouse
  aim, click fire, `Space` fire, ammo pickup, power-up pickup, mute toggle,
  game-over/restart, and resize.

## Review style

- Prioritize concrete correctness, runtime regressions, missing verification,
  and user-visible behavior over broad style preferences.
- Cite exact files and lines. Explain why the issue matters and what condition
  triggers it.
- Do not ask for unrelated refactors. Keep recommendations scoped to changed
  behavior and nearby invariants.
- Mention baseline mismatches as context, not as blocking findings, unless the PR
  changes that area.
