# Bugbot review rules

Review this repository as a first-playable browser game built with Next.js, React, TypeScript, and Phaser.

## Review priorities

- Treat gameplay regressions as blocking bugs: movement, collision, aiming, firing, pickups, enemy spawning, enemy attacks, health, ammo, scoring, mute state, game-over flow, and restart flow should keep working together.
- Pay close attention to state that changes every frame in `src/game/scenes/DungeonScene.ts`. Flag stale timers, uncleared Phaser objects, duplicate event handlers, leaking tweens/sounds, and state transitions that can run after a scene is shut down or restarted.
- Preserve browser-only Phaser loading. `phaser` and scene code should stay dynamically imported from client components so Next.js server rendering does not import browser globals.
- For map-generation changes, verify that generated dungeons always include a reachable player start, valid enemy starts, playable floor, stairs, and collision-safe props.
- For asset changes, verify that manifest keys, sprite-sheet dimensions, metadata paths, frame names, and files under `public/assets` stay in sync.
- For audio and input changes, verify that mute/restart/start-screen behavior cannot leave duplicate sounds or listeners active across scene restarts.
- For UI changes, preserve full-screen pixel-art rendering, keyboard and pointer controls, and readable HUD/start/game-over interactions.

## Project conventions

- Keep TypeScript strict and avoid `any` unless the Phaser API type is missing and the reason is local and clear.
- Prefer small, named helpers for gameplay math and state transitions over adding more long inline blocks to the scene.
- Use early returns for guard clauses.
- Do not introduce server-only APIs, Node globals, or filesystem access into client-side game code.
- Avoid adding dependencies unless the change materially needs them.

## Validation to request when relevant

- Run `npm run build` for TypeScript and Next.js validation.
- Manually smoke test movement, firing, enemy collisions, pickups, mute toggle, game over, and restart after gameplay changes.
