import type Axiom from "@axiom/core";

export interface WebAdapterOptions {
  /**
   * The base path where the Axiom router is mounted.
   * If provided, this prefix will be stripped from the URL before matching.
   * @example "/api/axiom"
   */
  basePath?: string;
}

/**
 * Creates a standard Web (Fetch API) compatible handler for Axiom.
 * This works natively with Next.js, SvelteKit, Astro, SolidStart, and more.
 *
 * @example
 * // Next.js: app/api/[...axiom]/route.ts
 * // SvelteKit: src/routes/api/[...axiom]/+server.ts
 * const app = new Axiom().get("/hello", () => "Hi");
 * export const { GET, POST } = createWebHandler(app, { basePath: "/api" });
 */
export function createWebHandler(
  axiom: Axiom<any, any>,
  options: WebAdapterOptions = {},
) {
  const handler = async (req: Request) => {
    let requestToHandle = req;

    if (options.basePath) {
      const url = new URL(req.url);
      if (url.pathname.startsWith(options.basePath)) {
        const newPathname = url.pathname.replace(options.basePath, "") || "/";
        url.pathname = newPathname;

        requestToHandle = new Request(url.toString(), req);
      }
    }

    return axiom.handle(requestToHandle);
  };

  return {
    GET: handler,
    POST: handler,
    PUT: handler,
    PATCH: handler,
    DELETE: handler,
    HEAD: handler,
    OPTIONS: handler,
    handler,
  };
}

/**
 * Alias for createWebHandler specifically for Next.js users.
 */
export const createNextHandler = createWebHandler;
