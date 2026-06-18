# Bugbot review rules

Use these project-specific guidelines when reviewing pull requests for this repository.

## Review priorities

- Treat runtime crashes, broken builds, missing assets, and regressions in player input, combat, spawning, collision, or game-state transitions as high severity.
- Verify changes that touch `src/game/scenes/DungeonScene.ts` preserve Phaser lifecycle behavior, clean up timers/listeners, and avoid creating duplicate game objects during React Strict Mode remounts.
- Check map-generation changes in `src/game/maps/startingDungeon.ts` for reachable player starts, valid enemy spawn locations, bounded indexes, and consistent tile codes.
- For asset or manifest changes, confirm referenced files exist under `public/assets`, sprite-sheet frame dimensions match their JSON metadata, and manifests stay synchronized with runtime loader keys.
- For Next.js or React changes, preserve the client-only Phaser boot path and avoid browser globals outside client components or guarded effects.

## Testing expectations

- Require `npm run build` for changes that affect TypeScript, Next.js pages/layouts, Phaser scene code, asset manifests, or generated asset metadata.
- Ask for focused manual playtesting notes when gameplay behavior changes, including movement, aiming/firing, pickups, enemy contact damage, game over/restart, and mute controls as applicable.
- For tooling scripts under `tools/` or `scripts/`, check that generated outputs are intentionally committed or explicitly excluded from the change.

## Comment style

- Prefer concise comments about correctness, reliability, accessibility, and maintainability.
- Avoid purely stylistic comments unless they make the code harder to understand or risk future bugs.
- When a finding depends on runtime behavior, name the likely user-visible symptom and the path through the code that causes it.
