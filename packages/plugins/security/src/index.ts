import type { Axeom } from "@axeom/core";

export type SecurityOptions = {
  hsts?: boolean | { maxAge?: number; includeSubDomains?: boolean };
  xssProtection?: boolean;
  noSniff?: boolean;
  frameOptions?: "DENY" | "SAMEORIGIN" | boolean;
  referrerPolicy?: string | boolean;
};

export const securityHeaders = (options: SecurityOptions = {}) => {
  const {
    hsts = true,
    xssProtection = true,
    noSniff = true,
    frameOptions = "SAMEORIGIN",
    referrerPolicy = "no-referrer-when-downgrade",
  } = options;

  return <T extends Record<string, any>, D extends Record<string, any>>(app: Axeom<T, D>) => {
    return app.onResponse((res) => {
      const headers = new Headers(res.headers);

      if (noSniff) {
        headers.set("X-Content-Type-Options", "nosniff");
      }

      if (xssProtection) {
        headers.set("X-XSS-Protection", "1; mode=block");
      }

      if (frameOptions) {
        headers.set(
          "X-Frame-Options",
          typeof frameOptions === "string" ? frameOptions : "SAMEORIGIN",
        );
      }

      if (referrerPolicy) {
        headers.set(
          "Referrer-Policy",
          typeof referrerPolicy === "string" ? referrerPolicy : "no-referrer-when-downgrade",
        );
      }

      if (hsts) {
        const maxAge = typeof hsts === "object" ? hsts.maxAge || 15552000 : 15552000;
        const subDomains = typeof hsts === "object" ? hsts.includeSubDomains !== false : true;
        headers.set(
          "Strict-Transport-Security",
          `max-age=${maxAge}${subDomains ? "; includeSubDomains" : ""}`,
        );
      }

      return new Response(res.body, {
        status: res.status,
        statusText: res.statusText,
        headers,
      });
    });
  };
};
