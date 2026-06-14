# Cursor Bugbot Review Guidance

Use this file as repository-specific context when reviewing pull requests for
`fjg-thr/hobgoblin-dungeon`. This repo is a client-rendered Next.js/React
prototype that embeds a Phaser dungeon game in `src/game`.

## Review priorities

1. **Client-only game runtime**
   - Phaser code must stay behind client boundaries. Do not introduce browser,
     canvas, audio, or `window` access into server components or metadata code.
   - Check React lifecycle cleanup in `src/game/GameCanvas.tsx` and scene setup in
     `src/game/scenes/DungeonScene.ts`; repeated mounts should not leave duplicate
     Phaser games, timers, listeners, tweens, sounds, or input handlers.
   - Avoid broad scene rewrites unless the PR is intentionally changing gameplay
     architecture.

2. **Gameplay invariants**
   - Review movement, aiming, projectile, pickup, health, scoring, spawn, and
     power-up changes against existing behavior in `DungeonScene.ts`.
   - Preserve finite ammo, ward damage blocking, heart pickup limits, enemy contact
     damage, and game-over/restart flow unless the PR explicitly changes them.
   - Watch for frame-rate dependent logic, unbounded object creation, stale Phaser
     references, or state that is not reset between runs.

3. **Assets and manifests**
   - Asset metadata in `public/assets/**/*.json` must match files loaded from
     `src/game/assets/manifest.ts` and scene preload keys.
   - If sprite sheets, audio, or processed art are updated, verify related source
     prompts/processors under `ASSET_PROMPTS.md`, `tools/`, and `scripts/` where
     relevant.
   - Do not require generated asset churn for unrelated code changes.

4. **Next.js UI and accessibility**
   - Keep `src/app` changes compatible with App Router conventions and the current
     CSS approach in `src/app/globals.css`; this repo does not currently configure
     Tailwind.
   - Interactive DOM controls should remain keyboard accessible and have clear
     labels. For in-canvas controls, focus on preserving playable input paths.
   - Metadata or OpenGraph changes should reference files that exist in `public/`
     and should not rely on dev-only generated files.

5. **Dependencies and tooling**
   - Treat dependency, lockfile, package-manager, and framework-version changes as
     high-risk. Ask for justification when a PR changes `package.json`,
     `package-lock.json`, or `pnpm-lock.yaml` without a clear need.
   - Prefer scoped fixes over broad formatting or generated-file churn.
   - `next lint` is not a reliable baseline here. Use build and TypeScript checks
     for general verification.

## Known baseline mismatches

Do not block unrelated PRs solely for these pre-existing docs/code mismatches:

- README says `Space` or `J` fires, while current gameplay binds keyboard firing
  to `Space` and supports pointer/click firing.
- README documents common ammo and power-ups but not seeker ammo, which exists in
  current gameplay code.
- README describes blast as rare late-game, while current code unlocks blast
  earlier through kill/time gates.

Flag these only when a PR touches the affected controls, gameplay docs, or
power-up progression.

## Suggested checks

For most code PRs, prefer:

```bash
npm ci
npm run build
npx tsc --noEmit
git diff --check origin/main...HEAD
```

For asset-related PRs, also check that changed asset files are referenced by the
manifest/preload code and that JSON frame dimensions match the corresponding
sprite sheet intent.

If verification rewrites `next-env.d.ts` or creates `tsconfig.tsbuildinfo`, treat
that as local tool output unless the PR intentionally changes generated typing
behavior.

## Managed Bugbot enablement boundary

This file provides repository-side review context. Actual Cursor Bugbot
enablement is managed outside the repo through Cursor organization/project
settings and GitHub App repository access. Confirm service enablement with the
Cursor dashboard, GitHub App access, or a PR review smoke check when those tools
are available.
