import { ZodBase } from "./base";

class ZodUnknown extends ZodBase<unknown> {
  protected clone() {
    throw Error("clone should not be used on this class");
    return this;
  }
}

const unknown = () => new ZodUnknown();
export default unknown;
