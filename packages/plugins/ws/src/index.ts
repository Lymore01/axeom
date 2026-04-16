import type { Axeom } from "@axeom/core";

export interface WSHandlers {
  open?: (ws: any) => void | Promise<void>;
  message?: (ws: any, message: any) => void | Promise<void>;
  close?: (ws: any, code: number, reason: string) => void | Promise<void>;
  error?: (ws: any, error: any) => void | Promise<void>;
}

/**
 * Axeom WebSocket Plugin.
 * Adds the .ws() method to the Axeom instance.
 */
declare module "@axeom/core" {
  interface Axeom<T, D> {
    /**
     * Registers a WebSocket route.
     * Triggers a '101 Switching Protocols' response and delegates to the runtime's native upgrade handler.
     *
     * @param path The route path.
     * @param handlers WebSocket lifecycle handlers (open, message, close, etc.).
     */
    ws(path: string, handlers: WSHandlers): this;
  }
}

export const wsPlugin = () => {
  return <T extends Record<string, any>, D extends Record<string, any>>(
    app: Axeom<T, D>,
  ): Axeom<T, D> => {
    // Augment the instance with the .ws method at runtime
    (app as any).ws = function (path: string, handlers: WSHandlers) {
      // @ts-expect-error - access protected addRoute
      return this.addRoute(
        "GET",
        path,
        () => {
          return new Response(null, {
            status: 200,
            headers: {
              Upgrade: "websocket",
              Connection: "Upgrade",
              "X-Axeom-Status": "101",
            },
          });
        },
        undefined,
        { ws: handlers },
      );
    };

    return app;
  };
};

export default wsPlugin;
