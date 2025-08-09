import { ZodBase } from "./base";

class ZodNullable<T, K extends ZodBase<T>> extends ZodBase<T | null> {
  private baseSchema: K;

  constructor(schema: K) {
    super();
    this.baseSchema = schema;

    this.checks.push((input) => {
      if (input === null)
        return {
          success: true,
          result: input,
        };
      return schema.safeParse(input);
    });
  }

  protected clone() {
    throw Error("clone should not be used on this class");
    return this;
  }

  unwarp() {
    return this.baseSchema;
  }
}

const optional = <S extends ZodBase<any>>(schema: S) =>
  new ZodNullable<ReturnType<S["parse"]>, S>(schema);

export default optional;
