# Cursor Bugbot Review Instructions

Use these repository-specific rules when reviewing pull requests for the
Hobgoblin Ruin Prototype.

## What to flag

- Runtime errors in the Next.js client/server boundary, especially code that
  touches `window`, Phaser, canvas APIs, or browser-only assets outside client
  components or guarded effects.
- Gameplay regressions in `src/game/scenes/DungeonScene.ts`, including changes
  that break movement, collision, enemy pathing, projectile lifecycles,
  power-up timers, health/ammo accounting, score updates, game-over flow, or
  debug toggles.
- Map-generation bugs in `src/game/maps/startingDungeon.ts`, especially
  unreachable player/enemy starts, blocked stair tiles, invalid tile codes,
  out-of-bounds grid access, or props placed on reserved/blocked tiles.
- Asset-manifest mismatches in `src/game/assets/manifest.ts`, such as missing
  public files, incorrect frame sizes, duplicate Phaser texture keys, stale
  metadata paths, or new assets that are not preloaded before use.
- TypeScript strictness issues: unsafe casts, ignored nullability, implicit
  `any`, stale discriminated unions, or changes that bypass the manifest-derived
  literal types.
- Performance risks in the Phaser scene update loop, including unbounded object
  creation, timers/listeners that are not cleaned up, pathfinding work every
  frame, or sprite/effect pools that can grow without limits.
- Accessibility or metadata regressions in the Next.js app shell, including
  missing document metadata, unusable keyboard controls, or interactive UI added
  without keyboard and screen-reader support.
- Dependency or tooling changes that make `npm run build` fail, desynchronize
  lockfiles, or introduce unnecessary packages for behavior already supported by
  the current stack.

## What to leave alone

- Do not block a PR only for subjective game-balance preferences unless the
  change is internally inconsistent or obviously breaks documented behavior.
- Do not request broad refactors of the large Phaser scene unless the touched
  code introduces a concrete bug or makes the reviewed change unsafe.
- Do not flag generated art, sprite sheets, audio files, or processed asset
  metadata for aesthetics. Only flag them when paths, dimensions, formats, or
  references are inconsistent with the code.
- Do not ask to replace the Phaser canvas implementation with DOM UI. This game
  intentionally renders gameplay through Phaser inside a Next.js shell.

## Review tone and evidence

- Prioritize bugs that are reproducible from the diff and explain the user impact
  in one or two sentences.
- Include the smallest relevant file/line reference and, when useful, the
  command that would expose the issue.
- Prefer focused, actionable comments over broad style guidance.
