import { RadixTree } from "./radix";
import type { Handler, Route, RouteSchema } from "./types";
import { createRegex } from "./utils";

/**
 * Manages route registration and path matching using a Radix Tree.
 */
export class Router<T extends Record<string, any>, D extends Record<string, any>> {
  private tree = new RadixTree<T, D>();
  private routes: Route<T, D>[] = [];

  /**
   * Registers a new route with its associated state (hooks, derivations, and decorators).
   */
  add<Path extends string, S extends RouteSchema, Return>(
    method: string,
    path: Path,
    handler: Handler<Path, S, T, D, Return>,
    state: {
      derives: any[];
      decorators: any;
      onRequests: any[];
      onResponses: any[];
      beforeHandles: any[];
      afterHandles: any[];
    },
    schema?: S,
    metadata?: Record<string, any>,
  ) {
    const paramNames: string[] = [];

    const route: Route<T, D> = {
      method,
      path,
      regex: createRegex(path, paramNames),
      handler: handler as any,
      paramNames,
      schema,
      metadata,
      derives: [...state.derives],
      decorators: { ...state.decorators },
      onRequests: [...state.onRequests],
      onResponses: [...state.onResponses],
      beforeHandles: [...state.beforeHandles],
      afterHandles: [...state.afterHandles],
    };

    this.routes.push(route);
    this.tree.add(method, path, route);
    return route;
  }

  /**
   * Finds a matching route for the given method and pathname.
   */
  match(method: string, pathname: string) {
    const result = this.tree.match(method, pathname);

    if (!result) return null;

    // Convert radix params to the format Axeom.handle expects (for now)
    // or you can refactor Axeom.handle to use the params object directly.
    const { route, params } = result;

    // Axeom.handle expects 'match' to be an array where index 1+ corresponds to paramNames
    const matchArray: string[] = [pathname];
    route.paramNames.forEach((name) => {
      matchArray.push(params[name]);
    });

    return { route, match: matchArray };
  }

  addRoute(route: Route<T, D>) {
    this.routes.push(route);
    this.tree.add(route.method, route.path, route);
  }

  getRoutes() {
    return this.routes;
  }

  setRoutes(routes: Route<T, D>[]) {
    this.routes = routes;
    this.tree = new RadixTree<T, D>();
    routes.forEach((r) => this.tree.add(r.method, r.path, r));
  }
}
