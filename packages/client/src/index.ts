import type { Axeom } from "@axeom/core";

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
export type AxeomClient<T extends Record<string, any>> = {
  // 1. Path Building: Handles nested segments (e.g., client.users)
  [K in keyof T as K extends `${string} /${infer Segment}/${string}`
    ? Segment
    : never]: AxeomClient<{
    [P in keyof T as P extends `${infer Method} /${K extends `${string} /${infer S}/${string}`
      ? S
      : never}/${infer Rest}`
      ? `${Method} /${Rest}`
      : never]: T[P];
  }>;
} & {
  // 2. Direct Methods: Handles methods for the current path (e.g., client.get() at root)
  [M in keyof T as M extends `${infer Method} /` ? MethodName<Method> : never]: (
    ...args: {} extends T[M]["input"] ? [options?: T[M]["input"]] : [options: T[M]["input"]]
  ) => Promise<T[M]["output"]>;
} & {
  // 3. Leaf Segments: Handles final segments (e.g., client.users.get())
  [K in keyof T as K extends `${string} /${infer Path}`
    ? Path extends `${string}/${string}`
      ? never
      : Path extends ""
        ? never
        : Path
    : never]: {
    [M in keyof T as M extends `${infer Method} /${K extends `${string} /${infer P}` ? P : never}`
      ? MethodName<Method>
      : never]: (
      ...args: {} extends T[M]["input"] ? [options?: T[M]["input"]] : [options: T[M]["input"]]
    ) => Promise<T[M]["output"]>;
  };
} & {
  // 4. Dynamic Indexer: Handles function calls (client.user("123"))
  <Segment extends string>(
    segment: Segment,
  ): AxeomClient<{
    [P in keyof T as P extends `${infer Method} /:${string}/${infer Rest}`
      ? `${Method} /${Rest}`
      : P extends `${infer Method} /:${string}`
        ? `${Method} /`
        : never]: T[P] extends { input: infer I }
      ? Omit<T[P], "input"> & { input: Partial<I> }
      : T[P];
  }>;
} & {
  // 5. Property Indexer: Handles segment indexing (client.user["123"])
  [index: string]: AxeomClient<{
    [P in keyof T as P extends `${infer Method} /:${string}/${infer Rest}`
      ? `${Method} /${Rest}`
      : P extends `${infer Method} /:${string}`
        ? `${Method} /`
        : never]: T[P] extends { input: infer I }
      ? Omit<T[P], "input"> & { input: Partial<I> }
      : T[P];
  }>;
};

export type InferRegistry<A> = A extends Axeom<infer T, any> ? T : never;

export interface AxeomClientOptions {
  fetch?: typeof fetch;
}

/**
 * Creates a type-safe client for the given Axeom app's registry.
 */
export function createAxeomClient<T extends Record<string, any>>(
  baseUrl: string = "/",
  options: AxeomClientOptions = {},
): AxeomClient<T extends Axeom<infer R, any> ? R : T> {
  const fetcher = options.fetch || fetch;

  const createProxy = (pathParts: string[] = []): any => {
    return new Proxy(() => {}, {
      get(_, prop: string) {
        const method = prop.toUpperCase();
        if (["GET", "POST", "PUT", "PATCH", "DELETE"].includes(method)) {
          return async (requestOptions: any = {}) => {
            let fullPath = "/" + pathParts.join("/");

            // Handle path parameters (like :id)
            if (requestOptions.params) {
              Object.entries(requestOptions.params).forEach(([key, value]) => {
                fullPath = fullPath.replace(`:${key}`, String(value));
              });
            }

            // Normalizing Base URL for the URL constructor
            const origin =
              typeof window !== "undefined" ? window.location.origin : "http://localhost";

            const baseWithSlash = baseUrl.startsWith("http")
              ? baseUrl
              : origin + (baseUrl.startsWith("/") ? "" : "/") + baseUrl;

            const url = new URL(
              (baseWithSlash.endsWith("/") ? baseWithSlash.slice(0, -1) : baseWithSlash) + fullPath,
              origin,
            );

            // Handle query parameters
            if (requestOptions.query) {
              Object.entries(requestOptions.query).forEach(([key, value]) => {
                if (value !== undefined) {
                  url.searchParams.append(key, String(value));
                }
              });
            }

            const response = await fetcher(url.toString(), {
              method,
              headers: {
                "Content-Type": "application/json",
              },
              body: requestOptions.body ? JSON.stringify(requestOptions.body) : undefined,
            });

            if (!response.ok) {
              const text = await response.text();
              throw new Error(`API Error: ${response.status} ${text || response.statusText}`);
            }

            return response.json();
          };
        }

        return createProxy([...pathParts, prop]);
      },
      apply(_, __, args) {
        return createProxy([...pathParts, String(args[0])]);
      },
    });
  };

  return createProxy([]) as any;
}
