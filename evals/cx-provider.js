// promptfoo provider that talks to the Harbourline Dialogflow CX agent.
// For each test it opens ONE new session, sends the test's `turns` in order,
// and reports what happened. Login comes from Application Default Credentials
// (gcloud auth application-default login), so there is no key file anywhere.

const crypto = require('crypto');
const path = require('path');
const { SessionsClient } = require('@google-cloud/dialogflow-cx');

// Load project1/evals/.env (git-ignored) if it exists.
try {
  process.loadEnvFile(path.join(__dirname, '.env'));
} catch (e) {
  // No .env file: fall back to variables already set in the terminal.
}

// Turns a protobuf Struct (how the API returns session parameters) into a plain object.
function structToObject(struct) {
  const out = {};
  for (const [key, val] of Object.entries((struct && struct.fields) || {})) {
    if (val.kind === 'structValue') out[key] = structToObject(val.structValue);
    else if (val.kind === 'listValue') out[key] = (val.listValue.values || []).map((v) => v[v.kind]);
    else if (val.kind === 'nullValue') out[key] = null;
    else out[key] = val[val.kind];
  }
  return out;
}

// The console saved some replies with curly apostrophes (’). Straighten them
// so a check for "I can't" matches "I can’t".
function straightenQuotes(text) {
  return text.replace(/[‘’]/g, "'").replace(/[“”]/g, '"');
}

class CxProvider {
  constructor(options = {}) {
    const config = options.config || {};
    this.label = options.label;
    // Which agent to test is a setting, so stage 2 can point the same tests at another agent.
    // agentIdEnv names the .env variable that holds the agent ID (default CX_AGENT_ID).
    this.projectId = process.env.CX_PROJECT_ID;
    this.location = process.env.CX_LOCATION || 'global';
    this.agentId = process.env[config.agentIdEnv || 'CX_AGENT_ID'];
    this.languageCode = config.languageCode || 'en';
    if (!this.projectId || !this.agentId) {
      throw new Error(
        `Missing CX_PROJECT_ID or ${config.agentIdEnv || 'CX_AGENT_ID'}. Copy .env.example to .env and fill it in.`
      );
    }
    // global uses dialogflow.googleapis.com; any other location has its own endpoint.
    const apiEndpoint =
      this.location === 'global'
        ? 'dialogflow.googleapis.com'
        : `${this.location}-dialogflow.googleapis.com`;
    this.client = new SessionsClient({ apiEndpoint });
  }

  id() {
    return `dialogflow-cx:${this.agentId}`;
  }

  async callApi(prompt, context) {
    const turns = (context && context.vars && context.vars.turns) || [prompt];
    const session = this.client.projectLocationAgentSessionPath(
      this.projectId,
      this.location,
      this.agentId,
      `eval-${crypto.randomUUID()}`
    );

    const results = [];
    for (const [i, text] of turns.entries()) {
      const started = Date.now();
      const [response] = await this.client.detectIntent({
        session,
        queryInput: { text: { text }, languageCode: this.languageCode },
      });
      const latencyMs = Date.now() - started;
      const qr = response.queryResult || {};
      const messages = qr.responseMessages || [];
      const params = structToObject(qr.parameters);

      results.push({
        turn: i + 1,
        customer: text,
        reply: straightenQuotes(
          messages
            .filter((m) => m.text)
            .map((m) => m.text.text.join(' '))
            .join('\n')
        ),
        handoff: messages.some((m) => m.liveAgentHandoff),
        handoffSummary: params.handoff_summary || null,
        intent: (qr.match && qr.match.intent && qr.match.intent.displayName) || null,
        matchType: (qr.match && qr.match.matchType) || null,
        confidence: (qr.match && qr.match.confidence) || 0,
        page: (qr.currentPage && qr.currentPage.displayName) || null,
        latencyMs,
      });
    }

    const last = results[results.length - 1];
    const firstHandoff = results.find((r) => r.handoff);
    return {
      // The reply to the last customer message is what contains / not-contains / regex checks look at.
      output: last.reply,
      metadata: {
        turns: results,
        allReplies: results.map((r) => r.reply).join('\n'),
        handoff: Boolean(firstHandoff),
        handoffTurn: firstHandoff ? firstHandoff.turn : null,
        handoffSummary: firstHandoff ? firstHandoff.handoffSummary : last.handoffSummary,
        intent: last.intent,
        latencyMs: results.reduce((sum, r) => sum + r.latencyMs, 0),
      },
    };
  }
}

module.exports = CxProvider;
