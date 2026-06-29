# Cursor Bugbot review guide

Use this guide when reviewing changes in this repository. The project is a
Next.js/React/TypeScript app that embeds a Phaser 4 dungeon prototype. Most game
logic lives in `src/game/scenes/DungeonScene.ts`; map generation is in
`src/game/maps/startingDungeon.ts`; runtime asset paths are centralized in
`src/game/assets/manifest.ts`.

## Review priorities

- Treat `assetManifest` as the runtime source of truth for images, sprite sheets,
  and audio. If a PR changes files under `public/assets`, verify matching manifest
  entries, frame sizes, metadata paths, preload calls, and animation frame ranges.
- For `DungeonScene.ts`, pay close attention to lifecycle cleanup, pointer and
  keyboard event registration, hit-stop/tween/camera effects, projectile cleanup,
  audio mute state, and depth ordering for isometric sprites and overlays.
- For map-generation changes, check collision consistency between floor, wall,
  bridge, chasm, stairs, prop placement, enemy spawning, and pickup spawning.
- For app-shell changes under `src/app`, preserve the full-screen canvas layout,
  metadata behavior, semantic HTML, and existing `src/app/globals.css` patterns.
  This repo does not currently use Tailwind or shadcn/ui.
- For Phaser canvas UI changes, review pointer zones, keyboard affordances,
  responsive placement, text contrast, and whether DOM-level accessibility is
  realistically available or needs a parallel HTML control.

## Known baseline context

- README says `Space` or `J` fires, while the current runtime binds firing to
  `SPACE` and pointer/click. Flag this only when a PR changes controls or docs.
- Seeker ammo exists in code after progression thresholds, but it is not fully
  documented in README. Do not block unrelated PRs solely for that mismatch.
- README describes blast as a rare late-game power-up; current `POWERUP_CONFIG`
  controls the actual unlock and weighting. Scope findings to PRs that touch that
  behavior or documentation.
- `src/app/layout.tsx` references `/opengraph-image.png`; if metadata or public
  image assets change, verify the referenced file is present and correctly sized.

## Asset and audio tooling

When PRs touch generated assets, confirm the relevant generator or processor was
used and that generated outputs are committed:

- `python3 tools/process_assets.py`
- `node tools/process_actor_death_assets.mjs`
- `node tools/process_combat_juice_assets.mjs`
- `python3 tools/process_corporate_goblin_assets.py`
- `node tools/process_gpt_tile_powerup_assets.mjs`
- `node tools/process_pickup_intent_effect_assets.mjs`
- `python3 tools/process_spreadsheet_brute_assets.py`
- `node tools/generate_polish_sprites.mjs`
- `node tools/generate_powerup_sprites.mjs`
- `node tools/generate_brute_ammo_sprites.mjs`
- `node tools/generate_audio_sfx.mjs`
- `node scripts/generate-retro-soundtrack.mjs`

## Verification expectations

- Prefer `npm run build` and `npx tsc --noEmit --incremental false` for code
  changes. `next lint` is not reliable on the current Next.js baseline.
- If verification rewrites `next-env.d.ts` between `.next/dev/types/routes.d.ts`
  and `.next/types/routes.d.ts`, treat that as generated Next typing churn unless
  the PR intentionally changes routing/typegen behavior.
- For Markdown-only Bugbot guidance updates, `git diff --check` and a narrow diff
  review are sufficient unless the PR also changes runtime files.

## Deployment boundary

This file gives hosted Cursor Bugbot repository-specific review context after it
is merged to the default branch. It does not by itself prove that the managed
Bugbot service is enabled. Confirm service deployment through Cursor dashboard or
organization settings, GitHub App repository access, Admin API credentials when
used, and a PR smoke check when available. Manual GitHub PR triggers include a
top-level `cursor review` or `bugbot run` comment; use `cursor review
verbose=true` or `bugbot run verbose=true` when diagnostic request IDs or logs
are needed.
