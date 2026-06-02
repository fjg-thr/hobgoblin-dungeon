import { describe, expect, it } from "vitest";

import { createDungeon } from "./startingDungeon";

const createSeededRandom = (seed: number): (() => number) => {
  let state = seed;

  return () => {
    state = (state * 1664525 + 1013904223) >>> 0;
    return state / 0x100000000;
  };
};

describe("createDungeon", () => {
  it("retains one stairs tile after all dungeon decoration passes", () => {
    const dungeon = createDungeon(createSeededRandom(225));
    const stairsCount = [...dungeon.rows.join("")].filter((tile) => tile === "S").length;

    expect(stairsCount).toBe(1);
  });
});
