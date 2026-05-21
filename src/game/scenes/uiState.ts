const MUTE_PREFERENCE_KEY = "hobgoblin-dungeon-muted";

type ReadableStorage = Pick<Storage, "getItem">;
type WritableStorage = Pick<Storage, "setItem">;

export const SHOOT_KEY_NAMES = ["SPACE", "J"] as const;

export const isShootRequested = (queued: boolean, keyStates: readonly boolean[]) =>
  queued || keyStates.some((isDown) => isDown);

export interface GameOverLayoutOptions {
  cameraWidth: number;
  cameraHeight: number;
  titleWidth: number;
  titleHeight: number;
  buttonWidth: number;
  buttonHeight: number;
}

export interface GameOverLayout {
  overlay: {
    width: number;
    height: number;
  };
  content: {
    x: number;
    y: number;
  };
  panelScale: number;
  subtitleY: number;
  finalScoreY: number;
  button: {
    y: number;
    scale: number;
  };
  restartZone: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
}

const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);

const getBrowserLocalStorage = (): Storage | undefined => {
  if (typeof window === "undefined") {
    return undefined;
  }

  try {
    return window.localStorage;
  } catch {
    return undefined;
  }
};

export const readStoredMutePreference = (storage: ReadableStorage | undefined = getBrowserLocalStorage()) => {
  if (!storage) {
    return false;
  }

  try {
    return storage.getItem(MUTE_PREFERENCE_KEY) === "1";
  } catch {
    return false;
  }
};

export const writeStoredMutePreference = (
  muted: boolean,
  storage: WritableStorage | undefined = getBrowserLocalStorage()
) => {
  if (!storage) {
    return;
  }

  try {
    storage.setItem(MUTE_PREFERENCE_KEY, muted ? "1" : "0");
  } catch {
    // Storage can be blocked in privacy modes or embedded contexts; mute still applies for this session.
  }
};

export const getGameOverLayout = ({
  cameraWidth,
  cameraHeight,
  titleWidth,
  titleHeight,
  buttonWidth,
  buttonHeight
}: GameOverLayoutOptions): GameOverLayout => {
  const panelScale = clamp(Math.min((cameraWidth * 0.5) / titleWidth, (cameraHeight * 0.28) / titleHeight), 0.42, 0.66);
  const titleDisplayHeight = titleHeight * panelScale;
  const buttonScale = clamp(Math.min((cameraWidth * 0.28) / buttonWidth, 0.34), 0.22, 0.36);
  const buttonY = titleDisplayHeight * 0.9;
  const content = {
    x: cameraWidth / 2,
    y: cameraHeight * 0.43
  };

  return {
    overlay: {
      width: cameraWidth,
      height: cameraHeight
    },
    content,
    panelScale,
    subtitleY: titleDisplayHeight * 0.48,
    finalScoreY: titleDisplayHeight * 0.64,
    button: {
      y: buttonY,
      scale: buttonScale
    },
    restartZone: {
      x: content.x,
      y: content.y + buttonY,
      width: buttonWidth * buttonScale,
      height: buttonHeight * buttonScale
    }
  };
};
