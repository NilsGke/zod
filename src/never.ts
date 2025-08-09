import { ZodBase } from "./base";

class ZodNever extends ZodBase<never> {
  constructor() {
    super();
    this.checks.push(() => ({
      success: false,
      errorMessage: "ZodNever can never pass",
    }));
  }

  protected clone() {
    throw Error("clone should not be used on this class");
    return this;
  }
}

const never = () => new ZodNever();
export default never;
