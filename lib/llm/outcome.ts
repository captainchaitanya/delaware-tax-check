import type { ExtractErrorCode } from "./errors";
import type { ExtractionResult } from "./schema";
import type { LlmProviderId } from "./selectProvider";

export type ExtractSuccess = {
  ok: true;
  result: ExtractionResult;
  provider: LlmProviderId;
  requestedProvider: LlmProviderId;
  demoMode: boolean;
  sampleResult: boolean;
};

export type ExtractFailure = {
  ok: false;
  code: ExtractErrorCode | "rate_limit";
  error: string;
  provider: LlmProviderId;
  requestedProvider: LlmProviderId;
  demoMode: boolean;
};

export type ExtractOutcome = ExtractSuccess | ExtractFailure;
