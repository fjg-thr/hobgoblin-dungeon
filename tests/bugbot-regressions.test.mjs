import { readFile } from "node:fs/promises";
import test from "node:test";
import assert from "node:assert/strict";

const dungeonSceneSource = await readFile("src/game/scenes/DungeonScene.ts", "utf8");
const packageJson = JSON.parse(await readFile("package.json", "utf8"));

test("solid wall tiles are rendered instead of skipped", () => {
  assert.doesNotMatch(
    dungeonSceneSource,
    /code === " " \|\| code === "W"/,
    "renderDungeon should not skip W tiles because W has a dark_wall asset and blocks collision"
  );
});

test("J is wired as a fire key alongside Space", () => {
  assert.match(
    dungeonSceneSource,
    /j:\s*keyboard\.addKey\(Phaser\.Input\.Keyboard\.KeyCodes\.J\)/,
    "createInput should register the documented J fire key"
  );
  assert.match(
    dungeonSceneSource,
    /this\.keys\.shoot\.isDown\s*\|\|\s*this\.keys\.j\.isDown/,
    "continuous firing should work while either Space or J is held"
  );
});

test("in-game controls copy mentions both fire keys", () => {
  assert.match(dungeonSceneSource, /press SPACE or J to fire/);
});

test("lint script does not call removed Next.js lint command", () => {
  assert.notEqual(packageJson.scripts?.lint, "next lint");
});
