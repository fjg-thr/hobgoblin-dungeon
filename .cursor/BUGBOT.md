# Bugbot Review Instructions

Review this repository as a playable Next.js and Phaser game prototype.

## What to prioritize

- Correctness issues that would break `npm run build`, Next.js rendering, or Phaser runtime behavior in the browser.
- Regressions in `src/game/scenes/DungeonScene.ts`, especially scene lifecycle, timers, tweens, collision, camera bounds, input handling, and cleanup across restarts.
- Asset consistency between `src/game/assets/manifest.ts` and files under `public/assets/**`, including frame names, paths, dimensions, and JSON sprite-sheet metadata.
- Client/server boundary issues in `src/app/**`, such as browser-only APIs being used outside client components.
- Accessibility and interaction bugs in React/DOM UI when changes touch app-level pages or controls.

## Review expectations

- Prefer high-signal, actionable findings over style-only feedback.
- Include concrete file and line references, the user-visible impact, and a suggested fix for each finding.
- Treat generated or processed asset files as low priority unless the diff creates a manifest mismatch, broken path, or obvious runtime problem.
- When behavior changes are non-trivial, check that the PR includes convincing verification such as `npm run build`, targeted tests if present, or manual gameplay evidence.
