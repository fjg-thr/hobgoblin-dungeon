import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";

const sceneSource = readFileSync(new URL("../src/game/scenes/DungeonScene.ts", import.meta.url), "utf8");
const packageJson = JSON.parse(readFileSync(new URL("../package.json", import.meta.url), "utf8"));

const assertSourceIncludes = (description, snippet) => {
  assert.ok(sceneSource.includes(snippet), `${description}\nExpected to find:\n${snippet}`);
};

test("interactive UI pointer handlers stop propagation before changing game state", () => {
  [
    "this.stopUiPointerPropagation(event);\n      this.toggleMute();",
    "this.stopUiPointerPropagation(event);\n      this.startGame();",
    "this.stopUiPointerPropagation(event);\n      this.showHowToPlayModal();",
    "this.stopUiPointerPropagation(event);\n      this.hideHowToPlayModal();",
    "this.stopUiPointerPropagation(event);\n      this.restartGame();"
  ].forEach((snippet) => assertSourceIncludes("UI pointer handlers should consume click events", snippet));
});

test("game-over overlay is rebuilt with fresh button bounds after viewport resize", () => {
  assertSourceIncludes(
    "resize handler should rebuild the game-over overlay without replaying game-over effects",
    "if (this.gameOver && this.gameOverContainer) {\n      this.renderGameOverOverlay(false);\n    }"
  );
});

test("lint script uses a supported local static check", () => {
  assert.equal(packageJson.scripts?.lint, "tsc --noEmit --pretty false --incremental false");
});
