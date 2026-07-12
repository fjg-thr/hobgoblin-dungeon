# Cursor Bugbot Review Guidance

This repository contains a Next.js App Router shell around a Phaser dungeon game prototype. Use this file as repository-specific context when reviewing pull requests.

## Deployment boundary

- This file provides review instructions only. Hosted Cursor Bugbot still has to be enabled through Cursor dashboard or organization settings, with the Cursor GitHub App granted access to `fjg-thr/hobgoblin-dungeon`.
- If a PR claims to "deploy Bugbot" using only repository files, flag that managed service configuration, Admin API/service configuration, GitHub App access, and optional branch-protection status checks must be verified outside the repo.
- After this file is merged to the default branch, a smoke check can be triggered on a PR with a top-level `cursor review` or `bugbot run` comment. Use `cursor review verbose=true` or `bugbot run verbose=true` only for diagnostics that need request IDs or extra service logs.

## Project shape

- Framework: Next.js with React and TypeScript in `src/app`.
- Game runtime: Phaser scene code in `src/game`, especially `src/game/scenes/DungeonScene.ts`.
- Runtime asset source of truth: `src/game/assets/manifest.ts`.
- Public assets: sprite sheets, metadata JSON, tiles, UI art, and audio under `public/assets`.
- Asset-generation helpers live in `tools/` and `scripts/`.

## General review priorities

- Prefer small, focused changes. `DungeonScene.ts` is large, so scrutinize edits for accidental coupling, duplicated state updates, or logic that should be extracted only when the extraction clearly reduces risk.
- Preserve TypeScript strictness and explicit runtime types. Avoid broad `any`, unsafe casts, and untyped Phaser object bags unless the underlying API leaves no practical alternative.
- Keep browser-only code inside client components or Phaser scene modules. Server-rendered Next files must not touch `window`, `document`, Phaser globals, or browser input APIs at module scope.
- Check cleanup paths for timers, event listeners, Phaser input handlers, sound objects, tweens, and game objects. New listeners should be removed on scene shutdown, restart, or React unmount as appropriate.
- Do not introduce secrets, API keys, generated caches, or environment-specific files. `.env*`, `.next`, and dependency folders should stay out of git.

## Next.js and React

- `src/game/GameCanvas.tsx` dynamically imports Phaser and destroys the game on unmount. Changes should preserve the single-game guard, cancellation guard, full-viewport resize behavior, and cleanup call.
- `src/app/layout.tsx` owns metadata and references `/opengraph-image.png`. If metadata, title, description, or share-image behavior changes, verify the referenced asset exists in the deployed app or update the metadata, dimensions, and alt text accordingly.
- Styling currently uses plain CSS in `src/app/globals.css`, not Tailwind. Review DOM UI changes against existing CSS conventions and semantic HTML/accessibility requirements.

## Phaser gameplay and input

- Runtime movement uses WASD and arrow keys. Runtime firing is currently bound to `SPACE` and pointer/click firing; README also mentions `J`, so only block on that mismatch when a PR changes controls, docs, or input behavior.
- Pointer aiming should keep the 15-degree snap behavior and should not break click-to-fire.
- Start screen, how-to-play modal, mute button, and game-over UI are Phaser-rendered canvas UI. Review pointer hit zones, close/restart behavior, compact viewport layout branches, and control-copy consistency.
- Enemy spawn behavior is mixed: initial goblins come from `dungeon.enemyStarts`, additional goblins ramp with target enemy count, and brutes unlock through `BRUTE_UNLOCK_KILLS` or `BRUTE_UNLOCK_MS`.
- Power-ups are configured through `POWERUP_CONFIG`, while effect durations and behavior live in constants and collection logic nearby. Review both when a PR changes quickshot, haste, ward, blast, pickup text, weights, or unlock gates.
- Seeker ammo is code-defined behavior with unlock thresholds, pickups, and seeker projectiles. README does not currently document it; do not treat that existing docs gap as a blocker for unrelated PRs.
- Collision and projectile changes should be checked against tile coordinates, actor radii, wall blocking, projectile max distance, hit-stop, knockback, and debug overlay output.

## Assets and audio

- For new or renamed runtime assets, update `src/game/assets/manifest.ts` and confirm the referenced files exist under `public/assets`.
- Keep sprite-sheet frame dimensions, JSON metadata, animation row indexes, and Phaser load keys in sync.
- `public/assets/audio/audio-manifest.json` is auxiliary. Runtime audio loading uses `assetManifest.audio`; audio PRs should keep both in sync when both are touched.
- Relevant asset scripts include:
  - `python3 tools/process_assets.py`
  - `python3 tools/process_corporate_goblin_assets.py`
  - `python3 tools/process_spreadsheet_brute_assets.py`
  - `node tools/process_actor_death_assets.mjs`
  - `node tools/process_combat_juice_assets.mjs`
  - `node tools/generate_audio_sfx.mjs`
  - `node scripts/generate-retro-soundtrack.mjs`
- Binary asset updates should be intentional. Review generated images and audio for path churn, excessive size, and missing source or processing notes.

## Validation guidance

- Prefer `npm ci` before validation when dependencies are not already installed. Existing audit findings may be reported by npm; do not require unrelated dependency hardening unless the PR changes dependencies.
- For source changes, require:
  - `npm run build`
  - `npx tsc --noEmit --incremental false`
- `next lint` is not a reliable gate for this Next version even though `npm run lint` exists. Do not block solely because `next lint` is unavailable unless the PR is explicitly about lint tooling.
- `npm run build` can rewrite `next-env.d.ts`; that generated churn should be reverted unless the PR intentionally changes Next typing behavior.
- Plain `npx tsc --noEmit` may create `tsconfig.tsbuildinfo` because incremental compilation is enabled. Prefer `--incremental false` and remove generated artifacts if they appear.

## Review output expectations

- Prioritize concrete bugs, regressions, missing cleanup, broken assets, viewport/input failures, and validation gaps.
- Include exact file and line references for findings.
- Distinguish shipped behavior from known existing limitations documented in README.
- Avoid broad style nits unless they materially affect maintainability, accessibility, game feel, or review confidence.
