export interface GameOverOverlayLayoutInput {
  viewportWidth: number;
  viewportHeight: number;
  titleWidth: number;
  titleHeight: number;
  restartButtonWidth: number;
  restartButtonHeight: number;
}

export interface GameOverOverlayLayout {
  contentX: number;
  panelY: number;
  panelScale: number;
  restartButtonY: number;
  restartButtonScale: number;
  restartZone: {
    centerX: number;
    centerY: number;
    width: number;
    height: number;
  };
}

interface PropagationEvent {
  stopPropagation: () => void;
}

const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);

export const stopPropagation = (event?: PropagationEvent) => {
  event?.stopPropagation();
};

export const gameOverOverlayLayout = ({
  viewportWidth,
  viewportHeight,
  titleWidth,
  titleHeight,
  restartButtonWidth,
  restartButtonHeight
}: GameOverOverlayLayoutInput): GameOverOverlayLayout => {
  const panelY = viewportHeight * 0.43;
  const panelScale = clamp(Math.min((viewportWidth * 0.5) / titleWidth, (viewportHeight * 0.28) / titleHeight), 0.42, 0.66);
  const restartButtonY = titleHeight * panelScale * 0.9;
  const restartButtonScale = clamp(Math.min((viewportWidth * 0.28) / restartButtonWidth, 0.34), 0.22, 0.36);

  return {
    contentX: viewportWidth / 2,
    panelY,
    panelScale,
    restartButtonY,
    restartButtonScale,
    restartZone: {
      centerX: viewportWidth / 2,
      centerY: panelY + restartButtonY,
      width: restartButtonWidth * restartButtonScale,
      height: restartButtonHeight * restartButtonScale
    }
  };
};
