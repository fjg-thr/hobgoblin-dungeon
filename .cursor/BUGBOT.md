# Cursor Bugbot Review Guide

Use this repository-specific guidance when reviewing pull requests for the
Hobgoblin Ruin prototype. This file gives Bugbot project context; enabling the
managed Bugbot service still requires Cursor dashboard/org settings plus GitHub
App access to this repository.

## Triggering and deployment verification

- Bugbot can be manually requested on a pull request with a top-level comment:
  `cursor review` or `bugbot run`.
- For more detail while troubleshooting, use `cursor review verbose=true` or
  `bugbot run verbose=true`.
- Treat this file as repo-side deployment guidance only. To prove hosted review
  is enabled, verify Cursor dashboard settings, GitHub App repository access,
  and a smoke PR where Bugbot posts a review.
- If those external checks are unavailable, state that the repository provides
  Bugbot guidance but cannot prove the managed service is enabled.

## Project map

- App shell: `src/app/page.tsx`, `src/app/layout.tsx`, `src/app/globals.css`.
- Browser-only game mount: `src/game/GameCanvas.tsx`.
- Main Phaser scene and gameplay state: `src/game/scenes/DungeonScene.ts`.
- Procedural map data: `src/game/maps/startingDungeon.ts`.
- Runtime asset source of truth: `src/game/assets/manifest.ts`.
- Generated/processed asset tooling: `tools/` and `scripts/`.
- Public runtime assets: `public/assets/**`.

This is a Next.js App Router, React, TypeScript, and Phaser prototype. Most
gameplay behavior is client-only; server rendering must not import or execute
Phaser/browser APIs.

## Review priorities

### Next.js, React, and browser safety

- Confirm any Phaser or `window`/`document` usage remains behind a client
  boundary such as `GameCanvas.tsx` and dynamic/browser-only code paths.
- Check that React effects creating Phaser game instances clean them up on
  unmount and do not create duplicate canvases during remounts.
- Preserve semantic HTML and existing CSS conventions in `src/app/globals.css`;
  this repo does not currently use Tailwind.
- Review metadata changes carefully. `src/app/layout.tsx` may reference public
  image assets such as `/opengraph-image.png`; confirm referenced files exist
  when metadata is changed.

### Phaser lifecycle and performance

- Inspect scene setup, update loops, timers, tweens, keyboard/mouse listeners,
  and physics/collision callbacks for matching cleanup on scene shutdown.
- Avoid per-frame object allocation, unbounded timers, or sprite/group leaks in
  `DungeonScene.ts`, especially in enemy, projectile, pickup, and particle
  paths.
- Confirm camera, scaling, and input changes work after restart/game-over flows,
  not just on the first run.
- Prefer deterministic or bounded state transitions for spawning, cooldowns,
  invulnerability, and power-up expiration.

### Gameplay correctness

- Validate movement, collision, aiming, shooting, enemy contact damage, ammo,
  score, health, power-ups, and restart behavior against both code and README.
- Existing README/code mismatches should be called out only when the PR touches
  related behavior or docs:
  - README says `Space` or `J` fires, while current runtime firing is `Space`
    plus pointer/click firing.
  - README documents quickshot, haste, ward, and blast, while code also includes
    seeker ammo behavior after progression gates.
  - README describes blast as a late rare power-up, while current code unlocks
    blast earlier through `POWERUP_CONFIG.blast`.
- Do not block unrelated PRs solely for those existing mismatches; suggest
  follow-up doc or behavior alignment when appropriate.

### Assets and audio

- When runtime assets are added, removed, or renamed, check
  `src/game/assets/manifest.ts` first. `public/assets/audio/audio-manifest.json`
  is auxiliary and should not be treated as the runtime source of truth.
- Confirm JSON atlas/frame data still matches committed PNG/WAV files and paths
  under `public/assets/**`.
- Review generator and processor changes under both `tools/` and `scripts/`
  for reproducibility, path safety, and whether generated outputs were committed
  intentionally.
- Watch for large binary churn unrelated to the PR's purpose.

### TypeScript and dependency hygiene

- Keep TypeScript strictness and Phaser-facing types intact; avoid `any` unless
  a library boundary leaves no practical alternative.
- Do not introduce dependency churn for review-only changes. If dependencies do
  change, verify the lockfile for the package manager used by the PR.
- This package intentionally has no `npm start` script. Do not require one for
  review unless the PR adds production smoke tooling.

## Suggested verification

Use the narrowest commands that cover the touched area. For broad or shared
changes, prefer:

```bash
npm ci
npm run build
npx tsc --noEmit
```

Notes:

- `npm run lint` currently maps to `next lint`, which is not reliable with the
  current Next.js version in this repo.
- Build/typecheck may rewrite `next-env.d.ts` or create `tsconfig.tsbuildinfo`.
  Treat those as generated artifacts unless the PR intentionally changes Next
  type generation.
- For diff hygiene, check whitespace from the merge base with:
  `git diff --check $(git merge-base HEAD origin/main)..HEAD`.

## Review output expectations

- Lead with correctness, lifecycle, runtime safety, missing verification, and
  user-visible regressions.
- Include exact file/line references and the concrete failure mode.
- Distinguish shipped behavior from known prototype limitations.
- Keep suggestions scoped to the PR. Avoid broad refactors unless the PR makes
  the touched code unsafe or untestable.
