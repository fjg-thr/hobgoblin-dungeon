# Cursor Bugbot review guide

Review this repository as a first-playable Next.js and Phaser game prototype.

## Project context

- The web shell is a Next.js app under `src/app`.
- Gameplay runs in Phaser from `src/game/GameCanvas.tsx`.
- Core game state, UI overlays, enemies, pickups, audio, and scene flow live in
  `src/game/scenes/DungeonScene.ts`.
- Static asset metadata is split between `src/game/assets/manifest.ts` and
  JSON/PNG files under `public/assets`.
- Asset generation and processing scripts live in `tools` and `scripts`.

## Review priorities

1. Flag gameplay regressions in movement, aiming, firing, collisions, pickups,
   scoring, audio toggling, start/game-over flow, and debug controls.
2. Check that new asset references are present in both the Phaser manifest and
   the corresponding files under `public/assets`.
3. Watch for runtime-only failures that TypeScript may not catch, especially
   Phaser object lifecycle mistakes, missing texture keys, timers, tweens, and
   event listeners that are not cleaned up.
4. Prefer small, actionable findings tied to user-visible bugs or maintainable
   correctness issues. Avoid comments on generated art/audio output unless the
   code references those generated files incorrectly.
5. For React/Next changes, verify client-only Phaser usage stays behind client
   components and does not introduce server-rendering assumptions.
6. For scripts, check that generated files remain deterministic where practical
   and that paths match the repository layout.

## Validation commands

When relevant, expect contributors to run:

```bash
npm run build
```
