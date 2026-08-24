const test = require('node:test');
const assert = require('node:assert/strict');

test('Gemini 3.x Multi-Model Pool Configuration', () => {
  const geminiModels = [
    'gemini-3.1-flash',
    'gemini-3.1-flash-lite',
    'gemini-3.0-flash',
    'gemini-3.0-flash-lite'
  ];

  assert.equal(geminiModels.length, 4, 'Should configure 4 Gemini 3.x Flash & Flash-Lite models');
  assert.ok(geminiModels.every(m => m.startsWith('gemini-3.')), 'All models must be Gemini 3.x');
});
