# Bugbot Review Instructions

Review this repository as a first-playable Next.js and Phaser game prototype. Focus on defects that can break gameplay, rendering, builds, or deployability.

## High-priority review areas

- Next.js App Router compatibility, including client/server component boundaries and browser-only Phaser usage.
- Phaser scene lifecycle issues such as duplicate event listeners, unmanaged timers, stale references, or asset preload failures.
- Gameplay regressions in movement, collision, combat, enemy spawning, pickups, scoring, audio, and restart/game-over flow.
- Asset manifest and sprite-sheet consistency between `src/game/assets/manifest.ts` and files under `public/assets`.
- TypeScript errors, unsafe casts, nullable state handling, and unhandled edge cases that can crash a run.
- Performance problems in per-frame update loops, especially avoidable allocations or repeated expensive work.
- Accessibility or usability regressions in the surrounding React UI, including keyboard access and clear control affordances.

## Review style

- Prioritize actionable bugs over broad refactors or style preferences.
- Include the file, line, expected behavior, observed risk, and a minimal fix direction for each finding.
- Call out missing tests or verification steps when changes affect shared gameplay systems or build behavior.
- Avoid flagging generated asset files unless the change breaks manifest references, dimensions, frame names, or loading behavior.
