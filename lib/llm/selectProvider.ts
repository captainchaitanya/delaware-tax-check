export const LLM_PROVIDERS = ["gemini", "anthropic", "mock"] as const;

export type LlmProviderId = (typeof LLM_PROVIDERS)[number];

export type ProviderResolution = {
  requested: LlmProviderId;
  id: LlmProviderId;
  demoMode: boolean;
};

function parseRequested(value: string | undefined): LlmProviderId {
  if (value === "anthropic" || value === "mock" || value === "gemini") {
    return value;
  }
  return "gemini";
}

export type EnvLike = Record<string, string | undefined>;

export function hasProviderKey(
  id: LlmProviderId,
  env: EnvLike = process.env,
): boolean {
  if (id === "gemini") {
    return Boolean(env.GEMINI_API_KEY);
  }
  if (id === "anthropic") {
    return Boolean(env.ANTHROPIC_API_KEY);
  }
  return true;
}

export function resolveProvider(
  env: EnvLike = process.env,
): ProviderResolution {
  const requested = parseRequested(env.LLM_PROVIDER);
  if (requested === "mock" || !hasProviderKey(requested, env)) {
    return { requested, id: "mock", demoMode: true };
  }
  return { requested, id: requested, demoMode: false };
}
