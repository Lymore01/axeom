export type ExtractParams<T> = T extends `${string}/:${infer P}/${infer Rest}`
  ? P | ExtractParams<`/${Rest}`>
  : T extends `${string}/:${infer P}`
    ? P
    : never;

export type ParamsObject<T extends string> = {
  [K in ExtractParams<T>]: string;
};

// recursive
export type Prettify<T> = T extends Function | any[]
  ? T
  : {
      [K in keyof T]: T[K] extends object ? Prettify<T[K]> : T[K];
    } & {};

// shallow
// export type Prettify<T> = {
//   [K in keyof T]: T[K];
// } & {};

export interface Validator<T = any> {
  _output: T;
  parse: (data: unknown) => T | Promise<T>;
}

export type RouteSchema = {
  body?: Validator;
  query?: Validator;
  params?: Validator;
};

export type Infer<S> = S extends Validator<infer T> ? T : any;

export type RouteInput<Path extends string, S extends RouteSchema> = Prettify<
  (S["body"] extends Validator ? { body: Infer<S["body"]> } : { body?: never }) &
    (S["query"] extends Validator
      ? { query: Infer<S["query"]> }
      : { query?: Record<string, string | undefined> }) &
    (keyof ParamsObject<Path> extends never
      ? { params?: ParamsObject<Path> }
      : { params: ParamsObject<Path> })
>;

export type RouteMetadata<Path extends string, S extends RouteSchema, Return> = {
  input: RouteInput<Path, S>;
  output: Return;
};

/**
 * Automatically prefixes all keys in a metadata object (e.g., "GET /users" -> "GET /v1/users")
 */
export type PrefixT<Prefix extends string, T> = {
  [K in keyof T as K extends `${infer Method} ${infer Path}`
    ? `${Method} ${Prefix}${Path}` extends `${infer M} ${infer P}`
      ? `${M} ${P extends `/${string}` ? P : `/${P}`}`
      : never
    : never]: T[K];
};

export type Context<
  Path extends string,
  S extends RouteSchema = {},
  D extends Record<string, any> = {},
> = Prettify<
  {
    params: S["params"] extends Validator
      ? Infer<S["params"]>
      : ParamsObject<Path>;
    query: S["query"] extends Validator
      ? Infer<S["query"]>
      : Record<string, string | undefined>;
    body: S["body"] extends Validator ? Infer<S["body"]> : any;
    headers: Headers;
    request: Request;
    setResponseHeader: (name: string, value: string) => void;
    getResponseHeaders: () => Record<string, string>;
  } & D
>;

export type Handler<
  Path extends string = string,
  S extends RouteSchema = {},
  D extends Record<string, any> = {},
  Return = any,
> = (ctx: Context<Path, S, D>) => Return | Promise<Return>;

export interface Route<D extends Record<string, any> = any> {
  method: string;
  path: string;
  regex: RegExp;
  handler: Handler<any, any, D, any>;
  paramNames: string[];
  schema?: RouteSchema;
  derives: Array<(ctx: any) => any>;
  decorators: Record<string, any>;
  onRequests?: Array<(ctx: any) => void | Promise<void>>;
  onResponses?: Array<
    (
      res: Response,
      ctx: any,
    ) => Response | undefined | Promise<Response | undefined>
  >;
  beforeHandles: Array<
    (
      ctx: Context<any, any, D>,
    ) => Response | undefined | Promise<Response | undefined>
  >;
  afterHandles: Array<
    (
      ctx: Context<any, any, D>,
    ) => Response | undefined | Promise<Response | undefined>
  >;
}
