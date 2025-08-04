import { describe, expect, test } from "bun:test";
import { expectZodErrorMessage } from "./util";
import z from "../src";

describe("z.number()", () => {
  test("not a number", () => {
    expectZodErrorMessage(z.number().safeParse("hello" as any)).toMatch(
      "input must be a number"
    );
  });
  test("number", () => {
    expect(z.number().parse(3)).toBe(3);
  });
});

describe("z.number().gt()", () => {
  test("not gt", () => {
    expectZodErrorMessage(z.number().gt(4).safeParse(3)).toMatch(
      /number must be greater then.+/
    );
  });

  test("equal", () => {
    expectZodErrorMessage(z.number().gt(4).safeParse(4)).toMatch(
      /number must be greater then.+/
    );
  });

  test("greater", () => {
    expect(z.number().gt(3).parse(5)).toBe(5);
  });
});

describe("z.number().gte()", () => {
  test("not gte", () => {
    expectZodErrorMessage(z.number().gte(4).safeParse(3)).toMatch(
      /number must be greater then.+/
    );
  });

  test("equal", () => {
    expect(z.number().gte(3).parse(3)).toBe(3);
  });
  test("greater", () => {
    expect(z.number().gte(3).parse(5)).toBe(5);
  });
});

describe("z.number().lt()", () => {
  test("not lt", () => {
    expectZodErrorMessage(z.number().lt(4).safeParse(5)).toMatch(
      /number must be less then.+/
    );
  });

  test("equal", () => {
    expectZodErrorMessage(z.number().lt(4).safeParse(4)).toMatch(
      /number must be less then.+/
    );
  });

  test("less", () => {
    expect(z.number().lt(3).parse(2)).toBe(2);
  });
});

describe("z.number().lte()", () => {
  test("not lte", () => {
    expectZodErrorMessage(z.number().lte(4).safeParse(5)).toMatch(
      /number must be less then or equal to.+/
    );
  });

  test("equal", () => {
    expect(z.number().lte(3).parse(3)).toBe(3);
  });
  test("less", () => {
    expect(z.number().lte(3).parse(2)).toBe(2);
  });
});

describe("z.number().positive()", () => {
  test("negative", () => {
    expectZodErrorMessage(z.number().positive().safeParse(-5)).toMatch(
      /number must be positive/
    );
  });

  test("zero", () => {
    expectZodErrorMessage(z.number().positive().safeParse(0)).toMatch(
      /number must be positive/
    );
  });
  test("positive", () => {
    expect(z.number().positive().parse(2)).toBe(2);
  });
});

describe("z.number().negative()", () => {
  test("positive", () => {
    expectZodErrorMessage(z.number().negative().safeParse(5)).toMatch(
      /number must be negative/
    );
  });

  test("zero", () => {
    expectZodErrorMessage(z.number().negative().safeParse(0)).toMatch(
      /number must be negative/
    );
  });
  test("positive", () => {
    expect(z.number().negative().parse(-2)).toBe(-2);
  });
});

describe("z.number().nonpositive()", () => {
  test("negative", () => {
    expectZodErrorMessage(z.number().nonpositive().safeParse(2)).toMatch(
      /number cannot be positive/
    );
  });

  test("zero", () => {
    expect(z.number().nonpositive().parse(0)).toBe(0);
  });
  test("positive", () => {
    expect(z.number().nonpositive().parse(-5)).toBe(-5);
  });
});

describe("z.number().nonnegative()", () => {
  test("positive", () => {
    expectZodErrorMessage(z.number().nonnegative().safeParse(-2)).toMatch(
      /number cannot be negative/
    );
  });

  test("zero", () => {
    expect(z.number().nonnegative().parse(0)).toBe(0);
  });
  test("positive", () => {
    expect(z.number().nonnegative().parse(5)).toBe(5);
  });
});

describe("z.number().multiple()", () => {
  test("not multiple", () => {
    expectZodErrorMessage(z.number().multiple(2).safeParse(5)).toMatch(
      /number must be a multiple of.+/
    );
  });
  test("multiple", () => {
    expect(z.number().multiple(2).parse(2)).toBe(2);
  });
});
