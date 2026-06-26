# Cursor Bugbot Review Guide

This file gives Cursor Bugbot repository-specific context for reviews of the
Hobgoblin Ruin prototype. It does not enable the hosted Bugbot service by
itself. Confirm service enablement through Cursor dashboard or organization
settings, GitHub App repository access, any Admin API/team configuration, and a
live PR smoke review after these rules are merged to the default branch.

Manual PR review triggers supported by Cursor Bugbot include top-level comments:

- `cursor review`
- `bugbot run`
- `cursor review verbose=true` or `bugbot run verbose=true` for diagnostics such
  as request IDs/log detail when troubleshooting review execution.

## Project shape

- Next.js app using React and TypeScript.
- `src/app/page.tsx` mounts the game shell.
- `src/game/GameCanvas.tsx` is a client component that dynamically imports
  Phaser and boots `DungeonScene`; avoid SSR-only APIs outside client effects.
- `src/game/scenes/DungeonScene.ts` contains most runtime behavior: input,
  combat, HUD, audio, pickup spawning, enemy behavior, and Phaser rendering.
- `src/game/maps/startingDungeon.ts` owns procedural map generation and tile
  collision helpers.
- `src/game/assets/manifest.ts` is the runtime asset/audio source of truth.

## Review priorities

Focus on user-visible regressions and changes that touch shipped behavior:

- Game boot: Next client/server boundaries, Phaser dynamic import, resize
  behavior, cleanup on unmount, and browser-only access.
- Controls: WASD/arrow movement, Space firing, pointer aim/click firing, Escape
  for the how-to modal, F3 debug overlay, and the scene-level mute button.
- Combat/gameplay: finite ammo, seeker ammo behavior, blast-charged shots,
  quickshot/haste/ward/blast timers, enemy contact damage, heart pickups, score,
  game-over/restart flow, and spawn progression.
- Phaser UX: interactive pointer zones, keyboard affordances, HUD readability,
  responsive placement, canvas layering/depth, and pixel-art rendering.
- Assets: if code references a sprite sheet, JSON atlas, image, or audio path,
  verify it exists under `public/assets` and is loaded through
  `assetManifest` when used at runtime.
- Maps/collision: keep tile code semantics, bridge/chasm behavior, props that
  block movement, player/enemy spawn validity, and debug labels consistent.
- Metadata/app shell: verify `metadataBase`, OpenGraph/Twitter images, `<main>`
  structure, and `src/app/globals.css` changes when app-shell or share metadata
  files are touched.

## Existing baseline caveats

Do not block unrelated PRs solely for these known baseline issues, but flag
changes that touch the area and make the mismatch worse:

- `README.md` says Space or J can fire; current `DungeonScene` binds firing to
  Space and pointer/click.
- README documents regular ammo, hearts, quickshot, haste, ward, and blast, but
  not code-defined seeker ammo behavior.
- README describes blast as rare late-game; current `POWERUP_CONFIG` unlocks it
  earlier than that wording implies.
- `src/app/layout.tsx` references `/opengraph-image.png`; no matching
  `public/opengraph-image.png` or app `opengraph-image.*` exists in this
  checkout.
- `npm ci` may report existing Next.js/PostCSS audit advisories. Do not fail an
  unrelated PR solely for the baseline audit output.
- Next can rewrite `next-env.d.ts` between dev and production route type paths;
  restore generated churn unless a PR intentionally changes Next typing behavior.

## Asset and audio tooling

When reviewing generated asset changes, make sure the source, processor, and
runtime manifest stay aligned. Relevant tools include:

- `tools/process_assets.py`
- `tools/process_actor_death_assets.mjs`
- `tools/process_combat_juice_assets.mjs`
- `tools/process_pickup_intent_effect_assets.mjs`
- `tools/process_corporate_goblin_assets.py`
- `tools/process_spreadsheet_brute_assets.py`
- `tools/process_gpt_tile_powerup_assets.mjs`
- `tools/generate_powerup_sprites.mjs`
- `tools/generate_brute_ammo_sprites.mjs`
- `tools/generate_polish_sprites.mjs`
- `tools/generate_audio_sfx.mjs`
- `scripts/generate-retro-soundtrack.mjs`

`public/assets/audio/audio-manifest.json` is auxiliary. Runtime audio loading is
driven by `assetManifest.audio`.

## Suggested verification

For code changes, prefer:

```bash
npm ci
npm run build
npx tsc --noEmit --incremental false
```

`next lint` is not a reliable command for this Next baseline. If verification
dirties generated files such as `next-env.d.ts` or `tsconfig.tsbuildinfo`,
review whether the churn is intentional before suggesting it be committed.

## Review style

Prioritize concrete bugs, regressions, broken assets, inaccessible interaction
changes, and missing verification. Use file/line references and keep findings
actionable. Mention managed Cursor/Bugbot enablement as an external check when a
PR only changes repository guidance.
