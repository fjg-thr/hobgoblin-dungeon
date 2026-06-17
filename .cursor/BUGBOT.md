# Bugbot review guidance

Review this repository as a playable Next.js and Phaser dungeon prototype. Prioritize findings that would cause broken builds, runtime crashes, gameplay regressions, lost player progress within a run, accessibility problems, or serious performance issues.

## Project priorities

- Verify changes that touch `src/game/scenes/DungeonScene.ts` preserve the main game loop, player controls, enemy spawning, combat, pickups, HUD updates, and start/game-over flows.
- Check Phaser asset keys against `src/game/assets/manifest.ts` and files under `public/assets`; mismatched keys, frame names, or missing files are high impact.
- Treat generated sprite/audio artifacts as low priority unless the change also updates the loading manifest, metadata JSON, or runtime code that consumes them.
- Flag logic that can create runaway timers, duplicated event listeners, retained scene objects, or unbounded particle/audio effects.
- Watch for browser-only APIs being used during Next.js server rendering; game code should stay behind client-only boundaries.
- Call out accessibility regressions in UI overlays, buttons, instructions, and keyboard/mouse controls.

## Review style

- Lead with concrete defects and explain a realistic failure scenario.
- Include file and line references for every finding.
- Prefer actionable fixes over broad refactor suggestions.
- Flag missing tests or verification steps when behavior, build config, or asset loading changes.
- Do not block on unrelated style churn or generated asset differences unless they affect shipped behavior.

## Expected verification

- Run `npm run build` for changes that touch app, game, config, or asset-loading code.
- For gameplay behavior changes, manually smoke test movement, aiming, firing, damage, pickups, audio mute, start screen, and game-over restart in a browser when feasible.
