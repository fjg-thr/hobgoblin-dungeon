# Bugbot review guidance

This repository is a Next.js and Phaser prototype for a dark isometric dungeon game.
When reviewing changes, prioritize user-visible gameplay regressions and runtime errors
over broad stylistic feedback.

## Project context

- The app entry point is in `src/app`, and the game is mounted from
  `src/game/GameCanvas.tsx`.
- Most gameplay behavior lives in `src/game/scenes/DungeonScene.ts`.
- Static assets and their Phaser atlas metadata live under `public/assets`.
- Asset generation and processing scripts live under `tools` and `scripts`.

## Review priorities

- Check Phaser scene lifecycle changes for leaks, duplicated listeners, stale timers,
  and objects that can survive scene restart.
- Check input changes for keyboard, pointer, and accessibility regressions in the
  surrounding Next.js page.
- Check combat, pickup, scoring, and enemy-spawn changes for edge cases around
  null or destroyed game objects.
- Check asset manifest and atlas changes for mismatched file names, frame keys, and
  public asset paths.
- Check map-generation and collision changes for unreachable areas, invalid tile
  coordinates, and player/enemy spawn points inside blocked tiles.
- Check audio changes for browsers that block autoplay until user interaction.

## Verification expectations

- Prefer `npm run build` for full Next.js and TypeScript validation when a Node.js
  toolchain is available.
- For asset-only changes, verify that every changed manifest or atlas entry points to
  an existing file and frame name.
- For gameplay logic changes, look for deterministic edge cases that can be reasoned
  from the code even when the game is not run interactively.
