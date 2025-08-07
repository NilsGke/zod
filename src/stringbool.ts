import { ZodBaseClass } from "./base";

type StringValues = { truthy: string[]; falsy: string[] };

export class ZodStringbool extends ZodBaseClass<string, boolean> {
  truthy = new Set(["true", "1", "yes", "on", "y", "enabled"]);
  falsy = new Set(["false", "0", "no", "off", "n", "disabled"]);

  constructor(newValues?: StringValues) {
    super(
      (value) => typeof value === "string",
      "input must be a string",
      (value: string) => (this.truthy.has(value) ? true : false)
    );
    if (newValues) {
      this.truthy = new Set(newValues.truthy);
      this.falsy = new Set(newValues.falsy);
    }
    this.addCheck((input: string) => {
      if (this.truthy.has(input) || this.falsy.has(input))
        return { success: true, result: input };
      else
        return {
          success: false,
          errorMessage: `input must be one of: ${[
            ...this.truthy.entries(),
            ...this.falsy.entries(),
          ]
            .map((e) => `"${e}"`)
            .join(", ")}`,
        };
    });
  }
}

const stringbool = (stringValues?: StringValues) =>
  new ZodStringbool(stringValues);

export default stringbool;
