import { shutdownSignalExitCodes, shutdownSignals } from "./next-dev-clean-env-signals.mjs";

export const createNextDevCleanupRunner = ({
  argv,
  consoleLike,
  nextBinPath,
  processLike,
  spawn,
  spawnSync
}) => {
  let restoredRouteTypes = false;

  const restoreRouteTypes = () => {
    if (restoredRouteTypes) {
      return;
    }

    restoredRouteTypes = true;

    const result = spawnSync(processLike.execPath, [nextBinPath, "typegen"], {
      stdio: "ignore"
    });

    if (result.status !== 0) {
      consoleLike.error("Warning: failed to restore production Next route types after dev server shutdown.");
    }
  };

  const devServer = spawn(processLike.execPath, [nextBinPath, "dev", ...argv], {
    stdio: "inherit"
  });

  const forwardSignal = (signal) => {
    if (!devServer.killed) {
      devServer.kill(signal);
    }
  };

  shutdownSignals.forEach((signal) => {
    processLike.on(signal, () => forwardSignal(signal));
  });

  devServer.on("exit", (code, signal) => {
    restoreRouteTypes();

    if (signal) {
      processLike.exit(shutdownSignalExitCodes.get(signal) ?? 1);
      return;
    }

    processLike.exit(code ?? 0);
  });

  return {
    devServer,
    restoreRouteTypes
  };
};
