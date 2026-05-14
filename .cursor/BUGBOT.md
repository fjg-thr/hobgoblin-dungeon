# Cursor Bugbot Review Guidance

Use this repository-specific guidance when reviewing pull requests for the Hobgoblin Ruin prototype. Prioritize defects that can break the deployed game, asset loading, or review signal quality over broad style feedback.

## Project shape

- Next.js App Router entrypoints live in `src/app/`.
- `src/app/layout.tsx` owns global metadata, Open Graph/Twitter image configuration, and the root HTML shell.
- `src/app/page.tsx` should stay a small Server Component that renders the game host.
- `src/game/GameCanvas.tsx` is the client-only React bridge that dynamically imports Phaser and `DungeonScene`.
- Most gameplay behavior is in `src/game/scenes/DungeonScene.ts`; map generation is in `src/game/maps/startingDungeon.ts`.
- Runtime asset paths are centralized in `src/game/assets/manifest.ts` and must match files under `public/assets/**`.
- Asset generation and processing scripts live under `tools/` and `scripts/`.

## Highest-priority review checks

1. **Client/server boundaries**
   - Flag imports of Phaser, `window`, `document`, browser-only audio APIs, or scene code from Server Components such as `layout.tsx` or `page.tsx`.
   - `GameCanvas.tsx` should remain the client boundary with `"use client"`, dynamic Phaser imports, and cleanup via `game.destroy(true)`.
   - React Strict Mode is enabled in `next.config.ts`; watch for duplicate Phaser instances, double-mounted input listeners, leaked WebGL contexts, and audio that keeps playing after unmount.

2. **Phaser lifecycle and input cleanup**
   - Review new scene listeners, timers, tweens, animations, and interactive zones for matching cleanup on scene shutdown, restart, game over, or modal close.
   - Pay special attention to `this.input.on(...)`, `this.scale.on(...)`, keyboard keys, tweens with `onComplete`, and arrays tracking temporary sprites.
   - Restart/start/game-over flows should not accumulate pointer handlers or stale bounds.

3. **Gameplay correctness**
   - Movement, aiming, collision, enemy pathing, health, ammo, power-ups, score, and game-over/restart state are tightly coupled; review changes for regressions across these systems, not just the touched function.
   - Map tile semantics in `startingDungeon.ts` must stay consistent with collision checks and visual tile selection in `DungeonScene.ts`.
   - Any combat balance or pickup change should preserve the intended first-playable loop described in `README.md`.

4. **Asset contract**
   - New or renamed manifest paths in `src/game/assets/manifest.ts` must have matching files in `public/assets/**`.
   - Sprite-sheet JSON metadata should stay aligned with frame dimensions, frame ordering, actor/power-up rows, and animation code.
   - README asset lists and generated outputs should be updated when asset pipelines change.
   - Avoid committing transient local outputs such as `.next/`, `dist/`, `out/`, `tmp/`, `tsconfig.tsbuildinfo`, or generated assets not meant to be source-controlled.

5. **Metadata and deploy behavior**
   - `src/app/layout.tsx` builds `metadataBase` from `NEXT_PUBLIC_SITE_URL`, `VERCEL_URL`, or localhost; flag invalid URL construction or assumptions about missing protocols.
   - The `/opengraph-image.png` metadata reference must be backed by either `public/opengraph-image.png` or a valid App Router metadata image route.
   - Changes to `next.config.ts`, package versions, or lockfiles should be reviewed for deploy reproducibility.

6. **TypeScript and React quality**
   - Preserve strict TypeScript behavior. Avoid broad `any`, unsafe casts, and client/server type leaks.
   - Keep React code small and lifecycle-safe; Phaser objects should not be stored in React state.
   - Prefer focused helpers over adding more unrelated responsibility to the already large `DungeonScene.ts`.

## Verification guidance

Use npm-based commands because `package-lock.json` is present and `npm ci` has been the reliable install path in this repository.

Recommended checks:

```bash
npm ci
npm run build
npx tsc --noEmit
git diff --check
```

Notes:

- `npm run lint` currently maps to `next lint`; newer locked Next.js versions may not expose that command and can report `Invalid project directory provided: /workspace/lint`. Treat that as a tooling caveat, not proof that code was linted.
- `npm ci` may report existing dependency audit findings. Distinguish pre-existing audit output from vulnerabilities introduced by a PR.
- `npm run build` or TypeScript can update generated local files such as `next-env.d.ts` or `tsconfig.tsbuildinfo`; ensure generated noise is reverted or ignored before review conclusions.
- For asset-heavy changes, also verify the game loads in a browser and watch the console/network panel for missing asset 404s, Phaser warnings, or audio autoplay issues.

