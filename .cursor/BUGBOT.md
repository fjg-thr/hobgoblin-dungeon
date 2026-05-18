# Cursor Bugbot Review Instructions

Review this repository as a playable Next.js and Phaser dungeon prototype.
Prioritize user-visible bugs, runtime errors, regressions in game feel, and
issues that can block builds or deployment.

## Project context

- The app shell uses Next.js App Router, React, and strict TypeScript.
- Phaser owns the game loop, rendering, input, audio, animation, collision, and
  scene lifecycle.
- `src/game/GameCanvas.tsx` is the client-only boundary that dynamically imports
  Phaser and creates the `Phaser.Game` instance.
- The main gameplay implementation lives in
  `src/game/scenes/DungeonScene.ts`.
- Static art and audio live under `public/assets`; TypeScript references them
  through `src/game/assets/manifest.ts`.
- Dungeon generation, tile semantics, and map constants live in
  `src/game/maps/startingDungeon.ts`.
- Asset-processing and generation scripts live under `tools/` and `scripts/`.

## Review priorities

1. Flag changes that import Phaser, touch `window`, or access DOM/browser APIs
   from server-rendered code. Browser-only game code should stay behind
   client-only boundaries such as `GameCanvas`.
2. Check scene lifecycle changes for leaked timers, tweens, event listeners,
   audio, input handlers, or duplicate `Phaser.Game` instances after React
   remounts.
3. Treat per-frame code paths as performance-sensitive. Watch for avoidable
   object churn, unbounded arrays, repeated asset loading, or React state
   updates inside Phaser update loops.
4. Validate gameplay invariants when movement, combat, pickups, spawning, or
   map generation changes:
   - tile coordinates and world coordinates are not mixed accidentally;
   - collision and spawn checks respect blocked tiles, props, and safe player
     distance;
   - cooldowns, invulnerability windows, ammo limits, and enemy caps stay
     bounded;
   - large delta times are clamped before simulation.
5. For asset changes, verify that manifest keys, paths, frame dimensions,
   metadata files, and `public/assets` files stay in sync.
6. For metadata or social-sharing changes, verify that OpenGraph or Twitter
   image URLs resolve to tracked public assets with matching dimensions and
   useful alt text.
7. For UI or DOM controls, check keyboard access, visible labels, and
   appropriate ARIA attributes.
8. For audio changes, preserve mute behavior and avoid starting overlapping
   loops after scene restarts.
9. For TypeScript changes, prefer explicit narrow types and avoid weakening
   strictness with `any`, unsafe casts, or broad nullable state.

## Expected validation

When code changes affect runtime behavior, expect the PR to show at least one
relevant verification path, such as:

- `npm run build`
- `npx tsc --noEmit --incremental false`
- focused manual smoke notes for movement, combat, pickups, audio mute, game
  over, and restart flows

For asset pipeline changes, expect the specific generation or processing command
from `package.json`, `tools/`, or `scripts/`, plus `npm run build` if manifests
or imported assets changed.

The current `npm run lint` script invokes `next lint`, which is not supported by
the installed Next.js version in this repository. Do not require it until
linting is migrated to a supported ESLint command.

## Review tone

- Lead with bugs that are likely to affect players or break deployments.
- Include concrete file and line references for each finding.
- Keep suggestions scoped to changed code; avoid unrelated refactors.
