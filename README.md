# AI Agile Audit Intake Prototype

A locally-runnable, highly polished clickable frontend prototype for an AI-assisted Agile, Change, and Framework-Fit audit intake and early reasoning tool.

## Iteration 1: Settings Center + Traceability Foundation

### What this iteration implements
- **Settings Center**: Sidebar controller coordinating project and model states.
- **LLM Provider configuration**: Mappings targeting Gemimi, OpenAI, Anthropic, OpenRouter, and local Mock.
- **Supabase configuration UI**: Connection coordinates forms with secure client builders.
- **SQL schema preview**: Renders expected database tables structures inline block.
- **Data source defaults**: Multi-format adapter support matrices tracking files upload status.
- **Traceability policy**: Verification contracts enforcing evidence, KPIs, and counter-hypotheses.
- **Audit defaults**: Set of initial assessment windows, languages, output formats, and audiences.
- **Prototype safety status**: Realtime checks monitoring direct browser key exposures and RLS.
- **Mock LLM provider**: Simulates connection handshakes and draft section contract synthesis offline.
- **Local settings persistence**: Updates saved reliably under `scale_ai_audit_settings_v1`.

### What works
- Configure mock provider and credentials metadata.
- Configure Supabase coordinates safely without exposing private key headers.
- Enforce strict traceability checklists.
- Clear sandbox state back to defaults.
- View real-time security alerts.

### What is not built yet
- Real Jira OAuth connection queries.
- Automated migrations executing remote DDL scripts directly from frontend panels.
- Live LLM API calls outside sandboxed mock modes.

### Security Note
Do not use real customer data in browser-prototype API key mode. Do not store service-role keys in the frontend. Use Supabase Edge Functions for production provider calls.

---

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

## Data & Feature Truth Table

| Feature / Workspace Coordinate | Operational Status | Groundedness / Code Mechanism | Details |
| :--- | :--- | :--- | :--- |
| **Company Identity Search** | **Simulated & Manual** | Local deterministic mapping rules (`demo` or `manual` data status) | Avoids external commercial API keys and bypasses OpenCorporates indexing. |
| **German Unternehmensregister** | **External Linkout Only** | Explicit portal hyperlink provided in UI | Offloads register checks safely to separate manual tab. No hidden integrations. |
| **Jira Integration** | **Click-Dummy & File Upload** | Local client-side file reading (CSV/JSON upload) with simulated inline notices | Active Jira accounts and OAuth redirections are deactivated. Processes datasets entirely in browser memory. |
| **Heuristic Scoring Models** | **Local Rule-Based Process** | Pure deterministic scoring engine (`src/utils/auditLogic.ts`) | Calculates Cynefin assessments, contradictions, and data quality on local state. No LLM prompts or backend payloads. |
| **Backend Persistence** | **Offline Sandbox** | Standard client-side state / LocalStorage | Entirely local to the client session. Zero automated background network data synchronization. |
| **Audit Snapshot Export** | **Client-Side File Generation** | Triggerable JSON file download or text copy | Client-side creation only. No remote server-side document rendering. |

---

## Data truth policy

No demo, mock, inferred, or click-dummy data is presented as real. Clear state chips (`real`, `manual`, `uploaded`, `demo`, `inferred`, `missing`, `adapter-ready`, `click-dummy`) specify source groundedness across all data tables and dashboards.

---

## QA Checklist Status

- [x] **Truth-Boundary Copy Auditing**: Misleading telemetry and server/API connectivity claims removed.
- [x] **Demo-Provenance Verification**: All demo seed profile attributes updated with explicit local testing origin tags.
- [x] **Unit Testing Implementation**: Introduced `vitest` unit tests checking all principal deterministic scoring algorithms.
- [x] **Local & Offline Sovereignty**: Sandboxed client execution strictly preserved as local-by-default.

---

## Unresolved Deferred Gaps

- **Jira OAuth Consent**: Direct integration with individual tenant workflows is in mock mode.
- **Enterprise DB Connector**: Integration with relational tables or persistent clouds is omitted to maintain isolated offline execution.
- **OpenCorporates Direct API**: Automatic payload resolution remains mocked with local presets.
- **Server-Side PDF Reporting**: Deferred to client-side JSON downloads for absolute privacy.

---

## Next implementation steps

1. Add backend persistence.
2. Add authentication.
3. Add Jira OAuth.
4. Add company data adapter.
5. Add LLM provider abstraction.
6. Add audit ledger.

