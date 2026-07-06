# Cursor Bugbot Review Guide

Use this repository guide when reviewing pull requests for Hobgoblin Ruin Prototype. The app is a small Next.js shell around a Phaser 4 release-candidate game, with most gameplay logic in `src/game/scenes/DungeonScene.ts`.

## Review priorities

1. Protect runtime stability for the Phaser scene and its React host.
2. Catch asset manifest, generated asset, and metadata drift.
3. Preserve gameplay feel, controls, responsive canvas layout, and accessibility expectations.
4. Keep dependency, build, and type-safety changes mechanically verifiable.
5. Be explicit when a concern requires live Bugbot service configuration outside this repo.

## Service configuration boundary

This file provides repository-specific review instructions only. It does not by itself enable the managed Cursor Bugbot service. For deployment or smoke checks, verify these outside the repo when access is available:

- Cursor dashboard or organization settings have Bugbot enabled for `fjg-thr/hobgoblin-dungeon`.
- The Cursor GitHub App has access to this repository.
- Any Bugbot Admin API credentials or org-level settings are valid when used.
- A pull request can trigger a Bugbot review or check.

If those settings are not visible from the agent environment, say so clearly. Do not claim the managed service is enabled based only on this file. After this file is merged to the default branch, hosted Bugbot reviews should use these instructions; PRs that add or edit this file may not be reviewed with the new rules yet.

Manual diagnostic triggers can be requested from a top-level PR comment with either `cursor review` or `bugbot run`. For additional troubleshooting detail, use `cursor review verbose=true` or `bugbot run verbose=true`.

## Repository shape

- Next.js App Router files live under `src/app/`.
- The Phaser host component is `src/game/GameCanvas.tsx`.
- Main gameplay, scene setup, input, combat, UI overlays, spawning, and audio state are in `src/game/scenes/DungeonScene.ts`.
- Runtime asset loading is driven by `src/game/assets/manifest.ts`.
- Pixel art, spritesheets, metadata, audio, and share images live under `public/assets/` and `public/`.
- Asset generation and processing scripts live under `tools/` and `scripts/`.

Most behavior changes touch the large `DungeonScene.ts` file. Review those diffs carefully for lifecycle cleanup, ordering effects, and changes that accidentally couple unrelated gameplay systems.

## Next.js and React review rules

- `GameCanvas` must remain a client component. Browser-only APIs such as `window`, dynamic Phaser imports, and `Phaser.Game` construction should stay inside client-only code paths, usually `useEffect`.
- Review `useEffect` changes for idempotence under React Strict Mode. The existing `gameRef` and cancellation guard pattern prevents duplicate Phaser games and stale async imports.
- A cleanup path must destroy the Phaser game and clear refs when the React host unmounts.
- Next.js metadata changes in `src/app/layout.tsx` should keep `metadataBase`, Open Graph, Twitter card data, image dimensions, and alt text aligned with the actual public asset. The current share image path is `/opengraph-image.png`.
- Avoid adding custom CSS or new DOM structures for game UI unless the change is intentionally outside the canvas. DOM UI should use semantic elements and existing `src/app/globals.css` patterns.

## Phaser scene lifecycle and memory safety

For any changes to `DungeonScene.ts`, check for:

- Event listeners registered with `this.input`, `this.events`, keyboard objects, timers, tweens, animation callbacks, or global objects are removed or scoped to scene shutdown when needed.
- Pointer zones, containers, text, sprites, graphics, and arrays of game objects are destroyed or cleared when the scene resets, shuts down, or recreates UI.
- Tweens are killed before destroying their targets when a target may be removed early.
- Reused arrays such as enemies, projectiles, pickups, death sprites, combat juice objects, dungeon objects, labels, and blockers do not retain destroyed objects.
- Animation keys remain unique or are created in a way that will not conflict across scene restarts.
- Phaser 4 release-candidate APIs are checked against the currently installed version before adopting examples from older Phaser 3 code.

Be especially skeptical of changes that add long-lived callbacks, delayed calls, recursive timers, or event handlers inside frequently called methods.

## Gameplay correctness checks

Review changes for consistency with these current gameplay facts:

- Movement uses `WASD` and arrow keys.
- Runtime shooting is currently bound to `Space` plus pointer or click firing. The README also mentions `J`; for input or control-documentation PRs, flag mismatches between docs and runtime behavior, but do not block unrelated PRs solely for the existing mismatch.
- Mouse aim snaps shots to 15-degree angles.
- Goblins are seeded from dungeon enemy starts and additional goblins ramp with pressure. Do not describe all goblins as progression gated.
- Brutes unlock after kill or elapsed-time gates controlled by `BRUTE_UNLOCK_KILLS` and `BRUTE_UNLOCK_MS`.
- Standard ammo is finite, and seeker ammo/projectiles exist in code after progression thresholds even though README copy may not fully describe them.
- Power-up availability, weights, and presentation metadata are controlled by `POWERUP_CONFIG`; effect durations and detailed behavior live in nearby constants and collection logic.
- Blast uses a charge-ready flow rather than a timed buff like quickshot, haste, or ward.
- Heart pickups restore missing hearts without increasing maximum health.
- The start screen and how-to-play modal are Phaser-rendered and include compact and tiny viewport branches.

For gameplay diffs, look for off-by-one progression gates, inconsistent world-vs-tile coordinates, depth sorting regressions, projectile cleanup bugs, and collision checks that ignore chasm, bridge, prop, or wall edge cases.

## Asset and audio consistency

`src/game/assets/manifest.ts` is the runtime source of truth for loaded assets. When a PR changes assets, require consistency among:

- Manifest keys, paths, frame dimensions, row order, and metadata paths.
- Actual files under `public/assets/`.
- README asset lists when behavior or documented assets change.
- Generated JSON metadata for spritesheets.
- Any procedural generation or processing scripts used to create the asset.

Audio loaded at runtime comes from `assetManifest.audio`. `public/assets/audio/audio-manifest.json` can be useful as auxiliary consistency data, but it is not the runtime loading source.

Relevant asset tools include:

- `tools/process_assets.py`
- `tools/process_actor_death_assets.mjs`
- `tools/process_combat_juice_assets.mjs`
- `tools/process_pickup_intent_effect_assets.mjs`
- `tools/process_corporate_goblin_assets.py`
- `tools/process_spreadsheet_brute_assets.py`
- `tools/generate_audio_sfx.mjs`
- `scripts/generate-retro-soundtrack.mjs`

Generated image or audio changes should mention which script or prompt produced them and should not silently desynchronize source images, processed sheets, metadata JSON, and manifest entries.

## Canvas UI, controls, and accessibility

The playable UI is mostly canvas-rendered Phaser content, so standard DOM accessibility checks are not enough. For UI or control changes, review:

- Keyboard and pointer affordances both work where intended.
- Hit zones match visible buttons or modal controls at desktop and compact viewport sizes.
- Text remains readable over the game background and stays within the viewport.
- The start screen, how-to-play modal, mute toggle, HUD, game-over panel, and debug overlay remain positioned across resize events.
- Control copy matches actual bindings.
- Canvas-only controls have an acceptable fallback or are intentionally scoped to this prototype.

If future DOM UI is added, apply normal semantic HTML, focus, keyboard, ARIA, and contrast checks as well.

## Dependency and build review

- This repo tracks both `package-lock.json` and `pnpm-lock.yaml`. Dependency PRs should intentionally keep the relevant lockfiles synchronized or explain why one is untouched.
- Phaser is pinned to `4.0.0-rc.4`; treat Phaser upgrades as behavior-risky and review migration notes carefully.
- Next, React, TypeScript, and type packages use `latest`; lockfile diffs can be large and should be tied to a clear dependency update.
- Keep dependency hardening separate from gameplay or Bugbot guidance changes unless the PR explicitly scopes both.

Known local verification notes:

- `npm run lint` currently maps to `next lint`, which is not a reliable gate for current Next versions.
- Prefer `npm run build` plus `npx tsc --noEmit --incremental false` for source changes.
- `npm run build` can rewrite `next-env.d.ts`; restore it unless the PR intentionally changes generated Next typing behavior.
- Plain `npx tsc --noEmit` can create `tsconfig.tsbuildinfo` because incremental mode is enabled; prefer `--incremental false`.

For documentation-only or Bugbot-guidance-only PRs, at minimum check Markdown formatting, ASCII/trailing newline conventions, and that no unrelated files changed.

## High-signal review comments

Make review comments specific and actionable. Prefer this pattern:

- What changed.
- Why it is risky in this repo.
- The exact file, line, or behavior to verify.
- A suggested fix or targeted test command.

Avoid broad comments such as "add tests" without naming the behavior and the available verification path. This repo does not currently have a dedicated automated test harness, so suggest realistic checks such as build, TypeScript, focused manual smoke checks, or asset consistency inspection.

## Suggested smoke checks for relevant PRs

Use the smallest set that matches the change:

- `npm run build`
- `npx tsc --noEmit --incremental false`
- Open the game locally and verify movement, Space firing, pointer/click firing, enemy damage, ammo pickups, one power-up, mute toggle, game over, and restart.
- For asset changes, confirm referenced files exist and load without missing texture or missing audio errors.
- For responsive UI changes, check desktop, compact, and tiny viewport layouts.
- For metadata or share-image changes, confirm `public/opengraph-image.png` exists and matches the metadata dimensions and alt text intent.
