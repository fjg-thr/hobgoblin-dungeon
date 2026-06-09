interface HasteVisualState {
  nowMs: number;
  hasteUntilMs: number;
  gameOver: boolean;
  playerDying: boolean;
}

export const isHasteVisualActive = ({ nowMs, hasteUntilMs, gameOver, playerDying }: HasteVisualState): boolean => {
  return nowMs < hasteUntilMs && !gameOver && !playerDying;
};
