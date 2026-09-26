# WorkFlowOS

WorkFlowOS is a local workflow-intelligence prototype that records semantic activity, discovers task-sized workflow candidates, requires explicit approval, and executes approved workflows through persisted local integrations.

## Architecture

```text
React + Vite → Express REST API → deterministic workflow engine → persistent local data
```

`prisma/schema.prisma` documents the target SQLite/Prisma production data model. The runnable demo currently uses `server/data.json` so it launches without a database generation step.

## Run

```powershell
npm install
npm run dev
```

Open the displayed Vite address, click **Start Demo**, then use the demo workspace sign-in action. The server starts on port 3001 and Vite proxies `/api` to it.

## Chrome extension observer

The optional Manifest V3 extension in `extension/` sends privacy-safe **semantic** browser events to the same local activity API used by the dashboard. It captures only page opens, searches, form submissions, likely file-download clicks, and likely email-open clicks. It does not capture typed values, passwords, payment data, cookies, authentication tokens, private message/email contents, or page HTML.

1. Start WorkFlowOS with `npm run dev` (the Express API must be available at `http://localhost:3001`).
2. In Chrome, open `chrome://extensions`, enable **Developer mode**, and choose **Load unpacked**.
3. Select the repository's `extension/` directory.
4. Open the WorkFlowOS Observer popup and choose **Start Observation**.
5. Browse normally, then open WorkFlowOS → **Activity** to see the submitted semantic events.
6. Choose **Stop Observation** in the popup to stop submissions. The setting persists in Chrome local storage.

## Environment

Copy `.env.example` to configure optional AI understanding. `OPENAI_API_KEY` is optional. When present, the server uses the official OpenAI SDK to turn normalized semantic activity tokens into a structured workflow proposal; a timeout, API failure, or invalid response always falls back to the local deterministic interpreter.

## Demo flow

Launch Demo → Activity → **Run Customer Request Demo** → Discoveries → **Discover Workflows** → Review → Simulation → Approve → Run now → Analytics.

The primary workflow is:

```text
Gmail → Files → CRM Search → CRM Update → Slack
```

`Run Customer Request Demo` records the semantic customer-request sequence. Running the approved workflow updates the local CRM record for ABC Technologies, persists a `#customer-support` message, and creates an execution record.

## Pipeline

Observe → Understand → Detect Repetition → Generate Workflow → User Approval → Automate → Learn.

## Project structure

```text
src/        React application and UI
server/     Express API, workflow engine, and persisted local data
extension/  Chrome Manifest V3 semantic activity observer
test/       Discovery, API, approval, routing, and execution tests
prisma/     Future SQLite/Prisma schema reference
```

## Implementation boundaries

### Real implementation

- Chrome semantic browser activity ingestion
- Express backend and `server/data.json` persistence
- Deterministic workflow discovery and duplicate prevention
- Optional OpenAI-backed workflow understanding of normalized semantic activity only, with deterministic fallback
- Review, simulation, explicit approval, and execution gating
- Local CRM mutation, Slack-message persistence, execution history, and analytics

### Simulated/local integrations

- Gmail request context
- CRM and Slack adapters
- Attachment processing

The AI layer never receives browser HTML, typed values, credentials, cookies, tokens, email/message contents, or raw form data. It proposes workflow understanding only; human approval remains required before any local simulated CRM or Slack execution.

### Future work

- Gmail OAuth and Slack API integration
- Desktop/OS-level activity agent
- Real browser automation
- Accessibility/UI automation and computer-vision fallback
- SQLite/Prisma runtime migration

## Limitations

The runnable prototype persists to local JSON. The included Prisma schema documents a future SQLite migration target; it is not used at runtime. External accounts and OS-level automation are not connected.
