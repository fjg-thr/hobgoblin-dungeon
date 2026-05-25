# Bugbot Review Instructions

This repository is a Next.js web prototype that boots a Phaser dungeon scene from a
client-only React component. Review changes with the expectations below.

## Review priorities

- Flag TypeScript strictness issues, browser-only code that can run during server
  rendering, and missing cleanup for Phaser objects, timers, tweens, event
  listeners, keyboard input, pointer handlers, and audio.
- Check gameplay changes for regressions in movement, collision, projectile
  lifetimes, enemy spawning/pathing, pickups, scoring, health, camera behavior,
  mute state, and debug overlay behavior.
- Verify asset references stay in sync across `src/game/assets/manifest.ts`,
  `public/assets/**/*.json`, and the actual files under `public/assets`.
- Treat generated or processed binary asset changes as lower signal unless the
  change also updates loader metadata, manifest keys, frame sizes, or gameplay
  code that depends on them.
- For large edits to `src/game/scenes/DungeonScene.ts`, prefer findings that
  identify concrete runtime risks. Avoid broad style comments unless they block
  maintainability or correctness.

## Project-specific checks

- Next.js App Router pages and layouts should keep server/client boundaries
  explicit. Phaser imports should stay behind client-only code paths.
- Phaser depth ordering should preserve the isometric illusion: floors below
  props, actors sorted by world Y, UI and modals above gameplay.
- Pixel art rendering should avoid smoothing or scaling changes that blur the
  GBA-style presentation.
- Asset processing scripts should remain deterministic and should not require
  network access for normal local verification.

## Useful verification commands

```bash
npm run build
```

If linting is added or restored in a future Next.js version, run it before
reporting review results.
