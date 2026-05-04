# Bugbot review guidance

This repository is a Next.js + React prototype that hosts a Phaser dungeon game.
When reviewing pull requests, prioritize behavior regressions in the playable game
over stylistic preferences.

## Project context

- The main browser entry points are `src/app/page.tsx`, `src/app/layout.tsx`, and
  `src/game/GameCanvas.tsx`.
- Core gameplay logic lives in `src/game/scenes/DungeonScene.ts`.
- Map data and generated asset metadata live under `src/game/maps`,
  `src/game/assets`, and `public/assets`.
- Many files in `public/assets` are generated sprite sheets, audio, and JSON
  manifests. Treat large generated asset diffs as lower signal unless code now
  references missing or mismatched files.

## Review priorities

- Flag runtime issues that would break the Next.js build, client-only rendering,
  Phaser scene lifecycle, input handling, or asset loading.
- Check that new asset references are present in both the asset manifest and the
  corresponding `public/assets` path.
- Watch for gameplay state bugs in health, ammo, power-ups, enemy spawning,
  collision checks, score updates, and restart/start-screen transitions.
- Pay close attention to browser-only APIs in React components; they should not
  run during server rendering.
- Prefer actionable findings with file/line references and a short explanation of
  the user-visible impact.

## Lower-priority findings

- Avoid blocking generated art/audio churn unless it creates a broken reference,
  invalid JSON, excessive bundle impact, or a visible gameplay regression.
- Do not request broad refactors of `DungeonScene.ts` unless the changed code
  introduces a concrete bug or makes an existing bug materially harder to fix.
