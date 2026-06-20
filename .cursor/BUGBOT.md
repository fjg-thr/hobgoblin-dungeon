# Cursor Bugbot Review Guide

Use these repository-specific rules when reviewing pull requests for Hobgoblin Ruin, a Next.js App Router / React / TypeScript prototype that hosts a Phaser 4 canvas game.

## Deployment and trigger context

- This file provides project-local review instructions for Cursor Bugbot. It does not, by itself, enable the hosted Bugbot service.
- Hosted enablement must be verified outside the repository: confirm the Cursor GitHub integration or GitHub App has access to this repository, Bugbot is enabled for the repo in the Cursor dashboard or Admin API, and repository/team rules are configured as intended.
- Manual PR review triggers should be top-level PR comments using `cursor review` or `bugbot run`. For verbose troubleshooting, use `cursor review verbose=true` or `bugbot run verbose=true`.
- Treat PRs that add or edit this file as configuration changes. The new rules may not be applied to the same PR until they land on the default branch or Bugbot is rerun after merge.

## Project map

- `src/app/layout.tsx`, `src/app/page.tsx`, and `src/app/globals.css` define the small Next.js shell around the game canvas.
- `src/game/GameCanvas.tsx` mounts and tears down the Phaser game. Review React lifecycle and client-only behavior carefully when this file changes.
- `src/game/scenes/DungeonScene.ts` contains most runtime gameplay: player input, combat, enemies, pickups, power-ups, UI overlays, audio, and debug rendering.
- `src/game/maps/startingDungeon.ts` owns procedural map data, tile codes, collision decisions, and prop definitions.
- `src/game/assets/manifest.ts` is the runtime asset source of truth. `public/assets/audio/audio-manifest.json` is auxiliary and should not be treated as the loader source unless code is changed to use it.
- `tools/` and `scripts/` contain local asset/audio generator and processing utilities. Review generated-asset updates together with their metadata and source manifests.

## Review priorities

1. **Game-breaking runtime regressions**
   - Phaser APIs must run only in browser/client paths.
   - Scene setup and teardown should not leak timers, tweens, input handlers, DOM/canvas objects, sounds, or pooled sprites across restarts.
   - Large `DungeonScene.ts` edits should preserve early returns for game-over, paused, dying, unstarted, and missing-object states.

2. **Gameplay invariants**
   - Movement must stay tile/collision aware: use `collides`, tile/world conversion helpers, and established radius constants.
   - Combat should keep ammo consumption, seeker ammo priority, cooldowns, hit stop, knockback, projectile cleanup, and score updates consistent.
   - Enemy and pickup spawning should respect safe-distance, active-count, unlock, and difficulty-pressure limits.
   - Power-up changes should update `assetManifest.powerUps.types`, `POWERUP_CONFIG`, animations, pickup handling, HUD/how-to-play text, and smoke-test expectations together.

3. **Asset integrity**
   - Every new runtime asset path in `assetManifest` should have the matching file under `public/assets`.
   - Sprite-sheet frame sizes, frames-per-row metadata, animation row indexes, and JSON metadata should stay aligned.
   - Audio additions should update `assetManifest.audio` and loading/playback code. Keep generated audio notes in sync when `public/assets/audio/audio-manifest.json` or `scripts/generate-retro-soundtrack.mjs` changes.
   - Do not require external network access or paid generation services for normal app build/runtime paths.

4. **Next.js and React shell**
   - Keep `GameCanvas` client-side and avoid server references to `window`, `document`, Phaser, or canvas APIs.
   - Preserve semantic page structure and the existing CSS patterns in `src/app/globals.css`. This repo does not currently configure Tailwind.
   - Metadata/OpenGraph changes should ensure referenced public assets exist and have the declared dimensions or fallbacks.

5. **Accessibility and input UX**
   - DOM UI should use semantic elements, keyboard support, focus states, and clear labels.
   - Phaser canvas overlays cannot provide full DOM accessibility; still review pointer zones, keyboard alternatives, hover/click affordances, responsive placement, and clear in-game instructions.
   - Start/how-to-play/game-over/restart flows should remain usable with the documented keyboard and pointer controls.

## Known repository baseline context

Do not block unrelated PRs solely for these existing conditions. Flag them when a PR touches the relevant surface or claims to fix them.

- README says `Space` or `J` fires, while current runtime shooting is bound to `SPACE` plus pointer/click firing.
- README documents regular ammo, hearts, quickshot, haste, ward, and blast. Current code also has seeker ammo/projectiles that unlock after 4 kills or 30 seconds.
- README describes blast as rare late-game, but current `POWERUP_CONFIG.blast` unlocks after 2 kills or 16 seconds.
- `src/app/layout.tsx` references `/opengraph-image.png`; the repository currently has no matching `opengraph-image.*` file.
- Current dependency baseline can report npm audit findings for Next.js/PostCSS. Do not block unrelated PRs solely on those existing advisories unless the PR changes dependencies, lockfiles, build tooling, or claims security hardening.

## Suggested verification for PRs

Prefer focused verification that matches the changed surface:

- Dependency/install changes: `npm ci`
- General app/runtime changes: `npm run build`
- Type-level or TypeScript changes: `npx tsc --noEmit`
- Whitespace/patch sanity: `git diff --check`
- Gameplay-affecting changes: run the app and smoke-test start, movement, aiming, firing, ammo pickup, heart pickup, enemy contact, power-ups, game over, restart, mute toggle, and debug overlay when feasible.

Build and typecheck may rewrite generated files such as `next-env.d.ts` or create `tsconfig.tsbuildinfo`; avoid committing those artifacts unless the PR intentionally changes generated typing behavior.
