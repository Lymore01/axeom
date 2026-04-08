import { createPinoLogger, type Logger } from "@axiom/logger";
import { AxiomError } from "./errors";
import { Hooks } from "./hooks";
import { Router } from "./router";
import type {
  Context,
  Handler,
  PrefixT,
  RouteMetadata,
  RouteSchema,
} from "./types";
import { createRegex, formatValidationError } from "./utils";

export * from "./errors";
export * from "./types";

export const $START_TIME = Symbol("axiom:startTime");
export const $SERVER = Symbol("axiom:server");

export class Axiom<
  T extends Record<string, any> = {},
  D extends Record<string, any> = { logger: Logger },
> {
  private router = new Router<any>();
  private hooks = new Hooks<any>();
  private server: any;
  private derives: Array<(ctx: any) => any> = [];
  private decorators: Record<string, any> = { logger: createPinoLogger() };

  private errorHandler: (error: any, ctx: Context<any, any, D>) => any = (
    error,
  ) => {
    if (error instanceof AxiomError) {
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
   */
  derive<NewD extends Record<string, any>>(
    fn: (
      ctx: Context<any, any, D>,
    ) => NewD | Response | Promise<NewD | Response>,
  ): Axiom<T, D & Exclude<NewD, Response>> {
    this.derives.push(fn);
    return this as unknown as Axiom<T, D & Exclude<NewD, Response>>;
  }

  /**
   * Registers a plugin.
   */
  use<NewT extends Record<string, any>, NewD extends Record<string, any>>(
    plugin: (app: Axiom<T, D>) => Axiom<NewT, NewD>,
  ): Axiom<T & NewT, NewD> {
    return plugin(this) as unknown as Axiom<T & NewT, NewD>;
  }

  /**
   * Groups routes under a common path prefix and providing isolation for derivations and hooks.
   */
  group<
    Prefix extends string,
    NewT extends Record<string, any>,
    NewD extends Record<string, any>,
  >(
    prefix: Prefix,
    run: (app: Axiom<T, D>) => Axiom<NewT, NewD>,
  ): Axiom<T & PrefixT<Prefix, NewT>, NewD> {
    const branch = new Axiom<T, D>();

    // Inherit from parent
    branch.derives = [...this.derives];
    branch.decorators = { ...this.decorators };
    branch.hooks.setState(this.hooks.getState());

    const result = run(branch as any) as any;

    // Merge routes from branch with prefix
    result.router.getRoutes().forEach((route: any) => {
      const fullPath = `${prefix}${route.path}`.replace(/\/+/g, "/");
      const paramNames: string[] = [];

      this.router.addRoute({
        ...route,
        path: fullPath,
        regex: createRegex(fullPath, paramNames),
        paramNames: paramNames, // Update param names
      });
    });

    return this as unknown as any;
  }

  /**
   * Adds static properties to the context.
   */
  decorate<NewD extends Record<string, any>>(obj: NewD): Axiom<T, D & NewD> {
    this.decorators = { ...this.decorators, ...obj };
    return this as Axiom<T, D & NewD>;
  }

  private addRoute<
    Method extends string,
    Path extends string,
    S extends RouteSchema = {},
    Return = any,
  >(
    method: Method,
    path: Path,
    handler: Handler<Path, S, D, Return>,
    schema?: S,
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
    );

    return this as unknown as Axiom<
      T & { [K in `${Method} ${Path}`]: RouteMetadata<Path, S, Return> },
      D
    >;
  }

  get<Path extends string, S extends RouteSchema = {}, Return = any>(
    path: Path,
    handler: Handler<Path, S, D, Return>,
    schema?: S,
  ) {
    return this.addRoute("GET", path, handler, schema);
  }

  post<Path extends string, S extends RouteSchema = {}, Return = any>(
    path: Path,
    handler: Handler<Path, S, D, Return>,
    schema?: S,
  ) {
    return this.addRoute("POST", path, handler, schema);
  }

  put<Path extends string, S extends RouteSchema = {}, Return = any>(
    path: Path,
    handler: Handler<Path, S, D, Return>,
    schema?: S,
  ) {
    return this.addRoute("PUT", path, handler, schema);
  }

  patch<Path extends string, S extends RouteSchema = {}, Return = any>(
    path: Path,
    handler: Handler<Path, S, D, Return>,
    schema?: S,
  ) {
    return this.addRoute("PATCH", path, handler, schema);
  }

  delete<Path extends string, S extends RouteSchema = {}, Return = any>(
    path: Path,
    handler: Handler<Path, S, D, Return>,
    schema?: S,
  ) {
    return this.addRoute("DELETE", path, handler, schema);
  }

  /**
   * Main entry point for handling requests.
   */
  async handle(incomingRequest: Request): Promise<Response> {
    const url = new URL(incomingRequest.url);
    const { pathname, searchParams } = url;
    const method = incomingRequest.method;

    if (this.hooks.onBeforeMatch.length > 0) {
      try {
        for (const hook of this.hooks.onBeforeMatch) {
          const result = await hook(incomingRequest);
          if (result instanceof Response) return result;
        }
      } catch (error: any) {
        const errorResponse = await this.errorHandler(error, {} as any);
        return Response.json(errorResponse, {
          status: error?.status || 500,
        });
      }
    }

    const matched = this.router.match(method, pathname);
    if (!matched) {
      return new Response("Route not found", { status: 404 });
    }

    const { route, match } = matched;
    let ctx = Object.create(null);

    try {
      // 1. Initial Context Setup
      const rawParams: any = {};
      route.paramNames.forEach((name, index) => {
        rawParams[name] = match[index + 1];
      });

      const responseHeaders: Record<string, string> = {};

      // Internal Metadata
      (ctx as any)[$SERVER] = this.server;

      Object.assign(ctx, route.decorators);
      ctx.params = rawParams;
      ctx.query = Object.fromEntries(searchParams.entries());
      ctx.headers = incomingRequest.headers;
      ctx.request = incomingRequest;
      ctx.body = undefined;
      ctx.setResponseHeader = (name: string, value: string) => {
        responseHeaders[name] = value;
      };
      ctx.getResponseHeaders = () => responseHeaders;

      // 2. Body Parsing
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

      // 3. Global Global/Local Hooks: onRequest
      if (route.onRequests && route.onRequests.length > 0) {
        for (const onRequestFn of route.onRequests) {
          await onRequestFn(ctx);
        }
      }

      // 4. Derivations
      if (route.derives && route.derives.length > 0) {
        for (const deriveFn of route.derives) {
          const result = await deriveFn(ctx);
          if (result instanceof Response) return result;
          if (result) Object.assign(ctx, result);
        }
      }

      // 5. Hooks: beforeHandle
      if (route.beforeHandles && route.beforeHandles.length > 0) {
        for (const hook of route.beforeHandles) {
          const response = await hook(ctx);
          if (response instanceof Response) return response;
        }
      }

      // 6. Schema Validation
      if (route.schema) {
        try {
          if (route.schema.params)
            ctx.params = await route.schema.params.parse(ctx.params);
          if (route.schema.query)
            ctx.query = await route.schema.query.parse(ctx.query);
          if (route.schema.body) {
            if (ctx.body instanceof FormData) {
              ctx.body = Object.fromEntries(ctx.body.entries());
            }
            ctx.body = await route.schema.body.parse(ctx.body);
          }
        } catch (e: any) {
          const formattedErrors = formatValidationError(e);
          return Response.json(
            {
              status: "error",
              code: "VALIDATION_FAILED",
              errors: formattedErrors,
            },
            { status: 400 },
          );
        }
      }

      // 7. Route Handler
      const data = await route.handler(ctx);
      if (data instanceof Response) return data;

      const body = JSON.stringify(data);
      let response = new Response(body, {
        headers: {
          "Content-Type": "application/json",
          "Content-Length": body.length.toString(),
        },
      });

      const ctxHeaders = ctx.getResponseHeaders();
      Object.entries(ctxHeaders).forEach(([name, value]) => {
        response.headers.set(name, value as string);
      });

      // 8. Hooks: onResponse
      if (route.onResponses && route.onResponses.length > 0) {
        for (const onResponseFn of route.onResponses) {
          const result = await onResponseFn(response, ctx);
          if (result instanceof Response) response = result;
        }
      }

      // 9. Hooks: afterHandle
      if (route.afterHandles && route.afterHandles.length > 0) {
        for (const hook of route.afterHandles) {
          const result = await hook(ctx);
          if (result instanceof Response) return result;
        }
      }

      return response;
    } catch (error: any) {
      const errorResponse = await this.errorHandler(error, ctx);
      return Response.json(errorResponse, {
        status: error?.status || 500,
      });
    }
  }

  // Hook Registration Delegates
  onError(fn: (error: any, ctx: Context<any, any, D>) => any): this {
    this.errorHandler = fn;
    return this;
  }

  onRequest(fn: (ctx: Context<any, any, D>) => void | Promise<void>): this {
    this.hooks.addRequestHook(fn as any);
    return this;
  }

  onBeforeMatch(
    fn: (req: Request) => Response | undefined | Promise<Response | undefined>,
  ): this {
    this.hooks.addBeforeMatchHook(fn);
    return this;
  }

  onResponse(
    fn: (
      res: Response,
      ctx: Context<any, any, D>,
    ) => Response | undefined | Promise<Response | undefined>,
  ): this {
    this.hooks.addResponseHook(fn as any);
    return this;
  }

  onBeforeHandle(
    fn: (
      ctx: Context<any, any, D>,
    ) => Response | undefined | Promise<Response | undefined>,
  ): this {
    this.hooks.addBeforeHandleHook(fn as any);
    return this;
  }

  onAfterHandle(
    fn: (
      ctx: Context<any, any, D>,
    ) => Response | undefined | Promise<Response | undefined>,
  ): this {
    this.hooks.addAfterHandleHook(fn as any);
    return this;
  }

  // server sent events
  sse<T = any>(
    path: string,
    handler: (ctx: any) => AsyncIterable<T> | Promise<AsyncIterable<T>>,
  ) {
    return this.get(path, async (ctx) => {
      if ((ctx as any)[$SERVER]?.timeout) {
        (ctx as any)[$SERVER].timeout(ctx.request, 0);
      }

      const stream = await handler(ctx);

      const readable = new ReadableStream({
        async start(controller) {
          for await (const chunk of stream) {
            const data =
              typeof chunk === "string" ? chunk : JSON.stringify(chunk);
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
   * For Node, use a specific adapter like @axiom/adapter-express.
   */
  listen(portOrOptions: number | any = 3000): any {
    const options =
      typeof portOrOptions === "number"
        ? { port: portOrOptions }
        : portOrOptions || {};
    const port = options.port || 3000;

    // @ts-ignore - Bun detection
    if (typeof Bun !== "undefined") {
      // @ts-ignore
      this.server = Bun.serve({
        ...options,
        port,
        fetch: (req: Request) => this.handle(req),
      });

      console.log(`\x1b[32m Axiom listening on ${this.server.url}\x1b[0m`);
      return this.server;
    }

    // @ts-ignore - Deno detection
    if (typeof Deno !== "undefined" && typeof Deno.serve === "function") {
      // @ts-ignore
      this.server = Deno.serve({ ...options, port }, (req) => this.handle(req));
      return this.server;
    }

    if (typeof process !== "undefined" && process.release?.name === "node") {
      throw new Error(
        "[Axiom] Automatic runtime detection found Node.js. " +
          "Axiom requires a Fetch API compatible server. " +
          "Please use @axiom/adapter-express for Node.js environments.",
      );
    }

    throw new Error(
      "[Axiom] Automatic runtime detection failed. " +
        "Ensure you are running in a supported environment (Bun, Deno) or use an adapter.",
    );
  }
}

export default Axiom;
