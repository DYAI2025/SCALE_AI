import {
  CompanyProfile,
  FrameworkReality,
  UploadSummary,
  ProductContext,
  CynefinAssessment,
  InterimHypothesis,
  MissingDataQuestion,
  AuditState,
  SuggestedMapping
} from "../types";

export function resolveDemoCompany(): CompanyProfile {
  return {
    name: {
      value: "Acme Flow Systems GmbH",
      dataStatus: "demo",
      confidence: "high",
      sourceNote: "Prototype demo seed data. Confidence Score: 0.72"
    },
    legalForm: {
      value: "GmbH",
      dataStatus: "demo",
      confidence: "high",
      sourceNote: "Prototype demo seed data."
    },
    location: {
      value: "Cologne, Germany",
      dataStatus: "demo",
      confidence: "high",
      sourceNote: "Prototype demo seed data."
    },
    industry: {
      value: "B2B SaaS / Industrial Workflow Software",
      dataStatus: "demo",
      confidence: "medium",
      sourceNote: "Prototype demo seed data."
    },
    website: {
      value: "https://example.com",
      dataStatus: "demo",
      confidence: "high",
      sourceNote: "Prototype demo seed data."
    },
    employeeCount: {
      value: 420,
      dataStatus: "demo",
      confidence: "medium",
      sourceNote: "Estimated from company public registry. Confidence Score: 0.72"
    },
    registerId: {
      value: "HRB 998827",
      dataStatus: "demo",
      confidence: "high",
      sourceNote: "Demo mock registry ID."
    }
  };
}

export function detectFrameworkContradictions(reality: FrameworkReality): string[] {
  const hints: string[] = [];
  const claimed = reality.claimedFramework.toLowerCase();
  const practices = reality.observablePractices.map(p => p.toLowerCase());
  const roles = reality.roles.map(r => r.toLowerCase());
  const artifacts = reality.artifacts.map(a => a.toLowerCase());

  const hasSprintPlanning = practices.includes("sprint planning");
  const hasSprintReview = practices.includes("sprint review");
  const hasSprintRetro = practices.includes("retrospective");
  
  const hasWipLimits = practices.includes("wip limits");
  const hasPolicies = practices.includes("explicit policies");

  const hasPortfolioArt = artifacts.includes("portfolio kanban") || practices.includes("portfolio kanban");
  const hasPiPlanning = practices.includes("pi planning");
  const hasProgBoard = artifacts.includes("program board") || artifacts.includes("roadmap");

  if (claimed === "scrum") {
    if (!hasSprintPlanning || !hasSprintReview || !hasSprintRetro) {
      hints.push(
        "CRITICAL GAP: Scrum is claimed, but key inspection/adaptation rituals (Sprint Planning, Review, or Retrospective) are not observably practiced. This indicates structural 'Scrum-But' or process decay."
      );
    }
    if (!roles.includes("product owner")) {
      hints.push(
        "ROLE INCONSISTENCY: Scrum is claimed, but the critical 'Product Owner' role is missing. Who operates as the single point of optimization for value?"
      );
    }
    if (!roles.includes("scrum master") && !roles.includes("agile coach")) {
      hints.push(
        "ROLES AT RISK: No dedicated Scrum Master or Coach is identified. Process facilitation may fall to Managers, shifting authority models."
      );
    }
  }

  if (claimed === "kanban") {
    if (!hasWipLimits) {
      hints.push(
        "METHODOLOGICAL MISMATCH: Kanban is claimed, but there are no virtual Work-In-Progress (WIP) limits. WIP limits are the core differentiator between a Kanban system and a simple task-board."
      );
    }
    if (!hasPolicies) {
      hints.push(
        "PRACTICE GAP: Kanban is claimed, but no 'Explicit Policies' are defined. Teams likely rely on implicit coordination standards, risking inconsistent flow behavior."
      );
    }
  }

  if (claimed === "safe" || claimed === "less" || claimed === "nexus") {
    if (!hasPiPlanning && !hasProgBoard && !hasPortfolioArt) {
      hints.push(
        "SCALING DISCONNECT: A scaled agile framework is declared, but essential multi-team coordination artifacts like Program Boards, Portfolio Kanban, or PI Planning rituals are missing."
      );
    }
  }

  if (claimed === "none" || claimed === "unclear" || claimed === "hybrid") {
    const practiceCount = practices.length;
    if (practiceCount > 6) {
      hints.push(
        "HYBRID COHERENCE: No formal framework is strictly claimed, yet a high density of agile practices exists. The working system appears locally evolved and highly customized."
      );
    }
  }

  return hints;
}

// Map CSV columns to Jira-like concepts
const JIRA_RECOMMENDED_FIELDS = [
  "issue_key",
  "issue_type",
  "status",
  "created_at",
  "started_at",
  "resolved_at",
  "assignee_role",
  "priority",
  "labels",
  "status_transitions",
  "blocked_flag",
  "parent_key",
  "linked_issues"
];

export interface MappedFieldInfo {
  field: string;
  label: string;
  description: string;
  synonyms: string[];
}

export const EXPECTED_MAPPED_FIELDS: MappedFieldInfo[] = [
  { field: "issue_key", label: "Issue Key", description: "Unique tracker identifier (e.g. JIRA-101)", synonyms: ["key", "id", "issue key", "ticket id", "task id", "issue id", "identifier", "issue_key"] },
  { field: "issue_type", label: "Issue Type", description: "Class of work (e.g. Story, Bug, Task)", synonyms: ["type", "issue type", "work type", "category", "item type", "issue_type", "issuetype"] },
  { field: "status", label: "Status", description: "Current work state in the lifecycle", synonyms: ["status", "state", "stage", "progress", "workflow status", "issue_status"] },
  { field: "created_at", label: "Created Date", description: "Timestamp of work item creation", synonyms: ["created", "created date", "created_at", "creation date", "opened date", "created date"] },
  { field: "started_at", label: "Started Date", description: "Timestamp when work actually began", synonyms: ["started", "start date", "started_at", "date started", "in progress date", "wip date", "started date"] },
  { field: "resolved_at", label: "Resolved Date", description: "Timestamp when work was completed", synonyms: ["resolved", "resolved date", "completed date", "closed date", "end date", "completed_at", "resolved date"] },
  { field: "assignee_role", label: "Assignee / Role", description: "Resource role or standard handle assigned", synonyms: ["assignee", "role", "owner", "assignee role", "assigned to", "developer", "assignee_role"] },
  { field: "priority", label: "Priority", description: "Value or urgency of work (e.g. High, Medium)", synonyms: ["priority", "urgency", "severity", "importance", "class of service"] },
  { field: "labels", label: "Labels / Tags", description: "Categorization tags or components", synonyms: ["labels", "tags", "label", "tag", "components", "categories"] },
  { field: "blocked_flag", label: "Blocked Flag", description: "Indicator if item was halted", synonyms: ["blocked", "flagged", "is blocked", "blocker", "blocked flag", "blocked_flag"] }
];

export function suggestMappingsForColumns(headers: string[]): SuggestedMapping[] {
  const suggestions: SuggestedMapping[] = [];
  const mappedExpectedFields = new Set<string>();

  headers.forEach(header => {
    const cleanHeader = header.toLowerCase().replace(/[\s_-]+/g, "_").trim();
    
    // Check perfect exact matches first
    for (const expected of EXPECTED_MAPPED_FIELDS) {
      if (mappedExpectedFields.has(expected.field)) continue;
      
      const hasExactSynonym = expected.synonyms.some(s => s.toLowerCase().replace(/[\s_-]+/g, "_").trim() === cleanHeader);
      const isExactField = expected.field === cleanHeader;
      
      if (isExactField || hasExactSynonym) {
        suggestions.push({
          csvColumn: header,
          suggestedField: expected.field,
          confidence: "high",
          reason: `Exact match for standard '${expected.label}'`,
          isConfirmed: true
        });
        mappedExpectedFields.add(expected.field);
        return;
      }
    }

    // Check substring matches
    for (const expected of EXPECTED_MAPPED_FIELDS) {
      if (mappedExpectedFields.has(expected.field)) continue;
      
      const hasSubstringSynonym = expected.synonyms.some(s => {
        const cleanS = s.toLowerCase().replace(/[\s_-]+/g, "_").trim();
        return cleanHeader.includes(cleanS) || cleanS.includes(cleanHeader);
      });
      
      if (hasSubstringSynonym) {
        suggestions.push({
          csvColumn: header,
          suggestedField: expected.field,
          confidence: "medium",
          reason: `Fuzzy matching standard '${expected.label}'`,
          isConfirmed: true
        });
        mappedExpectedFields.add(expected.field);
        return;
      }
    }
  });

  return suggestions;
}

export function parseCsvContent(text: string, fileName: string): UploadSummary {
  const lines = text.split(/\r?\n/).filter(line => line.trim() !== "");
  if (lines.length === 0) {
    return {
      fileName,
      fileType: "CSV",
      rowCount: 0,
      detectedColumns: [],
      missingRecommendedColumns: JIRA_RECOMMENDED_FIELDS,
      previewRows: [],
      dataStatus: "uploaded",
      suggestedMappings: []
    };
  }

  // Parse headers
  const headers = lines[0].split(",").map(item => item.trim().replace(/^["']|["']$/g, ""));
  
  const previewRows: Record<string, unknown>[] = [];

  // Parse top rows
  const parsedRows = lines.slice(1).map(line => {
    // Basic CSV cell split dealing with optional quotes
    const cells: string[] = [];
    let currentCell = "";
    let insideQuotes = false;
    for (let c = 0; c < line.length; c++) {
      const char = line[c];
      if (char === '"' || char === "'") {
        insideQuotes = !insideQuotes;
      } else if (char === "," && !insideQuotes) {
        cells.push(currentCell.trim().replace(/^["']|["']$/g, ""));
        currentCell = "";
      } else {
        currentCell += char;
      }
    }
    cells.push(currentCell.trim().replace(/^["']|["']$/g, ""));

    const rowObj: Record<string, unknown> = {};
    headers.forEach((h, idx) => {
      rowObj[h] = cells[idx] || "";
    });
    return rowObj;
  });

  const suggestions = suggestMappingsForColumns(headers);
  const mappedTargets = new Set(suggestions.filter(s => s.isConfirmed !== false).map(s => s.suggestedField));
  const missingRecommended = JIRA_RECOMMENDED_FIELDS.filter(field => !mappedTargets.has(field));

  return {
    fileName,
    fileType: "CSV",
    rowCount: parsedRows.length,
    detectedColumns: headers,
    missingRecommendedColumns: missingRecommended,
    previewRows: parsedRows.slice(0, 5),
    dataStatus: "uploaded",
    suggestedMappings: suggestions
  };
}

export function parseJsonContent(text: string, fileName: string): UploadSummary {
  try {
    const data = JSON.parse(text);
    const rows = Array.isArray(data) ? data : (Array.isArray(data.issues) ? data.issues : [data]);
    
    if (rows.length === 0) {
      return {
        fileName,
        fileType: "JSON",
        rowCount: 0,
        detectedColumns: [],
        missingRecommendedColumns: JIRA_RECOMMENDED_FIELDS,
        previewRows: [],
        dataStatus: "uploaded",
        suggestedMappings: []
      };
    }

    const firstRowKeys = Object.keys(rows[0]);
    const suggestions = suggestMappingsForColumns(firstRowKeys);
    const mappedTargets = new Set(suggestions.filter(s => s.isConfirmed !== false).map(s => s.suggestedField));
    const missingRecommended = JIRA_RECOMMENDED_FIELDS.filter(field => !mappedTargets.has(field));

    return {
      fileName,
      fileType: "JSON",
      rowCount: rows.length,
      detectedColumns: firstRowKeys,
      missingRecommendedColumns: missingRecommended,
      previewRows: rows.slice(0, 5),
      dataStatus: "uploaded",
      suggestedMappings: suggestions
    };
  } catch (error) {
    return {
      fileName,
      fileType: "JSON-Invalid",
      rowCount: 0,
      detectedColumns: [],
      missingRecommendedColumns: JIRA_RECOMMENDED_FIELDS,
      previewRows: [],
      dataStatus: "missing",
      suggestedMappings: []
    };
  }
}

export function calculateCynefinHypothesis(ctx: ProductContext): CynefinAssessment {
  const reasoning: string[] = [];
  const dataBasis: string[] = [];
  const missingEvidence: string[] = [];
  
  // Track domain scoring
  const scores = {
    Clear: 0,
    Complicated: 0,
    Complex: 0,
    Chaotic: 0
  };

  // Rule 1: Clear indicator
  if (ctx.repeatability >= 4 && ctx.standardizability >= 4) {
    scores.Clear += 3;
    reasoning.push(`High process repeatability (Score: ${ctx.repeatability}/5) and standardizability (Score: ${ctx.standardizability}/5) strongly support structured or clear work constraints.`);
  }
  if (ctx.requirementUncertainty <= 2 && ctx.technicalUncertainty <= 2) {
    scores.Clear += 2;
    reasoning.push(`Low requirement uncertainty and technical stability indicate cause-and-effect lines are readily obvious.`);
  }

  // Rule 2: Complicated indicator
  if (ctx.technicalUncertainty >= 3 && ctx.technicalUncertainty <= 4) {
    scores.Complicated += 2;
  }
  if (ctx.crossTeamDependencies >= 4) {
    scores.Complicated += 2;
    reasoning.push(`High cross-team dependencies (Score: ${ctx.crossTeamDependencies}/5) suggest structural complication requiring expert coordination and pathway analysis.`);
  }
  if (ctx.errorCost >= 4) {
    scores.Complicated += 2;
    reasoning.push(`Significant cost of error (Score: ${ctx.errorCost}/5) points toward professional vetting and expert-driven 'Analyze-Sense-Respond' behavior.`);
  }

  // Rule 3: Complex indicator
  if (ctx.requirementUncertainty >= 4) {
    scores.Complex += 3;
    reasoning.push(`High requirement uncertainty (Score: ${ctx.requirementUncertainty}/5) indicates that goal variables are discovered experimentally.`);
  }
  if (ctx.customerFeedbackDependency >= 4) {
    scores.Complex += 2;
    reasoning.push(`High customer feedback dependency (Score: ${ctx.customerFeedbackDependency}/5) aligns with probe-sense-respond iterations, characteristic of the Complex domain.`);
  }
  if (ctx.innovationShare >= 4) {
    scores.Complex += 2;
    reasoning.push(`High novelty/innovation focus (Score: ${ctx.innovationShare}/5) prevents retrospectively obvious stabilization.`);
  }

  // Rule 4: Chaotic indicator
  if (ctx.operationalUrgency >= 5 && ctx.changeFrequency >= 4) {
    scores.Chaotic += 3;
    reasoning.push(`Extreme operational urgency (Score: ${ctx.operationalUrgency}/5) combined with rapid ambient shifts limits deliberative modeling, indicating high vulnerability to Chaotic disruptions.`);
  }

  // Determine primary domain
  let primaryDomain: "Clear" | "Complicated" | "Complex" | "Chaotic" | "Mixed" = "Mixed";
  let maxScore = 0;
  let secondaryDomain: string | undefined = undefined;

  const sortedScores = Object.entries(scores).sort((a, b) => b[1] - a[1]);
  const margin = Math.abs(sortedScores[0][1] - sortedScores[1][1]);

  if (margin <= 1 && sortedScores[0][1] > 0) {
    primaryDomain = "Mixed";
    secondaryDomain = `${sortedScores[0][0]} / ${sortedScores[1][0]}`;
    reasoning.push(`Competing signatures: the scores for ${sortedScores[0][0]} and ${sortedScores[1][0]} are highly balanced, indicating a boundary work system.`);
  } else {
    primaryDomain = sortedScores[0][0] as any;
    if (sortedScores[1][1] > 1) {
      secondaryDomain = sortedScores[1][0];
    }
  }

  dataBasis.push(`Input dimensions quantified: repeatability (${ctx.repeatability}), standardizability (${ctx.standardizability}), requirement uncertainty (${ctx.requirementUncertainty}), technical uncertainty (${ctx.technicalUncertainty}).`);

  // Analyze missing evidence
  if (ctx.description.length < 15) {
    missingEvidence.push("Qualitative description is empty or very brief. Qualitative context helps validate score coherence.");
  }
  if (ctx.changeFrequency === 0) {
    missingEvidence.push("No change frequency dimension was evaluated.");
  }

  const confidenceValue: "low" | "medium" | "high" = 
    ctx.description.length > 50 && (ctx.requirementUncertainty > 1 || ctx.technicalUncertainty > 1) 
      ? "high" : "medium";

  // Auto-generate counter hypothesis
  let counterHypothesis = "";
  if (primaryDomain === "Clear") {
    counterHypothesis = "The work system might appear highly predictable under normal operations but harbor hidden technical complexity or team dependencies that trigger systemic failures when exceptions arise.";
  } else if (primaryDomain === "Complicated") {
    counterHypothesis = "While expert analysis is assumed to suffice, frequent ambient requirement changes from customers might actually make the outcomes unpredictable, rendering it fundamentally Complex.";
  } else if (primaryDomain === "Complex") {
    counterHypothesis = "Parts of the delivery cycle (like testing or deployment releases) might actually be highly repeatable and standardizable (Complicated or Clear) if automated, masking opportunities for structural stabilization.";
  } else if (primaryDomain === "Chaotic") {
    counterHypothesis = "The operational urgency looks chaotic, but is perhaps artificially induced by poor work management structures or a lack of WIP policies, masking a standardizable Complicated flow.";
  } else {
    counterHypothesis = "Rather than a genuinely mixed domain, the system may have clear boundaries between Complicated development blocks and Complex discovery blocks, requiring structured interface alignment rather than hybrid methods.";
  }

  return {
    primaryDomain,
    secondaryDomain,
    confidence: confidenceValue,
    reasoning,
    dataBasis,
    missingEvidence,
    counterHypothesis
  };
}

export function generateInterimHypotheses(state: AuditState): InterimHypothesis[] {
  const list: InterimHypothesis[] = [];
  const claimed = state.frameworkReality.claimedFramework;
  const contras = state.frameworkReality.contradictionHints;
  const assessment = state.cynefinAssessment;

  // Possible flow issue hypothesis
  if (state.productContext.crossTeamDependencies >= 4) {
    list.push({
      id: "hyp-flow-dep",
      title: "Flow Squeeze: Cross-Team Blocking Risk",
      hypothesis: "Frequent coordination standstills and high cycle times are likely caused by unvisualized, uncommitted horizontal team dependencies rather than individual speed limitations.",
      basis: ["Cross-team dependency score: " + state.productContext.crossTeamDependencies + "/5", "Artifact state: Program / roadmap board tracking"],
      confidence: "medium",
      limitation: "Requires empirical cycle time breakdown or cumulative flow comparison from Jira.",
      nextValidationStep: "Validate by tracking 'Blocked Days' as a distinct lead time segment in the upcoming Jira evidence packet."
    });
  } else if (state.uploadSummary && state.uploadSummary.rowCount && state.uploadSummary.rowCount > 0) {
    list.push({
      id: "hyp-flow-evidence",
      title: "Flow Efficiency Leak",
      hypothesis: "Initial data processing suggests bottlenecks may lie in state transition queues (waiting on approval / validation) rather than active engineering time.",
      basis: ["Uploaded rows: " + state.uploadSummary.rowCount, "Columns detected: " + state.uploadSummary.detectedColumns.length],
      confidence: "medium",
      limitation: "Status transition times are inferred. No manual calendars matched.",
      nextValidationStep: "Generate a transition-duration matrix from the uploaded dataset to quantify active vs queue times."
    });
  }

  // Framework mismatch hypothesis
  if (contras.length > 0) {
    list.push({
      id: "hyp-mismatch",
      title: "Framework Decoupling: Nominal vs Living Agility",
      hypothesis: `The organization operates on a Nominal Scrum/Agile standard, but lacks structural rituals (${claimed}). This decoupling induces overhead without returning inspection benefits.`,
      basis: contras,
      confidence: "high",
      limitation: "Assumes practice checklist represents actual daily interactions accurately.",
      nextValidationStep: "Conduct silent observation of a Daily Standup and Sprint Planning to qualify decision-making reality."
    });
  }

  // Game rules mismatch with Cynefin
  if (assessment.primaryDomain === "Complex" && (claimed.toLowerCase() === "classical project management" || claimed.toLowerCase() === "hybrid")) {
    list.push({
      id: "hyp-cynefin-clash",
      title: "Cognitive Dissonance: Complex Work vs Plan-Driven Governance",
      hypothesis: "The unit attempts to control highly uncertain, feedback-dependent discovery work with upfront Milestone planning, resulting in predictable delivery delays and hidden technical debt.",
      basis: [
        "Cynefin Domain: " + assessment.primaryDomain,
        "Claimed Governance: " + claimed,
        "Customer feedback dependency: " + state.productContext.customerFeedbackDependency + "/5"
      ],
      confidence: "high",
      limitation: "The degree of actual plan rigidity is not fully audited.",
      nextValidationStep: "Interview leadership to examine whether milestones can be legally adjusted recursively based on dynamic experiments."
    });
  }

  // Missing evidence safety check
  if (!state.uploadSummary) {
    list.push({
      id: "hyp-missing-data",
      title: "Groundedness Risk: Speculative Baseline",
      hypothesis: "Current assessment conclusions remain highly qualitative and vulnerable to observational bias, lacking empirical flow or transaction histories.",
      basis: ["No Jira workflow CSV uploaded", "Source matrix: qualitative observations dominance"],
      confidence: "low",
      limitation: "Based strictly on the absence of files during current session.",
      nextValidationStep: "Request and upload 3 months of anonymous team issue history before presenting recommendations."
    });
  }

  return list;
}

export function generateMissingDataQuestions(state: AuditState): MissingDataQuestion[] {
  const questions: MissingDataQuestion[] = [];
  const claimed = state.frameworkReality.claimedFramework;
  const roles = state.frameworkReality.roles.map(r => r.toLowerCase());
  const practices = state.frameworkReality.observablePractices.map(p => p.toLowerCase());
  const context = state.productContext;

  // Question 1: Jira missing
  if (!state.uploadSummary) {
    questions.push({
      id: "q_jira",
      question: "Can a Jira export containing issue state transition timestamps, issue types, and blocker indicators be provided?",
      reason: "To baseline the actual flow performance and calculate standard Kanban/agile metrics (Lead Time, Flow Efficiency).",
      requiredFor: "Quantifying bottlenecks beyond consultant observation",
      priority: "high"
    });
  } else {
    // Check if Jira dataset is missing crucial headers
    const missing = state.uploadSummary.missingRecommendedColumns;
    if (missing.some(col => ["started_at", "resolved_at"].includes(col))) {
      questions.push({
        id: "q_jira_timestamps",
        question: "Your Jira CSV/JSON is missing exact 'Started At' or 'Resolved At' state timestamps. Is it possible to generate a detailed history transitions export?",
        reason: "Without historical transition timestamps, we can only infer cycle times, preventing highly precise bottlenecks profiling.",
        requiredFor: "Accurate Cumulative Flow Diagram modeling",
        priority: "medium"
      });
    }
  }

  // Question 2: Scrum PO unclear
  if (claimed.toLowerCase() === "scrum" && !roles.includes("product owner")) {
    questions.push({
      id: "q_scrum_po",
      question: "Who prioritizes the work queue with ultimate decision authority, and how is customer value quantified?",
      reason: "Scrum was declared, but no dedicated Product Owner role is flagged. Clarifying queue triage ownership is vital.",
      requiredFor: "Defining team accountability boundaries",
      priority: "high"
    });
  }

  // Question 3: Kanban WIP limits missing
  if (claimed.toLowerCase() === "kanban" && !practices.includes("wip limits")) {
    questions.push({
      id: "q_kanban_wip",
      question: "Which Work-In-Progress limits currently exist per workflow status, team, or service class?",
      reason: "Kanban is noted, but WIP limits appear unselected. WIP constraints are critical to unlock flow benefits.",
      requiredFor: "Differentiating Kanban practice from a simple Visual Board",
      priority: "high"
    });
  }

  // Question 4: Complex vs plan driven
  if (context.requirementUncertainty >= 4 && (claimed.toLowerCase() === "classical project management" || claimed.toLowerCase() === "hybrid")) {
    questions.push({
      id: "q_uncertain_experiments",
      question: "Which parts of your monthly roadmap are treated as experimental feedback loops rather than fixed output promises?",
      reason: "The context scores indicate extremely high requirement volatility, which clashes directly with plan-driven commitments.",
      requiredFor: "Adapting strategic estimation practices to market discovery reality",
      priority: "medium"
    });
  }

  // Question 5: High dependency coordination
  if (context.crossTeamDependencies >= 4 && !practices.includes("portfolio kanban") && !state.frameworkReality.artifacts.map(a => a.toLowerCase()).includes("roadmap")) {
    questions.push({
      id: "q_coord_dependency",
      question: "How are multi-team dependencies visualised, negotiated, and aligned during mid-term priority sessions?",
      reason: "Dependencies score highly, but visual alignment artifacts are missing in our checklists, hinting at high coordination waste.",
      requiredFor: "Designing horizontal scaling improvements, avoiding single team focus traps",
      priority: "high"
    });
  }

  // Question 6: Low confidence warning question
  if (state.cynefinAssessment.confidence === "low") {
    questions.push({
      id: "q_confidence_baseline",
      question: "Which additional quantitative work evidence or team interviews would make this initial assessment fully decision-ready?",
      reason: "Current Cynefin confidence is marked low or speculative due to limited descriptive input.",
      requiredFor: "Establishing a reliable consulting benchmark",
      priority: "medium"
    });
  }

  return questions;
}

export function calculateDataQuality(state: AuditState): {
  scorePercent: number;
  availableCount: number;
  totalCount: number;
  matrix: Record<string, string>;
} {
  const profile = state.companyProfile;
  let availableCount = 0;
  let totalCount = 8; // items: name, legalForm, location, industry, website, size, registerId, uploadedData

  const matrix: Record<string, string> = {
    name: profile.name.dataStatus,
    legalForm: profile.legalForm?.dataStatus || "missing",
    location: profile.location?.dataStatus || "missing",
    industry: profile.industry?.dataStatus || "missing",
    website: profile.website?.dataStatus || "missing",
    employeeCount: profile.employeeCount?.dataStatus || "missing",
    registerId: profile.registerId?.dataStatus || "missing",
    workflowData: state.uploadSummary ? "uploaded" : "missing"
  };

  Object.values(matrix).forEach(status => {
    if (status !== "missing") {
      availableCount++;
    }
  });

  const scorePercent = Math.round((availableCount / totalCount) * 100);

  return {
    scorePercent,
    availableCount,
    totalCount,
    matrix
  };
}
