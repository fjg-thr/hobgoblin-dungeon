# Cursor Bugbot Review Guidance

Use these repository-specific checks when reviewing pull requests for the Hobgoblin Ruin Prototype. This file configures review expectations for Cursor Bugbot; enabling the managed Bugbot reviewer itself is handled outside the repository through Cursor/GitHub App settings.

## Project context

- This is a Next.js App Router game prototype. `src/app/page.tsx` renders a client-only `GameCanvas`; Phaser must stay behind the `"use client"` boundary in `src/game/GameCanvas.tsx`.
- `GameCanvas` dynamically imports `phaser` and `src/game/scenes/DungeonScene.ts`, then destroys the Phaser game on React unmount. Flag changes that import Phaser into server components, touch `window` outside client code, or skip teardown.
- Most gameplay state lives in `src/game/scenes/DungeonScene.ts`. Prefer focused review comments around lifecycle, cleanup, asset loading, collision, depth ordering, and player-facing gameplay regressions.
- Dungeon generation and tile semantics live in `src/game/maps/startingDungeon.ts`; asset paths and frame dimensions are centralized in `src/game/assets/manifest.ts`.

## Review priorities

### Next.js and React boundary

- Keep `src/game/GameCanvas.tsx` as the only React/Phaser bridge unless a PR deliberately changes architecture.
- Verify browser-only APIs (`window`, Phaser, pointer/keyboard input, WebGL, audio) are not introduced into server-rendered files.
- If canvas sizing, route metadata, or environment URL logic changes, check both local `http://localhost:3000` behavior and deployed `NEXT_PUBLIC_SITE_URL` / `VERCEL_URL` behavior.

### Phaser scene lifecycle

- New scene listeners, input handlers, timers, tweens, masks, textures, and pooled game objects need a matching shutdown/reset path. Existing examples include `this.scale.off(...)`, `this.input.off(...)`, and the clear helpers near the bottom of `DungeonScene.ts`.
- Watch for restart/game-over/start-screen changes that leave duplicate pointer handlers or stale bounds (`startButtonBounds`, `howToPlayButtonBounds`, `gameOverButtonBounds`).
- Gameplay object arrays (`projectiles`, `powerUps`, `heartPickups`, `ammoPickups`, `deathSprites`, `combatJuiceObjects`, `hasteAfterimages`, `dungeonObjects`) should stay in sync with object destruction.

### Gameplay invariants

- Movement is isometric with `WASD`/arrow keys. Shooting is currently bound to `SPACE` and pointer/click; README also mentions `J`, but the current code does not bind `J`. Flag PRs that widen or preserve this mismatch without an intentional code/docs change.
- Shots snap to 15-degree angles, consume finite ammo, and should respect `PROJECTILE_COOLDOWN_MS` or `QUICKSHOT_COOLDOWN_MS`.
- Seeker ammo is code-defined behavior: it unlocks after 4 kills or 30 seconds, has separate caps/pickups, and uses seeker projectiles. README does not currently document it; flag docs or UI changes that make this less clear.
- Power-ups are `quickshot`, `haste`, `ward`, and `blast`. Current code unlocks `blast` after 2 kills or 16 seconds even though README calls it rare late-game; treat that as an existing docs/code mismatch unless a PR intentionally fixes it.
- Heart pickups restore missing hearts only and do not increase max health. Ward blocks contact damage while active.
- Brutes unlock after 3 kills or 22 seconds and have separate health, score, hitbox, knockback, and spawn limits.

### Dungeon, collision, and rendering

- `TileCode` meanings in `startingDungeon.ts` must stay aligned with `tileAssetForCode`, `isTileBlocked`, and rendering/depth logic in `DungeonScene.ts`.
- Chasm/bridge/stair/interior wall changes need pathing, collision, prop placement, and debug overlay checks.
- Prop blockers should match visible objects and avoid trapping the player near spawn, stairs, or required pickups.
- Depth ordering should preserve the isometric look: floor below props, shadows below actors, actors/effects/HUD/debug in their intended bands.

### Assets, manifests, and generated content

- When adding or renaming visual/audio assets, update `src/game/assets/manifest.ts`, README asset lists when user-facing, and any sprite metadata JSON together.
- Verify sprite sheet frame dimensions, row counts, frame indexes, animation ranges, and texture keys match the files in `public/assets/**`.
- Source/generated distinction matters: generator and processor tooling lives under `tools/` and `scripts/`; generated runtime assets live under `public/assets/**`.
- `src/app/layout.tsx` references `/opengraph-image.png`, but this checkout does not currently include `public/opengraph-image.png`. Flag metadata or asset changes that leave the referenced share image missing, or that break the expected dimensions and alt text if the asset is added.
- Audio additions should update `public/assets/audio/audio-manifest.json` when relevant and respect the scene-level mute toggle.

## Verification expectations

Prefer concrete verification evidence in review comments. Useful commands:

```bash
npm ci
npm run build
npx tsc --noEmit --incremental false
git diff --check origin/main...HEAD
git diff --check
```

Notes:

- `npm run lint` currently maps to `next lint`; with the lockfile-resolved Next.js version, that command is not a reliable integrated lint check. Do not request it as a blocking check unless the PR also migrates linting to an explicit supported tool.
- `npm run build` may regenerate `next-env.d.ts` route-type paths. Treat unintended generated churn as cleanup to revert before merge.
- Plain `npx tsc --noEmit` can create `tsconfig.tsbuildinfo`; use `--incremental false` for side-effect-free checks.

## Commenting guidance

- Prioritize behavioral regressions, missing cleanup, asset/manifest mismatches, broken build/type checks, and docs/code mismatches that affect players or maintainers.
- Be explicit about whether a mismatch is newly introduced by the PR or an existing known mismatch.
- Include file/line references and the specific manual or automated check that would expose the problem.
- Avoid speculative style comments unless they connect to a concrete bug, maintainability risk, or project convention above.
