# Cursor Bugbot review guide

Use this guide when reviewing pull requests for Hobgoblin Dungeon.

## Project context

- This is a private Next.js app that hosts a Phaser-based GBA-inspired dungeon prototype.
- The main gameplay surface is `src/game/scenes/DungeonScene.ts`; small changes there can affect input, combat, spawning, UI overlays, audio, and map generation at once.
- Sprite sheets, tile atlases, and audio assets under `public/assets` are used by Phaser through manifest and JSON metadata. Treat metadata/asset path mismatches as functional bugs.
- Generated asset-processing scripts live in `tools/` and `scripts/`; avoid requesting manual edits to generated outputs unless the source/process also remains reproducible.

## Review priorities

Flag issues as blocking when they can cause:

- Next.js build, TypeScript strict-mode, or import-resolution failures.
- Client/server boundary regressions, especially importing Phaser or browser-only APIs into server components.
- Phaser scene lifecycle leaks, including duplicate event listeners, timers, tweens, keyboard handlers, audio objects, or DOM interactions that are not cleaned up.
- Gameplay regressions in movement, aiming, shooting, enemy spawning, collision, pickups, scoring, health, restart flow, mute behavior, or debug controls.
- Runtime errors from missing asset keys, incorrect frame names, stale atlas JSON, bad public asset paths, or changed manifest entries.
- Accessibility regressions in React/HTML UI outside the Phaser canvas.

## Review style

- Prioritize concrete bugs, regressions, security risks, and missing verification over broad style preferences.
- Prefer file-and-line-specific findings with the user-visible failure mode and a minimal suggested fix.
- Keep nonblocking maintainability notes short and clearly marked as such.
- Do not ask for large refactors unless the changed code introduces a real correctness or maintenance risk.

## Verification expectations

- For code changes, expect `npm run build` or an equivalent TypeScript/Next.js validation before merge.
- For gameplay changes, look for focused manual smoke coverage of start screen, movement, aiming/firing, enemy damage, pickups, game over, restart, mute toggle, and debug overlay when relevant.
- For asset or manifest changes, verify referenced files exist and atlas/frame names still match their consumers.
