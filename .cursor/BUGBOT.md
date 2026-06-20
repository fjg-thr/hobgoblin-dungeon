# Cursor Bugbot review guide

Use this file as repository-specific context when reviewing pull requests for the Hobgoblin Ruin prototype.

## Managed Bugbot deployment

- Cursor Bugbot itself is a managed Cursor/GitHub App service. Repository files can provide review guidance, but they cannot prove that the service is enabled.
- Confirm managed enablement outside this repository when possible:
  - Cursor dashboard or org settings have Bugbot enabled for `fjg-thr/hobgoblin-dungeon`.
  - The Cursor GitHub App has access to this repository.
  - A PR smoke review produces Bugbot comments and the `Cursor Bugbot` status check.
- These instructions apply after this file is merged to the default branch. PRs that add or change this file may not be reviewed with the updated guidance yet.
- Manual PR review triggers supported by Cursor include top-level comments such as `cursor review` or `bugbot run`. For troubleshooting, use `cursor review verbose=true` or `bugbot run verbose=true`.

## Project map

- App shell: Next.js App Router, React, TypeScript.
- Game runtime: Phaser 4, loaded client-side from `src/game/GameCanvas.tsx`.
- Main gameplay scene: `src/game/scenes/DungeonScene.ts`.
- Map generation and tile semantics: `src/game/maps/startingDungeon.ts`.
- Runtime asset source of truth: `src/game/assets/manifest.ts`.
- Public assets: `public/assets/**`.
- Asset generation and processing tools: `tools/**` and `scripts/**`.
- Global page styling: `src/app/globals.css`. This repo does not currently use Tailwind.

## Review priorities

### Next.js and React shell

- Preserve `"use client"` boundaries for Phaser code. Browser-only APIs such as `window`, dynamic Phaser imports, and canvas setup should stay inside client components or effects.
- Check `GameCanvas` boot and teardown carefully:
  - Avoid creating more than one `Phaser.Game` instance per mounted host.
  - Destroy the game on unmount and clear refs.
  - Keep async imports guarded against unmount races.
- Watch metadata, layout, and route changes for regressions in the simple full-screen game page.

### Phaser lifecycle and input

- Confirm event listeners, timers, tweens, sounds, physics/collision state, and interactive zones are cleaned up or owned by the scene lifecycle.
- Review pointer and keyboard changes for duplicate bindings, lost controls after restart, and stale references when the scene restarts.
- Canvas UI should remain usable with mouse and keyboard where applicable. For future DOM UI, expect semantic elements and accessibility attributes; for Phaser-only UI, focus on clear pointer zones, keyboard affordances, responsive placement, and visible state.

### Gameplay, map, and collision behavior

- Treat gameplay constants, spawning, power-up unlocks, projectile behavior, collision checks, and score/life/ammo state as tightly coupled. A change in one area often needs a smoke check in the others.
- Review map tile changes against `startingDungeon.ts` helpers such as blocking, tile codes, low-wall variants, bridge/chasm handling, prop placement, and camera bounds.
- For `DungeonScene.ts`, prefer small, localized changes. It is a large file, so watch for duplicated state transitions, new per-frame allocations, or logic that bypasses existing helper methods.
- Existing README/code mismatches should not block unrelated PRs:
  - README says `Space` or `J` fires, but current runtime shooting is `Space` plus pointer/click firing.
  - README does not document seeker ammo, while current code unlocks seeker ammo after progression.
  - README describes blast as late and rare, while current code unlocks blast earlier via `POWERUP_CONFIG.blast`.
  Flag these only when a PR touches controls, docs, ammo, power-ups, or related UX.

### Assets and generated files

- `src/game/assets/manifest.ts` is the runtime source of truth for loaded assets. Verify keys, paths, frame dimensions, metadata paths, and type unions when assets change.
- `public/assets/audio/audio-manifest.json` may be useful for consistency checks, but runtime audio loading comes from `assetManifest.audio`.
- Asset PRs should include generated sprites/audio/metadata only when intentionally changed. Watch for missing public files, renamed keys without manifest updates, or frame dimensions that no longer match Phaser animation code.
- Generated or local build artifacts should not be committed unless deliberately part of the change. In particular, keep `.next/`, `tsconfig.tsbuildinfo`, and incidental `next-env.d.ts` rewrites out of unrelated PRs.

### Dependencies and tooling

- Keep dependency and lockfile changes scoped. If `package.json` changes, confirm the matching lockfile changes are intentional.
- This repo currently has baseline `npm ci` audit findings; do not block unrelated PRs solely on existing advisories unless the PR changes dependencies or security posture.
- `npm run lint` maps to `next lint`, which is not reliable for the current Next version. Prefer build and TypeScript checks for ordinary review verification.

## Suggested verification

Ask authors to run the smallest useful subset for the change:

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

- Start the app with `npm run dev` and open `http://localhost:3000`.
- Start a run, move with WASD or arrows, aim with the mouse, fire with `Space` and click, collect ammo/power-ups/hearts, toggle sound, restart after game over, and toggle the debug overlay with `F3`.
- Exercise any touched feature path specifically, including scene restart if the change affects state cleanup.

## Review output expectations

- Lead with concrete correctness, regression, security, accessibility, or test/verification gaps.
- Reference exact files and lines when possible.
- Distinguish new regressions from known baseline limitations.
- Avoid broad refactor requests unless they directly reduce risk in the touched code path.
- If managed Bugbot enablement cannot be verified from available evidence, state that limitation separately from code-review findings.
