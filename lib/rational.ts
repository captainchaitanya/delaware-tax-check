/**
 * Exact rational arithmetic for franchise-tax math.
 * IEEE-754 cannot represent par values like 0.00001 without rounding error.
 */

export class Rational {
  readonly num: bigint;
  readonly den: bigint;

  constructor(num: bigint, den: bigint = 1n) {
    if (den === 0n) {
      throw new Error("Division by zero");
    }
    if (den < 0n) {
      num = -num;
      den = -den;
    }
    const g = gcd(abs(num), den);
    this.num = num / g;
    this.den = den / g;
  }

  static from(value: number | string | Rational): Rational {
    if (value instanceof Rational) {
      return value;
    }
    return parseDecimal(value);
  }

  /**
   * Parse a form/paste string: "0.00001", "10,000,000", "1e-5".
   * Thousands commas are stripped. Empty and non-numeric strings throw.
   */
  static fromUserInput(raw: string): Rational {
    const trimmed = raw.trim();
    if (trimmed === "") {
      throw new Error("Enter a number");
    }
    const withoutCommas = trimmed.replace(/,/g, "");
    try {
      return parseDecimal(withoutCommas);
    } catch {
      throw new Error(`Invalid number: "${trimmed}"`);
    }
  }

  static zero(): Rational {
    return new Rational(0n, 1n);
  }

  eq(other: Rational): boolean {
    return this.num === other.num && this.den === other.den;
  }

  add(other: Rational): Rational {
    return new Rational(
      this.num * other.den + other.num * this.den,
      this.den * other.den,
    );
  }

  mul(other: Rational): Rational {
    return new Rational(this.num * other.num, this.den * other.den);
  }

  div(other: Rational): Rational {
    if (other.num === 0n) {
      throw new Error("Division by zero");
    }
    return new Rational(this.num * other.den, this.den * other.num);
  }

  lt(other: Rational): boolean {
    return this.num * other.den < other.num * this.den;
  }

  isNegative(): boolean {
    return this.num < 0n;
  }

  /** Smallest integer greater than or equal to this value. */
  ceil(): bigint {
    if (this.den === 1n) {
      return this.num;
    }
    const q = this.num / this.den;
    const r = this.num % this.den;
    if (r === 0n) {
      return q;
    }
    return this.num > 0n ? q + 1n : q;
  }

  toDecimalString(maxPlaces = 24): string {
    const sign = this.num < 0n ? "-" : "";
    const num = abs(this.num);
    const whole = num / this.den;
    let rem = num % this.den;
    if (rem === 0n) {
      return `${sign}${whole.toString()}`;
    }

    const digits: string[] = [];
    while (rem !== 0n && digits.length < maxPlaces) {
      rem *= 10n;
      digits.push((rem / this.den).toString());
      rem = rem % this.den;
    }

    const frac = digits.join("").replace(/0+$/, "");
    return frac.length === 0
      ? `${sign}${whole.toString()}`
      : `${sign}${whole.toString()}.${frac}`;
  }
}

function abs(n: bigint): bigint {
  return n < 0n ? -n : n;
}

function gcd(a: bigint, b: bigint): bigint {
  while (b !== 0n) {
    const t = b;
    b = a % b;
    a = t;
  }
  return a;
}

function parseDecimal(value: number | string): Rational {
  if (typeof value === "number") {
    if (!Number.isFinite(value)) {
      throw new Error("Value must be a finite number");
    }
    // toString() uses the shortest unique decimal, so 0.00001 stays "0.00001"
    value = value.toString();
  }

  const trimmed = value.trim();
  const match = trimmed.match(/^([+-]?)(\d+)(?:\.(\d+))?(?:[eE]([+-]?\d+))?$/);
  if (!match) {
    throw new Error(`Invalid decimal value: "${value}"`);
  }

  const sign = match[1] === "-" ? -1n : 1n;
  const intPart = match[2];
  const fracPart = match[3] ?? "";
  const exp = match[4] ? Number(match[4]) : 0;
  const digits = intPart + fracPart;
  const denPlaces = fracPart.length - exp;

  let num = sign * BigInt(digits);
  let den = 1n;
  if (denPlaces > 0) {
    den = 10n ** BigInt(denPlaces);
  } else if (denPlaces < 0) {
    num *= 10n ** BigInt(-denPlaces);
  }

  return new Rational(num, den);
}
