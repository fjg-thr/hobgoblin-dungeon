# Bugbot Review Guide

## Project context

This repository is a Next.js web prototype for a dark GBA-inspired isometric dungeon game. The React app hosts a Phaser scene that implements map generation, combat, powerups, UI, audio, and generated sprite/audio assets.

## Review priorities

- Look for gameplay state bugs in `src/game/scenes/DungeonScene.ts`, especially around spawn timing, health, ammo, powerup duration, collision, scene restart, and game-over transitions.
- Check Phaser object lifecycle changes for leaked timers, stale event handlers, destroyed objects being reused, or tweens/audio that continue after shutdown.
- Verify asset manifest or sprite-sheet changes against files in `public/assets` so runtime asset keys, frame names, dimensions, and paths stay aligned.
- Treat changes to map generation, collision, and coordinate transforms as high risk because small math regressions can break movement, aiming, or enemy behavior.
- For React/Next.js changes, review client/server boundaries, hydration risks, and browser-only API usage.
- Flag user-facing accessibility issues in app-level UI, including keyboard operation, focus visibility, and clear labels for interactive controls.

## Testing expectations

- Prefer findings that can be tied to a concrete runtime path or user interaction.
- When changes affect game logic, suggest a focused manual validation path in addition to any automated checks.
- If package scripts are changed, verify they remain compatible with the existing npm-based run instructions in `README.md`.
