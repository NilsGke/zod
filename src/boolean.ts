import { ZodBaseClass, type Check } from "./types";

class ZodBoolean extends ZodBaseClass<boolean> {
  constructor() {
    super(
      (val): val is boolean => typeof val === "boolean",
      "input must be a boolean"
    );
  }
}

const boolean = () => new ZodBoolean();

export default boolean;
