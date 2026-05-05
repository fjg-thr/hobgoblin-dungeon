# Bugbot Review Instructions

Review this repository as a Next.js/React application that embeds a Phaser game prototype.

## Project context

- The user-facing game runs from `src/app/page.tsx` through `src/game/GameCanvas.tsx`.
- Most gameplay behavior lives in `src/game/scenes/DungeonScene.ts`.
- Static sprite, tile, UI, audio, and effect manifests live under `public/assets`, with the central typed asset manifest in `src/game/assets/manifest.ts`.
- Asset generation and processing scripts live under `tools` and `scripts`.

## Review priorities

When reviewing pull requests, prioritize findings that can cause:

1. Runtime crashes in the browser, especially Phaser scene lifecycle issues, missing assets, undefined animations, or stale event listeners.
2. Gameplay regressions in movement, combat, collision, spawning, scoring, pickups, UI overlays, or audio muting.
3. Next.js client/server boundary mistakes, including browser-only APIs outside client components.
4. TypeScript type safety issues that hide invalid game state or malformed asset manifests.
5. Asset path, frame-name, or manifest mismatches that would fail only after bundling or loading the scene.
6. Performance problems in the main update loop, rendering path, or input handlers that could degrade frame rate.
7. Accessibility regressions for Phaser/canvas UI zones and any React-rendered controls or overlays.

## Repository expectations

- Keep game logic deterministic where practical and avoid introducing unnecessary global state.
- Prefer small, localized fixes over broad rewrites of `DungeonScene.ts` unless the change explicitly needs a larger refactor.
- Preserve pixel-art rendering behavior and nearest-neighbor asset assumptions.
- Do not flag generated asset files solely for size or repetition unless the change creates a real loading, correctness, or repository-maintenance risk.
- If a change touches asset-processing scripts, check that the generated manifest keys still match the Phaser preload/create code.

## Verification signals to look for

Expect relevant pull requests to include one or more of:

- `npm run build`
- `npx tsc --noEmit`
- Manual browser verification for gameplay changes
- A focused explanation for asset-only changes when automated tests are not meaningful
