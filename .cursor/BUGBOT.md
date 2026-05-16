# Cursor Bugbot Review Guidance

Use this repository-specific guidance when reviewing pull requests for the Hobgoblin Ruin Prototype. The project is a Next.js App Router application with a client-only Phaser game scene, generated pixel-art/audio assets, and TypeScript gameplay logic.

## Review priorities

- Treat runtime regressions as high impact: the prototype has very little UI outside the canvas, so crashes during scene boot, preload, update loops, input handling, or asset loading usually block the whole app.
- Prefer comments that identify concrete behavioral risk with a reproducible path. Avoid broad style suggestions unless they reveal a bug, a missed invariant, or maintainability risk in changed code.
- Check that changes fit the existing patterns in `src/game/scenes/DungeonScene.ts`, `src/game/assets/manifest.ts`, `src/game/maps/startingDungeon.ts`, `src/game/GameCanvas.tsx`, and `src/app`.
- Do not require full architectural rewrites for narrow gameplay or asset changes. Suggest small, localized fixes when possible.

## Next.js and React boundaries

- `src/game/GameCanvas.tsx` is the client boundary for Phaser. Flag any import path or top-level code that can evaluate Phaser, `window`, `document`, canvas APIs, or browser-only asset code from a Server Component.
- `src/app/page.tsx` and `src/app/layout.tsx` should remain compatible with Next.js App Router rendering. Metadata and static assets referenced by metadata must exist in `public`.
- Watch for accidental hydration or lifecycle issues: duplicate Phaser game instances, missing cleanup in React effects, unstable dependencies that recreate the game unexpectedly, or event listeners that survive unmounts.

## Phaser scene lifecycle

- Asset keys in preload/create code must match `GAME_ASSETS` entries and files under `public/assets`. Missing PNG/JSON/audio pairs are user-facing startup failures.
- Ensure generated texture, animation, timer, tween, input, audio, and event resources are cleaned up or safely reused across scene restarts.
- Verify code does not assume a browser API before Phaser or React has mounted the canvas.
- Be skeptical of changes that mutate shared Phaser objects from delayed callbacks after shutdown or restart.

## Gameplay invariants

- Health, ammo, score, enemy counts, power-up state, invulnerability, and game-over state should have single clear sources of truth. Flag desynchronization between HUD text/sprites and gameplay state.
- Movement and aiming should preserve the existing isometric coordinate assumptions. Check conversions between world, screen, tile, and pointer coordinates.
- Collision, enemy contact, projectile impact, pickup collection, and wall bounds should remain deterministic enough for a fast update loop. Flag changes that introduce frame-rate-dependent damage or repeated pickup/projectile triggers.
- Progression gates for brutes, hearts, quickshot, haste, ward, and blast should not allow impossible states such as negative ammo, health above max, permanently active temporary effects, or enemies spawning outside navigable space.

## Performance and update-loop safety

- The Phaser update loop should avoid avoidable allocations, repeated asset lookups, unbounded arrays, and expensive scans that scale with elapsed play time.
- Timers, tweens, particles, audio, and transient sprites should be bounded and destroyed when they finish.
- Procedural generation and asset-processing utilities should not be pulled into the browser bundle unless intentionally used at runtime.

## Assets and generated content

- When asset JSON or manifests change, verify the corresponding images/audio files are present and committed. Keep dimensions, frame counts, frame names, and animation definitions consistent.
- Generated asset scripts in `tools/` and `scripts/` should remain deterministic enough for review. Flag hard-coded absolute paths, missing source file checks, or outputs that differ from manifest expectations.
- The repository currently has both `package-lock.json` and `pnpm-lock.yaml`. Flag dependency changes that update only one lockfile unless the change intentionally standardizes package management.

## Accessibility and UX

- React controls should use semantic elements or complete keyboard and ARIA support.
- Phaser/canvas UI should preserve keyboard-accessible gameplay paths where they already exist, including start, how-to-play, mute, restart, and firing controls.
- Audio changes should respect the scene-level mute state and avoid unexpectedly starting overlapping loops.

## Suggested verification for relevant changes

Ask authors to run the commands that match the risk of their change:

```bash
npm ci
npm run build
npx tsc --noEmit --incremental false
```

For asset or metadata changes, also verify referenced files exist, for example:

```bash
test -f public/opengraph-image.png
git ls-files --error-unmatch public/opengraph-image.png
```

`npm run lint` currently maps to `next lint`, which is not an integrated subcommand under the lockfile-resolved Next.js 16 CLI in this repo. Prefer the build and TypeScript checks above until linting is migrated to an explicit ESLint command/configuration.

## Comment style

- Lead with the observable issue and why it matters to this game.
- Include file and line references when possible.
- Separate blockers from polish. If a concern depends on assumptions outside the diff, state that explicitly.
- Avoid suggesting new frameworks or dependencies unless the current code cannot safely solve the issue.
