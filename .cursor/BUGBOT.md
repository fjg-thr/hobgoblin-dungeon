# Cursor Bugbot Review Guide

Use this repository guide when Cursor Bugbot reviews pull requests for the
Hobgoblin Ruin prototype. The managed Bugbot service is enabled outside git
through Cursor dashboard settings and GitHub App repository access; this file
only supplies repo-specific review context once that service is active.

This guidance applies after it is merged to the default branch. A pull request
that adds or changes this file may still be reviewed with the previously active
Bugbot rules.

## Managed-service verification

Repository files cannot prove that managed Bugbot is active. To verify a
deployment end to end, confirm outside this repo that:

1. Cursor Bugbot is enabled for the organization or workspace.
2. The Cursor GitHub App has access to `fjg-thr/hobgoblin-dungeon`.
3. A test pull request receives a Bugbot review or expected Bugbot status.

If dashboard or GitHub App access is unavailable, state that repository guidance
is present but managed-service enablement remains externally verified.

Manual PR smoke triggers supported by Cursor include top-level comments such as
`cursor review` or `bugbot run`; use `cursor review verbose=true` or
`bugbot run verbose=true` when troubleshooting.

## Project shape

- Next.js App Router app with React UI in `src/app` and `src/game`.
- `src/app/page.tsx` mounts the client-only game canvas.
- `src/game/GameCanvas.tsx` dynamically imports Phaser and owns the game
  instance lifecycle.
- `src/game/scenes/DungeonScene.ts` contains gameplay, input, spawning, combat,
  UI overlays, audio triggers, and most tuning constants.
- `src/game/maps/startingDungeon.ts` generates the room/corridor dungeon layout
  and collision-relevant tile data.
- `src/game/assets/manifest.ts` is the runtime asset source of truth.
- Static sprites, atlases, source images, generated art, and audio live under
  `public/assets/**`.
- Asset and audio generator/processor tooling lives under both `tools/**` and
  `scripts/**`.

## Review priorities

1. Protect the client/server boundary. Phaser and browser-only APIs must stay
   behind client components or dynamic imports, never in server-rendered app
   code.
2. Check Phaser lifecycle safety. Scene restarts, shutdown, timers, tweens,
   keyboard/mouse handlers, audio, and global listeners should be cleaned up so
   repeated runs do not leak state or duplicate callbacks.
3. Preserve gameplay invariants. Watch ammo accounting, heart restoration,
   power-up timers, score/kill progression, invulnerability windows, collision,
   enemy spawning, and game-over/restart transitions.
4. Keep asset manifests consistent. Every runtime manifest entry should point
   at a committed file under `public/assets`, and atlas frame names used in code
   should exist in the paired JSON.
5. Avoid generated asset, lockfile, or dependency churn unless the PR is
   explicitly about tooling, assets, or package maintenance.
6. Be cautious with allocations in `update` loops, per-frame tweens, and
   particle/effect creation. Prefer existing pools and cleanup paths.

## Controls, UI, and accessibility

- Current code binds keyboard firing to `SPACE` and pointer/click firing. The
  README still mentions `J`; flag this only for input-control or documentation
  PRs, not as a blocker for unrelated changes.
- Start screen, how-to-play, mute, restart, and game-over interactions should
  work with the active input model and not trap players.
- This repo does not configure Tailwind. For DOM metadata or future HTML UI,
  follow existing semantic markup and `src/app/globals.css` patterns. For Phaser
  overlays, review pointer zones, keyboard/mouse affordances, responsive
  placement, and canvas-specific UX limits.
- `src/app/layout.tsx` references `/opengraph-image.png`; keep
  `public/opengraph-image.png` present when touching metadata or public assets.

## Known repository context

- The README documents regular ammo, hearts, quickshot, haste, ward, and blast.
  Current code also includes seeker ammo unlock/pickup/projectile behavior
  after 4 kills or 30 seconds. Treat seeker behavior as code-defined unless a PR
  intentionally updates docs or balance.
- The README describes blast as rare late-game, while current code unlocks
  blast earlier through `POWERUP_CONFIG.blast` after 2 kills or 16 seconds.
  Treat that as an existing docs/code mismatch unless the PR claims to change
  blast progression.
- Brutes unlock after 3 kills or 22 seconds. Spawn-pressure changes can
  overwhelm early runs.
- Player max health is 3. Heart pickups restore missing hearts without
  increasing max health.
- This package intentionally has no `npm start` script.
- `next lint` is unreliable with the current Next version because the script
  still invokes the removed `next lint` command.
- Current `npm ci` may report existing audit findings. Do not block unrelated
  PRs solely on baseline advisories when dependencies were not touched.

## Suggested checks

For most code changes, expect evidence from:

```bash
npm ci
npm run build
npx tsc --noEmit
```

For documentation-only or config-only PRs, at minimum run:

```bash
git diff --check origin/main...HEAD
```

After build/typecheck, ignore or clean generated local artifacts such as
`tsconfig.tsbuildinfo` and route-type rewrites in `next-env.d.ts` unless a PR is
intentionally changing Next type generation.

For gameplay changes, also request a manual smoke pass:

- Start screen opens; how-to-play opens/closes.
- Movement works with WASD or arrows.
- Pointer aiming and click firing work; `SPACE` firing works.
- Ammo pickups, at least one power-up, damage, death/game-over, restart, and
  mute toggle behave as expected.
