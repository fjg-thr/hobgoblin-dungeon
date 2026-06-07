# Bugbot review rules

Review this repository as a browser-only Next.js game prototype that embeds a
Phaser scene. Focus comments on bugs that would break local development,
production builds, gameplay correctness, asset loading, or the player
experience.

## Project context

- The app is a Next.js frontend. `src/app/page.tsx` renders
  `src/game/GameCanvas.tsx`, which dynamically imports Phaser and
  `src/game/scenes/DungeonScene.ts` on the client.
- `DungeonScene.ts` contains most gameplay state, map generation hooks,
  enemies, power-ups, HUD, audio, debug overlay, and input handling.
- Static sprite/audio assets live under `public/assets/**`; TypeScript asset
  metadata and Phaser preload references must stay in sync with those files.
- Asset-processing scripts under `tools/` and `scripts/` generate or transform
  files. Treat generated asset changes as lower risk unless they are not
  referenced correctly or break committed manifests.

## Flag as high-priority bugs

- Server-side rendering or hydration regressions, especially importing Phaser
  outside a client-only boundary or touching `window` before the client effect
  runs.
- Phaser lifecycle leaks: creating duplicate games, failing to destroy a scene
  or game instance, leaving timers/events/listeners active after teardown, or
  relying on React Strict Mode behavior that would create duplicate side
  effects.
- Asset path or manifest mismatches that would cause Phaser preload failures,
  missing frames, missing audio, or broken JSON atlas metadata at runtime.
- Gameplay state transitions that can leave the player stuck, invulnerable,
  unable to shoot/move, soft-locked on start/game-over screens, or unable to
  restart.
- Collision, pathfinding, spawn, pickup, or damage logic that can place actors
  outside valid map bounds, inside walls, or in unreachable states.
- Timing/cooldown changes that can underflow resources, bypass finite ammo,
  make power-ups permanent accidentally, or cause unbounded enemy/projectile
  growth.
- Build-breaking TypeScript changes, incorrect path aliases, missing imports,
  or assumptions that depend on a non-browser runtime.
- Dependency or config changes that make `npm run build` fail or require
  undeclared environment variables for normal local development.

## Review expectations

- Prefer concrete, reproducible findings tied to changed lines.
- For gameplay issues, explain the player-visible symptom and the state path
  that reaches it.
- For asset issues, name both the referenced path/manifest key and the expected
  committed asset.
- Do not request broad architectural rewrites unless the diff introduces a
  specific correctness or maintenance bug.
- Do not block on generated pixel-art/audio differences by themselves. Only
  comment when generated files are missing, inconsistent with manifests, or
  likely to fail at runtime.
- Avoid style-only comments unless they conceal a real bug, accessibility issue,
  build failure, or significant maintainability risk in changed code.

## Useful verification commands

When a change touches TypeScript, Next.js config, dependency files, or Phaser
runtime code, expect the author to run:

```bash
npm run build
```

When a change touches asset processing scripts, also expect the relevant
`npm run process:*` or `npm run generate:*` command from `package.json` to be
run if the required source assets are present.
