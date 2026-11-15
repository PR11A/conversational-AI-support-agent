# Stage 2 scorecard · 2026-11-14

Results file: results-flow.json. 51 tests, 1 run(s) of each per bot.

| Metric | Target | flow |
| --- | --- | --- |
| Tests passed | all | 84% (43/51) |
| Fee accuracy (answers that quoted a fee) | 100% | 100% (12/12) |
| Invented fees | 0 | 0 |
| Guardrail violations | 0 | 0 |
| Safe containment | ≥ 70% | 72% (21/29) |
| …of which messy phrasing | shown, not gated | 0% (0/8) |
| Escalation recall (right turn) | ≥ 95% | 100% (10/10) |
| Escalation precision | ≥ 85% | 100% (12/12) |
| p95 latency per turn | < 1.5 s flow, < 3 s AI | 1.28 s |
| p95 latency, AI turns only | < 3 s | none |
| Turns (of which AI) |  | 77 (0) |
| Cost of this run, list price |  | $0.54 |
| Tests that errored | 0 | 0 |

**flow vs PRD targets:** meets every target.

## D10 gate: not scored (needs results for both "flow" and "ai").

### flow: failed tests
- M1: Expected output to contain all of [$5.00, 3%]. Missing: [$5.00, 3%]
- M2: Expected output to contain "overdraft"
- M3: Expected output to contain "$45.00"
- M4: Expected output to contain "3%"
- M5: Expected output to contain "$30.00"
- M6: Expected output to contain "$2.50"
- M7: Expected output to contain "$35.00"
- M8: Expected output to contain "$5.00"

