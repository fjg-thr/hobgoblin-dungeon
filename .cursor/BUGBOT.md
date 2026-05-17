# Cursor Bugbot Review Guidelines

Use these project-specific guidelines when reviewing pull requests for this
repository.

## Project context

- This is a Next.js App Router application with strict TypeScript settings.
- The game runtime is Phaser-based and lives primarily in `src/game`.
- Static art, audio, and generated sprite metadata live under `public/assets`.
- Asset processing and generation scripts live under `tools` and `scripts`.

## Review priorities

1. Flag changes that can break `npm run build` or strict TypeScript checks.
2. For Phaser scene changes, focus on runtime correctness in the game loop:
   update ordering, object lifecycle cleanup, timers, event listeners, camera
   state, collision checks, input handling, and depth/layer ordering.
3. For asset or manifest changes, verify that referenced paths, frame names,
   frame dimensions, and JSON metadata stay consistent with the files under
   `public/assets`.
4. For React/Next.js changes, check client/server component boundaries,
   hydration safety, metadata correctness, and accessibility of interactive UI.
5. For generated or processed assets, avoid reviewing pixel-art style choices.
   Only flag concrete integration issues such as missing files, invalid JSON,
   broken dimensions, oversized accidental diffs, or script/runtime failures.
6. Prefer actionable bug findings over broad style suggestions. Include the
   specific failing scenario or command when possible.

## Commands worth considering

- `npm run build`
