import { describe, expect, test } from "bun:test";
import { z } from "../src";
import { expectZodErrorMessage } from "./util";

describe("z.optional().string()", () => {
  test("accepts string", () => {
    expect(z.optional(z.string()).parse("hello")).toBe("hello");
  });
  test("accepts undefined", () => {
    expect(z.optional(z.string()).parse(undefined)).toBeUndefined();
  });
  test("does not accept null", () => {
    expectZodErrorMessage(
      z.optional(z.string()).safeParse(null as any)
    ).toMatch(/input must be.+/);
  });
});
