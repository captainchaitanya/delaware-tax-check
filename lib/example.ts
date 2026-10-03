import type { ClassForm, CalculatorForm } from "./formTypes";

export function newClassForm(overrides: Partial<ClassForm> = {}): ClassForm {
  return {
    id:
      typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : `class-${Math.random().toString(36).slice(2)}`,
    name: "",
    authorized: "",
    parValue: "",
    ...overrides,
  };
}

export const EMPTY_FORM: CalculatorForm = {
  issuedShares: "",
  grossAssets: "",
  classes: [newClassForm({ id: "class-1", name: "Common" })],
};

/** Classic Delaware notice: 10M authorized at $0.00001 par. */
export const CLASSIC_EXAMPLE: CalculatorForm = {
  issuedShares: "8,000,000",
  grossAssets: "100,000",
  classes: [
    newClassForm({
      id: "class-classic",
      name: "Common",
      authorized: "10,000,000",
      parValue: "0.00001",
    }),
  ],
};
