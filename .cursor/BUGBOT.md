# Bugbot review guide

Use this file as repository-specific context when reviewing Hobgoblin Ruin
Prototype pull requests. Managed Bugbot enablement is configured outside this
repo; this guide only supplies review instructions after it lands on the
default branch.

## Deployment and trigger checks

- Confirm Bugbot is enabled in the Cursor dashboard or org settings, the Cursor
  GitHub App can access `fjg-thr/hobgoblin-dungeon`, and any Admin API/team
  credentials used by the deployment are configured in the live service.
- If this agent cannot inspect those settings, say so explicitly: repository
  files can guide Bugbot reviews but cannot prove hosted-service enablement.
- For a live PR smoke check, use a top-level GitHub PR comment: `cursor review`
  or `bugbot run`. For diagnostics/request IDs/log detail, use
  `cursor review verbose=true` or `bugbot run verbose=true`.

## Project shape

- Next.js app shell: `src/app/page.tsx`, `src/app/layout.tsx`,
  `src/app/globals.css`.
- Client game bootstrap: `src/game/GameCanvas.tsx`.
- Phaser runtime: `src/game/scenes/DungeonScene.ts`.
- Map generation and tile collision: `src/game/maps/startingDungeon.ts`.
- Runtime asset source of truth: `src/game/assets/manifest.ts`. The
  `public/assets/audio/audio-manifest.json` file is auxiliary consistency data.
- Asset tooling includes `tools/process_assets.py`,
  `tools/process_actor_death_assets.mjs`, `tools/process_combat_juice_assets.mjs`,
  `tools/process_corporate_goblin_assets.py`,
  `tools/process_gpt_tile_powerup_assets.mjs`,
  `tools/process_pickup_intent_effect_assets.mjs`,
  `tools/process_spreadsheet_brute_assets.py`,
  `tools/generate_audio_sfx.mjs`, `tools/generate_polish_sprites.mjs`,
  `tools/generate_powerup_sprites.mjs`, `tools/generate_brute_ammo_sprites.mjs`,
  and `scripts/generate-retro-soundtrack.mjs`.

## Review priorities

- Treat `DungeonScene.ts` as the main gameplay surface. Check changes to timing,
  spawn thresholds, input, projectile cleanup, pools, tweens, audio lifecycle,
  and scene shutdown for leaks or stale handlers.
- For assets, verify `assetManifest` keys, files under `public/assets`, JSON
  metadata, and generator scripts stay in sync. Do not rely on the audio
  manifest alone for runtime loading.
- For DOM/metadata UI, follow existing semantic React and `globals.css`
  patterns. This repo does not configure Tailwind or shadcn/ui.
- For Phaser canvas UI, review pointer zones, keyboard/mouse affordances,
  responsive placement, camera zoom/resize behavior, and canvas-specific
  accessibility limits.
- For metadata/share cards, keep `src/app/layout.tsx` and
  `public/opengraph-image.png` consistent.
- Keep dependency and lockfile hardening separate from scoped gameplay or Bugbot
  guidance changes unless the PR intentionally touches dependencies.

## Current baseline caveats

- README controls say `Space` or `J` fires; runtime input currently binds only
  `Space` plus pointer/click firing. Flag this for input/control-doc PRs, but do
  not block unrelated PRs solely for the existing mismatch.
- README documents regular ammo, hearts, quickshot, haste, ward, and blast. Code
  also includes seeker ammo and seeker projectiles after progression thresholds.
  Review seeker behavior as code-defined unless a PR updates the docs.
- README describes blast as rare late-game, while `POWERUP_CONFIG` currently
  unlocks blast earlier. Treat that as an existing docs/code mismatch unless a
  PR intentionally fixes power-up progression.
- `next lint` is not reliable with the current Next version. Prefer the commands
  below for scoped verification.
- `npm ci` can report baseline audit advisories from current dependencies; do
  not block unrelated PRs solely on existing advisories.
- Next route type generation may rewrite `next-env.d.ts` between
  `.next/dev/types/routes.d.ts` and `.next/types/routes.d.ts`. Restore generated
  churn unless a PR intentionally changes Next typing behavior.

## Verification commands

Run the smallest command set relevant to the changed files, usually:

```bash
npm ci
npm run build
npx tsc --noEmit --incremental false
git diff --check origin/main...HEAD
```

When asset generators are changed, also run the exact touched scripts, such as
`npm run process:assets`, `npm run process:death-assets`,
`npm run process:combat-juice`, `npm run generate:powerups`,
`npm run generate:combat-assets`, `node tools/generate_audio_sfx.mjs`,
`node tools/process_pickup_intent_effect_assets.mjs`, or
`node scripts/generate-retro-soundtrack.mjs`.
