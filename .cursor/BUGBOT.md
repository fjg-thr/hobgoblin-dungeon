# Bugbot review guide

Use this guide when reviewing pull requests for Hobgoblin Ruin Prototype, a
Next.js/React/TypeScript app that embeds a Phaser dungeon scene.

## Service boundary

- This file only gives Cursor Bugbot repository-specific review context.
- Hosted Bugbot must still be enabled through Cursor dashboard settings, Cursor
  GitHub App repository access, or the Bugbot Admin API.
- After enabling the hosted service, smoke-check a pull request with a top-level
  comment: `cursor review` or `bugbot run`.
- For diagnostics, use `cursor review verbose=true` or
  `bugbot run verbose=true`.
- These instructions apply after this file is merged to the default branch; a PR
  that adds or edits `BUGBOT.md` may not be reviewed with the new guidance.

## Project shape

- Runtime game logic is concentrated in `src/game/scenes/DungeonScene.ts`.
- The React/Next boundary is `src/game/GameCanvas.tsx`, which dynamically
  imports Phaser client-side and destroys the game on unmount.
- Runtime asset paths come from `src/game/assets/manifest.ts`. The
  `public/assets/audio/audio-manifest.json` file is auxiliary and should not be
  treated as the source of truth for game audio loading.
- Dungeon generation and tile semantics live in `src/game/maps/startingDungeon.ts`.
- Asset and audio generation tools live under `tools/` and `scripts/`.

## Review priorities

1. Block runtime errors that prevent `npm run build` or `npx tsc --noEmit`.
2. Check Phaser scene changes for lifecycle leaks, orphaned timers/listeners,
   stale pooled objects, depth ordering bugs, and update-loop regressions.
3. Check gameplay changes against collision, spawn safety, pickups, ammo,
   health, scoring, power-up gating, game-over flow, and restart behavior.
4. Check asset changes keep manifest entries, metadata JSON, frame dimensions,
   animation rows, and public paths in sync.
5. Check audio changes against `assetManifest.audio`, preload keys, mute state,
   and browser-safe autoplay behavior.
6. For DOM/metadata/future HTML UI changes, prefer semantic elements and the
   existing `src/app/globals.css` patterns. This repo does not currently use
   Tailwind or shadcn/ui.

## Known baseline context

- README says `Space` or `J` fires, but current runtime firing is centered on
  `Space` plus pointer/click firing. Do not block unrelated PRs solely for this
  existing docs/runtime mismatch; do flag changes that make controls or docs
  drift worse.
- README documents regular ammo, hearts, quickshot, haste, ward, and blast.
  Current code also has seeker ammo/pickups/projectiles after progression
  thresholds. Treat seeker behavior as code-defined unless a PR edits docs or
  pickup/projectile behavior.
- README describes blast as late and rare, while `POWERUP_CONFIG` may unlock it
  earlier. Treat this as existing drift unless a PR intentionally changes blast
  progression or documentation.
- `src/app/layout.tsx` references `/opengraph-image.png`; if that asset is
  missing in the baseline, only block PRs that touch metadata/share image
  behavior or worsen the missing-asset state.
- `next lint` is not reliable for the current Next version in this repo.

## Verification to request

- For code changes: `npm run build` and `npx tsc --noEmit`.
- For dependency install validation: `npm ci` if lockfile or dependency metadata
  changed. Existing audit advisories should be reported but should not block
  unrelated PRs unless the PR adds or worsens them.
- For generated asset changes, request the exact generator or processor script
  that matches the touched files, such as `node tools/generate_audio_sfx.mjs`,
  `node scripts/generate-retro-soundtrack.mjs`, or the relevant processor under
  `tools/`.
- For gameplay changes, request a manual smoke test covering start screen,
  movement, Space firing, click firing, ammo pickup, enemy contact damage,
  power-up pickup, mute toggle, game over, restart, and viewport resize.

## Review style

- Lead with concrete bugs and cite file/line references.
- Separate shipped regressions from known baseline limitations.
- Avoid blocking on broad refactors, stylistic preferences, or generated asset
  churn unless they create a functional risk.
- Prefer small, actionable suggestions that preserve the current prototype
  architecture.
