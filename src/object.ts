import { ZodBase } from "./base";
import type { ZodEnum } from "./enum";
import _enum from "./enum";
import type { Check, Infer } from "./types";

type ObjectShape = Record<string, ZodBase<any, any>>;
type InferShape<Shape extends ObjectShape> = {
  [key in keyof Shape]: Infer<Shape[key]>;
};

namespace ObjectStrictness {
  /**  Strict errors when there are properties in the input that are not in the schema */
  export type Strict = { mode: "strict" };
  /** Passthrough lets unknown keys pass through without any checking */
  export type Passthrough = { mode: "passthrough" };
  /** Strip removes any unknown properties from the input */
  export type Strip = { mode: "strip" };
  /** Catchall is like Passthrough but has a additional schema that any unknown keys have to follow */
  export type Catchall<T extends ZodBase<any>> = {
    mode: "catchall";
    schema: T;
  };
}

type InputShape<
  Shape extends ObjectShape,
  Strictness extends
    | ObjectStrictness.Strict
    | ObjectStrictness.Passthrough
    | ObjectStrictness.Strip
    | ObjectStrictness.Catchall<ZodBase<any>>,
  CatchallType = Strictness extends ObjectStrictness.Catchall<
    infer CatchallSchema
  >
    ? Infer<CatchallSchema>
    : never
> = Strictness extends ObjectStrictness.Strict
  ? Shape
  : Strictness extends ObjectStrictness.Passthrough
  ? Shape & { [key: string]: any }
  : Strictness extends ObjectStrictness.Strip
  ? Shape & { [key: string]: any }
  : Strictness extends ObjectStrictness.Catchall<ZodBase<any>>
  ? Shape & { [key: string]: CatchallType }
  : never;

type OutputShape<
  Shape extends ObjectShape,
  Strictness extends
    | ObjectStrictness.Strict
    | ObjectStrictness.Passthrough
    | ObjectStrictness.Strip
    | ObjectStrictness.Catchall<ZodBase<any>>
> = Shape &
  (Strictness extends ObjectStrictness.Strict
    ? {}
    : Strictness extends ObjectStrictness.Passthrough
    ? { [key: string]: any }
    : Strictness extends ObjectStrictness.Strip
    ? {}
    : Strictness extends ObjectStrictness.Catchall<ZodBase<any>>
    ? { [key: string]: Strictness["schema"] }
    : {});

class ZodObject<
  Shape extends ObjectShape,
  Strictness extends
    | ObjectStrictness.Strict
    | ObjectStrictness.Passthrough
    | ObjectStrictness.Strip
    | ObjectStrictness.Catchall<ZodBase<any>>
> extends ZodBase<
  // input
  InferShape<InputShape<Shape, Strictness>>,
  // output
  InferShape<OutputShape<Shape, Strictness>>,
  // allowed primitive input type
  object
> {
  private readonly _shape: Shape;
  private readonly strictness: Strictness;
  get shape() {
    return this._shape;
  }

  constructor(shape: Shape, strictness: Strictness) {
    super({
      typeCheck: (value) => value !== null && typeof value === "object",
      typeErrorMessage: (value) =>
        `input must be of type object, received: ${typeof value}`,
      baseChecks: [
        (input) => {
          const shapeKeys = new Set(Object.keys(this.shape) as (keyof Shape)[]);
          const unknownKeys = new Set(Object.keys(input)).difference(shapeKeys);

          // deal with extra keys
          if (unknownKeys.size > 0) {
            switch (strictness.mode) {
              case "strict":
                return {
                  success: false,
                  errorMessage: `unexpected keys: ${unknownKeys
                    .keys()
                    .map((key) => `"${key}"`)
                    .toArray()
                    .join(", ")}`,
                };
              case "catchall":
                // assertion allowed because we are in catchall case
                const catchallStrictness =
                  strictness as ObjectStrictness.Catchall<ZodBase<any>>;

                const unknownKeysResult = unknownKeys
                  .keys()
                  .toArray()
                  .map((key) => ({
                    key,
                    result: catchallStrictness.schema.safeParse(
                      input[key]
                    ) as Check.Result,
                  }));

                const unknownFailedKeys = unknownKeysResult.filter(
                  ({ result }) => !result.success
                ) as {
                  key: string;
                  result: Check.FailedResult;
                }[];

                if (unknownFailedKeys.length > 0)
                  return {
                    success: false,
                    errorMessage:
                      `following key${
                        unknownFailedKeys.length > 0 ? "s" : ""
                      } failed passthrough schema:` +
                      unknownFailedKeys.map(
                        ({ key, result }) =>
                          `\n\t"${key}" -> ${result.errorMessage}`
                      ),
                  };

                unknownKeysResult.forEach(({ key, result }) => {
                  if (!result.success)
                    throw Error(
                      "passthrough did not result in error but success is false"
                    );
                });
                break;

              case "passthrough":
              case "strip":
                break;

              default:
                const _exhaustiveCheck: never = strictness;
            }
          }

          // deal with expected keys
          const missingKeys = Object.keys(shape).filter(
            (key) => input[key] === undefined
          );
          if (missingKeys.length > 0)
            return {
              success: false,
              errorMessage: `object is missing keys: ${missingKeys
                .map((key) => `"${key}"`)
                .join(", ")}`,
            };

          const results = Object.keys(shape).map((key) => ({
            key,
            result: shape[key]!.safeParse(input[key]),
          }));

          const failedKeys = results.filter(({ result }) => !result.success);
          if (failedKeys.length > 0)
            return {
              success: false,
              errorMessage:
                "following keys failed:" +
                failedKeys.map(
                  ({ key, result }) =>
                    `\n\t- "${key}": ${
                      (result as Check.FailedResult).errorMessage
                    }`
                ),
            };

          return { success: true };
        },
      ],
      transformer: (input) => {
        const shapeKeys = new Set<keyof Shape>(Object.keys(shape));
        const inputKeys = new Set<keyof typeof input>(Object.keys(input));
        const unknownKeys = new Set<Omit<keyof typeof input, keyof Shape>>(
          inputKeys.difference(shapeKeys)
        );

        const partialOutput: Partial<InferShape<Shape>> = {};

        // transform shape keys
        shapeKeys.forEach((key) => {
          const schema = shape[key];
          if (schema === undefined)
            throw Error("schema indexed with keyof schema is undefined");
          const value = input[key];
          if (value === undefined)
            throw Error(
              "value indexed with keyof schema is undefined despite baseCheck running successfull"
            );
          const result = schema.transform(value);
          partialOutput[key] = result;
        });

        const output = partialOutput as InferShape<Shape>;

        // filter out incorrect keys
        switch (strictness.mode) {
          case "strict":
          case "strip":
            return output as InferShape<OutputShape<Shape, Strictness>>;

          case "passthrough":
          case "catchall":
            const partialUnknownOutput: Partial<Exclude<typeof input, Shape>> =
              {};

            unknownKeys.forEach((key) => {
              if (strictness.mode === "passthrough")
                partialUnknownOutput[key as keyof typeof partialUnknownOutput] =
                  input[key as keyof typeof input];
              else if (strictness.mode === "catchall")
                partialUnknownOutput[key as keyof typeof partialUnknownOutput] =
                  strictness.schema.transform(input[key as keyof typeof input]);
            });

            const unknownOutput = partialUnknownOutput as Exclude<
              typeof input,
              Shape
            >;

            return {
              ...output,
              ...unknownOutput,
            } as InferShape<OutputShape<Shape, Strictness>>;

          default:
            const _exhaustiveCheck: never = strictness;
            return {} as InferShape<OutputShape<Shape, Strictness>>;
        }
      },
    });

    this._shape = shape;
    this.strictness = strictness;
  }
  clone(): this {
    throw new Error("Method not implemented.");
  }

  // instance object utility methods
  keyof = () =>
    _enum(Object.keys(this.shape) as Extract<keyof Shape, string>[]);

  extend = (shape: ObjectShape) =>
    new ZodObject({ ...this.shape, ...shape }, this.strictness);

  // transforming constructor methods
  strip = () => object(this.shape);
  loose = () => looseObject(this.shape);
  strict = () => strictObject(this.shape);
  catchall = <CatchallSchema extends ZodBase<any>>(schema: CatchallSchema) =>
    catchallObject(this.shape, schema);
}

// constructing methods
export const object = <Shape extends ObjectShape>(shape: Shape) =>
  new ZodObject<Shape, ObjectStrictness.Strip>(shape, { mode: "strip" });

export const looseObject = <Shape extends ObjectShape>(shape: Shape) =>
  new ZodObject<Shape, ObjectStrictness.Passthrough>(shape, {
    mode: "passthrough",
  });

export const strictObject = <Shape extends ObjectShape>(shape: Shape) =>
  new ZodObject<Shape, ObjectStrictness.Strict>(shape, { mode: "strict" });

const catchallObject = <
  Shape extends ObjectShape,
  CatchallSchema extends ZodBase<any>
>(
  shape: Shape,
  schema: CatchallSchema
) =>
  new ZodObject<Shape, ObjectStrictness.Catchall<CatchallSchema>>(shape, {
    mode: "catchall",
    schema,
  });
