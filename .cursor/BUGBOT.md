# Bugbot review rules

Use these project-specific rules when reviewing changes in this repository.

## Project context

- This is a Next.js application that hosts a Phaser-based, GBA-inspired isometric dungeon prototype.
- Runtime game behavior lives primarily in `src/game`, especially `src/game/scenes/DungeonScene.ts`.
- The React surface area is intentionally small: `src/app/page.tsx`, `src/app/layout.tsx`, and `src/game/GameCanvas.tsx`.
- Sprite sheets, audio, and metadata live under `public/assets`; asset metadata must stay aligned with the files loaded by the Phaser scene and `src/game/assets/manifest.ts`.

## Review priorities

1. Flag changes that can break `npm run build`, TypeScript compilation, Next.js app routing, or client/server boundaries.
2. Flag Phaser lifecycle bugs, including duplicated listeners, timers, animations, tweens, or scene state that is not cleaned up on scene restart or shutdown.
3. Flag gameplay state bugs where health, ammo, score, enemy spawning, pickups, power-up timers, or restart behavior can become inconsistent.
4. Flag asset regressions where manifest keys, sprite frame dimensions, generated JSON metadata, or public asset paths no longer match actual files.
5. Flag input and accessibility regressions for React UI controls, especially clickable/toggle controls that need keyboard access and clear labels.
6. Flag performance issues in hot paths such as the Phaser `update` loop, collision checks, enemy AI, projectile movement, and per-frame allocations.
7. Flag dependency or config changes that introduce unnecessary packages, loosen type safety, disable strict build checks, or add secrets to the repo.

## Expected verification

- For TypeScript, React, Next.js, or Phaser logic changes, expect `npm run build` to pass.
- For asset metadata changes, verify the referenced asset paths and frame dimensions are internally consistent.
- For generated asset scripts, check that scripts are deterministic enough for review and do not overwrite unrelated assets.

## Style and maintainability

- Prefer small, explicit TypeScript types and descriptive names over broad `any` usage.
- Keep game constants centralized or near the behavior they control; avoid magic numbers in complex gameplay logic.
- Preserve the existing Tailwind-first styling approach for React UI.
- Avoid broad refactors unless they directly reduce risk in the changed area.
