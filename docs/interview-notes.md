# Interview notes: Project 1, Harbourline Support Agent

Points P asked to keep for the final project write-up and interview prep. Each one has the finding, the why, and a line to say out loud.

---

## 1. AI needs tone instructions that a flow gets for free (Nov 1, stage 2 build)

- **What happened:** the first AI (playbook) answer to "what is overdraft fees" was correct ($35.00 per item, max 3 per day) but flat: "Overdraft fee: $35.00 per item, maximum 3 per day." The flow's answer to the same question was warm: "Our Overdraft fee is $35.00 per item, up to a maximum of 3 per day. A team member can check your actual account if you'd like. Anything else I can help with?"
- **Why it happens:** in a flow, a person writes every sentence, so tone, warmth and the helpful extra line are built in. A generative model only knows the tone it's told. With no tone instruction it writes terse, list-like replies.
- **Why it matters:** for a bank, tone is part of the product. A curt reply to an anxious customer feels like a brush-off, even when the number is right. "Correct" and "good" aren't the same thing.
- **What we did:** added a tone instruction to the playbook with a real example sentence from the flow ("write in a warm, friendly, conversational tone, like this example: …").
- **Say it like this:** "Moving from a flow to AI isn't free. The flow got tone for free because I wrote every line. The AI needed tone written into its instructions, with an example, before it sounded like our brand. That's hidden work teams forget when they estimate an AI migration."

## 2. The AI greeted instead of answering (Nov 1, stage 2 build)

- **What happened:** when the flow handed the fee question to the AI, the AI ignored it and said "Hello! How can I help you with our bank fees today?" The customer had to ask twice.
- **Why it happens:** the AI starts fresh when it's handed the conversation and falls back to its default "assistant" behaviour unless told the context.
- **P's catch:** "never greet" is too blunt, because a customer might say hi. The fix tells the AI the customer has already been greeted and has asked, so it answers straight away, and a short "Hi!" back is fine.
- **Say it like this:** "The handover between rules and AI is where things break. The AI didn't know it was mid-conversation, so it greeted a customer who'd already asked a question. I found it by hand-testing before running the evals."
- **Call made (P, Nov 1):** accepted "close enough" wording for now. The AI paraphrases the example ("Our Overdraft fee is $35.00 per item, maximum 3 per day.") and drops the "team member can check" line. Safety first, polish later: the evals check accuracy and safety, and the exact style can be taught later with an example conversation.

## 3. The AI said "I'm connecting you" but didn't hand over (Nov 1, hand test, check 2)

- **What happened:** after a fee answer, the customer typed "can I contact human". The AI replied "I'm connecting you with a team member." But the Human handoff flow never ran: the test chat showed no handoff, and the AI's step showed no flow call. A real customer would have waited for a person who never came.
- **Why it happens:** while the AI (a Task playbook) is in charge of the chat, your rules (the "Always available" route group) aren't checked, so the first-ask handoff rule is bypassed. The AI wrote the words from its instructions, but writing a sentence isn't the same as taking the action.
- **Why it matters:** this is the worst kind of failure for a bank bot: it looks fine in a transcript and only shows up when you check what the system actually did. It breaks the product's core promise (a person on the first ask, D6).
- **Interview line:** "The AI's words said 'connecting you', but the system never handed over. I caught it because I checked the action, not the text, and that's also how the evals score it: they look for the real handoff signal, not the sentence."

## 4. Handing the chat back from the AI ended the conversation (Nov 1, hand test)

- **What happened:** after the instructions told the AI (a Task playbook) to finish after one answer, it finished *without answering*, handed back to the flow ("Returning to: Default Start Flow"), and the session ended. The customer got no reply at all.
- **Why:** a Task playbook decides when it's done mostly from saved examples, and the flow had nothing defined for "the AI just came back", so the session ended.
- **Lesson:** handing control back and forth between rules and an AI agent is the fragile part of a hybrid bot. Each handover point needs to be designed and tested, like an API contract.

## 5. The AI writes words, the rules make moves (Nov 1)
- **What happened:** with the AI (generator) writing fee answers, a fee not in the schedule got "A team member can help if you'd like." The customer said "yes" and got "Sorry, I didn't catch that." The old rules version sent that case to an "Offer handoff" step where "yes" really hands over.
- **Why:** the AI only produces text. The bot can't act on a sentence the AI wrote; it can only act on something it can check exactly.
- **Fix:** the AI replies with one code word (NOFEE) when it doesn't have the fee. A rules step checks for that exact word and sends the chat to the proper handover offer; otherwise it shows the AI's answer.
- **Interview line:** "Let the AI write, but never let it steer. Anything that changes what happens next goes through a check the rules can read exactly."
