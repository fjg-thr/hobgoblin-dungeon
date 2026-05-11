# Cursor Bugbot Review Instructions

Review pull requests for correctness regressions in this Next.js and Phaser
dungeon prototype. Prioritize issues that would break gameplay, rendering,
asset loading, build output, metadata generation, or runtime stability. Keep
comments actionable and avoid broad style feedback unless it hides a likely bug.

## Project context

- The app uses Next.js App Router with React and strict TypeScript.
- Phaser is currently `4.0.0-rc.4` per `package.json`; keep this note in sync on
  upgrades and do not assume Phaser 3-only APIs or behavior.
- The runtime game surface is small:
  - `src/app/layout.tsx` defines site metadata and OpenGraph/Twitter share image
    configuration.
  - `src/app/page.tsx` mounts the full-screen game canvas.
  - `src/app/globals.css` controls full-viewport sizing, overflow, canvas
    sizing, cursor behavior, and pixel rendering.
  - `src/game/GameCanvas.tsx` boots Phaser on the client.
  - `src/game/scenes/DungeonScene.ts` owns most scene, input, combat, UI,
    audio, and cleanup behavior.
  - `src/game/assets/manifest.ts` is the source of truth for runtime asset keys,
    paths, frame sizes, and typed asset unions.
  - `src/game/maps/startingDungeon.ts` defines procedural dungeon layout, tile
    codes, props, and map contracts.
- Game runtime assets live under `public/assets`; asset-manifest runtime paths
  should start with `/assets/...`. Next.js metadata assets may also live at the
  public root, but only when the referenced public file is checked in.
- Asset processing and generation scripts live in `tools/` and `scripts/`.

## High-signal findings to flag

- Top-level imports or server-component usage that causes Phaser, `window`,
  WebGL, Web Audio, canvas, pointer APIs, or local storage to run during SSR.
- Changes to `GameCanvas.tsx` that remove the dynamic `import("phaser")`, the
  duplicate-boot guard, cancellation handling, or `destroy(true)` cleanup
  without an equivalent lifecycle-safe replacement.
- Changes to `src/app/page.tsx` or `src/app/globals.css` that stop mounting the
  canvas, break full-viewport sizing, re-enable document scroll, remove the
  crosshair cursor from the game shell, or remove pixel-art canvas rendering.
- Changes to `src/app/layout.tsx` metadata that create invalid `metadataBase`
  URLs, point OpenGraph/Twitter images at missing files, or break
  local/Vercel URL handling.
- Phaser scene changes that leak event listeners, timers, tweens, sounds,
  sprites, graphics, containers, pooled objects, or shutdown handlers across
  scene restarts.
- New scene restart, game-over, mute, debug-overlay, or how-to-play UI code that
  can register duplicate handlers or leave stale interactive zones alive.
- Asset-manifest changes that do not update all coupled usage:
  - texture keys used by `DungeonScene.ts`;
  - sprite `frameWidth` / `frameHeight`;
  - frame ranges, row offsets, `framesPerRow`, or animation keys;
  - union-derived keys such as `TileAssetKey`, `AudioAssetKey`, and power-up,
    projectile, pickup, enemy, or actor names.
- Tile, prop, or map-code changes that break the contract between
  `startingDungeon.ts`, collision logic, rendering, prop placement, safe-spawn
  checks, enemy pathing, and `assetManifest.tiles`.
- Runtime asset-manifest path changes that reference files outside
  `public/assets` or mismatch checked-in PNG/WAV/JSON files. Do not apply this
  rule to valid Next.js public-root metadata assets, but still flag metadata
  references to missing public files.
- Game logic changes that can create impossible states: negative health or ammo,
  active pickups beyond caps, unbounded spawn/timer growth, projectiles that
  never despawn, enemies attacking after death, or power-up timers stacking
  incorrectly.
- Combat changes that skip invulnerability windows, hit stop, damage numbers,
  death effects, score increments, ammo drops, blast damage, seeker targeting,
  or game-over timing.
- Audio or mute changes that can start duplicate loops, ignore the mute state,
  fail under browser audio locking, or leave sound instances alive after
  restart.
- Control or instruction changes that leave `README.md`, in-game how-to-play
  text, pointer/click behavior, and actual keyboard bindings inconsistent.
  Verify the current key bindings in `DungeonScene.ts` before asserting which
  alternate firing keys are supported.
- Package or lockfile changes that make dependency resolution inconsistent
  between `package-lock.json` and `pnpm-lock.yaml`.

## Expected false positives to avoid

- Do not flag `metadataPath` fields in `src/game/assets/manifest.ts` as unused.
  They intentionally pair runtime assets with sidecar metadata for humans and
  tools.
- Do not flag generated sprite-sheet JSON files, processor notes, or
  prompt/provenance text as runtime code or secrets unless they contain actual
  credentials.
- Do not flag `public/assets/audio/audio-manifest.json` or
  `public/assets/tiles/dungeon-tileset.json` as dead code just because the
  current runtime uses the TypeScript manifest and direct tile paths.
- Do not request removal of the dynamic Phaser import in `GameCanvas.tsx`; it
  protects the Next.js server render boundary.
- Do not comment solely on `DungeonScene.ts` being large. File size is known;
  only flag structural issues when a change creates a concrete correctness or
  maintenance risk.
- Do not nitpick use of `"latest"` dependency ranges unless the pull request
  changes dependency management or creates a reproducibility problem.
- Do not request new libraries for review concerns that can be solved with the
  existing Next.js, React, TypeScript, Phaser, and local toolchain patterns.

## Review tone

- Lead with the concrete bug, reproduction path, or violated invariant.
- Include exact file and line references when possible.
- Prefer one focused comment per issue.
- If the concern depends on asset dimensions or generated files, say which
  manifest/file pair should be checked.
- For visual or gameplay changes without automated coverage, ask for a short
  manual smoke-test description covering the affected controls and game state.

## Suggested local verification

Use the narrowest useful checks for the files changed. These baseline commands
are useful when dependencies are available:

```bash
npm ci
npm run build
git diff --check
```

If a pull request changes generated assets or asset-processing code, also run
the relevant generator or processor command from `package.json`, `README.md`, or
the changed tool.
