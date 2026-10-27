# Harbourline Bank · Conversational Support Agent

A web chat assistant for a bank, built on Google Dialogflow CX (Conversational Agents). It answers fee questions with exact amounts, and it hands customers to a human the first time they ask. Lost cards and disputes are escalated with the safety steps first.

## The problem
Customers with simple, urgent questions (a lost card, a fee they don't understand) wait in the same queue as complex cases. Many bank bots make it worse by trapping people in menus when they ask for a person.

## Key product decisions
- **Flow first, AI has to earn its place.** Stage 1 uses no generative AI: every answer is fixed and checked against the fee schedule. In stage 2, an AI version runs the same tests and only takes over if it scores at least as well. ([decision log](docs/decision-log.md), D2)
- **Hand off on the first ask.** No "are you sure?" and no menu loop. Time to human is measured, with a target of 0 extra turns. (D6)
- **Safe containment, not raw containment,** is the north-star metric, so a bot can't score well by refusing to let people out. (D3)
- **A wrong fee is worse than "I don't know".** Fuzzy matching is off after it quoted a confident wrong fee in testing. (D11)

## How it's tested
20 automated test messages ([evals/](evals/)) check every reply for: the correct fee amount, no invented amounts, a handoff when the customer needs a person, and guardrails (no advice, no repeating card numbers, no promised refunds). The pass mark is 19/20.

| Stage | Status | Result |
| --- | --- | --- |
| 1 · Flow-only bot | Built Oct 25 | Manual check 11/12 · automated evals: coming soon |
| 2 · Card and dispute flows + AI vs flow test | Oct 28 – Nov 1 | Coming soon |

## What's in this repo
| Folder | What it is |
| --- | --- |
| [docs/](docs/) | PRD, stage 1 spec, decision log, [architecture blueprint](docs/stage1-blueprint.md), [step-by-step build guide](docs/stage1-build-every-step.md), setup guide, training phrases |
| [agent/](agent/) | The bot itself, as exported from Dialogflow CX |
| [web/](web/) | The help page with the chat widget |
| [evals/](evals/) | The 20 automated tests (promptfoo + a small Dialogflow connector) |

## Built with
Google Dialogflow CX · promptfoo · Claude Code (built from my PRD and specs)
