# Cursor Bugbot review rules

Review pull requests for correctness bugs, runtime regressions, and missing verification. Prefer concrete, actionable findings tied to changed lines. Do not block on style-only preferences unless they hide a likely defect.

## Project context

- This is a Next.js app that mounts a Phaser dungeon prototype from a client component.
- Phaser code must stay behind client-only boundaries. Avoid server-rendered imports or direct browser globals outside guarded client code.
- Game assets live under `public/assets`; TypeScript manifests in `src/game/assets/manifest.ts` must match the committed file paths, frame dimensions, and metadata JSON.
- `src/game/scenes/DungeonScene.ts` owns most runtime state, input handling, spawning, combat, audio, and Phaser object lifecycles.
- `src/game/maps/startingDungeon.ts` owns tile maps, procedural room generation, collision, and tile-to-world helpers.

## Flag likely bugs

- Next/React lifecycle issues: unguarded `window`/`document` access during server rendering, duplicate Phaser game initialization, missing cleanup in `useEffect`, or stale refs that can survive remounts.
- Phaser lifecycle issues: assets used before preload completes, timers/events/tweens/listeners that are not cleaned up, destroyed game objects reused, object pools that can grow without bounds, or depth/order changes that hide gameplay objects.
- Gameplay invariant breaks: health, ammo, cooldowns, invulnerability, spawn limits, safe spawn distances, pickup caps, score, and elapsed-time gates must stay clamped and internally consistent.
- Coordinate/collision mistakes: tile/world conversion errors, off-by-one map bounds, blocked-tile checks that disagree with rendered tiles, prop collision boxes that block unreachable or invisible areas, or pathfinding that can target non-playable tiles.
- Asset regressions: manifest keys colliding, paths pointing at missing files, frame sizes or `framesPerRow` mismatching JSON/sprite sheets, generated asset scripts overwriting source assets unexpectedly, or code referencing assets not listed in the manifest.
- Input/audio regressions: keyboard, pointer, and mute handlers should not leak across scene restarts; muting must apply consistently to music, ambience, and sound effects.
- TypeScript/build regressions: changes should preserve `strict` typing, avoid unjustified `any`, and keep dependency manifests and lockfiles consistent when dependencies change.
- Security/privacy issues: do not introduce secrets, telemetry, remote code execution, `eval`, unsafe dynamic imports from user input, or unchecked external URLs.

## Verification expectations

- For code changes, expect `npm run build` or an equivalent TypeScript/Next verification to pass.
- For isolated game logic changes, prefer deterministic tests or small pure helpers when practical. If browser-only Phaser behavior cannot be automated, require clear manual verification steps in the pull request.
- For asset-only changes, verify the asset path, dimensions, metadata JSON, and any manifest entries changed with it.

## Deprioritize

- Generated pixel-art or audio binary diffs unless a code path, manifest entry, or metadata file references them incorrectly.
- Pure copy changes in docs or prompts unless they create misleading setup, build, or gameplay instructions.
- Personal style preferences that do not affect maintainability, correctness, accessibility, or user-visible behavior.
