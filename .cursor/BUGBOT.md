# Bugbot review instructions

Review this repository as a Next.js web game prototype that embeds a Phaser scene.
Focus on defects that would affect gameplay correctness, build stability, browser
runtime behavior, or maintainability of the game loop.

## Project context

- The app entry points are in `src/app` and `src/game/GameCanvas.tsx`.
- Most gameplay behavior lives in `src/game/scenes/DungeonScene.ts`.
- Map generation lives in `src/game/maps/startingDungeon.ts`.
- Asset paths and manifests live in `src/game/assets/manifest.ts` and
  `public/assets/**`.
- Asset generation scripts live in `tools/**`; do not require regenerated binary
  assets unless code changes make them necessary.

## Review priorities

- Flag changes that can break `npm run build`, Next.js client/server boundaries,
  TypeScript type safety, or static asset loading.
- Flag Phaser lifecycle issues, especially leaked timers/listeners, scene restart
  bugs, duplicated animations, stale references after `destroy`, or objects that
  survive scene shutdown unintentionally.
- Flag gameplay regressions in movement, aiming, collision, enemy spawning,
  damage, health, ammo, power-ups, scoring, or game-over/restart flows.
- Flag browser-only API usage that can run during server rendering.
- Flag generated or binary asset churn when the code change does not require it.
- Flag package/dependency changes that are not justified by the implementation.

## Testing expectations

- For application code changes, expect at least `npm run build` to pass.
- For gameplay changes, prefer a manual run of the affected flow in the browser in
  addition to build validation.
- For asset script changes, expect the relevant npm asset-generation script to be
  run and the resulting files to be reviewed for intentional changes.

## Operational note

This file provides repository-specific context for Cursor Bugbot. Bugbot must
still be enabled for the repository in the Cursor dashboard, or through the
Bugbot Admin API by an account with the required team permissions.
