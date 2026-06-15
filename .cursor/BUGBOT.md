# Cursor Bugbot review guide

Use these repository-specific instructions when reviewing pull requests for this project.

## Project context

- This is a Next.js App Router prototype for "Hobgoblin Ruin", a dark GBA-inspired isometric dungeon game.
- The React surface is intentionally small: `src/app/page.tsx` renders `src/game/GameCanvas.tsx`, which dynamically imports Phaser on the client and mounts `DungeonScene`.
- Most gameplay behavior lives in `src/game/scenes/DungeonScene.ts`; map generation and tile semantics live in `src/game/maps/startingDungeon.ts`; asset paths and sprite metadata live in `src/game/assets/manifest.ts`.
- Styling uses plain CSS in `src/app/globals.css`. This repository does not currently configure Tailwind or shadcn/ui.
- Pixel art, sprite sheets, audio, and manifest JSON under `public/assets/**` are runtime assets. Generator and processor tooling lives in both `tools/**` and `scripts/**`.

## Review priorities

1. Flag changes that break `npm run build` or strict TypeScript compilation.
2. Watch for server/client boundary regressions. Phaser must stay behind client-only code paths and dynamic imports; avoid importing browser-only Phaser APIs into Server Components.
3. Review gameplay changes for consistency across constants, asset manifests, preload/create animation setup, update loops, collision checks, HUD text, and README-facing behavior.
4. Check asset changes as pairs or sets. PNG sprite sheets, JSON metadata, manifest entries, animation row/frame assumptions, and generator scripts should stay aligned.
5. Treat map and collision changes carefully. Tile codes, blocked tiles, prop blockers, coordinate conversion, depth ordering, and pathfinding assumptions are tightly coupled.
6. Prefer small, direct fixes that preserve the prototype's current architecture over broad rewrites.

## Known project quirks

- README says `Space` or `J` fires, but current code binds keyboard shooting to `Space` and pointer/click firing only. Do not block unrelated PRs solely on this existing mismatch; flag it when a PR changes controls or documentation.
- README describes blast as a rare late-game power-up, but current `POWERUP_CONFIG.blast` unlocks after early kills or elapsed time. Treat this as an existing docs/code mismatch unless the PR intentionally addresses power-up progression.
- Seeker ammo/projectiles exist in code and assets, unlocking after kills or time survived, but README does not describe seeker ammo yet. Review related changes against the code-defined behavior.
- `next lint` is present in `package.json`, but this Next.js version may not provide that command reliably. Prefer `npm run build` and `npx tsc --noEmit` as baseline checks.
- There is no `npm start` script. Do not require one unless a PR adds runtime smoke-test infrastructure.
- Next build/type generation may rewrite `next-env.d.ts` or create `tsconfig.tsbuildinfo`; avoid accepting those generated changes unless the PR is explicitly about generated typing behavior.

## What to verify for common PRs

### Gameplay and Phaser scene changes

- Confirm input handlers are registered and cleaned up symmetrically on scene shutdown when needed.
- Check object pools and arrays for destroyed Phaser objects being removed or reused safely.
- Verify enemy, projectile, pickup, and power-up constants remain internally consistent with HUD labels and player feedback.
- Look for time-step issues: update logic should account for capped delta time and avoid frame-rate-dependent behavior.

### Asset and audio changes

- Confirm every new asset path referenced by `assetManifest` exists under `public/assets`.
- Confirm sprite sheet dimensions, frame counts, row ordering, and animation frame ranges match the generated JSON and code assumptions.
- Keep generated binary assets out of reviews unless they are directly required by the feature.
- For audio additions, verify `public/assets/audio/audio-manifest.json`, `assetManifest.audio`, preload calls, and playback keys are in sync.

### Next.js and React changes

- Keep `GameCanvas` as a client component and avoid SSR access to `window`, `document`, or Phaser globals.
- Preserve the full-viewport game shell and existing semantic structure unless the PR is intentionally changing layout.
- If metadata changes mention `/opengraph-image.png`, verify the asset exists or the reference is adjusted.

### Documentation changes

- Check README controls, power-up descriptions, asset lists, and known limitations against current behavior.
- Do not require README to document every prototype implementation detail, but flag misleading gameplay instructions when touched by the PR.

## Deployment boundary

This file supplies Bugbot with repository review context. It does not enable the managed Bugbot service by itself. Full deployment still requires Cursor dashboard/GitHub integration enablement, GitHub App access to this repository, and a PR review smoke check such as `cursor review` or `bugbot run`.
