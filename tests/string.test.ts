import { describe, expect, test } from "bun:test";
import z from "../src";
import { CheckResult } from "../src/types";
import { expectZodErrorMessage } from "./util";

// string.min
describe("z.string().min()", () => {
  test("to short", () => {
    expectZodErrorMessage(z.string().min(4).safeParse("abc")).toMatch(
      /string must be at least.+/
    );
  });

  test("long enough", () => {
    expect(z.string().min(3).parse("abc")).toBe("abc");
  });
});

// string.max
describe("z.string().max()", () => {
  test("to long", () => {
    expectZodErrorMessage(z.string().max(3).safeParse("abcde")).toMatch(
      /string can be max.+/
    );
  });

  test("long enough", () => {
    expect(z.string().max(3).parse("abc")).toBe("abc");
  });
});

// string.length
describe("z.string().length()", () => {
  test("ok", () => {
    expect(z.string().length(3).parse("abc")).toBe("abc");
  });

  test("not ok", () => {
    expectZodErrorMessage(z.string().length(3).safeParse("a")).toMatch(
      /string must be exactly.+/
    );
  });
});

// string.regex
describe("z.string().regex()", () => {
  test("ok", () => {
    expect(z.string().regex(/abc/).parse("abc")).toBe("abc");
  });

  test("not ok", () =>
    expectZodErrorMessage(
      z
        .string()
        .regex(/abcdefg/)
        .safeParse("abc")
    ));
});

// string.startsWith
describe("z.string().startsWith()", () => {
  test("ok", () => {
    expect(z.string().startsWith("abc").parse("abcdefg")).toBe("abcdefg");
  });

  test("not ok", () => {
    expectZodErrorMessage(
      z.string().startsWith("xyz").safeParse("abc")
    ).toMatch(/string must start with.+/);
  });
});

// string.endsWith
describe("z.string().endsWith()", () => {
  test("ok", () => {
    expect(z.string().endsWith("def").parse("abcdef")).toBe("abcdef");
  });

  test("not ok", () => {
    expectZodErrorMessage(z.string().endsWith("xyz").safeParse("abc")).toMatch(
      /string must end with.+/
    );
  });
});

// string.includes
describe("z.string().includes()", () => {
  test("ok", () => {
    expect(z.string().includes("bcd").parse("abcdef")).toBe("abcdef");
  });

  test("not ok", () => {
    expectZodErrorMessage(z.string().includes("xyz").safeParse("abc")).toMatch(
      /string must include.+/
    );
  });
});

// string.uppercase
describe("z.string().uppercase()", () => {
  test("ok", () => {
    expect(z.string().uppercase().parse("ABC")).toBe("ABC");
  });

  test("not ok", () => {
    expectZodErrorMessage(z.string().uppercase().safeParse("abc")).toMatch(
      "string must be uppercase"
    );
  });
});

// string.lowercase
describe("z.string().lowercase()", () => {
  test("ok", () => {
    expect(z.string().lowercase().parse("abc")).toBe("abc");
  });

  test("not ok", () => {
    expectZodErrorMessage(z.string().lowercase().safeParse("ABC")).toMatch(
      "string must be lowercase"
    );
  });
});
