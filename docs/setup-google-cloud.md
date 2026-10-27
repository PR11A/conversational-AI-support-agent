# Setup: Google Cloud + Dialogflow CX (first time)

Project 1 · Do this before building stage 1 · Takes about 30–45 minutes
Stop after Step 6. Everything after that is in [spec-stage1.md](spec-stage1.md).

**Progress (Oct 24):** Steps 1–3 done. Free trial active ($427 credit, expires Jan 23, 2027). Project is named **Conversational Agent - Bank** (used instead of harbourline-support below). Budget **Project 1 monthly cap** ($10, alerts 50/90/100%) created. Steps 4–6 done Oct 24: flow agent created (shown as "Conversational support…"), conversation history + Cloud Logging on, generative features left off.

**Your IDs (not secrets, but keep them out of GitHub; Claude Code puts them in a git-ignored `.env`):**
- Project ID: `(kept out of GitHub; it lives in your private note and evals/.env)`
- Location: `global`
- Agent ID: `ec79e019-4ec4-4708-ba79-d667d16309ba`

Screens and button names change often. If something doesn't match, tell me in the thread what you see and I'll adjust.

---

## Before you start
- A Google account (your normal Gmail is fine).
- A credit or debit card. Google needs one to open a billing account, even when usage is covered by free credits.
- 5 minutes to read the "What it costs" box below.

> **What it costs (checked Oct 19, 2026 on Google's pricing page)**
> - Flow (deterministic) chat turn: **$0.007**. Playbook (generative) chat turn: **$0.012**. Stage 1 is flows only, so the cheaper rate applies.
> - New users get **$1,000 Playbook credit + $600 Flows credit**, valid 12 months, starting automatically the first time you use the agent.
> - A 5-turn test conversation costs about $0.06, so even 1,000 eval runs stays inside the credit.
> - **A budget alert only emails you. It does not stop spending.** That's why Step 3 matters and why you check it once a week.

---

## Step 1 · Open Google Cloud and start billing
1. Go to **console.cloud.google.com** and sign in.
2. If you see a banner offering a **free trial** (often $300 credit), click **Activate** / **Start free**.
   - Choose your country, accept the terms, choose **Individual** account type, and enter your card.
   - On the free trial, Google doesn't charge your card unless you later choose to upgrade to a paid account yourself.
3. If you don't get a trial offer, follow the prompts to **create a billing account** with your card.

✅ Done when the top of the console shows your name and no "set up billing" warning.

## Step 2 · Create a project for Project 1
1. Click the **project picker** at the top left (it may say "My First Project" or "Select a project").
2. Click **New project**.
3. Project name: **harbourline-support**. Leave Organization as "No organization". Click **Create**.
4. When it's ready, select it in the project picker.
5. Copy the **Project ID** shown in the picker (it may have numbers on the end, like `harbourline-support-123456`). Paste it into a note; Claude Code needs it later.

✅ Done when the project picker shows harbourline-support.

## Step 3 · Set a budget alert (do not skip)
1. Open the menu (☰, top left) → **Billing**.
2. In the left menu click **Budgets & alerts** → **Create budget**.
3. **Scope**
   - Name: **Project 1 – monthly cap**
   - Time range: **Monthly**
   - Projects: select **harbourline-support**
   - Leave the **Credits** boxes ticked, so the budget tracks what you'd actually pay after free credits.
   - Click **Next**.
4. **Amount**
   - Budget type: **Specified amount**. Amount: **$10**. Click **Next**.
5. **Actions**
   - Thresholds: **50%, 90%, 100%** (all "Actual").
   - Tick **Email alerts to billing admins and users**.
   - Click **Finish**.

✅ Done when "Project 1 – monthly cap" appears in the budget list.
Weekly habit: Billing → **Credits** to see remaining credit, and Billing → **Reports** to see spend.

## Step 4 · Open the Conversational Agents console
1. Go to **conversational-agents.cloud.google.com**.
2. Select your project (**Conversational Agent - Bank**) if it asks for one.
   - Use this site, not the "Create an agent" button on the Cloud console home page, which opens a different product.
3. If it asks you to **enable an API** (for example the Dialogflow API), click **Enable** and wait for it to finish.

## Step 5 · Create the agent
1. Click **Create agent** → **Build your own**.
2. Fill in:
   - Display name: **Harbourline Support**
   - Location: **global**
   - Time zone: yours
   - Default language: **English**
   - Conversation start: **Flow** (stage 1 is flow first, see decision D2)
3. Click **Create**. The console opens the **Default Start Flow**. Don't change anything in it yet.

✅ Done when you can see the Default Start Flow for Harbourline Support.

## Step 6 · A few quick settings, then stop
1. Click the **⚙️ gear icon** in the top toolbar (right side, it opens **Settings**). Ignore the "Go to CX Agent Studio" banner; that's a different product.
2. On the **General** tab, scroll to **Logging settings**. Tick **Enable conversation history** and **Enable Cloud Logging** (free at our volume: 50 GB of logs a month at no charge). Leave BigQuery export off. Click **Save** at the top. This is how we see test chats in stage 1.
3. Generative fallback: **nothing to do**. It's off by default on a new flow agent, which is what stage 1 wants (no AI-written replies). The model choice waits for the stage 2 playbook (D8).
4. Copy the **Agent ID**: it's the long code in the browser address bar right after `/agents/`. Put it in your note next to the Project ID.

✅ Setup is done. Reply in the thread with "setup done", and we'll start the stage 1 build from [spec-stage1.md](spec-stage1.md).

---

## Things not to do
- Don't put your card number, Project ID notes or any key files into GitHub.
- Don't create service account keys. Claude Code will log in with `gcloud auth application-default login` when we get to evals.
- Don't set ANTHROPIC_API_KEY anywhere (master doc rule). This project doesn't need it at all.
