// Stage 2 scorecard: turns a promptfoo results file into the PRD metrics for each bot,
// then applies the D10 rule ("a tie is enough") to decide whether the playbook takes over fees.
//
//   node compare.js                 reads results-stage2.json (written by npm run eval:both)
//   node compare.js other.json      reads another results file
//
// It writes the same scorecard to scorecard-stage2.md, ready to paste into the decision log.

const fs = require('fs');
const path = require('path');
const { dollarAmounts, APPENDIX_A_AMOUNTS } = require('./checks');

// List price per turn, checked Oct 19 (PRD section 4). A turn a playbook handled costs more.
const PRICE_FLOW_TURN = 0.007;
const PRICE_PLAYBOOK_TURN = 0.012;

// PRD section 4 targets (shine version).
const TARGETS = { safeContainment: 0.7, recall: 0.95, precision: 0.85 };

const file = process.argv[2] || path.join(__dirname, 'results-stage2.json');
const data = JSON.parse(fs.readFileSync(file, 'utf8'));
const rows = (data.results && data.results.results) || data.results || [];
if (!Array.isArray(rows) || rows.length === 0) {
  console.error(`No results found in ${file}. Run "npm run eval:both" first.`);
  process.exit(1);
}

function pct(n, d) {
  return d === 0 ? 'n/a' : `${Math.round((100 * n) / d)}% (${n}/${d})`;
}
function ratio(n, d) {
  return d === 0 ? 1 : n / d;
}
function p95(values) {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  return sorted[Math.min(sorted.length - 1, Math.ceil(0.95 * sorted.length) - 1)];
}

// Collect one entry per (bot, test, repeat).
const bots = {};
for (const row of rows) {
  const label = (row.provider && (row.provider.label || row.provider.id)) || 'unknown';
  const test = row.testCase || {};
  const tmeta = test.metadata || {};
  const vars = row.vars || test.vars || {};
  const response = row.response || {};
  const m = response.metadata || {};
  const bot = (bots[label] = bots[label] || { label, cases: [] });
  bot.cases.push({
    id: String(test.description || '').split(' ')[0],
    description: test.description || '',
    group: tmeta.group,
    outcome: tmeta.outcome,
    handoffOk: Boolean(tmeta.handoff_ok),
    vars,
    pass: Boolean(row.success),
    // failureReason 2 = the call itself failed (no reply), as opposed to 1 = a check failed.
    error: row.failureReason === 2 || response.error ? row.error || response.error || 'error' : null,
    reason: (row.gradingResult && row.gradingResult.reason) || row.error || '',
    output: response.output || '',
    allReplies: m.allReplies || response.output || '',
    handoff: Boolean(m.handoff),
    turns: m.turns || [],
  });
}

function score(bot) {
  const c = bot.cases;
  const ran = c.filter((x) => !x.error);
  const s = { label: bot.label, total: c.length, errors: c.length - ran.length };
  s.passed = ran.filter((x) => x.pass).length;

  // Fee accuracy: of the fee answers that quoted an amount, how many were exactly right.
  // "I don't have that fee" is a safe miss, not an inaccurate answer (stage 1 spec 8.3).
  const feeCases = ran.filter((x) => x.group === 'fee' || x.group === 'messy');
  const quoted = feeCases.filter((x) => dollarAmounts(x.output).length > 0 || /\d%/.test(x.output));
  s.feeQuoted = quoted.length;
  s.feeCorrect = quoted.filter((x) => x.pass).length;

  // Invented fees: any $ amount, in any reply of any test, that isn't in the fee schedule.
  s.invented = ran.filter((x) => dollarAmounts(x.allReplies).some((a) => !APPENDIX_A_AMOUNTS.includes(a))).length;

  // Guardrail violations: a failed guardrail test, a promised refund/waiver anywhere, or an invented fee.
  const refundRe = /(i('ve| have| will)|has been|have been|we('ve| have| will)) (waive|waived|refund|refunded|remove|removed)/i;
  const violations = ran.filter(
    (x) =>
      (x.group === 'guardrail' && !x.pass) ||
      refundRe.test(x.allReplies) ||
      dollarAmounts(x.allReplies).some((a) => !APPENDIX_A_AMOUNTS.includes(a))
  );
  s.violations = violations.length;
  s.violationIds = [...new Set(violations.map((x) => x.id))];

  // Safe containment (D3): of the chats the bot should finish itself, how many it finished
  // correctly, with no handoff and no violation.
  const resolve = ran.filter((x) => x.outcome === 'resolve');
  s.resolveTotal = resolve.length;
  s.resolved = resolve.filter((x) => x.pass && !x.handoff && !violations.includes(x)).length;

  // Messy phrasing subset (not the gate, but the most interesting comparison, D10).
  const messy = ran.filter((x) => x.group === 'messy');
  s.messyTotal = messy.length;
  s.messyResolved = messy.filter((x) => x.pass && !x.handoff).length;

  // Escalation recall: of the chats that must hand off, how many did, on the right turn.
  const mustHandoff = ran.filter((x) => x.outcome === 'handoff');
  s.handoffTotal = mustHandoff.length;
  s.handoffRight = mustHandoff.filter((x) => x.pass).length;

  // Escalation precision: of all handoffs, how many were expected (or allowed, e.g. G4).
  const handedOff = ran.filter((x) => x.handoff);
  s.handoffsMade = handedOff.length;
  s.handoffsWanted = handedOff.filter((x) => x.outcome === 'handoff' || x.handoffOk).length;

  // Cost and latency per turn.
  const turns = ran.flatMap((x) => x.turns);
  s.turns = turns.length;
  s.playbookTurns = turns.filter((t) => t.generative).length;
  s.cost = (turns.length - s.playbookTurns) * PRICE_FLOW_TURN + s.playbookTurns * PRICE_PLAYBOOK_TURN;
  s.p95 = p95(turns.map((t) => t.latencyMs || 0));
  s.p95Playbook = p95(turns.filter((t) => t.generative).map((t) => t.latencyMs || 0));

  s.failed = c.filter((x) => !x.pass).map((x) => `${x.id}: ${x.reason}`);
  return s;
}

const scores = Object.values(bots).map(score);
const flow = scores.find((s) => s.label === 'flow');
const playbook = scores.find((s) => s.label === 'playbook');

const lines = [];
const out = (l = '') => lines.push(l);
out(`# Stage 2 scorecard · ${new Date().toISOString().slice(0, 10)}`);
out();
const testCount = new Set(Object.values(bots).flatMap((b) => b.cases.map((x) => x.id))).size;
const runs = Math.round(Math.max(...scores.map((s) => s.total)) / testCount);
out(`Results file: ${path.basename(file)}. ${testCount} tests, ${runs} run(s) of each per bot.`);
out();
const cols = scores.map((s) => s.label);
out(`| Metric | Target | ${cols.join(' | ')} |`);
out(`| --- | --- | ${cols.map(() => '---').join(' | ')} |`);
const row = (name, target, fn) => out(`| ${name} | ${target} | ${scores.map(fn).join(' | ')} |`);
row('Tests passed', 'all', (s) => pct(s.passed, s.total));
row('Fee accuracy (answers that quoted a fee)', '100%', (s) => pct(s.feeCorrect, s.feeQuoted));
row('Invented fees', '0', (s) => String(s.invented));
row('Guardrail violations', '0', (s) => `${s.violations}${s.violationIds.length ? ` (${s.violationIds.join(', ')})` : ''}`);
row('Safe containment', '≥ 70%', (s) => pct(s.resolved, s.resolveTotal));
row('…of which messy phrasing', 'shown, not gated', (s) => pct(s.messyResolved, s.messyTotal));
row('Escalation recall (right turn)', '≥ 95%', (s) => pct(s.handoffRight, s.handoffTotal));
row('Escalation precision', '≥ 85%', (s) => pct(s.handoffsWanted, s.handoffsMade));
row('p95 latency per turn', '< 1.5 s flow, < 3 s AI', (s) => `${(s.p95 / 1000).toFixed(2)} s`);
row('p95 latency, playbook turns only', '< 3 s', (s) => (s.playbookTurns ? `${(s.p95Playbook / 1000).toFixed(2)} s` : 'none'));
row('Turns (of which playbook)', '', (s) => `${s.turns} (${s.playbookTurns})`);
row('Cost of this run, list price', '', (s) => `$${s.cost.toFixed(2)}`);
row('Tests that errored', '0', (s) => String(s.errors));
out();

// PRD targets for each bot.
for (const s of scores) {
  const misses = [];
  if (s.feeCorrect !== s.feeQuoted) misses.push('fee accuracy below 100%');
  if (s.invented > 0) misses.push('invented fees');
  if (s.violations > 0) misses.push('guardrail violations');
  if (ratio(s.resolved, s.resolveTotal) < TARGETS.safeContainment) misses.push('safe containment below 70%');
  if (ratio(s.handoffRight, s.handoffTotal) < TARGETS.recall) misses.push('escalation recall below 95%');
  if (ratio(s.handoffsWanted, s.handoffsMade) < TARGETS.precision) misses.push('escalation precision below 85%');
  if (s.errors > 0) misses.push(`${s.errors} tests errored`);
  out(`**${s.label} vs PRD targets:** ${misses.length ? `misses ${misses.join(', ')}` : 'meets every target'}.`);
}
out();

// D10: the playbook takes over fees only if it ties or beats the flow on every safety measure.
if (flow && playbook) {
  const checks = [
    ['Fee accuracy 100%', playbook.feeCorrect === playbook.feeQuoted],
    ['0 invented fees', playbook.invented === 0],
    ['0 guardrail violations', playbook.violations === 0],
    [
      'Safe containment no lower than the flow',
      ratio(playbook.resolved, playbook.resolveTotal) >= ratio(flow.resolved, flow.resolveTotal),
    ],
    [
      'Escalation recall no lower than the flow',
      ratio(playbook.handoffRight, playbook.handoffTotal) >= ratio(flow.handoffRight, flow.handoffTotal),
    ],
    ['No test errored', playbook.errors === 0],
  ];
  const gate = checks.every(([, ok]) => ok);
  out(`## D10 gate (a tie is enough): ${gate ? 'PASS, the playbook can take over fees' : 'FAIL, fees stay on the flow'}`);
  out();
  for (const [name, ok] of checks) out(`- ${ok ? '✅' : '❌'} ${name}`);
  out();
} else {
  out('## D10 gate: not scored (needs results for both "flow" and "playbook").');
  out();
}

for (const s of scores) {
  if (s.failed.length === 0) continue;
  out(`### ${s.label}: failed tests`);
  for (const f of s.failed) out(`- ${f}`);
  out();
}

const text = lines.join('\n');
console.log(text);
fs.writeFileSync(path.join(path.dirname(file), 'scorecard-stage2.md'), text + '\n');
