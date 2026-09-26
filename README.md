````
**Email → Files → CRM → Slack → Reports**

Existing automation tools usually require users to manually identify and configure these workflows.

WorkFlowOS aims to detect these repetitive patterns automatically and turn them into workflows.

---

## 💡 Solution

WorkFlowOS continuously observes **semantic browser activity** through a Chrome Extension.

It detects repeated sequences such as:

```text
Open Email
→ Download Attachment
→ Search Customer in CRM
→ Update CRM
→ Notify Team in Slack
````

The detected activity is then sent to an AI workflow-understanding layer powered by **Groq**.

The AI converts the activity sequence into a structured workflow containing:

- Intent
- Trigger
- Workflow steps
- Failure conditions
- Human intervention requirements

The user reviews and approves the workflow before it can execute.

---

## 🤖 AI Integration

WorkFlowOS uses **Groq's OpenAI-compatible API** for workflow understanding.

### AI Model
```
openai/gpt-oss-20b
```

The AI receives only sanitized semantic activity such as:
```
open_email
download_attachment
search_customer
update_customer
send_message
```

It does **not** receive:

- Passwords
- Cookies
- Authentication tokens
- Payment information
- Typed keystrokes
- Form values
- Raw page HTML
- Private email/message contents

AI is responsible for **understanding the workflow**.

The deterministic workflow engine remains responsible for:

- Detecting repetition
- Workflow validation
- Approval
- Execution
- Safety checks

---

## 🔄 End-to-End Flow
```
Chrome Activity
      ↓
Semantic Activity Events
      ↓
Repetition Detection
      ↓
Workflow Candidate
      ↓
Groq AI Understanding
      ↓
Structured Workflow
      ↓
User Review & Approval
      ↓
Workflow Execution
      ↓
Execution History & Analytics
```

---

## 🎯 Primary Demo Workflow

### Handle Customer Request from Email
```
Gmail
  ↓
Open Customer Email
  ↓
Download Attachment
  ↓
CRM
  ↓
Search Customer
  ↓
Update Customer Record
  ↓
Slack
  ↓
Notify Relevant Team
```

Example workflow:
```
Intent:
Process Customer Request

Trigger:
New customer request received in Gmail

Steps:
1. Identify customer from email
2. Download relevant attachment
3. Find customer in CRM
4. Update customer record
5. Notify relevant team in Slack

Failure Condition:
Customer not found

Human Intervention:
Required
```

---

## 🔐 Human Approval

WorkFlowOS does not automatically execute newly discovered workflows.

Workflow lifecycle:
```
Discovered
    ↓
Review
    ↓
Approve
    ↓
Active
    ↓
Run
```

Users can also reject, pause, or resume workflows.

Only approved and active workflows can execute.

---

## ⚙️ Execution

The current prototype uses local simulated integrations for:

- Gmail
- CRM
- Slack
- File processing

A successful execution records:
```
Gmail → Files → CRM → Slack
```

Execution history stores:

- Workflow
- Status
- Start/end time
- Duration
- Individual steps
- Failed step
- Human intervention requirement
- Outcome

The prototype does not claim to perform real Gmail or Slack API actions yet.

---

## 🧩 Architecture
```
┌─────────────────────────────┐
│       React / Vite UI       │
└──────────────┬──────────────┘
               ↓
┌─────────────────────────────┐
│       Express Backend       │
└──────────────┬──────────────┘
               ↓
┌─────────────────────────────┐
│ Persistent Local Data Store │
│       server/data.json      │
└──────────────┬──────────────┘
               ↓
┌─────────────────────────────┐
│    Workflow Engine          │
│ Discovery + Validation      │
└──────────────┬──────────────┘
               ↓
┌─────────────────────────────┐
│     Groq AI Understanding   │
└──────────────┬──────────────┘
               ↓
┌─────────────────────────────┐
│ Approval + Execution Engine │
└─────────────────────────────┘
```

---

## 🛠️ Tech Stack

| TechnologyPurpose |                              |
| ----------------- | ---------------------------- |
| React             | Frontend                     |
| Vite              | Frontend tooling             |
| Node.js           | Backend runtime              |
| Express.js        | REST API                     |
| Groq              | AI workflow understanding    |
| Chrome Extension  | Browser activity observation |
| JSON Persistence  | Local application data       |
| JavaScript        | Application logic            |

---

## 🌐 Chrome Extension

The Chrome Extension observes high-level browser activity.

Supported semantic events include:
```
PAGE_OPEN
SEARCH
FORM_SUBMIT
DOWNLOAD_FILE
OPEN_EMAIL
```

The extension intentionally avoids collecting sensitive information.

### Setup

1. Start the WorkFlowOS application.
```
npm run dev
```

2. Open Chrome.
3. Go to:
```
chrome://extensions
```

4. Enable **Developer mode**.
5. Select **Load unpacked**.
6. Choose:
```
extension/
```

7. Open the extension and start observation.

---

## 💻 Installation

Clone the repository:
```
git clone https://github.com/pallaviim/workflowOS.git
cd workflowOS
```

Install dependencies:
```
npm install
```

Create your environment file:
```
.env
```

Add:
```
GROQ_API_KEY=your_groq_api_key
```

Start the application:
```
npm run dev
```

The application runs at:
```
http://localhost:5173
```

Backend:
```
http://localhost:3001
```

> Never commit your `.env` file or API key.

---

## 🎬 Demo Flow

For the hackathon demonstration:

1. Start WorkFlowOS.
2. Start Chrome activity observation.
3. Generate the customer-request activity sequence.
4. Open **Discoveries**.
5. Show the AI-understood workflow.
6. Open **Review**.
7. Review the Gmail → Files → CRM → Slack workflow.
8. Approve the workflow.
9. Run the workflow.
10. Show the simulated CRM update.
11. Show the Slack notification.
12. Show execution history and analytics.

---

## 🧪 Testing

Run the test suite:
```
npm test
```

Also verify:
```
npm run lint
npm run build
```

The project includes tests for:

- Workflow discovery
- AI workflow understanding
- Approval states
- Workflow execution
- Safety controls
- Chrome extension behavior
- API behavior

---

## 🔒 Privacy & Security

WorkFlowOS follows a semantic-observation approach.

The Chrome Extension does not intentionally collect:

- Passwords
- Cookies
- Authentication tokens
- Payment information
- Arbitrary keystrokes
- Form values
- Raw webpage HTML
- Private message contents

Only high-level activity events required for workflow discovery are recorded.

---

## ⚠️ Current Prototype Scope

The current implementation is a **browser-level prototype**.

### Implemented

- Chrome activity observation
- Semantic activity events
- Persistent activity storage
- Repetition detection
- Workflow discovery
- Groq AI workflow understanding
- Workflow approval
- Workflow execution engine
- Local CRM simulation
- Local Slack simulation
- Execution history
- Analytics
- Safety controls

### Simulated / Future Integration

- Real Gmail OAuth/API
- Real Slack API
- Real CRM integrations
- Desktop/OS-level activity observation
- Real browser/app automation
- Accessibility-based UI automation
- Computer-vision fallback

---

## 🔮 Future Work

- Desktop and OS-level activity agent
- Real Gmail integration
- Real Slack integration
- Enterprise CRM integrations
- Cross-application automation
- Accessibility-based automation
- Computer vision fallback
- More advanced workflow learning
- Enterprise authentication and deployment

---

## 🌟 Vision

WorkFlowOS aims to move automation from:

> **"Tell the system what to automate."**

to:

> **"Show the system what you repeatedly do, and let it help turn that behavior into an approved workflow."**

---

## 👩‍💻 Built With

**React · Node.js · Express · Chrome Extensions · Groq AI**



all of this shd be pasted?
