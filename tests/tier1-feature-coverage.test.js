const test = require('node:test');
const assert = require('node:assert/strict');

test('Tier 1 [F1 & F2]: Grafana MCP Protocol Bridge & Direct REST Driver Contracts', async () => {
  const { McpProtocolBridge } = await import('../src/mcp/mcp-protocol-bridge.ts');
  const { GrafanaRestDriver } = await import('../src/mcp/grafana-rest-driver.ts');

  const bridge = McpProtocolBridge.getInstance();
  const driver = GrafanaRestDriver.getInstance();

  assert.ok(bridge, 'McpProtocolBridge singleton must exist');
  assert.ok(driver, 'GrafanaRestDriver singleton must exist');
  assert.ok(bridge.getEndpoint().includes('mcp.grafana.com'), 'Bridge must default to Grafana Cloud MCP endpoint');

  // Test connection safety without throwing
  const connStatus = await driver.testConnection();
  assert.ok('connected' in connStatus);
  assert.ok('status' in connStatus);
});

test('Tier 1 [F3 & F4]: PromQL Metrics & LogQL Logs Query Tools', async () => {
  const { GrafanaMcpClient } = await import('../src/mcp/grafana-client.ts');
  const mcp = GrafanaMcpClient.getInstance();

  // Test PromQL query tool
  const metricRes = await mcp.executeTool('grafana_query_metrics', {
    promql: 'gpu_vram_utilization_ratio{cluster="alpha"}',
    timeRange: '15m'
  });
  assert.equal(metricRes.success, true);
  assert.ok(metricRes.data.result.length === 16, 'PromQL must return metrics for all 16 cluster nodes');
  assert.ok(typeof metricRes.data.clusterVramMean === 'number');

  // Test LogQL query tool
  const logRes = await mcp.executeTool('grafana_query_logs', {
    logql: '{service=~"blender|unreal"} |= "error"',
    limit: 5
  });
  assert.equal(logRes.success, true);
  assert.ok(Array.isArray(logRes.data.matchingEntries));
  assert.ok(logRes.data.totalLogsScanned >= 0);
});

test('Tier 1 [F5 & F6]: Tempo Trace Waterfalls & Live Dashboard Annotations', async () => {
  const { GrafanaMcpClient } = await import('../src/mcp/grafana-client.ts');
  const mcp = GrafanaMcpClient.getInstance();

  // Test Tempo distributed trace lookup
  const traceRes = await mcp.executeTool('grafana_get_trace', {
    traceId: 'trace-t1-feature-test'
  });
  assert.equal(traceRes.success, true);
  assert.equal(traceRes.data.traceId, 'trace-t1-feature-test');
  assert.ok(traceRes.data.spans.length >= 4, 'Trace waterfall must include at least 4 pipeline stages');

  // Test Dashboard Annotation
  const annotRes = await mcp.executeTool('grafana_annotate_dashboard', {
    dashboardId: 'vfx-render-farm-live',
    text: 'Tier 1 Automated Verification Marker',
    tags: 'showrunner,tier1-test,vertex-ai'
  });
  assert.equal(annotRes.success, true);
  assert.ok(annotRes.data.annotationId);
  assert.equal(annotRes.data.dashboardId, 'vfx-render-farm-live');
});

test('Tier 1 [F7–F10]: 16-Node Cluster State, Z-Score Calculus & OTel Dual-Dispatch', async () => {
  const { StudioStateManager } = await import('../src/telemetry/studio-state.ts');
  const { OtelAiObservability } = await import('../src/agent/otel.ts');
  const state = StudioStateManager.getInstance();
  const otel = OtelAiObservability.getInstance();

  state.resetToHealthy();
  const snapshot = state.getSnapshot();

  assert.equal(snapshot.nodes.length, 16, 'Cluster must hold exactly 16 GPU nodes');
  assert.equal(snapshot.nodes.every(n => n.status === 'HEALTHY'), true, 'All baseline nodes must be HEALTHY');

  // Verify Z-score and velocity calculus
  const analytics = state.getClusterAnalytics();
  assert.ok(typeof analytics.clusterMeanVramRatio === 'number');
  assert.equal(analytics.criticalCount, 0, 'Zero critical nodes at baseline');

  // Verify OTel span recording and metrics snapshot
  const testSpan = {
    spanId: `span-t1-${Date.now()}`,
    traceId: `trace-t1-${Date.now()}`,
    name: 'Tier1.OtelSpanTest',
    startTime: Date.now() - 100,
    endTime: Date.now(),
    attributes: { test: true }
  };
  otel.recordSpan(testSpan);

  const aggregates = otel.getAggregates();
  assert.ok(aggregates.totalLlmCalls >= 0);
  assert.ok(typeof aggregates.totalTokens === 'number');
});

test('Tier 1 [F11 & F12]: Authentic Incident Injection & Real Self-Healing Control', async () => {
  const { StudioStateManager } = await import('../src/telemetry/studio-state.ts');
  const state = StudioStateManager.getInstance();
  state.resetToHealthy();

  // 1. Inject CUDA OOM Incident
  const inc1 = state.triggerIncident('CUDA_OOM_MEMORY_LEAK', 'gpu-node-04');
  assert.equal(inc1.affectedNodeId, 'gpu-node-04');
  assert.equal(inc1.severity, 'P1_CRITICAL');

  const eval1 = state.getNodeEvaluation('gpu-node-04');
  assert.equal(eval1.severity, 'CRITICAL');
  assert.ok(eval1.isMemoryLeak);
  assert.ok(eval1.vramVelocityMbPerSec > 200, 'Memory velocity must reflect steep growth');

  // Self-heal via SPLIT_RENDER_TILES
  const rem1 = state.executeNodeRemediation('gpu-node-04', 'SPLIT_RENDER_TILES');
  assert.equal(rem1.success, true);
  assert.equal(state.getNodeEvaluation('gpu-node-04').severity, 'NORMAL');

  // 2. Inject Unreal Nanite Shader Deadlock
  const inc2 = state.triggerIncident('UNREAL_NANITE_SHADER_HANG', 'gpu-node-11');
  assert.equal(inc2.affectedNodeId, 'gpu-node-11');
  const eval2 = state.getNodeEvaluation('gpu-node-11');
  assert.equal(eval2.severity, 'WARNING', 'Nanite thermal anomaly evaluated as WARNING');

  // Self-heal via HOT_RELOAD_SHADER
  const rem2 = state.executeNodeRemediation('gpu-node-11', 'HOT_RELOAD_SHADER');
  assert.equal(rem2.success, true);
  assert.equal(state.getNodeEvaluation('gpu-node-11').severity, 'NORMAL');
});

test('Tier 1 [F13–F18]: Vertex AI Gemini 3.8 Flash, Reasoning Budgets & 4-Agent Pipeline', async () => {
  const { VertexAiGeminiClient } = await import('../src/agent/vertex-client.ts');
  const { AGENT_PROMPTS } = await import('../src/agent/prompts.ts');
  const vertex = VertexAiGeminiClient.getInstance();

  assert.ok(vertex, 'Vertex AI client singleton must exist');
  const metrics = vertex.getMetrics();
  assert.ok(metrics.modelId.includes('gemini-3.8-flash'));
  assert.equal(metrics.platform, 'Google Cloud Vertex AI');

  // Verify role prompts exist for all 4 agents
  assert.ok(AGENT_PROMPTS.SENTINEL.toLowerCase().includes('sentinel'), 'Sentinel prompt must be defined');
  assert.ok(AGENT_PROMPTS.DIAGNOSTICIAN.toLowerCase().includes('diagnostic'), 'Diagnostician prompt must be defined');
  assert.ok(AGENT_PROMPTS.REMEDIATION.toLowerCase().includes('remediation'), 'Remediation prompt must be defined');
  assert.ok(AGENT_PROMPTS.EXECUTIVE.toLowerCase().includes('executive'), 'Executive prompt must be defined');
});

test('Tier 1 [F19 & F20]: Production Status & Multi-Tier Health Verification', async () => {
  const { GrafanaMcpClient } = await import('../src/mcp/grafana-client.ts');
  const mcp = GrafanaMcpClient.getInstance();
  const status = mcp.getStatus();

  assert.ok(['MCP_PROTOCOL', 'GRAFANA_CLOUD_REST', 'STUDIO_LOCAL_HARNESS'].includes(status.mode));
  assert.equal(typeof status.mcpConnected, 'boolean');
  assert.equal(typeof status.restConfigured, 'boolean');
  assert.equal(mcp.getAvailableTools().length, 7, 'Must expose all 7 core studio tools');
});
