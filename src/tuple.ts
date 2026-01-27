import { ZodBase } from "./base";
import type { Input, Output } from "./types";

type Rest = ZodBase<any> | null;

type InferInputArray<T extends readonly ZodBase<any>[], R extends Rest> = [
  ...{
    [K in keyof T]: Input<T[K]>;
  },
  ...(R extends ZodBase<any> ? Input<R>[] : never),
];

type InferOutputArray<T extends readonly ZodBase<any>[], R extends Rest> = [
  ...{
    [K in keyof T]: Output<T[K]>;
  },
  ...(R extends ZodBase<any> ? Output<R>[] : never),
];

export class ZodTuple<
  TupleTypes extends readonly [ZodBase<any>, ...ZodBase<any>[]],
  RestType extends Rest,
> extends ZodBase<
  InferInputArray<TupleTypes, RestType>,
  InferOutputArray<TupleTypes, RestType>,
  Array<any>
> {
  constructor(tupleSchemas: TupleTypes, rest: RestType) {
    if (tupleSchemas.length === 0)
      throw Error("tuple schemas must have at least one item");

    super({
      typeCheck: (val) => val instanceof Array,
      typeErrorMessage: "input must be an array",
      baseChecks: [
        (input) => {
          if (input.length < tupleSchemas.length)
            return {
              success: false,
              errorMessage: "tuple is missing at least one element",
            };

          if (rest === null && input.length > tupleSchemas.length)
            return {
              success: false,
              errorMessage: "tuple has more elements then allowed",
            };

          for (let i = 0; i < tupleSchemas.length; i++) {
            const [schema, value] = [tupleSchemas.at(i)!, input.at(i)!];
            const result = schema.safeParse(value);
            if (!result.success)
              return {
                success: false,
                errorMessage:
                  "incorrect tuple value:\n\t" +
                  result.errorMessage.split("\n").join("\n\t"),
              };
          }

          // loop over only elements that do not have a dedicated schema
          if (rest)
            for (let i = tupleSchemas.length; i < input.length; i++) {
              const result = rest.safeParse(input);
              if (!result.success)
                return {
                  success: false,
                  errorMessage:
                    "incorrect tuple rest value:\n\t" +
                    result.errorMessage.split("\n").join("\n\t"),
                };
            }

          return { success: true };
        },
      ],
      transformer: (input) =>
        input.map((value, i) =>
          (tupleSchemas.at(i) || rest)?.parse(value),
        ) as InferOutputArray<TupleTypes, Rest>,
    });
  }

  clone(): this {
    throw new Error("Method not implemented.");
  }
}

const tuple = <
  Types extends readonly [ZodBase<any>, ...ZodBase<any>[]],
  Rest extends ZodBase<any>,
>(
  types: Types,
  rest: Rest | null = null,
) => new ZodTuple(types, rest);

export default tuple;
