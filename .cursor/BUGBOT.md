# Cursor Bugbot Review Instructions

## Project context

This repository is a private Next.js/TypeScript prototype for a dark isometric dungeon game. The app shell lives in `src/app`, the browser game is built with Phaser under `src/game`, generated art/audio assets live in `public/assets`, and asset-processing utilities live in `tools` and `scripts`.

## Review priorities

- Prioritize high-confidence bugs that can affect gameplay, builds, or production behavior.
- For `src/game/**`, look closely for regressions in Phaser scene lifecycle, asset preload keys, sprite-sheet frame names, collision/math logic, enemy/projectile state, timers, and cleanup of event listeners or game objects.
- For `src/app/**`, check Next.js and React client/server boundaries, hydration risks, accessibility of interactive UI, and browser-only APIs running outside client components.
- Flag mismatches between `src/game/assets/manifest.ts`, files in `public/assets/**`, and sprite metadata JSON when they would cause missing textures, broken animations, or failed audio/image loads.
- Flag expensive work added to per-frame update paths, especially avoidable allocations, pathfinding recalculation loops, or unbounded object creation.
- For `tools/**` and `scripts/**`, focus on asset pipeline correctness, deterministic output, path handling, and failures that could corrupt or omit generated assets.

## Noise to avoid

- Do not comment on generated binary assets such as PNG, WAV, or MP3 files.
- Do not nitpick generated sprite-sheet JSON or processed asset metadata unless the change is inconsistent with code references, invalid JSON, or likely to break loading.
- Do not raise style-only comments, broad refactor suggestions, or documentation grammar suggestions unless they hide a concrete bug.
- Treat `ASSET_PROMPTS.md`, README content, and prototype limitation notes as low priority unless they contradict runnable behavior or setup instructions.

## Expected evidence

- Prefer findings that include the failing scenario, the affected file/line, and a minimal fix direction.
- If a finding depends on running the project, mention the relevant command such as `npm run build`.
- Keep comments concise and actionable; one concrete bug per comment.
