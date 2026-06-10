# Bugbot Review Rules

Review this repository as a playable Next.js + Phaser game prototype. Prioritize actionable correctness issues that could break gameplay, rendering, asset loading, lifecycle cleanup, or deployment. Avoid broad style-only comments unless they hide a likely bug.

## Project shape

- Next.js App Router wraps a single client-only Phaser game.
- `src/game/GameCanvas.tsx` dynamically imports `phaser` and `DungeonScene`; do not allow Phaser imports in server components.
- `src/game/scenes/DungeonScene.ts` owns most gameplay state: player movement, combat, enemy AI, HUD, audio, start/game-over screens, restart, and debug overlays.
- `src/game/assets/manifest.ts` is the source of truth for asset keys, paths, frame sizes, sprite rows, and exported union types.
- `src/game/maps/startingDungeon.ts` owns dungeon generation, tile codes, blocking behavior, and player/enemy starts.
- `public/assets/**` contains generated runtime assets and metadata; asset generation scripts live in `tools/` and `scripts/`.

## What to flag

### Phaser and Next.js lifecycle

- Flag any top-level or server-side Phaser import. Phaser must stay behind client-only dynamic imports.
- Flag newly registered `input`, `scale`, DOM, timer, scene event, or animation listeners that do not have a matching teardown on scene shutdown, modal close, restart, or component unmount.
- Flag new tweens, timers, textures, particles, or display objects that can survive `restartGame()`, scene shutdown, or game unmount without being stopped or destroyed.
- Be especially strict about React Strict Mode double-mount behavior in `GameCanvas.tsx`.

### Gameplay state and restart safety

- When new mutable fields, collections, timers, cooldowns, status effects, pooled objects, or UI objects are added to `DungeonScene.ts`, verify they are initialized and reset on both a fresh start and `restartGame()`.
- Flag gameplay actions that ignore the core state gates: `gameStarted`, `gameOver`, `playerDying`, hit-stop timing, invulnerability windows, or modal overlays.
- Check that player input, enemy AI, projectiles, pickups, HUD updates, and audio do not keep running after game over or during player death.
- For combat changes, verify ammo, fire-rate cooldowns, power-up duration, ward protection, blast effects, score, and enemy death cleanup remain internally consistent.

### Asset and animation consistency

- Any change to `assetManifest` must stay synchronized with preload calls, animation frame ranges, config records, and runtime usage.
- Flag asset paths, keys, metadata paths, frame sizes, `framesPerRow`, or row indexes that do not match the corresponding sprite-sheet metadata or hard-coded animation ranges.
- When adding an enemy, power-up, prop, tile, effect, UI sprite, or audio cue, require updates to all relevant typed configs and loading/cleanup paths.
- Flag references to missing runtime files under `public/assets/**` unless the PR clearly includes the generated asset or matching pipeline update.

### Dungeon, collision, and map generation

- Changes to `TileCode`, `tileAssetForCode`, `isTileBlocked`, bridge/chasm behavior, prop blockers, or debug overlays must remain consistent.
- Flag walkable tiles that can strand the player, spawn enemies inside blocked tiles/props, or place pickups/projectiles where collision rules prevent use.
- For procedural generation changes, check bounds carefully: room sizes, corridor painting, bridge placement, wall placement, start positions, and reserved tiles.
- If new randomness affects gameplay balance or tests, prefer injectable random sources following the existing `createDungeon(random = Math.random)` pattern.

### Review and validation expectations

- Prefer focused changes in the large `DungeonScene.ts`; flag unrelated refactors that obscure gameplay behavior.
- TypeScript strictness should be preserved. Do not accept `any`, non-null assertions, or casts that hide unsafe runtime states without a clear invariant.
- For runtime changes, expect evidence from `npm run build` and, when touching lintable source patterns, `npm run lint` if available in the checkout.
- There is no dedicated test script today. Do not require a new test framework for every small PR, but flag high-risk gameplay logic with no meaningful validation path.

## What to ignore

- Do not block on the prototype nature of approximate collision, generated art, or intentionally simple combat unless a PR regresses the documented behavior.
- Do not request broad decomposition of `DungeonScene.ts` unless the edited area becomes harder to verify or introduces duplicated state/lifecycle logic.
- Do not nitpick stylistic preferences that are already consistent with nearby code.
