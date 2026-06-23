# Bugbot review rules for Hobgoblin Ruin

Use these rules when reviewing pull requests for this repository.

## Project context

- This is a Next.js app that hosts a Phaser 4 browser game.
- React is only responsible for app shell, metadata, and mounting the Phaser canvas.
- Core gameplay lives in `src/game/scenes/DungeonScene.ts`.
- Dungeon generation and map/tile semantics live in `src/game/maps/startingDungeon.ts`.
- Asset paths and sprite metadata are centralized in `src/game/assets/manifest.ts`; generated assets live under `public/assets`.

## Review priorities

1. Flag changes that can break server/client boundaries.
   - Phaser, `window`, `document`, canvas APIs, and audio APIs must remain client-side only.
   - Prefer dynamic imports or guarded `useEffect` code for browser-only modules.
   - Do not move game boot code into a server component.

2. Preserve gameplay coordinate invariants.
   - Distinguish tile coordinates, world points, screen positions, and collision bounds.
   - Keep player, enemy, projectile, pickup, and pathfinding logic in tile-space unless a conversion helper is used.
   - Validate collision against blocked tiles, chasms, props, walls, and enemy hitboxes after movement or spawn changes.

3. Treat the Phaser scene lifecycle as a source of bugs.
   - New timers, tweens, sounds, event listeners, graphics, and pooled objects must be stopped, removed, or reused on scene shutdown/restart.
   - Avoid React state updates or avoidable allocations in the Phaser update loop.
   - Preserve `MAX_SIMULATION_DT` style clamping when adding time-based gameplay.

4. Keep asset manifest and files in sync.
   - If a manifest entry changes, verify the referenced file exists under `public/assets`.
   - Sprite frame sizes, row counts, metadata JSON, animation keys, and audio keys must match the generated asset files.
   - Preserve pixel-art settings and avoid browser smoothing regressions.

5. Protect game balance and progression rules.
   - Review changes to health, ammo, enemy spawn rates, unlock thresholds, power-up duration, pickup chance, and score values for unintended difficulty spikes or stalls.
   - Check edge cases where no valid spawn tile exists, the player dies while effects are active, ammo is depleted, or a level restarts.

6. Check dependency and lockfile changes carefully.
   - `package.json` has an npm-oriented README, but both `package-lock.json` and `pnpm-lock.yaml` are present.
   - Flag dependency changes that update only one lockfile or introduce packages that duplicate existing platform capabilities.

7. Require practical verification for behavior changes.
   - For app or TypeScript changes, expect `npm run build` or an equivalent type/build command.
   - For generated assets, expect the relevant generator or processor script to be named in the PR notes.
   - For gameplay changes, look for manual test notes covering movement, firing, pickups, enemy contact, game over, restart, mute, and debug overlay when those areas are touched.
