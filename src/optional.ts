import { ZodBase } from "./base";

class ZodOptional<T, K extends ZodBase<T>> extends ZodBase<T | undefined> {
  private baseSchema: K;

  constructor(schema: K) {
    super();
    this.baseSchema = schema;

    this.checks.push((input) => {
      if (input === undefined)
        return {
          success: true,
          result: input,
        };
      return schema.safeParse(input);
    });
  }

  protected clone() {
    throw Error("clone should not be used on this method");
    return this;
  }

  unwarp() {
    return this.baseSchema;
  }
}

const optional = <S extends ZodBase<any>>(schema: S) =>
  new ZodOptional<ReturnType<S["parse"]>, S>(schema);

export default optional;
