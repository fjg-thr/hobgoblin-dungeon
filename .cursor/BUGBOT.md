# Bugbot review instructions

This repository is a Next.js App Router, React, TypeScript, and Phaser game prototype.

When reviewing pull requests, prioritize findings that would cause user-visible bugs, runtime crashes, broken builds, gameplay regressions, or asset loading failures. Avoid commenting on subjective style issues unless they hide a correctness or maintainability risk.

## Project-specific review focus

- Verify React client components manage Phaser lifecycle safely. Flag leaked game instances, duplicate scene creation, stale event listeners, or browser-only APIs used during server rendering.
- Check TypeScript changes for unsafe casts, implicit `any`, unreachable branches, and mismatches between declared asset keys and actual manifest entries.
- Review Phaser scene changes for broken collision bounds, camera behavior, animation keys, spawn logic, pickup state, score/ammo/life updates, and cleanup during scene restart or game over.
- Treat asset manifest changes as coupled to files under `public/assets`. Flag JSON entries that reference missing files, wrong frame dimensions, duplicate keys, or paths that will fail from the Next.js public root.
- Preserve keyboard, pointer, and accessible UI behavior for start, game over, mute, and replay controls.
- Be cautious with generated asset and audio tooling. Flag scripts that overwrite source assets unexpectedly, depend on missing local files, or produce nondeterministic output without clear intent.
- Prefer focused fixes that match existing project patterns. Do not recommend broad framework migrations or unrelated refactors in Bugbot comments.

## Verification expectations

For code changes, prefer evidence from the most relevant available commands:

```bash
npm run lint
npm run build
```

For asset pipeline changes, also look for the specific script listed in `package.json` that regenerates or validates the touched asset type.

If verification cannot run in the contributor's environment, ask for the exact failure output and note the residual risk instead of assuming the change is safe.
