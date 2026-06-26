# Cursor Bugbot review guide

Use this file as repository-specific context when reviewing pull requests for
`fjg-thr/hobgoblin-dungeon`.

## Deployment and triggers

- This file gives Bugbot review instructions. It does not, by itself, enable the
  managed Bugbot service.
- Confirm managed enablement outside the repo: Cursor dashboard/org settings,
  Cursor GitHub App repo access, optional Admin API/team configuration, and a
  live PR review smoke check when available.
- These rules apply after merge to the default branch. PRs adding/changing
  `BUGBOT.md` may not be reviewed with the new rules yet.
- Manual top-level PR comments that should request a review include
  `cursor review` and `bugbot run`. For diagnostics/request IDs/log detail, use
  `cursor review verbose=true` or `bugbot run verbose=true`.

## Project shape

- Next.js App Router hosts a client-only Phaser game.
- `src/game/GameCanvas.tsx` dynamically imports Phaser and owns boot/teardown.
  Watch browser-only APIs, duplicate game instances, and remount cleanup leaks.
- `src/game/scenes/DungeonScene.ts` is the main gameplay surface: map rendering,
  collision, input, enemies, projectiles, power-ups, pickups, HUD, audio, and
  Phaser lifecycle. Small changes there can have broad runtime effects.
- `src/game/maps/startingDungeon.ts` defines generated dungeon layout inputs.
- `src/game/assets/manifest.ts` is the runtime source of truth for assets that
  Phaser loads. `public/assets/audio/audio-manifest.json` is auxiliary only.

## Review priorities

1. Build/runtime correctness: keep `"use client"` boundaries intact, avoid
   server-side access to `window`/Phaser, and make sure dynamic imports and
   cleanup remain safe.
2. Gameplay regressions: check touched input, ammo/seeker ammo, power-up timing,
   damage, hit stop, spawn pressure, score, game-over/restart, mute, and debug
   overlay behavior.
3. Phaser lifecycle and canvas UX: verify tweens, timers, events, sprites,
   audio, pointer zones, keyboard handlers, and scene shutdown paths are
   cleaned up or naturally owned by the scene.
4. Map/collision behavior: tile coordinates, depths, wall variants, bridges,
   chasms, room/corridor generation, or actor radii need gameplay smoke checks,
   not just type checks.
5. Asset consistency: when sprite/audio files, generated JSON, or manifest paths
   change, verify matching dimensions, frame counts, keys, and loader usage.
   Avoid unnecessary binary churn.
6. DOM/metadata/UI: Tailwind is not configured. Prefer semantic React/Next
   markup and existing `src/app/globals.css`; review Phaser overlays as canvas
   UI with responsive placement and keyboard/mouse affordances.

## Known baseline context

- README says `Space` or `J` fires, but runtime binds `Space` plus pointer/click.
  Do not block unrelated PRs for this existing mismatch; do flag control/docs
  PRs that leave it worse.
- README documents regular ammo, hearts, quickshot, haste, ward, and blast, but
  seeker ammo/projectiles are currently code-defined behavior. Treat seeker
  changes as gameplay-sensitive even if docs are incomplete.
- README describes blast as rare late-game, while current `POWERUP_CONFIG`
  unlocks/weights may make it available earlier. Scope this as an existing
  documentation drift unless the PR changes blast timing or docs.
- `src/app/layout.tsx` references `/opengraph-image.png`; this baseline may not
  include a matching image. Only block metadata/share-asset PRs that preserve or
  worsen that issue.
- `next lint` is not reliable here; prefer build plus TypeScript verification.
- Next can rewrite `next-env.d.ts` between dev and production route type paths.
  Restore generated churn unless the PR intentionally changes Next typing.
- `npm ci` currently reports baseline audit advisories for framework/tooling
  packages. Do not block unrelated PRs solely on unchanged audit output, but do
  flag dependency PRs that fail to improve or that worsen vulnerability posture.

## Asset and generator notes

- Generated asset/audio tooling lives under `tools/` and `scripts/`:
  `tools/process_assets.py`, `tools/process_actor_death_assets.mjs`,
  `tools/process_combat_juice_assets.mjs`,
  `tools/process_corporate_goblin_assets.py`,
  `tools/process_gpt_tile_powerup_assets.mjs`,
  `tools/process_pickup_intent_effect_assets.mjs`,
  `tools/process_spreadsheet_brute_assets.py`,
  `tools/generate_polish_sprites.mjs`,
  `tools/generate_powerup_sprites.mjs`,
  `tools/generate_brute_ammo_sprites.mjs`,
  `tools/generate_audio_sfx.mjs`,
  `scripts/generate-retro-soundtrack.mjs`.
- If a PR changes generated artifacts, look for the corresponding source image,
  processor, manifest, and README/asset-list updates as appropriate.

## Suggested verification

- Docs/config only: `git diff --check`.
- Normal code/assets: `npm ci`, `npm run build`,
  `npx tsc --noEmit --incremental false`.
- Gameplay-sensitive changes: include a manual browser smoke run of movement,
  aim/click/Space firing, ammo pickup, power-up collection, enemy damage,
  mute/unmute, game-over/restart, and responsive canvas sizing.
