# Bugbot review guidance

Use this repository context when reviewing pull requests.

## Project context

- This is a Next.js/React TypeScript prototype for a Phaser-powered dark isometric dungeon game.
- The main application entry points are `src/app/page.tsx`, `src/app/layout.tsx`, and `src/game/GameCanvas.tsx`.
- Most gameplay behavior lives in `src/game/scenes/DungeonScene.ts`.
- Procedural map generation and tile classification live in `src/game/maps/startingDungeon.ts`.
- Asset metadata and public asset paths live in `src/game/assets/manifest.ts`.
- Generated and processed assets live under `public/assets`; asset-processing scripts live under `tools` and `scripts`.

## Review focus

- Flag runtime issues that can break Next.js client rendering, Phaser boot/destroy lifecycle, or browser-only imports.
- Check TypeScript changes for unsafe casts, weakened types, and mismatches between manifest keys and Phaser asset usage.
- Pay close attention to coordinate-space conversions between tile, world, screen, and pointer positions.
- Review combat, pickup, enemy, and collision changes for state updates that can happen after objects are destroyed.
- Treat asset path, frame size, and JSON metadata changes as high risk because mismatches usually fail at runtime.
- For generated asset changes, verify that the source script or prompt history explains how assets can be reproduced.

## Expected verification

- Run `npm run build` for application and TypeScript validation before merging.
- If gameplay logic changes, manually smoke-test the game locally enough to start a run, move, aim, shoot, collect pickups, and trigger game over.
- If asset-processing scripts change, run the relevant `npm run process:*` or `npm run generate:*` script and confirm the checked-in outputs are intentional.

## Repository conventions

- Keep gameplay edits localized unless a shared type or manifest contract needs to change.
- Prefer descriptive TypeScript interfaces and constants over untyped object literals for gameplay state.
- Preserve the pixel-art rendering defaults in Phaser configuration unless the change intentionally updates art direction.
- Avoid broad refactors inside `DungeonScene.ts` unless they directly reduce risk for the reviewed change.
