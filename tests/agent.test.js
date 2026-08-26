const test = require('node:test');
const assert = require('node:assert/strict');

test('Google Cloud Vertex AI: Gemini 3.7 Flash Universal Configuration', () => {
  const agentRoles = ['SENTINEL', 'DIAGNOSTICIAN', 'REMEDIATION', 'EXECUTIVE'];
  const modelId = 'gemini-3.7-flash';
  const platform = 'Google Cloud Vertex AI';
  const projectId = 'gen-lang-client-0942141479';
  const region = 'us-central1';

  assert.equal(agentRoles.length, 4, 'All 4 agent roles must be configured');
  assert.equal(modelId, 'gemini-3.7-flash', 'Must use gemini-3.7-flash universally');
  assert.equal(platform, 'Google Cloud Vertex AI', 'Platform must be Google Cloud Vertex AI');
  assert.equal(projectId, 'gen-lang-client-0942141479', 'Target GCP project must match gen-lang-client-0942141479');
  assert.equal(region, 'us-central1', 'Target region must be us-central1');
});

test('Gemini 3.7 Flash: Hybrid Reasoning Budget Allocation', () => {
  const reasoningBudgets = {
    SENTINEL: 1024,
    DIAGNOSTICIAN: 2048,
    REMEDIATION: 1024,
    EXECUTIVE: 1024
  };

  assert.equal(reasoningBudgets.DIAGNOSTICIAN, 2048, 'Diagnostic Agent allocates 2048 reasoning tokens for deep root cause isolation');
  assert.equal(reasoningBudgets.SENTINEL, 1024, 'Sentinel allocates 1024 tokens for telemetry triage');
  assert.equal(reasoningBudgets.REMEDIATION, 1024, 'Remediation allocates 1024 tokens for deterministic tool execution');
  assert.equal(reasoningBudgets.EXECUTIVE, 1024, 'Executive allocates 1024 tokens for production dailies synthesis');
});
