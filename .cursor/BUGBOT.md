# Cursor Bugbot Review Guide

Use this file as repository-specific context for Cursor Bugbot and human code
review. The managed Bugbot service itself is enabled outside this repository
through Cursor dashboard settings and the Cursor GitHub App installation.

## Review priorities

- Protect the client-only Phaser boundary. `src/game/GameCanvas.tsx` should keep
  browser-only imports and `window` access inside the `"use client"` component
  and its effects.
- Treat `src/game/scenes/DungeonScene.ts` as stateful runtime code. Review
  changes for Phaser lifecycle cleanup, duplicated event subscriptions, timers,
  animation leaks, stale scene state after restart, and accidental mutation of
  shared map or actor data.
- Check gameplay changes against `README.md`, especially controls, power-up
  behavior, ammo behavior, hearts, scoring, and known limitations. Do not block
  unrelated PRs solely because an existing README/code mismatch is still present.
- Verify sprite and audio asset changes stay consistent with
  `src/game/assets/manifest.ts`, the files under `public/assets`, and generator
  or processor tooling in `tools/` and `scripts/`.
- Keep Next.js configuration and metadata changes compatible with static assets
  served from `public/` and with a full production build.

## Current project facts

- This is a Next.js App Router project with a React host component that boots a
  Phaser 4 dungeon scene in the browser.
- The README documents `Space` or `J` for firing, but the current scene binds
  keyboard shooting to `Space`; pointer/click firing is implemented. Treat this
  as existing context unless a PR intentionally changes controls or docs.
- Seeker ammo is currently code-defined behavior: it unlocks after the configured
  kill/time gate and uses seeker pickups/projectiles, even though README coverage
  may lag behind.
- Blast is implemented as a progression-gated power-up in
  `POWERUP_CONFIG.blast`; review balance changes against both code and docs.

## Expected local checks

Run the narrowest relevant checks for the PR, and prefer these baseline checks
when the change affects app code, assets, or configuration:

```bash
npm install
npm run build
npx tsc --noEmit
git diff --check
```

`npm run lint` currently maps to `next lint`; if the installed Next.js version no
longer supports that command, report the tooling issue instead of treating it as
an application regression.

## Managed Bugbot enablement checklist

Repository files can provide review guidance, but they cannot prove that Bugbot
is enabled. To complete deployment, confirm outside this PR that:

1. The Cursor GitHub App has access to `fjg-thr/hobgoblin-dungeon`.
2. Bugbot is enabled for this repository in the Cursor dashboard.
3. A pull request review smoke check runs automatically or by an accepted
   trigger comment such as `cursor review` or the currently supported Bugbot
   trigger.
