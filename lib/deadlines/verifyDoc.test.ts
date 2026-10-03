import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { DEADLINE_RULES } from "./rules";
import { renderVerifyMarkdown } from "./verifyDoc";

describe("VERIFY.md", () => {
  it("is generated from the deadline and tax config", () => {
    const md = readFileSync(join(process.cwd(), "VERIFY.md"), "utf8");
    expect(md).toBe(renderVerifyMarkdown());
    for (const rule of DEADLINE_RULES) {
      expect(md).toContain(`| ${rule.id} |`);
      expect(md).toContain(`| ${rule.status} |`);
    }
  });
});
