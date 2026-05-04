# Cursor Bugbot Review Guide

Use this repository-specific context when reviewing code changes for the Hobgoblin Ruin Prototype.

## Project context

- This is a Next.js app that mounts a Phaser 4 game client-side through `src/game/GameCanvas.tsx`.
- Core gameplay logic lives in `src/game/scenes/DungeonScene.ts`; map generation lives in `src/game/maps/startingDungeon.ts`.
- Static game assets are served from `public/assets` and referenced through `src/game/assets/manifest.ts`.
- The game is intentionally a dark, GBA-inspired isometric dungeon prototype. Preserve pixel-art rendering, simple controls, and the current arcade loop unless a change explicitly asks otherwise.

## Review priorities

1. **Runtime safety in browser-only code**
   - Flag imports or direct browser API usage that can run during server rendering.
   - `GameCanvas` should continue to lazy-load Phaser inside `useEffect` and clean up the Phaser game on unmount.

2. **Gameplay regressions**
   - Check changes to movement, aiming, collision, enemy spawning, projectiles, pickups, health, scoring, and game-over/start-screen flow for broken state transitions.
   - Be cautious with changes to timing constants and spawn probabilities because they can affect difficulty pacing.

3. **Asset and manifest consistency**
   - Verify every new manifest path has a corresponding file under `public/assets`.
   - Verify frame dimensions and row metadata match the related sprite sheet JSON or generated asset shape.
   - Avoid committing generated source assets unless the change intentionally updates art or audio.

4. **Map and collision invariants**
   - Ensure generated maps always have a playable start position, reachable rooms/corridors, valid stairs, and enough enemy spawn candidates.
   - Check tile-code additions update rendering, collision, and asset mapping together.

5. **React and TypeScript hygiene**
   - Prefer typed helpers and narrow interfaces over untyped object bags.
   - Keep React components small; large gameplay behavior belongs in Phaser scene code or focused game modules.
   - Avoid custom CSS for UI unless it is needed for the full-screen game shell; use existing app styling patterns.

## Verification commands

Prefer these commands when they are available in the environment:

```bash
npm install
npm run build
npx tsc --noEmit
```

The `lint` script currently uses `next lint`, which may not be available in newer Next.js versions. If it fails because the command is removed, prefer `npm run build` and `npx tsc --noEmit` for signal.

## Known repository constraints

- There are no dedicated unit or end-to-end tests in this repo yet.
- Phaser behavior is visual and timing-sensitive; when a change affects gameplay, recommend a manual smoke test in a browser:
  - start a run,
  - move with WASD or arrow keys,
  - aim/fire with mouse or keyboard,
  - collect ammo and powerups,
  - take damage and reach game over,
  - restart from the game-over screen.
- This repository-specific guide configures Bugbot review context. Enabling or disabling Bugbot itself is managed outside the repository through Cursor settings or the Bugbot Admin API.
