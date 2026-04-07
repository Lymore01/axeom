import { RadixTree } from "./radix";
import type { Handler, Route, RouteSchema } from "./types";
import { createRegex } from "./utils";

export class Router<D extends Record<string, any>> {
  private tree = new RadixTree<D>();
  private routes: Route<D>[] = []; // Keep for backward compatibility or getRoutes()

  add<Path extends string, S extends RouteSchema, Return>(
    method: string,
    path: Path,
    handler: Handler<Path, S, D, Return>,
    state: {
      derives: any[];
      decorators: any;
      onRequests: any[];
      onResponses: any[];
      beforeHandles: any[];
      afterHandles: any[];
    },
    schema?: S,
  ) {
    const paramNames: string[] = [];

    const route: Route<D> = {
      method,
      path,
      regex: createRegex(path, paramNames),
      handler: handler as any,
      paramNames,
      schema,
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

  match(method: string, pathname: string) {
    const result = this.tree.match(method, pathname);

    if (!result) return null;

    // Convert radix params to the format Axiom.handle expects (for now)
    // or you can refactor Axiom.handle to use the params object directly.
    const { route, params } = result;

    // Axiom.handle expects 'match' to be an array where index 1+ corresponds to paramNames
    const matchArray: string[] = [pathname];
    route.paramNames.forEach((name) => {
      matchArray.push(params[name]);
    });

    return { route, match: matchArray };
  }

  addRoute(route: Route<D>) {
    this.routes.push(route);
    this.tree.add(route.method, route.path, route);
  }

  getRoutes() {
    return this.routes;
  }

  setRoutes(routes: Route<D>[]) {
    this.routes = routes;
    this.tree = new RadixTree<D>();
    routes.forEach((r) => this.tree.add(r.method, r.path, r));
  }
}
