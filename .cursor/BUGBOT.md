# Cursor Bugbot review guidance

Use this file as repository-specific context when Cursor Bugbot reviews pull requests for the Hobgoblin Ruin prototype.

## Service boundary

- This repository file does not enable the managed Bugbot service by itself. Confirm enablement in the Cursor dashboard or organization settings, GitHub App repository access for `fjg-thr/hobgoblin-dungeon`, and a PR review smoke check when that access is available.
- Treat a visible Cursor Bugbot review or check on a pull request as the deployment signal. If those service-level controls are unavailable, report that only the repository guidance was updated.

## Project shape

- Next.js App Router app with a client-only Phaser game canvas.
- `src/app/page.tsx` renders `src/game/GameCanvas.tsx`, which dynamically imports Phaser and `src/game/scenes/DungeonScene.ts` in a browser-only effect.
- `src/game/scenes/DungeonScene.ts` is the main gameplay surface. It owns map setup, input, enemy AI, projectiles, powerups, pickups, audio, HUD, debug overlays, and title/game-over flows.
- `src/game/assets/manifest.ts` is the source of truth for asset keys, frame sizes, and public asset paths.
- Generated and processed static assets live under `public/assets/**`; the Open Graph share image is `public/opengraph-image.png`.
- Asset and audio generation/processing tools live under both `tools/` and `scripts/`.

## Review priorities

1. **Runtime safety**
   - Guard browser-only APIs behind client components or effects.
   - Preserve the dynamic Phaser import in `GameCanvas` so SSR/builds do not evaluate Phaser in a server context.
   - Watch for timers, event listeners, tweens, Phaser objects, and audio nodes that are created without cleanup on scene restart or component unmount.

2. **Gameplay correctness**
   - Movement uses WASD or arrow keys; firing is click or Space. README still mentions `J`, but current code binds Space only, so do not block unrelated PRs solely for that existing docs mismatch.
   - Regular ammo, seeker ammo, hearts, quickshot, haste, ward, and blast all have separate progression and UI expectations.
   - Seeker ammo unlocks after 4 kills or 30 seconds and uses seeker pickups/projectiles.
   - Blast currently unlocks after 2 kills or 16 seconds in code, even though README describes it as late-game; treat that as an existing docs/code mismatch unless the PR intentionally changes powerup progression.
   - Keep collision, depth sorting, camera follow, and pointer-to-world aiming behavior consistent with the isometric grid.

3. **Assets and metadata**
   - Any new manifest entry should have a matching tracked asset file with the expected frame dimensions and path.
   - Any changed public path in metadata, manifests, CSS, or README should be checked against tracked files.
   - Keep `public/opengraph-image.png` present when changing `src/app/layout.tsx` social metadata.
   - Avoid committing generated cache/output directories such as `.next/`, `out/`, `dist/`, `tmp/`, `node_modules/`, or local env files.

4. **TypeScript and React practices**
   - Preserve strict TypeScript types and avoid broad `any` casts around Phaser objects unless there is no useful local type.
   - Keep React components small and client/server boundaries explicit.
   - Prefer small helpers in `DungeonScene.ts` when touching repeated gameplay logic, but avoid unrelated rewrites of the large scene file.

5. **Performance and UX**
   - Watch for per-frame allocations or expensive searches in `update()` paths.
   - Keep pixel-art rendering settings intact unless a visual change explicitly needs different behavior.
   - Preserve mute controls, first-pass procedural audio behavior, HUD readability, and title/how-to-play flow.

## Verification commands

Use these checks when reviewing changes:

```bash
npm ci
npm run build
npx tsc --noEmit --incremental false
git diff --check origin/main...HEAD
git diff --check
```

Notes:

- `npm run build` is the primary integration check.
- `npx tsc --noEmit --incremental false` avoids creating `tsconfig.tsbuildinfo`.
- `npm run lint` currently maps to `next lint`; with the current Next.js version this may fail because `next lint` is no longer an integrated subcommand. Prefer build plus TypeScript until linting is migrated to a direct ESLint command.
- If `npm run build` rewrites `next-env.d.ts` route-type references between `.next/dev/types` and `.next/types`, revert that generated churn before final clean-worktree checks unless the PR intentionally changes Next route type generation.
- `npm ci` may report known audit findings. Record the audit output as verification context, but do not treat unchanged dependency audit state as a new Bugbot deployment failure.

## Pull request review output

When leaving review feedback:

- Lead with concrete defects, regressions, missing cleanup, broken assets, or missing verification.
- Include file and line references when possible.
- Separate shipped behavior issues from existing README/code mismatches.
- Avoid blocking docs-only or guidance-only PRs on gameplay TODOs that predate the PR.
