from __future__ import annotations

import json
import math
from pathlib import Path

from PIL import Image


ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "tmp" / "generated-source"
CHAR_SRC = SOURCE / "hobgoblin-source.png"
GOBLIN_SRC = SOURCE / "goblin-source.png"
PROJECTILE_SRC = SOURCE / "staff-projectile-source.png"
TILE_SRC = SOURCE / "tileset-source.png"
UI_SRC = SOURCE / "ui-effects-source.png"

CHAR_OUT = ROOT / "public" / "assets" / "characters"
TILE_OUT = ROOT / "public" / "assets" / "tiles"
EFFECT_OUT = ROOT / "public" / "assets" / "effects"
UI_OUT = ROOT / "public" / "assets" / "ui"


def ensure_dirs() -> None:
    for path in [CHAR_OUT, TILE_OUT, EFFECT_OUT, UI_OUT]:
        path.mkdir(parents=True, exist_ok=True)


def key_to_alpha(img: Image.Image) -> Image.Image:
    rgba = img.convert("RGBA")
    pixels = rgba.load()
    width, height = rgba.size

    for y in range(height):
        for x in range(width):
            r, g, b, a = pixels[x, y]
            # The generated key is vivid green, but antialiasing produces a halo.
            green_dominant = g > 150 and g > r * 1.35 and g > b * 1.35
            close_to_key = abs(r - 0) + abs(g - 255) + abs(b - 0) < 140
            if green_dominant or close_to_key:
                pixels[x, y] = (r, g, b, 0)
    return rgba


def key_color_to_alpha(img: Image.Image, key: tuple[int, int, int]) -> Image.Image:
    rgba = img.convert("RGBA")
    pixels = rgba.load()
    width, height = rgba.size
    key_r, key_g, key_b = key

    for y in range(height):
        for x in range(width):
            r, g, b, a = pixels[x, y]
            distance = abs(r - key_r) + abs(g - key_g) + abs(b - key_b)
            if distance < 150:
                pixels[x, y] = (r, g, b, 0)
                continue

            if key == (255, 0, 255):
                key_dominant = r > 60 and b > 60 and g < 90 and r > g * 1.45 and b > g * 1.45
            else:
                key_dominant = g > 150 and g > r * 1.35 and g > b * 1.35

            if key_dominant:
                pixels[x, y] = (r, g, b, 0)
    return rgba


def trim_alpha(img: Image.Image, padding: int = 4) -> Image.Image:
    alpha = img.getchannel("A")
    box = alpha.getbbox()
    if box is None:
        return img
    left, top, right, bottom = box
    left = max(0, left - padding)
    top = max(0, top - padding)
    right = min(img.width, right + padding)
    bottom = min(img.height, bottom + padding)
    return img.crop((left, top, right, bottom))


def fit_canvas(img: Image.Image, size: tuple[int, int]) -> Image.Image:
    img = trim_alpha(img, padding=4)
    max_w, max_h = size
    scale = min(max_w / img.width, max_h / img.height)
    new_size = (max(1, math.floor(img.width * scale)), max(1, math.floor(img.height * scale)))
    resized = img.resize(new_size, Image.Resampling.NEAREST)
    canvas = Image.new("RGBA", size, (0, 0, 0, 0))
    canvas.alpha_composite(resized, ((max_w - new_size[0]) // 2, (max_h - new_size[1]) // 2))
    return canvas


def fit_sprite_frame(img: Image.Image, size: tuple[int, int] = (64, 64)) -> Image.Image:
    img = trim_alpha(img, padding=2)
    max_w, max_h = size[0] - 8, size[1] - 8
    scale = min(max_w / img.width, max_h / img.height, 1)
    new_size = (max(1, math.floor(img.width * scale)), max(1, math.floor(img.height * scale)))
    resized = img.resize(new_size, Image.Resampling.NEAREST)
    canvas = Image.new("RGBA", size, (0, 0, 0, 0))
    # Keep the foot line stable so frames do not bob from uneven generated whitespace.
    canvas.alpha_composite(resized, ((size[0] - new_size[0]) // 2, size[1] - new_size[1] - 4))
    return canvas


def find_alpha_components(img: Image.Image, min_pixels: int = 150) -> list[tuple[int, int, int, int, int]]:
    width, height = img.size
    pixels = img.load()
    seen: set[tuple[int, int]] = set()
    components: list[tuple[int, int, int, int, int]] = []

    for y in range(height):
        for x in range(width):
            if (x, y) in seen or pixels[x, y][3] == 0:
                continue

            stack = [(x, y)]
            seen.add((x, y))
            xs: list[int] = []
            ys: list[int] = []

            while stack:
                cx, cy = stack.pop()
                xs.append(cx)
                ys.append(cy)
                for nx, ny in ((cx + 1, cy), (cx - 1, cy), (cx, cy + 1), (cx, cy - 1)):
                    if (
                        0 <= nx < width
                        and 0 <= ny < height
                        and (nx, ny) not in seen
                        and pixels[nx, ny][3] > 0
                    ):
                        seen.add((nx, ny))
                        stack.append((nx, ny))

            if len(xs) >= min_pixels:
                components.append((min(xs), min(ys), max(xs) + 1, max(ys) + 1, len(xs)))

    return components


def keep_largest_alpha_component(img: Image.Image) -> Image.Image:
    components = find_alpha_components(img, min_pixels=12)
    if not components:
        return img

    keep = max(components, key=lambda component: component[4])
    x1, y1, x2, y2, _ = keep
    out = Image.new("RGBA", img.size, (0, 0, 0, 0))
    out.alpha_composite(img.crop((x1, y1, x2, y2)), (x1, y1))
    return out


def group_components_by_row(components: list[tuple[int, int, int, int, int]], rows: int = 4) -> list[list[tuple[int, int, int, int, int]]]:
    ordered = sorted(components, key=lambda box: (box[1] + box[3]) / 2)
    grouped = [[] for _ in range(rows)]
    for index, component in enumerate(ordered):
        grouped[min(rows - 1, index * rows // max(1, len(ordered)))].append(component)
    return [sorted(row, key=lambda box: box[0]) for row in grouped]


def process_character() -> None:
    img = key_to_alpha(Image.open(CHAR_SRC)).resize((640, 256), Image.Resampling.NEAREST)
    components = find_alpha_components(img)
    rows = group_components_by_row(components)

    sheet = Image.new("RGBA", (640, 256), (0, 0, 0, 0))
    repacked_source_rects = {}

    for row_index, row_components in enumerate(rows):
        if len(row_components) < 1:
            continue
        selected = row_components[:10]
        while len(selected) < 10:
            selected.append(selected[-1])

        for col_index, rect in enumerate(selected):
            x1, y1, x2, y2, _ = rect
            sprite = fit_sprite_frame(img.crop((x1, y1, x2, y2)))
            sheet.alpha_composite(sprite, (col_index * 64, row_index * 64))
            repacked_source_rects[f"{row_index}_{col_index}"] = {"x": x1, "y": y1, "w": x2 - x1, "h": y2 - y1}

    sheet.save(CHAR_OUT / "hobgoblin-sprite-sheet.png")

    directions = ["southeast", "southwest", "northeast", "northwest"]
    frames = {}
    animations = {}
    for row, direction in enumerate(directions):
        idle = []
        walk = []
        for col in range(10):
            key = f"{direction}_{col:02d}"
            frames[key] = {"x": col * 64, "y": row * 64, "w": 64, "h": 64}
            if col < 4:
                idle.append(key)
            else:
                walk.append(key)
        animations[f"idle-{direction}"] = {"frames": idle, "frameRate": 6, "repeat": -1}
        animations[f"walk-{direction}"] = {"frames": walk, "frameRate": 10, "repeat": -1}

    metadata = {
        "image": "/assets/characters/hobgoblin-sprite-sheet.png",
        "frameWidth": 64,
        "frameHeight": 64,
        "directions": directions,
        "frames": frames,
        "animations": animations,
        "repackedSourceRects": repacked_source_rects,
        "fallback": "Generated source produced 9 poses per row; the processor repacks alpha components into fixed 64x64 Phaser-safe cells and duplicates the last pose in each row to provide 10 frames."
    }
    (CHAR_OUT / "hobgoblin-sprite-sheet.json").write_text(json.dumps(metadata, indent=2))


def write_actor_metadata(filename: str, directions: list[str], notes: str) -> None:
    frames = {}
    animations = {}
    for row, direction in enumerate(directions):
        idle = []
        walk = []
        for col in range(10):
            key = f"{direction}_{col:02d}"
            frames[key] = {"x": col * 64, "y": row * 64, "w": 64, "h": 64}
            if col < 4:
                idle.append(key)
            else:
                walk.append(key)
        animations[f"idle-{direction}"] = {"frames": idle, "frameRate": 6, "repeat": -1}
        animations[f"walk-{direction}"] = {"frames": walk, "frameRate": 10, "repeat": -1}

    metadata = {
        "image": f"/assets/characters/{filename}.png",
        "frameWidth": 64,
        "frameHeight": 64,
        "directions": directions,
        "frames": frames,
        "animations": animations,
        "notes": notes
    }
    (CHAR_OUT / f"{filename}.json").write_text(json.dumps(metadata, indent=2))


def process_goblin() -> None:
    img = key_color_to_alpha(Image.open(GOBLIN_SRC), (255, 0, 255)).resize((640, 256), Image.Resampling.NEAREST)
    components = find_alpha_components(img, min_pixels=80)
    rows = group_components_by_row(components)

    sheet = Image.new("RGBA", (640, 256), (0, 0, 0, 0))
    for row_index, row_components in enumerate(rows):
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
        "Generated goblin enemy frames repacked from chroma-key source into fixed 64x64 Phaser-safe cells."
    )


def fit_projectile_frame(img: Image.Image, size: tuple[int, int] = (32, 32)) -> Image.Image:
    img = trim_alpha(img, padding=2)
    max_w, max_h = size[0] - 4, size[1] - 4
    scale = min(max_w / img.width, max_h / img.height, 1)
    new_size = (max(1, math.floor(img.width * scale)), max(1, math.floor(img.height * scale)))
    resized = img.resize(new_size, Image.Resampling.NEAREST)
    canvas = Image.new("RGBA", size, (0, 0, 0, 0))
    canvas.alpha_composite(resized, ((size[0] - new_size[0]) // 2, (size[1] - new_size[1]) // 2))
    return canvas


def process_projectile() -> None:
    img = key_color_to_alpha(Image.open(PROJECTILE_SRC), (0, 255, 0))
    source_w = img.width / 8
    source_h = img.height / 2
    sheet = Image.new("RGBA", (256, 64), (0, 0, 0, 0))
    frames = {}
    animations = {"fly": {"frames": [], "frameRate": 14, "repeat": -1}, "impact": {"frames": [], "frameRate": 18, "repeat": 0}}

    for row, animation_key in enumerate(["fly", "impact"]):
        for col in range(8):
            rect = (
                round(col * source_w),
                round(row * source_h),
                round((col + 1) * source_w),
                round((row + 1) * source_h)
            )
            sprite = fit_projectile_frame(img.crop(rect))
            sheet.alpha_composite(sprite, (col * 32, row * 32))
            key = f"{animation_key}_{col:02d}"
            frames[key] = {"x": col * 32, "y": row * 32, "w": 32, "h": 32}
            animations[animation_key]["frames"].append(key)

    sheet.save(EFFECT_OUT / "staff-bolt-sprite-sheet.png")
    metadata = {
        "image": "/assets/effects/staff-bolt-sprite-sheet.png",
        "frameWidth": 32,
        "frameHeight": 32,
        "frames": frames,
        "animations": animations
    }
    (EFFECT_OUT / "staff-bolt-sprite-sheet.json").write_text(json.dumps(metadata, indent=2))


TILES = [
    {"name": "stone_floor", "cell": (0, 0), "size": (64, 48), "collision": "none", "layer": "ground", "notes": "Default walkable stone floor."},
    {"name": "cracked_floor", "cell": (1, 0), "size": (64, 48), "collision": "none", "layer": "ground", "notes": "Walkable cracked floor variation."},
    {"name": "mossy_floor", "cell": (2, 0), "size": (64, 48), "collision": "none", "layer": "ground", "notes": "Walkable mossy floor variation."},
    {"name": "dark_wall", "cell": (3, 0), "size": (96, 96), "collision": "solid", "layer": "wall", "notes": "Blocking wall segment."},
    {"name": "corner_wall", "cell": (4, 0), "size": (96, 96), "collision": "solid", "layer": "wall", "notes": "Blocking corner wall."},
    {"name": "stairs_down", "cell": (0, 1), "size": (96, 72), "collision": "none", "layer": "prop", "notes": "Visible exit, no interaction yet."},
    {"name": "chasm_edge", "cell": (1, 1), "size": (96, 72), "collision": "solid", "layer": "ground", "notes": "Blocked chasm/void tile."},
    {"name": "wooden_bridge", "cell": (2, 1), "size": (96, 72), "collision": "none", "layer": "ground", "notes": "Walkable bridge across chasm."},
    {"name": "torch", "cell": (3, 1), "size": (64, 96), "collision": "solid", "layer": "prop", "notes": "Blocking torch prop with glow."},
    {"name": "bone_pile", "cell": (4, 1), "size": (72, 56), "collision": "solid", "layer": "prop", "notes": "Blocking decoration."},
    {"name": "small_treasure", "cell": (0, 2), "size": (80, 64), "collision": "solid", "layer": "prop", "notes": "Blocking treasure debris."},
    {"name": "red_banner", "cell": (1, 2), "size": (64, 96), "collision": "solid", "layer": "prop", "notes": "Blocking hobgoblin banner prop."},
    {"name": "rubble", "cell": (2, 2), "size": (72, 56), "collision": "solid", "layer": "prop", "notes": "Blocking rubble prop."},
    {"name": "wooden_post", "cell": (3, 2), "size": (48, 72), "collision": "solid", "layer": "prop", "notes": "Blocking wooden post."},
    {"name": "small_candle", "cell": (4, 2), "size": (48, 64), "collision": "solid", "layer": "prop", "notes": "Blocking candle prop."}
]


def process_tiles() -> None:
    img = key_to_alpha(Image.open(TILE_SRC))
    img.save(TILE_OUT / "dungeon-tileset.png")
    cell_w = img.width / 5
    cell_h = img.height / 3
    manifest = []
    for tile in TILES:
        col, row = tile["cell"]
        rect = (
            round(col * cell_w),
            round(row * cell_h),
            round((col + 1) * cell_w),
            round((row + 1) * cell_h)
        )
        cropped = img.crop(rect)
        if tile["name"] in {"dark_wall", "corner_wall"}:
            cropped = keep_largest_alpha_component(cropped)
        sized = fit_canvas(cropped, tile["size"])
        filename = f"{tile['name']}.png"
        sized.save(TILE_OUT / filename)
        manifest.append({
            "name": tile["name"],
            "path": f"/assets/tiles/{filename}",
            "sourceRect": {"x": rect[0], "y": rect[1], "w": rect[2] - rect[0], "h": rect[3] - rect[1]},
            "collision": tile["collision"],
            "renderLayer": tile["layer"],
            "placementNotes": tile["notes"]
        })

        if tile["name"] == "corner_wall":
            vertical = Image.new("RGBA", tile["size"], (0, 0, 0, 0))
            vertical.alpha_composite(sized.crop((0, 0, 58, sized.height)), (23, 0))
            vertical = keep_largest_alpha_component(vertical)
            vertical.save(TILE_OUT / "vertical_wall.png")
            manifest.append({
                "name": "vertical_wall",
                "path": "/assets/tiles/vertical_wall.png",
                "sourceRect": {"x": rect[0], "y": rect[1], "w": 58, "h": rect[3] - rect[1]},
                "collision": "solid",
                "renderLayer": "wall",
                "placementNotes": "Derived from the generated corner wall to provide a vertical isometric wall face."
            })
    (TILE_OUT / "dungeon-tileset.json").write_text(json.dumps({"image": "/assets/tiles/dungeon-tileset.png", "tiles": manifest}, indent=2))


EFFECTS = [
    {"name": "shadow_blob", "rect": (110, 200, 505, 430), "size": (48, 24), "out": EFFECT_OUT},
    {"name": "torch_glow", "rect": (720, 60, 1100, 420), "size": (96, 96), "out": EFFECT_OUT},
    {"name": "dust_particle", "rect": (170, 520, 470, 760), "size": (32, 32), "out": EFFECT_OUT},
    {"name": "small_dark_panel", "rect": (625, 490, 1160, 750), "size": (192, 72), "out": UI_OUT},
    {"name": "debug_label_bg", "rect": (95, 910, 505, 1080), "size": (128, 32), "out": UI_OUT},
    {"name": "keyboard_hint_panel", "rect": (600, 815, 1190, 1165), "size": (208, 112), "out": UI_OUT}
]


def process_effects_ui() -> None:
    img = key_to_alpha(Image.open(UI_SRC))
    img.save(UI_OUT / "ui-effects-sheet.png")
    manifest = []
    for entry in EFFECTS:
        cropped = img.crop(entry["rect"])
        sized = fit_canvas(cropped, entry["size"])
        filename = f"{entry['name']}.png"
        sized.save(entry["out"] / filename)
        manifest.append({
            "name": entry["name"],
            "path": f"/assets/{'effects' if entry['out'] == EFFECT_OUT else 'ui'}/{filename}",
            "sourceRect": {"x": entry["rect"][0], "y": entry["rect"][1], "w": entry["rect"][2] - entry["rect"][0], "h": entry["rect"][3] - entry["rect"][1]}
        })
    (UI_OUT / "ui-effects-sheet.json").write_text(json.dumps({"image": "/assets/ui/ui-effects-sheet.png", "assets": manifest}, indent=2))


def main() -> None:
    ensure_dirs()
    process_character()
    process_goblin()
    process_tiles()
    process_projectile()
    process_effects_ui()


if __name__ == "__main__":
    main()
