#!/usr/bin/env python3
"""Static regression checks for issues found by the Bugbot review."""

from __future__ import annotations

import json
import re
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]


def read_text(relative_path: str) -> str:
    return (ROOT / relative_path).read_text(encoding="utf-8")


def test_lint_script_uses_available_cli() -> None:
    package_json = json.loads(read_text("package.json"))
    lint_script = package_json["scripts"]["lint"]

    assert lint_script != "next lint", "Next 16 no longer ships the next lint command"


def test_j_key_is_bound_as_fire_control() -> None:
    scene = read_text("src/game/scenes/DungeonScene.ts")

    assert "shootAlt: keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.J)" in scene
    assert "this.keys.shootAlt.on(\"down\", handleShootKeyDown)" in scene
    assert "this.keys.shootAlt.isDown" in scene


def test_mute_button_does_not_bubble_to_scene_shoot_handler() -> None:
    scene = read_text("src/game/scenes/DungeonScene.ts")
    mute_handler = re.search(
        r"this\.muteButtonZone\.on\(\n      \"pointerdown\",(?P<body>.*?)\n    \);",
        scene,
        re.DOTALL,
    )

    assert mute_handler, "mute button pointerdown handler should exist"
    assert "event.stopPropagation()" in mute_handler.group("body")
    assert "this.toggleMute()" in mute_handler.group("body")


def test_stairs_are_added_after_interior_walls() -> None:
    dungeon = read_text("src/game/maps/startingDungeon.ts")
    create_dungeon = re.search(
        r"export function createDungeon\(.*?\n\}",
        dungeon,
        re.DOTALL,
    )

    assert create_dungeon, "createDungeon should exist"
    body = create_dungeon.group(0)
    assert body.index("addFloorVariation(grid, random);") < body.index("addStairs(grid, rooms);")
    assert body.index("addInteriorWalls(grid, rooms, random);") < body.index("addStairs(grid, rooms);")


if __name__ == "__main__":
    tests = [
        test_lint_script_uses_available_cli,
        test_j_key_is_bound_as_fire_control,
        test_mute_button_does_not_bubble_to_scene_shoot_handler,
        test_stairs_are_added_after_interior_walls,
    ]

    failures: list[str] = []
    for test in tests:
        try:
            test()
            print(f"PASS {test.__name__}")
        except AssertionError as exc:
            failures.append(f"FAIL {test.__name__}: {exc}")

    if failures:
        print("\n".join(failures))
        raise SystemExit(1)
