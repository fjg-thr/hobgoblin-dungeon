# Cursor Bugbot review guide

Use this repository-specific context when reviewing PRs for the Hobgoblin Ruin
Prototype. This file only configures review guidance in-repo; the managed
Cursor Bugbot service still needs to be enabled through Cursor/GitHub settings
or the Bugbot Admin API outside this repository.

## Project map

- Next.js App Router + React + TypeScript boot a client-only Phaser 4 RC game.
- `src/app/` owns metadata, global styles, and the shell page.
- `src/game/GameCanvas.tsx` dynamically imports Phaser and destroys the game on
  unmount. Keep browser-only code out of server components.
- `src/game/scenes/DungeonScene.ts` is the main gameplay surface: preload,
  animation setup, input, UI, combat, audio, spawning, pickups, scoring, and
  game-over/restart flow.
- `src/game/maps/startingDungeon.ts` owns procedural map generation, tile codes,
  collision helpers, and seeded map exports used for deterministic checks.
- `src/game/assets/manifest.ts` is the runtime asset source of truth. Keep paths,
  keys, frame sizes, and loaded assets synchronized with committed files under
  `public/assets/`.
- Asset tooling lives under `tools/` and `scripts/`. Some tools require Python
  Pillow or Node `sharp`, so review dependency/docs updates when those scripts
  change.

## Review priorities

1. Guard game boot boundaries: Phaser imports should stay client-only, cleanup
   should destroy the game instance, and Next metadata/assets should remain
   valid.
2. Be careful with `DungeonScene.ts`; small constant changes can alter spawn
   pressure, power-up cadence, collision, audio, UI depth, or game-over state.
3. Check isometric math and controls together: movement vectors, pointer aim,
   `snapAngleDegrees`, projectile origins, collision radii, and camera follow.
4. Verify pickup/projectile changes across standard ammo, seeker ammo, blast
   shots, hearts, ward invulnerability, and score progression.
5. For DOM/metadata UI, follow existing semantic markup and `src/app/globals.css`
   patterns. For Phaser canvas UI, review pointer zones, keyboard/mouse
   affordances, responsive placement, depth ordering, and mute/debug controls.
6. For dependency PRs, keep both `package-lock.json` and `pnpm-lock.yaml` in sync.
   Phaser is pinned to `4.0.0-rc.4`; do not upgrade it incidentally.

## Known baseline mismatches

Do not block unrelated PRs solely for these existing differences, but flag them
when a change touches the affected behavior or docs:

- README says `Space` or `J` fires; code currently binds shooting to `Space` and
  pointer/click firing.
- Seeker ammo exists in code and unlocks during progression, but README focuses
  on regular ammo and documented power-ups.
- README describes blast as rare/late-game; `POWERUP_CONFIG` unlocks blast early
  relative to ward.
- Runtime audio loading uses `assetManifest.audio`; `public/assets/audio/audio-manifest.json`
  is auxiliary consistency data.
- Some generated atlases and source assets are listed for the pipeline even when
  runtime loaders consume individual manifest paths instead.

## Asset and audio review checklist

- If `manifest.ts` changes, confirm every referenced PNG/WAV/JSON exists under
  `public/assets/` and matches the expected frame dimensions.
- If JSON atlas metadata changes, check sheet row/column assumptions in
  `DungeonScene.ts` before accepting frame-number changes.
- Prefer exact tooling commands over wildcard scripts:
  - `npm run process:assets`
  - `npm run process:death-assets`
  - `npm run process:combat-juice`
  - `npm run generate:powerups`
  - `npm run generate:combat-assets`
  - `node tools/generate_audio_sfx.mjs`
  - `node scripts/generate-retro-soundtrack.mjs`
  - `node tools/generate_polish_sprites.mjs`
  - `node tools/process_pickup_intent_effect_assets.mjs`
  - `node tools/process_gpt_tile_powerup_assets.mjs`
  - `python3 tools/process_corporate_goblin_assets.py`
  - `python3 tools/process_spreadsheet_brute_assets.py`

## Suggested verification

For most code PRs:

```bash
npm ci
npx tsc --noEmit --incremental false
npm run build
```

When package manager metadata changes, also run:

```bash
npm audit --omit=dev
pnpm install --frozen-lockfile
pnpm audit --prod
pnpm exec tsc --noEmit --incremental false
pnpm run build
```

Manual smoke coverage for gameplay PRs: start screen, how-to-play modal,
movement, Space fire, click fire, ammo pickup, seeker ammo after unlock,
quickshot, haste, ward, blast charged shot, brute spawn, heart pickup, damage,
game over/restart, mute toggle, and `F3` debug overlay.

## Trigger and diagnostic notes

On GitHub PRs, maintainers can request a review with a top-level comment:

- `cursor review`
- `bugbot run`

For diagnostics, use `cursor review verbose=true` or `bugbot run verbose=true`
to request more detailed logs/request information. These comments trigger the
managed service only after Bugbot is enabled for the repository.
