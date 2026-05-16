# Bugbot review instructions

Review this repository as a browser game prototype built with Next.js, React,
TypeScript, and Phaser.

Prioritize findings that would affect shipped gameplay or production builds:

- Next.js client/server boundaries. Phaser code must stay behind client-only
  entry points and browser APIs should not run during server rendering.
- Phaser lifecycle and resource cleanup. Look for leaked scenes, timers,
  event listeners, tweens, sounds, textures, or DOM/canvas references.
- Gameplay correctness. Pay close attention to collision math, tile/world
  coordinate conversion, pathfinding, spawn timing, pickup effects, health,
  ammo, scoring, and game-over state transitions.
- Asset manifest consistency. New assets should be listed in the appropriate
  manifest, use paths under `public/assets`, and match frame dimensions and
  metadata referenced by Phaser loaders.
- Input and accessibility regressions. Keyboard, pointer, audio-toggle, debug,
  and restart interactions should remain usable and should not trap browser
  focus unexpectedly.
- Build health. Changes should keep `npm run build` and TypeScript checks
  passing without relying on local-only generated files.

Do not flag prototype polish or missing long-term architecture as bugs unless
the diff introduces a concrete user-facing failure, runtime exception, resource
leak, or build break.
