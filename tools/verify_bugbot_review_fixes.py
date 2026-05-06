#!/usr/bin/env python3
"""Static regression checks for review findings in this prototype repo."""

from __future__ import annotations

import json
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
PACKAGE_JSON = ROOT / "package.json"
DUNGEON_SCENE = ROOT / "src" / "game" / "scenes" / "DungeonScene.ts"


def assert_condition(condition: bool, message: str) -> None:
    if not condition:
        raise AssertionError(message)


def verify_lint_script_is_not_removed_next_lint() -> None:
    package = json.loads(PACKAGE_JSON.read_text())
    lint_script = package["scripts"].get("lint", "")

    assert_condition(lint_script != "next lint", "package.json lint script still uses removed `next lint` command")
    assert_condition(bool(lint_script.strip()), "package.json must keep a non-empty lint script")


def verify_documented_j_fire_key_is_bound() -> None:
    source = DUNGEON_SCENE.read_text()

    assert_condition("KeyCodes.J" in source, "README documents J fire control, but DungeonScene does not bind KeyCodes.J")
    assert_condition("shootAlt" in source, "DungeonScene should keep a named alternate shoot key binding")
    assert_condition("keys.shootAlt.isDown" in source, "Alternate shoot key must be considered when firing")


def verify_mute_button_pointer_does_not_queue_shot() -> None:
    source = DUNGEON_SCENE.read_text()

    assert_condition("stopPropagation()" in source, "Mute button pointer handler should stop input propagation")
    assert_condition(
        "isPointerOverMuteButton" in source and "this.isPointerOverMuteButton(pointer)" in source,
        "Global pointer shooting should ignore clicks over the mute button",
    )


def main() -> None:
    verify_lint_script_is_not_removed_next_lint()
    verify_documented_j_fire_key_is_bound()
    verify_mute_button_pointer_does_not_queue_shot()


if __name__ == "__main__":
    main()
