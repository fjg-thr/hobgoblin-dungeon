#!/usr/bin/env python3
"""Static regression checks for review findings in this prototype repo."""

from __future__ import annotations

import json
import re
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
PACKAGE_JSON = ROOT / "package.json"
DUNGEON_SCENE = ROOT / "src" / "game" / "scenes" / "DungeonScene.ts"


def assert_condition(condition: bool, message: str) -> None:
    if not condition:
        raise AssertionError(message)


def extract_method_body(source: str, method_name: str) -> str:
    signature_index = source.find(f"private {method_name}(")
    assert_condition(signature_index >= 0, f"Could not find method {method_name}")

    body_start = source.find("{", signature_index)
    assert_condition(body_start >= 0, f"Could not find method body for {method_name}")

    depth = 0
    for index in range(body_start, len(source)):
        char = source[index]
        if char == "{":
            depth += 1
        elif char == "}":
            depth -= 1
            if depth == 0:
                return source[body_start + 1 : index]

    raise AssertionError(f"Could not parse method body for {method_name}")


def verify_lint_script_is_not_removed_next_lint() -> None:
    package = json.loads(PACKAGE_JSON.read_text())
    lint_script = package["scripts"].get("lint", "")
    typecheck_script = package["scripts"].get("typecheck", "")

    removed_next_lint = re.search(r"(^|[;&|()])\s*(?:npx\s+)?next\s+lint(?:\s|$)", lint_script)
    assert_condition(not removed_next_lint, "package.json lint script still invokes removed `next lint` command")
    assert_condition(lint_script == "tsc --noEmit", "package.json lint script should run TypeScript checking")
    assert_condition(typecheck_script == "tsc --noEmit", "package.json should expose a matching typecheck script")


def verify_documented_j_fire_key_is_bound() -> None:
    source = DUNGEON_SCENE.read_text()
    create_input_body = extract_method_body(source, "createInput")

    assert_condition("KeyCodes.J" in source, "README documents J fire control, but DungeonScene does not bind KeyCodes.J")
    assert_condition("shootAlt" in source, "DungeonScene should keep a named alternate shoot key binding")
    assert_condition("keys.shootAlt.isDown" in source, "Alternate shoot key must be considered when firing")
    assert_condition(
        re.search(
            r'this\.keys\.shootAlt\.on\("down",\s*\(\)\s*=>\s*\{(?:(?!this\.keys\.).)*this\.startGame\(\);(?:(?!this\.keys\.).)*this\.shotQueued\s*=\s*true;',
            create_input_body,
            re.DOTALL,
        )
        is not None,
        "J shoot key should start the game or queue a shot consistently with Space",
    )


def verify_mute_button_pointer_does_not_queue_shot() -> None:
    source = DUNGEON_SCENE.read_text()
    create_mute_button_body = extract_method_body(source, "createMuteButton")
    handle_pointer_body = extract_method_body(source, "handleAimPointerDown")

    assert_condition(
        "event?.stopPropagation();" in create_mute_button_body,
        "Mute button pointer handler should stop input propagation",
    )
    assert_condition(
        re.search(
            r"if\s*\([^)]*this\.isPointerOverMuteButton\(pointer\)[^)]*\)\s*\{\s*return;\s*\}",
            handle_pointer_body,
            re.DOTALL,
        )
        is not None,
        "Global pointer shooting should early-return when the pointer is over the mute button",
    )
    assert_condition(
        handle_pointer_body.find("this.isPointerOverMuteButton(pointer)")
        < handle_pointer_body.find("this.updatePointerAim(pointer)")
        < handle_pointer_body.find("this.shotQueued = true"),
        "Mute button pointer guard must run before aim updates or shot queuing",
    )


def main() -> None:
    verify_lint_script_is_not_removed_next_lint()
    verify_documented_j_fire_key_is_bound()
    verify_mute_button_pointer_does_not_queue_shot()


if __name__ == "__main__":
    main()
