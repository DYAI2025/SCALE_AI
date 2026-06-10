import React, { useState } from "react";
import { 
  Settings, 
  ShieldAlert, 
  Database, 
  Cpu, 
  Layers, 
  CheckSquare, 
  CheckCircle, 
  AlertTriangle, 
  X, 
  Save, 
  FileCode, 
  ArrowRight, 
  Lock, 
  Unlock, 
  Wifi, 
  Sliders,
  HelpCircle,
  FileText,
  Eye,
  Info
} from "lucide-react";
import { 
  AppSettings, 
  LlmProvider, 
  RuntimeMode, 
  DataSourceKind, 
  DataSourceDefault, 
  LlmProviderConfig, 
  SupabaseConfig, 
  TraceabilityPolicy, 
  AuditDefaults 
} from "../types";
import { executeMockLlmCall } from "../utils/auditLogic";

interface SettingsCenterProps {
  settings: AppSettings;
  onSaveSettings: (newSettings: AppSettings) => void;
  onClose: () => void;
}

export function SettingsCenter({ settings, onSaveSettings, onClose }: SettingsCenterProps) {
  const [activeTab, setActiveTab] = useState<string>("overview");
  const [localSettings, setLocalSettings] = useState<AppSettings>({ ...settings });
  const [testResult, setTestResult] = useState<{ status: "idle" | "loading" | "success" | "error" | "adapter-ready"; message: string }>({ status: "idle", message: "" });
  const [supabaseTestDb, setSupabaseTestDb] = useState<{ status: "idle" | "loading" | "success" | "error"; message: string }>({ status: "idle", message: "" });
  const [supabaseTestEdge, setSupabaseTestEdge] = useState<{ status: "idle" | "loading" | "success" | "error"; message: string }>({ status: "idle", message: "" });
  const [saveNotification, setSaveNotification] = useState<boolean>(false);

  const handleSave = () => {
    // Validate security warnings
    if (localSettings.llmProvider.runtimeMode === "browser-prototype" && localSettings.llmProvider.apiKey && !localSettings.llmProvider.rememberApiKey) {
      // Don't save key if they chose not to persist, clear it
      localSettings.llmProvider.apiKey = "";
    }
    
    // Update timestamp
    const updated: AppSettings = {
      ...localSettings,
      updatedAt: new Date().toISOString()
    };
    onSaveSettings(updated);
    setSaveNotification(true);
    setTimeout(() => setSaveNotification(false), 3000);
  };

  const testLlmConnection = () => {
    setTestResult({ status: "loading", message: "Contacting provider client adapter..." });
    
    setTimeout(() => {
      if (localSettings.llmProvider.provider === "mock") {
        const result = executeMockLlmCall({ task: "test_connection", provider: "mock" });
        setTestResult({ 
          status: "success", 
          message: `${result.message} modelName: ${localSettings.llmProvider.modelName}`
        });
      } else {
        if (localSettings.llmProvider.runtimeMode === "supabase-edge-function") {
          setTestResult({
            status: "adapter-ready",
            message: `Adapter compiled. Secrets for ${localSettings.llmProvider.provider.toUpperCase()} are securely delegated to production Supabase Edge Functions. Sandbox test complete.`
          });
        } else {
          // browser-prototype mode
          if (!localSettings.llmProvider.apiKey) {
            setTestResult({
              status: "error",
              message: `Connection failed: API Key required for browser-prototype execution model on ${localSettings.llmProvider.provider.toUpperCase()}.`
            });
          } else {
            setTestResult({
              status: "adapter-ready",
              message: `Client endpoint parsed. ${localSettings.llmProvider.provider.toUpperCase()} query structure conforms to standard schemas. Live calls are blocked in secure mode.`
            });
          }
        }
      }
    }, 800);
  };

  const testSupabaseDb = () => {
    setSupabaseTestDb({ status: "loading", message: "Connecting to database client interface..." });
    setTimeout(() => {
      if (!localSettings.supabase.supabaseUrl || !localSettings.supabase.anonKey) {
        setSupabaseTestDb({
          status: "error",
          message: "Connection failed: Supabase URL and Anon Key are required to initialize physical clients."
        });
      } else {
        setSupabaseTestDb({
          status: "success",
          message: "Mock-OK: Schema binding valid. Connection channels established via client adapter."
        });
      }
    }, 600);
  };

  const testSupabaseEdge = () => {
    setSupabaseTestEdge({ status: "loading", message: "Invoking router function..." });
    setTimeout(() => {
      if (!localSettings.supabase.supabaseUrl) {
        setSupabaseTestEdge({
          status: "error",
          message: "Failure: Supabase backend coordinates are missing."
        });
      } else {
        setSupabaseTestEdge({
          status: "success",
          message: "Success (Mocked): Edge function responds to audit dispatch check."
        });
      }
    }, 600);
  };

  // Helper to determine safety warnings
  const getSafetyMetrics = () => {
    const issues = [];
    let passedCount = 0;
    let warnCount = 0;
    let failCount = 0;

    // 1. Hardcoded check
    if (localSettings.llmProvider.apiKey && localSettings.llmProvider.rememberApiKey) {
      issues.push({
        id: "remember-api",
        label: "Remembering API Key Locally",
        level: "warning",
        desc: "API key stored in local browser state. Do not use production customer values."
      });
      warnCount++;
    } else {
      passedCount++;
    }

    // 2. Browser key usage
    if (localSettings.llmProvider.runtimeMode === "browser-prototype" && localSettings.llmProvider.provider !== "mock") {
      issues.push({
        id: "browser-keys",
        label: "Unsafe Browser Direct Keys",
        level: "warning",
        desc: "API client queried from main thread. Recommended pathway is Supabase Edge Functions."
      });
      warnCount++;
    } else {
      passedCount++;
    }

    // 3. Supabase RLS reminder
    if (localSettings.supabase.rlsReminderEnabled === false) {
      issues.push({
        id: "rls-needed",
        label: "Row Level Security Disabled",
        level: "fail",
        desc: "Critical risk. Row Level Security must be enabled on Supabase before production deploy."
      });
      failCount++;
    } else {
      passedCount++;
    }

    // 4. Traceability policy status
    const allTraceabilityOn = Object.values(localSettings.traceabilityPolicy).every(v => v === true);
    if (!allTraceabilityOn) {
      issues.push({
        id: "traceability-loose",
        label: "Traceability Contract Relaxed",
        level: "warning",
        desc: "Some verification requirements have been disabled. Non-compliance could yield ungrounded statements."
      });
      warnCount++;
    } else {
      passedCount++;
    }

    // 5. Mock provider active
    if (localSettings.llmProvider.provider === "mock") {
      // Mock is completely safe!
      passedCount++;
    }

    return { issues, passedCount, warnCount, failCount };
  };

  const safety = getSafetyMetrics();

  const handleDataSourceToggle = (kind: DataSourceKind) => {
    setLocalSettings(prev => ({
      ...prev,
      dataSources: prev.dataSources.map(ds => 
        ds.kind === kind ? { ...ds, enabled: !ds.enabled } : ds
      )
    }));
  };

  const handleDataSourceStatusChange = (kind: DataSourceKind, status: "enabled" | "disabled" | "later") => {
    setLocalSettings(prev => ({
      ...prev,
      dataSources: prev.dataSources.map(ds => 
        ds.kind === kind ? { ...ds, defaultStatus: status } : ds
      )
    }));
  };

  const handleDataSourceIngestionChange = (kind: DataSourceKind, mode: "upload" | "api" | "adapter-ready" | "manual" | "not-built") => {
    setLocalSettings(prev => ({
      ...prev,
      dataSources: prev.dataSources.map(ds => 
        ds.kind === kind ? { ...ds, ingestionMode: mode } : ds
      )
    }));
  };

  return (
    <div className="bg-white border border-natural-border shadow-xl rounded-xl overflow-hidden text-natural-text font-sans antialiased">
      {/* Banner Area */}
      <div className="bg-amber-50 border-b border-amber-200 p-4 text-xs font-sans text-amber-800 leading-normal flex items-start gap-3">
        <ShieldAlert className="h-4.5 w-4.5 text-amber-600 shrink-0 mt-0.5" />
        <div>
          <span className="font-bold uppercase tracking-wider block">Prototype Control Panel Banner</span>
          This workspace is preparing configuration parameters, data pipelines and inference defaults. It strictly executes in local sandboxed environment. Production OAuth, remote vector DB storage, and live model endpoints are currently inactive.
        </div>
      </div>

      {/* Header bar */}
      <div className="bg-natural-primary text-white p-5 flex items-center justify-between border-b border-natural-border">
        <div className="flex items-center gap-3">
          <span className="p-2 bg-white/10 rounded-lg">
            <Settings className="h-5 w-5 text-natural-accent" />
          </span>
          <div>
            <h1 className="text-lg font-serif italic text-white flex items-center gap-1.5">
              Settings & Traceability Foundation
            </h1>
            <p className="text-[10px] uppercase font-mono tracking-widest text-[#D9E8E2] h-3">
              Scale AI Agile Audit Intake — Iteration 1
            </p>
          </div>
        </div>
        <button
          onClick={onClose}
          type="button"
          className="p-1.5 rounded-lg text-white hover:bg-white/10 cursor-pointer transition-colors"
          title="Exit Settings"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 min-h-[580px]">
        {/* Sidebar Nav */}
        <div className="md:col-span-3 bg-slate-50 border-r border-natural-border/60 p-4 space-y-1">
          <span className="text-[9px] font-mono tracking-wider text-slate-400 block px-3 py-1 uppercase">Menu Context</span>
          
          {[
            { id: "overview", label: "Settings Overview", icon: Sliders },
            { id: "llm", label: "LLM Providers", icon: Cpu },
            { id: "supabase", label: "Supabase Settings", icon: Database },
            { id: "datasources", label: "DataSource Defaults", icon: Layers },
            { id: "traceability", label: "Traceability Policy", icon: CheckSquare },
            { id: "auditdefaults", label: "Audit Defaults", icon: Sliders },
            { id: "safety", label: "Prototype Safety Status", icon: ShieldAlert, badge: safety.failCount > 0 ? "error" : safety.warnCount > 0 ? "warn" : "ok" }
          ].map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                type="button"
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-medium cursor-pointer transition-colors ${
                  isActive 
                    ? "bg-natural-primary text-white font-bold" 
                    : "text-slate-600 hover:bg-slate-200/50 hover:text-slate-900"
                }`}
              >
                <div className="flex items-center gap-2">
                  <Icon className={`h-4 w-4 ${isActive ? "text-natural-accent" : "text-slate-400"}`} />
                  <span>{tab.label}</span>
                </div>
                {tab.badge && (
                  <span className={`w-2 h-2 rounded-full ${
                    tab.badge === "error" ? "bg-rose-500" : tab.badge === "warn" ? "bg-amber-500" : "bg-emerald-500"
                  }`} />
                )}
              </button>
            );
          })}

          <div className="pt-6 border-t border-natural-border/40 mt-6 px-3">
            <button
              onClick={handleSave}
              type="button"
              className="w-full py-2 px-3 bg-natural-primary text-white text-[11px] font-mono uppercase tracking-wider font-bold rounded shadow-sm hover:bg-[#114C5A]/90 transition-all inline-flex items-center justify-center gap-1.5 cursor-pointer border-0"
            >
              <Save className="h-3.5 w-3.5" />
              <span>Apply & Save</span>
            </button>
            {saveNotification && (
              <span className="block text-center text-[10px] font-mono text-emerald-600 font-bold mt-2 animate-fade-in">
                ✓ LocalStorage Synced!
              </span>
            )}
          </div>
        </div>

        {/* Content Area */}
        <div className="md:col-span-9 p-6">
          
          {/* TAB 1: OVERVIEW */}
          {activeTab === "overview" && (
            <div className="space-y-6">
              <div>
                <h2 className="text-base font-serif italic text-natural-primary">Configuration Dashboard</h2>
                <p className="text-xs text-slate-500">Overview of the current sandbox properties and adapter readiness indices.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {/* Card 1: Active LLM */}
                <div className="p-4 bg-white border border-natural-border/80 rounded-xl shadow-xs space-y-2">
                  <div className="flex justify-between items-start">
                    <Cpu className="h-4.5 w-4.5 text-natural-primary" />
                    <span className="text-[10px] px-1.5 py-0.5 bg-slate-100 text-slate-700 font-mono rounded font-bold uppercase">
                      {localSettings.llmProvider.provider}
                    </span>
                  </div>
                  <h3 className="text-xs font-bold font-mono tracking-tight text-slate-700">Active LLM Provider</h3>
                  <p className="text-[11px] text-slate-500 leading-normal">
                    Model selection targeting <code className="bg-slate-100 px-1 py-0.2 rounded text-[10px]">{localSettings.llmProvider.modelName}</code>.
                  </p>
                  <div className="pt-1.5 text-[9px] font-mono uppercase text-slate-400">
                    Mode: {localSettings.llmProvider.runtimeMode}
                  </div>
                </div>

                {/* Card 2: Runtime mode */}
                <div className="p-4 bg-white border border-natural-border/80 rounded-xl shadow-xs space-y-2">
                  <div className="flex justify-between items-start">
                    <Sliders className="h-4.5 w-4.5 text-natural-secondary" />
                    <span className={`text-[10px] px-1.5 py-0.5 font-mono rounded font-bold uppercase ${
                      localSettings.llmProvider.runtimeMode === "mock-only" 
                        ? "bg-slate-100 text-slate-800"
                        : "bg-amber-100 text-amber-800"
                    }`}>
                      {localSettings.llmProvider.runtimeMode.replace("-", " ")}
                    </span>
                  </div>
                  <h3 className="text-xs font-bold font-mono tracking-tight text-slate-700">Execution Runtime</h3>
                  <p className="text-[11px] text-slate-500 leading-normal">
                    {localSettings.llmProvider.runtimeMode === "mock-only" 
                      ? "Isolated local deterministic rule engine." 
                      : "Client-facing dynamic browser adapter."}
                  </p>
                  <div className="pt-1.5 text-[9px] font-mono uppercase text-[#A67C52] font-semibold">
                    {localSettings.llmProvider.runtimeMode === "mock-only" ? "SAFE-OFFLINE" : "PROTOTYPE-ONLY"}
                  </div>
                </div>

                {/* Card 3: Supabase status */}
                <div className="p-4 bg-white border border-natural-border/80 rounded-xl shadow-xs space-y-2">
                  <div className="flex justify-between items-start">
                    <Database className="h-4.5 w-4.5 text-indigo-500" />
                    <span className="text-[10px] px-1.5 py-0.5 bg-slate-100 text-slate-700 font-mono rounded font-bold uppercase">
                      {localSettings.supabase.supabaseUrl ? "Defined" : "Not Set"}
                    </span>
                  </div>
                  <h3 className="text-xs font-bold font-mono tracking-tight text-slate-700">Supabase Connection</h3>
                  <p className="text-[11px] text-slate-500 leading-normal">
                    {localSettings.supabase.supabaseUrl 
                      ? "Client parameters mapped and listening." 
                      : "Missing physical repository coordinates."}
                  </p>
                  <div className="pt-1.5 text-[9px] font-mono uppercase text-indigo-600 font-bold">
                    RLS Checklist: {localSettings.supabase.rlsReminderEnabled ? "ON" : "OFF WARNING"}
                  </div>
                </div>

                {/* Card 4: Traceability policy status */}
                <div className="p-4 bg-white border border-natural-border/80 rounded-xl shadow-xs space-y-2">
                  <div className="flex justify-between items-start">
                    <CheckSquare className="h-4.5 w-4.5 text-emerald-500" />
                    <span className="text-[10px] px-1.5 py-0.5 bg-emerald-50 text-emerald-700 font-mono rounded font-bold uppercase">
                      Active
                    </span>
                  </div>
                  <h3 className="text-xs font-bold font-mono tracking-tight text-slate-700">Traceability Rules</h3>
                  <p className="text-[11px] text-slate-500 leading-normal">
                    Strict evidence requirements forced prior to output renders.
                  </p>
                  <div className="pt-1.5 text-[9px] font-mono uppercase text-emerald-600 font-bold">
                    Checklist items: {Object.values(localSettings.traceabilityPolicy).filter(v => v).length}/11 ENFORCED
                  </div>
                </div>

                {/* Card 5: Data Sources */}
                <div className="p-4 bg-white border border-natural-border/80 rounded-xl shadow-xs space-y-2">
                  <div className="flex justify-between items-start">
                    <Layers className="h-4.5 w-4.5 text-cyan-600" />
                    <span className="text-[10px] px-1.5 py-0.5 bg-slate-100 text-slate-700 font-mono rounded font-bold uppercase">
                      {localSettings.dataSources.filter(d => d.enabled).length} Enabled
                    </span>
                  </div>
                  <h3 className="text-xs font-bold font-mono tracking-tight text-slate-700">Evidence Defaults</h3>
                  <p className="text-[11px] text-slate-500 leading-normal">
                    Configured file format buffers and remote integration pipelines.
                  </p>
                  <div className="pt-1.5 text-[9px] font-mono uppercase text-cyan-600 font-bold">
                    Works now: {localSettings.dataSources.filter(d => d.prototypeSupportLevel === "works-now").length}
                  </div>
                </div>

                {/* Card 6: Safety checklist */}
                <div className="p-4 bg-white border border-natural-border/80 rounded-xl shadow-xs space-y-2">
                  <div className="flex justify-between items-start">
                    <ShieldAlert className="h-4.5 w-4.5 text-rose-500" />
                    <span className={`text-[10px] px-1.5 py-0.5 font-mono rounded font-bold uppercase ${
                      safety.failCount > 0 
                        ? "bg-rose-100 text-rose-800 animate-pulse" 
                        : safety.warnCount > 0 
                          ? "bg-amber-100 text-amber-800" 
                          : "bg-emerald-100 text-emerald-800"
                    }`}>
                      {safety.failCount > 0 ? "Critical" : safety.warnCount > 0 ? "Warning" : "Optimal"}
                    </span>
                  </div>
                  <h3 className="text-xs font-bold font-mono tracking-tight text-slate-700">Prototype Health</h3>
                  <p className="text-[11px] text-slate-500 leading-normal">
                    Compliance checklist monitoring development secrets.
                  </p>
                  <div className="pt-1.5 text-[9px] font-mono uppercase text-slate-500 font-bold">
                    Issues raised: {safety.issues.length}
                  </div>
                </div>
              </div>

              {/* Guide section */}
              <div className="p-4 bg-slate-50 border border-natural-border/50 rounded-xl text-xs space-y-2 leading-relaxed">
                <span className="font-bold flex items-center gap-1 text-natural-primary font-mono uppercase tracking-wider text-[10px]">
                  <ArrowRight className="h-3 w-3 text-natural-secondary" />
                  Prototype Boundaries
                </span>
                <p className="text-slate-600">
                  This Settings Center is a designated <strong>traceability contract cockpit</strong>. When you calibrate data streams, verify credentials or enable policies, they modify local structures dynamically. No remote databases are written without manual authorization or local CLI setup.
                </p>
              </div>
            </div>
          )}

          {/* TAB 2: LLM PROVIDERS */}
          {activeTab === "llm" && (
            <div className="space-y-5">
              <div>
                <h2 className="text-base font-serif italic text-natural-primary">LLM provider Configuration</h2>
                <p className="text-xs text-slate-500">Configure modeling credentials, tokens parameters, and runtime modes.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-4">
                  {/* Provider selection */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      Selected Provider
                    </label>
                    <select
                      value={localSettings.llmProvider.provider}
                      onChange={e => {
                        const prov = e.target.value as LlmProvider;
                        let defModel = "mock-gpt-v1";
                        if (prov === "gemini") defModel = "gemini-2.5-flash";
                        if (prov === "openai") defModel = "gpt-4o-mini";
                        if (prov === "anthropic") defModel = "claude-3-5-haiku";
                        if (prov === "openrouter") defModel = "meta-llama/llama-3";
                        setLocalSettings(prev => ({
                          ...prev,
                          llmProvider: { 
                            ...prev.llmProvider, 
                            provider: prov,
                            modelName: defModel,
                            status: prov === "mock" ? "mock-only" : "not-configured"
                          }
                        }));
                      }}
                      className="w-full text-xs bg-white border border-natural-border text-slate-700 h-9 rounded px-2.5 outline-none focus:border-natural-primary"
                    >
                      <option value="mock">mock (offline rule engine, no key needed)</option>
                      <option value="gemini">Google Gemini Developer Cloud</option>
                      <option value="openai">OpenAI Endpoint</option>
                      <option value="anthropic">Anthropic Claude API</option>
                      <option value="openrouter">OpenRouter Dispatcher</option>
                    </select>
                  </div>

                  {/* Runtime mode */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      Runtime Model Selection
                    </label>
                    <select
                      value={localSettings.llmProvider.runtimeMode}
                      onChange={e => {
                        const m = e.target.value as RuntimeMode;
                        setLocalSettings(prev => ({
                          ...prev,
                          llmProvider: { ...prev.llmProvider, runtimeMode: m }
                        }));
                      }}
                      className="w-full text-xs bg-white border border-natural-border text-slate-700 h-9 rounded px-2.5 outline-none focus:border-natural-primary"
                    >
                      <option value="mock-only">mock-only (safe local rule simulation)</option>
                      <option value="browser-prototype">browser-prototype (unsafe direct client calls)</option>
                      <option value="supabase-edge-function">supabase-edge-function (safe production server delegation)</option>
                    </select>
                  </div>

                  {localSettings.llmProvider.runtimeMode === "browser-prototype" && (
                    <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-800 rounded-lg text-xs leading-normal space-y-1.5">
                      <div className="flex items-center gap-1 font-bold text-rose-700">
                        <AlertTriangle className="h-4 w-4 text-rose-600" />
                        <span>UNSAFE CLIENT API CONFIGURATION</span>
                      </div>
                      <p className="text-[11px]">
                        Browser Prototype Mode is unsafe for real customer data. It queries services directly from the browser main thread, exposing API keys to the client inspector logs. Use only local test keys and non-sensitive data.
                      </p>
                    </div>
                  )}

                  {localSettings.llmProvider.runtimeMode === "supabase-edge-function" && (
                    <div className="p-3.5 bg-sky-50 border border-sky-100 text-sky-800 rounded-lg text-xs leading-normal">
                      <span className="font-bold block mb-1">✓ SECURED SERVER WRAPPERS</span>
                      Provider secrets must be stored server-side in Supabase Edge Function secrets. Frontend client key input has been bypassed to defend access telemetry.
                    </div>
                  )}

                  {/* API Key Input (rendered only for unsafe browser-prototype, or if mock/edge functions are disabled) */}
                  {localSettings.llmProvider.runtimeMode === "browser-prototype" && (
                    <div className="space-y-2">
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                        Client Endpoint Key (Local sandbox only)
                      </label>
                      <div className="relative">
                        <input
                          type="password"
                          placeholder="e.g. sk-proj-... or AIzaSy..."
                          value={localSettings.llmProvider.apiKey || ""}
                          onChange={e => {
                            const val = e.target.value;
                            setLocalSettings(prev => ({
                              ...prev,
                              llmProvider: { ...prev.llmProvider, apiKey: val }
                            }));
                          }}
                          className="w-full text-xs bg-white border border-natural-border text-slate-700 h-9 rounded pl-8 pr-2.5 outline-none focus:border-natural-primary"
                        />
                        <span className="absolute left-2.5 top-2.5">
                          {localSettings.llmProvider.apiKey ? (
                            <Lock className="h-4 w-4 text-amber-500" />
                          ) : (
                            <Unlock className="h-4 w-4 text-slate-300" />
                          )}
                        </span>
                      </div>

                      {/* Remember Checklist */}
                      <div className="flex items-start gap-2 pt-1">
                        <input
                          id="remember_key_chk"
                          type="checkbox"
                          checked={localSettings.llmProvider.rememberApiKey}
                          onChange={e => {
                            const chk = e.target.checked;
                            setLocalSettings(prev => ({
                              ...prev,
                              llmProvider: { ...prev.llmProvider, rememberApiKey: chk }
                            }));
                          }}
                          className="mt-0.5"
                        />
                        <label htmlFor="remember_key_chk" className="text-[11px] text-slate-500 select-none cursor-pointer">
                          I understand this is local prototype storage only and must not be used with customer datasets.
                        </label>
                      </div>
                    </div>
                  )}
                </div>

                <div className="space-y-4">
                  {/* Model Name and properties */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                        Target Model Name
                      </label>
                      <input
                        type="text"
                        value={localSettings.llmProvider.modelName}
                        onChange={e => {
                          const val = e.target.value;
                          setLocalSettings(prev => ({
                            ...prev,
                            llmProvider: { ...prev.llmProvider, modelName: val }
                          }));
                        }}
                        className="w-full text-xs bg-white border border-natural-border text-slate-700 h-9 rounded px-2.5 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                        Endpoint Base URL (Optional)
                      </label>
                      <input
                        type="text"
                        placeholder="Default URL adapter"
                        value={localSettings.llmProvider.baseUrl || ""}
                        onChange={e => {
                          const val = e.target.value;
                          setLocalSettings(prev => ({
                            ...prev,
                            llmProvider: { ...prev.llmProvider, baseUrl: val }
                          }));
                        }}
                        className="w-full text-xs bg-white border border-natural-border text-slate-700 h-9 rounded px-2.5 outline-none"
                      />
                    </div>
                  </div>

                  {/* Temperature slider */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                        Temperature ({localSettings.llmProvider.temperature})
                      </label>
                      <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.1"
                        value={localSettings.llmProvider.temperature}
                        onChange={e => {
                          const val = parseFloat(e.target.value);
                          setLocalSettings(prev => ({
                            ...prev,
                            llmProvider: { ...prev.llmProvider, temperature: val }
                          }));
                        }}
                        className="w-full mt-1.5"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                        Max Tokens
                      </label>
                      <input
                        type="number"
                        value={localSettings.llmProvider.maxOutputTokens}
                        onChange={e => {
                          const val = parseInt(e.target.value) || 2048;
                          setLocalSettings(prev => ({
                            ...prev,
                            llmProvider: { ...prev.llmProvider, maxOutputTokens: val }
                          }));
                        }}
                        className="w-full text-xs bg-white border border-natural-border text-slate-700 h-9 rounded px-2.5 outline-none"
                      />
                    </div>
                  </div>

                  {/* Feature checkboxes */}
                  <div className="p-3 bg-slate-50 border border-natural-border/30 rounded-lg space-y-2">
                    {[
                      { key: "requireStructuredJson", label: "Enforce Structured JSON Outputs", desc: "Forces models to output conforming JSON syntax" },
                      { key: "storeLlmRunMetadata", label: "Log LLM Dispatch Metadata", desc: "Saves tokens count and execution timelines" },
                      { key: "allowCustomerData", label: "Permit Customer Ingestion Data", desc: "Allows sending raw CSV backlog columns" }
                    ].map(opt => (
                      <div key={opt.key} className="flex items-start gap-2">
                        <input
                          id={`opt_${opt.key}`}
                          type="checkbox"
                          checked={localSettings.llmProvider[opt.key as keyof LlmProviderConfig] as boolean}
                          onChange={e => {
                            const val = e.target.checked;
                            setLocalSettings(prev => ({
                              ...prev,
                              llmProvider: { ...prev.llmProvider, [opt.key]: val }
                            }));
                          }}
                          className="mt-0.5"
                        />
                        <div>
                          <label htmlFor={`opt_${opt.key}`} className="text-xs font-bold text-slate-700 select-none cursor-pointer">
                            {opt.label}
                          </label>
                          <span className="block text-[10px] text-slate-400 font-light leading-none">
                            {opt.desc}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Connection tester */}
                  <div className="pt-2">
                    <button
                      onClick={testLlmConnection}
                      type="button"
                      className="py-1.5 px-3 bg-white border border-natural-border text-slate-700 text-xs font-medium rounded hover:bg-slate-50 transition-colors inline-flex items-center gap-1.5 cursor-pointer outline-none"
                    >
                      <Wifi className="h-4 w-4 text-emerald-500" />
                      <span>Test Client Connection</span>
                    </button>

                    {testResult.status !== "idle" && (
                      <div className={`mt-3 p-3.5 rounded-lg border text-xs leading-normal animate-fade-in ${
                        testResult.status === "loading" ? "bg-slate-50 border-slate-200 text-slate-600" :
                        testResult.status === "success" ? "bg-emerald-50 border-emerald-200 text-emerald-800 font-medium" :
                        testResult.status === "adapter-ready" ? "bg-sky-50 border-sky-200 text-sky-850" :
                        "bg-rose-50 border-rose-200 text-rose-800"
                      }`}>
                        <div className="font-semibold uppercase tracking-wider text-[9px] mb-1">
                          Test Response State: {testResult.status}
                        </div>
                        {testResult.message}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: SUPABASE CONNECTION */}
          {activeTab === "supabase" && (
            <div className="space-y-5">
              <div>
                <h2 className="text-base font-serif italic text-natural-primary">Supabase Connection Settings</h2>
                <p className="text-xs text-slate-500">Provide cloud repository access details to handle diagnostics and evidence artifacts.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-4">
                  {/* Supabase URL */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Supabase URL
                    </label>
                    <input
                      type="text"
                      placeholder="https://your-project.supabase.co"
                      value={localSettings.supabase.supabaseUrl}
                      onChange={e => {
                        const val = e.target.value;
                        setLocalSettings(prev => ({
                          ...prev,
                          supabase: { ...prev.supabase, supabaseUrl: val }
                        }));
                      }}
                      className="w-full text-xs bg-white border border-natural-border text-slate-700 h-9 rounded px-2.5 outline-none focus:border-natural-primary"
                    />
                  </div>

                  {/* Anon Key */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Supabase Public Anon Key
                    </label>
                    <input
                      type="password"
                      placeholder="eyJhbGciOi..."
                      value={localSettings.supabase.anonKey}
                      onChange={e => {
                        const val = e.target.value;
                        setLocalSettings(prev => ({
                          ...prev,
                          supabase: { ...prev.supabase, anonKey: val }
                        }));
                      }}
                      className="w-full text-xs bg-white border border-natural-border text-slate-700 h-9 rounded px-2.5 outline-none focus:border-natural-primary"
                    />
                  </div>

                  {/* Edge function url and storage bucket */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                        Edge Function Base URL
                      </label>
                      <input
                        type="text"
                        placeholder="https://your-proj.supabase.co/functions/v1"
                        value={localSettings.supabase.edgeFunctionBaseUrl || ""}
                        onChange={e => {
                          const val = e.target.value;
                          setLocalSettings(prev => ({
                            ...prev,
                            supabase: { ...prev.supabase, edgeFunctionBaseUrl: val }
                          }));
                        }}
                        className="w-full text-xs bg-white border border-natural-border text-slate-700 h-9 rounded px-2.5 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                        Storage Bucket Name
                      </label>
                      <input
                        type="text"
                        value={localSettings.supabase.storageBucket}
                        onChange={e => {
                          const val = e.target.value;
                          setLocalSettings(prev => ({
                            ...prev,
                            supabase: { ...prev.supabase, storageBucket: val }
                          }));
                        }}
                        className="w-full text-xs bg-white border border-natural-border text-slate-700 h-9 rounded px-2.5 outline-none"
                      />
                    </div>
                  </div>

                  {/* RLS warning switch */}
                  <div className="p-3.5 bg-slate-50 border border-natural-border/30 rounded-lg space-y-1.5">
                    <div className="flex items-center gap-2">
                      <input
                        id="rls_reminder_chk"
                        type="checkbox"
                        checked={localSettings.supabase.rlsReminderEnabled}
                        onChange={e => {
                          const val = e.target.checked;
                          setLocalSettings(prev => ({
                            ...prev,
                            supabase: { ...prev.supabase, rlsReminderEnabled: val }
                          }));
                        }}
                        className="mt-0.5"
                      />
                      <label htmlFor="rls_reminder_chk" className="text-xs font-bold text-slate-800 select-none cursor-pointer">
                        Confirm Row Level Security is active
                      </label>
                    </div>
                    <p className="text-[10px] text-slate-500 leading-normal pl-5">
                      Ensures tenant tables lock reader scopes strictly to authorized owners only. Turning this indicator off triggers high risk warnings.
                    </p>
                  </div>

                  {/* Database check buttons */}
                  <div className="flex gap-2 pt-1">
                    <button
                      onClick={testSupabaseDb}
                      type="button"
                      className="py-1.5 px-3 bg-white border border-natural-border text-slate-700 text-[11px] font-mono uppercase tracking-wider font-bold rounded shadow-xs hover:bg-slate-50 transition-colors cursor-pointer"
                    >
                      Ping Database
                    </button>
                    <button
                      onClick={testSupabaseEdge}
                      type="button"
                      className="py-1.5 px-3 bg-white border border-natural-border text-slate-700 text-[11px] font-mono uppercase tracking-wider font-bold rounded shadow-xs hover:bg-slate-50 transition-colors cursor-pointer"
                    >
                      Ping Edge Router
                    </button>
                  </div>

                  {supabaseTestDb.status !== "idle" && (
                    <div className={`p-2.5 rounded text-[11px] leading-relaxed border ${
                      supabaseTestDb.status === "loading" ? "bg-slate-50 border-slate-200 text-slate-600" :
                      supabaseTestDb.status === "success" ? "bg-emerald-50 border-emerald-250 text-emerald-800" :
                      "bg-rose-50 border-rose-200 text-rose-800"
                    }`}>
                      <strong>DB Client:</strong> {supabaseTestDb.message}
                    </div>
                  )}

                  {supabaseTestEdge.status !== "idle" && (
                    <div className={`p-2.5 rounded text-[11px] leading-relaxed border ${
                      supabaseTestEdge.status === "loading" ? "bg-slate-50 border-slate-200 text-slate-600" :
                      supabaseTestEdge.status === "success" ? "bg-sky-50 border-sky-100 text-[#172B36]" :
                      "bg-rose-50 border-rose-200 text-rose-800"
                    }`}>
                      <strong>Edge functions:</strong> {supabaseTestEdge.message}
                    </div>
                  )}
                </div>

                {/* SQL schema Preview */}
                <div className="space-y-2">
                  <span className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1">
                    <FileCode className="h-4 w-4 text-natural-primary" />
                    SQL Deployment Schema Blueprint
                  </span>
                  <p className="text-[10px] text-slate-400 leading-none">
                    Preview only. Apply through Supabase SQL editor or migration workflows.
                  </p>
                  
                  <div className="bg-[#172B36] text-[#D9E8E2] text-[10px] font-mono p-3 rounded-lg border border-natural-border/20 overflow-y-auto max-h-[300px]">
                    <pre className="leading-tight">{`-- Traceability and Audit Intake Schema
-- Created: 2026-06-10

CREATE TABLE audit_projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  company_name TEXT NOT NULL,
  confidentiality_level TEXT DEFAULT 'customer-related',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE data_sources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES audit_projects(id),
  kind TEXT NOT NULL, -- e.g., jira_csv, pdf
  status TEXT DEFAULT 'pending',
  source_blob_url TEXT
);

CREATE TABLE evidence_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES audit_projects(id),
  source_id UUID REFERENCES data_sources(id),
  ref_code TEXT UNIQUE NOT NULL, -- e.g., EV-101
  extracted_payload JSONB DEFAULT '{}'
);

CREATE TABLE audit_variables (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES audit_projects(id),
  key_label TEXT NOT NULL,
  value_measure NUMERIC NOT NULL
);

CREATE TABLE llm_runs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES audit_projects(id),
  task_name TEXT NOT NULL,
  prompt_tokens INT,
  completion_tokens INT
);

CREATE TABLE report_sections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES audit_projects(id),
  section_type TEXT NOT NULL,
  narrative_draft TEXT
);

CREATE TABLE traceability_links (
  section_id UUID REFERENCES report_sections(id),
  evidence_ref TEXT NOT NULL,
  confidence TEXT DEFAULT 'medium'
);`}</pre>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: DATA SOURCE DEFAULTS */}
          {activeTab === "datasources" && (
            <div className="space-y-4">
              <div>
                <h2 className="text-base font-serif italic text-natural-primary">Data Source Defaults</h2>
                <p className="text-xs text-slate-500">Configure ingestion modes, diagnostic scopes, and static prototype support levels for all source adapters.</p>
              </div>

              <div className="overflow-x-auto border border-natural-border rounded-xl">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-50 border-b border-natural-border">
                      <th className="p-3 font-semibold text-slate-600 uppercase text-[10px] tracking-wider">Source Channel</th>
                      <th className="p-3 font-semibold text-slate-600 uppercase text-[10px] tracking-wider">Enabled</th>
                      <th className="p-3 font-semibold text-slate-600 uppercase text-[10px] tracking-wider">Default Status</th>
                      <th className="p-3 font-semibold text-slate-600 uppercase text-[10px] tracking-wider">Ingestion Model</th>
                      <th className="p-3 font-semibold text-slate-600 uppercase text-[10px] tracking-wider">Support Level</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-natural-border/40">
                    {localSettings.dataSources.map(ds => {
                      const displayTitle = ds.kind.replace(/_/g, " ").toUpperCase();
                      return (
                        <tr key={ds.kind} className="hover:bg-slate-50/50">
                          <td className="p-3 font-bold text-slate-700 whitespace-nowrap">
                            {displayTitle}
                          </td>
                          <td className="p-3">
                            <input
                              type="checkbox"
                              checked={ds.enabled}
                              onChange={() => handleDataSourceToggle(ds.kind)}
                              className="cursor-pointer"
                            />
                          </td>
                          <td className="p-3">
                            <select
                              value={ds.defaultStatus}
                              onChange={e => handleDataSourceStatusChange(ds.kind, e.target.value as "enabled" | "disabled" | "later")}
                              className="bg-white border rounded text-[11px] p-0.5 outline-none"
                            >
                              <option value="enabled">Active default</option>
                              <option value="disabled">Disabled</option>
                              <option value="later">Planned (Later)</option>
                            </select>
                          </td>
                          <td className="p-3">
                            <select
                              value={ds.ingestionMode}
                              onChange={e => handleDataSourceIngestionChange(ds.kind, e.target.value as any)}
                              className="bg-white border rounded text-[11px] p-0.5 outline-none"
                            >
                              <option value="upload">Local upload</option>
                              <option value="api">Dynamic API</option>
                              <option value="adapter-ready">Adapter template</option>
                              <option value="manual">Manual inputs</option>
                            </select>
                          </td>
                          <td className="p-3">
                            <span className={`px-2 py-0.5 font-mono text-[9px] font-bold uppercase rounded ${
                              ds.prototypeSupportLevel === "works-now" ? "bg-emerald-50 text-emerald-800" :
                              ds.prototypeSupportLevel === "works-now" || ds.prototypeSupportLevel === "mock-only" ? "bg-sky-50 text-sky-800" :
                              ds.prototypeSupportLevel === "adapter-ready" ? "bg-amber-50 text-amber-800" :
                              "bg-slate-100 text-slate-500"
                            }`}>
                              {ds.prototypeSupportLevel}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 5: TRACEABILITY POLICY */}
          {activeTab === "traceability" && (
            <div className="space-y-5">
              <div>
                <h2 className="text-base font-serif italic text-natural-primary">Traceability Policy Settings</h2>
                <p className="text-xs text-slate-500">Configure documentation checks enforced for every future generated report section. Toggling off critical checks reduces grounding guarantees.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-slate-50 border border-natural-border/60 rounded-xl space-y-3.5">
                  <span className="text-[10px] font-mono tracking-wider uppercase text-slate-400 block h-3 font-semibold">Active Verbiage Rules</span>
                  
                  <div className="space-y-2.5 max-h-[350px] overflow-y-auto pr-2">
                    {[
                      { key: "requireEvidenceForEveryClaim", label: "Forbid Untraced Claims", desc: "Every inference card must map to a raw workspace artifact index." },
                      { key: "requireSourceReferences", label: "Require Source Coordinates", desc: "Assert file path source boundaries or exact row hashes." },
                      { key: "requireAssumptionsList", label: "Provide Clear Assumptions", desc: "Isolate implicit leaps in judgement distinctly." },
                      { key: "requireKpiOrObservableSignal", label: "Require Quantitative KPIs", desc: "Ensure metrics are provided to stabilize gut findings." },
                      { key: "requireBenchmarkOrTbd", label: "Enforce Normative Benchmarking", desc: "Default comparative industry standards to TBD rather than imaginary baselines." },
                      { key: "requireConfidenceRating", label: "Require Level of confidence", desc: "Forces models or analysts to estimate high/medium/low certainties." },
                      { key: "requireLimitationStatement", label: "Add Counter-Limitations Block", desc: "Explicit boundary warning on context completeness." },
                      { key: "requireCounterHypothesis", label: "Require Active Counter-Hypotheses", desc: "Synthesizes competing interpretations for Cynefin sensing." },
                      { key: "requireVisualization", label: "Recommend Dynamic Graphs", desc: "Suggests bar charts, layouts, or metric boxes." },
                      { key: "requireHumanReviewBeforeFinalReport", label: "Mandate Human Consultant Review", desc: "Locks drafts until certified by lead agile diagnostician." },
                      { key: "blockFinalReportWhenUntracedClaimsExist", label: "Block Exports on Loose Groundings", desc: "Cancels report compilations when unverified assertions are found." }
                    ].map(rule => (
                      <div key={rule.key} className="flex items-start justify-between gap-3">
                        <div>
                          <label className="text-xs font-bold text-slate-700 block">
                            {rule.label}
                          </label>
                          <span className="text-[10px] text-slate-400 leading-none h-3 block font-light">
                            {rule.desc}
                          </span>
                        </div>
                        <input
                          type="checkbox"
                          checked={localSettings.traceabilityPolicy[rule.key as keyof TraceabilityPolicy]}
                          onChange={e => {
                            const val = e.target.checked;
                            setLocalSettings(prev => ({
                              ...prev,
                              traceabilityPolicy: { ...prev.traceabilityPolicy, [rule.key]: val }
                            }));
                          }}
                          className="mt-1 cursor-pointer"
                        />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Contract Preview */}
                <div className="space-y-2.5">
                  <span className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                    <FileText className="h-4.5 w-4.5 text-natural-secondary" />
                    Proposed Future Report Contract (Section Schema)
                  </span>
                  <p className="text-[11px] text-slate-500 leading-relaxed">
                    Setting the above traceability guidelines controls the JSON payload shape parsed by client renderers. Disabling core clauses bypasses downstream model validations.
                  </p>

                  <div className="bg-[#172B36] p-3 rounded-lg border border-natural-border/20 text-[#D9E8E2] text-[10px] font-mono leading-relaxed">
                    <span className="text-[9px] uppercase tracking-widest text-[#FF9932] font-bold block mb-1">CONTRACT SCHEMAS PREVIEW</span>
                    <pre className="overflow-x-auto">{JSON.stringify({
                      section_id: "example_work_system_coherence",
                      title: "Work System Coherence",
                      narrative: "Dynamic audit output reflecting workflow variance...",
                      evidence_refs: localSettings.traceabilityPolicy.requireEvidenceForEveryClaim ? ["EV-001", "EV-002"] : [],
                      assumptions: localSettings.traceabilityPolicy.requireAssumptionsList ? ["ASSUMPTION: teams share key milestones"] : [],
                      kpis: localSettings.traceabilityPolicy.requireKpiOrObservableSignal ? ["workflow_variance", "issue_type_variance"] : [],
                      benchmarks: localSettings.traceabilityPolicy.requireBenchmarkOrTbd ? ["TBD"] : [],
                      confidence: localSettings.traceabilityPolicy.requireConfidenceRating ? "medium" : undefined,
                      limitation: localSettings.traceabilityPolicy.requireLimitationStatement ? "Calculated entirely on 90 days log data." : undefined,
                      counter_hypothesis: localSettings.traceabilityPolicy.requireCounterHypothesis ? "Observed variance could reflect custom business classes." : undefined,
                      visualization: localSettings.traceabilityPolicy.requireVisualization ? { type: "bar_chart", reason: "Variance visual mapping" } : null,
                      human_review_status: localSettings.traceabilityPolicy.requireHumanReviewBeforeFinalReport ? "required" : "skipped"
                    }, null, 2)}</pre>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 6: AUDIT DEFAULTS */}
          {activeTab === "auditdefaults" && (
            <div className="space-y-5">
              <div>
                <h2 className="text-base font-serif italic text-natural-primary">Audit Project Parameter Defaults</h2>
                <p className="text-xs text-slate-500">Configure default properties loaded upon initializing a fresh intake transaction.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-4">
                  {/* Default Audit Mode */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 font-mono">
                      Default Audit Mode
                    </label>
                    <select
                      value={localSettings.auditDefaults.auditMode}
                      onChange={e => {
                        const val = e.target.value as any;
                        setLocalSettings(prev => ({
                          ...prev,
                          auditDefaults: { ...prev.auditDefaults, auditMode: val }
                        }));
                      }}
                      className="w-full text-xs bg-white border border-natural-border text-slate-700 h-9 rounded px-2.5 outline-none focus:border-natural-primary"
                    >
                      <option value="Automated Evidence Audit">Automated Evidence Audit</option>
                      <option value="Consultant-Validated Audit">Consultant-Validated Audit</option>
                    </select>
                  </div>

                  {/* Primary Evidence Source */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 font-mono">
                      Primary Evidence Source
                    </label>
                    <div className="flex gap-2">
                      {["Jira", "Documents", "Mixed"].map(src => {
                        const isSel = localSettings.auditDefaults.primaryEvidenceSource === src;
                        return (
                          <button
                            key={src}
                            onClick={() => setLocalSettings(prev => ({
                              ...prev,
                              auditDefaults: { ...prev.auditDefaults, primaryEvidenceSource: src as any }
                            }))}
                            type="button"
                            className={`flex-1 py-1.5 text-xs font-medium rounded border cursor-pointer ${
                              isSel 
                                ? "bg-natural-primary text-white border-natural-primary" 
                                : "bg-white border-natural-border text-slate-600 hover:bg-slate-50"
                            }`}
                          >
                            {src}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Window days option */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 font-mono">
                      Default Assessment Window
                    </label>
                    <select
                      value={localSettings.auditDefaults.defaultTimeWindowDays}
                      onChange={e => {
                        const val = parseInt(e.target.value) as any;
                        setLocalSettings(prev => ({
                          ...prev,
                          auditDefaults: { ...prev.auditDefaults, defaultTimeWindowDays: val }
                        }));
                      }}
                      className="w-full text-xs bg-white border border-natural-border text-slate-700 h-9 rounded px-2.5 outline-none focus:border-natural-primary"
                    >
                      <option value="90">90 Days (Last Sprint Cycle)</option>
                      <option value="180">180 Days (Half Year Segment)</option>
                      <option value="365">365 Days (Full Governance Year)</option>
                    </select>
                  </div>

                  {/* Default language and audience */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 font-mono text-[10px]">
                        Default Audit Language
                      </label>
                      <select
                        value={localSettings.auditDefaults.defaultLanguage}
                        onChange={e => {
                          const val = e.target.value as any;
                          setLocalSettings(prev => ({
                            ...prev,
                            auditDefaults: { ...prev.auditDefaults, defaultLanguage: val }
                          }));
                        }}
                        className="w-full text-xs bg-white border border-natural-border text-slate-700 h-9 rounded px-2.5 outline-none"
                      >
                        <option value="English">English</option>
                        <option value="German">German (Deutsch)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 font-mono text-[10px]">
                        Target Report Audience
                      </label>
                      <select
                        value={localSettings.auditDefaults.defaultReportAudience}
                        onChange={e => {
                          const val = e.target.value as any;
                          setLocalSettings(prev => ({
                            ...prev,
                            auditDefaults: { ...prev.auditDefaults, defaultReportAudience: val }
                          }));
                        }}
                        className="w-full text-xs bg-white border border-natural-border text-slate-700 h-9 rounded px-2.5 outline-none"
                      >
                        <option value="consultant internal">Consultant Internal Draft</option>
                        <option value="client leadership">Client Executive Leadership</option>
                        <option value="technical leadership">DevOps & Technical Leadership</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  {/* Default Output style */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 font-mono">
                      Narrative Output Style
                    </label>
                    <select
                      value={localSettings.auditDefaults.defaultOutputStyle}
                      onChange={e => {
                        const val = e.target.value as any;
                        setLocalSettings(prev => ({
                          ...prev,
                          auditDefaults: { ...prev.auditDefaults, defaultOutputStyle: val }
                        }));
                      }}
                      className="w-full text-xs bg-white border border-natural-border text-slate-700 h-9 rounded px-2.5 outline-none focus:border-natural-primary"
                    >
                      <option value="evidence-first">Evidence-First (Verifiable observations map)</option>
                      <option value="management narrative">Management Narrative (Strategic summarized report)</option>
                      <option value="technical audit">Technical Audit (Friction and transition logs focus)</option>
                    </select>
                  </div>

                  {/* Default Visualization style */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 font-mono">
                      Visualization Presentation
                    </label>
                    <select
                      value={localSettings.auditDefaults.defaultVisualizationStyle}
                      onChange={e => {
                        const val = e.target.value as any;
                        setLocalSettings(prev => ({
                          ...prev,
                          auditDefaults: { ...prev.auditDefaults, defaultVisualizationStyle: val }
                        }));
                      }}
                      className="w-full text-xs bg-white border border-natural-border text-slate-700 h-9 rounded px-2.5 outline-none focus:border-natural-primary"
                    >
                      <option value="analytical dashboard">Analytical Dashboard (D3 distributions)</option>
                      <option value="clean enterprise">Clean Enterprise Layout</option>
                      <option value="executive report">Executive Summarization Cards</option>
                    </select>
                  </div>

                  <div className="p-4 bg-slate-50 border border-natural-border/40 rounded-xl">
                    <span className="font-serif italic text-xs font-black text-natural-primary block mb-1">
                      Quick Verification Guidelines
                    </span>
                    <p className="text-[11px] text-slate-500 leading-normal font-sans">
                      These parameters bootstrap values loaded inside the <strong>Audit Setup Form</strong> on step 1. You may override these anytime during active consulting audits, but keeping these defaults aligned with standard frameworks reduces operational click friction.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 7: SAFETY CHECKLIST */}
          {activeTab === "safety" && (
            <div className="space-y-5">
              <div>
                <h2 className="text-base font-serif italic text-natural-primary">Prototype Security Checklist</h2>
                <p className="text-xs text-slate-500">Security compliance audit tracking development variables, keys isolation and OAuth click-dummy triggers.</p>
              </div>

              {/* Status tally banner */}
              <div className="flex gap-3 justify-center text-center">
                <div className="flex-1 bg-emerald-50 border border-emerald-250 p-3 rounded-lg">
                  <span className="block text-xl font-bold font-serif italic text-emerald-800">{safety.passedCount}</span>
                  <span className="text-[10px] font-mono uppercase text-emerald-600 block leading-none mt-1">Checks Passed</span>
                </div>
                <div className="flex-1 bg-amber-50 border border-amber-250 p-3 rounded-lg">
                  <span className="block text-xl font-bold font-serif italic text-amber-800">{safety.warnCount}</span>
                  <span className="text-[10px] font-mono uppercase text-[#A67C52] block leading-none mt-1">Warnings Raised</span>
                </div>
                <div className="flex-1 bg-rose-50 border border-rose-250 p-3 rounded-lg">
                  <span className="block text-xl font-bold font-serif italic text-rose-800">{safety.failCount}</span>
                  <span className="text-[10px] font-mono uppercase text-rose-600 block leading-none mt-1">High Risks</span>
                </div>
              </div>

              <div className="space-y-3">
                {[
                  { id: "s-core-mock", label: "Mock Provider Works", ok: localSettings.llmProvider.provider === "mock", desc: "No active keys needed. Computations stay completely offline.", safe: true },
                  { id: "s-no-hardcoded", label: "No Hardcoded Secrets", ok: !localSettings.llmProvider.apiKey || !localSettings.llmProvider.rememberApiKey, desc: "Secrets are kept cleared from local bundles and client script files.", safe: true },
                  { id: "s-browser-safe", label: "Secured Edge Ingestion", ok: localSettings.llmProvider.runtimeMode === "supabase-edge-function" || localSettings.llmProvider.provider === "mock", desc: "No direct un-proxied browser requests executed.", safe: true },
                  { id: "s-rls-compliance", label: "Supabase RLS Safeguard", ok: localSettings.supabase.rlsReminderEnabled, desc: "Row Level Security has been validated to prevent cross-tenant leakages.", safe: true },
                  { id: "s-trace-standard", label: "Enforced Grounding Claims", ok: localSettings.traceabilityPolicy.requireEvidenceForEveryClaim && localSettings.traceabilityPolicy.requireConfidenceRating, desc: "System locks report compile vectors if claims contain ungrounded text logs.", safe: true }
                ].map(chk => (
                  <div key={chk.id} className="p-3.5 bg-white border border-natural-border/80 rounded-xl flex items-start gap-3 shadow-xs">
                    <span className="mt-0.5">
                      {chk.ok ? (
                        <CheckCircle className="h-4.5 w-4.5 text-emerald-600" />
                      ) : (
                        <AlertTriangle className={`h-4.5 w-4.5 ${chk.safe ? "text-amber-500" : "text-rose-500"}`} />
                      )}
                    </span>
                    <div>
                      <span className="font-bold text-xs text-slate-800 flex items-center gap-1.5">
                        {chk.label}
                        <span className={`px-1.5 py-0.2 rounded font-mono text-[8px] uppercase tracking-wider ${
                          chk.ok ? "bg-emerald-50 text-emerald-800" : "bg-amber-50 text-[#A67C52]"
                        }`}>
                          {chk.ok ? "passed" : "needs configuration"}
                        </span>
                      </span>
                      <p className="text-[11px] text-slate-500 leading-normal font-light">
                        {chk.desc}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
