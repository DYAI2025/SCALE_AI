import React from "react";
import { 
  Info, 
  AlertTriangle, 
  CheckCircle2, 
  HelpCircle, 
  Sparkles, 
  FileText, 
  Eye, 
  Loader2, 
  Lock
} from "lucide-react";
import { DataStatus, CapabilityStatus, Confidence } from "../types";

// Prototype Disclosure Banner
export const PrototypeDisclosureBanner: React.FC = () => {
  return (
    <div id="disclosure-banner" className="bg-natural-primary border-b border-natural-border/30 text-white px-6 py-2 text-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 font-sans tracking-wide">
      <div className="flex items-center gap-2">
        <AlertTriangle className="h-4 w-4 text-natural-accent shrink-0" />
        <div>
          <span className="font-bold tracking-wider text-natural-accent">CONSULTING LABS PROTOTYPE:</span>
          {" "}Licensed for click-dummy execution and intake sandbox logic. No external API payloads or LLM keys required.
        </div>
      </div>
      <div className="flex gap-2 shrink-0">
        <span className="px-2 py-0.5 bg-white/15 border border-white/20 text-natural-sidebar rounded font-mono text-[9px] uppercase font-bold tracking-widest">
          Offline Sandboxed
        </span>
        <span className="px-2 py-0.5 bg-natural-accent text-natural-primary rounded font-mono text-[9px] uppercase font-bold tracking-widest">
          Click-Dummy Active
        </span>
      </div>
    </div>
  );
};

// Help Tooltip or description block
export const InfoTooltip: React.FC<{ content: string; label?: string }> = ({ content, label }) => {
  return (
    <span className="group relative inline-flex items-center gap-1 cursor-help hover:text-slate-900 text-slate-500 transition-colors">
      {label && <span className="text-xs">{label}</span>}
      <HelpCircle className="h-3 w-3" />
      <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block w-64 bg-slate-900 text-slate-100 text-[11px] leading-relaxed p-2.5 rounded shadow-lg z-50 font-sans normal-case text-center">
        {content}
        <span className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-900"></span>
      </span>
    </span>
  );
};

// Data Status Chips representing where fields came from
export const DataStatusChip: React.FC<{ status: DataStatus }> = ({ status }) => {
  const configs: Record<DataStatus, { bg: string; text: string; label: string; border: string }> = {
    real: { bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-200", label: "Real Verified" },
    manual: { bg: "bg-blue-50", text: "text-blue-700", border: "border-blue-200", label: "Manual Entry" },
    uploaded: { bg: "bg-indigo-50", text: "text-indigo-700", border: "border-indigo-200", label: "Uploaded File" },
    demo: { bg: "bg-purple-50", text: "text-purple-700", border: "border-purple-200", label: "Demo Dataset" },
    inferred: { bg: "bg-amber-50", text: "text-amber-700", border: "border-amber-200", label: "AI Inferred" },
    missing: { bg: "bg-rose-50", text: "text-rose-700", border: "border-rose-200", label: "Evidence Missing" },
    "adapter-ready": { bg: "bg-cyan-50", text: "text-cyan-700", border: "border-cyan-200", label: "Adapter Ready" },
    "click-dummy": { bg: "bg-slate-100", text: "text-slate-600", border: "border-slate-300", label: "Click-Dummy Spot" }
  };

  const config = configs[status] || configs.missing;

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-mono leading-none border uppercase tracking-wider font-semibold ${config.bg} ${config.text} ${config.border}`}>
      ● {config.label}
    </span>
  );
};

// Capability Status Badges for configured AI operations
export const CapabilityStatusBadge: React.FC<{ status: CapabilityStatus }> = ({ status }) => {
  const configs: Record<CapabilityStatus, { bg: string; text: string; label: string; border: string }> = {
    "works-in-prototype": { bg: "bg-teal-50", text: "text-teal-700", border: "border-teal-200", label: "Works in Prototype" },
    "rule-based": { bg: "bg-blue-50", text: "text-blue-700", border: "border-blue-200", label: "Rule-Based Engine" },
    "requires-uploaded-data": { bg: "bg-indigo-50", text: "text-indigo-700", border: "border-indigo-200", label: "Requires Uploaded Data" },
    simulated: { bg: "bg-amber-50/70", text: "text-amber-700", border: "border-amber-200", label: "Simulated Output" },
    "adapter-ready": { bg: "bg-cyan-50", text: "text-cyan-600", border: "border-cyan-200", label: "Planned Integration" },
    "requires-real-api": { bg: "bg-purple-50", text: "text-purple-700", border: "border-purple-200", label: "Requires Real API Keys" },
    "requires-human-review": { bg: "bg-orange-50", text: "text-orange-700", border: "border-orange-200", label: "Consultant Eye Req." }
  };

  const config = configs[status] || configs.simulated;

  return (
    <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-mono uppercase border font-medium ${config.bg} ${config.text} ${config.border}`}>
      {config.label}
    </span>
  );
};

// Confidence Indicator
export const SourceConfidenceBadge: React.FC<{ confidence: Confidence }> = ({ confidence }) => {
  const color = {
    high: "bg-emerald-100 text-emerald-800 border-emerald-300",
    medium: "bg-amber-100 text-amber-800 border-amber-300",
    low: "bg-rose-100 text-rose-800 border-rose-300"
  }[confidence];

  return (
    <span className={`inline-flex items-center px-2 py-0.2 rounded text-[10px] border tracking-wider uppercase font-semibold text-center ${color}`}>
      {confidence} confidence
    </span>
  );
};

// Wizard Stepper
interface StepperProps {
  currentStep: number;
  totalSteps: number;
  steps: string[];
  setStep: (step: number) => void;
  completedSteps: boolean[];
}

export const Stepper: React.FC<StepperProps> = ({ currentStep, totalSteps, steps, setStep, completedSteps }) => {
  return (
    <div id="stepper-container" className="bg-natural-sidebar border-b border-natural-border py-4 px-6 shadow-xs">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <span className="text-[10px] font-mono uppercase tracking-widest text-natural-secondary font-bold block mb-0.5">
              Sequence Checklist Progress
            </span>
            <h1 className="text-xl font-serif italic font-bold tracking-tight text-natural-primary flex items-center gap-2">
              <span className="px-1.5 py-0.5 text-xs bg-natural-primary text-white rounded font-mono not-italic font-bold">
                {String(currentStep + 1).padStart(2, "0")}
              </span>
              <span>{steps[currentStep]}</span>
            </h1>
          </div>
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
            {steps.map((stepName, index) => {
              const isActive = index === currentStep;
              const isCompleted = completedSteps[index];

              return (
                <button
                  key={index}
                  onClick={() => setStep(index)}
                  className={`relative flex items-center justify-center shrink-0 h-8 font-mono text-[10px] rounded transition-all duration-150 px-2.5 border text-center cursor-pointer
                    ${
                      isActive
                        ? "bg-natural-primary text-white border-natural-primary font-bold shadow-sm"
                        : isCompleted
                        ? "bg-white text-natural-text border-natural-border hover:bg-natural-sidebar"
                        : "bg-white/40 text-natural-secondary border-natural-border/60 hover:bg-white/80"
                    }`}
                  title={`${index + 1}. ${stepName}`}
                >
                  <span className={`mr-1 text-[9px] select-none ${isActive ? "text-white/75" : "text-natural-secondary"}`}>
                    {index + 1}
                  </span>
                  <span className="max-w-[70px] truncate uppercase tracking-wider font-semibold">
                    {stepName.split(" ").slice(0, 2).join(" ")}
                  </span>
                  {isCompleted && !isActive && (
                    <span className="absolute -top-1 -right-1 bg-natural-accent text-white font-bold rounded-full w-3.5 h-3.5 flex items-center justify-center text-[8px] border border-white leading-none">
                      ✓
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

// Contradiction Hints banner inside Work System Form
export const ContradictionHints: React.FC<{ hints: string[] }> = ({ hints }) => {
  if (hints.length === 0) return null;

  return (
    <div className="bg-rose-50 border border-rose-200 rounded-lg p-4 space-y-2 mt-4 animate-fade-in">
      <h4 className="text-xs font-mono uppercase tracking-wider text-rose-800 font-bold flex items-center gap-1.5">
        <AlertTriangle className="h-4 w-4" />
        System Coherence Diagnostics ({hints.length})
      </h4>
      <ul className="space-y-1.5 text-xs text-rose-700 leading-normal font-sans">
        {hints.map((hint, idx) => (
          <li key={idx} className="pl-3.5 relative">
            <span className="absolute left-0 top-1.5 w-1.5 h-1.5 rounded-full bg-rose-500"></span>
            {hint}
          </li>
        ))}
      </ul>
    </div>
  );
};

// Evidence State Matrix Panel (Right hand side summary overview)
export interface EvidenceStatePanelProps {
  scorePercent: number;
  matrix: Record<string, string>;
  onLoadDemo: () => void;
  currentStep: number;
}

export const EvidenceStatePanel: React.FC<EvidenceStatePanelProps> = ({ 
  scorePercent, 
  matrix, 
  onLoadDemo,
  currentStep 
}) => {
  return (
    <div className="bg-white border border-natural-border rounded-lg p-5 shadow-xs space-y-5 h-fit text-natural-text">
      <div>
        <h3 className="text-xs font-mono uppercase tracking-widest text-[#FF9932] font-bold mb-1">
          Intake Groundedness
        </h3>
        <div className="flex items-end gap-3">
          <span className="text-3xl font-serif italic font-bold tracking-tight text-natural-primary leading-none">
            {scorePercent}%
          </span>
          <span className="text-xs text-natural-secondary font-medium pb-0.5">
            evidence loaded
          </span>
        </div>
        {/* Progress Bar */}
        <div className="w-full bg-natural-sidebar rounded-full h-2 mt-2 overflow-hidden">
          <div 
            className="bg-natural-primary h-full rounded-full transition-all duration-300"
            style={{ width: `${scorePercent}%` }}
          />
        </div>
      </div>

      <div className="border-t border-natural-border/60 pt-4.5">
        <h4 className="text-[10px] font-mono uppercase tracking-wider text-natural-primary font-bold mb-3 flex items-center justify-between">
          <span>Evidence Sources</span>
          <span className="text-[9px] text-natural-secondary normal-case font-normal">(Auto-Auditing)</span>
        </h4>
        <div className="space-y-2.5">
          {Object.entries(matrix).map(([key, value]) => {
            const fieldLabel = {
              name: "Company Legal Name",
              legalForm: "Legal Structure Form",
              location: "Geographic HQ Location",
              industry: "Vetted Industry Field",
              website: "Corporate URL Link",
              employeeCount: "Staffing Body Count",
              registerId: "Commercial Register ID",
              workflowData: "Vapor Workflow Dataset"
            }[key] || key;

            return (
              <div key={key} className="flex items-center justify-between gap-4 text-xs">
                <span className="text-natural-text truncate font-sans font-medium">{fieldLabel}</span>
                <DataStatusChip status={value as DataStatus} />
              </div>
            );
          })}
        </div>
      </div>

      {scorePercent < 50 && (
        <div className="bg-natural-sidebar/50 border border-natural-border rounded p-3 text-xs text-natural-text leading-relaxed font-sans">
          <p className="font-bold text-natural-primary mb-1 flex items-center gap-1">
            <Sparkles className="h-3.5 w-3.5 text-natural-accent" />
            Class-wide Baseline Data
          </p>
          You are currently in manual/empty intake mode. To test the rule engines instantly, you can trigger the demo profile below.
          <button 
            type="button" 
            onClick={onLoadDemo}
            className="w-full mt-2.5 py-1.5 px-3 bg-natural-primary hover:bg-[#172B36] text-white text-[10px] font-mono uppercase tracking-widest font-bold shadow-xs transition-colors rounded cursor-pointer border-0"
          >
            Load Demo Company
          </button>
        </div>
      )}

      <div className="border-t border-natural-border/60 pt-3 text-[9px] text-natural-secondary font-mono flex items-center justify-between">
        <span>STATION STATUS: OFFLINE SAFE</span>
        <span>STEP {currentStep + 1} OF 8</span>
      </div>
    </div>
  );
};
