import { ZodBase } from "./base";

class ZodBoolean extends ZodBase<boolean> {
  constructor() {
    super(
      (val): val is boolean => typeof val === "boolean",
      "input must be a boolean"
    );
  }
}

const boolean = () => new ZodBoolean();

export default boolean;
