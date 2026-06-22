# Cursor Bugbot review guidance

Use this file as repository-specific context when reviewing pull requests for
Hobgoblin Ruin. It deploys review instructions only; enabling Cursor Bugbot as a
managed service still requires Cursor dashboard or organization settings and
GitHub App repository access outside this repository.

## Activation and verification

- This guidance applies after it is merged to the default branch. A PR adding or
  editing this file may not be reviewed with the new rules yet.
- Manual review triggers supported by Cursor include a top-level PR comment of
  `cursor review` or `bugbot run`.
- For troubleshooting, use `cursor review verbose=true` or
  `bugbot run verbose=true` to request diagnostic details such as request IDs and
  logs. Treat verbose mode as diagnostics, not a deeper review standard.
- If repository-only changes are all that can be verified, say that managed
  Bugbot enablement still needs Cursor/GitHub App confirmation and a live PR
  smoke review.

## Repository map

- `src/app/` contains the Next.js shell, metadata, and global DOM styles.
- `src/game/scenes/DungeonScene.ts` owns the Phaser game loop, input, HUD,
  enemy pressure, pickups, projectile behavior, audio toggling, and debug
  overlay. Review this file as gameplay-critical code.
- `src/game/assets/manifest.ts` is the runtime asset source of truth. The
  auxiliary `public/assets/audio/audio-manifest.json` should stay consistent
  when audio assets change, but runtime loading follows `assetManifest.audio`.
- `tools/` and `scripts/` contain asset and audio generator/processor tooling.
  Generated PNG/JSON/WAV outputs live under `public/assets/`.

## High-priority review checks

- Gameplay changes: validate movement, collision, camera follow, enemy spawning,
  damage, pickups, ammo, power-ups, restart flow, and game-over state as a
  connected loop. Watch for state that is reset in one path but not another.
- Phaser object lifecycle: new sprites, tweens, graphics, keyboard handlers,
  timers, sounds, and pointer zones should be destroyed or made inactive on
  scene restart/shutdown. Avoid orphaned tweens or input handlers.
- Input and accessibility: keep keyboard and pointer flows working together.
  Phaser canvas controls are not normal DOM controls, so check focus behavior,
  keyboard affordances, and visible instructions for start, how-to-play, sound,
  restart, and firing interactions.
- Assets: when manifests or asset paths change, confirm the referenced files are
  committed, dimensions match frame metadata, and generator scripts remain
  reproducible. Do not assume files listed in README are loaded at runtime.
- UI/metadata: this repo does not use Tailwind. For future DOM UI, follow
  existing semantic markup and `src/app/globals.css` patterns; for current game
  UI, review Phaser canvas overlays, responsive placement, hit zones, and visual
  contrast.
- Dependency/tooling changes: keep dependency hardening separate from gameplay
  or Bugbot-guidance PRs unless explicitly requested. Do not block unrelated PRs
  solely on pre-existing audit advisories.

## Known baseline mismatches

Treat these as existing context. Flag PRs that touch the area, hide the issue, or
make it worse; do not block unrelated PRs solely because the baseline exists.

- README says `Space` or `J` can fire, but current runtime input binds shooting
  to `SPACE` plus pointer/click firing.
- README lists regular ammo, heart pickups, quickshot, haste, ward, and blast,
  but current code also unlocks seeker ammo after 4 kills or 30 seconds.
- README describes blast as rare late-game, while current code unlocks blast
  after 2 kills or 16 seconds.
- `src/app/layout.tsx` references `/opengraph-image.png`, but no matching
  committed `public/opengraph-image.png` or app `opengraph-image.*` file is
  present on this baseline.

## Suggested verification

Pick commands that match the touched surface:

- General code/config changes: `npm ci`, `npm run build`, `npx tsc --noEmit`.
- Asset processors: run the specific script touched, such as
  `npm run process:assets`, `npm run process:death-assets`,
  `npm run process:combat-juice`, `npm run generate:powerups`, or
  `npm run generate:combat-assets`.
- Gameplay changes: run the app and smoke test start screen, how-to-play modal,
  movement, click/space firing, ammo depletion/refill, one enemy kill, one
  damage event, power-up pickup, sound toggle, restart, and responsive canvas
  sizing.

Next.js 16 may rewrite `next-env.d.ts` or create `tsconfig.tsbuildinfo` during
verification. Do not include those generated changes unless the PR intentionally
changes Next type generation behavior.

## Review output expectations

Prioritize concrete correctness, regression, security, and testability findings.
Reference file paths and changed lines. Separate shipped blockers from existing
baselines, and state when a finding depends on external Cursor/GitHub App
configuration that cannot be proven from repository files alone.
