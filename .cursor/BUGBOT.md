# Cursor Bugbot review guide

Use this file as repository-specific context for Cursor Bugbot reviews. Bugbot
itself is enabled outside this repo through the Cursor dashboard, repository
provider integration, and GitHub App repository access.

## Deployment and trigger checks

- Confirm Bugbot is enabled for `fjg-thr/hobgoblin-dungeon` in the Cursor
  dashboard or organization settings.
- Confirm the Cursor GitHub App has access to this repository.
- If Admin API or team-level rules are used, verify those live settings outside
  this repository before assuming hosted reviews are active.
- Manual PR smoke triggers are top-level comments: `cursor review` or
  `bugbot run`. For diagnostics, use `cursor review verbose=true` or
  `bugbot run verbose=true` and keep the request ID/log details for support.
- This repository file tunes review context only. It cannot prove that the
  hosted managed Bugbot service is enabled.

## Project shape

- App shell: Next.js/React/TypeScript under `src/app`, with
  `src/game/GameCanvas.tsx` mounting Phaser on the client.
- Core game runtime: `src/game/scenes/DungeonScene.ts`.
- Dungeon layout data: `src/game/maps/startingDungeon.ts`.
- Runtime asset source of truth: `src/game/assets/manifest.ts`.
- Public assets live under `public/assets/**`; generated source sheets may live
  under `public/assets/source/**`.
- Asset/audio tooling lives under `tools/` and `scripts/`, including:
  `tools/process_assets.py`, `tools/process_actor_death_assets.mjs`,
  `tools/process_combat_juice_assets.mjs`,
  `tools/process_corporate_goblin_assets.py`,
  `tools/process_gpt_tile_powerup_assets.mjs`,
  `tools/process_pickup_intent_effect_assets.mjs`,
  `tools/process_spreadsheet_brute_assets.py`,
  `tools/generate_audio_sfx.mjs`, `tools/generate_polish_sprites.mjs`,
  `tools/generate_powerup_sprites.mjs`,
  `tools/generate_brute_ammo_sprites.mjs`, and
  `scripts/generate-retro-soundtrack.mjs`.
- The project does not currently configure Tailwind or shadcn. For DOM changes,
  review semantic markup and existing `src/app/globals.css` patterns. For Phaser
  UI, review canvas interaction zones, pointer affordances, keyboard/mouse
  controls, responsive placement, and accessibility limits of canvas-only UI.

## Review priorities

- Treat gameplay regressions in `DungeonScene.ts` as high risk: movement,
  aiming, firing, enemy spawning, pickups, power-ups, health/ammo, score,
  scene restart, camera, audio mute, and debug overlay should continue to work.
- When asset paths, frame sizes, keys, or JSON metadata change, verify
  `assetManifest`, preload code, animation definitions, and files under
  `public/assets/**` stay consistent.
- For map/collision changes, check isometric tile conversion, wall blocking,
  spawn safety, pickup reachability, and camera bounds together.
- For audio changes, `assetManifest.audio` is the runtime source of truth.
  `public/assets/audio/audio-manifest.json` is auxiliary consistency data.
- For metadata/share-image changes, check `src/app/layout.tsx` against actual
  files in `public/`. The current layout references `/opengraph-image.png`; flag
  missing or mismatched assets when metadata or public assets are touched.
- Dependency or tooling changes should keep `package-lock.json` and
  `package.json` synchronized and should not mix unrelated vulnerability
  remediation into gameplay-only PRs.

## Known baseline caveats

- `README.md` says `Space` or `J` fires, but the current runtime binds shooting
  to `SPACE` and pointer/click firing. Do not block unrelated PRs only for this
  existing mismatch; flag it when input docs or controls are changed.
- README documents standard ammo, hearts, quickshot, haste, ward, and blast, but
  current code also includes seeker ammo behavior. Flag docs/runtime drift when
  ammo, pickups, or README gameplay docs change.
- README describes blast as a rare late-game power-up, while the current
  `POWERUP_CONFIG` determines actual unlock timing and rarity. Treat this as
  existing drift unless a PR intentionally updates progression or docs.
- `next lint` is not reliable with the current Next version. Prefer the
  verification commands below.
- `npm ci` may report existing audit advisories. Do not block unrelated PRs only
  for baseline advisories unless dependency changes affect them.
- Next may rewrite `next-env.d.ts` between dev and production route type paths
  (`.next/dev/types/routes.d.ts` vs `.next/types/routes.d.ts`). Avoid committing
  generated churn unless the PR intentionally changes Next type generation.

## Suggested verification

For ordinary code/config changes:

```bash
npm ci
npm run build
npx tsc --noEmit --incremental false
git diff --check origin/main...HEAD
```

For generated asset or audio changes, also run the specific processor/generator
that owns the changed files, for example:

```bash
python3 tools/process_assets.py
node tools/process_actor_death_assets.mjs
node tools/process_combat_juice_assets.mjs
node tools/generate_audio_sfx.mjs
node scripts/generate-retro-soundtrack.mjs
```
