import type { TileAssetKey } from "../assets/manifest";

export const ISO_TILE_WIDTH = 64;
export const ISO_TILE_HEIGHT = 32;
export const HALF_TILE_WIDTH = ISO_TILE_WIDTH / 2;
export const HALF_TILE_HEIGHT = ISO_TILE_HEIGHT / 2;

export type TileCode = " " | "W" | "." | "c" | "m" | "h" | "B" | "S";

export type PropKind =
  | "torch"
  | "bone_pile"
  | "small_treasure"
  | "red_banner"
  | "rubble"
  | "wooden_post"
  | "small_candle";

export interface DungeonProp {
  kind: PropKind;
  x: number;
  y: number;
  blocks: boolean;
}

const MAP_WIDTH = 28;
const MAP_HEIGHT = 24;

type MutableGrid = TileCode[][];

function createGrid(): MutableGrid {
  return Array.from({ length: MAP_HEIGHT }, () => Array<TileCode>(MAP_WIDTH).fill(" "));
}

function paintRect(grid: MutableGrid, left: number, top: number, right: number, bottom: number, code: TileCode) {
  for (let y = top; y <= bottom; y += 1) {
    for (let x = left; x <= right; x += 1) {
      if (x >= 0 && x < MAP_WIDTH && y >= 0 && y < MAP_HEIGHT) {
        grid[y][x] = code;
      }
    }
  }
}

function paintFloor(grid: MutableGrid) {
  paintRect(grid, 3, 3, 9, 8, ".");
  paintRect(grid, 8, 6, 13, 10, ".");
  paintRect(grid, 10, 10, 17, 12, "h");
  paintRect(grid, 12, 10, 15, 12, "B");
  paintRect(grid, 15, 6, 24, 15, ".");
  paintRect(grid, 13, 13, 18, 16, ".");
  paintRect(grid, 6, 15, 16, 21, ".");
  paintRect(grid, 19, 16, 25, 21, ".");

  const detailTiles: Array<[number, number, TileCode]> = [
    [5, 4, "m"],
    [8, 5, "c"],
    [7, 7, "m"],
    [10, 8, "c"],
    [16, 7, "m"],
    [20, 8, "c"],
    [22, 11, "m"],
    [17, 14, "c"],
    [9, 16, "m"],
    [12, 18, "c"],
    [15, 20, "m"],
    [21, 18, "c"],
    [24, 20, "m"]
  ];

  detailTiles.forEach(([x, y, code]) => {
    grid[y][x] = code;
  });

  grid[20][25] = "S";
}

function paintInteriorWalls(grid: MutableGrid) {
  paintRect(grid, 18, 8, 18, 12, "W");
  paintRect(grid, 21, 9, 21, 14, "W");
  paintRect(grid, 10, 17, 10, 20, "W");
  paintRect(grid, 23, 17, 23, 20, "W");
}

function addWallsAroundPlayable(grid: MutableGrid) {
  const playableCodes = new Set<TileCode>([".", "c", "m", "B", "S"]);
  const walls = new Set<string>();

  for (let y = 0; y < MAP_HEIGHT; y += 1) {
    for (let x = 0; x < MAP_WIDTH; x += 1) {
      if (!playableCodes.has(grid[y][x])) {
        continue;
      }

      [
        [x - 1, y],
        [x + 1, y],
        [x, y - 1],
        [x, y + 1]
      ].forEach(([wallX, wallY]) => {
        if (
          wallX >= 0 &&
          wallX < MAP_WIDTH &&
          wallY >= 0 &&
          wallY < MAP_HEIGHT &&
          grid[wallY][wallX] === " "
        ) {
          walls.add(`${wallX},${wallY}`);
        }
      });
    }
  }

  walls.forEach((key) => {
    const [x, y] = key.split(",").map(Number);
    grid[y][x] = "W";
  });
}

function buildRows(): string[] {
  const grid = createGrid();
  paintFloor(grid);
  paintInteriorWalls(grid);
  addWallsAroundPlayable(grid);
  return grid.map((row) => row.join(""));
}

const rows = buildRows();

export const tileAssetForCode: Record<Exclude<TileCode, " ">, TileAssetKey> = {
  W: "dark_wall",
  ".": "stone_floor",
  c: "cracked_floor",
  m: "mossy_floor",
  h: "chasm_edge",
  B: "wooden_bridge",
  S: "stairs_down"
};

export const startingDungeon = {
  width: MAP_WIDTH,
  height: MAP_HEIGHT,
  rows,
  playerStart: { x: 6.2, y: 5.6 },
  enemyStarts: [{ x: 20.5, y: 11.2 }],
  props: [
    { kind: "torch", x: 5, y: 4, blocks: true },
    { kind: "red_banner", x: 3, y: 5, blocks: true },
    { kind: "small_candle", x: 8, y: 7, blocks: true },
    { kind: "bone_pile", x: 10, y: 9, blocks: true },
    { kind: "torch", x: 17, y: 8, blocks: true },
    { kind: "red_banner", x: 23, y: 7, blocks: true },
    { kind: "wooden_post", x: 20, y: 13, blocks: true },
    { kind: "rubble", x: 16, y: 14, blocks: true },
    { kind: "small_candle", x: 18, y: 15, blocks: true },
    { kind: "wooden_post", x: 8, y: 19, blocks: true },
    { kind: "bone_pile", x: 11, y: 20, blocks: true },
    { kind: "torch", x: 22, y: 17, blocks: true },
    { kind: "rubble", x: 21, y: 20, blocks: true }
  ] satisfies DungeonProp[]
};

export function getTileCode(x: number, y: number): TileCode {
  if (y < 0 || y >= startingDungeon.rows.length || x < 0 || x >= startingDungeon.width) {
    return " ";
  }
  return startingDungeon.rows[y]?.[x] as TileCode;
}

export function isTileBlocked(code: TileCode): boolean {
  return code === " " || code === "W" || code === "h";
}
