# Cursor Bugbot Review Guide

These instructions give Cursor Bugbot repository-specific context for reviewing
`fjg-thr/hobgoblin-dungeon`. Keep this file focused on review guidance: it does
not install the Cursor GitHub integration, enable automatic Bugbot reviews, or
change organization settings.

## Deployment boundary

- Root `.cursor/BUGBOT.md` is the repository-level rules file Bugbot includes
  when reviewing pull requests after this file exists on the default branch.
- Nested `.cursor/BUGBOT.md` files may be added later for path-specific rules,
  but this repository currently uses a single root guide.
- Hosted Bugbot enablement is external to this commit. Confirm the Cursor
  dashboard or organization settings, GitHub App repository access for
  `fjg-thr/hobgoblin-dungeon`, any Bugbot Admin API credentials/configuration,
  and a live PR review smoke check when those systems are available.
- A PR adding or editing this file may not itself be reviewed with the updated
  rules until the change is merged into the branch Bugbot reads.

## Manual review triggers and diagnostics

- To request an on-demand review, add a top-level PR comment with `cursor review`
  or `bugbot run`.
- For troubleshooting, use `cursor review verbose=true` or
  `bugbot run verbose=true` to request additional diagnostic detail such as
  request identifiers and logs.
- Do not treat repository files as proof that the managed Bugbot service is
  enabled. If a review does not run, check integration access, dashboard
  settings, API configuration, and PR eligibility before changing app code.

## Project shape

- Next.js App Router entry points live in `src/app/page.tsx`,
  `src/app/layout.tsx`, and `src/app/globals.css`.
- The Phaser game is mounted client-side by `src/game/GameCanvas.tsx`, which
  dynamically imports Phaser and destroys the game during React cleanup.
- The main runtime is `src/game/scenes/DungeonScene.ts`; it owns asset loading,
  animations, input, HUD/start/game-over UI, enemy AI, pickups, projectiles,
  audio, debug rendering, and reset behavior.
- Procedural dungeon generation and tile constants live in
  `src/game/maps/startingDungeon.ts`.
- `src/game/assets/manifest.ts` is the runtime source of truth for loaded image,
  sprite sheet, and audio paths. `public/assets/audio/audio-manifest.json` is
  auxiliary and should stay consistent when touched.
- This project uses plain CSS in `src/app/globals.css`; it does not currently
  configure Tailwind or shadcn/ui. Review DOM changes against existing CSS
  patterns, and review Phaser UI changes in canvas-specific terms.

## High-priority review checks

### Phaser lifecycle and React mounting

- Flag changes that create multiple Phaser games for one React mount or fail to
  destroy a game on unmount.
- Check event cleanup for `this.input.on(...)`, keyboard handlers, tweens,
  timers, animation callbacks, and scene shutdown paths. Pointer handlers are
  currently removed in the scene `SHUTDOWN` callback.
- Watch for assets, containers, graphics, text, sprites, and zones that are
  recreated during reset without being destroyed or removed from local arrays.

### Controls, aiming, and UI flow

- Runtime shooting is currently bound to `Space` and pointer/click firing in
  `DungeonScene.ts`; the README also mentions `J`. Only block unrelated PRs for
  that mismatch when they modify controls, help text, or input docs.
- Check start screen, how-to-play modal, game-over, mute, HUD, and debug overlay
  changes across compact and tiny viewports. Phaser hit zones should still align
  with visible buttons and text after resize.
- Preserve keyboard and pointer affordances for starting, closing the help modal
  with Escape, aiming, shooting, toggling mute, and debug `F3`.

### Gameplay state and progression

- New runs should reset health, regular ammo, seeker ammo, score, kill counts,
  power-up timers, blast charge, enemies, pickups, projectiles, HUD text, camera,
  audio state that belongs to a run, and transient visual effects.
- Initial goblins come from `dungeon.enemyStarts`; additional goblins ramp with
  target enemy count. Brutes are gated by `BRUTE_UNLOCK_KILLS` or
  `BRUTE_UNLOCK_MS` and capped by `MAX_BRUTES`.
- Seeker ammo is code-defined behavior even though the README does not document
  it yet. Check unlock gates, pickup/drop chances, target acquisition, projectile
  turn rate, damage, ammo counts, and HUD presentation when seeker logic changes.
- `POWERUP_CONFIG` controls unlock gates, spawn weights, sprite rows, and
  presentation metadata. Effect durations and collection behavior live nearby in
  constants such as `QUICKSHOT_DURATION_MS`, `HASTE_DURATION_MS`,
  `WARD_DURATION_MS`, and `blastShotReady`.
- Review collision and damage changes for tile/world coordinate conversions,
  player/enemy radii, projectile hitboxes, knockback, ward blocking,
  invulnerability windows, blast radius, heart drops, and cleanup of defeated
  enemies.

### Assets, audio, and metadata

- Asset additions should update the runtime manifest, committed files under
  `public/assets/**`, and any matching JSON metadata together. Avoid references
  to generated binary assets that are not committed.
- Relevant asset tooling includes `tools/process_assets.py`,
  `tools/process_actor_death_assets.mjs`,
  `tools/process_combat_juice_assets.mjs`,
  `tools/process_pickup_intent_effect_assets.mjs`,
  `tools/process_corporate_goblin_assets.py`,
  `tools/process_spreadsheet_brute_assets.py`,
  `tools/generate_powerup_sprites.mjs`,
  `tools/generate_brute_ammo_sprites.mjs`,
  `tools/generate_audio_sfx.mjs`, and
  `scripts/generate-retro-soundtrack.mjs`.
- Audio changes should verify mute behavior, looping ambience/theme handling,
  volume/rate choices, and consistency between `assetManifest.audio` and
  committed files in `public/assets/audio`.
- Metadata/share-image changes should keep `src/app/layout.tsx`,
  `public/opengraph-image.png`, dimensions, and alt text in sync.

## Verification expectations

- Prefer `npm run build` and `npx tsc --noEmit --incremental false` for source
  changes. `next lint` is not reliable with the current Next.js version.
- `npm run build` may rewrite `next-env.d.ts`; restore that generated churn
  unless the PR intentionally changes Next type generation behavior.
- Plain `npx tsc --noEmit` can emit `tsconfig.tsbuildinfo` because incremental
  compilation is enabled; use `--incremental false` or remove the artifact.
- For asset or audio PRs, verify the relevant generation/processing command when
  practical and inspect the committed manifest/metadata diff.
- For gameplay PRs, include a manual smoke path in the review when possible:
  start a run, move with WASD or arrows, aim with pointer movement, fire with
  `Space` and click, collect ammo/power-ups/hearts, toggle mute, trigger game
  over, restart, and confirm no duplicate input/audio/visual state leaks.
