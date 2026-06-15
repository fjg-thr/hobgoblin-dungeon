# Cursor Bugbot review guide

Use this repository guide when Cursor Bugbot reviews pull requests for
`fjg-thr/hobgoblin-dungeon`.

## Deployment boundary

This file gives Bugbot repository-specific review context. It does not enable the
managed Bugbot service by itself. Confirm managed deployment outside the repo by
checking:

- Cursor dashboard or organization settings have Bugbot/code review enabled.
- The Cursor GitHub App can access this repository.
- A pull request receives a Bugbot review, or a top-level PR comment with
  `cursor review` / `bugbot run` triggers one.
- If troubleshooting is needed, use `cursor review verbose=true` or
  `bugbot run verbose=true` as a top-level PR comment.

If those external checks are unavailable, say that only the repo-side guidance
has been deployed and that managed Bugbot enablement still needs verification.

## Project context

- This is a Next.js/React/TypeScript prototype for a dark GBA-inspired
  isometric dungeon game.
- The browser app shell lives under `src/app/`.
- `src/game/GameCanvas.tsx` mounts and tears down the Phaser game on the client.
- Most gameplay logic is in `src/game/scenes/DungeonScene.ts`.
- Dungeon generation and tile metadata live in `src/game/maps/startingDungeon.ts`.
- Runtime asset loading uses `src/game/assets/manifest.ts`; treat it as the
  source of truth for assets loaded by Phaser.
- `public/assets/audio/audio-manifest.json` is auxiliary metadata, not the
  runtime audio loader.
- Asset generator and processor tooling lives in both `tools/` and `scripts/`.
- The project currently uses `src/app/globals.css` and semantic markup patterns;
  it does not configure Tailwind CSS or ShadCN UI.

## Review priorities

Prioritize issues that can break gameplay, deployment, or review confidence:

1. Phaser lifecycle safety: duplicate game instances, uncleared timers/listeners,
   scene restart leaks, stale input handlers, and objects used after destroy.
2. Gameplay correctness: collision and pathfinding edge cases, projectile/enemy
   interactions, pickup state, difficulty progression, health/ammo accounting,
   and game-over/restart behavior.
3. Asset integrity: keep manifest keys, sprite dimensions, JSON metadata, and
   public asset paths consistent. Check both generated source assets and
   processed runtime assets when a PR touches asset tooling.
4. Build and type health: Next.js app/client boundaries, SSR-incompatible Phaser
   access, TypeScript regressions, and generated type-file churn.
5. User-facing behavior: controls, audio mute behavior, HUD readability,
   keyboard/pointer accessibility, and README-visible behavior.
6. Repository hygiene: avoid unrelated generated artifacts, dependency churn,
   lockfile drift, secrets, and large binary changes unless the PR requires them.

Do not block a PR on unrelated existing baseline mismatches unless the PR touches
that behavior or claims to fix it. Call the baseline out as context instead.

## Known baseline mismatches

- README says `Space` or `J` fire staff bolts. Current runtime input binds
  keyboard firing to `Space`; pointer/click firing is also supported.
- Code includes seeker ammo, seeker pickups, and seeker projectiles after kill or
  time unlocks. README currently documents regular ammo and powerups, but not
  seeker ammo.
- README describes blast as a rare late-game power-up. Current code unlocks blast
  earlier than that wording suggests.

## Validation commands

For most code-review PRs, recommend or run these checks when relevant:

```bash
npm ci
npm run build
npx tsc --noEmit
git diff --check origin/main...HEAD
```

Notes:

- `npm run lint` maps to `next lint`, which is not reliable with this Next.js
  version. Prefer build plus `npx tsc --noEmit` unless the project adds a modern
  lint script.
- Next.js may rewrite `next-env.d.ts` and create `tsconfig.tsbuildinfo` during
  verification. Unless a PR intentionally changes generated typing behavior,
  restore `next-env.d.ts` and keep `tsconfig.tsbuildinfo` untracked.
- The package intentionally has no `npm start` script. Use a Next-specific start
  or smoke command only if the PR adds runtime smoke-test infrastructure.

## Review style

- Lead with concrete findings ordered by severity.
- Include file and line references for every actionable issue.
- Explain the user-visible impact and a focused fix direction.
- Prefer the repository's existing patterns over broad refactors.
- Keep suggestions scoped to the changed files unless a shared contract is
  clearly affected.
