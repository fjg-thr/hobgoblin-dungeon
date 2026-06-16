# Cursor Bugbot Review Guide

Use this guide when reviewing changes to Hobgoblin Ruin, a client-side
Next.js, React, TypeScript, and Phaser 4 prototype.

## Deployment boundary

- This file gives Cursor Bugbot repository-specific review context.
- It does not enable the managed Bugbot service by itself. Confirm managed
  deployment in the Cursor dashboard, GitHub App repository access, and a PR
  smoke review when those settings are available.
- Manual PR review triggers supported by Cursor are `cursor review` and
  `bugbot run`. For troubleshooting, use `cursor review verbose=true` or
  `bugbot run verbose=true`.

## Project map

- `src/app/page.tsx` renders the app shell.
- `src/game/GameCanvas.tsx` is the React client boundary that dynamically
  imports Phaser and `DungeonScene`. Keep Phaser runtime imports out of server
  components.
- `src/game/scenes/DungeonScene.ts` contains the current game loop, enemy
  spawning, projectiles, pickups, UI overlays, audio, and Phaser lifecycle.
- `src/game/maps/startingDungeon.ts` defines generated room/corridor map data
  and collision semantics used by the scene.
- `src/game/assets/manifest.ts` is the runtime source of truth for asset paths,
  sprite dimensions, and audio loaded by Phaser.
- `public/assets/**` stores Phaser-loadable images, JSON sprite metadata, and
  audio. `public/assets/audio/audio-manifest.json` is auxiliary; keep it
  consistent when audio files or naming conventions change.
- `tools/**` and `scripts/**` contain asset/audio generator and processor
  tooling. Do not treat those source scripts as generated artifacts.

## Review priorities

1. Gameplay correctness
   - Check movement, aim snapping, projectile lifetime, enemy damage, pickup
     timers, score changes, game-over flow, and restart behavior.
   - Watch for state leaks between runs. Restart should reset player health,
     ammo, power-up timers, spawn timers, enemies, projectiles, pickups, UI,
     sounds, and debug state.
   - Validate progression gates before flagging design changes. Current code
     unlocks quickshot immediately, haste after 1 kill or 12s, blast after
     2 kills or 16s, ward after 10 kills or 90s, seeker ammo after 4 kills or
     30s, and brutes later in the run.

2. Phaser lifecycle and Next.js boundaries
   - `GameCanvas` should stay a `"use client"` component and should destroy the
     Phaser game on unmount.
   - Phaser and scene modules should remain dynamically imported from the client
     boundary unless a change proves server rendering is safe.
   - Event listeners, timers, tweens, audio instances, masks, and game objects
     added by `DungeonScene` need cleanup when scenes restart or stop.

3. Asset integrity
   - Every new or renamed runtime asset must be present under `public/assets`
     and referenced from `assetManifest` with the correct frame dimensions.
   - If sprite JSON metadata changes, check that frame counts, row ordering, and
     animation ranges in `DungeonScene` still match.
   - If generated assets are committed, verify source prompts/scripts are
     intentionally updated and avoid committing transient caches or build
     outputs.

4. Collision, map, and camera semantics
   - Collision changes should preserve walkable floor, walls, props, chasms,
     bridge/stair behavior, and debug overlay expectations.
   - Camera and resize changes should keep the full-window pixel-art canvas
     stable without blurring or layout gaps.

5. User-facing UI, controls, and accessibility
   - README currently documents `Space` or `J` for firing, but runtime keyboard
     input binds shooting to `Space`; pointer/click firing is implemented.
     Treat the `J` mismatch as a known baseline issue unless a PR changes input
     handling or control documentation.
   - README documents quickshot, haste, ward, and blast power-ups but not seeker
     ammo. Treat seeker behavior as code-defined until docs are updated.
   - README describes blast as rare late-game, while current code unlocks it
     after 2 kills or 16s. Do not block unrelated PRs solely for that mismatch.
   - This project uses plain CSS in `src/app/globals.css`, not Tailwind. Review
     UI changes against existing semantic markup and CSS conventions.
   - Preserve keyboard/mouse reachability for start, restart, mute, and debug
     flows where applicable.

6. Metadata and environment fallbacks
   - `src/app/layout.tsx` derives `metadataBase` from
     `NEXT_PUBLIC_SITE_URL`, `VERCEL_URL`, or localhost. Changes should avoid
     throwing during local development or builds without deployment env vars.
   - Open Graph metadata references `/opengraph-image.png`; if a PR depends on
     that asset, confirm the file exists and is tracked.

7. Repository hygiene
   - Keep dependency and lockfile changes intentional. The package currently has
     `npm run build`; `npm run lint` invokes `next lint`, which is not reliable
     with the current Next CLI.
   - Do not commit `.next/`, `node_modules/`, `tsconfig.tsbuildinfo`, local
     env files, temporary assets, or package-manager debug logs.
   - Build/typecheck commands may rewrite `next-env.d.ts` or create
     `tsconfig.tsbuildinfo`; restore generated noise unless the PR explicitly
     changes generated typing behavior.

## Suggested validation

Prefer the narrowest check that proves the changed behavior, then add broader
checks when runtime, assets, or package metadata changed:

```bash
npm ci
npm run build
npx tsc --noEmit
git diff --check origin/main...HEAD
```

For gameplay changes, add a browser smoke pass when possible:

- Start screen appears and the game starts.
- Movement works with WASD and arrow keys.
- Mouse aim snaps correctly; `Space` and pointer/click firing work.
- Ammo pickups, heart pickups, quickshot, haste, ward, blast, and seeker ammo
  behave according to the code-defined progression.
- Enemies spawn, attack, die, and clean up without runaway objects or sounds.
- Mute, restart, game over, resize, and `F3` debug overlay remain usable.

## Reporting expectations

- Prioritize correctness, regressions, missing tests/checks, and user-visible
  behavior over style-only comments.
- Mention known baseline mismatches as context, not as new defects, unless a PR
  touches the relevant area.
- When managed Bugbot deployment cannot be inspected from repo state, state that
  dashboard/GitHub App enablement and a live PR smoke review remain external
  confirmation steps.
