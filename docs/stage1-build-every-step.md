# Stage 1 bot build: every step

Oct 26, 2026 · @P

## How to read this doc

This is a complete record of the 10 steps you followed on Oct 25, 2026 to build the Harbourline support bot. Each step uses the same five parts:

- **Purpose**: why the step exists.
- **What it achieves**: what the bot can do once it's done.
- **Exact steps**: every click, in order.
- **Exact values**: every name, sentence and setting you entered.
- **How you know it worked**: what you saw on screen.

The console is at conversational-agents.cloud.google.com. Project: Conversational Agent - Bank. Agent: "Conversational support agent - Bank". The left side has two tabs: **Build**, where the flows and pages live, and **Manage**, where the intents, entity types and route groups live.

| Step | What you built | Purpose in one line |
| --- | --- | --- |
| 1 | `human.request` intent | Recognise "I want a person" in any wording |
| 2 | 7 more intents | Recognise lost card, dispute, complaint, sensitive data, advice, yes and no |
| 3 | `fee_type` entity and `fees.ask` intent | Recognise a fee question and which of 17 fees it is about |
| 4 | Human handoff flow | One reusable place that passes the chat to a person |
| 5 | Always available route group | Make the four handoff triggers work on every page |
| 6 | Start page | Greet, route fee questions, and handle "didn't understand" |
| 7 | Fee answer page | Give the exact answer for each of the 17 fees, or say "I don't have that fee" |
| 8 | Offer handoff page | Handle yes or no after the bot offers a person |
| 9 | Simulator tests | Check it works, and fix what doesn't |
| 10 | Export | Save a copy of the whole bot |

## Step 1: the human.request intent

**Purpose.** An **intent** is a label for what the customer wants. This one means "I want to talk to a person". We built it first because the NRMA bot ignored three requests for a human, and our main promise is a person on the first ask.

**What it achieves.** The bot can now recognise a request for a human, however it's worded. It learns the *meaning* from example sentences (**training phrases**), so it also matches new wordings such as "get me a real human". On its own the intent does nothing yet. Step 5 connects it to the handoff.

**Exact steps**

1. Opened conversational-agents.cloud.google.com and picked the project and agent in the top bar.
2. Clicked the **Manage** tab on the left, then **Intents**.
3. Clicked **+ Create** at the top.
4. In **Display name**, typed `human.request`.
5. Under **Training phrases**, typed each phrase below and pressed Enter after each one.
6. Clicked **Save** at the top.

**Exact values: the 20 training phrases**

- can I contact human
- can I talk to human
- can I get contact to human
- talk to a person
- speak to someone
- real person please
- agent please
- I want to speak to an agent
- let me talk to a real person
- connect me to customer service
- is there a human I can chat with
- I need to talk to staff
- transfer me to a team member
- human
- representative
- operator
- get me a person
- can i speak to somone
- talk to a humen
- you're not helping, I want a person

The typos ("somone", "humen") are on purpose, because real customers type like that. The first three are the exact NRMA wordings.

**How you know it worked.** The intent list showed `human.request` with 19 training phrases. One of the 20 didn't save, which is fine.

## Step 2: the 7 other intents

**Purpose.** To teach the bot the other things a customer might want, so each one can get its own rule later. Four of them trigger a handoff (lost card, dispute, complaint, and the human request from step 1). Two are guardrails (sensitive data, advice). Two answer a question the bot asks (yes, no).

**What it achieves.** The bot can now label every kind of message stage 1 cares about. Each phrase belongs to one intent only, because shared phrases make intents compete and confuse the bot.

**Exact steps.** The same as step 1, once per intent: **Manage** → **Intents** → **+ Create** → type the display name → type each phrase and press Enter → **Save**. You left Google's two built-in intents (Default Welcome Intent, Default Negative Intent) as they were.

**Exact values**

| Display name | Means | Training phrases you typed |
| --- | --- | --- |
| `card.lost` | My card is lost or stolen | I lost my card · my card was stolen · can't find my card · someone stole my wallet · I've misplaced my debit card · my card is missing · lost card · stolen card · I left my card at a shop and it's gone · my bag was stolen with my card in it · I can't find my debit card anywhere · my card got lost overseas · lost my card yesterday · i think i dropped my card · someone took my card · report a lost card · report stolen card · my card was taken · lsot my card |
| `dispute` | I want to query or dispute a transaction | I don't recognise this charge · where is my dispute · I want to dispute a transaction · I didn't make this purchase · there's a payment on my account I didn't do · someone used my card without permission · unknown transaction on my statement · I was charged twice for the same thing · the merchant never sent my order and I was charged · check the status of my dispute · raise a dispute · dispute a payment · fraudulent transaction · this transaction isn't mine · I didn't authorise this payment · strange charge on my account · what's happening with my dispute · i want to dispute a charge from amazon · dont recognize this transaction |
| `fees.complaint` | I'm unhappy with a fee or want it refunded | that fee is ridiculous · refund my fee · waive the fee · can you refund the overdraft fee · I want my money back for that fee · your fees are a rip off · please remove the fee from my account · I shouldn't have been charged that fee · can you reverse the charge you made · I'm unhappy about the fees · I want to complain about a fee · this fee is unfair · give me a refund · can you waive my overdraft fee this once · why are you charging me so much, take it off · reverse the fee · the fee was a mistake, remove it · i want a fee refund |
| `sensitive.shared` | I typed a card number, PIN or password | my card number is 4111 1111 1111 1111 · my PIN is 1234 · here is my card number 5500 0000 0000 0004 · my password is Harbour123 · the CVV is 123 · my security code is 456 · my account password is summer2026 · card number 4000 1234 5678 9010 · my pin number is 9876 · here's my login password · my online banking password is abc123 · my card ends 4111 1111 1111 1111 and expires 12/28 · pin 4321 · this is my full card number 3782 822463 10005 |
| `advice.ask` | Tell me which account or product to choose | should I switch to Premier · which account is best for me · is Premier worth it · what account should I open · would I save money on Premier · should I get an overdraft · what do you recommend for me · which account would you recommend · is it better to have Everyday or Premier · should I move my money to Premier · what's the best account for a student · should I close my account · do you think I should upgrade · which account suits me · give me advice on my account |
| `yes` | Agree | yes · yeah · yep · sure · please do · ok · okay · yes please · go ahead · that would be great · sounds good · y · of course · please · yes connect me |
| `no` | Decline | no · nope · no thanks · no thank you · not now · I'm fine · no I'm good · n · nah · don't · not needed · maybe later · that's all · I'm ok thanks · no need |

The exact sentences used in the automated tests were left out on purpose, so the tests check wordings the bot has never seen.

**How you know it worked.** The intent list showed all 7 with their counts: card.lost 19, dispute 19, fees.complaint 18, sensitive.shared 14, advice.ask 15, yes 15, no 15.

## Step 3: the fee\_type entity and the fees.ask intent

**Purpose.** A fee question has two parts: "I'm asking about a fee" (the intent `fees.ask`) and "which fee" (the entity `fee_type`). An **entity** is a word list the bot picks out of a sentence. Splitting the two means one intent covers all 17 fees. The alternative was 17 near-identical intents that would confuse each other, and about 255 phrases to type.

**What it achieves.** When a customer asks "how much is the overdraft fee", the bot labels it `fees.ask` and writes down a note, `fee_type = overdraft`. That note (a **parameter**) is what step 7 reads to pick the right answer.

### 3a. The fee\_type entity

**Exact steps**

1. **Manage** → **Entity types** → **+ Create**.
2. **Display name**: `fee_type`. Left "Entities only" and "Regexp entities" unticked, and the description empty.
3. Clicked **+ Add new entry** once per row below. Typed the value on the left, then each synonym on the right, pressing Enter after each one.
4. Did not click "Suggest synonyms", because it uses AI.
5. Clicked **Save**.
6. Under **Advanced settings**: Fuzzy matching unticked (you turned it off in step 9), Automatic expansion unticked, Redact in log unticked, Allow DTMF pattern left ticked (it only matters for phone keypads).

**Exact values: 17 entries**

| Value (left) | Synonyms (right) |
| --- | --- |
| monthly\_fee | monthly fee, account fee, account keeping fee |
| everyday\_monthly | everyday account fee, everyday monthly fee |
| premier\_monthly | premier account fee, premier monthly fee |
| overdraft | overdraft, overdrawn, overdraft charge |
| nsf | returned payment, bounced payment, NSF, insufficient funds |
| harbourline\_atm | Harbourline ATM, your ATM, own ATM |
| domestic\_atm | other ATM, another bank's ATM, domestic ATM |
| overseas\_atm | overseas ATM, ATM abroad, foreign ATM, international ATM |
| foreign\_transaction | foreign transaction, buying abroad, overseas purchase, card abroad |
| replacement\_card | replacement card, new card |
| replacement\_card\_express | express card, urgent card, card express delivery |
| wire\_domestic\_out | domestic wire, wire transfer, send a wire |
| wire\_international\_out | international wire, overseas transfer, send money abroad |
| wire\_incoming | incoming wire, receive a wire |
| stop\_payment | stop payment, stop a cheque |
| paper\_statement | paper statement, printed statement, mailed statement |
| early\_closure | close account early, closing fee, account closed within 90 days |

### 3b. The fees.ask intent and its highlighting

**Exact steps**

1. You had already created `fees.ask` (**Manage** → **Intents** → **+ Create**) and typed its phrases before the entity existed. You kept it.
2. Opened `fees.ask`. The console had guessed some highlights wrong: it had marked the word "fee" and "$35". You clicked each wrong highlight and removed it.
3. In each phrase, selected the fee words with the mouse and chose `@fee_type` from the menu. **Highlighting** (annotation) tells the bot "this part of the sentence is the fee name".
4. Under **Parameters**, deleted `unit-currency` and `currency-name`, so `fee_type` was the only parameter.
5. Clicked **Save**.
6. In step 9 you came back and added 5 phrases about fees we don't offer, with no highlighting.

**Exact values: 25 phrases**

| Phrase | Highlighted as @fee\_type |
| --- | --- |
| how much is the overdraft fee | overdraft |
| what do you charge for overseas ATM | overseas ATM |
| why was I charged $35 | (none: no fee is named) |
| what's the monthly fee | monthly fee |
| how much does a domestic wire cost | domestic wire |
| what is the fee for an international wire | international wire |
| do you charge for paper statements | paper statements |
| how much is a replacement card | replacement card |
| what's the express card fee | express card |
| is there a fee for using another bank's ATM | another bank's ATM |
| are Harbourline ATM withdrawals free | Harbourline ATM |
| what's the foreign transaction fee | foreign transaction |
| how much for a stop payment | stop payment |
| what's the NSF fee | NSF |
| what does it cost to receive a wire | receive a wire |
| is there a fee to close account early | close account early |
| premier account fee | premier account fee |
| everyday account fee | everyday account fee |
| how much do you charge for overdrawn | overdrawn |
| fees for card abroad | card abroad |
| fee for a bank draft | (none: not one of our fees) |
| how much is a money order | (none) |
| what's the charge for a safe deposit box | (none) |
| do you charge for coin counting | (none) |
| what does a certified letter from the bank cost | (none) |

**How you know it worked.** The entity list showed `fee_type` with 17 entries. `fees.ask` showed the fee words in colour, and Parameters held only `fee_type` → `@fee_type`.

**Lesson.** The console guesses highlights, and it can guess wrong. Check them before saving.

## Step 4: the Human handoff flow

**Purpose.** A **flow** is a separate mini-conversation with one job. This one passes the chat to a human agent and ends the bot's part. We built it once so that every handoff (person, lost card, dispute, complaint, two misunderstandings, "yes" to an offer) uses the same exit.

**What it achieves.** Any rule in the bot can now say "go to Human handoff". The bot then sends a **live agent handoff** signal, which a real contact centre would use to route the chat to a person, and closes the conversation. In stage 1 the handoff is simulated: the signal shows in the simulator and the tests, but no real person receives it.

**Exact steps**

1. Clicked the **Build** tab.
2. Next to **Flows**, clicked **+** and named the new flow `Human handoff`.
3. Clicked the new flow, then its **Start Page** box.
4. Clicked **+** next to **Routes**. A Route panel opened on the right.
5. Left **Intent** empty. This route doesn't wait for the customer to say anything.
6. Under **Condition**, chose **Customize expression** and typed `true`.
7. Under **Fulfillment**, chose **Add dialogue option** → **Live agent handoff** and pasted the metadata below.
8. Under **Transition**, chose **End Session**.
9. Clicked **Save**.

**Exact values**

| Setting | Value |
| --- | --- |
| Flow name | Human handoff |
| Route condition | `true` ("always do this as soon as you arrive") |
| Live agent handoff metadata | `{"reason": "stage1_handoff"}` |
| Transition | End Session |
| Message to customer | None. The rule that sends the customer here has already said "I'm connecting you…" |

**How you know it worked.** The Human handoff flow's Start Page showed one route called `true`, and the map later showed arrows from the other pages into Human handoff.

## Step 5: the Always available route group

**Purpose.** A **route** is a rule: "if the customer's intent is X, say Y and go to Z". A **route group** is a bundle of routes you can attach to many pages at once. We put the four "get a person" rules in one group so they work on every page. Without it, the bot could trap a customer on a page that has no handoff rule, which is the NRMA problem.

**What it achieves.** Wherever the customer is in the conversation, "talk to a human", a lost card, a dispute or a fee complaint goes straight to a person, with the right message, on the first ask. Each route also leaves a note (`handoff_summary`) saying why, so the human agent doesn't have to ask again.

**Exact steps**

1. **Manage** → **Route groups** → **+ Create**. The group belongs to Default Start Flow. You ignored "Copy to agent-level".
2. **Display name**: `Always available`.
3. Clicked **Add route**. In the Route panel:
   1. **Intent**: picked the intent from the dropdown. Left **Condition** empty.
   2. **Fulfillment** → **Parameter presets** → **Add parameter**: name `handoff_summary`, value from the table.
   3. **Fulfillment** → **Agent responses** → **Agent dialogue**: typed the message and clicked **Add**.
   4. **Transition**: chose **Flow**, then **Human handoff**.
   5. Clicked **Save**.
4. Repeated step 3 for all four routes.
5. Clicked **Save** on the route group.

**Exact values: 4 routes**

| Intent | Agent dialogue (what the bot says) | handoff\_summary | Transition |
| --- | --- | --- | --- |
| `human.request` | Of course. I'm connecting you with a team member now. | customer asked for a person | Flow: Human handoff |
| `card.lost` | Please freeze your card now in the Harbourline app, or call our 24/7 card line on 1-800-555-0142. I'm also connecting you with a team member. | customer reports lost or stolen card | Flow: Human handoff |
| `dispute` | I'm connecting you with a team member who can help with your dispute. | customer disputes a transaction | Flow: Human handoff |
| `fees.complaint` | I understand. I can't change fees myself, so I'm connecting you with a team member. | customer complains about a fee | Flow: Human handoff |

**How you know it worked.** The route group list showed `Always available`, Level: Flow, 4 routes, each with a speech-bubble icon (the fulfillment) and "Human handoff" as its transition. Attaching it to the pages happens in steps 6, 7 and 8.

## Step 6: the Start page

**Purpose.** A **page** is one step in a flow, where the bot waits for the customer's next message. The Start page is where every chat begins. Its job is to greet the customer, send fee questions to the Fee answer page, deal with card numbers and advice requests itself, and decide what happens when the bot doesn't understand.

**What it achieves.** The conversation now has a front door. Fee questions are routed onwards, guardrail messages get a safe fixed reply, and a customer the bot can't understand twice in a row is passed to a person instead of being stuck.

### 6a. Pages, welcome message and route group

**Exact steps**

1. **Build** → **Default Start Flow**.
2. Next to **Pages**, clicked **+**, typed `Fee answer` and saved. Did the same again for `Offer handoff`. They were left empty until steps 7 and 8, so the Start page routes had somewhere to point.
3. Clicked the **Start Page** box, then the **Default Welcome Intent** route. Under **Agent responses** → **Agent dialogue**, deleted Google's greeting, typed the welcome message below, clicked **Add**, then **Save**. Left Transition empty.
4. On the Start Page, clicked **Add state handler**, ticked **Route groups**, and applied. Then clicked **+** next to **Route groups**, chose `Always available`, and saved. The box then showed "Always available (4)".

**Welcome message:** Hi, I'm Harbourline's virtual assistant. I can answer questions about our fees, and I can connect you with a team member for anything else. What can I help with?

### 6b. Start page routes

**Exact steps.** Clicked **+** next to **Routes** once per row below. For each one, picked the **Intent**, typed the **Agent dialogue** and clicked **Add** (where there is one), set the **Transition**, then clicked **Save**.

| Intent | Agent dialogue | Transition | Why |
| --- | --- | --- | --- |
| `fees.ask` | (none) | Page: Fee answer | The Fee answer page gives the reply |
| `sensitive.shared` | Please don't share card numbers, PINs or passwords here. I don't need them to answer fee questions. What can I help with? | (none: stays on Start) | Guardrail: warns without repeating the number |
| `advice.ask` | I can't give personal advice, but I can tell you the fees for each account. Which fee would you like to know about? | (none: stays on Start) | Guardrail: no product recommendations |

### 6c. The "didn't understand" rule

An **event handler** reacts to something that happens rather than something the customer says. A **no-match** happens when no intent fits the message well enough. Handlers on the Start page apply to the whole flow.

**Exact steps.** Clicked **+** next to **Event handlers**, chose the event from the dropdown, filled in the rest, clicked **Add** on the dialogue, then **Save**. Did it twice. Left **Generative fallback** unticked (the AI option), and left the existing No-match default and No-input default handlers alone.

| Event | Agent dialogue | Parameter preset | Transition |
| --- | --- | --- | --- |
| No-match 1 (`sys.no-match-1`) | Sorry, I didn't catch that. I can help with fees, or connect you with a team member. | (none) | (none: waits for another try) |
| No-match 2 (`sys.no-match-2`) | I'm connecting you with a team member who can help. | `handoff_summary` = bot could not understand twice | Flow: Human handoff |

**How you know it worked.** The Start Page box showed Routes (Default Welcome Intent, fees.ask, sensitive.shared, advice.ask), Route groups (Always available (4)) and Event handlers, with No-match 2 pointing to Human handoff. Fee answer and Offer handoff appeared under Pages.

## Step 7: the Fee answer page

**Purpose.** To turn the note `fee_type` into the exact, pre-written answer for that fee, and to never guess when the fee isn't on the list.

**What it achieves.** Every known fee gets the same correct answer every time, so the bot can't invent or round an amount. An unknown fee gets an honest "I don't have that fee" and an offer of a person. After each answer, the note is wiped and the chat returns to the Start page, ready for the next question.

These are **condition routes**: they have no intent, only a condition such as "if `fee_type` is overdraft". They run as soon as the bot arrives on the page, checked from top to bottom, and the first match wins. That's why the catch-all `true` must be last.

**Exact steps**

1. Clicked the **Fee answer** page box.
2. Attached the route group: **Route groups** → **+** → `Always available`.
3. For each fee row below, clicked **+** next to **Routes** and:
   1. **Condition** → **Customize expression**: typed `$session.params.fee_type = "<value>"`, for example `$session.params.fee_type = "overdraft"`.
   2. **Agent dialogue**: typed the answer, then clicked **Add**.
   3. **Parameter presets** → **Add parameter**: `fee_type` = `null` (no quote marks). This wipes the note.
   4. **Transition**: Page → **Start Page**.
   5. Clicked **Save**.
4. Added the catch-all last (bottom row). It has no parameter preset, and its transition goes to Page → **Offer handoff**.
5. Checked that `true` was the bottom route. If it isn't, drag it down by the dots on its left.

**Exact values: 18 routes, in order.** Every fee answer ends with " Anything else I can help with?"

| # | Condition value | Agent dialogue |
| --- | --- | --- |
| 1 | "monthly\_fee" | The Everyday Account monthly fee is $5.00 (waived if you deposit $1,000+ that month). The Premier Account monthly fee is $15.00 (waived with a $10,000+ balance all month). |
| 2 | "everyday\_monthly" | The Everyday Account monthly fee is $5.00. It's waived in any month you deposit $1,000 or more. |
| 3 | "premier\_monthly" | The Premier Account monthly fee is $15.00. It's waived if you keep a balance of $10,000 or more all month. |
| 4 | "overdraft" | Our Overdraft fee is $35.00 per item, up to a maximum of 3 per day. A team member can check your actual account if you'd like. |
| 5 | "nsf" | The Returned payment (NSF) fee is $30.00. A team member can check your actual account if you'd like. |
| 6 | "harbourline\_atm" | Withdrawals at Harbourline ATMs are free. |
| 7 | "domestic\_atm" | Withdrawing cash at another bank's ATM in this country costs $2.50. |
| 8 | "overseas\_atm" | The Overseas ATM withdrawal fee is $5.00 plus 3% of the amount. |
| 9 | "foreign\_transaction" | The Foreign transaction fee for card purchases abroad is 3% of the amount. |
| 10 | "replacement\_card" | A standard replacement debit card is free. Express delivery costs $25.00. |
| 11 | "replacement\_card\_express" | Express delivery of a replacement debit card costs $25.00. |
| 12 | "wire\_domestic\_out" | Sending a domestic wire transfer costs $25.00. |
| 13 | "wire\_international\_out" | Sending an international wire transfer costs $45.00. |
| 14 | "wire\_incoming" | Receiving a wire transfer costs $15.00. |
| 15 | "stop\_payment" | A stop payment request costs $30.00. |
| 16 | "paper\_statement" | Paper statements cost $2.00 per month. E-statements are free. |
| 17 | "early\_closure" | If you close an account within 90 days of opening it, the fee is $25.00. |
| 18 | Condition `true` (catch-all) | I don't have that fee in our schedule, so I don't want to guess. Would you like me to connect you with a team member? (No "Anything else", no preset, goes to Offer handoff) |

**How you know it worked.** The Routes panel showed "1 - 18 of 18", with `true` → Offer handoff at the bottom and every other route → Start Page.

## Step 8: the Offer handoff page

**Purpose.** After "I don't have that fee… Would you like me to connect you with a team member?", the bot needs a place to wait for the answer and to understand yes, no, or a new fee question.

**What it achieves.** "Yes" goes to a person with a note explaining why. "No" returns the chat to the start. A second fee question goes back to the Fee answer page instead of being treated as "didn't understand".

**Exact steps**

1. Clicked the **Offer handoff** page box.
2. **Route groups** → **+** → `Always available`.
3. Clicked **+** next to **Routes** for each row below, filled it in and clicked **Save**.

**Exact values: 3 routes**

| Intent | Agent dialogue | Parameter preset | Transition |
| --- | --- | --- | --- |
| `yes` | Connecting you now. | `handoff_summary` = fee not in schedule, customer accepted a team member | Flow: Human handoff |
| `no` | No problem. Anything else I can help with? | (none) | Page: Start Page |
| `fees.ask` | (none) | (none) | Page: Fee answer |

The `fees.ask` route and the "yes" note weren't in the spec. We added them during the build and asked for them to be added to the spec.

**How you know it worked.** The Offer handoff box showed Routes yes (flow icon), no and fees.ask (page icons), and Route groups Always available (4). The map showed every page connected, with arrows into Human handoff.

## Step 9: tests in the simulator, and the fixes

**Purpose.** To prove the bot behaves as designed before automated tests are written, and to find and fix problems while they're cheap.

**What it achieves.** 11 of 12 checks passed, including wordings the bot was never trained on. Three changes came out of testing. Each one taught us something about how intents and entities work.

**Exact steps**

1. Opened the **Preview** panel on the right. Set Environment: **Draft**, Start resource: **Default Start Flow**, Page: **Start page**.
2. Typed each test message in "Enter text" and pressed Enter.
3. Clicked the reset icon (↺) between conversations.
4. When an answer was wrong, clicked the bot's reply to open its details and read **Turn**, **Page**, **Intent** and **Parameters**.

**Exact values: the tests**

| # | You typed | Expected | Result |
| --- | --- | --- | --- |
| 1 | hi | Welcome message | Pass |
| 2 | how much is the overdraft fee | $35.00 answer | Pass |
| 3 | can I contact human | Handoff on the first ask | Pass |
| 4 | what do you charge for an overseas ATM | $5.00 plus 3% answer | Pass after retraining finished (it failed once, probably because it was tested straight after a save) |
| 5 | get me a real human (never trained) | Handoff | Pass |
| 6 | fee for a cashier's cheque | "I don't have that fee…" | Miss: read as a complaint and handed off, which is safe |
| 7 | yes (after an unknown fee) | "Connecting you now." and handoff | Pass |
| 8 | someone nicked my card (never trained) | Freeze advice with 1-800-555-0142, then handoff | Pass |
| 9 | my pin is 4455 | Warning not to share | Pass |
| 10 | blah blah | "Sorry, I didn't catch that…" | Pass |
| 11 | zzzz | "I'm connecting you…" and handoff | Pass |
| 12 | fee for a bank draft (after fix 2) | "I don't have that fee…" | Pass |

**The three fixes**

1. **Fuzzy matching turned off.** Symptom: "fee for a cashier's cheque" gave "A stop payment request costs $30.00". Cause: fuzzy matching accepts partial matches, so "cheque" matched the synonym "stop a cheque". Fix: **Manage** → **Entity types** → `fee_type` → Advanced settings → untick **Fuzzy matching** → **Save**. Reason: for a bank, a wrong amount is worse than "I don't know".
2. **Unknown-fee phrases added to fees.ask.** Symptom: questions about fees we don't offer were read as complaints. Cause: none of the `fees.ask` examples looked like "fee for \[something not on our list\]". Fix: added 5 phrases with no highlighting (see step 3b), saved, and waited about a minute for retraining. Result: "fee for a bank draft" now gets "I don't have that fee".
3. **Cashier's cheque left as it is.** The details panel showed Turn 2, Page: End Session, Intent: `fees.complaint`, `handoff_summary` = customer complains about a fee. It fails safely, with a person and no wrong amount. Changing phrases to fix one exact sentence (overfitting) can make other sentences worse. It's logged as a test case for stage 2.

**How to read the details panel.** **Turn** is one customer message plus the bot's reply. **Page** is where the bot ended up after that turn. **Intent** is what the bot thought the customer wanted. **Parameters** are the notes it holds, such as `fee_type` or `handoff_summary`.

## Step 10: export the agent

**Purpose.** To save a copy of everything you built, as a backup, as evidence of the build for your write-up, and as a starting point if anything breaks in stage 2.

**What it achieves.** One zip file holds the whole bot: intents, entity, flows, pages, routes and settings. It can be re-imported into the console at any time.

**Exact steps**

1. In the top bar, clicked the **↑↓** icon (Import/Export) → **Export agent**.
2. Chose **Download to local file** and the **JSON package** format, then clicked **Export**.
3. Uploaded the downloaded zip to the project thread.

**Exact values**

| Item | Value |
| --- | --- |
| Downloaded file | exported\_agent\_Conversational support agent - Bank.zip |
| Saved in the project as | project1/agent-export/agent-stage1-2026-10-25.zip |
| Contents checked | 11 intents (9 yours + 2 Google defaults), `fee_type` entity with fuzzy matching off, 2 flows, Fee answer with 18 routes and `true` last |

**How you know it worked.** The zip downloaded, and its contents were checked against the build.
