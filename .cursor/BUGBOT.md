# Cursor Bugbot review guide

Repository-specific review context for the Hobgoblin Ruin prototype.

## Managed Bugbot deployment

- Cursor Bugbot is a managed Cursor/GitHub App service. This file provides review guidance but cannot prove the service is enabled.
- Verify managed enablement outside git when possible:
  - Cursor dashboard or org settings have Bugbot enabled for `fjg-thr/hobgoblin-dungeon`.
  - The Cursor GitHub App has access to this repository.
  - A PR smoke review produces Bugbot comments or a `Cursor Bugbot` status check.
- These instructions apply after merging to the default branch; the PR that changes this file may not use the new guidance yet.
- Manual top-level PR triggers include `cursor review` and `bugbot run`; verbose forms include `cursor review verbose=true` and `bugbot run verbose=true`.

## Project map

- App shell: Next.js App Router, React, TypeScript.
- Phaser 4 runtime bootstraps in `src/game/GameCanvas.tsx`; main gameplay lives in `src/game/scenes/DungeonScene.ts`.
- Map generation/tile semantics: `src/game/maps/startingDungeon.ts`.
- Runtime asset source of truth: `src/game/assets/manifest.ts`; public assets live under `public/assets/**`.
- Asset tooling lives under `tools/**` and `scripts/**`.
- Global page styling is `src/app/globals.css`; this repo does not currently use Tailwind.

## Review priorities

- Preserve `"use client"` boundaries for Phaser code. Keep `window`, dynamic Phaser imports, and canvas setup inside client components/effects.
- Check `GameCanvas` boot/teardown for duplicate `Phaser.Game` instances, unmount cleanup, cleared refs, and guarded async imports.
- Phaser changes should keep event listeners, timers, tweens, sounds, physics/collision state, and interactive zones owned by the scene lifecycle.
- Review pointer/keyboard changes for duplicate bindings, lost controls after restart, and stale references.
- Canvas UI should remain usable with mouse and keyboard. For DOM UI, expect semantic elements and accessibility attributes; for Phaser UI, focus on clear pointer zones, keyboard affordances, responsive placement, and visible state.
- Gameplay constants, spawning, power-up unlocks, projectiles, collision, score, life, and ammo are tightly coupled; changes often need smoke checks across those systems.
- Review map tile changes against `startingDungeon.ts` helpers for blocking, tile codes, low walls, bridge/chasm handling, props, and camera bounds.
- In large `DungeonScene.ts` changes, watch for duplicated state transitions, per-frame allocations, and logic bypassing existing helpers.
- `assetManifest` keys, paths, frame dimensions, metadata paths, and type unions must match changed public assets. `public/assets/audio/audio-manifest.json` is consistency-only; runtime audio loading comes from `assetManifest.audio`.
- Generated/local artifacts should stay out of unrelated PRs, especially `.next/`, `tsconfig.tsbuildinfo`, and incidental `next-env.d.ts` rewrites.
- Keep dependency and lockfile changes scoped. Baseline `npm ci` audit findings should not block unrelated PRs unless dependencies or security posture change.
- `npm run lint` maps to `next lint`, which is unreliable for this Next version; prefer build and TypeScript checks.

Known README/code mismatches should not block unrelated PRs: README says `Space` or `J` fires, but runtime firing is `Space` plus pointer/click; README omits seeker ammo; README calls blast late/rare while code unlocks it earlier. Flag these only for controls, docs, ammo, power-up, or related UX changes.

## Suggested verification

Ask authors to run the smallest useful subset:

```bash
npm ci
npm run build
npx tsc --noEmit
git diff --check
```

For asset pipeline changes, also run the exact affected script, for example:

```bash
npm run process:assets
npm run process:death-assets
npm run process:combat-juice
npm run generate:powerups
npm run generate:combat-assets
```

For gameplay changes, request a browser smoke check:

- `npm run dev`, open `http://localhost:3000`, start a run.
- Move with WASD/arrows, aim with mouse, fire with `Space` and click, collect ammo/power-ups/hearts, toggle sound, restart after game over, and toggle `F3`.
- Exercise touched feature paths, including scene restart when state cleanup is involved.

## Review output expectations

- Lead with concrete correctness, regression, security, accessibility, or verification gaps.
- Reference exact files/lines when possible and separate new regressions from known baseline limitations.
- Avoid broad refactor requests unless they directly reduce risk in the touched path.
- If managed Bugbot enablement cannot be verified, state that limitation separately from code-review findings.
