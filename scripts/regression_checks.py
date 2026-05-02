#!/usr/bin/env python3
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SCENE = ROOT / "src/game/scenes/DungeonScene.ts"
PACKAGE_JSON = ROOT / "package.json"


def check(condition: bool, message: str) -> None:
    if not condition:
        raise AssertionError(message)


def main() -> None:
    scene = SCENE.read_text()
    package_json = PACKAGE_JSON.read_text()

    check(
        'code === " " || code === "W"' not in scene,
        "renderDungeon must not skip visible wall tiles that still block movement",
    )
    check(
        "Phaser.Input.Keyboard.KeyCodes.J" in scene,
        "createInput must register the documented J fire key",
    )
    check(
        "this.keys.j.isDown" in scene,
        "tryShootProjectile must treat a held J key as a shot request",
    )
    check(
        "try {" in scene[scene.index("private readMutedPreference") : scene.index("private toggleMute")],
        "localStorage preference access must be guarded for blocked storage",
    )
    check(
        '"lint": "next lint"' not in package_json,
        "lint script must not call removed Next.js lint command",
    )


if __name__ == "__main__":
    main()
