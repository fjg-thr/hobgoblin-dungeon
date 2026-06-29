# Cursor Bugbot review guide

Use this guide when reviewing this repository with Cursor Bugbot. The app is a
Next.js/React shell around a browser-only Phaser dungeon prototype, so the most
important review questions are about gameplay state, generated assets, and
client/runtime boundaries.

## High-risk areas

- `src/game/scenes/DungeonScene.ts` owns most gameplay state, input, enemy AI,
  pickups, power-ups, projectiles, audio, UI overlays, and restart flow. Review
  changes here for ordering bugs in `update`, object cleanup on restart/game
  over, stale timers/tweens, depth sorting, and Phaser objects that can outlive
  their scene.
- `src/game/maps/startingDungeon.ts` defines generated dungeon layout and
  collision assumptions. Check that new tile, prop, bridge, wall, and stair
  rules keep spawn areas reachable and do not create invisible blockers.
- `src/game/assets/manifest.ts` is the runtime asset source of truth. Any new
  asset loaded by Phaser should be represented here with matching file names,
  dimensions, frame counts, and metadata paths. The audio manifest JSON in
  `public/assets/audio` is auxiliary only.
- `src/game/GameCanvas.tsx` isolates Phaser from server rendering. Keep Phaser
  imports and `window`/DOM access client-side.
- `src/app/layout.tsx` metadata references `/opengraph-image.png`; verify that
  public image exists when metadata or sharing behavior is touched.

## Known baseline context

- Runtime firing currently uses `SPACE` plus pointer/click. README still says
  `Space` or `J`. Flag this only for PRs that modify controls, docs, or input
  hints; do not block unrelated changes solely on the existing mismatch.
- Seeker ammo exists in code after progression thresholds, but README does not
  fully document it. Treat `DungeonScene.ts` as the behavior source until docs
  are intentionally updated.
- README describes blast as a late rare power-up, while `POWERUP_CONFIG`
  currently unlocks it after early kills/time. Mention this only when a PR
  changes power-up progression, docs, or balancing.
- This repo does not use Tailwind or shadcn/ui today. For DOM-facing changes,
  follow existing semantic markup and `src/app/globals.css`; for Phaser UI,
  review pointer zones, keyboard affordances, responsive placement, and readable
  canvas overlays.

## Asset and audio generation

Generated and processed assets are committed under `public/assets`. When a PR
changes sources or generation scripts, confirm that the corresponding generated
PNG/JSON/WAV outputs are updated and consistent.

Common generators/processors:

- `npm run process:assets`
- `npm run process:death-assets`
- `npm run process:combat-juice`
- `npm run generate:powerups`
- `npm run generate:combat-assets`
- `node tools/process_gpt_tile_powerup_assets.mjs`
- `node tools/process_pickup_intent_effect_assets.mjs`
- `node tools/generate_polish_sprites.mjs`
- `node tools/generate_audio_sfx.mjs`
- `node scripts/generate-retro-soundtrack.mjs`
- `python3 tools/process_corporate_goblin_assets.py`
- `python3 tools/process_spreadsheet_brute_assets.py`

## Verification expectations

- Prefer `npm run build` and `npx tsc --noEmit --incremental false` for code
  changes. `next lint` is not a reliable gate for the current Next version.
- For Markdown-only Bugbot guidance changes, whitespace checks and diff review
  are sufficient; do not require full builds when runtime code is untouched.
- Next may rewrite `next-env.d.ts` between dev and production route type paths.
  Treat unexpected generated typing diffs as noise unless the PR intentionally
  changes Next type generation.
- For dependency or lockfile changes, verify both tracked package-manager paths
  when practical (`npm audit --omit=dev` and `pnpm audit --prod`) because this
  repo tracks both `package-lock.json` and `pnpm-lock.yaml`.

## Managed Bugbot deployment boundary

This file gives hosted Cursor Bugbot repository-specific review context; it does
not prove that the managed Bugbot service is enabled. Confirm real deployment
outside Git through Cursor dashboard/org settings, GitHub App repository access,
Admin API credentials when used, and a pull-request smoke review when available.
Hosted Bugbot may only consume this guidance after it is merged or otherwise
available on the branch Bugbot reads. Top-level PR comments `cursor review` or
`bugbot run` can request a manual review; add `verbose=true` for diagnostics,
request IDs, and log detail.
