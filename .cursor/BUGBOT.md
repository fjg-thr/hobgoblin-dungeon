# Cursor Bugbot Review Guide

Use this guide when reviewing pull requests for the Hobgoblin Ruin prototype.
Repository files can provide review context, but they do not prove that the
hosted Cursor Bugbot service is enabled. Confirm deployment through Cursor
dashboard or organization settings, GitHub App repository access, and a live PR
smoke review when those controls are available.

## Project shape

- Next.js app router with React and TypeScript.
- Phaser canvas game lives mostly in `src/game/scenes/DungeonScene.ts`.
- Map generation and source-of-truth gameplay data live in `src/game/maps` and
  `src/game/assets/manifest.ts`.
- Visual/audio assets under `public/assets` are runtime inputs. Generator and
  processing scripts live in `tools/` and `scripts/`.

## Review priorities

1. Gameplay regressions: movement, collision, camera follow, enemy spawn and
   damage loops, pickup collection, score/ammo/life state, restart flow, and
   Phaser object cleanup.
2. React/Next integration: client-only Phaser initialization, canvas sizing,
   hydration safety, metadata changes, and generated Next type files.
3. Asset integrity: manifest keys, frame dimensions, preload paths, audio keys,
   and consistency between generated JSON and PNG/WAV files.
4. Accessibility and UX where DOM UI is touched. This repo does not currently
   use Tailwind or shadcn; follow existing `src/app/globals.css` patterns unless
   a PR intentionally introduces a UI framework.
5. Dependency and tooling changes: keep package-manager changes scoped and call
   out security audit movement separately from gameplay review.

## Known baseline mismatches

- README says `Space` or `J` fires, while the current runtime keyboard binding
  is `SPACE`; pointer/click firing also exists. Do not block unrelated PRs only
  for this mismatch.
- Code includes seeker ammo unlock and pickup behavior that README does not
  document. Treat it as existing code-defined behavior unless a PR changes ammo
  or documentation.
- README describes blast as rare late-game, while current code unlocks blast
  earlier via `POWERUP_CONFIG.blast`. Scope comments to PRs touching powerups or
  gameplay docs.
- `src/app/layout.tsx` references `/opengraph-image.png`; only block PRs that
  alter metadata/share-image behavior or make the existing baseline worse.

## Verification to request or run

Prefer commands that match the current repo baseline:

```bash
npm ci
npm run build
npx tsc --noEmit
git diff --check
```

`next lint` is not reliable with the current Next version. Verification can
rewrite `next-env.d.ts` or create `tsconfig.tsbuildinfo`; those files should be
restored or removed unless the PR intentionally changes generated typing
behavior. Existing npm audit advisories may appear in dependency installs, so
only block when a PR introduces new or worsened risk.

For asset or audio PRs, also inspect the relevant generator or processor script,
for example `tools/generate_audio_sfx.mjs`,
`scripts/generate-retro-soundtrack.mjs`, or the matching `tools/process_*.mjs`
and `.py` files.

## Manual Bugbot triggers

After this guide is merged to the default branch, reviewers can request a hosted
Bugbot pass on a PR with a top-level comment:

```text
cursor review
```

or:

```text
bugbot run
```

For diagnostics, use `cursor review verbose=true` or
`bugbot run verbose=true` to request additional request IDs or log detail.
