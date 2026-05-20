# Cursor Bugbot Review Guide

Use this repository-specific context when Cursor Bugbot reviews pull requests for the Hobgoblin Ruin Prototype. This is a Next.js App Router project that renders a client-only Phaser dungeon scene with committed generated pixel-art and audio assets.

## Review Priorities

1. Preserve the Next.js server/client boundary.
   - `src/app/page.tsx` should stay a small server component that renders the game shell.
   - `src/game/GameCanvas.tsx` is the client boundary. Phaser imports should remain inside `useEffect` so browser globals are not touched during server rendering.
   - Confirm Phaser games and scene resources are destroyed or detached on React unmount and scene shutdown.

2. Protect Phaser lifecycle and input behavior.
   - Check listeners registered with `this.input`, `this.scale`, `this.events`, keyboard objects, timers, and tweens for a clear cleanup path.
   - Keyboard firing is currently bound to `Space`; pointer/click firing is also supported. The README mentions `Space` or `J`, while the scene and how-to-play modal only bind `Space`; treat that as an existing docs/code mismatch unless the PR changes controls.
   - Review movement, aiming, projectile, pickup, pause/start/game-over, and mute changes for deterministic state transitions and stale Phaser object references.

3. Validate gameplay invariants.
   - Player health must stay capped at `MAX_PLAYER_HEALTH`; heart pickups should restore only missing health.
   - Standard ammo and seeker ammo are separate pools. Seeker ammo unlocks after 4 kills or 30 seconds and should not consume standard ammo.
   - Brutes unlock after 3 kills or 22 seconds. Powerups currently unlock by code-defined progression: quickshot immediately, haste after 1 kill or 12 seconds, blast after 2 kills or 16 seconds, and ward after 10 kills or 90 seconds.
   - Treat existing README omissions around seeker ammo and exact powerup timing as documentation gaps unless a PR intentionally changes those systems.

4. Keep generated assets and manifests consistent.
   - When assets under `public/assets` change, verify matching paths and metadata in `src/game/assets/manifest.ts`.
   - Check committed JSON metadata dimensions/frame counts against Phaser spritesheet configuration when animation sheets change.
   - Pixel-art rendering should preserve nearest-neighbor expectations: avoid introducing filtering, smoothing, or antialiasing in Phaser config.

5. Check metadata and deployment-facing files.
   - `src/app/layout.tsx` references `/opengraph-image.png`, but that asset is not currently committed; treat it as an existing deployment metadata gap unless the PR changes metadata or social preview assets.
   - If `NEXT_PUBLIC_SITE_URL`, `VERCEL_URL`, OpenGraph, Twitter card, or static export behavior changes, verify local and deployed URL behavior.
   - This repo's `package.json` is `"private": true` for npm publishing; do not treat that as GitHub repository visibility.

## Expected Verification

Prefer checks that match the current toolchain:

```bash
npm ci
npm run build
npx tsc --noEmit --incremental false
```

Notes:

- `npm run lint` currently calls `next lint`, which is not an integrated command under the lockfile-resolved Next.js 16.x toolchain. Prefer build and TypeScript checks until linting is migrated to an explicit ESLint command/configuration.
- `npm ci` may report known audit findings. Report them as dependency audit context unless the PR changes dependencies or security posture.
- `next build` can rewrite the generated `next-env.d.ts` route-types import from `.next/dev/types/routes.d.ts` to `.next/types/routes.d.ts`; revert generated churn unless the PR intentionally changes Next.js type generation.

## Managed Bugbot Deployment Checks

This file gives Cursor Bugbot repository-specific review context. It does not, by itself, prove that the managed Bugbot service is enabled.

When verifying deployment, confirm outside the repository that:

1. Bugbot/code review is enabled for this repository in Cursor dashboard or organization settings.
2. The Cursor GitHub App has access to `fjg-thr/hobgoblin-dungeon`.
3. A pull request smoke check receives a Bugbot review or documented equivalent signal.

If those external settings are not accessible from the agent environment, state that limitation clearly and only claim that repository review guidance has been deployed.

## Review Output Style

- Lead with actionable bugs and behavioral regressions, ordered by severity.
- Cite exact file paths and lines where possible.
- Separate known existing mismatches from regressions introduced by the PR.
- Keep suggestions scoped to changed code unless a nearby invariant is at risk.
