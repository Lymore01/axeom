import { createPinoLogger, type Logger } from "@axeom/logger-lib";
import { AxeomError } from "./errors";
import { Hooks } from "./hooks";
import { Router } from "./router";
import type { Context, Handler, PrefixT, RouteMetadata, RouteSchema } from "./types";
import { createRegex, formatValidationError } from "./utils";

export * from "./errors";
export * from "./types";

/**
 * Internal symbol used to store the server instance in the context.
 */
export const $SERVER = Symbol("Axeom:server");

/**
 * The primary engine of the Axeom framework.
 *
 * Axeom is a WinterTC-compliant, type-safe web framework designed for high-performance
 * and modularity. It supports automatic runtime detection (Bun, Deno, Node) and
 * provides a powerful plugin system.
 *
 * @template T - A record of route strings to their respective metadata, used for type-safe client generation.
 * @template D - A record of objects and utilities available on the request context (decorators).
 */
export class Axeom<
  T extends Record<string, any> = {},
  D extends Record<string, any> = { logger: Logger },
> {
  public router = new Router<T, D>();
  private hooks = new Hooks<T, D>();
  private server: any;
  private derives: Array<(ctx: any) => any> = [];
  private decorators: Record<string, any> = { logger: createPinoLogger() };

  private errorHandler: (error: any, ctx: Context<any, any, T, D>) => any = (error) => {
    if (error instanceof AxeomError) {
      return {
        status: "error",
        code: error.code,
        message: error.message,
        details: error.details,
      };
    }

    console.error(error);
    return { status: "error", message: "Internal Server Error" };
  };

  /**
   * Adds dynamic properties to the context by running a function before the route handler.
   * Derivations can be asynchronous and can return a Response to short-circuit the request.
   *
   * @param fn - A function that receives the current context and returns new properties to merge.
   */
  derive<NewD extends Record<string, any>>(
    fn: (ctx: Context<any, any, T, D>) => NewD | Response | Promise<NewD | Response>,
  ): Axeom<T, D & Exclude<NewD, Response>> {
    this.derives.push(fn);
    return this as unknown as Axeom<T, D & Exclude<NewD, Response>>;
  }

  /**
   * Registers a plugin.
   * Plugins are functions that receive the Axeom instance and can register routes,
   * hooks, or decorators.
   *
   * @param plugin - The plugin function to execute.
   */
  use<NewT extends Record<string, any>, NewD extends Record<string, any>>(
    plugin: (app: Axeom<T, D>) => Axeom<NewT, NewD>,
  ): Axeom<T & NewT, NewD> {
    return plugin(this) as unknown as Axeom<T & NewT, NewD>;
  }

  /**
   * Groups routes under a common path prefix.
   * This provides isolation for derivations and hooks within the group.
   *
   * @param prefix - The path prefix (e.g., "/api/v1").
   * @param run - A function where you define the routes for this group.
   */
  group<Prefix extends string, NewT extends Record<string, any>, NewD extends Record<string, any>>(
    prefix: Prefix,
    run: (app: Axeom<T, D>) => Axeom<NewT, NewD>,
  ): Axeom<T & PrefixT<Prefix, NewT>, NewD> {
    const branch = new Axeom<T, D>();

    // Inherit from parent
    branch.derives = [...this.derives];
    branch.decorators = { ...this.decorators };
    branch.hooks.setState(this.hooks.getState());

    const result = run(branch as any) as any;

    result.router.getRoutes().forEach((route: any) => {
      const fullPath = `${prefix}${route.path}`.replace(/\/+/g, "/");
      const paramNames: string[] = [];

      this.router.addRoute({
        ...route,
        path: fullPath,
        regex: createRegex(fullPath, paramNames),
        paramNames: paramNames,
      });
    });

    return this as unknown as any;
  }

  /**
   * Adds static properties to the context.
   * Decorators are available on every request context immediately.
   *
   * @param obj - An object containing properties to add to the context.
   */
  decorate<NewD extends Record<string, any>>(obj: NewD): Axeom<T, D & NewD> {
    this.decorators = { ...this.decorators, ...obj };
    return this as Axeom<T, D & NewD>;
  }

  protected addRoute<
    Method extends string,
    Path extends string,
    S extends RouteSchema = {},
    Return = any,
  >(
    method: Method,
    path: Path,
    handler: Handler<Path, S, T, D, Return>,
    schema?: S,
    metadata?: Record<string, any>,
  ) {
    this.router.add(
      method,
      path,
      handler as any,
      {
        derives: this.derives,
        decorators: this.decorators,
        ...this.hooks.getState(),
      },
      schema,
      metadata,
    );

    return this as unknown as Axeom<
      T & { [K in `${Method} ${Path}`]: RouteMetadata<Path, S, Return> },
      D
    >;
  }

  get<Path extends string, S extends RouteSchema = {}, Return = any>(
    path: Path,
    handler: Handler<Path, S, T, D, Return>,
    schema?: S,
  ) {
    return this.addRoute("GET", path, handler, schema);
  }

  post<Path extends string, S extends RouteSchema = {}, Return = any>(
    path: Path,
    handler: Handler<Path, S, T, D, Return>,
    schema?: S,
  ) {
    return this.addRoute("POST", path, handler, schema);
  }

  put<Path extends string, S extends RouteSchema = {}, Return = any>(
    path: Path,
    handler: Handler<Path, S, T, D, Return>,
    schema?: S,
  ) {
    return this.addRoute("PUT", path, handler, schema);
  }

  patch<Path extends string, S extends RouteSchema = {}, Return = any>(
    path: Path,
    handler: Handler<Path, S, T, D, Return>,
    schema?: S,
  ) {
    return this.addRoute("PATCH", path, handler, schema);
  }

  delete<Path extends string, S extends RouteSchema = {}, Return = any>(
    path: Path,
    handler: Handler<Path, S, T, D, Return>,
    schema?: S,
  ) {
    return this.addRoute("DELETE", path, handler, schema);
  }

  /**
   * Main entry point for handling requests.
   *
   * This is the standard WinterTC interface that converts a Request into a Response.
   * It executes the entire request lifecycle including hooks, derivations, and validation.
   *
   * @param incomingRequest - The standard Web Request object.
   * @returns A promise resolving to a standard Web Response object.
   */
  async handle(incomingRequest: Request): Promise<Response> {
    const url = new URL(incomingRequest.url);
    const { pathname, searchParams } = url;
    const method = incomingRequest.method;
    const startTime = performance.now();

    // Helper to finalize the response with headers and timing
    const finalizeResponse = async (res: Response, currentCtx?: any, routeHooks?: any) => {
      let finalRes = res;

      // Run onResponse hooks (local first if available, otherwise global)
      // Note: routeHooks.onResponses already includes global hooks snapshotted at route registration.
      const hooksToRun = routeHooks?.onResponses || this.hooks.onResponses;

      if (hooksToRun && hooksToRun.length > 0) {
        for (const onResponseFn of hooksToRun) {
          const result = await onResponseFn(finalRes, currentCtx);
          if (result instanceof Response) finalRes = result;
        }
      }

      const duration = performance.now() - startTime;
      finalRes.headers.set("Server-Timing", `total;dur=${duration.toFixed(2)}`);

      if (currentCtx && typeof currentCtx.getResponseHeaders === "function") {
        const ctxHeaders = currentCtx.getResponseHeaders();
        Object.entries(ctxHeaders).forEach(([name, value]) => {
          finalRes.headers.set(name, value as string);
        });
      }
      return finalRes;
    };

    if (this.hooks.onBeforeMatch.length > 0) {
      try {
        for (const hook of this.hooks.onBeforeMatch) {
          const result = await hook(incomingRequest);
          if (result instanceof Response) return await finalizeResponse(result);
        }
      } catch (error: any) {
        const errorResponse = await this.errorHandler(error, {} as any);
        return await finalizeResponse(
          Response.json(errorResponse, { status: error?.status || 500 }),
        );
      }
    }

    const matched = this.router.match(method, pathname);
    if (!matched) {
      return await finalizeResponse(new Response("Route not found", { status: 404 }));
    }

    const { route, match } = matched;
    const ctx = Object.create(null);

    try {
      const rawParams: any = {};
      route.paramNames.forEach((name, index) => {
        rawParams[name] = match[index + 1];
      });

      const responseHeaders: Record<string, string> = {};

      (ctx as any)[$SERVER] = this.server;

      Object.assign(ctx, route.decorators);
      ctx.params = rawParams;
      ctx.query = Object.fromEntries(searchParams.entries());
      ctx.headers = incomingRequest.headers;
      ctx.request = incomingRequest;

      // Inject Timing
      ctx.time = startTime;
      ctx.setDuration = (label: string) => {
        return performance.now() - startTime;
      };

      ctx.body = undefined;
      ctx.setResponseHeader = (name: string, value: string) => {
        responseHeaders[name] = value;
      };
      ctx.getResponseHeaders = () => responseHeaders;

      if (method !== "GET" && method !== "HEAD") {
        const contentType = incomingRequest.headers.get("content-type");
        try {
          if (contentType?.includes("application/json")) {
            ctx.body = await incomingRequest.json();
          } else if (
            contentType?.includes("multipart/form-data") ||
            contentType?.includes("application/x-www-form-urlencoded")
          ) {
            ctx.body = await incomingRequest.formData();
          }
        } catch {
          ctx.body = null;
        }
      }

      if (route.derives && route.derives.length > 0) {
        for (const deriveFn of route.derives) {
          const result = await deriveFn(ctx);
          if (result instanceof Response) return await finalizeResponse(result, ctx, route);
          if (result) Object.assign(ctx, result);
        }
      }

      if (route.onRequests && route.onRequests.length > 0) {
        for (const onRequestFn of route.onRequests) {
          await onRequestFn(ctx);
        }
      }

      if (route.beforeHandles && route.beforeHandles.length > 0) {
        for (const hook of route.beforeHandles) {
          const response = await hook(ctx);
          if (response instanceof Response) return await finalizeResponse(response, ctx, route);
        }
      }

      if (route.schema) {
        try {
          if (route.schema.params) ctx.params = await route.schema.params.parse(ctx.params);
          if (route.schema.query) ctx.query = await route.schema.query.parse(ctx.query);
          if (route.schema.body) {
            if (ctx.body instanceof FormData) {
              ctx.body = Object.fromEntries(ctx.body.entries());
            }
            ctx.body = await route.schema.body.parse(ctx.body);
          }
        } catch (e: any) {
          const formattedErrors = formatValidationError(e);
          return finalizeResponse(
            Response.json(
              {
                code: "VALIDATION_FAILED",
                message: "Request validation failed",
                errors: formattedErrors,
              },
              { status: 400 },
            ),
            ctx,
            route,
          );
        }
      }

      let response: any;
      if (route.handler) {
        response = await route.handler(ctx);
      }

      if (!(response instanceof Response)) {
        response = Response.json(response);
      }

      if (route.afterHandles && route.afterHandles.length > 0) {
        for (const hook of route.afterHandles) {
          const result = await hook(ctx);
          if (result instanceof Response) return await finalizeResponse(result, ctx, route);
        }
      }

      return await finalizeResponse(response, ctx, route);
    } catch (error: any) {
      const errorResponse = await this.errorHandler(error, ctx);
      return await finalizeResponse(
        Response.json(errorResponse, {
          status: error?.status || 500,
        }),
        ctx,
        route,
      );
    }
  }

  /**
   * Registers a global error handler.
   */
  onError(fn: (error: any, ctx: Context<any, any, T, D>) => any): this {
    this.errorHandler = fn;
    return this;
  }

  /**
   * Registers a global hook that runs as soon as a request is received.
   */
  onRequest(fn: (ctx: Context<any, any, T, D>) => void | Promise<void>): this {
    this.hooks.addRequestHook(fn as any);
    return this;
  }

  /**
   * Registers a hook that runs before the router attempts to match a path.
   * Useful for global redirects or early security checks.
   */
  onBeforeMatch(fn: (req: Request) => Response | undefined | Promise<Response | undefined>): this {
    this.hooks.addBeforeMatchHook(fn);
    return this;
  }

  /**
   * Registers a global hook that runs after a Response has been created.
   * Allows modifying headers or the body before it's sent.
   */
  onResponse(
    fn: (
      res: Response,
      ctx: Context<any, any, T, D>,
    ) => Response | undefined | Promise<Response | undefined>,
  ): this {
    this.hooks.addResponseHook(fn as any);
    return this;
  }

  /**
   * Registers a hook that runs before the route handler is executed.
   */
  onBeforeHandle(
    fn: (ctx: Context<any, any, T, D>) => Response | undefined | Promise<Response | undefined>,
  ): this {
    this.hooks.addBeforeHandleHook(fn as any);
    return this;
  }

  /**
   * Registers a hook that runs after the route handler is executed.
   */
  onAfterHandle(
    fn: (ctx: Context<any, any, T, D>) => Response | undefined | Promise<Response | undefined>,
  ): this {
    this.hooks.addAfterHandleHook(fn as any);
    return this;
  }

  /**
   * Registers a Server-Sent Events (SSE) route.
   *
   * @param path - The path for the SSE stream.
   * @param handler - A function returning an async iterable that yields data chunks.
   */
  sse<T = any>(path: string, handler: (ctx: any) => AsyncIterable<T> | Promise<AsyncIterable<T>>) {
    return this.get(path, async (ctx) => {
      if ((ctx as any)[$SERVER]?.timeout) {
        (ctx as any)[$SERVER].timeout(ctx.request, 0);
      }

      const stream = await handler(ctx);

      const readable = new ReadableStream({
        async start(controller) {
          for await (const chunk of stream) {
            const data = typeof chunk === "string" ? chunk : JSON.stringify(chunk);
            controller.enqueue(`data: ${data}\n\n`);
          }
          controller.close();
        },
      }).pipeThrough(new TextEncoderStream());

      return new Response(readable, {
        headers: {
          "Content-Type": "text/event-stream",
          "Cache-Control": "no-cache",
          Connection: "keep-alive",
        },
      });
    });
  }

  /**
   * Automatically detect the runtime and start a server.
   * Currently supports: Bun, Deno.
   * For Node, use a specific adapter like @axeom/express.
   *
   * @param portOrOptions - The port number or a server options object.
   */
  listen(portOrOptions: number | any = 3000): any {
    const options =
      typeof portOrOptions === "number" ? { port: portOrOptions } : portOrOptions || {};
    const port = options.port || 3000;

    // @ts-expect-error - Bun detection
    if (typeof Bun !== "undefined") {
      // @ts-expect-error
      this.server = Bun.serve({
        ...options,
        port,
        fetch: async (req: Request, server: any) => {
          const res = await this.handle(req);
          if (res.status === 101) {
            const url = new URL(req.url);
            const matched = this.router.match(req.method, url.pathname);
            if (matched && matched.route.metadata?.ws) {
              const success = server.upgrade(req, {
                data: matched.route.metadata.ws,
              });
              if (success) return undefined;
            }
          }
          return res;
        },
        websocket: {
          open: (ws: any) => ws.data.open?.(ws),
          message: (ws: any, message: any) => ws.data.message?.(ws, message),
          close: (ws: any, code: number, reason: string) => ws.data.close?.(ws, code, reason),
          error: (ws: any, error: any) => ws.data.error?.(ws, error),
        },
      });

      console.log(`\x1b[32m Axeom listening on ${this.server.url}\x1b[0m`);
      return this.server;
    }

    // @ts-expect-error - Deno detection
    if (typeof Deno !== "undefined" && typeof Deno.serve === "function") {
      // @ts-expect-error
      this.server = Deno.serve({ ...options, port }, async (req) => {
        const res = await this.handle(req);
        if (res.status === 101) {
          const url = new URL(req.url);
          const matched = this.router.match(req.method, url.pathname);
          if (matched && matched.route.metadata?.ws) {
            // @ts-expect-error
            const { socket, response } = Deno.upgradeWebSocket(req);
            const handlers = matched.route.metadata.ws;
            socket.onopen = () => handlers.open?.(socket);
            socket.onmessage = (e: any) => handlers.message?.(socket, e.data);
            socket.onclose = () => handlers.close?.(socket);
            socket.onerror = (e: any) => handlers.error?.(socket, e);
            return response;
          }
        }
        return res;
      });
      return this.server;
    }

    if (typeof process !== "undefined" && process.release?.name === "node") {
      throw new Error(
        "[Axeom] Automatic runtime detection found Node.js. " +
          "Axeom requires a Fetch API compatible server. " +
          "Please use @axeom/express for Node.js environments.",
      );
    }

    throw new Error(
      "[Axeom] Automatic runtime detection failed. " +
        "Ensure you are running in a supported environment (Bun, Deno) or use an adapter.",
    );
  }
}

export default Axeom;
