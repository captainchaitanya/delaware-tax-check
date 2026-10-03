import { describe, expect, it } from "vitest";
import { annualCostTotal, dollarsFromEstimate } from "./costEstimates";

describe("cost estimates", () => {
  it("parses optional dollar strings", () => {
    expect(dollarsFromEstimate("")).toBeNull();
    expect(dollarsFromEstimate("1,200")).toBe(1200);
    expect(dollarsFromEstimate("nope")).toBeNull();
  });

  it("adds Delaware filing to user estimates", () => {
    expect(
      annualCostTotal(450, { indiaFilings: "800", other: "200" }),
    ).toBe(1450);
    expect(annualCostTotal(null, { indiaFilings: "", other: "" })).toBeNull();
    expect(annualCostTotal(null, { indiaFilings: "100", other: "" })).toBe(100);
  });
});
