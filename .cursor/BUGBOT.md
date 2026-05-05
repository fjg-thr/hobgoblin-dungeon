# Bugbot Review Guide

This repository is a Next.js app that hosts a Phaser-based isometric dungeon game prototype.

## Review priorities

- Catch runtime regressions in gameplay code, especially Phaser scene lifecycle, input handling, collision, spawning, combat, pickups, scoring, audio mute state, and game-over/start flows.
- Flag changes that can break the static asset contract between `src/game/assets/manifest.ts`, sprite-sheet JSON files, audio manifests, and files under `public/assets`.
- Check TypeScript and React/Next.js boundaries: client-only Phaser code should stay isolated from server-rendered components, and browser APIs should not run during server rendering.
- Look for accidental performance issues in per-frame update paths, such as avoidable allocations, repeated asset lookups, or unbounded timers/tweens.
- Verify accessibility and keyboard/mouse behavior for the page shell and any DOM controls around the canvas.
- Treat generated assets and processing scripts as part of the build pipeline; review script changes for deterministic paths, clear errors, and no destructive file handling.

## Project conventions

- Prefer small, focused changes that preserve the existing Phaser scene structure unless a refactor directly supports the requested behavior.
- Keep styling in the existing global/CSS pattern for the canvas shell unless the app adds a broader UI system.
- Keep sprite-sheet metadata, manifest keys, and code references in sync.
- Avoid introducing new dependencies unless the change clearly needs them.
- Do not suggest replacing the prototype's intentionally simple collision/combat systems unless the change is scoped to that work.

## Verification expectations

- For app or gameplay changes, expect `npm run build` to pass.
- If asset manifests or generated files change, verify the referenced files exist and frame names match code usage.
- If asset processing or generation scripts change, expect the relevant `npm run process:*` or `npm run generate:*` command to be run, or verify the generated outputs and paths another way when external asset inputs are unavailable.
- If package scripts or dependencies change, verify the lockfile is updated consistently.
