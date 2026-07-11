# Cursor Bugbot review guide for Hobgoblin Ruin

Use these rules when reviewing pull requests for this repository. The app is a
Next.js/React shell that boots a Phaser 4 dungeon scene. Most gameplay,
rendering, input, audio, and asset lifecycle logic lives in
`src/game/scenes/DungeonScene.ts`.

## Deployment boundary

- This file customizes Cursor Bugbot's repository-specific review behavior. It
  does not, by itself, enable the hosted Bugbot service for the repository.
- To confirm Bugbot is deployed, verify the Cursor dashboard or Admin API has
  Bugbot enabled for `https://github.com/fjg-thr/hobgoblin-dungeon`, the Cursor
  GitHub App has access to the repository, and new PRs receive a Bugbot review.
- Manual smoke triggers should be top-level PR comments containing
  `cursor review` or `bugbot run`. Use `cursor review verbose=true` or
  `bugbot run verbose=true` when diagnosing missing reviews so the request ID
  and detailed logs are available.
- These rules take effect for hosted reviews after this file is merged to the
  default branch. Do not assume a PR that adds or changes this file was reviewed
  with the new rules.

## Review priorities

1. Flag changes that can break build-time or runtime loading: invalid asset
   paths, missing sprite metadata, Phaser code imported into server components,
   or browser-only APIs used outside client-only code.
2. Flag gameplay regressions that make the prototype unplayable: broken start
   flow, input, collision, enemy spawning, projectile hits, health, ammo, power
   ups, game-over, restart, or scene cleanup.
3. Flag state lifecycle bugs: stale Phaser event listeners, timers, tweens,
   pooled objects, unbounded arrays, duplicated game instances, and reset paths
   that leave old state visible after a new run.
4. Flag user-facing regressions in responsive canvas layout, start/how-to-play
   screens, HUD readability, audio mute behavior, and metadata/share images.
5. Prefer focused fixes that match existing patterns over broad rewrites of the
   large `DungeonScene.ts` file.

## Architecture context

- `src/app/layout.tsx` owns site metadata and OpenGraph/Twitter share data.
- `src/app/page.tsx` renders the game page and `GameCanvas`.
- `src/game/GameCanvas.tsx` is a client component. It dynamically imports
  Phaser and `DungeonScene`, creates one `Phaser.Game`, uses resize scaling,
  enables pixel-art rendering, and destroys the game on unmount.
- `src/game/scenes/DungeonScene.ts` owns the runtime game scene: asset loading,
  animation setup, input, player state, combat, enemies, pickups, power ups,
  HUD, audio, start screen, how-to-play modal, game-over, restart, and cleanup.
- `src/game/maps/startingDungeon.ts` generates the room-and-corridor map,
  props, player start, and initial enemy starts.
- `src/game/assets/manifest.ts` is the runtime source of truth for loaded image,
  sprite-sheet, UI, effect, and audio paths.

## Next.js and React rules

- Keep Phaser and `window`/DOM usage behind client-only boundaries. Server
  components and metadata files must not import Phaser or access browser APIs.
- Preserve `GameCanvas`'s single-instance guard and cleanup. A PR that can
  create duplicate `Phaser.Game` instances or skip `destroy(true)` should be
  treated as a bug.
- Metadata changes must keep `metadataBase`, OpenGraph, Twitter card data, and
  `public/opengraph-image.png` consistent. The current share image metadata is
  1360 x 752 with alt text describing the hobgoblin key art.
- This repo does not configure Tailwind. For DOM styling, follow the existing
  `src/app/globals.css` patterns unless a PR explicitly adds a styling system.

## Phaser gameplay rules

- Movement is isometric with WASD or arrow keys. Aiming follows the pointer and
  shots snap to 15-degree angles.
- Runtime firing is currently `SPACE` and pointer/click. The README also
  mentions `J`; only block on that mismatch when the PR changes input handling,
  controls documentation, or tutorial copy.
- Start screen and how-to-play modal are Phaser-rendered. Preserve compact and
  tiny viewport layout branches, pointer hit zones, close behavior, and control
  copy consistency with runtime input.
- The game must still boot, start, play, show game over, restart, and clean up
  event handlers after scene shutdown or restart.
- Keep camera, scaling, `roundPixels`, and depth ordering compatible with the
  pixel-art isometric presentation.

## Combat and progression rules

- Initial goblins are seeded from `dungeon.enemyStarts`; additional enemies ramp
  with target enemy count. Do not describe all goblin spawns as progression
  gated.
- Brutes are gated by `BRUTE_UNLOCK_KILLS` or `BRUTE_UNLOCK_MS` and capped by
  `MAX_BRUTES`.
- Standard ammo is finite and refilled by staff-shard pickups. Seeker ammo is
  code-defined, unlocks after kill/time thresholds, and uses seeker pickups and
  homing projectiles; it is not fully documented in the README.
- `POWERUP_CONFIG` controls power-up rows, spawn weights, unlock gates, visuals,
  and popup metadata. Timing/effects live in nearby constants and collection
  logic: quickshot cooldown/duration, haste duration/speed, ward duration/block,
  and blast's `blastShotReady` charged shot.
- Review projectile, enemy, and pickup changes for safe spawn distances,
  collision checks, hitbox math, object destruction, and array cleanup.

## Asset and audio rules

- `assetManifest` paths must match files in `public/assets/**`. Sprite sheets
  and their JSON metadata must agree on frame sizes, rows, and animation usage.
- `public/assets/audio/audio-manifest.json` is auxiliary. Runtime audio loading
  comes from `assetManifest.audio`; do not treat the JSON audio manifest as the
  runtime source of truth.
- Generated asset tooling exists in `tools/` and `scripts/`. Relevant commands
  include `python3 tools/process_assets.py`, `python3 tools/process_corporate_goblin_assets.py`,
  `python3 tools/process_spreadsheet_brute_assets.py`,
  `node tools/process_actor_death_assets.mjs`,
  `node tools/process_combat_juice_assets.mjs`,
  `node tools/process_pickup_intent_effect_assets.mjs`,
  `node tools/generate_powerup_sprites.mjs`,
  `node tools/generate_brute_ammo_sprites.mjs`,
  `node tools/generate_audio_sfx.mjs`, and
  `node scripts/generate-retro-soundtrack.mjs`.
- Asset PRs should include both source/generated files needed by the existing
  pipeline and should not leave stale manifest entries or unreferenced runtime
  assets unless the PR explains why.

## Verification guidance

- For source changes, prefer `npm run build` and
  `npx tsc --noEmit --incremental false`. `next lint` is not reliable here with
  the current Next version.
- `npm run build` can rewrite `next-env.d.ts`; generated churn should be
  restored unless the PR intentionally changes Next typing behavior.
- Plain `npx tsc --noEmit` can create `tsconfig.tsbuildinfo` because
  incremental compilation is enabled. Prefer `--incremental false` and flag
  accidental build artifacts.
- For dependency changes, check both `package-lock.json` and `pnpm-lock.yaml`
  when both are tracked. Keep dependency/tooling hardening separate from scoped
  gameplay or Bugbot-rule changes unless the PR explicitly requests both.
- For gameplay changes, ask for or verify a browser smoke check covering boot,
  start, movement, pointer aim, Space/click firing, pickups, enemy contact,
  mute toggle, game-over, restart, and responsive sizing.

## Known existing context

- The README documents quickshot, haste, ward, blast, ammo, and hearts, but it
  does not fully document seeker ammo. Do not block unrelated PRs solely because
  seeker ammo documentation is incomplete.
- The staircase is visible but not yet a level transition. Treat level-exit
  behavior as future scope unless a PR explicitly implements it.
- Collision is intentionally simple tile/proximity logic rather than a full
  physics system. Flag regressions, not the existence of the simple system.
- Sound is first-pass procedural WAV audio with a scene-level mute toggle.
