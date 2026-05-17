# Bugbot review instructions

This repository is a Next.js, React, TypeScript, and Phaser 4 browser game prototype. Review changes as production-facing game code even though the project is still a prototype.

## High-priority review areas

- Treat TypeScript strictness issues as correctness risks. Flag unsafe casts, implicit `any` leaks, nullable access, and type changes that hide runtime states.
- Watch Next.js client/server boundaries. Phaser and browser APIs must stay in client-only code paths and must not run during server rendering.
- Review Phaser scene lifecycle changes carefully. Flag leaked timers, event listeners, tweens, input handlers, audio nodes, textures, or scene references that can survive scene restart or unmount.
- Check game-loop and rendering changes for avoidable per-frame allocation, expensive lookups, unbounded entity growth, and work that scales poorly with enemy or projectile counts.
- Validate asset loading and manifest edits. Asset keys, frame names, sprite-sheet dimensions, and public paths should stay consistent with files under `public/assets`.
- Flag gameplay changes that can create impossible states, such as negative health or ammo, duplicate pickups, stuck input state, unreachable exits, or entities colliding after destruction.
- Check accessibility for React UI and overlays: keyboard support, meaningful labels, focus handling, and readable controls where UI is implemented outside the Phaser canvas.
- Keep generated or processed asset files in sync with their source scripts when the change affects the asset pipeline.

## Expected verification

Ask authors to run the narrowest relevant checks for their change. For broad app changes, prefer:

```bash
npm run lint
npm run build
```

For asset pipeline changes, also ask for the relevant `npm run process:*` or `npm run generate:*` command from `package.json`.

## Review style

- Prioritize high-confidence bugs, regressions, and missing verification over stylistic preferences.
- Mention exact file paths and affected behavior.
- Do not require large refactors unless the current change introduces a concrete maintenance or correctness risk.
