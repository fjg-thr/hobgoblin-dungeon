# Bugbot Review Instructions

Review pull requests for this repository as a production-focused reviewer. Prioritize findings that would change runtime behavior, break the build, lose player state, create inaccessible UI, or make assets fail to load. Avoid low-value style comments unless they hide a real bug.

## Project Context

- This is a Next.js app that hosts a Phaser-based isometric dungeon game.
- TypeScript is strict and runs with `noEmit`; type regressions should be treated as build failures.
- Game behavior is concentrated in `src/game/scenes/DungeonScene.ts`, map generation in `src/game/maps`, and asset references in `src/game/assets/manifest.ts`.
- Generated and processed assets live under `public/assets`; review code and metadata changes, but do not nitpick generated binary or sprite-sheet content.

## What To Flag

- Broken asset references: manifest entries, JSON frame names, or public paths that no longer match checked-in files.
- Phaser lifecycle bugs: duplicate listeners, timers, tweens, animations, or scene resources that are not cleaned up across restarts.
- Game-state regressions: stale mutable state, counters that do not reset on restart, enemy/projectile arrays that can desynchronize, or score/health/ammo changes that can go negative unexpectedly.
- Coordinate and collision mistakes: mismatched world/screen/isometric coordinates, incorrect tile bounds, or changes that let actors pass through walls.
- React/Next integration issues: browser-only APIs used during server render, missing client boundaries, hydration hazards, or metadata/config changes that break production builds.
- Accessibility regressions in UI controls, overlays, buttons, and keyboard interactions.
- Security or reliability issues in scripts that process files, especially unsafe path handling or assumptions that can overwrite unintended files.

## What To Avoid

- Do not request broad refactors unrelated to the changed lines.
- Do not flag intentionally simple prototype mechanics just because a larger game architecture could exist.
- Do not require new dependencies when the existing standard library, Next.js, React, or Phaser APIs are sufficient.
- Do not comment on generated image or audio quality unless a code or manifest change makes the asset unusable.

## Review Style

- Keep findings actionable and tied to a concrete failure mode.
- Prefer a small number of high-confidence comments over exhaustive speculation.
- Include the user-visible impact and a minimal fix direction when possible.
