# Bugbot Review Instructions

Review every pull request for defects that could break the playable Next.js and Phaser prototype. Prioritize actionable findings over style preferences, and include file/line references when possible.

## Project Context

- The app is a Next.js React application that renders a Phaser-based dungeon game.
- Gameplay logic lives primarily under `src/game`, with the scene implementation in `src/game/scenes/DungeonScene.ts`.
- Static game assets and sprite-sheet metadata live under `public/assets`; generated asset tools live under `tools` and `scripts`.
- TypeScript is strict and the project should continue to pass `npm run build`.

## Review Priorities

1. **Runtime correctness**
   - Flag changes that can crash during server-side rendering, hydration, or Phaser scene lifecycle setup.
   - Watch for browser-only APIs used outside client-only code paths.
   - Check async asset loading, scene restarts, cleanup, and event listener removal for leaks or duplicate handlers.

2. **Gameplay regressions**
   - Verify movement, aiming, combat, enemy spawning, pickups, scoring, lives, audio mute state, and debug overlay behavior remain coherent.
   - Flag state updates that can make runs unwinnable, spawn impossible collisions, desync UI from gameplay state, or make power-ups persist incorrectly.

3. **Asset and manifest consistency**
   - Ensure new asset paths match files under `public/assets` and are registered consistently in `src/game/assets/manifest.ts`.
   - Check sprite-sheet frame dimensions, animation keys, and JSON metadata names for mismatches.
   - Do not require regenerated binary assets unless code references them.

4. **Type safety and maintainability**
   - Prefer precise TypeScript types and narrow changes over broad rewrites.
   - Flag `any`, unchecked casts, duplicated magic constants, or shared mutable state when they hide real defects.
   - Keep Phaser-specific helpers small enough to understand and test independently.

5. **Dependency and security risk**
   - Flag unnecessary dependencies, unsafe package scripts, exposed secrets, or network calls that are not needed for local gameplay.
   - Treat changes to lockfiles, generated assets, and build configuration as high-signal review areas.

## Expected Verification

When a pull request changes TypeScript, React, Next.js config, or Phaser gameplay code, expect the author to run:

```bash
npm run build
```

If a pull request only changes documentation or generated asset metadata, use judgment and avoid requesting unrelated checks.
