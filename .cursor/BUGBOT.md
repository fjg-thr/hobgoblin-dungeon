# Cursor Bugbot Review Guide

Review this repository as a small Next.js app that embeds a Phaser game.
Prioritize issues that can break gameplay, rendering, deploys, or browser
runtime behavior over style-only suggestions.

## Project shape

- `src/app/*` contains the Next.js app shell and metadata.
- `src/game/GameCanvas.tsx` dynamically imports Phaser and boots the game only
  on the client.
- `src/game/scenes/DungeonScene.ts` owns most gameplay state, input handling,
  rendering, collision, spawning, audio, and UI overlays.
- `src/game/maps/startingDungeon.ts` owns generated map topology and tile
  invariants.
- `src/game/assets/manifest.ts` must stay in sync with files under
  `public/assets`.

## High-value review checks

- Verify Phaser, `window`, canvas, audio, and input APIs stay behind client-only
  boundaries. Flag server-render or build paths that could touch browser-only
  APIs.
- Check React effects that create Phaser games, event listeners, timers, or
  audio for cleanup and idempotency, especially under React Strict Mode.
- In gameplay updates, look for mutation ordering bugs, stale object references,
  skipped removal from arrays, cooldown timers using inconsistent clocks, and
  state that survives restart/game-over unexpectedly.
- For collision, movement, pathfinding, spawning, and pickups, verify tile bounds
  and blocked-tile checks preserve the generated dungeon invariants.
- For asset changes, confirm manifest keys, paths, frame sizes, `framesPerRow`,
  animation frame names, and generated JSON metadata all agree with the files in
  `public/assets`.
- For audio changes, ensure mute state applies consistently to one-shot sounds,
  ambient loops, and music, and that browser autoplay constraints are respected.
- For UI and metadata changes, verify accessible labels where DOM controls are
  used and confirm OpenGraph/Twitter image paths resolve from the public root.
- Treat TypeScript strictness as a contract. Avoid `any`, unchecked non-null
  assertions, and broad casts unless there is a clear Phaser interop boundary.

## Lower-value findings

Do not spend review budget on generated art/audio assets, sprite-sheet binary
differences, or aesthetic tuning unless the change creates a broken reference,
runtime error, or clear gameplay regression.
