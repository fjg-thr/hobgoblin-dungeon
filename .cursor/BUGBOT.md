# Cursor Bugbot review guidance

Use this repository-specific context when Cursor Bugbot reviews pull requests for
`fjg-thr/hobgoblin-dungeon`, a Next.js App Router app that mounts a Phaser
dungeon prototype.

## Managed Bugbot enablement boundary

This file gives Bugbot review context only. It does not enable or prove the
managed Cursor Bugbot service. To validate deployment, confirm the Cursor
dashboard/org setting, GitHub App access to this repository, any Admin API repo
configuration, and a live PR smoke review or diagnostic request ID. If those are
unavailable, state that only repo guidance was verified.

Manual PR triggers, when the service is installed:

```text
cursor review
bugbot run
cursor review verbose=true
bugbot run verbose=true
```

Use verbose output for diagnostics, request IDs, or service logs; it is not a
substitute for normal review quality.

## Project map

- `src/app/page.tsx`: page shell for the game.
- `src/app/layout.tsx`: metadata and social preview configuration.
- `src/game/GameCanvas.tsx`: client-only Phaser game creation/destruction.
- `src/game/scenes/DungeonScene.ts`: gameplay loop, input, combat, spawning,
  pickups, UI overlays, audio, and most runtime Phaser objects.
- `src/game/maps/startingDungeon.ts`: generated rooms, corridors, tile codes,
  collision helpers, and starting spawn data.
- `src/game/assets/manifest.ts`: runtime asset source of truth for images,
  sprite dimensions, animation metadata, and audio paths.
- `public/assets/**`: generated sprites, tiles, UI, effects, JSON atlas files,
  and audio. Keep images, JSON, and manifest references aligned.
- `tools/**` and `scripts/**`: asset/audio generators and processors.

This repo does not configure Tailwind or shadcn/ui. DOM work should follow
existing semantic markup and `src/app/globals.css`; Phaser UI is canvas-rendered
and needs explicit pointer zones, keyboard affordances, and responsive placement.

## High-priority review checks

### Next.js and React

- Keep Phaser/browser globals behind client boundaries. Avoid server-side imports
  that instantiate Phaser or depend on `window`.
- `GameCanvas.tsx` should avoid duplicate game instances and destroy the game on
  unmount.
- Metadata changes should keep title, description, OpenGraph/Twitter values,
  `/opengraph-image.png`, dimensions, and alt text consistent with assets.

### Phaser lifecycle, input, and UI

- Clean up scene listeners, keyboard listeners, timers, tweens, sounds, pointer
  handlers, projectiles, pickups, and overlays across restart/shutdown paths.
- Current runtime controls are WASD/arrow movement, mouse aim, `Space` firing,
  and pointer/click firing. README also mentions `J`; treat that as existing doc
  debt unless a PR touches controls or docs.
- Start screen, how-to-play modal, mute button, HUD, game-over panel, restart,
  compact viewport layout, close actions, and hit zones must remain reachable.

### Gameplay invariants

- New runs should reset health, ammo, seeker ammo, score, active power-ups,
  timers, invulnerability, enemies, pickups, projectiles, overlays, and intended
  audio/debug state.
- Initial goblins come from `dungeon.enemyStarts`; extra goblins ramp toward the
  target count. Brutes are gated by `BRUTE_UNLOCK_KILLS` and `BRUTE_UNLOCK_MS`.
- README documents regular ammo, hearts, quickshot, haste, ward, and blast. Code
  also has seeker ammo after progression thresholds; review it against code
  behavior even if README coverage is incomplete.
- `POWERUP_CONFIG` owns unlock gates, weights, rows, and presentation metadata.
  Durations/effects live near `QUICKSHOT_DURATION_MS`, `HASTE_DURATION_MS`,
  `WARD_DURATION_MS`, and `blastShotReady`.
- Collision, bounds, pathing, projectile cleanup, enemy death effects, pickup
  collection, damage cooldowns, and score updates interact in `DungeonScene.ts`;
  review related changes together.

### Assets and audio

- Runtime audio loading must match `assetManifest.audio` in
  `src/game/assets/manifest.ts`; `public/assets/audio/audio-manifest.json` is
  auxiliary and should stay consistent when touched.
- Procedural SFX: `tools/generate_audio_sfx.mjs`. Retro theme:
  `scripts/generate-retro-soundtrack.mjs`.
- Character processors include `python3 tools/process_corporate_goblin_assets.py`
  and `python3 tools/process_spreadsheet_brute_assets.py`.
- Generated binary changes should be intentional, deterministic, pixel-art safe
  (nearest-neighbor, transparency where expected), reasonably sized, and wired
  through the manifest.

## Verification expectations

Match checks to the diff:

- For guidance or source changes: `npm run build` and
  `npx tsc --noEmit --incremental false`.
- `next lint` is not reliable here because the script uses the removed Next lint
  command path.
- `npm run build` may rewrite `next-env.d.ts`; do not commit that generated
  churn unless intended. Plain `npx tsc --noEmit` may create
  `tsconfig.tsbuildinfo`, so prefer `--incremental false`.
- For asset changes, verify manifest references and run the relevant
  generator/processor when the pipeline changed.
- For gameplay changes, smoke test movement, firing, pickups, damage, death,
  restart, mute, compact UI, and at least one progression-gated enemy or power-up
  path when practical.

Report skipped verification, especially for generated binary assets or hosted
Bugbot service checks unavailable in the checkout.
