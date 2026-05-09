# Cursor Bugbot Review Instructions

Review this repository as a first-playable Next.js and Phaser dungeon prototype. Prioritize findings that identify real defects, regressions, broken builds, runtime crashes, or player-facing behavior that no longer matches the game loop described in `README.md`.

## Review Priorities

- Flag TypeScript or React changes that can break the Next.js app, server/client component boundaries, dynamic Phaser loading, metadata generation, or production builds.
- Flag Phaser scene lifecycle bugs, including leaked timers/listeners, stale scene state between restarts, unsafe casts, and game objects used after destruction.
- Check gameplay changes for regressions in movement, aiming, staff bolts, seeker bolts, enemy spawning/pathing/attacks, pickups, power-ups, scoring, life/ammo HUD state, start/game-over flow, and mute behavior.
- Verify asset manifest updates stay consistent with files under `public/assets`; missing or renamed sprite sheets, metadata JSON, frame sizes, frame order, or audio entries should be treated as high-confidence issues.
- Treat collision, camera follow, dungeon generation, chasm/bridge tiles, prop blocking, enemy safe-spawn distance, and pickup placement regressions as important because they directly affect playability.
- Call out accessibility or browser-input problems when UI overlays, keyboard controls, pointer handling, focus behavior, or the sound toggle become unusable.
- Check social metadata changes against the real public assets. In particular, `src/app/layout.tsx` currently references `/opengraph-image.png`, so missing or renamed share-image assets should be flagged.
- Be alert for generated file churn. `next-env.d.ts`, generated spritesheets, generated audio, and processed JSON assets should only change when the corresponding source or generation step intentionally changed.
- Watch for package-manager drift. This repository has both `package-lock.json` and `pnpm-lock.yaml`; dependency changes should keep the intended lockfile state coherent.

## Finding Standards

- Report only actionable, high-confidence issues tied to changed code.
- Include the user-visible consequence and the minimal code path that triggers the issue.
- Do not request broad refactors, style-only changes, or speculative performance work unless they are necessary to prevent a concrete bug.
- Prefer existing project patterns and dependencies; avoid suggesting new libraries unless the current stack cannot address the issue.
- Do not flag known prototype limitations from `README.md` unless a change makes an existing limitation worse or contradicts documented behavior.

## Local Verification Context

Useful commands when available:

```bash
npm ci
npm run build
```

The repository currently defines `npm run lint`, but the script may depend on Next.js lint support in the installed Next version. If lint tooling is unavailable, focus review on build, type, and runtime risks surfaced by the changed files.
