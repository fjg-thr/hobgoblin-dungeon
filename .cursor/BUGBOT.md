# Cursor Bugbot Review Guide

Use this repository guide when Cursor Bugbot reviews pull requests for the
Hobgoblin Ruin prototype. The managed Bugbot service itself is enabled outside
git through Cursor dashboard settings and GitHub App repository access; this
file supplies repo-specific review context once that service is active.

## Project shape

- Next.js App Router app with React UI in `src/app` and `src/game`.
- Phaser game logic is concentrated in `src/game/scenes/DungeonScene.ts`.
- `GameCanvas.tsx` is the client-only bridge that imports Phaser dynamically.
- Static art, sprite atlases, and audio live under `public/assets`.
- Local asset generator/processor tooling lives under `tools/` and `scripts/`.

## Review priorities

1. Protect the client/server boundary. Phaser and browser-only APIs must stay
   behind client components or dynamic imports, never in server-rendered app
   code.
2. Check Phaser lifecycle safety. Scene restarts, shutdown, timers, tweens,
   keyboard/mouse handlers, audio, and global listeners should be cleaned up so
   repeated runs do not leak state or duplicate callbacks.
3. Preserve gameplay invariants. Watch ammo accounting, heart restoration,
   power-up timers, score/kill progression, invulnerability windows, collision,
   enemy spawning, and game-over/restart state transitions.
4. Keep asset manifests consistent. Every manifest entry should point at a
   committed file in `public/assets`, and atlas frame names used in code should
   exist in the paired JSON.
5. Avoid generated or dependency churn unless the PR is explicitly about
   tooling, assets, or package maintenance.

## Known repository context

- The README says `Space` or `J` fires, while current code binds keyboard
  shooting to `Space` and also supports pointer/click firing. Flag this only
  for input-control or documentation PRs; do not block unrelated changes solely
  because of the existing mismatch.
- The README documents regular ammo, hearts, quickshot, haste, ward, and blast.
  Current code also includes seeker ammo unlock/pickup behavior. Treat seeker
  behavior as code-defined unless a PR intentionally updates docs or balance.
- The README describes blast as rare late-game, while current code unlocks
  blast earlier through `POWERUP_CONFIG.blast`. Treat that as an existing
  docs/code mismatch unless the PR claims to change blast progression.
- This package intentionally has no `npm start` script.
- `next lint` is unreliable with the current Next version because the script
  still invokes the removed `next lint` command.

## Suggested checks

For most code changes, expect:

```bash
npm ci
npm run build
npx tsc --noEmit
```

For documentation-only or config-only PRs, use a narrower check such as:

```bash
git diff --check origin/main...HEAD
```

After build/typecheck, ignore or clean generated local artifacts such as
`tsconfig.tsbuildinfo` and route-type rewrites in `next-env.d.ts` unless a PR is
intentionally changing Next type generation.

## Managed Bugbot verification

Repository files cannot prove that managed Bugbot is active. To verify
deployment end to end, confirm outside this repo that:

1. Cursor Bugbot is enabled for the organization or workspace.
2. The Cursor GitHub App has access to `fjg-thr/hobgoblin-dungeon`.
3. A test pull request receives a Bugbot review or expected Bugbot status.

If those checks are not available to the reviewer, state that the repository
guidance is present but managed-service enablement remains externally verified.
