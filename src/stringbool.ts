import { ZodBase } from "./base";

type Options = {
  truthy?: string[];
  falsy?: string[];
  case?: "sensitive" | "insensitive";
};

export class ZodStringbool extends ZodBase<string, boolean> {
  truthy: Set<string>;
  falsy: Set<string>;
  caseSensitive: boolean;

  constructor(
    options: Options = {
      truthy: ["true", "1", "yes", "on", "y", "enabled"],
      falsy: ["false", "0", "no", "off", "n", "disabled"],
      case: "insensitive",
    },
  ) {
    super({
      typeCheck: (value) => typeof value === "string",
      typeErrorMessage: "input must be a string",
      transformer: (value: string) => (this.truthy.has(value) ? true : false),
    });

    this.truthy = new Set(options.truthy);
    this.falsy = new Set(options.falsy);
    this.caseSensitive = options.case === "sensitive";

    this.checks.push((input: string) => {
      const str = this.caseSensitive ? input : input.toLowerCase();
      if (this.truthy.has(str) || this.falsy.has(str))
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

  clone() {
    throw Error("clone should never be used on the ZodStringbool class");
    return this;
  }
}

const stringbool = (stringValues?: Options & { case?: "sensitive" }) =>
  new ZodStringbool(stringValues);

export default stringbool;
