import { describe, expect, test } from "bun:test";
import { z } from "../src";
import { expectZodErrorMessage } from "./util";

describe("z.nullish(z.string())", () => {
  test("accepts string", () => {
    expect(z.nullish(z.string()).parse("hello")).toBe("hello");
  });
  test("accepts null", () => {
    expect(z.nullish(z.string()).parse(null)).toBeNull();
  });
  test("accepts undefined", () => {
    expect(z.nullish(z.string()).parse(undefined)).toBeUndefined();
  });
});

describe("z.nullish(z.string()).unwrap()", () => {
  test("accepts string", () => {
    expect(z.nullish(z.string()).unwarp().parse("hello")).toBe("hello");
  });

  test("does not accept null", () => {
    expectZodErrorMessage(
      z
        .nullish(z.string())
        .unwarp()
        .safeParse(null as any),
    ).toMatch(/input must be.+/);
  });

  test("does not accept undefined", () => {
    expectZodErrorMessage(
      z
        .nullish(z.string())
        .unwarp()
        .safeParse(undefined as any),
    ).toMatch(/input must be.+/);
  });
});
