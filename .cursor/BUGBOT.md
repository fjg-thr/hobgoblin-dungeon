# Cursor Bugbot review guide

Use this guide when reviewing pull requests for the Hobgoblin Ruin Prototype.

## Review priorities

- Prioritize real bugs, regressions, security issues, data loss risks, and player-visible gameplay failures over broad style preferences.
- Call out findings only when the changed code makes the issue actionable in the current pull request.
- Include the likely runtime symptom and a concrete fix direction in each finding.

## Project context

- This is a Next.js app that hosts a Phaser-based pixel-art dungeon prototype.
- `src/game/scenes/DungeonScene.ts` owns most gameplay state, scene lifecycle, input handling, enemies, pickups, audio, and HUD behavior.
- `src/game/assets/manifest.ts` and files under `public/assets/**` define runtime asset paths and sprite metadata.
- Files under `tools/**` generate or process assets; changes there can affect checked-in files under `public/assets/**`.

## High-signal checks

- Verify Phaser objects, timers, keyboard listeners, pointer listeners, tweens, and audio handles are created and destroyed with the scene lifecycle.
- Check that asset manifest keys, JSON frame names, and public asset paths stay in sync with runtime loads.
- Look for game-state changes that can desynchronize HUD values, score, ammo, health, enemy counts, power-up timers, or start/game-over state.
- Watch for code paths that can run before Phaser systems or DOM/browser APIs exist, especially in Next.js client/server boundaries.
- Flag changes that introduce nondeterministic map, enemy, or pickup behavior without preserving playability constraints.
- Review input changes for keyboard, pointer, and accessibility regressions on the start, instructions, mute, and restart UI.
- Check generated asset scripts for destructive writes, missing output validation, or assumptions about local-only files.

## Lower-priority areas

- Do not spend review effort on generated binary assets unless the pull request changes generation logic or references those assets from code.
- Avoid nitpicks about formatting that TypeScript, Next.js, or the package manager can enforce automatically.
- Avoid proposing large architectural rewrites unless the current change creates a concrete bug or maintenance hazard.
