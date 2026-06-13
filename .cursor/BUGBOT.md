# Bugbot review guide for Hobgoblin Ruin

This repository is a Next.js App Router game shell around a Phaser dungeon
prototype. Use these instructions as repository-specific context when reviewing
pull requests.

## Project map

- `src/app/page.tsx` renders the game page.
- `src/game/GameCanvas.tsx` is the client-only React boundary that dynamically
  imports Phaser and creates/destroys the Phaser game instance.
- `src/game/scenes/DungeonScene.ts` owns the Phaser scene, game loop, combat,
  pickups, HUD, audio, input, and lifecycle cleanup.
- `src/game/maps/startingDungeon.ts` builds regenerated dungeon layouts.
- `src/game/assets/manifest.ts` is the source of truth for runtime asset paths,
  frame sizes, sprite keys, audio keys, and manifest metadata.
- `public/assets/**` contains runtime spritesheets, JSON manifests, tiles, UI,
  effects, and generated WAV audio.
- `tools/**` and `scripts/**` contain generator/processor tooling for source
  art, spritesheets, combat effects, pickup effects, powerups, and audio.

## Review priorities

### Next.js and React boundaries

- Phaser and browser-only APIs must stay behind client components, dynamic
  imports, `useEffect`, or other browser-only execution paths.
- `GameCanvas` should continue to destroy the Phaser game on unmount and avoid
  creating duplicate `Phaser.Game` instances during React re-renders.
- Changes to layout or metadata should not rely on generated files that are not
  committed under `public/`.

### Phaser lifecycle and performance

- Check every added scene event, input handler, timer, tween, sound, or global
  listener for cleanup on shutdown/destroy when Phaser does not own it.
- Avoid per-frame allocations in hot paths such as movement, enemy updates,
  projectile updates, collision checks, and HUD refreshes unless the allocation
  is clearly bounded and low volume.
- Preserve deterministic-enough gameplay state resets when a run restarts:
  enemies, projectiles, pickups, timers, cooldowns, HUD state, audio state, and
  player status should not leak between runs.
- Be cautious with unsafe casts or non-null assertions in `DungeonScene.ts`;
  strict TypeScript should remain meaningful.

### Gameplay invariants

- Movement uses isometric `WASD`/arrow input. Current shooting behavior is
  `Space` plus pointer/click firing; the README also mentions `J`, which is an
  existing docs/code mismatch unless a PR intentionally updates controls.
- Ammo is finite. Standard pickups refill staff bolts; seeker ammo exists in
  code and unlocks during a run even though README gameplay text does not fully
  document it.
- Powerups currently include quickshot, haste, ward, and blast. The README
  describes blast as late and rare, while current code may unlock blast earlier;
  treat that as an existing mismatch unless the PR changes progression.
- Combat changes should preserve health, ward blocking, hit feedback, scoring,
  projectile despawn, enemy cleanup, and game-over behavior.
- Collision and depth changes should be checked against isometric rendering:
  walls, props, enemies, player, projectiles, pickups, HUD, and debug overlays
  should draw and collide in coherent layers.

### Assets and generated files

- If a spritesheet, audio file, or tile asset changes under `public/assets/**`,
  verify the matching entry in `src/game/assets/manifest.ts` and any JSON
  metadata still agree on path, frame width, frame height, frame count, and key.
- If generator or processor scripts change under `tools/**` or `scripts/**`,
  confirm the command in `package.json` or documentation still points to the
  right script and that generated outputs are intentionally committed.
- Do not flag pixel-art style preferences as defects unless the diff breaks
  loading, alpha handling, sizing, metadata, animation indexing, or gameplay
  readability.

### UI, accessibility, and docs

- The game canvas is intentionally full-screen and keyboard/pointer driven.
  Review overlay UI changes for keyboard accessibility, readable contrast, and
  clear focus/interaction states when they add DOM controls.
- Keep README updates aligned with actual controls, unlock thresholds, asset
  lists, and available scripts.

## Suggested verification for PRs

- Prefer `npm ci`, `npm run build`, and `npx tsc --noEmit` for this repo.
- Do not rely on `npm run lint` as the only signal; the current script uses
  `next lint`, which may not be available in the installed Next.js version.
- When build or typecheck generates local artifacts such as `.next/`,
  `next-env.d.ts` rewrites, or `tsconfig.tsbuildinfo`, reviewers should expect
  those artifacts to be untracked or restored unless the PR intentionally
  changes generated typing behavior.
- For gameplay PRs, ask for a concise manual smoke test note covering movement,
  shooting, pickup collection, enemy damage, player damage, restart/game-over,
  mute toggle, and debug overlay when relevant to the diff.

## Bugbot deployment boundary

This file supplies repository-specific review guidance only. Managed Bugbot
activation must still be verified outside the repo by confirming Cursor
dashboard/org settings, Cursor GitHub App access to this repository, and a pull
request smoke check that produces a `Cursor Bugbot` review or status.
