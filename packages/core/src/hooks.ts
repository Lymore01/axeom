import type { Context } from "./types";

/**
 * Manages the global and local request lifecycle hooks.
 * Hooks allow for cross-cutting concerns like logging, security, and response modification.
 */
export class Hooks<T extends Record<string, any>, D extends Record<string, any>> {
  public onRequests: Array<(ctx: Context<any, any, T, D>) => void | Promise<void>> = [];
  public onBeforeMatch: Array<
    (req: Request) => Response | undefined | Promise<Response | undefined>
  > = [];
  public onResponses: Array<
    (
      res: Response,
      ctx: Context<any, any, T, D>,
    ) => Response | undefined | Promise<Response | undefined>
  > = [];
  public beforeHandles: Array<
    (ctx: Context<any, any, T, D>) => Response | undefined | Promise<Response | undefined>
  > = [];
  public afterHandles: Array<
    (ctx: Context<any, any, T, D>) => Response | undefined | Promise<Response | undefined>
  > = [];

  addRequestHook(fn: (ctx: Context<any, any, T, D>) => void | Promise<void>) {
    this.onRequests.push(fn);
  }

  addBeforeMatchHook(fn: (req: Request) => Response | undefined | Promise<Response | undefined>) {
    this.onBeforeMatch.push(fn);
  }

  addResponseHook(
    fn: (
      res: Response,
      ctx: Context<any, any, T, D>,
    ) => Response | undefined | Promise<Response | undefined>,
  ) {
    this.onResponses.push(fn);
  }

  addBeforeHandleHook(
    fn: (ctx: Context<any, any, T, D>) => Response | undefined | Promise<Response | undefined>,
  ) {
    this.beforeHandles.push(fn);
  }

  addAfterHandleHook(
    fn: (ctx: Context<any, any, T, D>) => Response | undefined | Promise<Response | undefined>,
  ) {
    this.afterHandles.push(fn);
  }

  getState() {
    return {
      onRequests: this.onRequests,
      onBeforeMatch: this.onBeforeMatch,
      onResponses: this.onResponses,
      beforeHandles: this.beforeHandles,
      afterHandles: this.afterHandles,
    };
  }

  setState(state: any) {
    this.onRequests = [...state.onRequests];
    this.onBeforeMatch = [...(state.onBeforeMatch || [])];
    this.onResponses = [...state.onResponses];
    this.beforeHandles = [...state.beforeHandles];
    this.afterHandles = [...state.afterHandles];
  }
}
