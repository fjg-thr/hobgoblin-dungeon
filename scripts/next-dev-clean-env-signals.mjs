export const shutdownSignals = ["SIGINT", "SIGTERM", "SIGHUP"];

export const shutdownSignalExitCodes = new Map([
  ["SIGINT", 130],
  ["SIGTERM", 143],
  ["SIGHUP", 129]
]);
