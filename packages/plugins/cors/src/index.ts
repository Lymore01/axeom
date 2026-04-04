import { ForbiddenError, type Axiom } from "@axiom/core";

export type CorsOptions = {
  origin?: string | string[] | ((origin: string) => string | boolean);
  methods?: string[];
  headers?: string[];
  maxAge?: number;
  credentials?: boolean;
};

export const cors = (options: CorsOptions = {}) => {
  const {
    origin = "*",
    methods = ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    headers = ["Content-Type", "Authorization"],
    maxAge,
    credentials,
  } = options;

  const isOriginAllowed = (requestOrigin: string | null) => {
    if (origin === "*") return true;
    if (!requestOrigin) return false;
    if (Array.isArray(origin)) return origin.includes(requestOrigin);
    if (typeof origin === "string") return origin === requestOrigin;
    if (typeof origin === "function") return origin(requestOrigin) !== false;
    return false;
  };

  const setCorsHeaders = (
    resHeaders: Headers,
    requestOrigin: string | null,
  ) => {
    const allowedOrigin =
      origin === "*" || !requestOrigin
        ? typeof origin === "string"
          ? origin
          : "*"
        : requestOrigin;

    resHeaders.set("Access-Control-Allow-Origin", allowedOrigin);
    resHeaders.set("Access-Control-Allow-Methods", methods.join(", "));
    resHeaders.set("Access-Control-Allow-Headers", headers.join(", "));
    if (maxAge) resHeaders.set("Access-Control-Max-Age", maxAge.toString());
    if (credentials) resHeaders.set("Access-Control-Allow-Credentials", "true");
  };

  return <T extends Record<string, any>, D extends Record<string, any>>(
    app: Axiom<T, D>,
  ) => {
    return app
      .onBeforeMatch((req) => {
        const requestOrigin = req.headers.get("Origin");

        if (requestOrigin && !isOriginAllowed(requestOrigin)) {
          throw new ForbiddenError(
            `CORS: Origin ${requestOrigin} is not allowed`,
          );
        }

        if (req.method === "OPTIONS") {
          const corsHeaders = new Headers();
          setCorsHeaders(corsHeaders, requestOrigin);

          return new Response(null, {
            status: 204,
            headers: corsHeaders,
          });
        }
      })
      .onResponse((res, ctx) => {
        const requestOrigin = ctx.request.headers.get("Origin");
        const corsHeaders = new Headers(res.headers);

        setCorsHeaders(corsHeaders, requestOrigin);

        return new Response(res.body, {
          status: res.status,
          statusText: res.statusText,
          headers: corsHeaders,
        });
      });
  };
};
