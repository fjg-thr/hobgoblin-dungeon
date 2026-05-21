# Cursor Bugbot Review Guidance

Cursor Bugbot review guidance lives in this file. Treat it as repository-specific
context for automated PR reviews of the Hobgoblin Ruin prototype.

## Managed Bugbot deployment boundary

This repository can provide review context, but it cannot prove that the managed
Cursor Bugbot service is enabled. Confirm deployment outside the repo by checking:

- Cursor dashboard or organization settings have Bugbot enabled for this repo.
- The Cursor GitHub App has repository access.
- A PR review smoke check shows Bugbot reviewing a pull request when available.

If those checks are inaccessible, say so explicitly in review notes. Do not infer
managed-service enablement from this file alone.

## Project snapshot

- Next.js App Router project using React, TypeScript, and Phaser.
- The playable game surface is implemented mostly in
  `src/game/scenes/DungeonScene.ts`, with assets described by
  `src/game/assets/manifest.ts` and JSON sprite-sheet metadata in
  `public/assets`.
- Styling uses plain global CSS in `src/app/globals.css`; this repo does not
  currently use Tailwind, ShadCN, or Radix.
- Asset generator and processor tooling lives under both `tools/` and
  `scripts/`. Generated runtime assets live in `public/assets`.
- `src/app/layout.tsx` references `/opengraph-image.png`; keep
  `public/opengraph-image.png` tracked unless a PR intentionally changes share
  metadata and updates the image invariant.

## Review priorities

1. **Gameplay behavior:** For changes in `DungeonScene.ts`, review movement,
   collision, camera, projectile, pickup, power-up, enemy, score, life, audio,
   and restart interactions together. Small edits can have cross-system effects.
2. **Asset consistency:** When sprite sheets, manifests, or generated JSON
   change, verify frame dimensions, frame counts, animation rows, texture keys,
   and paths stay aligned.
3. **Next.js integration:** Prefer `npm run build` for integration validation.
   `npm run lint` currently invokes `next lint`, which is not an integrated
   subcommand under the lockfile-resolved Next.js version and fails by treating
   `lint` as a project directory.
4. **Type safety:** Use `npx tsc --noEmit --incremental false` for a
   side-effect-free TypeScript check. Plain `npx tsc --noEmit` can leave
   `tsconfig.tsbuildinfo`.
5. **Generated churn:** `npm run build` can rewrite `next-env.d.ts` between
   `.next/dev/types/routes.d.ts` and `.next/types/routes.d.ts`. Revert that
   churn before evaluating whether the worktree is clean unless the PR
   intentionally changes Next.js route type generation.

## Known baseline mismatches

Do not block unrelated PRs solely for these existing mismatches, but do flag them
when a PR touches nearby behavior or documentation.

- README controls mention `Space` or `J` for firing. Current gameplay binds
  keyboard firing to `Space` and pointer/click firing through the Phaser input
  handler; `J` is not currently bound.
- README describes blast as a rare late-game power-up. Current code unlocks
  blast after 2 kills or 16 seconds (`POWERUP_CONFIG.blast`).
- README documents regular ammo, heart pickups, quickshot, haste, ward, and
  blast. Current code also has seeker ammo/projectiles that unlock after 4 kills
  or 30 seconds.

## Suggested verification

Use checks appropriate to the changed surface area. For broad gameplay, asset,
or review-guidance changes, prefer:

```bash
npm ci
npm run build
npx tsc --noEmit --incremental false
git diff --check origin/main...HEAD
git diff --check
```

Known audit context: recent `npm ci` runs reported 2 vulnerabilities
(1 moderate, 1 high). Treat that as existing dependency-audit state unless the
PR changes dependencies or the audit output worsens.
