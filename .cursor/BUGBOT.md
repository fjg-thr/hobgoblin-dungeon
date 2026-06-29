# Cursor Bugbot Review Guide

Use this guide when reviewing pull requests for the Hobgoblin Ruin prototype. The repo is a Next.js App Router app that mounts a client-only Phaser game scene.

## Review priorities

- `src/game/scenes/DungeonScene.ts` is the main gameplay surface. Check lifecycle cleanup, keyboard/pointer handlers, scene restart paths, pooled sprites/text, timers, tweens, camera effects, and audio objects for leaks or duplicate registration.
- Preserve the Next/Phaser boundary. `src/game/GameCanvas.tsx` must remain a client component that dynamically imports Phaser and destroys the game instance on unmount; server files such as `src/app/layout.tsx` should not import Phaser or browser-only APIs.
- Treat `src/game/assets/manifest.ts` as the runtime source of truth for loaded assets and audio. When manifest entries change, verify the corresponding files under `public/assets/**` exist and that Phaser frame sizes/rows still match the metadata JSON.
- Review dungeon map/collision changes in `src/game/maps/startingDungeon.ts` with movement, projectile, enemy, pickup, prop blocker, bridge/chasm, and camera-depth interactions in mind.
- For DOM or metadata work, keep semantic markup in `src/app/**` and existing `src/app/globals.css` patterns. This repo does not currently use Tailwind or ShadCN. Also check Phaser canvas UI controls for pointer zones, keyboard affordances, responsive placement, and text contrast.

## Known baseline mismatches

- README says `Space` or `J` fires, but current code binds keyboard shooting to `SPACE` plus pointer/click firing. Do not block unrelated PRs solely for this existing mismatch; call it out on input/docs changes.
- README documents standard ammo, heart pickups, quickshot, haste, ward, and blast. Current code also has seeker ammo/pickups/projectiles after progression thresholds; require docs/tests when PRs intentionally change this behavior.
- README describes blast as a rare late-game power-up, while `POWERUP_CONFIG` controls its actual unlock timing and weight. Treat this as existing unless a PR changes power-up progression.
- `src/app/layout.tsx` references `/opengraph-image.png`; metadata PRs should verify the public image exists and dimensions/alt text stay consistent.

## Verification to expect

- For code changes, prefer `npm run build` and `npx tsc --noEmit --incremental false`. `next lint` is not reliable for this Next 16 setup.
- If verification rewrites `next-env.d.ts` between `.next/dev/types` and `.next/types`, treat that as generated churn unless the PR intentionally changes Next typing behavior.
- For asset-generation changes, verify the exact script touched: `npm run process:assets`, `npm run process:death-assets`, `npm run process:combat-juice`, `npm run generate:powerups`, `npm run generate:combat-assets`, or direct `node`/`python3` invocation for tools without npm aliases.
- Build/runtime tests are optional for Markdown-only changes, but whitespace checks such as `git diff --check` should still pass.

## Managed Bugbot deployment boundary

This file provides repository-specific review guidance; it does not by itself prove the hosted Cursor Bugbot service is enabled. When asked to verify deployment, confirm the Cursor dashboard/org settings, GitHub App repository access, Admin API credentials if used, and a PR smoke trigger where available.

Manual GitHub PR triggers are top-level comments: `cursor review` or `bugbot run`. For diagnostics, use `cursor review verbose=true` or `bugbot run verbose=true` and inspect the returned request/log details.
