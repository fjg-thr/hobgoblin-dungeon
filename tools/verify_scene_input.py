#!/usr/bin/env python3
"""Static regression checks for input handling in DungeonScene.

The cloud image used for automated review does not always include Node, so
these checks keep the most failure-prone scene input contracts verifiable.
"""

from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
SCENE = ROOT / "src" / "game" / "scenes" / "DungeonScene.ts"


def assert_contains(source: str, needle: str, description: str) -> None:
    if needle not in source:
        raise AssertionError(description)


def main() -> None:
    source = SCENE.read_text(encoding="utf-8")

    assert_contains(
        source,
        "shootAlt: keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.J)",
        "DungeonScene should bind J as an alternate fire key.",
    )
    assert_contains(
        source,
        "this.keys.shootAlt.isDown",
        "Continuous fire checks should include the J alternate fire key.",
    )
    assert_contains(
        source,
        "this.isPointerInsideMuteButton(pointer)",
        "Pointer shooting should ignore clicks on the mute button.",
    )
    assert_contains(
        source,
        "try {\n      return window.localStorage.getItem",
        "Reading the mute preference should tolerate blocked localStorage.",
    )
    assert_contains(
        source,
        "try {\n      window.localStorage.setItem",
        "Writing the mute preference should tolerate blocked localStorage.",
    )


if __name__ == "__main__":
    main()
