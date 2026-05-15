# Cursor Bugbot review guidance

Use this repository-specific guidance when reviewing changes for the Hobgoblin
Ruin Prototype.

## Project shape

- Next.js App Router application with React, TypeScript, and Phaser 4.0.0-rc.4.
- The playable game is mounted by `src/game/GameCanvas.tsx` and implemented in
  the Phaser scene at `src/game/scenes/DungeonScene.ts`.
- The dungeon map generator and tile semantics live in
  `src/game/maps/startingDungeon.ts`.
- Static art, audio, sprite sheets, and sheet metadata live under
  `public/assets`; `src/game/assets/manifest.ts` is the central source of
  runtime asset paths and frame dimensions.
- `src/app/layout.tsx` defines metadata and references
  `public/opengraph-image.png` for OpenGraph/Twitter previews.

## Review priorities

1. Catch user-visible gameplay, build, and runtime regressions before style
   preferences.
2. Treat React/Phaser ownership boundaries carefully. The Phaser game must only
   boot on the client, avoid duplicate `Phaser.Game` instances under React
   Strict Mode, and destroy the game during component cleanup.
3. Review scene changes for leaks and runaway state: timers, tweens, input
   handlers, audio loops, object pools, and arrays of sprites/projectiles should
   be cleaned up or bounded.
4. Check gameplay math against the isometric tile model. Movement, collision,
   projectile travel, enemy pathing, pickups, depth sorting, camera bounds, and
   debug overlays should agree with map coordinates and tile blocking rules.
5. Verify asset changes as code changes. New or renamed assets should update the
   manifest, preload logic, animation creation, README asset list when relevant,
   and committed sprite-sheet JSON/PNG/WAV files.
6. Preserve metadata/share-image consistency. If metadata changes reference a
   public asset, confirm the asset exists and is tracked.
7. Verify Phaser API advice against the installed Phaser 4.0.0-rc.4 release
   candidate; do not assume Phaser 3 examples apply unchanged.
8. Avoid recommendations that introduce Tailwind, custom CSS frameworks, or
   bespoke UI abstractions for ordinary React UI unless the change intentionally
   adds that tooling. Prefer the existing global CSS patterns in this prototype.
9. Flag package manager drift. The repository currently has both
   `package-lock.json` and `pnpm-lock.yaml`; dependency changes should be
   intentional and keep the relevant lockfile story consistent.

## Tooling notes

- Prefer `npm ci` for installing dependencies from the checked-in npm lockfile.
- `npm run build` is the primary integration check and currently runs Next.js
  16.2.4 from the lockfile.
- For a side-effect-free TypeScript check, use:

  ```bash
  npx tsc --noEmit --incremental false
  ```

- Do not require `npm run lint` as a blocking check until linting is migrated.
  The current script is `next lint`, and with the lockfile-resolved Next.js
  version it is interpreted as a project directory named `lint`, producing an
  invalid-project-directory error rather than a useful lint result.
- `next build` may update generated `next-env.d.ts`; do not treat that file as
  an intentional change unless the Next/TypeScript configuration changed.

## Suggested verification for relevant diffs

Run the smallest applicable set, expanding when a change touches shared game
behavior, assets, or build configuration:

```bash
npm ci
npm run build
npx tsc --noEmit --incremental false
test -f public/opengraph-image.png
git ls-files --error-unmatch public/opengraph-image.png
git diff --check origin/main...HEAD
git diff --check
```

For asset-heavy diffs, also inspect the changed manifest entries and verify each
referenced file exists under `public/assets`.

## Review output expectations

- Lead with concrete findings, ordered by severity.
- Include file and line references for each issue.
- Explain the user-facing impact and a focused fix.
- If no issues are found, say so explicitly and mention any verification that
  was not run or any residual risk.
