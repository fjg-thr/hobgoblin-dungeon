import { describe, expect, it } from "vitest";
import { createDungeon } from "./startingDungeon";

const seededRandom = (seed: number) => {
  let state = seed;

  return () => {
    state = (state * 1664525 + 1013904223) >>> 0;
    return state / 0x100000000;
  };
};

describe("createDungeon", () => {
  it("preserves one staircase in generated maps", () => {
    for (let seed = 1; seed <= 300; seed += 1) {
      const dungeon = createDungeon(seededRandom(seed));
      const staircaseCount = dungeon.rows.join("").split("").filter((tile) => tile === "S").length;

      expect(staircaseCount, `seed ${seed}`).toBe(1);
    }
  });
});
