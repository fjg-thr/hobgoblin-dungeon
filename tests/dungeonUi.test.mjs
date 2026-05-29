import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { createRequire } from "node:module";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";
import vm from "node:vm";
import ts from "typescript";

const require = createRequire(import.meta.url);
const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

const loadTypescriptModule = async (relativePath) => {
  const absolutePath = path.join(rootDir, relativePath);
  const source = await readFile(absolutePath, "utf8");
  const { outputText } = ts.transpileModule(source, {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2020
    },
    fileName: absolutePath
  });
  const module = { exports: {} };

  vm.runInNewContext(outputText, {
    console,
    exports: module.exports,
    module,
    require
  }, { filename: absolutePath });

  return module.exports;
};

test("stopPropagation calls the Phaser event propagation guard when present", async () => {
  const { stopPropagation } = await loadTypescriptModule("src/game/scenes/uiLayout.ts");
  let callCount = 0;

  stopPropagation({
    stopPropagation: () => {
      callCount += 1;
    }
  });

  assert.equal(callCount, 1);
  assert.doesNotThrow(() => stopPropagation(undefined));
});

test("game-over overlay layout recomputes restart hit area for the current viewport", async () => {
  const { gameOverOverlayLayout } = await loadTypescriptModule("src/game/scenes/uiLayout.ts");

  const wide = gameOverOverlayLayout({
    viewportWidth: 1024,
    viewportHeight: 768,
    titleWidth: 560,
    titleHeight: 260,
    restartButtonWidth: 300,
    restartButtonHeight: 110
  });
  const compact = gameOverOverlayLayout({
    viewportWidth: 360,
    viewportHeight: 360,
    titleWidth: 560,
    titleHeight: 260,
    restartButtonWidth: 300,
    restartButtonHeight: 110
  });

  assert.equal(wide.contentX, 512);
  assert.equal(compact.contentX, 180);
  assert.notEqual(wide.panelY, compact.panelY);
  assert.notEqual(wide.restartZone.centerY, compact.restartZone.centerY);
  assert.ok(compact.restartZone.width <= 360 * 0.28);
  assert.ok(compact.restartZone.height < wide.restartZone.height);
});
