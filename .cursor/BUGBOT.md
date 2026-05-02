# Bugbot review instructions

Review this repository as a first-playable Next.js and Phaser dungeon game prototype.

## Project context

- The app is a Next.js React app with the playable game mounted from `src/app/page.tsx`
  through `src/game/GameCanvas.tsx`.
- Core gameplay lives in `src/game/scenes/DungeonScene.ts`.
- Dungeon generation and map helpers live in `src/game/maps/startingDungeon.ts`.
- Runtime asset keys and frame metadata are centralized in `src/game/assets/manifest.ts`.
- Sprite sheets, audio files, and related JSON metadata live under `public/assets`.
- Asset generation and processing scripts live under `tools` and `scripts`.

## Review priorities

- Flag gameplay regressions in movement, aiming, combat, enemy spawning, pickups,
  scoring, health, ammo, debug overlays, camera behavior, and start/game-over flow.
- Check that every new or changed runtime asset reference is present in both the
  manifest and the matching `public/assets` file or metadata JSON.
- Watch for Phaser lifecycle issues: leaked timers/listeners, duplicated animations,
  stale object references after scene restart, and game objects updated after destroy.
- Verify TypeScript safety, especially around discriminated unions, asset keys,
  optional game object references, and tile/world coordinate conversions.
- For React/Next changes, check client/server boundaries, accessibility for DOM UI,
  and that browser-only Phaser APIs are not used during server rendering.
- For asset scripts, ensure generated output paths, frame dimensions, and manifest
  entries stay synchronized and deterministic.

## Testing and validation expectations

- Prefer `npm run build` for repository-wide validation.
- If linting is changed or restored, include `npm run lint` results.
- For gameplay changes, describe the manual scenario that should be exercised in
  the browser, including controls and expected visible behavior.
- For asset changes, verify that the affected sheet JSON frame counts and dimensions
  match the corresponding image sheet assumptions.

## Style and scope guidance

- Keep changes focused; this prototype intentionally favors clear, readable gameplay
  code over broad architectural rewrites.
- Prefer existing patterns in `DungeonScene.ts`, `assetManifest`, and map helpers
  before introducing new abstractions.
- Treat generated binary assets and generated metadata as reviewable only for
  integration correctness unless the PR explicitly changes the asset pipeline.
