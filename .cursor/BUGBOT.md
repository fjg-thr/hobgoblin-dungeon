# Bugbot review guidance

Review this repository as a private Next.js and Phaser game prototype. Prioritize issues that could break the playable build, regress core game behavior, or leave generated assets inconsistent with their manifests.

## High-priority review areas

- Treat build failures, TypeScript errors, and missing imports as blocking issues.
- Check that Phaser code only runs on the client. Flag changes that access `window`, `document`, audio APIs, canvas APIs, or Phaser from server-rendered code paths.
- Verify that asset changes keep PNG/WAV files, JSON sprite sheets, and manifest references in sync. Missing public assets should be flagged as high severity because they can break scene loading.
- Watch for gameplay state regressions in `src/game/scenes/DungeonScene.ts`, especially life, ammo, scoring, power-ups, enemy spawning, collision, restart flow, mute state, and start/game-over transitions.
- Flag event listener, timer, tween, or scene lifecycle changes that can leak across restarts or duplicate behavior after the scene restarts.
- For UI or input changes, check keyboard, mouse, and touch accessibility where applicable. Interactive DOM elements should expose clear labels and keyboard behavior.
- Keep performance concerns grounded in gameplay impact: large per-frame allocations, expensive loops in update paths, or unbounded entity growth are important; speculative micro-optimizations are not.

## Expected verification

When a pull request changes application code, ask for evidence from:

```bash
npm run build
```

If a lint script is available and supported by the installed Next.js version, also expect:

```bash
npm run lint
```

For asset-processing changes, ask for the relevant `process:*` or `generate:*` script output and a check that generated files were committed intentionally.

## Review style

- Lead with concrete bugs and user-visible risks.
- Include exact file and line references when possible.
- Avoid asking for broad rewrites unless the current change creates a clear correctness, maintainability, or reviewability problem.
- Do not block on generated asset diffs solely because they are large; block only when the generated files are missing, inconsistent, or unexplained.
