# Bugbot Review Instructions

Review this repository as a Next.js + Phaser game prototype. Prioritize findings that can break gameplay, builds, asset loading, or browser-only runtime behavior.

## Project context

- The app is a Next.js application using the App Router.
- Phaser must stay client-only. Guard browser APIs and dynamic imports so server rendering and builds do not touch `window`, `document`, canvas, audio, or WebGL.
- The playable scene lives primarily in `src/game/scenes/DungeonScene.ts`; it contains map rendering, input, combat, pickups, UI, audio, and game-over flow.
- Asset references are centralized in `src/game/assets/manifest.ts` and should match files under `public/assets`.
- Map generation and tile collision rules live in `src/game/maps/startingDungeon.ts`.

## Review priorities

1. Flag changes that can make `npm run build` fail, especially TypeScript strict-mode errors, incorrect imports, and server/client boundary mistakes.
2. Flag Phaser lifecycle leaks: duplicate game instances, listeners/timers/tweens that survive scene shutdown, unmanaged audio loops, or objects reused after destroy.
3. Flag gameplay regressions in movement, collision, enemy pathing, projectile behavior, pickup state, invulnerability, scoring, game-over, restart, and mute behavior.
4. Flag asset manifest drift: missing files, mismatched sprite frame sizes, wrong keys, stale metadata paths, or added assets not referenced through the manifest when appropriate.
5. Flag performance risks in the main update loop, including unbounded allocations, path recalculation every frame, runaway timers, and excessive display objects.
6. Flag accessibility and usability regressions for the page shell, start/restart interactions, keyboard controls, and pointer/mute controls.

## Preferred verification

- Run `npm run build` for broad TypeScript and Next.js validation.
- If linting is available in the installed Next.js version, run `npm run lint`; if the script is unsupported, report that explicitly instead of treating it as a code failure.
- For gameplay changes, also perform a quick manual browser smoke test when possible: load the game, start a run, move, fire, collect ammo/powerups, toggle mute, take damage, and restart after game over.

## Repository conventions

- Keep code in TypeScript strict mode.
- Prefer small, focused helpers when touching large scene logic, but avoid unrelated rewrites.
- Preserve the pixel-art rendering style: nearest-neighbor scaling, `pixelArt`, `roundPixels`, and crisp sprite assets.
- Do not introduce new runtime dependencies unless they are necessary for the requested behavior.
- Keep generated asset outputs and source prompts consistent with the existing asset pipeline.
