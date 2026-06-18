# Cursor Bugbot review guidance

Use this file as repository-specific context when Cursor Bugbot reviews pull
requests for Hobgoblin Ruin Prototype.

## Deployment scope

- This file deploys repository-side review guidance only. Enabling the hosted
  Cursor Bugbot service is managed outside this repo through Cursor dashboard or
  organization settings plus GitHub App repository access.
- After this file is merged to the default branch, Bugbot should use it for
  future reviews. A pull request that adds or edits this file may not be
  reviewed with the new guidance yet.
- Manual review triggers supported by Cursor docs include top-level PR comments
  such as `cursor review` or `bugbot run`. For troubleshooting, use
  `cursor review verbose=true` or `bugbot run verbose=true`.

## Project map

- Next.js App Router entry point: `src/app/page.tsx`.
- Root metadata and global styles: `src/app/layout.tsx` and
  `src/app/globals.css`.
- `src/app/page.tsx` renders the client-only `GameCanvas` component.
- `src/game/GameCanvas.tsx` dynamically imports Phaser and
  `src/game/scenes/DungeonScene.ts` inside `useEffect`, then creates the Phaser
  game instance.
- Primary gameplay behavior lives in `src/game/scenes/DungeonScene.ts`.
- Dungeon layout data lives in `src/game/maps/startingDungeon.ts`.
- Runtime asset and audio source of truth is `src/game/assets/manifest.ts`.
  `public/assets/audio/audio-manifest.json` is auxiliary consistency data, not
  what the scene loads directly.
- Generated asset and audio tooling lives in both `tools/` and `scripts/`.

## Review priorities

Prioritize issues that can change shipped behavior or break the playable
prototype:

1. Client/server boundaries in Next.js. Phaser must stay client-only; do not
   introduce static imports or server-rendered code paths that touch browser-only
   APIs.
2. Gameplay regressions in movement, aiming, shooting, enemy spawning, pickups,
   scoring, life/ward handling, game-over flow, and restart flow.
3. Asset manifest consistency. When asset paths, frame dimensions, keys, or
   generated sheets change, verify the manifest and Phaser load/anims usage stay
   in sync.
4. Audio lifecycle and mute behavior. Audio should respect the scene-level mute
   toggle and avoid repeated overlapping loops on restarts.
5. Pointer, keyboard, and overlay interactions. Start screen, how-to-play modal,
   mute button, and restart zones should not leak input handlers across scene
   shutdown or restart.
6. Performance-sensitive gameplay loops. Be careful with per-frame allocations,
   unbounded arrays/tweens/timers, and effects that are not destroyed.
7. Metadata and public assets. If OpenGraph, Twitter card, or public asset
   inventory changes, ensure referenced files exist and dimensions/alt text are
   still accurate.

## Known baseline context

Do not block unrelated pull requests solely for these existing mismatches, but
do call them out when a PR touches the relevant area:

- `README.md` says `Space` or `J` fires. Current runtime input binds `SPACE`
  and pointer/click firing; it does not bind `J`.
- `README.md` describes blast as a rare late-game power-up. Current
  `POWERUP_CONFIG.blast` unlocks after 2 kills or 16 seconds.
- Runtime code includes seeker ammo and seeker projectiles that unlock after
  4 kills or 30 seconds, but the README does not document seeker ammo.
- `src/app/layout.tsx` references `/opengraph-image.png`; this branch does not
  contain an `opengraph-image.*` file under `public/` or `src/app/`.
- The repo does not currently configure Tailwind CSS. Review UI changes against
  existing semantic markup and `src/app/globals.css` patterns rather than
  assuming Tailwind utilities are available.

## Verification guidance

For code changes, prefer checks that match the touched surface:

- `npm ci`
- `npm run build`
- `npx tsc --noEmit`
- Focused runtime smoke check of the game when input, scene lifecycle, assets,
  or rendering behavior changes.

Notes:

- `next lint` is present in `package.json`, but modern Next versions no longer
  reliably support it in this repo. Prefer build and TypeScript checks unless a
  PR intentionally updates lint tooling.
- Build/typecheck may rewrite `next-env.d.ts` or create `tsconfig.tsbuildinfo`;
  these generated artifacts should not be included unless the PR intentionally
  changes generated typing behavior.
- The package intentionally has no `npm start` script.

## Review output expectations

- Lead with concrete bugs, regressions, security issues, or missing tests.
- Include file and line references for each finding.
- Distinguish existing baseline issues from regressions introduced by the pull
  request.
- Avoid broad refactor requests unless they directly reduce risk in the changed
  code.
- If no issues are found, say so and mention any residual test or smoke-check
  gaps.

## Managed-service verification

Repository files cannot prove that hosted Bugbot is enabled. When access is
available, confirm all of the following outside this branch:

- Cursor dashboard or organization settings enable Bugbot for this repository.
- The Cursor GitHub App has access to `fjg-thr/hobgoblin-dungeon`.
- A live pull request can trigger a Bugbot review, either automatically or with
  a manual `cursor review` / `bugbot run` comment.
