# Cursor Bugbot Review Rules

Review this repository as a Next.js App Router game prototype with a client-only Phaser runtime. Prioritize actionable defects that could break gameplay, deployment, or player-facing behavior.

## Project context

- The browser game boots from `src/game/GameCanvas.tsx` and dynamically imports Phaser to keep server rendering safe.
- Most gameplay logic lives in `src/game/scenes/DungeonScene.ts`; scene lifecycle, pooled objects, timers, input handlers, and audio state must stay consistent across restarts.
- Procedural dungeon data and tile helpers live in `src/game/maps/startingDungeon.ts`.
- Asset paths and frame metadata are centralized in `src/game/assets/manifest.ts` and should match files under `public/assets`.
- The project uses strict TypeScript, Next.js, React, Phaser, and pixel-art assets.

## What to flag

- Server/client boundary regressions, especially direct `window`, `document`, `Phaser`, or browser API usage outside client-only code paths.
- Phaser scene leaks: unremoved timers, tweens, input listeners, sounds, pooled objects, or references that survive shutdown/restart.
- Gameplay state bugs involving health, ammo, score, powerups, enemy spawning, collision, pathing, hit detection, invulnerability, or game-over/restart flow.
- Asset regressions: missing files, mismatched frame sizes, incorrect keys, broken audio paths, or manifest entries that drift from generated sprite-sheet metadata.
- Game-loop performance issues such as unbounded allocations in `update`, runaway object creation, excessive path recalculation, or effects that are not pooled/capped.
- Type-safety regressions: widened string keys, unsafe casts, disabled strictness, nullable Phaser objects used after destruction, or ignored async import cancellation.
- Accessibility/usability regressions for non-canvas UI, including missing labels for interactive controls or keyboard-inaccessible page-level controls.
- Deployment risks: changes that break `npm run build`, rely on undeclared environment variables, or require generated assets that are not committed.

## Review style

- Focus on correctness, regressions, and missing tests or validation steps.
- Prefer precise findings with file/line references and explain the player-visible or deployment impact.
- Do not block on broad refactors unless they are required to prevent a concrete bug.
- Treat generated binary/media assets as supporting evidence; review the code and metadata that reference them.

## Verification expectations

When relevant, expect PR authors to run:

```bash
npm run build
```

For asset or gameplay changes, also expect a short manual smoke test covering game boot, movement, firing, pickup collection, enemy contact/damage, mute toggle, game over, and restart.

## Hosted Bugbot activation

This file supplies project-specific rules. To run Bugbot on pull requests, the Cursor GitHub app must also be enabled for `https://github.com/fjg-thr/hobgoblin-dungeon` in the Cursor dashboard under Integrations and Bugbot. If API enablement is available, enable this repository with:

```json
{
  "repoUrl": "https://github.com/fjg-thr/hobgoblin-dungeon",
  "enabled": true
}
```

After activation, open or update a pull request and verify the `Cursor Bugbot` check appears. Manual triggers can be posted on a PR with `cursor review` or `bugbot run`; add `verbose=true` when diagnosing setup issues.
