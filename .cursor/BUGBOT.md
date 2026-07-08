# Cursor Bugbot review guidance

## Deployment boundary

This file provides repository-specific guidance for Cursor Bugbot reviews on
`fjg-thr/hobgoblin-dungeon`. It does not, by itself, enable the hosted Bugbot
service. Confirm managed deployment through the Cursor dashboard or org
settings, GitHub App repository access, Admin API credentials and configuration
when those are used, and a live pull request smoke check when available.

After this file is merged to the default branch, hosted Bugbot reviews can use
it as review context. Pull requests that add or change this file may not be
reviewed with the new instructions until the guidance exists on the default
branch.

Manual review triggers can be posted as a top-level pull request comment:

- `cursor review`
- `bugbot run`

For troubleshooting or support diagnostics, use `cursor review verbose=true` or
`bugbot run verbose=true` to request more detailed logs and request IDs.

## Project shape

- Next.js app router entry points live in `src/app`, with metadata in
  `src/app/layout.tsx` and global DOM styling in `src/app/globals.css`.
- `src/game/GameCanvas.tsx` dynamically imports Phaser on the client and owns
  the `Phaser.Game` lifecycle. Preserve the cleanup path that destroys the game
  instance during React unmounts.
- `src/game/scenes/DungeonScene.ts` owns runtime gameplay: player movement,
  enemy spawning, shooting, pickups, Phaser UI, audio, debug overlays, and
  responsive title/how-to-play/game-over screens.
- `src/game/assets/manifest.ts` is the runtime source of truth for loaded
  sprites, effects, UI images, and audio. Keep any auxiliary asset manifests or
  README lists in sync when asset paths change.
- `src/game/maps/startingDungeon.ts` creates the generated dungeon layout,
  collision, props, staircase, and seeded enemy starts.
- This repository does not configure Tailwind or shadcn/ui. Review DOM UI
  changes against the existing plain CSS patterns and review Phaser UI changes
  against canvas-specific input, scaling, and readability constraints.

## High-priority review checks

- Phaser lifecycle: reject changes that leak scenes, timers, tweens, input
  handlers, audio instances, or `Phaser.Game` instances across React remounts,
  route changes, restarts, or game-over/start-over loops.
- Controls: runtime shooting currently uses `Space` and pointer/click firing;
  README copy also mentions `J`. Treat that mismatch as relevant for input or
  documentation PRs, but do not block unrelated changes solely for the existing
  mismatch.
- Gameplay resets: ensure run restarts reset ammo, seeker ammo, score, hearts,
  enemies, pickups, projectiles, cooldowns, active power-up timers, blast charge,
  mute/UI state expectations, hit stop, debug state, and camera/player state.
- Enemy spawning: initial goblins come from `dungeon.enemyStarts`; additional
  goblins ramp during the run. Brutes are gated by `BRUTE_UNLOCK_KILLS` and
  `BRUTE_UNLOCK_MS`. Avoid review comments that imply every goblin is
  progression-gated.
- Ammo and projectiles: standard ammo is documented in the README. Seeker ammo
  is code-defined and unlocks after kill or time thresholds; review seeker
  pickups, orbit indicators, target acquisition, projectile damage, and HUD copy
  together when touched.
- Power-ups: `POWERUP_CONFIG` controls unlock gates, spawn weights, labels, and
  presentation metadata. Effect timing lives in nearby constants and collection
  logic, and blast uses `blastShotReady`; review both config and behavior for
  consistency.
- Collision and combat: check tile/proximity collision, projectile wall impact,
  enemy knockback, damage invulnerability, ward blocks, blast radius, death
  effects, scoring, and pickup overlap at camera edges and generated-map
  boundaries.
- Responsive Phaser UI: title screen, how-to-play modal, HUD panels, mute
  button, debug overlay, and game-over UI have compact viewport branches and
  pointer hit zones. Flag regressions in close behavior, tap targets, depth
  ordering, text clipping, and runtime control copy.
- Audio: `assetManifest.audio` is what `DungeonScene` loads at runtime. Keep
  mute behavior, one-shot SFX, ambience/theme loops, and generated audio files in
  sync. `tools/generate_audio_sfx.mjs` creates procedural SFX, while
  `scripts/generate-retro-soundtrack.mjs` creates
  `public/assets/audio/retro_dungeon_theme.wav`.
- Metadata and share images: if `src/app/layout.tsx` metadata changes, keep
  `/opengraph-image.png`, its 1360 x 752 dimensions, and alt text aligned with
  the committed asset.
- Asset pipelines: generated image tooling lives under `tools/`. Use the
  existing scripts when refreshing sprites, including the direct Python commands
  for corporate goblin and spreadsheet brute processing when those assets are
  involved. Do not hand-edit generated sprite metadata unless the source asset
  contract is intentionally changing.

## Verification expectations

- Prefer `npm run build` plus `npx tsc --noEmit --incremental false` for source
  changes. `next lint` is not reliable for this Next.js version.
- `npm run build` may rewrite `next-env.d.ts`; restore generated churn unless
  the task intentionally changes Next type generation.
- Plain `npx tsc --noEmit` can create `tsconfig.tsbuildinfo` because
  incremental compilation is enabled. Use `--incremental false` and remove any
  accidental build artifacts before committing.
- For scoped Bugbot guidance deployments, the expected repository diff is this
  file only. Managed-service enablement still needs external Cursor/GitHub/API
  verification outside this repository.

## Review style

Prioritize concrete bugs, regressions, missing verification, and user-visible
behavior changes. Cite affected files and runtime paths. Avoid broad style
comments unless they connect to a real maintainability or product risk in this
small prototype.
