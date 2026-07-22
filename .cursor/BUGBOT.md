# Cursor Bugbot review instructions

Use these repository-specific notes when reviewing pull requests for Hobgoblin Ruin.

## Deployment and activation boundary

- This file supplies repository-local review context for Cursor Bugbot. It cannot enable or prove enablement of the hosted managed service.
- To confirm managed Bugbot deployment, verify the Cursor dashboard or organization settings, the Cursor GitHub App repository access, and any Admin API/service credentials used by the team.
- Keep these deployment checks out-of-band. Never post credentials, and retain only Bugbot request IDs rather than raw potentially sensitive logs.
- After enabling hosted Bugbot, smoke-test a pull request review with a top-level `cursor review` or `bugbot run` comment. For troubleshooting, use `cursor review verbose=true` or `bugbot run verbose=true` to obtain the request ID.
- These rules are read after they are merged to the default branch; a PR that adds or changes this file might not be reviewed with the new instructions.

## Project shape

- This is a Next.js/React/TypeScript game prototype using Phaser for the playable dungeon scene.
- `src/game/GameCanvas.tsx` is the client-only boundary for Phaser. Preserve its `"use client"` directive and dynamic Phaser/scene imports inside `useEffect`; static runtime imports can break Next.js server rendering or prerender builds.
- The main runtime is `src/game/scenes/DungeonScene.ts`; it currently contains most gameplay, UI overlays, input, audio, pickup, projectile, enemy, and spawn logic.
- Map generation and tile semantics live in `src/game/maps/startingDungeon.ts`.
- Runtime asset loading is driven by `src/game/assets/manifest.ts`. Treat `assetManifest.audio` as the source of truth for audio loaded by the game.
- `public/assets/audio/audio-manifest.json` is auxiliary/consistency-only unless a change explicitly wires it into runtime loading.
- The app shell is under `src/app`; global page styling is in `src/app/globals.css`. This repo does not currently use Tailwind.

## What to prioritize in reviews

- Gameplay state invariants: health, invulnerability, ammo counts, seeker ammo, power-up timers, blast readiness, enemy respawn timers, and game-over/reset paths.
- Phaser lifecycle cleanup: event handlers, input listeners, tweens, timers, pooled objects, audio loops, and scene shutdown/restart behavior.
- Asset consistency: every manifest path and metadata path should match committed files, dimensions, frame counts, animation rows, and generated sprite-sheet JSON.
- Responsive canvas UX: start screen, how-to-play modal, HUD, mute button, hit zones, and overlays should remain usable on compact and tiny viewports.
- Accessibility-adjacent browser UI: for DOM changes in `src/app`, prefer semantic elements, keyboard access, visible focus, labels/aria where needed, and existing CSS patterns.
- Performance risks in the game loop: avoid per-frame allocations, unbounded arrays, unbounded tweens/timers, excessive pathfinding, or texture/audio creation inside update loops.
- Random generation and progression gates: ensure dungeon generation, spawn placement, enemy pressure, pickup availability, and late-game unlocks remain playable and deterministic where tests depend on them.
- Documentation drift: keep README controls, asset lists, and known limitations aligned with runtime behavior when the PR changes related code.

## Current gameplay facts to account for

- Movement supports WASD and arrow keys.
- Runtime shooting is bound to `Space` plus pointer/click firing. README also mentions `J`; only block on that mismatch for PRs that touch input/control documentation or related behavior.
- Ammo is finite. Standard ammo and seeker ammo are separate counters; seeker ammo unlocks after kill or time thresholds and uses seeker pickups/projectiles.
- Initial goblins are seeded from `dungeon.enemyStarts`; additional goblins ramp with target enemy count. Brutes unlock later via `BRUTE_UNLOCK_KILLS` / `BRUTE_UNLOCK_MS`.
- `POWERUP_CONFIG` controls power-up unlock gates, spawn weights, rows, colors, and labels. Duration and effect timing constants live near it, and blast uses `blastShotReady`.
- README documents quickshot, haste, ward, blast, heart pickups, and regular ammo. Do not assume it documents seeker ammo unless a PR updates that text.
- The title screen is Phaser-rendered with viewport-scaled positioning and sizing. The how-to-play modal has compact/tiny layout branches, pointer hit zones, and close behavior.

## Assets and generation tooling

- Many image and audio assets are generated. Review both the generated files and the relevant scripts/prompts when a PR claims to regenerate assets.
- Run only the generator relevant to the changed asset and first confirm that its expected source inputs are available.
- `tools/process_assets.py` requires ignored inputs under `tmp/generated-source`; `tools/process_gpt_tile_powerup_assets.mjs` currently references author-local source paths. Treat both as conditional regeneration tools, not clean-checkout verification commands.
- Other relevant tools include the asset processors and generators under `tools/`, plus `scripts/generate-retro-soundtrack.mjs`. Commands should be derived from `package.json` or the script entry point rather than assumed to work for every asset change.
- Metadata/share-image changes should verify referenced binary assets exist in the deployed app and that dimensions and alt text remain correct.

## Verification guidance

- Prefer `npm ci`, `npm run build`, and `npx tsc --noEmit --incremental false` for repository verification.
- For dependency or lockfile changes, verify `package.json`, `package-lock.json`, and `pnpm-lock.yaml` remain consistent with the intended package-manager workflow.
- Next.js 16 removed the `next lint` command, so the current `npm run lint` script is not a working lint gate. Do not imply that `next build` runs lint.
- `npm run build` can rewrite `next-env.d.ts`; generated typing churn should be reverted unless the PR intentionally changes Next typing behavior.
- Plain `npx tsc --noEmit` can create `tsconfig.tsbuildinfo` because incremental mode is enabled. Prefer `--incremental false`, and flag accidental build artifacts.
- For gameplay/input changes, request or perform a browser smoke check when possible: start the app, open the game, start a run, move, aim, shoot, collect pickups, toggle sound, open/close how-to-play, trigger game over, and restart.
- For asset changes, verify both file existence and runtime loading. A type/build pass alone does not prove sprite frame geometry or audio playback works.

## Review style

- Focus findings on concrete bugs, regressions, missing verification, and user-visible risk.
- Do not block unrelated PRs for pre-existing limitations listed in README or in these notes.
- When behavior is ambiguous, cite the exact runtime file or README section that establishes the expected behavior.
