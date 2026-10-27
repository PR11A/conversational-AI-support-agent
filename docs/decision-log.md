# Decision Log: Project 1, Harbourline Support Agent

Format per the master doc: Decision · Category · Options considered · Why (with real numbers) · Tradeoff accepted · What would change my mind.
Categories: context, memory, tools/MCP, model, tokens, evals, OKRs/KPIs, observability, APIs.

Status key: **Open** (recommendation only) · **Decided** (you agreed) · **Revisited** (changed later, keep the old reasoning).
Rule: no invented numbers. "Why" stays as a hypothesis until an eval run or bill gives a real number.

---

## D1 · Build path: easy and shine on the same platform? · **Decided Oct 18: one CX bot, two stages** (dates and stage 1 contents revisited Oct 24, see D2)

- **Category:** tools/MCP, APIs
- **Options considered:**
  1. Easy = Next.js + cheap LLM API bot; shine = Dialogflow CX rebuild (as the master doc reads literally).
  2. Both on Dialogflow CX: easy = generative fees FAQ + escalation; shine = add deterministic flows on top. *(Recommended)*
  3. Skip easy, go straight to the CX hybrid.
- **Decision:** the recommended option (both on CX). One Dialogflow CX agent built in two stages: fees FAQ + escalation by Oct 25, deterministic card and dispute flows by Nov 1.
- **Why (hypothesis):** two weeks is tight for a warm-up that also teaches the PRD → spec → evals workflow. Option 1 builds two bots and throws one away; option 2 makes stage 1 a stepping stone and still gives a working "easy" milestone by Oct 25. Option 3 has no safety net if CX learning runs long.
- **Tradeoff accepted:** you don't get a hand-rolled LLM bot in Project 1. You get plenty of that in Projects 2, 3 and 5.
- **What would change my mind:** if CX setup or billing blocks you for more than a day, fall back to option 1 and keep CX for a later stage.

## D2 · Which intents are deterministic vs. generative, and in what order? · **Revisited Oct 24: flow first, AI earns its place**

- **Category:** context, evals
- **Options considered:** all generative; all deterministic; hybrid by risk, **playbook first** (stage 1 generative, flows added in stage 2); hybrid by risk, **flow first** (stage 1 all flows, playbook added in stage 2 only if it passes an eval gate).
- **Decision (P, Oct 24):** hybrid by risk, **flow first.**
  - Lost/stolen card and dispute status are **always flows** (an action or a lookup, where being wrong costs money).
  - **Stage 1:** the whole bot is flows: fixed fee answers, first-ask handoff, lost card (freeze line + handoff), dispute (handoff). No generative features switched on.
  - **Stage 2:** add the lost-card and dispute flows with mock APIs, and build a playbook for fees and open questions. The playbook takes over fees **only if it passes the eval gate** below.
- **Eval gate for the playbook (stage 2, Proposed, not yet agreed by P, see D10):** on the same eval cases, the playbook must score fee accuracy 100% with 0 invented fees, 0 guardrail violations, escalation recall at least as good as the flow, and beat the flow on the "messy phrasing" cases. If it fails, fees stay on the flow and that result is the story.
- **Why (hypothesis):** this is how banks and insurers adopt AI: launch with full control, set a safety bar, expand AI only when evidence says it's safe. It also gives a real before/after (flow baseline vs playbook) on the same tests, instead of a comparison against someone else's bot.
- **Tradeoff accepted:** stage 1 takes about a day longer (example phrases per fee question), so stage 1 moves from Oct 26 to Oct 27. The stage 1 bot will handle odd phrasing badly; that is expected and measured, not fixed in stage 1.
- **What would change my mind:** if the stage 1 flows take more than 2 days to build, cut the fee flow to the 8 most common fees and move on.
- **Evidence note:** a real-world chat (NRMA Insurance, not a bank) reads as flow-style (scripted steps, buttons, fixed wording) and shows the *downside* of flow-only design: rigid menus that ignore a request for a human (see D6). Our stage 1 flow avoids that with first-ask handoff, and stage 2 tests whether AI fixes the phrasing problem.
- **Previous version (kept per the Revisited rule):** "Decided (logged Oct 24): flow + playbook hybrid, playbook first." Stage 1 was a generative playbook for fees and handoff; stage 2 added deterministic flows for lost card and disputes. Reasoning then: fastest path to a working agent, and "launched generative, moved risky paths to flows" as the story. Changed because P preferred a conservative, evidence-gated rollout, which fits regulated industries.

## D3 · North-star metric: containment or safe containment? · **Decided (logged Oct 24): safe containment**

- **Category:** OKRs/KPIs
- **Options considered:** containment rate; resolution rate (CSAT-style); safe containment (contained *and* no guardrail violation) with escalation recall as a counter-metric.
- **Decision:** safe containment ≥ 70%, guarded by escalation recall ≥ 95%.
- **How it's counted (added Oct 24, PRD v1.1):** the denominator is eval conversations whose expected outcome is "bot resolves". Expected handoffs (asks for a human, disputes, complaints, lost card in stage 1) are scored by escalation recall, so honouring a request for a human never lowers the north star.
- **Why (hypothesis):** raw containment can be gamed by a bot that never lets people out. In banking, a missed escalation is worse than an unnecessary one.
- **Tradeoff accepted:** lower headline number than raw containment.
- **What would change my mind:** if the eval set shows recall and containment don't conflict in practice, simplify to containment + violations.

## D4 · Eval harness: promptfoo vs. CX built-in test cases · Open

- **Category:** evals
- **Options considered:** CX's built-in test cases only; promptfoo calling the agent via the CX API (custom provider); both.
- **Recommendation:** promptfoo as the source of truth (it's the portfolio-wide tool and supports LLM-as-judge), CX test cases optional for flow regression.
- **Why (hypothesis):** one eval tool across all 6 projects feeds the Project 6 dashboard. Risk: promptfoo needs a small custom provider to talk to CX. Prove it works on Oct 20.
- **Tradeoff accepted:** a little glue code Claude Code has to write.
- **What would change my mind:** if the custom provider takes more than half a day, use CX test cases for stage 1 and add promptfoo in stage 2.

## D5 · Observability: Langfuse vs. Google's native logging · Open

- **Category:** observability
- **Options considered:** Langfuse via webhook/export; CX conversation history + Cloud Logging/BigQuery; both.
- **Recommendation:** decide during the spec after checking what CX exposes. Lean Langfuse for consistency with Projects 2–6.
- **Why (hypothesis):** CX is a managed platform, so you don't own the model call and can't wrap it with a Langfuse SDK the usual way. That gap is itself a good interview story (managed platform vs. own stack).
- **Tradeoff accepted:** TBD.
- **What would change my mind:** if getting per-turn cost/latency into Langfuse costs more than a day.

## D6 · Escalation design · **Partly decided (logged Oct 24)**

- **Category:** APIs
- **Options considered:** "talk to a human" keyword only; rule-based triggers; rules + sentiment/confidence signals.
- **Decided:** hand off the **first time** the customer asks for a human. No "are you sure?" or retention attempt before transferring.
- **Lost/stolen card twist:** if the customer asks for a human about a lost card, the handoff message itself carries the freeze-in-app instruction and the 24/7 card line, so safety info never delays the handoff.
- **Evidence:** NRMA transcript (Oct 24): the customer asked for a human three times; each time the bot restarted a menu and asked more questions, about 2 minutes before "Chat with a team member". New PRD metric **time to human** = extra bot turns after the first request, target 0 on 100% of cases.
- **Still open:** stage 2 signals. Recommendation: stage 1 keyword + "can't answer"; stage 2 adds repeated failure, out-of-scope, high-risk topics, with a generated summary passed to a mock agent view.
- **Why (hypothesis):** escalation precision/recall is a named talking point; the summary is what makes handoff feel real.
- **Tradeoff accepted:** first-ask handoff lowers containment a little (some customers would have been helped by one more try). Accepted because trapping a customer who asked for a person is the exact failure D3 guards against. Sentiment signals add false positives.
- **What would change my mind:** escalation precision below 85% on evals.

## D7 · Fee schedule: in the playbook instructions or in a data store? · **Decided Oct 19; moves to stage 2 (Oct 24, see D2)**

- **Oct 24 note:** with Flow first, stage 1 fees are fixed flow answers, so this decision now applies to the stage 2 fees playbook challenger.

- **Category:** context, tokens
- **Options considered:** paste the fee table into the playbook instructions; upload it to a CX data store and let the agent retrieve it.
- **Decision:** paste it into the playbook instructions (stage 2).
- **Why:** the table is 16 rows, so it fits easily in the prompt, needs no retrieval setup, and the model always sees every fee (no retrieval misses). A data store adds setup and a chance of retrieving the wrong chunk. Real numbers to add: eval fee accuracy and cost per turn.
- **Tradeoff accepted:** every turn carries the full table in context. Fine at 16 rows; wasteful at hundreds.
- **What would change my mind:** the fee list growing past roughly 100 rows, needing several documents (T&Cs, disclosures), or fee accuracy below 10/10 on evals.

## D8 · Generative model for the playbook · Open (moved to stage 2)

- **Oct 24 note:** stage 1 is flow-only with generative features off (D2), so the model is chosen when the stage 2 playbook is built.

- **Category:** model
- **Options considered:** console default; a larger model; a smaller or faster model.
- **Recommendation:** keep the console default for the stage 2 playbook and record its name here. Only switch if evals or latency say so.
- **Why (hypothesis):** stage 1 is a small, grounded task. The default model should be enough, and switching models is a later lever to measure with evals.
- **Tradeoff accepted:** no model comparison in Project 1.
- **What would change my mind:** fee accuracy below 10/10 or p95 latency above 3 s.

## D9 · Cloud budget guardrail · **Decided (logged Oct 24)**

- **Category:** tokens, APIs
- **Options considered:** no budget; budget with email alerts only; a hard spend cap (budget alert → Pub/Sub → function that disables billing).
- **Decision:** a **$10/month** Google Cloud budget named "Project 1 – monthly cap", alerts at **50% / 90% / 100%** of actual spend, credits included. **Alerts only, not a spend cap.**
- **Why:** expected spend is about $0 because CX usage is covered by trial credits ($1,000 playbooks + $600 flows) and a 5-turn chat costs roughly $0.06 at list price. Alerts give early warning in minutes of setup. A hard cap needs a Pub/Sub topic plus a Cloud Function, which is more moving parts than the risk justifies at this volume.
- **Tradeoff accepted:** alerts only email you. Spend can pass $10 before you act, and alerts can lag by hours. Mitigation: check Billing once a week (setup guide Step 3).
- **What would change my mind:** any alert firing, an unexpected charge showing up after credits, or running automated eval loops (many calls unattended). Then add the hard cap.
- **PM note:** the budget is named "monthly cap" but it does not cap anything. Say "alert" in interviews so nobody thinks you built a kill switch.

## D10 · Eval gate: when does the fees playbook replace the fees flow? · **Proposed Oct 24 (waiting for P)**

- **Category:** evals, model, tokens
- **Options considered:**
  1. **Ties are enough:** fee accuracy 100% with 0 invented fees, 0 guardrail violations, and no drop in safe containment or escalation recall.
  2. **Must beat the flow:** everything in option 1, **and** better containment than the flow on the harder "messy phrasing" fee cases. *(Proposed)*
- **Proposal:** option 2.
- **Why (hypothesis):** the playbook costs more per turn ($0.012 vs $0.007 for a flow, checked Oct 19, about 70% more). If it only ties, you pay more for the same result, so a tie keeps the flow. Handling unusual wording is the playbook's only real advantage, so that is what it has to prove. Needs a "messy phrasing" eval subset (e.g. "what do you charge me for using an ATM abroad?").
- **Tradeoff accepted:** a higher bar means the flow may win even if the playbook feels nicer in a demo. You also write the extra paraphrase cases.
- **What would change my mind:** if the cost difference is negligible against trial credits for the whole project, option 1 is simpler.

## D11 · Fuzzy matching on the fee_type entity · **Decided Oct 25 (stage 1 build): OFF**

- **Category:** context, evals
- **Options considered:** fuzzy matching on (console default behaviour); fuzzy matching off and automatic expansion off (exact synonyms only).
- **Decision:** fuzzy matching **off**, and automatic expansion **off**.
- **Why (real finding):** in simulator testing, fuzzy matching mapped "cashier's cheque" (not in the fee schedule) to **stop payment, $30**. That is a confident wrong amount, which breaks the 100% fee-accuracy / 0 invented fees red line. In banking, "I don't have that fee, let me connect you" is always better than a wrong number.
- **Tradeoff accepted:** customers who misspell or paraphrase a fee name get "I don't know" or a handoff more often, which lowers containment a little. That is exactly the gap the stage 2 playbook has to close (D10).
- **What would change my mind:** nothing in stage 1. In stage 2, only if the playbook (or a tuned flow) can handle variations at 100% fee accuracy on evals.

## Stage 1 build log (Oct 25)

- **Built:** stage 1 bot in the Conversational Agents console, spec steps 1 to 8.
- **Simulator result:** **11/12 manual checks pass.** Passing: fee answers; first-ask handoff from Start and after a fee answer; unknown fee → offer handoff → "yes" → handoff; lost card with untrained wording ("someone nicked my card"); PIN warning; two no-matches → handoff. First real numbers for the log; the full eval run (D4) comes next.
- **Finding, unknown fee phrasing:** "fee for a [fee not in schedule]" was matching the **fees.complaint** intent. Fix: added 5 unannotated unknown-fee phrases to **fees.ask**, which fixed "fee for a bank draft". "fee for a cashier's cheque" still matches fees.complaint and hands off.
  - **Call made:** stop tuning here. It **fails safely** (a person gets the customer, no wrong fee is quoted), and adding more phrases that copy the test wording would be overfitting: the test would pass without the bot getting better at real wording.
  - **Use it later:** a ready-made "messy phrasing" case for the stage 2 AI vs flow comparison (D10).
- **Deviation from spec 5.3 (accepted):**
  1. Added a **fees.ask → Fee answer** route on the Offer handoff page, so a customer who asks another fee question instead of answering yes/no gets an answer instead of a dead end.
  2. Added handoff_summary **"fee not in schedule, customer accepted a team member"** on the "yes" route, so the agent sees why the chat came over.
  - Spec updated to match (v2.2, section 5.3), so the eval suite is written against what was actually built.

---

## Change history

- **Oct 24:** D2 and D3 marked Decided; D6 first-ask handoff marked Decided; NRMA evidence note added to D2; D9 (budget) added. Source: decisions made in the earlier PRD chat, as reported when this log moved to its own thread.
- **Oct 24 (later):** D2 revisited to **Flow first**, confirmed by P in the Google Cloud setup thread. Stage 1 now Oct 27, Nov 1 holds. D1, D7, D8 headers note the knock-on effect.
- **Oct 24 (later):** D10 added as Proposed (playbook eval gate). D2's gate line marked Proposed pending P, see D10.
- **Oct 25:** D11 added (fuzzy matching off). Stage 1 build log added: 11/12 simulator checks, unknown-fee intent finding, two deviations from spec 5.3.
