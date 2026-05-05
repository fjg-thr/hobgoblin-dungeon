# Bugbot review guidance

Review pull requests for this Next.js and Phaser dungeon prototype with emphasis on runtime regressions and player-facing behavior.

## Project context

- The app is a Next.js client-rendered game shell that dynamically boots Phaser from `src/game/GameCanvas.tsx`.
- Core gameplay, map generation, enemy behavior, UI state, audio, collisions, and pickups live under `src/game`.
- Generated and processed sprites, sprite metadata, and audio manifests live under `public/assets`.
- Asset-processing utilities live under `tools` and `scripts`; review changes there for deterministic output and safe file paths.

## High-priority review areas

- Flag server/client boundary mistakes, especially browser-only APIs or Phaser imports that could run during server rendering.
- Flag Phaser lifecycle leaks, duplicate game instances, uncleared timers/listeners, or scene state that can survive unmounts unintentionally.
- Check gameplay math for regressions in collision, camera movement, projectile direction, enemy spawning, pickup drops, scoring, and health/ammo state.
- Verify asset manifest and sprite-sheet metadata changes stay synchronized with files under `public/assets`.
- Watch for expensive per-frame allocations or loops in scene update paths that could degrade browser performance.
- Check input handling for keyboard, mouse, focus, and restart flows so the game remains playable without trapping the page unexpectedly.
- Treat TypeScript errors, missing imports, impossible states, and unhandled async asset-loading failures as blocking findings.

## Review style

- Prioritize concrete bugs, regressions, and missing verification over broad refactors.
- Include reproduction steps or the affected gameplay scenario when possible.
- If a finding depends on generated assets or scripts, cite the exact manifest/script path and expected invariant.
