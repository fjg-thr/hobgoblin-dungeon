# Cursor Bugbot review guide

This repository is a Next.js/React/TypeScript prototype that hosts a Phaser
dungeon game. Use this guide as repository-specific context when reviewing PRs.

## Review priorities

- Treat `src/game/scenes/DungeonScene.ts` as the main gameplay surface. Changes
  there can affect movement, combat, spawning, HUD state, audio, and Phaser
  scene lifecycle behavior.
- Check React/Next changes in `src/app/**` for client/server boundaries. The
  Phaser canvas should remain isolated behind the existing client component
  pattern.
- Prefer the existing semantic HTML and `src/app/globals.css` styling patterns.
  This repo does not currently configure Tailwind or shadcn/ui.
- Watch for generated asset churn. Sprite/audio source and processing tools live
  under both `tools/` and `scripts/`; generated runtime assets live under
  `public/assets/**`.
- Dependency, lockfile, and framework-version changes should be intentional and
  justified. The repo currently contains both `package-lock.json` and
  `pnpm-lock.yaml`; do not require lockfile edits for unrelated app changes.

## Local verification to expect

For behavior or TypeScript changes, prefer:

```bash
npm ci
npm run build
npx tsc --noEmit
```

`next lint` is listed in `package.json`, but it is not a reliable baseline for
this Next version. If verification rewrites generated files such as
`next-env.d.ts` or creates `tsconfig.tsbuildinfo`, reviewers should distinguish
tooling side effects from intentional source changes.

## Gameplay context

- Runtime controls currently bind movement to WASD/arrow keys, firing to
  `Space`, pointer aim, and click-to-fire. The README still mentions `J` for
  firing; treat that as an existing docs/code mismatch unless a PR changes
  controls or control documentation.
- README-documented power-ups are quickshot, haste, ward, blast, ammo, and
  hearts. The code also has seeker ammo/projectiles that unlock after kill or
  survival milestones; do not flag seeker behavior as unexpected solely because
  it is not yet described in the README.
- README calls blast a rare late-game power-up, while current code unlocks it
  after 2 kills or 16 seconds. Treat that as existing drift unless the PR is
  specifically changing progression tuning or docs.
- The staircase is visible but intentionally does not transition levels yet.

## Managed Bugbot enablement

This file supplies repository review context only. Enabling Cursor Bugbot for
the repository is managed outside git through Cursor organization/repository
settings and GitHub App repository access. When validating deployment, confirm:

1. Cursor Bugbot is enabled for `fjg-thr/hobgoblin-dungeon`.
2. The Cursor GitHub App has access to this repository.
3. A PR smoke check causes Bugbot to review code with this guide available.

If those settings are not accessible from the agent environment, report that the
repo-side guide is deployed but managed service enablement still needs external
dashboard/GitHub App verification.
