# Bugbot review instructions

Review this repository as a playable Next.js and Phaser game prototype.

## Project context

- The app is a Next.js client-rendered game shell that dynamically boots Phaser from `src/game/GameCanvas.tsx`.
- Most gameplay, spawning, collision, combat, UI state, and audio behavior lives in `src/game/scenes/DungeonScene.ts`.
- Map generation and tile collision helpers live in `src/game/maps/startingDungeon.ts`.
- Asset paths and sprite metadata are centralized in `src/game/assets/manifest.ts` and must match files under `public/assets`.
- Generated asset-processing scripts live under `tools/` and `scripts/`; avoid reviewing generated image/audio outputs as hand-written source changes.

## What to prioritize

- TypeScript correctness under the repo's strict `tsconfig.json`.
- Next.js client/server boundaries, especially accidental browser API use outside client-only code.
- Phaser lifecycle bugs: duplicated game instances, missing cleanup, unbounded timers/events, stale scene references, or async asset loading races.
- Gameplay regressions affecting movement, aiming, collision, enemy pathing, pickup state, scoring, health, ammo, power-up timing, and game-over/restart flows.
- Asset manifest mismatches: wrong keys, missing files, incorrect frame dimensions, or metadata paths that break preload/animation creation.
- Performance risks in the main update loop, especially allocations or full-map scans that scale every frame.
- Accessibility and usability of DOM controls around the canvas, including mute/restart/start interactions when they are implemented outside Phaser.

## Review style

- Focus findings on concrete bugs, regressions, security issues, or missing verification that can affect shipped behavior.
- Prefer small, actionable comments tied to the changed lines.
- Do not block on broad architecture refactors, visual taste, generated binary assets, or future milestone ideas unless the change makes them worse.
- When suggesting tests, point to the smallest useful verification: `npm run build`, a targeted TypeScript check, or a manual gameplay path that exercises the changed behavior.
