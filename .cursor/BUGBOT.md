# Bugbot review instructions

Review this repository as a first-playable Next.js and Phaser game prototype.

## Highest-priority issues

- Report runtime crashes, broken game loops, missing asset references, or state transitions that can strand the player.
- Report regressions in player controls, aiming, firing, enemy spawning, collision, pickups, scoring, audio mute behavior, start/game-over flows, and debug toggles.
- Report changes that break `npm run build` or introduce TypeScript errors.
- Report accessibility regressions in React UI outside the Phaser canvas, especially unlabeled controls or keyboard traps.

## Project context

- `src/app` contains the Next.js shell.
- `src/game` contains Phaser game code; `DungeonScene.ts` owns most gameplay behavior.
- `public/assets` contains game assets and JSON manifests used at runtime.
- `tools` and `scripts` contain local asset/audio generation utilities.

## Review guidance

- Treat Phaser scene behavior and asset manifest changes as coupled: verify changed asset keys, frame names, dimensions, and paths are consistent with runtime loaders.
- Be careful with timing, animation, and spawn-rate changes; small numeric changes can materially affect gameplay.
- Prefer focused findings about concrete bugs over broad style suggestions.
- Ignore generated binary/image/audio asset churn unless a referenced asset is missing, corrupt, or inconsistent with its manifest.
- Do not flag lack of unit tests for purely generated asset files.
