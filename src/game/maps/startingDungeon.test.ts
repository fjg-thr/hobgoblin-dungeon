import assert from "node:assert/strict";
import test from "node:test";
import { isRenderableTileCode, tileAssetForCode, type TileCode } from "./startingDungeon";

test("wall tiles are renderable because they block movement", () => {
  const blockingWallCode: TileCode = "W";

  assert.equal(isRenderableTileCode(blockingWallCode), true);
  assert.equal(tileAssetForCode[blockingWallCode], "dark_wall");
});

test("empty space remains non-renderable", () => {
  assert.equal(isRenderableTileCode(" "), false);
});
