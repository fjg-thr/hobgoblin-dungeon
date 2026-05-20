# Cursor Bugbot review guidance

Use this repository-specific guidance when reviewing pull requests for the Hobgoblin
Ruin Prototype. Cursor Bugbot itself is enabled through the Cursor dashboard and
GitHub App; this file describes what the reviewer should pay attention to in this
Next.js, React, TypeScript, and Phaser game.

## Project context

- This is a Next.js App Router project with strict TypeScript and a client-only
  Phaser 4 RC game canvas.
- `src/app/` owns the web shell and metadata. `src/game/` owns Phaser boot,
  scenes, generated map data, and asset references.
- `src/game/GameCanvas.tsx` is the client/server boundary. Keep Phaser imports
  dynamic and browser-only, preserve the `"use client"` directive, and destroy the
  `Phaser.Game` instance from the React effect cleanup path.
- `src/game/scenes/DungeonScene.ts` is the central runtime scene. Changes here
  can affect movement, combat, spawning, audio, UI, effects, and restart flow, so
  review state reset and lifecycle cleanup carefully.

## Review priorities

1. Preserve playable runtime behavior.
   - Movement should continue to support `WASD` and arrow keys.
   - Firing currently uses `Space` and click-to-fire. The README also mentions
     `J`; flag control or documentation changes that widen or preserve that
     mismatch without implementing the behavior intentionally.
   - Keep finite ammo, seeker ammo unlocks after 4 kills or 30 seconds, heart
     pickups, quickshot, haste, ward, and blast progression coherent.
   - Treat the README descriptions of blast as existing documentation drift:
     current code unlocks blast after 2 kills or 16 seconds.
2. Watch Phaser lifecycle and scene state.
   - New sprites, sounds, tweens, timers, keyboard handlers, or pointer handlers
     should be cleaned up or reset on scene restart/shutdown.
   - Arrays that track game objects must remove destroyed objects and avoid
     retaining stale references across game-over and restart flows.
   - Audio changes should respect the scene-level mute toggle and avoid starting
     duplicate looping sounds.
3. Protect asset integrity.
   - Keep `src/game/assets/manifest.ts`, files under `public/assets/`, and JSON
     sprite metadata in sync.
   - If generator or processor tooling changes under `tools/` or `scripts/`,
     confirm the generated asset paths and frame dimensions still match the
     manifest and scene animation setup.
   - Keep Next metadata/share-image references in `src/app/layout.tsx`
     consistent with tracked public assets.
4. Maintain Next.js and TypeScript boundaries.
   - Do not import Phaser or browser globals from server components.
   - Prefer explicit types for game state and manifest additions.
   - Avoid broad refactors of `DungeonScene.ts` unless the change includes clear
     behavior-preserving boundaries and focused verification.

## Expected verification

Ask for or run the narrowest checks that cover the change:

```bash
npm ci
npm run build
npx tsc --noEmit --incremental false
```

Notes:

- `npm ci` currently exits successfully but reports 2 known audit findings
  (1 moderate, 1 high). Treat new install failures or changed audit output as
  review-relevant dependency drift.
- `npm run lint` currently maps to `next lint`, which is not available as an
  integrated subcommand in the lockfile-resolved Next.js version. Prefer the
  build and TypeScript checks until linting is migrated to an explicit ESLint
  command.
- `npm run build` can rewrite `next-env.d.ts`; do not include that generated
  churn unless the framework configuration changed intentionally.
- When reviewing generated assets or large binary changes, require a source or
  tooling explanation in the PR summary.

## Output expectations

- Lead with concrete bugs or regression risks, including file and line
  references.
- Call out missing verification when runtime behavior, asset manifests, or
  lifecycle cleanup are affected.
- Keep style-only suggestions secondary to correctness, playability,
  accessibility of the web shell, and maintainability of the game scene.
