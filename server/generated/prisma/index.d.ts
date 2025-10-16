
/**
 * Client
**/

import * as runtime from './runtime/library.js';
import $Types = runtime.Types // general types
import $Public = runtime.Types.Public
import $Utils = runtime.Types.Utils
import $Extensions = runtime.Types.Extensions
import $Result = runtime.Types.Result

export type PrismaPromise<T> = $Public.PrismaPromise<T>


/**
 * Model User
 * 
 */
export type User = $Result.DefaultSelection<Prisma.$UserPayload>
/**
 * Model Product
 * 
 */
export type Product = $Result.DefaultSelection<Prisma.$ProductPayload>
/**
 * Model Order
 * 
 */
export type Order = $Result.DefaultSelection<Prisma.$OrderPayload>
/**
 * Model OrderItem
 * 
 */
export type OrderItem = $Result.DefaultSelection<Prisma.$OrderItemPayload>
/**
 * Model page_views
 * 
 */
export type page_views = $Result.DefaultSelection<Prisma.$page_viewsPayload>
/**
 * Model pdf_downloads
 * 
 */
export type pdf_downloads = $Result.DefaultSelection<Prisma.$pdf_downloadsPayload>
/**
 * Model user_actions
 * 
 */
export type user_actions = $Result.DefaultSelection<Prisma.$user_actionsPayload>
/**
 * Model user_sessions
 * 
 */
export type user_sessions = $Result.DefaultSelection<Prisma.$user_sessionsPayload>

/**
 * ##  Prisma Client ʲˢ
 *
 * Type-safe database client for TypeScript & Node.js
 * @example
 * ```
 * const prisma = new PrismaClient()
 * // Fetch zero or more Users
 * const users = await prisma.user.findMany()
 * ```
 *
 *
 * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client).
 */
export class PrismaClient<
  ClientOptions extends Prisma.PrismaClientOptions = Prisma.PrismaClientOptions,
  const U = 'log' extends keyof ClientOptions ? ClientOptions['log'] extends Array<Prisma.LogLevel | Prisma.LogDefinition> ? Prisma.GetEvents<ClientOptions['log']> : never : never,
  ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs
> {
  [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['other'] }

    /**
   * ##  Prisma Client ʲˢ
   *
   * Type-safe database client for TypeScript & Node.js
   * @example
   * ```
   * const prisma = new PrismaClient()
   * // Fetch zero or more Users
   * const users = await prisma.user.findMany()
   * ```
   *
   *
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client).
   */

  constructor(optionsArg ?: Prisma.Subset<ClientOptions, Prisma.PrismaClientOptions>);
  $on<V extends U>(eventType: V, callback: (event: V extends 'query' ? Prisma.QueryEvent : Prisma.LogEvent) => void): PrismaClient;

  /**
   * Connect with the database
   */
  $connect(): $Utils.JsPromise<void>;

  /**
   * Disconnect from the database
   */
  $disconnect(): $Utils.JsPromise<void>;

/**
   * Executes a prepared raw query and returns the number of affected rows.
   * @example
   * ```
   * const result = await prisma.$executeRaw`UPDATE User SET cool = ${true} WHERE email = ${'user@email.com'};`
   * ```
   *
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $executeRaw<T = unknown>(query: TemplateStringsArray | Prisma.Sql, ...values: any[]): Prisma.PrismaPromise<number>;

  /**
   * Executes a raw query and returns the number of affected rows.
   * Susceptible to SQL injections, see documentation.
   * @example
   * ```
   * const result = await prisma.$executeRawUnsafe('UPDATE User SET cool = $1 WHERE email = $2 ;', true, 'user@email.com')
   * ```
   *
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $executeRawUnsafe<T = unknown>(query: string, ...values: any[]): Prisma.PrismaPromise<number>;

  /**
   * Performs a prepared raw query and returns the `SELECT` data.
   * @example
   * ```
   * const result = await prisma.$queryRaw`SELECT * FROM User WHERE id = ${1} OR email = ${'user@email.com'};`
   * ```
   *
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $queryRaw<T = unknown>(query: TemplateStringsArray | Prisma.Sql, ...values: any[]): Prisma.PrismaPromise<T>;

  /**
   * Performs a raw query and returns the `SELECT` data.
   * Susceptible to SQL injections, see documentation.
   * @example
   * ```
   * const result = await prisma.$queryRawUnsafe('SELECT * FROM User WHERE id = $1 OR email = $2;', 1, 'user@email.com')
   * ```
   *
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $queryRawUnsafe<T = unknown>(query: string, ...values: any[]): Prisma.PrismaPromise<T>;


  /**
   * Allows the running of a sequence of read/write operations that are guaranteed to either succeed or fail as a whole.
   * @example
   * ```
   * const [george, bob, alice] = await prisma.$transaction([
   *   prisma.user.create({ data: { name: 'George' } }),
   *   prisma.user.create({ data: { name: 'Bob' } }),
   *   prisma.user.create({ data: { name: 'Alice' } }),
   * ])
   * ```
   * 
   * Read more in our [docs](https://www.prisma.io/docs/concepts/components/prisma-client/transactions).
   */
  $transaction<P extends Prisma.PrismaPromise<any>[]>(arg: [...P], options?: { isolationLevel?: Prisma.TransactionIsolationLevel }): $Utils.JsPromise<runtime.Types.Utils.UnwrapTuple<P>>

  $transaction<R>(fn: (prisma: Omit<PrismaClient, runtime.ITXClientDenyList>) => $Utils.JsPromise<R>, options?: { maxWait?: number, timeout?: number, isolationLevel?: Prisma.TransactionIsolationLevel }): $Utils.JsPromise<R>


  $extends: $Extensions.ExtendsHook<"extends", Prisma.TypeMapCb<ClientOptions>, ExtArgs, $Utils.Call<Prisma.TypeMapCb<ClientOptions>, {
    extArgs: ExtArgs
  }>>

      /**
   * `prisma.user`: Exposes CRUD operations for the **User** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Users
    * const users = await prisma.user.findMany()
    * ```
    */
  get user(): Prisma.UserDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.product`: Exposes CRUD operations for the **Product** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Products
    * const products = await prisma.product.findMany()
    * ```
    */
  get product(): Prisma.ProductDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.order`: Exposes CRUD operations for the **Order** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Orders
    * const orders = await prisma.order.findMany()
    * ```
    */
  get order(): Prisma.OrderDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.orderItem`: Exposes CRUD operations for the **OrderItem** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more OrderItems
    * const orderItems = await prisma.orderItem.findMany()
    * ```
    */
  get orderItem(): Prisma.OrderItemDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.page_views`: Exposes CRUD operations for the **page_views** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Page_views
    * const page_views = await prisma.page_views.findMany()
    * ```
    */
  get page_views(): Prisma.page_viewsDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.pdf_downloads`: Exposes CRUD operations for the **pdf_downloads** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Pdf_downloads
    * const pdf_downloads = await prisma.pdf_downloads.findMany()
    * ```
    */
  get pdf_downloads(): Prisma.pdf_downloadsDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.user_actions`: Exposes CRUD operations for the **user_actions** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more User_actions
    * const user_actions = await prisma.user_actions.findMany()
    * ```
    */
  get user_actions(): Prisma.user_actionsDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.user_sessions`: Exposes CRUD operations for the **user_sessions** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more User_sessions
    * const user_sessions = await prisma.user_sessions.findMany()
    * ```
    */
  get user_sessions(): Prisma.user_sessionsDelegate<ExtArgs, ClientOptions>;
}

export namespace Prisma {
  export import DMMF = runtime.DMMF

  export type PrismaPromise<T> = $Public.PrismaPromise<T>

  /**
   * Validator
   */
  export import validator = runtime.Public.validator

  /**
   * Prisma Errors
   */
  export import PrismaClientKnownRequestError = runtime.PrismaClientKnownRequestError
  export import PrismaClientUnknownRequestError = runtime.PrismaClientUnknownRequestError
  export import PrismaClientRustPanicError = runtime.PrismaClientRustPanicError
  export import PrismaClientInitializationError = runtime.PrismaClientInitializationError
  export import PrismaClientValidationError = runtime.PrismaClientValidationError

  /**
   * Re-export of sql-template-tag
   */
  export import sql = runtime.sqltag
  export import empty = runtime.empty
  export import join = runtime.join
  export import raw = runtime.raw
  export import Sql = runtime.Sql



  /**
   * Decimal.js
   */
  export import Decimal = runtime.Decimal

  export type DecimalJsLike = runtime.DecimalJsLike

  /**
   * Metrics
   */
  export type Metrics = runtime.Metrics
  export type Metric<T> = runtime.Metric<T>
  export type MetricHistogram = runtime.MetricHistogram
  export type MetricHistogramBucket = runtime.MetricHistogramBucket

  /**
  * Extensions
  */
  export import Extension = $Extensions.UserArgs
  export import getExtensionContext = runtime.Extensions.getExtensionContext
  export import Args = $Public.Args
  export import Payload = $Public.Payload
  export import Result = $Public.Result
  export import Exact = $Public.Exact

  /**
   * Prisma Client JS version: 6.17.1
   * Query Engine version: 272a37d34178c2894197e17273bf937f25acdeac
   */
  export type PrismaVersion = {
    client: string
  }

  export const prismaVersion: PrismaVersion

  /**
   * Utility Types
   */


  export import JsonObject = runtime.JsonObject
  export import JsonArray = runtime.JsonArray
  export import JsonValue = runtime.JsonValue
  export import InputJsonObject = runtime.InputJsonObject
  export import InputJsonArray = runtime.InputJsonArray
  export import InputJsonValue = runtime.InputJsonValue

  /**
   * Types of the values used to represent different kinds of `null` values when working with JSON fields.
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  namespace NullTypes {
    /**
    * Type of `Prisma.DbNull`.
    *
    * You cannot use other instances of this class. Please use the `Prisma.DbNull` value.
    *
    * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
    */
    class DbNull {
      private DbNull: never
      private constructor()
    }

    /**
    * Type of `Prisma.JsonNull`.
    *
    * You cannot use other instances of this class. Please use the `Prisma.JsonNull` value.
    *
    * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
    */
    class JsonNull {
      private JsonNull: never
      private constructor()
    }

    /**
    * Type of `Prisma.AnyNull`.
    *
    * You cannot use other instances of this class. Please use the `Prisma.AnyNull` value.
    *
    * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
    */
    class AnyNull {
      private AnyNull: never
      private constructor()
    }
  }

  /**
   * Helper for filtering JSON entries that have `null` on the database (empty on the db)
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const DbNull: NullTypes.DbNull

  /**
   * Helper for filtering JSON entries that have JSON `null` values (not empty on the db)
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const JsonNull: NullTypes.JsonNull

  /**
   * Helper for filtering JSON entries that are `Prisma.DbNull` or `Prisma.JsonNull`
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const AnyNull: NullTypes.AnyNull

  type SelectAndInclude = {
    select: any
    include: any
  }

  type SelectAndOmit = {
    select: any
    omit: any
  }

  /**
   * Get the type of the value, that the Promise holds.
   */
  export type PromiseType<T extends PromiseLike<any>> = T extends PromiseLike<infer U> ? U : T;

  /**
   * Get the return type of a function which returns a Promise.
   */
  export type PromiseReturnType<T extends (...args: any) => $Utils.JsPromise<any>> = PromiseType<ReturnType<T>>

  /**
   * From T, pick a set of properties whose keys are in the union K
   */
  type Prisma__Pick<T, K extends keyof T> = {
      [P in K]: T[P];
  };


  export type Enumerable<T> = T | Array<T>;

  export type RequiredKeys<T> = {
    [K in keyof T]-?: {} extends Prisma__Pick<T, K> ? never : K
  }[keyof T]

  export type TruthyKeys<T> = keyof {
    [K in keyof T as T[K] extends false | undefined | null ? never : K]: K
  }

  export type TrueKeys<T> = TruthyKeys<Prisma__Pick<T, RequiredKeys<T>>>

  /**
   * Subset
   * @desc From `T` pick properties that exist in `U`. Simple version of Intersection
   */
  export type Subset<T, U> = {
    [key in keyof T]: key extends keyof U ? T[key] : never;
  };

  /**
   * SelectSubset
   * @desc From `T` pick properties that exist in `U`. Simple version of Intersection.
   * Additionally, it validates, if both select and include are present. If the case, it errors.
   */
  export type SelectSubset<T, U> = {
    [key in keyof T]: key extends keyof U ? T[key] : never
  } &
    (T extends SelectAndInclude
      ? 'Please either choose `select` or `include`.'
      : T extends SelectAndOmit
        ? 'Please either choose `select` or `omit`.'
        : {})

  /**
   * Subset + Intersection
   * @desc From `T` pick properties that exist in `U` and intersect `K`
   */
  export type SubsetIntersection<T, U, K> = {
    [key in keyof T]: key extends keyof U ? T[key] : never
  } &
    K

  type Without<T, U> = { [P in Exclude<keyof T, keyof U>]?: never };

  /**
   * XOR is needed to have a real mutually exclusive union type
   * https://stackoverflow.com/questions/42123407/does-typescript-support-mutually-exclusive-types
   */
  type XOR<T, U> =
    T extends object ?
    U extends object ?
      (Without<T, U> & U) | (Without<U, T> & T)
    : U : T


  /**
   * Is T a Record?
   */
  type IsObject<T extends any> = T extends Array<any>
  ? False
  : T extends Date
  ? False
  : T extends Uint8Array
  ? False
  : T extends BigInt
  ? False
  : T extends object
  ? True
  : False


  /**
   * If it's T[], return T
   */
  export type UnEnumerate<T extends unknown> = T extends Array<infer U> ? U : T

  /**
   * From ts-toolbelt
   */

  type __Either<O extends object, K extends Key> = Omit<O, K> &
    {
      // Merge all but K
      [P in K]: Prisma__Pick<O, P & keyof O> // With K possibilities
    }[K]

  type EitherStrict<O extends object, K extends Key> = Strict<__Either<O, K>>

  type EitherLoose<O extends object, K extends Key> = ComputeRaw<__Either<O, K>>

  type _Either<
    O extends object,
    K extends Key,
    strict extends Boolean
  > = {
    1: EitherStrict<O, K>
    0: EitherLoose<O, K>
  }[strict]

  type Either<
    O extends object,
    K extends Key,
    strict extends Boolean = 1
  > = O extends unknown ? _Either<O, K, strict> : never

  export type Union = any

  type PatchUndefined<O extends object, O1 extends object> = {
    [K in keyof O]: O[K] extends undefined ? At<O1, K> : O[K]
  } & {}

  /** Helper Types for "Merge" **/
  export type IntersectOf<U extends Union> = (
    U extends unknown ? (k: U) => void : never
  ) extends (k: infer I) => void
    ? I
    : never

  export type Overwrite<O extends object, O1 extends object> = {
      [K in keyof O]: K extends keyof O1 ? O1[K] : O[K];
  } & {};

  type _Merge<U extends object> = IntersectOf<Overwrite<U, {
      [K in keyof U]-?: At<U, K>;
  }>>;

  type Key = string | number | symbol;
  type AtBasic<O extends object, K extends Key> = K extends keyof O ? O[K] : never;
  type AtStrict<O extends object, K extends Key> = O[K & keyof O];
  type AtLoose<O extends object, K extends Key> = O extends unknown ? AtStrict<O, K> : never;
  export type At<O extends object, K extends Key, strict extends Boolean = 1> = {
      1: AtStrict<O, K>;
      0: AtLoose<O, K>;
  }[strict];

  export type ComputeRaw<A extends any> = A extends Function ? A : {
    [K in keyof A]: A[K];
  } & {};

  export type OptionalFlat<O> = {
    [K in keyof O]?: O[K];
  } & {};

  type _Record<K extends keyof any, T> = {
    [P in K]: T;
  };

  // cause typescript not to expand types and preserve names
  type NoExpand<T> = T extends unknown ? T : never;

  // this type assumes the passed object is entirely optional
  type AtLeast<O extends object, K extends string> = NoExpand<
    O extends unknown
    ? | (K extends keyof O ? { [P in K]: O[P] } & O : O)
      | {[P in keyof O as P extends K ? P : never]-?: O[P]} & O
    : never>;

  type _Strict<U, _U = U> = U extends unknown ? U & OptionalFlat<_Record<Exclude<Keys<_U>, keyof U>, never>> : never;

  export type Strict<U extends object> = ComputeRaw<_Strict<U>>;
  /** End Helper Types for "Merge" **/

  export type Merge<U extends object> = ComputeRaw<_Merge<Strict<U>>>;

  /**
  A [[Boolean]]
  */
  export type Boolean = True | False

  // /**
  // 1
  // */
  export type True = 1

  /**
  0
  */
  export type False = 0

  export type Not<B extends Boolean> = {
    0: 1
    1: 0
  }[B]

  export type Extends<A1 extends any, A2 extends any> = [A1] extends [never]
    ? 0 // anything `never` is false
    : A1 extends A2
    ? 1
    : 0

  export type Has<U extends Union, U1 extends Union> = Not<
    Extends<Exclude<U1, U>, U1>
  >

  export type Or<B1 extends Boolean, B2 extends Boolean> = {
    0: {
      0: 0
      1: 1
    }
    1: {
      0: 1
      1: 1
    }
  }[B1][B2]

  export type Keys<U extends Union> = U extends unknown ? keyof U : never

  type Cast<A, B> = A extends B ? A : B;

  export const type: unique symbol;



  /**
   * Used by group by
   */

  export type GetScalarType<T, O> = O extends object ? {
    [P in keyof T]: P extends keyof O
      ? O[P]
      : never
  } : never

  type FieldPaths<
    T,
    U = Omit<T, '_avg' | '_sum' | '_count' | '_min' | '_max'>
  > = IsObject<T> extends True ? U : T

  type GetHavingFields<T> = {
    [K in keyof T]: Or<
      Or<Extends<'OR', K>, Extends<'AND', K>>,
      Extends<'NOT', K>
    > extends True
      ? // infer is only needed to not hit TS limit
        // based on the brilliant idea of Pierre-Antoine Mills
        // https://github.com/microsoft/TypeScript/issues/30188#issuecomment-478938437
        T[K] extends infer TK
        ? GetHavingFields<UnEnumerate<TK> extends object ? Merge<UnEnumerate<TK>> : never>
        : never
      : {} extends FieldPaths<T[K]>
      ? never
      : K
  }[keyof T]

  /**
   * Convert tuple to union
   */
  type _TupleToUnion<T> = T extends (infer E)[] ? E : never
  type TupleToUnion<K extends readonly any[]> = _TupleToUnion<K>
  type MaybeTupleToUnion<T> = T extends any[] ? TupleToUnion<T> : T

  /**
   * Like `Pick`, but additionally can also accept an array of keys
   */
  type PickEnumerable<T, K extends Enumerable<keyof T> | keyof T> = Prisma__Pick<T, MaybeTupleToUnion<K>>

  /**
   * Exclude all keys with underscores
   */
  type ExcludeUnderscoreKeys<T extends string> = T extends `_${string}` ? never : T


  export type FieldRef<Model, FieldType> = runtime.FieldRef<Model, FieldType>

  type FieldRefInputType<Model, FieldType> = Model extends never ? never : FieldRef<Model, FieldType>


  export const ModelName: {
    User: 'User',
    Product: 'Product',
    Order: 'Order',
    OrderItem: 'OrderItem',
    page_views: 'page_views',
    pdf_downloads: 'pdf_downloads',
    user_actions: 'user_actions',
    user_sessions: 'user_sessions'
  };

  export type ModelName = (typeof ModelName)[keyof typeof ModelName]


  export type Datasources = {
    db?: Datasource
  }

  interface TypeMapCb<ClientOptions = {}> extends $Utils.Fn<{extArgs: $Extensions.InternalArgs }, $Utils.Record<string, any>> {
    returns: Prisma.TypeMap<this['params']['extArgs'], ClientOptions extends { omit: infer OmitOptions } ? OmitOptions : {}>
  }

  export type TypeMap<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> = {
    globalOmitOptions: {
      omit: GlobalOmitOptions
    }
    meta: {
      modelProps: "user" | "product" | "order" | "orderItem" | "page_views" | "pdf_downloads" | "user_actions" | "user_sessions"
      txIsolationLevel: Prisma.TransactionIsolationLevel
    }
    model: {
      User: {
        payload: Prisma.$UserPayload<ExtArgs>
        fields: Prisma.UserFieldRefs
        operations: {
          findUnique: {
            args: Prisma.UserFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.UserFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>
          }
          findFirst: {
            args: Prisma.UserFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.UserFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>
          }
          findMany: {
            args: Prisma.UserFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>[]
          }
          create: {
            args: Prisma.UserCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>
          }
          createMany: {
            args: Prisma.UserCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.UserCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>[]
          }
          delete: {
            args: Prisma.UserDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>
          }
          update: {
            args: Prisma.UserUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>
          }
          deleteMany: {
            args: Prisma.UserDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.UserUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.UserUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>[]
          }
          upsert: {
            args: Prisma.UserUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>
          }
          aggregate: {
            args: Prisma.UserAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateUser>
          }
          groupBy: {
            args: Prisma.UserGroupByArgs<ExtArgs>
            result: $Utils.Optional<UserGroupByOutputType>[]
          }
          count: {
            args: Prisma.UserCountArgs<ExtArgs>
            result: $Utils.Optional<UserCountAggregateOutputType> | number
          }
        }
      }
      Product: {
        payload: Prisma.$ProductPayload<ExtArgs>
        fields: Prisma.ProductFieldRefs
        operations: {
          findUnique: {
            args: Prisma.ProductFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ProductPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.ProductFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ProductPayload>
          }
          findFirst: {
            args: Prisma.ProductFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ProductPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.ProductFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ProductPayload>
          }
          findMany: {
            args: Prisma.ProductFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ProductPayload>[]
          }
          create: {
            args: Prisma.ProductCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ProductPayload>
          }
          createMany: {
            args: Prisma.ProductCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.ProductCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ProductPayload>[]
          }
          delete: {
            args: Prisma.ProductDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ProductPayload>
          }
          update: {
            args: Prisma.ProductUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ProductPayload>
          }
          deleteMany: {
            args: Prisma.ProductDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.ProductUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.ProductUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ProductPayload>[]
          }
          upsert: {
            args: Prisma.ProductUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ProductPayload>
          }
          aggregate: {
            args: Prisma.ProductAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateProduct>
          }
          groupBy: {
            args: Prisma.ProductGroupByArgs<ExtArgs>
            result: $Utils.Optional<ProductGroupByOutputType>[]
          }
          count: {
            args: Prisma.ProductCountArgs<ExtArgs>
            result: $Utils.Optional<ProductCountAggregateOutputType> | number
          }
        }
      }
      Order: {
        payload: Prisma.$OrderPayload<ExtArgs>
        fields: Prisma.OrderFieldRefs
        operations: {
          findUnique: {
            args: Prisma.OrderFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OrderPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.OrderFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OrderPayload>
          }
          findFirst: {
            args: Prisma.OrderFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OrderPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.OrderFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OrderPayload>
          }
          findMany: {
            args: Prisma.OrderFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OrderPayload>[]
          }
          create: {
            args: Prisma.OrderCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OrderPayload>
          }
          createMany: {
            args: Prisma.OrderCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.OrderCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OrderPayload>[]
          }
          delete: {
            args: Prisma.OrderDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OrderPayload>
          }
          update: {
            args: Prisma.OrderUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OrderPayload>
          }
          deleteMany: {
            args: Prisma.OrderDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.OrderUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.OrderUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OrderPayload>[]
          }
          upsert: {
            args: Prisma.OrderUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OrderPayload>
          }
          aggregate: {
            args: Prisma.OrderAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateOrder>
          }
          groupBy: {
            args: Prisma.OrderGroupByArgs<ExtArgs>
            result: $Utils.Optional<OrderGroupByOutputType>[]
          }
          count: {
            args: Prisma.OrderCountArgs<ExtArgs>
            result: $Utils.Optional<OrderCountAggregateOutputType> | number
          }
        }
      }
      OrderItem: {
        payload: Prisma.$OrderItemPayload<ExtArgs>
        fields: Prisma.OrderItemFieldRefs
        operations: {
          findUnique: {
            args: Prisma.OrderItemFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OrderItemPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.OrderItemFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OrderItemPayload>
          }
          findFirst: {
            args: Prisma.OrderItemFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OrderItemPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.OrderItemFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OrderItemPayload>
          }
          findMany: {
            args: Prisma.OrderItemFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OrderItemPayload>[]
          }
          create: {
            args: Prisma.OrderItemCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OrderItemPayload>
          }
          createMany: {
            args: Prisma.OrderItemCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.OrderItemCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OrderItemPayload>[]
          }
          delete: {
            args: Prisma.OrderItemDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OrderItemPayload>
          }
          update: {
            args: Prisma.OrderItemUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OrderItemPayload>
          }
          deleteMany: {
            args: Prisma.OrderItemDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.OrderItemUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.OrderItemUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OrderItemPayload>[]
          }
          upsert: {
            args: Prisma.OrderItemUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OrderItemPayload>
          }
          aggregate: {
            args: Prisma.OrderItemAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateOrderItem>
          }
          groupBy: {
            args: Prisma.OrderItemGroupByArgs<ExtArgs>
            result: $Utils.Optional<OrderItemGroupByOutputType>[]
          }
          count: {
            args: Prisma.OrderItemCountArgs<ExtArgs>
            result: $Utils.Optional<OrderItemCountAggregateOutputType> | number
          }
        }
      }
      page_views: {
        payload: Prisma.$page_viewsPayload<ExtArgs>
        fields: Prisma.page_viewsFieldRefs
        operations: {
          findUnique: {
            args: Prisma.page_viewsFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$page_viewsPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.page_viewsFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$page_viewsPayload>
          }
          findFirst: {
            args: Prisma.page_viewsFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$page_viewsPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.page_viewsFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$page_viewsPayload>
          }
          findMany: {
            args: Prisma.page_viewsFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$page_viewsPayload>[]
          }
          create: {
            args: Prisma.page_viewsCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$page_viewsPayload>
          }
          createMany: {
            args: Prisma.page_viewsCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.page_viewsCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$page_viewsPayload>[]
          }
          delete: {
            args: Prisma.page_viewsDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$page_viewsPayload>
          }
          update: {
            args: Prisma.page_viewsUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$page_viewsPayload>
          }
          deleteMany: {
            args: Prisma.page_viewsDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.page_viewsUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.page_viewsUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$page_viewsPayload>[]
          }
          upsert: {
            args: Prisma.page_viewsUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$page_viewsPayload>
          }
          aggregate: {
            args: Prisma.Page_viewsAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregatePage_views>
          }
          groupBy: {
            args: Prisma.page_viewsGroupByArgs<ExtArgs>
            result: $Utils.Optional<Page_viewsGroupByOutputType>[]
          }
          count: {
            args: Prisma.page_viewsCountArgs<ExtArgs>
            result: $Utils.Optional<Page_viewsCountAggregateOutputType> | number
          }
        }
      }
      pdf_downloads: {
        payload: Prisma.$pdf_downloadsPayload<ExtArgs>
        fields: Prisma.pdf_downloadsFieldRefs
        operations: {
          findUnique: {
            args: Prisma.pdf_downloadsFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$pdf_downloadsPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.pdf_downloadsFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$pdf_downloadsPayload>
          }
          findFirst: {
            args: Prisma.pdf_downloadsFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$pdf_downloadsPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.pdf_downloadsFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$pdf_downloadsPayload>
          }
          findMany: {
            args: Prisma.pdf_downloadsFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$pdf_downloadsPayload>[]
          }
          create: {
            args: Prisma.pdf_downloadsCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$pdf_downloadsPayload>
          }
          createMany: {
            args: Prisma.pdf_downloadsCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.pdf_downloadsCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$pdf_downloadsPayload>[]
          }
          delete: {
            args: Prisma.pdf_downloadsDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$pdf_downloadsPayload>
          }
          update: {
            args: Prisma.pdf_downloadsUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$pdf_downloadsPayload>
          }
          deleteMany: {
            args: Prisma.pdf_downloadsDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.pdf_downloadsUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.pdf_downloadsUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$pdf_downloadsPayload>[]
          }
          upsert: {
            args: Prisma.pdf_downloadsUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$pdf_downloadsPayload>
          }
          aggregate: {
            args: Prisma.Pdf_downloadsAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregatePdf_downloads>
          }
          groupBy: {
            args: Prisma.pdf_downloadsGroupByArgs<ExtArgs>
            result: $Utils.Optional<Pdf_downloadsGroupByOutputType>[]
          }
          count: {
            args: Prisma.pdf_downloadsCountArgs<ExtArgs>
            result: $Utils.Optional<Pdf_downloadsCountAggregateOutputType> | number
          }
        }
      }
      user_actions: {
        payload: Prisma.$user_actionsPayload<ExtArgs>
        fields: Prisma.user_actionsFieldRefs
        operations: {
          findUnique: {
            args: Prisma.user_actionsFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$user_actionsPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.user_actionsFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$user_actionsPayload>
          }
          findFirst: {
            args: Prisma.user_actionsFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$user_actionsPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.user_actionsFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$user_actionsPayload>
          }
          findMany: {
            args: Prisma.user_actionsFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$user_actionsPayload>[]
          }
          create: {
            args: Prisma.user_actionsCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$user_actionsPayload>
          }
          createMany: {
            args: Prisma.user_actionsCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.user_actionsCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$user_actionsPayload>[]
          }
          delete: {
            args: Prisma.user_actionsDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$user_actionsPayload>
          }
          update: {
            args: Prisma.user_actionsUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$user_actionsPayload>
          }
          deleteMany: {
            args: Prisma.user_actionsDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.user_actionsUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.user_actionsUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$user_actionsPayload>[]
          }
          upsert: {
            args: Prisma.user_actionsUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$user_actionsPayload>
          }
          aggregate: {
            args: Prisma.User_actionsAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateUser_actions>
          }
          groupBy: {
            args: Prisma.user_actionsGroupByArgs<ExtArgs>
            result: $Utils.Optional<User_actionsGroupByOutputType>[]
          }
          count: {
            args: Prisma.user_actionsCountArgs<ExtArgs>
            result: $Utils.Optional<User_actionsCountAggregateOutputType> | number
          }
        }
      }
      user_sessions: {
        payload: Prisma.$user_sessionsPayload<ExtArgs>
        fields: Prisma.user_sessionsFieldRefs
        operations: {
          findUnique: {
            args: Prisma.user_sessionsFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$user_sessionsPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.user_sessionsFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$user_sessionsPayload>
          }
          findFirst: {
            args: Prisma.user_sessionsFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$user_sessionsPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.user_sessionsFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$user_sessionsPayload>
          }
          findMany: {
            args: Prisma.user_sessionsFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$user_sessionsPayload>[]
          }
          create: {
            args: Prisma.user_sessionsCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$user_sessionsPayload>
          }
          createMany: {
            args: Prisma.user_sessionsCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.user_sessionsCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$user_sessionsPayload>[]
          }
          delete: {
            args: Prisma.user_sessionsDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$user_sessionsPayload>
          }
          update: {
            args: Prisma.user_sessionsUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$user_sessionsPayload>
          }
          deleteMany: {
            args: Prisma.user_sessionsDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.user_sessionsUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.user_sessionsUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$user_sessionsPayload>[]
          }
          upsert: {
            args: Prisma.user_sessionsUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$user_sessionsPayload>
          }
          aggregate: {
            args: Prisma.User_sessionsAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateUser_sessions>
          }
          groupBy: {
            args: Prisma.user_sessionsGroupByArgs<ExtArgs>
            result: $Utils.Optional<User_sessionsGroupByOutputType>[]
          }
          count: {
            args: Prisma.user_sessionsCountArgs<ExtArgs>
            result: $Utils.Optional<User_sessionsCountAggregateOutputType> | number
          }
        }
      }
    }
  } & {
    other: {
      payload: any
      operations: {
        $executeRaw: {
          args: [query: TemplateStringsArray | Prisma.Sql, ...values: any[]],
          result: any
        }
        $executeRawUnsafe: {
          args: [query: string, ...values: any[]],
          result: any
        }
        $queryRaw: {
          args: [query: TemplateStringsArray | Prisma.Sql, ...values: any[]],
          result: any
        }
        $queryRawUnsafe: {
          args: [query: string, ...values: any[]],
          result: any
        }
      }
    }
  }
  export const defineExtension: $Extensions.ExtendsHook<"define", Prisma.TypeMapCb, $Extensions.DefaultArgs>
  export type DefaultPrismaClient = PrismaClient
  export type ErrorFormat = 'pretty' | 'colorless' | 'minimal'
  export interface PrismaClientOptions {
    /**
     * Overwrites the datasource url from your schema.prisma file
     */
    datasources?: Datasources
    /**
     * Overwrites the datasource url from your schema.prisma file
     */
    datasourceUrl?: string
    /**
     * @default "colorless"
     */
    errorFormat?: ErrorFormat
    /**
     * @example
     * ```
     * // Shorthand for `emit: 'stdout'`
     * log: ['query', 'info', 'warn', 'error']
     * 
     * // Emit as events only
     * log: [
     *   { emit: 'event', level: 'query' },
     *   { emit: 'event', level: 'info' },
     *   { emit: 'event', level: 'warn' }
     *   { emit: 'event', level: 'error' }
     * ]
     * 
     * / Emit as events and log to stdout
     * og: [
     *  { emit: 'stdout', level: 'query' },
     *  { emit: 'stdout', level: 'info' },
     *  { emit: 'stdout', level: 'warn' }
     *  { emit: 'stdout', level: 'error' }
     * 
     * ```
     * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/logging#the-log-option).
     */
    log?: (LogLevel | LogDefinition)[]
    /**
     * The default values for transactionOptions
     * maxWait ?= 2000
     * timeout ?= 5000
     */
    transactionOptions?: {
      maxWait?: number
      timeout?: number
      isolationLevel?: Prisma.TransactionIsolationLevel
    }
    /**
     * Instance of a Driver Adapter, e.g., like one provided by `@prisma/adapter-planetscale`
     */
    adapter?: runtime.SqlDriverAdapterFactory | null
    /**
     * Global configuration for omitting model fields by default.
     * 
     * @example
     * ```
     * const prisma = new PrismaClient({
     *   omit: {
     *     user: {
     *       password: true
     *     }
     *   }
     * })
     * ```
     */
    omit?: Prisma.GlobalOmitConfig
  }
  export type GlobalOmitConfig = {
    user?: UserOmit
    product?: ProductOmit
    order?: OrderOmit
    orderItem?: OrderItemOmit
    page_views?: page_viewsOmit
    pdf_downloads?: pdf_downloadsOmit
    user_actions?: user_actionsOmit
    user_sessions?: user_sessionsOmit
  }

  /* Types for Logging */
  export type LogLevel = 'info' | 'query' | 'warn' | 'error'
  export type LogDefinition = {
    level: LogLevel
    emit: 'stdout' | 'event'
  }

  export type CheckIsLogLevel<T> = T extends LogLevel ? T : never;

  export type GetLogType<T> = CheckIsLogLevel<
    T extends LogDefinition ? T['level'] : T
  >;

  export type GetEvents<T extends any[]> = T extends Array<LogLevel | LogDefinition>
    ? GetLogType<T[number]>
    : never;

  export type QueryEvent = {
    timestamp: Date
    query: string
    params: string
    duration: number
    target: string
  }

  export type LogEvent = {
    timestamp: Date
    message: string
    target: string
  }
  /* End Types for Logging */


  export type PrismaAction =
    | 'findUnique'
    | 'findUniqueOrThrow'
    | 'findMany'
    | 'findFirst'
    | 'findFirstOrThrow'
    | 'create'
    | 'createMany'
    | 'createManyAndReturn'
    | 'update'
    | 'updateMany'
    | 'updateManyAndReturn'
    | 'upsert'
    | 'delete'
    | 'deleteMany'
    | 'executeRaw'
    | 'queryRaw'
    | 'aggregate'
    | 'count'
    | 'runCommandRaw'
    | 'findRaw'
    | 'groupBy'

  // tested in getLogLevel.test.ts
  export function getLogLevel(log: Array<LogLevel | LogDefinition>): LogLevel | undefined;

  /**
   * `PrismaClient` proxy available in interactive transactions.
   */
  export type TransactionClient = Omit<Prisma.DefaultPrismaClient, runtime.ITXClientDenyList>

  export type Datasource = {
    url?: string
  }

  /**
   * Count Types
   */


  /**
   * Count Type UserCountOutputType
   */

  export type UserCountOutputType = {
    orders: number
  }

  export type UserCountOutputTypeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    orders?: boolean | UserCountOutputTypeCountOrdersArgs
  }

  // Custom InputTypes
  /**
   * UserCountOutputType without action
   */
  export type UserCountOutputTypeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserCountOutputType
     */
    select?: UserCountOutputTypeSelect<ExtArgs> | null
  }

  /**
   * UserCountOutputType without action
   */
  export type UserCountOutputTypeCountOrdersArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: OrderWhereInput
  }


  /**
   * Count Type OrderCountOutputType
   */

  export type OrderCountOutputType = {
    orderItems: number
  }

  export type OrderCountOutputTypeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    orderItems?: boolean | OrderCountOutputTypeCountOrderItemsArgs
  }

  // Custom InputTypes
  /**
   * OrderCountOutputType without action
   */
  export type OrderCountOutputTypeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the OrderCountOutputType
     */
    select?: OrderCountOutputTypeSelect<ExtArgs> | null
  }

  /**
   * OrderCountOutputType without action
   */
  export type OrderCountOutputTypeCountOrderItemsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: OrderItemWhereInput
  }


  /**
   * Models
   */

  /**
   * Model User
   */

  export type AggregateUser = {
    _count: UserCountAggregateOutputType | null
    _avg: UserAvgAggregateOutputType | null
    _sum: UserSumAggregateOutputType | null
    _min: UserMinAggregateOutputType | null
    _max: UserMaxAggregateOutputType | null
  }

  export type UserAvgAggregateOutputType = {
    discountPercentage: number | null
  }

  export type UserSumAggregateOutputType = {
    discountPercentage: number | null
  }

  export type UserMinAggregateOutputType = {
    id: string | null
    email: string | null
    name: string | null
    password: string | null
    phone: string | null
    address: string | null
    profilePicture: string | null
    isAdmin: boolean | null
    canSeePrices: boolean | null
    discountType: string | null
    discountPercentage: number | null
    birthday: string | null
    createdAt: Date | null
    updatedAt: Date | null
    lastLoginAt: Date | null
  }

  export type UserMaxAggregateOutputType = {
    id: string | null
    email: string | null
    name: string | null
    password: string | null
    phone: string | null
    address: string | null
    profilePicture: string | null
    isAdmin: boolean | null
    canSeePrices: boolean | null
    discountType: string | null
    discountPercentage: number | null
    birthday: string | null
    createdAt: Date | null
    updatedAt: Date | null
    lastLoginAt: Date | null
  }

  export type UserCountAggregateOutputType = {
    id: number
    email: number
    name: number
    password: number
    phone: number
    address: number
    profilePicture: number
    isAdmin: number
    canSeePrices: number
    discountType: number
    discountPercentage: number
    birthday: number
    createdAt: number
    updatedAt: number
    lastLoginAt: number
    _all: number
  }


  export type UserAvgAggregateInputType = {
    discountPercentage?: true
  }

  export type UserSumAggregateInputType = {
    discountPercentage?: true
  }

  export type UserMinAggregateInputType = {
    id?: true
    email?: true
    name?: true
    password?: true
    phone?: true
    address?: true
    profilePicture?: true
    isAdmin?: true
    canSeePrices?: true
    discountType?: true
    discountPercentage?: true
    birthday?: true
    createdAt?: true
    updatedAt?: true
    lastLoginAt?: true
  }

  export type UserMaxAggregateInputType = {
    id?: true
    email?: true
    name?: true
    password?: true
    phone?: true
    address?: true
    profilePicture?: true
    isAdmin?: true
    canSeePrices?: true
    discountType?: true
    discountPercentage?: true
    birthday?: true
    createdAt?: true
    updatedAt?: true
    lastLoginAt?: true
  }

  export type UserCountAggregateInputType = {
    id?: true
    email?: true
    name?: true
    password?: true
    phone?: true
    address?: true
    profilePicture?: true
    isAdmin?: true
    canSeePrices?: true
    discountType?: true
    discountPercentage?: true
    birthday?: true
    createdAt?: true
    updatedAt?: true
    lastLoginAt?: true
    _all?: true
  }

  export type UserAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which User to aggregate.
     */
    where?: UserWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Users to fetch.
     */
    orderBy?: UserOrderByWithRelationInput | UserOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: UserWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Users from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Users.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Users
    **/
    _count?: true | UserCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: UserAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: UserSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: UserMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: UserMaxAggregateInputType
  }

  export type GetUserAggregateType<T extends UserAggregateArgs> = {
        [P in keyof T & keyof AggregateUser]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateUser[P]>
      : GetScalarType<T[P], AggregateUser[P]>
  }




  export type UserGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: UserWhereInput
    orderBy?: UserOrderByWithAggregationInput | UserOrderByWithAggregationInput[]
    by: UserScalarFieldEnum[] | UserScalarFieldEnum
    having?: UserScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: UserCountAggregateInputType | true
    _avg?: UserAvgAggregateInputType
    _sum?: UserSumAggregateInputType
    _min?: UserMinAggregateInputType
    _max?: UserMaxAggregateInputType
  }

  export type UserGroupByOutputType = {
    id: string
    email: string
    name: string
    password: string
    phone: string | null
    address: string | null
    profilePicture: string | null
    isAdmin: boolean
    canSeePrices: boolean
    discountType: string | null
    discountPercentage: number | null
    birthday: string | null
    createdAt: Date
    updatedAt: Date
    lastLoginAt: Date | null
    _count: UserCountAggregateOutputType | null
    _avg: UserAvgAggregateOutputType | null
    _sum: UserSumAggregateOutputType | null
    _min: UserMinAggregateOutputType | null
    _max: UserMaxAggregateOutputType | null
  }

  type GetUserGroupByPayload<T extends UserGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<UserGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof UserGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], UserGroupByOutputType[P]>
            : GetScalarType<T[P], UserGroupByOutputType[P]>
        }
      >
    >


  export type UserSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    email?: boolean
    name?: boolean
    password?: boolean
    phone?: boolean
    address?: boolean
    profilePicture?: boolean
    isAdmin?: boolean
    canSeePrices?: boolean
    discountType?: boolean
    discountPercentage?: boolean
    birthday?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    lastLoginAt?: boolean
    orders?: boolean | User$ordersArgs<ExtArgs>
    _count?: boolean | UserCountOutputTypeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["user"]>

  export type UserSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    email?: boolean
    name?: boolean
    password?: boolean
    phone?: boolean
    address?: boolean
    profilePicture?: boolean
    isAdmin?: boolean
    canSeePrices?: boolean
    discountType?: boolean
    discountPercentage?: boolean
    birthday?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    lastLoginAt?: boolean
  }, ExtArgs["result"]["user"]>

  export type UserSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    email?: boolean
    name?: boolean
    password?: boolean
    phone?: boolean
    address?: boolean
    profilePicture?: boolean
    isAdmin?: boolean
    canSeePrices?: boolean
    discountType?: boolean
    discountPercentage?: boolean
    birthday?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    lastLoginAt?: boolean
  }, ExtArgs["result"]["user"]>

  export type UserSelectScalar = {
    id?: boolean
    email?: boolean
    name?: boolean
    password?: boolean
    phone?: boolean
    address?: boolean
    profilePicture?: boolean
    isAdmin?: boolean
    canSeePrices?: boolean
    discountType?: boolean
    discountPercentage?: boolean
    birthday?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    lastLoginAt?: boolean
  }

  export type UserOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "email" | "name" | "password" | "phone" | "address" | "profilePicture" | "isAdmin" | "canSeePrices" | "discountType" | "discountPercentage" | "birthday" | "createdAt" | "updatedAt" | "lastLoginAt", ExtArgs["result"]["user"]>
  export type UserInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    orders?: boolean | User$ordersArgs<ExtArgs>
    _count?: boolean | UserCountOutputTypeDefaultArgs<ExtArgs>
  }
  export type UserIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {}
  export type UserIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {}

  export type $UserPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "User"
    objects: {
      orders: Prisma.$OrderPayload<ExtArgs>[]
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      email: string
      name: string
      password: string
      phone: string | null
      address: string | null
      profilePicture: string | null
      isAdmin: boolean
      canSeePrices: boolean
      discountType: string | null
      discountPercentage: number | null
      birthday: string | null
      createdAt: Date
      updatedAt: Date
      lastLoginAt: Date | null
    }, ExtArgs["result"]["user"]>
    composites: {}
  }

  type UserGetPayload<S extends boolean | null | undefined | UserDefaultArgs> = $Result.GetResult<Prisma.$UserPayload, S>

  type UserCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<UserFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: UserCountAggregateInputType | true
    }

  export interface UserDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['User'], meta: { name: 'User' } }
    /**
     * Find zero or one User that matches the filter.
     * @param {UserFindUniqueArgs} args - Arguments to find a User
     * @example
     * // Get one User
     * const user = await prisma.user.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends UserFindUniqueArgs>(args: SelectSubset<T, UserFindUniqueArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one User that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {UserFindUniqueOrThrowArgs} args - Arguments to find a User
     * @example
     * // Get one User
     * const user = await prisma.user.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends UserFindUniqueOrThrowArgs>(args: SelectSubset<T, UserFindUniqueOrThrowArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first User that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserFindFirstArgs} args - Arguments to find a User
     * @example
     * // Get one User
     * const user = await prisma.user.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends UserFindFirstArgs>(args?: SelectSubset<T, UserFindFirstArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first User that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserFindFirstOrThrowArgs} args - Arguments to find a User
     * @example
     * // Get one User
     * const user = await prisma.user.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends UserFindFirstOrThrowArgs>(args?: SelectSubset<T, UserFindFirstOrThrowArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more Users that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Users
     * const users = await prisma.user.findMany()
     * 
     * // Get first 10 Users
     * const users = await prisma.user.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const userWithIdOnly = await prisma.user.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends UserFindManyArgs>(args?: SelectSubset<T, UserFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a User.
     * @param {UserCreateArgs} args - Arguments to create a User.
     * @example
     * // Create one User
     * const User = await prisma.user.create({
     *   data: {
     *     // ... data to create a User
     *   }
     * })
     * 
     */
    create<T extends UserCreateArgs>(args: SelectSubset<T, UserCreateArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many Users.
     * @param {UserCreateManyArgs} args - Arguments to create many Users.
     * @example
     * // Create many Users
     * const user = await prisma.user.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends UserCreateManyArgs>(args?: SelectSubset<T, UserCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Users and returns the data saved in the database.
     * @param {UserCreateManyAndReturnArgs} args - Arguments to create many Users.
     * @example
     * // Create many Users
     * const user = await prisma.user.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Users and only return the `id`
     * const userWithIdOnly = await prisma.user.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends UserCreateManyAndReturnArgs>(args?: SelectSubset<T, UserCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a User.
     * @param {UserDeleteArgs} args - Arguments to delete one User.
     * @example
     * // Delete one User
     * const User = await prisma.user.delete({
     *   where: {
     *     // ... filter to delete one User
     *   }
     * })
     * 
     */
    delete<T extends UserDeleteArgs>(args: SelectSubset<T, UserDeleteArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one User.
     * @param {UserUpdateArgs} args - Arguments to update one User.
     * @example
     * // Update one User
     * const user = await prisma.user.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends UserUpdateArgs>(args: SelectSubset<T, UserUpdateArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more Users.
     * @param {UserDeleteManyArgs} args - Arguments to filter Users to delete.
     * @example
     * // Delete a few Users
     * const { count } = await prisma.user.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends UserDeleteManyArgs>(args?: SelectSubset<T, UserDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Users.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Users
     * const user = await prisma.user.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends UserUpdateManyArgs>(args: SelectSubset<T, UserUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Users and returns the data updated in the database.
     * @param {UserUpdateManyAndReturnArgs} args - Arguments to update many Users.
     * @example
     * // Update many Users
     * const user = await prisma.user.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more Users and only return the `id`
     * const userWithIdOnly = await prisma.user.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends UserUpdateManyAndReturnArgs>(args: SelectSubset<T, UserUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one User.
     * @param {UserUpsertArgs} args - Arguments to update or create a User.
     * @example
     * // Update or create a User
     * const user = await prisma.user.upsert({
     *   create: {
     *     // ... data to create a User
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the User we want to update
     *   }
     * })
     */
    upsert<T extends UserUpsertArgs>(args: SelectSubset<T, UserUpsertArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of Users.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserCountArgs} args - Arguments to filter Users to count.
     * @example
     * // Count the number of Users
     * const count = await prisma.user.count({
     *   where: {
     *     // ... the filter for the Users we want to count
     *   }
     * })
    **/
    count<T extends UserCountArgs>(
      args?: Subset<T, UserCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], UserCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a User.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends UserAggregateArgs>(args: Subset<T, UserAggregateArgs>): Prisma.PrismaPromise<GetUserAggregateType<T>>

    /**
     * Group by User.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends UserGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: UserGroupByArgs['orderBy'] }
        : { orderBy?: UserGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, UserGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetUserGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the User model
   */
  readonly fields: UserFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for User.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__UserClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    orders<T extends User$ordersArgs<ExtArgs> = {}>(args?: Subset<T, User$ordersArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$OrderPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the User model
   */
  interface UserFieldRefs {
    readonly id: FieldRef<"User", 'String'>
    readonly email: FieldRef<"User", 'String'>
    readonly name: FieldRef<"User", 'String'>
    readonly password: FieldRef<"User", 'String'>
    readonly phone: FieldRef<"User", 'String'>
    readonly address: FieldRef<"User", 'String'>
    readonly profilePicture: FieldRef<"User", 'String'>
    readonly isAdmin: FieldRef<"User", 'Boolean'>
    readonly canSeePrices: FieldRef<"User", 'Boolean'>
    readonly discountType: FieldRef<"User", 'String'>
    readonly discountPercentage: FieldRef<"User", 'Float'>
    readonly birthday: FieldRef<"User", 'String'>
    readonly createdAt: FieldRef<"User", 'DateTime'>
    readonly updatedAt: FieldRef<"User", 'DateTime'>
    readonly lastLoginAt: FieldRef<"User", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * User findUnique
   */
  export type UserFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * Filter, which User to fetch.
     */
    where: UserWhereUniqueInput
  }

  /**
   * User findUniqueOrThrow
   */
  export type UserFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * Filter, which User to fetch.
     */
    where: UserWhereUniqueInput
  }

  /**
   * User findFirst
   */
  export type UserFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * Filter, which User to fetch.
     */
    where?: UserWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Users to fetch.
     */
    orderBy?: UserOrderByWithRelationInput | UserOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Users.
     */
    cursor?: UserWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Users from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Users.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Users.
     */
    distinct?: UserScalarFieldEnum | UserScalarFieldEnum[]
  }

  /**
   * User findFirstOrThrow
   */
  export type UserFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * Filter, which User to fetch.
     */
    where?: UserWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Users to fetch.
     */
    orderBy?: UserOrderByWithRelationInput | UserOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Users.
     */
    cursor?: UserWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Users from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Users.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Users.
     */
    distinct?: UserScalarFieldEnum | UserScalarFieldEnum[]
  }

  /**
   * User findMany
   */
  export type UserFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * Filter, which Users to fetch.
     */
    where?: UserWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Users to fetch.
     */
    orderBy?: UserOrderByWithRelationInput | UserOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Users.
     */
    cursor?: UserWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Users from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Users.
     */
    skip?: number
    distinct?: UserScalarFieldEnum | UserScalarFieldEnum[]
  }

  /**
   * User create
   */
  export type UserCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * The data needed to create a User.
     */
    data: XOR<UserCreateInput, UserUncheckedCreateInput>
  }

  /**
   * User createMany
   */
  export type UserCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Users.
     */
    data: UserCreateManyInput | UserCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * User createManyAndReturn
   */
  export type UserCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * The data used to create many Users.
     */
    data: UserCreateManyInput | UserCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * User update
   */
  export type UserUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * The data needed to update a User.
     */
    data: XOR<UserUpdateInput, UserUncheckedUpdateInput>
    /**
     * Choose, which User to update.
     */
    where: UserWhereUniqueInput
  }

  /**
   * User updateMany
   */
  export type UserUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Users.
     */
    data: XOR<UserUpdateManyMutationInput, UserUncheckedUpdateManyInput>
    /**
     * Filter which Users to update
     */
    where?: UserWhereInput
    /**
     * Limit how many Users to update.
     */
    limit?: number
  }

  /**
   * User updateManyAndReturn
   */
  export type UserUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * The data used to update Users.
     */
    data: XOR<UserUpdateManyMutationInput, UserUncheckedUpdateManyInput>
    /**
     * Filter which Users to update
     */
    where?: UserWhereInput
    /**
     * Limit how many Users to update.
     */
    limit?: number
  }

  /**
   * User upsert
   */
  export type UserUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * The filter to search for the User to update in case it exists.
     */
    where: UserWhereUniqueInput
    /**
     * In case the User found by the `where` argument doesn't exist, create a new User with this data.
     */
    create: XOR<UserCreateInput, UserUncheckedCreateInput>
    /**
     * In case the User was found with the provided `where` argument, update it with this data.
     */
    update: XOR<UserUpdateInput, UserUncheckedUpdateInput>
  }

  /**
   * User delete
   */
  export type UserDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * Filter which User to delete.
     */
    where: UserWhereUniqueInput
  }

  /**
   * User deleteMany
   */
  export type UserDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Users to delete
     */
    where?: UserWhereInput
    /**
     * Limit how many Users to delete.
     */
    limit?: number
  }

  /**
   * User.orders
   */
  export type User$ordersArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Order
     */
    select?: OrderSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Order
     */
    omit?: OrderOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OrderInclude<ExtArgs> | null
    where?: OrderWhereInput
    orderBy?: OrderOrderByWithRelationInput | OrderOrderByWithRelationInput[]
    cursor?: OrderWhereUniqueInput
    take?: number
    skip?: number
    distinct?: OrderScalarFieldEnum | OrderScalarFieldEnum[]
  }

  /**
   * User without action
   */
  export type UserDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
  }


  /**
   * Model Product
   */

  export type AggregateProduct = {
    _count: ProductCountAggregateOutputType | null
    _avg: ProductAvgAggregateOutputType | null
    _sum: ProductSumAggregateOutputType | null
    _min: ProductMinAggregateOutputType | null
    _max: ProductMaxAggregateOutputType | null
  }

  export type ProductAvgAggregateOutputType = {
    price: number | null
  }

  export type ProductSumAggregateOutputType = {
    price: number | null
  }

  export type ProductMinAggregateOutputType = {
    id: string | null
    name: string | null
    price: number | null
    description: string | null
    image: string | null
    category: string | null
    inStock: boolean | null
    size: string | null
    createdAt: Date | null
    updatedAt: Date | null
    images: string | null
    productNumber: string | null
    ageGroup: string | null
    skinType: string | null
    targetConcerns: string | null
    usage: string | null
  }

  export type ProductMaxAggregateOutputType = {
    id: string | null
    name: string | null
    price: number | null
    description: string | null
    image: string | null
    category: string | null
    inStock: boolean | null
    size: string | null
    createdAt: Date | null
    updatedAt: Date | null
    images: string | null
    productNumber: string | null
    ageGroup: string | null
    skinType: string | null
    targetConcerns: string | null
    usage: string | null
  }

  export type ProductCountAggregateOutputType = {
    id: number
    name: number
    price: number
    description: number
    image: number
    category: number
    inStock: number
    size: number
    createdAt: number
    updatedAt: number
    images: number
    productNumber: number
    ageGroup: number
    skinType: number
    targetConcerns: number
    usage: number
    _all: number
  }


  export type ProductAvgAggregateInputType = {
    price?: true
  }

  export type ProductSumAggregateInputType = {
    price?: true
  }

  export type ProductMinAggregateInputType = {
    id?: true
    name?: true
    price?: true
    description?: true
    image?: true
    category?: true
    inStock?: true
    size?: true
    createdAt?: true
    updatedAt?: true
    images?: true
    productNumber?: true
    ageGroup?: true
    skinType?: true
    targetConcerns?: true
    usage?: true
  }

  export type ProductMaxAggregateInputType = {
    id?: true
    name?: true
    price?: true
    description?: true
    image?: true
    category?: true
    inStock?: true
    size?: true
    createdAt?: true
    updatedAt?: true
    images?: true
    productNumber?: true
    ageGroup?: true
    skinType?: true
    targetConcerns?: true
    usage?: true
  }

  export type ProductCountAggregateInputType = {
    id?: true
    name?: true
    price?: true
    description?: true
    image?: true
    category?: true
    inStock?: true
    size?: true
    createdAt?: true
    updatedAt?: true
    images?: true
    productNumber?: true
    ageGroup?: true
    skinType?: true
    targetConcerns?: true
    usage?: true
    _all?: true
  }

  export type ProductAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Product to aggregate.
     */
    where?: ProductWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Products to fetch.
     */
    orderBy?: ProductOrderByWithRelationInput | ProductOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: ProductWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Products from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Products.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Products
    **/
    _count?: true | ProductCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: ProductAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: ProductSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: ProductMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: ProductMaxAggregateInputType
  }

  export type GetProductAggregateType<T extends ProductAggregateArgs> = {
        [P in keyof T & keyof AggregateProduct]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateProduct[P]>
      : GetScalarType<T[P], AggregateProduct[P]>
  }




  export type ProductGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: ProductWhereInput
    orderBy?: ProductOrderByWithAggregationInput | ProductOrderByWithAggregationInput[]
    by: ProductScalarFieldEnum[] | ProductScalarFieldEnum
    having?: ProductScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: ProductCountAggregateInputType | true
    _avg?: ProductAvgAggregateInputType
    _sum?: ProductSumAggregateInputType
    _min?: ProductMinAggregateInputType
    _max?: ProductMaxAggregateInputType
  }

  export type ProductGroupByOutputType = {
    id: string
    name: string
    price: number
    description: string
    image: string
    category: string
    inStock: boolean
    size: string | null
    createdAt: Date
    updatedAt: Date
    images: string | null
    productNumber: string | null
    ageGroup: string | null
    skinType: string | null
    targetConcerns: string | null
    usage: string | null
    _count: ProductCountAggregateOutputType | null
    _avg: ProductAvgAggregateOutputType | null
    _sum: ProductSumAggregateOutputType | null
    _min: ProductMinAggregateOutputType | null
    _max: ProductMaxAggregateOutputType | null
  }

  type GetProductGroupByPayload<T extends ProductGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<ProductGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof ProductGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], ProductGroupByOutputType[P]>
            : GetScalarType<T[P], ProductGroupByOutputType[P]>
        }
      >
    >


  export type ProductSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    name?: boolean
    price?: boolean
    description?: boolean
    image?: boolean
    category?: boolean
    inStock?: boolean
    size?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    images?: boolean
    productNumber?: boolean
    ageGroup?: boolean
    skinType?: boolean
    targetConcerns?: boolean
    usage?: boolean
  }, ExtArgs["result"]["product"]>

  export type ProductSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    name?: boolean
    price?: boolean
    description?: boolean
    image?: boolean
    category?: boolean
    inStock?: boolean
    size?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    images?: boolean
    productNumber?: boolean
    ageGroup?: boolean
    skinType?: boolean
    targetConcerns?: boolean
    usage?: boolean
  }, ExtArgs["result"]["product"]>

  export type ProductSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    name?: boolean
    price?: boolean
    description?: boolean
    image?: boolean
    category?: boolean
    inStock?: boolean
    size?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    images?: boolean
    productNumber?: boolean
    ageGroup?: boolean
    skinType?: boolean
    targetConcerns?: boolean
    usage?: boolean
  }, ExtArgs["result"]["product"]>

  export type ProductSelectScalar = {
    id?: boolean
    name?: boolean
    price?: boolean
    description?: boolean
    image?: boolean
    category?: boolean
    inStock?: boolean
    size?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    images?: boolean
    productNumber?: boolean
    ageGroup?: boolean
    skinType?: boolean
    targetConcerns?: boolean
    usage?: boolean
  }

  export type ProductOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "name" | "price" | "description" | "image" | "category" | "inStock" | "size" | "createdAt" | "updatedAt" | "images" | "productNumber" | "ageGroup" | "skinType" | "targetConcerns" | "usage", ExtArgs["result"]["product"]>

  export type $ProductPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "Product"
    objects: {}
    scalars: $Extensions.GetPayloadResult<{
      id: string
      name: string
      price: number
      description: string
      image: string
      category: string
      inStock: boolean
      size: string | null
      createdAt: Date
      updatedAt: Date
      images: string | null
      productNumber: string | null
      ageGroup: string | null
      skinType: string | null
      targetConcerns: string | null
      usage: string | null
    }, ExtArgs["result"]["product"]>
    composites: {}
  }

  type ProductGetPayload<S extends boolean | null | undefined | ProductDefaultArgs> = $Result.GetResult<Prisma.$ProductPayload, S>

  type ProductCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<ProductFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: ProductCountAggregateInputType | true
    }

  export interface ProductDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['Product'], meta: { name: 'Product' } }
    /**
     * Find zero or one Product that matches the filter.
     * @param {ProductFindUniqueArgs} args - Arguments to find a Product
     * @example
     * // Get one Product
     * const product = await prisma.product.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends ProductFindUniqueArgs>(args: SelectSubset<T, ProductFindUniqueArgs<ExtArgs>>): Prisma__ProductClient<$Result.GetResult<Prisma.$ProductPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one Product that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {ProductFindUniqueOrThrowArgs} args - Arguments to find a Product
     * @example
     * // Get one Product
     * const product = await prisma.product.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends ProductFindUniqueOrThrowArgs>(args: SelectSubset<T, ProductFindUniqueOrThrowArgs<ExtArgs>>): Prisma__ProductClient<$Result.GetResult<Prisma.$ProductPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Product that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ProductFindFirstArgs} args - Arguments to find a Product
     * @example
     * // Get one Product
     * const product = await prisma.product.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends ProductFindFirstArgs>(args?: SelectSubset<T, ProductFindFirstArgs<ExtArgs>>): Prisma__ProductClient<$Result.GetResult<Prisma.$ProductPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Product that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ProductFindFirstOrThrowArgs} args - Arguments to find a Product
     * @example
     * // Get one Product
     * const product = await prisma.product.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends ProductFindFirstOrThrowArgs>(args?: SelectSubset<T, ProductFindFirstOrThrowArgs<ExtArgs>>): Prisma__ProductClient<$Result.GetResult<Prisma.$ProductPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more Products that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ProductFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Products
     * const products = await prisma.product.findMany()
     * 
     * // Get first 10 Products
     * const products = await prisma.product.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const productWithIdOnly = await prisma.product.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends ProductFindManyArgs>(args?: SelectSubset<T, ProductFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ProductPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a Product.
     * @param {ProductCreateArgs} args - Arguments to create a Product.
     * @example
     * // Create one Product
     * const Product = await prisma.product.create({
     *   data: {
     *     // ... data to create a Product
     *   }
     * })
     * 
     */
    create<T extends ProductCreateArgs>(args: SelectSubset<T, ProductCreateArgs<ExtArgs>>): Prisma__ProductClient<$Result.GetResult<Prisma.$ProductPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many Products.
     * @param {ProductCreateManyArgs} args - Arguments to create many Products.
     * @example
     * // Create many Products
     * const product = await prisma.product.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends ProductCreateManyArgs>(args?: SelectSubset<T, ProductCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Products and returns the data saved in the database.
     * @param {ProductCreateManyAndReturnArgs} args - Arguments to create many Products.
     * @example
     * // Create many Products
     * const product = await prisma.product.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Products and only return the `id`
     * const productWithIdOnly = await prisma.product.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends ProductCreateManyAndReturnArgs>(args?: SelectSubset<T, ProductCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ProductPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a Product.
     * @param {ProductDeleteArgs} args - Arguments to delete one Product.
     * @example
     * // Delete one Product
     * const Product = await prisma.product.delete({
     *   where: {
     *     // ... filter to delete one Product
     *   }
     * })
     * 
     */
    delete<T extends ProductDeleteArgs>(args: SelectSubset<T, ProductDeleteArgs<ExtArgs>>): Prisma__ProductClient<$Result.GetResult<Prisma.$ProductPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one Product.
     * @param {ProductUpdateArgs} args - Arguments to update one Product.
     * @example
     * // Update one Product
     * const product = await prisma.product.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends ProductUpdateArgs>(args: SelectSubset<T, ProductUpdateArgs<ExtArgs>>): Prisma__ProductClient<$Result.GetResult<Prisma.$ProductPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more Products.
     * @param {ProductDeleteManyArgs} args - Arguments to filter Products to delete.
     * @example
     * // Delete a few Products
     * const { count } = await prisma.product.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends ProductDeleteManyArgs>(args?: SelectSubset<T, ProductDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Products.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ProductUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Products
     * const product = await prisma.product.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends ProductUpdateManyArgs>(args: SelectSubset<T, ProductUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Products and returns the data updated in the database.
     * @param {ProductUpdateManyAndReturnArgs} args - Arguments to update many Products.
     * @example
     * // Update many Products
     * const product = await prisma.product.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more Products and only return the `id`
     * const productWithIdOnly = await prisma.product.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends ProductUpdateManyAndReturnArgs>(args: SelectSubset<T, ProductUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ProductPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one Product.
     * @param {ProductUpsertArgs} args - Arguments to update or create a Product.
     * @example
     * // Update or create a Product
     * const product = await prisma.product.upsert({
     *   create: {
     *     // ... data to create a Product
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Product we want to update
     *   }
     * })
     */
    upsert<T extends ProductUpsertArgs>(args: SelectSubset<T, ProductUpsertArgs<ExtArgs>>): Prisma__ProductClient<$Result.GetResult<Prisma.$ProductPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of Products.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ProductCountArgs} args - Arguments to filter Products to count.
     * @example
     * // Count the number of Products
     * const count = await prisma.product.count({
     *   where: {
     *     // ... the filter for the Products we want to count
     *   }
     * })
    **/
    count<T extends ProductCountArgs>(
      args?: Subset<T, ProductCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], ProductCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Product.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ProductAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends ProductAggregateArgs>(args: Subset<T, ProductAggregateArgs>): Prisma.PrismaPromise<GetProductAggregateType<T>>

    /**
     * Group by Product.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ProductGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends ProductGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: ProductGroupByArgs['orderBy'] }
        : { orderBy?: ProductGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, ProductGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetProductGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the Product model
   */
  readonly fields: ProductFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for Product.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__ProductClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the Product model
   */
  interface ProductFieldRefs {
    readonly id: FieldRef<"Product", 'String'>
    readonly name: FieldRef<"Product", 'String'>
    readonly price: FieldRef<"Product", 'Float'>
    readonly description: FieldRef<"Product", 'String'>
    readonly image: FieldRef<"Product", 'String'>
    readonly category: FieldRef<"Product", 'String'>
    readonly inStock: FieldRef<"Product", 'Boolean'>
    readonly size: FieldRef<"Product", 'String'>
    readonly createdAt: FieldRef<"Product", 'DateTime'>
    readonly updatedAt: FieldRef<"Product", 'DateTime'>
    readonly images: FieldRef<"Product", 'String'>
    readonly productNumber: FieldRef<"Product", 'String'>
    readonly ageGroup: FieldRef<"Product", 'String'>
    readonly skinType: FieldRef<"Product", 'String'>
    readonly targetConcerns: FieldRef<"Product", 'String'>
    readonly usage: FieldRef<"Product", 'String'>
  }
    

  // Custom InputTypes
  /**
   * Product findUnique
   */
  export type ProductFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Product
     */
    select?: ProductSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Product
     */
    omit?: ProductOmit<ExtArgs> | null
    /**
     * Filter, which Product to fetch.
     */
    where: ProductWhereUniqueInput
  }

  /**
   * Product findUniqueOrThrow
   */
  export type ProductFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Product
     */
    select?: ProductSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Product
     */
    omit?: ProductOmit<ExtArgs> | null
    /**
     * Filter, which Product to fetch.
     */
    where: ProductWhereUniqueInput
  }

  /**
   * Product findFirst
   */
  export type ProductFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Product
     */
    select?: ProductSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Product
     */
    omit?: ProductOmit<ExtArgs> | null
    /**
     * Filter, which Product to fetch.
     */
    where?: ProductWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Products to fetch.
     */
    orderBy?: ProductOrderByWithRelationInput | ProductOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Products.
     */
    cursor?: ProductWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Products from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Products.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Products.
     */
    distinct?: ProductScalarFieldEnum | ProductScalarFieldEnum[]
  }

  /**
   * Product findFirstOrThrow
   */
  export type ProductFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Product
     */
    select?: ProductSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Product
     */
    omit?: ProductOmit<ExtArgs> | null
    /**
     * Filter, which Product to fetch.
     */
    where?: ProductWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Products to fetch.
     */
    orderBy?: ProductOrderByWithRelationInput | ProductOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Products.
     */
    cursor?: ProductWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Products from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Products.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Products.
     */
    distinct?: ProductScalarFieldEnum | ProductScalarFieldEnum[]
  }

  /**
   * Product findMany
   */
  export type ProductFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Product
     */
    select?: ProductSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Product
     */
    omit?: ProductOmit<ExtArgs> | null
    /**
     * Filter, which Products to fetch.
     */
    where?: ProductWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Products to fetch.
     */
    orderBy?: ProductOrderByWithRelationInput | ProductOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Products.
     */
    cursor?: ProductWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Products from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Products.
     */
    skip?: number
    distinct?: ProductScalarFieldEnum | ProductScalarFieldEnum[]
  }

  /**
   * Product create
   */
  export type ProductCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Product
     */
    select?: ProductSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Product
     */
    omit?: ProductOmit<ExtArgs> | null
    /**
     * The data needed to create a Product.
     */
    data: XOR<ProductCreateInput, ProductUncheckedCreateInput>
  }

  /**
   * Product createMany
   */
  export type ProductCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Products.
     */
    data: ProductCreateManyInput | ProductCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Product createManyAndReturn
   */
  export type ProductCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Product
     */
    select?: ProductSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Product
     */
    omit?: ProductOmit<ExtArgs> | null
    /**
     * The data used to create many Products.
     */
    data: ProductCreateManyInput | ProductCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Product update
   */
  export type ProductUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Product
     */
    select?: ProductSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Product
     */
    omit?: ProductOmit<ExtArgs> | null
    /**
     * The data needed to update a Product.
     */
    data: XOR<ProductUpdateInput, ProductUncheckedUpdateInput>
    /**
     * Choose, which Product to update.
     */
    where: ProductWhereUniqueInput
  }

  /**
   * Product updateMany
   */
  export type ProductUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Products.
     */
    data: XOR<ProductUpdateManyMutationInput, ProductUncheckedUpdateManyInput>
    /**
     * Filter which Products to update
     */
    where?: ProductWhereInput
    /**
     * Limit how many Products to update.
     */
    limit?: number
  }

  /**
   * Product updateManyAndReturn
   */
  export type ProductUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Product
     */
    select?: ProductSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Product
     */
    omit?: ProductOmit<ExtArgs> | null
    /**
     * The data used to update Products.
     */
    data: XOR<ProductUpdateManyMutationInput, ProductUncheckedUpdateManyInput>
    /**
     * Filter which Products to update
     */
    where?: ProductWhereInput
    /**
     * Limit how many Products to update.
     */
    limit?: number
  }

  /**
   * Product upsert
   */
  export type ProductUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Product
     */
    select?: ProductSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Product
     */
    omit?: ProductOmit<ExtArgs> | null
    /**
     * The filter to search for the Product to update in case it exists.
     */
    where: ProductWhereUniqueInput
    /**
     * In case the Product found by the `where` argument doesn't exist, create a new Product with this data.
     */
    create: XOR<ProductCreateInput, ProductUncheckedCreateInput>
    /**
     * In case the Product was found with the provided `where` argument, update it with this data.
     */
    update: XOR<ProductUpdateInput, ProductUncheckedUpdateInput>
  }

  /**
   * Product delete
   */
  export type ProductDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Product
     */
    select?: ProductSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Product
     */
    omit?: ProductOmit<ExtArgs> | null
    /**
     * Filter which Product to delete.
     */
    where: ProductWhereUniqueInput
  }

  /**
   * Product deleteMany
   */
  export type ProductDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Products to delete
     */
    where?: ProductWhereInput
    /**
     * Limit how many Products to delete.
     */
    limit?: number
  }

  /**
   * Product without action
   */
  export type ProductDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Product
     */
    select?: ProductSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Product
     */
    omit?: ProductOmit<ExtArgs> | null
  }


  /**
   * Model Order
   */

  export type AggregateOrder = {
    _count: OrderCountAggregateOutputType | null
    _avg: OrderAvgAggregateOutputType | null
    _sum: OrderSumAggregateOutputType | null
    _min: OrderMinAggregateOutputType | null
    _max: OrderMaxAggregateOutputType | null
  }

  export type OrderAvgAggregateOutputType = {
    subtotal: number | null
    discountAmount: number | null
    shipping: number | null
    vat: number | null
    total: number | null
  }

  export type OrderSumAggregateOutputType = {
    subtotal: number | null
    discountAmount: number | null
    shipping: number | null
    vat: number | null
    total: number | null
  }

  export type OrderMinAggregateOutputType = {
    id: string | null
    orderNumber: string | null
    customerEmail: string | null
    customerName: string | null
    customerPhone: string | null
    customerEmirate: string | null
    customerAddress: string | null
    subtotal: number | null
    discountAmount: number | null
    shipping: number | null
    vat: number | null
    total: number | null
    status: string | null
    sessionId: string | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type OrderMaxAggregateOutputType = {
    id: string | null
    orderNumber: string | null
    customerEmail: string | null
    customerName: string | null
    customerPhone: string | null
    customerEmirate: string | null
    customerAddress: string | null
    subtotal: number | null
    discountAmount: number | null
    shipping: number | null
    vat: number | null
    total: number | null
    status: string | null
    sessionId: string | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type OrderCountAggregateOutputType = {
    id: number
    orderNumber: number
    customerEmail: number
    customerName: number
    customerPhone: number
    customerEmirate: number
    customerAddress: number
    subtotal: number
    discountAmount: number
    shipping: number
    vat: number
    total: number
    status: number
    sessionId: number
    createdAt: number
    updatedAt: number
    _all: number
  }


  export type OrderAvgAggregateInputType = {
    subtotal?: true
    discountAmount?: true
    shipping?: true
    vat?: true
    total?: true
  }

  export type OrderSumAggregateInputType = {
    subtotal?: true
    discountAmount?: true
    shipping?: true
    vat?: true
    total?: true
  }

  export type OrderMinAggregateInputType = {
    id?: true
    orderNumber?: true
    customerEmail?: true
    customerName?: true
    customerPhone?: true
    customerEmirate?: true
    customerAddress?: true
    subtotal?: true
    discountAmount?: true
    shipping?: true
    vat?: true
    total?: true
    status?: true
    sessionId?: true
    createdAt?: true
    updatedAt?: true
  }

  export type OrderMaxAggregateInputType = {
    id?: true
    orderNumber?: true
    customerEmail?: true
    customerName?: true
    customerPhone?: true
    customerEmirate?: true
    customerAddress?: true
    subtotal?: true
    discountAmount?: true
    shipping?: true
    vat?: true
    total?: true
    status?: true
    sessionId?: true
    createdAt?: true
    updatedAt?: true
  }

  export type OrderCountAggregateInputType = {
    id?: true
    orderNumber?: true
    customerEmail?: true
    customerName?: true
    customerPhone?: true
    customerEmirate?: true
    customerAddress?: true
    subtotal?: true
    discountAmount?: true
    shipping?: true
    vat?: true
    total?: true
    status?: true
    sessionId?: true
    createdAt?: true
    updatedAt?: true
    _all?: true
  }

  export type OrderAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Order to aggregate.
     */
    where?: OrderWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Orders to fetch.
     */
    orderBy?: OrderOrderByWithRelationInput | OrderOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: OrderWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Orders from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Orders.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Orders
    **/
    _count?: true | OrderCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: OrderAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: OrderSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: OrderMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: OrderMaxAggregateInputType
  }

  export type GetOrderAggregateType<T extends OrderAggregateArgs> = {
        [P in keyof T & keyof AggregateOrder]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateOrder[P]>
      : GetScalarType<T[P], AggregateOrder[P]>
  }




  export type OrderGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: OrderWhereInput
    orderBy?: OrderOrderByWithAggregationInput | OrderOrderByWithAggregationInput[]
    by: OrderScalarFieldEnum[] | OrderScalarFieldEnum
    having?: OrderScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: OrderCountAggregateInputType | true
    _avg?: OrderAvgAggregateInputType
    _sum?: OrderSumAggregateInputType
    _min?: OrderMinAggregateInputType
    _max?: OrderMaxAggregateInputType
  }

  export type OrderGroupByOutputType = {
    id: string
    orderNumber: string
    customerEmail: string
    customerName: string
    customerPhone: string
    customerEmirate: string
    customerAddress: string
    subtotal: number
    discountAmount: number
    shipping: number
    vat: number
    total: number
    status: string
    sessionId: string | null
    createdAt: Date
    updatedAt: Date
    _count: OrderCountAggregateOutputType | null
    _avg: OrderAvgAggregateOutputType | null
    _sum: OrderSumAggregateOutputType | null
    _min: OrderMinAggregateOutputType | null
    _max: OrderMaxAggregateOutputType | null
  }

  type GetOrderGroupByPayload<T extends OrderGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<OrderGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof OrderGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], OrderGroupByOutputType[P]>
            : GetScalarType<T[P], OrderGroupByOutputType[P]>
        }
      >
    >


  export type OrderSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    orderNumber?: boolean
    customerEmail?: boolean
    customerName?: boolean
    customerPhone?: boolean
    customerEmirate?: boolean
    customerAddress?: boolean
    subtotal?: boolean
    discountAmount?: boolean
    shipping?: boolean
    vat?: boolean
    total?: boolean
    status?: boolean
    sessionId?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    orderItems?: boolean | Order$orderItemsArgs<ExtArgs>
    users?: boolean | UserDefaultArgs<ExtArgs>
    _count?: boolean | OrderCountOutputTypeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["order"]>

  export type OrderSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    orderNumber?: boolean
    customerEmail?: boolean
    customerName?: boolean
    customerPhone?: boolean
    customerEmirate?: boolean
    customerAddress?: boolean
    subtotal?: boolean
    discountAmount?: boolean
    shipping?: boolean
    vat?: boolean
    total?: boolean
    status?: boolean
    sessionId?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    users?: boolean | UserDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["order"]>

  export type OrderSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    orderNumber?: boolean
    customerEmail?: boolean
    customerName?: boolean
    customerPhone?: boolean
    customerEmirate?: boolean
    customerAddress?: boolean
    subtotal?: boolean
    discountAmount?: boolean
    shipping?: boolean
    vat?: boolean
    total?: boolean
    status?: boolean
    sessionId?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    users?: boolean | UserDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["order"]>

  export type OrderSelectScalar = {
    id?: boolean
    orderNumber?: boolean
    customerEmail?: boolean
    customerName?: boolean
    customerPhone?: boolean
    customerEmirate?: boolean
    customerAddress?: boolean
    subtotal?: boolean
    discountAmount?: boolean
    shipping?: boolean
    vat?: boolean
    total?: boolean
    status?: boolean
    sessionId?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }

  export type OrderOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "orderNumber" | "customerEmail" | "customerName" | "customerPhone" | "customerEmirate" | "customerAddress" | "subtotal" | "discountAmount" | "shipping" | "vat" | "total" | "status" | "sessionId" | "createdAt" | "updatedAt", ExtArgs["result"]["order"]>
  export type OrderInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    orderItems?: boolean | Order$orderItemsArgs<ExtArgs>
    users?: boolean | UserDefaultArgs<ExtArgs>
    _count?: boolean | OrderCountOutputTypeDefaultArgs<ExtArgs>
  }
  export type OrderIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    users?: boolean | UserDefaultArgs<ExtArgs>
  }
  export type OrderIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    users?: boolean | UserDefaultArgs<ExtArgs>
  }

  export type $OrderPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "Order"
    objects: {
      orderItems: Prisma.$OrderItemPayload<ExtArgs>[]
      users: Prisma.$UserPayload<ExtArgs>
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      orderNumber: string
      customerEmail: string
      customerName: string
      customerPhone: string
      customerEmirate: string
      customerAddress: string
      subtotal: number
      discountAmount: number
      shipping: number
      vat: number
      total: number
      status: string
      sessionId: string | null
      createdAt: Date
      updatedAt: Date
    }, ExtArgs["result"]["order"]>
    composites: {}
  }

  type OrderGetPayload<S extends boolean | null | undefined | OrderDefaultArgs> = $Result.GetResult<Prisma.$OrderPayload, S>

  type OrderCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<OrderFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: OrderCountAggregateInputType | true
    }

  export interface OrderDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['Order'], meta: { name: 'Order' } }
    /**
     * Find zero or one Order that matches the filter.
     * @param {OrderFindUniqueArgs} args - Arguments to find a Order
     * @example
     * // Get one Order
     * const order = await prisma.order.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends OrderFindUniqueArgs>(args: SelectSubset<T, OrderFindUniqueArgs<ExtArgs>>): Prisma__OrderClient<$Result.GetResult<Prisma.$OrderPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one Order that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {OrderFindUniqueOrThrowArgs} args - Arguments to find a Order
     * @example
     * // Get one Order
     * const order = await prisma.order.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends OrderFindUniqueOrThrowArgs>(args: SelectSubset<T, OrderFindUniqueOrThrowArgs<ExtArgs>>): Prisma__OrderClient<$Result.GetResult<Prisma.$OrderPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Order that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {OrderFindFirstArgs} args - Arguments to find a Order
     * @example
     * // Get one Order
     * const order = await prisma.order.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends OrderFindFirstArgs>(args?: SelectSubset<T, OrderFindFirstArgs<ExtArgs>>): Prisma__OrderClient<$Result.GetResult<Prisma.$OrderPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Order that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {OrderFindFirstOrThrowArgs} args - Arguments to find a Order
     * @example
     * // Get one Order
     * const order = await prisma.order.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends OrderFindFirstOrThrowArgs>(args?: SelectSubset<T, OrderFindFirstOrThrowArgs<ExtArgs>>): Prisma__OrderClient<$Result.GetResult<Prisma.$OrderPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more Orders that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {OrderFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Orders
     * const orders = await prisma.order.findMany()
     * 
     * // Get first 10 Orders
     * const orders = await prisma.order.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const orderWithIdOnly = await prisma.order.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends OrderFindManyArgs>(args?: SelectSubset<T, OrderFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$OrderPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a Order.
     * @param {OrderCreateArgs} args - Arguments to create a Order.
     * @example
     * // Create one Order
     * const Order = await prisma.order.create({
     *   data: {
     *     // ... data to create a Order
     *   }
     * })
     * 
     */
    create<T extends OrderCreateArgs>(args: SelectSubset<T, OrderCreateArgs<ExtArgs>>): Prisma__OrderClient<$Result.GetResult<Prisma.$OrderPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many Orders.
     * @param {OrderCreateManyArgs} args - Arguments to create many Orders.
     * @example
     * // Create many Orders
     * const order = await prisma.order.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends OrderCreateManyArgs>(args?: SelectSubset<T, OrderCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Orders and returns the data saved in the database.
     * @param {OrderCreateManyAndReturnArgs} args - Arguments to create many Orders.
     * @example
     * // Create many Orders
     * const order = await prisma.order.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Orders and only return the `id`
     * const orderWithIdOnly = await prisma.order.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends OrderCreateManyAndReturnArgs>(args?: SelectSubset<T, OrderCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$OrderPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a Order.
     * @param {OrderDeleteArgs} args - Arguments to delete one Order.
     * @example
     * // Delete one Order
     * const Order = await prisma.order.delete({
     *   where: {
     *     // ... filter to delete one Order
     *   }
     * })
     * 
     */
    delete<T extends OrderDeleteArgs>(args: SelectSubset<T, OrderDeleteArgs<ExtArgs>>): Prisma__OrderClient<$Result.GetResult<Prisma.$OrderPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one Order.
     * @param {OrderUpdateArgs} args - Arguments to update one Order.
     * @example
     * // Update one Order
     * const order = await prisma.order.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends OrderUpdateArgs>(args: SelectSubset<T, OrderUpdateArgs<ExtArgs>>): Prisma__OrderClient<$Result.GetResult<Prisma.$OrderPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more Orders.
     * @param {OrderDeleteManyArgs} args - Arguments to filter Orders to delete.
     * @example
     * // Delete a few Orders
     * const { count } = await prisma.order.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends OrderDeleteManyArgs>(args?: SelectSubset<T, OrderDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Orders.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {OrderUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Orders
     * const order = await prisma.order.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends OrderUpdateManyArgs>(args: SelectSubset<T, OrderUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Orders and returns the data updated in the database.
     * @param {OrderUpdateManyAndReturnArgs} args - Arguments to update many Orders.
     * @example
     * // Update many Orders
     * const order = await prisma.order.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more Orders and only return the `id`
     * const orderWithIdOnly = await prisma.order.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends OrderUpdateManyAndReturnArgs>(args: SelectSubset<T, OrderUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$OrderPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one Order.
     * @param {OrderUpsertArgs} args - Arguments to update or create a Order.
     * @example
     * // Update or create a Order
     * const order = await prisma.order.upsert({
     *   create: {
     *     // ... data to create a Order
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Order we want to update
     *   }
     * })
     */
    upsert<T extends OrderUpsertArgs>(args: SelectSubset<T, OrderUpsertArgs<ExtArgs>>): Prisma__OrderClient<$Result.GetResult<Prisma.$OrderPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of Orders.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {OrderCountArgs} args - Arguments to filter Orders to count.
     * @example
     * // Count the number of Orders
     * const count = await prisma.order.count({
     *   where: {
     *     // ... the filter for the Orders we want to count
     *   }
     * })
    **/
    count<T extends OrderCountArgs>(
      args?: Subset<T, OrderCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], OrderCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Order.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {OrderAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends OrderAggregateArgs>(args: Subset<T, OrderAggregateArgs>): Prisma.PrismaPromise<GetOrderAggregateType<T>>

    /**
     * Group by Order.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {OrderGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends OrderGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: OrderGroupByArgs['orderBy'] }
        : { orderBy?: OrderGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, OrderGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetOrderGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the Order model
   */
  readonly fields: OrderFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for Order.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__OrderClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    orderItems<T extends Order$orderItemsArgs<ExtArgs> = {}>(args?: Subset<T, Order$orderItemsArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$OrderItemPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    users<T extends UserDefaultArgs<ExtArgs> = {}>(args?: Subset<T, UserDefaultArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the Order model
   */
  interface OrderFieldRefs {
    readonly id: FieldRef<"Order", 'String'>
    readonly orderNumber: FieldRef<"Order", 'String'>
    readonly customerEmail: FieldRef<"Order", 'String'>
    readonly customerName: FieldRef<"Order", 'String'>
    readonly customerPhone: FieldRef<"Order", 'String'>
    readonly customerEmirate: FieldRef<"Order", 'String'>
    readonly customerAddress: FieldRef<"Order", 'String'>
    readonly subtotal: FieldRef<"Order", 'Float'>
    readonly discountAmount: FieldRef<"Order", 'Float'>
    readonly shipping: FieldRef<"Order", 'Float'>
    readonly vat: FieldRef<"Order", 'Float'>
    readonly total: FieldRef<"Order", 'Float'>
    readonly status: FieldRef<"Order", 'String'>
    readonly sessionId: FieldRef<"Order", 'String'>
    readonly createdAt: FieldRef<"Order", 'DateTime'>
    readonly updatedAt: FieldRef<"Order", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * Order findUnique
   */
  export type OrderFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Order
     */
    select?: OrderSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Order
     */
    omit?: OrderOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OrderInclude<ExtArgs> | null
    /**
     * Filter, which Order to fetch.
     */
    where: OrderWhereUniqueInput
  }

  /**
   * Order findUniqueOrThrow
   */
  export type OrderFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Order
     */
    select?: OrderSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Order
     */
    omit?: OrderOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OrderInclude<ExtArgs> | null
    /**
     * Filter, which Order to fetch.
     */
    where: OrderWhereUniqueInput
  }

  /**
   * Order findFirst
   */
  export type OrderFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Order
     */
    select?: OrderSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Order
     */
    omit?: OrderOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OrderInclude<ExtArgs> | null
    /**
     * Filter, which Order to fetch.
     */
    where?: OrderWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Orders to fetch.
     */
    orderBy?: OrderOrderByWithRelationInput | OrderOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Orders.
     */
    cursor?: OrderWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Orders from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Orders.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Orders.
     */
    distinct?: OrderScalarFieldEnum | OrderScalarFieldEnum[]
  }

  /**
   * Order findFirstOrThrow
   */
  export type OrderFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Order
     */
    select?: OrderSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Order
     */
    omit?: OrderOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OrderInclude<ExtArgs> | null
    /**
     * Filter, which Order to fetch.
     */
    where?: OrderWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Orders to fetch.
     */
    orderBy?: OrderOrderByWithRelationInput | OrderOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Orders.
     */
    cursor?: OrderWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Orders from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Orders.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Orders.
     */
    distinct?: OrderScalarFieldEnum | OrderScalarFieldEnum[]
  }

  /**
   * Order findMany
   */
  export type OrderFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Order
     */
    select?: OrderSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Order
     */
    omit?: OrderOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OrderInclude<ExtArgs> | null
    /**
     * Filter, which Orders to fetch.
     */
    where?: OrderWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Orders to fetch.
     */
    orderBy?: OrderOrderByWithRelationInput | OrderOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Orders.
     */
    cursor?: OrderWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Orders from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Orders.
     */
    skip?: number
    distinct?: OrderScalarFieldEnum | OrderScalarFieldEnum[]
  }

  /**
   * Order create
   */
  export type OrderCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Order
     */
    select?: OrderSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Order
     */
    omit?: OrderOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OrderInclude<ExtArgs> | null
    /**
     * The data needed to create a Order.
     */
    data: XOR<OrderCreateInput, OrderUncheckedCreateInput>
  }

  /**
   * Order createMany
   */
  export type OrderCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Orders.
     */
    data: OrderCreateManyInput | OrderCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Order createManyAndReturn
   */
  export type OrderCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Order
     */
    select?: OrderSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Order
     */
    omit?: OrderOmit<ExtArgs> | null
    /**
     * The data used to create many Orders.
     */
    data: OrderCreateManyInput | OrderCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OrderIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * Order update
   */
  export type OrderUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Order
     */
    select?: OrderSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Order
     */
    omit?: OrderOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OrderInclude<ExtArgs> | null
    /**
     * The data needed to update a Order.
     */
    data: XOR<OrderUpdateInput, OrderUncheckedUpdateInput>
    /**
     * Choose, which Order to update.
     */
    where: OrderWhereUniqueInput
  }

  /**
   * Order updateMany
   */
  export type OrderUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Orders.
     */
    data: XOR<OrderUpdateManyMutationInput, OrderUncheckedUpdateManyInput>
    /**
     * Filter which Orders to update
     */
    where?: OrderWhereInput
    /**
     * Limit how many Orders to update.
     */
    limit?: number
  }

  /**
   * Order updateManyAndReturn
   */
  export type OrderUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Order
     */
    select?: OrderSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Order
     */
    omit?: OrderOmit<ExtArgs> | null
    /**
     * The data used to update Orders.
     */
    data: XOR<OrderUpdateManyMutationInput, OrderUncheckedUpdateManyInput>
    /**
     * Filter which Orders to update
     */
    where?: OrderWhereInput
    /**
     * Limit how many Orders to update.
     */
    limit?: number
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OrderIncludeUpdateManyAndReturn<ExtArgs> | null
  }

  /**
   * Order upsert
   */
  export type OrderUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Order
     */
    select?: OrderSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Order
     */
    omit?: OrderOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OrderInclude<ExtArgs> | null
    /**
     * The filter to search for the Order to update in case it exists.
     */
    where: OrderWhereUniqueInput
    /**
     * In case the Order found by the `where` argument doesn't exist, create a new Order with this data.
     */
    create: XOR<OrderCreateInput, OrderUncheckedCreateInput>
    /**
     * In case the Order was found with the provided `where` argument, update it with this data.
     */
    update: XOR<OrderUpdateInput, OrderUncheckedUpdateInput>
  }

  /**
   * Order delete
   */
  export type OrderDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Order
     */
    select?: OrderSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Order
     */
    omit?: OrderOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OrderInclude<ExtArgs> | null
    /**
     * Filter which Order to delete.
     */
    where: OrderWhereUniqueInput
  }

  /**
   * Order deleteMany
   */
  export type OrderDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Orders to delete
     */
    where?: OrderWhereInput
    /**
     * Limit how many Orders to delete.
     */
    limit?: number
  }

  /**
   * Order.orderItems
   */
  export type Order$orderItemsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the OrderItem
     */
    select?: OrderItemSelect<ExtArgs> | null
    /**
     * Omit specific fields from the OrderItem
     */
    omit?: OrderItemOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OrderItemInclude<ExtArgs> | null
    where?: OrderItemWhereInput
    orderBy?: OrderItemOrderByWithRelationInput | OrderItemOrderByWithRelationInput[]
    cursor?: OrderItemWhereUniqueInput
    take?: number
    skip?: number
    distinct?: OrderItemScalarFieldEnum | OrderItemScalarFieldEnum[]
  }

  /**
   * Order without action
   */
  export type OrderDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Order
     */
    select?: OrderSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Order
     */
    omit?: OrderOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OrderInclude<ExtArgs> | null
  }


  /**
   * Model OrderItem
   */

  export type AggregateOrderItem = {
    _count: OrderItemCountAggregateOutputType | null
    _avg: OrderItemAvgAggregateOutputType | null
    _sum: OrderItemSumAggregateOutputType | null
    _min: OrderItemMinAggregateOutputType | null
    _max: OrderItemMaxAggregateOutputType | null
  }

  export type OrderItemAvgAggregateOutputType = {
    price: number | null
    quantity: number | null
  }

  export type OrderItemSumAggregateOutputType = {
    price: number | null
    quantity: number | null
  }

  export type OrderItemMinAggregateOutputType = {
    id: string | null
    orderId: string | null
    productId: string | null
    productName: string | null
    price: number | null
    quantity: number | null
    image: string | null
  }

  export type OrderItemMaxAggregateOutputType = {
    id: string | null
    orderId: string | null
    productId: string | null
    productName: string | null
    price: number | null
    quantity: number | null
    image: string | null
  }

  export type OrderItemCountAggregateOutputType = {
    id: number
    orderId: number
    productId: number
    productName: number
    price: number
    quantity: number
    image: number
    _all: number
  }


  export type OrderItemAvgAggregateInputType = {
    price?: true
    quantity?: true
  }

  export type OrderItemSumAggregateInputType = {
    price?: true
    quantity?: true
  }

  export type OrderItemMinAggregateInputType = {
    id?: true
    orderId?: true
    productId?: true
    productName?: true
    price?: true
    quantity?: true
    image?: true
  }

  export type OrderItemMaxAggregateInputType = {
    id?: true
    orderId?: true
    productId?: true
    productName?: true
    price?: true
    quantity?: true
    image?: true
  }

  export type OrderItemCountAggregateInputType = {
    id?: true
    orderId?: true
    productId?: true
    productName?: true
    price?: true
    quantity?: true
    image?: true
    _all?: true
  }

  export type OrderItemAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which OrderItem to aggregate.
     */
    where?: OrderItemWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of OrderItems to fetch.
     */
    orderBy?: OrderItemOrderByWithRelationInput | OrderItemOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: OrderItemWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` OrderItems from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` OrderItems.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned OrderItems
    **/
    _count?: true | OrderItemCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: OrderItemAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: OrderItemSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: OrderItemMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: OrderItemMaxAggregateInputType
  }

  export type GetOrderItemAggregateType<T extends OrderItemAggregateArgs> = {
        [P in keyof T & keyof AggregateOrderItem]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateOrderItem[P]>
      : GetScalarType<T[P], AggregateOrderItem[P]>
  }




  export type OrderItemGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: OrderItemWhereInput
    orderBy?: OrderItemOrderByWithAggregationInput | OrderItemOrderByWithAggregationInput[]
    by: OrderItemScalarFieldEnum[] | OrderItemScalarFieldEnum
    having?: OrderItemScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: OrderItemCountAggregateInputType | true
    _avg?: OrderItemAvgAggregateInputType
    _sum?: OrderItemSumAggregateInputType
    _min?: OrderItemMinAggregateInputType
    _max?: OrderItemMaxAggregateInputType
  }

  export type OrderItemGroupByOutputType = {
    id: string
    orderId: string
    productId: string
    productName: string
    price: number
    quantity: number
    image: string
    _count: OrderItemCountAggregateOutputType | null
    _avg: OrderItemAvgAggregateOutputType | null
    _sum: OrderItemSumAggregateOutputType | null
    _min: OrderItemMinAggregateOutputType | null
    _max: OrderItemMaxAggregateOutputType | null
  }

  type GetOrderItemGroupByPayload<T extends OrderItemGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<OrderItemGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof OrderItemGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], OrderItemGroupByOutputType[P]>
            : GetScalarType<T[P], OrderItemGroupByOutputType[P]>
        }
      >
    >


  export type OrderItemSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    orderId?: boolean
    productId?: boolean
    productName?: boolean
    price?: boolean
    quantity?: boolean
    image?: boolean
    order?: boolean | OrderDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["orderItem"]>

  export type OrderItemSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    orderId?: boolean
    productId?: boolean
    productName?: boolean
    price?: boolean
    quantity?: boolean
    image?: boolean
    order?: boolean | OrderDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["orderItem"]>

  export type OrderItemSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    orderId?: boolean
    productId?: boolean
    productName?: boolean
    price?: boolean
    quantity?: boolean
    image?: boolean
    order?: boolean | OrderDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["orderItem"]>

  export type OrderItemSelectScalar = {
    id?: boolean
    orderId?: boolean
    productId?: boolean
    productName?: boolean
    price?: boolean
    quantity?: boolean
    image?: boolean
  }

  export type OrderItemOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "orderId" | "productId" | "productName" | "price" | "quantity" | "image", ExtArgs["result"]["orderItem"]>
  export type OrderItemInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    order?: boolean | OrderDefaultArgs<ExtArgs>
  }
  export type OrderItemIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    order?: boolean | OrderDefaultArgs<ExtArgs>
  }
  export type OrderItemIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    order?: boolean | OrderDefaultArgs<ExtArgs>
  }

  export type $OrderItemPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "OrderItem"
    objects: {
      order: Prisma.$OrderPayload<ExtArgs>
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      orderId: string
      productId: string
      productName: string
      price: number
      quantity: number
      image: string
    }, ExtArgs["result"]["orderItem"]>
    composites: {}
  }

  type OrderItemGetPayload<S extends boolean | null | undefined | OrderItemDefaultArgs> = $Result.GetResult<Prisma.$OrderItemPayload, S>

  type OrderItemCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<OrderItemFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: OrderItemCountAggregateInputType | true
    }

  export interface OrderItemDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['OrderItem'], meta: { name: 'OrderItem' } }
    /**
     * Find zero or one OrderItem that matches the filter.
     * @param {OrderItemFindUniqueArgs} args - Arguments to find a OrderItem
     * @example
     * // Get one OrderItem
     * const orderItem = await prisma.orderItem.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends OrderItemFindUniqueArgs>(args: SelectSubset<T, OrderItemFindUniqueArgs<ExtArgs>>): Prisma__OrderItemClient<$Result.GetResult<Prisma.$OrderItemPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one OrderItem that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {OrderItemFindUniqueOrThrowArgs} args - Arguments to find a OrderItem
     * @example
     * // Get one OrderItem
     * const orderItem = await prisma.orderItem.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends OrderItemFindUniqueOrThrowArgs>(args: SelectSubset<T, OrderItemFindUniqueOrThrowArgs<ExtArgs>>): Prisma__OrderItemClient<$Result.GetResult<Prisma.$OrderItemPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first OrderItem that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {OrderItemFindFirstArgs} args - Arguments to find a OrderItem
     * @example
     * // Get one OrderItem
     * const orderItem = await prisma.orderItem.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends OrderItemFindFirstArgs>(args?: SelectSubset<T, OrderItemFindFirstArgs<ExtArgs>>): Prisma__OrderItemClient<$Result.GetResult<Prisma.$OrderItemPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first OrderItem that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {OrderItemFindFirstOrThrowArgs} args - Arguments to find a OrderItem
     * @example
     * // Get one OrderItem
     * const orderItem = await prisma.orderItem.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends OrderItemFindFirstOrThrowArgs>(args?: SelectSubset<T, OrderItemFindFirstOrThrowArgs<ExtArgs>>): Prisma__OrderItemClient<$Result.GetResult<Prisma.$OrderItemPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more OrderItems that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {OrderItemFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all OrderItems
     * const orderItems = await prisma.orderItem.findMany()
     * 
     * // Get first 10 OrderItems
     * const orderItems = await prisma.orderItem.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const orderItemWithIdOnly = await prisma.orderItem.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends OrderItemFindManyArgs>(args?: SelectSubset<T, OrderItemFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$OrderItemPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a OrderItem.
     * @param {OrderItemCreateArgs} args - Arguments to create a OrderItem.
     * @example
     * // Create one OrderItem
     * const OrderItem = await prisma.orderItem.create({
     *   data: {
     *     // ... data to create a OrderItem
     *   }
     * })
     * 
     */
    create<T extends OrderItemCreateArgs>(args: SelectSubset<T, OrderItemCreateArgs<ExtArgs>>): Prisma__OrderItemClient<$Result.GetResult<Prisma.$OrderItemPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many OrderItems.
     * @param {OrderItemCreateManyArgs} args - Arguments to create many OrderItems.
     * @example
     * // Create many OrderItems
     * const orderItem = await prisma.orderItem.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends OrderItemCreateManyArgs>(args?: SelectSubset<T, OrderItemCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many OrderItems and returns the data saved in the database.
     * @param {OrderItemCreateManyAndReturnArgs} args - Arguments to create many OrderItems.
     * @example
     * // Create many OrderItems
     * const orderItem = await prisma.orderItem.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many OrderItems and only return the `id`
     * const orderItemWithIdOnly = await prisma.orderItem.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends OrderItemCreateManyAndReturnArgs>(args?: SelectSubset<T, OrderItemCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$OrderItemPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a OrderItem.
     * @param {OrderItemDeleteArgs} args - Arguments to delete one OrderItem.
     * @example
     * // Delete one OrderItem
     * const OrderItem = await prisma.orderItem.delete({
     *   where: {
     *     // ... filter to delete one OrderItem
     *   }
     * })
     * 
     */
    delete<T extends OrderItemDeleteArgs>(args: SelectSubset<T, OrderItemDeleteArgs<ExtArgs>>): Prisma__OrderItemClient<$Result.GetResult<Prisma.$OrderItemPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one OrderItem.
     * @param {OrderItemUpdateArgs} args - Arguments to update one OrderItem.
     * @example
     * // Update one OrderItem
     * const orderItem = await prisma.orderItem.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends OrderItemUpdateArgs>(args: SelectSubset<T, OrderItemUpdateArgs<ExtArgs>>): Prisma__OrderItemClient<$Result.GetResult<Prisma.$OrderItemPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more OrderItems.
     * @param {OrderItemDeleteManyArgs} args - Arguments to filter OrderItems to delete.
     * @example
     * // Delete a few OrderItems
     * const { count } = await prisma.orderItem.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends OrderItemDeleteManyArgs>(args?: SelectSubset<T, OrderItemDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more OrderItems.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {OrderItemUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many OrderItems
     * const orderItem = await prisma.orderItem.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends OrderItemUpdateManyArgs>(args: SelectSubset<T, OrderItemUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more OrderItems and returns the data updated in the database.
     * @param {OrderItemUpdateManyAndReturnArgs} args - Arguments to update many OrderItems.
     * @example
     * // Update many OrderItems
     * const orderItem = await prisma.orderItem.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more OrderItems and only return the `id`
     * const orderItemWithIdOnly = await prisma.orderItem.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends OrderItemUpdateManyAndReturnArgs>(args: SelectSubset<T, OrderItemUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$OrderItemPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one OrderItem.
     * @param {OrderItemUpsertArgs} args - Arguments to update or create a OrderItem.
     * @example
     * // Update or create a OrderItem
     * const orderItem = await prisma.orderItem.upsert({
     *   create: {
     *     // ... data to create a OrderItem
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the OrderItem we want to update
     *   }
     * })
     */
    upsert<T extends OrderItemUpsertArgs>(args: SelectSubset<T, OrderItemUpsertArgs<ExtArgs>>): Prisma__OrderItemClient<$Result.GetResult<Prisma.$OrderItemPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of OrderItems.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {OrderItemCountArgs} args - Arguments to filter OrderItems to count.
     * @example
     * // Count the number of OrderItems
     * const count = await prisma.orderItem.count({
     *   where: {
     *     // ... the filter for the OrderItems we want to count
     *   }
     * })
    **/
    count<T extends OrderItemCountArgs>(
      args?: Subset<T, OrderItemCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], OrderItemCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a OrderItem.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {OrderItemAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends OrderItemAggregateArgs>(args: Subset<T, OrderItemAggregateArgs>): Prisma.PrismaPromise<GetOrderItemAggregateType<T>>

    /**
     * Group by OrderItem.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {OrderItemGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends OrderItemGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: OrderItemGroupByArgs['orderBy'] }
        : { orderBy?: OrderItemGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, OrderItemGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetOrderItemGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the OrderItem model
   */
  readonly fields: OrderItemFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for OrderItem.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__OrderItemClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    order<T extends OrderDefaultArgs<ExtArgs> = {}>(args?: Subset<T, OrderDefaultArgs<ExtArgs>>): Prisma__OrderClient<$Result.GetResult<Prisma.$OrderPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the OrderItem model
   */
  interface OrderItemFieldRefs {
    readonly id: FieldRef<"OrderItem", 'String'>
    readonly orderId: FieldRef<"OrderItem", 'String'>
    readonly productId: FieldRef<"OrderItem", 'String'>
    readonly productName: FieldRef<"OrderItem", 'String'>
    readonly price: FieldRef<"OrderItem", 'Float'>
    readonly quantity: FieldRef<"OrderItem", 'Int'>
    readonly image: FieldRef<"OrderItem", 'String'>
  }
    

  // Custom InputTypes
  /**
   * OrderItem findUnique
   */
  export type OrderItemFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the OrderItem
     */
    select?: OrderItemSelect<ExtArgs> | null
    /**
     * Omit specific fields from the OrderItem
     */
    omit?: OrderItemOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OrderItemInclude<ExtArgs> | null
    /**
     * Filter, which OrderItem to fetch.
     */
    where: OrderItemWhereUniqueInput
  }

  /**
   * OrderItem findUniqueOrThrow
   */
  export type OrderItemFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the OrderItem
     */
    select?: OrderItemSelect<ExtArgs> | null
    /**
     * Omit specific fields from the OrderItem
     */
    omit?: OrderItemOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OrderItemInclude<ExtArgs> | null
    /**
     * Filter, which OrderItem to fetch.
     */
    where: OrderItemWhereUniqueInput
  }

  /**
   * OrderItem findFirst
   */
  export type OrderItemFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the OrderItem
     */
    select?: OrderItemSelect<ExtArgs> | null
    /**
     * Omit specific fields from the OrderItem
     */
    omit?: OrderItemOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OrderItemInclude<ExtArgs> | null
    /**
     * Filter, which OrderItem to fetch.
     */
    where?: OrderItemWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of OrderItems to fetch.
     */
    orderBy?: OrderItemOrderByWithRelationInput | OrderItemOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for OrderItems.
     */
    cursor?: OrderItemWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` OrderItems from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` OrderItems.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of OrderItems.
     */
    distinct?: OrderItemScalarFieldEnum | OrderItemScalarFieldEnum[]
  }

  /**
   * OrderItem findFirstOrThrow
   */
  export type OrderItemFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the OrderItem
     */
    select?: OrderItemSelect<ExtArgs> | null
    /**
     * Omit specific fields from the OrderItem
     */
    omit?: OrderItemOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OrderItemInclude<ExtArgs> | null
    /**
     * Filter, which OrderItem to fetch.
     */
    where?: OrderItemWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of OrderItems to fetch.
     */
    orderBy?: OrderItemOrderByWithRelationInput | OrderItemOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for OrderItems.
     */
    cursor?: OrderItemWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` OrderItems from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` OrderItems.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of OrderItems.
     */
    distinct?: OrderItemScalarFieldEnum | OrderItemScalarFieldEnum[]
  }

  /**
   * OrderItem findMany
   */
  export type OrderItemFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the OrderItem
     */
    select?: OrderItemSelect<ExtArgs> | null
    /**
     * Omit specific fields from the OrderItem
     */
    omit?: OrderItemOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OrderItemInclude<ExtArgs> | null
    /**
     * Filter, which OrderItems to fetch.
     */
    where?: OrderItemWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of OrderItems to fetch.
     */
    orderBy?: OrderItemOrderByWithRelationInput | OrderItemOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing OrderItems.
     */
    cursor?: OrderItemWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` OrderItems from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` OrderItems.
     */
    skip?: number
    distinct?: OrderItemScalarFieldEnum | OrderItemScalarFieldEnum[]
  }

  /**
   * OrderItem create
   */
  export type OrderItemCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the OrderItem
     */
    select?: OrderItemSelect<ExtArgs> | null
    /**
     * Omit specific fields from the OrderItem
     */
    omit?: OrderItemOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OrderItemInclude<ExtArgs> | null
    /**
     * The data needed to create a OrderItem.
     */
    data: XOR<OrderItemCreateInput, OrderItemUncheckedCreateInput>
  }

  /**
   * OrderItem createMany
   */
  export type OrderItemCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many OrderItems.
     */
    data: OrderItemCreateManyInput | OrderItemCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * OrderItem createManyAndReturn
   */
  export type OrderItemCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the OrderItem
     */
    select?: OrderItemSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the OrderItem
     */
    omit?: OrderItemOmit<ExtArgs> | null
    /**
     * The data used to create many OrderItems.
     */
    data: OrderItemCreateManyInput | OrderItemCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OrderItemIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * OrderItem update
   */
  export type OrderItemUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the OrderItem
     */
    select?: OrderItemSelect<ExtArgs> | null
    /**
     * Omit specific fields from the OrderItem
     */
    omit?: OrderItemOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OrderItemInclude<ExtArgs> | null
    /**
     * The data needed to update a OrderItem.
     */
    data: XOR<OrderItemUpdateInput, OrderItemUncheckedUpdateInput>
    /**
     * Choose, which OrderItem to update.
     */
    where: OrderItemWhereUniqueInput
  }

  /**
   * OrderItem updateMany
   */
  export type OrderItemUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update OrderItems.
     */
    data: XOR<OrderItemUpdateManyMutationInput, OrderItemUncheckedUpdateManyInput>
    /**
     * Filter which OrderItems to update
     */
    where?: OrderItemWhereInput
    /**
     * Limit how many OrderItems to update.
     */
    limit?: number
  }

  /**
   * OrderItem updateManyAndReturn
   */
  export type OrderItemUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the OrderItem
     */
    select?: OrderItemSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the OrderItem
     */
    omit?: OrderItemOmit<ExtArgs> | null
    /**
     * The data used to update OrderItems.
     */
    data: XOR<OrderItemUpdateManyMutationInput, OrderItemUncheckedUpdateManyInput>
    /**
     * Filter which OrderItems to update
     */
    where?: OrderItemWhereInput
    /**
     * Limit how many OrderItems to update.
     */
    limit?: number
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OrderItemIncludeUpdateManyAndReturn<ExtArgs> | null
  }

  /**
   * OrderItem upsert
   */
  export type OrderItemUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the OrderItem
     */
    select?: OrderItemSelect<ExtArgs> | null
    /**
     * Omit specific fields from the OrderItem
     */
    omit?: OrderItemOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OrderItemInclude<ExtArgs> | null
    /**
     * The filter to search for the OrderItem to update in case it exists.
     */
    where: OrderItemWhereUniqueInput
    /**
     * In case the OrderItem found by the `where` argument doesn't exist, create a new OrderItem with this data.
     */
    create: XOR<OrderItemCreateInput, OrderItemUncheckedCreateInput>
    /**
     * In case the OrderItem was found with the provided `where` argument, update it with this data.
     */
    update: XOR<OrderItemUpdateInput, OrderItemUncheckedUpdateInput>
  }

  /**
   * OrderItem delete
   */
  export type OrderItemDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the OrderItem
     */
    select?: OrderItemSelect<ExtArgs> | null
    /**
     * Omit specific fields from the OrderItem
     */
    omit?: OrderItemOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OrderItemInclude<ExtArgs> | null
    /**
     * Filter which OrderItem to delete.
     */
    where: OrderItemWhereUniqueInput
  }

  /**
   * OrderItem deleteMany
   */
  export type OrderItemDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which OrderItems to delete
     */
    where?: OrderItemWhereInput
    /**
     * Limit how many OrderItems to delete.
     */
    limit?: number
  }

  /**
   * OrderItem without action
   */
  export type OrderItemDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the OrderItem
     */
    select?: OrderItemSelect<ExtArgs> | null
    /**
     * Omit specific fields from the OrderItem
     */
    omit?: OrderItemOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OrderItemInclude<ExtArgs> | null
  }


  /**
   * Model page_views
   */

  export type AggregatePage_views = {
    _count: Page_viewsCountAggregateOutputType | null
    _avg: Page_viewsAvgAggregateOutputType | null
    _sum: Page_viewsSumAggregateOutputType | null
    _min: Page_viewsMinAggregateOutputType | null
    _max: Page_viewsMaxAggregateOutputType | null
  }

  export type Page_viewsAvgAggregateOutputType = {
    screenHeight: number | null
    screenWidth: number | null
  }

  export type Page_viewsSumAggregateOutputType = {
    screenHeight: number | null
    screenWidth: number | null
  }

  export type Page_viewsMinAggregateOutputType = {
    id: string | null
    page: string | null
    userId: string | null
    userEmail: string | null
    userAgent: string | null
    ipAddress: string | null
    country: string | null
    referrer: string | null
    timestamp: Date | null
    browser: string | null
    deviceType: string | null
    os: string | null
    screenHeight: number | null
    screenWidth: number | null
    city: string | null
  }

  export type Page_viewsMaxAggregateOutputType = {
    id: string | null
    page: string | null
    userId: string | null
    userEmail: string | null
    userAgent: string | null
    ipAddress: string | null
    country: string | null
    referrer: string | null
    timestamp: Date | null
    browser: string | null
    deviceType: string | null
    os: string | null
    screenHeight: number | null
    screenWidth: number | null
    city: string | null
  }

  export type Page_viewsCountAggregateOutputType = {
    id: number
    page: number
    userId: number
    userEmail: number
    userAgent: number
    ipAddress: number
    country: number
    referrer: number
    timestamp: number
    browser: number
    deviceType: number
    os: number
    screenHeight: number
    screenWidth: number
    city: number
    _all: number
  }


  export type Page_viewsAvgAggregateInputType = {
    screenHeight?: true
    screenWidth?: true
  }

  export type Page_viewsSumAggregateInputType = {
    screenHeight?: true
    screenWidth?: true
  }

  export type Page_viewsMinAggregateInputType = {
    id?: true
    page?: true
    userId?: true
    userEmail?: true
    userAgent?: true
    ipAddress?: true
    country?: true
    referrer?: true
    timestamp?: true
    browser?: true
    deviceType?: true
    os?: true
    screenHeight?: true
    screenWidth?: true
    city?: true
  }

  export type Page_viewsMaxAggregateInputType = {
    id?: true
    page?: true
    userId?: true
    userEmail?: true
    userAgent?: true
    ipAddress?: true
    country?: true
    referrer?: true
    timestamp?: true
    browser?: true
    deviceType?: true
    os?: true
    screenHeight?: true
    screenWidth?: true
    city?: true
  }

  export type Page_viewsCountAggregateInputType = {
    id?: true
    page?: true
    userId?: true
    userEmail?: true
    userAgent?: true
    ipAddress?: true
    country?: true
    referrer?: true
    timestamp?: true
    browser?: true
    deviceType?: true
    os?: true
    screenHeight?: true
    screenWidth?: true
    city?: true
    _all?: true
  }

  export type Page_viewsAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which page_views to aggregate.
     */
    where?: page_viewsWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of page_views to fetch.
     */
    orderBy?: page_viewsOrderByWithRelationInput | page_viewsOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: page_viewsWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` page_views from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` page_views.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned page_views
    **/
    _count?: true | Page_viewsCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: Page_viewsAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: Page_viewsSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: Page_viewsMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: Page_viewsMaxAggregateInputType
  }

  export type GetPage_viewsAggregateType<T extends Page_viewsAggregateArgs> = {
        [P in keyof T & keyof AggregatePage_views]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregatePage_views[P]>
      : GetScalarType<T[P], AggregatePage_views[P]>
  }




  export type page_viewsGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: page_viewsWhereInput
    orderBy?: page_viewsOrderByWithAggregationInput | page_viewsOrderByWithAggregationInput[]
    by: Page_viewsScalarFieldEnum[] | Page_viewsScalarFieldEnum
    having?: page_viewsScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: Page_viewsCountAggregateInputType | true
    _avg?: Page_viewsAvgAggregateInputType
    _sum?: Page_viewsSumAggregateInputType
    _min?: Page_viewsMinAggregateInputType
    _max?: Page_viewsMaxAggregateInputType
  }

  export type Page_viewsGroupByOutputType = {
    id: string
    page: string
    userId: string | null
    userEmail: string | null
    userAgent: string | null
    ipAddress: string | null
    country: string | null
    referrer: string | null
    timestamp: Date
    browser: string | null
    deviceType: string | null
    os: string | null
    screenHeight: number | null
    screenWidth: number | null
    city: string | null
    _count: Page_viewsCountAggregateOutputType | null
    _avg: Page_viewsAvgAggregateOutputType | null
    _sum: Page_viewsSumAggregateOutputType | null
    _min: Page_viewsMinAggregateOutputType | null
    _max: Page_viewsMaxAggregateOutputType | null
  }

  type GetPage_viewsGroupByPayload<T extends page_viewsGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<Page_viewsGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof Page_viewsGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], Page_viewsGroupByOutputType[P]>
            : GetScalarType<T[P], Page_viewsGroupByOutputType[P]>
        }
      >
    >


  export type page_viewsSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    page?: boolean
    userId?: boolean
    userEmail?: boolean
    userAgent?: boolean
    ipAddress?: boolean
    country?: boolean
    referrer?: boolean
    timestamp?: boolean
    browser?: boolean
    deviceType?: boolean
    os?: boolean
    screenHeight?: boolean
    screenWidth?: boolean
    city?: boolean
  }, ExtArgs["result"]["page_views"]>

  export type page_viewsSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    page?: boolean
    userId?: boolean
    userEmail?: boolean
    userAgent?: boolean
    ipAddress?: boolean
    country?: boolean
    referrer?: boolean
    timestamp?: boolean
    browser?: boolean
    deviceType?: boolean
    os?: boolean
    screenHeight?: boolean
    screenWidth?: boolean
    city?: boolean
  }, ExtArgs["result"]["page_views"]>

  export type page_viewsSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    page?: boolean
    userId?: boolean
    userEmail?: boolean
    userAgent?: boolean
    ipAddress?: boolean
    country?: boolean
    referrer?: boolean
    timestamp?: boolean
    browser?: boolean
    deviceType?: boolean
    os?: boolean
    screenHeight?: boolean
    screenWidth?: boolean
    city?: boolean
  }, ExtArgs["result"]["page_views"]>

  export type page_viewsSelectScalar = {
    id?: boolean
    page?: boolean
    userId?: boolean
    userEmail?: boolean
    userAgent?: boolean
    ipAddress?: boolean
    country?: boolean
    referrer?: boolean
    timestamp?: boolean
    browser?: boolean
    deviceType?: boolean
    os?: boolean
    screenHeight?: boolean
    screenWidth?: boolean
    city?: boolean
  }

  export type page_viewsOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "page" | "userId" | "userEmail" | "userAgent" | "ipAddress" | "country" | "referrer" | "timestamp" | "browser" | "deviceType" | "os" | "screenHeight" | "screenWidth" | "city", ExtArgs["result"]["page_views"]>

  export type $page_viewsPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "page_views"
    objects: {}
    scalars: $Extensions.GetPayloadResult<{
      id: string
      page: string
      userId: string | null
      userEmail: string | null
      userAgent: string | null
      ipAddress: string | null
      country: string | null
      referrer: string | null
      timestamp: Date
      browser: string | null
      deviceType: string | null
      os: string | null
      screenHeight: number | null
      screenWidth: number | null
      city: string | null
    }, ExtArgs["result"]["page_views"]>
    composites: {}
  }

  type page_viewsGetPayload<S extends boolean | null | undefined | page_viewsDefaultArgs> = $Result.GetResult<Prisma.$page_viewsPayload, S>

  type page_viewsCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<page_viewsFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: Page_viewsCountAggregateInputType | true
    }

  export interface page_viewsDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['page_views'], meta: { name: 'page_views' } }
    /**
     * Find zero or one Page_views that matches the filter.
     * @param {page_viewsFindUniqueArgs} args - Arguments to find a Page_views
     * @example
     * // Get one Page_views
     * const page_views = await prisma.page_views.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends page_viewsFindUniqueArgs>(args: SelectSubset<T, page_viewsFindUniqueArgs<ExtArgs>>): Prisma__page_viewsClient<$Result.GetResult<Prisma.$page_viewsPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one Page_views that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {page_viewsFindUniqueOrThrowArgs} args - Arguments to find a Page_views
     * @example
     * // Get one Page_views
     * const page_views = await prisma.page_views.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends page_viewsFindUniqueOrThrowArgs>(args: SelectSubset<T, page_viewsFindUniqueOrThrowArgs<ExtArgs>>): Prisma__page_viewsClient<$Result.GetResult<Prisma.$page_viewsPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Page_views that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {page_viewsFindFirstArgs} args - Arguments to find a Page_views
     * @example
     * // Get one Page_views
     * const page_views = await prisma.page_views.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends page_viewsFindFirstArgs>(args?: SelectSubset<T, page_viewsFindFirstArgs<ExtArgs>>): Prisma__page_viewsClient<$Result.GetResult<Prisma.$page_viewsPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Page_views that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {page_viewsFindFirstOrThrowArgs} args - Arguments to find a Page_views
     * @example
     * // Get one Page_views
     * const page_views = await prisma.page_views.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends page_viewsFindFirstOrThrowArgs>(args?: SelectSubset<T, page_viewsFindFirstOrThrowArgs<ExtArgs>>): Prisma__page_viewsClient<$Result.GetResult<Prisma.$page_viewsPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more Page_views that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {page_viewsFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Page_views
     * const page_views = await prisma.page_views.findMany()
     * 
     * // Get first 10 Page_views
     * const page_views = await prisma.page_views.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const page_viewsWithIdOnly = await prisma.page_views.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends page_viewsFindManyArgs>(args?: SelectSubset<T, page_viewsFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$page_viewsPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a Page_views.
     * @param {page_viewsCreateArgs} args - Arguments to create a Page_views.
     * @example
     * // Create one Page_views
     * const Page_views = await prisma.page_views.create({
     *   data: {
     *     // ... data to create a Page_views
     *   }
     * })
     * 
     */
    create<T extends page_viewsCreateArgs>(args: SelectSubset<T, page_viewsCreateArgs<ExtArgs>>): Prisma__page_viewsClient<$Result.GetResult<Prisma.$page_viewsPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many Page_views.
     * @param {page_viewsCreateManyArgs} args - Arguments to create many Page_views.
     * @example
     * // Create many Page_views
     * const page_views = await prisma.page_views.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends page_viewsCreateManyArgs>(args?: SelectSubset<T, page_viewsCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Page_views and returns the data saved in the database.
     * @param {page_viewsCreateManyAndReturnArgs} args - Arguments to create many Page_views.
     * @example
     * // Create many Page_views
     * const page_views = await prisma.page_views.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Page_views and only return the `id`
     * const page_viewsWithIdOnly = await prisma.page_views.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends page_viewsCreateManyAndReturnArgs>(args?: SelectSubset<T, page_viewsCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$page_viewsPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a Page_views.
     * @param {page_viewsDeleteArgs} args - Arguments to delete one Page_views.
     * @example
     * // Delete one Page_views
     * const Page_views = await prisma.page_views.delete({
     *   where: {
     *     // ... filter to delete one Page_views
     *   }
     * })
     * 
     */
    delete<T extends page_viewsDeleteArgs>(args: SelectSubset<T, page_viewsDeleteArgs<ExtArgs>>): Prisma__page_viewsClient<$Result.GetResult<Prisma.$page_viewsPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one Page_views.
     * @param {page_viewsUpdateArgs} args - Arguments to update one Page_views.
     * @example
     * // Update one Page_views
     * const page_views = await prisma.page_views.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends page_viewsUpdateArgs>(args: SelectSubset<T, page_viewsUpdateArgs<ExtArgs>>): Prisma__page_viewsClient<$Result.GetResult<Prisma.$page_viewsPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more Page_views.
     * @param {page_viewsDeleteManyArgs} args - Arguments to filter Page_views to delete.
     * @example
     * // Delete a few Page_views
     * const { count } = await prisma.page_views.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends page_viewsDeleteManyArgs>(args?: SelectSubset<T, page_viewsDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Page_views.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {page_viewsUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Page_views
     * const page_views = await prisma.page_views.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends page_viewsUpdateManyArgs>(args: SelectSubset<T, page_viewsUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Page_views and returns the data updated in the database.
     * @param {page_viewsUpdateManyAndReturnArgs} args - Arguments to update many Page_views.
     * @example
     * // Update many Page_views
     * const page_views = await prisma.page_views.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more Page_views and only return the `id`
     * const page_viewsWithIdOnly = await prisma.page_views.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends page_viewsUpdateManyAndReturnArgs>(args: SelectSubset<T, page_viewsUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$page_viewsPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one Page_views.
     * @param {page_viewsUpsertArgs} args - Arguments to update or create a Page_views.
     * @example
     * // Update or create a Page_views
     * const page_views = await prisma.page_views.upsert({
     *   create: {
     *     // ... data to create a Page_views
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Page_views we want to update
     *   }
     * })
     */
    upsert<T extends page_viewsUpsertArgs>(args: SelectSubset<T, page_viewsUpsertArgs<ExtArgs>>): Prisma__page_viewsClient<$Result.GetResult<Prisma.$page_viewsPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of Page_views.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {page_viewsCountArgs} args - Arguments to filter Page_views to count.
     * @example
     * // Count the number of Page_views
     * const count = await prisma.page_views.count({
     *   where: {
     *     // ... the filter for the Page_views we want to count
     *   }
     * })
    **/
    count<T extends page_viewsCountArgs>(
      args?: Subset<T, page_viewsCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], Page_viewsCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Page_views.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {Page_viewsAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends Page_viewsAggregateArgs>(args: Subset<T, Page_viewsAggregateArgs>): Prisma.PrismaPromise<GetPage_viewsAggregateType<T>>

    /**
     * Group by Page_views.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {page_viewsGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends page_viewsGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: page_viewsGroupByArgs['orderBy'] }
        : { orderBy?: page_viewsGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, page_viewsGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetPage_viewsGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the page_views model
   */
  readonly fields: page_viewsFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for page_views.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__page_viewsClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the page_views model
   */
  interface page_viewsFieldRefs {
    readonly id: FieldRef<"page_views", 'String'>
    readonly page: FieldRef<"page_views", 'String'>
    readonly userId: FieldRef<"page_views", 'String'>
    readonly userEmail: FieldRef<"page_views", 'String'>
    readonly userAgent: FieldRef<"page_views", 'String'>
    readonly ipAddress: FieldRef<"page_views", 'String'>
    readonly country: FieldRef<"page_views", 'String'>
    readonly referrer: FieldRef<"page_views", 'String'>
    readonly timestamp: FieldRef<"page_views", 'DateTime'>
    readonly browser: FieldRef<"page_views", 'String'>
    readonly deviceType: FieldRef<"page_views", 'String'>
    readonly os: FieldRef<"page_views", 'String'>
    readonly screenHeight: FieldRef<"page_views", 'Int'>
    readonly screenWidth: FieldRef<"page_views", 'Int'>
    readonly city: FieldRef<"page_views", 'String'>
  }
    

  // Custom InputTypes
  /**
   * page_views findUnique
   */
  export type page_viewsFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the page_views
     */
    select?: page_viewsSelect<ExtArgs> | null
    /**
     * Omit specific fields from the page_views
     */
    omit?: page_viewsOmit<ExtArgs> | null
    /**
     * Filter, which page_views to fetch.
     */
    where: page_viewsWhereUniqueInput
  }

  /**
   * page_views findUniqueOrThrow
   */
  export type page_viewsFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the page_views
     */
    select?: page_viewsSelect<ExtArgs> | null
    /**
     * Omit specific fields from the page_views
     */
    omit?: page_viewsOmit<ExtArgs> | null
    /**
     * Filter, which page_views to fetch.
     */
    where: page_viewsWhereUniqueInput
  }

  /**
   * page_views findFirst
   */
  export type page_viewsFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the page_views
     */
    select?: page_viewsSelect<ExtArgs> | null
    /**
     * Omit specific fields from the page_views
     */
    omit?: page_viewsOmit<ExtArgs> | null
    /**
     * Filter, which page_views to fetch.
     */
    where?: page_viewsWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of page_views to fetch.
     */
    orderBy?: page_viewsOrderByWithRelationInput | page_viewsOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for page_views.
     */
    cursor?: page_viewsWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` page_views from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` page_views.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of page_views.
     */
    distinct?: Page_viewsScalarFieldEnum | Page_viewsScalarFieldEnum[]
  }

  /**
   * page_views findFirstOrThrow
   */
  export type page_viewsFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the page_views
     */
    select?: page_viewsSelect<ExtArgs> | null
    /**
     * Omit specific fields from the page_views
     */
    omit?: page_viewsOmit<ExtArgs> | null
    /**
     * Filter, which page_views to fetch.
     */
    where?: page_viewsWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of page_views to fetch.
     */
    orderBy?: page_viewsOrderByWithRelationInput | page_viewsOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for page_views.
     */
    cursor?: page_viewsWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` page_views from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` page_views.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of page_views.
     */
    distinct?: Page_viewsScalarFieldEnum | Page_viewsScalarFieldEnum[]
  }

  /**
   * page_views findMany
   */
  export type page_viewsFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the page_views
     */
    select?: page_viewsSelect<ExtArgs> | null
    /**
     * Omit specific fields from the page_views
     */
    omit?: page_viewsOmit<ExtArgs> | null
    /**
     * Filter, which page_views to fetch.
     */
    where?: page_viewsWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of page_views to fetch.
     */
    orderBy?: page_viewsOrderByWithRelationInput | page_viewsOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing page_views.
     */
    cursor?: page_viewsWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` page_views from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` page_views.
     */
    skip?: number
    distinct?: Page_viewsScalarFieldEnum | Page_viewsScalarFieldEnum[]
  }

  /**
   * page_views create
   */
  export type page_viewsCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the page_views
     */
    select?: page_viewsSelect<ExtArgs> | null
    /**
     * Omit specific fields from the page_views
     */
    omit?: page_viewsOmit<ExtArgs> | null
    /**
     * The data needed to create a page_views.
     */
    data: XOR<page_viewsCreateInput, page_viewsUncheckedCreateInput>
  }

  /**
   * page_views createMany
   */
  export type page_viewsCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many page_views.
     */
    data: page_viewsCreateManyInput | page_viewsCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * page_views createManyAndReturn
   */
  export type page_viewsCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the page_views
     */
    select?: page_viewsSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the page_views
     */
    omit?: page_viewsOmit<ExtArgs> | null
    /**
     * The data used to create many page_views.
     */
    data: page_viewsCreateManyInput | page_viewsCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * page_views update
   */
  export type page_viewsUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the page_views
     */
    select?: page_viewsSelect<ExtArgs> | null
    /**
     * Omit specific fields from the page_views
     */
    omit?: page_viewsOmit<ExtArgs> | null
    /**
     * The data needed to update a page_views.
     */
    data: XOR<page_viewsUpdateInput, page_viewsUncheckedUpdateInput>
    /**
     * Choose, which page_views to update.
     */
    where: page_viewsWhereUniqueInput
  }

  /**
   * page_views updateMany
   */
  export type page_viewsUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update page_views.
     */
    data: XOR<page_viewsUpdateManyMutationInput, page_viewsUncheckedUpdateManyInput>
    /**
     * Filter which page_views to update
     */
    where?: page_viewsWhereInput
    /**
     * Limit how many page_views to update.
     */
    limit?: number
  }

  /**
   * page_views updateManyAndReturn
   */
  export type page_viewsUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the page_views
     */
    select?: page_viewsSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the page_views
     */
    omit?: page_viewsOmit<ExtArgs> | null
    /**
     * The data used to update page_views.
     */
    data: XOR<page_viewsUpdateManyMutationInput, page_viewsUncheckedUpdateManyInput>
    /**
     * Filter which page_views to update
     */
    where?: page_viewsWhereInput
    /**
     * Limit how many page_views to update.
     */
    limit?: number
  }

  /**
   * page_views upsert
   */
  export type page_viewsUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the page_views
     */
    select?: page_viewsSelect<ExtArgs> | null
    /**
     * Omit specific fields from the page_views
     */
    omit?: page_viewsOmit<ExtArgs> | null
    /**
     * The filter to search for the page_views to update in case it exists.
     */
    where: page_viewsWhereUniqueInput
    /**
     * In case the page_views found by the `where` argument doesn't exist, create a new page_views with this data.
     */
    create: XOR<page_viewsCreateInput, page_viewsUncheckedCreateInput>
    /**
     * In case the page_views was found with the provided `where` argument, update it with this data.
     */
    update: XOR<page_viewsUpdateInput, page_viewsUncheckedUpdateInput>
  }

  /**
   * page_views delete
   */
  export type page_viewsDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the page_views
     */
    select?: page_viewsSelect<ExtArgs> | null
    /**
     * Omit specific fields from the page_views
     */
    omit?: page_viewsOmit<ExtArgs> | null
    /**
     * Filter which page_views to delete.
     */
    where: page_viewsWhereUniqueInput
  }

  /**
   * page_views deleteMany
   */
  export type page_viewsDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which page_views to delete
     */
    where?: page_viewsWhereInput
    /**
     * Limit how many page_views to delete.
     */
    limit?: number
  }

  /**
   * page_views without action
   */
  export type page_viewsDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the page_views
     */
    select?: page_viewsSelect<ExtArgs> | null
    /**
     * Omit specific fields from the page_views
     */
    omit?: page_viewsOmit<ExtArgs> | null
  }


  /**
   * Model pdf_downloads
   */

  export type AggregatePdf_downloads = {
    _count: Pdf_downloadsCountAggregateOutputType | null
    _min: Pdf_downloadsMinAggregateOutputType | null
    _max: Pdf_downloadsMaxAggregateOutputType | null
  }

  export type Pdf_downloadsMinAggregateOutputType = {
    id: string | null
    filename: string | null
    userId: string | null
    userEmail: string | null
    ipAddress: string | null
    userAgent: string | null
    country: string | null
    city: string | null
    deviceType: string | null
    browser: string | null
    os: string | null
    referrer: string | null
    timestamp: Date | null
  }

  export type Pdf_downloadsMaxAggregateOutputType = {
    id: string | null
    filename: string | null
    userId: string | null
    userEmail: string | null
    ipAddress: string | null
    userAgent: string | null
    country: string | null
    city: string | null
    deviceType: string | null
    browser: string | null
    os: string | null
    referrer: string | null
    timestamp: Date | null
  }

  export type Pdf_downloadsCountAggregateOutputType = {
    id: number
    filename: number
    userId: number
    userEmail: number
    ipAddress: number
    userAgent: number
    country: number
    city: number
    deviceType: number
    browser: number
    os: number
    referrer: number
    timestamp: number
    _all: number
  }


  export type Pdf_downloadsMinAggregateInputType = {
    id?: true
    filename?: true
    userId?: true
    userEmail?: true
    ipAddress?: true
    userAgent?: true
    country?: true
    city?: true
    deviceType?: true
    browser?: true
    os?: true
    referrer?: true
    timestamp?: true
  }

  export type Pdf_downloadsMaxAggregateInputType = {
    id?: true
    filename?: true
    userId?: true
    userEmail?: true
    ipAddress?: true
    userAgent?: true
    country?: true
    city?: true
    deviceType?: true
    browser?: true
    os?: true
    referrer?: true
    timestamp?: true
  }

  export type Pdf_downloadsCountAggregateInputType = {
    id?: true
    filename?: true
    userId?: true
    userEmail?: true
    ipAddress?: true
    userAgent?: true
    country?: true
    city?: true
    deviceType?: true
    browser?: true
    os?: true
    referrer?: true
    timestamp?: true
    _all?: true
  }

  export type Pdf_downloadsAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which pdf_downloads to aggregate.
     */
    where?: pdf_downloadsWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of pdf_downloads to fetch.
     */
    orderBy?: pdf_downloadsOrderByWithRelationInput | pdf_downloadsOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: pdf_downloadsWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` pdf_downloads from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` pdf_downloads.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned pdf_downloads
    **/
    _count?: true | Pdf_downloadsCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: Pdf_downloadsMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: Pdf_downloadsMaxAggregateInputType
  }

  export type GetPdf_downloadsAggregateType<T extends Pdf_downloadsAggregateArgs> = {
        [P in keyof T & keyof AggregatePdf_downloads]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregatePdf_downloads[P]>
      : GetScalarType<T[P], AggregatePdf_downloads[P]>
  }




  export type pdf_downloadsGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: pdf_downloadsWhereInput
    orderBy?: pdf_downloadsOrderByWithAggregationInput | pdf_downloadsOrderByWithAggregationInput[]
    by: Pdf_downloadsScalarFieldEnum[] | Pdf_downloadsScalarFieldEnum
    having?: pdf_downloadsScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: Pdf_downloadsCountAggregateInputType | true
    _min?: Pdf_downloadsMinAggregateInputType
    _max?: Pdf_downloadsMaxAggregateInputType
  }

  export type Pdf_downloadsGroupByOutputType = {
    id: string
    filename: string
    userId: string | null
    userEmail: string | null
    ipAddress: string | null
    userAgent: string | null
    country: string | null
    city: string | null
    deviceType: string | null
    browser: string | null
    os: string | null
    referrer: string | null
    timestamp: Date
    _count: Pdf_downloadsCountAggregateOutputType | null
    _min: Pdf_downloadsMinAggregateOutputType | null
    _max: Pdf_downloadsMaxAggregateOutputType | null
  }

  type GetPdf_downloadsGroupByPayload<T extends pdf_downloadsGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<Pdf_downloadsGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof Pdf_downloadsGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], Pdf_downloadsGroupByOutputType[P]>
            : GetScalarType<T[P], Pdf_downloadsGroupByOutputType[P]>
        }
      >
    >


  export type pdf_downloadsSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    filename?: boolean
    userId?: boolean
    userEmail?: boolean
    ipAddress?: boolean
    userAgent?: boolean
    country?: boolean
    city?: boolean
    deviceType?: boolean
    browser?: boolean
    os?: boolean
    referrer?: boolean
    timestamp?: boolean
  }, ExtArgs["result"]["pdf_downloads"]>

  export type pdf_downloadsSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    filename?: boolean
    userId?: boolean
    userEmail?: boolean
    ipAddress?: boolean
    userAgent?: boolean
    country?: boolean
    city?: boolean
    deviceType?: boolean
    browser?: boolean
    os?: boolean
    referrer?: boolean
    timestamp?: boolean
  }, ExtArgs["result"]["pdf_downloads"]>

  export type pdf_downloadsSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    filename?: boolean
    userId?: boolean
    userEmail?: boolean
    ipAddress?: boolean
    userAgent?: boolean
    country?: boolean
    city?: boolean
    deviceType?: boolean
    browser?: boolean
    os?: boolean
    referrer?: boolean
    timestamp?: boolean
  }, ExtArgs["result"]["pdf_downloads"]>

  export type pdf_downloadsSelectScalar = {
    id?: boolean
    filename?: boolean
    userId?: boolean
    userEmail?: boolean
    ipAddress?: boolean
    userAgent?: boolean
    country?: boolean
    city?: boolean
    deviceType?: boolean
    browser?: boolean
    os?: boolean
    referrer?: boolean
    timestamp?: boolean
  }

  export type pdf_downloadsOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "filename" | "userId" | "userEmail" | "ipAddress" | "userAgent" | "country" | "city" | "deviceType" | "browser" | "os" | "referrer" | "timestamp", ExtArgs["result"]["pdf_downloads"]>

  export type $pdf_downloadsPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "pdf_downloads"
    objects: {}
    scalars: $Extensions.GetPayloadResult<{
      id: string
      filename: string
      userId: string | null
      userEmail: string | null
      ipAddress: string | null
      userAgent: string | null
      country: string | null
      city: string | null
      deviceType: string | null
      browser: string | null
      os: string | null
      referrer: string | null
      timestamp: Date
    }, ExtArgs["result"]["pdf_downloads"]>
    composites: {}
  }

  type pdf_downloadsGetPayload<S extends boolean | null | undefined | pdf_downloadsDefaultArgs> = $Result.GetResult<Prisma.$pdf_downloadsPayload, S>

  type pdf_downloadsCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<pdf_downloadsFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: Pdf_downloadsCountAggregateInputType | true
    }

  export interface pdf_downloadsDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['pdf_downloads'], meta: { name: 'pdf_downloads' } }
    /**
     * Find zero or one Pdf_downloads that matches the filter.
     * @param {pdf_downloadsFindUniqueArgs} args - Arguments to find a Pdf_downloads
     * @example
     * // Get one Pdf_downloads
     * const pdf_downloads = await prisma.pdf_downloads.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends pdf_downloadsFindUniqueArgs>(args: SelectSubset<T, pdf_downloadsFindUniqueArgs<ExtArgs>>): Prisma__pdf_downloadsClient<$Result.GetResult<Prisma.$pdf_downloadsPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one Pdf_downloads that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {pdf_downloadsFindUniqueOrThrowArgs} args - Arguments to find a Pdf_downloads
     * @example
     * // Get one Pdf_downloads
     * const pdf_downloads = await prisma.pdf_downloads.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends pdf_downloadsFindUniqueOrThrowArgs>(args: SelectSubset<T, pdf_downloadsFindUniqueOrThrowArgs<ExtArgs>>): Prisma__pdf_downloadsClient<$Result.GetResult<Prisma.$pdf_downloadsPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Pdf_downloads that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {pdf_downloadsFindFirstArgs} args - Arguments to find a Pdf_downloads
     * @example
     * // Get one Pdf_downloads
     * const pdf_downloads = await prisma.pdf_downloads.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends pdf_downloadsFindFirstArgs>(args?: SelectSubset<T, pdf_downloadsFindFirstArgs<ExtArgs>>): Prisma__pdf_downloadsClient<$Result.GetResult<Prisma.$pdf_downloadsPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Pdf_downloads that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {pdf_downloadsFindFirstOrThrowArgs} args - Arguments to find a Pdf_downloads
     * @example
     * // Get one Pdf_downloads
     * const pdf_downloads = await prisma.pdf_downloads.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends pdf_downloadsFindFirstOrThrowArgs>(args?: SelectSubset<T, pdf_downloadsFindFirstOrThrowArgs<ExtArgs>>): Prisma__pdf_downloadsClient<$Result.GetResult<Prisma.$pdf_downloadsPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more Pdf_downloads that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {pdf_downloadsFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Pdf_downloads
     * const pdf_downloads = await prisma.pdf_downloads.findMany()
     * 
     * // Get first 10 Pdf_downloads
     * const pdf_downloads = await prisma.pdf_downloads.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const pdf_downloadsWithIdOnly = await prisma.pdf_downloads.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends pdf_downloadsFindManyArgs>(args?: SelectSubset<T, pdf_downloadsFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$pdf_downloadsPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a Pdf_downloads.
     * @param {pdf_downloadsCreateArgs} args - Arguments to create a Pdf_downloads.
     * @example
     * // Create one Pdf_downloads
     * const Pdf_downloads = await prisma.pdf_downloads.create({
     *   data: {
     *     // ... data to create a Pdf_downloads
     *   }
     * })
     * 
     */
    create<T extends pdf_downloadsCreateArgs>(args: SelectSubset<T, pdf_downloadsCreateArgs<ExtArgs>>): Prisma__pdf_downloadsClient<$Result.GetResult<Prisma.$pdf_downloadsPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many Pdf_downloads.
     * @param {pdf_downloadsCreateManyArgs} args - Arguments to create many Pdf_downloads.
     * @example
     * // Create many Pdf_downloads
     * const pdf_downloads = await prisma.pdf_downloads.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends pdf_downloadsCreateManyArgs>(args?: SelectSubset<T, pdf_downloadsCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Pdf_downloads and returns the data saved in the database.
     * @param {pdf_downloadsCreateManyAndReturnArgs} args - Arguments to create many Pdf_downloads.
     * @example
     * // Create many Pdf_downloads
     * const pdf_downloads = await prisma.pdf_downloads.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Pdf_downloads and only return the `id`
     * const pdf_downloadsWithIdOnly = await prisma.pdf_downloads.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends pdf_downloadsCreateManyAndReturnArgs>(args?: SelectSubset<T, pdf_downloadsCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$pdf_downloadsPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a Pdf_downloads.
     * @param {pdf_downloadsDeleteArgs} args - Arguments to delete one Pdf_downloads.
     * @example
     * // Delete one Pdf_downloads
     * const Pdf_downloads = await prisma.pdf_downloads.delete({
     *   where: {
     *     // ... filter to delete one Pdf_downloads
     *   }
     * })
     * 
     */
    delete<T extends pdf_downloadsDeleteArgs>(args: SelectSubset<T, pdf_downloadsDeleteArgs<ExtArgs>>): Prisma__pdf_downloadsClient<$Result.GetResult<Prisma.$pdf_downloadsPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one Pdf_downloads.
     * @param {pdf_downloadsUpdateArgs} args - Arguments to update one Pdf_downloads.
     * @example
     * // Update one Pdf_downloads
     * const pdf_downloads = await prisma.pdf_downloads.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends pdf_downloadsUpdateArgs>(args: SelectSubset<T, pdf_downloadsUpdateArgs<ExtArgs>>): Prisma__pdf_downloadsClient<$Result.GetResult<Prisma.$pdf_downloadsPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more Pdf_downloads.
     * @param {pdf_downloadsDeleteManyArgs} args - Arguments to filter Pdf_downloads to delete.
     * @example
     * // Delete a few Pdf_downloads
     * const { count } = await prisma.pdf_downloads.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends pdf_downloadsDeleteManyArgs>(args?: SelectSubset<T, pdf_downloadsDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Pdf_downloads.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {pdf_downloadsUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Pdf_downloads
     * const pdf_downloads = await prisma.pdf_downloads.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends pdf_downloadsUpdateManyArgs>(args: SelectSubset<T, pdf_downloadsUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Pdf_downloads and returns the data updated in the database.
     * @param {pdf_downloadsUpdateManyAndReturnArgs} args - Arguments to update many Pdf_downloads.
     * @example
     * // Update many Pdf_downloads
     * const pdf_downloads = await prisma.pdf_downloads.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more Pdf_downloads and only return the `id`
     * const pdf_downloadsWithIdOnly = await prisma.pdf_downloads.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends pdf_downloadsUpdateManyAndReturnArgs>(args: SelectSubset<T, pdf_downloadsUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$pdf_downloadsPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one Pdf_downloads.
     * @param {pdf_downloadsUpsertArgs} args - Arguments to update or create a Pdf_downloads.
     * @example
     * // Update or create a Pdf_downloads
     * const pdf_downloads = await prisma.pdf_downloads.upsert({
     *   create: {
     *     // ... data to create a Pdf_downloads
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Pdf_downloads we want to update
     *   }
     * })
     */
    upsert<T extends pdf_downloadsUpsertArgs>(args: SelectSubset<T, pdf_downloadsUpsertArgs<ExtArgs>>): Prisma__pdf_downloadsClient<$Result.GetResult<Prisma.$pdf_downloadsPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of Pdf_downloads.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {pdf_downloadsCountArgs} args - Arguments to filter Pdf_downloads to count.
     * @example
     * // Count the number of Pdf_downloads
     * const count = await prisma.pdf_downloads.count({
     *   where: {
     *     // ... the filter for the Pdf_downloads we want to count
     *   }
     * })
    **/
    count<T extends pdf_downloadsCountArgs>(
      args?: Subset<T, pdf_downloadsCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], Pdf_downloadsCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Pdf_downloads.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {Pdf_downloadsAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends Pdf_downloadsAggregateArgs>(args: Subset<T, Pdf_downloadsAggregateArgs>): Prisma.PrismaPromise<GetPdf_downloadsAggregateType<T>>

    /**
     * Group by Pdf_downloads.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {pdf_downloadsGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends pdf_downloadsGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: pdf_downloadsGroupByArgs['orderBy'] }
        : { orderBy?: pdf_downloadsGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, pdf_downloadsGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetPdf_downloadsGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the pdf_downloads model
   */
  readonly fields: pdf_downloadsFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for pdf_downloads.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__pdf_downloadsClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the pdf_downloads model
   */
  interface pdf_downloadsFieldRefs {
    readonly id: FieldRef<"pdf_downloads", 'String'>
    readonly filename: FieldRef<"pdf_downloads", 'String'>
    readonly userId: FieldRef<"pdf_downloads", 'String'>
    readonly userEmail: FieldRef<"pdf_downloads", 'String'>
    readonly ipAddress: FieldRef<"pdf_downloads", 'String'>
    readonly userAgent: FieldRef<"pdf_downloads", 'String'>
    readonly country: FieldRef<"pdf_downloads", 'String'>
    readonly city: FieldRef<"pdf_downloads", 'String'>
    readonly deviceType: FieldRef<"pdf_downloads", 'String'>
    readonly browser: FieldRef<"pdf_downloads", 'String'>
    readonly os: FieldRef<"pdf_downloads", 'String'>
    readonly referrer: FieldRef<"pdf_downloads", 'String'>
    readonly timestamp: FieldRef<"pdf_downloads", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * pdf_downloads findUnique
   */
  export type pdf_downloadsFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the pdf_downloads
     */
    select?: pdf_downloadsSelect<ExtArgs> | null
    /**
     * Omit specific fields from the pdf_downloads
     */
    omit?: pdf_downloadsOmit<ExtArgs> | null
    /**
     * Filter, which pdf_downloads to fetch.
     */
    where: pdf_downloadsWhereUniqueInput
  }

  /**
   * pdf_downloads findUniqueOrThrow
   */
  export type pdf_downloadsFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the pdf_downloads
     */
    select?: pdf_downloadsSelect<ExtArgs> | null
    /**
     * Omit specific fields from the pdf_downloads
     */
    omit?: pdf_downloadsOmit<ExtArgs> | null
    /**
     * Filter, which pdf_downloads to fetch.
     */
    where: pdf_downloadsWhereUniqueInput
  }

  /**
   * pdf_downloads findFirst
   */
  export type pdf_downloadsFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the pdf_downloads
     */
    select?: pdf_downloadsSelect<ExtArgs> | null
    /**
     * Omit specific fields from the pdf_downloads
     */
    omit?: pdf_downloadsOmit<ExtArgs> | null
    /**
     * Filter, which pdf_downloads to fetch.
     */
    where?: pdf_downloadsWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of pdf_downloads to fetch.
     */
    orderBy?: pdf_downloadsOrderByWithRelationInput | pdf_downloadsOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for pdf_downloads.
     */
    cursor?: pdf_downloadsWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` pdf_downloads from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` pdf_downloads.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of pdf_downloads.
     */
    distinct?: Pdf_downloadsScalarFieldEnum | Pdf_downloadsScalarFieldEnum[]
  }

  /**
   * pdf_downloads findFirstOrThrow
   */
  export type pdf_downloadsFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the pdf_downloads
     */
    select?: pdf_downloadsSelect<ExtArgs> | null
    /**
     * Omit specific fields from the pdf_downloads
     */
    omit?: pdf_downloadsOmit<ExtArgs> | null
    /**
     * Filter, which pdf_downloads to fetch.
     */
    where?: pdf_downloadsWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of pdf_downloads to fetch.
     */
    orderBy?: pdf_downloadsOrderByWithRelationInput | pdf_downloadsOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for pdf_downloads.
     */
    cursor?: pdf_downloadsWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` pdf_downloads from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` pdf_downloads.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of pdf_downloads.
     */
    distinct?: Pdf_downloadsScalarFieldEnum | Pdf_downloadsScalarFieldEnum[]
  }

  /**
   * pdf_downloads findMany
   */
  export type pdf_downloadsFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the pdf_downloads
     */
    select?: pdf_downloadsSelect<ExtArgs> | null
    /**
     * Omit specific fields from the pdf_downloads
     */
    omit?: pdf_downloadsOmit<ExtArgs> | null
    /**
     * Filter, which pdf_downloads to fetch.
     */
    where?: pdf_downloadsWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of pdf_downloads to fetch.
     */
    orderBy?: pdf_downloadsOrderByWithRelationInput | pdf_downloadsOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing pdf_downloads.
     */
    cursor?: pdf_downloadsWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` pdf_downloads from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` pdf_downloads.
     */
    skip?: number
    distinct?: Pdf_downloadsScalarFieldEnum | Pdf_downloadsScalarFieldEnum[]
  }

  /**
   * pdf_downloads create
   */
  export type pdf_downloadsCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the pdf_downloads
     */
    select?: pdf_downloadsSelect<ExtArgs> | null
    /**
     * Omit specific fields from the pdf_downloads
     */
    omit?: pdf_downloadsOmit<ExtArgs> | null
    /**
     * The data needed to create a pdf_downloads.
     */
    data: XOR<pdf_downloadsCreateInput, pdf_downloadsUncheckedCreateInput>
  }

  /**
   * pdf_downloads createMany
   */
  export type pdf_downloadsCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many pdf_downloads.
     */
    data: pdf_downloadsCreateManyInput | pdf_downloadsCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * pdf_downloads createManyAndReturn
   */
  export type pdf_downloadsCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the pdf_downloads
     */
    select?: pdf_downloadsSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the pdf_downloads
     */
    omit?: pdf_downloadsOmit<ExtArgs> | null
    /**
     * The data used to create many pdf_downloads.
     */
    data: pdf_downloadsCreateManyInput | pdf_downloadsCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * pdf_downloads update
   */
  export type pdf_downloadsUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the pdf_downloads
     */
    select?: pdf_downloadsSelect<ExtArgs> | null
    /**
     * Omit specific fields from the pdf_downloads
     */
    omit?: pdf_downloadsOmit<ExtArgs> | null
    /**
     * The data needed to update a pdf_downloads.
     */
    data: XOR<pdf_downloadsUpdateInput, pdf_downloadsUncheckedUpdateInput>
    /**
     * Choose, which pdf_downloads to update.
     */
    where: pdf_downloadsWhereUniqueInput
  }

  /**
   * pdf_downloads updateMany
   */
  export type pdf_downloadsUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update pdf_downloads.
     */
    data: XOR<pdf_downloadsUpdateManyMutationInput, pdf_downloadsUncheckedUpdateManyInput>
    /**
     * Filter which pdf_downloads to update
     */
    where?: pdf_downloadsWhereInput
    /**
     * Limit how many pdf_downloads to update.
     */
    limit?: number
  }

  /**
   * pdf_downloads updateManyAndReturn
   */
  export type pdf_downloadsUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the pdf_downloads
     */
    select?: pdf_downloadsSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the pdf_downloads
     */
    omit?: pdf_downloadsOmit<ExtArgs> | null
    /**
     * The data used to update pdf_downloads.
     */
    data: XOR<pdf_downloadsUpdateManyMutationInput, pdf_downloadsUncheckedUpdateManyInput>
    /**
     * Filter which pdf_downloads to update
     */
    where?: pdf_downloadsWhereInput
    /**
     * Limit how many pdf_downloads to update.
     */
    limit?: number
  }

  /**
   * pdf_downloads upsert
   */
  export type pdf_downloadsUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the pdf_downloads
     */
    select?: pdf_downloadsSelect<ExtArgs> | null
    /**
     * Omit specific fields from the pdf_downloads
     */
    omit?: pdf_downloadsOmit<ExtArgs> | null
    /**
     * The filter to search for the pdf_downloads to update in case it exists.
     */
    where: pdf_downloadsWhereUniqueInput
    /**
     * In case the pdf_downloads found by the `where` argument doesn't exist, create a new pdf_downloads with this data.
     */
    create: XOR<pdf_downloadsCreateInput, pdf_downloadsUncheckedCreateInput>
    /**
     * In case the pdf_downloads was found with the provided `where` argument, update it with this data.
     */
    update: XOR<pdf_downloadsUpdateInput, pdf_downloadsUncheckedUpdateInput>
  }

  /**
   * pdf_downloads delete
   */
  export type pdf_downloadsDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the pdf_downloads
     */
    select?: pdf_downloadsSelect<ExtArgs> | null
    /**
     * Omit specific fields from the pdf_downloads
     */
    omit?: pdf_downloadsOmit<ExtArgs> | null
    /**
     * Filter which pdf_downloads to delete.
     */
    where: pdf_downloadsWhereUniqueInput
  }

  /**
   * pdf_downloads deleteMany
   */
  export type pdf_downloadsDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which pdf_downloads to delete
     */
    where?: pdf_downloadsWhereInput
    /**
     * Limit how many pdf_downloads to delete.
     */
    limit?: number
  }

  /**
   * pdf_downloads without action
   */
  export type pdf_downloadsDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the pdf_downloads
     */
    select?: pdf_downloadsSelect<ExtArgs> | null
    /**
     * Omit specific fields from the pdf_downloads
     */
    omit?: pdf_downloadsOmit<ExtArgs> | null
  }


  /**
   * Model user_actions
   */

  export type AggregateUser_actions = {
    _count: User_actionsCountAggregateOutputType | null
    _min: User_actionsMinAggregateOutputType | null
    _max: User_actionsMaxAggregateOutputType | null
  }

  export type User_actionsMinAggregateOutputType = {
    id: string | null
    action: string | null
    userId: string | null
    userEmail: string | null
    details: string | null
    timestamp: Date | null
  }

  export type User_actionsMaxAggregateOutputType = {
    id: string | null
    action: string | null
    userId: string | null
    userEmail: string | null
    details: string | null
    timestamp: Date | null
  }

  export type User_actionsCountAggregateOutputType = {
    id: number
    action: number
    userId: number
    userEmail: number
    details: number
    timestamp: number
    _all: number
  }


  export type User_actionsMinAggregateInputType = {
    id?: true
    action?: true
    userId?: true
    userEmail?: true
    details?: true
    timestamp?: true
  }

  export type User_actionsMaxAggregateInputType = {
    id?: true
    action?: true
    userId?: true
    userEmail?: true
    details?: true
    timestamp?: true
  }

  export type User_actionsCountAggregateInputType = {
    id?: true
    action?: true
    userId?: true
    userEmail?: true
    details?: true
    timestamp?: true
    _all?: true
  }

  export type User_actionsAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which user_actions to aggregate.
     */
    where?: user_actionsWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of user_actions to fetch.
     */
    orderBy?: user_actionsOrderByWithRelationInput | user_actionsOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: user_actionsWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` user_actions from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` user_actions.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned user_actions
    **/
    _count?: true | User_actionsCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: User_actionsMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: User_actionsMaxAggregateInputType
  }

  export type GetUser_actionsAggregateType<T extends User_actionsAggregateArgs> = {
        [P in keyof T & keyof AggregateUser_actions]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateUser_actions[P]>
      : GetScalarType<T[P], AggregateUser_actions[P]>
  }




  export type user_actionsGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: user_actionsWhereInput
    orderBy?: user_actionsOrderByWithAggregationInput | user_actionsOrderByWithAggregationInput[]
    by: User_actionsScalarFieldEnum[] | User_actionsScalarFieldEnum
    having?: user_actionsScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: User_actionsCountAggregateInputType | true
    _min?: User_actionsMinAggregateInputType
    _max?: User_actionsMaxAggregateInputType
  }

  export type User_actionsGroupByOutputType = {
    id: string
    action: string
    userId: string | null
    userEmail: string | null
    details: string | null
    timestamp: Date
    _count: User_actionsCountAggregateOutputType | null
    _min: User_actionsMinAggregateOutputType | null
    _max: User_actionsMaxAggregateOutputType | null
  }

  type GetUser_actionsGroupByPayload<T extends user_actionsGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<User_actionsGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof User_actionsGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], User_actionsGroupByOutputType[P]>
            : GetScalarType<T[P], User_actionsGroupByOutputType[P]>
        }
      >
    >


  export type user_actionsSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    action?: boolean
    userId?: boolean
    userEmail?: boolean
    details?: boolean
    timestamp?: boolean
  }, ExtArgs["result"]["user_actions"]>

  export type user_actionsSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    action?: boolean
    userId?: boolean
    userEmail?: boolean
    details?: boolean
    timestamp?: boolean
  }, ExtArgs["result"]["user_actions"]>

  export type user_actionsSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    action?: boolean
    userId?: boolean
    userEmail?: boolean
    details?: boolean
    timestamp?: boolean
  }, ExtArgs["result"]["user_actions"]>

  export type user_actionsSelectScalar = {
    id?: boolean
    action?: boolean
    userId?: boolean
    userEmail?: boolean
    details?: boolean
    timestamp?: boolean
  }

  export type user_actionsOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "action" | "userId" | "userEmail" | "details" | "timestamp", ExtArgs["result"]["user_actions"]>

  export type $user_actionsPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "user_actions"
    objects: {}
    scalars: $Extensions.GetPayloadResult<{
      id: string
      action: string
      userId: string | null
      userEmail: string | null
      details: string | null
      timestamp: Date
    }, ExtArgs["result"]["user_actions"]>
    composites: {}
  }

  type user_actionsGetPayload<S extends boolean | null | undefined | user_actionsDefaultArgs> = $Result.GetResult<Prisma.$user_actionsPayload, S>

  type user_actionsCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<user_actionsFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: User_actionsCountAggregateInputType | true
    }

  export interface user_actionsDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['user_actions'], meta: { name: 'user_actions' } }
    /**
     * Find zero or one User_actions that matches the filter.
     * @param {user_actionsFindUniqueArgs} args - Arguments to find a User_actions
     * @example
     * // Get one User_actions
     * const user_actions = await prisma.user_actions.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends user_actionsFindUniqueArgs>(args: SelectSubset<T, user_actionsFindUniqueArgs<ExtArgs>>): Prisma__user_actionsClient<$Result.GetResult<Prisma.$user_actionsPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one User_actions that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {user_actionsFindUniqueOrThrowArgs} args - Arguments to find a User_actions
     * @example
     * // Get one User_actions
     * const user_actions = await prisma.user_actions.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends user_actionsFindUniqueOrThrowArgs>(args: SelectSubset<T, user_actionsFindUniqueOrThrowArgs<ExtArgs>>): Prisma__user_actionsClient<$Result.GetResult<Prisma.$user_actionsPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first User_actions that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {user_actionsFindFirstArgs} args - Arguments to find a User_actions
     * @example
     * // Get one User_actions
     * const user_actions = await prisma.user_actions.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends user_actionsFindFirstArgs>(args?: SelectSubset<T, user_actionsFindFirstArgs<ExtArgs>>): Prisma__user_actionsClient<$Result.GetResult<Prisma.$user_actionsPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first User_actions that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {user_actionsFindFirstOrThrowArgs} args - Arguments to find a User_actions
     * @example
     * // Get one User_actions
     * const user_actions = await prisma.user_actions.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends user_actionsFindFirstOrThrowArgs>(args?: SelectSubset<T, user_actionsFindFirstOrThrowArgs<ExtArgs>>): Prisma__user_actionsClient<$Result.GetResult<Prisma.$user_actionsPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more User_actions that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {user_actionsFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all User_actions
     * const user_actions = await prisma.user_actions.findMany()
     * 
     * // Get first 10 User_actions
     * const user_actions = await prisma.user_actions.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const user_actionsWithIdOnly = await prisma.user_actions.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends user_actionsFindManyArgs>(args?: SelectSubset<T, user_actionsFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$user_actionsPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a User_actions.
     * @param {user_actionsCreateArgs} args - Arguments to create a User_actions.
     * @example
     * // Create one User_actions
     * const User_actions = await prisma.user_actions.create({
     *   data: {
     *     // ... data to create a User_actions
     *   }
     * })
     * 
     */
    create<T extends user_actionsCreateArgs>(args: SelectSubset<T, user_actionsCreateArgs<ExtArgs>>): Prisma__user_actionsClient<$Result.GetResult<Prisma.$user_actionsPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many User_actions.
     * @param {user_actionsCreateManyArgs} args - Arguments to create many User_actions.
     * @example
     * // Create many User_actions
     * const user_actions = await prisma.user_actions.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends user_actionsCreateManyArgs>(args?: SelectSubset<T, user_actionsCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many User_actions and returns the data saved in the database.
     * @param {user_actionsCreateManyAndReturnArgs} args - Arguments to create many User_actions.
     * @example
     * // Create many User_actions
     * const user_actions = await prisma.user_actions.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many User_actions and only return the `id`
     * const user_actionsWithIdOnly = await prisma.user_actions.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends user_actionsCreateManyAndReturnArgs>(args?: SelectSubset<T, user_actionsCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$user_actionsPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a User_actions.
     * @param {user_actionsDeleteArgs} args - Arguments to delete one User_actions.
     * @example
     * // Delete one User_actions
     * const User_actions = await prisma.user_actions.delete({
     *   where: {
     *     // ... filter to delete one User_actions
     *   }
     * })
     * 
     */
    delete<T extends user_actionsDeleteArgs>(args: SelectSubset<T, user_actionsDeleteArgs<ExtArgs>>): Prisma__user_actionsClient<$Result.GetResult<Prisma.$user_actionsPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one User_actions.
     * @param {user_actionsUpdateArgs} args - Arguments to update one User_actions.
     * @example
     * // Update one User_actions
     * const user_actions = await prisma.user_actions.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends user_actionsUpdateArgs>(args: SelectSubset<T, user_actionsUpdateArgs<ExtArgs>>): Prisma__user_actionsClient<$Result.GetResult<Prisma.$user_actionsPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more User_actions.
     * @param {user_actionsDeleteManyArgs} args - Arguments to filter User_actions to delete.
     * @example
     * // Delete a few User_actions
     * const { count } = await prisma.user_actions.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends user_actionsDeleteManyArgs>(args?: SelectSubset<T, user_actionsDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more User_actions.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {user_actionsUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many User_actions
     * const user_actions = await prisma.user_actions.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends user_actionsUpdateManyArgs>(args: SelectSubset<T, user_actionsUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more User_actions and returns the data updated in the database.
     * @param {user_actionsUpdateManyAndReturnArgs} args - Arguments to update many User_actions.
     * @example
     * // Update many User_actions
     * const user_actions = await prisma.user_actions.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more User_actions and only return the `id`
     * const user_actionsWithIdOnly = await prisma.user_actions.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends user_actionsUpdateManyAndReturnArgs>(args: SelectSubset<T, user_actionsUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$user_actionsPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one User_actions.
     * @param {user_actionsUpsertArgs} args - Arguments to update or create a User_actions.
     * @example
     * // Update or create a User_actions
     * const user_actions = await prisma.user_actions.upsert({
     *   create: {
     *     // ... data to create a User_actions
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the User_actions we want to update
     *   }
     * })
     */
    upsert<T extends user_actionsUpsertArgs>(args: SelectSubset<T, user_actionsUpsertArgs<ExtArgs>>): Prisma__user_actionsClient<$Result.GetResult<Prisma.$user_actionsPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of User_actions.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {user_actionsCountArgs} args - Arguments to filter User_actions to count.
     * @example
     * // Count the number of User_actions
     * const count = await prisma.user_actions.count({
     *   where: {
     *     // ... the filter for the User_actions we want to count
     *   }
     * })
    **/
    count<T extends user_actionsCountArgs>(
      args?: Subset<T, user_actionsCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], User_actionsCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a User_actions.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {User_actionsAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends User_actionsAggregateArgs>(args: Subset<T, User_actionsAggregateArgs>): Prisma.PrismaPromise<GetUser_actionsAggregateType<T>>

    /**
     * Group by User_actions.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {user_actionsGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends user_actionsGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: user_actionsGroupByArgs['orderBy'] }
        : { orderBy?: user_actionsGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, user_actionsGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetUser_actionsGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the user_actions model
   */
  readonly fields: user_actionsFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for user_actions.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__user_actionsClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the user_actions model
   */
  interface user_actionsFieldRefs {
    readonly id: FieldRef<"user_actions", 'String'>
    readonly action: FieldRef<"user_actions", 'String'>
    readonly userId: FieldRef<"user_actions", 'String'>
    readonly userEmail: FieldRef<"user_actions", 'String'>
    readonly details: FieldRef<"user_actions", 'String'>
    readonly timestamp: FieldRef<"user_actions", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * user_actions findUnique
   */
  export type user_actionsFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the user_actions
     */
    select?: user_actionsSelect<ExtArgs> | null
    /**
     * Omit specific fields from the user_actions
     */
    omit?: user_actionsOmit<ExtArgs> | null
    /**
     * Filter, which user_actions to fetch.
     */
    where: user_actionsWhereUniqueInput
  }

  /**
   * user_actions findUniqueOrThrow
   */
  export type user_actionsFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the user_actions
     */
    select?: user_actionsSelect<ExtArgs> | null
    /**
     * Omit specific fields from the user_actions
     */
    omit?: user_actionsOmit<ExtArgs> | null
    /**
     * Filter, which user_actions to fetch.
     */
    where: user_actionsWhereUniqueInput
  }

  /**
   * user_actions findFirst
   */
  export type user_actionsFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the user_actions
     */
    select?: user_actionsSelect<ExtArgs> | null
    /**
     * Omit specific fields from the user_actions
     */
    omit?: user_actionsOmit<ExtArgs> | null
    /**
     * Filter, which user_actions to fetch.
     */
    where?: user_actionsWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of user_actions to fetch.
     */
    orderBy?: user_actionsOrderByWithRelationInput | user_actionsOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for user_actions.
     */
    cursor?: user_actionsWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` user_actions from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` user_actions.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of user_actions.
     */
    distinct?: User_actionsScalarFieldEnum | User_actionsScalarFieldEnum[]
  }

  /**
   * user_actions findFirstOrThrow
   */
  export type user_actionsFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the user_actions
     */
    select?: user_actionsSelect<ExtArgs> | null
    /**
     * Omit specific fields from the user_actions
     */
    omit?: user_actionsOmit<ExtArgs> | null
    /**
     * Filter, which user_actions to fetch.
     */
    where?: user_actionsWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of user_actions to fetch.
     */
    orderBy?: user_actionsOrderByWithRelationInput | user_actionsOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for user_actions.
     */
    cursor?: user_actionsWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` user_actions from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` user_actions.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of user_actions.
     */
    distinct?: User_actionsScalarFieldEnum | User_actionsScalarFieldEnum[]
  }

  /**
   * user_actions findMany
   */
  export type user_actionsFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the user_actions
     */
    select?: user_actionsSelect<ExtArgs> | null
    /**
     * Omit specific fields from the user_actions
     */
    omit?: user_actionsOmit<ExtArgs> | null
    /**
     * Filter, which user_actions to fetch.
     */
    where?: user_actionsWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of user_actions to fetch.
     */
    orderBy?: user_actionsOrderByWithRelationInput | user_actionsOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing user_actions.
     */
    cursor?: user_actionsWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` user_actions from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` user_actions.
     */
    skip?: number
    distinct?: User_actionsScalarFieldEnum | User_actionsScalarFieldEnum[]
  }

  /**
   * user_actions create
   */
  export type user_actionsCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the user_actions
     */
    select?: user_actionsSelect<ExtArgs> | null
    /**
     * Omit specific fields from the user_actions
     */
    omit?: user_actionsOmit<ExtArgs> | null
    /**
     * The data needed to create a user_actions.
     */
    data: XOR<user_actionsCreateInput, user_actionsUncheckedCreateInput>
  }

  /**
   * user_actions createMany
   */
  export type user_actionsCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many user_actions.
     */
    data: user_actionsCreateManyInput | user_actionsCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * user_actions createManyAndReturn
   */
  export type user_actionsCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the user_actions
     */
    select?: user_actionsSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the user_actions
     */
    omit?: user_actionsOmit<ExtArgs> | null
    /**
     * The data used to create many user_actions.
     */
    data: user_actionsCreateManyInput | user_actionsCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * user_actions update
   */
  export type user_actionsUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the user_actions
     */
    select?: user_actionsSelect<ExtArgs> | null
    /**
     * Omit specific fields from the user_actions
     */
    omit?: user_actionsOmit<ExtArgs> | null
    /**
     * The data needed to update a user_actions.
     */
    data: XOR<user_actionsUpdateInput, user_actionsUncheckedUpdateInput>
    /**
     * Choose, which user_actions to update.
     */
    where: user_actionsWhereUniqueInput
  }

  /**
   * user_actions updateMany
   */
  export type user_actionsUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update user_actions.
     */
    data: XOR<user_actionsUpdateManyMutationInput, user_actionsUncheckedUpdateManyInput>
    /**
     * Filter which user_actions to update
     */
    where?: user_actionsWhereInput
    /**
     * Limit how many user_actions to update.
     */
    limit?: number
  }

  /**
   * user_actions updateManyAndReturn
   */
  export type user_actionsUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the user_actions
     */
    select?: user_actionsSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the user_actions
     */
    omit?: user_actionsOmit<ExtArgs> | null
    /**
     * The data used to update user_actions.
     */
    data: XOR<user_actionsUpdateManyMutationInput, user_actionsUncheckedUpdateManyInput>
    /**
     * Filter which user_actions to update
     */
    where?: user_actionsWhereInput
    /**
     * Limit how many user_actions to update.
     */
    limit?: number
  }

  /**
   * user_actions upsert
   */
  export type user_actionsUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the user_actions
     */
    select?: user_actionsSelect<ExtArgs> | null
    /**
     * Omit specific fields from the user_actions
     */
    omit?: user_actionsOmit<ExtArgs> | null
    /**
     * The filter to search for the user_actions to update in case it exists.
     */
    where: user_actionsWhereUniqueInput
    /**
     * In case the user_actions found by the `where` argument doesn't exist, create a new user_actions with this data.
     */
    create: XOR<user_actionsCreateInput, user_actionsUncheckedCreateInput>
    /**
     * In case the user_actions was found with the provided `where` argument, update it with this data.
     */
    update: XOR<user_actionsUpdateInput, user_actionsUncheckedUpdateInput>
  }

  /**
   * user_actions delete
   */
  export type user_actionsDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the user_actions
     */
    select?: user_actionsSelect<ExtArgs> | null
    /**
     * Omit specific fields from the user_actions
     */
    omit?: user_actionsOmit<ExtArgs> | null
    /**
     * Filter which user_actions to delete.
     */
    where: user_actionsWhereUniqueInput
  }

  /**
   * user_actions deleteMany
   */
  export type user_actionsDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which user_actions to delete
     */
    where?: user_actionsWhereInput
    /**
     * Limit how many user_actions to delete.
     */
    limit?: number
  }

  /**
   * user_actions without action
   */
  export type user_actionsDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the user_actions
     */
    select?: user_actionsSelect<ExtArgs> | null
    /**
     * Omit specific fields from the user_actions
     */
    omit?: user_actionsOmit<ExtArgs> | null
  }


  /**
   * Model user_sessions
   */

  export type AggregateUser_sessions = {
    _count: User_sessionsCountAggregateOutputType | null
    _avg: User_sessionsAvgAggregateOutputType | null
    _sum: User_sessionsSumAggregateOutputType | null
    _min: User_sessionsMinAggregateOutputType | null
    _max: User_sessionsMaxAggregateOutputType | null
  }

  export type User_sessionsAvgAggregateOutputType = {
    screenWidth: number | null
    screenHeight: number | null
    pageViews: number | null
    duration: number | null
  }

  export type User_sessionsSumAggregateOutputType = {
    screenWidth: number | null
    screenHeight: number | null
    pageViews: number | null
    duration: number | null
  }

  export type User_sessionsMinAggregateOutputType = {
    id: string | null
    sessionId: string | null
    userId: string | null
    userEmail: string | null
    ipAddress: string | null
    country: string | null
    deviceType: string | null
    browser: string | null
    os: string | null
    screenWidth: number | null
    screenHeight: number | null
    startTime: Date | null
    endTime: Date | null
    pageViews: number | null
    duration: number | null
    isBounce: boolean | null
    referrer: string | null
  }

  export type User_sessionsMaxAggregateOutputType = {
    id: string | null
    sessionId: string | null
    userId: string | null
    userEmail: string | null
    ipAddress: string | null
    country: string | null
    deviceType: string | null
    browser: string | null
    os: string | null
    screenWidth: number | null
    screenHeight: number | null
    startTime: Date | null
    endTime: Date | null
    pageViews: number | null
    duration: number | null
    isBounce: boolean | null
    referrer: string | null
  }

  export type User_sessionsCountAggregateOutputType = {
    id: number
    sessionId: number
    userId: number
    userEmail: number
    ipAddress: number
    country: number
    deviceType: number
    browser: number
    os: number
    screenWidth: number
    screenHeight: number
    startTime: number
    endTime: number
    pageViews: number
    duration: number
    isBounce: number
    referrer: number
    _all: number
  }


  export type User_sessionsAvgAggregateInputType = {
    screenWidth?: true
    screenHeight?: true
    pageViews?: true
    duration?: true
  }

  export type User_sessionsSumAggregateInputType = {
    screenWidth?: true
    screenHeight?: true
    pageViews?: true
    duration?: true
  }

  export type User_sessionsMinAggregateInputType = {
    id?: true
    sessionId?: true
    userId?: true
    userEmail?: true
    ipAddress?: true
    country?: true
    deviceType?: true
    browser?: true
    os?: true
    screenWidth?: true
    screenHeight?: true
    startTime?: true
    endTime?: true
    pageViews?: true
    duration?: true
    isBounce?: true
    referrer?: true
  }

  export type User_sessionsMaxAggregateInputType = {
    id?: true
    sessionId?: true
    userId?: true
    userEmail?: true
    ipAddress?: true
    country?: true
    deviceType?: true
    browser?: true
    os?: true
    screenWidth?: true
    screenHeight?: true
    startTime?: true
    endTime?: true
    pageViews?: true
    duration?: true
    isBounce?: true
    referrer?: true
  }

  export type User_sessionsCountAggregateInputType = {
    id?: true
    sessionId?: true
    userId?: true
    userEmail?: true
    ipAddress?: true
    country?: true
    deviceType?: true
    browser?: true
    os?: true
    screenWidth?: true
    screenHeight?: true
    startTime?: true
    endTime?: true
    pageViews?: true
    duration?: true
    isBounce?: true
    referrer?: true
    _all?: true
  }

  export type User_sessionsAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which user_sessions to aggregate.
     */
    where?: user_sessionsWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of user_sessions to fetch.
     */
    orderBy?: user_sessionsOrderByWithRelationInput | user_sessionsOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: user_sessionsWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` user_sessions from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` user_sessions.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned user_sessions
    **/
    _count?: true | User_sessionsCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: User_sessionsAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: User_sessionsSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: User_sessionsMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: User_sessionsMaxAggregateInputType
  }

  export type GetUser_sessionsAggregateType<T extends User_sessionsAggregateArgs> = {
        [P in keyof T & keyof AggregateUser_sessions]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateUser_sessions[P]>
      : GetScalarType<T[P], AggregateUser_sessions[P]>
  }




  export type user_sessionsGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: user_sessionsWhereInput
    orderBy?: user_sessionsOrderByWithAggregationInput | user_sessionsOrderByWithAggregationInput[]
    by: User_sessionsScalarFieldEnum[] | User_sessionsScalarFieldEnum
    having?: user_sessionsScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: User_sessionsCountAggregateInputType | true
    _avg?: User_sessionsAvgAggregateInputType
    _sum?: User_sessionsSumAggregateInputType
    _min?: User_sessionsMinAggregateInputType
    _max?: User_sessionsMaxAggregateInputType
  }

  export type User_sessionsGroupByOutputType = {
    id: string
    sessionId: string
    userId: string | null
    userEmail: string | null
    ipAddress: string | null
    country: string | null
    deviceType: string | null
    browser: string | null
    os: string | null
    screenWidth: number | null
    screenHeight: number | null
    startTime: Date
    endTime: Date | null
    pageViews: number
    duration: number | null
    isBounce: boolean
    referrer: string | null
    _count: User_sessionsCountAggregateOutputType | null
    _avg: User_sessionsAvgAggregateOutputType | null
    _sum: User_sessionsSumAggregateOutputType | null
    _min: User_sessionsMinAggregateOutputType | null
    _max: User_sessionsMaxAggregateOutputType | null
  }

  type GetUser_sessionsGroupByPayload<T extends user_sessionsGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<User_sessionsGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof User_sessionsGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], User_sessionsGroupByOutputType[P]>
            : GetScalarType<T[P], User_sessionsGroupByOutputType[P]>
        }
      >
    >


  export type user_sessionsSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    sessionId?: boolean
    userId?: boolean
    userEmail?: boolean
    ipAddress?: boolean
    country?: boolean
    deviceType?: boolean
    browser?: boolean
    os?: boolean
    screenWidth?: boolean
    screenHeight?: boolean
    startTime?: boolean
    endTime?: boolean
    pageViews?: boolean
    duration?: boolean
    isBounce?: boolean
    referrer?: boolean
  }, ExtArgs["result"]["user_sessions"]>

  export type user_sessionsSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    sessionId?: boolean
    userId?: boolean
    userEmail?: boolean
    ipAddress?: boolean
    country?: boolean
    deviceType?: boolean
    browser?: boolean
    os?: boolean
    screenWidth?: boolean
    screenHeight?: boolean
    startTime?: boolean
    endTime?: boolean
    pageViews?: boolean
    duration?: boolean
    isBounce?: boolean
    referrer?: boolean
  }, ExtArgs["result"]["user_sessions"]>

  export type user_sessionsSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    sessionId?: boolean
    userId?: boolean
    userEmail?: boolean
    ipAddress?: boolean
    country?: boolean
    deviceType?: boolean
    browser?: boolean
    os?: boolean
    screenWidth?: boolean
    screenHeight?: boolean
    startTime?: boolean
    endTime?: boolean
    pageViews?: boolean
    duration?: boolean
    isBounce?: boolean
    referrer?: boolean
  }, ExtArgs["result"]["user_sessions"]>

  export type user_sessionsSelectScalar = {
    id?: boolean
    sessionId?: boolean
    userId?: boolean
    userEmail?: boolean
    ipAddress?: boolean
    country?: boolean
    deviceType?: boolean
    browser?: boolean
    os?: boolean
    screenWidth?: boolean
    screenHeight?: boolean
    startTime?: boolean
    endTime?: boolean
    pageViews?: boolean
    duration?: boolean
    isBounce?: boolean
    referrer?: boolean
  }

  export type user_sessionsOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "sessionId" | "userId" | "userEmail" | "ipAddress" | "country" | "deviceType" | "browser" | "os" | "screenWidth" | "screenHeight" | "startTime" | "endTime" | "pageViews" | "duration" | "isBounce" | "referrer", ExtArgs["result"]["user_sessions"]>

  export type $user_sessionsPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "user_sessions"
    objects: {}
    scalars: $Extensions.GetPayloadResult<{
      id: string
      sessionId: string
      userId: string | null
      userEmail: string | null
      ipAddress: string | null
      country: string | null
      deviceType: string | null
      browser: string | null
      os: string | null
      screenWidth: number | null
      screenHeight: number | null
      startTime: Date
      endTime: Date | null
      pageViews: number
      duration: number | null
      isBounce: boolean
      referrer: string | null
    }, ExtArgs["result"]["user_sessions"]>
    composites: {}
  }

  type user_sessionsGetPayload<S extends boolean | null | undefined | user_sessionsDefaultArgs> = $Result.GetResult<Prisma.$user_sessionsPayload, S>

  type user_sessionsCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<user_sessionsFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: User_sessionsCountAggregateInputType | true
    }

  export interface user_sessionsDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['user_sessions'], meta: { name: 'user_sessions' } }
    /**
     * Find zero or one User_sessions that matches the filter.
     * @param {user_sessionsFindUniqueArgs} args - Arguments to find a User_sessions
     * @example
     * // Get one User_sessions
     * const user_sessions = await prisma.user_sessions.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends user_sessionsFindUniqueArgs>(args: SelectSubset<T, user_sessionsFindUniqueArgs<ExtArgs>>): Prisma__user_sessionsClient<$Result.GetResult<Prisma.$user_sessionsPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one User_sessions that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {user_sessionsFindUniqueOrThrowArgs} args - Arguments to find a User_sessions
     * @example
     * // Get one User_sessions
     * const user_sessions = await prisma.user_sessions.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends user_sessionsFindUniqueOrThrowArgs>(args: SelectSubset<T, user_sessionsFindUniqueOrThrowArgs<ExtArgs>>): Prisma__user_sessionsClient<$Result.GetResult<Prisma.$user_sessionsPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first User_sessions that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {user_sessionsFindFirstArgs} args - Arguments to find a User_sessions
     * @example
     * // Get one User_sessions
     * const user_sessions = await prisma.user_sessions.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends user_sessionsFindFirstArgs>(args?: SelectSubset<T, user_sessionsFindFirstArgs<ExtArgs>>): Prisma__user_sessionsClient<$Result.GetResult<Prisma.$user_sessionsPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first User_sessions that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {user_sessionsFindFirstOrThrowArgs} args - Arguments to find a User_sessions
     * @example
     * // Get one User_sessions
     * const user_sessions = await prisma.user_sessions.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends user_sessionsFindFirstOrThrowArgs>(args?: SelectSubset<T, user_sessionsFindFirstOrThrowArgs<ExtArgs>>): Prisma__user_sessionsClient<$Result.GetResult<Prisma.$user_sessionsPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more User_sessions that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {user_sessionsFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all User_sessions
     * const user_sessions = await prisma.user_sessions.findMany()
     * 
     * // Get first 10 User_sessions
     * const user_sessions = await prisma.user_sessions.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const user_sessionsWithIdOnly = await prisma.user_sessions.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends user_sessionsFindManyArgs>(args?: SelectSubset<T, user_sessionsFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$user_sessionsPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a User_sessions.
     * @param {user_sessionsCreateArgs} args - Arguments to create a User_sessions.
     * @example
     * // Create one User_sessions
     * const User_sessions = await prisma.user_sessions.create({
     *   data: {
     *     // ... data to create a User_sessions
     *   }
     * })
     * 
     */
    create<T extends user_sessionsCreateArgs>(args: SelectSubset<T, user_sessionsCreateArgs<ExtArgs>>): Prisma__user_sessionsClient<$Result.GetResult<Prisma.$user_sessionsPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many User_sessions.
     * @param {user_sessionsCreateManyArgs} args - Arguments to create many User_sessions.
     * @example
     * // Create many User_sessions
     * const user_sessions = await prisma.user_sessions.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends user_sessionsCreateManyArgs>(args?: SelectSubset<T, user_sessionsCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many User_sessions and returns the data saved in the database.
     * @param {user_sessionsCreateManyAndReturnArgs} args - Arguments to create many User_sessions.
     * @example
     * // Create many User_sessions
     * const user_sessions = await prisma.user_sessions.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many User_sessions and only return the `id`
     * const user_sessionsWithIdOnly = await prisma.user_sessions.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends user_sessionsCreateManyAndReturnArgs>(args?: SelectSubset<T, user_sessionsCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$user_sessionsPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a User_sessions.
     * @param {user_sessionsDeleteArgs} args - Arguments to delete one User_sessions.
     * @example
     * // Delete one User_sessions
     * const User_sessions = await prisma.user_sessions.delete({
     *   where: {
     *     // ... filter to delete one User_sessions
     *   }
     * })
     * 
     */
    delete<T extends user_sessionsDeleteArgs>(args: SelectSubset<T, user_sessionsDeleteArgs<ExtArgs>>): Prisma__user_sessionsClient<$Result.GetResult<Prisma.$user_sessionsPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one User_sessions.
     * @param {user_sessionsUpdateArgs} args - Arguments to update one User_sessions.
     * @example
     * // Update one User_sessions
     * const user_sessions = await prisma.user_sessions.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends user_sessionsUpdateArgs>(args: SelectSubset<T, user_sessionsUpdateArgs<ExtArgs>>): Prisma__user_sessionsClient<$Result.GetResult<Prisma.$user_sessionsPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more User_sessions.
     * @param {user_sessionsDeleteManyArgs} args - Arguments to filter User_sessions to delete.
     * @example
     * // Delete a few User_sessions
     * const { count } = await prisma.user_sessions.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends user_sessionsDeleteManyArgs>(args?: SelectSubset<T, user_sessionsDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more User_sessions.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {user_sessionsUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many User_sessions
     * const user_sessions = await prisma.user_sessions.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends user_sessionsUpdateManyArgs>(args: SelectSubset<T, user_sessionsUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more User_sessions and returns the data updated in the database.
     * @param {user_sessionsUpdateManyAndReturnArgs} args - Arguments to update many User_sessions.
     * @example
     * // Update many User_sessions
     * const user_sessions = await prisma.user_sessions.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more User_sessions and only return the `id`
     * const user_sessionsWithIdOnly = await prisma.user_sessions.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends user_sessionsUpdateManyAndReturnArgs>(args: SelectSubset<T, user_sessionsUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$user_sessionsPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one User_sessions.
     * @param {user_sessionsUpsertArgs} args - Arguments to update or create a User_sessions.
     * @example
     * // Update or create a User_sessions
     * const user_sessions = await prisma.user_sessions.upsert({
     *   create: {
     *     // ... data to create a User_sessions
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the User_sessions we want to update
     *   }
     * })
     */
    upsert<T extends user_sessionsUpsertArgs>(args: SelectSubset<T, user_sessionsUpsertArgs<ExtArgs>>): Prisma__user_sessionsClient<$Result.GetResult<Prisma.$user_sessionsPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of User_sessions.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {user_sessionsCountArgs} args - Arguments to filter User_sessions to count.
     * @example
     * // Count the number of User_sessions
     * const count = await prisma.user_sessions.count({
     *   where: {
     *     // ... the filter for the User_sessions we want to count
     *   }
     * })
    **/
    count<T extends user_sessionsCountArgs>(
      args?: Subset<T, user_sessionsCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], User_sessionsCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a User_sessions.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {User_sessionsAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends User_sessionsAggregateArgs>(args: Subset<T, User_sessionsAggregateArgs>): Prisma.PrismaPromise<GetUser_sessionsAggregateType<T>>

    /**
     * Group by User_sessions.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {user_sessionsGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends user_sessionsGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: user_sessionsGroupByArgs['orderBy'] }
        : { orderBy?: user_sessionsGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, user_sessionsGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetUser_sessionsGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the user_sessions model
   */
  readonly fields: user_sessionsFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for user_sessions.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__user_sessionsClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the user_sessions model
   */
  interface user_sessionsFieldRefs {
    readonly id: FieldRef<"user_sessions", 'String'>
    readonly sessionId: FieldRef<"user_sessions", 'String'>
    readonly userId: FieldRef<"user_sessions", 'String'>
    readonly userEmail: FieldRef<"user_sessions", 'String'>
    readonly ipAddress: FieldRef<"user_sessions", 'String'>
    readonly country: FieldRef<"user_sessions", 'String'>
    readonly deviceType: FieldRef<"user_sessions", 'String'>
    readonly browser: FieldRef<"user_sessions", 'String'>
    readonly os: FieldRef<"user_sessions", 'String'>
    readonly screenWidth: FieldRef<"user_sessions", 'Int'>
    readonly screenHeight: FieldRef<"user_sessions", 'Int'>
    readonly startTime: FieldRef<"user_sessions", 'DateTime'>
    readonly endTime: FieldRef<"user_sessions", 'DateTime'>
    readonly pageViews: FieldRef<"user_sessions", 'Int'>
    readonly duration: FieldRef<"user_sessions", 'Int'>
    readonly isBounce: FieldRef<"user_sessions", 'Boolean'>
    readonly referrer: FieldRef<"user_sessions", 'String'>
  }
    

  // Custom InputTypes
  /**
   * user_sessions findUnique
   */
  export type user_sessionsFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the user_sessions
     */
    select?: user_sessionsSelect<ExtArgs> | null
    /**
     * Omit specific fields from the user_sessions
     */
    omit?: user_sessionsOmit<ExtArgs> | null
    /**
     * Filter, which user_sessions to fetch.
     */
    where: user_sessionsWhereUniqueInput
  }

  /**
   * user_sessions findUniqueOrThrow
   */
  export type user_sessionsFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the user_sessions
     */
    select?: user_sessionsSelect<ExtArgs> | null
    /**
     * Omit specific fields from the user_sessions
     */
    omit?: user_sessionsOmit<ExtArgs> | null
    /**
     * Filter, which user_sessions to fetch.
     */
    where: user_sessionsWhereUniqueInput
  }

  /**
   * user_sessions findFirst
   */
  export type user_sessionsFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the user_sessions
     */
    select?: user_sessionsSelect<ExtArgs> | null
    /**
     * Omit specific fields from the user_sessions
     */
    omit?: user_sessionsOmit<ExtArgs> | null
    /**
     * Filter, which user_sessions to fetch.
     */
    where?: user_sessionsWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of user_sessions to fetch.
     */
    orderBy?: user_sessionsOrderByWithRelationInput | user_sessionsOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for user_sessions.
     */
    cursor?: user_sessionsWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` user_sessions from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` user_sessions.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of user_sessions.
     */
    distinct?: User_sessionsScalarFieldEnum | User_sessionsScalarFieldEnum[]
  }

  /**
   * user_sessions findFirstOrThrow
   */
  export type user_sessionsFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the user_sessions
     */
    select?: user_sessionsSelect<ExtArgs> | null
    /**
     * Omit specific fields from the user_sessions
     */
    omit?: user_sessionsOmit<ExtArgs> | null
    /**
     * Filter, which user_sessions to fetch.
     */
    where?: user_sessionsWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of user_sessions to fetch.
     */
    orderBy?: user_sessionsOrderByWithRelationInput | user_sessionsOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for user_sessions.
     */
    cursor?: user_sessionsWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` user_sessions from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` user_sessions.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of user_sessions.
     */
    distinct?: User_sessionsScalarFieldEnum | User_sessionsScalarFieldEnum[]
  }

  /**
   * user_sessions findMany
   */
  export type user_sessionsFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the user_sessions
     */
    select?: user_sessionsSelect<ExtArgs> | null
    /**
     * Omit specific fields from the user_sessions
     */
    omit?: user_sessionsOmit<ExtArgs> | null
    /**
     * Filter, which user_sessions to fetch.
     */
    where?: user_sessionsWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of user_sessions to fetch.
     */
    orderBy?: user_sessionsOrderByWithRelationInput | user_sessionsOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing user_sessions.
     */
    cursor?: user_sessionsWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` user_sessions from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` user_sessions.
     */
    skip?: number
    distinct?: User_sessionsScalarFieldEnum | User_sessionsScalarFieldEnum[]
  }

  /**
   * user_sessions create
   */
  export type user_sessionsCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the user_sessions
     */
    select?: user_sessionsSelect<ExtArgs> | null
    /**
     * Omit specific fields from the user_sessions
     */
    omit?: user_sessionsOmit<ExtArgs> | null
    /**
     * The data needed to create a user_sessions.
     */
    data: XOR<user_sessionsCreateInput, user_sessionsUncheckedCreateInput>
  }

  /**
   * user_sessions createMany
   */
  export type user_sessionsCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many user_sessions.
     */
    data: user_sessionsCreateManyInput | user_sessionsCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * user_sessions createManyAndReturn
   */
  export type user_sessionsCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the user_sessions
     */
    select?: user_sessionsSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the user_sessions
     */
    omit?: user_sessionsOmit<ExtArgs> | null
    /**
     * The data used to create many user_sessions.
     */
    data: user_sessionsCreateManyInput | user_sessionsCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * user_sessions update
   */
  export type user_sessionsUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the user_sessions
     */
    select?: user_sessionsSelect<ExtArgs> | null
    /**
     * Omit specific fields from the user_sessions
     */
    omit?: user_sessionsOmit<ExtArgs> | null
    /**
     * The data needed to update a user_sessions.
     */
    data: XOR<user_sessionsUpdateInput, user_sessionsUncheckedUpdateInput>
    /**
     * Choose, which user_sessions to update.
     */
    where: user_sessionsWhereUniqueInput
  }

  /**
   * user_sessions updateMany
   */
  export type user_sessionsUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update user_sessions.
     */
    data: XOR<user_sessionsUpdateManyMutationInput, user_sessionsUncheckedUpdateManyInput>
    /**
     * Filter which user_sessions to update
     */
    where?: user_sessionsWhereInput
    /**
     * Limit how many user_sessions to update.
     */
    limit?: number
  }

  /**
   * user_sessions updateManyAndReturn
   */
  export type user_sessionsUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the user_sessions
     */
    select?: user_sessionsSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the user_sessions
     */
    omit?: user_sessionsOmit<ExtArgs> | null
    /**
     * The data used to update user_sessions.
     */
    data: XOR<user_sessionsUpdateManyMutationInput, user_sessionsUncheckedUpdateManyInput>
    /**
     * Filter which user_sessions to update
     */
    where?: user_sessionsWhereInput
    /**
     * Limit how many user_sessions to update.
     */
    limit?: number
  }

  /**
   * user_sessions upsert
   */
  export type user_sessionsUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the user_sessions
     */
    select?: user_sessionsSelect<ExtArgs> | null
    /**
     * Omit specific fields from the user_sessions
     */
    omit?: user_sessionsOmit<ExtArgs> | null
    /**
     * The filter to search for the user_sessions to update in case it exists.
     */
    where: user_sessionsWhereUniqueInput
    /**
     * In case the user_sessions found by the `where` argument doesn't exist, create a new user_sessions with this data.
     */
    create: XOR<user_sessionsCreateInput, user_sessionsUncheckedCreateInput>
    /**
     * In case the user_sessions was found with the provided `where` argument, update it with this data.
     */
    update: XOR<user_sessionsUpdateInput, user_sessionsUncheckedUpdateInput>
  }

  /**
   * user_sessions delete
   */
  export type user_sessionsDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the user_sessions
     */
    select?: user_sessionsSelect<ExtArgs> | null
    /**
     * Omit specific fields from the user_sessions
     */
    omit?: user_sessionsOmit<ExtArgs> | null
    /**
     * Filter which user_sessions to delete.
     */
    where: user_sessionsWhereUniqueInput
  }

  /**
   * user_sessions deleteMany
   */
  export type user_sessionsDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which user_sessions to delete
     */
    where?: user_sessionsWhereInput
    /**
     * Limit how many user_sessions to delete.
     */
    limit?: number
  }

  /**
   * user_sessions without action
   */
  export type user_sessionsDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the user_sessions
     */
    select?: user_sessionsSelect<ExtArgs> | null
    /**
     * Omit specific fields from the user_sessions
     */
    omit?: user_sessionsOmit<ExtArgs> | null
  }


  /**
   * Enums
   */

  export const TransactionIsolationLevel: {
    ReadUncommitted: 'ReadUncommitted',
    ReadCommitted: 'ReadCommitted',
    RepeatableRead: 'RepeatableRead',
    Serializable: 'Serializable'
  };

  export type TransactionIsolationLevel = (typeof TransactionIsolationLevel)[keyof typeof TransactionIsolationLevel]


  export const UserScalarFieldEnum: {
    id: 'id',
    email: 'email',
    name: 'name',
    password: 'password',
    phone: 'phone',
    address: 'address',
    profilePicture: 'profilePicture',
    isAdmin: 'isAdmin',
    canSeePrices: 'canSeePrices',
    discountType: 'discountType',
    discountPercentage: 'discountPercentage',
    birthday: 'birthday',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt',
    lastLoginAt: 'lastLoginAt'
  };

  export type UserScalarFieldEnum = (typeof UserScalarFieldEnum)[keyof typeof UserScalarFieldEnum]


  export const ProductScalarFieldEnum: {
    id: 'id',
    name: 'name',
    price: 'price',
    description: 'description',
    image: 'image',
    category: 'category',
    inStock: 'inStock',
    size: 'size',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt',
    images: 'images',
    productNumber: 'productNumber',
    ageGroup: 'ageGroup',
    skinType: 'skinType',
    targetConcerns: 'targetConcerns',
    usage: 'usage'
  };

  export type ProductScalarFieldEnum = (typeof ProductScalarFieldEnum)[keyof typeof ProductScalarFieldEnum]


  export const OrderScalarFieldEnum: {
    id: 'id',
    orderNumber: 'orderNumber',
    customerEmail: 'customerEmail',
    customerName: 'customerName',
    customerPhone: 'customerPhone',
    customerEmirate: 'customerEmirate',
    customerAddress: 'customerAddress',
    subtotal: 'subtotal',
    discountAmount: 'discountAmount',
    shipping: 'shipping',
    vat: 'vat',
    total: 'total',
    status: 'status',
    sessionId: 'sessionId',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  };

  export type OrderScalarFieldEnum = (typeof OrderScalarFieldEnum)[keyof typeof OrderScalarFieldEnum]


  export const OrderItemScalarFieldEnum: {
    id: 'id',
    orderId: 'orderId',
    productId: 'productId',
    productName: 'productName',
    price: 'price',
    quantity: 'quantity',
    image: 'image'
  };

  export type OrderItemScalarFieldEnum = (typeof OrderItemScalarFieldEnum)[keyof typeof OrderItemScalarFieldEnum]


  export const Page_viewsScalarFieldEnum: {
    id: 'id',
    page: 'page',
    userId: 'userId',
    userEmail: 'userEmail',
    userAgent: 'userAgent',
    ipAddress: 'ipAddress',
    country: 'country',
    referrer: 'referrer',
    timestamp: 'timestamp',
    browser: 'browser',
    deviceType: 'deviceType',
    os: 'os',
    screenHeight: 'screenHeight',
    screenWidth: 'screenWidth',
    city: 'city'
  };

  export type Page_viewsScalarFieldEnum = (typeof Page_viewsScalarFieldEnum)[keyof typeof Page_viewsScalarFieldEnum]


  export const Pdf_downloadsScalarFieldEnum: {
    id: 'id',
    filename: 'filename',
    userId: 'userId',
    userEmail: 'userEmail',
    ipAddress: 'ipAddress',
    userAgent: 'userAgent',
    country: 'country',
    city: 'city',
    deviceType: 'deviceType',
    browser: 'browser',
    os: 'os',
    referrer: 'referrer',
    timestamp: 'timestamp'
  };

  export type Pdf_downloadsScalarFieldEnum = (typeof Pdf_downloadsScalarFieldEnum)[keyof typeof Pdf_downloadsScalarFieldEnum]


  export const User_actionsScalarFieldEnum: {
    id: 'id',
    action: 'action',
    userId: 'userId',
    userEmail: 'userEmail',
    details: 'details',
    timestamp: 'timestamp'
  };

  export type User_actionsScalarFieldEnum = (typeof User_actionsScalarFieldEnum)[keyof typeof User_actionsScalarFieldEnum]


  export const User_sessionsScalarFieldEnum: {
    id: 'id',
    sessionId: 'sessionId',
    userId: 'userId',
    userEmail: 'userEmail',
    ipAddress: 'ipAddress',
    country: 'country',
    deviceType: 'deviceType',
    browser: 'browser',
    os: 'os',
    screenWidth: 'screenWidth',
    screenHeight: 'screenHeight',
    startTime: 'startTime',
    endTime: 'endTime',
    pageViews: 'pageViews',
    duration: 'duration',
    isBounce: 'isBounce',
    referrer: 'referrer'
  };

  export type User_sessionsScalarFieldEnum = (typeof User_sessionsScalarFieldEnum)[keyof typeof User_sessionsScalarFieldEnum]


  export const SortOrder: {
    asc: 'asc',
    desc: 'desc'
  };

  export type SortOrder = (typeof SortOrder)[keyof typeof SortOrder]


  export const QueryMode: {
    default: 'default',
    insensitive: 'insensitive'
  };

  export type QueryMode = (typeof QueryMode)[keyof typeof QueryMode]


  export const NullsOrder: {
    first: 'first',
    last: 'last'
  };

  export type NullsOrder = (typeof NullsOrder)[keyof typeof NullsOrder]


  /**
   * Field references
   */


  /**
   * Reference to a field of type 'String'
   */
  export type StringFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'String'>
    


  /**
   * Reference to a field of type 'String[]'
   */
  export type ListStringFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'String[]'>
    


  /**
   * Reference to a field of type 'Boolean'
   */
  export type BooleanFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Boolean'>
    


  /**
   * Reference to a field of type 'Float'
   */
  export type FloatFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Float'>
    


  /**
   * Reference to a field of type 'Float[]'
   */
  export type ListFloatFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Float[]'>
    


  /**
   * Reference to a field of type 'DateTime'
   */
  export type DateTimeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'DateTime'>
    


  /**
   * Reference to a field of type 'DateTime[]'
   */
  export type ListDateTimeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'DateTime[]'>
    


  /**
   * Reference to a field of type 'Int'
   */
  export type IntFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Int'>
    


  /**
   * Reference to a field of type 'Int[]'
   */
  export type ListIntFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Int[]'>
    
  /**
   * Deep Input Types
   */


  export type UserWhereInput = {
    AND?: UserWhereInput | UserWhereInput[]
    OR?: UserWhereInput[]
    NOT?: UserWhereInput | UserWhereInput[]
    id?: StringFilter<"User"> | string
    email?: StringFilter<"User"> | string
    name?: StringFilter<"User"> | string
    password?: StringFilter<"User"> | string
    phone?: StringNullableFilter<"User"> | string | null
    address?: StringNullableFilter<"User"> | string | null
    profilePicture?: StringNullableFilter<"User"> | string | null
    isAdmin?: BoolFilter<"User"> | boolean
    canSeePrices?: BoolFilter<"User"> | boolean
    discountType?: StringNullableFilter<"User"> | string | null
    discountPercentage?: FloatNullableFilter<"User"> | number | null
    birthday?: StringNullableFilter<"User"> | string | null
    createdAt?: DateTimeFilter<"User"> | Date | string
    updatedAt?: DateTimeFilter<"User"> | Date | string
    lastLoginAt?: DateTimeNullableFilter<"User"> | Date | string | null
    orders?: OrderListRelationFilter
  }

  export type UserOrderByWithRelationInput = {
    id?: SortOrder
    email?: SortOrder
    name?: SortOrder
    password?: SortOrder
    phone?: SortOrderInput | SortOrder
    address?: SortOrderInput | SortOrder
    profilePicture?: SortOrderInput | SortOrder
    isAdmin?: SortOrder
    canSeePrices?: SortOrder
    discountType?: SortOrderInput | SortOrder
    discountPercentage?: SortOrderInput | SortOrder
    birthday?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    lastLoginAt?: SortOrderInput | SortOrder
    orders?: OrderOrderByRelationAggregateInput
  }

  export type UserWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    email?: string
    AND?: UserWhereInput | UserWhereInput[]
    OR?: UserWhereInput[]
    NOT?: UserWhereInput | UserWhereInput[]
    name?: StringFilter<"User"> | string
    password?: StringFilter<"User"> | string
    phone?: StringNullableFilter<"User"> | string | null
    address?: StringNullableFilter<"User"> | string | null
    profilePicture?: StringNullableFilter<"User"> | string | null
    isAdmin?: BoolFilter<"User"> | boolean
    canSeePrices?: BoolFilter<"User"> | boolean
    discountType?: StringNullableFilter<"User"> | string | null
    discountPercentage?: FloatNullableFilter<"User"> | number | null
    birthday?: StringNullableFilter<"User"> | string | null
    createdAt?: DateTimeFilter<"User"> | Date | string
    updatedAt?: DateTimeFilter<"User"> | Date | string
    lastLoginAt?: DateTimeNullableFilter<"User"> | Date | string | null
    orders?: OrderListRelationFilter
  }, "id" | "email">

  export type UserOrderByWithAggregationInput = {
    id?: SortOrder
    email?: SortOrder
    name?: SortOrder
    password?: SortOrder
    phone?: SortOrderInput | SortOrder
    address?: SortOrderInput | SortOrder
    profilePicture?: SortOrderInput | SortOrder
    isAdmin?: SortOrder
    canSeePrices?: SortOrder
    discountType?: SortOrderInput | SortOrder
    discountPercentage?: SortOrderInput | SortOrder
    birthday?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    lastLoginAt?: SortOrderInput | SortOrder
    _count?: UserCountOrderByAggregateInput
    _avg?: UserAvgOrderByAggregateInput
    _max?: UserMaxOrderByAggregateInput
    _min?: UserMinOrderByAggregateInput
    _sum?: UserSumOrderByAggregateInput
  }

  export type UserScalarWhereWithAggregatesInput = {
    AND?: UserScalarWhereWithAggregatesInput | UserScalarWhereWithAggregatesInput[]
    OR?: UserScalarWhereWithAggregatesInput[]
    NOT?: UserScalarWhereWithAggregatesInput | UserScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"User"> | string
    email?: StringWithAggregatesFilter<"User"> | string
    name?: StringWithAggregatesFilter<"User"> | string
    password?: StringWithAggregatesFilter<"User"> | string
    phone?: StringNullableWithAggregatesFilter<"User"> | string | null
    address?: StringNullableWithAggregatesFilter<"User"> | string | null
    profilePicture?: StringNullableWithAggregatesFilter<"User"> | string | null
    isAdmin?: BoolWithAggregatesFilter<"User"> | boolean
    canSeePrices?: BoolWithAggregatesFilter<"User"> | boolean
    discountType?: StringNullableWithAggregatesFilter<"User"> | string | null
    discountPercentage?: FloatNullableWithAggregatesFilter<"User"> | number | null
    birthday?: StringNullableWithAggregatesFilter<"User"> | string | null
    createdAt?: DateTimeWithAggregatesFilter<"User"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"User"> | Date | string
    lastLoginAt?: DateTimeNullableWithAggregatesFilter<"User"> | Date | string | null
  }

  export type ProductWhereInput = {
    AND?: ProductWhereInput | ProductWhereInput[]
    OR?: ProductWhereInput[]
    NOT?: ProductWhereInput | ProductWhereInput[]
    id?: StringFilter<"Product"> | string
    name?: StringFilter<"Product"> | string
    price?: FloatFilter<"Product"> | number
    description?: StringFilter<"Product"> | string
    image?: StringFilter<"Product"> | string
    category?: StringFilter<"Product"> | string
    inStock?: BoolFilter<"Product"> | boolean
    size?: StringNullableFilter<"Product"> | string | null
    createdAt?: DateTimeFilter<"Product"> | Date | string
    updatedAt?: DateTimeFilter<"Product"> | Date | string
    images?: StringNullableFilter<"Product"> | string | null
    productNumber?: StringNullableFilter<"Product"> | string | null
    ageGroup?: StringNullableFilter<"Product"> | string | null
    skinType?: StringNullableFilter<"Product"> | string | null
    targetConcerns?: StringNullableFilter<"Product"> | string | null
    usage?: StringNullableFilter<"Product"> | string | null
  }

  export type ProductOrderByWithRelationInput = {
    id?: SortOrder
    name?: SortOrder
    price?: SortOrder
    description?: SortOrder
    image?: SortOrder
    category?: SortOrder
    inStock?: SortOrder
    size?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    images?: SortOrderInput | SortOrder
    productNumber?: SortOrderInput | SortOrder
    ageGroup?: SortOrderInput | SortOrder
    skinType?: SortOrderInput | SortOrder
    targetConcerns?: SortOrderInput | SortOrder
    usage?: SortOrderInput | SortOrder
  }

  export type ProductWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    productNumber?: string
    AND?: ProductWhereInput | ProductWhereInput[]
    OR?: ProductWhereInput[]
    NOT?: ProductWhereInput | ProductWhereInput[]
    name?: StringFilter<"Product"> | string
    price?: FloatFilter<"Product"> | number
    description?: StringFilter<"Product"> | string
    image?: StringFilter<"Product"> | string
    category?: StringFilter<"Product"> | string
    inStock?: BoolFilter<"Product"> | boolean
    size?: StringNullableFilter<"Product"> | string | null
    createdAt?: DateTimeFilter<"Product"> | Date | string
    updatedAt?: DateTimeFilter<"Product"> | Date | string
    images?: StringNullableFilter<"Product"> | string | null
    ageGroup?: StringNullableFilter<"Product"> | string | null
    skinType?: StringNullableFilter<"Product"> | string | null
    targetConcerns?: StringNullableFilter<"Product"> | string | null
    usage?: StringNullableFilter<"Product"> | string | null
  }, "id" | "productNumber">

  export type ProductOrderByWithAggregationInput = {
    id?: SortOrder
    name?: SortOrder
    price?: SortOrder
    description?: SortOrder
    image?: SortOrder
    category?: SortOrder
    inStock?: SortOrder
    size?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    images?: SortOrderInput | SortOrder
    productNumber?: SortOrderInput | SortOrder
    ageGroup?: SortOrderInput | SortOrder
    skinType?: SortOrderInput | SortOrder
    targetConcerns?: SortOrderInput | SortOrder
    usage?: SortOrderInput | SortOrder
    _count?: ProductCountOrderByAggregateInput
    _avg?: ProductAvgOrderByAggregateInput
    _max?: ProductMaxOrderByAggregateInput
    _min?: ProductMinOrderByAggregateInput
    _sum?: ProductSumOrderByAggregateInput
  }

  export type ProductScalarWhereWithAggregatesInput = {
    AND?: ProductScalarWhereWithAggregatesInput | ProductScalarWhereWithAggregatesInput[]
    OR?: ProductScalarWhereWithAggregatesInput[]
    NOT?: ProductScalarWhereWithAggregatesInput | ProductScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"Product"> | string
    name?: StringWithAggregatesFilter<"Product"> | string
    price?: FloatWithAggregatesFilter<"Product"> | number
    description?: StringWithAggregatesFilter<"Product"> | string
    image?: StringWithAggregatesFilter<"Product"> | string
    category?: StringWithAggregatesFilter<"Product"> | string
    inStock?: BoolWithAggregatesFilter<"Product"> | boolean
    size?: StringNullableWithAggregatesFilter<"Product"> | string | null
    createdAt?: DateTimeWithAggregatesFilter<"Product"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"Product"> | Date | string
    images?: StringNullableWithAggregatesFilter<"Product"> | string | null
    productNumber?: StringNullableWithAggregatesFilter<"Product"> | string | null
    ageGroup?: StringNullableWithAggregatesFilter<"Product"> | string | null
    skinType?: StringNullableWithAggregatesFilter<"Product"> | string | null
    targetConcerns?: StringNullableWithAggregatesFilter<"Product"> | string | null
    usage?: StringNullableWithAggregatesFilter<"Product"> | string | null
  }

  export type OrderWhereInput = {
    AND?: OrderWhereInput | OrderWhereInput[]
    OR?: OrderWhereInput[]
    NOT?: OrderWhereInput | OrderWhereInput[]
    id?: StringFilter<"Order"> | string
    orderNumber?: StringFilter<"Order"> | string
    customerEmail?: StringFilter<"Order"> | string
    customerName?: StringFilter<"Order"> | string
    customerPhone?: StringFilter<"Order"> | string
    customerEmirate?: StringFilter<"Order"> | string
    customerAddress?: StringFilter<"Order"> | string
    subtotal?: FloatFilter<"Order"> | number
    discountAmount?: FloatFilter<"Order"> | number
    shipping?: FloatFilter<"Order"> | number
    vat?: FloatFilter<"Order"> | number
    total?: FloatFilter<"Order"> | number
    status?: StringFilter<"Order"> | string
    sessionId?: StringNullableFilter<"Order"> | string | null
    createdAt?: DateTimeFilter<"Order"> | Date | string
    updatedAt?: DateTimeFilter<"Order"> | Date | string
    orderItems?: OrderItemListRelationFilter
    users?: XOR<UserScalarRelationFilter, UserWhereInput>
  }

  export type OrderOrderByWithRelationInput = {
    id?: SortOrder
    orderNumber?: SortOrder
    customerEmail?: SortOrder
    customerName?: SortOrder
    customerPhone?: SortOrder
    customerEmirate?: SortOrder
    customerAddress?: SortOrder
    subtotal?: SortOrder
    discountAmount?: SortOrder
    shipping?: SortOrder
    vat?: SortOrder
    total?: SortOrder
    status?: SortOrder
    sessionId?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    orderItems?: OrderItemOrderByRelationAggregateInput
    users?: UserOrderByWithRelationInput
  }

  export type OrderWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    orderNumber?: string
    AND?: OrderWhereInput | OrderWhereInput[]
    OR?: OrderWhereInput[]
    NOT?: OrderWhereInput | OrderWhereInput[]
    customerEmail?: StringFilter<"Order"> | string
    customerName?: StringFilter<"Order"> | string
    customerPhone?: StringFilter<"Order"> | string
    customerEmirate?: StringFilter<"Order"> | string
    customerAddress?: StringFilter<"Order"> | string
    subtotal?: FloatFilter<"Order"> | number
    discountAmount?: FloatFilter<"Order"> | number
    shipping?: FloatFilter<"Order"> | number
    vat?: FloatFilter<"Order"> | number
    total?: FloatFilter<"Order"> | number
    status?: StringFilter<"Order"> | string
    sessionId?: StringNullableFilter<"Order"> | string | null
    createdAt?: DateTimeFilter<"Order"> | Date | string
    updatedAt?: DateTimeFilter<"Order"> | Date | string
    orderItems?: OrderItemListRelationFilter
    users?: XOR<UserScalarRelationFilter, UserWhereInput>
  }, "id" | "orderNumber">

  export type OrderOrderByWithAggregationInput = {
    id?: SortOrder
    orderNumber?: SortOrder
    customerEmail?: SortOrder
    customerName?: SortOrder
    customerPhone?: SortOrder
    customerEmirate?: SortOrder
    customerAddress?: SortOrder
    subtotal?: SortOrder
    discountAmount?: SortOrder
    shipping?: SortOrder
    vat?: SortOrder
    total?: SortOrder
    status?: SortOrder
    sessionId?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    _count?: OrderCountOrderByAggregateInput
    _avg?: OrderAvgOrderByAggregateInput
    _max?: OrderMaxOrderByAggregateInput
    _min?: OrderMinOrderByAggregateInput
    _sum?: OrderSumOrderByAggregateInput
  }

  export type OrderScalarWhereWithAggregatesInput = {
    AND?: OrderScalarWhereWithAggregatesInput | OrderScalarWhereWithAggregatesInput[]
    OR?: OrderScalarWhereWithAggregatesInput[]
    NOT?: OrderScalarWhereWithAggregatesInput | OrderScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"Order"> | string
    orderNumber?: StringWithAggregatesFilter<"Order"> | string
    customerEmail?: StringWithAggregatesFilter<"Order"> | string
    customerName?: StringWithAggregatesFilter<"Order"> | string
    customerPhone?: StringWithAggregatesFilter<"Order"> | string
    customerEmirate?: StringWithAggregatesFilter<"Order"> | string
    customerAddress?: StringWithAggregatesFilter<"Order"> | string
    subtotal?: FloatWithAggregatesFilter<"Order"> | number
    discountAmount?: FloatWithAggregatesFilter<"Order"> | number
    shipping?: FloatWithAggregatesFilter<"Order"> | number
    vat?: FloatWithAggregatesFilter<"Order"> | number
    total?: FloatWithAggregatesFilter<"Order"> | number
    status?: StringWithAggregatesFilter<"Order"> | string
    sessionId?: StringNullableWithAggregatesFilter<"Order"> | string | null
    createdAt?: DateTimeWithAggregatesFilter<"Order"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"Order"> | Date | string
  }

  export type OrderItemWhereInput = {
    AND?: OrderItemWhereInput | OrderItemWhereInput[]
    OR?: OrderItemWhereInput[]
    NOT?: OrderItemWhereInput | OrderItemWhereInput[]
    id?: StringFilter<"OrderItem"> | string
    orderId?: StringFilter<"OrderItem"> | string
    productId?: StringFilter<"OrderItem"> | string
    productName?: StringFilter<"OrderItem"> | string
    price?: FloatFilter<"OrderItem"> | number
    quantity?: IntFilter<"OrderItem"> | number
    image?: StringFilter<"OrderItem"> | string
    order?: XOR<OrderScalarRelationFilter, OrderWhereInput>
  }

  export type OrderItemOrderByWithRelationInput = {
    id?: SortOrder
    orderId?: SortOrder
    productId?: SortOrder
    productName?: SortOrder
    price?: SortOrder
    quantity?: SortOrder
    image?: SortOrder
    order?: OrderOrderByWithRelationInput
  }

  export type OrderItemWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: OrderItemWhereInput | OrderItemWhereInput[]
    OR?: OrderItemWhereInput[]
    NOT?: OrderItemWhereInput | OrderItemWhereInput[]
    orderId?: StringFilter<"OrderItem"> | string
    productId?: StringFilter<"OrderItem"> | string
    productName?: StringFilter<"OrderItem"> | string
    price?: FloatFilter<"OrderItem"> | number
    quantity?: IntFilter<"OrderItem"> | number
    image?: StringFilter<"OrderItem"> | string
    order?: XOR<OrderScalarRelationFilter, OrderWhereInput>
  }, "id">

  export type OrderItemOrderByWithAggregationInput = {
    id?: SortOrder
    orderId?: SortOrder
    productId?: SortOrder
    productName?: SortOrder
    price?: SortOrder
    quantity?: SortOrder
    image?: SortOrder
    _count?: OrderItemCountOrderByAggregateInput
    _avg?: OrderItemAvgOrderByAggregateInput
    _max?: OrderItemMaxOrderByAggregateInput
    _min?: OrderItemMinOrderByAggregateInput
    _sum?: OrderItemSumOrderByAggregateInput
  }

  export type OrderItemScalarWhereWithAggregatesInput = {
    AND?: OrderItemScalarWhereWithAggregatesInput | OrderItemScalarWhereWithAggregatesInput[]
    OR?: OrderItemScalarWhereWithAggregatesInput[]
    NOT?: OrderItemScalarWhereWithAggregatesInput | OrderItemScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"OrderItem"> | string
    orderId?: StringWithAggregatesFilter<"OrderItem"> | string
    productId?: StringWithAggregatesFilter<"OrderItem"> | string
    productName?: StringWithAggregatesFilter<"OrderItem"> | string
    price?: FloatWithAggregatesFilter<"OrderItem"> | number
    quantity?: IntWithAggregatesFilter<"OrderItem"> | number
    image?: StringWithAggregatesFilter<"OrderItem"> | string
  }

  export type page_viewsWhereInput = {
    AND?: page_viewsWhereInput | page_viewsWhereInput[]
    OR?: page_viewsWhereInput[]
    NOT?: page_viewsWhereInput | page_viewsWhereInput[]
    id?: StringFilter<"page_views"> | string
    page?: StringFilter<"page_views"> | string
    userId?: StringNullableFilter<"page_views"> | string | null
    userEmail?: StringNullableFilter<"page_views"> | string | null
    userAgent?: StringNullableFilter<"page_views"> | string | null
    ipAddress?: StringNullableFilter<"page_views"> | string | null
    country?: StringNullableFilter<"page_views"> | string | null
    referrer?: StringNullableFilter<"page_views"> | string | null
    timestamp?: DateTimeFilter<"page_views"> | Date | string
    browser?: StringNullableFilter<"page_views"> | string | null
    deviceType?: StringNullableFilter<"page_views"> | string | null
    os?: StringNullableFilter<"page_views"> | string | null
    screenHeight?: IntNullableFilter<"page_views"> | number | null
    screenWidth?: IntNullableFilter<"page_views"> | number | null
    city?: StringNullableFilter<"page_views"> | string | null
  }

  export type page_viewsOrderByWithRelationInput = {
    id?: SortOrder
    page?: SortOrder
    userId?: SortOrderInput | SortOrder
    userEmail?: SortOrderInput | SortOrder
    userAgent?: SortOrderInput | SortOrder
    ipAddress?: SortOrderInput | SortOrder
    country?: SortOrderInput | SortOrder
    referrer?: SortOrderInput | SortOrder
    timestamp?: SortOrder
    browser?: SortOrderInput | SortOrder
    deviceType?: SortOrderInput | SortOrder
    os?: SortOrderInput | SortOrder
    screenHeight?: SortOrderInput | SortOrder
    screenWidth?: SortOrderInput | SortOrder
    city?: SortOrderInput | SortOrder
  }

  export type page_viewsWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: page_viewsWhereInput | page_viewsWhereInput[]
    OR?: page_viewsWhereInput[]
    NOT?: page_viewsWhereInput | page_viewsWhereInput[]
    page?: StringFilter<"page_views"> | string
    userId?: StringNullableFilter<"page_views"> | string | null
    userEmail?: StringNullableFilter<"page_views"> | string | null
    userAgent?: StringNullableFilter<"page_views"> | string | null
    ipAddress?: StringNullableFilter<"page_views"> | string | null
    country?: StringNullableFilter<"page_views"> | string | null
    referrer?: StringNullableFilter<"page_views"> | string | null
    timestamp?: DateTimeFilter<"page_views"> | Date | string
    browser?: StringNullableFilter<"page_views"> | string | null
    deviceType?: StringNullableFilter<"page_views"> | string | null
    os?: StringNullableFilter<"page_views"> | string | null
    screenHeight?: IntNullableFilter<"page_views"> | number | null
    screenWidth?: IntNullableFilter<"page_views"> | number | null
    city?: StringNullableFilter<"page_views"> | string | null
  }, "id">

  export type page_viewsOrderByWithAggregationInput = {
    id?: SortOrder
    page?: SortOrder
    userId?: SortOrderInput | SortOrder
    userEmail?: SortOrderInput | SortOrder
    userAgent?: SortOrderInput | SortOrder
    ipAddress?: SortOrderInput | SortOrder
    country?: SortOrderInput | SortOrder
    referrer?: SortOrderInput | SortOrder
    timestamp?: SortOrder
    browser?: SortOrderInput | SortOrder
    deviceType?: SortOrderInput | SortOrder
    os?: SortOrderInput | SortOrder
    screenHeight?: SortOrderInput | SortOrder
    screenWidth?: SortOrderInput | SortOrder
    city?: SortOrderInput | SortOrder
    _count?: page_viewsCountOrderByAggregateInput
    _avg?: page_viewsAvgOrderByAggregateInput
    _max?: page_viewsMaxOrderByAggregateInput
    _min?: page_viewsMinOrderByAggregateInput
    _sum?: page_viewsSumOrderByAggregateInput
  }

  export type page_viewsScalarWhereWithAggregatesInput = {
    AND?: page_viewsScalarWhereWithAggregatesInput | page_viewsScalarWhereWithAggregatesInput[]
    OR?: page_viewsScalarWhereWithAggregatesInput[]
    NOT?: page_viewsScalarWhereWithAggregatesInput | page_viewsScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"page_views"> | string
    page?: StringWithAggregatesFilter<"page_views"> | string
    userId?: StringNullableWithAggregatesFilter<"page_views"> | string | null
    userEmail?: StringNullableWithAggregatesFilter<"page_views"> | string | null
    userAgent?: StringNullableWithAggregatesFilter<"page_views"> | string | null
    ipAddress?: StringNullableWithAggregatesFilter<"page_views"> | string | null
    country?: StringNullableWithAggregatesFilter<"page_views"> | string | null
    referrer?: StringNullableWithAggregatesFilter<"page_views"> | string | null
    timestamp?: DateTimeWithAggregatesFilter<"page_views"> | Date | string
    browser?: StringNullableWithAggregatesFilter<"page_views"> | string | null
    deviceType?: StringNullableWithAggregatesFilter<"page_views"> | string | null
    os?: StringNullableWithAggregatesFilter<"page_views"> | string | null
    screenHeight?: IntNullableWithAggregatesFilter<"page_views"> | number | null
    screenWidth?: IntNullableWithAggregatesFilter<"page_views"> | number | null
    city?: StringNullableWithAggregatesFilter<"page_views"> | string | null
  }

  export type pdf_downloadsWhereInput = {
    AND?: pdf_downloadsWhereInput | pdf_downloadsWhereInput[]
    OR?: pdf_downloadsWhereInput[]
    NOT?: pdf_downloadsWhereInput | pdf_downloadsWhereInput[]
    id?: StringFilter<"pdf_downloads"> | string
    filename?: StringFilter<"pdf_downloads"> | string
    userId?: StringNullableFilter<"pdf_downloads"> | string | null
    userEmail?: StringNullableFilter<"pdf_downloads"> | string | null
    ipAddress?: StringNullableFilter<"pdf_downloads"> | string | null
    userAgent?: StringNullableFilter<"pdf_downloads"> | string | null
    country?: StringNullableFilter<"pdf_downloads"> | string | null
    city?: StringNullableFilter<"pdf_downloads"> | string | null
    deviceType?: StringNullableFilter<"pdf_downloads"> | string | null
    browser?: StringNullableFilter<"pdf_downloads"> | string | null
    os?: StringNullableFilter<"pdf_downloads"> | string | null
    referrer?: StringNullableFilter<"pdf_downloads"> | string | null
    timestamp?: DateTimeFilter<"pdf_downloads"> | Date | string
  }

  export type pdf_downloadsOrderByWithRelationInput = {
    id?: SortOrder
    filename?: SortOrder
    userId?: SortOrderInput | SortOrder
    userEmail?: SortOrderInput | SortOrder
    ipAddress?: SortOrderInput | SortOrder
    userAgent?: SortOrderInput | SortOrder
    country?: SortOrderInput | SortOrder
    city?: SortOrderInput | SortOrder
    deviceType?: SortOrderInput | SortOrder
    browser?: SortOrderInput | SortOrder
    os?: SortOrderInput | SortOrder
    referrer?: SortOrderInput | SortOrder
    timestamp?: SortOrder
  }

  export type pdf_downloadsWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: pdf_downloadsWhereInput | pdf_downloadsWhereInput[]
    OR?: pdf_downloadsWhereInput[]
    NOT?: pdf_downloadsWhereInput | pdf_downloadsWhereInput[]
    filename?: StringFilter<"pdf_downloads"> | string
    userId?: StringNullableFilter<"pdf_downloads"> | string | null
    userEmail?: StringNullableFilter<"pdf_downloads"> | string | null
    ipAddress?: StringNullableFilter<"pdf_downloads"> | string | null
    userAgent?: StringNullableFilter<"pdf_downloads"> | string | null
    country?: StringNullableFilter<"pdf_downloads"> | string | null
    city?: StringNullableFilter<"pdf_downloads"> | string | null
    deviceType?: StringNullableFilter<"pdf_downloads"> | string | null
    browser?: StringNullableFilter<"pdf_downloads"> | string | null
    os?: StringNullableFilter<"pdf_downloads"> | string | null
    referrer?: StringNullableFilter<"pdf_downloads"> | string | null
    timestamp?: DateTimeFilter<"pdf_downloads"> | Date | string
  }, "id">

  export type pdf_downloadsOrderByWithAggregationInput = {
    id?: SortOrder
    filename?: SortOrder
    userId?: SortOrderInput | SortOrder
    userEmail?: SortOrderInput | SortOrder
    ipAddress?: SortOrderInput | SortOrder
    userAgent?: SortOrderInput | SortOrder
    country?: SortOrderInput | SortOrder
    city?: SortOrderInput | SortOrder
    deviceType?: SortOrderInput | SortOrder
    browser?: SortOrderInput | SortOrder
    os?: SortOrderInput | SortOrder
    referrer?: SortOrderInput | SortOrder
    timestamp?: SortOrder
    _count?: pdf_downloadsCountOrderByAggregateInput
    _max?: pdf_downloadsMaxOrderByAggregateInput
    _min?: pdf_downloadsMinOrderByAggregateInput
  }

  export type pdf_downloadsScalarWhereWithAggregatesInput = {
    AND?: pdf_downloadsScalarWhereWithAggregatesInput | pdf_downloadsScalarWhereWithAggregatesInput[]
    OR?: pdf_downloadsScalarWhereWithAggregatesInput[]
    NOT?: pdf_downloadsScalarWhereWithAggregatesInput | pdf_downloadsScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"pdf_downloads"> | string
    filename?: StringWithAggregatesFilter<"pdf_downloads"> | string
    userId?: StringNullableWithAggregatesFilter<"pdf_downloads"> | string | null
    userEmail?: StringNullableWithAggregatesFilter<"pdf_downloads"> | string | null
    ipAddress?: StringNullableWithAggregatesFilter<"pdf_downloads"> | string | null
    userAgent?: StringNullableWithAggregatesFilter<"pdf_downloads"> | string | null
    country?: StringNullableWithAggregatesFilter<"pdf_downloads"> | string | null
    city?: StringNullableWithAggregatesFilter<"pdf_downloads"> | string | null
    deviceType?: StringNullableWithAggregatesFilter<"pdf_downloads"> | string | null
    browser?: StringNullableWithAggregatesFilter<"pdf_downloads"> | string | null
    os?: StringNullableWithAggregatesFilter<"pdf_downloads"> | string | null
    referrer?: StringNullableWithAggregatesFilter<"pdf_downloads"> | string | null
    timestamp?: DateTimeWithAggregatesFilter<"pdf_downloads"> | Date | string
  }

  export type user_actionsWhereInput = {
    AND?: user_actionsWhereInput | user_actionsWhereInput[]
    OR?: user_actionsWhereInput[]
    NOT?: user_actionsWhereInput | user_actionsWhereInput[]
    id?: StringFilter<"user_actions"> | string
    action?: StringFilter<"user_actions"> | string
    userId?: StringNullableFilter<"user_actions"> | string | null
    userEmail?: StringNullableFilter<"user_actions"> | string | null
    details?: StringNullableFilter<"user_actions"> | string | null
    timestamp?: DateTimeFilter<"user_actions"> | Date | string
  }

  export type user_actionsOrderByWithRelationInput = {
    id?: SortOrder
    action?: SortOrder
    userId?: SortOrderInput | SortOrder
    userEmail?: SortOrderInput | SortOrder
    details?: SortOrderInput | SortOrder
    timestamp?: SortOrder
  }

  export type user_actionsWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: user_actionsWhereInput | user_actionsWhereInput[]
    OR?: user_actionsWhereInput[]
    NOT?: user_actionsWhereInput | user_actionsWhereInput[]
    action?: StringFilter<"user_actions"> | string
    userId?: StringNullableFilter<"user_actions"> | string | null
    userEmail?: StringNullableFilter<"user_actions"> | string | null
    details?: StringNullableFilter<"user_actions"> | string | null
    timestamp?: DateTimeFilter<"user_actions"> | Date | string
  }, "id">

  export type user_actionsOrderByWithAggregationInput = {
    id?: SortOrder
    action?: SortOrder
    userId?: SortOrderInput | SortOrder
    userEmail?: SortOrderInput | SortOrder
    details?: SortOrderInput | SortOrder
    timestamp?: SortOrder
    _count?: user_actionsCountOrderByAggregateInput
    _max?: user_actionsMaxOrderByAggregateInput
    _min?: user_actionsMinOrderByAggregateInput
  }

  export type user_actionsScalarWhereWithAggregatesInput = {
    AND?: user_actionsScalarWhereWithAggregatesInput | user_actionsScalarWhereWithAggregatesInput[]
    OR?: user_actionsScalarWhereWithAggregatesInput[]
    NOT?: user_actionsScalarWhereWithAggregatesInput | user_actionsScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"user_actions"> | string
    action?: StringWithAggregatesFilter<"user_actions"> | string
    userId?: StringNullableWithAggregatesFilter<"user_actions"> | string | null
    userEmail?: StringNullableWithAggregatesFilter<"user_actions"> | string | null
    details?: StringNullableWithAggregatesFilter<"user_actions"> | string | null
    timestamp?: DateTimeWithAggregatesFilter<"user_actions"> | Date | string
  }

  export type user_sessionsWhereInput = {
    AND?: user_sessionsWhereInput | user_sessionsWhereInput[]
    OR?: user_sessionsWhereInput[]
    NOT?: user_sessionsWhereInput | user_sessionsWhereInput[]
    id?: StringFilter<"user_sessions"> | string
    sessionId?: StringFilter<"user_sessions"> | string
    userId?: StringNullableFilter<"user_sessions"> | string | null
    userEmail?: StringNullableFilter<"user_sessions"> | string | null
    ipAddress?: StringNullableFilter<"user_sessions"> | string | null
    country?: StringNullableFilter<"user_sessions"> | string | null
    deviceType?: StringNullableFilter<"user_sessions"> | string | null
    browser?: StringNullableFilter<"user_sessions"> | string | null
    os?: StringNullableFilter<"user_sessions"> | string | null
    screenWidth?: IntNullableFilter<"user_sessions"> | number | null
    screenHeight?: IntNullableFilter<"user_sessions"> | number | null
    startTime?: DateTimeFilter<"user_sessions"> | Date | string
    endTime?: DateTimeNullableFilter<"user_sessions"> | Date | string | null
    pageViews?: IntFilter<"user_sessions"> | number
    duration?: IntNullableFilter<"user_sessions"> | number | null
    isBounce?: BoolFilter<"user_sessions"> | boolean
    referrer?: StringNullableFilter<"user_sessions"> | string | null
  }

  export type user_sessionsOrderByWithRelationInput = {
    id?: SortOrder
    sessionId?: SortOrder
    userId?: SortOrderInput | SortOrder
    userEmail?: SortOrderInput | SortOrder
    ipAddress?: SortOrderInput | SortOrder
    country?: SortOrderInput | SortOrder
    deviceType?: SortOrderInput | SortOrder
    browser?: SortOrderInput | SortOrder
    os?: SortOrderInput | SortOrder
    screenWidth?: SortOrderInput | SortOrder
    screenHeight?: SortOrderInput | SortOrder
    startTime?: SortOrder
    endTime?: SortOrderInput | SortOrder
    pageViews?: SortOrder
    duration?: SortOrderInput | SortOrder
    isBounce?: SortOrder
    referrer?: SortOrderInput | SortOrder
  }

  export type user_sessionsWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    sessionId?: string
    AND?: user_sessionsWhereInput | user_sessionsWhereInput[]
    OR?: user_sessionsWhereInput[]
    NOT?: user_sessionsWhereInput | user_sessionsWhereInput[]
    userId?: StringNullableFilter<"user_sessions"> | string | null
    userEmail?: StringNullableFilter<"user_sessions"> | string | null
    ipAddress?: StringNullableFilter<"user_sessions"> | string | null
    country?: StringNullableFilter<"user_sessions"> | string | null
    deviceType?: StringNullableFilter<"user_sessions"> | string | null
    browser?: StringNullableFilter<"user_sessions"> | string | null
    os?: StringNullableFilter<"user_sessions"> | string | null
    screenWidth?: IntNullableFilter<"user_sessions"> | number | null
    screenHeight?: IntNullableFilter<"user_sessions"> | number | null
    startTime?: DateTimeFilter<"user_sessions"> | Date | string
    endTime?: DateTimeNullableFilter<"user_sessions"> | Date | string | null
    pageViews?: IntFilter<"user_sessions"> | number
    duration?: IntNullableFilter<"user_sessions"> | number | null
    isBounce?: BoolFilter<"user_sessions"> | boolean
    referrer?: StringNullableFilter<"user_sessions"> | string | null
  }, "id" | "sessionId">

  export type user_sessionsOrderByWithAggregationInput = {
    id?: SortOrder
    sessionId?: SortOrder
    userId?: SortOrderInput | SortOrder
    userEmail?: SortOrderInput | SortOrder
    ipAddress?: SortOrderInput | SortOrder
    country?: SortOrderInput | SortOrder
    deviceType?: SortOrderInput | SortOrder
    browser?: SortOrderInput | SortOrder
    os?: SortOrderInput | SortOrder
    screenWidth?: SortOrderInput | SortOrder
    screenHeight?: SortOrderInput | SortOrder
    startTime?: SortOrder
    endTime?: SortOrderInput | SortOrder
    pageViews?: SortOrder
    duration?: SortOrderInput | SortOrder
    isBounce?: SortOrder
    referrer?: SortOrderInput | SortOrder
    _count?: user_sessionsCountOrderByAggregateInput
    _avg?: user_sessionsAvgOrderByAggregateInput
    _max?: user_sessionsMaxOrderByAggregateInput
    _min?: user_sessionsMinOrderByAggregateInput
    _sum?: user_sessionsSumOrderByAggregateInput
  }

  export type user_sessionsScalarWhereWithAggregatesInput = {
    AND?: user_sessionsScalarWhereWithAggregatesInput | user_sessionsScalarWhereWithAggregatesInput[]
    OR?: user_sessionsScalarWhereWithAggregatesInput[]
    NOT?: user_sessionsScalarWhereWithAggregatesInput | user_sessionsScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"user_sessions"> | string
    sessionId?: StringWithAggregatesFilter<"user_sessions"> | string
    userId?: StringNullableWithAggregatesFilter<"user_sessions"> | string | null
    userEmail?: StringNullableWithAggregatesFilter<"user_sessions"> | string | null
    ipAddress?: StringNullableWithAggregatesFilter<"user_sessions"> | string | null
    country?: StringNullableWithAggregatesFilter<"user_sessions"> | string | null
    deviceType?: StringNullableWithAggregatesFilter<"user_sessions"> | string | null
    browser?: StringNullableWithAggregatesFilter<"user_sessions"> | string | null
    os?: StringNullableWithAggregatesFilter<"user_sessions"> | string | null
    screenWidth?: IntNullableWithAggregatesFilter<"user_sessions"> | number | null
    screenHeight?: IntNullableWithAggregatesFilter<"user_sessions"> | number | null
    startTime?: DateTimeWithAggregatesFilter<"user_sessions"> | Date | string
    endTime?: DateTimeNullableWithAggregatesFilter<"user_sessions"> | Date | string | null
    pageViews?: IntWithAggregatesFilter<"user_sessions"> | number
    duration?: IntNullableWithAggregatesFilter<"user_sessions"> | number | null
    isBounce?: BoolWithAggregatesFilter<"user_sessions"> | boolean
    referrer?: StringNullableWithAggregatesFilter<"user_sessions"> | string | null
  }

  export type UserCreateInput = {
    id?: string
    email: string
    name: string
    password: string
    phone?: string | null
    address?: string | null
    profilePicture?: string | null
    isAdmin?: boolean
    canSeePrices?: boolean
    discountType?: string | null
    discountPercentage?: number | null
    birthday?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    lastLoginAt?: Date | string | null
    orders?: OrderCreateNestedManyWithoutUsersInput
  }

  export type UserUncheckedCreateInput = {
    id?: string
    email: string
    name: string
    password: string
    phone?: string | null
    address?: string | null
    profilePicture?: string | null
    isAdmin?: boolean
    canSeePrices?: boolean
    discountType?: string | null
    discountPercentage?: number | null
    birthday?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    lastLoginAt?: Date | string | null
    orders?: OrderUncheckedCreateNestedManyWithoutUsersInput
  }

  export type UserUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    password?: StringFieldUpdateOperationsInput | string
    phone?: NullableStringFieldUpdateOperationsInput | string | null
    address?: NullableStringFieldUpdateOperationsInput | string | null
    profilePicture?: NullableStringFieldUpdateOperationsInput | string | null
    isAdmin?: BoolFieldUpdateOperationsInput | boolean
    canSeePrices?: BoolFieldUpdateOperationsInput | boolean
    discountType?: NullableStringFieldUpdateOperationsInput | string | null
    discountPercentage?: NullableFloatFieldUpdateOperationsInput | number | null
    birthday?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    lastLoginAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    orders?: OrderUpdateManyWithoutUsersNestedInput
  }

  export type UserUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    password?: StringFieldUpdateOperationsInput | string
    phone?: NullableStringFieldUpdateOperationsInput | string | null
    address?: NullableStringFieldUpdateOperationsInput | string | null
    profilePicture?: NullableStringFieldUpdateOperationsInput | string | null
    isAdmin?: BoolFieldUpdateOperationsInput | boolean
    canSeePrices?: BoolFieldUpdateOperationsInput | boolean
    discountType?: NullableStringFieldUpdateOperationsInput | string | null
    discountPercentage?: NullableFloatFieldUpdateOperationsInput | number | null
    birthday?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    lastLoginAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    orders?: OrderUncheckedUpdateManyWithoutUsersNestedInput
  }

  export type UserCreateManyInput = {
    id?: string
    email: string
    name: string
    password: string
    phone?: string | null
    address?: string | null
    profilePicture?: string | null
    isAdmin?: boolean
    canSeePrices?: boolean
    discountType?: string | null
    discountPercentage?: number | null
    birthday?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    lastLoginAt?: Date | string | null
  }

  export type UserUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    password?: StringFieldUpdateOperationsInput | string
    phone?: NullableStringFieldUpdateOperationsInput | string | null
    address?: NullableStringFieldUpdateOperationsInput | string | null
    profilePicture?: NullableStringFieldUpdateOperationsInput | string | null
    isAdmin?: BoolFieldUpdateOperationsInput | boolean
    canSeePrices?: BoolFieldUpdateOperationsInput | boolean
    discountType?: NullableStringFieldUpdateOperationsInput | string | null
    discountPercentage?: NullableFloatFieldUpdateOperationsInput | number | null
    birthday?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    lastLoginAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
  }

  export type UserUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    password?: StringFieldUpdateOperationsInput | string
    phone?: NullableStringFieldUpdateOperationsInput | string | null
    address?: NullableStringFieldUpdateOperationsInput | string | null
    profilePicture?: NullableStringFieldUpdateOperationsInput | string | null
    isAdmin?: BoolFieldUpdateOperationsInput | boolean
    canSeePrices?: BoolFieldUpdateOperationsInput | boolean
    discountType?: NullableStringFieldUpdateOperationsInput | string | null
    discountPercentage?: NullableFloatFieldUpdateOperationsInput | number | null
    birthday?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    lastLoginAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
  }

  export type ProductCreateInput = {
    id?: string
    name: string
    price: number
    description: string
    image: string
    category: string
    inStock?: boolean
    size?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    images?: string | null
    productNumber?: string | null
    ageGroup?: string | null
    skinType?: string | null
    targetConcerns?: string | null
    usage?: string | null
  }

  export type ProductUncheckedCreateInput = {
    id?: string
    name: string
    price: number
    description: string
    image: string
    category: string
    inStock?: boolean
    size?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    images?: string | null
    productNumber?: string | null
    ageGroup?: string | null
    skinType?: string | null
    targetConcerns?: string | null
    usage?: string | null
  }

  export type ProductUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    price?: FloatFieldUpdateOperationsInput | number
    description?: StringFieldUpdateOperationsInput | string
    image?: StringFieldUpdateOperationsInput | string
    category?: StringFieldUpdateOperationsInput | string
    inStock?: BoolFieldUpdateOperationsInput | boolean
    size?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    images?: NullableStringFieldUpdateOperationsInput | string | null
    productNumber?: NullableStringFieldUpdateOperationsInput | string | null
    ageGroup?: NullableStringFieldUpdateOperationsInput | string | null
    skinType?: NullableStringFieldUpdateOperationsInput | string | null
    targetConcerns?: NullableStringFieldUpdateOperationsInput | string | null
    usage?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type ProductUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    price?: FloatFieldUpdateOperationsInput | number
    description?: StringFieldUpdateOperationsInput | string
    image?: StringFieldUpdateOperationsInput | string
    category?: StringFieldUpdateOperationsInput | string
    inStock?: BoolFieldUpdateOperationsInput | boolean
    size?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    images?: NullableStringFieldUpdateOperationsInput | string | null
    productNumber?: NullableStringFieldUpdateOperationsInput | string | null
    ageGroup?: NullableStringFieldUpdateOperationsInput | string | null
    skinType?: NullableStringFieldUpdateOperationsInput | string | null
    targetConcerns?: NullableStringFieldUpdateOperationsInput | string | null
    usage?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type ProductCreateManyInput = {
    id?: string
    name: string
    price: number
    description: string
    image: string
    category: string
    inStock?: boolean
    size?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    images?: string | null
    productNumber?: string | null
    ageGroup?: string | null
    skinType?: string | null
    targetConcerns?: string | null
    usage?: string | null
  }

  export type ProductUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    price?: FloatFieldUpdateOperationsInput | number
    description?: StringFieldUpdateOperationsInput | string
    image?: StringFieldUpdateOperationsInput | string
    category?: StringFieldUpdateOperationsInput | string
    inStock?: BoolFieldUpdateOperationsInput | boolean
    size?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    images?: NullableStringFieldUpdateOperationsInput | string | null
    productNumber?: NullableStringFieldUpdateOperationsInput | string | null
    ageGroup?: NullableStringFieldUpdateOperationsInput | string | null
    skinType?: NullableStringFieldUpdateOperationsInput | string | null
    targetConcerns?: NullableStringFieldUpdateOperationsInput | string | null
    usage?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type ProductUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    price?: FloatFieldUpdateOperationsInput | number
    description?: StringFieldUpdateOperationsInput | string
    image?: StringFieldUpdateOperationsInput | string
    category?: StringFieldUpdateOperationsInput | string
    inStock?: BoolFieldUpdateOperationsInput | boolean
    size?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    images?: NullableStringFieldUpdateOperationsInput | string | null
    productNumber?: NullableStringFieldUpdateOperationsInput | string | null
    ageGroup?: NullableStringFieldUpdateOperationsInput | string | null
    skinType?: NullableStringFieldUpdateOperationsInput | string | null
    targetConcerns?: NullableStringFieldUpdateOperationsInput | string | null
    usage?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type OrderCreateInput = {
    id?: string
    orderNumber: string
    customerName: string
    customerPhone: string
    customerEmirate: string
    customerAddress: string
    subtotal: number
    discountAmount?: number
    shipping?: number
    vat: number
    total: number
    status?: string
    sessionId?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    orderItems?: OrderItemCreateNestedManyWithoutOrderInput
    users: UserCreateNestedOneWithoutOrdersInput
  }

  export type OrderUncheckedCreateInput = {
    id?: string
    orderNumber: string
    customerEmail: string
    customerName: string
    customerPhone: string
    customerEmirate: string
    customerAddress: string
    subtotal: number
    discountAmount?: number
    shipping?: number
    vat: number
    total: number
    status?: string
    sessionId?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    orderItems?: OrderItemUncheckedCreateNestedManyWithoutOrderInput
  }

  export type OrderUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    orderNumber?: StringFieldUpdateOperationsInput | string
    customerName?: StringFieldUpdateOperationsInput | string
    customerPhone?: StringFieldUpdateOperationsInput | string
    customerEmirate?: StringFieldUpdateOperationsInput | string
    customerAddress?: StringFieldUpdateOperationsInput | string
    subtotal?: FloatFieldUpdateOperationsInput | number
    discountAmount?: FloatFieldUpdateOperationsInput | number
    shipping?: FloatFieldUpdateOperationsInput | number
    vat?: FloatFieldUpdateOperationsInput | number
    total?: FloatFieldUpdateOperationsInput | number
    status?: StringFieldUpdateOperationsInput | string
    sessionId?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    orderItems?: OrderItemUpdateManyWithoutOrderNestedInput
    users?: UserUpdateOneRequiredWithoutOrdersNestedInput
  }

  export type OrderUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    orderNumber?: StringFieldUpdateOperationsInput | string
    customerEmail?: StringFieldUpdateOperationsInput | string
    customerName?: StringFieldUpdateOperationsInput | string
    customerPhone?: StringFieldUpdateOperationsInput | string
    customerEmirate?: StringFieldUpdateOperationsInput | string
    customerAddress?: StringFieldUpdateOperationsInput | string
    subtotal?: FloatFieldUpdateOperationsInput | number
    discountAmount?: FloatFieldUpdateOperationsInput | number
    shipping?: FloatFieldUpdateOperationsInput | number
    vat?: FloatFieldUpdateOperationsInput | number
    total?: FloatFieldUpdateOperationsInput | number
    status?: StringFieldUpdateOperationsInput | string
    sessionId?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    orderItems?: OrderItemUncheckedUpdateManyWithoutOrderNestedInput
  }

  export type OrderCreateManyInput = {
    id?: string
    orderNumber: string
    customerEmail: string
    customerName: string
    customerPhone: string
    customerEmirate: string
    customerAddress: string
    subtotal: number
    discountAmount?: number
    shipping?: number
    vat: number
    total: number
    status?: string
    sessionId?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type OrderUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    orderNumber?: StringFieldUpdateOperationsInput | string
    customerName?: StringFieldUpdateOperationsInput | string
    customerPhone?: StringFieldUpdateOperationsInput | string
    customerEmirate?: StringFieldUpdateOperationsInput | string
    customerAddress?: StringFieldUpdateOperationsInput | string
    subtotal?: FloatFieldUpdateOperationsInput | number
    discountAmount?: FloatFieldUpdateOperationsInput | number
    shipping?: FloatFieldUpdateOperationsInput | number
    vat?: FloatFieldUpdateOperationsInput | number
    total?: FloatFieldUpdateOperationsInput | number
    status?: StringFieldUpdateOperationsInput | string
    sessionId?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type OrderUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    orderNumber?: StringFieldUpdateOperationsInput | string
    customerEmail?: StringFieldUpdateOperationsInput | string
    customerName?: StringFieldUpdateOperationsInput | string
    customerPhone?: StringFieldUpdateOperationsInput | string
    customerEmirate?: StringFieldUpdateOperationsInput | string
    customerAddress?: StringFieldUpdateOperationsInput | string
    subtotal?: FloatFieldUpdateOperationsInput | number
    discountAmount?: FloatFieldUpdateOperationsInput | number
    shipping?: FloatFieldUpdateOperationsInput | number
    vat?: FloatFieldUpdateOperationsInput | number
    total?: FloatFieldUpdateOperationsInput | number
    status?: StringFieldUpdateOperationsInput | string
    sessionId?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type OrderItemCreateInput = {
    id?: string
    productId: string
    productName: string
    price: number
    quantity: number
    image: string
    order: OrderCreateNestedOneWithoutOrderItemsInput
  }

  export type OrderItemUncheckedCreateInput = {
    id?: string
    orderId: string
    productId: string
    productName: string
    price: number
    quantity: number
    image: string
  }

  export type OrderItemUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    productId?: StringFieldUpdateOperationsInput | string
    productName?: StringFieldUpdateOperationsInput | string
    price?: FloatFieldUpdateOperationsInput | number
    quantity?: IntFieldUpdateOperationsInput | number
    image?: StringFieldUpdateOperationsInput | string
    order?: OrderUpdateOneRequiredWithoutOrderItemsNestedInput
  }

  export type OrderItemUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    orderId?: StringFieldUpdateOperationsInput | string
    productId?: StringFieldUpdateOperationsInput | string
    productName?: StringFieldUpdateOperationsInput | string
    price?: FloatFieldUpdateOperationsInput | number
    quantity?: IntFieldUpdateOperationsInput | number
    image?: StringFieldUpdateOperationsInput | string
  }

  export type OrderItemCreateManyInput = {
    id?: string
    orderId: string
    productId: string
    productName: string
    price: number
    quantity: number
    image: string
  }

  export type OrderItemUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    productId?: StringFieldUpdateOperationsInput | string
    productName?: StringFieldUpdateOperationsInput | string
    price?: FloatFieldUpdateOperationsInput | number
    quantity?: IntFieldUpdateOperationsInput | number
    image?: StringFieldUpdateOperationsInput | string
  }

  export type OrderItemUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    orderId?: StringFieldUpdateOperationsInput | string
    productId?: StringFieldUpdateOperationsInput | string
    productName?: StringFieldUpdateOperationsInput | string
    price?: FloatFieldUpdateOperationsInput | number
    quantity?: IntFieldUpdateOperationsInput | number
    image?: StringFieldUpdateOperationsInput | string
  }

  export type page_viewsCreateInput = {
    id: string
    page: string
    userId?: string | null
    userEmail?: string | null
    userAgent?: string | null
    ipAddress?: string | null
    country?: string | null
    referrer?: string | null
    timestamp?: Date | string
    browser?: string | null
    deviceType?: string | null
    os?: string | null
    screenHeight?: number | null
    screenWidth?: number | null
    city?: string | null
  }

  export type page_viewsUncheckedCreateInput = {
    id: string
    page: string
    userId?: string | null
    userEmail?: string | null
    userAgent?: string | null
    ipAddress?: string | null
    country?: string | null
    referrer?: string | null
    timestamp?: Date | string
    browser?: string | null
    deviceType?: string | null
    os?: string | null
    screenHeight?: number | null
    screenWidth?: number | null
    city?: string | null
  }

  export type page_viewsUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    page?: StringFieldUpdateOperationsInput | string
    userId?: NullableStringFieldUpdateOperationsInput | string | null
    userEmail?: NullableStringFieldUpdateOperationsInput | string | null
    userAgent?: NullableStringFieldUpdateOperationsInput | string | null
    ipAddress?: NullableStringFieldUpdateOperationsInput | string | null
    country?: NullableStringFieldUpdateOperationsInput | string | null
    referrer?: NullableStringFieldUpdateOperationsInput | string | null
    timestamp?: DateTimeFieldUpdateOperationsInput | Date | string
    browser?: NullableStringFieldUpdateOperationsInput | string | null
    deviceType?: NullableStringFieldUpdateOperationsInput | string | null
    os?: NullableStringFieldUpdateOperationsInput | string | null
    screenHeight?: NullableIntFieldUpdateOperationsInput | number | null
    screenWidth?: NullableIntFieldUpdateOperationsInput | number | null
    city?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type page_viewsUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    page?: StringFieldUpdateOperationsInput | string
    userId?: NullableStringFieldUpdateOperationsInput | string | null
    userEmail?: NullableStringFieldUpdateOperationsInput | string | null
    userAgent?: NullableStringFieldUpdateOperationsInput | string | null
    ipAddress?: NullableStringFieldUpdateOperationsInput | string | null
    country?: NullableStringFieldUpdateOperationsInput | string | null
    referrer?: NullableStringFieldUpdateOperationsInput | string | null
    timestamp?: DateTimeFieldUpdateOperationsInput | Date | string
    browser?: NullableStringFieldUpdateOperationsInput | string | null
    deviceType?: NullableStringFieldUpdateOperationsInput | string | null
    os?: NullableStringFieldUpdateOperationsInput | string | null
    screenHeight?: NullableIntFieldUpdateOperationsInput | number | null
    screenWidth?: NullableIntFieldUpdateOperationsInput | number | null
    city?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type page_viewsCreateManyInput = {
    id: string
    page: string
    userId?: string | null
    userEmail?: string | null
    userAgent?: string | null
    ipAddress?: string | null
    country?: string | null
    referrer?: string | null
    timestamp?: Date | string
    browser?: string | null
    deviceType?: string | null
    os?: string | null
    screenHeight?: number | null
    screenWidth?: number | null
    city?: string | null
  }

  export type page_viewsUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    page?: StringFieldUpdateOperationsInput | string
    userId?: NullableStringFieldUpdateOperationsInput | string | null
    userEmail?: NullableStringFieldUpdateOperationsInput | string | null
    userAgent?: NullableStringFieldUpdateOperationsInput | string | null
    ipAddress?: NullableStringFieldUpdateOperationsInput | string | null
    country?: NullableStringFieldUpdateOperationsInput | string | null
    referrer?: NullableStringFieldUpdateOperationsInput | string | null
    timestamp?: DateTimeFieldUpdateOperationsInput | Date | string
    browser?: NullableStringFieldUpdateOperationsInput | string | null
    deviceType?: NullableStringFieldUpdateOperationsInput | string | null
    os?: NullableStringFieldUpdateOperationsInput | string | null
    screenHeight?: NullableIntFieldUpdateOperationsInput | number | null
    screenWidth?: NullableIntFieldUpdateOperationsInput | number | null
    city?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type page_viewsUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    page?: StringFieldUpdateOperationsInput | string
    userId?: NullableStringFieldUpdateOperationsInput | string | null
    userEmail?: NullableStringFieldUpdateOperationsInput | string | null
    userAgent?: NullableStringFieldUpdateOperationsInput | string | null
    ipAddress?: NullableStringFieldUpdateOperationsInput | string | null
    country?: NullableStringFieldUpdateOperationsInput | string | null
    referrer?: NullableStringFieldUpdateOperationsInput | string | null
    timestamp?: DateTimeFieldUpdateOperationsInput | Date | string
    browser?: NullableStringFieldUpdateOperationsInput | string | null
    deviceType?: NullableStringFieldUpdateOperationsInput | string | null
    os?: NullableStringFieldUpdateOperationsInput | string | null
    screenHeight?: NullableIntFieldUpdateOperationsInput | number | null
    screenWidth?: NullableIntFieldUpdateOperationsInput | number | null
    city?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type pdf_downloadsCreateInput = {
    id: string
    filename: string
    userId?: string | null
    userEmail?: string | null
    ipAddress?: string | null
    userAgent?: string | null
    country?: string | null
    city?: string | null
    deviceType?: string | null
    browser?: string | null
    os?: string | null
    referrer?: string | null
    timestamp?: Date | string
  }

  export type pdf_downloadsUncheckedCreateInput = {
    id: string
    filename: string
    userId?: string | null
    userEmail?: string | null
    ipAddress?: string | null
    userAgent?: string | null
    country?: string | null
    city?: string | null
    deviceType?: string | null
    browser?: string | null
    os?: string | null
    referrer?: string | null
    timestamp?: Date | string
  }

  export type pdf_downloadsUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    filename?: StringFieldUpdateOperationsInput | string
    userId?: NullableStringFieldUpdateOperationsInput | string | null
    userEmail?: NullableStringFieldUpdateOperationsInput | string | null
    ipAddress?: NullableStringFieldUpdateOperationsInput | string | null
    userAgent?: NullableStringFieldUpdateOperationsInput | string | null
    country?: NullableStringFieldUpdateOperationsInput | string | null
    city?: NullableStringFieldUpdateOperationsInput | string | null
    deviceType?: NullableStringFieldUpdateOperationsInput | string | null
    browser?: NullableStringFieldUpdateOperationsInput | string | null
    os?: NullableStringFieldUpdateOperationsInput | string | null
    referrer?: NullableStringFieldUpdateOperationsInput | string | null
    timestamp?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type pdf_downloadsUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    filename?: StringFieldUpdateOperationsInput | string
    userId?: NullableStringFieldUpdateOperationsInput | string | null
    userEmail?: NullableStringFieldUpdateOperationsInput | string | null
    ipAddress?: NullableStringFieldUpdateOperationsInput | string | null
    userAgent?: NullableStringFieldUpdateOperationsInput | string | null
    country?: NullableStringFieldUpdateOperationsInput | string | null
    city?: NullableStringFieldUpdateOperationsInput | string | null
    deviceType?: NullableStringFieldUpdateOperationsInput | string | null
    browser?: NullableStringFieldUpdateOperationsInput | string | null
    os?: NullableStringFieldUpdateOperationsInput | string | null
    referrer?: NullableStringFieldUpdateOperationsInput | string | null
    timestamp?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type pdf_downloadsCreateManyInput = {
    id: string
    filename: string
    userId?: string | null
    userEmail?: string | null
    ipAddress?: string | null
    userAgent?: string | null
    country?: string | null
    city?: string | null
    deviceType?: string | null
    browser?: string | null
    os?: string | null
    referrer?: string | null
    timestamp?: Date | string
  }

  export type pdf_downloadsUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    filename?: StringFieldUpdateOperationsInput | string
    userId?: NullableStringFieldUpdateOperationsInput | string | null
    userEmail?: NullableStringFieldUpdateOperationsInput | string | null
    ipAddress?: NullableStringFieldUpdateOperationsInput | string | null
    userAgent?: NullableStringFieldUpdateOperationsInput | string | null
    country?: NullableStringFieldUpdateOperationsInput | string | null
    city?: NullableStringFieldUpdateOperationsInput | string | null
    deviceType?: NullableStringFieldUpdateOperationsInput | string | null
    browser?: NullableStringFieldUpdateOperationsInput | string | null
    os?: NullableStringFieldUpdateOperationsInput | string | null
    referrer?: NullableStringFieldUpdateOperationsInput | string | null
    timestamp?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type pdf_downloadsUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    filename?: StringFieldUpdateOperationsInput | string
    userId?: NullableStringFieldUpdateOperationsInput | string | null
    userEmail?: NullableStringFieldUpdateOperationsInput | string | null
    ipAddress?: NullableStringFieldUpdateOperationsInput | string | null
    userAgent?: NullableStringFieldUpdateOperationsInput | string | null
    country?: NullableStringFieldUpdateOperationsInput | string | null
    city?: NullableStringFieldUpdateOperationsInput | string | null
    deviceType?: NullableStringFieldUpdateOperationsInput | string | null
    browser?: NullableStringFieldUpdateOperationsInput | string | null
    os?: NullableStringFieldUpdateOperationsInput | string | null
    referrer?: NullableStringFieldUpdateOperationsInput | string | null
    timestamp?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type user_actionsCreateInput = {
    id: string
    action: string
    userId?: string | null
    userEmail?: string | null
    details?: string | null
    timestamp?: Date | string
  }

  export type user_actionsUncheckedCreateInput = {
    id: string
    action: string
    userId?: string | null
    userEmail?: string | null
    details?: string | null
    timestamp?: Date | string
  }

  export type user_actionsUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    action?: StringFieldUpdateOperationsInput | string
    userId?: NullableStringFieldUpdateOperationsInput | string | null
    userEmail?: NullableStringFieldUpdateOperationsInput | string | null
    details?: NullableStringFieldUpdateOperationsInput | string | null
    timestamp?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type user_actionsUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    action?: StringFieldUpdateOperationsInput | string
    userId?: NullableStringFieldUpdateOperationsInput | string | null
    userEmail?: NullableStringFieldUpdateOperationsInput | string | null
    details?: NullableStringFieldUpdateOperationsInput | string | null
    timestamp?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type user_actionsCreateManyInput = {
    id: string
    action: string
    userId?: string | null
    userEmail?: string | null
    details?: string | null
    timestamp?: Date | string
  }

  export type user_actionsUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    action?: StringFieldUpdateOperationsInput | string
    userId?: NullableStringFieldUpdateOperationsInput | string | null
    userEmail?: NullableStringFieldUpdateOperationsInput | string | null
    details?: NullableStringFieldUpdateOperationsInput | string | null
    timestamp?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type user_actionsUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    action?: StringFieldUpdateOperationsInput | string
    userId?: NullableStringFieldUpdateOperationsInput | string | null
    userEmail?: NullableStringFieldUpdateOperationsInput | string | null
    details?: NullableStringFieldUpdateOperationsInput | string | null
    timestamp?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type user_sessionsCreateInput = {
    id: string
    sessionId: string
    userId?: string | null
    userEmail?: string | null
    ipAddress?: string | null
    country?: string | null
    deviceType?: string | null
    browser?: string | null
    os?: string | null
    screenWidth?: number | null
    screenHeight?: number | null
    startTime?: Date | string
    endTime?: Date | string | null
    pageViews?: number
    duration?: number | null
    isBounce?: boolean
    referrer?: string | null
  }

  export type user_sessionsUncheckedCreateInput = {
    id: string
    sessionId: string
    userId?: string | null
    userEmail?: string | null
    ipAddress?: string | null
    country?: string | null
    deviceType?: string | null
    browser?: string | null
    os?: string | null
    screenWidth?: number | null
    screenHeight?: number | null
    startTime?: Date | string
    endTime?: Date | string | null
    pageViews?: number
    duration?: number | null
    isBounce?: boolean
    referrer?: string | null
  }

  export type user_sessionsUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    sessionId?: StringFieldUpdateOperationsInput | string
    userId?: NullableStringFieldUpdateOperationsInput | string | null
    userEmail?: NullableStringFieldUpdateOperationsInput | string | null
    ipAddress?: NullableStringFieldUpdateOperationsInput | string | null
    country?: NullableStringFieldUpdateOperationsInput | string | null
    deviceType?: NullableStringFieldUpdateOperationsInput | string | null
    browser?: NullableStringFieldUpdateOperationsInput | string | null
    os?: NullableStringFieldUpdateOperationsInput | string | null
    screenWidth?: NullableIntFieldUpdateOperationsInput | number | null
    screenHeight?: NullableIntFieldUpdateOperationsInput | number | null
    startTime?: DateTimeFieldUpdateOperationsInput | Date | string
    endTime?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    pageViews?: IntFieldUpdateOperationsInput | number
    duration?: NullableIntFieldUpdateOperationsInput | number | null
    isBounce?: BoolFieldUpdateOperationsInput | boolean
    referrer?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type user_sessionsUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    sessionId?: StringFieldUpdateOperationsInput | string
    userId?: NullableStringFieldUpdateOperationsInput | string | null
    userEmail?: NullableStringFieldUpdateOperationsInput | string | null
    ipAddress?: NullableStringFieldUpdateOperationsInput | string | null
    country?: NullableStringFieldUpdateOperationsInput | string | null
    deviceType?: NullableStringFieldUpdateOperationsInput | string | null
    browser?: NullableStringFieldUpdateOperationsInput | string | null
    os?: NullableStringFieldUpdateOperationsInput | string | null
    screenWidth?: NullableIntFieldUpdateOperationsInput | number | null
    screenHeight?: NullableIntFieldUpdateOperationsInput | number | null
    startTime?: DateTimeFieldUpdateOperationsInput | Date | string
    endTime?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    pageViews?: IntFieldUpdateOperationsInput | number
    duration?: NullableIntFieldUpdateOperationsInput | number | null
    isBounce?: BoolFieldUpdateOperationsInput | boolean
    referrer?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type user_sessionsCreateManyInput = {
    id: string
    sessionId: string
    userId?: string | null
    userEmail?: string | null
    ipAddress?: string | null
    country?: string | null
    deviceType?: string | null
    browser?: string | null
    os?: string | null
    screenWidth?: number | null
    screenHeight?: number | null
    startTime?: Date | string
    endTime?: Date | string | null
    pageViews?: number
    duration?: number | null
    isBounce?: boolean
    referrer?: string | null
  }

  export type user_sessionsUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    sessionId?: StringFieldUpdateOperationsInput | string
    userId?: NullableStringFieldUpdateOperationsInput | string | null
    userEmail?: NullableStringFieldUpdateOperationsInput | string | null
    ipAddress?: NullableStringFieldUpdateOperationsInput | string | null
    country?: NullableStringFieldUpdateOperationsInput | string | null
    deviceType?: NullableStringFieldUpdateOperationsInput | string | null
    browser?: NullableStringFieldUpdateOperationsInput | string | null
    os?: NullableStringFieldUpdateOperationsInput | string | null
    screenWidth?: NullableIntFieldUpdateOperationsInput | number | null
    screenHeight?: NullableIntFieldUpdateOperationsInput | number | null
    startTime?: DateTimeFieldUpdateOperationsInput | Date | string
    endTime?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    pageViews?: IntFieldUpdateOperationsInput | number
    duration?: NullableIntFieldUpdateOperationsInput | number | null
    isBounce?: BoolFieldUpdateOperationsInput | boolean
    referrer?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type user_sessionsUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    sessionId?: StringFieldUpdateOperationsInput | string
    userId?: NullableStringFieldUpdateOperationsInput | string | null
    userEmail?: NullableStringFieldUpdateOperationsInput | string | null
    ipAddress?: NullableStringFieldUpdateOperationsInput | string | null
    country?: NullableStringFieldUpdateOperationsInput | string | null
    deviceType?: NullableStringFieldUpdateOperationsInput | string | null
    browser?: NullableStringFieldUpdateOperationsInput | string | null
    os?: NullableStringFieldUpdateOperationsInput | string | null
    screenWidth?: NullableIntFieldUpdateOperationsInput | number | null
    screenHeight?: NullableIntFieldUpdateOperationsInput | number | null
    startTime?: DateTimeFieldUpdateOperationsInput | Date | string
    endTime?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    pageViews?: IntFieldUpdateOperationsInput | number
    duration?: NullableIntFieldUpdateOperationsInput | number | null
    isBounce?: BoolFieldUpdateOperationsInput | boolean
    referrer?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type StringFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedStringFilter<$PrismaModel> | string
  }

  export type StringNullableFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedStringNullableFilter<$PrismaModel> | string | null
  }

  export type BoolFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolFilter<$PrismaModel> | boolean
  }

  export type FloatNullableFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel> | null
    in?: number[] | ListFloatFieldRefInput<$PrismaModel> | null
    notIn?: number[] | ListFloatFieldRefInput<$PrismaModel> | null
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatNullableFilter<$PrismaModel> | number | null
  }

  export type DateTimeFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeFilter<$PrismaModel> | Date | string
  }

  export type DateTimeNullableFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel> | null
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeNullableFilter<$PrismaModel> | Date | string | null
  }

  export type OrderListRelationFilter = {
    every?: OrderWhereInput
    some?: OrderWhereInput
    none?: OrderWhereInput
  }

  export type SortOrderInput = {
    sort: SortOrder
    nulls?: NullsOrder
  }

  export type OrderOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type UserCountOrderByAggregateInput = {
    id?: SortOrder
    email?: SortOrder
    name?: SortOrder
    password?: SortOrder
    phone?: SortOrder
    address?: SortOrder
    profilePicture?: SortOrder
    isAdmin?: SortOrder
    canSeePrices?: SortOrder
    discountType?: SortOrder
    discountPercentage?: SortOrder
    birthday?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    lastLoginAt?: SortOrder
  }

  export type UserAvgOrderByAggregateInput = {
    discountPercentage?: SortOrder
  }

  export type UserMaxOrderByAggregateInput = {
    id?: SortOrder
    email?: SortOrder
    name?: SortOrder
    password?: SortOrder
    phone?: SortOrder
    address?: SortOrder
    profilePicture?: SortOrder
    isAdmin?: SortOrder
    canSeePrices?: SortOrder
    discountType?: SortOrder
    discountPercentage?: SortOrder
    birthday?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    lastLoginAt?: SortOrder
  }

  export type UserMinOrderByAggregateInput = {
    id?: SortOrder
    email?: SortOrder
    name?: SortOrder
    password?: SortOrder
    phone?: SortOrder
    address?: SortOrder
    profilePicture?: SortOrder
    isAdmin?: SortOrder
    canSeePrices?: SortOrder
    discountType?: SortOrder
    discountPercentage?: SortOrder
    birthday?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    lastLoginAt?: SortOrder
  }

  export type UserSumOrderByAggregateInput = {
    discountPercentage?: SortOrder
  }

  export type StringWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedStringWithAggregatesFilter<$PrismaModel> | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedStringFilter<$PrismaModel>
    _max?: NestedStringFilter<$PrismaModel>
  }

  export type StringNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedStringNullableWithAggregatesFilter<$PrismaModel> | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedStringNullableFilter<$PrismaModel>
    _max?: NestedStringNullableFilter<$PrismaModel>
  }

  export type BoolWithAggregatesFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolWithAggregatesFilter<$PrismaModel> | boolean
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedBoolFilter<$PrismaModel>
    _max?: NestedBoolFilter<$PrismaModel>
  }

  export type FloatNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel> | null
    in?: number[] | ListFloatFieldRefInput<$PrismaModel> | null
    notIn?: number[] | ListFloatFieldRefInput<$PrismaModel> | null
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatNullableWithAggregatesFilter<$PrismaModel> | number | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _avg?: NestedFloatNullableFilter<$PrismaModel>
    _sum?: NestedFloatNullableFilter<$PrismaModel>
    _min?: NestedFloatNullableFilter<$PrismaModel>
    _max?: NestedFloatNullableFilter<$PrismaModel>
  }

  export type DateTimeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeWithAggregatesFilter<$PrismaModel> | Date | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedDateTimeFilter<$PrismaModel>
    _max?: NestedDateTimeFilter<$PrismaModel>
  }

  export type DateTimeNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel> | null
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeNullableWithAggregatesFilter<$PrismaModel> | Date | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedDateTimeNullableFilter<$PrismaModel>
    _max?: NestedDateTimeNullableFilter<$PrismaModel>
  }

  export type FloatFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel>
    in?: number[] | ListFloatFieldRefInput<$PrismaModel>
    notIn?: number[] | ListFloatFieldRefInput<$PrismaModel>
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatFilter<$PrismaModel> | number
  }

  export type ProductCountOrderByAggregateInput = {
    id?: SortOrder
    name?: SortOrder
    price?: SortOrder
    description?: SortOrder
    image?: SortOrder
    category?: SortOrder
    inStock?: SortOrder
    size?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    images?: SortOrder
    productNumber?: SortOrder
    ageGroup?: SortOrder
    skinType?: SortOrder
    targetConcerns?: SortOrder
    usage?: SortOrder
  }

  export type ProductAvgOrderByAggregateInput = {
    price?: SortOrder
  }

  export type ProductMaxOrderByAggregateInput = {
    id?: SortOrder
    name?: SortOrder
    price?: SortOrder
    description?: SortOrder
    image?: SortOrder
    category?: SortOrder
    inStock?: SortOrder
    size?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    images?: SortOrder
    productNumber?: SortOrder
    ageGroup?: SortOrder
    skinType?: SortOrder
    targetConcerns?: SortOrder
    usage?: SortOrder
  }

  export type ProductMinOrderByAggregateInput = {
    id?: SortOrder
    name?: SortOrder
    price?: SortOrder
    description?: SortOrder
    image?: SortOrder
    category?: SortOrder
    inStock?: SortOrder
    size?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    images?: SortOrder
    productNumber?: SortOrder
    ageGroup?: SortOrder
    skinType?: SortOrder
    targetConcerns?: SortOrder
    usage?: SortOrder
  }

  export type ProductSumOrderByAggregateInput = {
    price?: SortOrder
  }

  export type FloatWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel>
    in?: number[] | ListFloatFieldRefInput<$PrismaModel>
    notIn?: number[] | ListFloatFieldRefInput<$PrismaModel>
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatWithAggregatesFilter<$PrismaModel> | number
    _count?: NestedIntFilter<$PrismaModel>
    _avg?: NestedFloatFilter<$PrismaModel>
    _sum?: NestedFloatFilter<$PrismaModel>
    _min?: NestedFloatFilter<$PrismaModel>
    _max?: NestedFloatFilter<$PrismaModel>
  }

  export type OrderItemListRelationFilter = {
    every?: OrderItemWhereInput
    some?: OrderItemWhereInput
    none?: OrderItemWhereInput
  }

  export type UserScalarRelationFilter = {
    is?: UserWhereInput
    isNot?: UserWhereInput
  }

  export type OrderItemOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type OrderCountOrderByAggregateInput = {
    id?: SortOrder
    orderNumber?: SortOrder
    customerEmail?: SortOrder
    customerName?: SortOrder
    customerPhone?: SortOrder
    customerEmirate?: SortOrder
    customerAddress?: SortOrder
    subtotal?: SortOrder
    discountAmount?: SortOrder
    shipping?: SortOrder
    vat?: SortOrder
    total?: SortOrder
    status?: SortOrder
    sessionId?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type OrderAvgOrderByAggregateInput = {
    subtotal?: SortOrder
    discountAmount?: SortOrder
    shipping?: SortOrder
    vat?: SortOrder
    total?: SortOrder
  }

  export type OrderMaxOrderByAggregateInput = {
    id?: SortOrder
    orderNumber?: SortOrder
    customerEmail?: SortOrder
    customerName?: SortOrder
    customerPhone?: SortOrder
    customerEmirate?: SortOrder
    customerAddress?: SortOrder
    subtotal?: SortOrder
    discountAmount?: SortOrder
    shipping?: SortOrder
    vat?: SortOrder
    total?: SortOrder
    status?: SortOrder
    sessionId?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type OrderMinOrderByAggregateInput = {
    id?: SortOrder
    orderNumber?: SortOrder
    customerEmail?: SortOrder
    customerName?: SortOrder
    customerPhone?: SortOrder
    customerEmirate?: SortOrder
    customerAddress?: SortOrder
    subtotal?: SortOrder
    discountAmount?: SortOrder
    shipping?: SortOrder
    vat?: SortOrder
    total?: SortOrder
    status?: SortOrder
    sessionId?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type OrderSumOrderByAggregateInput = {
    subtotal?: SortOrder
    discountAmount?: SortOrder
    shipping?: SortOrder
    vat?: SortOrder
    total?: SortOrder
  }

  export type IntFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[] | ListIntFieldRefInput<$PrismaModel>
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel>
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntFilter<$PrismaModel> | number
  }

  export type OrderScalarRelationFilter = {
    is?: OrderWhereInput
    isNot?: OrderWhereInput
  }

  export type OrderItemCountOrderByAggregateInput = {
    id?: SortOrder
    orderId?: SortOrder
    productId?: SortOrder
    productName?: SortOrder
    price?: SortOrder
    quantity?: SortOrder
    image?: SortOrder
  }

  export type OrderItemAvgOrderByAggregateInput = {
    price?: SortOrder
    quantity?: SortOrder
  }

  export type OrderItemMaxOrderByAggregateInput = {
    id?: SortOrder
    orderId?: SortOrder
    productId?: SortOrder
    productName?: SortOrder
    price?: SortOrder
    quantity?: SortOrder
    image?: SortOrder
  }

  export type OrderItemMinOrderByAggregateInput = {
    id?: SortOrder
    orderId?: SortOrder
    productId?: SortOrder
    productName?: SortOrder
    price?: SortOrder
    quantity?: SortOrder
    image?: SortOrder
  }

  export type OrderItemSumOrderByAggregateInput = {
    price?: SortOrder
    quantity?: SortOrder
  }

  export type IntWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[] | ListIntFieldRefInput<$PrismaModel>
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel>
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntWithAggregatesFilter<$PrismaModel> | number
    _count?: NestedIntFilter<$PrismaModel>
    _avg?: NestedFloatFilter<$PrismaModel>
    _sum?: NestedIntFilter<$PrismaModel>
    _min?: NestedIntFilter<$PrismaModel>
    _max?: NestedIntFilter<$PrismaModel>
  }

  export type IntNullableFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel> | null
    in?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntNullableFilter<$PrismaModel> | number | null
  }

  export type page_viewsCountOrderByAggregateInput = {
    id?: SortOrder
    page?: SortOrder
    userId?: SortOrder
    userEmail?: SortOrder
    userAgent?: SortOrder
    ipAddress?: SortOrder
    country?: SortOrder
    referrer?: SortOrder
    timestamp?: SortOrder
    browser?: SortOrder
    deviceType?: SortOrder
    os?: SortOrder
    screenHeight?: SortOrder
    screenWidth?: SortOrder
    city?: SortOrder
  }

  export type page_viewsAvgOrderByAggregateInput = {
    screenHeight?: SortOrder
    screenWidth?: SortOrder
  }

  export type page_viewsMaxOrderByAggregateInput = {
    id?: SortOrder
    page?: SortOrder
    userId?: SortOrder
    userEmail?: SortOrder
    userAgent?: SortOrder
    ipAddress?: SortOrder
    country?: SortOrder
    referrer?: SortOrder
    timestamp?: SortOrder
    browser?: SortOrder
    deviceType?: SortOrder
    os?: SortOrder
    screenHeight?: SortOrder
    screenWidth?: SortOrder
    city?: SortOrder
  }

  export type page_viewsMinOrderByAggregateInput = {
    id?: SortOrder
    page?: SortOrder
    userId?: SortOrder
    userEmail?: SortOrder
    userAgent?: SortOrder
    ipAddress?: SortOrder
    country?: SortOrder
    referrer?: SortOrder
    timestamp?: SortOrder
    browser?: SortOrder
    deviceType?: SortOrder
    os?: SortOrder
    screenHeight?: SortOrder
    screenWidth?: SortOrder
    city?: SortOrder
  }

  export type page_viewsSumOrderByAggregateInput = {
    screenHeight?: SortOrder
    screenWidth?: SortOrder
  }

  export type IntNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel> | null
    in?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntNullableWithAggregatesFilter<$PrismaModel> | number | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _avg?: NestedFloatNullableFilter<$PrismaModel>
    _sum?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedIntNullableFilter<$PrismaModel>
    _max?: NestedIntNullableFilter<$PrismaModel>
  }

  export type pdf_downloadsCountOrderByAggregateInput = {
    id?: SortOrder
    filename?: SortOrder
    userId?: SortOrder
    userEmail?: SortOrder
    ipAddress?: SortOrder
    userAgent?: SortOrder
    country?: SortOrder
    city?: SortOrder
    deviceType?: SortOrder
    browser?: SortOrder
    os?: SortOrder
    referrer?: SortOrder
    timestamp?: SortOrder
  }

  export type pdf_downloadsMaxOrderByAggregateInput = {
    id?: SortOrder
    filename?: SortOrder
    userId?: SortOrder
    userEmail?: SortOrder
    ipAddress?: SortOrder
    userAgent?: SortOrder
    country?: SortOrder
    city?: SortOrder
    deviceType?: SortOrder
    browser?: SortOrder
    os?: SortOrder
    referrer?: SortOrder
    timestamp?: SortOrder
  }

  export type pdf_downloadsMinOrderByAggregateInput = {
    id?: SortOrder
    filename?: SortOrder
    userId?: SortOrder
    userEmail?: SortOrder
    ipAddress?: SortOrder
    userAgent?: SortOrder
    country?: SortOrder
    city?: SortOrder
    deviceType?: SortOrder
    browser?: SortOrder
    os?: SortOrder
    referrer?: SortOrder
    timestamp?: SortOrder
  }

  export type user_actionsCountOrderByAggregateInput = {
    id?: SortOrder
    action?: SortOrder
    userId?: SortOrder
    userEmail?: SortOrder
    details?: SortOrder
    timestamp?: SortOrder
  }

  export type user_actionsMaxOrderByAggregateInput = {
    id?: SortOrder
    action?: SortOrder
    userId?: SortOrder
    userEmail?: SortOrder
    details?: SortOrder
    timestamp?: SortOrder
  }

  export type user_actionsMinOrderByAggregateInput = {
    id?: SortOrder
    action?: SortOrder
    userId?: SortOrder
    userEmail?: SortOrder
    details?: SortOrder
    timestamp?: SortOrder
  }

  export type user_sessionsCountOrderByAggregateInput = {
    id?: SortOrder
    sessionId?: SortOrder
    userId?: SortOrder
    userEmail?: SortOrder
    ipAddress?: SortOrder
    country?: SortOrder
    deviceType?: SortOrder
    browser?: SortOrder
    os?: SortOrder
    screenWidth?: SortOrder
    screenHeight?: SortOrder
    startTime?: SortOrder
    endTime?: SortOrder
    pageViews?: SortOrder
    duration?: SortOrder
    isBounce?: SortOrder
    referrer?: SortOrder
  }

  export type user_sessionsAvgOrderByAggregateInput = {
    screenWidth?: SortOrder
    screenHeight?: SortOrder
    pageViews?: SortOrder
    duration?: SortOrder
  }

  export type user_sessionsMaxOrderByAggregateInput = {
    id?: SortOrder
    sessionId?: SortOrder
    userId?: SortOrder
    userEmail?: SortOrder
    ipAddress?: SortOrder
    country?: SortOrder
    deviceType?: SortOrder
    browser?: SortOrder
    os?: SortOrder
    screenWidth?: SortOrder
    screenHeight?: SortOrder
    startTime?: SortOrder
    endTime?: SortOrder
    pageViews?: SortOrder
    duration?: SortOrder
    isBounce?: SortOrder
    referrer?: SortOrder
  }

  export type user_sessionsMinOrderByAggregateInput = {
    id?: SortOrder
    sessionId?: SortOrder
    userId?: SortOrder
    userEmail?: SortOrder
    ipAddress?: SortOrder
    country?: SortOrder
    deviceType?: SortOrder
    browser?: SortOrder
    os?: SortOrder
    screenWidth?: SortOrder
    screenHeight?: SortOrder
    startTime?: SortOrder
    endTime?: SortOrder
    pageViews?: SortOrder
    duration?: SortOrder
    isBounce?: SortOrder
    referrer?: SortOrder
  }

  export type user_sessionsSumOrderByAggregateInput = {
    screenWidth?: SortOrder
    screenHeight?: SortOrder
    pageViews?: SortOrder
    duration?: SortOrder
  }

  export type OrderCreateNestedManyWithoutUsersInput = {
    create?: XOR<OrderCreateWithoutUsersInput, OrderUncheckedCreateWithoutUsersInput> | OrderCreateWithoutUsersInput[] | OrderUncheckedCreateWithoutUsersInput[]
    connectOrCreate?: OrderCreateOrConnectWithoutUsersInput | OrderCreateOrConnectWithoutUsersInput[]
    createMany?: OrderCreateManyUsersInputEnvelope
    connect?: OrderWhereUniqueInput | OrderWhereUniqueInput[]
  }

  export type OrderUncheckedCreateNestedManyWithoutUsersInput = {
    create?: XOR<OrderCreateWithoutUsersInput, OrderUncheckedCreateWithoutUsersInput> | OrderCreateWithoutUsersInput[] | OrderUncheckedCreateWithoutUsersInput[]
    connectOrCreate?: OrderCreateOrConnectWithoutUsersInput | OrderCreateOrConnectWithoutUsersInput[]
    createMany?: OrderCreateManyUsersInputEnvelope
    connect?: OrderWhereUniqueInput | OrderWhereUniqueInput[]
  }

  export type StringFieldUpdateOperationsInput = {
    set?: string
  }

  export type NullableStringFieldUpdateOperationsInput = {
    set?: string | null
  }

  export type BoolFieldUpdateOperationsInput = {
    set?: boolean
  }

  export type NullableFloatFieldUpdateOperationsInput = {
    set?: number | null
    increment?: number
    decrement?: number
    multiply?: number
    divide?: number
  }

  export type DateTimeFieldUpdateOperationsInput = {
    set?: Date | string
  }

  export type NullableDateTimeFieldUpdateOperationsInput = {
    set?: Date | string | null
  }

  export type OrderUpdateManyWithoutUsersNestedInput = {
    create?: XOR<OrderCreateWithoutUsersInput, OrderUncheckedCreateWithoutUsersInput> | OrderCreateWithoutUsersInput[] | OrderUncheckedCreateWithoutUsersInput[]
    connectOrCreate?: OrderCreateOrConnectWithoutUsersInput | OrderCreateOrConnectWithoutUsersInput[]
    upsert?: OrderUpsertWithWhereUniqueWithoutUsersInput | OrderUpsertWithWhereUniqueWithoutUsersInput[]
    createMany?: OrderCreateManyUsersInputEnvelope
    set?: OrderWhereUniqueInput | OrderWhereUniqueInput[]
    disconnect?: OrderWhereUniqueInput | OrderWhereUniqueInput[]
    delete?: OrderWhereUniqueInput | OrderWhereUniqueInput[]
    connect?: OrderWhereUniqueInput | OrderWhereUniqueInput[]
    update?: OrderUpdateWithWhereUniqueWithoutUsersInput | OrderUpdateWithWhereUniqueWithoutUsersInput[]
    updateMany?: OrderUpdateManyWithWhereWithoutUsersInput | OrderUpdateManyWithWhereWithoutUsersInput[]
    deleteMany?: OrderScalarWhereInput | OrderScalarWhereInput[]
  }

  export type OrderUncheckedUpdateManyWithoutUsersNestedInput = {
    create?: XOR<OrderCreateWithoutUsersInput, OrderUncheckedCreateWithoutUsersInput> | OrderCreateWithoutUsersInput[] | OrderUncheckedCreateWithoutUsersInput[]
    connectOrCreate?: OrderCreateOrConnectWithoutUsersInput | OrderCreateOrConnectWithoutUsersInput[]
    upsert?: OrderUpsertWithWhereUniqueWithoutUsersInput | OrderUpsertWithWhereUniqueWithoutUsersInput[]
    createMany?: OrderCreateManyUsersInputEnvelope
    set?: OrderWhereUniqueInput | OrderWhereUniqueInput[]
    disconnect?: OrderWhereUniqueInput | OrderWhereUniqueInput[]
    delete?: OrderWhereUniqueInput | OrderWhereUniqueInput[]
    connect?: OrderWhereUniqueInput | OrderWhereUniqueInput[]
    update?: OrderUpdateWithWhereUniqueWithoutUsersInput | OrderUpdateWithWhereUniqueWithoutUsersInput[]
    updateMany?: OrderUpdateManyWithWhereWithoutUsersInput | OrderUpdateManyWithWhereWithoutUsersInput[]
    deleteMany?: OrderScalarWhereInput | OrderScalarWhereInput[]
  }

  export type FloatFieldUpdateOperationsInput = {
    set?: number
    increment?: number
    decrement?: number
    multiply?: number
    divide?: number
  }

  export type OrderItemCreateNestedManyWithoutOrderInput = {
    create?: XOR<OrderItemCreateWithoutOrderInput, OrderItemUncheckedCreateWithoutOrderInput> | OrderItemCreateWithoutOrderInput[] | OrderItemUncheckedCreateWithoutOrderInput[]
    connectOrCreate?: OrderItemCreateOrConnectWithoutOrderInput | OrderItemCreateOrConnectWithoutOrderInput[]
    createMany?: OrderItemCreateManyOrderInputEnvelope
    connect?: OrderItemWhereUniqueInput | OrderItemWhereUniqueInput[]
  }

  export type UserCreateNestedOneWithoutOrdersInput = {
    create?: XOR<UserCreateWithoutOrdersInput, UserUncheckedCreateWithoutOrdersInput>
    connectOrCreate?: UserCreateOrConnectWithoutOrdersInput
    connect?: UserWhereUniqueInput
  }

  export type OrderItemUncheckedCreateNestedManyWithoutOrderInput = {
    create?: XOR<OrderItemCreateWithoutOrderInput, OrderItemUncheckedCreateWithoutOrderInput> | OrderItemCreateWithoutOrderInput[] | OrderItemUncheckedCreateWithoutOrderInput[]
    connectOrCreate?: OrderItemCreateOrConnectWithoutOrderInput | OrderItemCreateOrConnectWithoutOrderInput[]
    createMany?: OrderItemCreateManyOrderInputEnvelope
    connect?: OrderItemWhereUniqueInput | OrderItemWhereUniqueInput[]
  }

  export type OrderItemUpdateManyWithoutOrderNestedInput = {
    create?: XOR<OrderItemCreateWithoutOrderInput, OrderItemUncheckedCreateWithoutOrderInput> | OrderItemCreateWithoutOrderInput[] | OrderItemUncheckedCreateWithoutOrderInput[]
    connectOrCreate?: OrderItemCreateOrConnectWithoutOrderInput | OrderItemCreateOrConnectWithoutOrderInput[]
    upsert?: OrderItemUpsertWithWhereUniqueWithoutOrderInput | OrderItemUpsertWithWhereUniqueWithoutOrderInput[]
    createMany?: OrderItemCreateManyOrderInputEnvelope
    set?: OrderItemWhereUniqueInput | OrderItemWhereUniqueInput[]
    disconnect?: OrderItemWhereUniqueInput | OrderItemWhereUniqueInput[]
    delete?: OrderItemWhereUniqueInput | OrderItemWhereUniqueInput[]
    connect?: OrderItemWhereUniqueInput | OrderItemWhereUniqueInput[]
    update?: OrderItemUpdateWithWhereUniqueWithoutOrderInput | OrderItemUpdateWithWhereUniqueWithoutOrderInput[]
    updateMany?: OrderItemUpdateManyWithWhereWithoutOrderInput | OrderItemUpdateManyWithWhereWithoutOrderInput[]
    deleteMany?: OrderItemScalarWhereInput | OrderItemScalarWhereInput[]
  }

  export type UserUpdateOneRequiredWithoutOrdersNestedInput = {
    create?: XOR<UserCreateWithoutOrdersInput, UserUncheckedCreateWithoutOrdersInput>
    connectOrCreate?: UserCreateOrConnectWithoutOrdersInput
    upsert?: UserUpsertWithoutOrdersInput
    connect?: UserWhereUniqueInput
    update?: XOR<XOR<UserUpdateToOneWithWhereWithoutOrdersInput, UserUpdateWithoutOrdersInput>, UserUncheckedUpdateWithoutOrdersInput>
  }

  export type OrderItemUncheckedUpdateManyWithoutOrderNestedInput = {
    create?: XOR<OrderItemCreateWithoutOrderInput, OrderItemUncheckedCreateWithoutOrderInput> | OrderItemCreateWithoutOrderInput[] | OrderItemUncheckedCreateWithoutOrderInput[]
    connectOrCreate?: OrderItemCreateOrConnectWithoutOrderInput | OrderItemCreateOrConnectWithoutOrderInput[]
    upsert?: OrderItemUpsertWithWhereUniqueWithoutOrderInput | OrderItemUpsertWithWhereUniqueWithoutOrderInput[]
    createMany?: OrderItemCreateManyOrderInputEnvelope
    set?: OrderItemWhereUniqueInput | OrderItemWhereUniqueInput[]
    disconnect?: OrderItemWhereUniqueInput | OrderItemWhereUniqueInput[]
    delete?: OrderItemWhereUniqueInput | OrderItemWhereUniqueInput[]
    connect?: OrderItemWhereUniqueInput | OrderItemWhereUniqueInput[]
    update?: OrderItemUpdateWithWhereUniqueWithoutOrderInput | OrderItemUpdateWithWhereUniqueWithoutOrderInput[]
    updateMany?: OrderItemUpdateManyWithWhereWithoutOrderInput | OrderItemUpdateManyWithWhereWithoutOrderInput[]
    deleteMany?: OrderItemScalarWhereInput | OrderItemScalarWhereInput[]
  }

  export type OrderCreateNestedOneWithoutOrderItemsInput = {
    create?: XOR<OrderCreateWithoutOrderItemsInput, OrderUncheckedCreateWithoutOrderItemsInput>
    connectOrCreate?: OrderCreateOrConnectWithoutOrderItemsInput
    connect?: OrderWhereUniqueInput
  }

  export type IntFieldUpdateOperationsInput = {
    set?: number
    increment?: number
    decrement?: number
    multiply?: number
    divide?: number
  }

  export type OrderUpdateOneRequiredWithoutOrderItemsNestedInput = {
    create?: XOR<OrderCreateWithoutOrderItemsInput, OrderUncheckedCreateWithoutOrderItemsInput>
    connectOrCreate?: OrderCreateOrConnectWithoutOrderItemsInput
    upsert?: OrderUpsertWithoutOrderItemsInput
    connect?: OrderWhereUniqueInput
    update?: XOR<XOR<OrderUpdateToOneWithWhereWithoutOrderItemsInput, OrderUpdateWithoutOrderItemsInput>, OrderUncheckedUpdateWithoutOrderItemsInput>
  }

  export type NullableIntFieldUpdateOperationsInput = {
    set?: number | null
    increment?: number
    decrement?: number
    multiply?: number
    divide?: number
  }

  export type NestedStringFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringFilter<$PrismaModel> | string
  }

  export type NestedStringNullableFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringNullableFilter<$PrismaModel> | string | null
  }

  export type NestedBoolFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolFilter<$PrismaModel> | boolean
  }

  export type NestedFloatNullableFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel> | null
    in?: number[] | ListFloatFieldRefInput<$PrismaModel> | null
    notIn?: number[] | ListFloatFieldRefInput<$PrismaModel> | null
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatNullableFilter<$PrismaModel> | number | null
  }

  export type NestedDateTimeFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeFilter<$PrismaModel> | Date | string
  }

  export type NestedDateTimeNullableFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel> | null
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeNullableFilter<$PrismaModel> | Date | string | null
  }

  export type NestedStringWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringWithAggregatesFilter<$PrismaModel> | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedStringFilter<$PrismaModel>
    _max?: NestedStringFilter<$PrismaModel>
  }

  export type NestedIntFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[] | ListIntFieldRefInput<$PrismaModel>
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel>
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntFilter<$PrismaModel> | number
  }

  export type NestedStringNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringNullableWithAggregatesFilter<$PrismaModel> | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedStringNullableFilter<$PrismaModel>
    _max?: NestedStringNullableFilter<$PrismaModel>
  }

  export type NestedIntNullableFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel> | null
    in?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntNullableFilter<$PrismaModel> | number | null
  }

  export type NestedBoolWithAggregatesFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolWithAggregatesFilter<$PrismaModel> | boolean
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedBoolFilter<$PrismaModel>
    _max?: NestedBoolFilter<$PrismaModel>
  }

  export type NestedFloatNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel> | null
    in?: number[] | ListFloatFieldRefInput<$PrismaModel> | null
    notIn?: number[] | ListFloatFieldRefInput<$PrismaModel> | null
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatNullableWithAggregatesFilter<$PrismaModel> | number | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _avg?: NestedFloatNullableFilter<$PrismaModel>
    _sum?: NestedFloatNullableFilter<$PrismaModel>
    _min?: NestedFloatNullableFilter<$PrismaModel>
    _max?: NestedFloatNullableFilter<$PrismaModel>
  }

  export type NestedDateTimeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeWithAggregatesFilter<$PrismaModel> | Date | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedDateTimeFilter<$PrismaModel>
    _max?: NestedDateTimeFilter<$PrismaModel>
  }

  export type NestedDateTimeNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel> | null
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeNullableWithAggregatesFilter<$PrismaModel> | Date | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedDateTimeNullableFilter<$PrismaModel>
    _max?: NestedDateTimeNullableFilter<$PrismaModel>
  }

  export type NestedFloatFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel>
    in?: number[] | ListFloatFieldRefInput<$PrismaModel>
    notIn?: number[] | ListFloatFieldRefInput<$PrismaModel>
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatFilter<$PrismaModel> | number
  }

  export type NestedFloatWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel>
    in?: number[] | ListFloatFieldRefInput<$PrismaModel>
    notIn?: number[] | ListFloatFieldRefInput<$PrismaModel>
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatWithAggregatesFilter<$PrismaModel> | number
    _count?: NestedIntFilter<$PrismaModel>
    _avg?: NestedFloatFilter<$PrismaModel>
    _sum?: NestedFloatFilter<$PrismaModel>
    _min?: NestedFloatFilter<$PrismaModel>
    _max?: NestedFloatFilter<$PrismaModel>
  }

  export type NestedIntWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[] | ListIntFieldRefInput<$PrismaModel>
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel>
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntWithAggregatesFilter<$PrismaModel> | number
    _count?: NestedIntFilter<$PrismaModel>
    _avg?: NestedFloatFilter<$PrismaModel>
    _sum?: NestedIntFilter<$PrismaModel>
    _min?: NestedIntFilter<$PrismaModel>
    _max?: NestedIntFilter<$PrismaModel>
  }

  export type NestedIntNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel> | null
    in?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntNullableWithAggregatesFilter<$PrismaModel> | number | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _avg?: NestedFloatNullableFilter<$PrismaModel>
    _sum?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedIntNullableFilter<$PrismaModel>
    _max?: NestedIntNullableFilter<$PrismaModel>
  }

  export type OrderCreateWithoutUsersInput = {
    id?: string
    orderNumber: string
    customerName: string
    customerPhone: string
    customerEmirate: string
    customerAddress: string
    subtotal: number
    discountAmount?: number
    shipping?: number
    vat: number
    total: number
    status?: string
    sessionId?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    orderItems?: OrderItemCreateNestedManyWithoutOrderInput
  }

  export type OrderUncheckedCreateWithoutUsersInput = {
    id?: string
    orderNumber: string
    customerName: string
    customerPhone: string
    customerEmirate: string
    customerAddress: string
    subtotal: number
    discountAmount?: number
    shipping?: number
    vat: number
    total: number
    status?: string
    sessionId?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    orderItems?: OrderItemUncheckedCreateNestedManyWithoutOrderInput
  }

  export type OrderCreateOrConnectWithoutUsersInput = {
    where: OrderWhereUniqueInput
    create: XOR<OrderCreateWithoutUsersInput, OrderUncheckedCreateWithoutUsersInput>
  }

  export type OrderCreateManyUsersInputEnvelope = {
    data: OrderCreateManyUsersInput | OrderCreateManyUsersInput[]
    skipDuplicates?: boolean
  }

  export type OrderUpsertWithWhereUniqueWithoutUsersInput = {
    where: OrderWhereUniqueInput
    update: XOR<OrderUpdateWithoutUsersInput, OrderUncheckedUpdateWithoutUsersInput>
    create: XOR<OrderCreateWithoutUsersInput, OrderUncheckedCreateWithoutUsersInput>
  }

  export type OrderUpdateWithWhereUniqueWithoutUsersInput = {
    where: OrderWhereUniqueInput
    data: XOR<OrderUpdateWithoutUsersInput, OrderUncheckedUpdateWithoutUsersInput>
  }

  export type OrderUpdateManyWithWhereWithoutUsersInput = {
    where: OrderScalarWhereInput
    data: XOR<OrderUpdateManyMutationInput, OrderUncheckedUpdateManyWithoutUsersInput>
  }

  export type OrderScalarWhereInput = {
    AND?: OrderScalarWhereInput | OrderScalarWhereInput[]
    OR?: OrderScalarWhereInput[]
    NOT?: OrderScalarWhereInput | OrderScalarWhereInput[]
    id?: StringFilter<"Order"> | string
    orderNumber?: StringFilter<"Order"> | string
    customerEmail?: StringFilter<"Order"> | string
    customerName?: StringFilter<"Order"> | string
    customerPhone?: StringFilter<"Order"> | string
    customerEmirate?: StringFilter<"Order"> | string
    customerAddress?: StringFilter<"Order"> | string
    subtotal?: FloatFilter<"Order"> | number
    discountAmount?: FloatFilter<"Order"> | number
    shipping?: FloatFilter<"Order"> | number
    vat?: FloatFilter<"Order"> | number
    total?: FloatFilter<"Order"> | number
    status?: StringFilter<"Order"> | string
    sessionId?: StringNullableFilter<"Order"> | string | null
    createdAt?: DateTimeFilter<"Order"> | Date | string
    updatedAt?: DateTimeFilter<"Order"> | Date | string
  }

  export type OrderItemCreateWithoutOrderInput = {
    id?: string
    productId: string
    productName: string
    price: number
    quantity: number
    image: string
  }

  export type OrderItemUncheckedCreateWithoutOrderInput = {
    id?: string
    productId: string
    productName: string
    price: number
    quantity: number
    image: string
  }

  export type OrderItemCreateOrConnectWithoutOrderInput = {
    where: OrderItemWhereUniqueInput
    create: XOR<OrderItemCreateWithoutOrderInput, OrderItemUncheckedCreateWithoutOrderInput>
  }

  export type OrderItemCreateManyOrderInputEnvelope = {
    data: OrderItemCreateManyOrderInput | OrderItemCreateManyOrderInput[]
    skipDuplicates?: boolean
  }

  export type UserCreateWithoutOrdersInput = {
    id?: string
    email: string
    name: string
    password: string
    phone?: string | null
    address?: string | null
    profilePicture?: string | null
    isAdmin?: boolean
    canSeePrices?: boolean
    discountType?: string | null
    discountPercentage?: number | null
    birthday?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    lastLoginAt?: Date | string | null
  }

  export type UserUncheckedCreateWithoutOrdersInput = {
    id?: string
    email: string
    name: string
    password: string
    phone?: string | null
    address?: string | null
    profilePicture?: string | null
    isAdmin?: boolean
    canSeePrices?: boolean
    discountType?: string | null
    discountPercentage?: number | null
    birthday?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    lastLoginAt?: Date | string | null
  }

  export type UserCreateOrConnectWithoutOrdersInput = {
    where: UserWhereUniqueInput
    create: XOR<UserCreateWithoutOrdersInput, UserUncheckedCreateWithoutOrdersInput>
  }

  export type OrderItemUpsertWithWhereUniqueWithoutOrderInput = {
    where: OrderItemWhereUniqueInput
    update: XOR<OrderItemUpdateWithoutOrderInput, OrderItemUncheckedUpdateWithoutOrderInput>
    create: XOR<OrderItemCreateWithoutOrderInput, OrderItemUncheckedCreateWithoutOrderInput>
  }

  export type OrderItemUpdateWithWhereUniqueWithoutOrderInput = {
    where: OrderItemWhereUniqueInput
    data: XOR<OrderItemUpdateWithoutOrderInput, OrderItemUncheckedUpdateWithoutOrderInput>
  }

  export type OrderItemUpdateManyWithWhereWithoutOrderInput = {
    where: OrderItemScalarWhereInput
    data: XOR<OrderItemUpdateManyMutationInput, OrderItemUncheckedUpdateManyWithoutOrderInput>
  }

  export type OrderItemScalarWhereInput = {
    AND?: OrderItemScalarWhereInput | OrderItemScalarWhereInput[]
    OR?: OrderItemScalarWhereInput[]
    NOT?: OrderItemScalarWhereInput | OrderItemScalarWhereInput[]
    id?: StringFilter<"OrderItem"> | string
    orderId?: StringFilter<"OrderItem"> | string
    productId?: StringFilter<"OrderItem"> | string
    productName?: StringFilter<"OrderItem"> | string
    price?: FloatFilter<"OrderItem"> | number
    quantity?: IntFilter<"OrderItem"> | number
    image?: StringFilter<"OrderItem"> | string
  }

  export type UserUpsertWithoutOrdersInput = {
    update: XOR<UserUpdateWithoutOrdersInput, UserUncheckedUpdateWithoutOrdersInput>
    create: XOR<UserCreateWithoutOrdersInput, UserUncheckedCreateWithoutOrdersInput>
    where?: UserWhereInput
  }

  export type UserUpdateToOneWithWhereWithoutOrdersInput = {
    where?: UserWhereInput
    data: XOR<UserUpdateWithoutOrdersInput, UserUncheckedUpdateWithoutOrdersInput>
  }

  export type UserUpdateWithoutOrdersInput = {
    id?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    password?: StringFieldUpdateOperationsInput | string
    phone?: NullableStringFieldUpdateOperationsInput | string | null
    address?: NullableStringFieldUpdateOperationsInput | string | null
    profilePicture?: NullableStringFieldUpdateOperationsInput | string | null
    isAdmin?: BoolFieldUpdateOperationsInput | boolean
    canSeePrices?: BoolFieldUpdateOperationsInput | boolean
    discountType?: NullableStringFieldUpdateOperationsInput | string | null
    discountPercentage?: NullableFloatFieldUpdateOperationsInput | number | null
    birthday?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    lastLoginAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
  }

  export type UserUncheckedUpdateWithoutOrdersInput = {
    id?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    password?: StringFieldUpdateOperationsInput | string
    phone?: NullableStringFieldUpdateOperationsInput | string | null
    address?: NullableStringFieldUpdateOperationsInput | string | null
    profilePicture?: NullableStringFieldUpdateOperationsInput | string | null
    isAdmin?: BoolFieldUpdateOperationsInput | boolean
    canSeePrices?: BoolFieldUpdateOperationsInput | boolean
    discountType?: NullableStringFieldUpdateOperationsInput | string | null
    discountPercentage?: NullableFloatFieldUpdateOperationsInput | number | null
    birthday?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    lastLoginAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
  }

  export type OrderCreateWithoutOrderItemsInput = {
    id?: string
    orderNumber: string
    customerName: string
    customerPhone: string
    customerEmirate: string
    customerAddress: string
    subtotal: number
    discountAmount?: number
    shipping?: number
    vat: number
    total: number
    status?: string
    sessionId?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    users: UserCreateNestedOneWithoutOrdersInput
  }

  export type OrderUncheckedCreateWithoutOrderItemsInput = {
    id?: string
    orderNumber: string
    customerEmail: string
    customerName: string
    customerPhone: string
    customerEmirate: string
    customerAddress: string
    subtotal: number
    discountAmount?: number
    shipping?: number
    vat: number
    total: number
    status?: string
    sessionId?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type OrderCreateOrConnectWithoutOrderItemsInput = {
    where: OrderWhereUniqueInput
    create: XOR<OrderCreateWithoutOrderItemsInput, OrderUncheckedCreateWithoutOrderItemsInput>
  }

  export type OrderUpsertWithoutOrderItemsInput = {
    update: XOR<OrderUpdateWithoutOrderItemsInput, OrderUncheckedUpdateWithoutOrderItemsInput>
    create: XOR<OrderCreateWithoutOrderItemsInput, OrderUncheckedCreateWithoutOrderItemsInput>
    where?: OrderWhereInput
  }

  export type OrderUpdateToOneWithWhereWithoutOrderItemsInput = {
    where?: OrderWhereInput
    data: XOR<OrderUpdateWithoutOrderItemsInput, OrderUncheckedUpdateWithoutOrderItemsInput>
  }

  export type OrderUpdateWithoutOrderItemsInput = {
    id?: StringFieldUpdateOperationsInput | string
    orderNumber?: StringFieldUpdateOperationsInput | string
    customerName?: StringFieldUpdateOperationsInput | string
    customerPhone?: StringFieldUpdateOperationsInput | string
    customerEmirate?: StringFieldUpdateOperationsInput | string
    customerAddress?: StringFieldUpdateOperationsInput | string
    subtotal?: FloatFieldUpdateOperationsInput | number
    discountAmount?: FloatFieldUpdateOperationsInput | number
    shipping?: FloatFieldUpdateOperationsInput | number
    vat?: FloatFieldUpdateOperationsInput | number
    total?: FloatFieldUpdateOperationsInput | number
    status?: StringFieldUpdateOperationsInput | string
    sessionId?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    users?: UserUpdateOneRequiredWithoutOrdersNestedInput
  }

  export type OrderUncheckedUpdateWithoutOrderItemsInput = {
    id?: StringFieldUpdateOperationsInput | string
    orderNumber?: StringFieldUpdateOperationsInput | string
    customerEmail?: StringFieldUpdateOperationsInput | string
    customerName?: StringFieldUpdateOperationsInput | string
    customerPhone?: StringFieldUpdateOperationsInput | string
    customerEmirate?: StringFieldUpdateOperationsInput | string
    customerAddress?: StringFieldUpdateOperationsInput | string
    subtotal?: FloatFieldUpdateOperationsInput | number
    discountAmount?: FloatFieldUpdateOperationsInput | number
    shipping?: FloatFieldUpdateOperationsInput | number
    vat?: FloatFieldUpdateOperationsInput | number
    total?: FloatFieldUpdateOperationsInput | number
    status?: StringFieldUpdateOperationsInput | string
    sessionId?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type OrderCreateManyUsersInput = {
    id?: string
    orderNumber: string
    customerName: string
    customerPhone: string
    customerEmirate: string
    customerAddress: string
    subtotal: number
    discountAmount?: number
    shipping?: number
    vat: number
    total: number
    status?: string
    sessionId?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type OrderUpdateWithoutUsersInput = {
    id?: StringFieldUpdateOperationsInput | string
    orderNumber?: StringFieldUpdateOperationsInput | string
    customerName?: StringFieldUpdateOperationsInput | string
    customerPhone?: StringFieldUpdateOperationsInput | string
    customerEmirate?: StringFieldUpdateOperationsInput | string
    customerAddress?: StringFieldUpdateOperationsInput | string
    subtotal?: FloatFieldUpdateOperationsInput | number
    discountAmount?: FloatFieldUpdateOperationsInput | number
    shipping?: FloatFieldUpdateOperationsInput | number
    vat?: FloatFieldUpdateOperationsInput | number
    total?: FloatFieldUpdateOperationsInput | number
    status?: StringFieldUpdateOperationsInput | string
    sessionId?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    orderItems?: OrderItemUpdateManyWithoutOrderNestedInput
  }

  export type OrderUncheckedUpdateWithoutUsersInput = {
    id?: StringFieldUpdateOperationsInput | string
    orderNumber?: StringFieldUpdateOperationsInput | string
    customerName?: StringFieldUpdateOperationsInput | string
    customerPhone?: StringFieldUpdateOperationsInput | string
    customerEmirate?: StringFieldUpdateOperationsInput | string
    customerAddress?: StringFieldUpdateOperationsInput | string
    subtotal?: FloatFieldUpdateOperationsInput | number
    discountAmount?: FloatFieldUpdateOperationsInput | number
    shipping?: FloatFieldUpdateOperationsInput | number
    vat?: FloatFieldUpdateOperationsInput | number
    total?: FloatFieldUpdateOperationsInput | number
    status?: StringFieldUpdateOperationsInput | string
    sessionId?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    orderItems?: OrderItemUncheckedUpdateManyWithoutOrderNestedInput
  }

  export type OrderUncheckedUpdateManyWithoutUsersInput = {
    id?: StringFieldUpdateOperationsInput | string
    orderNumber?: StringFieldUpdateOperationsInput | string
    customerName?: StringFieldUpdateOperationsInput | string
    customerPhone?: StringFieldUpdateOperationsInput | string
    customerEmirate?: StringFieldUpdateOperationsInput | string
    customerAddress?: StringFieldUpdateOperationsInput | string
    subtotal?: FloatFieldUpdateOperationsInput | number
    discountAmount?: FloatFieldUpdateOperationsInput | number
    shipping?: FloatFieldUpdateOperationsInput | number
    vat?: FloatFieldUpdateOperationsInput | number
    total?: FloatFieldUpdateOperationsInput | number
    status?: StringFieldUpdateOperationsInput | string
    sessionId?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type OrderItemCreateManyOrderInput = {
    id?: string
    productId: string
    productName: string
    price: number
    quantity: number
    image: string
  }

  export type OrderItemUpdateWithoutOrderInput = {
    id?: StringFieldUpdateOperationsInput | string
    productId?: StringFieldUpdateOperationsInput | string
    productName?: StringFieldUpdateOperationsInput | string
    price?: FloatFieldUpdateOperationsInput | number
    quantity?: IntFieldUpdateOperationsInput | number
    image?: StringFieldUpdateOperationsInput | string
  }

  export type OrderItemUncheckedUpdateWithoutOrderInput = {
    id?: StringFieldUpdateOperationsInput | string
    productId?: StringFieldUpdateOperationsInput | string
    productName?: StringFieldUpdateOperationsInput | string
    price?: FloatFieldUpdateOperationsInput | number
    quantity?: IntFieldUpdateOperationsInput | number
    image?: StringFieldUpdateOperationsInput | string
  }

  export type OrderItemUncheckedUpdateManyWithoutOrderInput = {
    id?: StringFieldUpdateOperationsInput | string
    productId?: StringFieldUpdateOperationsInput | string
    productName?: StringFieldUpdateOperationsInput | string
    price?: FloatFieldUpdateOperationsInput | number
    quantity?: IntFieldUpdateOperationsInput | number
    image?: StringFieldUpdateOperationsInput | string
  }



  /**
   * Batch Payload for updateMany & deleteMany & createMany
   */

  export type BatchPayload = {
    count: number
  }

  /**
   * DMMF
   */
  export const dmmf: runtime.BaseDMMF
}