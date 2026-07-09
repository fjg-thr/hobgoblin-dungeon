# Cursor Bugbot review guidance

Use this file as repository-specific context when Cursor Bugbot reviews pull
requests for `fjg-thr/hobgoblin-dungeon`.

## Deployment boundary

This repository file gives Bugbot durable review instructions. It does not, by
itself, enable or prove enablement of the managed Cursor Bugbot service.

To verify the hosted service is deployed for this repository, check the external
configuration that is not represented in git:

- Cursor dashboard or organization settings show Bugbot enabled for the repo.
- The Cursor GitHub App has access to `fjg-thr/hobgoblin-dungeon`.
- Any Admin API based setup has valid credentials and a repo/org configuration
  that includes this repository.
- A live pull request can trigger a Bugbot review and receives a review,
  diagnostic response, or documented request ID.

If those checks are unavailable, report that the repo guidance is present but
managed service enablement still needs an external verification.

## Manual review triggers and diagnostics

When Bugbot is installed for the repository, a top-level pull request comment can
request a review with either:

```text
cursor review
```

or:

```text
bugbot run
```

For troubleshooting, request verbose diagnostics with:

```text
cursor review verbose=true
```

or:

```text
bugbot run verbose=true
```

Use verbose output to capture diagnostic details, request identifiers, or service
logs. Do not treat verbose mode as a substitute for normal review quality.

## Project shape

This is a Next.js App Router project that renders a Phaser game client-side.
Important entry points and ownership boundaries:

- `src/app/page.tsx` renders the page shell.
- `src/app/layout.tsx` owns page metadata and social preview configuration.
- `src/game/GameCanvas.tsx` dynamically creates and destroys the Phaser game.
- `src/game/scenes/DungeonScene.ts` owns the gameplay loop, input, UI overlays,
  enemy behavior, pickups, audio state, and most runtime Phaser objects.
- `src/game/maps/startingDungeon.ts` defines generated dungeon rooms, corridors,
  tile placement, collision helpers, and starting spawn data.
- `src/game/assets/manifest.ts` is the runtime asset source of truth, including
  audio entries loaded by `DungeonScene`.
- `public/assets/**` contains generated sprite sheets, tiles, UI images, effects,
  and audio. JSON atlas files must stay aligned with the corresponding image
  files.
- `tools/**` and `scripts/**` contain asset and audio generation/processing
  helpers. Use the relevant generator when reviewing asset pipeline changes.

This repo does not currently configure Tailwind or shadcn/ui. DOM styling should
follow existing semantic markup and `src/app/globals.css`; Phaser UI should be
reviewed as canvas-rendered objects with explicit pointer zones, keyboard
affordances, and responsive placement.

## High-priority review checks

### Next.js and React shell

- `GameCanvas.tsx` should only instantiate Phaser on the client, should not leak
  duplicate game instances during React re-renders, and must destroy the game
  cleanly on unmount.
- Metadata changes in `src/app/layout.tsx` should keep title, description,
  OpenGraph/Twitter values, `/opengraph-image.png`, dimensions, and alt text in
  sync with any public asset changes.
- Avoid hydration-sensitive code in server components. Browser globals belong in
  client components or guarded effects.

### Phaser lifecycle and input

- Scene event listeners, keyboard listeners, timers, tweens, sounds, and pointer
  handlers should be cleaned up when restarting the scene or destroying the game.
- Gameplay controls currently use WASD/arrow movement, mouse aim, `Space` for
  keyboard firing, and pointer/click firing. README also mentions `J`; treat that
  mismatch as relevant for input/control-documentation PRs, but do not block
  unrelated PRs solely because the mismatch already exists.
- Start screen and how-to-play modal behavior should continue to support compact
  viewports, close actions, pointer hit zones, and control-copy consistency.
- Canvas UI changes need responsive placement checks, especially HUD panels,
  sound/mute controls, start/game-over panels, and lower-right controls.

### Gameplay state and progression

- Restarting or starting a new run should reset transient state: health, ammo,
  score, active power-ups, timers, invulnerability, enemy lists, pickups,
  projectiles, overlays, audio toggles where intended, and debug state.
- Initial goblins are seeded from `dungeon.enemyStarts`. Additional goblins ramp
  toward the target enemy count, while brutes are gated by `BRUTE_UNLOCK_KILLS`
  and `BRUTE_UNLOCK_MS`. Do not describe all goblins as progression gated.
- README documents regular ammo pickups, hearts, quickshot, haste, ward, and
  blast. The code also has seeker ammo behavior after progression thresholds;
  review seeker ammo against code-defined behavior even though README coverage is
  incomplete.
- `POWERUP_CONFIG` controls unlock gates, weights, and presentation metadata.
  Durations and effect behavior live in nearby constants and collection logic,
  including `QUICKSHOT_DURATION_MS`, `HASTE_DURATION_MS`, `WARD_DURATION_MS`,
  and `blastShotReady`.
- Collision, bounds, projectile cleanup, enemy death effects, pickup collection,
  damage cooldowns, and score updates should be checked together because they
  interact inside `DungeonScene.ts`.

### Assets and audio

- Runtime audio loading should match `assetManifest.audio` in
  `src/game/assets/manifest.ts`. `public/assets/audio/audio-manifest.json` is
  auxiliary and should be kept consistent when touched.
- For procedural SFX, check `tools/generate_audio_sfx.mjs`. For the looping
  retro dungeon theme, check `scripts/generate-retro-soundtrack.mjs`.
- For character assets, relevant processors include:
  `python3 tools/process_corporate_goblin_assets.py` and
  `python3 tools/process_spreadsheet_brute_assets.py`.
- Generated image, atlas, and audio changes should be reviewed for deterministic
  paths, nearest-neighbor/pixel-art preservation, transparent backgrounds where
  expected, reasonable file size, and manifest references.

## Verification expectations

Prefer verification that matches the affected surface:

- For normal source or guidance changes, run `npm run build` and
  `npx tsc --noEmit --incremental false`.
- `next lint` is not reliable in this project because the script invokes the
  removed Next.js lint command path in current Next versions.
- `npm run build` may rewrite `next-env.d.ts`; do not commit that generated
  churn unless the PR intentionally changes generated Next typing behavior.
- Plain `npx tsc --noEmit` can create `tsconfig.tsbuildinfo` because incremental
  mode is enabled in `tsconfig.json`; prefer `--incremental false`.
- For asset changes, also verify manifest references and run the relevant
  generator/processor command when the source asset pipeline is changed.
- For gameplay changes, smoke test movement, firing, pickups, damage, death,
  restart, mute, compact viewport UI, and at least one progression-gated enemy or
  power-up path when practical.

Report any skipped verification with the reason, especially when generated
binary assets or hosted Bugbot service checks are not available in the checkout.
