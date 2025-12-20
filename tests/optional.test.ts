import { describe, expect, test } from "bun:test";
import { z } from "../src";
import { expectZodErrorMessage } from "./util";

describe("z.optional(z.string())", () => {
  test("accepts string", () => {
    expect(z.optional(z.string()).parse("hello")).toBe("hello");
  });
  test("accepts undefined", () => {
    expect(z.optional(z.string()).parse(undefined)).toBeUndefined();
  });
  test("does not accept null", () => {
    expectZodErrorMessage(
      z.optional(z.string()).safeParse(null as any),
    ).toMatch(/input must be.+/);
  });
});

describe("z.optional(z.string()).unwrap()", () => {
  test("accepts string", () => {
    expect(z.optional(z.string()).unwarp().parse("hello")).toBe("hello");
  });

  test("does not accept undefined", () => {
    expectZodErrorMessage(
      z
        .optional(z.string())
        .unwarp()
        .safeParse(undefined as any),
    ).toMatch(/input must be.+/);
  });
});
