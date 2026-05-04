#!/usr/bin/env python3
"""Static sanity checks for game inputs, persistence guards, and assets."""

from __future__ import annotations

import re
import sys
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
SCENE_PATH = ROOT / "src/game/scenes/DungeonScene.ts"
MANIFEST_PATH = ROOT / "src/game/assets/manifest.ts"


def require(condition: bool, message: str, failures: list[str]) -> None:
    if not condition:
        failures.append(message)


def method_body(source: str, method_name: str) -> str:
    match = re.search(rf"\n  private {method_name}\([^)]*\)[^{{]*{{", source)
    if not match:
        return ""

    start = match.end()
    depth = 1
    index = start
    while index < len(source) and depth:
        if source[index] == "{":
            depth += 1
        elif source[index] == "}":
            depth -= 1
        index += 1

    return source[start : index - 1]


def check_controls(scene_source: str, failures: list[str]) -> None:
    create_input = method_body(scene_source, "createInput")
    try_shoot = method_body(scene_source, "tryShootProjectile")
    require("KeyCodes.SPACE" in create_input, "Space key is not bound for shooting.", failures)
    require("KeyCodes.J" in create_input, "J key is not bound for shooting despite README documentation.", failures)
    require(".shoot.isDown" in try_shoot, "Space shoot hold state is not checked in tryShootProjectile().", failures)
    require(".shootAlt.isDown" in try_shoot, "J shoot hold state is not checked in tryShootProjectile().", failures)


def check_storage_guards(scene_source: str, failures: list[str]) -> None:
    read_muted = method_body(scene_source, "readMutedPreference")
    write_muted = method_body(scene_source, "writeMutedPreference")
    require("try {" in read_muted, "readMutedPreference() does not guard localStorage access.", failures)
    require("catch" in read_muted, "readMutedPreference() does not catch storage failures.", failures)
    require("try {" in write_muted, "writeMutedPreference() does not guard localStorage access.", failures)
    require("catch" in write_muted, "writeMutedPreference() does not catch storage failures.", failures)


def check_game_over_resize(scene_source: str, failures: list[str]) -> None:
    handle_resize = method_body(scene_source, "handleResize")
    restart_game = method_body(scene_source, "restartGame")
    require("this.gameOver" in handle_resize, "handleResize() does not handle an active game-over overlay.", failures)
    require(
        "renderGameOverOverlay()" in handle_resize,
        "handleResize() does not rebuild the game-over overlay.",
        failures,
    )
    require("clearGameOverOverlay()" in scene_source, "No helper exists to clear stale game-over overlay state.", failures)
    require(
        "clearGameOverOverlay()" in restart_game,
        "restartGame() does not clear game-over overlay state through the shared helper.",
        failures,
    )


def check_asset_files(failures: list[str]) -> None:
    manifest_source = MANIFEST_PATH.read_text(encoding="utf-8")
    asset_paths = sorted(set(re.findall(r'"(/assets/[^"]+)"', manifest_source)))
    missing = [asset_path for asset_path in asset_paths if not (ROOT / "public" / asset_path.removeprefix("/")).is_file()]
    if missing:
        sample = "\n  - ".join(missing[:20])
        suffix = "" if len(missing) <= 20 else f"\n  ... and {len(missing) - 20} more"
        failures.append(f"{len(missing)} manifest asset files are missing under public/:\n  - {sample}{suffix}")


def main() -> int:
    failures: list[str] = []
    scene_source = SCENE_PATH.read_text(encoding="utf-8")

    check_controls(scene_source, failures)
    check_storage_guards(scene_source, failures)
    check_game_over_resize(scene_source, failures)
    check_asset_files(failures)

    if failures:
        print("Game integrity check failed:")
        for index, failure in enumerate(failures, start=1):
            print(f"{index}. {failure}")
        return 1

    print("Game integrity check passed.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
