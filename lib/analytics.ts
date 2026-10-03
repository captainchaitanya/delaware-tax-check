export const ANALYTICS_EVENTS = {
  onboardingStarted: "onboarding_started",
  onboardingCompleted: "onboarding_completed",
  deadlineMarkedDone: "deadline_marked_done",
  icsExported: "ics_exported",
  documentExtracted: "document_extracted",
  documentAddedToCalendar: "document_added_to_calendar",
  franchiseTaxCalculated: "franchise_tax_calculated",
} as const;

export type AnalyticsEvent =
  (typeof ANALYTICS_EVENTS)[keyof typeof ANALYTICS_EVENTS];

export type SavingsBucket =
  | "none"
  | "under_1k"
  | "1k_to_10k"
  | "10k_to_50k"
  | "50k_plus";

export function analyticsEnabled(
  env: Record<string, string | undefined> = process.env,
): boolean {
  return Boolean(env.NEXT_PUBLIC_POSTHOG_KEY);
}

export function savingsBucket(savings: number): SavingsBucket {
  if (savings <= 0) {
    return "none";
  }
  if (savings < 1_000) {
    return "under_1k";
  }
  if (savings < 10_000) {
    return "1k_to_10k";
  }
  if (savings < 50_000) {
    return "10k_to_50k";
  }
  return "50k_plus";
}

type PostHogLike = {
  __loaded?: boolean;
  init: (key: string, options: Record<string, unknown>) => void;
  capture: (event: string, properties?: Record<string, unknown>) => void;
};

let client: PostHogLike | null = null;
let loading: Promise<PostHogLike | null> | null = null;

async function loadClient(): Promise<PostHogLike | null> {
  if (!analyticsEnabled() || typeof window === "undefined") {
    return null;
  }
  if (client) {
    return client;
  }
  if (!loading) {
    loading = import("posthog-js").then((mod) => {
      const posthog = mod.default as PostHogLike;
      if (!posthog.__loaded) {
        posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY as string, {
          api_host:
            process.env.NEXT_PUBLIC_POSTHOG_HOST || "https://us.i.posthog.com",
          autocapture: false,
          capture_pageview: true,
          disable_session_recording: true,
          persistence: "localStorage",
        });
      }
      client = posthog;
      return posthog;
    });
  }
  return loading;
}

export function capture(
  event: AnalyticsEvent,
  properties?: Record<string, string | boolean | number>,
): void {
  if (!analyticsEnabled() || typeof window === "undefined") {
    return;
  }
  void loadClient().then((posthog) => {
    posthog?.capture(event, properties);
  });
}

export function resetAnalyticsForTests() {
  client = null;
  loading = null;
}
