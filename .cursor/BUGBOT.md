# Cursor Bugbot Review Guide

Use this file as the repository-specific context for Cursor Bugbot reviews of
`fjg-thr/hobgoblin-dungeon`.

Bugbot is a managed Cursor/GitHub integration. This file improves review
quality once Bugbot is enabled for the repository in the Cursor dashboard and
the GitHub App has access to the repo; it does not enable the hosted service by
itself.

## Repository map

- `src/app/` contains the Next.js App Router shell, metadata, global styles, and
  the client-only game entry point.
- `src/game/GameCanvas.tsx` lazily imports Phaser and `DungeonScene`, owns the
  `Phaser.Game` lifecycle, and destroys it on React unmount.
- `src/game/scenes/DungeonScene.ts` contains most runtime behavior: loading,
  scene setup, input, combat, pickups, audio, UI overlays, restart flow, and
  cleanup.
- `src/game/assets/manifest.ts` is the runtime source of truth for loaded asset
  paths, frame dimensions, sprite keys, and audio paths.
- `src/game/maps/startingDungeon.ts` defines tile codes, generated map shape,
  isometric constants, player/enemy starts, prop placement, and blocking flags.
- `public/assets/**` contains runtime image/audio assets and JSON metadata.
- `tools/**` and `scripts/**` contain local asset/audio generator and processor
  scripts. Treat their outputs as generated artifacts unless a PR intentionally
  refreshes assets.

## Review priorities

### Managed Bugbot deployment

- Verify that PRs relying on this guidance also mention the external activation
  path: Cursor dashboard or Admin API repository enablement plus GitHub App
  repository access.
- A repo change alone cannot prove hosted Bugbot is enabled. Ask for a PR smoke
  review when activation is in scope.
- Manual PR review trigger comments supported by Cursor docs include:
  - `cursor review`
  - `bugbot run`
  - `cursor review verbose=true`
  - `bugbot run verbose=true`
- Root `.cursor/BUGBOT.md` guidance applies after it is merged to the default
  branch. Do not assume a PR that introduces or edits this file was reviewed
  using its new instructions.

### React and Next.js shell

- `GameCanvas` is a client component. Review changes for server/client boundary
  mistakes, direct `window` access outside client-only effects, and accidental
  Phaser imports in server-rendered modules.
- Preserve the lazy dynamic imports of `phaser` and `DungeonScene` unless the
  PR proves server rendering, bundle size, and hydration behavior remain safe.
- React Strict Mode is enabled in `next.config.ts`; lifecycle code must tolerate
  mount/unmount/remount during development without creating duplicate games,
  leaked canvases, or lingering global listeners.
- Metadata changes in `src/app/layout.tsx` should keep OpenGraph/Twitter image
  paths backed by committed files under `public/`.

### Phaser lifecycle and scene cleanup

- Check every new listener, timer, tween, animation, particle emitter, sound,
  DOM/canvas interaction zone, and texture allocation for cleanup during scene
  shutdown, restart, and React unmount.
- Be strict about leaked keyboard, pointer, resize, audio, and timer state. Bugs
  often appear only after using the restart flow or navigating away from the
  page.
- Avoid creating permanent scene objects in hot update loops. Prefer pooling or
  explicit destruction for projectiles, enemy effects, pickup affordances, and
  combat feedback.
- For UI overlays implemented in Phaser, verify responsive placement, pointer
  hit areas, keyboard/mouse affordances, and text readability on small screens.

### Gameplay, map, and collision coupling

- Changes to tile codes, blocking behavior, prop placement, spawn positions, or
  room generation should be reviewed together with collision checks, enemy path
  assumptions, pickup spawning, camera bounds, debug overlay output, and visual
  layering.
- `startingDungeon.ts` encodes the map contract. New tile or prop types need
  matching entries in `assetManifest`, loader code, renderer logic, and any
  collision/proximity checks in `DungeonScene`.
- Combat changes should cover close-range enemy attacks, projectile despawn,
  ward damage blocking, heart pickup limits, finite ammo, seeker/staff projectile
  behavior, and restart/game-over state resets.
- README currently documents `Space`/`J` firing and late rare blast behavior,
  while the implementation may evolve separately. If a PR touches controls or
  power-up timing, ask it to reconcile docs and code; do not block unrelated PRs
  solely on pre-existing README drift.

### Assets and manifests

- Runtime loads are driven by `src/game/assets/manifest.ts`, not by README asset
  lists alone. Any asset path, frame size, key, or sprite-sheet layout change
  needs matching public files and JSON metadata.
- For sprite sheets, review frame dimensions, frame ordering, `framesPerRow`,
  animation names, and direction arrays against both generated JSON and Phaser
  animation setup.
- Avoid committing transient generation inputs, caches, `.next/`, build info,
  or one-off experimental files. If generated assets are intentionally updated,
  the PR should describe which generator/processor command produced them.
- Be cautious with large binary churn under `public/assets/**`; require a clear
  gameplay or visual reason and matching manifest changes.

### TypeScript, performance, and dependencies

- The TypeScript config is strict and uses bundler module resolution. Do not
  paper over type errors with broad casts or `any`; prefer narrow types for game
  state, asset keys, map codes, and event payloads.
- Review hot paths in `DungeonScene` for per-frame allocation, repeated string
  parsing, unnecessary object creation, and expensive collision loops.
- This repo currently has both `package-lock.json` and `pnpm-lock.yaml`.
  Dependency or package-manager changes should be deliberate and keep lockfiles
  consistent with the requested workflow.
- `npm run lint` maps to `next lint`, which is not a reliable Next 16 check in
  this project without additional lint tooling. Prefer build and typecheck
  evidence for scoped reviews unless the PR adds lint configuration.

## Suggested verification

Ask PR authors to run the checks that match the touched surface:

```bash
npm ci
npm run build
npx tsc --noEmit
```

For gameplay, input, scene lifecycle, asset, or audio changes, also request a
manual browser smoke test:

1. Start the app with `npm run dev`.
2. Open `http://localhost:3000`.
3. Start a run, move with WASD or arrow keys, aim with the pointer, fire with
   `Space` and click, collect ammo/powerups/hearts, toggle sound, use `F3`, die,
   and restart.
4. Watch for console errors, missing assets, stuck input, duplicated audio,
   broken HUD placement, and degraded frame rate after restart.

After build or typecheck, verify the working tree is clean. Next.js may rewrite
`next-env.d.ts` or create `tsconfig.tsbuildinfo`; those generated changes should
not be committed unless the PR intentionally changes TypeScript/Next generated
typing behavior.

## Review output expectations

- Lead with concrete bugs, regressions, security or stability risks, and missing
  verification. Include file/line references where possible.
- Keep suggestions scoped to the PR. Do not request unrelated rewrites of the
  large `DungeonScene.ts` file unless the touched code introduces a real risk.
- When a concern depends on external service state, say exactly what cannot be
  verified from repository files and what dashboard, GitHub App, or PR smoke
  evidence would close the gap.
