import type { Axiom } from "@axiom/core";

type MethodName<M extends string> = M extends "GET"
  ? "get"
  : M extends "POST"
    ? "post"
    : M extends "PUT"
      ? "put"
      : M extends "PATCH"
        ? "patch"
        : M extends "DELETE"
          ? "delete"
          : never;

/**
 * Maps the server registry to a client structure segment-by-segment.
 */
export type AxiomClient<T extends Record<string, any>> = {
  // Path building (e.g., client.users)
  [K in keyof T as K extends `${string} /${infer Segment}/${string}`
    ? Segment
    : never]: AxiomClient<{
    [P in keyof T as P extends `${infer Method} /${K extends `${string} /${infer S}/${string}` ? S : never}/${infer Rest}`
      ? `${Method} /${Rest}`
      : never]: T[P];
  }>;
} & {
  // Method execution (e.g., client.users.get())
  [K in keyof T as K extends `${string} /${infer Path}`
    ? Path extends `${string}/${string}`
      ? never
      : Path
    : never]: {
    [M in keyof T as M extends `${infer Method} /${K extends `${string} /${infer P}` ? P : never}`
      ? MethodName<Method>
      : never]: (
      ...args: {} extends T[M]["input"]
        ? [options?: T[M]["input"]]
        : [options: T[M]["input"]]
    ) => Promise<T[M]["output"]>;
  };
};

export type InferRegistry<A> = A extends Axiom<infer T, any> ? T : never;

/**
 * Creates a type-safe client for the given Axiom app's registry.
 * It can accept either the Axiom instance type or the registry type itself.
 * Works at runtime
 */
export function createAxiomClient<T extends Record<string, any>>(
  baseUrl: string = "/",
): AxiomClient<T extends Axiom<infer R, any> ? R : T> {
  const createProxy = (pathParts: string[] = []): any => {
    return new Proxy(() => {}, {
      get(_, prop: string) {
        // If it's a HTTP method name, execute the fetch
        const method = prop.toUpperCase();
        if (["GET", "POST", "PUT", "PATCH", "DELETE"].includes(method)) {
          return async (options: any = {}) => {
            let fullPath = "/" + pathParts.join("/");

            // Handle path parameters (like :id)
            if (options.params) {
              Object.entries(options.params).forEach(([key, value]) => {
                fullPath = fullPath.replace(`:${key}`, String(value));
              });
            }

            // Handle query parameters
            const url = new URL(fullPath, baseUrl);
            if (options.query) {
              Object.entries(options.query).forEach(([key, value]) => {
                if (value !== undefined) {
                  url.searchParams.append(key, String(value));
                }
              });
            }

            const response = await fetch(url.toString(), {
              method,
              headers: {
                "Content-Type": "application/json",
              },
              body: options.body ? JSON.stringify(options.body) : undefined,
            });

            if (!response.ok) {
              throw new Error(
                `API Error: ${response.status} ${response.statusText}`,
              );
            }

            return response.json();
          };
        }

        // Otherwise, continue building the path
        return createProxy([...pathParts, prop]);
      },
      // Handle the case where the segment itself is a dynamic parameter or a function call (rare but possible)
      apply(_, __, args) {
        // If called as a function, use the argument as a path segment (for dynamic params)
        return createProxy([...pathParts, String(args[0])]);
      },
    });
  };

  return createProxy([]) as any;
}
