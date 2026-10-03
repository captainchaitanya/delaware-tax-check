import { describe, expect, it } from "vitest";
import { resolveProvider } from "./selectProvider";

describe("resolveProvider", () => {
  it("falls back to mock when the selected provider has no key", () => {
    expect(
      resolveProvider({ LLM_PROVIDER: "gemini" }),
    ).toEqual({
      requested: "gemini",
      id: "mock",
      demoMode: true,
    });
    expect(
      resolveProvider({ LLM_PROVIDER: "anthropic" }),
    ).toEqual({
      requested: "anthropic",
      id: "mock",
      demoMode: true,
    });
  });

  it("uses mock when asked, even if a key is present", () => {
    expect(
      resolveProvider({
        LLM_PROVIDER: "mock",
        GEMINI_API_KEY: "secret",
      }),
    ).toEqual({
      requested: "mock",
      id: "mock",
      demoMode: true,
    });
  });

  it("keeps gemini when a key is set", () => {
    expect(
      resolveProvider({
        LLM_PROVIDER: "gemini",
        GEMINI_API_KEY: "secret",
      }),
    ).toEqual({
      requested: "gemini",
      id: "gemini",
      demoMode: false,
    });
  });
});
