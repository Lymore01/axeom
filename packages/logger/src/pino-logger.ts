import pino from "pino";
import type { Logger } from "./types";

export function createPinoLogger(options?: { level?: string }): Logger {
  const isNode = typeof process !== "undefined" && process.release?.name === "node";
  
  const pinoOptions: any = {
    level: options?.level || (typeof process !== "undefined" && process.env.LOG_LEVEL) || "info",
  };

  if (isNode) {
    pinoOptions.transport = {
      target: "pino-pretty",
      options: {
        colorize: true,
      },
    };
  }

  const pinoLogger = pino(pinoOptions);

  return {
    info: (msg: string, obj?: any) => pinoLogger.info(obj, msg),
    error: (msg: string, obj?: any) => pinoLogger.error(obj, msg),
    warn: (msg: string, obj?: any) => pinoLogger.warn(obj, msg),
    debug: (msg: string, obj?: any) => pinoLogger.debug(obj, msg),
  };
}

export function createCustomLogger(pinoInstance: any): Logger {
  return {
    info: (msg: string, obj?: any) => pinoInstance.info(obj, msg),
    error: (msg: string, obj?: any) => pinoInstance.error(obj, msg),
    warn: (msg: string, obj?: any) => pinoInstance.warn(obj, msg),
    debug: (msg: string, obj?: any) => pinoInstance.debug(obj, msg),
  };
}
