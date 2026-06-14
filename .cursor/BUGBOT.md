# Cursor Bugbot review guide

Use this guide when reviewing changes to Hobgoblin Ruin Prototype, a
Next.js/React/TypeScript app that boots a Phaser 4 dungeon scene in the browser.
The repo-side guide gives Bugbot project context; enabling the managed Bugbot
service still depends on Cursor dashboard/org settings and GitHub App access.

## Project map

- `src/app/` contains the Next.js shell, metadata, and global CSS.
- `src/game/GameCanvas.tsx` dynamically imports Phaser and `DungeonScene` on the
  client. Avoid SSR-only assumptions around Phaser code.
- `src/game/scenes/DungeonScene.ts` owns most runtime behavior: input, movement,
  combat, pickups, audio, HUD, spawning, effects, and debug overlays.
- `src/game/maps/startingDungeon.ts` defines dungeon generation, tile codes, and
  collision helpers.
- `src/game/assets/manifest.ts` maps committed assets under `public/assets/`.
- `tools/` and `scripts/` contain asset/audio generator and processor tooling.

## Review priorities

1. Catch runtime regressions that would break booting, rendering, input, combat,
   pickups, camera behavior, audio toggling, or game-over/restart flows.
2. For Phaser changes, check lifecycle cleanup for input listeners, timers,
   tweens, pooled objects, and scene shutdown.
3. For map/collision edits, verify walkable tiles, prop blockers, spawn safety,
   and screen/world/tile coordinate conversions remain consistent.
4. For asset changes, confirm manifest entries, JSON frame sizes, sprite sheet
   paths, and committed `public/assets` files stay in sync.
5. For Next.js changes, preserve the client-only Phaser boundary and avoid
   introducing browser globals into server components.
6. Prefer focused, low-churn changes. Do not request unrelated dependency,
   workflow, lockfile, or generated-asset updates unless the PR requires them.

## Known project context

- The README says `Space` or `J` fires, while current code binds keyboard firing
  to `Space` and also supports pointer/click firing. Do not block unrelated PRs
  solely for this existing docs/code mismatch; flag it only when controls or docs
  are already in scope.
- Seeker ammo is code-defined behavior that unlocks after 4 kills or 30 seconds.
  It is not fully documented in the README, so avoid treating the README as the
  sole gameplay source of truth.
- README text calls blast a rare late-game power-up, but current code unlocks
  blast after 2 kills or 16 seconds. Treat this as pre-existing unless a PR
  intentionally changes power-up progression or documentation.
- This repo does not use Tailwind. UI/style reviews should follow semantic markup
  and the existing `src/app/globals.css` patterns.
- `src/app/layout.tsx` references `/opengraph-image.png`; if metadata or CI
  checks change, verify the asset exists and is tracked.

## Verification guidance

Use the narrowest commands that match the change. Good default checks are:

```bash
npm ci
npm run build
npx tsc --noEmit
git diff --check "$(git merge-base HEAD origin/main)"..HEAD
```

`npm run lint` currently maps to `next lint`, which is unreliable with the active
Next.js version. Prefer build plus TypeScript unless a PR explicitly fixes lint
tooling. If verification rewrites `next-env.d.ts` or creates
`tsconfig.tsbuildinfo`, restore/remove generated churn unless the PR intentionally
changes generated typing behavior.

For runtime-sensitive changes, smoke test the app in a browser or with a local
Next server and confirm the canvas boots without console errors. Fixed-port smoke
tests can accidentally hit stale servers, so prefer dynamic ports when scripting
new checks.

## Managed Bugbot deployment boundary

This file does not by itself prove the hosted Bugbot service is enabled. When
validating deployment, also confirm:

- Cursor dashboard or organization settings enable Bugbot for this repository.
- The Cursor GitHub App has access to `fjg-thr/hobgoblin-dungeon`.
- A pull request smoke check receives a Bugbot review or status when available.

If those external controls are unavailable to the reviewer, state that repository
guidance was deployed but managed-service enablement could not be independently
verified from the codebase alone.
