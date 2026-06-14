# Cursor Bugbot review guide

Use this file as the repository-local review brief for Cursor Bugbot. It does not enable the managed Bugbot service by itself; service enablement still depends on Cursor dashboard settings, the Cursor GitHub App having access to this repository, and a pull request smoke check where Bugbot posts a review.

## Repository shape

- App: Next.js React app in `src/app`, with the browser game mounted through `src/game/GameCanvas.tsx`.
- Game runtime: Phaser scene logic lives mainly in `src/game/scenes/DungeonScene.ts`; map generation is in `src/game/maps/startingDungeon.ts`; asset paths and frame metadata are centralized in `src/game/assets/manifest.ts`.
- Styling: global CSS lives in `src/app/globals.css`. This repo does not currently configure Tailwind, so prefer existing semantic markup and global CSS patterns when reviewing UI changes.
- Asset/source tooling: generator and processor scripts live in both `tools/` and `scripts/`. Generated public assets are under `public/assets/**`; do not require regenerated binary assets unless a change intentionally updates visuals or audio.

## Review priorities

1. Block runtime crashes in the Next app or Phaser scene, especially code that touches preload/create/update flow, input registration, timers, tweens, camera state, audio, or object destruction.
2. Check gameplay state transitions for leaks and stale references. Pay close attention to arrays of enemies, projectiles, pickups, power-ups, popups, afterimages, and any Phaser object that can be destroyed while still referenced.
3. Verify input changes against the actual implementation. Current code fires with `SPACE` and pointer/click; README also mentions `J`, which is an existing docs/code mismatch. Do not block unrelated PRs solely for that mismatch.
4. Validate asset manifest changes against files under `public/assets/**`. Missing paths, wrong frame sizes, or row/frame count mismatches are high-risk because Phaser loading failures break the game at startup.
5. Treat package/dependency changes as high-risk. Confirm both lockfiles stay intentional and consistent if dependencies change. Avoid suggesting dependency churn for documentation-only or Bugbot-config-only PRs.
6. Preserve Next-generated typing files. If local verification rewrites `next-env.d.ts` between `.next/dev/types` and `.next/types`, restore it unless the PR intentionally changes Next type generation behavior.
7. Do not block a scoped Bugbot guidance PR for existing README/gameplay mismatches unless the PR claims to fix those docs or mechanics.

## Gameplay context for reviewers

- Controls documented in README: WASD/arrows movement, mouse aim, Space or J to fire, click to aim and fire, F3 debug overlay, and sound mute toggle. Implementation currently binds shooting to `SPACE` plus click/pointer behavior.
- Power-ups in current code include quickshot, haste, ward, and blast. README describes blast as rare late-game, but code currently unlocks blast earlier via `POWERUP_CONFIG`; treat that as existing context unless the PR edits power-up progression.
- Seeker ammo/projectiles exist in code and unlock after kill/time thresholds, but README does not yet document seeker ammo. Review seeker changes against code-defined behavior, not README coverage alone.
- Combat is intentionally arcade-simple: finite ammo, pickups, goblin/brute pressure, heart pickups for missing health, contact damage, ward blocking, projectile and blast damage, and scene-level audio mute.

## Suggested local verification

Use verification that matches the PR scope:

```bash
npm ci
npm run build
npx tsc --noEmit
git diff --check origin/main...HEAD
```

Notes:

- `npm run lint` maps to `next lint`, which is unreliable with the current Next version. Prefer build plus `npx tsc --noEmit` unless the PR adds a working lint command.
- This package intentionally has no `npm start` script. Do not require one unless the PR adds runtime smoke infrastructure.
- For docs/config-only changes, a clean diff check and no unintended package, lockfile, generated asset, or app-code changes are usually the key review signals.

## Managed Bugbot deployment checklist

Repository files can provide review context, but they cannot prove managed Bugbot is enabled. When validating deployment, check:

- Cursor dashboard or organization settings show Bugbot enabled for code review.
- The Cursor GitHub App is installed and has access to `fjg-thr/hobgoblin-dungeon`.
- A test pull request receives a Bugbot review/comment, or the service UI shows the repository as active.
- If those checks are unavailable to the agent, report that this PR deploys repo-local Bugbot guidance only and that managed-service enablement remains externally verifiable.
