# Cursor Bugbot Review Instructions

Review this repository as a first-playable Next.js and Phaser dungeon prototype. Prioritize findings that identify real defects, regressions, broken builds, runtime crashes, or player-facing behavior that no longer matches the game loop described in `README.md`.

## Review Priorities

- Flag TypeScript or React changes that can break the Next.js app, server/client component boundaries, asset imports, or production builds.
- Flag Phaser scene lifecycle bugs, including leaked timers/listeners, stale scene state between restarts, unsafe casts, and objects used after destruction.
- Check gameplay changes for regressions in movement, aiming, staff bolts, enemy spawning/attacks, pickups, scoring, life/ammo HUD state, start/game-over flow, and mute behavior.
- Verify asset manifest updates stay consistent with files under `public/assets`; missing or renamed sprite sheets, frame keys, or audio entries should be treated as high-confidence issues.
- Treat collision, camera, dungeon generation, and pickup placement regressions as important because they directly affect playability.
- Call out accessibility or browser-input problems when UI elements, keyboard controls, or pointer handling become unusable.

## Finding Standards

- Report only actionable, high-confidence issues tied to changed code.
- Include the user-visible consequence and the minimal code path that triggers the issue.
- Do not request broad refactors, style-only changes, or speculative performance work unless they are necessary to prevent a concrete bug.
- Prefer existing project patterns and dependencies; avoid suggesting new libraries unless the current stack cannot address the issue.

## Local Verification Context

Useful commands when available:

```bash
npm install
npm run build
```

The repository currently defines `npm run lint`, but the script may depend on Next.js lint support in the installed Next version. If lint tooling is unavailable, focus review on build, type, and runtime risks surfaced by the changed files.
