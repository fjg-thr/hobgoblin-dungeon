# Bugbot Review Instructions

Review this repository as a Next.js and Phaser browser game prototype. Prioritize findings that could create user-visible gameplay bugs, runtime crashes, broken asset loading, or unsafe dependency/configuration changes.

## Project-specific checks

- Treat TypeScript strictness issues, unchecked nullable Phaser objects, and incorrect scene lifecycle assumptions as high-risk when they can crash gameplay.
- Verify asset manifest changes against files under `public/assets`; flag missing, renamed, or mismatched sprite-sheet JSON/PNG references.
- For `src/game/scenes/DungeonScene.ts`, pay close attention to state transitions, timers, input handlers, collision checks, enemy spawning, pickup behavior, audio state, and cleanup on scene restart.
- For React and Next.js files, flag hydration-unsafe browser API access, missing client boundaries, inaccessible interactive controls, and avoidable layout regressions.
- For generated or processing scripts under `tools/` and `scripts/`, flag destructive filesystem behavior, non-deterministic output that is not documented, and changes that would make documented asset generation commands fail.
- For dependency or lockfile changes, flag unnecessary packages, version skew between `package-lock.json` and `pnpm-lock.yaml`, and packages that increase client bundle risk without clear need.

## Expected verification

- Prefer `npm run build` as the baseline verification for app changes.
- When gameplay logic changes, look for focused manual or automated evidence covering movement, firing, enemy damage, pickups, restart flow, and asset loading.
- When assets or manifests change, expect evidence that referenced files exist and load with matching frame keys.

## Review style

- Focus comments on actionable bugs or maintainability risks that affect correctness.
- Avoid blocking on stylistic preferences unless they conflict with the existing project patterns or create real user-facing risk.
