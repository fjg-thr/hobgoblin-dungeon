# Bugbot Review Guide

This repository is a Next.js app that hosts a Phaser-powered, GBA-inspired
isometric dungeon prototype. Prioritize review findings that would affect
runtime gameplay behavior, asset loading, input handling, or production builds.

## Project context

- `src/app/*` contains the Next.js application shell.
- `src/game/GameCanvas.tsx` mounts and tears down the Phaser game in React.
- `src/game/scenes/DungeonScene.ts` contains most gameplay state, controls,
  enemy behavior, combat, pickups, HUD rendering, audio, and debug overlays.
- `src/game/maps/startingDungeon.ts` generates map data and collision metadata.
- `src/game/assets/manifest.ts` is the source of truth for loaded asset paths.
- `public/assets/**` contains runtime image, sprite-sheet, JSON, and audio assets.
- `tools/**` and `scripts/**` are asset-processing utilities.

## Review priorities

- Flag client/server boundary issues in Next.js components, especially Phaser or
  browser APIs accessed outside client-only code.
- Check Phaser scene lifecycle changes for leaked listeners, timers, tweens,
  sounds, DOM callbacks, or duplicate game instances after React remounts.
- Verify that asset manifest changes match real files under `public/assets/**`
  and that JSON frame names stay consistent with scene usage.
- Watch for gameplay state changes that can desynchronize health, ammo, score,
  enemy arrays, pickup arrays, cooldowns, invulnerability, or game-over flow.
- Validate collision, depth sorting, camera, and coordinate conversion changes
  against the isometric map model.
- Treat input changes as high risk when they affect keyboard, pointer, focus, or
  repeated-fire behavior.
- Flag performance risks in per-frame `update` paths, especially new allocation,
  unbounded loops, or work that scales with every tile, enemy, projectile, or
  particle.
- Check generated asset tooling for destructive writes, incorrect paths, and
  assumptions about local binaries or network access.

## Verification expectations

- Prefer focused evidence from `npm run build` and any narrower checks available
  for touched files.
- If local Node tooling is unavailable in the review environment, state that
  limitation instead of assuming the build passes.
- Do not request broad rewrites for prototype polish unless there is a concrete
  bug, regression risk, security issue, or clear maintainability failure in the
  changed lines.
