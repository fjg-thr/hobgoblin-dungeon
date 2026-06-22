# Cursor Bugbot Review Guide

Use this file as repository-specific context when Bugbot reviews pull requests for the Hobgoblin Ruin prototype.

## Deployment boundary

- This file gives Bugbot review guidance after it is merged to the default branch.
- Hosted Bugbot enablement is external to this repo. Verify it in Cursor dashboard/org settings, confirm the Cursor GitHub App has access to `fjg-thr/hobgoblin-dungeon`, then smoke-check a live PR review.
- If dashboard or GitHub App access is unavailable, report that repository guidance was deployed but managed Bugbot activation could not be proven from git alone.
- Manual PR triggers supported by Cursor docs: `cursor review` or `bugbot run`. Use `cursor review verbose=true` or `bugbot run verbose=true` only for diagnostics such as request IDs and troubleshooting logs.

## Project context

- Next.js + React shell with a Phaser canvas game.
- Runtime game behavior is concentrated in `src/game/scenes/DungeonScene.ts`.
- Runtime asset loading is driven by `src/game/assets/manifest.ts`; `public/assets/audio/audio-manifest.json` is auxiliary consistency data, not the scene loader source of truth.
- Generated and processed asset/audio tooling lives under `tools/` and `scripts/`, including `tools/generate_audio_sfx.mjs` and `scripts/generate-retro-soundtrack.mjs`.
- Styling is plain CSS in `src/app/globals.css`; Tailwind is not configured in this repo.

## Review priorities

1. **Gameplay correctness:** movement, aiming, projectile lifecycle, enemy damage/death, pickup collection, score/ammo/life state, game-over/restart flow, and difficulty ramping.
2. **Phaser lifecycle safety:** avoid leaking tweens, timers, sprites, sounds, input handlers, or scene-owned arrays across restart/shutdown.
3. **Asset manifest consistency:** changed asset keys, frame sizes, frame counts, paths, animation rows, and generated metadata must match files in `public/assets`.
4. **Input and canvas UX:** check keyboard/mouse affordances, pointer hit zones, responsive canvas sizing, text readability, and overlay depth/order. DOM accessibility rules apply to DOM UI; Phaser-only UI needs equivalent keyboard/pointer usability where feasible.
5. **Next.js metadata/build behavior:** metadata image paths, route typing, server/client boundaries, and generated files should stay consistent.

## Known baselines

- `npm ci` currently succeeds but reports 2 existing audit findings (1 moderate, 1 high); do not block unrelated PRs solely for that baseline unless dependency/tooling changes make it worse.
- `npm run lint` is not reliable for this Next.js version. Prefer `npm run build` and `npx tsc --noEmit`.
- `npm run build` or `npx tsc --noEmit` may rewrite `next-env.d.ts` and create `tsconfig.tsbuildinfo`; those generated artifacts should not be committed unless the task intentionally changes generated typing behavior.
- `src/app/layout.tsx` references `/opengraph-image.png`, but no matching app/public image exists on the current baseline. Block PRs that touch metadata/share-image behavior and fail to address or preserve this intentionally; do not block unrelated PRs solely for the existing gap.
- README says `Space` or `J` fires, but current runtime binding uses `Space` plus pointer/click firing. Treat this as an existing docs/code mismatch unless an input/control PR touches it.
- README omits seeker ammo, while the game currently unlocks seeker pickups/projectiles after progression. Review seeker behavior against code-defined behavior unless a docs PR is updating README.
- README describes blast as a rare late-game power-up, while current code unlocks blast after 2 kills or 16 seconds. Treat that as an existing docs/code mismatch unless a PR intentionally changes power-up progression.

## Suggested verification

- `npm ci`
- `npm run build`
- `npx tsc --noEmit`
- For gameplay PRs, also run a browser smoke check: start the game, move with WASD/arrows, fire with Space and click, collect ammo/powerups, survive enemy contact, toggle sound, restart after game over, and confirm no console errors.
- For asset-generation PRs, run the specific generator/processor script touched by the PR and confirm manifest dimensions/paths match produced files.
