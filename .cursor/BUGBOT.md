# Bugbot Review Instructions

Review this repository as a strict TypeScript Next.js App Router project that embeds a Phaser game.

## Prioritize findings for real defects

- Flag runtime crashes, broken gameplay state transitions, incorrect collision or damage logic, and regressions that can leave the Phaser scene in an unrecoverable state.
- Flag React/Next.js client/server boundary mistakes, especially importing browser-only or Phaser code into server components without a `"use client"` boundary.
- Flag missing asset manifest entries, mismatched sprite-sheet frame keys, incorrect public asset paths, and audio/image loading changes that would break at runtime.
- Flag TypeScript changes that weaken safety, including unjustified `any`, non-null assertions hiding nullable state, or casts that bypass strict checks around game entities and loaded assets.
- Flag lifecycle leaks in Phaser scenes or React effects, including duplicated event listeners, intervals, timers, tweens, sounds, or input handlers that are not cleaned up.
- Flag changes to dependency or lock files that introduce unnecessary packages, duplicate package managers, or inconsistent install instructions.

## Testing expectations

- Gameplay behavior changes should include a clear manual verification path and, where practical, focused tests or type checks.
- Shared logic extracted from `src/game` should be covered by automated tests when the behavior can run outside Phaser.
- Build-affecting changes should be validated with `npm run build` or an equivalent full Next.js compilation command.

## Avoid low-signal comments

- Do not comment on generated or processed binary assets unless the change clearly breaks references from code or manifests.
- Do not request broad stylistic rewrites when the code follows the existing Phaser scene style.
- Do not require new abstractions unless they prevent a concrete bug or meaningfully reduce duplicated gameplay logic.
- Do not flag intentional first-pass prototype limitations already documented in `README.md`.
