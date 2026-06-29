# Bugbot review guide

Use this repository guidance when Cursor Bugbot reviews PRs for Hobgoblin
Ruin, a Next.js/React shell around a Phaser dungeon prototype.

## Review priorities

- Treat `src/game/scenes/DungeonScene.ts` as the main runtime surface. Check
  gameplay state transitions, input handling, collision bounds, timers, enemy
  spawning, projectile lifetime, pickup effects, audio mute behavior, and any
  Phaser objects that are created without matching cleanup.
- Cross-check map and asset changes with `src/game/maps/startingDungeon.ts`,
  `src/game/assets/manifest.ts`, and the files under `public/assets`. Runtime
  loading uses `assetManifest`, including `assetManifest.audio`; keep auxiliary
  manifests such as `public/assets/audio/audio-manifest.json` consistent when a
  change intentionally touches them.
- For Next.js app changes, review `src/app/page.tsx`,
  `src/game/GameCanvas.tsx`, `src/app/layout.tsx`, and `src/app/globals.css`
  together. This repo does not currently use Tailwind; prefer existing semantic
  markup and CSS patterns for DOM UI, and evaluate Phaser canvas UI separately.
- If metadata references a public asset, verify that the asset exists. In
  particular, `src/app/layout.tsx` references `/opengraph-image.png`.
- Accessibility review should cover DOM controls where present and Phaser
  canvas affordances: pointer zones, keyboard and mouse parity, visible labels,
  responsive placement, and any unavoidable canvas-specific limitations.

## Known baseline context

- README says `Space` or `J` fires, but current runtime firing is `SPACE` plus
  pointer/click. Flag changes that worsen or intentionally touch controls, but
  do not block unrelated PRs solely for this existing mismatch.
- README documents regular ammo, heart pickups, quickshot, haste, ward, and
  blast. Current code also includes seeker ammo behavior; review code changes
  against the implementation, not only the README.
- README describes blast as rare late-game, while current `POWERUP_CONFIG`
  unlocks it earlier. Treat this as existing context unless a PR changes
  power-up progression or documentation.

## Asset and audio generation

When generated assets change, look for the corresponding source prompt or tool
update and ask for regenerated metadata where needed. Relevant tooling includes:

- `python3 tools/process_assets.py`
- `node tools/process_actor_death_assets.mjs`
- `node tools/process_combat_juice_assets.mjs`
- `python3 tools/process_corporate_goblin_assets.py`
- `node tools/process_gpt_tile_powerup_assets.mjs`
- `node tools/process_pickup_intent_effect_assets.mjs`
- `python3 tools/process_spreadsheet_brute_assets.py`
- `node tools/generate_audio_sfx.mjs`
- `node tools/generate_brute_ammo_sprites.mjs`
- `node tools/generate_polish_sprites.mjs`
- `node tools/generate_powerup_sprites.mjs`
- `node scripts/generate-retro-soundtrack.mjs`

## Verification guidance

- Prefer `npm run build` and `npx tsc --noEmit --incremental false` for scoped
  validation. `next lint` is not reliable in the current Next.js version.
- Generated Next route typings can rewrite `next-env.d.ts` between dev and
  production modes. Treat unexpected changes there as generated noise unless the
  PR intentionally changes Next typing behavior.
- For asset-only or Markdown-only PRs, focus validation on changed file syntax,
  path consistency, and whether generated artifacts match their metadata.

## Managed Bugbot deployment boundaries

This file provides repository-specific review guidance; it does not by itself
prove that the hosted Cursor Bugbot service is enabled. Deployment owners should
verify Cursor dashboard or organization settings, GitHub App repository access,
and any Admin API credentials used by their environment. After this guide is on
the default branch, smoke-test a PR review when available with a top-level
`cursor review` or `bugbot run` comment. Use `cursor review verbose=true` or
`bugbot run verbose=true` when troubleshooting request IDs or service logs.
