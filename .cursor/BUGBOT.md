# Cursor Bugbot review guide

Use this guide when reviewing pull requests for the Hobgoblin Ruin Prototype.

## Project context

- This is a Next.js app that hosts a Phaser game in a client-only React component.
- The main gameplay logic lives in `src/game/scenes/DungeonScene.ts`.
- Asset declarations live in `src/game/assets/manifest.ts` and must match files under `public/assets`.
- The generated asset tools in `tools/` and `scripts/` may update many binary assets; review code and manifest changes together.

## Review priorities

1. Flag runtime issues that can break the game loop, Phaser scene lifecycle, or browser-only rendering.
2. Check that React code keeps Phaser imports and `window` access behind client-side boundaries.
3. Verify gameplay state changes preserve existing player controls, enemy pressure, power-up behavior, scoring, audio mute state, and restart flow unless the PR explicitly changes them.
4. Validate asset path, frame size, key, and metadata changes against the corresponding files in `public/assets`.
5. Watch for accidental generated-asset churn, especially large binary updates unrelated to the PR intent.
6. Call out TypeScript strictness problems, unreachable states, missing cleanup of timers/events, and unbounded object creation in hot update paths.

## Suggested verification

- Prefer `npm run build` for full Next.js and TypeScript validation.
- If asset tooling changes, run the narrow generator or processor script touched by the PR and inspect the resulting manifest or sprite-sheet metadata.
- For gameplay changes, describe any manual browser checks needed for movement, firing, collisions, enemy attacks, pickups, game over, restart, and audio mute behavior.

## Review style

- Prioritize concrete bugs and regressions over broad style suggestions.
- Include file paths and line references in findings.
- Note residual risk when behavior depends on manual game testing or generated image/audio assets.
