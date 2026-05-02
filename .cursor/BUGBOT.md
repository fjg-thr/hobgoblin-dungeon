# Bugbot review instructions

Use these project-specific checks when reviewing changes in this repository.

## Project context

- This is a private Next.js web prototype for a Phaser-powered isometric dungeon game.
- Runtime game logic is concentrated in `src/game/scenes/DungeonScene.ts`, with React/Next entry points under `src/app` and `src/game/GameCanvas.tsx`.
- Generated and processed art/audio assets live under `public/assets`; source-generation helpers live under `tools` and `scripts`.

## Review priorities

- Flag gameplay regressions in movement, aiming, firing, ammo, damage, enemy spawning, pickups, scoring, start/restart flows, and mute state.
- Check Phaser lifecycle changes carefully. Look for duplicated listeners, timers, tweens, input handlers, or scene objects that are not cleaned up across restart/start transitions.
- Verify browser-only APIs stay out of server-rendered paths. Components that touch Phaser, `window`, `document`, canvas, audio, or pointer input must remain client-safe.
- Treat generated assets and lockfiles as high-noise unless a change intentionally updates dependencies or asset pipelines. Focus review on the code that consumes or generates them.
- For collision, camera, pathing, projectile, and enemy AI edits, look for coordinate-space mistakes between isometric tile coordinates, world coordinates, sprite origins, and bounds checks.
- For UI and accessibility edits in React/Next files, verify semantic markup, keyboard access, descriptive labels, and Tailwind-based styling consistency.
- For dependency changes, check bundle/runtime impact and whether both `package-lock.json` and `pnpm-lock.yaml` were intentionally updated.

## Validation expectations

- Prefer `npm run build` as the main verification command for code changes.
- If linting is changed or restored, verify the `npm run lint` script works with the installed Next.js version.
- For asset pipeline changes, verify the specific generator/processor command documented in `package.json`.
