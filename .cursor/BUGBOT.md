# Bugbot review guidance

This repository is a Next.js App Router game prototype that embeds a Phaser dungeon scene. Use this file as project-specific context when reviewing pull requests.

## Review priorities

- Look for runtime bugs in `src/game/scenes/DungeonScene.ts`, especially combat, collisions, enemy spawning, pickups, projectile lifecycle, timers, score/state transitions, and game-over/restart behavior.
- Check React and Phaser lifecycle boundaries in `src/game/GameCanvas.tsx`. Flag duplicate Phaser game instances, missing teardown, stale DOM references, or work that should only run on the client.
- Check Next.js client/server boundaries in `src/app`. Phaser code must stay behind client-only imports/components.
- Check TypeScript changes for strictness regressions, unsafe casts, nullable state access, and event/listener cleanup issues.
- For asset manifest changes, verify that referenced files exist under `public/assets` and that frame dimensions, frame counts, and keys match the consuming code.
- For gameplay documentation changes, compare README claims against the actual constants and behavior in `DungeonScene.ts`.

## Known project context

- Runtime audio and image loading is driven by `src/game/assets/manifest.ts`.
- `public/assets/audio/audio-manifest.json` is auxiliary metadata; do not treat it as the runtime source of truth unless the PR changes loader behavior.
- Generated asset files live under `public/assets`. The generator and processor tooling lives under `tools/` and `scripts/`.
- The game currently supports movement with WASD/arrow keys, firing with Space, and pointer/click firing.
- Some README gameplay details may lag code behavior. Existing mismatches should not block unrelated PRs unless the PR edits the relevant code or docs.
- This repo does not use TailwindCSS. Prefer existing semantic markup and `src/app/globals.css` patterns for UI styling feedback.

## Ignore or de-prioritize

- Pixel-art aesthetics, sprite naming preferences, or subjective art direction unless a code path is broken.
- Large generated files under `public/assets` unless they are directly referenced by changed code or manifests.
- Lockfile churn only when it is the expected result of dependency changes. Do flag unexplained dependency or package-manager drift.
- Asset-generation prompt wording unless it affects a generated file or documented workflow.

## Verification expectations

- For code changes, prefer `npm run build` or `npx tsc --noEmit` when available in the PR environment.
- `next lint` may not be reliable for this project baseline; do not require it as the only validation signal.
- For gameplay changes, ask for a concise manual smoke check that covers page load, player movement, shooting, enemy collisions, pickups/powerups, and restart/game-over behavior.
- For asset changes, check that JSON manifests parse and that all referenced assets are present in the repository.

## Comment style

- Leave inline comments only when there is a concrete bug, regression risk, broken invariant, or missing verification that could hide a bug.
- Keep comments specific to the changed diff and include the user-visible or runtime impact.
- Avoid broad style nits, speculative rewrites, or requests for unrelated cleanup.
- If no bugs are found, a summary is optional; do not add noise to the PR.

## Managed Bugbot enablement

Bugbot itself is enabled outside this repository through Cursor's dashboard and GitHub integration. This file only provides review context.

To verify deployment, confirm:

1. The GitHub repository is connected in the Cursor dashboard.
2. Bugbot is enabled for this repository in the dashboard.
3. The Cursor/Bugbot GitHub App has repository access.
4. A pull request can trigger a review automatically or by a top-level comment such as `cursor review` or `bugbot run`.

For verbose troubleshooting on a pull request, use `cursor review verbose=true` or `bugbot run verbose=true`.
