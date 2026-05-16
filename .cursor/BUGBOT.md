# Bugbot Review Instructions

Cursor Bugbot should review pull requests for this Next.js and Phaser dungeon
prototype with an emphasis on runtime regressions, browser safety, and gameplay
state correctness.

## Scope

- Review pull requests targeting `main`.
- Focus on changed files in the PR diff.
- Ignore generated build output and dependencies: `.next/`, `out/`, `dist/`,
  `node_modules/`, `__pycache__/`, and generated log files.
- Treat large binary asset additions as reviewable only for path, naming,
  manifest references, and obvious repository bloat. Do not attempt to inspect
  image or audio contents as source code.

## Project Context

- The app is a client-rendered Next.js game prototype.
- Phaser code lives under `src/game/**`; the largest gameplay surface is
  `src/game/scenes/DungeonScene.ts`.
- Static assets are served from `public/assets/**`.
- Asset paths and frame metadata are centralized in
  `src/game/assets/manifest.ts`.
- Dungeon generation helpers live in `src/game/maps/startingDungeon.ts`.
- TypeScript is strict and uses the `@/*` path alias for `src/*`.

## Red Flags

Always comment when a change introduces any of the following:

- Browser-only APIs used from server components or module top-level code that
  can run during server rendering.
- Phaser game instances, event listeners, timers, tweens, sounds, textures, or
  DOM references that are created without a clear cleanup path.
- Gameplay state changes that can leave the run in an impossible state, such as
  negative health, negative ammo, enemies targeting destroyed objects, duplicate
  pickup collection, or projectiles continuing after scene restart.
- Collision, map, or pathfinding changes that allow the player or enemies to
  move through blocking tiles or props unintentionally.
- Asset manifest entries that point to missing files, use incorrect frame
  dimensions, or mismatch keys referenced by scene code.
- Async imports, asset loading, or sound playback paths without error-safe
  behavior during component unmount, scene shutdown, or browser autoplay
  restrictions.
- New dependencies that are not justified by the changed behavior.
- Secrets, tokens, private keys, service credentials, or non-public URLs in
  source, config, generated assets, logs, or examples.

## Review Checklists

### Next.js and React (`src/app/**`, `src/game/GameCanvas.tsx`)

- [ ] Components that touch `window`, `document`, Phaser, or browser-only APIs
      are client components or defer that access to effects.
- [ ] React effects clean up created Phaser instances and async boot paths guard
      against updates after unmount.
- [ ] Metadata and environment-derived URLs handle local development and
      deployment values safely.
- [ ] User-facing controls remain keyboard and pointer accessible when DOM UI is
      changed.

### Phaser Gameplay (`src/game/**`)

- [ ] Scene lifecycle changes account for `create`, `update`, shutdown, restart,
      and game-over flows.
- [ ] Input handling avoids duplicate listeners and handles keyboard, pointer,
      and focus loss consistently.
- [ ] Entity pools and arrays remove destroyed objects or mark them inactive
      before later update loops can reuse them.
- [ ] Movement, aiming, collision, and pickup math remain tile-coordinate safe
      at viewport edges and with variable frame deltas.
- [ ] Balance constants do not accidentally make core loops unwinnable,
      trivial, or unstable under long play sessions.

### Assets and Generated Content (`public/assets/**`, `tools/**`, `scripts/**`)

- [ ] New assets are referenced from the manifest or documented if intentionally
      unused.
- [ ] Sprite sheet frame sizes and animation frame counts match the files used
      by Phaser.
- [ ] Asset processing scripts are deterministic enough to be rerun locally and
      avoid hardcoded machine-specific paths.
- [ ] Generated files are not mixed with hand-authored source changes unless the
      relationship is clear in the PR.

### Tooling and Configuration

- [ ] Package scripts remain runnable with the package manager lockfiles in the
      repository.
- [ ] Workflow files use least-privilege permissions and do not run untrusted PR
      code with privileged tokens.
- [ ] TypeScript configuration changes preserve strict checking unless the PR
      gives a clear, narrow reason.

## Review Style

- Lead with defects that can break builds, runtime behavior, security, or data.
- Keep comments short and tied to the changed line or file.
- Include a concrete fix direction when possible.
- Label severity in the comment as `blocking`, `important`, or `minor`.
- Avoid commenting on stylistic preferences unless they hide a bug or conflict
  with existing repository patterns.
