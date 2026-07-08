# Cursor Bugbot review guidance

Use this file as the repository-specific review brief for Cursor Bugbot. It does not enable or disable the hosted Bugbot service by itself; service enablement must be verified in Cursor or organization settings, GitHub App repository access, any Bugbot Admin API configuration in use, and a PR review smoke check when those controls are available.

## Repository context

- This repository is a first-playable Next.js app that hosts a Phaser 4 dungeon prototype.
- Front-end shell files live in `src/app/` and `src/game/GameCanvas.tsx`.
- The main runtime behavior lives in `src/game/scenes/DungeonScene.ts`.
- Map layout and spawn anchors live in `src/game/maps/startingDungeon.ts`.
- Runtime asset paths live in `src/game/assets/manifest.ts`; this file is the source of truth for what the scene loads.
- Public static assets live under `public/assets/`.
- Asset generation and processing scripts live under `tools/` and `scripts/`.

## Review priorities

1. Find correctness bugs that would break local play, production builds, Phaser scene startup, input handling, spawning, pickups, combat, audio, or metadata.
2. Flag regressions to the documented first-playable loop: start screen, movement, aiming, firing, finite ammo, enemy pressure, hearts, powerups, scoring, game over, audio mute, and debug overlay.
3. Check that docs, asset manifests, generated metadata, and runtime behavior stay consistent when a PR touches any of those areas.
4. Prefer small, actionable findings with file and line references. Avoid broad style feedback unless it identifies a user-visible or maintainability risk.

## Managed Bugbot deployment checks

When reviewing deployment or automation changes:

- Verify that repository files only provide review context. They cannot prove the hosted Bugbot service is enabled.
- If the change claims Bugbot is deployed, ask for or verify evidence from Cursor dashboard or organization settings, GitHub App repository access, Admin API credentials/configuration when applicable, and a PR review smoke check.
- Manual PR triggers may use a top-level PR comment with `cursor review` or `bugbot run`.
- For diagnostics, verbose triggers may use `cursor review verbose=true` or `bugbot run verbose=true`; expect request IDs or more detailed logs, not a deeper semantic review.
- New guidance in this file applies after it is merged to the default branch. PRs that add or update `BUGBOT.md` may not be reviewed with the new instructions yet.

## Build and verification expectations

- Prefer `npm run build` and `npx tsc --noEmit --incremental false` for source changes.
- Do not rely on `npm run lint` / `next lint`; newer Next versions may not support it reliably in this repo.
- If `npm run build` rewrites `next-env.d.ts`, treat that as generated metadata and avoid committing it unless the PR intentionally changes generated Next typings.
- If plain `npx tsc --noEmit` creates `tsconfig.tsbuildinfo`, remove it or prefer the non-incremental command above.
- For documentation-only or guidance-only PRs, a content check plus `git diff --check` may be enough, but build/typecheck evidence is still useful when dependencies are already installed.
- Existing npm audit output may report dependency issues unrelated to the scoped change. Do not block unrelated Bugbot guidance PRs solely on pre-existing audit findings.

## Gameplay and input review notes

- Runtime shooting currently uses `Space` and pointer/click firing. README mentions `Space` or `J`; flag that mismatch only for PRs that touch controls, docs, or input behavior.
- Movement should preserve both WASD and arrow-key support for isometric directions.
- Pointer movement updates aim, and pointer down queues a shot when the game is running.
- Initial goblins are seeded from `dungeon.enemyStarts`. Additional goblins ramp with target enemy count.
- Brutes unlock after `BRUTE_UNLOCK_KILLS` or `BRUTE_UNLOCK_MS` and should remain capped by `MAX_BRUTES`.
- Seeker ammo is code-defined behavior that unlocks after kill/time thresholds, uses seeker pickups/projectiles, and is not currently listed in README controls.
- Heart pickups restore missing hearts after progression gates; they should not increase max health unless a PR explicitly changes that design.
- Ward blocks damage while active, quickshot reduces projectile cooldown, haste increases movement speed, and blast charges a later shot that detonates nearby enemies.

## Powerups, pickups, and progression

- `POWERUP_CONFIG` controls unlock gates, spawn weights, sprite rows, labels, descriptions, and debug colors for quickshot, haste, ward, and blast.
- Effect durations and timing live in nearby constants such as `QUICKSHOT_DURATION_MS`, `HASTE_DURATION_MS`, and `WARD_DURATION_MS`.
- Blast state is managed by `blastShotReady`, not by a duration timer.
- Standard ammo and seeker ammo have separate caps and pickup selection rules. Check both counters when ammo behavior changes.
- Spawn changes should preserve safe placement: avoid blocked tiles, avoid placing pickups where the player cannot reach them, and respect existing pacing constants.

## Assets and audio

- `src/game/assets/manifest.ts` is the runtime source of truth for asset loading.
- `public/assets/audio/audio-manifest.json` is auxiliary and should stay consistent when audio assets change, but it is not the file `DungeonScene` loads from at runtime.
- Generated asset metadata JSON files must match their corresponding sprite sheets: frame dimensions, rows, names, and path references.
- Relevant tooling includes:
  - `tools/process_assets.py`
  - `tools/process_corporate_goblin_assets.py`
  - `tools/process_spreadsheet_brute_assets.py`
  - `tools/process_actor_death_assets.mjs`
  - `tools/process_combat_juice_assets.mjs`
  - `tools/process_pickup_intent_effect_assets.mjs`
  - `tools/process_gpt_tile_powerup_assets.mjs`
  - `tools/generate_powerup_sprites.mjs`
  - `tools/generate_polish_sprites.mjs`
  - `tools/generate_brute_ammo_sprites.mjs`
  - `tools/generate_audio_sfx.mjs`
  - `scripts/generate-retro-soundtrack.mjs`
- Phaser asset keys should remain stable unless all call sites and animation registrations are updated together.
- Audio changes should preserve scene-level mute behavior and avoid starting overlapping loops after scene restart.

## UI, metadata, and responsive behavior

- This repo does not configure Tailwind. For DOM-level UI changes, follow existing semantic markup and `src/app/globals.css` patterns.
- Phaser UI overlays are canvas-rendered; review pointer zones, keyboard and mouse affordances, text contrast, depth ordering, camera scroll factors, and compact viewport placement.
- The start screen and how-to-play modal include compact and tiny viewport layout branches. Flag changes that break readable layout, close behavior, or control-copy consistency.
- `src/app/layout.tsx` references `/opengraph-image.png` with dimensions 1360 x 752 and descriptive alt text. Metadata/share-image changes should keep the file, dimensions, and alt text in sync.

## Documentation review notes

- README should match shipped player controls and first-playable behavior when a PR touches either docs or related code.
- README currently documents regular ammo, heart pickups, quickshot, haste, ward, and blast, but not seeker ammo.
- Known limitations are intentionally modest. Avoid asking PR authors to solve unrelated roadmap items such as level transitions or full collision physics.
- Asset prompt or generated-asset changes should explain which source images, processing scripts, and public outputs changed.

## Common high-signal findings

- Runtime manifest path changed without updating the corresponding public asset or metadata.
- Sprite sheet dimensions changed without updating Phaser `frameWidth`, `frameHeight`, animation frame ranges, or metadata.
- Input handler added without cleanup on scene shutdown, causing duplicate events after restart.
- Scene restart leaves stale audio, timers, pointer zones, tweens, or HUD objects alive.
- Spawn logic can place enemies, pickups, or the player on blocked or unreachable tiles.
- Powerup text, README copy, and actual effect behavior diverge.
- Build or typecheck artifacts are committed accidentally.
- Metadata references an asset missing from `public/`, or image dimensions/alt text no longer match the asset.
