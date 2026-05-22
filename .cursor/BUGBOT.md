# Cursor Bugbot review guide

Use this guide when reviewing pull requests for the Hobgoblin Ruin Prototype.

## Project context

- This is a Next.js App Router project that renders a Phaser-powered dungeon prototype.
- React should own page/layout composition while Phaser owns game-loop, scene, sprite, input, and audio state.
- The game is intentionally a dark, GBA-inspired isometric prototype; preserve pixel-art scaling and nearest-neighbor asset assumptions.

## Review priorities

1. Flag changes that can break `npm run build` or TypeScript strict-mode compilation.
2. Look for Phaser lifecycle leaks: duplicated event listeners, timers, tweens, audio handles, or scene objects that are not cleaned up.
3. Check gameplay state transitions for race conditions between player death, restart, power-up effects, enemy spawning, and projectile cleanup.
4. Verify that generated asset manifests and sprite-sheet frame metadata stay consistent with the files in `public/assets`.
5. Prefer small, localized changes over broad rewrites of `src/game/scenes/DungeonScene.ts` unless the PR is explicitly refactoring that scene.

## UI and accessibility

- Keep React UI accessible with semantic elements, labels for interactive controls, keyboard support, and visible focus behavior.
- Use Tailwind utilities for styling when editing React UI.
- Do not introduce custom CSS unless utility classes or existing global styles are insufficient.

## Asset and audio pipeline

- Treat files under `public/assets` as runtime inputs. If JSON metadata changes, verify the referenced image/audio files and frame dimensions still match.
- Asset generation scripts in `tools/` and `scripts/` should be deterministic for the same source inputs where practical.
- Avoid committing temporary generation outputs, source secrets, or local-only paths.

## Verification expectations

- For app or TypeScript changes, expect `npm run typecheck` and `npm run build` to pass.
- For asset pipeline changes, also run the relevant `npm run process:*` or `npm run generate:*` script when practical.
- If a PR cannot run a recommended check, call out the reason and the residual risk.
