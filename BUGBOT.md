# Bugbot review guide

This repository is a first playable Next.js and Phaser prototype for a dark
isometric dungeon game. Review changes for bugs that affect the shipped browser
experience rather than for general style preferences.

## High-priority review areas

- Game-loop safety in `src/game/scenes/DungeonScene.ts`: animation callbacks,
  timers, input handlers, scene restarts, and object cleanup must not leave
  stale Phaser objects or duplicate listeners behind.
- Browser-only APIs: guard access to `window`, `document`, `localStorage`,
  canvas, and audio APIs so Next.js build/server contexts and restricted browser
  environments do not crash.
- Controls and accessibility: keep README-documented controls in sync with
  implemented keyboard and pointer behavior.
- Asset manifest consistency: every referenced sprite sheet, audio file, frame
  name, and atlas key should exist under `public/assets`.
- Gameplay state invariants: health, ammo, score, enemy spawning, power-up
  timers, invulnerability, and restart state should reset predictably between
  runs.
- TypeScript and Next.js compatibility: flag changes that break `next build` or
  rely on deprecated framework commands.

## Lower-priority findings

Do not block on subjective pixel-art direction, balance tuning, or minor copy
edits unless they create a concrete bug or contradict documented behavior.
