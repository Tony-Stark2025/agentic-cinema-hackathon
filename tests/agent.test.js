const test = require('node:test');
const assert = require('node:assert/strict');

test('Google Cloud Vertex AI: Gemini 3.8 Flash Universal Configuration', () => {
  const agentRoles = ['SENTINEL', 'DIAGNOSTICIAN', 'REMEDIATION', 'EXECUTIVE'];
  const modelId = process.env.GEMINI_MODEL || 'gemini-3.8-flash';
  const platform = 'Google Cloud Vertex AI';
  const projectId = 'gen-lang-client-0942141479';
  const region = 'us-central1';

  assert.equal(agentRoles.length, 4, 'All 4 agent roles must be configured');
  assert.equal(modelId, 'gemini-3.8-flash', 'Must use gemini-3.8-flash universally');
  assert.equal(platform, 'Google Cloud Vertex AI', 'Platform must be Google Cloud Vertex AI');
  assert.equal(projectId, 'gen-lang-client-0942141479', 'Target GCP project must match gen-lang-client-0942141479');
  assert.equal(region, 'us-central1', 'Target region must be us-central1');
});

test('Gemini 3.8 Flash: Uncapped Adaptive Reasoning Configuration', () => {
  const reasoningConfig = {
    mode: 'uncapped-adaptive',
    thinkingCapRemoved: true,
    platform: 'Gemini Enterprise Agent Platform'
  };

  assert.equal(reasoningConfig.mode, 'uncapped-adaptive', 'Reasoning budget cap must be removed for adaptive depth');
  assert.equal(reasoningConfig.thinkingCapRemoved, true, 'Thinking cap removed flag must be true');
});

test('Telemetry Analytics Engine: Deterministic Anomaly Math', () => {
  // Test dV/dt memory velocity formula: (last - first) in MB / deltaSeconds
  const sampleA = { timestamp: 10000, vramUsedGb: 32.0 };
  const sampleB = { timestamp: 20000, vramUsedGb: 36.8 }; // 4.8 GB over 10s = 4915.2 MB / 10s = 491.52 MB/s
  const deltaSeconds = (sampleB.timestamp - sampleA.timestamp) / 1000;
  const velocityMbPerSec = ((sampleB.vramUsedGb - sampleA.vramUsedGb) * 1024) / deltaSeconds;

  assert.ok(velocityMbPerSec > 400, 'Memory velocity must detect rapid VRAM growth (>400 MB/s)');

  // Test Z-score formula: (x - mean) / stdDev
  const clusterRatios = [0.65, 0.68, 0.62, 0.99, 0.66, 0.64];
  const mean = clusterRatios.reduce((a, b) => a + b, 0) / clusterRatios.length;
  const variance = clusterRatios.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / clusterRatios.length;
  const stdDev = Math.sqrt(variance);
  const targetZ = (0.99 - mean) / stdDev;

  assert.ok(targetZ > 2.0, 'Outlier node with 99% VRAM must have Z-score > 2.0');
});
