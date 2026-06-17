# Cursor Bugbot Review Guide

This repository is a Next.js/React/TypeScript web game prototype that boots a
Phaser dungeon scene in the browser. Use this guide when reviewing pull
requests for `fjg-thr/hobgoblin-dungeon`.

## Deployment boundary

This file provides repository-specific review context only. It does not enable
the managed Bugbot service; that still requires Cursor dashboard/org settings,
Cursor GitHub App repo access, and a PR smoke check that Bugbot comments or
statuses appear. Manual PR triggers may use `cursor review` or `bugbot run`;
verbose runs may use `cursor review verbose=true` or `bugbot run verbose=true`.

Bugbot uses this guide after it is merged to the default branch. A PR adding or
changing this file may not be reviewed with the new instructions yet.

## Project map

- `src/app/page.tsx` renders the app shell and imports client-only
  `src/game/GameCanvas.tsx`.
- `src/game/GameCanvas.tsx` owns the React/Phaser boundary. It dynamically
  imports Phaser and `DungeonScene` during client-side boot and tears the game
  down from React effects.
- `src/game/scenes/DungeonScene.ts` contains most gameplay, input, enemies,
  pickups, HUD, audio, and scene lifecycle logic.
- `src/game/maps/startingDungeon.ts` defines dungeon layout helpers and tiles.
- `src/game/assets/manifest.ts` is the runtime source of truth for sprites,
  atlases, tile assets, and audio. `public/assets/audio/audio-manifest.json` is
  auxiliary; check it only when audio manifests are touched.
- `public/assets/` contains committed runtime assets and metadata. Many assets
  are generated from `tools/` and `scripts/`; do not treat large asset diffs as
  hand-authored unless the PR says so.
- `src/app/globals.css` holds styling. This repo does not configure Tailwind,
  so prefer existing CSS patterns and semantic HTML checks.

## Review priorities

1. **Client/server boundaries:** Phaser, `window`, `document`, input, audio, and
   canvas access must stay behind client-only code paths. Avoid moving Phaser
   imports where Next can evaluate them during server rendering.
2. **Phaser lifecycle:** Check that event listeners, timers, animations,
   tweens, DOM/canvas references, and scene/game instances are cleaned up on
   scene shutdown or React unmount. Watch for duplicate handlers after restart.
3. **Gameplay invariants:** Movement, aiming, firing, ammo use, damage, ward,
   spawning, scoring, pickups, and restart should remain consistent. Flag
   changes that break powerup spawns, ammo recovery, or HUD/counter sync.
4. **Assets and manifests:** New or renamed files under `public/assets/` must
   match keys and frame names in `assetManifest`, Phaser atlas JSON, and any
   generator script output. For atlas/spritesheet assets, missing PNG/JSON
   pairs or stale paths are blocking.
5. **Accessibility and UI basics:** Start, how-to-play, mute, close, and restart
   interactions should remain keyboard/pointer understandable. Review copy,
   focus behavior for DOM controls, and contrast/readability changes.
6. **Generated output:** Avoid requesting broad rewrites of generated sprites,
   audio, or lockfiles unless the PR intentionally changes generation tooling or
   dependencies.

## Known existing mismatches

Do not block unrelated PRs for these pre-existing issues; flag them when a PR
touches the relevant area:

- `README.md` says `Space` or `J` fires. Current runtime firing is `Space` and
  pointer/click based; scope this to input/control documentation changes.
- README powerup text omits seeker ammo. Current code unlocks seeker ammo after
  kill/time progression and uses seeker pickups/projectiles.
- README describes blast as rare late-game. Current `POWERUP_CONFIG.blast`
  unlocks earlier than that wording implies.
- Metadata references should be checked against the actual `public/` inventory
  when PRs touch OpenGraph, app metadata, or share-image assets.

## Suggested verification

Prefer checks that are reliable for the current Next version and repo setup:

```bash
npm ci
npm run build
npx tsc --noEmit
```

`npm run lint` maps to `next lint`, which is not reliable with the current Next
setup. If build/typecheck rewrites `next-env.d.ts` or creates
`tsconfig.tsbuildinfo`, verify whether those changes are intentional. This
package has no `npm start` script; use targeted Next smoke checks only when
runtime behavior is part of the PR.

## Review output expectations

Prioritize concrete bugs with file/line references. Separate blocking issues
from existing limitations, and include the exact verification command and result
when a finding depends on local reproduction. For managed Bugbot deployment
claims, distinguish repository guidance from external Cursor dashboard and
GitHub App enablement.
