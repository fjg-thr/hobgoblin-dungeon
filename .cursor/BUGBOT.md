# Cursor Bugbot Review Guidance

Use these repository rules when reviewing pull requests for the Hobgoblin Ruin
prototype. This file provides review context only; managed Bugbot enablement is
configured in Cursor's dashboard/GitHub App settings, not through a GitHub
Actions workflow in this repo.

## Managed-service setup checks

- Confirm the Cursor GitHub App has access to `fjg-thr/hobgoblin-dungeon`.
- Confirm Bugbot is enabled for the repository in the Cursor dashboard or via
  the Cursor Bugbot repo API.
- Verify a smoke-test pull request gets a `Cursor Bugbot` check or Bugbot
  review comments. If no review appears, check app installation, repository
  access, and whether the repo is configured for automatic runs or mention-only
  runs such as `cursor review` / `bugbot run`.
- Do not add CI solely to run managed Bugbot. GitHub Actions are only needed for
  separate custom review workflows.

## Project context

- This is a Next.js/React/TypeScript app that mounts a Phaser 4 dungeon game
  through `src/game/GameCanvas.tsx`.
- The main gameplay implementation is `src/game/scenes/DungeonScene.ts`.
- Map data lives in `src/game/maps/startingDungeon.ts`; asset paths and sprite
  metadata are centralized in `src/game/assets/manifest.ts`.
- Static art/audio assets live under `public/assets/**`.
- Asset generator and processor tooling lives in both `tools/**` and
  `scripts/**`. Generated binary/media assets can be large, so review diffs for
  accidental asset churn.
- Styling uses the existing CSS in `src/app/globals.css`; Tailwind is not
  configured in this project.

## Review priorities

- Preserve client-only Phaser boot behavior. Any direct browser or Phaser access
  must remain behind client boundaries and runtime checks.
- Watch for gameplay regressions in movement, aiming, collision, depth sorting,
  enemy spawning, pickups, score/ammo/life HUD, start/game-over flows, and audio
  mute behavior.
- Keep Phaser scene state reset paths complete when adding run-scoped arrays,
  timers, tweens, effects, input bindings, or sounds.
- Prefer narrow, deterministic helpers for game rules that are otherwise hard to
  inspect in the large scene file.
- Treat lockfile, dependency, package-manager, and generated asset changes as
  intentional only when the PR explicitly calls for them.
- Keep accessibility and semantic HTML review focused on the React shell and
  any DOM UI; most in-game UI is rendered by Phaser canvas.

## Known baseline quirks

- README says `Space` or `J` can fire, but the current scene binds shooting to
  `SPACE` and pointer/click firing. Do not block unrelated PRs solely on this
  existing mismatch; flag it when an input or controls-doc change touches it.
- README documents standard ammo, hearts, quickshot, haste, ward, and blast, but
  the current code also unlocks seeker ammo after four kills or 30 seconds.
- README describes blast as rare late-game, while current code unlocks blast
  after two kills or 16 seconds. Treat this as an existing docs/code mismatch
  unless a PR intentionally changes power-up progression.
- `next lint` is not a reliable verification command for current Next versions
  in this repo. Prefer `npm run build` and `npx tsc --noEmit` unless the PR adds
  a working lint setup.

## Suggested verification

- For code changes: run `npm ci`, `npm run build`, and `npx tsc --noEmit`.
- For generated assets: verify the relevant processor/generator command and
  inspect manifest dimensions, frame counts, transparent backgrounds, and file
  paths.
- For gameplay/input changes: smoke-test a local run with movement, aim/fire,
  pickups, enemy contact, restart, mute, and `F3` debug overlay.
- For docs-only or Bugbot-guidance changes: verify markdown formatting and keep
  this file concise enough for Bugbot to include as review context.
