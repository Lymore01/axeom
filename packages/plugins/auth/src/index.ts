import type { Axeom, Context } from "@axeom/core";
import { s } from "@axeom/schema";
import { jwtVerify, SignJWT } from "jose";

export interface AuthOptions {
  secret: string;
  issuer?: string;
  audience?: string;
  expiresIn?: string;
}

export interface User {
  id: string;
  [key: string]: any;
}

/**
 * The Axeom Auth Plugin.
 * Adds JWT signing and verification utilities to the context.
 */
export const authPlugin = (options: AuthOptions) => {
  const encoder = new TextEncoder();
  const rawSecret = encoder.encode(options.secret);

  return <T extends Record<string, any>, D extends Record<string, any>>(app: Axeom<T, D>) => {
    return app.decorate({
      auth: {
        /**
         * Signs a new JWT token with the provided payload.
         */
        sign: async (payload: any) => {
          return await new SignJWT(payload)
            .setProtectedHeader({ alg: "HS256" })
            .setIssuedAt()
            .setIssuer(options.issuer || "Axeom")
            .setAudience(options.audience || "Axeom-app")
            .setExpirationTime(options.expiresIn || "2h")
            .sign(rawSecret);
        },
        /**
         * Verifies a JWT token and returns the payload if valid.
         */
        verify: async (token: string): Promise<User | null> => {
          try {
            const { payload } = await jwtVerify(token, rawSecret, {
              issuer: options.issuer || "Axeom",
              audience: options.audience || "Axeom-app",
            });
            return payload as unknown as User;
          } catch {
            return null;
          }
        },
      },
    });
  };
};

/**
 * A derivation that verifies the 'Authorization: Bearer <token>' header.
 *
 * If successful, it adds 'user' to the context.
 * If it fails, it returns a 401 Unauthorized response.
 *
 * Usage:
 * Axeom.group("/admin", (admin) => admin.derive(bearerGuard()).get("/dashboard", ({ user }) => ...))
 */
export const bearerGuard = () => {
  return async <T extends Record<string, any>, D extends Record<string, any>>(
    ctx: Context<any, any, D & { auth: { verify: (t: string) => Promise<User | null> } }>,
  ) => {
    const authHeader = ctx.headers.get("Authorization");

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return new Response(
        JSON.stringify({
          status: "error",
          code: "UNAUTHORIZED",
          message: "Authorization header is missing or invalid",
        }),
        {
          status: 401,
          headers: { "Content-Type": "application/json" },
        },
      );
    }

    const token = authHeader.split(" ")[1];
    const user = await ctx.auth.verify(token);

    if (!user) {
      return new Response(
        JSON.stringify({
          status: "error",
          code: "INVALID_TOKEN",
          message: "Token is invalid or expired",
        }),
        {
          status: 401,
          headers: { "Content-Type": "application/json" },
        },
      );
    }

    return { user };
  };
};

/**
 * A helper to register standard login/profile routes.
 */
export const authRoutes = <T extends Record<string, any>, D extends Record<string, any>>(
  app: Axeom<T, D>,
) => {
  // We expect the authPlugin to have been used before this
  const authApp = app as unknown as Axeom<
    T,
    D & {
      auth: {
        sign: (p: any) => Promise<string>;
        verify: (t: string) => Promise<User | null>;
      };
    }
  >;

  return authApp.group("/auth", (group) => {
    return group
      .post(
        "/login",
        async (ctx) => {
          const { username } = ctx.body;
          // In a real app, you would verify the password here
          const token = await ctx.auth.sign({ id: "123", name: username });
          return { token };
        },
        {
          body: s.object({
            username: s.string().min(3),
            password: s.string().min(6),
          }),
        },
      )
      .group("/me", (me) => {
        return me.derive(bearerGuard()).get("/", ({ user }) => user);
      });
  });
};

export default authPlugin;
