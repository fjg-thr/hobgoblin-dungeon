# Cursor Bugbot Review Guidance

Use this guidance when reviewing changes in this repository.

## Project context

- This is a Next.js App Router prototype for a dark GBA-inspired isometric dungeon game.
- Runtime game code uses React only to host a Phaser 4 scene. Most gameplay behavior lives in `src/game/scenes/DungeonScene.ts`.
- Assets are checked into `public/assets` with JSON manifests. The TypeScript manifest in `src/game/assets/manifest.ts` should stay in sync with those files.
- Dungeon layout and tile blocking live in `src/game/maps/startingDungeon.ts`; isometric rendering and depth helpers are split between exported tile constants there and scene helpers in `src/game/scenes/DungeonScene.ts`.
- The UI shell is intentionally small: `src/app/page.tsx`, `src/app/layout.tsx`, `src/app/globals.css`, and `src/game/GameCanvas.tsx`.

## Review priorities

1. Flag gameplay regressions that break movement, collision, camera follow, input handling, combat, pickups, scoring, game-over flow, or scene restart behavior.
2. Check Phaser lifecycle changes carefully. The game should still initialize only on the client, destroy cleanly on React unmount, and avoid duplicate `Phaser.Game` instances.
3. Verify asset changes across all required files: generated PNGs, generated JSON metadata, `public/assets/audio/audio-manifest.json` when audio changes, and `src/game/assets/manifest.ts`.
4. Watch for coordinate-space mistakes between tile, world, pointer, and screen positions. Isometric depth sorting and collision code are sensitive to small sign or offset changes.
5. Prefer deterministic, bounded simulation work in the scene update loop. Avoid unbounded allocations, timers, pathfinding, or particle creation that can grow every frame.
6. Preserve the pixel-art presentation: nearest-neighbor rendering, no smoothing, intentional low-resolution assets, and subtle lighting/effects.
7. Keep Next.js server/client boundaries intact. Files that touch `window`, Phaser, DOM refs, or browser-only APIs must remain behind `"use client"` or dynamic client-only imports.
8. Treat generated asset-processing tools under `tools/` and `scripts/` as part of the production pipeline. Review path handling, output dimensions, frame metadata, and idempotency.

## Verification expectations

- For code changes, run `npm ci` when dependencies need to be validated and `npm run build` before merging.
- `npm run lint` currently maps to `next lint`; with the locked Next.js 16 CLI this command fails because `next lint` is no longer available and `lint` is interpreted as a project path. Do not treat that known failure as evidence of a product regression unless the lint script or Next.js version changes.
- Builds may rewrite `next-env.d.ts` between `.next/types` and `.next/dev/types`. Treat that as generated build churn unless the TypeScript or Next configuration intentionally changed.

## Repository-specific review notes

- Do not suggest replacing Phaser gameplay with React state. React should host the canvas; Phaser should own frame-by-frame game simulation and rendering.
- Be cautious with large rewrites of `DungeonScene.ts`. Small, targeted changes are safer unless a patch includes focused tests or a clear decomposition.
- If a feature adds new controls, make sure keyboard and pointer interactions remain compatible with the documented README controls.
- If a change touches metadata, verify referenced public assets exist or are generated through a supported App Router metadata route.
