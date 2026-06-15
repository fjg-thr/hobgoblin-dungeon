# Cursor Bugbot review guide

Use this guide when Cursor Bugbot reviews pull requests for this repository.

## Deployment scope

- This file is the repository-side Bugbot deployment artifact. It gives Bugbot project-specific context for reviews.
- Managed Bugbot activation is external to this repository. Confirm it in Cursor dashboard or organization settings, GitHub App repository access, and a PR review smoke check when those controls are available.
- If you only have repository access, state that you can verify this guidance file but cannot prove the managed Bugbot service is enabled.
- Manual PR triggers supported by Cursor public docs include a top-level PR comment with `cursor review` or `bugbot run`. Use `cursor review verbose=true` or `bugbot run verbose=true` when troubleshooting review startup.

## Project overview

- App: a Next.js, React, TypeScript, Phaser 4 browser prototype for a dark GBA-inspired isometric dungeon game.
- Main runtime scene: `src/game/scenes/DungeonScene.ts`.
- Runtime asset source of truth: `src/game/assets/manifest.ts`.
- Dungeon map generation and tile blocking live in `src/game/maps/startingDungeon.ts`.
- React shell files live under `src/app/` and `src/game/GameCanvas.tsx`.
- Styling uses `src/app/globals.css`; this repo does not currently configure Tailwind CSS or Shadcn UI.

## Review priorities

Prioritize issues that can break gameplay, builds, or deployed user experience:

1. Runtime crashes in Phaser scene lifecycle, asset loading, input handling, collision, combat, audio, or game-over/start-screen flow.
2. TypeScript or Next build failures.
3. Asset-manifest mismatches where code loads an asset key/path/metadata file that is absent or inconsistent.
4. Gameplay regressions affecting movement, aiming, shooting, enemy damage, pickups, power-ups, score, health, mute, restart, or debug overlay.
5. Browser-only API usage that can execute during server rendering before client guards run.
6. Accessibility or semantic regressions in the React shell and overlay UI.
7. Unnecessary dependency, lockfile, generated-asset, or formatting churn unrelated to the PR.

Keep findings actionable and scoped to the PR diff. Do not block unrelated PRs solely for known baseline documentation/code mismatches listed below unless the PR touches that area or makes the mismatch worse.

## Commands and verification

Useful local checks for most PRs:

```bash
npm ci
npm run build
npx tsc --noEmit
git diff --check origin/main...HEAD
```

Notes:

- `next lint` is not reliable for the current Next version in this repo; prefer the build plus `npx tsc --noEmit`.
- `npm ci` can report existing audit findings. Mention them only if the PR changes dependency posture or makes risk materially worse.
- Next type generation can rewrite `next-env.d.ts` between dev and production route type paths. Do not request a change for that generated-file churn unless the PR intentionally changes generated typing behavior.
- `tsconfig.tsbuildinfo` should not be committed.
- The package intentionally has no `npm start` script. After `npm run build`, use an appropriate Next command only when a PR adds runtime smoke infrastructure.

## Runtime and gameplay context

- Movement uses WASD or arrow keys in isometric directions.
- Current runtime firing is Space and pointer/click based. The README still mentions `J`; treat that as an existing docs/runtime mismatch unless the PR changes controls or docs.
- Staff shots consume finite standard ammo. Red shard pickups reload standard ammo.
- Seeker ammo exists in code even though the README does not document it. It unlocks after kill/time progression and uses seeker pickups/projectiles.
- Heart pickups restore missing hearts after progression milestones; they do not increase max health.
- Power-ups include quickshot, haste, ward, and blast. The README describes blast as rare late-game, but current code unlocks blast earlier than that wording implies; treat this as an existing mismatch unless the PR addresses power-up docs or balance.
- Brutes unlock after early progression and have separate enemy config, health, score, knockback, and hit-stop behavior.
- Audio runtime loading is driven by `assetManifest.audio`; `public/assets/audio/audio-manifest.json` is auxiliary and consistency-only unless a PR intentionally changes audio tooling.

## Assets and generated files

- Asset processing/generation tooling lives in both `tools/` and `scripts/`.
- Generated or processed runtime assets live under `public/assets/`.
- When PRs change asset metadata JSON, check that referenced image paths, frame dimensions, frame counts, keys, and runtime manifest entries remain consistent.
- When PRs add source image or audio generation changes, confirm generated outputs are intentionally included or intentionally omitted according to the PR description.
- Avoid requesting wholesale regenerated assets for unrelated code changes.

## Next.js and React review notes

- `src/app/page.tsx` and `src/game/GameCanvas.tsx` bridge the React app to the Phaser scene.
- Phaser should remain client-side. Watch for imports or side effects that move browser-only code into server-rendered execution.
- Keep metadata and public asset references aligned, especially OpenGraph image paths referenced from `src/app/layout.tsx`.
- Prefer semantic HTML and existing CSS patterns in `src/app/globals.css`; do not require Tailwind or Shadcn conventions unless a PR intentionally introduces that stack.

## Reporting guidance

- Lead with concrete findings ordered by severity.
- Include file and line references for each finding.
- Explain the user-visible or build/runtime impact.
- Suggest the smallest safe fix when it is clear.
- If no blocking issue is found, say so and mention any verification gaps, such as managed Bugbot enablement controls you could not access.
