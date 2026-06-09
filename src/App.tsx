import { useState, useEffect } from "react";
import { 
  Building2, 
  HelpCircle, 
  Sparkles, 
  Check, 
  AlertTriangle, 
  ShieldAlert, 
  Layers, 
  Workflow, 
  CheckSquare, 
  Clock, 
  FileText
} from "lucide-react";
import { AuditState } from "./types";
import { 
  PrototypeDisclosureBanner, 
  Stepper, 
  EvidenceStatePanel 
} from "./components/CommonUI";
import { 
  AuditSetupForm, 
  CompanyResolver, 
  AiWorkOrderConfigurator, 
  FrameworkRealityForm, 
  DataSourceUploadPanel, 
  ProductContextForm, 
  CynefinAssessmentPanel, 
  InterimAuditSnapshot 
} from "./components/FormSteps";
import { resolveDemoCompany, calculateDataQuality } from "./utils/auditLogic";

const STORAGE_KEY = "AgileAuditIntake_state";

const INITIAL_STATE: AuditState = {
  auditCase: {
    id: "case-990-281-01",
    auditName: "",
    companyName: "",
    auditGoal: "",
    scopeType: "Department",
    peopleInScope: 120,
    country: "Germany",
    confidentialityLevel: "customer-related",
    allowedDataModes: ["manual entry", "demo resolver"],
    createdAt: "2026-06-09T16:01:52Z",
    updatedAt: "2026-06-09T16:01:52Z"
  },
  companyProfile: {
    name: { value: "", dataStatus: "missing", confidence: "low" },
    legalForm: { value: "", dataStatus: "missing", confidence: "low" },
    location: { value: "", dataStatus: "missing", confidence: "low" },
    industry: { value: "", dataStatus: "missing", confidence: "low" },
    website: { value: "", dataStatus: "missing", confidence: "low" },
    employeeCount: { value: 0, dataStatus: "missing", confidence: "low" },
    registerId: { value: "", dataStatus: "missing", confidence: "low" }
  },
  aiWorkOrder: [
    { id: "ctx-1", group: "Company Context", label: "Infer industry", enabled: true, capabilityStatus: "rule-based", requiresHumanReview: true },
    { id: "ctx-2", group: "Company Context", label: "Summarize business model", enabled: true, capabilityStatus: "simulated", requiresHumanReview: true },
    { id: "ctx-3", group: "Company Context", label: "Identify products/services", enabled: true, capabilityStatus: "simulated", requiresHumanReview: true },
    { id: "ctx-4", group: "Company Context", label: "Identify regulator context", enabled: false, capabilityStatus: "adapter-ready", requiresHumanReview: true },
    { id: "ctx-5", group: "Company Context", label: "Check company data completeness", enabled: true, capabilityStatus: "works-in-prototype", requiresHumanReview: false },
    
    { id: "prc-1", group: "Process and Flow", label: "Suggest relevant KPIs", enabled: true, capabilityStatus: "rule-based", requiresHumanReview: true },
    { id: "prc-2", group: "Process and Flow", label: "Identify possible flow risks", enabled: true, capabilityStatus: "works-in-prototype", requiresHumanReview: true },
    { id: "prc-3", group: "Process and Flow", label: "Infer possible value streams", enabled: false, capabilityStatus: "simulated", requiresHumanReview: true },
    { id: "prc-4", group: "Process and Flow", label: "Detect missing workflow evidence", enabled: true, capabilityStatus: "requires-uploaded-data", requiresHumanReview: false },

    { id: "fwt-1", group: "Framework Fit", label: "Check Scrum fit", enabled: true, capabilityStatus: "rule-based", requiresHumanReview: true },
    { id: "fwt-2", group: "Framework Fit", label: "Check Kanban fit", enabled: true, capabilityStatus: "rule-based", requiresHumanReview: true },
    { id: "fwt-3", group: "Framework Fit", label: "Check Flight Levels fit", enabled: false, capabilityStatus: "adapter-ready", requiresHumanReview: true },
    { id: "fwt-4", group: "Framework Fit", label: "Check SAFe/LeSS/Nexus fit", enabled: true, capabilityStatus: "rule-based", requiresHumanReview: true },
    { id: "fwt-5", group: "Framework Fit", label: "Check if organizational clarification should precede framework", enabled: true, capabilityStatus: "rule-based", requiresHumanReview: true },

    { id: "gap-1", group: "Data Gaps", label: "Generate consultant questions", enabled: true, capabilityStatus: "works-in-prototype", requiresHumanReview: false },
    { id: "gap-2", group: "Data Gaps", label: "Generate customer questions", enabled: true, capabilityStatus: "works-in-prototype", requiresHumanReview: true },
    { id: "gap-3", group: "Data Gaps", label: "Identify required evidence", enabled: true, capabilityStatus: "rule-based", requiresHumanReview: false },
    { id: "gap-4", group: "Data Gaps", label: "Identify weak assumptions", enabled: true, capabilityStatus: "rule-based", requiresHumanReview: true },

    { id: "int-1", group: "Interim Output", label: "Generate interim snapshot", enabled: true, capabilityStatus: "works-in-prototype", requiresHumanReview: false },
    { id: "int-2", group: "Interim Output", label: "Generate hypotheses", enabled: true, capabilityStatus: "rule-based", requiresHumanReview: true },
    { id: "int-3", group: "Interim Output", label: "Generate counter-hypotheses", enabled: true, capabilityStatus: "rule-based", requiresHumanReview: true },
    { id: "int-4", group: "Interim Output", label: "Generate risk warnings", enabled: true, capabilityStatus: "rule-based", requiresHumanReview: true }
  ],
  frameworkReality: {
    claimedFramework: "Unclear",
    observablePractices: [],
    roles: [],
    artifacts: [],
    maturitySignals: {
      "Role clarity": 3,
      "WIP transparency": 2,
      "Blocker transparency": 2,
      "Decision clarity": 3,
      "Customer feedback loop": 2,
      "Technical quality visibility": 3,
      "Improvement cadence": 2,
      "Cross-team dependency visibility": 2
    },
    contradictionHints: []
  },
  processDescription: "",
  interviewNotes: {
    observation: "",
    customerAnswers: "",
    painPoints: "",
    questions: ""
  },
  productContext: {
    repeatability: 3,
    standardizability: 3,
    requirementUncertainty: 3,
    technicalUncertainty: 3,
    customerFeedbackDependency: 3,
    regulatoryConstraint: 1,
    errorCost: 3,
    crossTeamDependencies: 3,
    changeFrequency: 3,
    innovationShare: 3,
    operationalUrgency: 3,
    description: ""
  },
  cynefinAssessment: {
    primaryDomain: "Mixed",
    confidence: "medium",
    reasoning: ["Intake initialized. Adjust the contextual sliders in step 6 to calibrate Cynefin hypotheses."],
    dataBasis: [],
    missingEvidence: ["Sensing is in idle manual state."],
    counterHypothesis: ""
  }
};

const STEP_NAMES = [
  "Audit Setup",
  "Company Resolver",
  "AI Work Order",
  "Work System Reality",
  "Evidence Upload",
  "Product Context",
  "Cynefin Sensemaking",
  "Interim Snapshot"
];

export default function App() {
  const [state, setState] = useState<AuditState>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.warn("Failed to load state from LocalStorage", e);
    }
    return INITIAL_STATE;
  });

  const [currentStep, setCurrentStep] = useState<number>(0);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (e) {
      console.warn("Failed to save state to LocalStorage", e);
    }
  }, [state]);

  const updateState = (updater: (prev: AuditState) => void) => {
    setState(prev => {
      // Deep freeze workaround for typing inside React setState
      const next = { ...prev };
      updater(next);
      return next;
    });
  };

  const loadDemo = () => {
    updateState(prev => {
      prev.companyProfile = resolveDemoCompany();
      prev.auditCase.companyName = prev.companyProfile.name.value;
    });
  };

  const handleReset = () => {
    if (window.confirm("Are you sure you want to reset all active sandbox data back to defaults?")) {
      setState(INITIAL_STATE);
      setCurrentStep(0);
      localStorage.removeItem(STORAGE_KEY);
    }
  };

  const getCompletedSteps = (): boolean[] => {
    const arr = Array(STEP_NAMES.length).fill(false);
    
    // Setup verification
    if (state.auditCase.auditName && state.auditCase.companyName && state.auditCase.auditGoal) {
      arr[0] = true;
    }
    // Company resolution checklist
    if (state.companyProfile.name.value) {
      arr[1] = true;
    }
    // ai work order config (defaults work fine)
    if (state.aiWorkOrder.some(o => o.enabled)) {
      arr[2] = true;
    }
    // work system reality
    if (state.frameworkReality.claimedFramework) {
      arr[3] = true;
    }
    // upload summary/descriptions filled
    if (state.uploadSummary || state.processDescription) {
      arr[4] = true;
    }
    // Product context
    if (state.productContext.description || state.productContext.requirementUncertainty > 1) {
      arr[5] = true;
    }
    // Cynefin assessment
    if (state.cynefinAssessment.primaryDomain) {
      arr[6] = true;
    }
    
    return arr;
  };

  const completedSteps = getCompletedSteps();
  const qData = calculateDataQuality(state);

  const onNext = () => {
    if (currentStep < STEP_NAMES.length - 1) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const onPrev = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const setStepIdx = (idx: number) => {
    // Basic gate checks: Let users click around if step 0 is filled.
    if (completedSteps[0] || idx === 0) {
      setCurrentStep(idx);
    } else {
      alert("Please complete Screen 1: Audit Setup with code, name, and goal parameters first.");
    }
  };

  return (
    <div className="min-h-screen bg-natural-bg text-natural-text flex flex-col justify-between font-sans select-none antialiased">
      
      {/* GLOBAL HEADER BAR */}
      <div>
        <header className="bg-natural-primary text-white border-b border-natural-border shrink-0">
          <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <span className="p-1.5 bg-white/10 rounded">
                <Workflow className="h-5 w-5 text-natural-accent" />
              </span>
              <div>
                <span className="text-[10px] font-mono tracking-wider uppercase text-natural-accent block h-3">
                  Consulting Sequence Sandbox
                </span>
                <span className="font-sans font-black tracking-tight text-white uppercase text-sm">
                  Agile Audit Intake
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <span className="h-2 w-2 rounded-full bg-natural-accent animate-pulse" />
              <span className="text-[10px] font-mono uppercase text-natural-sidebar font-bold hidden sm:inline">
                ESTABLISHED LOCAL SESSION
              </span>
              <button
                onClick={handleReset}
                type="button"
                className="py-1 px-2.5 text-[10px] font-mono uppercase bg-white/10 font-semibold border border-white/20 hover:border-white hover:bg-white/20 transition-colors rounded text-white cursor-pointer"
              >
                Clear Sandbox
              </button>
            </div>
          </div>
        </header>

        {/* Global Warning Banner */}
        <PrototypeDisclosureBanner />

        {/* The Progress Tracking Stepper */}
        <Stepper
          currentStep={currentStep}
          totalSteps={STEP_NAMES.length}
          steps={STEP_NAMES}
          completedSteps={completedSteps}
          setStep={setStepIdx}
        />
      </div>

      {/* CORE FRAME GRID LAYOUT */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-6 font-sans">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* Active Worksite Forms Area */}
          <div className={`${currentStep === 7 ? "lg:col-span-12" : "lg:col-span-8"} bg-white border border-natural-border shadow-sm rounded-lg p-6 min-h-[500px] flex flex-col justify-between`}>
            
            <div>
              {currentStep === 0 && (
                <AuditSetupForm 
                  state={state} 
                  updateState={updateState} 
                  onNext={onNext} 
                />
              )}
              {currentStep === 1 && (
                <CompanyResolver 
                  state={state} 
                  updateState={updateState} 
                  onNext={onNext} 
                  onPrev={onPrev} 
                />
              )}
              {currentStep === 2 && (
                <AiWorkOrderConfigurator 
                  state={state} 
                  updateState={updateState} 
                  onNext={onNext} 
                  onPrev={onPrev} 
                />
              )}
              {currentStep === 3 && (
                <FrameworkRealityForm 
                  state={state} 
                  updateState={updateState} 
                  onNext={onNext} 
                  onPrev={onPrev} 
                />
              )}
              {currentStep === 4 && (
                <DataSourceUploadPanel 
                  state={state} 
                  updateState={updateState} 
                  onNext={onNext} 
                  onPrev={onPrev} 
                />
              )}
              {currentStep === 5 && (
                <ProductContextForm 
                  state={state} 
                  updateState={updateState} 
                  onNext={onNext} 
                  onPrev={onPrev} 
                />
              )}
              {currentStep === 6 && (
                <CynefinAssessmentPanel 
                  state={state} 
                  updateState={updateState} 
                  onNext={onNext} 
                  onPrev={onPrev} 
                />
              )}
              {currentStep === 7 && (
                <InterimAuditSnapshot 
                  state={state} 
                  updateState={updateState} 
                  onNext={onNext} 
                  onPrev={onPrev} 
                />
              )}
            </div>

          </div>

          {/* Right sidebar scorecard panel - hidden on Step 8 Snapshot to allow dashboard expansion */}
          {currentStep !== 7 && (
            <div className="lg:col-span-4 shrink-0">
              <EvidenceStatePanel
                scorePercent={qData.scorePercent}
                matrix={qData.matrix}
                onLoadDemo={loadDemo}
                currentStep={currentStep}
              />
            </div>
          )}

        </div>
      </main>

      {/* FOOTER METRICS SEGMENT */}
      <footer className="bg-natural-sidebar border-t border-natural-border py-4 px-6 shrink-0 font-sans">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-natural-secondary text-[10px] font-mono leading-none">
          <div className="flex items-center gap-1.5 uppercase font-semibold">
            <span>STATION: INT INT-99</span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
            <span className="text-natural-primary">CORE REASONER: RULES ACTIVE</span>
          </div>
          <div className="flex gap-4 opacity-75">
            <span>© 2026 AGILE COGNITION LABS LLC. SANDBOX ISOLATION ACTIVE.</span>
          </div>
        </div>
      </footer>

    </div>
  );
}

