# Launch post (draft v7, for reference, Nov 15)

Not posted. All numbers come from real test runs or the real Google bill.

---

I gave AI a fair shot at answering bank customers' questions. It lost, and honestly, I was relieved.

The last few weeks went into building a support chatbot for a made-up bank. It answers fee questions, blocks a lost card, checks on a dispute, and gets you to a real person as soon as you ask.

**Risk came first.** In banking, a wrong answer about money is worse than no answer. That one idea shaped every decision.

**Success was defined upfront.** Not how many chats the bot keeps, but how many it solves safely. And anyone who asks for a person gets one straight away. A bot that traps customers might look good on paper, but it feels awful to use.

**AI had to earn its place.** There were two versions: one with pre-written answers, one with AI. Both ran through the same evals, 50 test chats, with the pass mark set before any results came in. AI handled messy questions better, but it got one fee wrong. So money answers stayed pre-written, and AI got the small talk, where a slip does no harm.

**Guardrails came in layers.** No financial advice, no promised refunds, never asking for a full card number. Then came the fun part: trying to trick it into breaking its own rules. It held.

**Unit cost mattered.** AI replies cost about twice as much as pre-written ones, and at bank scale that adds up. Using AI only where it adds value kept costs down.

**The result:** every fee correct, zero guardrail failures, 72% of chats solved without a person, and every request for a human handed over first time.

Built with Google Dialogflow CX, Google's generative AI, and an automated eval suite.

#ProductManagement #AI #ConversationalAI #Chatbots
