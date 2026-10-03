import { describe, expect, it } from "vitest";
import { parseUserInteger } from "./parseInput";
import { Rational } from "./rational";

describe("Rational.fromUserInput", () => {
  it("parses a tiny par value written as a decimal string", () => {
    expect(Rational.fromUserInput("0.00001").toDecimalString()).toBe("0.00001");
  });

  it("parses numbers with thousands commas", () => {
    expect(Rational.fromUserInput("10,000,000").toDecimalString()).toBe(
      "10000000",
    );
    expect(Rational.fromUserInput("100,000.50").toDecimalString()).toBe(
      "100000.5",
    );
  });

  it("parses scientific notation used for tiny par values", () => {
    expect(Rational.fromUserInput("1e-5").eq(Rational.from("0.00001"))).toBe(
      true,
    );
  });

  it("rejects empty and blank strings with a clear error", () => {
    expect(() => Rational.fromUserInput("")).toThrow(/enter a number/i);
    expect(() => Rational.fromUserInput("   ")).toThrow(/enter a number/i);
  });

  it("rejects invalid strings with a clear error", () => {
    expect(() => Rational.fromUserInput("abc")).toThrow(/invalid number/i);
    expect(() => Rational.fromUserInput("12.34.56")).toThrow(/invalid number/i);
    expect(() => Rational.fromUserInput("$100")).toThrow(/invalid number/i);
  });
});

describe("parseUserInteger", () => {
  it("parses comma-formatted share counts", () => {
    expect(parseUserInteger("10,000,000")).toBe(10_000_000);
    expect(parseUserInteger("8,000,000")).toBe(8_000_000);
  });

  it("rejects fractions, empties, and negatives", () => {
    expect(() => parseUserInteger("1e-5")).toThrow(/whole number/i);
    expect(() => parseUserInteger("")).toThrow(/enter a number/i);
    expect(() => parseUserInteger("-12")).toThrow(/cannot be negative/i);
  });
});
