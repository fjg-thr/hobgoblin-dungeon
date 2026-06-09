import { describe, expect, it } from "vitest";

import { isHasteVisualActive } from "../../src/game/playerVisuals";

describe("player visual state", () => {
  it.each([
    {
      name: "active during normal play",
      state: { nowMs: 1_000, hasteUntilMs: 2_000, gameOver: false, playerDying: false },
      expected: true
    },
    {
      name: "hidden while the player death animation is active",
      state: { nowMs: 1_000, hasteUntilMs: 2_000, gameOver: false, playerDying: true },
      expected: false
    },
    {
      name: "hidden after game over",
      state: { nowMs: 1_000, hasteUntilMs: 2_000, gameOver: true, playerDying: false },
      expected: false
    },
    {
      name: "hidden after haste expires",
      state: { nowMs: 2_000, hasteUntilMs: 2_000, gameOver: false, playerDying: false },
      expected: false
    }
  ])("$name", ({ state, expected }) => {
    expect(
      isHasteVisualActive(state)
    ).toBe(expected);
  });
});
