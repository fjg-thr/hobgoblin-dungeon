import { describe, expect, test, vi } from "vitest";

import { DungeonScene } from "./DungeonScene";
import { getTileCode, isTileRenderable, type DungeonMap, type TileCode } from "../maps/startingDungeon";

vi.mock("phaser", () => ({
  Scene: class MockScene {}
}));

describe("DungeonScene tile rendering", () => {
  test("treats wall tiles as renderable", () => {
    expect(isTileRenderable("W")).toBe(true);
    expect(isTileRenderable(" ")).toBe(false);
  });

  test("renders wall tiles through the scene render path", () => {
    const dungeon: DungeonMap = {
      width: 2,
      height: 1,
      rows: ["W."],
      playerStart: { x: 0, y: 0 },
      enemyStarts: [],
      props: []
    };
    const addTileImage = vi.fn();
    const scene = {
      dungeon,
      clearDungeonRender: vi.fn(),
      addFloorEdgeSilhouette: vi.fn(),
      getTileCode: (x: number, y: number): TileCode => getTileCode(dungeon, x, y),
      tileCellCenterToWorld: vi.fn((x: number, y: number) => ({ x, y })),
      addTileImage,
      addProp: vi.fn()
    };
    const renderDungeon = (DungeonScene.prototype as unknown as { renderDungeon: () => void }).renderDungeon;

    renderDungeon.call(scene);

    expect(addTileImage).toHaveBeenCalledWith("dark_wall", { x: 0, y: 0 }, "W", 0, 0);
  });
});
