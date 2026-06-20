# Cursor Bugbot review guide

Use this guide when Bugbot reviews pull requests for Hobgoblin Ruin.

## Activation and scope

- Managed Bugbot enablement is external to this repository. Confirm Cursor dashboard/org settings, GitHub App access for `fjg-thr/hobgoblin-dungeon`, and a live PR smoke review when those controls are available.
- This file only supplies repo-specific review context after it is merged to the default branch. PRs that add or edit this file may not be reviewed with the new instructions yet.
- Manual PR smoke triggers can be posted as a top-level PR comment: `cursor review` or `bugbot run`. For more diagnostics use `cursor review verbose=true` or `bugbot run verbose=true`.
- If the managed service cannot be inspected from the agent environment, report that repository guidance is present but service enablement still needs dashboard/GitHub App verification.

## Project map

- Next.js app shell: `src/app/page.tsx`, `src/app/layout.tsx`, `src/app/globals.css`.
- Client-only Phaser bootstrapping: `src/game/GameCanvas.tsx`.
- Main gameplay scene: `src/game/scenes/DungeonScene.ts`.
- Dungeon generation and tile semantics: `src/game/maps/startingDungeon.ts`.
- Runtime asset source of truth: `src/game/assets/manifest.ts`.
- Static assets: `public/assets/**`.
- Asset and audio tooling: `tools/*.py`, `tools/*.mjs`, and `scripts/*.mjs`.

## Review priorities

- Guard the React/Phaser boundary. `GameCanvas` must stay client-only, dynamically import Phaser, avoid SSR-only browser access outside effects, create one `Phaser.Game`, and destroy it on unmount.
- Treat `DungeonScene.ts` as stateful gameplay code. Review lifecycle ordering, scene restart cleanup, keyboard/pointer handlers, pooled objects, timers, audio state, and mutation of arrays while iterating.
- Validate collision, spawn, pickup, projectile, seeker-ammo, power-up, and scoring changes against tile/world coordinate conversions and camera scaling.
- Keep `assetManifest` synchronized with every runtime asset load. Check metadata frame sizes, keys, animation rows, audio keys, and public paths when assets or generators change.
- Generated asset outputs should be intentional. Do not accept accidental churn from local generators, image/audio tools, `.next`, or TypeScript incremental artifacts.
- Review Phaser canvas UI separately from DOM accessibility. For canvas overlays, check pointer hit zones, keyboard/mouse affordances, responsive placement, text readability, and restart/mute/how-to-play flows.
- For DOM or metadata changes, use semantic React/Next patterns and existing `globals.css`; this repo currently does not configure Tailwind or ShadCN.

## Known baseline mismatches

- README says `Space` or `J` fires. Current runtime instructions and controls bind shooting to `SPACE` plus pointer/click firing; do not block unrelated PRs solely for the existing `J` mismatch.
- Runtime seeker ammo unlocks after 4 kills or 30 seconds and uses seeker pickups/projectiles, but README does not document seeker ammo yet.
- README calls blast a rare late-game power-up. Current code unlocks blast after 2 kills or 16 seconds. Flag this only when a PR touches related docs or power-up gating.
- Existing dependency audit findings may appear during install. Do not block unrelated PRs solely on baseline audit warnings unless dependency changes worsen them.

## Verification expectations

Prefer commands that are reliable for this project:

```bash
npm ci
npm run build
npx tsc --noEmit
git diff --check
```

`npm run lint` calls `next lint`, which is not reliable for the current Next version in this repo. If build or typecheck rewrites `next-env.d.ts` or creates `tsconfig.tsbuildinfo`, verify whether the task intended those changes; otherwise restore/remove generated artifacts before review completion.

## Output style

Lead with concrete findings ordered by severity. Include file and line references, explain the user-visible risk, and call out missing verification only when it affects confidence. If there are no findings, say so and list any residual verification gaps.
