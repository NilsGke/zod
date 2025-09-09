import { ZodBase, type Transformer } from "./base";
import number from "./number";
import string from "./string";
import type { Check, Infer } from "./types";

type ObjectShape = Record<string, ZodBase<any, any>>;

/** infers the raw type constructed from key - zodSchema pairs */
type InferShape<S extends ObjectShape> = {
  [K in keyof S]: S[K] extends ZodBase<any, infer Output> ? Output : never;
};

/**
 * this base class builds a base for ZodObject types.
 * It checks if every key specified in shape is included in the input
 * It provides the possibility to pass a check for stricter objects and a transformer to remove keys
 */
abstract class ZodBaseObject<
  S extends ObjectShape,
  InputShape extends Record<keyof S, any> = InferShape<S>,
  OutputShape extends Record<keyof S, any> = InferShape<S>
> extends ZodBase<InputShape, OutputShape, object> {
  readonly shape: S;

  constructor(
    shape: S,
    baseCheck?: Check<InputShape>,
    transformer?: Transformer<InputShape, OutputShape>
  ) {
    super({
      typeCheck: (input): input is object => typeof input === "object",
      typeErrorMessage: (input) =>
        `input must be of type object, received: ${typeof input}`,
      transformer,
      baseChecks: [
        // check for missing keys
        (input) => {
          for (const key in shape)
            if (!(key in input))
              return {
                success: false,
                errorMessage: `input is missing key: "${key}"`,
              };

          return {
            success: true,
            result: input,
          };
        },
        (input) => {
          for (const key in shape) {
            const schema = shape[key]!;
            const value = input[key];
            const testResult = schema.safeParse(value);

            if (!testResult.success)
              return {
                success: false,
                errorMessage:
                  `value of key "${key}" resulted in an error:\n` +
                  testResult.errorMessage
                    .split("\n")
                    .map((s) => "\t" + s)
                    .join("\n"),
              };
          }
          return { success: true, result: input };
        },
        ...(baseCheck ? [baseCheck] : []),
      ],
    });
    this.shape = shape;
  }

  loose() {
    return looseObject(this.shape);
  }

  strict() {
    return strictObject(this.shape);
  }

  catchall<C extends ZodBase<any, any>>(catchallSchema: C) {
    return catchallObject<S, C>(this.shape, catchallSchema);
  }

  clone(): this {
    throw Error("Method should never be called");
  }
}

/**
 * Default object shape.
 * In parse you cann pass unknown keys that will get stipped out.
 */
class ZodObject<
  Shape extends ObjectShape,
  Input extends Shape & { [x: string]: any } = Shape & { [x: string]: any }
> extends ZodBaseObject<Shape, InferShape<Input>, InferShape<Shape>> {
  constructor(shape: Shape) {
    super(
      shape,
      undefined,
      // transformer to remove unexpected keys
      (input) =>
        (Object.keys(input) as (keyof Shape)[])
          .filter((key) => key in shape)
          .reduce((obj, key) => {
            obj[key] = input[key];
            return obj;
          }, {} as Partial<InferShape<Shape>>) as InferShape<Shape>
    );
  }
}

/**
 * Loser Object shape.
 * Lets unknown keys through to the output.
 */
class ZodLooseObject<
  Shape extends ObjectShape,
  LooseShape extends Shape & { [x: string]: any } = Shape & { [x: string]: any }
> extends ZodBaseObject<Shape, InferShape<LooseShape>, InferShape<LooseShape>> {
  constructor(shape: Shape) {
    super(shape, undefined);
  }
}

/**
 * Stricter Object shape.
 * Throws on unknown keys.
 */
class ZodStrictObject<Shape extends ObjectShape> extends ZodBaseObject<
  Shape,
  InferShape<Shape>,
  InferShape<Shape>
> {
  constructor(shape: Shape) {
    super(shape, (input) => {
      for (const key in input) {
        if (!(key in shape))
          return {
            success: false,
            errorMessage: `unexpected key "${key}" in input`,
          };
      }
      return {
        success: true,
        result: input,
      };
    });
  }
}

/** combines the kv of the shape object with the any for any other keys. Using the shape does not work due to typescripts limitations */
type InferCatchedShape<S extends ObjectShape> = {
  [K in keyof S]: Infer<S[K]>;
} & {
  [key: string]: any;
};

/**
 * Catchall Object shape.
 * Can have a additional catchall schema that is applied to any unexpected keys
 */
class ZodCatchallObject<
  Shape extends ObjectShape,
  CatchallSchema extends ZodBase<any, any>
> extends ZodBaseObject<
  Shape,
  InferCatchedShape<Shape>,
  InferShape<Shape> & { [key: string]: Infer<CatchallSchema> | undefined }
> {
  constructor(shape: Shape, catchall: CatchallSchema) {
    super(
      shape,
      (input) => {
        for (const key in input) {
          if (!(key in shape)) {
            const catchallResult = catchall.safeParse(input[key]);
            if (!catchallResult.success)
              return {
                success: false,
                errorMessage:
                  `error in catchall schema for key: "${key}":\n` +
                  catchallResult.errorMessage
                    .split("\n")
                    .map((s) => "\t" + s)
                    .join("\n"),
              };
          }
        }
        return { success: true, result: input };
      },
      // transformer to remove unexpected keys
      (input) =>
        (Object.keys(input) as (keyof Shape)[]).reduce((obj, key) => {
          if (key in shape) obj[key] = input[key];
          else {
            const res = catchall.safeParse(input[key]);
            if (!res.success)
              throw Error(
                "baseCheck did not catch the following catchall error: " +
                  res.errorMessage
                    .split("\n")
                    .map((s) => "\t" + s)
                    .join("\n")
              );
            obj[key] = res.result;
          }
          return obj;
        }, {} as Partial<InferCatchedShape<Shape>>) as InferCatchedShape<Shape>
    );
  }
}

export const object = <S extends ObjectShape>(shape: S) =>
  new ZodObject<S>(shape);

export const looseObject = <S extends ObjectShape>(shape: S) =>
  new ZodLooseObject<S>(shape);

export const strictObject = <S extends ObjectShape>(shape: S) =>
  new ZodStrictObject<S>(shape);

export const catchallObject = <
  S extends ObjectShape,
  C extends ZodBase<any, any>
>(
  shape: S,
  catchall: C
) => new ZodCatchallObject<S, C>(shape, catchall);
