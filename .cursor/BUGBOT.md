# Cursor Bugbot review guide

Use this guide when reviewing pull requests for the Hobgoblin Ruin prototype. This file gives repository-specific context to Bugbot; it does not enable the hosted Bugbot service by itself. Service enablement still needs Cursor dashboard Bugbot settings, Cursor GitHub App access to `fjg-thr/hobgoblin-dungeon`, and any team/Admin API credentials configured outside the repository.

## Project shape

- Next.js app router entry points live in `src/app/`; the playable game is mounted by `src/game/GameCanvas.tsx`.
- Most runtime gameplay, UI overlays, audio wiring, and Phaser scene state live in `src/game/scenes/DungeonScene.ts`.
- Dungeon layout data is in `src/game/maps/startingDungeon.ts`.
- The runtime asset source of truth is `src/game/assets/manifest.ts`. `public/assets/audio/audio-manifest.json` is auxiliary and should stay consistent when audio assets change.
- Generated art/audio tooling lives in `tools/` and `scripts/`; generated/public assets live under `public/assets/`.

## Review priorities

1. Protect runtime Phaser behavior: start screen, movement, pointer/click aiming, `Space` firing, finite ammo, pickups, scoring, game-over/restart, mute toggle, and `F3` debug overlay.
2. For asset or manifest changes, verify every referenced PNG/WAV/JSON path exists, frame dimensions match the sprite sheet metadata, and generator outputs are committed when needed.
3. For Next/app changes, verify metadata, `NEXT_PUBLIC_SITE_URL`/`VERCEL_URL` handling, `public/opengraph-image.png`, and SSR/client boundaries. `GameCanvas` should remain client-only.
4. For UI/accessibility changes outside the Phaser canvas, prefer semantic DOM and existing `src/app/globals.css` patterns. This repo does not currently use Tailwind or shadcn/ui.
5. Keep dependency or tooling hardening separate from gameplay/content PRs unless the PR intentionally changes those areas.

## Existing baseline caveats

- README says `Space` or `J` fires; current runtime binds staff firing to `Space` plus pointer/click. Do not block unrelated PRs for that existing docs/code mismatch.
- README describes blast as a rare late-game power-up, while current code unlocks it earlier via `POWERUP_CONFIG`; treat this as existing baseline unless the PR touches power-up progression.
- Seeker ammo exists in code after progression thresholds but is not fully documented in README. Flag only PRs that make the mismatch worse or intentionally touch ammo docs/progression.
- Hosted Bugbot applies repository rules after they are merged to the default branch; a PR adding this file may not be reviewed with these exact instructions yet.

## Suggested verification

Run the narrowest commands that cover the change. For broad code changes, prefer:

```bash
npx tsc --noEmit --incremental false
npm run build
```

`next lint` is not reliable for the current Next version in this repo. If verification dirties generated `next-env.d.ts`, restore it unless the PR is intentionally changing Next generated typing behavior.

For dependency updates, check both lockfiles when present:

```bash
npm audit --omit=dev
pnpm audit --prod
```

For asset-generation changes, use the exact generator/processor involved, for example:

```bash
npm run process:assets
npm run process:death-assets
npm run process:combat-juice
npm run generate:powerups
npm run generate:combat-assets
node tools/process_gpt_tile_powerup_assets.mjs
node tools/process_pickup_intent_effect_assets.mjs
node tools/generate_polish_sprites.mjs
node tools/generate_audio_sfx.mjs
node scripts/generate-retro-soundtrack.mjs
python3 tools/process_corporate_goblin_assets.py
python3 tools/process_spreadsheet_brute_assets.py
```

## Manual Bugbot smoke checks

After this file is merged and hosted Bugbot is enabled, create or update a PR and confirm the `Cursor Bugbot` check appears. A top-level PR comment with either command should trigger a review:

```text
cursor review
bugbot run
```

Use verbose mode only for diagnostics/request IDs/log detail:

```text
cursor review verbose=true
bugbot run verbose=true
```

If the check never appears, verify Cursor dashboard Bugbot settings, GitHub App repository access, team/org permissions, and any configured branch-protection requirement for `Cursor Bugbot`.
