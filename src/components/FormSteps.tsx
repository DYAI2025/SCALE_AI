import React, { useState, useRef } from "react";
import { 
  Building2, 
  HelpCircle, 
  Sparkles, 
  FileSpreadsheet, 
  UploadCloud, 
  Check, 
  AlertTriangle, 
  Activity, 
  ArrowRight,
  RefreshCw,
  Sliders,
  FileText,
  ShieldCheck,
  CheckCircle,
  HelpCircle as HelpIcon,
  Plus,
  Trash2,
  Clock,
  ExternalLink,
  Loader2
} from "lucide-react";
import { 
  AuditState, 
  AiWorkOrderOption, 
  CapabilityStatus, 
  DataStatus, 
  Confidence, 
  CynefinAssessment,
  UploadSummary
} from "../types";
import { 
  DataStatusChip, 
  CapabilityStatusBadge, 
  SourceConfidenceBadge, 
  ContradictionHints, 
  InfoTooltip 
} from "./CommonUI";
import { 
  resolveDemoCompany, 
  detectFrameworkContradictions, 
  parseCsvContent, 
  parseJsonContent,
  calculateCynefinHypothesis,
  generateInterimHypotheses,
  generateMissingDataQuestions,
  calculateDataQuality
} from "../utils/auditLogic";

// ==========================================
// SCREEN 1: AUDIT SETUP
// ==========================================
interface StepProps {
  state: AuditState;
  updateState: (updater: (prev: AuditState) => void) => void;
  onNext: () => void;
  onPrev?: () => void;
}

export const AuditSetupForm: React.FC<StepProps> = ({ state, updateState, onNext }) => {
  const [errors, setErrors] = useState<Record<string, string>>({});
  const { auditCase } = state;

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!auditCase.auditName.trim()) newErrors.auditName = "Audit Name is required.";
    if (!auditCase.companyName.trim()) newErrors.companyName = "Organization Unit / Company is required.";
    if (!auditCase.auditGoal) newErrors.auditGoal = "At least one audit goal is required.";
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validate()) {
      onNext();
    }
  };

  const setGoal = (goal: string) => {
    updateState(prev => {
      prev.auditCase.auditGoal = goal;
    });
  };

  const toggleMode = (mode: string) => {
    updateState(prev => {
      const idx = prev.auditCase.allowedDataModes.indexOf(mode);
      if (idx > -1) {
        prev.auditCase.allowedDataModes.splice(idx, 1);
      } else {
        prev.auditCase.allowedDataModes.push(mode);
      }
    });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="border-b border-slate-100 pb-4">
        <h2 className="text-lg font-sans font-bold text-slate-900">Define Baseline Scope & Operational Goals</h2>
        <p className="text-xs text-slate-500 mt-0.5">Define your audit boundary constraints. AI modules use these to customize inference engines.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Field: Audit Name */}
        <div className="space-y-1.5Col">
          <label className="block text-xs font-mono uppercase tracking-wider text-slate-600 font-bold">
            Audit Case Code / Name <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            placeholder="e.g. Acme SaaS Value Stream Evolution"
            value={auditCase.auditName}
            onChange={e => updateState(prev => { prev.auditCase.auditName = e.target.value; })}
            className={`w-full p-2.5 bg-white border rounded text-xs focus:ring-1 focus:ring-slate-900 focus:outline-none transition-all ${
              errors.auditName ? "border-rose-400 bg-rose-50/25" : "border-slate-300"
            }`}
          />
          {errors.auditName && <p className="text-rose-500 text-[11px] font-medium">{errors.auditName}</p>}
          <p className="text-[10px] text-slate-400">Unique container key used to segment file mappings.</p>
        </div>

        {/* Field: Company Name */}
        <div className="space-y-1.5">
          <label className="block text-xs font-mono uppercase tracking-wider text-slate-600 font-bold">
            Company / Organization Unit <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            placeholder="e.g. Acme Flow Systems GmbH"
            value={auditCase.companyName}
            onChange={e => updateState(prev => { 
              prev.auditCase.companyName = e.target.value;
              prev.companyProfile.name.value = e.target.value;
              prev.companyProfile.name.dataStatus = "manual";
            })}
            className={`w-full p-2.5 bg-white border rounded text-xs focus:ring-1 focus:ring-slate-900 focus:outline-none transition-all ${
              errors.companyName ? "border-rose-400 bg-rose-50/25" : "border-slate-300"
            }`}
          />
          {errors.companyName && <p className="text-rose-500 text-[11px] font-medium">{errors.companyName}</p>}
          <p className="text-[10px] text-slate-400">Legal entity name. Auto-propagates to registry resolver in next step.</p>
        </div>
      </div>

      {/* Field: Audit Goal */}
      <div className="space-y-2">
        <label className="block text-xs font-mono uppercase tracking-wider text-slate-600 font-bold">
          Primary Engagement Goal <span className="text-rose-500">*</span>
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {[
            { id: "Framework Fit", desc: "Evaluate Scrum/Kanban/SAFe mismatch vs delivery requirements." },
            { id: "Agile Flow Audit", desc: "Profile bottleneck states, lead times, work distribution queues." },
            { id: "Change Readiness", desc: "Detect cultural friction, structural blockers, team learning rates." },
            { id: "AI Readiness", desc: "Assess technical development flows & agility level to absorb AI tools." },
            { id: "Combined", desc: "Holistic organizational assessment across structural, flow, and delivery layers." }
          ].map(opt => (
            <button
              key={opt.id}
              type="button"
              onClick={() => setGoal(opt.id)}
              className={`p-3 text-left border rounded transition-all flex flex-col justify-between h-24 ${
                auditCase.auditGoal === opt.id 
                  ? "bg-slate-900 border-slate-900 text-white" 
                  : "bg-white border-slate-200 hover:border-slate-400 text-slate-800"
              }`}
            >
              <span className="font-sans font-bold text-xs">{opt.id}</span>
              <span className={`text-[10px] leading-relaxed mt-1 ${auditCase.auditGoal === opt.id ? "text-slate-300" : "text-slate-500"}`}>
                {opt.desc}
              </span>
            </button>
          ))}
        </div>
        {errors.auditGoal && <p className="text-rose-500 text-[11px] font-medium">{errors.auditGoal}</p>}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Scope type */}
        <div className="space-y-1.5">
          <label className="block text-xs font-mono uppercase tracking-wider text-slate-600 font-bold">Scope Horizon</label>
          <select
            value={auditCase.scopeType}
            onChange={e => updateState(prev => { prev.auditCase.scopeType = e.target.value; })}
            className="w-full p-2.5 bg-white border border-slate-300 rounded text-xs focus:ring-1 focus:ring-slate-900 focus:outline-none"
          >
            <option>Team</option>
            <option>Department</option>
            <option>Business unit</option>
            <option>Organization</option>
          </select>
        </div>

        {/* Est. People */}
        <div className="space-y-1.5">
          <label className="block text-xs font-mono uppercase tracking-wider text-slate-600 font-bold">
            Approx. People in Scope
          </label>
          <input
            type="number"
            value={auditCase.peopleInScope || ""}
            onChange={e => updateState(prev => { prev.auditCase.peopleInScope = Number(e.target.value) || undefined; })}
            className="w-full p-2.5 bg-white border border-slate-300 rounded text-xs focus:ring-1 focus:ring-slate-900 focus:outline-none"
            placeholder="e.g. 150"
          />
        </div>

        {/* Confidentiality */}
        <div className="space-y-1.5">
          <label className="block text-xs font-mono uppercase tracking-wider text-slate-600 font-bold">
            Confidentiality Restriction
          </label>
          <select
            value={auditCase.confidentialityLevel}
            onChange={e => updateState(prev => { prev.auditCase.confidentialityLevel = e.target.value; })}
            className="w-full p-2.5 bg-white border border-slate-300 rounded text-xs focus:ring-1 focus:ring-slate-900 focus:outline-none"
          >
            <option value="internal">Internal Only (Highly Restrictive)</option>
            <option value="customer-related">Customer-Related Engagement</option>
            <option value="sensitive">Sensitive / NDA-Enforced</option>
          </select>
        </div>
      </div>

      {/* Allowed data modes */}
      <div className="space-y-2">
        <label className="block text-xs font-mono uppercase tracking-wider text-slate-600 font-bold flex items-center gap-1">
          <span>Allowed Audit Channels</span>
          <InfoTooltip content="Toggling channels filters allowable AI ingestion models. This prevents sensitive data leaks." />
        </label>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {[
            "manual entry",
            "demo resolver",
            "web research prepared",
            "Jira upload",
            "Jira API adapter-ready",
            "CSV/JSON upload",
            "process description",
            "interview notes"
          ].map(mode => {
            const isChecked = auditCase.allowedDataModes.includes(mode);
            const isJiraConnected = mode === "Jira API adapter-ready";

            return (
              <label 
                key={mode} 
                className={`p-2.5 border rounded cursor-pointer transition-colors flex items-start gap-2 select-none ${
                  isChecked 
                    ? "bg-slate-50 border-slate-800 text-slate-900 font-medium" 
                    : "bg-white border-slate-250 text-slate-500 hover:bg-slate-50"
                }`}
              >
                <input
                  type="checkbox"
                  checked={isChecked}
                  onChange={() => toggleMode(mode)}
                  className="mt-0.5 accent-slate-900"
                />
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide font-mono leading-none">{mode}</span>
                  {isJiraConnected && isChecked && (
                    <span className="text-[9px] text-amber-600 font-medium mt-1 leading-normal">
                      ⚠ Not connected in this prototype.
                    </span>
                  )}
                </div>
              </label>
            );
          })}
        </div>
      </div>

      {/* Button footer */}
      <div className="pt-4 border-t border-slate-100 flex justify-end">
        <button
          type="button"
          onClick={handleNext}
          className="py-2.5 px-5 bg-slate-950 hover:bg-slate-900 text-white font-mono text-xs uppercase tracking-wider font-semibold rounded shadow-sm inline-flex items-center gap-2 transition-colors cursor-pointer"
        >
          Initialize Sandbox & Proceed
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};

// ==========================================
// SCREEN 2: COMPANY RESOLVER
// ==========================================
export const CompanyResolver: React.FC<StepProps> = ({ state, updateState, onNext, onPrev }) => {
  const [sourceMode, setSourceMode] = useState<string>("Manual Entry");
  const [resolverStatus, setResolverStatus] = useState<{
    msg: string;
    type: "idle" | "loading" | "error" | "success";
  }>({ msg: "", type: "idle" });

  const { companyProfile } = state;

  const loadDemo = () => {
    setResolverStatus({ msg: "Loading mock seed profile...", type: "loading" });
    setTimeout(() => {
      const demoData = resolveDemoCompany();
      updateState(prev => {
        prev.companyProfile = demoData;
        prev.auditCase.companyName = demoData.name.value;
      });
      setResolverStatus({ 
        msg: "Loaded Acme Flow Systems GmbH demo data into active workspace.", 
        type: "success" 
      });
    }, 550);
  };

  const runResolve = () => {
    if (!companyProfile.name.value.trim()) {
      setResolverStatus({ msg: "Please enter a search string or company name first.", type: "error" });
      return;
    }
    
    setResolverStatus({ msg: "Fanning out query to commercial indices...", type: "loading" });
    
    setTimeout(() => {
      setResolverStatus({ 
        msg: "PROTOTYPE LIMITATION: No active OpenCorporates or registry connection is active. Please input manually or select 'Load Demo Company'.", 
        type: "error" 
      });
    }, 1000);
  };

  const handleFieldChange = (field: keyof typeof companyProfile, val: string | number) => {
    updateState(prev => {
      const target = prev.companyProfile[field];
      if (target) {
        target.value = val as any;
        target.dataStatus = "manual";
        target.confidence = "high";
        target.sourceNote = "Manually entered by consultant in draft interface.";
      } else {
        prev.companyProfile[field] = {
          value: val as any,
          dataStatus: "manual",
          confidence: "high",
          sourceNote: "Manually entered by consultant."
        };
      }
    });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="border-b border-slate-100 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-sans font-bold text-slate-900">Resolve & Enrich Corporate Entity</h2>
          <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-1.5">
            <span>Query public database channels to pull industry benchmarks.</span>
          </p>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={loadDemo}
            className="py-1.5 px-3 bg-slate-900 hover:bg-slate-800 text-white border border-slate-900 rounded font-mono text-[11px] uppercase tracking-wider font-semibold transition-colors cursor-pointer inline-flex items-center gap-1.5"
          >
            <Sparkles className="h-3.5 w-3.5" />
            Load Demo Company
          </button>
        </div>
      </div>

      <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 space-y-3.5">
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3">
          <span className="text-xs font-mono uppercase tracking-wider text-slate-500 font-bold">
            Select Discovery Channel
          </span>
          <div className="flex items-center gap-1 bg-white border border-slate-200 p-0.5 rounded text-xs select-none">
            {["Manual Entry", "Demo Resolver", "OpenCorporates adapter-ready", "German Unternehmensregister manual/link"].map(opt => (
              <button
                key={opt}
                type="button"
                onClick={() => setSourceMode(opt)}
                className={`py-1 px-2.5 rounded text-[11px] transition-colors ${
                  sourceMode === opt 
                    ? "bg-slate-950 text-white font-medium" 
                    : "text-slate-500 hover:text-slate-800"
                }`}
              >
                {opt.replace("manual/link", "").replace("adapter-ready", "")}
              </button>
            ))}
          </div>
        </div>

        {sourceMode.includes("adapter-ready") && (
          <div className="bg-cyan-50 border border-cyan-200 text-cyan-800 rounded p-3 text-xs leading-normal">
            <span className="font-bold">INTEGRATION SCOPE DESIGN:</span> OpenCorporates schema binding is planned. In active builds, this requests legal addresses globally via OAuth tokens. Currently sandbox is isolated.
          </div>
        )}

        {sourceMode.includes("German") && (
          <div className="bg-slate-100 border border-slate-200 text-slate-700 rounded p-3 text-xs leading-normal">
            <strong className="text-slate-800">Manual Lookup Required:</strong> Click below to search German register directly in a separate window. Copy output payload back to the forms:
            <a 
              href="https://www.unternehmensregister.de" 
              target="_blank" 
              rel="noreferrer"
              className="inline-flex items-center gap-1 text-slate-900 border-b border-dotted border-slate-900 ml-1.5 font-bold hover:text-slate-700"
            >
              go to Unternehmensregister <ExternalLink className="h-3 w-3" />
            </a>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
          <div className="md:col-span-2 space-y-1.5">
            <label className="text-xs font-mono uppercase tracking-wider text-slate-500 font-semibold block">Target Company Search Name</label>
            <input
              type="text"
              placeholder="e.g. Acme Flow Systems"
              value={companyProfile.name.value}
              onChange={e => handleFieldChange("name", e.target.value)}
              className="w-full p-2.5 bg-white border border-slate-300 rounded text-xs focus:ring-1 focus:ring-slate-900 focus:outline-none"
            />
          </div>
          <button
            type="button"
            onClick={runResolve}
            className="w-full p-2.5 bg-white border border-slate-300 hover:border-slate-800 text-slate-800 font-mono text-xs uppercase tracking-wider font-bold rounded shadow-xs transition-colors cursor-pointer inline-flex items-center justify-center gap-2"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            Resolve Company
          </button>
        </div>

        {resolverStatus.type !== "idle" && (
          <div className={`p-3 rounded border text-xs leading-relaxed flex items-start gap-2 animate-fade-in ${
            resolverStatus.type === "loading" ? "bg-slate-50 border-slate-300 text-slate-600" :
            resolverStatus.type === "error" ? "bg-rose-50 border-rose-200 text-rose-800" :
            "bg-emerald-50 border-emerald-200 text-emerald-800"
          }`}>
            {resolverStatus.type === "loading" && <Loader2 className="h-4 w-4 animate-spin shrink-0 text-slate-500 mt-0.5" />}
            {resolverStatus.type === "error" && <AlertTriangle className="h-4 w-4 text-rose-600 shrink-0 mt-0.5" />}
            {resolverStatus.type === "success" && <CheckCircle className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />}
            <span>{resolverStatus.msg}</span>
          </div>
        )}
      </div>

      <div className="space-y-4">
        <h3 className="text-xs font-mono uppercase tracking-wider text-slate-500 font-bold border-b border-slate-150 pb-1.5">
          Entity Field Properties (Active Workspace Value & Source Tracking)
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Field: Location */}
          <div className="p-3 bg-white border border-slate-200 rounded-lg space-y-2">
            <div className="flex items-center justify-between gap-2.5">
              <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold">Geography / Location</span>
              <DataStatusChip status={companyProfile.location?.dataStatus || "missing"} />
            </div>
            <input
              type="text"
              placeholder="Cologne, Germany"
              value={companyProfile.location?.value || ""}
              onChange={e => handleFieldChange("location", e.target.value)}
              className="w-full p-2 bg-slate-50/50 hover:bg-white focus:bg-white transition-colors border border-slate-200 focus:border-slate-900 rounded text-xs focus:outline-none"
            />
            {companyProfile.location?.sourceNote && (
              <p className="text-[9px] text-slate-400 truncate leading-none">{companyProfile.location.sourceNote}</p>
            )}
          </div>

          {/* Field: Legal Form */}
          <div className="p-3 bg-white border border-slate-200 rounded-lg space-y-2">
            <div className="flex items-center justify-between gap-2.5">
              <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold">Legal Form</span>
              <DataStatusChip status={companyProfile.legalForm?.dataStatus || "missing"} />
            </div>
            <input
              type="text"
              placeholder="e.g. GmbH"
              value={companyProfile.legalForm?.value || ""}
              onChange={e => handleFieldChange("legalForm", e.target.value)}
              className="w-full p-2 bg-slate-50/50 hover:bg-white focus:bg-white transition-colors border border-slate-200 focus:border-slate-900 rounded text-xs focus:outline-none"
            />
          </div>

          {/* Field: Industry */}
          <div className="p-3 bg-white border border-slate-200 rounded-lg space-y-2">
            <div className="flex items-center justify-between gap-2.5">
              <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold">Market / Industry Vertical</span>
              <DataStatusChip status={companyProfile.industry?.dataStatus || "missing"} />
            </div>
            <input
              type="text"
              placeholder="B2B Manufacturing"
              value={companyProfile.industry?.value || ""}
              onChange={e => handleFieldChange("industry", e.target.value)}
              className="w-full p-2 bg-slate-50/50 hover:bg-white focus:bg-white transition-colors border border-slate-200 focus:border-slate-900 rounded text-xs focus:outline-none"
            />
          </div>

          {/* Field: Website */}
          <div className="p-3 bg-white border border-slate-200 rounded-lg space-y-2">
            <div className="flex items-center justify-between gap-2.5">
              <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold">Website URL</span>
              <DataStatusChip status={companyProfile.website?.dataStatus || "missing"} />
            </div>
            <input
              type="text"
              placeholder="https://example.com"
              value={companyProfile.website?.value || ""}
              onChange={e => handleFieldChange("website", e.target.value)}
              className="w-full p-2 bg-slate-50/50 hover:bg-white focus:bg-white transition-colors border border-slate-200 focus:border-slate-900 rounded text-xs focus:outline-none"
            />
          </div>

          {/* Field: Employee Count */}
          <div className="p-3 bg-white border border-slate-200 rounded-lg space-y-2">
            <div className="flex items-center justify-between gap-2.5">
              <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold">Employee Count</span>
              <DataStatusChip status={companyProfile.employeeCount?.dataStatus || "missing"} />
            </div>
            <input
              type="number"
              placeholder="e.g. 500"
              value={companyProfile.employeeCount?.value || ""}
              onChange={e => handleFieldChange("employeeCount", Number(e.target.value) || 0)}
              className="w-full p-2 bg-slate-50/50 hover:bg-white focus:bg-white transition-colors border border-slate-200 focus:border-slate-900 rounded text-xs focus:outline-none"
            />
          </div>

          {/* Field: Registry ID */}
          <div className="p-3 bg-white border border-slate-200 rounded-lg space-y-2">
            <div className="flex items-center justify-between gap-2.5">
              <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold">Commercial register ID</span>
              <DataStatusChip status={companyProfile.registerId?.dataStatus || "missing"} />
            </div>
            <input
              type="text"
              placeholder="HRB 12345"
              value={companyProfile.registerId?.value || ""}
              onChange={e => handleFieldChange("registerId", e.target.value)}
              className="w-full p-2 bg-slate-50/50 hover:bg-white focus:bg-white transition-colors border border-slate-200 focus:border-slate-900 rounded text-xs focus:outline-none"
            />
          </div>
        </div>
      </div>

      <div className="pt-4 border-t border-slate-100 flex justify-between">
        <button
          type="button"
          onClick={onPrev}
          className="py-2.5 px-4 bg-white border border-slate-300 hover:border-slate-500 rounded text-slate-700 font-mono text-xs uppercase tracking-wider font-semibold transition-all cursor-pointer"
        >
          Back
        </button>
        <button
          type="button"
          onClick={onNext}
          className="py-2.5 px-5 bg-slate-950 hover:bg-slate-900 text-white font-mono text-xs uppercase tracking-wider font-semibold rounded shadow-sm inline-flex items-center gap-2 transition-all cursor-pointer"
        >
          Confirm Registry Profile
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};

// ==========================================
// SCREEN 3: AI WORK ORDER CONFIGURATION
// ==========================================
export const AiWorkOrderConfigurator: React.FC<StepProps> = ({ state, updateState, onNext, onPrev }) => {
  const { aiWorkOrder } = state;

  const toggleOption = (id: string) => {
    updateState(prev => {
      const target = prev.aiWorkOrder.find(o => o.id === id);
      if (target) {
        target.enabled = !target.enabled;
      }
    });
  };

  // Group options
  const groups = Array.from(new Set(aiWorkOrder.map(item => item.group)));

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="border-b border-slate-100 pb-4">
        <h2 className="text-lg font-sans font-bold text-slate-900">Define AI Work Order (Inference Tasks)</h2>
        <p className="text-xs text-slate-500 mt-0.5">Control the analytical pipeline. Deselected features block inference engines, protecting system safety borders.</p>
      </div>

      <div className="space-y-6">
        {groups.map(groupName => {
          const groupItems = aiWorkOrder.filter(item => item.group === groupName);

          return (
            <div key={groupName} className="space-y-3">
              <h3 className="text-xs font-mono uppercase tracking-wider text-slate-500 font-bold border-l-2 border-slate-900 pl-2">
                {groupName} Parameters
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {groupItems.map(item => {
                  return (
                    <div 
                      key={item.id}
                      onClick={() => toggleOption(item.id)}
                      className={`p-3.5 border rounded-lg transition-all flex flex-col justify-between cursor-pointer select-none relative truncate ${
                        item.enabled 
                          ? "bg-slate-50/50 border-slate-800 shadow-xs" 
                          : "bg-white border-slate-150 opacity-60 hover:opacity-85 hover:border-slate-350"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={item.enabled}
                            onChange={() => {}} // Swallowed: parent div click does toggle
                            className="accent-slate-900 mt-0.5 cursor-pointer shrink-0"
                          />
                          <span className={`text-xs font-sans font-semibold leading-snug ${item.enabled ? "text-slate-900" : "text-slate-500"}`}>
                            {item.label}
                          </span>
                        </div>
                        <CapabilityStatusBadge status={item.capabilityStatus} />
                      </div>

                      <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400">
                        <span>Actionable state: {item.enabled ? "ACTIVE" : "EXCLUDED"}</span>
                        {item.requiresHumanReview && (
                          <span className="text-amber-600 font-medium">● Includes human-in-the-loop</span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      <div className="pt-4 border-t border-slate-100 flex justify-between">
        <button
          type="button"
          onClick={onPrev}
          className="py-2.5 px-4 bg-white border border-slate-300 hover:border-slate-500 rounded text-slate-700 font-mono text-xs uppercase tracking-wider font-semibold transition-all cursor-pointer"
        >
          Back
        </button>
        <button
          type="button"
          onClick={onNext}
          className="py-2.5 px-5 bg-slate-950 hover:bg-slate-900 text-white font-mono text-xs uppercase tracking-wider font-semibold rounded shadow-sm inline-flex items-center gap-2 transition-all cursor-pointer"
        >
          Confirm Work Order
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};


// ==========================================
// SCREEN 4: CLAIMED vs ACTUAL WORK SYSTEM
// ==========================================
const CLAIMED_FRAMEWORKS = [
  "Scrum",
  "Kanban",
  "Scrumban",
  "SAFe",
  "LeSS",
  "Nexus",
  "Classical project management",
  "Hybrid",
  "Unclear",
  "None"
];

const OBSERVABLE_PRACTICES = [
  "Daily coordination",
  "Sprint Planning",
  "Sprint Review",
  "Retrospective",
  "Backlog Refinement",
  "Replenishment",
  "WIP limits",
  "Explicit policies",
  "Service classes",
  "Portfolio Kanban",
  "PI Planning",
  "Roadmap Review",
  "Flow metrics review",
  "Blocker review",
  "Dependency review"
];

const STANDARD_ROLES = [
  "Product Owner",
  "Scrum Master",
  "Flow Manager",
  "Agile Coach",
  "Team Lead",
  "Project Manager",
  "Line Manager",
  "Portfolio Owner",
  "Architect",
  "Business Owner"
];

const STANDARD_ARTIFACTS = [
  "Product Backlog",
  "Sprint Backlog",
  "Kanban Board",
  "Definition of Done",
  "Roadmap",
  "Program Board",
  "Process map",
  "Architecture overview",
  "Metrics dashboard"
];

const MATURITY_SIGNALS = [
  "Role clarity",
  "WIP transparency",
  "Blocker transparency",
  "Decision clarity",
  "Customer feedback loop",
  "Technical quality visibility",
  "Improvement cadence",
  "Cross-team dependency visibility"
];

export const FrameworkRealityForm: React.FC<StepProps> = ({ state, updateState, onNext, onPrev }) => {
  const { frameworkReality } = state;

  const setClaimed = (claimed: string) => {
    updateState(prev => {
      prev.frameworkReality.claimedFramework = claimed;
      // Re-evaluate diagnostics immediately
      prev.frameworkReality.contradictionHints = detectFrameworkContradictions(prev.frameworkReality);
    });
  };

  const togglePractice = (item: string) => {
    updateState(prev => {
      const idx = prev.frameworkReality.observablePractices.indexOf(item);
      if (idx > -1) {
        prev.frameworkReality.observablePractices.splice(idx, 1);
      } else {
        prev.frameworkReality.observablePractices.push(item);
      }
      prev.frameworkReality.contradictionHints = detectFrameworkContradictions(prev.frameworkReality);
    });
  };

  const toggleRole = (item: string) => {
    updateState(prev => {
      const idx = prev.frameworkReality.roles.indexOf(item);
      if (idx > -1) {
        prev.frameworkReality.roles.splice(idx, 1);
      } else {
        prev.frameworkReality.roles.push(item);
      }
      prev.frameworkReality.contradictionHints = detectFrameworkContradictions(prev.frameworkReality);
    });
  };

  const toggleArtifact = (item: string) => {
    updateState(prev => {
      const idx = prev.frameworkReality.artifacts.indexOf(item);
      if (idx > -1) {
        prev.frameworkReality.artifacts.splice(idx, 1);
      } else {
        prev.frameworkReality.artifacts.push(item);
      }
      prev.frameworkReality.contradictionHints = detectFrameworkContradictions(prev.frameworkReality);
    });
  };

  const handleMaturityChange = (signal: string, val: number) => {
    updateState(prev => {
      prev.frameworkReality.maturitySignals[signal] = val;
    });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="border-b border-slate-100 pb-4">
        <h2 className="text-lg font-sans font-bold text-slate-900">Maturity Audit: Claimed vs Observable Practice reality</h2>
        <p className="text-xs text-slate-500 mt-0.5">Separate narrative compliance models from actual operations. The anomaly detector triggers warning alerts for decouplings.</p>
      </div>

      {/* SECTION A: CLAIMED FRAMEWORK */}
      <div className="p-4 bg-white border border-slate-200 rounded-lg space-y-3">
        <h3 className="text-xs font-mono uppercase tracking-wider text-slate-600 font-bold">
          Section A: Claimed Framework Configuration (Corporate Narrative)
        </h3>
        <p className="text-[11px] text-slate-500">What brand framework does the organization currently assert to follow?</p>
        
        <div className="flex flex-wrap gap-2">
          {CLAIMED_FRAMEWORKS.map(fw => (
            <button
              key={fw}
              type="button"
              onClick={() => setClaimed(fw)}
              className={`py-1.5 px-3 rounded border text-xs font-mono uppercase transition-all tracking-wider ${
                frameworkReality.claimedFramework === fw
                  ? "bg-slate-950 text-white border-slate-999 font-bold shadow-xs"
                  : "bg-white border-slate-250 text-slate-600 hover:border-slate-450 hover:bg-slate-50"
              }`}
            >
              {fw}
            </button>
          ))}
        </div>
      </div>

      {/* SECTION B: PRACTICES, ROLES & ARTIFACTS GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* PRACTICES (Section B) */}
        <div className="p-4 bg-white border border-slate-200 rounded-lg space-y-3">
          <h3 className="text-xs font-mono uppercase tracking-wider text-slate-600 font-bold border-b border-slate-150 pb-1.5">
            Section B: Observable Rituals
          </h3>
          <p className="text-[11px] text-slate-500">Select only the routines actually seen in action during the last 30 days.</p>
          <div className="space-y-1 bg-slate-50/50 p-2 rounded max-h-[280px] overflow-y-auto">
            {OBSERVABLE_PRACTICES.map(item => {
              const checked = frameworkReality.observablePractices.includes(item);
              return (
                <label 
                  key={item} 
                  className={`flex items-center gap-2 p-1.5 rounded cursor-pointer text-xs transition-colors ${
                    checked ? "bg-white text-slate-950 font-semibold" : "text-slate-500 hover:bg-white"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => togglePractice(item)}
                    className="accent-slate-900 shrink-0"
                  />
                  <span>{item}</span>
                </label>
              );
            })}
          </div>
        </div>

        {/* ROLES (Section C) */}
        <div className="p-4 bg-white border border-slate-200 rounded-lg space-y-3">
          <h3 className="text-xs font-mono uppercase tracking-wider text-slate-600 font-bold border-b border-slate-150 pb-1.5">
            Section C: Active Roles
          </h3>
          <p className="text-[11px] text-slate-500">Who acts with recognized accountability in daily delivery streams?</p>
          <div className="space-y-1 bg-slate-50/50 p-2 rounded max-h-[280px] overflow-y-auto">
            {STANDARD_ROLES.map(item => {
              const checked = frameworkReality.roles.includes(item);
              return (
                <label 
                  key={item} 
                  className={`flex items-center gap-2 p-1.5 rounded cursor-pointer text-xs transition-colors ${
                    checked ? "bg-white text-slate-950 font-semibold" : "text-slate-500 hover:bg-white"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => toggleRole(item)}
                    className="accent-slate-900 shrink-0"
                  />
                  <span>{item}</span>
                </label>
              );
            })}
          </div>
        </div>

        {/* ARTIFACTS (Section D) */}
        <div className="p-4 bg-white border border-slate-200 rounded-lg space-y-3">
          <h3 className="text-xs font-mono uppercase tracking-wider text-slate-600 font-bold border-b border-slate-150 pb-1.5">
            Section D: Active Artifacts
          </h3>
          <p className="text-[11px] text-slate-500">Which real work templates or physical boards are updated weekly?</p>
          <div className="space-y-1 bg-slate-50/50 p-2 rounded max-h-[280px] overflow-y-auto">
            {STANDARD_ARTIFACTS.map(item => {
              const checked = frameworkReality.artifacts.includes(item);
              return (
                <label 
                  key={item} 
                  className={`flex items-center gap-2 p-1.5 rounded cursor-pointer text-xs transition-colors ${
                    checked ? "bg-white text-slate-950 font-semibold" : "text-slate-500 hover:bg-white"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => toggleArtifact(item)}
                    className="accent-slate-900 shrink-0"
                  />
                  <span>{item}</span>
                </label>
              );
            })}
          </div>
        </div>
      </div>

      {/* SECTION E: MATURITY SIGNALS (Scales 1-5) */}
      <div className="p-4 bg-white border border-slate-200 rounded-lg space-y-4">
        <h3 className="text-xs font-mono uppercase tracking-wider text-slate-600 font-bold border-b border-slate-150 pb-1.5">
          Section E: Qualitative System Maturity Signals (Scale 1–5)
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {MATURITY_SIGNALS.map(signal => {
            const val = frameworkReality.maturitySignals[signal] ?? 3;
            
            return (
              <div key={signal} className="space-y-1.5 bg-slate-50/25 p-2 rounded border border-slate-100">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-sans font-medium text-slate-700">{signal}</span>
                  <span className="font-mono font-bold text-slate-900 bg-slate-100 px-1.5 rounded">{val}/5</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="5"
                  step="1"
                  value={val}
                  onChange={e => handleMaturityChange(signal, Number(e.target.value))}
                  className="w-full h-1.5 bg-slate-250 rounded-lg appearance-none cursor-pointer accent-slate-900"
                />
              </div>
            );
          })}
        </div>
      </div>

      {/* Anomaly diagnostic */}
      <ContradictionHints hints={frameworkReality.contradictionHints} />

      <div className="pt-4 border-t border-slate-100 flex justify-between">
        <button
          type="button"
          onClick={onPrev}
          className="py-2.5 px-4 bg-white border border-slate-300 hover:border-slate-500 rounded text-slate-700 font-mono text-xs uppercase tracking-wider font-semibold transition-all cursor-pointer"
        >
          Back
        </button>
        <button
          type="button"
          onClick={onNext}
          className="py-2.5 px-5 bg-slate-950 hover:bg-slate-900 text-white font-mono text-xs uppercase tracking-wider font-semibold rounded shadow-sm inline-flex items-center gap-2 transition-all cursor-pointer"
        >
          Analyze Alignment & Continue
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};


// ==========================================
// SCREEN 5: DATA SOURCES AND UPLOAD
// ==========================================
// Seed demo CSV strings to make parsing easily testable!
const DEMO_FLOW_CSV = `issue_key,issue_type,status,created_at,started_at,resolved_at,assignee_role,priority,labels,blocked_flag
S-101,Story,In Progress,2026-05-10,2026-05-12,2026-05-16,Frontend Engineer,High,payment-v2,0
S-102,Story,Resolved,2026-05-11,2026-05-14,2026-05-15,UX Specialist,Medium,onboarding,0
S-103,Bugs,Waiting on QA,2026-05-11,2026-05-15,,QA Analyst,High,checkout,1
S-104,Story,Done,2026-05-12,2526-05-13,2026-05-18,Backend Engineer,Medium,payment-v2,0
S-105,Task,Ready for Test,2026-05-14,,,,,Low,,
S-106,Story,Backlog,2026-05-15,,,,,High,,`;

export const DataSourceUploadPanel: React.FC<StepProps> = ({ state, updateState, onNext, onPrev }) => {
  const [connectJiraDummy, setConnectJiraDummy] = useState<boolean>(false);
  const [alertMsg, setAlertMsg] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      const text = evt.target?.result as string;
      processUploadedText(text, file.name);
    };
    reader.readAsText(file);
  };

  const processUploadedText = (text: string, fileName: string) => {
    let summary: UploadSummary;
    if (fileName.toLowerCase().endsWith(".json")) {
      summary = parseJsonContent(text, fileName);
    } else {
      summary = parseCsvContent(text, fileName);
    }

    updateState(prev => {
      prev.uploadSummary = summary;
    });
    setAlertMsg(`Successfully loaded local file: '${fileName}' (${summary.rowCount} rows detected).`);
  };

  const loadDemoFlowData = () => {
    processUploadedText(DEMO_FLOW_CSV, "acme_jira_export_demo.csv");
  };

  const clearUpload = () => {
    updateState(prev => {
      prev.uploadSummary = undefined;
    });
    setAlertMsg(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="border-b border-slate-100 pb-4">
        <h2 className="text-lg font-sans font-bold text-slate-900">Gather Usable Empirical Evidence</h2>
        <p className="text-xs text-slate-500 mt-0.5">Complement qualitative consultant statements with quantitative process transaction files.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* JIRA INTEGRATION & UPLOADER */}
        <div className="space-y-4">
          
          {/* Active OAuth Block (Click-Dummy) */}
          <div className="p-4 bg-white border border-slate-200 rounded-lg space-y-3">
            <h3 className="text-xs font-mono uppercase tracking-wider text-slate-600 font-bold flex items-center justify-between">
              <span>Channel: Jira Live Connector</span>
              <span className="px-1.5 py-0.5 bg-slate-100 font-mono text-[9px] text-slate-500 border rounded uppercase">
                Adapter-Ready
              </span>
            </h3>
            <p className="text-[11px] text-slate-500 leading-normal">
              Direct API tunnel retrieves real cycle-time values. Access token scopes conform to reader restrictions.
            </p>
            <div className="flex gap-2.5">
              <button
                type="button"
                onClick={() => setConnectJiraDummy(true)}
                className="py-1.5 px-3 bg-white border border-slate-300 hover:border-slate-800 text-slate-800 font-mono text-[11px] uppercase font-bold rounded transition-colors"
              >
                Connect Live Jira Instance
              </button>
            </div>
            {connectJiraDummy && (
              <div className="bg-slate-100 border border-slate-300 rounded p-3 text-[11px] font-sans text-slate-600 space-y-2 animate-fade-in">
                <p className="font-bold text-slate-800 flex items-center gap-1">
                  <Lock className="h-3 w-3 text-slate-500" />
                  Prototype Sandboxed Frame
                </p>
                <p>
                  Click-Dummy Event Triggered. Live Jira Cloud API keys or OAuth redirections are disabled in this prototype sandbox to protect access telemetry.
                </p>
                <button
                  type="button"
                  onClick={() => setConnectJiraDummy(false)}
                  className="text-[9px] text-rose-600 font-bold underline uppercase"
                >
                  Dismiss notice
                </button>
              </div>
            )}
          </div>

          {/* Local CSV/JSON file uploader */}
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg space-y-3">
            <h3 className="text-xs font-mono uppercase tracking-wider text-slate-600 font-bold flex items-center justify-between">
              <span>Channel: Local File Intake (CSV / JSON)</span>
              <span className="px-1.5 py-0.5 bg-emerald-100 font-mono text-[9px] text-emerald-800 border rounded uppercase">
                Fully Functional
              </span>
            </h3>
            <p className="text-[11px] text-slate-500 leading-normal">
              Drop an export of your JIRA backlog or sprint history. The file is processed locally within the browser; no data goes to any external servers.
            </p>

            <div className="flex flex-col sm:flex-row gap-2">
              <input
                type="file"
                accept=".csv,.json"
                onChange={handleFileUpload}
                ref={fileInputRef}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="py-2 px-3 bg-slate-900 hover:bg-slate-800 text-slate-100 font-mono text-xs uppercase font-bold rounded transition-colors inline-flex items-center gap-2 cursor-pointer shadow-xs"
              >
                <UploadCloud className="h-4 w-4" />
                Select Local File
              </button>
              <button
                type="button"
                onClick={loadDemoFlowData}
                className="py-2 px-3 bg-white border border-slate-300 hover:border-slate-800 text-slate-700 font-mono text-xs uppercase font-bold rounded transition-colors inline-flex items-center gap-1.5"
              >
                <Sparkles className="h-3.5 w-3.5" />
                Simulate JIRA CSV Ingestion
              </button>
            </div>

            <p className="text-[10px] text-slate-400">Supports comma-separated files or native JSON exports containing issue transition status details.</p>
          </div>

        </div>

        {/* METRICS & PREVIEW PANEL */}
        <div className="space-y-4">
          <div className="p-4 bg-white border border-slate-200 rounded-lg space-y-3 min-h-[300px] flex flex-col justify-between">
            <div className="space-y-2.5">
              <h3 className="text-xs font-mono uppercase tracking-wider text-slate-600 font-bold border-b border-slate-150 pb-1.5 flex items-center justify-between">
                <span>Ingested Dataset Diagnostics</span>
                {state.uploadSummary && (
                  <button 
                    onClick={clearUpload} 
                    className="text-[10px] text-rose-600 font-mono uppercase font-bold hover:underline"
                  >
                    Clear Dataset [x]
                  </button>
                )}
              </h3>

              {alertMsg && (
                <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded text-[11px] text-emerald-800 leading-normal font-sans">
                  {alertMsg}
                </div>
              )}

              {state.uploadSummary ? (
                <div className="space-y-3.5">
                  <div className="grid grid-cols-2 gap-4 bg-slate-50 p-3 rounded border border-slate-100">
                    <div>
                      <span className="text-[9px] font-mono text-slate-400 uppercase tracking-wider block">File Signature</span>
                      <span className="text-xs font-mono font-bold text-slate-800">{state.uploadSummary.fileName}</span>
                    </div>
                    <div>
                      <span className="text-[9px] font-mono text-slate-400 uppercase tracking-wider block">Rows Loaded</span>
                      <span className="text-xs font-mono font-bold text-slate-800">{state.uploadSummary.rowCount} Tasks</span>
                    </div>
                  </div>

                  {/* Header warnings */}
                  <div>
                    <span className="text-[10px] font-mono uppercase tracking-wider text-slate-500 font-bold block mb-1">
                      Mapped Standard Jira Attributes ({state.uploadSummary.detectedColumns.length})
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {state.uploadSummary.detectedColumns.slice(0, 10).map(col => (
                        <span key={col} className="px-1.5 py-0.5 bg-slate-100 text-[10px] text-slate-600 rounded font-mono">
                          {col}
                        </span>
                      ))}
                      {state.uploadSummary.detectedColumns.length > 10 && (
                        <span className="px-1.5 py-0.5 bg-slate-150 text-[10px] text-slate-400 rounded font-mono">
                          +{state.uploadSummary.detectedColumns.length - 10} more
                        </span>
                      )}
                    </div>
                  </div>

                  <div>
                    <span className="text-[10px] font-mono uppercase tracking-wider text-slate-500 font-bold block mb-1">
                      Critical Missing Flow Columns ({state.uploadSummary.missingRecommendedColumns.length})
                    </span>
                    {state.uploadSummary.missingRecommendedColumns.length > 0 ? (
                      <div className="flex flex-wrap gap-1">
                        {state.uploadSummary.missingRecommendedColumns.map(col => (
                          <span key={col} className="px-1.5 py-0.5 bg-rose-50 text-[10px] text-rose-700 border border-rose-100 rounded font-mono">
                            {col}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <span className="text-xs text-emerald-600 font-mono">✓ High structural resolution (all mapping slots saturated)!</span>
                    )}
                  </div>

                  {/* Top 5 Preview Table */}
                  <div>
                    <span className="text-[10px] font-mono uppercase tracking-wider text-slate-500 font-bold block mb-1.5">
                      First Rows Data Grid View
                    </span>
                    <div className="overflow-x-auto border border-slate-200 rounded max-h-[140px]">
                      <table className="min-w-full divide-y divide-slate-200 text-[10px]">
                        <thead className="bg-slate-50 font-mono text-slate-500 select-none">
                          <tr>
                            {state.uploadSummary.detectedColumns.slice(0, 5).map(col => (
                              <th key={col} className="px-2 py-1.5 text-left font-semibold truncate max-w-[80px]">
                                {col}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 font-mono text-slate-700">
                          {state.uploadSummary.previewRows.map((row, rIdx) => (
                            <tr key={rIdx}>
                              {state.uploadSummary?.detectedColumns.slice(0, 5).map(col => (
                                <td key={col} className="px-2 py-1.5 truncate max-w-[80px]" title={String(row[col])}>
                                  {String(row[col] ?? "-")}
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                </div>
              ) : (
                <div className="flex flex-col items-center justify-center text-center py-10 space-y-2">
                  <FileSpreadsheet className="h-8 w-8 text-slate-350" />
                  <p className="text-xs text-slate-600 font-sans font-medium">No CSV/JSON flow telemetry active in session.</p>
                  <p className="text-[10px] text-slate-400">Load sample export vectors above to evaluate the validation and diagnostic alerts.</p>
                </div>
              )}
            </div>

            <div className="text-[9px] font-mono text-slate-400 border-t border-slate-100 pt-2 flex items-center justify-between uppercase">
              <span>Telemetry Isolation Zone</span>
              <span>No Cloud Payload Injected</span>
            </div>
          </div>
        </div>

      </div>

      {/* PROCESS DESCRIPTION TEXTAREA */}
      <div className="p-4 bg-white border border-slate-200 rounded-lg space-y-3">
        <h3 className="text-xs font-mono uppercase tracking-wider text-slate-600 font-bold">
          Qualitative Process Narrative Description
        </h3>
        <p className="text-[11px] text-slate-500">
          Describe how work moves from initial request to final production deployment. Mention milestones, approvals, handovers, queues, planning limits, and regular adaptation loops.
        </p>
        <textarea
          rows={3}
          value={state.processDescription}
          onChange={e => updateState(prev => { prev.processDescription = e.target.value; })}
          placeholder="e.g. Products originate as backlog tickets. Product managers approve specs, then developers fetch issues into Sprint Backlogs. Tests run manually weekly, leading to frequent integration wait times."
          className="w-full p-2.5 border border-slate-350 rounded font-sans text-xs focus:ring-1 focus:ring-slate-900 focus:outline-none"
        />
      </div>

      {/* CONSULTANT INTERVIEW NOTES */}
      <div className="p-4 bg-white border border-slate-200 rounded-lg space-y-4">
        <h3 className="text-xs font-mono uppercase tracking-wider text-slate-600 font-bold border-b border-slate-150 pb-1">
          Supplemental Consultant Interview Notes
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-mono uppercase text-slate-500 font-semibold block">Observation Notes</label>
            <textarea
              rows={2}
              value={state.interviewNotes.observation}
              onChange={e => updateState(prev => { prev.interviewNotes.observation = e.target.value; })}
              placeholder="e.g. Observed Daily Scrum. Standup took 25 minutes, dominated by updates to Team Lead."
              className="w-full p-2 border border-slate-300 rounded text-xs font-sans focus:outline-none focus:border-slate-800"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-mono uppercase text-slate-500 font-semibold block">Customer Reported Pain Points</label>
            <textarea
              rows={2}
              value={state.interviewNotes.painPoints}
              onChange={e => updateState(prev => { prev.interviewNotes.painPoints = e.target.value; })}
              placeholder="e.g. Teams state that architectural dependencies regularly freeze sprints. Long queues before deployment."
              className="w-full p-2 border border-slate-300 rounded text-xs font-sans focus:outline-none focus:border-slate-800"
            />
          </div>
        </div>
      </div>

      <div className="pt-4 border-t border-slate-100 flex justify-between">
        <button
          type="button"
          onClick={onPrev}
          className="py-2.5 px-4 bg-white border border-slate-300 hover:border-slate-500 rounded text-slate-700 font-mono text-xs uppercase tracking-wider font-semibold transition-all cursor-pointer"
        >
          Back
        </button>
        <button
          type="button"
          onClick={onNext}
          className="py-2.5 px-5 bg-slate-950 hover:bg-slate-900 text-white font-mono text-xs uppercase tracking-wider font-semibold rounded shadow-sm inline-flex items-center gap-2 transition-all cursor-pointer"
        >
          Save Evidence Baseline
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};


// ==========================================
// SCREEN 6: PRODUCT AND WORK CONTEXT
// ==========================================
export const ProductContextForm: React.FC<StepProps> = ({ state, updateState, onNext, onPrev }) => {
  const { productContext } = state;

  const handleSlider = (dim: keyof typeof productContext, val: number) => {
    updateState(prev => {
      prev.productContext[dim] = val as any;
      // Re-trigger Cynefin assessment logic dynamically
      prev.cynefinAssessment = calculateCynefinHypothesis(prev.productContext);
    });
  };

  const setWorkTypePreset = (type: "software" | "mfg" | "incident" | "r_and_d") => {
    updateState(prev => {
      if (type === "software") {
        prev.productContext = {
          repeatability: 2,
          standardizability: 3,
          requirementUncertainty: 4,
          technicalUncertainty: 4,
          customerFeedbackDependency: 5,
          regulatoryConstraint: 2,
          errorCost: 3,
          crossTeamDependencies: 4,
          changeFrequency: 4,
          innovationShare: 4,
          operationalUrgency: 3,
          description: "New digital product development with iterative UI elements and continuous feature exploration."
        };
      } else if (type === "mfg") {
        prev.productContext = {
          repeatability: 5,
          standardizability: 5,
          requirementUncertainty: 1,
          technicalUncertainty: 1,
          customerFeedbackDependency: 1,
          regulatoryConstraint: 4,
          errorCost: 5,
          crossTeamDependencies: 2,
          changeFrequency: 1,
          innovationShare: 1,
          operationalUrgency: 2,
          description: "Standardized industrial parts production with predefined blueprints and fixed legal specs."
        };
      } else if (type === "incident") {
        prev.productContext = {
          repeatability: 1,
          standardizability: 2,
          requirementUncertainty: 5,
          technicalUncertainty: 3,
          customerFeedbackDependency: 4,
          regulatoryConstraint: 1,
          errorCost: 4,
          crossTeamDependencies: 2,
          changeFrequency: 5,
          innovationShare: 2,
          operationalUrgency: 5,
          description: "Acute crisis operations and crash incident responses under intense operational urgency."
        };
      } else {
        prev.productContext = {
          repeatability: 2,
          standardizability: 2,
          requirementUncertainty: 5,
          technicalUncertainty: 5,
          customerFeedbackDependency: 4,
          regulatoryConstraint: 2,
          errorCost: 4,
          crossTeamDependencies: 3,
          changeFrequency: 5,
          innovationShare: 5,
          operationalUrgency: 4,
          description: "Deep frontier research and experimental prototyping to explore novel technical boundaries."
        };
      }
      prev.cynefinAssessment = calculateCynefinHypothesis(prev.productContext);
    });
  };

  const dimensions = [
    { key: "repeatability", label: "Process Repeatability", desc: "How identical are incoming requests?", left: "Completely Unique", right: "Identical Routines" },
    { key: "standardizability", label: "Standardizability", desc: "Can the workflow steps be predefined?", left: "Needs Heuristics", right: "Perfect Automation" },
    { key: "requirementUncertainty", label: "Requirement Volatility", desc: "How certain are output targets?", left: "Stable / Defined", right: "Discovery / Fluid" },
    { key: "technicalUncertainty", label: "Technical Complexity", desc: "Experience with tools & pipelines?", left: "Known Path", right: "Frontier/No-Map" },
    { key: "customerFeedbackDependency", label: "Feedback Dependency", desc: "Does quality depend on active user trials?", left: "A Priori Valid", right: "Rapid Trial req." },
    { key: "regulatoryConstraint", label: "Regulatory Constraints", desc: "Impact of compliance frameworks?", left: "Zero Impact", right: "Extreme Oversight" },
    { key: "errorCost", label: "Transaction Damage Cost", desc: "Financial damage of singular process bugs?", left: "Negligible", right: "Catastrophic" },
    { key: "crossTeamDependencies", label: "Team Blockages", desc: "How isolated are delivery structures?", left: "Autonomous", right: "High Handover Network" },
    { key: "changeFrequency", label: "Pace of Environment Shifts", desc: "Speed of ambient request transitions?", left: "Static", right: "Intraday Shifts" },
    { key: "innovationShare", label: "Ecosystem Novelty", desc: "Percentage of unique/experimental code bases?", left: "Remake/Maintenance", right: "100% Pioneering" },
    { key: "operationalUrgency", label: "Operational Urgency", desc: "Response timelines demanded?", left: "Deliberative / Months", right: "Immediate / Seconds" }
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="border-b border-slate-100 pb-4 flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-sans font-bold text-slate-900">Delivery Context Variables (Sensemaking Input)</h2>
          <p className="text-xs text-slate-500 mt-0.5">Profile the underlying physics of the work. Misclassifying context leads to framework mismatches.</p>
        </div>
        <div className="flex gap-1.5 self-start">
          <button
            type="button"
            onClick={() => setWorkTypePreset("software")}
            className="py-1 px-2.5 bg-white border border-slate-200 hover:border-slate-400 rounded text-[11px] font-mono leading-none font-bold text-slate-600 transition-colors"
          >
            SaaS Preset
          </button>
          <button
            type="button"
            onClick={() => setWorkTypePreset("mfg")}
            className="py-1 px-2.5 bg-white border border-slate-200 hover:border-slate-400 rounded text-[11px] font-mono leading-none font-bold text-slate-600 transition-colors"
          >
            Mfg Preset
          </button>
          <button
            type="button"
            onClick={() => setWorkTypePreset("incident")}
            className="py-1 px-2.5 bg-white border border-slate-200 hover:border-slate-400 rounded text-[11px] font-mono leading-none font-bold text-slate-600 transition-colors"
          >
            Incident Preset
          </button>
          <button
            type="button"
            onClick={() => setWorkTypePreset("r_and_d")}
            className="py-1 px-2.5 bg-white border border-slate-200 hover:border-slate-400 rounded text-[11px] font-mono leading-none font-bold text-slate-600 transition-colors"
          >
            Frontier Preset
          </button>
        </div>
      </div>

      <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg text-xs leading-normal font-medium text-slate-700 space-y-2">
        <h4 className="text-xs font-mono uppercase tracking-wider text-slate-900 font-bold">Helper Context Guidelines:</h4>
        <ul className="list-disc pl-4 space-y-1 text-slate-600 font-normal">
          <li><strong>Clear/Complicated:</strong> Repeatable workflow segments (Clear) or expert-driven dependencies structures (Complicated). High repeatability, low instability.</li>
          <li><strong>Complex:</strong> Novel product development with high feedback loops where goals emerge iteratively. high novelty, low repetition.</li>
          <li><strong>Chaotic:</strong> Unstable, uncoordinated emergency triage where action must precede sensing.</li>
        </ul>
      </div>

      {/* RANGES LIST */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {dimensions.map(dim => {
          const val = (productContext[dim.key as keyof typeof productContext] as number) || 3;
          return (
            <div key={dim.key} className="p-3.5 bg-white border border-slate-200 rounded-lg space-y-2.5 shadow-xs">
              <div className="flex justify-between items-start gap-3">
                <div>
                  <h4 className="text-xs font-sans font-bold text-slate-800 flex items-center gap-1">
                    {dim.label}
                    <InfoTooltip content={dim.desc} />
                  </h4>
                </div>
                <span className="font-mono text-xs font-bold bg-slate-100 text-slate-800 px-2 py-0.5 rounded border border-slate-200">
                  {val} / 5
                </span>
              </div>

              <input
                type="range"
                min="1"
                max="5"
                step="1"
                value={val}
                onChange={e => handleSlider(dim.key as any, Number(e.target.value))}
                className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-slate-950"
              />

              <div className="flex justify-between text-[10px] text-slate-450 font-mono uppercase tracking-wider">
                <span>{dim.left}</span>
                <span>{dim.right}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* FREE TEXT DESCRIPTION */}
      <div className="p-4 bg-white border border-slate-200 rounded-lg space-y-3">
        <h3 className="text-xs font-mono uppercase tracking-wider text-slate-600 font-bold">
          Product deliveries & discovery context description
        </h3>
        <textarea
          rows={3}
          value={productContext.description}
          onChange={e => updateState(prev => { 
            prev.productContext.description = e.target.value; 
            prev.cynefinAssessment = calculateCynefinHypothesis(prev.productContext);
          })}
          placeholder="What does the organizational unit actually deliver? Describe the operational constraints, release timelines, and target customer profiles..."
          className="w-full p-2.5 border border-slate-300 focus:border-slate-900 rounded text-xs font-sans focus:outline-none focus:ring-1 focus:ring-slate-900 transition-all"
        />
      </div>

      <div className="pt-4 border-t border-slate-100 flex justify-between">
        <button
          type="button"
          onClick={onPrev}
          className="py-2.5 px-4 bg-white border border-slate-300 hover:border-slate-500 rounded text-slate-700 font-mono text-xs uppercase tracking-wider font-semibold transition-all cursor-pointer"
        >
          Back
        </button>
        <button
          type="button"
          onClick={onNext}
          className="py-2.5 px-5 bg-slate-950 hover:bg-slate-900 text-white font-mono text-xs uppercase tracking-wider font-semibold rounded shadow-sm inline-flex items-center gap-2 transition-all cursor-pointer"
        >
          Generate Sensemaking Matrix
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};


// ==========================================
// SCREEN 7: CYNEFIN HYPOTHESIS & OVERRIDE
// ==========================================
export const CynefinAssessmentPanel: React.FC<StepProps> = ({ state, updateState, onNext, onPrev }) => {
  const { cynefinAssessment, productContext } = state;
  const [overrideDomain, setOverrideDomain] = useState<string>("Complicated");
  const [overrideReason, setOverrideReason] = useState<string>("");
  const [isOverridden, setIsOverridden] = useState<boolean>(!!cynefinAssessment.consultantOverride);
  const [auditTrail, setAuditTrail] = useState<string[]>(
    cynefinAssessment.consultantOverride 
      ? [`Consultant changed Cynefin hypothesis to ${cynefinAssessment.consultantOverride.domain} because: "${cynefinAssessment.consultantOverride.reason}"`]
      : []
  );

  const saveOverride = () => {
    if (!overrideReason.trim()) return;

    const ts = new Date().toISOString().replace("T", " ").substring(0, 19);
    const logStr = `Consultant changed Cynefin hypothesis from '${cynefinAssessment.primaryDomain}' to '${overrideDomain}' because: "${overrideReason}" - (Timestamp: ${ts} UTC)`;

    updateState(prev => {
      prev.cynefinAssessment.consultantOverride = {
        domain: overrideDomain,
        reason: overrideReason,
        timestamp: ts
      };
    });
    setAuditTrail(prev => [...prev, logStr]);
    setIsOverridden(true);
    setOverrideReason("");
  };

  const clearOverride = () => {
    updateState(prev => {
      prev.cynefinAssessment.consultantOverride = undefined;
    });
    setIsOverridden(false);
  };

  const domainDescription = {
    Clear: { title: "Clear (Obvious)", practice: "Sense-Categorise-Respond", desc: "Stable cause-and-effect patterns easily documented. Work is highly repeatable and standardizable with low volatility." },
    Complicated: { title: "Complicated (Expertise Required)", practice: "Sense-Analyse-Respond", desc: "Multiple working paths possible. Cause and effect separated by delay; expert diagnostic mapping analysis is mandatory." },
    Complex: { title: "Complex (Emergent Constraints)", practice: "Probe-Sense-Respond", desc: "No upfront predictable mapping. Goals emerge. Small safe-to-fail experiments are required to find pathways." },
    Chaotic: { title: "Chaotic (Emergency Action)", practice: "Act-Sense-Respond", desc: "Cause and effect completely decoupled inside crisis modes. Instant authoritative alignment required to stabilize flows." },
    Mixed: { title: "Mixed (Cross Boundary)", practice: "Varies", desc: "Competing signatures. Multiple quadrants operate simultaneously or borders are blurred. High risk of systemic confusion." }
  };

  const displayedDomain = isOverridden && cynefinAssessment.consultantOverride 
    ? cynefinAssessment.consultantOverride.domain 
    : cynefinAssessment.primaryDomain;

  return (
    <div className="space-y-6 animate-fade-in text-slate-800">
      <div className="border-b border-slate-100 pb-4">
        <h2 className="text-lg font-sans font-bold text-slate-900">Cynefin Sensemaking Classification</h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Evaluate work context constraints. Cynefin-style definitions must be handled as qualitative hypotheses rather than automatic facts.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* CYNEFIN MAP VISUALIZATION */}
        <div className="lg:col-span-4 bg-slate-900 text-slate-100 rounded-lg p-4 space-y-4 shadow-md flex flex-col justify-between">
          <div>
            <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold block mb-1">
              Active Context Sensing Quadrant
            </span>
            <h3 className="text-lg font-sans font-bold text-white flex items-center gap-1.5">
              <span>{displayedDomain} Territory</span>
              {isOverridden && (
                <span className="text-[9px] bg-amber-400 text-slate-950 font-mono uppercase px-1 rounded-sm font-semibold">
                  Manual Override
                </span>
              )}
            </h3>
          </div>

          {/* Interactive Cynefin Quadrants Visual SVGs or grid maps */}
          <div className="grid grid-cols-2 gap-2 relative h-48 py-2">
            
            {/* Upper Left: Complex */}
            <div className={`border rounded p-2 transition-all flex flex-col justify-between ${
              displayedDomain === "Complex" 
                ? "bg-slate-800 border-white text-white font-semibold flex-1 scale-102 ring-1 ring-teal-400" 
                : "bg-slate-900 border-slate-800 text-slate-400"
            }`}>
              <span className="text-[9px] font-mono uppercase">COMPLEX</span>
              <span className="text-[9px] font-light leading-none">Probe - Sense - Respond</span>
              {displayedDomain === "Complex" && <Check className="h-3 w-3 self-end text-teal-400" />}
            </div>

            {/* Upper Right: Complicated */}
            <div className={`border rounded p-2 transition-all flex flex-col justify-between ${
              displayedDomain === "Complicated" 
                ? "bg-slate-800 border-white text-white font-semibold flex-1 scale-102 ring-1 ring-blue-400" 
                : "bg-slate-900 border-slate-800 text-slate-400"
            }`}>
              <span className="text-[9px] font-mono uppercase">COMPLICATED</span>
              <span className="text-[9px] font-light leading-none">Sense - Analyze - Respond</span>
              {displayedDomain === "Complicated" && <Check className="h-3 w-3 self-end text-blue-400" />}
            </div>

            {/* Bottom Left: Chaotic */}
            <div className={`border rounded p-2 transition-all flex flex-col justify-between ${
              displayedDomain === "Chaotic" 
                ? "bg-slate-800 border-white text-white font-semibold flex-1 scale-102 ring-1 ring-rose-450" 
                : "bg-slate-900 border-slate-800 text-slate-400"
            }`}>
              <span className="text-[9px] font-mono uppercase">CHAOTIC</span>
              <span className="text-[9px] font-light leading-none">Act - Sense - Respond</span>
              {displayedDomain === "Chaotic" && <Check className="h-3 w-3 self-end text-rose-450" />}
            </div>

            {/* Bottom Right: Clear */}
            <div className={`border rounded p-2 transition-all flex flex-col justify-between ${
              displayedDomain === "Clear" 
                ? "bg-slate-800 border-white text-white font-semibold flex-1 scale-102 ring-1 ring-emerald-400" 
                : "bg-slate-900 border-slate-800 text-slate-400"
            }`}>
              <span className="text-[9px] font-mono uppercase">CLEAR / SIMPLE</span>
              <span className="text-[9px] font-light leading-none">Sense - Categorize - Respond</span>
              {displayedDomain === "Clear" && <Check className="h-3 w-3 self-end text-emerald-400" />}
            </div>

            {/* CENTER: MIXED / DISORDER */}
            <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 rounded-full border flex items-center justify-center text-[8px] font-mono font-black uppercase text-center shadow-lg transition-all ${
              displayedDomain === "Mixed" 
                ? "bg-white text-slate-950 border-white ring-2 ring-amber-450 animate-pulse" 
                : "bg-slate-900 text-slate-500 border-slate-800"
            }`}>
              Mixed
            </div>

          </div>

          <div className="text-[10px] text-slate-400 font-mono text-center pt-2 border-t border-slate-850">
            {domainDescription[displayedDomain as keyof typeof domainDescription]?.practice || "Sensemaking"}
          </div>
        </div>

        {/* REASONING & COUNTER-HYPOTHESES DETAILS */}
        <div className="lg:col-span-8 space-y-4">
          
          <div className="bg-white border border-slate-200 rounded-lg p-4 space-y-3.5">
            <div className="flex justify-between items-center">
              <span className="text-xs font-mono uppercase tracking-wider text-slate-500 font-bold">
                Hypothesis Baseline Assessment ({cynefinAssessment.primaryDomain})
              </span>
              <SourceConfidenceBadge confidence={cynefinAssessment.confidence} />
            </div>

            <p className="text-xs text-slate-600 leading-normal">
              {domainDescription[cynefinAssessment.primaryDomain as keyof typeof domainDescription]?.desc}
            </p>

            {/* Reasoning points */}
            <div className="space-y-2">
              <span className="text-[10px] font-mono uppercase tracking-wider text-slate-500 font-semibold block">Sensing Engine Rationale:</span>
              <div className="space-y-1.5 text-xs text-slate-700 leading-relaxed font-sans">
                {cynefinAssessment.reasoning.map((r, i) => (
                  <div key={i} className="flex gap-2 items-start bg-slate-50 p-2 border border-slate-100 rounded">
                    <span className="mt-1 w-1.5 h-1.5 rounded-full bg-slate-950 shrink-0"></span>
                    <span>{r}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Counter hypothesis */}
            <div className="bg-rose-50 border border-rose-100 rounded p-3 space-y-1">
              <span className="text-[10px] font-mono uppercase tracking-wider text-rose-850 font-bold block">
                Counter-Hypothesis & Structural Vulnerability
              </span>
              <p className="text-xs text-rose-800 leading-relaxed">
                {cynefinAssessment.counterHypothesis}
              </p>
            </div>
            
            <div className="text-[10px] text-slate-400 font-mono leading-relaxed select-none">
              ❗ <strong>Methodological Statement:</strong> Cynefin classification is a highly structured sensemaking tool. It is not an objective absolute truth claim.
            </div>
          </div>

        </div>

      </div>

      {/* OVERRIDE CONTROLS */}
      <div className="p-4 bg-white border border-slate-200 rounded-lg space-y-4">
        <h3 className="text-xs font-mono uppercase tracking-wider text-slate-600 font-bold border-b border-slate-150 pb-1 flex items-center justify-between">
          <span>Consultant Intervention Override Controls</span>
          {isOverridden && (
            <button 
              type="button" 
              onClick={clearOverride}
              className="text-[10px] text-rose-600 font-bold uppercase underline"
            >
              Reset to Sensed Engine Result [x]
            </button>
          )}
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
          <div className="space-y-1.5">
            <label className="text-xs font-mono uppercase text-slate-500 font-semibold block">Override Domain</label>
            <select
              value={overrideDomain}
              onChange={e => setOverrideDomain(e.target.value)}
              className="w-full p-2 bg-white border border-slate-300 rounded text-xs focus:outline-none focus:border-slate-800"
            >
              <option>Clear</option>
              <option>Complicated</option>
              <option>Complex</option>
              <option>Chaotic</option>
              <option>Mixed</option>
            </select>
          </div>
          <div className="md:col-span-2 space-y-1.5">
            <label className="text-xs font-mono uppercase text-slate-500 font-semibold block">Justification Reason</label>
            <input
              type="text"
              placeholder="e.g. Teams encounter hidden APIs constraints that make outcomes non-obvious."
              value={overrideReason}
              onChange={e => setOverrideReason(e.target.value)}
              className="w-full p-2 bg-white border border-slate-300 rounded text-xs focus:outline-none focus:border-slate-800"
            />
          </div>
          <button
            type="button"
            onClick={saveOverride}
            disabled={!overrideReason.trim()}
            className="w-full p-2 bg-slate-900 hover:bg-slate-850 text-slate-100 font-mono text-xs uppercase font-bold tracking-wider rounded disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Apply Override
          </button>
        </div>

        {/* Audit trail ledger */}
        {auditTrail.length > 0 && (
          <div className="p-3 bg-slate-50 border border-slate-250 rounded font-mono text-[10px] text-slate-500 space-y-1 mb-2">
            <span className="font-bold text-slate-600 uppercase block tracking-wider">Audit Trail Ledger Entries</span>
            {auditTrail.map((entry, idx) => (
              <p key={idx} className="border-t border-slate-200/50 pt-1 leading-normal">
                {entry}
              </p>
            ))}
          </div>
        )}
      </div>

      <div className="pt-4 border-t border-slate-100 flex justify-between">
        <button
          type="button"
          onClick={onPrev}
          className="py-2.5 px-4 bg-white border border-slate-300 hover:border-slate-500 rounded text-slate-700 font-mono text-xs uppercase tracking-wider font-semibold transition-all cursor-pointer"
        >
          Back
        </button>
        <button
          type="button"
          onClick={onNext}
          className="py-2.5 px-5 bg-slate-950 hover:bg-slate-900 text-white font-mono text-xs uppercase tracking-wider font-semibold rounded shadow-sm inline-flex items-center gap-2 transition-all cursor-pointer"
        >
          Proceed to Snapshot
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};


// ==========================================
// SCREEN 8: INTERIM AUDIT SNAPSHOT (DASHBOARD)
// ==========================================
export const InterimAuditSnapshot: React.FC<StepProps> = ({ state, updateState, onPrev }) => {
  const [copiedStatus, setCopiedStatus] = useState<boolean>(false);
  const qData = calculateDataQuality(state);
  const contradictions = state.frameworkReality.contradictionHints;
  const assessment = state.cynefinAssessment;
  
  const rulesHypotheses = generateInterimHypotheses(state);
  const nextQuestions = generateMissingDataQuestions(state);

  const handleExportDummy = () => {
    setCopiedStatus(true);
    setTimeout(() => setCopiedStatus(false), 2000);
  };

  const displayedDomain = assessment.consultantOverride 
    ? assessment.consultantOverride.domain 
    : assessment.primaryDomain;

  return (
    <div className="space-y-6 animate-fade-in text-natural-text pb-10">
      <div className="border-b border-natural-border pb-4 flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-serif italic text-natural-primary">Interim Audit Snapshot</h2>
          <p className="text-xs text-natural-secondary mt-0.5">Preliminary analysis based on current intake data and rule-based qualitative inference.</p>
        </div>
        <div>
          <button
            type="button"
            onClick={handleExportDummy}
            className="py-2 px-4 bg-natural-primary hover:bg-[#4A4A38] text-white font-mono text-xs uppercase tracking-widest font-bold rounded shadow-xs transition-colors inline-flex items-center gap-1.5 cursor-pointer border-0"
          >
            {copiedStatus ? (
              <>
                <Check className="h-4 w-4 text-emerald-400" />
                Copied JSON to clipboard
              </>
            ) : (
              <>
                Confirm & Copy Snapshot JSON
              </>
            )}
          </button>
        </div>
      </div>

      {copiedStatus && (
        <div className="bg-[#4A4A38] text-[#F2F1E9] font-mono text-[10px] p-3 rounded shadow border border-natural-border/20 overflow-y-auto max-h-[150px] animate-fade-in">
          <pre>{JSON.stringify({
            auditCase: state.auditCase,
            registry: state.companyProfile,
            claimedFramework: state.frameworkReality.claimedFramework,
            observedPractices: state.frameworkReality.observablePractices,
            cynefinSensed: state.cynefinAssessment,
            derivedHypothesesCount: rulesHypotheses.length,
            suggestedNextSteps: nextQuestions.map(q => q.question)
          }, null, 2)}</pre>
        </div>
      )}

      {/* DASHBOARD GRID */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        
        {/* LEFT COLUMN: COMPANY & EVIDENCE */}
        <div className="md:col-span-4 space-y-4">
          
          {/* Company details */}
          <div className="p-4 bg-white border border-natural-border rounded-xl space-y-3 shadow-xs">
            <div className="flex justify-between items-start border-b border-natural-border/60 pb-1.5 mb-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#4A4A38] flex items-center gap-1">
                <Building2 className="h-3.5 w-3.5 text-natural-accent" />
                Company Profile
              </h3>
              <span className="px-2 py-0.5 bg-natural-sidebar text-[9px] font-bold rounded uppercase text-natural-primary">Demo Data</span>
            </div>
            
            <div className="space-y-2">
              <div className="text-xs flex justify-between">
                <span className="text-natural-secondary">Legal Name:</span>
                <span className="font-bold text-natural-primary">{state.companyProfile.name.value || "Acme Flow Systems GmbH"}</span>
              </div>
              <div className="text-xs flex justify-between">
                <span className="text-natural-secondary">HQ Country / Location:</span>
                <span className="font-semibold text-natural-text">{state.companyProfile.location?.value || "Cologne, Germany"}</span>
              </div>
              <div className="text-xs flex justify-between">
                <span className="text-natural-secondary">Industry Sector:</span>
                <span className="font-semibold text-natural-text italic">{state.companyProfile.industry?.value || "B2B SaaS / Workflow software"}</span>
              </div>
              <div className="text-xs flex justify-between">
                <span className="text-natural-secondary">Employee Count:</span>
                <span className="font-semibold text-natural-text">{state.companyProfile.employeeCount?.value || "420 employees"}</span>
              </div>
            </div>
            
            <div className="bg-natural-sidebar p-2.5 border border-natural-border rounded text-[10px] text-natural-text font-mono flex justify-between">
              <span>Scope: {state.auditCase.scopeType}</span>
              <span>People: {state.auditCase.peopleInScope || "Unspecified"}</span>
              <span>Market: Germany / EU</span>
            </div>
          </div>

          {/* Evidence Baseline state quality score */}
          <div className="p-4 bg-white border border-natural-border rounded-xl space-y-3.5 shadow-xs">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#4A4A38] border-b border-natural-border/60 pb-1.5 mb-2">
              Evidence State
            </h3>
            
            <div className="flex items-center justify-between">
              <span className="text-[11px] text-natural-secondary font-medium">Resolution Score:</span>
              <span className="text-lg font-serif italic font-bold text-natural-primary">{qData.scorePercent}%</span>
            </div>

            <div className="w-full bg-natural-sidebar rounded-full h-2 overflow-hidden">
              <div className="bg-natural-primary h-full rounded-full transition-all" style={{ width: `${qData.scorePercent}%` }}></div>
            </div>

            {/* Matrix details */}
            <div className="space-y-1.5 text-[11px] font-mono uppercase tracking-wide">
              {Object.entries(qData.matrix).slice(0, 5).map(([key, value]) => (
                <div key={key} className="flex justify-between items-center gap-2">
                  <span className="text-natural-secondary normal-case font-sans font-medium">{key}</span>
                  <DataStatusChip status={value as DataStatus} />
                </div>
              ))}
            </div>

            {qData.scorePercent < 40 && (
              <div className="p-2.5 bg-rose-50 border border-rose-100 text-rose-700 rounded text-[10px] leading-normal flex items-start gap-1">
                <AlertTriangle className="h-3.5 w-3.5 text-rose-600 shrink-0 mt-0.5" />
                <span>SPECULATIVE PROFILE: Contains low baseline evidence, relying primarily on rule approximations.</span>
              </div>
            )}
          </div>

        </div>

        {/* MIDDLE COLUMN: WORK SYSTEM & GOVERNANCE */}
        <div className="md:col-span-4 space-y-4">
          
          <div className="p-4 bg-white border border-natural-border rounded-xl space-y-3 shadow-xs min-h-[440px] flex flex-col justify-between">
            <div className="space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#4A4A38] border-b border-natural-border/60 pb-1.5 mb-2">
                Work System Reality
              </h3>

              <div className="text-xs bg-natural-sidebar p-2.5 rounded border border-natural-border font-mono text-center font-bold text-natural-primary">
                CLAIMED FRAMEWORK: {state.frameworkReality.claimedFramework.toUpperCase()}
              </div>

              {/* Observed Density counts */}
              <div className="grid grid-cols-2 gap-2 text-center text-[10px] font-mono uppercase">
                <div className="bg-natural-sidebar/50 border border-natural-border p-2 rounded">
                  <span className="text-natural-secondary block text-[9px] mb-1 font-bold">Routines</span>
                  <span className="text-xs font-bold text-natural-primary">{state.frameworkReality.observablePractices.length} active</span>
                </div>
                <div className="bg-natural-sidebar/50 border border-natural-border p-2 rounded">
                  <span className="text-natural-secondary block text-[9px] mb-1 font-bold">Roles & Artifacts</span>
                  <span className="text-xs font-bold text-natural-primary">{state.frameworkReality.roles.length + state.frameworkReality.artifacts.length} active</span>
                </div>
              </div>

              {/* Contradictions indicators */}
              <div className="space-y-1.5">
                <span className="text-[10px] font-mono uppercase tracking-widest text-natural-secondary font-bold block">System Dynamics Diagnostics</span>
                {contradictions.length > 0 ? (
                  <div className="space-y-1.5 text-xs text-rose-700 leading-normal font-sans">
                    {contradictions.slice(0, 2).map((c, idx) => (
                      <div key={idx} className="bg-rose-50 border border-rose-100 p-2.5 rounded flex gap-1.5 items-start">
                        <AlertTriangle className="h-3.5 w-3.5 shrink-0 text-rose-600 mt-0.5" />
                        <span>{c}</span>
                      </div>
                    ))}
                    {contradictions.length > 2 && (
                      <span className="text-[10px] text-rose-650 font-mono uppercase block text-right font-semibold">+{contradictions.length - 2} anomalies flagged</span>
                    )}
                  </div>
                ) : (
                  <div className="p-2 bg-emerald-50 border border-emerald-100 text-emerald-800 text-xs rounded font-medium flex gap-1.5 items-center">
                    <CheckCircle className="h-4 w-4 text-emerald-600 shrink-0" />
                    <span>No structural contradictions detected in current claims.</span>
                  </div>
                )}
              </div>
            </div>

            {/* Maturity signals indicators */}
            <div className="border-t border-natural-border/60 pt-3">
              <span className="text-[10px] font-mono uppercase tracking-widest text-natural-secondary font-bold block mb-2">Maturity Signals</span>
              <div className="space-y-1.5 max-h-[160px] overflow-y-auto">
                {Object.entries(state.frameworkReality.maturitySignals).map(([key, val]) => (
                  <div key={key} className="flex items-center justify-between text-[11px] font-sans">
                    <span className="text-natural-text truncate mr-2 font-medium">{key}</span>
                    <div className="flex gap-0.5">
                      {[1, 2, 3, 4, 5].map(step => (
                        <span 
                          key={step} 
                          className={`w-2 h-2 rounded-full ${step <= (val as number) ? "bg-[#5A5A40]" : "bg-[#E6E1D6]"}`} 
                        />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

        </div>

        {/* RIGHT COLUMN: CYNEFIN MAP */}
        <div className="md:col-span-4 space-y-4">
          
          <div className="p-5 bg-natural-primary text-white rounded-xl space-y-3.5 shadow-xs min-h-[440px] flex flex-col justify-between">
            <div className="space-y-1">
              <span className="text-[10px] font-mono uppercase tracking-widest text-[#F2F1E9]/80 font-bold block leading-none">
                Cynefin Hypothesis
              </span>
              <h3 className="text-3xl font-serif italic text-white flex justify-between items-center">
                <span>{displayedDomain}</span>
                <span className="text-[9px] font-mono tracking-widest uppercase py-0.5 px-2 bg-white/10 rounded border border-white/15">Sensed</span>
              </h3>
            </div>

            {/* Sensed hypothesis reason */}
            <div className="bg-[#4A4A38]/70 p-3 rounded-lg border border-white/10 text-xs leading-relaxed font-sans space-y-2 text-[#F2F1E9]">
              <p className="font-semibold text-white">Analysis Basis:</p>
              <p className="text-[11px] font-light">
                {assessment.reasoning[0] || "High uncertainty and high cross-team interdependencies suggest discovery-based agile delivery models."}
              </p>
              <div className="text-[10px] text-[#A67C52] font-semibold tracking-wider font-sans uppercase">
                Confidence Factor: {assessment.confidence.toUpperCase()}
              </div>
            </div>

            {/* Counter hypothesis card */}
            <div className="bg-[#A67C52]/20 p-3 rounded-lg border border-[#A67C52]/30 text-[11px] font-sans leading-relaxed text-[#FDFBF7]">
              <span className="text-[9px] font-mono uppercase tracking-widest text-amber-200 font-bold block mb-1">Vulnerability Risk Vector</span>
              {assessment.counterHypothesis || "Over-indexing on rigid framework compliance risks decoupling teams from real user feedback loops."}
            </div>

            <div className="border-t border-white/10 pt-3 text-[10px] text-[#F2F1E9]/60 font-mono text-center leading-none">
              Treated as conceptual sensemaking indicator.
            </div>
          </div>

        </div>

      </div>

      {/* LOWER SECTION: AI DERIVED HYPOTHESES CARDS */}
      <div className="space-y-4">
        <h3 className="text-sm font-mono uppercase tracking-widest text-natural-primary font-bold border-l-2 border-[#5A5A40] pl-2">
          AI Derived Interim Core Hypotheses ({rulesHypotheses.length})
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {rulesHypotheses.map(hyp => {
            return (
              <div key={hyp.id} className="bg-white border border-natural-border rounded-xl p-4 space-y-3 shadow-xs flex flex-col justify-between">
                <div className="space-y-2">
                  <div className="flex justify-between items-start gap-3">
                    <span className="text-xs font-serif font-bold text-natural-primary leading-tight">
                      {hyp.title}
                    </span>
                    <SourceConfidenceBadge confidence={hyp.confidence} />
                  </div>
                  <p className="text-xs text-natural-text leading-relaxed font-sans font-light">
                    {hyp.hypothesis}
                  </p>
                </div>

                <div className="mt-2.5 pt-2.5 border-t border-natural-border/60 text-[10px] text-natural-secondary font-sans space-y-1.5">
                  <div>
                    <strong className="font-mono text-[9px] uppercase tracking-wider text-natural-primary block leading-none mb-1">Empirical Evidence Basis:</strong>
                    <ul className="list-disc pl-3 text-[10px] text-natural-text space-y-0.5">
                      {hyp.basis.map((b, i) => (
                        <li key={i}>{b}</li>
                      ))}
                    </ul>
                  </div>
                  <div className="bg-natural-sidebar/50 p-2 rounded text-[10px] font-sans border border-natural-border/60 leading-normal">
                    <span className="font-bold font-mono text-[8px] uppercase tracking-widest block text-natural-accent leading-none mb-1">Limitation Boundary:</span>
                    {hyp.limitation}
                  </div>
                  <div className="text-[10px] text-natural-primary font-medium">
                    <span className="font-mono text-[9px] uppercase tracking-wider text-[#A67C52] block leading-none mb-0.5">Next Validation Step:</span>
                    {hyp.nextValidationStep}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* NEXT QUESTIONS ENGINE */}
      <div className="p-4 bg-white border border-natural-border rounded-xl space-y-3 shadow-xs">
        <h3 className="text-xs font-mono uppercase tracking-widest text-natural-primary font-bold border-b border-natural-border pb-1.5 flex items-center gap-1.5">
          <HelpCircle className="h-4 w-4 text-natural-accent" />
          Rule-Based Diagnostic Next Discovery Questions ({nextQuestions.length})
        </h3>
        <p className="text-[11px] text-natural-secondary leading-none">
          Answer the following gaps detected in your active intake file to graduate this case to a fully decision-ready stage.
        </p>

        <div className="space-y-3 pt-1.5 column-count-1 lg:column-count-2 gap-4">
          {nextQuestions.map((q) => {
            const badgeColor = {
              high: "bg-rose-50 text-rose-800 border-rose-200",
              medium: "bg-[#A67C52]/10 text-natural-accent border-[#A67C52]/20",
              low: "bg-natural-sidebar text-natural-secondary border-natural-border"
            }[q.priority];

            return (
              <div key={q.id} className="p-3.5 bg-natural-sidebar/30 border border-natural-border rounded-lg space-y-2 flex flex-col justify-between break-inside-avoid shadow-xs">
                <div className="space-y-1">
                  <div className="flex justify-between items-center gap-2">
                    <span className="text-[9px] font-mono uppercase text-natural-secondary tracking-widest">Required Segment: {q.requiredFor}</span>
                    <span className={`px-1.5 py-0.2 rounded text-[8px] font-mono uppercase border font-bold ${badgeColor}`}>
                      {q.priority} PRIORITY
                    </span>
                  </div>
                  <h4 className="text-xs font-serif font-bold text-natural-primary leading-snug">
                    {q.question}
                  </h4>
                </div>
                <div className="text-[10px] text-natural-text leading-relaxed font-sans pt-1 border-t border-natural-border/50">
                  <strong className="font-semibold text-natural-accent">Rationale Gaps:</strong> {q.reason}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="pt-4 border-t border-natural-border flex justify-between">
        <button
          type="button"
          onClick={onPrev}
          className="py-2.5 px-4 bg-white border border-natural-border hover:bg-natural-sidebar rounded text-natural-primary font-mono text-xs uppercase tracking-wider font-semibold transition-all cursor-pointer"
        >
          Back
        </button>
      </div>

    </div>
  );
};
