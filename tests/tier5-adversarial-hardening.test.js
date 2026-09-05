const test = require('node:test');
const assert = require('node:assert/strict');

test('Tier 5 [Adversarial: Concurrent Chaos Stress]: Multi-Node Concurrent Incident Wave', async () => {
  const { StudioStateManager } = await import('../src/telemetry/studio-state.ts');
  const state = StudioStateManager.getInstance();
  state.resetToHealthy();

  // Inject 3 concurrent incidents on different nodes
  const inc1 = state.triggerIncident('CUDA_OOM_MEMORY_LEAK', 'gpu-node-04');
  const inc2 = state.triggerIncident('UNREAL_NANITE_SHADER_HANG', 'gpu-node-11');
  const inc3 = state.triggerIncident('STORAGE_IOPS_JITTER', 'gpu-node-15');

  assert.equal(inc1.affectedNodeId, 'gpu-node-04');
  assert.equal(inc2.affectedNodeId, 'gpu-node-11');
  assert.equal(inc3.affectedNodeId, 'gpu-node-15');

  const snapshot = state.getSnapshot();
  const criticals = snapshot.nodes.filter(n => n.status === 'CRITICAL');
  assert.equal(criticals.length, 2, 'Node 4 and 11 must be CRITICAL concurrently');

  const warnings = snapshot.nodes.filter(n => n.status === 'WARNING');
  assert.equal(warnings.length, 1, 'Node 15 must be WARNING concurrently');

  // Remediate all concurrently
  const rem1 = state.executeNodeRemediation('gpu-node-04', 'SPLIT_RENDER_TILES');
  const rem2 = state.executeNodeRemediation('gpu-node-11', 'HOT_RELOAD_SHADER');
  const rem3 = state.executeNodeRemediation('gpu-node-15', 'FAILOVER_GPU_NODE');

  assert.equal(rem1.success, true);
  assert.equal(rem2.success, true);
  assert.equal(rem3.success, true);

  // Verify cluster fully normalized
  const postSnapshot = state.getSnapshot();
  assert.equal(postSnapshot.nodes.every(n => n.status === 'HEALTHY'), true, 'All 16 nodes must return to HEALTHY');
});

test('Tier 5 [Adversarial: Noise Invariance]: Micro-Fluctuation Telemetry Jitter', async () => {
  const { TelemetryAnalyticsEngine } = await import('../src/telemetry/analytics-engine.ts');
  const analytics = TelemetryAnalyticsEngine.getInstance();

  const dummyNodes = [
    { id: 'gpu-node-01', vramUsedGb: 28.0, vramTotalGb: 48.0, temperatureC: 64, status: 'HEALTHY' }
  ];

  // Simulating realistic Brownian motion telemetry jitter (+/- 0.05 GB)
  const jitterHistory = [
    { timestamp: Date.now() - 30000, vramUsedGb: 28.0, temperatureC: 64 },
    { timestamp: Date.now() - 20000, vramUsedGb: 28.05, temperatureC: 64 },
    { timestamp: Date.now() - 10000, vramUsedGb: 27.98, temperatureC: 65 },
    { timestamp: Date.now(), vramUsedGb: 28.02, temperatureC: 64 }
  ];

  const evalResult = analytics.evaluateNode('gpu-node-01', dummyNodes, jitterHistory);

  // Must NOT trigger memory leak or critical anomaly for normal background jitter
  assert.equal(evalResult.isMemoryLeak, false, 'Jitter must NOT be flagged as memory leak');
  assert.equal(evalResult.severity, 'NORMAL', 'Jitter must maintain NORMAL severity');
  assert.ok(evalResult.vramVelocityMbPerSec < 50, 'Velocity of jitter must remain low');
});

test('Tier 5 [Adversarial: Fallback Resilience]: Fault Tolerance Under Simulated Rejection', async () => {
  const { GrafanaMcpClient } = await import('../src/mcp/grafana-client.ts');
  const mcp = GrafanaMcpClient.getInstance();

  // Rapid sequence of 10 disparate tool queries
  const toolsToHammer = [
    'grafana_query_metrics',
    'compute_telemetry_analytics',
    'grafana_query_logs',
    'grafana_get_trace',
    'grafana_list_alerts',
    'grafana_annotate_dashboard',
    'studio_remediate_node'
  ];

  const promises = toolsToHammer.map(t => mcp.executeTool(t, { nodeId: 'gpu-node-04', actionType: 'SPLIT_RENDER_TILES', promql: 'rate(render_fps[1m])' }));
  const results = await Promise.all(promises);

  assert.equal(results.length, 7);
  assert.equal(results.every(r => r.success === true), true, 'All 7 tools must complete successfully under concurrent load');
  assert.ok(results.every(r => typeof r.latencyMs === 'number'), 'Every execution must record latency');
});
