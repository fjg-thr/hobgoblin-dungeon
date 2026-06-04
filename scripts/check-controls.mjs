import { readFileSync } from "fs";

const scene = readFileSync("src/game/scenes/DungeonScene.ts", "utf8");
const readme = readFileSync("README.md", "utf8");

if (!readme.includes("`Space` or `J`")) {
  throw new Error("README must document the Space/J fire controls.");
}

if (!scene.includes("KeyCodes.J")) {
  throw new Error("DungeonScene must bind the documented J fire key.");
}

if (!scene.includes("press SPACE or J to fire")) {
  throw new Error("How-to-play controls must mention both Space and J fire keys.");
}
