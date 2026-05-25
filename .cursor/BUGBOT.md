# Bugbot Review Instructions

Review this repository as a Next.js App Router web game with a Phaser-powered dungeon scene. Focus comments on bugs, regressions, security issues, and maintainability problems that affect runtime behavior.

## High-priority checks

- Flag TypeScript strictness issues that can cause runtime crashes, especially unsafe null/undefined access, unguarded asset lookups, and mismatched Phaser object lifecycles.
- Review Phaser scene changes for leaks or duplicated behavior: event listeners, timers, tweens, input zones, audio objects, and scene restart/reset paths should be cleaned up or reused intentionally.
- Check movement, collision, enemy AI, projectiles, pickups, scoring, and map-generation changes for broken invariants or edge cases that can soft-lock a run.
- Verify asset manifest keys, sprite-sheet frame names, JSON metadata, and public asset paths stay consistent when assets or generated outputs change.
- For React/Next.js changes, catch client/server boundary mistakes, browser-only APIs used during server rendering, invalid metadata, hydration hazards, and accessibility regressions in interactive UI.
- For scripts and tooling, flag non-deterministic output, unsafe path handling, missing error handling around file I/O, and dependency or lockfile drift.
- Flag secrets, credentials, unsafe HTML injection, dynamic code execution, and untrusted shell command construction.

## Verification expectations

- Prefer `npm run build` as the primary validation command for TypeScript and Next.js changes in this repo.
- If a change touches pure game logic that can be isolated, recommend a focused automated test or extraction to a testable helper.
- If a change only touches generated art/audio assets, manifests, or processing scripts, review for path/metadata consistency and ask for manual in-game verification when automated coverage is not practical.

## Comment style

- Leave concise inline comments tied to the changed lines.
- Explain the concrete failure mode and, when possible, suggest the smallest safe fix.
- Avoid subjective comments about pixel-art aesthetics, generated asset style, or known limitations already documented in `README.md` unless the diff introduces a new regression.
