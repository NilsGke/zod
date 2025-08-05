import { describe, expect, test } from "bun:test";
import { expectZodErrorMessage } from "./util";
import { z } from "../src";

describe("z.enum()", () => {
  test("not a string", () => {
    expectZodErrorMessage(
      z.enum(["abc", "def"]).safeParse(undefined as any)
    ).toMatch("input must be a string");
  });
  test("not in enum array", () => {
    expectZodErrorMessage(z.enum(["abc"]).safeParse("def")).toMatch(
      "string must be one of the following"
    );
  });
  test("in enum array", () => {
    expect(z.enum(["abc", "def"]).parse("abc")).toBe("abc");
  });
});
