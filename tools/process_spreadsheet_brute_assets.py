from __future__ import annotations

import json

from PIL import Image

from process_assets import (
    CHAR_OUT,
    ROOT,
    ensure_dirs,
    find_alpha_components,
    fit_sprite_frame,
    group_components_by_row,
    key_color_to_alpha,
)


SOURCE_PATH = ROOT / "public" / "assets" / "source" / "spreadsheet-brute-gpt-image-2-source.png"
DIRECTIONS = ["southeast", "southwest", "northeast", "northwest"]


def write_brute_metadata() -> None:
    frames = {}
    animations = {}
    for row, direction in enumerate(DIRECTIONS):
        idle = []
        walk = []
        for col in range(10):
            key = f"{direction}_{col:02d}"
            frames[key] = {"x": col * 64, "y": row * 64, "w": 64, "h": 64}
            if col < 4:
                idle.append(key)
            else:
                walk.append(key)
        animations[f"idle-{direction}"] = {"frames": idle, "frameRate": 5, "repeat": -1}
        animations[f"walk-{direction}"] = {"frames": walk, "frameRate": 8, "repeat": -1}

    (CHAR_OUT / "brute-sprite-sheet.json").write_text(
        json.dumps(
            {
                "image": "/assets/characters/brute-sprite-sheet.png",
                "frameWidth": 64,
                "frameHeight": 64,
                "directions": DIRECTIONS,
                "frames": frames,
                "animations": animations,
                "notes": "GPT-image-2 spreadsheet monster brute frames repacked from chroma-key source into fixed 64x64 Phaser-safe cells. Original brute sheet is preserved beside this file.",
            },
            indent=2,
        )
        + "\n"
    )


def process_spreadsheet_brute() -> None:
    ensure_dirs()
    img = key_color_to_alpha(Image.open(SOURCE_PATH), (255, 0, 255)).resize((640, 256), Image.Resampling.NEAREST)
    components = find_alpha_components(img, min_pixels=80)
    rows = group_components_by_row(components)

    sheet = Image.new("RGBA", (640, 256), (0, 0, 0, 0))
    for row_index, row_components in enumerate(rows[:4]):
        if not row_components:
            continue
        selected = row_components[:10]
        while len(selected) < 10:
            selected.append(selected[-1])

        for col_index, rect in enumerate(selected):
            x1, y1, x2, y2, _ = rect
            sprite = fit_sprite_frame(img.crop((x1, y1, x2, y2)))
            sheet.alpha_composite(sprite, (col_index * 64, row_index * 64))

    sheet.save(CHAR_OUT / "brute-sprite-sheet.png")
    write_brute_metadata()


if __name__ == "__main__":
    process_spreadsheet_brute()
