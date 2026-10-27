# Training phrases for stage 1 intents

Copy these into the console, one phrase per line (type it, press Enter). Typos are on purpose: real customers type like this.
Rule of thumb: a phrase should belong to **one** intent only. If two intents share phrases, the bot gets confused.
The exact sentences used in the eval tests are deliberately left out, so the evals measure whether the bot copes with phrasings it was never shown.

## human.request (most important)
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

## card.lost
- I lost my card
- my card was stolen
- can't find my card
- someone stole my wallet
- I've misplaced my debit card
- my card is missing
- lost card
- stolen card
- I left my card at a shop and it's gone
- my bag was stolen with my card in it
- I can't find my debit card anywhere
- my card got lost overseas
- lost my card yesterday
- i think i dropped my card
- someone took my card
- report a lost card
- report stolen card
- my card was taken
- lsot my card

## dispute
- I don't recognise this charge
- where is my dispute
- I want to dispute a transaction
- I didn't make this purchase
- there's a payment on my account I didn't do
- someone used my card without permission
- unknown transaction on my statement
- I was charged twice for the same thing
- the merchant never sent my order and I was charged
- check the status of my dispute
- raise a dispute
- dispute a payment
- fraudulent transaction
- this transaction isn't mine
- I didn't authorise this payment
- strange charge on my account
- what's happening with my dispute
- i want to dispute a charge from amazon
- dont recognize this transaction

## fees.complaint
- that fee is ridiculous
- refund my fee
- waive the fee
- can you refund the overdraft fee
- I want my money back for that fee
- your fees are a rip off
- please remove the fee from my account
- I shouldn't have been charged that fee
- can you reverse the charge you made
- I'm unhappy about the fees
- I want to complain about a fee
- this fee is unfair
- give me a refund
- can you waive my overdraft fee this once
- why are you charging me so much, take it off
- reverse the fee
- the fee was a mistake, remove it
- i want a fee refund

## sensitive.shared
- my card number is 4111 1111 1111 1111
- my PIN is 1234
- here is my card number 5500 0000 0000 0004
- my password is Harbour123
- the CVV is 123
- my security code is 456
- my account password is summer2026
- card number 4000 1234 5678 9010
- my pin number is 9876
- here's my login password
- my online banking password is abc123
- my card ends 4111 1111 1111 1111 and expires 12/28
- pin 4321
- this is my full card number 3782 822463 10005

## advice.ask
- should I switch to Premier
- which account is best for me
- is Premier worth it
- what account should I open
- would I save money on Premier
- should I get an overdraft
- what do you recommend for me
- which account would you recommend
- is it better to have Everyday or Premier
- should I move my money to Premier
- what's the best account for a student
- should I close my account
- do you think I should upgrade
- which account suits me
- give me advice on my account

## yes
- yes
- yeah
- yep
- sure
- please do
- ok
- okay
- yes please
- go ahead
- that would be great
- sounds good
- y
- of course
- please
- yes connect me

## no
- no
- nope
- no thanks
- no thank you
- not now
- I'm fine
- no I'm good
- n
- nah
- don't
- not needed
- maybe later
- that's all
- I'm ok thanks
- no need

## fees.ask (Step 3, after the fee_type entity exists)
- how much is the overdraft fee
- what do you charge for overseas ATM
- why was I charged $35
- what's the monthly fee
- how much does a domestic wire cost
- what is the fee for an international wire
- do you charge for paper statements
- how much is a replacement card
- what's the express card fee
- is there a fee for using another bank's ATM
- are Harbourline ATM withdrawals free
- what's the foreign transaction fee
- how much for a stop payment
- what's the NSF fee
- what does it cost to receive a wire
- is there a fee to close account early
- premier account fee
- everyday account fee
- how much do you charge for overdrawn
- fees for card abroad

Added Oct 25 after simulator testing ("fee for a cashier's cheque" matched fees.complaint). Fees not in our schedule, **no highlighting**:
- fee for a bank draft
- how much is a money order
- what's the charge for a safe deposit box
- do you charge for coin counting
- what does a certified letter from the bank cost
