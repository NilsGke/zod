import { ZodBase } from "./base";

class ZodOptional<T, K extends ZodBase<T>> extends ZodBase<T | undefined> {
  baseSchema: K;

  constructor(schema: K) {
    super();
    this.baseSchema = schema;

    this.addCheck((input) => {
      if (input === undefined)
        return {
          success: true,
          result: input,
        };
      return schema.safeParse(input);
    });
  }
}

const optional = <S extends ZodBase<any>>(schema: S) =>
  new ZodOptional<ReturnType<S["parse"]>, S>(schema);

export default optional;
