import { describe, it, expect } from "vitest";
import { evaluateSettingsSafety, filterSettingsBeforeSave } from "./settingsSafety";
import { executeMockLlmCall } from "./auditLogic";
import { DEFAULT_SETTINGS } from "../config/defaultSettings";

describe("Settings Safety and Sovereignty Validators", () => {
  it("determines that the default mock-only mode needs no api keys and raises no warnings", () => {
    const safety = evaluateSettingsSafety(DEFAULT_SETTINGS);
    expect(safety.isBrowserLiveUnsafe).toBe(false);
    expect(safety.hasKeyStoredPostSave).toBe(false);
    expect(safety.unsafeWarningTriggered).toBe(false);
    expect(safety.providerStatus).toBe("mock-only");
  });

  it("raises unsafe warnings when live browser-prototype mode is configured with a key", () => {
    const settings = JSON.parse(JSON.stringify(DEFAULT_SETTINGS));
    settings.llmProvider.provider = "gemini";
    settings.llmProvider.runtimeMode = "browser-prototype";
    settings.llmProvider.apiKey = "AIzaSyFakeKey_12345";
    settings.llmProvider.rememberApiKey = true;

    const safety = evaluateSettingsSafety(settings);
    expect(safety.isBrowserLiveUnsafe).toBe(true);
    expect(safety.hasKeyStoredPostSave).toBe(true);
    expect(safety.unsafeWarningTriggered).toBe(true);
    expect(safety.providerStatus).toBe("unsafe-browser-mode");
  });

  it("shields API keys in Supabase Edge Function mode and marks provider as adapter-ready", () => {
    const settings = JSON.parse(JSON.stringify(DEFAULT_SETTINGS));
    settings.llmProvider.provider = "gemini";
    settings.llmProvider.runtimeMode = "supabase-edge-function";
    settings.llmProvider.apiKey = "AIzaSyFakeKey_12345"; // Should be ignored

    const safety = evaluateSettingsSafety(settings);
    expect(safety.hasKeyStoredPostSave).toBe(false);
    expect(safety.providerStatus).toBe("adapter-ready");

    const saved = filterSettingsBeforeSave(settings);
    // API Key must be fully cleaned out since it belongs in Edge Function secrets, not client
    expect(saved.llmProvider.apiKey).toBe("");
  });

  it("never persists any API key during saving unless explicit remember confirmation is toggled on", () => {
    const settings = JSON.parse(JSON.stringify(DEFAULT_SETTINGS));
    settings.llmProvider.provider = "openai";
    settings.llmProvider.runtimeMode = "browser-prototype";
    settings.llmProvider.apiKey = "sk-proj-secrets_test";
    settings.llmProvider.rememberApiKey = false; // user did not confirm

    const saved = filterSettingsBeforeSave(settings);
    expect(saved.llmProvider.apiKey).toBe("");
  });

  it("screens and prevents the entry of Supabase service-role keys", () => {
    const settings = JSON.parse(JSON.stringify(DEFAULT_SETTINGS));
    settings.supabase.anonKey = "service-role-key-test-value";
    
    const safety = evaluateSettingsSafety(settings);
    expect(safety.serviceRoleDetected).toBe(true);

    const saved = filterSettingsBeforeSave(settings);
    expect(saved.supabase.anonKey).toBe("");
  });

  it("validates that core traceability elements default to ON", () => {
    expect(DEFAULT_SETTINGS.traceabilityPolicy.requireEvidenceForEveryClaim).toBe(true);
    expect(DEFAULT_SETTINGS.traceabilityPolicy.requireAssumptionsList).toBe(true);
    expect(DEFAULT_SETTINGS.traceabilityPolicy.requireCounterHypothesis).toBe(true);
  });
});

describe("Mock LLM Provider Outputs Validation", () => {
  it("returns ok true and states that no remote execution was performed during connection tests", () => {
    const response = executeMockLlmCall({ task: "test_connection", provider: "mock" });
    expect(response.ok).toBe(true);
    expect(response.message).toContain("No external LLM call was made");
  });

  it("generates structured report section contracts containing valid traceability properties offline", () => {
    const contract = executeMockLlmCall({
      task: "generate_audit_section",
      evidence_refs: ["EV_JIRA_01", "EV_WORKFLOW_02"],
      section_type: "work_system_coherence"
    });

    expect(contract.title).toBe("Work System Coherence");
    expect(contract.evidence_refs).toContain("EV_JIRA_01");
    expect(contract.assumptions).toBeDefined();
    expect(contract.kpis).toContain("workflow_variance");
    expect(contract.confidence).toBe("medium");
    expect(contract.visualization.type).toBe("bar_chart");
    expect(contract.human_review_status).toBe("required");
    expect(contract.limitation).toContain("Mock output");
  });
});
