import { ZodBase } from "./base";

type ObjectShape = Record<string, ZodBase<any, any>>;

type InferShape<S extends ObjectShape> = {
  [K in keyof S]: S[K] extends ZodBase<any, infer Output> ? Output : never;
};

enum ZodObjectStrictness {
  loose,
  strip,
  strict,
}

class ZodObject<
  S extends ObjectShape,
  Strictness extends ZodObjectStrictness
> extends ZodBase<InferShape<S>> {
  readonly shape;
  constructor(shape: S, strictness: Strictness) {
    super(
      (input): input is InferShape<S> =>
        typeof input === "object" && input !== null,
      "input must be a object"
    );

    this.shape = shape;

    this.checks.push((input) => {
      const output: Partial<InferShape<S>> = {};

      // error on unexpected string
      const expectedKeys = Object.keys(shape);
      const unexpectedKeys: (keyof InferShape<S>)[] = Object.keys(input).filter(
        (key) => !expectedKeys.includes(key)
      );

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

      if (strictness === ZodObjectStrictness.loose)
        unexpectedKeys.forEach((key) => (output[key] = input[key]));

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
        output[key as keyof InferShape<S>] = res.result;
      }

      return {
        success: true,
        result: output as InferShape<S>,
      };
    });
  }

  protected clone() {
    return this;
  }
}

export const object = <S extends ObjectShape>(obj: S) =>
  new ZodObject(obj, ZodObjectStrictness.strip);
export const looseObject = <S extends ObjectShape>(obj: S) =>
  new ZodObject(obj, ZodObjectStrictness.loose);
export const strictObject = <S extends ObjectShape>(obj: S) =>
  new ZodObject(obj, ZodObjectStrictness.strict);
