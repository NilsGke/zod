import { ZodBase } from "./base";
import { ZodNever } from "./never";
import type { Infer } from "./types";

type ObjectShape = Record<string, ZodBase<any, any>>;

type InferShape<S extends ObjectShape> = {
  [K in keyof S]: S[K] extends ZodBase<any, infer Output> ? Output : never;
};

enum ZodObjectStrictness {
  loose,
  strip,
  strict,
  catchall,
}

class ZodObject<
  S extends ObjectShape,
  Strictness extends ZodObjectStrictness,
  Catchall extends ZodBase<any, any> | ZodNever = ZodNever
> extends ZodBase<
  InferShape<S>,
  InferShape<S> &
    (Catchall extends ZodBase<any, any> // if we have catchall, output has key value where value is returntype of the catchall schema
      ? { [x: string]: Infer<Catchall> }
      : {})
> {
  readonly shape;
  private strictness: Strictness;
  private catchallSchema: Catchall = new ZodNever() as Catchall;

  constructor(shape: S, strictness: Strictness) {
    super({
      typeCheck: (input): input is InferShape<S> =>
        typeof input === "object" && input !== null,
      typeErrorMessage: "input must be a object",
      baseChecks: [
        (input) => {
          const output: Partial<InferShape<S>> = {};

          // error on unexpected string
          const expectedKeys = Object.keys(shape);
          const unexpectedKeys: (keyof typeof input)[] = Object.keys(
            input
          ).filter((key) => !expectedKeys.includes(key));

          if (
            strictness === ZodObjectStrictness.strict &&
            unexpectedKeys.length > 0
          )
            return {
              success: false,
              errorMessage: `unexpected keys ${unexpectedKeys
                .map((k) => `"${String(k)}"`)
                .join(", ")} in input`,
            };

          if (
            strictness === ZodObjectStrictness.catchall &&
            !(this.catchallSchema instanceof ZodNever)
          )
            for (const key of unexpectedKeys) {
              const res = this.catchallSchema.safeParse(input[key]);
              if (!res.success)
                return {
                  success: false,
                  errorMessage: `error in object catchall for key "${String(
                    key
                  )}": \n${res.errorMessage
                    .split("\n")
                    .map((line) => "\t" + line)
                    .join("\n")}`,
                };
              output[key] = input[key];
            }
          else if (strictness === ZodObjectStrictness.loose)
            for (const key of unexpectedKeys) output[key] = input[key];

          for (const key in shape) {
            if (!(key in input))
              return {
                success: false,
                errorMessage: `input is missing key: "${key}"`,
              };
            const schema = shape[key]!;
            const value = input[key]!;
            const res = schema.safeParse(value);
            if (!res.success)
              return {
                success: false,
                errorMessage:
                  `value of key "${key}" resulted in an error:\n` +
                  res.errorMessage
                    .split("\n")
                    .map((line) => "\t" + line)
                    .join("\n"),
              };
            output[key] = res.result;
          }

          return {
            success: true,
            result: output as InferShape<S>,
          };
        },
      ],
    });

    this.shape = shape;
    this.strictness = strictness;
  }

  clone() {
    const clonedShape = Object.fromEntries(
      Object.entries(this.shape).map(([key, schema]) => [key, schema.clone()])
    ) as S;

    const clone = new ZodObject(clonedShape, this.strictness) as ZodObject<
      S,
      Strictness,
      Catchall
    >;

    clone.catchallSchema =
      this.catchallSchema instanceof ZodNever
        ? (this.catchallSchema as Catchall)
        : (this.catchallSchema.clone() as Catchall);

    clone.checks.push(...this.checks.slice());

    return clone as this;
  }

  catchall<K extends ZodBase<any, any>>(schema: K) {
    const clonedShape = Object.fromEntries(
      Object.entries(this.shape).map(([key, schema]) => [key, schema.clone()])
    ) as S;

    const clone = new ZodObject<S, ZodObjectStrictness.catchall, K>(
      clonedShape,
      ZodObjectStrictness.catchall
    );

    clone.catchallSchema = schema;
    clone.checks.push(...this.checks.slice());
    return clone;
  }
}

export const object = <S extends ObjectShape>(obj: S) =>
  new ZodObject(obj, ZodObjectStrictness.strip);
export const looseObject = <S extends ObjectShape>(obj: S) =>
  new ZodObject(obj, ZodObjectStrictness.loose);
export const strictObject = <S extends ObjectShape>(obj: S) =>
  new ZodObject(obj, ZodObjectStrictness.strict);
