# Bugbot Review Instructions

Review this repository as a playable Next.js and Phaser prototype. Prioritize findings that could cause runtime failures, broken builds, incorrect gameplay behavior, inaccessible UI, or asset loading problems.

## Project context

- The app is a Next.js project that renders a client-side Phaser game.
- Gameplay code is concentrated in `src/game/scenes/DungeonScene.ts`, with map data in `src/game/maps` and asset references in `src/game/assets/manifest.ts`.
- Static art, audio, and metadata live under `public/assets`.
- Asset-processing and generation scripts live under `tools` and `scripts`.

## What to focus on

1. **Runtime correctness**
   - Flag Phaser lifecycle issues such as duplicate event handlers, timers, tweens, scene state that is not reset, or objects used after destruction.
   - Check player, enemy, projectile, pickup, collision, and camera behavior for regressions.
   - Watch for browser-only APIs used in server-rendered code paths.

2. **TypeScript and Next.js boundaries**
   - Verify client-only modules remain isolated behind client components or dynamic imports where needed.
   - Flag unsafe casts, nullable values used without proof, and state shapes that can become inconsistent.
   - Confirm any config changes are compatible with the installed Next.js version.

3. **Assets and manifests**
   - Ensure every referenced asset path exists under `public/assets`.
   - Confirm sprite-sheet frame names, dimensions, and animation keys line up with code references.
   - Flag oversized or regenerated binary assets when a metadata-only change would have been expected.

4. **Controls and accessibility**
   - Verify keyboard and pointer controls still work together.
   - For DOM UI changes, check accessible names, focus behavior, and keyboard activation.
   - Avoid findings about Phaser canvas internals that cannot reasonably be represented as semantic DOM.

5. **Validation**
   - When CI, build, lint, or TypeScript output is available, prefer findings backed by that output.
   - Without command output, identify issues from the diff and repository context instead of assuming local validation ran.

## Review style

- Report only actionable bugs or meaningful risks.
- Include the affected file and line range.
- Explain the user-visible impact and a concise fix direction.
- Do not block on cosmetic preferences, broad refactors, or generated asset style unless they create a concrete bug.
