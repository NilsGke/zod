import { describe, test, expect } from "bun:test";
import { z } from "../src";
import { expectZodErrorMessage } from "./util";

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
});
