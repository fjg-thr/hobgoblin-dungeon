# Cursor Bugbot review guide

This repo uses Cursor Bugbot as a managed PR review service. This file gives
Bugbot project context after it lands on the default branch; it does not enable
the managed service by itself.

## Deployment boundaries

- Confirm managed enablement outside the repo when possible: Cursor org/project
  settings, GitHub App repository access, and a live PR smoke review/status.
- PRs that add or change this file may not be reviewed with the new guidance
  until the guidance is present on the default branch.
- Manual PR triggers include top-level comments `cursor review` and
  `bugbot run`. Use `cursor review verbose=true` or `bugbot run verbose=true`
  only for diagnostics, request IDs, or extra log detail.

## Project context

- Next.js app with React and TypeScript. `src/app/page.tsx` renders a single
  Phaser canvas through `src/game/GameCanvas.tsx`.
- Main gameplay lives in `src/game/scenes/DungeonScene.ts`; movement, combat,
  pickups, HUD, audio, and scene lifecycle share one stateful Phaser scene.
- Runtime asset loading is driven by `src/game/assets/manifest.ts`; keep keys,
  frame sizes, metadata paths, and `public/assets` files in sync.
- Dungeon generation and tile blocking live in `src/game/maps/startingDungeon.ts`.
- Asset tooling lives in `tools/` and `scripts/`, including
  `tools/process_assets.py`, `tools/process_actor_death_assets.mjs`,
  `tools/process_combat_juice_assets.mjs`, `tools/generate_audio_sfx.mjs`, and
  `scripts/generate-retro-soundtrack.mjs`.

## Review priorities

### Gameplay and Phaser lifecycle

- Look for regressions in movement, pointer aiming, click firing, projectile
  collision, enemy pathing, pickups, power-up timers, HUD, resizing, and cleanup.
- Validate input behavior against current code: movement uses WASD/arrows,
  shooting uses Space and pointer/click input, F3 toggles debug overlays, and
  the lower-right SOUND/MUTED control toggles audio. README currently mentions
  `J` for firing, but the code binds Space only; block PRs that worsen or touch
  control docs, not unrelated PRs solely for that baseline mismatch.
- New sprites, graphics, zones, sounds, timers, or input listeners should be
  cleaned up or owned by scene shutdown paths.
- Preserve map/collision invariants: blocked tiles, prop blockers, spawn-safe
  distances, depth ordering, and coordinate transforms must stay consistent.

### Assets, audio, and docs drift

- When manifests change, verify tracked files and metadata exist. Frame sizes and
  `framesPerRow` values must match Phaser animation sheets.
- `assetManifest.audio` is the runtime audio source of truth. Treat
  `public/assets/audio/audio-manifest.json` as auxiliary consistency data.
- README documents standard ammo, heart pickups, quickshot, haste, ward, and
  blast. Code also has seeker ammo/projectiles; PRs touching ammo, pickups, or
  docs should keep that behavior clear.
- README describes blast as a rare late-game power-up, while current
  `POWERUP_CONFIG` unlocks it earlier. Treat this as an existing docs/code drift
  unless a PR intentionally fixes it.
- `src/app/layout.tsx` references `/opengraph-image.png`, but no matching
  tracked `public/opengraph-image.png` or `src/app/opengraph-image.*` asset is
  present on this baseline. Block metadata/share-card changes that rely on it
  without adding the asset; do not block unrelated PRs solely for the baseline.

### Web app and UI

- `GameCanvas` dynamically imports Phaser. Preserve the early return,
  cancellation guard, and `destroy(true)` cleanup.
- The repo does not configure Tailwind. For DOM UI, follow existing semantic
  React and `src/app/globals.css` patterns. For canvas UI, review pointer zones,
  keyboard/mouse affordances, responsive placement, and readable contrast.
- Metadata/env changes should keep local development working without external
  variables; `NEXT_PUBLIC_SITE_URL` and `VERCEL_URL` are optional today.

## Verification expectations

Prefer these checks for code-affecting PRs:

```bash
npm ci
npm run build
npx tsc --noEmit
```

Run targeted asset generation or processing commands when a PR changes generated
assets, source sheets, audio manifests, or generator scripts.

`npm run lint` is not reliable on the current Next.js baseline, so do not rely
on it as the primary signal. `npm ci` currently reports baseline npm audit
findings; do not block unrelated PRs solely for unchanged dependency advisories,
but do call out PRs that add vulnerable dependencies or worsen the baseline.

If verification rewrites `next-env.d.ts` route-type imports or creates
`tsconfig.tsbuildinfo`, restore/remove them unless the PR intentionally changes
Next.js type-generation behavior.

## Review style

- Lead with concrete, actionable findings tied to file paths and behavior.
- Distinguish existing baseline drift from regressions introduced by the PR.
- Favor focused recommendations. Request extraction only when it materially
  reduces risk or fixes a real bug.
