# Cursor Bugbot review guidance

Use this guide when reviewing changes in this repository. The project is a
Next.js App Router application that hosts a Phaser 4 browser game prototype.

## Review priorities

- Treat TypeScript strictness as a hard signal. Flag new `any` usage, unchecked
  nullable values, implicit shape assumptions, and casts that hide game-state
  bugs.
- Phaser must stay client-side. Flag direct Phaser imports or browser-only APIs
  in server components, metadata files, route handlers, or other server-rendered
  code. `src/game/GameCanvas.tsx` is the expected client boundary.
- Prefer small, deterministic game-state changes. Watch for duplicated timers,
  listeners, tweens, physics bodies, sprites, and scene references that are not
  cleaned up when a run restarts or a scene shuts down.
- Review tile, world, and camera math carefully. Off-by-one errors, mixed tile
  and pixel coordinates, and stale bounds checks can produce collision or spawn
  regressions.
- Keep asset keys, frame names, atlas JSON, and paths synchronized across
  `src/game/assets/manifest.ts`, `public/assets/**`, and any generator scripts.
- Do not allow secrets, `.env*` files, generated build output, or local cache
  artifacts into commits.

## Repository-specific context

- Main app entry points live in `src/app/page.tsx` and `src/app/layout.tsx`.
- Phaser bootstrapping lives in `src/game/GameCanvas.tsx`.
- The main gameplay scene is `src/game/scenes/DungeonScene.ts`; expect dense
  stateful logic and review behavior changes with extra care.
- Dungeon layout data lives in `src/game/maps/startingDungeon.ts`.
- Asset processing and generation tools live under both `tools/` and `scripts/`.
- Styling is plain CSS in `src/app/globals.css`; Tailwind is not configured in
  this repository.

## Gameplay review checklist

- Movement should preserve WASD and arrow-key support and keep camera follow
  behavior stable.
- Firing currently uses Space and pointer/click controls in the game. The README
  also mentions `J`; do not block unrelated PRs solely for that existing docs
  mismatch, but flag PRs that change input handling without updating docs.
- Ammo pickups, hearts, quickshot, haste, ward, blast, seeker ammo, goblins, and
  brutes should remain progression-gated unless a PR intentionally changes the
  balance.
- The README describes blast as late and rare, while current code unlocks it
  earlier. Treat that as existing context unless the PR is editing balance or
  documentation.
- Debug overlays and UI interaction zones should not capture input intended for
  gameplay unless the PR explicitly changes those controls.

## Verification expectations

Ask for or run the strongest applicable checks for the changed surface:

```bash
npm ci
npm run build
npx tsc --noEmit
```

`npm run lint` is currently wired to `next lint`, which is unreliable with newer
Next versions in this repo. Prefer build and `tsc --noEmit` until the lint setup
is modernized.

For gameplay changes, request a browser smoke test that starts a run, moves the
player, fires, takes damage, collects pickups, toggles sound, restarts after game
over, and checks the browser console for errors.

## Managed Bugbot deployment checks

This file gives Bugbot repository-local review context. It does not enable the
managed service by itself. End-to-end deployment still requires:

1. Cursor dashboard Bugbot enablement for `fjg-thr/hobgoblin-dungeon`.
2. Cursor GitHub App access to this repository.
3. A pull request smoke check where Bugbot posts a review or status.
4. If Bugbot does not run, trigger a verbose PR review with `cursor review
   verbose=true` and inspect dashboard/GitHub App permissions.
