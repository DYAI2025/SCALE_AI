# AI Agile Audit Intake Prototype

A locally-runnable, highly polished clickable frontend prototype for an AI-assisted Agile, Change, and Framework-Fit audit intake and early reasoning tool.

## How to run

1. Install dependencies (if needed):
   ```bash
   npm install
   ```
2. Run the development server:
   ```bash
   npm run dev
   ```

---

## What works

- **8-Step Wizard Stepper**: Includes a persistent, interactive checkloaded sequence navigator with forwards/backwards controls.
- **Corporate Audit Scope Configurator**: Validates baseline parameters (name, goals, restrictions).
- **Company Identity Resolver**: Simulates registry searches and supports manual entries alongside an instant "Load Demo Company" quick-triage profiles.
- **Core Actionable AI Work Order**: Interactive parameters checklists allowing custom configuration of LLM constraints.
- **Narrative vs Observable Alignment Metric**: Compares corporate framework claims with empirical routines tracker to identify decouplings.
- **Local Telemetry File Preview**: Drag-and-drop or copy-pasted JIRA CSV spreadsheets. Detects mapping attributes and missing metrics columns in local sandbox memory.
- **Cynefin Sensemaking Classifier Engine**: 11-point multidimensional slider profiling work context to generate a qualitative sensemaking hypothesis.
- **Anomalies and Gaps Diagnostic Ledger**: Calculates completeness, flags frame conflicts, drafts counter-hypotheses, and generates research questions.

---

## What is simulated

- **AI research**: Company industry enrichment is simulated via local deterministic mapping rules.
- **Company enrichment**: Data points have mock metadata mapping flags depending on active mode inputs.
- **Hypothesis generation**: Advanced recommendations use custom heuristic frameworks based on input parameters instead of open-ended live models.

---

## What is click-dummy

- **Jira OAuth**: Real OAuth redirection workflows are simulated inside offline notices.
- **OpenCorporates live API**: The commercial indexing is bypassed.
- **German Unternehmensregister**: Instructions are provided to look up identifiers manually inside an off-screen portal.
- **Real LLM calls**: No active model keys are required.
- **Backend persistence**: Client session states are held cleanly inside LocalStorage and local memory.
- **Final report export**: The summary snapshot copies a structured JSON to the clipboards.

---

## Data truth policy

No demo, mock, inferred, or click-dummy data is presented as real. Clear state chips (`real`, `manual`, `uploaded`, `demo`, `inferred`, `missing`, `adapter-ready`, `click-dummy`) specify source groundedness across all data tables and dashboards.

---

## Next implementation steps

1. Add backend persistence.
2. Add authentication.
3. Add Jira OAuth.
4. Add company data adapter.
5. Add LLM provider abstraction.
6. Add audit ledger.
