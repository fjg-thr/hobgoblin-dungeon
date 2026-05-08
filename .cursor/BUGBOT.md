# Cursor Bugbot Review Instructions

Review pull requests for correctness regressions in this Next.js and Phaser dungeon prototype. Prioritize issues that would break gameplay, rendering, asset loading, build output, metadata generation, or runtime stability. Keep comments actionable and avoid broad style feedback unless it hides a likely bug.

## Project context

- The app uses Next.js App Router with React and strict TypeScript.
- Phaser is currently `4.0.0-rc.4` per `package.json`; keep this note in sync on upgrades and do not assume Phaser 3-only APIs or behavior.
- The runtime game surface is small:
  - `src/app/layout.tsx` defines metadata, Open Graph, and Twitter share-image configuration.
  - `src/game/GameCanvas.tsx` boots Phaser on the client.
  - `src/game/scenes/DungeonScene.ts` owns most scene, input, combat, UI, audio, and cleanup behavior.
  - `src/game/assets/manifest.ts` is the source of truth for runtime asset keys, paths, frame sizes, and typed asset unions.
  - `src/game/maps/startingDungeon.ts` defines procedural dungeon layout, tile codes, and map contracts.
- Static assets live under `public/assets`; runtime game paths should start with `/assets/...`.
- Public metadata images such as `/opengraph-image.png` are served from `public/`.
- Asset processing and generation scripts live in `tools/` and `scripts/`.

## High-signal findings to flag

- Top-level imports or server-component usage that causes Phaser, `window`, WebGL, `localStorage`, or other browser-only APIs to run during SSR.
- Changes to `GameCanvas.tsx` that remove the dynamic `import("phaser")`, the duplicate-boot guard, cancellation handling, or `destroy(true)` cleanup without an equivalent lifecycle-safe replacement.
- Phaser scene changes that leak event listeners, timers, tweens, sounds, sprites, zones, or shutdown handlers across scene restarts.
- Metadata or share-image changes in `src/app/layout.tsx` that point to missing `public/` files, use invalid image dimensions, or make `metadataBase` invalid for local and deployed environments.
- Asset-manifest changes that do not update all coupled usage:
  - texture keys used by `DungeonScene.ts`;
  - sprite `frameWidth` / `frameHeight`;
  - frame ranges, row offsets, `framesPerRow`, or animation keys;
  - union-derived keys such as `TileAssetKey`, `AudioAssetKey`, and power-up or actor names.
- Tile or map-code changes that break the contract between `startingDungeon.ts`, collision logic, rendering, prop placement, and `assetManifest.tiles`.
- Asset path changes that reference files outside `public/assets` for runtime game assets or mismatch checked-in PNG/WAV/JSON files.
- UI overlay changes that can leave stale interactive zones active, block the mute button, or start the run multiple times from the start/how-to-play screens.
- Game logic changes that can create impossible states: negative health or ammo, unbounded spawn/timer growth, projectiles that never despawn, enemies attacking after death, or power-up timers stacking incorrectly.
- Seeker-shot, ammo-pickup, and projectile changes that bypass ammo limits, fail to despawn on collision/range expiry, or target enemies that are already dying.
- Audio or mute changes that can start duplicate loops, ignore the persisted mute state, play while the sound manager is locked, or leave sound instances alive after restart.
- Package or lockfile changes that make dependency resolution inconsistent between `package-lock.json` and `pnpm-lock.yaml`.

## Expected false positives to avoid

- Do not flag `metadataPath` fields in `src/game/assets/manifest.ts` as unused. They intentionally pair runtime assets with sidecar metadata for humans and tools.
- Do not flag generated sprite-sheet JSON files, processor notes, or prompt/provenance text as runtime code or secrets unless they contain actual credentials.
- Do not flag `public/assets/audio/audio-manifest.json` or `public/assets/tiles/dungeon-tileset.json` as dead code just because the current runtime uses the TypeScript manifest and direct tile paths.
- Do not request removal of the dynamic Phaser import in `GameCanvas.tsx`; it protects the Next.js server render boundary.
- Do not comment solely on `DungeonScene.ts` being large. File size is known; only flag structural issues when a change creates a concrete correctness or maintenance risk.
- Do not nitpick use of `"latest"` dependency ranges unless the pull request changes dependency management or creates a reproducibility problem.
- Do not treat missing automated tests as a standalone finding for asset-only or documentation-only pull requests. Prefer checking whether the relevant build, asset, or gameplay verification was run.

## Review tone

- Lead with the concrete bug, reproduction path, or violated invariant.
- Include exact file and line references when possible.
- Prefer one focused comment per issue.
- If the concern depends on asset dimensions or generated files, say which manifest/file pair should be checked.
