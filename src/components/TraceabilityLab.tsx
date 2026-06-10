import React, { useState } from "react";
import { 
  Database, 
  Cpu, 
  FileText, 
  CheckCircle, 
  AlertTriangle, 
  Trash2,
  GitBranch, 
  PlusCircle, 
  TrendingUp, 
  Eye, 
  ListFilter,
  BarChart3,
  Check, 
  X,
  HelpCircle,
  FileSpreadsheet,
  AlertCircle
} from "lucide-react";
import { 
  EvidenceItem, 
  AuditVariable, 
  ReportSectionContract, 
  AppSettings, 
  EvidenceSourceType, 
  EvidenceStrength,
  AuditVariableCategory,
  DataStatus
} from "../types";
import { EvidenceItemManager } from "./EvidenceItemManager";

// Seed 5 Evidence Items (Task 4.1)
const SEED_EVIDENCE_ITEMS: EvidenceItem[] = [
  {
    id: "EV-JIRA-01",
    auditProjectId: "proj-scale-01",
    title: "Jira System Lifecycle Configuration Audit",
    sourceType: "jira",
    sourceRef: "JIRA-XML-CONF-09",
    sourceLabel: "Jira Workflow Export c4_2",
    status: "normalized",
    strength: "direct",
    dataStatus: "uploaded",
    summary: "Workflow transition maps retrieved via system file dump. Revealed 9 non-standard multi-tier state gates with manual approval overrides.",
    extractedFacts: [
      "9 separate active lifecycles exist for Scrum and Kanban templates.",
      "Approval queue states average 6.2 day residency prior to developer pull transitions."
    ],
    limitations: [
      "Audit is restricted to the Köln development division backlog."
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: "EV-JIRA-02",
    auditProjectId: "proj-scale-01",
    title: "Backlog Issue Type Variance Metrics",
    sourceType: "jira",
    sourceRef: "JIRA-CSV-BACKLOG",
    sourceLabel: "Köln Backlog CSV (Q1-Q2)",
    status: "reviewed",
    strength: "strong",
    dataStatus: "uploaded",
    summary: "Quantitative analysis of 1,240 tickets shows extreme high-variance in issue classification, where bug reports are frequently written as generic stories to bypass SLAs.",
    extractedFacts: [
      "Bug-to-Story ratio is inverted 1:4 (25% bugs, 75% stories).",
      "Over 40% of the active stories contain single-word or empty description parameters, indicating task-level fragmentation."
    ],
    limitations: [
      "Under-reporting of operational bug tickets may exist due to team peer-pressure."
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: "EV-JIRA-03",
    auditProjectId: "proj-scale-01",
    title: "Granularity and Flow Velocity Summary",
    sourceType: "spreadsheet",
    sourceRef: "EXCEL-FLOW-V2",
    sourceLabel: "Internal Delivery Statistics",
    status: "derived",
    strength: "moderate",
    dataStatus: "demo",
    summary: "Determined lead time median values for feature epics from team spreadsheets. Disclosed significant skewing caused by a few legacy system deployments.",
    extractedFacts: [
      "Lead time median is 24.5 days for Köln teams.",
      "74% description density index calculated across active epics."
    ],
    limitations: [
      "Delivery logs are periodically manually adjusted to conform with external stakeholder quarterly reports."
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: "EV-POLICY-04",
    auditProjectId: "proj-scale-01",
    title: "Regulatory and Audit Traceability Policy",
    sourceType: "document",
    sourceRef: "ISO-AGILE-REG-2026",
    sourceLabel: "Governance Standards Manual v1",
    status: "reviewed",
    strength: "direct",
    dataStatus: "manual",
    summary: "Baseline auditing contract outlining acceptable evidence proof points. Requires dual-review and explicit KPI grounding for all high-risk claims.",
    extractedFacts: [
      "Claim justification rules demand at least 1 direct operational evidence ref.",
      "Every report section requires counter-hypothesis and limitation disclosures."
    ],
    limitations: [
      "Does not cover regulatory exceptions in extreme out-of-scope conditions."
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: "EV-LLM-05",
    auditProjectId: "proj-scale-01",
    title: "Mock LLM Draft Generative Run",
    sourceType: "llm_output",
    sourceRef: "MOCK-LLM-GEN-01",
    sourceLabel: "Local Cogitive Gen Run #05",
    status: "raw",
    strength: "weak",
    dataStatus: "click-dummy",
    summary: "Draft section generated locally using the mock offline reasoning engine. Contains synthesized suggestions based on the qualitative workspace context.",
    extractedFacts: [
      "Simulated friction hypotheses formulated for alignment with Germany division lead times.",
      "Suggested bar chart metrics for workflow state variances."
    ],
    limitations: [
      "Completely synthetic content. No real external model was invoked."
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

// Seed 7 Audit Variables (Task 4.2)
const SEED_AUDIT_VARIABLES: AuditVariable[] = [
  {
    id: "VAR-001",
    auditProjectId: "proj-scale-01",
    category: "work_system_coherence",
    name: "Issue Type Variance Index",
    value: "High (0.84)",
    unit: "variance index",
    measurementMethod: "Levenshtein distance & category ratio comparison",
    evidenceRefs: ["EV-JIRA-02"],
    confidence: "high",
    benchmarkRef: "ISO-AGILE-7",
    interpretation: "There is an extreme variance in how tickets are tagged. Bugs are documented in stories, muddying agile statistics.",
    counterHypothesis: "Teams might use generic stories because of a lack of workflow support for custom non-standard tasks.",
    limitation: "Cannot isolate intentional SLA evasion from normal process training flaws.",
    recommendedVisualization: "bar_chart"
  },
  {
    id: "VAR-002",
    auditProjectId: "proj-scale-01",
    category: "work_system_coherence",
    name: "Workflow Lifecycles Count",
    value: 9,
    unit: "unique workflows",
    measurementMethod: "Direct workflow mapping export check",
    evidenceRefs: ["EV-JIRA-01"],
    confidence: "high",
    benchmarkRef: "TBD",
    interpretation: "9 different workflows are active for scrum teams, which complicates shared alignment and metrics comparison.",
    counterHypothesis: "Different products have functionally orthogonal delivery constraints that require specialized transitions.",
    limitation: "Assumes visual configurations in Jira correspond to identical process workflows physically.",
    recommendedVisualization: "evidence_graph"
  },
  {
    id: "VAR-003",
    auditProjectId: "proj-scale-01",
    category: "data_quality",
    name: "Description Completion Density",
    value: "74%",
    unit: "percent",
    measurementMethod: "Character content filter scan against active story backlogs",
    evidenceRefs: ["EV-JIRA-03"],
    confidence: "medium",
    benchmarkRef: "TBD",
    interpretation: "26% of tickets are empty or single-sentence, indicating that most specifications are verbally shared offline.",
    counterHypothesis: "A highly expert team operates efficiently on lean micro-cards without needing redundant documentation loops.",
    limitation: "Excludes attachments or comments from description length evaluations.",
    recommendedVisualization: "radar"
  },
  {
    id: "VAR-004",
    auditProjectId: "proj-scale-01",
    category: "flow_visibility",
    name: "Lead Time Median Index",
    value: 24.5,
    unit: "days",
    measurementMethod: "Resolution - Started time interval timestamp scan",
    evidenceRefs: ["EV-JIRA-01", "EV-JIRA-03"],
    confidence: "high",
    benchmarkRef: "SME-BENCHMARK-FLOW",
    interpretation: "Delivery cycle averages 3.5 weeks, lagging industry standard SME medians of 14 days.",
    counterHypothesis: "German regional security regulations require 7 days of isolation testing before code joins production builds.",
    limitation: "Started time is frequently post-hoc simulated because engineers drag columns backward after completion.",
    recommendedVisualization: "line_chart"
  },
  {
    id: "VAR-005",
    auditProjectId: "proj-scale-01",
    category: "flow_visibility",
    name: "Aging WIP Count",
    value: 42,
    unit: "active items",
    measurementMethod: "WIP items open for over 30 contiguous days",
    evidenceRefs: ["EV-JIRA-01"],
    confidence: "high",
    benchmarkRef: "TBD",
    interpretation: "42 active tickets are sitting stagnant in progress, demonstrating a high accumulation of task bottleneck queues.",
    counterHypothesis: "Stallings are caused by external customer coordination delays rather than internal delivery constraints.",
    limitation: "Excludes vacation patterns and team restructuring periods from the duration logs.",
    recommendedVisualization: "timeline"
  },
  {
    id: "VAR-006",
    auditProjectId: "proj-scale-01",
    category: "dependency_load",
    name: "Dependency Link Density Ratio",
    value: "1.8 links/issue",
    unit: "links per item",
    measurementMethod: "Jira issue link adjacency graph mapping",
    evidenceRefs: ["EV-JIRA-01", "EV-POLICY-04"],
    confidence: "medium",
    benchmarkRef: "TBD",
    interpretation: "Nearly two blockers are bound to every story ticket, translating to extreme horizontal coordination roadblocks.",
    counterHypothesis: "High linking rates showcase team members proactively marking potential collaborations early.",
    limitation: "Many links are historical duplicates or generic labels that are never cleared.",
    recommendedVisualization: "network_graph"
  },
  {
    id: "VAR-007",
    auditProjectId: "proj-scale-01",
    category: "governance_friction",
    name: "Mean Approval Wait Time",
    value: 6.2,
    unit: "days",
    measurementMethod: "Wait-state transition check prior to deploy",
    evidenceRefs: ["EV-JIRA-01", "EV-LLM-05"],
    confidence: "low",
    benchmarkRef: "ISO-SLA-9",
    interpretation: "Approval protocols inject an block queue of 6 days, which represents 25% of the total median cycle duration.",
    counterHypothesis: "Formal gates assure high software quality and prevent security incidents on legacy financial backbones.",
    limitation: "Timestamp is recorded only inside office hours, skewing actual calendar residency.",
    recommendedVisualization: "heatmap"
  }
];

// Seed 3 Report Section Contracts (Task 4.3)
const SEED_REPORT_CONTRACTS: ReportSectionContract[] = [
  {
    id: "SEC-001",
    auditProjectId: "proj-scale-01",
    title: "Company Context and Industry Benchmark Fit",
    sectionType: "company_context",
    narrative: "The subject organization Acme Flow Systems GmbH operates in highly volatile B2B SaaS spaces. Given these fast constraints, their governance systems require strong feedback loops, yet plan-driven framework boundaries restrict reactive adjustments.",
    evidenceRefs: ["EV-POLICY-04"],
    assumptions: [
      "ASSUME: Target market has not reached stabilization."
    ],
    kpiRefs: ["VAR-003"],
    benchmarkRefs: ["ISO-AGILE-7"],
    confidence: "high",
    limitation: "Analysis relies largely on qualitative leadership declarations.",
    counterHypothesis: "The present market volatility is superficial; the product has reached maturity and needs strict stability.",
    visualizationType: "radar",
    humanReviewStatus: "completed",
    status: "reviewed"
  },
  {
    id: "SEC-002",
    auditProjectId: "proj-scale-01",
    title: "Operating Model and Workflow Lifecycle Dispersal",
    sectionType: "jira_operating_model",
    narrative: "Agile operational reality is highly incoherent. Multiple custom Scrum-hybrid templates exist with vast lifecycle pathways, resulting in non-standard metrics and hidden delivery blockages.",
    evidenceRefs: ["EV-JIRA-01", "EV-JIRA-02"],
    assumptions: [
      "ASSUME: Teams don't actively subvert Jira states maliciously."
    ],
    kpiRefs: ["VAR-001", "VAR-002"],
    benchmarkRefs: ["TBD"],
    confidence: "medium",
    limitation: "Excludes offline slack/teams communications where real handovers take place.",
    counterHypothesis: "Micro-individual lifecycles give autonomy to teams and avoid central command frameworks.",
    visualizationType: "evidence_graph",
    humanReviewStatus: "required",
    status: "ready_for_review"
  },
  {
    id: "SEC-003",
    auditProjectId: "proj-scale-01",
    title: "Governance Friction and Release Sign-offs",
    sectionType: "governance_friction",
    narrative: "Strict manual approval gates decouple living outcomes from continuous deployment benchmarks, generating 6.2 days of queue waste for simple releases.",
    evidenceRefs: [], // Missing evidence on purpose to show "blocked_missing_evidence" ! (Task 4.3 & 5.3)
    assumptions: [
      "ASSUME: Safety controls are required for legacy compliance."
    ],
    kpiRefs: ["VAR-007"],
    benchmarkRefs: ["ISO-SLA-9"],
    confidence: "low",
    limitation: "Testing pipeline telemetry is self-reported.",
    counterHypothesis: "Manual sign-offs are fast but wait on dependent third-party vendor schedules.",
    visualizationType: "heatmap",
    humanReviewStatus: "required",
    status: "blocked_missing_evidence"
  }
];

interface TraceabilityLabProps {
  settings: AppSettings;
  onClose: () => void;
}

export function TraceabilityLab({ settings, onClose }: TraceabilityLabProps) {
  const [activeTab, setActiveTab] = useState<"evidence" | "variables" | "contracts" | "trace" | "visuals">("evidence");
  
  // Interactive State
  const [evidenceItems, setEvidenceItems] = useState<EvidenceItem[]>(SEED_EVIDENCE_ITEMS);
  const [auditVariables, setAuditVariables] = useState<AuditVariable[]>(SEED_AUDIT_VARIABLES);
  const [reportContracts, setReportContracts] = useState<ReportSectionContract[]>(SEED_REPORT_CONTRACTS);

  // Report Contract Draft States
  const [showAddContract, setShowAddContract] = useState<boolean>(false);
  const [draftTitle, setDraftTitle] = useState<string>("");
  const [draftSectionType, setDraftSectionType] = useState<ReportSectionContract["sectionType"]>("work_system_coherence");
  const [draftNarrative, setDraftNarrative] = useState<string>("");
  const [draftEvidenceKeys, setDraftEvidenceKeys] = useState<string[]>([]);
  const [draftAssumption, setDraftAssumption] = useState<string>("");
  const [draftAssumptions, setDraftAssumptions] = useState<string[]>([]);
  const [draftKPIs, setDraftKPIs] = useState<string[]>([]);
  const [draftBenchmark, setDraftBenchmark] = useState<string>("TBD");
  const [draftConfidence, setDraftConfidence] = useState<"high" | "medium" | "low">("medium");
  const [draftVisType, setDraftVisType] = useState<ReportSectionContract["visualizationType"]>("bar_chart");
  const [draftLimitation, setDraftLimitation] = useState<string>("");
  const [draftCounter, setDraftCounter] = useState<string>("");

  // Trace Link Selection
  const [selectedTraceSec, setSelectedTraceSec] = useState<string>(SEED_REPORT_CONTRACTS[0]?.id || "");

  // Audit Policy checks
  const getPolicyCompliance = (sec: ReportSectionContract) => {
    const policy = settings.traceabilityPolicy;
    const errors: string[] = [];
    const warnings: string[] = [];

    // 1. Evidence Check
    if (policy.requireEvidenceForEveryClaim && sec.evidenceRefs.length === 0) {
      errors.push("POLICY ENFORCED ERROR: No Evidence Items are linked. Claims are ungrounded.");
    }
    // 2. Source References check
    if (policy.requireSourceReferences) {
      sec.evidenceRefs.forEach(ref => {
        const ev = evidenceItems.find(e => e.id === ref);
        if (ev && !ev.sourceRef) {
          warnings.push(`SOURCE WARNING: Evidence '${ev.id}' is missing a specific system identifier coordinates.`);
        }
      });
    }
    // 3. Assumptions list
    if (policy.requireAssumptionsList && sec.assumptions.length === 0) {
      warnings.push("POLICY ADVICE: No assumptions list specified for this diagnostic narrative.");
    }
    // 4. KPI signals
    if (policy.requireKpiOrObservableSignal && sec.kpiRefs.length === 0) {
      warnings.push("POLICY ADVICE: No quantitative Audit Variables are linked.");
    }
    // 5. Benchmark / TBD
    if (policy.requireBenchmarkOrTbd) {
      const hasBenchmark = sec.benchmarkRefs.length > 0 && !sec.benchmarkRefs.includes("TBD");
      if (!hasBenchmark) {
        warnings.push("BENCHMARK PREPARATION: Section refers to 'TBD' or is missing concrete regulatory reference indices.");
      }
    }
    // 6. Confidence check
    if (policy.requireConfidenceRating && !sec.confidence) {
      errors.push("COMPLIANCE FAILURE: Missing mandatory subjective confidence assessment rating.");
    }
    // 7. Limitation
    if (policy.requireLimitationStatement && (!sec.limitation || sec.limitation.trim() === "")) {
      errors.push("TRACEABILITY BREACH: Missing negative limitation scoping statement as demanded by contract.");
    }
    // 8. Counter hypothesis
    if (policy.requireCounterHypothesis && (!sec.counterHypothesis || sec.counterHypothesis.trim() === "")) {
      errors.push("TRACEABILITY BREACH: Missing alternate explanation / counter-hypothesis parameter.");
    }
    // 9. Visualization check
    if (policy.requireVisualization && !sec.visualizationType) {
      warnings.push("VISUAL POLICY ADVICE: No recommended visualization blueprint is assigned.");
    }

    const isBlockedByPolicy = errors.length > 0;
    
    return {
      errors,
      warnings,
      isBlockedByPolicy
    };
  };

  const handleAddAssumption = () => {
    if (draftAssumption.trim()) {
      setDraftAssumptions([...draftAssumptions, `ASSUME: ${draftAssumption.trim()}`]);
      setDraftAssumption("");
    }
  };

  const handleAddContractSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!draftTitle.trim() || !draftNarrative.trim()) {
      alert("Required field parameters: Section Title and Core Narrative are blank.");
      return;
    }

    const newSecId = `SEC-DRAFT-${Math.floor(100 + Math.random() * 900)}`;
    const tempSection: ReportSectionContract = {
      id: newSecId,
      auditProjectId: "proj-scale-01",
      title: draftTitle.trim(),
      sectionType: draftSectionType,
      narrative: draftNarrative.trim(),
      evidenceRefs: draftEvidenceKeys,
      assumptions: draftAssumptions.length > 0 ? draftAssumptions : ["No assumptions registered."],
      kpiRefs: draftKPIs,
      benchmarkRefs: draftBenchmark ? [draftBenchmark] : [],
      confidence: draftConfidence,
      limitation: draftLimitation.trim() || "No limits declared in local sandbox draft.",
      counterHypothesis: draftCounter.trim() || "Alternates omitted.",
      visualizationType: draftVisType,
      humanReviewStatus: "required",
      status: "draft"
    };

    // Evaluate policies right away before determining final status
    const compliance = getPolicyCompliance(tempSection);
    tempSection.status = compliance.isBlockedByPolicy ? "blocked_missing_evidence" : "ready_for_review";

    setReportContracts([...reportContracts, tempSection]);

    // Reset draft state
    setDraftTitle("");
    setDraftNarrative("");
    setDraftEvidenceKeys([]);
    setDraftAssumptions([]);
    setDraftKPIs([]);
    setDraftBenchmark("TBD");
    setDraftLimitation("");
    setDraftCounter("");
    setShowAddContract(false);
  };

  const handleReviewToggle = (id: string) => {
    setEvidenceItems(prev => prev.map(ev => {
      if (ev.id === id) {
        const nextStatus = ev.status === "reviewed" ? "raw" : "reviewed";
        return { ...ev, status: nextStatus };
      }
      return ev;
    }));
  };

  const handleRejectToggle = (id: string) => {
    setEvidenceItems(prev => prev.map(ev => {
      if (ev.id === id) {
        const nextStatus = ev.status === "rejected" ? "raw" : "rejected";
        return { ...ev, status: nextStatus };
      }
      return ev;
    }));
  };

  return (
    <div className="bg-white border border-natural-border shadow-xl rounded-xl overflow-hidden font-sans antialiased text-natural-text" id="traceability-lab-viewport">
      
      {/* Visual Header */}
      <div className="bg-natural-primary text-white p-5 flex items-center justify-between border-b border-natural-border">
        <div className="flex items-center gap-3">
          <span className="p-2 bg-[#D9E8E2]/15 rounded-lg text-natural-accent">
            <GitBranch className="h-5 w-5" />
          </span>
          <div>
            <h1 className="text-base sm:text-lg font-serif italic text-white flex items-center gap-2">
              Traceability Laboratory & Audit Intelligence
              <span className="text-[10px] font-mono uppercase bg-white/20 text-natural-accent px-1.5 py-0.5 rounded ml-2 font-black leading-none">
                Iteration 2 Foundation
              </span>
            </h1>
            <p className="text-[10px] uppercase font-mono tracking-widest text-[#D9E8E2] h-4 mt-1">
              Active Project: Acme Flow Systems GmbH (Cologne) — Evidence-Based Reasoning Dashboard
            </p>
          </div>
        </div>
        <button
          onClick={onClose}
          type="button"
          className="p-2 rounded-lg text-white hover:bg-white/10 cursor-pointer text-xs uppercase font-mono border border-white/10 hover:border-white/30 transition-all"
        >
          Return to Intake Wizard
        </button>
      </div>

      {/* Top Warning Grounding Check */}
      <div className="bg-emerald-50/60 border-b border-emerald-100 p-4 leading-normal text-xs text-emerald-850 flex items-start gap-2.5">
        <CheckCircle className="h-4.5 w-4.5 text-emerald-600 shrink-0 mt-0.5" />
        <div>
          <strong>Offline Sovereignty Guard Activated:</strong> This panel compiles structural dependencies, data items and claim contracts locally. No external LLM RAG pipelines are polled, preventing data transfer risks. All rules evaluate instantly inside client thread state compilers.
        </div>
      </div>

      {/* Internal Navigation Tabs (Task 6) */}
      <div className="flex border-b border-natural-border/60 bg-slate-50 overflow-x-auto shrink-0 scrollbar-none">
        {[
          { id: "evidence", label: "Evidence Items Manager", icon: Database, badge: evidenceItems.length },
          { id: "variables", label: "Audit Variable Registry", icon: Cpu, badge: auditVariables.length },
          { id: "contracts", label: "Report Section Contracts", icon: FileText, badge: reportContracts.length },
          { id: "trace", label: "Traceability Chain Graph", icon: GitBranch },
          { id: "visuals", label: "Visualization Blueprints", icon: BarChart3 }
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              type="button"
              className={`flex items-center gap-2 px-5 py-3 text-xs font-semibold uppercase tracking-wider border-b-2 cursor-pointer transition-all whitespace-nowrap min-h-[44px] ${
                isActive 
                  ? "border-natural-primary text-natural-primary bg-white font-bold" 
                  : "border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-200/40"
              }`}
            >
              <Icon className="h-4 w-4" />
              <span>{tab.label}</span>
              {tab.badge !== undefined && (
                <span className={`text-[10px] px-1.5 py-0.2 rounded font-black font-mono ${
                  isActive ? "bg-natural-primary text-white" : "bg-slate-200 text-slate-600"
                }`}>
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* MAIN VIEWPORT BODY */}
      <div className="p-6 min-h-[550px] bg-slate-50/40">

        {/* -------------------- VIEW 1: EVIDENCE MANAGER -------------------- */}
        {activeTab === "evidence" && (
          <EvidenceItemManager
            evidenceItems={evidenceItems}
            onAddEvidence={(newItem) => setEvidenceItems([newItem, ...evidenceItems])}
            onToggleReview={handleReviewToggle}
            onToggleReject={handleRejectToggle}
            onDeleteEvidence={(id) => setEvidenceItems(prev => prev.filter(e => e.id !== id))}
          />
        )}

        {/* -------------------- VIEW 2: VARIABLE REGISTRY -------------------- */}
        {activeTab === "variables" && (
          <div className="space-y-6">
            <div>
              <h3 className="text-sm font-serif font-bold text-natural-primary uppercase tracking-wide">
                Audit Variable & Metric Registry (Task 4.2 & 5.2)
              </h3>
              <p className="text-xs text-slate-500">
                Seeded metrics deriving process and workflow behavior from raw evidence points without arbitrary scorings.
              </p>
            </div>

            {/* Categorized variables panel */}
            <div className="space-y-6">
              {[
                { cat: "work_system_coherence", label: "Work System Coherence" },
                { cat: "flow_visibility", label: "Flow Visibility Metrics" },
                { cat: "dependency_load", label: "Dependency Load Constraints" },
                { cat: "governance_friction", label: "Governance Friction Signals" },
                { cat: "data_quality", label: "Data Quality Baseline" }
              ].map(group => {
                const groupVars = auditVariables.filter(v => v.category === group.cat);
                if (groupVars.length === 0) return null;

                return (
                  <div key={group.cat} className="space-y-3">
                    <h4 className="text-xs font-bold uppercase text-natural-secondary border-b border-natural-secondary/30 pb-1 font-mono flex items-center gap-2 select-none">
                      <span className="w-1.5 h-3.5 bg-natural-secondary block" />
                      <span>{group.label}</span>
                    </h4>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {groupVars.map(v => (
                        <div key={v.id} className="bg-white border border-slate-200 rounded-lg p-4 shadow-xs space-y-3 hover:border-indigo-200 transition-colors">
                          <div className="flex justify-between items-start h-9">
                            <div>
                              <span className="text-[9px] font-mono font-bold text-slate-400 block h-2.5">
                                {v.id}
                              </span>
                              <span className="text-xs font-bold text-slate-800 block leading-tight font-serif">
                                {v.name}
                              </span>
                            </div>
                            <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold uppercase font-mono ${
                              v.confidence === "high" ? "bg-emerald-50 text-emerald-800 border border-emerald-100" :
                              v.confidence === "medium" ? "bg-sky-50 text-sky-800 border border-sky-100" :
                              "bg-amber-50 text-amber-800 border border-amber-100"
                            }`}>
                              {v.confidence} cf
                            </span>
                          </div>

                          <div className="bg-slate-50 p-2.5 rounded border border-slate-150 flex items-center justify-between">
                            <span className="text-xs text-slate-500 font-mono">Quant Value:</span>
                            <span className="text-xs font-black text-indigo-700 font-mono tracking-tight">
                              {v.value} {v.unit && <span className="text-[10px] font-bold text-slate-400">{v.unit}</span>}
                            </span>
                          </div>

                          <div className="text-[11px] leading-relaxed text-slate-600 p-1">
                            <span className="font-bold text-slate-700 block text-[9px] uppercase font-mono">Empirical Interpretation:</span>
                            {v.interpretation}
                          </div>

                          <div className="text-[11px] bg-slate-50/40 p-2 rounded border border-slate-100 space-y-1">
                            <div className="text-[10px] font-mono leading-relaxed">
                              <strong className="text-slate-500 uppercase tracking-tight font-bold text-[9px] block">Methodology:</strong>
                              <span className="text-slate-650">{v.measurementMethod}</span>
                            </div>
                            <div className="text-[10px] font-mono leading-relaxed">
                              <strong className="text-slate-500 uppercase tracking-tight font-bold text-[9px] block">Policy Benchmark:</strong>
                              <code className="text-slate-700 font-bold">{v.benchmarkRef}</code>
                            </div>
                            {/* Trace links */}
                            <div className="pt-1.5 flex flex-wrap items-center gap-1">
                              <span className="text-[9px] font-bold text-slate-400 uppercase font-mono mr-1">Trace Refs:</span>
                              {v.evidenceRefs.map(ref => (
                                <span key={ref} className="text-[9px] font-mono px-1 py-0.2 bg-indigo-55 text-indigo-800 rounded font-bold border border-indigo-100">
                                  {ref}
                                </span>
                              ))}
                            </div>
                          </div>

                          {/* Limitations and Counter-hypotheses details */}
                          <div className="pt-2 border-t border-dashed border-slate-150 text-[10px] space-y-1.5 leading-relaxed">
                            <p className="text-amber-850 bg-amber-50/40 p-1.5 rounded">
                              <strong className="font-mono text-[9px] uppercase text-amber-700 block">Metric Limitation:</strong>
                              {v.limitation}
                            </p>
                            <p className="text-slate-750 bg-slate-50 p-1.5 rounded">
                              <strong className="font-mono text-[9px] uppercase text-slate-550 block">Audit Counter-Hypothesis:</strong>
                              {v.counterHypothesis}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* -------------------- VIEW 3: REPORT SECTION CONTRACT BUILDER -------------------- */}
        {activeTab === "contracts" && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h3 className="text-sm font-serif font-bold text-natural-primary uppercase tracking-wide">
                  Report Section Contracts Chamber (Task 5.3)
                </h3>
                <p className="text-xs text-slate-500">
                  Compose section narratives. The local rule engine blocks or flags drafts failing trace policies.
                </p>
              </div>

              <button
                onClick={() => setShowAddContract(!showAddContract)}
                type="button"
                className="px-3 py-1.5 bg-natural-primary hover:bg-natural-primary/95 text-white rounded text-xs font-bold uppercase tracking-wider inline-flex items-center gap-1 min-h-[34px] cursor-pointer"
              >
                <PlusCircle className="h-4 w-4" />
                <span>Initialize Section Contract Draft</span>
              </button>
            </div>

            {/* Contract draft creation form */}
            {showAddContract && (
              <form onSubmit={handleAddContractSubmit} className="bg-white border border-natural-border p-5 rounded-xl shadow-inner space-y-4 animate-fade-in text-xs">
                <div className="border-b border-natural-border pb-2 flex justify-between items-center text-xs">
                  <span className="font-mono font-bold uppercase text-natural-primary select-none">
                    DRAFT NEW REPORT SECTION CONTRACT
                  </span>
                  <button type="button" onClick={() => setShowAddContract(false)} className="text-slate-400 hover:text-slate-650 font-bold">✕ Close</button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <div>
                      <label className="block text-[10px] font-mono font-bold text-slate-500 uppercase mb-1">
                        Section Descriptor Title *
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Workflow Bottlenecks and Wait State Inefficiencies"
                        value={draftTitle}
                        onChange={e => setDraftTitle(e.target.value)}
                        className="w-full bg-slate-50 border p-2 rounded outline-none"
                        required
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[10px] font-mono font-bold text-slate-500 uppercase mb-1">
                          Section Type Category
                        </label>
                        <select
                          value={draftSectionType}
                          onChange={e => setDraftSectionType(e.target.value as any)}
                          className="w-full bg-slate-50 border p-2 rounded outline-none h-9"
                        >
                          <option value="work_system_coherence">Work System Coherence</option>
                          <option value="jira_operating_model">Jira Operating Model</option>
                          <option value="flow_reality">Flow Reality</option>
                          <option value="dependency_map">Dependency Map</option>
                          <option value="governance_friction">Governance Friction</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-[10px] font-mono font-bold text-slate-500 uppercase mb-1">
                          Benchmark Reference
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. ISO-AGILE-7 or TBD"
                          value={draftBenchmark}
                          onChange={e => setDraftBenchmark(e.target.value)}
                          className="w-full bg-slate-50 border p-2 rounded outline-none"
                        />
                      </div>
                    </div>

                    {/* Evidence Attachment Multi-checkboxes */}
                    <div>
                      <label className="block text-[10px] font-mono font-bold text-slate-500 uppercase mb-1">
                        Link Collected Evidence * (Policy mandate: 1+ required)
                      </label>
                      <div className="bg-slate-50 p-2.5 rounded border max-h-36 overflow-y-auto space-y-1.5">
                        {evidenceItems.map(ev => {
                          const isChecked = draftEvidenceKeys.includes(ev.id);
                          return (
                            <div key={ev.id} className="flex items-start gap-1.5">
                              <input
                                id={`draft_ev_${ev.id}`}
                                type="checkbox"
                                checked={isChecked}
                                onChange={() => {
                                  if (isChecked) {
                                    setDraftEvidenceKeys(draftEvidenceKeys.filter(k => k !== ev.id));
                                  } else {
                                    setDraftEvidenceKeys([...draftEvidenceKeys, ev.id]);
                                  }
                                }}
                                className="mt-0.5"
                              />
                              <label htmlFor={`draft_ev_${ev.id}`} className="text-[11px] text-slate-650 cursor-pointer select-none leading-normal">
                                <code className="bg-white px-1.5 py-0.2 rounded border font-bold text-[9px] mr-1 inline-block">{ev.id}</code>
                                {ev.title}
                              </label>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* KPIs link Selection */}
                    <div>
                      <label className="block text-[10px] font-mono font-bold text-slate-500 uppercase mb-1">
                        Link quantitative KPIs / Variables
                      </label>
                      <div className="bg-slate-50 p-2 py-2.5 rounded border max-h-36 overflow-y-auto space-y-1.5">
                        {auditVariables.map(v => {
                          const isChecked = draftKPIs.includes(v.id);
                          return (
                            <div key={v.id} className="flex items-start gap-1.5">
                              <input
                                id={`draft_var_${v.id}`}
                                type="checkbox"
                                checked={isChecked}
                                onChange={() => {
                                  if (isChecked) {
                                    setDraftKPIs(draftKPIs.filter(k => k !== v.id));
                                  } else {
                                    setDraftKPIs([...draftKPIs, v.id]);
                                  }
                                }}
                                className="mt-0.5"
                              />
                              <label htmlFor={`draft_var_${v.id}`} className="text-[11px] text-slate-650 cursor-pointer select-none leading-normal">
                                <code className="bg-white px-1.5 py-0.2 rounded border font-bold text-[9px] mr-1 inline-block">{v.id}</code>
                                {v.name} ({v.value})
                              </label>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <label className="block text-[10px] font-mono font-bold text-slate-500 uppercase mb-1">
                        Narrative Statement Text *
                      </label>
                      <textarea
                        rows={3}
                        placeholder="Draft your synthesized audit findings and qualitative statements here..."
                        value={draftNarrative}
                        onChange={e => setDraftNarrative(e.target.value)}
                        className="w-full bg-slate-50 border p-2 rounded outline-none resize-none"
                        required
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[10px] font-mono font-bold text-slate-500 uppercase mb-1">
                          Confidence Level
                        </label>
                        <select
                          value={draftConfidence}
                          onChange={e => setDraftConfidence(e.target.value as any)}
                          className="w-full bg-slate-50 border p-2 rounded h-9"
                        >
                          <option value="high">High Confidence (Proven)</option>
                          <option value="medium">Medium Confidence (Balanced)</option>
                          <option value="low">Low Speculation Rating</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-[10px] font-mono font-bold text-slate-500 uppercase mb-1">
                          Visualization Chart Type
                        </label>
                        <select
                          value={draftVisType}
                          onChange={e => setDraftVisType(e.target.value as any)}
                          className="w-full bg-slate-50 border p-2 rounded h-9"
                        >
                          <option value="bar_chart">Bar Chart</option>
                          <option value="line_chart">Line Chart</option>
                          <option value="network_graph">Network Connection Graph</option>
                          <option value="heatmap">Daily Friction Heatmap</option>
                          <option value="timeline">Product WIP Timeline</option>
                          <option value="table">Analytical Table Output</option>
                          <option value="radar">Multi-factor Radar Spider</option>
                          <option value="evidence_graph">Empirical Evidence Trace Tree</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] font-mono font-bold text-slate-500 uppercase mb-1">
                        Document Negative Limitation * (Policy mandate)
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Köln office data only. Other divisions unreviewed."
                        value={draftLimitation}
                        onChange={e => setDraftLimitation(e.target.value)}
                        className="w-full bg-slate-50 border p-2 rounded outline-none"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-mono font-bold text-slate-500 uppercase mb-1">
                        Formulate Counter Hypothesis * (Policy mandate)
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. This delay is actually positive for regulatory ISO testing."
                        value={draftCounter}
                        onChange={e => setDraftCounter(e.target.value)}
                        className="w-full bg-slate-50 border p-2 rounded outline-none"
                        required
                      />
                    </div>
                  </div>
                </div>

                <div className="flex justify-end pt-2 border-t mt-2">
                  <button
                    type="submit"
                    className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold uppercase rounded"
                  >
                    Assess and Compile Contract Draft
                  </button>
                </div>
              </form>
            )}

            {/* List contracts (Task 5.3) */}
            <div className="space-y-4">
              {reportContracts.map(sec => {
                const compliance = getPolicyCompliance(sec);
                const isBlocked = compliance.isBlockedByPolicy;

                return (
                  <div key={sec.id} className={`bg-white border rounded-xl overflow-hidden shadow-xs transition-colors ${
                    isBlocked ? "border-rose-250 hover:border-rose-350" : "border-slate-200 hover:border-slate-350"
                  }`}>
                    
                    {/* Header bar */}
                    <div className={`p-4 border-b flex flex-wrap items-center justify-between gap-3 ${
                      isBlocked ? "bg-rose-50/50 border-rose-100" : "bg-slate-50/60 border-slate-200"
                    }`}>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono px-2 py-0.5 bg-slate-200/80 text-slate-750 font-bold rounded">
                          {sec.id}
                        </span>
                        <h4 className="text-xs sm:text-sm font-serif font-black text-slate-800 leading-tight">
                          {sec.title}
                        </h4>
                      </div>

                      {/* Status Badges */}
                      <span className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded-full font-bold border ${
                        isBlocked 
                          ? "bg-rose-100 text-rose-800 border-rose-300"
                          : sec.status === "reviewed" 
                            ? "bg-emerald-100 text-emerald-800 border-emerald-300" 
                            : "bg-sky-100 text-sky-800 border-sky-300"
                      }`}>
                        {isBlocked ? "Blocked: Missing Evidence" : sec.status.replace(/_/g, " ")}
                      </span>
                    </div>

                    {/* Content Section */}
                    <div className="p-4 space-y-4 text-xs">
                      <div className="space-y-1.5">
                        <span className="text-[10px] font-mono tracking-wider font-bold text-slate-400 uppercase block select-none">
                          Qualitative Statement / Audit Text Narrative
                        </span>
                        <p className="text-slate-750 leading-relaxed bg-slate-50 p-3 rounded-lg border border-slate-150 font-sans text-xs">
                          {sec.narrative}
                        </p>
                      </div>

                      {/* Linked parameters Row */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 border-t border-slate-100 pt-3 text-[11px] leading-relaxed">
                        <div>
                          <strong className="block text-[9px] font-mono text-slate-405 uppercase font-black">Linked Evidence:</strong>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {sec.evidenceRefs.map(ref => (
                              <span key={ref} className="px-1.5 py-0.2 bg-indigo-50 border border-indigo-200 text-indigo-750 rounded text-[9px] font-mono font-bold">
                                {ref}
                              </span>
                            ))}
                            {sec.evidenceRefs.length === 0 && (
                              <span className="text-[10px] text-rose-600 font-bold">⚠ NONE</span>
                            )}
                          </div>
                        </div>

                        <div>
                          <strong className="block text-[9px] font-mono text-slate-405 uppercase font-black">Attached KPIs / Variables:</strong>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {sec.kpiRefs.map(ref => (
                              <span key={ref} className="px-1.5 py-0.2 bg-emerald-50 border border-emerald-200 text-emerald-750 rounded text-[9px] font-mono font-bold">
                                {ref}
                              </span>
                            ))}
                            {sec.kpiRefs.length === 0 && (
                              <span className="text-[10px] text-slate-400">none linked</span>
                            )}
                          </div>
                        </div>

                        <div>
                          <strong className="block text-[9px] font-mono text-slate-405 uppercase font-black">Assumptions catalog:</strong>
                          <ul className="list-disc pl-3 text-[10px] text-slate-500 font-mono mt-1 space-y-0.5">
                            {sec.assumptions.map((as, i) => (
                              <li key={i}>{as}</li>
                            ))}
                          </ul>
                        </div>

                        <div>
                          <strong className="block text-[9px] font-mono text-slate-405 uppercase font-black">Visualization Target:</strong>
                          <span className="inline-flex items-center gap-1 mt-1 px-1.5 py-0.5 bg-cyan-50 border border-cyan-200 text-cyan-850 rounded text-[10px] font-mono font-bold">
                            <BarChart3 className="h-3 w-3 text-cyan-600" />
                            {sec.visualizationType.replace(/_/g, " ")}
                          </span>
                        </div>
                      </div>

                      {/* Negative Disclosures Line */}
                      <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 space-y-2 text-[11px] leading-relaxed">
                        <div className="flex items-start gap-1">
                          <span className="text-amber-600 font-bold">⚠ Scoping Limitation:</span>
                          <span className="text-slate-600 italic font-mono">{sec.limitation}</span>
                        </div>
                        <div className="flex items-start gap-1">
                          <span className="text-indigo-650 font-bold">⇅ Counter-Hypothesis:</span>
                          <span className="text-slate-700">{sec.counterHypothesis}</span>
                        </div>
                      </div>

                      {/* Trace policy warnings feedback */}
                      {(compliance.errors.length > 0 || compliance.warnings.length > 0) && (
                        <div className="border-t border-dashed border-slate-200 pt-3 space-y-1.5">
                          <span className="text-[10px] font-mono uppercase font-black tracking-wide text-natural-primary block select-none">
                            Traceability Policy Inspection (Mandated via settings)
                          </span>
                          
                          {compliance.errors.map((err, i) => (
                            <div key={i} className="bg-rose-50 border border-rose-200 text-rose-800 p-2 rounded text-[11px] max-w-2xl flex items-start gap-1.5 font-mono">
                              <AlertCircle className="h-3.5 w-3.5 text-rose-600 shrink-0 mt-0.5" />
                              <span>{err}</span>
                            </div>
                          ))}

                          {compliance.warnings.map((warn, i) => (
                            <div key={i} className="bg-amber-50 border border-amber-200 text-amber-800 p-2 rounded text-[11px] max-w-2xl flex items-start gap-1.5 font-mono">
                              <AlertTriangle className="h-3.5 w-3.5 text-amber-600 shrink-0 mt-0.5" />
                              <span>{warn}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* -------------------- VIEW 4: TRACEABILITY LINKS (Task 5.4) -------------------- */}
        {activeTab === "trace" && (
          <div className="space-y-6">
            <div>
              <h3 className="text-sm font-serif font-bold text-natural-primary uppercase tracking-wide flex items-center gap-1.5">
                <GitBranch className="h-4 w-4 text-natural-accent" />
                <span>Interactive Traceability Chain Graph Explorer (Task 5.4)</span>
              </h3>
              <p className="text-xs text-slate-500">
                Audit relationship links mapping qualitative report narratives back to physical collected files, variables and limitations.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              {/* Left Column: Selector */}
              <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-3">
                <span className="text-[10px] font-mono uppercase font-black text-slate-400 block select-none">Select Report Section</span>
                <div className="space-y-2">
                  {reportContracts.map(sec => {
                    const isSelected = selectedTraceSec === sec.id;
                    const compliance = getPolicyCompliance(sec);
                    return (
                      <button
                        key={sec.id}
                        onClick={() => setSelectedTraceSec(sec.id)}
                        type="button"
                        className={`w-full text-left px-3.5 py-4 rounded-lg border text-xs leading-normal transition-all font-sans cursor-pointer ${
                          isSelected 
                            ? "bg-natural-primary text-white border-natural-primary font-bold shadow-xs scale-[1.02]" 
                            : "bg-slate-50 text-slate-750 border-slate-200 hover:bg-slate-100"
                        }`}
                      >
                        <div className="flex justify-between items-center mb-1">
                          <code className={`text-[9px] font-mono px-1 py-0.2 rounded font-bold ${isSelected ? "bg-white/10 text-white" : "bg-slate-200"}`}>{sec.id}</code>
                          {compliance.isBlockedByPolicy && (
                            <span className="text-[9px] font-mono text-rose-505 font-bold animate-pulse">(!) BLOCKED</span>
                          )}
                        </div>
                        <span className="font-serif block leading-snug">{sec.title}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Right Columns: Dynamic trace visual maps */}
              <div className="md:col-span-2 bg-white border border-slate-200 rounded-xl p-5 space-y-5">
                {(() => {
                  const sec = reportContracts.find(s => s.id === selectedTraceSec);
                  if (!sec) {
                    return (
                      <div className="p-8 text-center text-slate-400 text-xs">
                        Select a report contract section to explore traceability linkage details.
                      </div>
                    );
                  }

                  const compliance = getPolicyCompliance(sec);

                  return (
                    <div className="space-y-4">
                      
                      {/* Visual representation card diagram layout */}
                      <span className="text-[10px] font-bold font-mono uppercase tracking-wide text-slate-400 block pb-1 border-b border-slate-100 select-none">
                        Active Verification Map For {sec.id}
                      </span>

                      {/* Block Diagram Flow list */}
                      <div className="space-y-3 font-mono text-[11px]">
                        
                        {/* Box 1: Narrative Block */}
                        <div className="bg-slate-55 border border-slate-250 p-3.5 rounded-lg text-slate-800 space-y-1 relative">
                          <div className="absolute right-3 top-3 text-[9px] px-1.5 py-0.2 rounded bg-indigo-100 font-bold font-mono uppercase select-none">Section Narrative Block</div>
                          <span className="font-bold text-natural-primary block uppercase text-[10px]">Report Statement Title:</span>
                          <span className="font-sans block text-xs font-semibold leading-relaxed text-slate-705">“{sec.narrative}”</span>
                        </div>

                        {/* Visual Connector Line */}
                        <div className="flex justify-center h-4 relative">
                          <div className="w-0.5 border-l border-dashed border-natural-secondary/60 h-full" />
                        </div>

                        {/* Box 2: Verification variables and evidence linkage */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          
                          {/* Evidence Items container */}
                          <div className="bg-slate-50 border border-slate-200 p-3 rounded-lg space-y-2">
                            <span className="text-[9px] font-bold text-indigo-700 uppercase block select-none border-b border-indigo-150 pb-1">Seeded Empirical Evidence:</span>
                            
                            {sec.evidenceRefs.map(ref => {
                              const item = evidenceItems.find(e => e.id === ref);
                              return (
                                <div key={ref} className="bg-white p-2 rounded border border-indigo-100 space-y-1">
                                  <div className="flex justify-between items-center">
                                    <code className="text-[9px] font-bold text-indigo-600 bg-indigo-50 px-1 rounded">{ref}</code>
                                    <span className="text-[9px] text-slate-400 font-bold uppercase">{item?.strength} strength</span>
                                  </div>
                                  <p className="text-[10px] font-sans text-slate-600 font-medium leading-normal">{item?.title}</p>
                                  <p className="text-[9px] font-sans text-indigo-805 leading-relaxed bg-[#F5F8FC] p-1 rounded">Fact: {item?.extractedFacts[0] || "File trace confirmed."}</p>
                                </div>
                              );
                            })}

                            {sec.evidenceRefs.length === 0 && (
                              <div className="p-3 bg-rose-50 border border-rose-150 rounded text-rose-800 space-y-1">
                                <span className="font-bold text-rose-700 block text-[10px]">⚠ POLICY EXCLUSION BREAK:</span>
                                Narrative has no traceable collected files assigned. Status is blocked.
                              </div>
                            )}
                          </div>

                          {/* Quant variables container */}
                          <div className="bg-slate-55 border border-slate-200 p-3 rounded-lg space-y-2">
                            <span className="text-[9px] font-bold text-emerald-800 uppercase block select-none border-b border-emerald-150 pb-1">Linked Audit KPIs:</span>
                            
                            {sec.kpiRefs.map(ref => {
                              const v = auditVariables.find(av => av.id === ref);
                              return (
                                <div key={ref} className="bg-white p-2 rounded border border-emerald-100 space-y-1">
                                  <div className="flex justify-between items-center text-[9px]">
                                    <code className="font-bold text-emerald-600">{ref}</code>
                                    <span className="font-bold text-emerald-800 bg-emerald-50 px-1 rounded">{v?.value}</span>
                                  </div>
                                  <p className="text-[10px] font-sans font-semibold text-slate-700">{v?.name}</p>
                                  <p className="text-[9px] text-slate-450 leading-tight">Method: {v?.measurementMethod}</p>
                                </div>
                              );
                            })}

                            {sec.kpiRefs.length === 0 && (
                              <div className="text-[10px] text-slate-400 italic p-3 text-center">
                                No quantitative metrics linked to this statement card.
                              </div>
                            )}
                          </div>

                        </div>

                        {/* Visual Connector Line */}
                        <div className="flex justify-center h-4 relative">
                          <div className="w-0.5 border-l border-dashed border-cyan-500 h-full" />
                        </div>

                        {/* Box 3: Safe Bounds and Alternate Counter weights */}
                        <div className="bg-cyan-50/45 border border-cyan-200 p-4 rounded-lg space-y-2.5">
                          <div className="flex justify-between items-center select-none border-b border-cyan-150 pb-1">
                            <span className="text-[9px] font-bold text-cyan-800 uppercase">Falsifiability & Scope boundaries:</span>
                            <span className="text-[9px] font-bold px-1.5 py-0.2 bg-cyan-100 text-cyan-800 rounded">ISO-BENCHMARK: {sec.benchmarkRefs.join(", ")}</span>
                          </div>

                          <div className="space-y-1.5 font-sans leading-relaxed text-xs">
                            <div className="p-2 bg-white rounded border border-cyan-100">
                              <strong className="block text-[10px] font-bold text-amber-700 tracking-wider font-mono">MITIGATION SCOPING DISCLOSURE:</strong>
                              <span className="text-slate-650 italic text-[11px]">“{sec.limitation}”</span>
                            </div>
                            
                            <div className="p-2 bg-white rounded border border-cyan-100">
                              <strong className="block text-[10px] font-bold text-indigo-755 tracking-wider font-mono">COUNTER HYPOTHESIS DUAL-REVIEW SCOPE:</strong>
                              <span className="text-slate-700 text-[11px]">“{sec.counterHypothesis}”</span>
                            </div>
                          </div>
                        </div>

                      </div>

                    </div>
                  );
                })()}
              </div>

            </div>
          </div>
        )}

        {/* -------------------- VIEW 5: VISUALIZATIONS BLUEPRINTS (Task 5.5) -------------------- */}
        {activeTab === "visuals" && (
          <div className="space-y-6">
            <div>
              <h3 className="text-sm font-serif font-bold text-natural-primary uppercase tracking-wide flex items-center gap-1.5">
                <BarChart3 className="h-4.5 w-4.5 text-natural-accent" />
                <span>Visualization Contract Blueprint (Task 5.5)</span>
              </h3>
              <p className="text-xs text-slate-500">
                Determine the required chart blueprints, coordinate schemas and data completeness parameters for the final rendering layers.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[
                { type: "bar_chart", label: "Workflow Variance Bar Chart", desc: "Compare lifecycle path steps across Köln dev divisions", req: ["EV-JIRA-01", "VAR-001"], use: "Demonstrates distribution asymmetry, grouping workflow step length density to identify queue friction points." },
                { type: "line_chart", label: "Cycle lead Time Line Chart", desc: "Show delivery trends over Q1-Q2 timeline blocks", req: ["EV-JIRA-03", "VAR-004"], use: "Exposes lead time median fluctuations over contiguous periods, verifying if changes stabilize or decay." },
                { type: "network_graph", label: "Dependency Relation Adjacency Map", desc: "Graph blocker link weights horizontally across teams", req: ["EV-JIRA-01", "VAR-006"], use: "Directly isolates high dependency load items, highlighting coordination networks that cause horizonal drag." },
                { type: "heatmap", label: "Friction calendar Heatmap", desc: "Represent approval queue times of the delivery cycle", req: ["EV-LLM-05", "VAR-007"], use: "Color codes wait hour frequencies during individual office hours, disclosing specific bottleneck phases." },
                { type: "radar", label: "Description Completion spider", desc: "Plot character specs density indices across backlogs", req: ["EV-JIRA-02", "VAR-003"], use: "Checks documentation granularity in radar dimensions, validating verbal agreements against policy safety thresholds." },
                { type: "timeline", label: "WIP Age Lifecycle Timeline", desc: "Chronological age plot of issues stagnant in active states", req: ["EV-JIRA-01", "VAR-005"], use: "Plots individual tickets on a progressive age line, signaling issues violating normal WIP policy residency thresholds." },
                { type: "evidence_graph", label: "Empirical Reasoning Trace Tree", desc: "Structural hierarchical tree linking findings back to sources", req: ["EV-POLICY-04", "VAR-002"], use: "Renders logical lines from the final synthesis report section down to the physical raw uploads, ensuring dual verification." },
                { type: "table", label: "Tabular KPI Matrix Grid", desc: "Plain alphanumeric baseline overview for board reviews", req: ["EV-JIRA-03", "VAR-003", "VAR-004"], use: "Translates high dimensions parameters to highly clean, printable tables perfect for executive corporate briefings." }
              ].map(vis => {
                // Check data completion readiness check
                const matchedEvidence = vis.req.filter(r => evidenceItems.some(e => e.id === r));
                const matchedVars = vis.req.filter(r => auditVariables.some(av => av.id === r));
                
                const totalReq = vis.req.length;
                const totalMatched = matchedEvidence.length + matchedVars.length;
                
                let readiness: "ready" | "partial" | "missing" = "missing";
                if (totalMatched === totalReq) {
                  readiness = "ready";
                } else if (totalMatched > 0) {
                  readiness = "partial";
                }

                return (
                  <div key={vis.type} className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs flex flex-col justify-between hover:border-cyan-300 transition-all space-y-3">
                    <div>
                      {/* Badge line */}
                      <div className="flex justify-between items-center select-none font-mono">
                        <span className="text-[10px] font-bold text-cyan-600 uppercase bg-cyan-50 px-2 py-0.5 rounded border border-cyan-100">
                          {vis.type.replace(/_/g, " ")}
                        </span>
                        <span className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded border ${
                          readiness === "ready" ? "bg-emerald-55 text-emerald-805 border-emerald-300" :
                          readiness === "partial" ? "bg-amber-50 text-amber-805 border-amber-300" :
                          "bg-rose-50 text-rose-805 border-rose-300"
                        }`}>
                          ● {readiness}
                        </span>
                      </div>

                      <h4 className="text-xs font-bold text-slate-800 mt-2.5 leading-snug font-mono">
                        {vis.label}
                      </h4>
                      <p className="text-[11px] text-slate-400 font-medium tracking-wide mt-0.5 font-mono">
                        {vis.desc}
                      </p>

                      <p className="text-xs text-slate-600 pt-2 pb-1 leading-relaxed">
                        {vis.use}
                      </p>
                    </div>

                    {/* Requirements verification */}
                    <div className="bg-slate-50 p-2.5 rounded border border-slate-200 text-[10px] font-mono leading-relaxed space-y-1.5">
                      <span className="text-[9px] font-bold text-slate-400 uppercase block select-none">
                        Telemetry Dependencies Checklist:
                      </span>
                      {vis.req.map(reqKey => {
                        const hasEv = evidenceItems.some(e => e.id === reqKey);
                        const hasVar = auditVariables.some(v => v.id === reqKey);
                        const isValid = hasEv || hasVar;

                        return (
                          <div key={reqKey} className="flex justify-between items-center">
                            <span className="text-slate-600">{reqKey}</span>
                            <span className={isValid ? "text-emerald-600 font-bold" : "text-rose-500 font-bold"}>
                              {isValid ? "✓ PRESENT" : "✗ MISSING"}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

      </div>

      {/* Visual footer details info card */}
      <div className="bg-slate-100 border-t border-slate-200 p-4 text-[10px] sm:text-xs font-mono text-slate-500 text-center uppercase tracking-wide flex justify-around">
        <span>ACTIVE BOUNDARY: LOCAL DISPATCHER</span>
        <span className="hidden sm:inline">|</span>
        <span>VERIFIER ENGINE STABILITY: STABLE</span>
        <span className="hidden sm:inline">|</span>
        <span>PROJECT GUID GUID-EC-92</span>
      </div>

    </div>
  );
}
