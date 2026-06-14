# Cursor Bugbot review guide

Use this repository context when reviewing pull requests for the Hobgoblin Ruin prototype.

## Review scope

- Prioritize defects in `src/`, especially gameplay state, Phaser scene lifecycle, collision, spawning, combat, pickups, HUD updates, audio cleanup, and React/Next.js integration.
- Treat `src/game/scenes/DungeonScene.ts` as the main gameplay surface. Check changes there for stale timers/listeners, unbounded arrays, depth ordering regressions, mismatched tile/world coordinates, and state that is not reset between runs.
- Review `src/game/maps/startingDungeon.ts`, `src/game/assets/manifest.ts`, and `src/game/GameCanvas.tsx` for map invariants, asset key/path consistency, SSR/client-only boundaries, and Phaser mount/unmount behavior.
- Deprioritize generated or processed assets under `public/assets/` unless a PR changes manifest references, dimensions, frame counts, or paths that can break loading.
- Deprioritize one-off generator/processor tooling under `tools/` and `scripts/` unless the PR changes asset pipeline behavior or checked-in outputs.

## Project facts

- This is a private Next.js/React/TypeScript app with a Phaser 4 game scene.
- TypeScript is strict. Keep imports precise and preserve existing module boundaries.
- The app uses `src/app/globals.css` and semantic markup; Tailwind is not configured in this repo.
- There is no in-repo CI workflow at the time this guide was added. Local validation should rely on the package scripts and TypeScript/Next.js commands below.
- `npm run lint` maps to `next lint`, which is not reliable with the current Next.js setup. Prefer `npm run build` and `npx tsc --noEmit` when judging review risk.

## Current gameplay behavior to preserve

- Movement uses WASD or arrow keys. Firing is implemented with `Space` and pointer/click input; README mentions `J`, but current code does not bind it. Do not block unrelated PRs solely on that existing docs/code mismatch.
- Staff bolts use finite standard ammo. Seeker ammo unlocks after 4 kills or 30 seconds, can drop as seeker pickups, and fires seeking projectiles when available.
- Powerups are progression gated: quickshot is available immediately, haste after 1 kill or 12 seconds, ward after 10 kills or 90 seconds, and blast after 2 kills or 16 seconds. README currently describes blast as late/rare; treat that as an existing mismatch unless the PR intentionally addresses docs or tuning.
- Brutes unlock after 3 kills or 22 seconds and have different health, contact, projectile hitbox, and knockback behavior from goblins.
- Heart pickups restore missing hearts without increasing max health.
- The scene intentionally uses lightweight collision/proximity checks rather than a full physics system.

## Bug patterns to flag

- Event listeners, keyboard handlers, tweens, intervals, audio nodes, or Phaser game instances that survive scene shutdown or React unmount.
- Changes that mutate shared config/manifest data at runtime.
- Projectile, enemy, pickup, popup, or effect arrays that keep dead objects or destroyed sprites.
- Coordinate bugs caused by mixing tile, world, screen, or camera-space values.
- Asset manifest changes that disagree with JSON frame dimensions, sheet row counts, animation names, or checked-in file paths.
- Gameplay tuning that makes a documented pickup, enemy, or control unreachable.
- Browser-only Phaser code imported into server-rendered modules without a client boundary.
- Accessibility regressions in the surrounding React UI, especially controls that become pointer-only without keyboard or readable text alternatives.

## Validation guidance

When relevant, recommend or run:

```bash
npm ci
npm run build
npx tsc --noEmit
git diff --check
```

If those commands fail because of pre-existing dependency, audit, or generated-type behavior, separate that baseline issue from regressions introduced by the PR.

## Managed Bugbot deployment boundary

This file supplies repository-specific context for Cursor Bugbot reviews. Enabling the managed Bugbot service still requires external setup:

- Cursor dashboard GitHub integration installed for `fjg-thr/hobgoblin-dungeon`.
- Bugbot enabled for this repository in Cursor dashboard settings or through the Cursor Admin API.
- A pull request smoke check that receives a Bugbot review, or a manual trigger such as `cursor review` / `bugbot run`.

If dashboard or GitHub App access is unavailable, report that repository guidance was deployed but managed-service enablement could not be proven from the codebase alone.
