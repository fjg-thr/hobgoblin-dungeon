# Cursor Bugbot review guidance

This repository uses Cursor Bugbot for pull-request review context. The managed
Bugbot service is enabled outside this repository through Cursor organization
settings and GitHub App repository access; this file only supplies repo-specific
instructions for reviews after it is merged to the default branch.

## Running reviews

- Automatic PR reviews depend on the managed Cursor Bugbot deployment.
- Manual top-level PR comments can request a review with `cursor review` or
  `bugbot run`.
- For troubleshooting, use `cursor review verbose=true` or
  `bugbot run verbose=true`.
- If the service does not respond, verify Cursor dashboard settings, GitHub App
  repository access, and that Bugbot is enabled for this repository.

## Project map

- This is a Next.js App Router game prototype with React and Phaser.
- `src/app/page.tsx` renders the client-only `GameCanvas`.
- `src/game/GameCanvas.tsx` dynamically imports Phaser and `DungeonScene` in
  `useEffect`, so browser-only APIs should stay out of server components.
- `src/game/scenes/DungeonScene.ts` owns gameplay, input, spawning, combat,
  pickups, audio playback, and most runtime state.
- `src/game/assets/manifest.ts` is the runtime source of truth for image,
  spritesheet, UI, projectile, pickup, power-up, and audio assets.
- `public/assets/audio/audio-manifest.json` is auxiliary consistency data; do
  not treat it as the loader source of truth unless runtime code changes too.
- Asset generation and processing tools live in both `tools/` and `scripts/`.
- Global styling is in `src/app/globals.css`; there is no Tailwind
  configuration in this repo.

## Review priorities

Prioritize findings that would break shipped behavior or likely regress the
browser game:

1. Server/client boundary mistakes, especially importing Phaser or touching
   `window`, `document`, canvas, audio, or pointer APIs outside client-only
   code.
2. Runtime asset path or manifest drift between `assetManifest`, files under
   `public/assets`, spritesheet frame sizes, and code that creates animations.
3. Gameplay regressions in `DungeonScene`: movement, collision, aiming, finite
   ammo, seeker ammo, power-ups, enemy spawning, damage, hearts, game-over flow,
   mute state, and debug controls.
4. Next metadata, route typing, and generated-file churn.
5. Accessibility or semantic regressions in any React UI outside the Phaser
   canvas.

Keep findings actionable and scoped to the PR diff. Do not block unrelated PRs
solely for known baseline mismatches listed below.

## Known baseline context

- README says `Space` or `J` fires; current runtime binds keyboard firing to
  `Space` and supports pointer/click firing. Flag only PRs that touch input,
  controls docs, or user-facing control hints.
- README describes blast as rare late-game, but current runtime unlocks blast
  after 2 kills or 16 seconds (`POWERUP_CONFIG.blast`).
- README documents regular ammo and power-ups but omits seeker ammo; runtime
  unlocks seeker ammo after 4 kills or 30 seconds.
- `src/app/layout.tsx` references `/opengraph-image.png`, and this branch has
  no `opengraph-image.*` asset. Flag only PRs touching metadata, OpenGraph, or
  public asset inventory unless the PR makes the mismatch worse.
- The package has no `npm start` script. Do not require `npm start` as a
  verification step unless a PR intentionally adds runtime smoke tooling.
- `next lint` is not reliable with current Next versions. Prefer build and
  TypeScript checks.

## Verification guidance

For code changes, request the narrowest useful checks from the contributor:

```bash
npm ci
npm run build
npx tsc --noEmit
```

For docs-only or Bugbot-guidance-only changes, `git diff --check` is usually
sufficient. If build/typecheck rewrites `next-env.d.ts` or generates
`tsconfig.tsbuildinfo`, those generated artifacts should not be committed unless
the PR intentionally changes generated typing behavior.

## Review output expectations

- Lead with bugs, regressions, security risks, or missing tests.
- Include exact file and line references when possible.
- Distinguish existing baseline issues from PR-introduced problems.
- Prefer concise findings with concrete reproduction or verification steps.
- If no issues are found, say so and mention any residual verification gaps.
