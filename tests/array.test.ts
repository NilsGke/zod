import { describe, test, expect } from "bun:test";
import { z } from "../src";
import { expectZodErrorMessage } from "./util";
import { ZodString } from "../src/string";

describe("z.array()", () => {
  expectZodErrorMessage(z.array(z.string()).safeParse("" as any)).toMatch(
    "input must be an array",
  );
  const k = [0, 1, 2, 3];
  test("works with specific type", () => {
    expect(z.array(z.number()).parse(k));
    expectZodErrorMessage(z.array(z.string()).safeParse(k as any)).toMatch(
      /array entry does not match type.*\n.*input must be a string/,
    );
  });

  test("deep type check works", () => {
    expectZodErrorMessage(z.array(z.number().lt(2)).safeParse(k)).toMatch(
      /array entry does not match type:\n.*number must be less then 2/,
    );
  });

  test("nested arrays", () => {
    const l = [[[0]]];
    expect(z.array(z.array(z.array(z.number()))).parse(l)).toMatchObject(l);
    expectZodErrorMessage(
      z.array(z.array(z.array(z.string()))).safeParse(l as any),
    ).toMatch(/array entry does not match/);
  });

  test("correctly maps input and output types", () =>
    expect(z.array(z.stringbool()).parse(["true", "false"])).toMatchObject([
      true,
      false,
    ]));
});

describe("z.array().unwrap()", () => {
  expect(z.array(z.string()).unwrap()).toBeInstanceOf(ZodString);
});

describe("z.array().min().max().length()", () => {
  test("z.array().min()", () => {
    expectZodErrorMessage(z.array(z.number()).min(3).safeParse([0, 1])).toMatch(
      /array must have at least.+entries/,
    );

    const k = [0, 1, 2];
    expect(z.array(z.number()).min(2).parse(k)).toMatchObject(k);
    expect(z.array(z.number()).min(3).parse(k)).toMatchObject(k);
  });

  test("z.array().max()", () => {
    expectZodErrorMessage(
      z.array(z.number()).max(2).safeParse([0, 1, 2]),
    ).toMatch(/array must have less then.+entries/);

    const k = [0, 1, 2];
    expect(z.array(z.number()).max(3).parse(k)).toMatchObject(k);
    expect(z.array(z.number()).max(4).parse(k)).toMatchObject(k);
  });

  test("z.array().length", () => {
    expectZodErrorMessage(
      z.array(z.number()).length(2).safeParse([0, 1, 2]),
    ).toMatch(/array must have exactly.+entries/);

    expectZodErrorMessage(
      z.array(z.number()).length(4).safeParse([0, 1, 2]),
    ).toMatch(/array must have exactly.+entries/);

    const k = [0, 1, 2];
    expect(z.array(z.number()).length(3).parse(k)).toMatchObject(k);
  });

  test("z.array().nonempty()", () => {
    expect(z.array(z.any()).parse([0])).toMatchObject([0]);
    expectZodErrorMessage(z.array(z.any()).nonempty().safeParse([])).toMatch(
      "array must have at least 1 entry",
    );
  });
});
