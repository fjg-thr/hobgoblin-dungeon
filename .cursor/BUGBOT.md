# Cursor Bugbot review guide

Use this file as repository-specific context for Cursor Bugbot reviews. It does not enable the managed Bugbot service by itself; after this file is merged to the default branch, confirm the Cursor dashboard/org settings, GitHub App repository access for `fjg-thr/hobgoblin-dungeon`, and any Admin API credentials or service configuration used by the deployment.

## Project map

- Next.js app shell: `src/app/layout.tsx`, `src/app/page.tsx`, `src/app/globals.css`.
- Phaser runtime bridge: `src/game/GameCanvas.tsx`.
- Main game scene: `src/game/scenes/DungeonScene.ts`.
- Dungeon generation and tile rules: `src/game/maps/startingDungeon.ts`.
- Runtime asset source of truth: `src/game/assets/manifest.ts`.
- Generated/public assets: `public/assets/**`; audio manifest consistency helper: `public/assets/audio/audio-manifest.json`.
- Asset tooling: `tools/process_assets.py`, `tools/process_actor_death_assets.mjs`, `tools/process_combat_juice_assets.mjs`, `tools/process_corporate_goblin_assets.py`, `tools/process_gpt_tile_powerup_assets.mjs`, `tools/process_pickup_intent_effect_assets.mjs`, `tools/process_spreadsheet_brute_assets.py`, `tools/generate_powerup_sprites.mjs`, `tools/generate_polish_sprites.mjs`, `tools/generate_brute_ammo_sprites.mjs`, `tools/generate_audio_sfx.mjs`, and `scripts/generate-retro-soundtrack.mjs`.

## Review priorities

1. Preserve playable game loops: start screen, movement, aiming, shooting, ammo pickup, powerups, enemy damage, player damage, game over, restart, sound toggle, and responsive canvas resizing.
2. Treat Phaser lifecycle leaks as high risk. Check event listeners, timers, tweens, pooled game objects, scene shutdown cleanup, and React unmount behavior.
3. Keep runtime asset changes aligned across `assetManifest`, sprite metadata JSON, actual files, preload calls, animation frame ranges, and README asset lists when documentation is intentionally updated.
4. For map/collision edits, verify tile blocking, prop collision boxes, spawn safety, camera bounds, depth sorting, and pathfinding assumptions.
5. For DOM/metadata/future HTML UI, follow the existing semantic markup and `src/app/globals.css` patterns. This repo does not currently use Tailwind or ShadCN. For Phaser UI, review pointer zones, keyboard/mouse affordances, scaling, text contrast, and canvas-specific accessibility limits.

## Current behavior notes

- Controls in runtime code are `WASD` or arrows for movement, `Space` for keyboard firing, pointer movement for aim, click to aim/fire, `ESC` for modal close, and `F3` for debug. README currently also mentions `J` for firing; treat that as an existing docs/code mismatch unless a PR edits controls or control docs.
- README documents regular ammo, hearts, quickshot, haste, ward, and blast. Runtime code also includes seeker ammo/projectiles after kill/time thresholds; review seeker changes against code-defined behavior.
- README describes blast as a rare late-game powerup, while current `POWERUP_CONFIG` unlocks blast earlier than that phrase implies. Do not block unrelated PRs solely on this existing mismatch.
- `src/game/assets/manifest.ts` is the runtime audio source of truth; keep `public/assets/audio/audio-manifest.json` consistent when touched.
- `src/app/layout.tsx` references `/opengraph-image.png`; the file should remain tracked.

## Suggested verification

Run the narrowest checks that match the diff, then broaden when touching shared runtime, assets, or dependencies:

```bash
git diff --check "$(git merge-base HEAD origin/main)"..HEAD
test -f public/opengraph-image.png && git ls-files --error-unmatch public/opengraph-image.png
npm ci
npm audit --omit=dev
pnpm audit --prod
npx tsc --noEmit --incremental false
npm run build
```

When asset generator output is intentionally changed, also run the exact relevant tool command, for example:

```bash
npm run process:assets
npm run process:death-assets
npm run process:combat-juice
npm run generate:powerups
npm run generate:combat-assets
node tools/process_pickup_intent_effect_assets.mjs
node tools/process_gpt_tile_powerup_assets.mjs
python3 tools/process_spreadsheet_brute_assets.py
node tools/generate_audio_sfx.mjs
node scripts/generate-retro-soundtrack.mjs
```

`npm run lint` is not a reliable check for this Next.js version in the current baseline; prefer TypeScript plus production build unless the lint script is intentionally fixed.

## Managed Bugbot smoke check

After repository settings are enabled and this guide lands on the default branch, smoke-test a PR review with a top-level PR comment:

```text
cursor review
```

or:

```text
bugbot run
```

Use `cursor review verbose=true` or `bugbot run verbose=true` when troubleshooting trigger diagnostics, request IDs, or service logs. If service access is unavailable from the agent environment, state that repository files were deployed but managed Bugbot enablement could not be proven.
