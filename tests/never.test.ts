import { describe, expect, test } from "bun:test";
import { z } from "../src";
import { expectZodErrorMessage } from "./util";

describe("z.never()", () => {
  test("accepts nothing", () => {
    expectZodErrorMessage(z.never().safeParse("hello" as never)).toMatch(
      "ZodNever can never pass"
    );
    expectZodErrorMessage(z.never().safeParse(2 as never)).toMatch(
      "ZodNever can never pass"
    );
    expectZodErrorMessage(z.never().safeParse(undefined as never)).toMatch(
      "ZodNever can never pass"
    );
    expectZodErrorMessage(z.never().safeParse(null as never)).toMatch(
      "ZodNever can never pass"
    );
  });
});
