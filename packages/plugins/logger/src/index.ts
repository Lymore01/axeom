import type Axeom from "@axeom/core";
import { createPinoLogger, type Logger } from "@axeom/logger-lib";

export const logger = <T extends Record<string, any>, D extends Record<string, any>>(
  customLogger?: Logger,
) => {
  const logger = customLogger || createPinoLogger();

  return (app: Axeom<T, D>) => {
    app.decorate({ logger });

    app.onResponse((res, ctx: any) => {
      const duration = ctx.setDuration("total");
      const method = ctx.request.method;
      const url = new URL(ctx.request.url);
      const status = res.status;

      logger.info(`${method} ${url.pathname} ${status} - ${duration.toFixed(3)}ms`);
    });

    return app;
  };
};
