import type { Check } from "../src/types";
import { expect } from "bun:test";

export const expectZodErrorMessage = <T>(result: Check.Result) => {
  expect(result.success).toBe(false);
  if (result.success)
    throw Error(
      "error in `expectZodError`: result.success is false but expect did not catch it"
    );
  return expect(result.errorMessage);
};
