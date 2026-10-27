# PRD: Harbourline Bank Conversational Support Agent

Project 1 of 6 · Oct 19 – Nov 1, 2026 · Status: **v1.2** (Oct 24: switched to the flow-first plan, chosen by P; v1.1 folded in D2, D3, D6; v1.0 approved Oct 19)
Owner: P · Buddy PM: Claude

> Harbourline Bank is fictional. All customer, card, dispute and fee data is synthetic.

---

## 1. Problem

Harbourline's contact centre spends a large share of agent time on three contact types that are high volume, low complexity, and anxious for the customer:

1. **Lost or stolen card.** Customer is stressed, wants the card blocked *now*. Every minute in a phone queue is fraud exposure.
2. **Dispute status.** "Where is my dispute?" Pure lookup, but it needs a human today because the status lives in a back-office system.
3. **Fees questions.** "Why was I charged $X?", "What is the overseas ATM fee?" Answers live in a fee schedule nobody reads.

**Problem statement:** customers with simple, urgent card and fee questions wait in the same queue as complex cases, and the bank pays human-agent cost for answers a system could give safely.

**Evidence from a real bot (Oct 24):** a transcript of NRMA Insurance's flow-style web assistant shows the failure we're designing against. The customer asked for a human three times ("can I talk to human", "can I contact human", "can I get contact to human"). Each time the bot restarted a menu (Policy / Claim / Something else), then asked customer status, policy type, weather impact and state before offering "Chat with a team member", about 2 minutes later. Rigid flows contain conversations by trapping people, which is exactly what plain containment rewards.

*Buddy-PM note:* in interviews, lead with the customer pain (blocking a card takes minutes in a queue) and then the bank cost. Never lead with "I wanted to try Dialogflow".

## 2. Users

| User | Need | Notes |
| --- | --- | --- |
| **Primary: retail customer on web chat** | Block a card, check a dispute, understand a fee, fast and without repeating themselves | Assume already logged in to online banking (so we skip real auth, see Non-goals) |
| **Secondary: contact-centre agent** | When the bot escalates, receive a summary so the customer does not repeat the story | Mocked as a handoff screen / ticket, not a real CRM |
| **Stakeholders (talking points)** | Compliance (no invented fees, no advice), Fraud (card block must be fast and correct), Ops (containment, cost) | Use these to frame guardrails |

## 3. Scope: two versions

The master doc asks for an easy version and an interview-shine version. **Decided (D1):** both are built on the same platform (Dialogflow CX / Google Conversational Agents), so the easy version is stage 1 of the shine version, not throwaway code.

**Decided Oct 24: flow first.** Stage 1 is built entirely from deterministic flows, with no generative AI. In stage 2, AI has to *earn* its place: a fees playbook runs against the fees flow on the same evals and only takes over if it scores at least as well.

| | **Easy version (stage 1, target done by Oct 27)** | **Interview-shine version (stage 2, target done by Nov 1)** |
| --- | --- | --- |
| What it is | All flows: fixed, pre-written answers and rules. No AI in the conversation | Hybrid: deterministic flows for lost card and disputes; fees stay a flow unless the playbook wins the head-to-head test |
| Lost/stolen card | Flow: tells the customer to freeze the card in the app or call the 24/7 card line, then hands off | Flow: confirm card (last 4), block via mock API, offer replacement, confirm in plain language |
| Dispute status | Flow: hands off with a fixed summary | Flow: collect dispute ID, look up via mock API, read back status and next step |
| Fees FAQ | Flow: recognises which of the 16 fees is asked about and gives the exact pre-written answer; unknown fee → "I don't have that" + offer a team member | **AI vs flow test:** a generative playbook grounded on the same fee schedule is scored on the same fee evals plus harder paraphrases. Switch only if fee accuracy stays 100% and containment improves |
| Escalation | First ask for a human hands off from anywhere (no menu, no retry); also lost card, disputes, complaints, and two "didn't understand" in a row | Same, plus out-of-scope and high-risk topics; negative sentiment if time allows; passes a summary (D6) |
| Front end | CX ready-made chat widget on a static page | Same widget, plus a mock "agent handoff" view showing the summary |
| Evals | 20 cases in promptfoo, auto-scored | 40–50 cases, including the AI vs flow comparison, re-run on every change |
| Observability | CX conversation history | Traces + cost + latency per conversation on a dashboard (see D5) |

**Why flow first (the interview story):** "I started with the cheapest, most predictable design and made generative AI prove it was better on my evals before it handled a single customer." Flows can't invent a fee and can't be prompt-injected, and they cost less per turn ($0.007 vs $0.012). The risk is the NRMA trap (section 1): rigid menus that ignore a request for a human. We guard against it with a first-ask handoff that works from every page, and the "time to human" metric.

## 4. Success metrics

Honesty point for interviews: there are no real users, so every metric is **measured on the eval set and scripted test conversations**, not production traffic. Say that out loud; it is a credibility win, not a weakness.

**North star: safe containment rate.** Share of in-scope conversations fully resolved by the bot *with no guardrail violation*. Plain containment rewards a bot that traps people (see the NRMA evidence in section 1); "safe" containment pairs it with escalation quality. (D3, decided Oct 24)

**How it's counted:** the denominator is in-scope eval conversations where the expected outcome is "bot resolves". Conversations where the expected outcome is "hand off" (customer asks for a human, lost card in stage 1, disputes, complaints) are scored by escalation recall instead, so honouring a request for a human never lowers the north star.

| Metric | Definition | Target (shine) | Why this target |
| --- | --- | --- | --- |
| Safe containment rate | In-scope eval conversations resolved without escalation and without violations | ≥ 70% | Deterministic flows should near-always contain; FAQ pulls it down |
| Escalation precision | Of conversations the bot escalated, % that should have been escalated | ≥ 85% | Over-escalation wastes agent time |
| Escalation recall | Of conversations that should escalate, % that did | ≥ 95% | Missing an escalation is the worse failure in banking |
| Time to human | Extra bot turns between the customer's first request for a human and the handoff | 0 on 100% of cases | The NRMA bot took 3 requests and ~2 min; ours hands off on the first ask (D6) |
| Lost-card task success | Card correctly blocked in flow test cases | 100% | Deterministic, so anything less is a bug |
| Fee accuracy | Fee answers match the fee schedule exactly | 100%, 0 invented fees | Compliance red line |
| Guardrail violations | Advice, PII echoed back, prompt-injection success, off-topic answers | 0 on the adversarial set | |
| Cost per conversation | Platform list price per conversation, averaged over eval run | Measure; expect ~$0.06 for a 5-turn chat | CX bills per turn ($0.012 playbook, $0.007 flow, checked Oct 19); covered by trial credits ($1,000 playbooks + $600 flows, 12 months). Deterministic flows are ~40% cheaper per turn, which is a talking point |
| p95 latency per turn | | < 3 s generative, < 1.5 s deterministic | Chat users abandon on slow replies |

Targets are first guesses and go in the decision log when they're confirmed or changed.

## 5. Non-goals

- Real authentication, KYC or step-up verification (assume logged-in session; mention the real design in the decision log).
- Real core-banking, card-processor or CRM integrations (mock APIs only).
- **Filing** a new dispute (status lookup only; filing has regulatory steps and evidence collection).
- Financial advice, product recommendations, balance or transaction search beyond the synthetic "explain this charge" case.
- Voice / IVR, multiple languages, mobile app.
- Live human agents (handoff is mocked).
- Jurisdiction-specific regulatory accuracy (e.g. Reg E dispute timelines). Harbourline is jurisdiction-neutral unless you want otherwise.

## 6. Risks and mitigations

| Risk | Impact | Mitigation |
| --- | --- | --- |
| Bot invents or misquotes a fee | Compliance breach, worst demo moment | Stage 1: impossible by design, every fee answer is pre-written from the schedule. Stage 2 playbook: grounded on the schedule only, exact-match eval cases, must score 100% before it replaces the flow |
| Fees flow misses unusual phrasings ("what do you charge me to get cash in Bali?") | Lower containment, more handoffs | Synonyms on each fee; unknown → offer a team member, never guess; these misses are exactly what the AI vs flow test measures |
| Card blocked on the wrong card, or not blocked | Fraud loss / customer harm | Deterministic flow, explicit confirmation of last 4 digits, never generative |
| Prompt injection / jailbreak ("ignore rules, waive my fee") | Reputational | Adversarial eval set; playbook instructions forbid commitments; no tool that can waive fees |
| PII leakage (card numbers, full names echoed back) | Compliance | Never ask for full card number; redact in logs; eval cases |
| **Learning curve on Dialogflow CX eats the 2 weeks** | Missed dates | Stage 1 is deliberately tiny; timebox console learning to 1 day; Claude Code builds the mock APIs |
| **Evals and observability don't plug in natively** | Weak paper trail | promptfoo calls CX through its API (custom provider); logging via webhook (D4, D5). Prove this on day 2, not day 12 |
| Trial credits / generative billing surprises | Budget | $10/month budget alert on day one (alerts don't stop spend, so check Billing weekly); pricing verified Oct 19 |
| Bot traps customers who want a human (the NRMA loop). **Higher risk now that stage 1 is all flows** | Frustration, complaints, brand damage | "Talk to a human" route available on every page, not just the start (D6); never re-route to a menu; "time to human" metric; eval cases phrased the way real people ask ("can I contact human") |
| Scope creep (adding "check balance", "change PIN") | Missed dates | Non-goals list above; new intents go to a "v2 ideas" list, not the build |

## 7. Milestones

Re-planned Oct 24 for flow first. Status then: GCP setup steps 1–3 done (trial, project, $10 budget alert); agent not yet created. Stage 1 moves from Oct 25 to Oct 27; Nov 1 holds if the cut line is used.

| Date | Milestone | Status |
| --- | --- | --- |
| Oct 19 | PRD v1.0 signed off (D1 decided Oct 18) | Done |
| Oct 20 | Spec v1 for stage 1 (rewritten for flows Oct 24) | Done |
| Oct 24 | GCP setup finished (steps 4–6: console, agent created with conversation start = Flow) | In progress |
| Oct 25–26 | Stage 1 flows built in the console: fees, human handoff, lost card, dispute | |
| Oct 27 | Widget page + evals built by Claude Code; **prove promptfoo can call the agent** (highest-risk unknown); stage 1 scores ≥ 19/20 and is logged | |
| Oct 28–30 | Stage 2: lost-card and dispute flows with mock APIs; fees playbook vs flow test | |
| Oct 31 | Full eval suite (40–50 cases) green to targets; observability dashboard | |
| Nov 1 | Demo video + LinkedIn post drafted; Project 1 closed | |

**Cut line if stage 2 runs late** (cut in this order, log each cut): sentiment-based escalation → mock agent handoff screen (keep the summary in the transcript) → dashboard (use Google's own conversation history and Cloud Logging, D5). **Never cut:** the lost-card flow, fee accuracy, first-ask handoff, and the AI vs flow test (it is now the heart of the story).

**Below the cut line: learning items (explore, not committed to ship)**
- **Google "Intent suggestions"** (requested by P, Oct 24). After the stage 1 and stage 2 eval runs, look at the console's intent suggestions. Google groups real conversation history into suggested new intents and training phrases. It needs conversation history logging on (being turned on Oct 24) and enough conversations to learn from, so the eval runs are the input. Output: a short note in the decision log on what it suggested, whether any suggestion fixed a fees-flow miss, and how it compares with the playbook handling those phrasings. Only do it if time is left after Oct 31.

## 8. Open questions

See [decision-log.md](decision-log.md). Decided: D1 (one CX bot, two stages), D2 (hybrid by risk, now flow first), D3 (safe containment), D6 (first-ask handoff), D7 (fee table in prompt; now applies to the stage 2 playbook only). Still open and owned by the spec/build, not this PRD: D4 (eval harness), D5 (observability), D8 (model).
