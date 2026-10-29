// Deterministic checks shared by all tests (stage 1 spec section 8.2, stage 2 spec section 7).
// Each test sets what it expects in its vars; a check with nothing to check passes.

// Every dollar amount that appears in the fee schedule (spec Appendix A),
// written the way the bot writes them.
const APPENDIX_A_AMOUNTS = ['$5.00', '$15.00', '$1,000', '$10,000', '$35.00', '$30.00', '$2.50', '$25.00', '$45.00', '$2.00'];

function dollarAmounts(text) {
  return text.match(/\$\d[\d,]*(\.\d+)?/g) || [];
}

function meta(context) {
  return (context.providerResponse && context.providerResponse.metadata) || {};
}

// Every test: any $ amount in any reply must be in the fee schedule.
function noInventedFees(output, context) {
  const invented = dollarAmounts(meta(context).allReplies || output).filter((a) => !APPENDIX_A_AMOUNTS.includes(a));
  return invented.length === 0
    ? { pass: true, score: 1, reason: 'No invented fee amounts' }
    : { pass: false, score: 0, reason: `Amount(s) not in the fee schedule: ${invented.join(', ')}` };
}

// vars.allowed_amounts: the only $ amounts the last reply may contain ([] means none at all).
function onlyAllowedAmounts(output, context) {
  const allowed = context.vars.allowed_amounts;
  if (!allowed) return { pass: true, score: 1, reason: 'No amount rule for this test' };
  const extra = dollarAmounts(output).filter((a) => !allowed.includes(a));
  return extra.length === 0
    ? { pass: true, score: 1, reason: `Only allowed amounts: ${allowed.join(', ') || 'none'}` }
    : { pass: false, score: 0, reason: `Unexpected amount(s): ${extra.join(', ')}` };
}

// vars.expect_handoff: false = never hand off; true = hand off at some point;
// a number = the handoff must happen on exactly that turn (0 extra turns to a human).
function handoffRule(output, context) {
  const expected = context.vars.expect_handoff;
  if (expected === undefined) return { pass: true, score: 1, reason: 'No handoff rule for this test' };
  const { handoff, handoffTurn, handoffSummary } = meta(context);
  const got = handoff ? `handoff on turn ${handoffTurn} (${handoffSummary || 'no summary'})` : 'no handoff';
  let pass;
  if (expected === false) pass = !handoff;
  else if (expected === true) pass = Boolean(handoff);
  else pass = handoffTurn === expected;
  const want = expected === false ? 'no handoff' : expected === true ? 'a handoff' : `handoff on turn ${expected}`;
  return { pass, score: pass ? 1 : 0, reason: `Expected ${want}, got ${got}` };
}

// Stage 2. vars.turn_checks: rules for the reply to one particular customer message, e.g.
// { turn: 3, contains: "is now blocked" } or { turn: 2, not_contains: "is now blocked" }.
// Checks ignore upper/lower case. Used for multi-step flows (lost card, dispute status).
function turnChecks(output, context) {
  const checks = context.vars.turn_checks;
  if (!checks || checks.length === 0) return { pass: true, score: 1, reason: 'No per-turn rules for this test' };
  const turns = meta(context).turns || [];
  const failed = [];
  for (const c of checks) {
    const t = turns.find((r) => r.turn === c.turn);
    const reply = t ? t.reply.toLowerCase() : '';
    if (!t) failed.push(`turn ${c.turn}: no reply`);
    else if (c.contains && !reply.includes(c.contains.toLowerCase())) failed.push(`turn ${c.turn}: missing "${c.contains}"`);
    else if (c.not_contains && reply.includes(c.not_contains.toLowerCase())) failed.push(`turn ${c.turn}: should not say "${c.not_contains}"`);
  }
  return failed.length === 0
    ? { pass: true, score: 1, reason: `Per-turn rules passed (${checks.length})` }
    : { pass: false, score: 0, reason: failed.join('; ') };
}

module.exports = { noInventedFees, onlyAllowedAmounts, handoffRule, turnChecks, dollarAmounts, APPENDIX_A_AMOUNTS };
