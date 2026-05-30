# Bugbot Review Guide

Review this repository as a Next.js application that embeds a Phaser-powered
GBA-style dungeon prototype. Prioritize bugs that can affect gameplay,
rendering, build output, or shipped assets.

## Project-specific priorities

- Verify client-only Phaser code stays isolated from server rendering paths.
  Components that touch `window`, canvas, Phaser, audio, pointer input, or game
  scene state should remain behind client components and browser lifecycle
  guards.
- Check that gameplay state changes in `src/game/scenes/DungeonScene.ts` keep
  related timers, spawn rules, collision checks, animation cleanup, and UI state
  in sync. Flag logic that can leak Phaser objects, leave listeners registered,
  or let game-over/restart flows reuse stale state.
- When assets are added or renamed, confirm the files exist under
  `public/assets`, their JSON frame data matches the referenced PNGs, and
  `src/game/assets/manifest.ts` references the same keys used by the scene.
- Watch for coordinate-space mistakes in isometric movement, collision, camera,
  pointer aiming, and tile placement. Code that mixes screen, world, tile, or
  grid coordinates should be reviewed carefully.
- Treat audio and image loading as user-facing runtime paths. Flag missing
  preload entries, incorrect public URLs, mismatched manifest keys, or code that
  can attempt playback before assets are ready.
- Prefer findings that identify concrete runtime failures, regressions, or
  broken build behavior. Avoid comments that are only stylistic unless they hide
  a likely bug.

## Verification expectations

- For TypeScript, React, or Next.js changes, check that the repository can still
  pass `npm run build`.
- For asset-only changes, check that all referenced files are committed and that
  sprite-sheet metadata remains consistent with runtime usage.
- For gameplay changes, reason through start, restart, game-over, mute, power-up,
  pickup, enemy spawn, and debug overlay flows when they are touched by the diff.
