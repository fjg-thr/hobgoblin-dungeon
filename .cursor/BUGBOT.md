# Bugbot Review Guidelines

This repository is a Next.js + React + TypeScript prototype that hosts a Phaser dungeon game.

When reviewing pull requests:

- Treat `src/game/scenes/DungeonScene.ts` as the primary gameplay surface. Check changes there for lifecycle leaks, stale timers, duplicate event handlers, and state that is not reset between runs.
- Verify browser-only code stays behind client boundaries. Phaser imports should remain dynamically loaded from client components instead of being pulled into server-rendered Next.js paths.
- Check asset changes against `src/game/assets/manifest.ts` and the files under `public/assets`. Manifest keys, frame sizes, metadata paths, and public paths must stay in sync.
- Preserve strict TypeScript expectations from `tsconfig.json`. Avoid `any`, implicit null assumptions, and untyped Phaser object bags unless the local API makes stronger typing impractical.
- Pay close attention to coordinate math in isometric map, collision, camera, and projectile code. Small changes can create off-by-one walkability bugs or visual/gameplay desyncs.
- For UI and page changes, preserve full-screen game layout behavior and avoid custom CSS unless it is needed for the canvas shell or global page styling.
- Expect focused verification for code changes: `npm run build` should pass, and lint output should be included only after the repository's lint setup is updated to support the installed Next.js version.

