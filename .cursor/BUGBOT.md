# Cursor Bugbot review guidance

Use this file as repository-specific context when reviewing pull requests for the
Hobgoblin Ruin prototype.

## Deployment and trigger boundaries

- Cursor Bugbot is a managed Cursor service. This repository file gives Bugbot
  review context, but it cannot prove that the hosted service is enabled.
- Verify hosted enablement outside the repo when possible:
  - Cursor dashboard or organization settings have Bugbot enabled.
  - The Cursor/Bugbot GitHub App has access to `fjg-thr/hobgoblin-dungeon`.
  - A live pull request receives a Bugbot review or responds to a manual trigger.
- Manual PR review triggers supported by Cursor docs include top-level comments
  such as `cursor review` or `bugbot run`. For troubleshooting, use
  `cursor review verbose=true` or `bugbot run verbose=true`.
- Guidance in this file applies after it is merged to the default branch. A PR
  adding or changing this file may be reviewed using previously deployed rules.

## Project map

- App framework: Next.js app router with React and TypeScript.
- Runtime game engine: Phaser scene mounted from React.
- Main gameplay file: `src/game/scenes/DungeonScene.ts`.
- React shell: `src/app/page.tsx`, `src/app/layout.tsx`,
  `src/game/GameCanvas.tsx`.
- Map and asset sources: `src/game/maps/startingDungeon.ts`,
  `src/game/assets/manifest.ts`, and files under `public/assets`.
- Asset/audio generators and processors live under both `tools/` and `scripts/`.
  Treat generated outputs and manifests as coupled changes.

## Review priorities

1. Runtime correctness in the Phaser scene: scene lifecycle, timers, tweens,
   input handlers, physics/collision checks, cleanup, and restart/game-over
   state transitions.
2. React integration safety: client-only Phaser usage, no server-side access to
   browser globals, stable mount/unmount behavior, and no duplicate game
   instances after React remounts.
3. Gameplay consistency: ammo, power-up unlocks, heart restoration, enemy spawn
   ramps, score updates, invulnerability/ward behavior, and pointer/keyboard
   controls.
4. Asset/audio consistency: manifest entries, JSON frame names, source PNG/WAV
   paths, generated sprite dimensions, preload keys, and runtime loader usage.
5. TypeScript and build health: strict type errors, stale generated artifacts,
   Next.js route/type generation side effects, and dependency-lock consistency.

## Known existing context

Do not block unrelated PRs solely for these existing mismatches. Call them out
only when a PR touches the related code, docs, metadata, or assets.

- README says `Space` or `J` fires, but current runtime firing is bound to
  `Space` and pointer/click firing.
- README describes blast as a rare late-game power-up, while current code
  unlocks blast earlier via `POWERUP_CONFIG.blast`.
- Runtime code includes seeker ammo/projectiles that are not fully described in
  README power-up documentation.
- `src/app/layout.tsx` references `/opengraph-image.png`; that file is
  currently absent. Treat this as existing context unless a PR changes metadata,
  OpenGraph behavior, or public asset inventory.
- `public/assets/audio/audio-manifest.json` is useful for consistency checks, but
  runtime audio loading is driven by `assetManifest.audio` in
  `src/game/assets/manifest.ts`.
- The repo does not currently configure Tailwind CSS. Prefer existing semantic
  markup and `src/app/globals.css` patterns over Tailwind-specific expectations.

## Review heuristics

- For Phaser changes, look for leaked listeners/timers/tweens and stale object
  references after scene shutdown, restart, or game-over transitions.
- For input changes, verify keyboard and pointer paths remain consistent and
  accessible through the current game canvas flow.
- For asset changes, ensure every manifest entry has a matching public file and
  every loaded key has matching frame data. If generated assets change, check
  that source prompts/processors and output JSON/PNG pairs stay in sync.
- For audio changes, check both mute-state behavior and loader key consistency.
- For UI/metadata changes, prefer accessible semantic HTML and existing CSS
  conventions. Do not require shadcn/ui or Tailwind unless the PR intentionally
  introduces that stack.
- For dependencies, keep `package.json`, `package-lock.json`, and `pnpm-lock.yaml`
  consistent. Avoid broad dependency churn in gameplay or guidance-only PRs.
- If verification dirties generated files such as `next-env.d.ts` or creates
  `tsconfig.tsbuildinfo`, make sure the PR intentionally includes them before
  treating them as part of the change.

## Suggested verification

Use the narrowest verification that matches the PR scope. For broad or shared
runtime changes, prefer:

```bash
npm ci
npm run build
npx tsc --noEmit
```

For guidance-only or documentation changes, also check:

```bash
git diff --check origin/main...HEAD
test -s .cursor/BUGBOT.md
```

Notes for this repo:

- `next lint` is not reliable with the current Next.js version and package
  scripts; do not require it as the only lint signal.
- `npm ci` may report existing audit findings. Distinguish pre-existing audit
  output from vulnerabilities introduced by the PR.
- This package intentionally has no `npm start` script. Runtime smoke testing
  should use an appropriate Next command or dedicated smoke script only when the
  PR introduces that infrastructure.

## Review output expectations

- Lead with concrete, actionable findings ordered by severity.
- Cite file paths and line numbers when possible.
- Separate pre-existing context from regressions introduced by the PR.
- Avoid blocking on style preferences unless they create maintainability,
  accessibility, correctness, or user-facing risks.
