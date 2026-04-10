import type Axeom from "@axeom/core";

export interface WebAdapterOptions {
  /**
   * The base path where the Axeom router is mounted.
   * If provided, this prefix will be stripped from the URL before matching.
   * @example "/api/Axeom"
   */
  basePath?: string;
}

/**
 * Creates a standard Web (Fetch API) compatible handler for Axeom.
 * This works natively with Next.js, SvelteKit, Astro, SolidStart, and more.
 */
export function createWebHandler(Axeom: Axeom<any, any>, options: WebAdapterOptions = {}) {
  const handler = async (req: Request) => {
    let requestToHandle = req;

    if (options.basePath) {
      const url = new URL(req.url);
      if (url.pathname.startsWith(options.basePath)) {
        const newPathname = url.pathname.replace(options.basePath, "") || "/";
        url.pathname = newPathname;

        requestToHandle = new Request(url.toString(), req);
        requestToHandle.headers.set("X-Axeom-Base", options.basePath);
      }
    }

    return Axeom.handle(requestToHandle);
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
