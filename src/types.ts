export type DataStatus =
  | "real"
  | "manual"
  | "uploaded"
  | "demo"
  | "inferred"
  | "missing"
  | "adapter-ready"
  | "click-dummy";

export type CapabilityStatus =
  | "works-in-prototype"
  | "rule-based"
  | "requires-uploaded-data"
  | "simulated"
  | "adapter-ready"
  | "requires-real-api"
  | "requires-human-review";

export type Confidence = "high" | "medium" | "low";

export interface AuditCase {
  id: string;
  auditName: string;
  companyName: string;
  auditGoal: string;
  scopeType: string;
  peopleInScope?: number;
  country?: string;
  confidentialityLevel: string;
  allowedDataModes: string[];
  createdAt: string;
  updatedAt: string;
}

export interface FieldEvidence<T> {
  value: T;
  dataStatus: DataStatus;
  confidence: Confidence;
  sourceNote?: string;
}

export interface CompanyProfile {
  name: FieldEvidence<string>;
  legalForm?: FieldEvidence<string>;
  location?: FieldEvidence<string>;
  industry?: FieldEvidence<string>;
  website?: FieldEvidence<string>;
  employeeCount?: FieldEvidence<number>;
  registerId?: FieldEvidence<string>;
}

export interface AiWorkOrderOption {
  id: string;
  group: string;
  label: string;
  enabled: boolean;
  capabilityStatus: CapabilityStatus;
  requiresHumanReview: boolean;
}

export interface FrameworkReality {
  claimedFramework: string;
  observablePractices: string[];
  roles: string[];
  artifacts: string[];
  maturitySignals: Record<string, number>;
  contradictionHints: string[];
}

export interface SuggestedMapping {
  csvColumn: string;
  suggestedField: string;
  confidence: "high" | "medium" | "low";
  reason: string;
  isConfirmed?: boolean;
}

export interface UploadSummary {
  fileName: string;
  fileType: string;
  rowCount?: number;
  detectedColumns: string[];
  missingRecommendedColumns: string[];
  previewRows: Record<string, unknown>[];
  dataStatus: DataStatus;
  suggestedMappings?: SuggestedMapping[];
}

export interface ProductContext {
  repeatability: number;
  standardizability: number;
  requirementUncertainty: number;
  technicalUncertainty: number;
  customerFeedbackDependency: number;
  regulatoryConstraint: number;
  errorCost: number;
  crossTeamDependencies: number;
  changeFrequency: number;
  innovationShare: number;
  operationalUrgency: number;
  description: string;
}

export interface CynefinAssessment {
  primaryDomain: "Clear" | "Complicated" | "Complex" | "Chaotic" | "Mixed";
  secondaryDomain?: string;
  confidence: Confidence;
  reasoning: string[];
  dataBasis: string[];
  missingEvidence: string[];
  counterHypothesis: string;
  consultantOverride?: {
    domain: string;
    reason: string;
    timestamp: string;
  };
}

export interface InterimHypothesis {
  id: string;
  title: string;
  hypothesis: string;
  basis: string[];
  confidence: Confidence;
  limitation: string;
  nextValidationStep: string;
}

export interface MissingDataQuestion {
  id: string;
  question: string;
  reason: string;
  requiredFor: string;
  priority: "high" | "medium" | "low";
}

export interface AuditState {
  auditCase: AuditCase;
  companyProfile: CompanyProfile;
  aiWorkOrder: AiWorkOrderOption[];
  frameworkReality: FrameworkReality;
  uploadSummary?: UploadSummary;
  processDescription: string;
  interviewNotes: {
    observation: string;
    customerAnswers: string;
    painPoints: string;
    questions: string;
  };
  productContext: ProductContext;
  cynefinAssessment: CynefinAssessment;
}

export type LlmProvider = "mock" | "gemini" | "openrouter" | "anthropic" | "openai";

export type RuntimeMode =
  | "mock-only"
  | "browser-prototype"
  | "supabase-edge-function";

export type ProviderStatus =
  | "configured"
  | "not-configured"
  | "adapter-ready"
  | "unsafe-browser-mode"
  | "mock-only";

export interface LlmProviderConfig {
  provider: LlmProvider;
  runtimeMode: RuntimeMode;
  modelName: string;
  baseUrl?: string;
  apiKey?: string;
  rememberApiKey: boolean;
  temperature: number;
  maxOutputTokens: number;
  requireStructuredJson: boolean;
  storeLlmRunMetadata: boolean;
  allowCustomerData: boolean;
  allowSensitiveData: boolean;
  status: ProviderStatus;
}

export interface SupabaseConfig {
  supabaseUrl: string;
  anonKey: string;
  edgeFunctionBaseUrl?: string;
  storageBucket: string;
  rlsReminderEnabled: boolean;
  connectionStatus: "not-tested" | "mock-ok" | "connected" | "failed";
}

export type DataSourceKind =
  | "jira_csv_json"
  | "jira_oauth"
  | "confluence"
  | "pdf"
  | "docx"
  | "pptx"
  | "xlsx"
  | "csv"
  | "miro"
  | "github_gitlab"
  | "company_data"
  | "manual_notes";

export interface DataSourceDefault {
  kind: DataSourceKind;
  enabled: boolean;
  defaultStatus: "enabled" | "disabled" | "later";
  ingestionMode: "upload" | "api" | "adapter-ready" | "manual" | "not-built";
  sensitivity: "low" | "medium" | "high";
  prototypeSupportLevel: "works-now" | "mock-only" | "adapter-ready" | "not-built";
}

export interface TraceabilityPolicy {
  requireEvidenceForEveryClaim: boolean;
  requireSourceReferences: boolean;
  requireAssumptionsList: boolean;
  requireKpiOrObservableSignal: boolean;
  requireBenchmarkOrTbd: boolean;
  requireConfidenceRating: boolean;
  requireLimitationStatement: boolean;
  requireCounterHypothesis: boolean;
  requireVisualization: boolean;
  requireHumanReviewBeforeFinalReport: boolean;
  blockFinalReportWhenUntracedClaimsExist: boolean;
}

export interface AuditDefaults {
  auditMode: "Automated Evidence Audit" | "Consultant-Validated Audit";
  primaryEvidenceSource: "Jira" | "Documents" | "Mixed";
  defaultTimeWindowDays: 90 | 180 | 365;
  defaultLanguage: "German" | "English";
  defaultReportAudience:
    | "consultant internal"
    | "client leadership"
    | "technical leadership";
  defaultOutputStyle:
    | "evidence-first"
    | "management narrative"
    | "technical audit";
  defaultVisualizationStyle:
    | "clean enterprise"
    | "analytical dashboard"
    | "executive report";
}

export interface AppSettings {
  llmProvider: LlmProviderConfig;
  supabase: SupabaseConfig;
  dataSources: DataSourceDefault[];
  traceabilityPolicy: TraceabilityPolicy;
  auditDefaults: AuditDefaults;
  updatedAt: string;
}

