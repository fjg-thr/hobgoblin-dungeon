# Bugbot review instructions

Review this repository as a Next.js and Phaser browser-game prototype.

## Project context

- The app is a Next.js project with a single client-side Phaser game canvas.
- `src/app/page.tsx` mounts `src/game/GameCanvas.tsx`.
- `GameCanvas` dynamically imports Phaser and `DungeonScene` so Phaser only runs in the browser.
- Most gameplay behavior lives in `src/game/scenes/DungeonScene.ts`.
- Asset paths and strongly typed asset keys live in `src/game/assets/manifest.ts`.
- Dungeon generation, tile codes, and tile/prop helpers live in `src/game/maps/startingDungeon.ts`.
- Generated or processed art/audio assets live under `public/assets`, with source-processing scripts in `tools` and `scripts`.

## Review priorities

1. Flag changes that break client-only Phaser loading, especially direct Phaser or `window` usage in server components.
2. Check gameplay changes for state cleanup, timer/event cleanup, object-pool reuse, and accidental leaks across scene restart or React unmount.
3. Check map, collision, targeting, and pathfinding changes for edge cases at map boundaries and blocked tiles.
4. Verify asset manifest changes keep keys, paths, frame sizes, metadata files, and animation assumptions in sync with committed files.
5. Treat TypeScript strictness as important. Avoid `any`, unsafe casts, and untyped data flowing into gameplay state.
6. For generated assets and scripts, focus on deterministic outputs, clear paths, and avoiding accidental overwrites outside `public/assets`.
7. Keep the prototype lightweight. Prefer small, local fixes over broad rewrites unless the changed code already requires a clearer boundary.

## Expected verification

When code changes affect runtime behavior, ask for evidence from:

- `npm run build`
- TypeScript or lint checks available in the project
- Focused manual playtesting notes for gameplay changes, including the start screen, player movement, combat, pickups, game over, restart, and audio mute toggle when relevant

## Comment style

- Prioritize concrete bugs, regressions, missing verification, and maintainability risks.
- Include file paths and the smallest relevant code location.
- Avoid commenting on intentional generated-asset churn unless the files are missing, malformed, or inconsistent with the manifest.
