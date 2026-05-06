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

export interface DungeonMap {
  width: number;
  height: number;
  rows: string[];
  playerStart: { x: number; y: number };
  enemyStarts: Array<{ x: number; y: number }>;
  props: DungeonProp[];
}

export const MAP_WIDTH = 28;
export const MAP_HEIGHT = 24;

type MutableGrid = TileCode[][];
interface Room {
  left: number;
  top: number;
  right: number;
  bottom: number;
}

type RandomSource = () => number;

function createGrid(): MutableGrid {
  return Array.from({ length: MAP_HEIGHT }, () => Array<TileCode>(MAP_WIDTH).fill(" "));
}

function randomInt(random: RandomSource, min: number, max: number): number {
  return Math.floor(random() * (max - min + 1)) + min;
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

function roomCenter(room: Room): { x: number; y: number } {
  return {
    x: Math.floor((room.left + room.right) / 2),
    y: Math.floor((room.top + room.bottom) / 2)
  };
}

function overlaps(a: Room, b: Room, padding = 1): boolean {
  return !(a.right + padding < b.left || b.right + padding < a.left || a.bottom + padding < b.top || b.bottom + padding < a.top);
}

function makeRooms(random: RandomSource): Room[] {
  const rooms: Room[] = [];
  const targetCount = randomInt(random, 6, 8);

  for (let attempt = 0; attempt < 90 && rooms.length < targetCount; attempt += 1) {
    const width = randomInt(random, 4, 8);
    const height = randomInt(random, 4, 7);
    const left = randomInt(random, 2, MAP_WIDTH - width - 3);
    const top = randomInt(random, 2, MAP_HEIGHT - height - 3);
    const room = { left, top, right: left + width - 1, bottom: top + height - 1 };

    if (rooms.every((existing) => !overlaps(room, existing))) {
      rooms.push(room);
    }
  }

  if (rooms.length < 4) {
    return [
      { left: 3, top: 3, right: 9, bottom: 8 },
      { left: 15, top: 5, right: 23, bottom: 12 },
      { left: 6, top: 15, right: 15, bottom: 21 },
      { left: 19, top: 16, right: 25, bottom: 21 }
    ];
  }

  return rooms.sort((a, b) => roomCenter(a).x + roomCenter(a).y - (roomCenter(b).x + roomCenter(b).y));
}

function paintCorridor(grid: MutableGrid, from: Room, to: Room, random: RandomSource) {
  const start = roomCenter(from);
  const end = roomCenter(to);
  const horizontalFirst = random() > 0.5;

  if (horizontalFirst) {
    paintRect(grid, Math.min(start.x, end.x), start.y - 1, Math.max(start.x, end.x), start.y + 1, ".");
    paintRect(grid, end.x - 1, Math.min(start.y, end.y), end.x + 1, Math.max(start.y, end.y), ".");
    return;
  }

  paintRect(grid, start.x - 1, Math.min(start.y, end.y), start.x + 1, Math.max(start.y, end.y), ".");
  paintRect(grid, Math.min(start.x, end.x), end.y - 1, Math.max(start.x, end.x), end.y + 1, ".");
}

function paintFloorPlan(grid: MutableGrid, rooms: Room[], random: RandomSource) {
  rooms.forEach((room) => paintRect(grid, room.left, room.top, room.right, room.bottom, "."));
  for (let index = 1; index < rooms.length; index += 1) {
    paintCorridor(grid, rooms[index - 1], rooms[index], random);
  }
}

function playableTiles(grid: MutableGrid): Array<{ x: number; y: number }> {
  const tiles: Array<{ x: number; y: number }> = [];
  for (let y = 0; y < MAP_HEIGHT; y += 1) {
    for (let x = 0; x < MAP_WIDTH; x += 1) {
      if (grid[y][x] === "." || grid[y][x] === "c" || grid[y][x] === "m" || grid[y][x] === "B" || grid[y][x] === "S") {
        tiles.push({ x, y });
      }
    }
  }
  return tiles;
}

function addFloorVariation(grid: MutableGrid, random: RandomSource) {
  playableTiles(grid).forEach(({ x, y }) => {
    if (grid[y][x] !== ".") {
      return;
    }
    const roll = random();
    if (roll < 0.08) {
      grid[y][x] = "m";
    } else if (roll < 0.17) {
      grid[y][x] = "c";
    }
  });
}

function addChasmBridge(grid: MutableGrid, rooms: Room[], random: RandomSource) {
  const room = rooms.find((candidate) => candidate.right - candidate.left >= 6 && candidate.bottom - candidate.top >= 4);
  if (!room || random() < 0.25) {
    return;
  }

  const y = randomInt(random, room.top + 1, room.bottom - 1);
  const left = Math.max(room.left + 1, roomCenter(room).x - 3);
  const right = Math.min(room.right - 1, roomCenter(room).x + 3);
  paintRect(grid, left, y, right, y, "h");
  paintRect(grid, left + 2, y, right - 2, y, "B");
}

function addStairs(grid: MutableGrid, rooms: Room[]) {
  const last = roomCenter(rooms[rooms.length - 1]);
  grid[last.y][last.x] = "S";
}

function addInteriorWalls(grid: MutableGrid, rooms: Room[], random: RandomSource) {
  rooms.slice(1, 4).forEach((room) => {
    if (random() < 0.45) {
      return;
    }
    const vertical = random() > 0.5;
    if (vertical && room.bottom - room.top >= 4) {
      const x = randomInt(random, room.left + 1, room.right - 1);
      paintRect(grid, x, room.top + 1, x, room.bottom - 1, "W");
      grid[roomCenter(room).y][x] = ".";
    } else if (room.right - room.left >= 5) {
      const y = randomInt(random, room.top + 1, room.bottom - 1);
      paintRect(grid, room.left + 1, y, room.right - 1, y, "W");
      grid[y][roomCenter(room).x] = ".";
    }
  });
}

function addProps(grid: MutableGrid, rooms: Room[], random: RandomSource, reserved: Set<string>): DungeonProp[] {
  const props: DungeonProp[] = [];
  const propKinds: PropKind[] = ["torch", "bone_pile", "small_treasure", "red_banner", "rubble", "wooden_post", "small_candle"];

  rooms.forEach((room, roomIndex) => {
    const propCount = randomInt(random, roomIndex === 0 ? 2 : 1, roomIndex === 0 ? 3 : 2);
    for (let count = 0; count < propCount; count += 1) {
      const kind = propKinds[randomInt(random, 0, propKinds.length - 1)];
      for (let attempt = 0; attempt < 12; attempt += 1) {
        const x = randomInt(random, room.left, room.right);
        const y = randomInt(random, room.top, room.bottom);
        const key = `${x},${y}`;
        if (reserved.has(key) || grid[y][x] === "h" || grid[y][x] === "B" || grid[y][x] === "S" || grid[y][x] === "W") {
          continue;
        }
        reserved.add(key);
        props.push({ kind, x, y, blocks: true });
        break;
      }
    }
  });

  return props;
}

export function createDungeon(random: RandomSource = Math.random): DungeonMap {
  const grid = createGrid();
  const rooms = makeRooms(random);
  paintFloorPlan(grid, rooms, random);
  addChasmBridge(grid, rooms, random);
  addFloorVariation(grid, random);
  addInteriorWalls(grid, rooms, random);
  addStairs(grid, rooms);
  addWallsAroundPlayable(grid);

  const firstRoomCenter = roomCenter(rooms[0]);
  const playerStart = { x: firstRoomCenter.x + 0.5, y: firstRoomCenter.y + 0.5 };
  const enemyStarts = rooms.slice(1).map((room) => {
    const center = roomCenter(room);
    return { x: center.x + 0.5, y: center.y + 0.5 };
  });
  const reserved = new Set<string>([
    `${Math.floor(playerStart.x)},${Math.floor(playerStart.y)}`,
    ...enemyStarts.map((start) => `${Math.floor(start.x)},${Math.floor(start.y)}`)
  ]);

  return {
    width: MAP_WIDTH,
    height: MAP_HEIGHT,
    rows: grid.map((row) => row.join("")),
    playerStart,
    enemyStarts: enemyStarts.length > 0 ? enemyStarts : [{ x: playerStart.x + 4, y: playerStart.y + 4 }],
    props: addProps(grid, rooms, random, reserved)
  };
}

export const tileAssetForCode: Record<Exclude<TileCode, " ">, TileAssetKey> = {
  W: "dark_wall",
  ".": "stone_floor",
  c: "cracked_floor",
  m: "mossy_floor",
  h: "chasm_edge",
  B: "wooden_bridge",
  S: "stairs_down"
};

export const startingDungeon = createDungeon(() => 0.42);

export function getTileCode(dungeon: DungeonMap, x: number, y: number): TileCode {
  if (y < 0 || y >= dungeon.rows.length || x < 0 || x >= dungeon.width) {
    return " ";
  }
  return dungeon.rows[y]?.[x] as TileCode;
}

export function isTileBlocked(code: TileCode): boolean {
  return code === " " || code === "W" || code === "h";
}
