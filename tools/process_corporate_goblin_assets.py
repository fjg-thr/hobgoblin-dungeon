from __future__ import annotations

from pathlib import Path

from PIL import Image

from process_assets import (
    CHAR_OUT,
    ROOT,
    ensure_dirs,
    find_alpha_components,
    fit_sprite_frame,
    group_components_by_row,
    key_color_to_alpha,
    write_actor_metadata,
)


SOURCE_PATH = ROOT / "public" / "assets" / "source" / "corporate-goblins-gpt-image-2-source.png"


def process_corporate_goblin() -> None:
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

    sheet.save(CHAR_OUT / "goblin-sprite-sheet.png")
    write_actor_metadata(
        "goblin-sprite-sheet",
        ["southeast", "southwest", "northeast", "northwest"],
        "GPT-image-2 corporate-work-task goblin enemy frames repacked from chroma-key source into fixed 64x64 Phaser-safe cells. Original goblin sheet is preserved beside this file.",
    )


if __name__ == "__main__":
    process_corporate_goblin()
