import { AppSettings } from "../types";

export const DEFAULT_SETTINGS: AppSettings = {
  llmProvider: {
    provider: "mock",
    runtimeMode: "mock-only",
    modelName: "mock-gpt-v1",
    baseUrl: "",
    apiKey: "",
    rememberApiKey: false,
    temperature: 0.2,
    maxOutputTokens: 2048,
    requireStructuredJson: true,
    storeLlmRunMetadata: true,
    allowCustomerData: false,
    allowSensitiveData: false,
    status: "mock-only"
  },
  supabase: {
    supabaseUrl: "",
    anonKey: "",
    edgeFunctionBaseUrl: "",
    storageBucket: "audit-evidence",
    rlsReminderEnabled: true,
    connectionStatus: "not-tested"
  },
  dataSources: [
    { kind: "jira_csv_json", enabled: true, defaultStatus: "enabled", ingestionMode: "upload", sensitivity: "high", prototypeSupportLevel: "works-now" },
    { kind: "jira_oauth", enabled: true, defaultStatus: "later", ingestionMode: "api", sensitivity: "high", prototypeSupportLevel: "adapter-ready" },
    { kind: "confluence", enabled: false, defaultStatus: "later", ingestionMode: "api", sensitivity: "high", prototypeSupportLevel: "not-built" },
    { kind: "pdf", enabled: true, defaultStatus: "enabled", ingestionMode: "upload", sensitivity: "medium", prototypeSupportLevel: "adapter-ready" },
    { kind: "docx", enabled: true, defaultStatus: "enabled", ingestionMode: "upload", sensitivity: "medium", prototypeSupportLevel: "adapter-ready" },
    { kind: "pptx", enabled: true, defaultStatus: "enabled", ingestionMode: "upload", sensitivity: "medium", prototypeSupportLevel: "adapter-ready" },
    { kind: "xlsx", enabled: true, defaultStatus: "enabled", ingestionMode: "upload", sensitivity: "medium", prototypeSupportLevel: "adapter-ready" },
    { kind: "csv", enabled: true, defaultStatus: "enabled", ingestionMode: "upload", sensitivity: "medium", prototypeSupportLevel: "works-now" },
    { kind: "miro", enabled: true, defaultStatus: "later", ingestionMode: "api", sensitivity: "medium", prototypeSupportLevel: "adapter-ready" },
    { kind: "github_gitlab", enabled: true, defaultStatus: "later", ingestionMode: "api", sensitivity: "medium", prototypeSupportLevel: "adapter-ready" },
    { kind: "company_data", enabled: true, defaultStatus: "later", ingestionMode: "api", sensitivity: "medium", prototypeSupportLevel: "adapter-ready" },
    { kind: "manual_notes", enabled: true, defaultStatus: "enabled", ingestionMode: "manual", sensitivity: "low", prototypeSupportLevel: "works-now" }
  ],
  traceabilityPolicy: {
    requireEvidenceForEveryClaim: true,
    requireSourceReferences: true,
    requireAssumptionsList: true,
    requireKpiOrObservableSignal: true,
    requireBenchmarkOrTbd: true,
    requireConfidenceRating: true,
    requireLimitationStatement: true,
    requireCounterHypothesis: true,
    requireVisualization: true,
    requireHumanReviewBeforeFinalReport: true,
    blockFinalReportWhenUntracedClaimsExist: true
  },
  auditDefaults: {
    auditMode: "Automated Evidence Audit",
    primaryEvidenceSource: "Jira",
    defaultTimeWindowDays: 180,
    defaultLanguage: "German",
    defaultReportAudience: "consultant internal",
    defaultOutputStyle: "evidence-first",
    defaultVisualizationStyle: "analytical dashboard"
  },
  updatedAt: new Date().toISOString()
};
