const test = require('node:test');
const assert = require('node:assert/strict');

test('Gemini 3.x Multi-Model Pool Configuration (Official 3.7 / 3.5 / 3.1 Suite)', () => {
  const geminiModels = [
    'gemini-3.7-flash',
    'gemini-3.5-flash',
    'gemini-3.5-flash-lite',
    'gemini-3.1-flash-lite'
  ];

  assert.equal(geminiModels.length, 4, 'Should configure 4 official Gemini 3.x Flash & Flash-Lite models');
  assert.ok(geminiModels.every(m => m.startsWith('gemini-3.')), 'All models must be Gemini 3.x');
  assert.ok(geminiModels.includes('gemini-3.7-flash'), 'Must include flagship gemini-3.7-flash');
  assert.ok(geminiModels.includes('gemini-3.5-flash-lite'), 'Must include sub-agent gemini-3.5-flash-lite');
});
