# Bugbot Review Guide

This repository is a Next.js prototype for a GBA-inspired isometric dungeon game. Bugbot should prioritize review findings that can produce real player-facing bugs, runtime crashes, broken builds, or asset-loading failures.

## Project context

- The app runs through Next.js App Router. `src/app/page.tsx` renders the client-only Phaser host in `src/game/GameCanvas.tsx`.
- Phaser game logic lives primarily in `src/game/scenes/DungeonScene.ts`; changes there often affect movement, combat, spawning, collision, audio, and UI overlays together.
- Dungeon layout helpers and tile collision rules are in `src/game/maps/startingDungeon.ts`.
- Asset keys and file paths are centralized in `src/game/assets/manifest.ts`; generated assets live under `public/assets/**`.
- TypeScript is strict and uses the `@/*` path alias for `src/*`.

## Review focus

- Flag crashes caused by server/client boundary mistakes, especially browser-only APIs or Phaser imports used outside client-only code paths.
- Check that new Phaser objects are destroyed or cleaned up when scenes restart, actors despawn, or React unmounts the game canvas.
- Verify collision, movement, projectile, and enemy-spawn changes keep tile coordinates and world coordinates consistent.
- Check that every referenced asset key exists in `assetManifest` and maps to a committed file under `public/assets`.
- Watch for game-state updates that can run after game over, scene shutdown, or actor removal.
- Treat build, type, and lint regressions as important even if the game appears playable locally.

## Low-signal feedback to avoid

- Do not request broad refactors of `DungeonScene.ts` unless a concrete bug is introduced by the diff.
- Do not flag generated asset dimensions or sprite-sheet metadata unless the diff references inconsistent frame sizes, missing files, or invalid JSON.
- Do not suggest replacing the Phaser canvas architecture with React components; React should remain a shell around the game.

## Useful verification commands

When relevant to the diff, recommend these commands:

```bash
npm run build
npx tsc --noEmit
```
