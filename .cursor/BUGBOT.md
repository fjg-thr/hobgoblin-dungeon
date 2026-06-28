# Cursor Bugbot review guide

Use this file as repository-specific context when Cursor Bugbot reviews PRs for
the Hobgoblin Ruin prototype.

## Deployment boundary

- This repository can only provide Bugbot review instructions. Enabling the
  managed Bugbot service must be confirmed in Cursor org/project settings,
  GitHub App repository access, Admin API credentials when applicable, and a
  post-merge PR review smoke check.
- After this file reaches the default branch, trigger a top-level PR comment
  with `cursor review` or `bugbot run` to confirm Bugbot responds. For
  diagnostics, use `cursor review verbose=true` or `bugbot run verbose=true`
  and retain the request ID/log detail.
- A PR that introduces or edits this file may not be reviewed using the new
  rules until the file is merged to the default branch.

## Project map

- `src/app/layout.tsx`, `src/app/page.tsx`, and `src/app/globals.css` define
  the Next.js app shell, metadata, and DOM-level styling.
- `src/game/GameCanvas.tsx` dynamically loads Phaser on the client and mounts
  `DungeonScene`.
- `src/game/scenes/DungeonScene.ts` owns gameplay, input, HUD, audio, power-up
  behavior, projectiles, collisions, enemy spawning, and generated-dungeon
  runtime state.
- `src/game/assets/manifest.ts` is the runtime source of truth for loaded
  assets, including audio. Keep manifest entries aligned with files under
  `public/assets`.
- Asset tooling lives in `tools/` and `scripts/`; generated files should remain
  deterministic and committed only when intentionally refreshed.

## Review priorities

- Protect the browser-only Phaser boundary. Client code may import Phaser
  dynamically; server-rendered Next modules should not access `window`,
  `document`, or Phaser globals during render.
- For gameplay changes, review state reset paths, scene shutdown cleanup,
  collision/depth ordering, spawn rates, pickup availability, projectile
  lifecycle, cooldown math, and HUD/audio updates together.
- Check input changes with keyboard, pointer, start screen, how-to-play modal,
  game-over state, and mute-button interaction. The current runtime binds staff
  firing to `Space` and pointer/click; README also mentions `J`, which is an
  existing docs/code mismatch unless a PR intentionally addresses controls.
- For assets, verify dimensions, frame counts, manifest keys, Phaser animation
  rows, public paths, and bundle-impact risk. Do not assume the auxiliary audio
  manifest controls runtime loading; `assetManifest.audio` does.
- For metadata or share-image work, ensure `/opengraph-image.png` stays tracked
  because `src/app/layout.tsx` references it.
- This repo does not configure Tailwind. DOM UI should follow existing semantic
  markup and `globals.css` patterns; Phaser canvas UI needs separate review for
  pointer zones, readable placement, responsive scaling, and keyboard/mouse
  affordances.

## Known baseline caveats

- README says `Space` or `J` fires, but runtime shooting currently uses
  `Space` plus pointer/click.
- README documents regular ammo, hearts, quickshot, haste, ward, and blast, but
  runtime code also unlocks seeker ammo/projectiles after progression
  thresholds.
- README describes blast as a rare late-game power-up; runtime unlock timing is
  defined by `POWERUP_CONFIG` and may differ from that wording.
- These caveats should not block unrelated PRs, but they should be called out
  when a change touches the affected docs, controls, ammo, or power-up behavior.

## Suggested verification

Run the commands most relevant to the PR:

```bash
git diff --check "$(git merge-base HEAD origin/main)"..HEAD
test -f public/opengraph-image.png && git ls-files --error-unmatch public/opengraph-image.png
npm ci
npm audit --omit=dev
pnpm audit --prod
npx tsc --noEmit --incremental false
npm run build
```

`next lint` is not reliable with the current Next version; prefer typecheck and
production build for scoped verification. If Next rewrites `next-env.d.ts`
during local checks, restore it unless the PR intentionally changes generated
route typing behavior.

When asset changes are in scope, use the exact generator/processor command that
matches the changed files, for example:

```bash
python3 tools/process_assets.py
node tools/process_actor_death_assets.mjs
node tools/process_combat_juice_assets.mjs
node tools/process_gpt_tile_powerup_assets.mjs
python3 tools/process_corporate_goblin_assets.py
node tools/process_pickup_intent_effect_assets.mjs
python3 tools/process_spreadsheet_brute_assets.py
node tools/generate_audio_sfx.mjs
node tools/generate_polish_sprites.mjs
node tools/generate_powerup_sprites.mjs
node tools/generate_brute_ammo_sprites.mjs
node scripts/generate-retro-soundtrack.mjs
```
