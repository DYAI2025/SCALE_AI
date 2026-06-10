# AI Agile Audit Intake & Traceability Prototype

A locally-runnable, highly polished clickable frontend prototype for an AI-assisted Agile, Change, and Framework-Fit audit intake and early reasoning tool.

---

## Iteration 1 & 2: Settings, Traceability & Audit Intelligence

### What this prototype implements
- **System Settings Center**: Sidebar controller coordinating project, model, and database states.
- **LLM Provider Configuration**: Explicit toggles for Gemini, OpenAI, Anthropic, OpenRouter, and a sandboxed offline **Mock Provider**.
- **Supabase Configuration UI**: Security credentials form showing clear warnings, screening against service-role keys, and featuring local SQL schema viewer.
- **Traceability Policy Matrix**: Configurable default policies mandating evidence linking, limitation scoping, and alternative explanations before draft reports compile.
- **Traceability Lab (Iteration 2)**: An interactive verification workspace housing our core evidence tracing panels:
  - **Evidence Item Manager**: Tracks qualitative source logs, interview facts, and scoping limitations. Supports adding manual items on-the-fly.
  - **Audit Variable Registry**: Groups, defines, and maps quantitative metrics (derived from data uploads) back to physical records.
  - **Report Section Contract Builder**: Renders and validates draft section structures against active Traceability Policies in real-time.
  - **Traceability Chain Explorer**: Visualizes relational paths from synthesized findings down to original supporting datasets.
  - **Visualization Contract Blueprint**: Checks telemetry data completeness across 8 chart schemas to guide developers on coordinate bindings.

### What works (Grounded Rules & Core Engines)
- Configure mock provider connection details with zero external network exposures.
- Enforce strict traceability policies on section drafts and trigger auto-rejection when claims lack evidence.
- Run multi-category quantitative variables (e.g. Lead Time Medians, Workflow counts, and Link Densities) safely.
- Clear sandbox state instantly, keeping session states fully localized to client memory buffers.
- Run all unit tests locally with `npm run test` using `vitest`.

### What is safely simulated or mock
- **Real Jira OAuth**: Abstracted via local client-side CSV uploads and field parsing suggestions.
- **Live LLM Remote Runs**: Simulated through deterministic mock response structures that include confidence margins and scannable evidence tags.
- **Supabase Cloud State**: The UI allows inputting coordinates to demo state flows, but keeps execution safely browser-prototype-only by default.

---

## How to run

1. Install dependencies:
   ```bash
   npm install
   ```
2. Run the development server (localhost:3000):
   ```bash
   npm run dev
   ```
3. Run the complete Vitest unit test suite:
   ```bash
   npm run test
   ```

---

## Data & Feature Truth Table

| Feature / Workspace Coordinate | Operational Status | Groundedness / Code Mechanism | Details |
| :--- | :--- | :--- | :--- |
| **Company Identity Search** | **Simulated & Manual** | Local deterministic mapping rules (`demo` or `manual` data status) | Avoids external commercial API keys and bypasses OpenCorporates indexing. |
| **German Unternehmensregister** | **External Linkout Only** | Explicit portal hyperlink provided in UI | Offloads register checks safely to separate manual tab. No hidden integrations. |
| **Jira Integration** | **Click-Dummy & File Upload** | Local client-side file reading with column mapping proposals | Active Jira accounts and OAuth redirections are deactivated. Processes datasets entirely in browser memory. |
| **Heuristic Scoring Models** | **Local Rule-Based Process** | Pure deterministic scoring engine (`src/utils/auditLogic.ts` & `src/utils/settingsSafety.ts`) | Calculates Cynefin assessments, contradictions, and data quality on local state. No LLM prompts or backend payloads. |
| **Traceability Lab Workspaces** | **Local Interactive Engine** | React state compilation against predefined traceability models | Dynamically audits evidence links and flags missing metrics, scoping limits, or alternative explanations instantly. |
| **Backend Persistence** | **Offline Sandbox** | Standard client-side state / LocalStorage | Entirely local to the client session. Zero automated background network data synchronization. |
| **Audit Snapshot Export** | **Client-Side File Generation** | Triggerable JSON file download or text copy | Client-side creation only. No remote server-side document rendering. |

---

## Data truth policy

No demo, mock, inferred, or click-dummy data is presented as real. Clear state chips (`real`, `manual`, `uploaded`, `demo`, `inferred`, `missing`, `adapter-ready`, `click-dummy`) specify source groundedness across all data tables and dashboards.

---

## QA Checklist Status

- [x] **Truth-Boundary Copy Auditing**: Removed all claims of background server-side connections. downgrading the AI Studio frame capabilities to standard web mode.
- [x] **Demo-Provenance Verification**: Seeded 5 Evidence Items and 7 Audit Variables with clear local telemetry origins, limitations, and alternatives.
- [x] **Settings defaults isolation**: Extracted settings baseline presets to `/src/config/defaultSettings.ts`.
- [x] **Settings safety sanitization**: Added rules to strip service-role keys automatically and omit api keys from LocalStorage unless `rememberApiKey` is checked.
- [x] **Unit Testing Implementation**: Integrated 18 distinct `vitest` unit tests covering both the deterministic heuristics, active safety filters, and mock provider specs.
- [x] **Traceability Lab UI suite**: Designed 5 sub-views representing all Iteration 2 goals perfectly.
- [x] **Local & Offline Sovereignty**: Sandboxed client execution strictly preserved as local-by-default with zero external live network operations.

---

## Next implementation steps

1. Enable persistent cloud-state authentication and database syncing (Supabase option).
2. Establish real Jira API connections following OAuth user delegation.
3. Integrate real server-side LLM calling schemas via proxy setups.


