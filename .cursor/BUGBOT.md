# Bugbot review guidance

Review this repository as a first-playable Next.js and Phaser web game prototype. Prioritize issues that can break runtime gameplay, asset loading, or deployment over cosmetic refactors.

## Project context

- The app is a Next.js project that renders a single client-side Phaser game from `src/game/GameCanvas.tsx`.
- Phaser is imported dynamically in the browser; avoid changes that make Phaser execute during server rendering.
- Most gameplay behavior lives in `src/game/scenes/DungeonScene.ts`; map generation helpers are in `src/game/maps/startingDungeon.ts`.
- Static assets are loaded from `public/assets` through `src/game/assets/manifest.ts`.
- TypeScript is strict, and the configured verification scripts are `npm run build` and `npm run lint`.

## High-priority review checks

- Flag any direct `window`, `document`, Phaser, audio, or canvas usage that can run outside client-only code.
- Check that new or renamed assets are present under `public/assets` and that manifest keys, frame dimensions, metadata paths, and animation frame assumptions still match the files.
- Watch for changes to tile coordinates, isometric transforms, collision boxes, entity radii, depth ordering, or camera bounds that could make the player, enemies, projectiles, pickups, or props clip through blocked tiles or render behind the wrong layer.
- Verify gameplay timers, cooldowns, spawn limits, invulnerability windows, power-up durations, and enemy respawn logic remain bounded and do not create runaway objects or permanent stuck states.
- Treat `DungeonScene.ts` changes as risky when they add more scene-level state without clear cleanup in scene shutdown, restart, or game-over flows.
- For map generation changes, check that every generated map has reachable floor, a valid player start, valid enemy starts, a reachable staircase, walls around playable space, and no blocking props on critical path tiles.
- For input changes, verify keyboard, pointer, pause/start/game-over, mute, and debug controls do not conflict or keep firing after the scene restarts.
- For UI/HUD changes, check resize behavior and pixel-art scaling at small and large viewport sizes.
- For audio changes, check browser autoplay constraints, mute persistence within the scene, loop cleanup, and missing asset failures.
- For generated asset tooling changes under `tools/` or `scripts/`, check that outputs are deterministic enough for review and do not rewrite unrelated assets.

## Testing expectations

- Ask for `npm run build` after TypeScript, Next.js, manifest, asset path, or rendering changes.
- Ask for `npm run lint` after source changes when the environment supports it.
- For gameplay changes without automated coverage, request a focused manual playtest covering start screen, movement, collision, combat, pickups, power-ups, game over, restart, mute, resize, and debug overlay behavior.
