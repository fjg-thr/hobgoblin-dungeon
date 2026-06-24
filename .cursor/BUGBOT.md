# Cursor Bugbot review guide

Use this guide when Cursor Bugbot reviews pull requests for Hobgoblin Ruin
Prototype. These instructions apply after this file is merged to the default
branch; a PR that adds or changes this file may not be reviewed with the new
rules yet.

## Deployment boundary

- This file provides repository-specific review context only.
- Managed Bugbot enablement is external to the repo. Verify Cursor dashboard or
  org settings, GitHub App repository access, and at least one live PR review or
  status check when available.
- If those admin surfaces are unavailable, state that repository guidance is in
  place but managed-service activation could not be proven from this branch.

## Manual review triggers

Top-level PR comments can request a review with:

```text
cursor review
bugbot run
```

For diagnostics, use `cursor review verbose=true` or
`bugbot run verbose=true`; verbose mode is for request IDs, logs, and
troubleshooting detail, not a stricter review policy.

## Project context

- Next.js app shell with React client bootstrapping Phaser in
  `src/game/GameCanvas.tsx`.
- Main gameplay logic lives in `src/game/scenes/DungeonScene.ts`.
- Runtime asset paths live in `src/game/assets/manifest.ts`; especially use
  `assetManifest.audio` as the audio source of truth.
- Generated and processed asset tooling includes `tools/process_assets.py`,
  `tools/generate_audio_sfx.mjs`, `scripts/generate-retro-soundtrack.mjs`, and
  focused processors under `tools/`.

## Review priorities

1. Gameplay changes in `DungeonScene.ts`: preserve movement, collision,
   camera follow, spawning, ammo, seeker projectiles, heart pickups, powerups,
   audio mute behavior, and game-over/restart flow.
2. React/Next changes: keep `GameCanvas` client-only Phaser boot safe under
   React effects, avoid double game creation, and destroy Phaser cleanly on
   unmount.
3. Asset changes: keep manifest paths, public files, sprite frame sizes, JSON
   metadata, and loader keys aligned. Do not rename generated assets without
   updating all references.
4. Audio changes: check `assetManifest.audio`, generated WAV files, mute state,
   and scene-level playback together.
5. UI and accessibility: this repo does not currently use Tailwind or shadcn.
   For DOM UI, follow existing semantic HTML and `src/app/globals.css`
   patterns. For Phaser canvas UI, review pointer zones, keyboard/mouse
   affordances, responsive placement, and visible state feedback.

## Known baseline caveats

- `README.md` mentions firing with `Space` or `J`, but current runtime input
  binds shooting to `SPACE` plus pointer/click firing. Only block PRs that
  touch controls/docs and make this mismatch worse.
- README powerup text does not document seeker ammo, while the code unlocks
  seeker pickups/projectiles after progression thresholds.
- README describes blast as rare late-game, but `POWERUP_CONFIG` currently
  unlocks blast earlier. Treat this as a baseline docs/code mismatch unless a
  PR intends to fix powerup balancing or documentation.
- `src/app/layout.tsx` references `/opengraph-image.png`; the baseline may not
  include that public asset. Block only metadata/share-image changes that worsen
  the issue.
- `npm ci` may report existing audit advisories from current dependencies.
  Do not fail unrelated PRs solely on that baseline; do flag new dependency
  risk or lockfile churn.
- `next lint` is not reliable for this Next version. Prefer build and TypeScript
  verification.

## Expected verification

For most code changes, ask for:

```bash
npm ci
npm run build
npx tsc --noEmit
```

For asset/audio generator changes, also ask for the exact touched generator or
processor command, such as:

```bash
node tools/generate_audio_sfx.mjs
node scripts/generate-retro-soundtrack.mjs
python3 tools/process_assets.py
```

Generated verification can rewrite `next-env.d.ts` route imports or create
`tsconfig.tsbuildinfo`; those should not remain dirty unless the PR explicitly
changes generated typing behavior.

## Review style

- Lead with concrete correctness, regression, security, accessibility, and test
  coverage findings.
- Cite exact files and lines, and distinguish new regressions from the known
  baseline caveats above.
- Keep suggestions scoped to the PR. Avoid broad refactors, dependency upgrades,
  or asset regeneration unless required by the change under review.
