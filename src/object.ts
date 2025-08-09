import { ZodBase } from "./base";

type ObjectShape = Record<string, ZodBase<any, any>>;

type InferShape<S extends ObjectShape> = {
  [K in keyof S]: S[K] extends ZodBase<any, infer Output> ? Output : never;
};

class ZodObject<S extends ObjectShape> extends ZodBase<InferShape<S>> {
  private shape: S;

  constructor(shape: S) {
    super(
      (input): input is InferShape<S> =>
        typeof input === "object" && input !== null,
      "input must be a object"
    );
    this.shape = shape;
    this.checks.push((input) => {
      const output: Partial<InferShape<S>> = {};

      const expectedKeys = Object.keys(shape);
      const unexpectedKey = Object.keys(input).find(
        (key) => !expectedKeys.includes(key)
      );
      if (unexpectedKey)
        return {
          success: false,
          errorMessage: `unexpected key "${unexpectedKey}" in input`,
        };

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

const object = <S extends ObjectShape>(obj: S) => new ZodObject<S>(obj);
export default object;
