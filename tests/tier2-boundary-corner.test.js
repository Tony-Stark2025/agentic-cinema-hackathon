const test = require('node:test');
const assert = require('node:assert/strict');

test('Tier 2 [Boundary: Tool Registry & Dispatch]: Unknown & Malformed Invocations', async () => {
  const { GrafanaMcpClient } = await import('../src/mcp/grafana-client.ts');
  const mcp = GrafanaMcpClient.getInstance();

  // Unknown tool invocation must return success: false gracefully
  const unknownRes = await mcp.executeTool('non_existent_tool_xyz', { foo: 'bar' });
  assert.equal(unknownRes.success, false, 'Unknown tool call must return success: false');
  assert.ok(unknownRes.data.includes('Unknown tool'), 'Should include descriptive error text');

  // Empty arguments object
  const emptyArgsRes = await mcp.executeTool('grafana_query_metrics', {});
  assert.equal(emptyArgsRes.success, true, 'Default arguments should prevent runtime crash');

  // Non-existent trace ID
  const nullTraceRes = await mcp.executeTool('grafana_get_trace', { traceId: 'trace-404-not-found' });
  assert.equal(nullTraceRes.success, true);
  assert.equal(nullTraceRes.data.traceId, 'trace-404-not-found');

  // Negative limit on logs query
  const negLogRes = await mcp.executeTool('grafana_query_logs', { logql: '', limit: -5 });
  assert.equal(negLogRes.success, true);
});

test('Tier 2 [Boundary: Mathematical Calculus]: Extreme & Degenerate Telemetry Samples', async () => {
  const { TelemetryAnalyticsEngine } = await import('../src/telemetry/analytics-engine.ts');
  const analytics = TelemetryAnalyticsEngine.getInstance();

  const dummyNodes = [
    { id: 'node-01', vramUsedGb: 10, vramTotalGb: 48, temperatureC: 60, status: 'HEALTHY' }
  ];

  // 1. Completely empty history array (zero samples)
  const emptyEval = analytics.evaluateNode('node-01', dummyNodes, []);
  assert.equal(emptyEval.vramVelocityMbPerSec, 0, 'Zero history must result in 0 velocity');
  assert.equal(emptyEval.isMemoryLeak, false);

  // 2. Single sample history (cannot compute delta)
  const singleEval = analytics.evaluateNode('node-01', dummyNodes, [{ timestamp: Date.now(), vramUsedGb: 10, temperatureC: 60 }]);
  assert.equal(singleEval.vramVelocityMbPerSec, 0, 'Single sample must result in 0 velocity');

  // 3. Static flat line history (delta is 0)
  const flatHistory = [
    { timestamp: Date.now() - 10000, vramUsedGb: 24, temperatureC: 65 },
    { timestamp: Date.now(), vramUsedGb: 24, temperatureC: 65 }
  ];
  const flatEval = analytics.evaluateNode('node-01', dummyNodes, flatHistory);
  assert.equal(flatEval.vramVelocityMbPerSec, 0, 'Flat history must compute 0 velocity');
  assert.equal(flatEval.isMemoryLeak, false);

  // 4. Trace Span analysis with empty spans
  const emptyTrace = analytics.analyzeTraceSpans([]);
  assert.equal(emptyTrace.anomalousSpans.length, 0);
  assert.equal(emptyTrace.bottleneckSpan, null);
});

test('Tier 2 [Boundary: Cluster Node Invariants & Remediations]: Out-of-Bounds Node IDs', async () => {
  const { StudioStateManager } = await import('../src/telemetry/studio-state.ts');
  const state = StudioStateManager.getInstance();

  // Attempt remediation on non-existent node
  const invalidRem = state.executeNodeRemediation('gpu-node-999', 'SPLIT_RENDER_TILES');
  assert.equal(invalidRem.success, false);
  assert.ok(invalidRem.message.includes('not found'));

  // Unknown remediation action type on valid node
  const badActionRem = state.executeNodeRemediation('gpu-node-01', 'UNKNOWN_ACTION');
  assert.equal(badActionRem.success, true); // Still returns result structure without crashing
});

test('Tier 2 [Boundary: External Telemetry Ingest]: Out-of-Range Sensor Values', async () => {
  const { StudioStateManager } = await import('../src/telemetry/studio-state.ts');
  const state = StudioStateManager.getInstance();

  // Ingest with extreme high VRAM (triggers emergency incident)
  const extremeNode = state.ingestExternalGpuTelemetry({
    nodeId: 'gpu-node-02',
    vramUsedGb: 47.5,
    vramTotalGb: 48.0,
    temperatureC: 98,
    powerWatts: 450
  });

  assert.equal(extremeNode.id, 'gpu-node-02');
  assert.equal(extremeNode.vramUsedGb, 47.8);
  assert.ok(extremeNode.temperatureC >= 84, 'Temperature must reflect thermal alert state');
  assert.equal(extremeNode.status, 'CRITICAL', 'VRAM ratio > 0.92 must flip status to CRITICAL');

  // Ingest low VRAM to clear
  const recoveredNode = state.ingestExternalGpuTelemetry({
    nodeId: 'gpu-node-02',
    vramUsedGb: 18.0,
    vramTotalGb: 48.0,
    temperatureC: 62
  });

  assert.equal(recoveredNode.status, 'HEALTHY', 'VRAM ratio <= 0.85 must normalize status to HEALTHY');
});
