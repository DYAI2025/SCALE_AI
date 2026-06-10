import { AppSettings, ProviderStatus } from "../types";

export interface SafetyMetricsResult {
  hasKeyStoredPostSave: boolean;
  isBrowserLiveUnsafe: boolean;
  rlsAtRisk: boolean;
  traceabilityLoose: boolean;
  serviceRoleDetected: boolean;
  unsafeWarningTriggered: boolean;
  providerStatus: ProviderStatus;
}

export function evaluateSettingsSafety(settings: AppSettings): SafetyMetricsResult {
  const provider = settings.llmProvider.provider;
  const mode = settings.llmProvider.runtimeMode;
  const apiKey = settings.llmProvider.apiKey || "";
  const remember = settings.llmProvider.rememberApiKey;
  const rlsReminder = settings.supabase.rlsReminderEnabled;
  const policy = settings.traceabilityPolicy;

  // Track service role markers in urls or anon key fields
  const lowerUrl = (settings.supabase.supabaseUrl || "").toLowerCase();
  const lowerAnon = (settings.supabase.anonKey || "").toLowerCase();
  const lowerKey = apiKey.toLowerCase();

  const serviceRoleDetected = 
    lowerAnon.includes("service-role") || 
    lowerAnon.includes("service_role") || 
    lowerKey.includes("service-role") || 
    lowerKey.includes("service_role");

  // Determine provider status flag
  let providerStatus: ProviderStatus = "mock-only";
  if (provider !== "mock") {
    if (mode === "mock-only") {
      providerStatus = "mock-only";
    } else if (mode === "supabase-edge-function") {
      providerStatus = "adapter-ready";
    } else if (mode === "browser-prototype") {
      providerStatus = apiKey ? "unsafe-browser-mode" : "not-configured";
    }
  }

  const hasKeyStoredPostSave = mode === "browser-prototype" && apiKey.length > 0 && remember;
  const isBrowserLiveUnsafe = mode === "browser-prototype" && provider !== "mock";
  const rlsAtRisk = !rlsReminder;
  
  const allTraceabilityOn = Object.values(policy).every(v => v === true);
  const traceabilityLoose = !allTraceabilityOn;

  const unsafeWarningTriggered = isBrowserLiveUnsafe || hasKeyStoredPostSave || serviceRoleDetected || rlsAtRisk;

  return {
    hasKeyStoredPostSave,
    isBrowserLiveUnsafe,
    rlsAtRisk,
    traceabilityLoose,
    serviceRoleDetected,
    unsafeWarningTriggered,
    providerStatus
  };
}

export function filterSettingsBeforeSave(settings: AppSettings): AppSettings {
  const next = JSON.parse(JSON.stringify(settings)) as AppSettings;
  const mode = next.llmProvider.runtimeMode;
  const remember = next.llmProvider.rememberApiKey;

  // Security bounds: Service-role inputs must be scrubbed to prevent client leaks
  if (next.supabase.anonKey.toLowerCase().includes("service_role") || next.supabase.anonKey.toLowerCase().includes("service-role")) {
    next.supabase.anonKey = "";
  }

  // Clear client key if we're not in browser-prototype or did not explicitly choose remember
  if (mode !== "browser-prototype" || !remember) {
    next.llmProvider.apiKey = "";
  }

  return next;
}
