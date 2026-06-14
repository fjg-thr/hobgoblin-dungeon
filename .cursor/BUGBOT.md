# Cursor Bugbot review guide

Use this repository guide when reviewing pull requests for Hobgoblin Ruin, a
Next.js App Router + React + TypeScript + Phaser 4 RC browser game.

## Project context

- Runtime UI lives in `src/app/**` and `src/game/**`.
- `src/game/GameCanvas.tsx` is the client-only boundary that boots Phaser.
- Most gameplay logic is in `src/game/scenes/DungeonScene.ts`; review state
  transitions, Phaser lifecycle cleanup, timers, collisions, and input handlers
  carefully.
- Dungeon layout data lives in `src/game/maps/startingDungeon.ts`.
- Runtime asset references are centralized in `src/game/assets/manifest.ts` and
  should match files under `public/assets/**`.
- Asset and audio generation tools live under `tools/**` and `scripts/**`; do
  not require generated-asset churn unless the PR intentionally changes assets.

## Review priorities

1. Flag changes that can break `npm run build` or strict TypeScript checks.
2. Keep Phaser-only code out of server components and preserve `"use client"`
   boundaries for browser APIs.
3. Check gameplay invariants: health cannot go negative, ammo spending and
   pickups stay consistent, power-up timers are cleaned up, score/kill counters
   do not double-count, and restart/game-over flows reset transient state.
4. Watch for off-by-one errors in tile coordinates, spawn bounds, collision
   checks, camera offsets, projectile lifetime, and timed enemy/power-up gates.
5. Verify asset keys, frame names, JSON metadata, and public paths together.
   Missing PNG/JSON pairs or renamed manifest keys should block review.
6. Keep PRs scoped. Do not accept broad refactors of `DungeonScene.ts`, asset
   pipelines, dependency versions, or lockfiles unless they directly support the
   requested change.
7. Treat accessibility and semantic HTML in `src/app/**` as reviewable surface.
   This repo does not use Tailwind or ShadCN today; prefer existing CSS patterns
   in `src/app/globals.css` unless a PR deliberately adds styling tooling.

## Known baseline notes

- README currently says `Space` or `J` fires, but the scene code binds keyboard
  firing to `Space`; do not block unrelated PRs for this existing mismatch.
- README does not describe seeker ammo, while current gameplay can unlock seeker
  pickups/projectiles. Only require documentation changes when a PR touches that
  behavior or user-facing control docs.
- README describes blast as rare late-game, while code currently gates blast
  earlier than that language suggests. Treat this as existing context unless a
  PR intentionally adjusts power-up progression.

## Suggested verification

Ask the author to run the smallest relevant subset, and prefer these commands
for broad app or gameplay changes:

```bash
npm ci
npm run build
npx tsc --noEmit
git diff --check origin/main...HEAD
```

For asset changes, also verify that every referenced asset exists, changed JSON
coordinates match the sprite sheet dimensions, and generated binary/source files
are intentionally included.

Avoid relying on `npm run lint` as a required gate unless the PR adds or fixes
lint configuration; this package defines `next lint`, which is not a reliable
Next 16 baseline here.

## Managed service boundary

This file provides repository-specific context for Cursor Bugbot. The managed
Bugbot service itself must still be enabled outside the repository through
Cursor dashboard/org settings and GitHub App repository access. A complete
deployment check should include a pull request smoke test that confirms Bugbot
can review or comment on this repository.
