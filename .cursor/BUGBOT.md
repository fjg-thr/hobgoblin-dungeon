# Cursor Bugbot Review Guide

Use this guide when Cursor Bugbot reviews pull requests for the Hobgoblin Ruin Prototype. The repository is a Next.js App Router game shell with a client-only Phaser scene, generated pixel-art/audio assets, and a small amount of deployment metadata.

## Review Priorities

1. Preserve the Next.js server/client boundary.
   - `src/app/page.tsx` should stay a lightweight server component that renders the game shell.
   - `src/game/GameCanvas.tsx` is the client boundary. Phaser should remain behind dynamic imports inside `useEffect` so browser globals are not touched during server rendering.
   - Verify Phaser games, listeners, and resources are destroyed or detached on React unmount and scene shutdown.

2. Protect Phaser lifecycle and input behavior.
   - Check that scene event listeners registered with `this.input`, `this.scale`, `this.events`, timers, and tweens have a clear cleanup path.
   - Current keyboard firing is bound to `Space`; pointer/click firing is also supported. README mentions `Space` or `J`, but the current code does not bind `J`; treat that as an existing docs/code mismatch unless the PR changes controls.
   - Review movement, aiming, projectile, pickup, and game-over changes with focus on deterministic state transitions and avoiding stale Phaser object references.

3. Validate gameplay invariants.
   - Health should remain capped at `MAX_PLAYER_HEALTH`, with hearts restoring missing health only.
   - Standard ammo and seeker ammo are separate pools; seeker ammo unlocks after 4 kills or 30 seconds and should not consume standard ammo.
   - Brutes unlock after 3 kills or 22 seconds. Powerups currently unlock as code-defined: quickshot immediately, haste after 1 kill or 12 seconds, blast after 2 kills or 16 seconds, and ward after 10 kills or 90 seconds.
   - README describes blast as rare late-game and omits seeker ammo. Treat those as existing documentation mismatches unless a PR intentionally updates powerup or ammo docs.

4. Keep generated assets and manifests consistent.
   - When adding or replacing assets under `public/assets`, check the matching manifest entry in `src/game/assets/manifest.ts` and any JSON metadata dimensions/frame counts.
   - Asset generator/processor tooling lives in both `tools/` and `scripts/`; do not assume files there are generated output.
   - Pixel-art assets should preserve nearest-neighbor scaling expectations and avoid introducing filtering or antialiasing in Phaser config.

5. Check metadata and deployment-facing files.
   - `src/app/layout.tsx` references `/opengraph-image.png`; confirm `public/opengraph-image.png` remains present when metadata changes.
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
- `next build` can rewrite the generated `next-env.d.ts` route-types import from `.next/dev/types/routes.d.ts` to `.next/types/routes.d.ts`; revert that generated churn unless the PR intentionally changes Next.js type generation.

## Managed Bugbot Deployment Checks

This file gives Cursor Bugbot repository-specific review context. It does not, by itself, prove that the managed Bugbot service is enabled.

When verifying the deployment, confirm outside the repository that:

1. Cursor dashboard or organization settings have Bugbot/code review enabled for this repository.
2. The Cursor GitHub App has access to `fjg-thr/hobgoblin-dungeon`.
3. A pull request smoke check receives a Bugbot review or documented equivalent signal.

If those external settings are not accessible from the agent environment, state that limitation clearly and only claim that repository review guidance has been deployed.

## Review Output Style

- Lead with actionable bugs and behavioral regressions, ordered by severity.
- Cite exact file paths and lines where possible.
- Separate existing known mismatches from new regressions introduced by the PR.
- Keep suggestions scoped to the changed code unless a nearby invariant is at risk.
