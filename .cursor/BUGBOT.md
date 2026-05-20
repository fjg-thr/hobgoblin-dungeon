# Cursor Bugbot Review Guidance

Use this file as repository-specific context when Cursor Bugbot reviews pull requests for the Hobgoblin Ruin prototype. It does not enable the managed Bugbot service by itself; service enablement must be confirmed in Cursor dashboard or organization settings, GitHub App repository access, and, when available, a smoke PR that receives a Bugbot review.

## Repository shape

- Next.js App Router application with TypeScript.
- `src/app/page.tsx` renders the client-only game shell.
- `src/game/GameCanvas.tsx` is the browser boundary. Phaser is dynamically imported inside `useEffect`, so server-rendered modules must not import Phaser or access `window` at module scope.
- Most gameplay behavior lives in `src/game/scenes/DungeonScene.ts`.
- Static sprites, JSON frame metadata, audio, and generated sheets live under `public/assets/**`.
- Asset generator and processor scripts live under both `tools/` and `scripts/`.

## Review priorities

1. Preserve the client-only Phaser boundary. Flag changes that import Phaser into server components, move browser globals outside effects, or make `src/app/layout.tsx` / `src/app/page.tsx` depend on runtime-only game state.
2. Treat asset paths and metadata as contracts. If a PR changes a manifest entry, spritesheet frame size, audio key, or generated JSON file, verify the matching asset exists and that the Phaser preload/create code still uses the same key and dimensions.
3. Check gameplay invariants in `DungeonScene.ts` carefully. Movement, collision, depth sorting, finite ammo, enemy spawning, pickup collection, hit-stop, camera shake, sound mute state, and restart/game-over cleanup are tightly coupled.
4. Validate controls against current code before blocking. The current implementation fires with `Space` and pointer/click. The README still mentions `J`; treat that as an existing docs/code mismatch unless a PR is specifically changing input handling or controls documentation.
5. Keep README/gameplay docs aligned with intentional behavior changes. Current code includes seeker ammo that unlocks after 4 kills or 30 seconds, while the README does not document seeker ammo. Current blast unlocks after 2 kills or 16 seconds, while the README calls it late-game. Treat both as pre-existing mismatches unless a PR touches those areas.
6. Protect OpenGraph metadata. `src/app/layout.tsx` references `/opengraph-image.png`; `public/opengraph-image.png` should remain present and appropriate for share-card changes.
7. Be conservative with generated assets. Large binary or generated JSON changes should be accompanied by the relevant generator/processor script update or a clear explanation of the manual asset refresh.

## Verification commands

Prefer these checks for review confidence:

```bash
npm ci
npm run build
npx tsc --noEmit --incremental false
git diff --check origin/main...HEAD
```

Notes:

- `npm run lint` currently invokes `next lint`, which is not an integrated subcommand in the lockfile-resolved Next.js version and fails as an invalid project directory. Do not require it until the repo migrates to an explicit ESLint command/configuration.
- `npm ci` may report the known audit state of 2 vulnerabilities (1 moderate, 1 high). Record that output as context, but do not treat it as a new blocker unless dependency changes worsen the audit result.
- `npm run build` can rewrite `next-env.d.ts` between development and production route type paths. Revert incidental generated churn before clean-worktree checks unless a PR intentionally changes Next.js TypeScript configuration.
- Plain `npx tsc --noEmit` can create `tsconfig.tsbuildinfo`; use `--incremental false` for side-effect-free typechecking.

## Managed Bugbot deployment boundary

Repository files can provide review instructions and smoke-test commands, but they cannot prove that the managed Cursor Bugbot service is enabled. For deployment verification, confirm:

- Cursor dashboard or organization settings have Bugbot enabled for this repository.
- The Cursor/GitHub App has access to `fjg-thr/hobgoblin-dungeon`.
- A test pull request receives a Bugbot review or expected Bugbot status when service access is available.
