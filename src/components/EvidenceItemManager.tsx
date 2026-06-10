import React, { useState } from "react";
import { 
  Database, 
  PlusCircle, 
  ListFilter, 
  CheckCircle, 
  AlertTriangle, 
  X, 
  Trash2, 
  HelpCircle,
  Plus
} from "lucide-react";
import { 
  EvidenceItem, 
  EvidenceSourceType, 
  EvidenceStrength, 
  EvidenceStatus,
  DataStatus
} from "../types";

interface EvidenceItemManagerProps {
  evidenceItems: EvidenceItem[];
  onAddEvidence: (item: EvidenceItem) => void;
  onToggleReview: (id: string) => void;
  onToggleReject: (id: string) => void;
  onDeleteEvidence?: (id: string) => void;
}

export function EvidenceItemManager({
  evidenceItems,
  onAddEvidence,
  onToggleReview,
  onToggleReject,
  onDeleteEvidence
}: EvidenceItemManagerProps) {
  // Filter states
  const [sourceFilter, setSourceFilter] = useState<string>("all");
  const [strengthFilter, setStrengthFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Form toggles
  const [showAddForm, setShowAddForm] = useState<boolean>(false);

  // Form states for manual submission
  const [title, setTitle] = useState<string>("");
  const [sourceType, setSourceType] = useState<EvidenceSourceType>("manual_note");
  const [sourceLabel, setSourceLabel] = useState<string>("");
  const [sourceRef, setSourceRef] = useState<string>("");
  const [strength, setStrength] = useState<EvidenceStrength>("moderate");
  const [summary, setSummary] = useState<string>("");
  
  // Dynamic lists in form
  const [tempFact, setTempFact] = useState<string>("");
  const [extractedFacts, setExtractedFacts] = useState<string[]>([]);
  const [tempLimitation, setTempLimitation] = useState<string>("");
  const [limitations, setLimitations] = useState<string[]>([]);

  // Statistics counters
  const totalCount = evidenceItems.length;
  const reviewedCount = evidenceItems.filter(item => item.status === "reviewed").length;
  const rejectedCount = evidenceItems.filter(item => item.status === "rejected").length;

  const handleAddFact = () => {
    if (tempFact.trim()) {
      setExtractedFacts([...extractedFacts, tempFact.trim()]);
      setTempFact("");
    }
  };

  const handleRemoveFact = (index: number) => {
    setExtractedFacts(extractedFacts.filter((_, idx) => idx !== index));
  };

  const handleAddLimitation = () => {
    if (tempLimitation.trim()) {
      setLimitations([...limitations, tempLimitation.trim()]);
      setTempLimitation("");
    }
  };

  const handleRemoveLimitation = (index: number) => {
    setLimitations(limitations.filter((_, idx) => idx !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim() || !summary.trim() || !sourceLabel.trim()) {
      alert("Please enter the required fields: Title, Physical Source Label, and Summary.");
      return;
    }

    const manualId = `EV-MAN-${Math.floor(1000 + Math.random() * 9000)}`;
    const newEvidence: EvidenceItem = {
      id: manualId,
      auditProjectId: "proj-scale-01",
      title: title.trim(),
      sourceType,
      sourceRef: sourceRef.trim() || "MANUAL-INPUT",
      sourceLabel: sourceLabel.trim(),
      status: "reviewed",
      strength,
      dataStatus: "manual",
      summary: summary.trim(),
      extractedFacts: extractedFacts.length > 0 ? extractedFacts : ["Documented manually during intake session."],
      limitations: limitations.length > 0 ? limitations : ["Based on qualitative recollection; subject to response/selection bias."],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    onAddEvidence(newEvidence);

    // Reset Form
    setTitle("");
    setSourceType("manual_note");
    setSourceLabel("");
    setSourceRef("");
    setStrength("moderate");
    setSummary("");
    setExtractedFacts([]);
    setLimitations([]);
    setShowAddForm(false);
  };

  // Filter calculations
  const filteredItems = evidenceItems.filter(item => {
    const matchesSource = sourceFilter === "all" || item.sourceType === sourceFilter;
    const matchesStrength = strengthFilter === "all" || item.strength === strengthFilter;
    const matchesSearch = searchQuery === "" || 
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
      item.id.toLowerCase().includes(searchQuery.toLowerCase()) || 
      item.summary.toLowerCase().includes(searchQuery.toLowerCase()) || 
      item.sourceLabel.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesSource && matchesStrength && matchesSearch;
  });

  return (
    <div className="space-y-6" id="evidence-item-manager-component">
      
      {/* Metrics Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white border border-slate-200 rounded-lg p-4 flex items-center justify-between shadow-xs">
          <div>
            <span className="text-[10px] font-mono text-slate-400 uppercase font-bold block">
              Total Evidence Pool
            </span>
            <span className="text-2xl font-bold font-serif italic text-natural-primary">
              {totalCount}
            </span>
          </div>
          <span className="p-2.5 bg-slate-100 rounded-full text-slate-500">
            <Database className="h-5 w-5" />
          </span>
        </div>

        <div className="bg-white border border-slate-200 rounded-lg p-4 flex items-center justify-between shadow-xs">
          <div>
            <span className="text-[10px] font-mono text-slate-400 uppercase font-bold block session-counts">
              Reviewed & Vetted
            </span>
            <span className="text-2xl font-bold font-serif italic text-emerald-700">
              {reviewedCount}
            </span>
          </div>
          <span className="p-2.5 bg-emerald-55 rounded-full text-emerald-600">
            <CheckCircle className="h-5 w-5" />
          </span>
        </div>

        <div className="bg-white border border-slate-200 rounded-lg p-4 flex items-center justify-between shadow-xs">
          <div>
            <span className="text-[10px] font-mono text-slate-400 uppercase font-bold block">
              Rejected / Non-Traceable
            </span>
            <span className="text-2xl font-bold font-serif italic text-rose-700">
              {rejectedCount}
            </span>
          </div>
          <span className="p-2.5 bg-rose-55 rounded-full text-rose-600">
            <AlertTriangle className="h-5 w-5" />
          </span>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h3 className="text-sm font-serif font-bold text-natural-primary uppercase tracking-wide">
            Evidence Item Repository
          </h3>
          <p className="text-xs text-slate-500">
            Manage collected physical traces, compliance documents, backlog CSV uploads, and interview notes.
          </p>
        </div>

        {/* Filters and Add Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Query Filter */}
          <div className="relative">
            <input
              type="text"
              placeholder="Search evidence..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="text-xs bg-white border border-slate-200 rounded px-2.5 py-1.5 w-36 sm:w-48 outline-none text-slate-700"
            />
            {searchQuery && (
              <button 
                type="button" 
                onClick={() => setSearchQuery("")} 
                className="absolute right-2 top-2 text-[10px] hover:text-slate-800 text-slate-400"
              >
                ✕
              </button>
            )}
          </div>

          {/* Source Filter */}
          <div className="flex items-center gap-1 bg-white border border-slate-200 rounded px-2 py-1 select-none">
            <ListFilter className="h-3 w-3 text-slate-400" />
            <select
              value={sourceFilter}
              onChange={e => setSourceFilter(e.target.value)}
              className="text-[11px] font-mono text-slate-600 bg-transparent border-0 outline-none pr-1 cursor-pointer"
            >
              <option value="all">Sources: ALL</option>
              <option value="jira">Jira Logs</option>
              <option value="confluence">Confluence</option>
              <option value="document">Documents</option>
              <option value="spreadsheet">Spreadsheets</option>
              <option value="manual_note">Office Notes</option>
              <option value="llm_output">LLM Raw</option>
            </select>
          </div>

          {/* Strength Filter */}
          <div className="flex items-center gap-1 bg-white border border-slate-200 rounded px-2 py-1 select-none">
            <select
              value={strengthFilter}
              onChange={e => setStrengthFilter(e.target.value)}
              className="text-[11px] font-mono text-slate-650 bg-transparent border-0 outline-none pr-1 cursor-pointer"
            >
              <option value="all">Strength: ALL</option>
              <option value="direct">Direct Proofs</option>
              <option value="strong">Strong Corroboration</option>
              <option value="moderate">Moderate</option>
              <option value="weak">Weak / Subjective</option>
            </select>
          </div>

          {/* Add Hand-Logged manual pointer */}
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            type="button"
            className="px-3.5 py-1.5 bg-natural-primary hover:bg-natural-primary/95 text-white rounded text-xs font-bold uppercase tracking-wider inline-flex items-center gap-1.5 min-h-[34px] cursor-pointer shadow-sm active:translate-y-0.5 transition-transform"
          >
            <PlusCircle className="h-4 w-4 text-natural-accent" />
            <span>Manual Evidence</span>
          </button>
        </div>
      </div>

      {/* Slide-out/Expand adding form */}
      {showAddForm && (
        <form 
          onSubmit={handleSubmit} 
          className="bg-white border border-natural-border rounded-xl p-5 shadow-sm space-y-4 animate-fade-in border-t-2 border-t-natural-primary"
        >
          <div className="border-b border-natural-border/50 pb-2 flex justify-between items-center bg-slate-50 -mx-5 -mt-5 p-4 rounded-t-xl select-none">
            <div className="flex items-center gap-2">
              <Database className="h-4 w-4 text-natural-primary" />
              <span className="text-xs font-bold uppercase tracking-wider text-natural-primary font-mono">
                Log New Evidence Pointer
              </span>
            </div>
            <button
              onClick={() => setShowAddForm(false)}
              type="button"
              className="text-slate-400 hover:text-slate-700 font-bold p-1 hover:bg-slate-200 rounded-full"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
            {/* Left Column */}
            <div className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">
                  Title / Descriptor *
                </label>
                <input
                  type="text"
                  placeholder="e.g. Köln Team Kanban Retro Notes"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  className="w-full text-xs bg-slate-50 border border-slate-250 p-2 rounded outline-none placeholder-slate-400"
                  required
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">
                  Source Kind
                </label>
                <select
                  value={sourceType}
                  onChange={e => setSourceType(e.target.value as EvidenceSourceType)}
                  className="w-full text-xs bg-slate-50 border border-slate-250 p-2 rounded outline-none h-8.5 cursor-pointer"
                >
                  <option value="manual_note">Consultant interview note</option>
                  <option value="document">Regulatory Document / ISO Code</option>
                  <option value="spreadsheet">Telemetry Spreadsheet</option>
                  <option value="jira">Jira Ticket Trace log</option>
                  <option value="confluence">Confluence Wiki page</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">
                    Source File Label *
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. RETRO-NOTES.TXT"
                    value={sourceLabel}
                    onChange={e => setSourceLabel(e.target.value)}
                    className="w-full text-xs bg-slate-50 border border-slate-250 p-2 rounded outline-none placeholder-slate-400"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">
                    System identifier Ref
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. ISO-2026-B1"
                    value={sourceRef}
                    onChange={e => setSourceRef(e.target.value)}
                    className="w-full text-xs bg-slate-50 border border-slate-250 p-2 rounded outline-none placeholder-slate-400"
                  />
                </div>
              </div>
            </div>

            {/* Middle Column */}
            <div className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">
                  Evidence Strength Assessment
                </label>
                <select
                  value={strength}
                  onChange={e => setStrength(e.target.value as EvidenceStrength)}
                  className="w-full text-xs bg-slate-50 border border-slate-250 p-2 rounded outline-none h-8.5 cursor-pointer"
                >
                  <option value="direct">Direct Empirical Evidence (highest compliance)</option>
                  <option value="strong">Strong Corroborated Indication</option>
                  <option value="moderate">Moderate / Circumstantial</option>
                  <option value="weak">Weak / Subjective Observation</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">
                  Extracted Facts
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="e.g. 5 out of 6 teams skip backlog size caps."
                    value={tempFact}
                    onChange={e => setTempFact(e.target.value)}
                    className="flex-1 text-xs bg-slate-50 border border-slate-250 px-2 py-1.5 rounded outline-none placeholder-slate-400"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleAddFact();
                      }
                    }}
                  />
                  <button
                    type="button"
                    onClick={handleAddFact}
                    className="px-3 bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-bold rounded cursor-pointer transition-colors"
                  >
                    Add
                  </button>
                </div>
                
                {extractedFacts.length > 0 && (
                  <ul className="text-[10px] font-mono text-indigo-700 bg-indigo-50/50 p-2 rounded border border-indigo-150 max-h-24 overflow-y-auto space-y-1 mt-1.5 select-none">
                    {extractedFacts.map((fact, index) => (
                      <li key={index} className="flex justify-between items-start gap-2">
                        <span>• {fact}</span>
                        <button 
                          type="button" 
                          onClick={() => handleRemoveFact(index)} 
                          className="text-red-500 font-bold hover:text-red-700 shrink-0 text-[11px]"
                        >
                          ✕
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">
                  Disclose Limitations / Negative scoping
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="e.g. Restrained to active spring sprints only."
                    value={tempLimitation}
                    onChange={e => setTempLimitation(e.target.value)}
                    className="flex-1 text-xs bg-slate-50 border border-slate-250 px-2 py-1.5 rounded outline-none placeholder-slate-400"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleAddLimitation();
                      }
                    }}
                  />
                  <button
                    type="button"
                    onClick={handleAddLimitation}
                    className="px-3 bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-bold rounded cursor-pointer transition-colors"
                  >
                    Add
                  </button>
                </div>

                {limitations.length > 0 && (
                  <ul className="text-[10px] font-mono text-amber-700 bg-amber-50/50 p-2 rounded border border-amber-150 max-h-24 overflow-y-auto space-y-1 mt-1.5 select-none">
                    {limitations.map((limit, index) => (
                      <li key={index} className="flex justify-between items-start gap-2">
                        <span>• {limit}</span>
                        <button 
                          type="button" 
                          onClick={() => handleRemoveLimitation(index)} 
                          className="text-red-500 font-bold hover:text-red-700 shrink-0 text-[11px]"
                        >
                          ✕
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">
              Summary Description Statement *
            </label>
            <textarea
              rows={3}
              placeholder="Provide a specific qualitative summary narrative demonstrating the findings..."
              value={summary}
              onChange={e => setSummary(e.target.value)}
              className="w-full text-xs bg-slate-50 border border-slate-250 p-2 rounded outline-none resize-none placeholder-slate-400"
              required
            />
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="px-4 py-2 hover:bg-slate-100 text-slate-600 rounded text-xs font-bold uppercase"
            >
              Clear changes
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded text-xs uppercase"
            >
              Commit Evidence to project scope
            </button>
          </div>
        </form>
      )}

      {/* Grid of Evidence cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredItems.map(item => (
          <div 
            key={item.id} 
            className="bg-white border border-slate-200 shadow-xs hover:shadow-xs hover:border-slate-350 p-4.5 rounded-lg flex flex-col justify-between transition-all space-y-3"
          >
            <div>
              {/* Card Meta Indicator */}
              <div className="flex justify-between items-start">
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="text-[10px] font-mono font-bold uppercase px-1.5 py-0.5 bg-slate-100 border border-slate-200 text-slate-600 rounded select-none">
                    {item.id}
                  </span>
                  <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded font-mono border ${
                    item.strength === "direct" ? "bg-emerald-50 text-emerald-850 border-emerald-200" :
                    item.strength === "strong" ? "bg-teal-50 text-teal-850 border-teal-200" :
                    item.strength === "moderate" ? "bg-blue-50 text-blue-850 border-blue-200" :
                    "bg-amber-55 text-amber-850 border-amber-200"
                  }`}>
                    {item.strength} strength
                  </span>
                </div>
                <span className="text-[9px] font-mono text-slate-400 uppercase select-none font-bold">
                  ● {item.dataStatus}
                </span>
              </div>

              <h4 className="text-xs font-bold text-slate-800 mt-2 font-mono h-8 overflow-hidden line-clamp-2">
                {item.title}
              </h4>

              <p className="text-[10px] text-slate-450 leading-normal mt-1 italic">
                Source: <code className="bg-slate-100 px-1 rounded text-[9px] font-mono text-slate-600 font-bold">{item.sourceLabel} [{item.sourceRef || "local"}]</code>
              </p>

              <p className="text-xs text-slate-600 leading-relaxed mt-2.5 bg-slate-50 p-2.5 rounded border border-slate-150 font-sans">
                {item.summary}
              </p>

              {/* Extracted Facts list */}
              {item.extractedFacts && item.extractedFacts.length > 0 && (
                <div className="mt-3 space-y-1">
                  <span className="text-[9px] font-bold text-natural-primary uppercase font-mono block select-none">
                    Extracted Facts ({item.extractedFacts.length}):
                  </span>
                  <ul className="list-disc pl-4 text-[11px] text-indigo-900 font-sans space-y-0.5">
                    {item.extractedFacts.map((fact, idx) => (
                      <li key={idx}>
                        <span>{fact}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Limitations Indicators */}
              {item.limitations && item.limitations.length > 0 && (
                <div className="mt-3 pt-2.5 border-t border-dashed border-slate-200">
                  <span className="text-[9px] font-bold text-amber-700 uppercase font-mono block select-none">
                    Limitations & Biases:
                  </span>
                  <ul className="text-[10px] text-amber-800 italic space-y-0.5 pl-0 max-h-24 overflow-y-auto">
                    {item.limitations.map((limit, idx) => (
                      <li key={idx} className="flex items-start gap-1">
                        <span className="text-[11px] text-amber-600 font-bold shrink-0 leading-none">⚠</span>
                        <span>{limit}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Actions Bar */}
            <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2.5 select-none self-end w-full">
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => onToggleReview(item.id)}
                  type="button"
                  className={`text-[10px] font-mono font-bold uppercase py-1 px-2 border rounded cursor-pointer transition-colors ${
                    item.status === "reviewed" 
                      ? "bg-emerald-50 border-emerald-350 text-emerald-800" 
                      : "bg-white border-slate-250 text-slate-500 hover:text-slate-800 hover:bg-slate-50"
                  }`}
                >
                  {item.status === "reviewed" ? "✓ Reviewed" : "Mark Reviewed"}
                </button>

                <button
                  onClick={() => onToggleReject(item.id)}
                  type="button"
                  className={`text-[10px] font-mono font-bold uppercase py-1 px-2 border rounded cursor-pointer transition-colors ${
                    item.status === "rejected" 
                      ? "bg-rose-50 border-rose-300 text-rose-800" 
                      : "bg-white border-slate-250 text-slate-500 hover:text-rose-700 hover:bg-rose-50/40"
                  }`}
                >
                  {item.status === "rejected" ? "✗ Rejected" : "Flag Reject"}
                </button>

                {onDeleteEvidence && (
                  <button
                    onClick={() => onDeleteEvidence(item.id)}
                    type="button"
                    className="p-1 text-slate-400 hover:text-rose-600 rounded hover:bg-slate-100 transition-colors cursor-pointer"
                    title="Delete evidence"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>

              <span className="text-[9px] text-slate-400 font-mono italic">
                Updated {new Date(item.updatedAt).toLocaleDateString()}
              </span>
            </div>
          </div>
        ))}

        {filteredItems.length === 0 && (
          <div className="md:col-span-2 p-12 bg-white border border-dashed border-slate-200 text-center text-slate-400 text-xs rounded-xl flex flex-col items-center justify-center gap-2">
            <HelpCircle className="h-8 w-8 text-slate-300" />
            <span>No matching evidence items found in active local sandbox buffer.</span>
          </div>
        )}
      </div>
    </div>
  );
}
