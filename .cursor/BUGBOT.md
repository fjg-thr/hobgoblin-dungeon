# Cursor Bugbot Review Guide

This file gives Cursor Bugbot repository-specific review guidance after it is merged to the default branch. It does not enable the hosted Bugbot service by itself. Confirm deployment through Cursor dashboard/org settings, GitHub App repository access, the Bugbot Admin API, or a live PR smoke review when those controls are available.

Manual PR triggers, when the service is installed:

- Add a top-level PR comment: `cursor review`
- Equivalent trigger: `bugbot run`
- For diagnostics, request verbose logs/request IDs with `cursor review verbose=true` or `bugbot run verbose=true`

## Project context

- Next.js App Router, React, TypeScript, and Phaser 4 power a browser-only dungeon prototype.
- `src/app/page.tsx` renders `GameCanvas`; `src/game/GameCanvas.tsx` dynamically imports Phaser and `DungeonScene` inside `useEffect`.
- Most gameplay behavior lives in `src/game/scenes/DungeonScene.ts`; map data is in `src/game/maps/startingDungeon.ts`; runtime asset paths are in `src/game/assets/manifest.ts`.
- Styling is plain CSS in `src/app/globals.css`; Tailwind and Shadcn are not configured in this repo.

## Review priorities

1. Preserve client/server boundaries. Do not allow Phaser, `window`, `document`, or browser-only audio/input code to run in server components, metadata, or module scope that Next can execute on the server. `GameCanvas` should keep lazy imports, avoid duplicate `Phaser.Game` instances, and destroy the game on unmount.
2. For `DungeonScene.ts`, review gameplay invariants carefully: tile/world conversions, collision checks, enemy pathing, respawn timing, hit stop, invulnerability windows, health, ammo caps, seeker ammo, projectile lifetime, power-up duration, blast damage radius, HUD state, camera resize behavior, and cleanup of tweens/events/timers.
3. Asset changes must keep `assetManifest` paths, sprite dimensions, animation frame ranges, and public files in sync. Runtime audio loads from `assetManifest.audio`; `public/assets/audio/audio-manifest.json` is auxiliary consistency data, not the scene's source of truth.
4. For asset tooling changes, verify the intended generator/processor script explicitly, for example `tools/process_assets.py`, `tools/process_combat_juice_assets.mjs`, `tools/process_actor_death_assets.mjs`, `tools/process_pickup_intent_effect_assets.mjs`, `tools/generate_audio_sfx.mjs`, or `scripts/generate-retro-soundtrack.mjs`.
5. UI and accessibility review should account for canvas limitations. DOM-level changes should use semantic HTML and existing CSS patterns; Phaser overlay changes should verify pointer zones, keyboard/mouse affordances, text contrast, responsive placement, and that controls remain usable at different viewport sizes.
6. Metadata and share-card changes must keep `src/app/layout.tsx` and public assets aligned. The current baseline references `/opengraph-image.png`; if the image is absent, flag PRs that touch metadata/share image behavior or make the mismatch worse, but do not block unrelated gameplay PRs solely for this baseline.
7. Dependency and tooling changes should be reviewed separately from gameplay work. This repo currently has baseline `npm ci` audit advisories; do not block unrelated PRs solely for pre-existing advisories, but flag new package, lockfile, or Next/Phaser upgrade risk.

## Known baseline notes

- README says `Space` or `J` fires; current code path clearly supports pointer/click firing and `Space`. Treat the `J` mismatch as existing unless a PR edits controls or input docs.
- README documents regular ammo, heart pickups, quickshot, haste, ward, and blast. Current code also unlocks seeker ammo after kill/time thresholds. Treat seeker ammo as code-defined behavior and ask for docs only when a PR changes gameplay docs or seeker behavior.
- README describes blast as a rare late-game power-up, while current `POWERUP_CONFIG` unlocks blast earlier. Treat this as an existing docs/code mismatch unless a PR intends to fix or changes blast timing.
- `next lint` is not reliable with the current Next version in this repo. Prefer build and typecheck evidence.

## Suggested verification

For most code PRs, ask authors to provide:

```bash
npm ci
npm run build
npx tsc --noEmit
git diff --check origin/main...HEAD
```

For asset-heavy PRs, also ask for the specific generator/processor command used and confirm referenced files exist under `public/assets`.

## Review style

- Lead with concrete correctness, regression, and missing-test risks tied to changed lines.
- Prefer targeted findings over broad architectural rewrites; this is a compact prototype.
- Separate existing baseline limitations from regressions introduced by the PR.
- When a change affects gameplay feel, request a short manual smoke test covering movement, click/Space firing, ammo pickup, at least one power-up, mute toggle, resize, and game-over restart.
