# Cursor Bugbot Review Rules

Apply these project-specific rules when reviewing pull requests for this repository.

## Project context

- This is a Next.js App Router, React, and TypeScript browser game that embeds a
  Phaser scene in `src/game`.
- The game is asset-heavy. Runtime behavior depends on matching asset paths in
  `public/assets/**`, sprite-sheet JSON metadata, and `src/game/assets/manifest.ts`.
- Main gameplay state, enemy spawning, collision, pickups, HUD state, and audio
  lifecycle live in `src/game/scenes/DungeonScene.ts`.

## Review focus

- Prioritize bugs that can break gameplay, rendering, asset loading, input
  handling, scoring, health, ammo, power-up timers, enemy AI, collision, camera
  behavior, scene restart flow, or audio playback.
- Flag React/Next changes that can cause hydration issues, server/client boundary
  mistakes, browser-only APIs during server rendering, or missing cleanup for
  mounted game instances.
- Flag Phaser lifecycle leaks, especially listeners, timers, tweens, sound
  objects, keyboard handlers, scene restarts, and DOM references that are not
  cleaned up.
- Flag changes to asset filenames, frame names, sprite dimensions, audio keys, or
  manifest entries when the referenced files or metadata are not updated
  consistently.
- Treat map generation and coordinate-space changes carefully. Tile coordinates,
  world coordinates, screen coordinates, depth ordering, and isometric projection
  are easy to mix up and can create unreachable rooms or invisible collision.
- Flag dependency changes that introduce known vulnerable packages, copyleft
  licenses such as GPL or AGPL, or unnecessary runtime dependencies for code that
  could stay local to scripts/tools.
- Preserve the prototype's pixel-art constraints: nearest-neighbor scaling,
  `pixelArt`, disabled antialiasing, and integer-ish render alignment should not
  be removed without a clear reason.

## Testing and validation expectations

- For code changes, expect `npm run build` or `npx tsc --noEmit` to stay clean.
- For linting changes, `npm run lint` is listed in `package.json`, but modern
  Next.js may not provide `next lint`; report that as a tooling issue rather than
  a code regression if it is the only failure.
- For game-behavior changes, expect focused validation notes in the PR that
  describe the exercised controls, pickups, combat states, or scene transitions.
- For asset processing changes under `tools/` or `scripts/`, expect deterministic
  output paths and no accidental churn of generated assets unrelated to the PR.

## Noise control

- Do not comment on formatting, naming, or stylistic preferences unless they hide
  a real defect.
- Prefer a small number of high-confidence findings with concrete reproduction
  paths and suggested fixes.
