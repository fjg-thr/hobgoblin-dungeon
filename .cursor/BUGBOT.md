# Bugbot Review Guidance

This repository is a first-playable prototype for a dark, GBA-inspired
isometric dungeon game built with Next.js, React, TypeScript, and Phaser.

## Review Priorities

- Catch gameplay regressions in `src/game/scenes/DungeonScene.ts`, especially
  movement, aiming, enemy spawning, collision, damage, pickups, scoring, and
  scene restart behavior.
- Check that React and Next.js code in `src/app` and `src/game/GameCanvas.tsx`
  remains client/server-boundary safe. Phaser usage should stay inside client
  components or browser-only effects.
- Verify asset references against `src/game/assets/manifest.ts` and files under
  `public/assets`. New sprite sheets should include matching JSON metadata and
  should not break existing preload keys.
- Prefer small, local changes over broad rewrites. This prototype intentionally
  keeps most gameplay state inside the Phaser scene until a larger architecture
  change is justified.
- Flag changes that add generated binary/source assets without updating the
  README asset list or the relevant processing script in `tools/`.

## Project Conventions

- Use TypeScript types for new data structures and keep names descriptive.
- Keep gameplay constants readable and grouped near the behavior they control.
- Avoid custom CSS for app UI unless Tailwind utilities or existing global
  styles cannot express the requirement.
- Preserve keyboard and pointer controls documented in `README.md`.
- Keep generated asset outputs deterministic when possible, and avoid committing
  transient build artifacts such as `.next` or `node_modules`.

## Suggested Verification

When reviewing code changes, prefer the narrowest command that exercises the
changed surface, then run broader checks when behavior or shared contracts move:

```bash
npm run lint
npm run build
```

There is currently no test script in `package.json`.
