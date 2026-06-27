# Cursor Bugbot review guide

This file gives Cursor Bugbot repository-specific review context for
`fjg-thr/hobgoblin-dungeon`. It does not enable the managed Bugbot service by
itself. Confirm service deployment outside this repo through Cursor dashboard
or org settings, Cursor GitHub App access to this repository, optional Bugbot
Admin API/team configuration, and a live PR smoke review after these rules are
merged to the default branch.

Bugbot can be requested manually from a top-level PR comment with `cursor
review` or `bugbot run`. Use `cursor review verbose=true` or `bugbot run
verbose=true` only when troubleshooting trigger logs, request IDs, or service
diagnostics.

## Project shape

- Next.js App Router hosts a client-only Phaser game.
- `src/app/page.tsx` renders `src/game/GameCanvas.tsx`; that component must
  dynamically import Phaser and destroy the game instance on unmount.
- `src/game/scenes/DungeonScene.ts` owns nearly all runtime gameplay,
  including loading, animation setup, input, combat, pickups, HUD, audio, and
  scene cleanup.
- `src/game/assets/manifest.ts` is the runtime asset source of truth. The
  `public/assets/**` JSON manifests and `public/assets/audio/audio-manifest.json`
  should stay consistent with code when assets change.
- `src/game/maps/startingDungeon.ts` defines map/tile data consumed by the
  scene's collision, depth sorting, and spawn logic.

## Review priorities

1. **Build/runtime safety:** flag changes that break `npm run build`,
   `npx tsc --noEmit --incremental false`, client/server boundaries, dynamic
   Phaser imports, or `GameCanvas` cleanup.
2. **Phaser lifecycle and canvas UX:** check listener/tween/timer cleanup,
   resize behavior, depth sorting, camera bounds, pointer zones, keyboard/mouse
   affordances, and HUD placement on small screens.
3. **Gameplay regressions:** scrutinize movement, collision, enemy spawning,
   projectile behavior, ammo/seeker ammo, power-up unlocks, damage, scoring,
   restart/game-over flows, and mute/debug controls.
4. **Assets and generated files:** when sprite sheets, manifests, audio, or
   asset tooling change, require matching manifest dimensions/keys and relevant
   generator/processor commands.
5. **DOM metadata/UI:** for App Router metadata or future HTML UI, prefer
   semantic elements and existing `src/app/globals.css` patterns. This repo does
   not currently use Tailwind or ShadCN.

## Known baseline caveats

- README says `Space` or `J` fires; current code binds firing to `Space` and
  pointer/click. Block only input/control-doc changes that worsen or fail to
  address this mismatch.
- Code supports seeker ammo pickups/projectiles after progression thresholds,
  but README does not describe seeker ammo. Treat as existing docs drift unless
  a PR touches ammo, progression, or controls docs.
- README describes blast as rare late-game, while `POWERUP_CONFIG` controls the
  actual unlock/weight. Treat as existing docs drift unless the PR changes blast
  balance or docs.
- `src/app/layout.tsx` references `/opengraph-image.png`; this checkout has no
  matching `public/opengraph-image.png` or app `opengraph-image.*` file. Block
  metadata/share-image PRs that make this worse or miss the chance to fix it.
- `next lint` is not reliable with the current Next version; prefer build and
  TypeScript checks. `npm ci` may report existing audit advisories unrelated to
  scoped gameplay/asset changes.
- Next may rewrite `next-env.d.ts` between `.next/dev/types/routes.d.ts` and
  `.next/types/routes.d.ts`; do not keep that churn unless the PR intentionally
  changes generated typing behavior.

## Verification commands

For normal code changes, expect:

```bash
npm ci
npm run build
npx tsc --noEmit --incremental false
```

For asset/tooling changes, request only the commands relevant to touched files:

```bash
npm run process:assets
npm run process:death-assets
npm run process:combat-juice
npm run generate:powerups
npm run generate:combat-assets
python3 tools/process_corporate_goblin_assets.py
python3 tools/process_spreadsheet_brute_assets.py
node tools/process_pickup_intent_effect_assets.mjs
node tools/process_gpt_tile_powerup_assets.mjs
node tools/generate_polish_sprites.mjs
node tools/generate_audio_sfx.mjs
node scripts/generate-retro-soundtrack.mjs
```
