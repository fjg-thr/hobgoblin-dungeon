# Cursor Bugbot Review Guide

Use this guide when reviewing changes in this repository. Keep reviews focused on defects, regressions, and missing verification that matter for this Next.js and Phaser game prototype.

## Repo map

- `src/app/` is the Next.js App Router shell. `page.tsx` renders the game and `layout.tsx` owns metadata.
- `src/game/GameCanvas.tsx` is the client-only React boundary that starts and tears down Phaser.
- `src/game/scenes/DungeonScene.ts` contains most runtime gameplay, UI overlays, input, enemy waves, pickups, audio, and restart behavior.
- `src/game/maps/startingDungeon.ts` builds the generated dungeon layout and collision-relevant tile data.
- `src/game/assets/manifest.ts` maps asset keys to runtime files in `public/assets/`.
- `tools/` and `scripts/` contain local asset/audio generators and processors. Treat generated PNG, WAV, and JSON output as runtime assets, not source-only fixtures.

## Review priorities

1. Protect the React/Phaser lifecycle boundary. Verify Phaser game creation stays client-only, cleanup destroys scenes/listeners/timers, and React renders do not start duplicate games.
2. Watch for `DungeonScene` state leaks. Restart and game-over paths should reset timers, input state, enemies, projectiles, pickups, score, health, ammo, powerups, UI, audio state, and collision/debug overlays.
3. Keep per-frame code lean. Flag avoidable allocations, unbounded arrays, repeated texture/audio lookups, or expensive geometry work inside update loops.
4. Preserve strict TypeScript and Next build behavior. Do not rely on browser globals outside client code, and avoid app-router generated type churn unless intentionally changing routing/types.
5. Review asset-manifest changes as contracts. New or renamed assets need matching files, frame metadata, loader keys, animation names, and call sites.

## Gameplay invariants

- Movement supports WASD and arrows. Aiming follows the pointer; clicking fires once.
- Current code fires keyboard shots with `SPACE`. The README also mentions `J`; treat that as an existing docs/code mismatch unless an input-control PR intentionally changes it.
- Ammo is finite and reloads from staff-shard pickups. Seeker ammo exists in code and unlocks by kill/time progression, even though README coverage is incomplete.
- Hearts restore missing health but do not increase max health.
- Powerups are progression-gated. README wording says blast is late/rare, while code currently unlocks blast after early kill/time thresholds; do not block unrelated PRs solely for that existing mismatch.
- Ward blocks damage, quickshot changes fire cadence, haste changes movement speed, and blast detonates nearby enemies. Ensure expiration and restart cleanup are explicit.

## UI, accessibility, and docs

- Phaser UI hit zones should remain keyboard/mouse safe where applicable and must not leave invisible blockers active after modal or scene transitions.
- React/Next UI changes should use semantic elements and avoid custom CSS unless Tailwind/global styles already cover the need.
- README or asset prompt updates should match runtime behavior when a PR intentionally changes controls, powerups, assets, or setup commands.

## Verification expectations

- For code changes, prefer `npm ci`, `npm run build`, and `npx tsc --noEmit`. `next lint` is not reliable in this Next 16 setup.
- For asset work, verify generated files are intentional and that source prompts/tools remain reproducible enough for future edits.
- Check for accidental generated artifacts such as `.next/`, `tsconfig.tsbuildinfo`, or `next-env.d.ts` route-type rewrites.
- Managed Cursor Bugbot enablement is external to this repository. Confirm Cursor dashboard/org settings, Cursor GitHub App access for `fjg-thr/hobgoblin-dungeon`, and a PR review/status smoke check when those controls are available. This file only supplies repo-specific review context.
