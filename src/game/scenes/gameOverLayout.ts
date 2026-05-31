interface Size {
  width: number;
  height: number;
}

interface Point {
  x: number;
  y: number;
}

interface Rect extends Point, Size {}

export interface GameOverLayout {
  panelScale: number;
  buttonScale: number;
  content: Point;
  subtitleY: number;
  finalScoreY: number;
  buttonY: number;
  restartZone: Rect;
}

const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);

export const calculateGameOverLayout = (viewport: Size, title: Size, button: Size): GameOverLayout => {
  const panelScale = clamp(Math.min((viewport.width * 0.5) / title.width, (viewport.height * 0.28) / title.height), 0.42, 0.66);
  const titleDisplayHeight = title.height * panelScale;
  const buttonScale = clamp(Math.min((viewport.width * 0.28) / button.width, 0.34), 0.22, 0.36);
  const buttonY = titleDisplayHeight * 0.9;

  return {
    panelScale,
    buttonScale,
    content: {
      x: viewport.width / 2,
      y: viewport.height * 0.43
    },
    subtitleY: titleDisplayHeight * 0.48,
    finalScoreY: titleDisplayHeight * 0.64,
    buttonY,
    restartZone: {
      x: viewport.width / 2,
      y: viewport.height * 0.43 + buttonY,
      width: button.width * buttonScale,
      height: button.height * buttonScale
    }
  };
};
