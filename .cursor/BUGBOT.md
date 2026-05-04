# Cursor Bugbot Review Rules

This repository is a Next.js + React prototype that hosts a Phaser-based
isometric dungeon game. The game logic lives primarily in
`src/game/scenes/DungeonScene.ts`, with asset manifests under `src/game/assets`
and generated game assets under `public/assets`.

## Review priorities

- Flag regressions that can break the first-playable loop: loading the start
  screen, entering the dungeon, moving/aiming, firing, enemy spawning, taking
  damage, collecting pickups, and restarting after game over.
- Pay close attention to changes in `DungeonScene.ts`, because it coordinates
  Phaser scene lifecycle, input handling, collision, combat, UI, audio, and
  asset animation setup.
- Check that new assets referenced from TypeScript also exist under
  `public/assets` and are registered consistently in the relevant manifest or
  scene preload logic.
- Watch for Phaser lifecycle leaks, including duplicate event listeners, timers,
  tweens, sounds, or interactive zones that are not cleaned up when the scene
  restarts or shuts down.
- Treat browser-only APIs carefully in React/Next entry points. Phaser and DOM
  usage should stay client-side and avoid server-rendering crashes.
- Verify gameplay constants and spawn logic for runaway difficulty, impossible
  states, infinite loops, or unbounded object growth during long sessions.

## Verification expectations

- Run `npm run build` for changes that touch TypeScript, React/Next, Phaser
  scene code, asset manifests, or package configuration.
- If a change only updates generated asset files or documentation, check that
  paths and filenames match the code that consumes them.
