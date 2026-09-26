# WorkFlowOS

### AI-Powered Workflow Intelligence & Automation

> **Observe → Detect → Understand → Approve → Automate**

WorkFlowOS is a browser-level workflow-intelligence prototype that turns repeated semantic activity into reviewable automation proposals. It observes privacy-safe browser signals, deterministically detects recurring task patterns, uses Groq AI to explain the task in structured terms, and runs an approved workflow through local simulated adapters.

It is built around a simple principle: AI helps explain *what work is being done*; people remain in control of *whether it runs*.

Repository: [pallaviim/workflowOS](https://github.com/pallaviim/workflowOS)

## Highlights

- Learns from repeated observed activity instead of requiring every workflow to be configured by hand.
- Separates deterministic pattern detection from AI-powered workflow understanding.
- Produces a structured proposal: intent, trigger, steps, failure condition, and human-intervention requirement.
- Requires explicit review and approval before execution.
- Persists activity, workflows, executions, CRM state, and local Slack messages in `server/data.json`.
- Includes a Manifest V3 Chrome observer, automated tests, linting, and production build support.

## The problem

Repetitive cross-application work is often discovered informally, then automated with brittle one-off scripts. That leaves people to identify the pattern, translate it into steps, and decide whether it is safe to run.

## The WorkFlowOS approach

WorkFlowOS detects a repeated semantic sequence first. Only after that deterministic step does the AI layer interpret what the sequence represents. The resulting proposal stays inactive until a person reviews and approves it.

```text
Chrome Activity Observer
          ↓
Privacy-safe semantic events
          ↓
Deterministic discovery and clustering
          ↓
Repeated workflow candidate
          ↓
Groq workflow understanding
          ↓
Structured proposal + human review
          ↓
Approved local execution
```

## How it works

| Stage | Responsibility | What happens |
| --- | --- | --- |
| Observe | Chrome extension | Captures high-level semantic browser events. |
| Detect | Workflow engine | Normalizes events, extracts task-sized windows, clusters similar sequences, and calculates occurrence, similarity, duration, and opportunity metrics. |
| Understand | Groq AI | Converts an already-detected semantic sequence into a structured workflow proposal. |
| Approve | User | Reviews, simulates, approves, rejects, pauses, or resumes a workflow. |
| Automate | Execution engine | Runs active workflows through local simulated Gmail, Files, CRM, and Slack adapters. |

## AI workflow understanding

Groq is used only at the workflow-understanding boundary. It does **not** decide whether an activity is repetitive, generate metrics, or execute actions.

The server sends the minimum normalized semantic context required to explain a candidate, for example:

```json
{
  "semanticActivity": [
    "open_email",
    "download_attachment",
    "search_customer",
    "update_customer",
    "send_message"
  ]
}
```

Using Groq's OpenAI-compatible API and `openai/gpt-oss-20b`, the service requests validated structured output:

```json
{
  "intent": "string",
  "trigger": "string",
  "steps": ["string"],
  "failureCondition": "string",
  "requiresHumanIntervention": true
}
```

If `GROQ_API_KEY` is unavailable, Groq is unreachable, or its output fails validation, WorkFlowOS uses the existing deterministic understanding fallback. The source is recorded as either `ai` or `deterministic-fallback`.

## Primary demo: Process Customer Request

The demo shows a customer-request workflow spanning Gmail, Files, CRM, and Slack:

```text
Gmail: Open customer email
          ↓
Files: Download attachment
          ↓
CRM: Search customer → Update customer record
          ↓
Slack: Notify the relevant team
```

Its semantic signature is:

```text
OPEN_EMAIL → DOWNLOAD_FILE → CRM_SEARCH → CRM_UPDATE → SLACK_MESSAGE
```

For this pattern, the proposal can describe an intent such as **Process Customer Request**, with a Gmail trigger, five reviewable steps, a `Customer not found` failure condition, and required human intervention.

## Human approval and safety

No discovered workflow runs automatically.

```text
Discovered / needs approval
          ↓
Review and optional simulation
          ↓
Approve
          ↓
Active
          ↓
Run now
```

Users can reject, pause, and resume workflows. The backend rejects execution unless a workflow is active. The Safety Center can pause all active workflows.

If the customer lookup fails during the local demo execution, the execution is recorded as failed at CRM search, human intervention is required, and no Slack notification is created.

## Architecture

```text
React + Vite UI
        ↓
Express REST API
        ↓
server/data.json (local persistence)
        ↓
Deterministic workflow engine
        ↓
Groq AI understanding (optional)
        ↓
Approval + execution engine
        ↓
Local simulated Gmail / Files / CRM / Slack adapters
```

## Tech stack

| Area | Implementation |
| --- | --- |
| Frontend | React, Vite, React Router, Lucide |
| Backend | Node.js, Express, Zod |
| AI understanding | Groq OpenAI-compatible API, `openai/gpt-oss-20b` |
| Observation | Chrome Extension, Manifest V3 |
| Persistence | Local JSON in `server/data.json` |
| Quality checks | Node test runner, syntax linting, Vite production build |

## Chrome Activity Observer

The optional extension in `extension/` sends semantic activity to the local API. Supported event types are:

```text
PAGE_OPEN · SEARCH · FORM_SUBMIT · DOWNLOAD_FILE · OPEN_EMAIL
```

This is browser-level observation, **not** a desktop or OS-level monitoring agent.

### Load the extension

1. Start WorkFlowOS with `npm run dev`.
2. Open `chrome://extensions` in Chrome.
3. Enable **Developer mode**.
4. Select **Load unpacked** and choose the repository's `extension/` directory.
5. Use the WorkFlowOS Observer popup to start or stop observation.

## Setup

```powershell
git clone https://github.com/pallaviim/workflowOS.git
cd workflowOS
npm install
Copy-Item .env.example .env
```

Groq understanding is optional. Set a server-side key in `.env` to enable it:

```dotenv
GROQ_API_KEY=
```

Without a key, the project remains runnable through deterministic workflow understanding.

## Run and validate

```powershell
npm run dev
```

The Express API runs on `http://localhost:3001`; Vite serves the frontend and proxies `/api` requests to it.

```powershell
npm test
npm run lint
npm run build
```

## Demo flow

1. Open the app and launch the demo workspace.
2. Go to **Activity** and select **Run Customer Request Demo** to record the clean semantic sequence.
3. Go to **Discoveries** and select **Discover Workflows**.
4. Review the detected workflow, optionally run a simulation, then approve it.
5. Select **Run now** from the active workflow.
6. Inspect the local CRM state, persisted Slack message, execution history, and analytics.

## Privacy and security boundaries

The extension and AI layer intentionally avoid collecting or transmitting:

- Passwords, cookies, authentication tokens, or payment information
- Arbitrary typed keystrokes and form values
- Raw webpage HTML or page source
- Complete email bodies or private message contents

Only normalized semantic activity is sent to the optional AI understanding service. API keys stay server-side and are excluded from Git via `.gitignore`.

## What is real today

- Chrome Manifest V3 semantic activity ingestion
- Local Express API and JSON persistence
- Deterministic sequence normalization, window extraction, clustering, duplicate prevention, and scoring
- Groq-backed structured workflow understanding with deterministic fallback
- Workflow review, simulation, approval gating, execution records, and analytics
- Local CRM mutation and Slack-message persistence

## Current prototype scope

The Gmail, Files, CRM, and Slack integrations are local simulated adapters. WorkFlowOS does not currently perform Gmail API, Slack API, or external CRM API operations. Prisma is included as a future schema reference only; it is not the runtime persistence layer.

## Roadmap

- OAuth-backed Gmail, Slack, and CRM integrations
- Broader workflow-capability registry and real adapter implementations
- Desktop/OS-level activity agent
- Browser and accessibility automation where appropriate
- SQLite/Prisma runtime persistence

## Vision

WorkFlowOS is exploring a safer way to automate work: observe the patterns people already repeat, use AI to make those patterns understandable, and keep humans in control of every workflow that becomes active.
