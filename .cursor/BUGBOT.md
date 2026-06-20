# Bugbot review rules for Hobgoblin Ruin

Use these repository-specific rules when reviewing pull requests for this
Next.js, React, TypeScript, and Phaser game prototype.

## Deployment and trigger context

- Cursor Bugbot is a managed Cursor/GitHub App service. This file gives Bugbot
  project context, but it does not by itself prove that the service is enabled.
- To verify the deployment, confirm the repository is enabled in the Cursor
  dashboard, the Cursor GitHub App has access to `fjg-thr/hobgoblin-dungeon`,
  and a pull request receives a Bugbot review or status check.
- Manual review triggers must be top-level PR comments containing `cursor review`
  or `bugbot run`. For troubleshooting, use `cursor review verbose=true` or
  `bugbot run verbose=true`.
- Bugbot applies the root `.cursor/BUGBOT.md` after it is present on the default
  branch. A PR that adds or changes this file may not be reviewed with the new
  rules until after merge.

## Project map

- `src/app/`: Next.js App Router shell and metadata.
- `src/game/GameCanvas.tsx`: client-side React/Phaser integration and cleanup.
- `src/game/scenes/DungeonScene.ts`: main Phaser scene, gameplay state,
  spawning, input, projectiles, UI overlays, audio, and debug rendering.
- `src/game/maps/startingDungeon.ts`: generated dungeon map data and tile flags.
- `src/game/assets/manifest.ts`: runtime asset source of truth for Phaser loads.
- `public/assets/`: committed sprite sheets, JSON frame data, tile art, effects,
  UI assets, and audio files.
- `tools/` and `scripts/`: local asset/audio generation and processing utilities.

## Highest-priority review areas

### React and Phaser lifecycle

- In `GameCanvas.tsx`, flag duplicate Phaser boot paths, missing dynamic import
  guards, stale refs, or incomplete destroy/cleanup logic on unmount.
- In `DungeonScene.ts`, verify timers, tweens, keyboard listeners, pointer
  handlers, audio objects, groups, graphics layers, and debug overlays are
  cleaned up or safely recreated across scene restarts.
- Treat React Strict Mode double-invocation risks as important because
  `next.config.ts` enables `reactStrictMode`.

### Gameplay correctness

- Review collision, tile occupancy, spawn placement, pathing, projectile travel,
  enemy melee/contact damage, pickup collection, and camera/player bounds for
  off-by-one and coordinate-space bugs.
- Be suspicious of changes that mix screen coordinates, world coordinates,
  isometric tile coordinates, and sprite origins without explicit conversion.
- Check progression gates, cooldowns, invulnerability windows, scoring, ammo,
  and power-up timers for edge cases at zero health, empty ammo, pause/restart,
  simultaneous pickups, or scene transitions.
- Hot loops in `update()` and enemy/projectile iteration should avoid avoidable
  allocations and unbounded searches when simple cached state already exists.

### Asset and manifest contracts

- Runtime assets are loaded from `src/game/assets/manifest.ts`. If a PR touches
  asset paths, keys, frame names, audio references, or generated JSON, verify the
  manifest, Phaser preload code, and committed `public/assets/**` files remain
  consistent.
- Do not flag generated art/audio files solely for size, style, or lack of tests.
  Do flag missing paired PNG/JSON files, mismatched frame dimensions, wrong
  frame names, invalid JSON, missing alpha handling, or references to files that
  are not committed.
- `public/assets/audio/audio-manifest.json` is auxiliary consistency data; the
  runtime audio source of truth is `assetManifest.audio`.

### Next.js, TypeScript, and DOM UI

- Preserve strict TypeScript. Avoid `any`, unsafe casts, and null assertions
  unless the surrounding invariant is obvious and stable.
- Prefer focused module-level constants and descriptive handler names over
  expanding already-large scene methods with hidden mutable state.
- This project does not use Tailwind or shadcn. For DOM-level UI changes, follow
  existing semantic HTML and `src/app/globals.css` patterns.
- For Phaser canvas UI, review keyboard/mouse affordances, pointer hit zones,
  responsive placement, text contrast, and restart/mute/how-to-play interaction.

## Existing baseline mismatches

Do not block unrelated PRs solely for these existing issues, but mention them if
the PR touches the relevant behavior or documentation:

- README says `Space` or `J` fires; current runtime firing is `Space` plus
  pointer/click controls.
- README documents quickshot, haste, ward, and blast, but current code also has
  seeker ammo unlock behavior.
- README describes blast as a rare late-game power-up; current code unlocks it
  earlier through `POWERUP_CONFIG.blast`.
- `src/app/layout.tsx` references OpenGraph image metadata. Verify the matching
  public asset only when metadata or public share assets change.
- `npm run lint` uses `next lint`, which is not reliable with current Next
  versions. Prefer `npm run build` and `npx tsc --noEmit` for this baseline.

## Suggested checks for risky changes

- For app, scene, or manifest changes: run `npm run build` and
  `npx tsc --noEmit`.
- For package or lockfile changes: run `npm ci` first, then build/typecheck.
  Existing dependency audit findings should be reported separately from the
  reviewed diff unless the PR changes dependencies.
- For asset generator changes: run the specific `npm run generate:*`,
  `npm run process:*`, or `node scripts/...` command relevant to the touched
  file, then inspect the generated file list.
- After build/typecheck, expect possible generated local churn in
  `next-env.d.ts` or `tsconfig.tsbuildinfo`; restore or remove generated
  artifacts unless the PR intentionally changes them.

## Review output expectations

- Prioritize concrete bugs, regressions, missing cleanup, broken asset contracts,
  and risky gameplay edge cases over style-only comments.
- Ground findings in exact files and changed behavior. Avoid speculative
  comments when the diff does not affect the relevant subsystem.
- Suggest minimal fixes that match the existing architecture. Do not propose a
  large scene rewrite unless the PR already attempts one or introduces a defect
  that cannot be fixed locally.
