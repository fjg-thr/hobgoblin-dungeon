# Bugbot review guidance

Use this guidance when reviewing pull requests for the Hobgoblin Ruin Prototype. It is repository-specific context for Cursor Bugbot; it does not install the Cursor GitHub App or enable the managed Bugbot service. Bugbot enablement still has to be confirmed in the Cursor dashboard, GitHub App repository access settings, or the Bugbot Admin API.

## Review priorities

- Prioritize correctness, runtime crashes, broken gameplay loops, data-loss risk, security issues, dependency regressions, and changes that make the app fail to build.
- Treat generated binary assets, generated sprite sheets, and generated audio as lower priority unless they are manually edited, missing from the manifest, referenced incorrectly, or no longer match their metadata JSON.
- Avoid blocking on style-only feedback. Formatting comments should only block when they hide a real bug, accessibility regression, broken responsive behavior, or maintainability issue that affects future changes.
- Prefer actionable findings with file paths, user-visible symptoms, and a concrete reproduction or verification step.

## Repository map

- `src/app/page.tsx` mounts the game shell.
- `src/app/layout.tsx` owns Next metadata, Open Graph, Twitter card metadata, and the `/opengraph-image.png` share image contract.
- `src/app/globals.css` contains all DOM-level styling. This repository does not currently configure Tailwind; follow the existing CSS patterns unless a PR intentionally introduces a styling system.
- `src/game/GameCanvas.tsx` dynamically imports Phaser on the client and creates the resizable WebGL game instance.
- `src/game/scenes/DungeonScene.ts` contains most runtime gameplay: scene setup, loading, animation, input, combat, pickups, HUD, start screen, how-to-play modal, audio, and debug overlay.
- `src/game/assets/manifest.ts` is the runtime source of truth for asset and audio paths loaded by the Phaser scene.
- `src/game/maps/startingDungeon.ts` defines the starter dungeon layout, spawn points, collision-relevant tiles, and props.
- `public/assets/**` stores runtime image/audio assets and metadata.
- `tools/**` and `scripts/**` contain asset and audio generation/processing scripts.

## Managed Bugbot deployment checks

- A PR that changes this file only updates review instructions after the file is merged to the default branch.
- To prove the managed service is deployed, verify Cursor dashboard or organization settings, Cursor GitHub App repository access, and Bugbot enablement for `https://github.com/fjg-thr/hobgoblin-dungeon`.
- If API credentials are available, the documented Admin API can enable the repo with `enabled: true` and the desired `manualTriggerOnly` setting.
- If dashboard/API access is unavailable, state that repository guidance was added but service enablement could not be proven from the repo alone.
- Manual PR smoke triggers are `cursor review` or `bugbot run`. For diagnostics, use `cursor review verbose=true` or `bugbot run verbose=true` and capture the request ID or verbose log details.

## Gameplay and input review checks

- Runtime controls in `DungeonScene.ts` currently bind movement to WASD and arrow keys, firing to `SPACE`, pointer/click aiming and firing, `ESC` for closing the how-to-play modal before game start, and `F3` for debug overlay. README copy still mentions `J`; do not block unrelated PRs solely for that existing mismatch, but do flag PRs that edit input/control docs without reconciling runtime behavior.
- The how-to-play modal is Phaser-rendered and has compact/tiny viewport branches. Review changes for overflow, clipped text, broken close behavior, blocked start screen interactions, and pointer hit zones that no longer align with rendered buttons.
- Start screen and game-over interactions use Phaser zones, not DOM buttons. For canvas UI changes, review pointer affordances, keyboard alternatives that already exist, modal escape behavior, responsive placement, and whether pointer zones continue to match the visible elements.
- Combat and collision changes should preserve tile/proximity collision assumptions, projectile wall impacts, enemy hitboxes, safe spawn distances, camera bounds, and death/game-over transitions.
- Initial goblins come from `dungeon.enemyStarts`. Additional goblins ramp toward the target enemy count, while brutes are gated by `BRUTE_UNLOCK_KILLS` or `BRUTE_UNLOCK_MS`. Do not assume all enemies are progression-gated.
- Seeker ammo exists in code but is not fully documented in README. It unlocks after kill/time thresholds, uses seeker pickups/projectiles, and should be reviewed as code-defined behavior unless a PR updates player-facing documentation.
- Power-up unlock gates, weights, rows, colors, and presentation metadata live in `POWERUP_CONFIG`. Durations and effects are controlled by nearby constants such as `QUICKSHOT_DURATION_MS`, `HASTE_DURATION_MS`, `WARD_DURATION_MS`, and `blastShotReady`; review both config and effect code when power-up behavior changes.
- Audio mute state and scene-level sound effects should remain consistent across start, pickup, combat, game-over, and UI toggle events. Avoid findings that require autoplay before a user gesture unless the PR changes the current gesture flow.

## Asset, audio, and metadata review checks

- `src/game/assets/manifest.ts` must be updated when runtime asset or audio paths change. `public/assets/audio/audio-manifest.json` is auxiliary and should stay consistent when audio manifests are intentionally touched, but it is not the runtime source of truth.
- Sprite sheet metadata JSON should match frame dimensions, row counts, and animation assumptions in `DungeonScene.ts` and `assetManifest`.
- Asset generation workflows include:
  - `npm run process:assets`
  - `npm run process:death-assets`
  - `npm run process:combat-juice`
  - `npm run generate:powerups`
  - `npm run generate:combat-assets`
  - `node tools/generate_audio_sfx.mjs`
  - `node scripts/generate-retro-soundtrack.mjs`
  - `python3 tools/process_corporate_goblin_assets.py`
  - `python3 tools/process_spreadsheet_brute_assets.py`
- For Open Graph or social metadata changes, keep `src/app/layout.tsx`, `/opengraph-image.png`, image dimensions, and alt text in sync.
- Preserve the pixel-art presentation: nearest-neighbor scaling, `pixelArt`, `roundPixels`, antialias-disabled rendering, and CSS cursor/canvas sizing are intentional.

## Verification expectations

- Prefer `npm run build` plus `npx tsc --noEmit --incremental false` for source changes. `next lint` is not reliable for this Next version because the script uses the removed `next lint` command.
- If `npm run build` rewrites `next-env.d.ts`, restore it unless the PR intentionally changes generated Next typing behavior.
- Plain `npx tsc --noEmit` can create `tsconfig.tsbuildinfo` because `incremental` is enabled. Prefer `--incremental false` and remove the artifact if it appears.
- For guidance-only changes to `.cursor/BUGBOT.md`, a focused verification can include `git diff --check`, exact changed-file checks, ASCII/trailing-newline checks, `npm run build`, and `npx tsc --noEmit --incremental false`.
- Dependency vulnerability audit findings should be reported separately unless the PR changes dependencies. This repo may have existing npm audit findings from upstream package versions.

## When to flag missing tests

- Flag missing tests or verification for changes to gameplay state transitions, collision, map generation, combat math, enemy spawning, input handling, asset manifest loading, metadata output, and dependency/tooling behavior.
- For canvas-only visual tuning, manual smoke coverage may be acceptable if the PR states tested viewport sizes and interactions.
- For generated assets, ask for the generation command and reviewed manifest/metadata consistency rather than snapshot-style tests.
