# Cursor Bugbot Review Guide

Use this repository-specific guidance when Cursor Bugbot reviews pull requests for the Hobgoblin Ruin prototype.

## Repository profile

- App: Next.js App Router, React, TypeScript, and Phaser 4 web game prototype.
- Runtime entry points:
  - `src/app/page.tsx` renders the game shell.
  - `src/game/GameCanvas.tsx` dynamically imports Phaser and owns `Phaser.Game` creation/destruction.
  - `src/game/scenes/DungeonScene.ts` contains most gameplay state, scene lifecycle, input, combat, pickups, UI, and audio behavior.
  - `src/game/assets/manifest.ts` is the runtime source of truth for assets loaded by Phaser.
  - `src/game/maps/startingDungeon.ts` owns dungeon generation, tile codes, collision helpers, and prop definitions.
- Static assets live under `public/assets/**`. Generator/processor tooling lives under both `tools/` and `scripts/`.
- Styling uses semantic class names in `src/app/globals.css`. This repo does not currently configure Tailwind, ShadCN, or Radix; do not ask for those patterns unless a PR intentionally introduces them.

## Managed Bugbot enablement

This file supplies review context only. It cannot prove that the hosted Cursor Bugbot service is enabled.

To verify managed deployment, check the external controls that are not represented in this repo:

1. Cursor dashboard or organization settings have Bugbot enabled for this repository.
2. The Cursor GitHub App has access to `fjg-thr/hobgoblin-dungeon`.
3. A live pull request receives a Bugbot review automatically, or a top-level PR comment of `cursor review` / `bugbot run` triggers one.
4. If a review does not appear, retry with `cursor review verbose=true` or `bugbot run verbose=true` and inspect the diagnostic response.

When an agent lacks dashboard or GitHub App access, state that repo-side guidance was deployed but managed service enablement remains externally verifiable only.

## Review priorities

### Next.js and React boundaries

- Preserve the `"use client"` boundary for code that touches `window`, Phaser, DOM APIs, input devices, audio, or canvas rendering.
- Keep Phaser imports in client-only modules or dynamic imports. Do not introduce server-side imports of `phaser`.
- In `GameCanvas`, verify effects clean up `Phaser.Game` instances and handle async imports without creating duplicate games during React remounts.
- Review metadata changes in `src/app/layout.tsx` for valid absolute/relative URLs and existing assets. The current metadata references `/opengraph-image.png`; PRs touching metadata or public assets should keep that contract valid.

### Phaser scene lifecycle and input

- Look for event/timer/listener leaks in `DungeonScene`: keyboard handlers, pointer handlers, tweens, timers, audio events, pooled objects, and scene shutdown/reset paths should be cleaned up or safely reused.
- Check that restart, game-over, mute, and start-screen flows reset gameplay state without leaving stale sprites, loops, collisions, or queued input.
- Input behavior should match the intended controls. Current runtime shooting is bound to `SPACE` and pointer/click firing; the README also mentions `J`, which is an existing docs/code mismatch. Do not block unrelated PRs solely for that mismatch, but flag PRs that touch controls or documentation without resolving or preserving it.

### Gameplay correctness

- Validate changes to tile/world coordinate conversion, depth sorting, collision boxes, enemy pathing, projectile hitboxes, pickup collection radii, and camera behavior with actual gameplay reasoning.
- Prefer deterministic or bounded state transitions for difficulty ramping, enemy spawns, power-up unlocks, ammo drops, and health restoration.
- Current code includes seeker ammo/projectiles unlocked after 4 kills or 30 seconds. The README does not document seeker ammo; treat that as an existing documentation gap unless a PR changes ammo behavior or docs.
- Current README calls blast a rare late-game power-up, while `POWERUP_CONFIG.blast` unlocks after 2 kills or 16 seconds. Treat that as an existing mismatch unless a PR changes blast tuning or docs.
- For combat changes, check standard and seeker projectiles, blast-charged shots, enemy knockback, hit-stop, score updates, and death effects together.

### Asset and audio contracts

- `src/game/assets/manifest.ts` is what the game loads at runtime. Any new runtime asset must be registered there and present under `public/assets/**`.
- Keep sprite-sheet frame dimensions, row ordering, `framesPerRow`, animation frame ranges, and metadata JSON in sync with generated images.
- If tooling under `tools/` or `scripts/` changes generated assets, review the generated PNG/JSON/audio outputs as part of the same PR when possible.
- `public/assets/audio/audio-manifest.json` is auxiliary; runtime audio loading comes from `assetManifest.audio`.

### TypeScript, performance, and maintainability

- Keep TypeScript strict-friendly. Prefer precise local types over `any`, especially in Phaser event payloads, asset keys, actor state, and configuration maps.
- Avoid unnecessary React state for hot game-loop values. Phaser scene state should stay inside the scene unless the UI genuinely needs React integration.
- Watch for allocations in `update()` and other hot paths: avoid avoidable object churn, large array scans, unbounded tween creation, or expensive path recalculation per frame.
- Preserve readable names and local invariants. This prototype is small enough that targeted fixes are better than broad architecture churn.

## Verification guidance

For normal code or asset-manifest changes, expect at least:

```bash
npm ci
npm run build
npx tsc --noEmit
```

Use `git diff --check "$(git merge-base HEAD origin/main)"..HEAD` for whitespace/conflict-marker checks on PR branches.

Notes:

- `npm run lint` currently maps to `next lint`, which is not reliable with the installed Next 16 toolchain. Prefer build plus `npx tsc --noEmit` unless a PR intentionally fixes lint tooling.
- Build/typecheck can rewrite `next-env.d.ts` and create `tsconfig.tsbuildinfo`; these should not remain as unrelated changes.
- There is no `npm start` script in this package. Do not require one unless a PR adds runtime smoke infrastructure.
- Existing `npm ci` audit output may report vulnerabilities. Flag dependency-security changes when a PR touches dependencies, but do not block unrelated PRs solely for pre-existing audit findings.

## Review output expectations

- Prioritize bugs, regressions, security/privacy issues, lifecycle leaks, broken assets, and missing verification.
- Ground findings in file and line references and explain the user-visible or runtime impact.
- Separate pre-existing repository limitations from regressions introduced by the PR.
- If no blocking issues are found, say so and mention any verification gaps or external managed-Bugbot checks that remain.
