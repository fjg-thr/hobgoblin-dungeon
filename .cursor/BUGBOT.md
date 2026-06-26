# Cursor Bugbot review guide

This file gives Cursor Bugbot repo-specific context for code reviews. It does
not enable the managed Bugbot service by itself; service activation still
requires Cursor dashboard/org settings, Cursor GitHub App access to this repo,
and any Admin API/team configuration used by the owner. After this lands on the
default branch, smoke-test Bugbot on a live PR when service access is available.

Manual top-level PR triggers:

- `cursor review`
- `bugbot run`
- `cursor review verbose=true` or `bugbot run verbose=true` for diagnostics,
  request IDs, and extra service logs.

## Project context

- Next.js app with React and TypeScript.
- The browser game runs in a client-only Phaser canvas from
  `src/game/GameCanvas.tsx`.
- Main gameplay logic is in `src/game/scenes/DungeonScene.ts`.
- Dungeon layout data starts in `src/game/maps/startingDungeon.ts`.
- Runtime asset and audio paths are sourced from `src/game/assets/manifest.ts`.

Review Phaser changes for lifecycle safety, cleanup of input/event listeners,
resize/camera behavior, deterministic-enough gameplay state, collision and depth
ordering, HUD placement, audio mute behavior, and avoiding browser-only imports
outside client-only code paths.

Review Next/React changes for server/client boundaries, metadata correctness,
stable dynamic imports, accessible DOM outside the canvas, and preserving the
fullscreen canvas shell in `src/app/page.tsx` and `src/app/globals.css`.
Review TypeScript changes for unsafe casts, loosened types, route/typegen churn,
and `tsconfig` changes that reduce compiler coverage.

## Gameplay and docs caveats

These are current baseline mismatches. Do not block unrelated PRs only because
they exist, but do call out PRs that touch the affected behavior and make the
drift worse.

- README says `Space` or `J` fires; current code binds shooting to `SPACE` and
  pointer/click firing.
- README documents quickshot, haste, ward, blast, hearts, and regular ammo.
  Current code also has seeker ammo/projectiles after kill/time thresholds.
- README calls blast a rare late-game power-up; current `POWERUP_CONFIG` unlocks
  blast earlier than that wording suggests.
- `src/app/layout.tsx` references `/opengraph-image.png`; this baseline does
  not include a matching `public/opengraph-image.png` or app
  `opengraph-image.*` file.

## Assets and generated files

- Keep `src/game/assets/manifest.ts` as the runtime source of truth.
- `public/assets/audio/audio-manifest.json` is auxiliary consistency data, not
  the loader source.
- Asset/audio tooling lives in `tools/` and `scripts/`, including
  `tools/process_assets.py`, `tools/process_actor_death_assets.mjs`,
  `tools/process_combat_juice_assets.mjs`,
  `tools/process_corporate_goblin_assets.py`,
  `tools/process_gpt_tile_powerup_assets.mjs`,
  `tools/process_pickup_intent_effect_assets.mjs`,
  `tools/process_spreadsheet_brute_assets.py`,
  `tools/generate_powerup_sprites.mjs`,
  `tools/generate_polish_sprites.mjs`,
  `tools/generate_brute_ammo_sprites.mjs`,
  `tools/generate_audio_sfx.mjs`, and
  `scripts/generate-retro-soundtrack.mjs`.
- Do not require generated binary asset churn unless the PR intentionally
  changes assets and the source/manifest references are kept consistent.

## Suggested verification

Use scoped commands that fit the PR. For typical TypeScript/gameplay changes:

```bash
npm ci
npm run build
npx tsc --noEmit --incremental false
```

`next lint` is not reliable for this Next baseline. `npm ci` may report existing
moderate/high audit advisories; flag new dependency risk, but do not block
unrelated PRs solely for the current baseline advisories.

Next may rewrite `next-env.d.ts` between dev and production route type imports.
Unless a PR intentionally changes Next generated typing behavior, restore that
file and keep `tsconfig.tsbuildinfo` untracked.

## Review style

Prioritize correctness issues that could break gameplay, asset loading, build
output, browser execution, or deployed metadata. Be explicit about file/line
evidence, expected behavior, and why a finding matters. Keep known baseline
caveats separate from new regressions introduced by the PR.
