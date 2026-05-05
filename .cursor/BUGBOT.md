# Bugbot review guide

Use this guide when reviewing changes in this repository.

## Project context

- This is a Next.js app that hosts a Phaser-based, dark GBA-inspired isometric dungeon prototype.
- The main runtime surface is `src/game/scenes/DungeonScene.ts`; it owns scene setup, asset loading, input, combat, UI, audio, enemy behavior, pickup behavior, and game-over/start flows.
- Dungeon generation and tile semantics live in `src/game/maps/startingDungeon.ts`.
- Asset keys and public asset paths live in `src/game/assets/manifest.ts`.
- Most visual/audio assets under `public/assets` are generated or processed outputs. Prefer reviewing their metadata/path consistency rather than requesting broad regenerated-art changes.

## Review priorities

1. Flag runtime errors that would break the browser game loop, Phaser scene lifecycle, or Next.js client rendering.
2. Check that new assets are registered consistently across:
   - `public/assets/**`
   - `src/game/assets/manifest.ts`
   - preload/create logic in `DungeonScene.ts`
   - any related sprite-sheet JSON metadata
3. Watch for coordinate-space mistakes between tile coordinates, isometric world positions, camera/screen positions, and sprite origins.
4. Check collision and pathing changes for regressions around blocked tiles, prop collision boxes, player/enemy bounds, and corridor/room connectivity.
5. Review combat and pickup changes for state-machine bugs, especially cooldowns, respawn timers, projectile lifetimes, power-up durations, ammo counts, and game-over cleanup.
6. Check audio changes for browser autoplay/mute constraints and for respecting the scene-level mute toggle.
7. Prefer small, focused fixes over broad rewrites of `DungeonScene.ts` unless a refactor is directly required by the PR.

## TypeScript and React expectations

- Keep TypeScript types explicit for new game entities, asset keys, and structured state.
- Preserve strict asset-key typing where possible instead of using unchecked strings.
- Keep the Phaser canvas isolated behind the existing React/Next.js integration patterns.
- Avoid adding custom CSS unless Tailwind/global styling cannot express the requirement cleanly.

## Testing and verification hints

- For code changes, ask whether `npm run build` or an equivalent TypeScript/Next.js check was run.
- If local tooling is unavailable in the agent environment, note that limitation instead of assuming the build passes.
- For gameplay changes, look for a brief manual verification note covering movement, collision, combat, pickups, start/game-over flow, and audio mute behavior as relevant to the diff.

## Ignore or de-emphasize

- Do not request large art-direction changes for generated image/audio assets unless the PR explicitly targets asset quality.
- Do not require a full game-engine architecture rewrite for narrow feature or polish changes.
- Do not block on missing exhaustive automated gameplay tests when the PR is a small prototype iteration, but call out high-risk logic that lacks any verification.
