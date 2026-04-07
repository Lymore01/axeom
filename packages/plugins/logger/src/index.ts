import type Axiom from "@axiom/core";
import { createPinoLogger, type Logger } from "@axiom/logger";

export const loggerPlugin = <
  T extends Record<string, any>,
  D extends Record<string, any>,
>(
  customLogger?: Logger,
) => {
  return (app: Axiom<T, D>) => {
    const logger = customLogger || createPinoLogger();
    return app.decorate({ logger });
  };
};
