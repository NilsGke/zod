import { ZodBase } from "./base";
import type { ZodNumber } from "./number";
import number from "./number";
import type { ZodString } from "./string";
import string from "./string";
import type { Input, Output } from "./types";

type InferInputArray<T extends readonly ZodBase<any>[]> = {
  [K in keyof T]: Input<T[K]>;
};

type InferOutputArray<T extends readonly ZodBase<any>[]> = {
  [K in keyof T]: Output<T[K]>;
};

export class ZodTuple<
  TupleTypes extends readonly [ZodBase<any>, ...ZodBase<any>[]],
> extends ZodBase<
  InferInputArray<TupleTypes>,
  InferOutputArray<TupleTypes>,
  Array<any>
> {
  constructor(tupleSchemas: TupleTypes) {
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

          if (input.length > tupleSchemas.length)
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

          return { success: true };
        },
      ],
      transformer: (input) =>
        tupleSchemas.map((schema, i) =>
          schema.parse(input[i]),
        ) as InferOutputArray<TupleTypes>,
    });
  }

  clone(): this {
    throw new Error("Method not implemented.");
  }
}

const tuple = <Types extends readonly [ZodBase<any>, ...ZodBase<any>[]]>(
  types: Types,
) => new ZodTuple(types);

export default tuple;
