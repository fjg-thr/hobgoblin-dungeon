# Cursor Bugbot Review Guide

This file gives Cursor Bugbot repository-specific context after it is merged to the
default branch. It does not enable the hosted Bugbot service by itself.

## Deployment and activation boundaries

- Confirm managed Bugbot enablement outside the repo: Cursor dashboard or org
  settings, Cursor GitHub App access for `fjg-thr/hobgoblin-dungeon`, and any
  Bugbot Admin API credentials or team configuration in use.
- If you cannot access those systems, state that this repo file only supplies
  review context and cannot prove hosted Bugbot activation.
- After the guide lands on the default branch, smoke-check Bugbot on a live PR.
  A top-level PR comment can manually request review with `cursor review` or
  `bugbot run`; use `cursor review verbose=true` or `bugbot run verbose=true`
  only when diagnostic request IDs or extra log detail are needed.
- PRs adding or changing this file may not be reviewed with the new rules until
  after merge.

## Project context

- This is a Next.js/React/TypeScript prototype with a Phaser game mounted through
  `src/game/GameCanvas.tsx` and primary gameplay in
  `src/game/scenes/DungeonScene.ts`.
- There is no Tailwind setup. DOM and metadata changes should follow semantic
  HTML plus existing `src/app/globals.css` patterns. Phaser UI changes should be
  reviewed as canvas interactions: pointer hit areas, keyboard/mouse affordances,
  responsive placement, readable overlays, and accessibility limits of canvas UI.
- Runtime assets are declared in `src/game/assets/manifest.ts`. Keep that file
  aligned with files under `public/assets` when adding, moving, or deleting game
  assets.
- Runtime audio loading uses `assetManifest.audio`. The
  `public/assets/audio/audio-manifest.json` file is auxiliary and should only be
  treated as a consistency artifact when audio assets are touched.

## Review priorities

- Block changes that break `npm run build` or
  `npx tsc --noEmit --incremental false`. `next lint` is not a reliable command
  in the current Next 16 setup.
- Pay close attention to lifecycle and cleanup around `GameCanvas`, dynamic
  Phaser imports, scene restart/reset paths, timers, tweens, keyboard handlers,
  sound objects, and pooled game objects.
- For `DungeonScene.ts`, review gameplay state invariants around health, ammo,
  seeker ammo, powerups, enemy respawn/pathing, hit stop, projectile disposal,
  depth ordering, camera resize behavior, and game-over/start-screen transitions.
- Map changes in `src/game/maps/startingDungeon.ts` should preserve traversable
  spawn areas, valid tile codes, wall/corner consistency, prop collision bounds,
  and stair visibility.
- Asset pipeline changes should verify generator/processor intent, especially
  `tools/generate_audio_sfx.mjs`,
  `scripts/generate-retro-soundtrack.mjs`, and the processor scripts under
  `tools/`.

## Known baseline caveats

- README controls mention `Space` or `J`, but current gameplay binds shooting to
  `Space` and pointer/click firing. Do not block unrelated PRs for this existing
  mismatch; do block input/control-doc changes that make it worse.
- README documents regular ammo, hearts, quickshot, haste, ward, and blast.
  Current code also unlocks seeker ammo/pickups/projectiles after progression
  thresholds. Treat seeker behavior as code-defined unless a PR updates docs.
- README describes blast as a rare late-game powerup, while current
  `POWERUP_CONFIG` unlocks it earlier. Treat this as a baseline docs/code drift
  unless the PR changes blast progression or documentation.
- `src/app/layout.tsx` references `/opengraph-image.png`. If the asset is absent
  on the reviewed branch, treat that as an existing baseline issue unless a PR
  touches metadata/share-image behavior or worsens the reference.
- `npm ci` may report existing audit advisories from the dependency baseline.
  Do not block unrelated PRs solely for those advisories, but do flag dependency
  changes that increase vulnerability count or severity.
- This repo currently contains both `package-lock.json` and `pnpm-lock.yaml`.
  Flag dependency PRs that update only one lockfile without explaining why.

## Expected verification for meaningful changes

Run the narrowest relevant checks plus these baseline commands when code,
runtime assets, or build configuration changes:

```bash
npm ci
npm run build
npx tsc --noEmit --incremental false
```

If verification rewrites generated files such as `next-env.d.ts` or
`tsconfig.tsbuildinfo`, restore or ignore that churn unless the PR intentionally
changes generated Next.js typing behavior.

## Review style

Lead with actionable findings that would cause bugs, regressions, build breaks,
or misleading docs. Include exact file and line references. Keep summaries brief,
and separate pre-existing baseline caveats from issues introduced by the PR.
