# Cursor Bugbot review guide

Use this guide when reviewing pull requests for the Hobgoblin Ruin Prototype.

## Deployment boundary

- This file provides repository-specific review context for Cursor Bugbot.
- Managed Bugbot enablement is configured outside this repository in the Cursor dashboard or organization settings and GitHub App repository access.
- When validating deployment, confirm the Cursor GitHub integration, Bugbot settings page, and a pull request review smoke check if those controls are available.

## Project context

- This is a private-package Next.js App Router prototype for a dark, GBA-inspired isometric dungeon game.
- React owns page and layout composition while Phaser owns the game loop, scene, sprite, input, and audio state.
- Preserve pixel-art scaling, nearest-neighbor rendering assumptions, and the generated asset pipeline unless a PR explicitly changes those systems.
- The app uses global CSS in `src/app/globals.css`; avoid broad styling-system churn unless a PR is explicitly about that migration.

## Review priorities

1. Flag changes that can break `npm run build` or TypeScript strict-mode compilation.
2. Look for Phaser lifecycle leaks: duplicated event listeners, timers, tweens, audio handles, or scene objects that are not cleaned up.
3. Check gameplay state transitions for race conditions between player death, restart, power-up effects, enemy spawning, projectile cleanup, and pickup collection.
4. Verify generated asset manifests and sprite-sheet frame metadata stay consistent with files in `public/assets`.
5. Prefer small, localized changes over broad rewrites of `src/game/scenes/DungeonScene.ts` unless the PR is explicitly refactoring that scene.

## Baseline context to avoid false positives

- README mentions `J` as an alternate fire key, while the current Phaser input binds firing to `Space` and pointer or click input. Treat this as a pre-existing docs/code mismatch unless the PR changes controls.
- README describes blast as a rare late-game power-up, while code currently unlocks blast after early kills or time survived. Treat this as a pre-existing progression-doc mismatch unless a PR intentionally updates power-up balance or docs.
- Seeker ammo behavior is code-defined and unlocks during a run, but it is not fully documented in README. Review seeker changes against the implementation, not only the docs.
- If metadata or share-card assets change, verify references in `src/app/layout.tsx` stay aligned with tracked files under `public/`.

## UI and accessibility

- Keep React UI accessible with semantic elements, labels for interactive controls, keyboard support, and visible focus behavior.
- Keep game-canvas interactions coordinated with Phaser input handling; do not add overlapping React listeners without checking pointer and keyboard side effects.

## Asset and audio pipeline

- Treat files under `public/assets` as runtime inputs. If JSON metadata changes, verify referenced image/audio files and frame dimensions still match.
- Asset generation and processing tooling lives under both `tools/` and `scripts/`; run the relevant generator or processor when practical.
- Avoid committing temporary generation outputs, source secrets, or local-only paths.

## Verification expectations

- For app or TypeScript changes, expect `npm run build` to pass.
- For dependency or lockfile changes, expect `npm ci` and `npm audit --omit=dev` to pass.
- For asset pipeline changes, also run the relevant `npm run process:*` or `npm run generate:*` script when practical.
- If a PR cannot run a recommended check, call out the reason and residual risk.
