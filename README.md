# WorkFlowOS

WorkFlowOS is a local, hackathon-ready workflow-intelligence prototype: it captures **synthetic demo activity**, normalizes actions, proposes a workflow, lets a user review it, simulates execution, then records the result.

## Architecture

```text
React + Vite → Express REST API → workflow engine → persistent local data
```

`prisma/schema.prisma` documents the target SQLite/Prisma production data model. The runnable demo currently uses `server/data.json` so it launches without a database generation step.

## Run

```powershell
npm install
npm run dev
```

Open the displayed Vite address, click **Start Demo**, then use the demo workspace sign-in action. The server starts on port 3001 and Vite proxies `/api` to it.

## Environment

Copy `.env.example` for future SQLite/OpenAI deployment. `OPENAI_API_KEY` is optional; the application uses local deterministic prototype intelligence when absent.

## Demo flow

Launch Demo → Activity (start observation) → Discoveries → Review → Simulation → Approve → Run now → Analytics. All activity and integrations are explicitly simulated; no OS monitoring or external accounts are used.

## Pipeline

Observe → Understand → Detect → Generate → Approve → Simulate → Automate → Learn.

## Limitations

The runnable prototype persists to local JSON, while the included Prisma schema defines the SQLite migration target. External application execution is deliberately simulated.
