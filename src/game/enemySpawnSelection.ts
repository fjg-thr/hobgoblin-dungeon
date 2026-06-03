export interface EnemySpawnPoint {
  x: number;
  y: number;
}

function spawnDistance(point: EnemySpawnPoint, playerStart: EnemySpawnPoint) {
  return Math.hypot(point.x - playerStart.x, point.y - playerStart.y);
}

export function selectInitialEnemyStarts(
  starts: EnemySpawnPoint[],
  playerStart: EnemySpawnPoint,
  count: number,
  minDistanceFromPlayer: number
): EnemySpawnPoint[] {
  if (count <= 0) {
    return [];
  }

  const farthestFirst = [...starts].sort((a, b) => spawnDistance(b, playerStart) - spawnDistance(a, playerStart));
  const candidates = minDistanceFromPlayer > 0
    ? farthestFirst.filter((start) => spawnDistance(start, playerStart) >= minDistanceFromPlayer)
    : farthestFirst;
  return candidates.slice(0, count).map((start) => ({ ...start }));
}

export function enemySpawnDistanceForActiveCount(activeEnemyCount: number, normalDistance: number, initialDistance: number): number {
  return activeEnemyCount <= 0 ? Math.max(normalDistance, initialDistance) : normalDistance;
}
