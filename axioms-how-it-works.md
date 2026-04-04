# Axiom Technical Deep Dive: The Architecture of Zero-Code-Gen Type Safety

This document provides a comprehensive, line-by-line explanation of the mechanics behind the Axiom framework. We will trace the lifecycle of a route from its definition on the server to its typed invocation on the client.

---

## 1. Server-Side: The "Registry" Builder

At its heart, Axiom is a **Type-Safe Builder**. Most web frameworks store routes in an array at runtime. Axiom does that *plus* stores them in a **TypeScript Interface** at compile-time.

### The Class Signature
```typescript
export class Axiom<
  T extends Record<string, any> = {}, // The Registry
  D extends Record<string, any> = { logger: Logger }, // The Dependencies
> { ... }
```
- `T` is the **Registry**. It is an object where keys are strings like `"GET /users"` and values are `RouteMetadata`.
- `D` is the **Context**. It contains anything you've added via `.decorate()` or `.derive()`.

### The `.get()` / `.post()` Methods
When you define a route, you aren't just adding a handler; you are **transforming the type of the Axiom instance**:

```typescript
private addRoute<Method, Path, S, Return>(...) {
  // ... runtime registration logic ...

  return this as unknown as Axiom<
    T & { [K in `${Method} ${Path}`]: RouteMetadata<Path, S, Return> },
    D
  >;
}
```
- Notice the **Intersection (`&`)**: We take the existing registry `T` and merge it with a new object containing exactly one key.
- The key is a **Template Literal Type**: `` `${Method} ${Path}` ``. If you call `.get("/posts")`, the key becomes `"GET /posts"`.
- Because each method returns `this` cast to the new type, you can chain 100 methods, and the final `axiom` instance will have a type containing all 100 entries.

---

## 2. Advanced Type Orchestration: `RouteMetadata` and `RouteInput`

Axiom doesn't just store "any" data; it computes the **Request Contract** automatically.

### Path Parameter Extraction (`ExtractParams`)
How does Axiom know that `/users/:id/:profile` requires two string parameters? It uses a **Recursive Template Literal Type**:

```typescript
export type ExtractParams<T> = T extends `${string}/:${infer P}/${infer Rest}`
  ? P | ExtractParams<`/${Rest}`> // Found a param, recurse for more
  : T extends `${string}/:${infer P}`
    ? P // Found the last param
    : never;
```
This utility "scans" the path string at compile-time, pulling out anything that starts with a colon.

### Computing the `RouteInput`
The `RouteInput` type is then computed by merging the extracted path params with your Zod schema:

```typescript
export type RouteInput<Path, S> = Prettify<
  (S["body"] extends Validator ? { body: Infer<S["body"]> } : { body?: never }) &
  (S["query"] extends Validator ? { query: Infer<S["query"]> } : { query?: Record<string, string | undefined> }) &
  (keyof ParamsObject<Path> extends never ? { params?: ParamsObject<Path> } : { params: ParamsObject<Path> })
>;
```
- **Conditional Types**: It checks if a Zod validator (`S["body"]`) exists. If yes, it extracts the Zod shape. If not, it makes the property optional or `never`.
- **Params Enforcement**: If `ExtractParams<Path>` finds colons, the `params` property becomes **required**. If not, it's **optional**.

---

## 3. Modularity: The `PrefixT` Engine

When you use `.group("/api", (group) => ...)`, Axiom has to "shift" every route in that group. It uses the `PrefixT` utility:

```typescript
export type PrefixT<Prefix, T> = {
  [K in keyof T as K extends `${infer Method} ${infer Path}`
    ? `${Method} ${Prefix}${Path}` // Prepend the prefix to the path segment of the key
    : never]: T[K];
};
```
- It iterates over every key `K` in the child registry `T`.
- If a key is `"GET /users"`, it splits it into `Method` ("GET") and `Path` ("/users").
- it recombines them with the `Prefix` ("/api") to create `"GET /api/users"`.

---

## 4. Client-Side: Recursive Path Traversal

Creating the client is where the most complex TypeScript magic happens. `AxiomClient<T>` is a "Double-Recursive" type.

### The Path Building Logic
The client type must split a flat key like `"GET /users/posts/list"` into a nested object: `client.users.posts.list.get()`.

```typescript
export type AxiomClient<T> = {
  // 1. NESTING: Look for paths with multiple segments (slashes)
  [K in keyof T as K extends `${string} /${infer Segment}/${string}` ? Segment : never]: AxiomClient<{
    // Pass only the routes that match this segment to the next level
    [P in keyof T as P extends `${infer Method} /${K extends `${string} /${infer S}/${string}` ? S : never}/${infer Rest}` ? `${Method} /${Rest}` : never]: T[P];
  }>;
} & {
  // 2. EXECUTION: Look for terminal segments (no more slashes)
  [K in keyof T as K extends `${string} /${infer Path}`
    ? Path extends `${string}/${string}` ? never : Path
    : never]: {
      [M in keyof T as M extends `${infer Method} /${K extends `${string} /${infer P}` ? P : never}` ? MethodName<Method> : never]: (
        ...args: {} extends T[M]["input"] ? [options?: T[M]["input"]] : [options: T[M]["input"]]
      ) => Promise<T[M]["output"]>;
    };
};
```
- **Part 1 (Nesting)**: `K extends `${string} /${infer Segment}/${string}`` checks if there's a slash *after* the initial segment. If there is, it creates a property for that `Segment` and recursively calls `AxiomClient`.
- **Part 2 (Execution)**: `Path extends `${string}/${string}` ? never : Path` checks if this is the *last* segment. If it is, it generates the HTTP method methods (`get()`, `post()`, etc.).
- **Variadic Tooling**: `...args: {} extends T[M]["input"] ? [options?: T[M]["input"]] : [options: T[M]["input"]]` detects if the input object is "empty" (all properties optional). If it is, the client call `client.posts.get()` becomes valid with 0 arguments.

---

## 5. Runtime Implementation: The `Proxy` Pattern

Because we don't want to generate any code, we use a **Nested Proxy** to handle infinite property chains.

```typescript
export function createAxiomClient(baseUrl) {
  const createProxy = (pathParts: string[]) => {
    return new Proxy(() => {}, {
      get(_, prop) {
        const method = prop.toUpperCase();
        if (["GET", "POST", "PUT", "PATCH", "DELETE"].includes(method)) {
          // TERMINAL CALL: Execute the fetch
          return async (options) => { ... fetch logic ... };
        }
        // CONTINUING: Add to the path and return a new proxy
        return createProxy([...pathParts, prop]);
      },
      apply(_, __, args) {
        // DYNAMIC PARAMS: If called as a function, treat the arg as a path segment
        // Example: client.users(":id") -> adds the actual ID to the path
        return createProxy([...pathParts, String(args[0])]);
      }
    });
  };
  return createProxy([]);
}
```
1. **The `get` trap**: When you access `client.users.posts`, the proxy simply pushes `"users"` then `"posts"` into an array.
2. **The `apply` trap**: If you use a dynamic parameter from the server definition like `client.users[":id"]`. This allows you to treat `:id` as a property name OR call it as a function.
3. **The final Fetch**: When you hit a method property (like `.get`), it uses the `pathParts` array to join the URL together (`/users/posts`), builds the fetch options (body/headers/query), and executes the request.

---

## 6. The "Single Source of Truth" Lifecycle (Example)

1. **Step 1 (Server)**: You write `.get("/users/:id", (ctx) => { return { name: "John" } })`.
   - Axiom Registry now has: `{"GET /users/:id": { input: { params: {id: string}, ...}, output: {name: string} } }`.
2. **Step 2 (Export)**: Typescript exports this massive object type.
3. **Step 3 (Client)**: You type `client.users[":id"].get({ params: { id: "1" } })`.
   - **Autocomplete**: TS sees `users` as a segment in the registry.
   - **Validation**: TS sees that the `params` property is **required** because `:id` was in the path.
   - **Return Value**: TS knows that `const response` will be of type `{ name: string }`.
4. **Step 4 (Runtime)**: The Proxy collects `["users", ":id"]` then executes a GET request to `/users/1`.

**Consistency is guaranteed because the client type *is* the server type, shifted into a new shape by the Recursive Type system.**

---

## 7. Key Concepts for Further Research

If you want to master the "magic" behind Axiom and similar modern frameworks, research these core concepts:

### TypeScript "Type-Level Programming"
- **Template Literal Types**: How Axiom turns a string like `"/users/:id"` into a TypeScript key.
- **Recursive Types**: Used in the `AxiomClient` to drill down into path segments.
- **Key Remapping (`as`)**: How Axiom iterates over your registry and "renames" keys (e.g., stripping the `"GET "` to create the `.get()` method).
- **Conditional Types and `infer`**: How we extract variables from strings (e.g., `T extends "/:${infer P}" ? P : never`).
- **Intersection Types (`&`)**: Why we use this in the Axiom builder to "append" routes to the instance type.

### JavaScript Runtime Meta-Programming
- **JavaScript `Proxy` Object**: The core of the client. Specifically the **`get` trap** (intercepting property access) and the **`apply` trap** (intercepting function calls).
- **Higher-Order Functions and Closures**: How Axiom "remembers" the path parts as you navigate `client.a.b.c`.
- **The "Trap" Pattern**: Intercepting calls and routing them to a single handler (like our fetcher).

### Modern API Design Patterns
- **Zero-Code-Gen Architecture**: Contrast this with "Code Generation" (like GraphQL Codegen or OpenAPI). Axiom belongs to the new world where the **type is the source of truth**, not a generated file.
- **Fluent API / Method Chaining**: Designing classes where methods return a modified version of `this` to allow for `app.get().post().use()`.
- **The Adapter Pattern**: How Axiom separates "Core" logic from runtime-specific code (Node/Express, Bun, Cloudflare).
- **Schema-First Type Inference**: Research how **Zod** allows you to write a runtime schema and automatically extract a TypeScript type from it via `z.infer`.
- **End-to-End (E2E) Type Safety**: The general concept of sharing types between the server and client without bridges or separate schema files.
