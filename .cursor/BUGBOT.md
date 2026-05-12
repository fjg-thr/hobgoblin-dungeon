# Cursor Bugbot Review Guidance

Use this guidance when reviewing changes in the Hobgoblin Ruin prototype. This
is an unpublished Next.js App Router app with React, TypeScript, and a
client-only Phaser 4 game scene.

## Repository context

- App entry points live in `src/app/`.
- The game canvas and Phaser bootstrapping live in `src/game/GameCanvas.tsx`.
- Most gameplay behavior lives in `src/game/scenes/DungeonScene.ts`.
- Dungeon generation and collision semantics live in `src/game/maps/startingDungeon.ts`.
- Asset paths and sprite metadata contracts live in `src/game/assets/manifest.ts`.
- Runtime assets are served from `public/assets/**`.
- Asset generation and processing scripts mostly live in `tools/`; some
  pipelines use Node and others use Python. `scripts/` currently contains
  supporting generation utilities such as soundtrack tooling.

## Highest-priority review areas

1. **Next.js client/server boundary**
   - Phaser usage must stay behind client-only components or dynamic imports.
   - Avoid reading `window`, `document`, canvas APIs, or Phaser globals from
     server components, metadata-related modules, or shared imports that can
     execute during SSR.
   - Keep `src/app/layout.tsx` metadata references aligned with the mechanism
     this app uses for absolute asset URLs, whether files in `public/` or App
     Router metadata/image routes.
   - Check environment-derived metadata such as `NEXT_PUBLIC_SITE_URL` and
     `VERCEL_URL` for preview and production URL correctness.

2. **Phaser scene lifecycle**
   - New timers, tweens, keyboard handlers, pointer handlers, audio instances,
     particle emitters, or pooled GameObjects need explicit cleanup on scene
     shutdown/destroy.
   - Avoid accumulating duplicate listeners when the scene restarts from game
     over or when React remounts the game canvas.
   - Pause, resume, and mute behavior should preserve the current scene state
     without leaking audio or input handlers.

3. **Asset manifest and public file consistency**
   - Every new manifest path must exist under `public/` with matching names and
     case.
   - Sprite sheet dimensions, frame sizes, frame counts, and JSON metadata must
     match how `DungeonScene` creates animations.
   - If generation scripts change, verify that regenerated assets are intended
     and that source sheets are not accidentally overwritten or omitted.

4. **Gameplay simulation invariants**
   - Movement, collision, spawning, pickup placement, and pathing must respect
     blocked tiles, map bounds, prop collision boxes, and safe spawn distances.
   - Enemy, projectile, pickup, damage-number, and combat-effect collections
     should stay bounded and should not grow without cleanup.
   - Difficulty progression should remain deterministic enough to reason about:
     check unlock thresholds, spawn caps, cooldowns, invulnerability windows, and
     low-ammo recovery paths.

5. **React UI and accessibility**
   - Interactive UI controls should be keyboard reachable and have accessible
     names.
   - Keep `src/app/globals.css`, semantic HTML, and the existing pixel-art UI
     class patterns consistent with the rest of the app.
   - Avoid replacing standard buttons with non-semantic clickable elements unless
     keyboard handling and ARIA are complete.

6. **Package and lockfile hygiene**
   - This repo currently documents npm usage and includes both
     `package-lock.json` and `pnpm-lock.yaml`.
   - Do not update both npm and pnpm lockfiles unless the dependency change
     intentionally supports both package managers.
   - Treat dependency updates as behavior changes: verify the Next.js build and
     Phaser runtime assumptions after updates.

## Expected local checks

Run the most relevant checks for the touched area:

```bash
npm ci
npm run build
npm run lint
git diff --check origin/main...HEAD
```

`npm ci` is the CI-style install path and assumes the committed npm lockfile is
current; the README still documents `npm install` for casual local setup.
Replace `origin/main` in the diff check if the review target uses a different
base branch or merge base.

`npm run lint` currently maps to `next lint`; if the installed Next.js CLI treats
that command as an invalid project directory, report the tooling incompatibility
separately from code findings.

For gameplay, asset, or scene lifecycle changes, also do a browser smoke test
when practical:

- Start the app with `npm run dev`.
- Load `http://localhost:3000`.
- Start a run, move, fire, collect ammo/powerups/hearts, toggle sound, restart
  after game over, and watch the console for errors.

## Review style

- Lead with concrete defects, regressions, leaks, missing assets, and missing
  verification. Automated tests are not yet standard in this repo, so request
  focused tests or manual smoke evidence in proportion to the change.
- Include file and line references whenever possible.
- Distinguish blocking issues from minor polish.
- Do not claim this file enables the managed Cursor Bugbot service by itself.
  Service enablement depends on Cursor/GitHub app or dashboard configuration
  outside this repository.
