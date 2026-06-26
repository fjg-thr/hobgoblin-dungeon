# Cursor Bugbot review guide

Use this file as repository-specific context for Cursor Bugbot reviews after it is
merged to the default branch. It does not enable the managed Bugbot service by
itself; confirm service deployment through Cursor dashboard or organization
settings, GitHub App repository access, any Bugbot Admin API/team configuration,
and a live pull request smoke review when those controls are available.

## Triggers and diagnostics

- For an on-demand PR review, add a top-level PR comment: `cursor review` or
  `bugbot run`.
- For troubleshooting, use `cursor review verbose=true` or
  `bugbot run verbose=true` to request diagnostics such as request IDs or
  service log detail.
- These instructions apply once this file exists on the default branch. A PR
  that adds or edits this file may be reviewed with the previous default-branch
  guidance.

## Project shape

- Next.js App Router hosts a client-only Phaser game through
  `src/game/GameCanvas.tsx` and `src/app/page.tsx`.
- Most gameplay behavior lives in `src/game/scenes/DungeonScene.ts`; review
  scene lifecycle, input registration, timers, tweens, audio cleanup, and Phaser
  object destruction carefully.
- Dungeon layout and collision inputs live in `src/game/maps/startingDungeon.ts`.
- Runtime asset loading should use `src/game/assets/manifest.ts` as the source
  of truth. `public/assets/audio/audio-manifest.json` is auxiliary and should
  stay consistent only when audio assets are touched.

## Review priorities

1. Build/runtime correctness: block changes that break `npm run build`,
   TypeScript checks, Next client/server boundaries, Phaser imports, or asset
   paths used at runtime.
2. Gameplay regressions: verify movement, camera follow, finite ammo, enemy
   spawn pressure, damage/death flow, score/life HUD updates, power-up
   collection, seeker ammo, blast shots, heart pickups, and game restart.
3. Phaser lifecycle: watch for leaked keyboard/pointer listeners, duplicate
   scenes, unbounded timers/tweens, stale destroyed objects, and canvas sizing
   regressions.
4. Map and collision behavior: check tile-to-world math, blocker rectangles,
   prop blockers, bridge/chasm handling, staircase placement, and debug overlay
   accuracy.
5. Asset consistency: if a PR changes generated assets or manifests, verify
   matching PNG/JSON/audio files and the relevant generator or processor
   script. Do not require regenerating unrelated assets.
6. DOM metadata/UI: for Next layout or future DOM UI, follow existing semantic
   markup and `src/app/globals.css` patterns. This repo does not currently use
   Tailwind or shadcn/ui.

## Known baseline caveats

- README says `Space` or `J` fires, but current runtime binding uses `Space`
  plus pointer/click firing. Flag PRs that touch controls or docs and worsen or
  rely on this mismatch; do not block unrelated PRs only for the baseline drift.
- README documents regular ammo and common power-ups but omits seeker ammo.
  Treat seeker behavior as code-defined unless a PR intentionally updates docs.
- README calls blast a rare late-game power-up, while current unlock/weight
  behavior is defined by `POWERUP_CONFIG` in `DungeonScene.ts`. Scope findings
  to PRs that touch power-up balance or docs.
- `src/app/layout.tsx` references `/opengraph-image.png`; no matching
  `public/opengraph-image.png` or app `opengraph-image.*` file is present on
  this baseline. Flag metadata/share-image PRs that do not address or that
  worsen this state.
- `next lint` is unreliable with the current Next version. Prefer build and
  TypeScript verification for this project.
- `next-env.d.ts` may be rewritten by Next generated route types during build
  or dev commands. Restore it unless the PR intentionally changes generated
  typing behavior.
- `npm ci` currently reports baseline audit advisories from framework tooling.
  Do not block unrelated PRs solely for unchanged existing advisories, but do
  flag new or worsened dependency risk.

## Asset and generator notes

Generated and processed assets are maintained by scripts such as:

- `tools/process_assets.py`
- `tools/process_actor_death_assets.mjs`
- `tools/process_combat_juice_assets.mjs`
- `tools/process_corporate_goblin_assets.py`
- `tools/process_gpt_tile_powerup_assets.mjs`
- `tools/process_pickup_intent_effect_assets.mjs`
- `tools/process_spreadsheet_brute_assets.py`
- `tools/generate_audio_sfx.mjs`
- `tools/generate_brute_ammo_sprites.mjs`
- `tools/generate_polish_sprites.mjs`
- `tools/generate_powerup_sprites.mjs`
- `scripts/generate-retro-soundtrack.mjs`

When a PR changes a generated output, check that the corresponding source,
processor, manifest entry, and README/asset prompt notes remain coherent.

## Suggested verification

- `npm ci`
- `npm run build`
- `npx tsc --noEmit --incremental false`
- For gameplay-sensitive PRs, manually smoke test start screen, movement,
  aiming/firing with `Space` and click, pickup collection, damage/death,
  restart, mute toggle, and the `F3` debug overlay.
