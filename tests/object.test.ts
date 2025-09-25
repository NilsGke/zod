import { describe, expect, test } from "bun:test";
import { z } from "../src";
import { expectZodErrorMessage } from "./util";

describe("z.object()", () => {
  test("empty object", () => {
    expect(z.object({}).parse({})).toEqual({});
  });

  test("not a object", () => {
    expectZodErrorMessage(z.object({}).safeParse(161 as any)).toMatch(
      "input must be of type object, received: number"
    );
  });

  test("property", () => {
    expect(
      z
        .object({
          hello: z.string(),
        })
        .parse({ hello: "world" })
    ).toEqual({
      hello: "world",
    });
  });

  test("property error", () => {
    expectZodErrorMessage(
      z.object({ hello: z.string() }).safeParse({ hello: 3 } as any)
    ).toMatch(/^following keys failed:\n\t- "hello": .+$/);

    expectZodErrorMessage(
      z.object({ hello: z.string().max(3) }).safeParse({ hello: "world" })
    ).toMatch(/^following keys failed:\n\t- "hello": .+$/);
  });

  test("missing property", () => {
    expectZodErrorMessage(
      z
        .object({
          hello: z.string(),
        })
        .safeParse({} as any)
    ).toMatch('object is missing keys: "hello"');
  });

  test("strips unexpected property", () => {
    expect(
      z
        .object({ hello: z.string() })
        .parse({ hello: "world", bye: "world" } as any)
    ).toEqual({
      hello: "world",
    });
  });
});

describe("z.looseObject()", () => {
  test("lets unexpected properties through", () => {
    expect(
      z
        .looseObject({
          hello: z.string(),
        })
        .parse({
          hello: "world",
          bye: "world",
        })
    ).toEqual({
      hello: "world",
      bye: "world",
    });
  });
  test("z.object().loose() also lets unexpected properties through", () => {
    expect(
      z
        .object({
          hello: z.string(),
        })
        .loose()
        .parse({
          hello: "world",
          bye: "world",
        })
    ).toEqual({
      hello: "world",
      bye: "world",
    });
  });
});

describe("z.strictObject()", () => {
  test("throws on unexpected property", () => {
    expectZodErrorMessage(
      z
        .strictObject({
          hello: z.string(),
        })
        .safeParse({
          hello: "world",
          bye: "world",
        } as any)
    ).toMatch('unexpected keys: "bye"');
  });
  test("z.object().strict() also throws on unexpected property", () => {
    expectZodErrorMessage(
      z
        .object({
          hello: z.string(),
        })
        .strict()
        .safeParse({
          hello: "world",
          bye: "world",
        } as any)
    ).toMatch('unexpected keys: "bye"');
  });
});

describe("z.object().catchall()", () => {
  test("lets keys through and succeeds", () => {
    expect(
      z
        .object({
          hello: z.string(),
        })
        .catchall(z.number())
        .parse({
          hello: "world",
          test: 69,
        })
    ).toEqual({
      hello: "world",
      test: 69,
    } as any);
  });

  test("error in base object", () => {
    expectZodErrorMessage(
      z
        .object({
          hello: z.string(),
        })
        .catchall(z.number())
        .safeParse({
          hello: true,
          test: 69,
        } as any)
    ).toMatch(/^following keys failed:\n\t- \"hello\": .+$/);
  });

  test("throws on error on incorrect catch", () => {
    expectZodErrorMessage(
      z
        .object({
          hello: z.string(),
        })
        .catchall(z.number())
        .safeParse({
          hello: "world",
          test: true,
        })
    ).toMatch(
      /^following key(s)? failed passthrough schema:\n\t\"test"\ ->.+$/
    );
  });
});

describe("z.object().shape", () => {
  const a = z.string();
  const b = z.number();

  test("shape returns correct internal schema", () => {
    expect(z.object({ foo: a, bar: b }).shape.foo).toBe(a);
    expect(z.object({ foo: a, bar: b }).shape.bar).toBe(b);
  });
});

describe("z.object().keyof()", () => {
  test("keyof returns a enum with the correct keys", () => {
    const k = z.object({ foo: z.string(), bar: z.number() }).keyof();
    expect(k.parse("foo")).toMatch("foo");
    expect(k.parse("bar")).toMatch("bar");
    expectZodErrorMessage(k.safeParse("hello")).toMatch(
      'string must be one of the following: "foo", "bar"'
    );
  });
});

describe("z.object().extend()", () => {
  test("extend returns object with the new properties", () => {
    const a = z.string();
    const b = z.number();
    const k = z.object({ foo: a });
    expect(k.extend({ bar: b }).shape).toEqual({
      foo: a,
      bar: b,
    });
    expect(k.loose().extend({ bar: b }).shape).toEqual({
      foo: a,
      bar: b,
    });
    expect(k.strict().extend({ bar: b }).shape).toEqual({
      foo: a,
      bar: b,
    });
    expect(k.catchall(z.number()).extend({ bar: b }).shape).toEqual({
      foo: a,
      bar: b,
    });
  });

  test("extend by using spread syntax", () => {
    const a = z.string();
    const b = z.number();
    const c = z.boolean();

    const k = z.object({ foo: a });
    const l = z.object({ bar: b });

    expect(
      z.object({
        ...k.shape,
        ...l.shape,
        test: c,
      }).shape
    ).toEqual({
      foo: a,
      bar: b,
      test: c,
    });
  });
});

describe("z.object().safeExtend()", () => {
  test("safeExtend throws on different base type", () => {
    expect(() =>
      z.object({ foo: z.number() }).safeExtend({ foo: z.string() } as any)
    ).toThrow("ZodString cannot be used to extend ZodNumber");
  });

  test("safeExtend works like extend on non intersecting keys", () => {
    const a = z.number();
    const b = z.string();
    expect(z.object({ foo: a }).safeExtend({ bar: b }).shape).toEqual(
      z.object({ foo: a }).extend({ bar: b }).shape
    );
  });

  test("safeExtend can extend same keys with same base types and carries over the checks", () => {
    const schema = z
      .object({ foo: z.number().gt(0) })
      .safeExtend({ foo: z.number().lt(3) });

    // initial check
    expectZodErrorMessage(schema.safeParse({ foo: 0 })).toMatch(
      'following keys failed:\n\t- "foo": number must be greater then 0'
    );

    // new check
    expectZodErrorMessage(schema.safeParse({ foo: 3 })).toMatch(
      'following keys failed:\n\t- "foo": number must be less then 3'
    );

    // can pass
    expect(schema.parse({ foo: 2 })).toEqual({ foo: 2 });
  });
});

describe("z.object().pick()", () => {
  const a = z.number();
  const b = z.string();
  expect(z.object({ foo: a, bar: b }).pick({ bar: true }).shape).toEqual({
    bar: b,
  });

  expect(z.object({ foo: a, bar: b }).pick({ buzz: true } as {}).shape).toEqual(
    {}
  );
});

describe("z.object().omit()", () => {
  const a = z.number();
  const b = z.string();
  expect(z.object({ foo: a, bar: b }).omit({ bar: true }).shape).toEqual({
    foo: a,
  });

  expect(z.object({ foo: a, bar: b }).omit({ buzz: true } as {}).shape).toEqual(
    {
      foo: a,
      bar: b,
    }
  );
});
