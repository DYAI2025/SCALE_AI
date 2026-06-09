import { describe, it, expect } from "vitest";
import {
  resolveDemoCompany,
  detectFrameworkContradictions,
  suggestMappingsForColumns,
  parseCsvContent,
  parseJsonContent,
  calculateCynefinHypothesis,
  generateInterimHypotheses,
  generateMissingDataQuestions,
  calculateDataQuality
} from "./auditLogic";
import { AuditState, ProductContext, FrameworkReality } from "../types";

describe("auditLogic heuristic engine", () => {
  it("resolves the demo company profile with appropriate demo attributes", () => {
    const profile = resolveDemoCompany();
    expect(profile.name.value).toBe("Acme Flow Systems GmbH");
    expect(profile.name.dataStatus).toBe("demo");
    expect(profile.employeeCount?.value).toBe(420);
  });

  it("detects Scrum contradictions when key practices are missing", () => {
    const reality: FrameworkReality = {
      claimedFramework: "Scrum",
      observablePractices: [], // missing planning, retro, reviews
      roles: ["Developer"], // missing PO, SM
      artifacts: [],
      maturitySignals: {},
      contradictionHints: []
    };
    const hints = detectFrameworkContradictions(reality);
    expect(hints.length).toBeGreaterThan(0);
    expect(hints[0]).toContain("CRITICAL GAP");
  });

  it("suggests high-confidence column mappings for exact matches", () => {
    const headers = ["issue_key", "status", "priority", "random_unrelated_column"];
    const mappings = suggestMappingsForColumns(headers);
    
    const keyMapping = mappings.find(m => m.csvColumn === "issue_key");
    expect(keyMapping).toBeDefined();
    expect(keyMapping?.suggestedField).toBe("issue_key");
    expect(keyMapping?.confidence).toBe("high");

    const statusMapping = mappings.find(m => m.csvColumn === "status");
    expect(statusMapping).toBeDefined();
    expect(statusMapping?.suggestedField).toBe("status");

    const badMapping = mappings.find(m => m.csvColumn === "random_unrelated_column");
    expect(badMapping).toBeUndefined();
  });

  it("parses valid CSV content successfully", () => {
    const csv = "id,type,status\nCORP-1,Story,Done\nCORP-2,Bug,In Progress";
    const result = parseCsvContent(csv, "tickets.csv");
    
    expect(result.fileName).toBe("tickets.csv");
    expect(result.rowCount).toBe(2);
    expect(result.detectedColumns).toEqual(["id", "type", "status"]);
    expect(result.previewRows.length).toBe(2);
    expect(result.previewRows[0]["id"]).toBe("CORP-1");
  });

  it("parses valid JSON content successfully", () => {
    const json = JSON.stringify([
      { key: "CORP-1", type: "Story", status: "Done" },
      { key: "CORP-2", type: "Bug", status: "Progress" }
    ]);
    const result = parseJsonContent(json, "issues.json");

    expect(result.fileName).toBe("issues.json");
    expect(result.rowCount).toBe(2);
    expect(result.detectedColumns).toContain("key");
  });

  it("calculates Cynefin hypothesis domains correctly based on score priorities", () => {
    const context: ProductContext = {
      repeatability: 5,
      standardizability: 5,
      requirementUncertainty: 1,
      technicalUncertainty: 1,
      customerFeedbackDependency: 1,
      regulatoryConstraint: 1,
      errorCost: 1,
      crossTeamDependencies: 1,
      changeFrequency: 1,
      innovationShare: 1,
      operationalUrgency: 1,
      description: "Highly structured standard operations with robust guidelines."
    };

    const result = calculateCynefinHypothesis(context);
    expect(result.primaryDomain).toBe("Clear");
    expect(result.counterHypothesis).toContain("predictable under normal operations");
  });

  it("calculates data quality percentages correctly", () => {
    const dummyState: AuditState = {
      auditCase: {
        id: "1",
        auditName: "Acme",
        companyName: "Acme",
        auditGoal: "Test",
        scopeType: "All",
        confidentialityLevel: "L3",
        allowedDataModes: ["Manual"],
        createdAt: "",
        updatedAt: ""
      },
      companyProfile: resolveDemoCompany(),
      aiWorkOrder: [],
      frameworkReality: {
        claimedFramework: "None",
        observablePractices: [],
        roles: [],
        artifacts: [],
        maturitySignals: {},
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
        regulatoryConstraint: 3,
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
        reasoning: [],
        dataBasis: [],
        missingEvidence: [],
        counterHypothesis: ""
      }
    };

    const quality = calculateDataQuality(dummyState);
    expect(quality.totalCount).toBe(8);
    // Since uploadSummary is missing, it should count 7 out of 8 attributes
    expect(quality.availableCount).toBe(7);
    expect(quality.scorePercent).toBe(88);
  });
});
