# Cursor Bugbot Review Guide

Use this guide when reviewing changes in the Hobgoblin Ruin prototype. The
repository is a Next.js App Router app that mounts a Phaser 4 dungeon game in
the browser.

Managed Bugbot enablement is outside this repository. Confirm Cursor dashboard
settings, the Cursor GitHub App installation, and a live pull-request smoke
review when you need proof that the hosted service is active. This file supplies
repo-specific review context for that service.

## Project shape

- App shell: `src/app/**`
- React/Phaser bridge: `src/game/GameCanvas.tsx`
- Main gameplay scene: `src/game/scenes/DungeonScene.ts`
- Dungeon data: `src/game/maps/startingDungeon.ts`
- Runtime asset manifest: `src/game/assets/manifest.ts`
- Generated/static assets: `public/assets/**`
- Asset generators and processors: `tools/**` and `scripts/**`

There is no Tailwind or shadcn setup in this project. Prefer existing semantic
HTML, React, TypeScript, Phaser, and `src/app/globals.css` patterns when
reviewing UI changes.

## Highest-priority review checks

1. **Client/server boundaries**
   - Phaser and browser-only APIs must stay behind client components or dynamic
     imports. `GameCanvas.tsx` should remain the boundary that creates and
     destroys the Phaser game.
   - App Router metadata in `src/app/layout.tsx` must remain server-safe. Do not
     introduce `window`, `document`, canvas, audio, or Phaser access there.

2. **Phaser lifecycle and cleanup**
   - New timers, event listeners, input handlers, tweens, sound instances,
     particle emitters, and GameObjects in `DungeonScene.ts` need clear cleanup
     on scene shutdown/restart.
   - Pointer and keyboard handlers should not be registered repeatedly across
     restarts. Watch for leaks around `this.input`, `this.time`, `this.sound`,
     and `this.events`.
   - Depth, camera, and world-coordinate calculations should preserve the
     isometric sorting assumptions already used by the scene.

3. **Gameplay correctness**
   - Changes to ammo, projectiles, seeker behavior, blast, power-ups, enemy
     spawns, hearts, score, or damage should keep HUD state, collision checks,
     pickup spawning, sound effects, and restart behavior in sync.
   - The README currently describes `Space` or `J` firing, while the scene is
     known to bind `SPACE` and pointer/click firing. Treat that as an existing
     doc/code mismatch unless the pull request intentionally changes controls.
   - Seeker ammo exists in code but is not fully described in the README. Do not
     block unrelated pull requests only for that existing documentation gap.
   - README blast timing is also looser than the current code gates; review
     gameplay PRs for intentional doc/code alignment, but avoid unrelated noise.

4. **Asset manifest and generated files**
   - Runtime loads come from `src/game/assets/manifest.ts`; asset changes should
     keep manifest paths, sprite-sheet dimensions, frame rows, and Phaser load
     keys aligned with files under `public/assets/**`.
   - Generated sprite/audio files should usually be paired with the generator or
     source prompt changes that explain them. Avoid hand-editing generated PNG,
     WAV, or JSON files without a clear reason.
   - `public/assets/audio/audio-manifest.json`, if touched, is auxiliary; runtime
     audio loading is controlled by `assetManifest.audio`.
   - Check metadata asset references, including `/opengraph-image.png` in
     `src/app/layout.tsx`, against tracked files when metadata changes.

5. **TypeScript and React quality**
   - Keep `strict` TypeScript assumptions. Avoid `any` and broad type assertions
     unless Phaser APIs make them unavoidable and the value is narrowed nearby.
   - Prefer small typed helpers for gameplay math or state transitions when they
     reduce risk in `DungeonScene.ts`, but do not request broad refactors that
     are unrelated to the change.
   - React components should be accessible and semantic. If keyboard or pointer
     interaction is added outside Phaser, ensure labels, focus behavior, and
     keyboard handling are present.

6. **Performance-sensitive loops**
   - `DungeonScene.update` and projectile/enemy loops run every frame. Watch for
     new allocations, asset lookups, DOM access, or expensive searches inside
     hot paths.
   - Prefer reusing Phaser objects or existing helper methods when adding
     repeated visual effects.

## Verification expectations

For non-asset-only code changes, ask for or run:

```bash
npm ci
npm run build
npx tsc --noEmit
```

Notes:

- `npm run lint` maps to `next lint`, which is not reliable in the current
  Next.js 16 setup. Treat build and TypeScript checks as the local baseline
  unless the project adds a working lint script.
- There is no test script in `package.json` today. If a pull request adds
  behavior with meaningful pure logic, prefer focused tests or documented manual
  Phaser smoke coverage instead of claiming automated coverage exists.
- `npm run build` and TypeScript may rewrite generated files such as
  `next-env.d.ts` or create `tsconfig.tsbuildinfo`. These should not remain in a
  pull-request diff unless the change intentionally updates generated typing
  behavior.
- Asset-heavy changes need manual browser smoke checks: start screen, movement,
  aiming/click firing, audio toggle, pickups, enemy damage/death, restart, and
  the debug overlay when relevant.

## Review output style

- Lead with concrete bugs or regressions and include exact file/line references.
- Separate existing known limitations from regressions introduced by the pull
  request.
- Do not block documentation-only Bugbot guidance updates for lack of runtime
  tests; verify formatting and repository relevance instead.
- If managed Bugbot service state cannot be observed from the repository, say so
  explicitly and limit the claim to repository-side guidance being present.
