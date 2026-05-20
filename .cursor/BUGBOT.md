# Cursor Bugbot Review Guide

Use this repository-specific guide when Cursor Bugbot reviews pull requests for
the Hobgoblin Ruin prototype. Prioritize concrete regressions, security issues,
broken builds, and missing verification over style-only feedback.

## Repository context

- Next.js App Router app with strict TypeScript. `src/app/page.tsx` renders the
  client-only `src/game/GameCanvas.tsx` wrapper.
- `GameCanvas` dynamically imports Phaser and `DungeonScene` inside
  `useEffect`. Keep Phaser, `window`, and other browser-only APIs out of server
  components and module-level Next metadata code.
- Gameplay is concentrated in `src/game/scenes/DungeonScene.ts`; map generation
  lives in `src/game/maps/startingDungeon.ts`; asset paths and sprite dimensions
  are declared in `src/game/assets/manifest.ts`.
- Runtime assets are served from `public/assets/**` plus the tracked
  `public/opengraph-image.png`. Generator and processor tooling lives in both
  `tools/` and `scripts/`.
- `package.json` has `"private": true` for npm publishing only; do not treat that
  as evidence that the GitHub repository is private.

## Review priorities

Block or strongly flag PRs that:

1. Break `npm run build` or `npx tsc --noEmit --incremental false`.
2. Import Phaser or access browser globals from server-rendered modules.
3. Add asset-manifest entries without matching files under `public/`, incorrect
   sprite frame dimensions, or stale JSON metadata.
4. Change generated image/audio assets without updating the relevant generator,
   processor, prompt, or README asset documentation when applicable.
5. Leak Phaser scene state across reloads, restarts, or scene shutdowns
   (dangling input listeners, tweens, sounds, timers, debug objects, or
   destroyed sprites still referenced by arrays).
6. Regress core gameplay invariants: isometric WASD/arrow movement, pointer aim
   with 15-degree shot snapping, finite ammo, seeker ammo behavior, heart
   pickups, power-up timers, enemy collisions, score updates, game-over restart,
   mute control, and F3 debug overlays.
7. Change metadata or deployment URLs without verifying `metadataBase`,
   OpenGraph/Twitter image configuration, and the tracked share image.

## Known existing mismatches

Only block on these when a PR touches the relevant code, docs, or behavior:

- README controls mention `Space` or `J` to fire, while the current Phaser input
  binding uses `Space` and pointer/click firing.
- README describes regular ammo and power-ups but does not fully document
  seeker ammo, which unlocks from kills or elapsed time in `DungeonScene`.
- README calls blast a rare late-game power-up, while current code unlocks blast
  after early kills or elapsed time via `POWERUP_CONFIG.blast`.
- `npm run lint` currently invokes `next lint`; with modern Next versions this
  may be interpreted as a project directory instead of an integrated lint
  command. Prefer build plus TypeScript checks until the lint script is migrated
  to an explicit ESLint setup.

## Expected verification

For code changes, ask for or run:

```bash
npm ci
npm run build
npx tsc --noEmit --incremental false
```

For asset-heavy changes, also verify:

- Every path in `src/game/assets/manifest.ts` resolves to a tracked file.
- Sprite sheet JSON dimensions match the frame sizes used by Phaser.
- Regenerated assets preserve pixel-art constraints and transparent backgrounds.

For documentation-only changes, `git diff --check` is usually enough unless the
docs claim build, gameplay, or asset behavior changed.

## Managed Bugbot deployment checks

This file gives Bugbot repository-specific review instructions; it does not by
itself enable the managed Cursor Bugbot service. A complete service deployment
must also be verified outside the repository:

1. Cursor dashboard or organization settings have Bugbot enabled for this repo.
2. The Cursor GitHub App has access to the repository and pull requests.
3. A pull-request smoke check confirms Bugbot posts or prepares a review.

If an agent cannot access those settings, say so explicitly and report that the
repository guidance is installed but managed-service enablement is not proven
from repo files alone.
