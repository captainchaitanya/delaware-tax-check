import { Rational } from "./rational";

/** Parse a share count or other whole-number field from user text. */
export function parseUserInteger(raw: string): number {
  const value = Rational.fromUserInput(raw);
  if (value.den !== 1n) {
    throw new Error("Enter a whole number");
  }
  if (value.num < 0n) {
    throw new Error("Cannot be negative");
  }
  if (value.num > BigInt(Number.MAX_SAFE_INTEGER)) {
    throw new Error("Number is too large to calculate safely");
  }
  return Number(value.num);
}
