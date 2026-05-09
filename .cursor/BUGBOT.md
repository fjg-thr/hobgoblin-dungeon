# Cursor Bugbot Review Guidance

Use this repository-specific guidance when reviewing code for the Hobgoblin Ruin
prototype. Prioritize runtime regressions and review comments that help preserve
the current Next.js + Phaser game behavior.

## Project context

- This is a Next.js app that mounts a Phaser 4 release-candidate game client-side.
- `src/app/page.tsx` renders the game shell; `src/game/GameCanvas.tsx` owns the
  dynamic Phaser import and game instance lifecycle.
- `src/game/scenes/DungeonScene.ts` contains most gameplay, UI overlays, asset
  loading, audio, spawning, projectiles, collisions, and cleanup.
- `src/game/assets/manifest.ts` is the contract between code and files under
  `public/assets`.
- `src/game/maps/startingDungeon.ts` defines generated dungeon layout data and
  tile-code semantics.
- Asset-processing scripts in `tools/` and `scripts/` generate checked-in
  sprites, audio, and JSON metadata.

## High-priority review areas

### Next.js and client-only Phaser boundaries

- Phaser must remain behind a client boundary. Flag changes that import
  `phaser`, `DungeonScene`, or browser-only globals into server components,
  metadata code, or module scope that executes during SSR.
- `GameCanvas` should keep lazy `import("phaser")` and destroy the Phaser game
  in the `useEffect` cleanup. Flag changes that can create duplicate games on
  React remounts or leave canvases/listeners alive.
- Window, document, canvas, WebGL, audio, and input APIs should be used only
  after the client effect starts.

### Phaser lifecycle and cleanup

- Scene shutdown must remove timers, tweens, keyboard/input listeners, audio
  handles, generated textures, masks, particle-like sprites, and overlay objects
  created by the scene.
- Flag lingering references in arrays such as projectiles, enemies, pickups,
  death sprites, combat-juice objects, dungeon objects, coordinate labels, and
  afterimages when objects are destroyed.
- Phaser 4 RC APIs can differ from Phaser 3 examples. Be cautious with API
  migrations and verify method names against the installed `phaser` package.

### Assets and metadata contracts

- Any new manifest path must point to a checked-in file under `public/assets`
  and should be loaded with the right loader (`image`, `spritesheet`, or
  `audio`).
- Sprite-sheet `frameWidth`, `frameHeight`, frame ordering, and `framesPerRow`
  must match the corresponding PNG/JSON metadata and all animation frame math.
- Metadata paths in the manifest should stay in sync with JSON files. Flag
  hard-coded frame indices that contradict the manifest or the JSON metadata.
- Review public URL paths carefully. Next.js serves `public/foo.png` as
  `/foo.png`, while game assets here generally live under `/assets/...`.

### Metadata and share images

- `src/app/layout.tsx` declares Open Graph and Twitter metadata using
  `/opengraph-image.png`. When metadata is touched, verify the referenced share
  image exists in `public/opengraph-image.png`, or that the change intentionally
  adds a generated Next.js metadata image route such as `src/app/opengraph-image`.
- Metadata URL construction should remain server-safe. `NEXT_PUBLIC_SITE_URL`
  and `VERCEL_URL` handling must continue to create valid absolute URLs without
  importing Phaser or game modules.

### Dungeon map and collision contracts

- `startingDungeon.ts` tile codes have gameplay meaning. Preserve the current
  playable/blocking assumptions for floor variants, bridges, chasms, stairs,
  walls, props, and spawn reservations.
- If new tile codes are introduced, verify updates across map generation,
  rendering, collision, debug overlays, spawn selection, and any helper that
  maps tile codes to manifest assets.
- Player, enemy, projectile, and pickup collision checks should use the same
  coordinate system and bounds assumptions as rendering.

### Gameplay invariants

- Player health should not exceed the intended maximum; heart pickups restore
  missing hearts without increasing max health.
- Ammo is finite. Staff bolts consume ammo, ammo pickups replenish it, and
  projectile cleanup must not double-hit or leak sprites.
- Seeker, blast, quickshot, haste, and ward effects are progression-gated and
  time-limited where applicable. Flag changes that accidentally make them
  permanent, stack without bounds, or bypass rarity gates.
- Enemy pressure should ramp without spawning enemies on blocked tiles, props,
  chasms, walls, the player, or invalid map coordinates.
- Game-over, restart, start-screen, how-to-play, mute, and debug-overlay states
  should not continue gameplay timers or input handlers in the wrong state.

### UI overlays and input

- Start, how-to-play, game-over, restart, and mute controls are Phaser objects,
  not DOM controls. Review hit zones, keyboard handling, pointer events, and
  cleanup together.
- Muting should consistently apply to one-shot effects, ambience, and music,
  including sounds created before the toggle.
- Keyboard shortcuts should avoid browser/page side effects where practical and
  should not keep firing after scene shutdown.

### Audio

- Audio files are loaded from `assetManifest.audio`. Flag changes that create
  sounds before preload completes or leave looping ambience/music playing after
  restart, shutdown, or game destruction.
- Procedural audio assets are checked in. Changes to generators should either
  regenerate the matching assets or clearly avoid changing output expectations.

### Generated files and tooling

- Treat files under `public/assets` and JSON sprite metadata as source-of-truth
  checked-in assets, even when generated by scripts.
- Review changes to asset-generation tools with their output files. A script
  change without regenerated assets, or regenerated assets without matching
  manifest/metadata changes, is suspicious.
- `next-env.d.ts` can churn after builds because Next.js may switch generated
  route type paths between `.next/dev/types` and `.next/types`. Do not require
  committing that churn unless the project intentionally changes Next type
  generation.
- This repo has both `package-lock.json` and `pnpm-lock.yaml`. Flag dependency
  changes that update only one lockfile unless the change explicitly standardizes
  on a package manager.
- `npm run lint` maps to `next lint`, which is not supported by Next.js 16 in
  this project. Prefer `npm run build` for verification unless lint tooling is
  deliberately migrated.

## Review output priorities

1. Call out defects that can crash SSR/builds, break Phaser startup, leak game
   instances, or leave audio/input active after cleanup.
2. Call out asset path, frame, metadata, and lockfile drift because these often
   fail only at runtime.
3. Call out gameplay regressions that violate the invariants above.
4. Keep comments specific: name the file, the affected contract, and the likely
   player- or developer-visible failure.
