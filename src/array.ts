import { ZodBase } from "./base";
import type { CheckFunction, Infer } from "./types";

export class ZodArray<Schema extends ZodBase<any>> extends ZodBase<
  Infer<Schema>[]
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

  clone(): this {
    throw new Error("Method not implemented.");
  }
}

const array = <Schema extends ZodBase<any>>(schema: Schema) =>
  new ZodArray(schema);

export default array;
