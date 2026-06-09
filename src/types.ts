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
