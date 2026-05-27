# Cursor Bugbot review guide

Use this guide when reviewing pull requests for the Hobgoblin Ruin Prototype.

## Deployment boundary

- This file supplies repository-specific review context for Cursor Bugbot.
- Managed Bugbot enablement is configured outside this repository in Cursor dashboard or organization settings and GitHub App repository access.
- When validating a deployment, confirm the Cursor GitHub integration, Bugbot settings page, and a pull request review smoke check if those controls are available.

## Project context

- This is a private npm-package Next.js App Router prototype for a dark, GBA-inspired isometric dungeon game.
- React owns page and layout composition; Phaser owns the game loop, scene, sprite, input, camera, audio, and gameplay state.
- The main gameplay implementation is concentrated in `src/game/scenes/DungeonScene.ts`. Prefer localized fixes there unless a PR is explicitly refactoring the scene.
- Preserve pixel-art rendering assumptions: nearest-neighbor scaling, Phaser `pixelArt` rendering, and sprite-sheet frame dimensions.
- Runtime assets live under `public/assets`, with metadata and typed references in `src/game/assets/manifest.ts`.

## Review priorities

1. Flag changes that can break `npm run build`, Next App Router metadata, or strict TypeScript compilation.
2. Look for Phaser lifecycle leaks: duplicated event listeners, timers, tweens, audio handles, scene objects, or DOM/window listeners that are not cleaned up on scene restart or React unmount.
3. Check gameplay state transitions for race conditions around start, death, restart, power-up expiry, enemy spawning, projectile cleanup, pickup collection, and hit stop.
4. Verify generated asset manifests and sprite-sheet metadata stay consistent with referenced files, frame dimensions, animation keys, and Phaser preload keys.
5. Watch input changes carefully. Keyboard, pointer, HUD zones, start/game-over overlays, and the how-to-play modal share the same scene input system.
6. Treat audio as runtime state: mute persistence, background music loops, and short sound effects should not overlap unexpectedly or ignore the mute flag.

## Baseline context to avoid false positives

- `src/game/scenes/DungeonScene.ts` binds shooting to `Space` and pointer/click firing. The README also mentions `J`; treat that as a pre-existing docs/code mismatch unless a PR changes controls or docs.
- Seeker ammo behavior is implemented in code and unlocks during a run, but it is not fully documented in README. Review seeker changes against the implementation, not only the docs.
- `public/opengraph-image.png` is a tracked share-card asset used by `src/app/layout.tsx`; preserve it unless metadata is intentionally changed.
- The prototype intentionally uses a large Phaser scene file. Suggest decomposition only when it reduces risk for the changed area, not as generic style feedback.

## UI and accessibility

- Keep React UI accessible with semantic elements, labels for interactive controls, keyboard support, and visible focus behavior.
- Keep game-canvas interactions coordinated with Phaser input handling; do not add overlapping React listeners without checking pointer and keyboard side effects.
- For Phaser-drawn UI, focus review on clear input bounds, keyboard reachability where applicable, and non-blocking overlays.

## Asset and audio pipeline

- Treat files under `public/assets` as runtime inputs. If JSON metadata changes, verify referenced image/audio files and frame dimensions still match.
- Asset generation and processing tooling lives under both `tools/` and `scripts/`; run the relevant generator or processor when practical.
- Avoid committing temporary generation outputs, source secrets, local-only paths, or unchecked binary churn.

## Verification expectations

- For any committed change, expect `git diff --check` to pass with no whitespace errors.
- For app or TypeScript changes, expect `npm run build` to pass.
- For dependency or lockfile changes, expect `npm ci` and `npm audit --omit=dev` to pass.
- For asset pipeline changes, also run the relevant `npm run process:*` or `npm run generate:*` script when practical.
- If a PR cannot run a recommended check, call out the reason and residual risk.
