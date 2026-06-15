# Cursor Bugbot Review Guide

Use this file as repository-specific context when reviewing PRs for the Hobgoblin Ruin prototype. The managed Bugbot service is enabled outside the repo through Cursor settings and the GitHub App; this file only gives Bugbot better review instructions.

## Project shape

- Next.js app-router project with a single page at `src/app/page.tsx`.
- `src/game/GameCanvas.tsx` is a client component that lazy-loads Phaser and owns the Phaser game lifecycle.
- Most gameplay lives in `src/game/scenes/DungeonScene.ts`; keep changes there focused and test high-risk mechanics manually because it is large and stateful.
- Dungeon generation and tile semantics live in `src/game/maps/startingDungeon.ts`.
- Asset keys and paths are centralized in `src/game/assets/manifest.ts`.
- Styling is plain CSS in `src/app/globals.css`; this repo does not currently use Tailwind or shadcn/ui.

## Review priorities

1. Catch runtime breakage in the Phaser scene: destroyed objects reused after scene shutdown, input handlers not removed, timers/tweens leaking, invalid animation keys, missing asset manifest entries, or state resets omitted in `startGame`.
2. Check gameplay invariants: player health stays within max health, ammo and seeker ammo do not go negative, projectile cleanup is reliable, power-up durations expire correctly, enemy spawn pressure remains bounded, and collision stays tile-based.
3. Preserve Next client/server boundaries. Phaser and browser globals belong in client-only code or guarded branches.
4. Verify asset changes update both the actual file and any manifest or JSON metadata the scene loads.
5. Prefer small, local fixes over broad rewrites of `DungeonScene.ts` unless the PR is explicitly refactoring that file.

## Known context for reviews

- README currently says `Space` or `J` fires. Code binds shooting to `Space` plus pointer/click firing, not `J`; do not block unrelated PRs solely for this existing mismatch.
- README describes quickshot, haste, ward, blast, ammo, and hearts. Code also includes seeker ammo/projectiles that unlock after 4 kills or 30s.
- README describes blast as late/rare, but code unlocks blast at 2 kills or 16s via `POWERUP_CONFIG.blast`.
- Generated/processed asset tooling exists in both `tools/` and `scripts/`; do not assume every generated asset has only one generator.
- `src/app/layout.tsx` references `/opengraph-image.png`; if metadata or public assets change, verify the referenced asset exists or the metadata is adjusted.

## Verification suggestions

- For repo-side config or docs-only changes: run `git diff --check "$(git merge-base HEAD origin/main)"..HEAD`.
- For code changes: run `npm ci`, `npm run build`, and `npx tsc --noEmit`.
- `npm run lint` maps to `next lint`, which may be unavailable in newer Next versions; do not treat lack of that command as a product bug unless the PR claims lint support.
- This package has no `npm start` script. If runtime smoke testing is needed, use the dev server or an explicit Next start command appropriate to the branch.
- Next may rewrite `next-env.d.ts` and create `tsconfig.tsbuildinfo`; avoid committing those generated changes unless the PR intentionally changes Next TypeScript behavior.

## Managed Bugbot deployment boundary

Repository files cannot prove that the hosted Cursor Bugbot service is enabled. To verify managed deployment, confirm:

- Cursor dashboard/org settings enable Bugbot for this repository.
- The Cursor GitHub App has access to `fjg-thr/hobgoblin-dungeon`.
- A PR smoke check receives an actual Bugbot review or status from the managed service.

If those checks are unavailable, state that repo-side review guidance was deployed but managed-service activation remains externally verified.
