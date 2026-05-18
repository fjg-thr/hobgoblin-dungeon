# Cursor Bugbot review guidance

Review this repository as a Next.js, React, TypeScript, and Phaser game prototype.

## Priorities

- Flag runtime bugs, regressions, and missing error handling that can break gameplay, rendering, asset loading, or build output.
- Check TypeScript changes for type-safety gaps, unsafe casts, client/server boundary mistakes, and unhandled null or undefined values.
- For React and Next.js changes, focus on hydration issues, browser-only APIs used during server render, metadata regressions, and accessibility problems in interactive UI.
- For Phaser scene changes, inspect game-loop state transitions, timers, event listeners, collision checks, cleanup on scene restart, and object lifetime issues.
- For asset and manifest changes, verify referenced files, frame names, dimensions, animation keys, and audio paths stay consistent with the files under `public/assets`.
- Call out performance issues only when they can affect frame rate, memory growth, loading behavior, or repeated scene restarts.

## Lower priority

- Avoid comments that are only formatting, naming, or preference-based style feedback unless they hide a likely bug.
- Avoid requesting broad refactors unless the current change introduces a concrete correctness or maintainability risk.
- Do not require new abstractions for one-off prototype code unless duplication creates a clear bug risk.

## Verification expectations

- Prefer evidence-backed findings with the affected file, line, and user-visible impact.
- When relevant, mention whether `npm run build` or type checking would catch the issue.
- For generated asset updates, distinguish between source-generation scripts and committed runtime assets.
