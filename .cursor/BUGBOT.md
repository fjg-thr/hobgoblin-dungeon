# Bugbot review instructions

Review this repository as a browser game built with Next.js App Router, React, TypeScript, and Phaser.

## Review priorities

- Prioritize concrete bugs, regressions, security issues, resource leaks, and changes that can break gameplay. Avoid style-only comments unless the style issue can cause a real defect.
- Treat `src/game/scenes/DungeonScene.ts` as the central real-time game loop. Flag changes that can break timing, input handling, collision, enemy spawning, pickups, score, health, ammo, or game-over state.
- Treat `src/game/assets/manifest.ts` and `public/assets/**` as a coupled contract. Flag asset path, frame size, key, metadata, or manifest changes that are not kept in sync with the referenced files.
- For changes to `package.json`, require the relevant lockfile updates and call out stale or conflicting package manager metadata.

## Next.js and React boundaries

- Phaser must stay client-only. Flag any direct use of `window`, `document`, Phaser, or canvas APIs from server components, layout metadata, route handlers, or module code that can execute during server rendering.
- `GameCanvas` should initialize the Phaser game once per mounted host element and destroy it on unmount. Flag changes that can double-create the game, leak scenes, or leave event listeners/timers alive after unmount.
- Prefer dynamic imports or `"use client"` boundaries for browser-only game code.

## Phaser and gameplay invariants

- Check that timers and deltas use milliseconds consistently, and preserve the existing frame-delta clamping used to keep simulation stable.
- Check that mutable Phaser objects are not used after being destroyed and that tweens, input handlers, keyboard handlers, sounds, and time events are cleaned up when scenes shut down or restart.
- Player health must remain bounded between 0 and `MAX_PLAYER_HEALTH`; ammo counts must remain bounded by their max values; cooldowns and invulnerability windows should not become negative or bypassable.
- Enemy, projectile, pickup, power-up, and combat-effect caps are intentional. Flag changes that can grow these collections without bounds or spawn objects outside valid walkable/safe tiles.
- Preserve the distinction between tile coordinates, world coordinates, and screen coordinates. Flag mixed-coordinate calculations in collision, aiming, pathfinding, and spawn placement.

## Assets, generated files, and docs

- Do not request manual edits to generated sprite/audio assets unless the diff changes the generation pipeline or checked-in metadata incorrectly.
- If a feature adds or renames gameplay assets, check that the manifest, generated JSON metadata, README asset list, and loading code stay consistent.
- Large binary asset churn is expected for visual/audio updates, but flag unrelated asset changes in gameplay-only PRs.

## UI and accessibility

- The game itself is canvas-rendered through Phaser, so do not require DOM accessibility attributes for Phaser sprites or text objects.
- For React/HTML UI outside the canvas, flag missing accessible names, keyboard access, focus handling, and semantic button/form usage.

## Review tone

- Leave concise inline comments with the specific failure mode and a practical fix direction.
- If a concern depends on runtime behavior that is not clear from the diff, phrase it as a question and identify the exact invariant to verify.
