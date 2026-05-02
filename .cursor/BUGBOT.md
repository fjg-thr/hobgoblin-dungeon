# Cursor Bugbot Review Rules

Review pull requests for user-visible bugs, regressions, security issues, and maintainability risks in this Next.js, React, TypeScript, and Phaser game prototype.

## Project context

- The app is a first-playable isometric dungeon prototype built with Next.js and Phaser.
- Gameplay state and scene logic live primarily in `src/game/scenes/DungeonScene.ts`.
- Asset manifests and generated sprite-sheet metadata live under `src/game/assets` and `public/assets`.
- Several assets are generated or post-processed by scripts in `tools/` and `scripts/`; avoid suggesting manual edits to generated files unless the source generation step is also updated.

## Review priorities

1. Flag gameplay logic that can break progression, controls, spawning, combat, pickups, scoring, or scene restart behavior.
2. Flag React/Next.js issues that can break client-only Phaser rendering, hydration, asset loading, or production builds.
3. Flag TypeScript changes that weaken type safety, hide null or undefined cases, or introduce implicit `any` behavior.
4. Flag asset manifest mismatches, missing files, incorrect frame dimensions, or references that can fail at runtime.
5. Flag performance risks in the main Phaser update loop, including per-frame allocation, repeated texture generation, or unnecessary scene graph churn.
6. Flag accessibility regressions for browser UI controls such as mute, start, restart, and overlay controls.

## Testing expectations

- Prefer changes that can be verified with `npm run build`.
- When gameplay behavior changes, expect a focused explanation of manual verification steps because Phaser scene behavior is not fully covered by automated tests yet.
- For asset pipeline changes, expect the relevant generation or processing command to be documented in the PR.

## Noise control

- Do not block on purely stylistic preferences unless they hide a bug or conflict with existing local patterns.
- Keep comments specific to changed lines and explain the observable failure mode.
- Prioritize high-confidence findings over speculative refactors.
