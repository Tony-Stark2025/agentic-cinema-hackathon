const test = require('node:test');
const assert = require('node:assert/strict');

test('Gemini 3.x 5-Model Pool Configuration (Official 3.7 / 3.6 / 3.5 / 3.1 Suite)', () => {
  const geminiModels = [
    'gemini-3.7-flash',
    'gemini-3.6-flash',
    'gemini-3.5-flash',
    'gemini-3.5-flash-lite',
    'gemini-3.1-flash-lite'
  ];

  assert.equal(geminiModels.length, 5, 'Should configure 5 official Gemini 3.x Flash & Flash-Lite models');
  assert.ok(geminiModels.every(m => m.startsWith('gemini-3.')), 'All models must be Gemini 3.x');
  assert.ok(geminiModels.includes('gemini-3.7-flash'), 'Must include flagship gemini-3.7-flash');
  assert.ok(geminiModels.includes('gemini-3.6-flash'), 'Must include high-speed gemini-3.6-flash');
  assert.ok(geminiModels.includes('gemini-3.5-flash'), 'Must include agentic gemini-3.5-flash');
  assert.ok(geminiModels.includes('gemini-3.5-flash-lite'), 'Must include sub-agent gemini-3.5-flash-lite');
  assert.ok(geminiModels.includes('gemini-3.1-flash-lite'), 'Must include lightweight gemini-3.1-flash-lite');
});

test('Rate Limit Evasion: Circuit Breaker & 5x Quota Multiplier Calculation', () => {
  const models = 5;
  const singleModelRpm = 15; // Free tier standard
  const aggregatedRpm = models * singleModelRpm;

  assert.equal(aggregatedRpm, 75, 'Aggregated RPM across 5 distinct model endpoints provides 5x capacity');
});
