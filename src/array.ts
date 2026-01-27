import { ZodBase } from "./base";
import type { CheckFunction, Infer, Input, Output } from "./types";

export class ZodArray<Schema extends ZodBase<any>> extends ZodBase<
  Input<Schema>[],
  Output<Schema>[]
> {
  schema: Schema;

  constructor(schema: Schema, checks?: CheckFunction<Array<Infer<Schema>>>[]) {
    super({
      typeCheck: (input: unknown) => input instanceof Array,
      typeErrorMessage: "input must be an array",

      baseChecks: [
        (input) => {
          for (const item of input) {
            const result = schema.safeParse(item);
            if (!result.success)
              return {
                success: false,
                errorMessage:
                  `array entry does not match type:\n\t${item}\t` +
                  result.errorMessage.split("\n").join("\n\t"),
              };
          }
          return { success: true };
        },
      ],

      transformer: (input) => input.map((item) => schema.parse(item)),
    });

    if (checks) this.checks.push(...checks); // copy array

    this.schema = schema;
  }

  unwrap = () => this.schema;

  max(max: number) {
    return this.cloneAndAddCheck((input) =>
      input.length <= max
        ? { success: true }
        : {
            success: false,
            errorMessage: `array must have less then ${max} ${max === 1 ? "entry" : "entries"}`,
          },
    );
  }

  min(min: number) {
    return this.cloneAndAddCheck((input) =>
      input.length >= min
        ? { success: true }
        : {
            success: false,
            errorMessage: `array must have at least ${min} ${min === 1 ? "entry" : "entries"}`,
          },
    );
  }

  length(n: number) {
    return this.cloneAndAddCheck((input) =>
      input.length === n
        ? { success: true }
        : {
            success: false,
            errorMessage: `array must have exactly ${n} ${n === 1 ? "entry" : "entries"}`,
          },
    );
  }

  nonempty() {
    return this.min(1);
  }

  clone(): this {
    return new ZodArray(this.schema, this.checks) as this;
  }
}

const array = <Schema extends ZodBase<any>>(schema: Schema) =>
  new ZodArray(schema);

export default array;
