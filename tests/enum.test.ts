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

describe("z.enum().exclude()", () => {
  test("not in enum array", () => {
    expectZodErrorMessage(
      z.enum(["a", "b"]).exclude(["b"]).safeParse("b")
    ).toMatch('string must be one of the following: "a"');
  });
  test("in enum array", () => {
    expect(z.enum(["a", "b", "c"]).exclude(["a", "b"]).parse("c")).toBe("c");
  });
  test("exclude str that is not in enum array", () => {
    expect(z.enum(["a", "b"]).exclude(["k"]).parse("a")).toBe("a");
  });
});

describe("z.enum().extract()", () => {
  test("not in enum array", () => {
    expectZodErrorMessage(
      z.enum(["a", "b"]).extract(["a"]).safeParse("b")
    ).toMatch('string must be one of the following: "a"');
  });
  test("in enum array", () => {
    expect(z.enum(["a", "b", "c"]).extract(["a", "b"]).parse("a")).toBe("a");
  });
  test("extract str that is not in enum array", () => {
    expectZodErrorMessage(
      z.enum(["a", "b"]).extract(["k"]).safeParse("a")
    ).toMatch(/string must be one of the following: /);
  });
});
