# Bugbot review guidance

Review this repository as a first-playable Next.js + Phaser dungeon prototype. Prioritize defects that would break gameplay, rendering, input, asset loading, or production builds.

## Project-specific focus areas

- Preserve the client-only Phaser boot path. `window`, Phaser imports, and game lifecycle code should stay behind the client component/effect boundary in `src/game/GameCanvas.tsx`.
- Check Phaser scene changes for gameplay regressions in movement, collision, aiming, firing, enemy pathing, damage, pickups, score/ammo/health HUD state, audio mute, and game-over/restart flow.
- Watch tile/world/isometric coordinate conversions carefully. Depth sorting, collision boxes, projectile travel, pickups, and enemy contact should remain consistent with generated map dimensions.
- Verify asset references through `src/game/assets/manifest.ts` and the matching files under `public/assets`. Sprite-sheet frame sizes, row indexes, animation keys, and JSON metadata must agree.
- Avoid introducing expensive per-frame allocations, unbounded tweens/timers/events, or missing cleanup in scene shutdown/restart paths.
- Keep the pixel-art presentation intact: nearest-neighbor rendering, crisp sprites, dark GBA-inspired palette, and full-screen responsive canvas.
- Treat the README's Known Limitations as intentional unless a change regresses existing behavior or makes a limitation worse.

## Expected verification for meaningful code changes

- Run `npm run lint` when lintable source changes are made.
- Run `npm run build` for changes that affect Next.js, TypeScript, imports, assets, or production behavior.
- For gameplay/UI changes, manually smoke test `npm run dev` at `http://localhost:3000`:
  - start a run from the title screen,
  - move with WASD or arrow keys,
  - aim with the mouse,
  - fire with Space/J and click,
  - take damage and collect ammo/power-up/heart pickups when applicable,
  - toggle sound,
  - toggle the F3 debug overlay.

## Code review style

- Prefer small, typed helpers and descriptive constants over broad scene rewrites.
- Flag hidden coupling between generated assets, manifest entries, animation setup, and gameplay constants.
- Call out missing verification when a change touches runtime gameplay but only build/lint evidence is provided.
