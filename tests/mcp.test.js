const test = require('node:test');
const assert = require('node:assert/strict');

test('Grafana MCP Client Tool Execution & State Manager', async () => {
  const { GrafanaMcpClient } = await import('../src/mcp/grafana-client.ts');
  const mcpClient = GrafanaMcpClient.getInstance();

  const tools = mcpClient.getAvailableTools();
  const toolNames = tools.map(t => t.name);

  assert.equal(tools.length, 7, 'Should expose 7 core Grafana MCP & analytics tools');
  assert.ok(toolNames.includes('grafana_query_metrics'), 'Must include PromQL tool');
  assert.ok(toolNames.includes('grafana_query_logs'), 'Must include LogQL tool');
  assert.ok(toolNames.includes('grafana_get_trace'), 'Must include Tempo trace tool');
  assert.ok(toolNames.includes('grafana_list_alerts'), 'Must include Alertmanager tool');
  assert.ok(toolNames.includes('grafana_annotate_dashboard'), 'Must include Annotation tool');
  assert.ok(toolNames.includes('compute_telemetry_analytics'), 'Must include deterministic analytics tool');
  assert.ok(toolNames.includes('studio_remediate_node'), 'Must include Remediation tool');

  // Verify status payload schema
  const status = mcpClient.getStatus();
  assert.ok('mcpConnected' in status);
  assert.ok('restConfigured' in status);
  assert.ok('mode' in status);

  // Execute PromQL query tool
  const metricRes = await mcpClient.executeTool('grafana_query_metrics', {
    promql: 'gpu_vram_utilization_ratio{node="gpu-node-04"}'
  });
  assert.equal(metricRes.success, true);
  assert.ok(metricRes.source);
  assert.ok(metricRes.latencyMs >= 0);
  assert.ok(metricRes.data.result.length === 16);

  // Execute LogQL query tool
  const logRes = await mcpClient.executeTool('grafana_query_logs', {
    logql: '{nodeId="gpu-node-04"} |= "CUDA"',
    limit: 5
  });
  assert.equal(logRes.success, true);
  assert.ok(logRes.source);
  assert.ok(Array.isArray(logRes.data.matchingEntries));

  // Execute Tempo trace query tool
  const traceRes = await mcpClient.executeTool('grafana_get_trace', {
    traceId: 'trace-err-test-01'
  });
  assert.equal(traceRes.success, true);
  assert.equal(traceRes.data.traceId, 'trace-err-test-01');
  assert.ok(Array.isArray(traceRes.data.spans));

  // Execute Alertmanager query tool
  const alertRes = await mcpClient.executeTool('grafana_list_alerts', {});
  assert.equal(alertRes.success, true);
  assert.ok(typeof alertRes.data.activeAlertCount === 'number');

  // Execute Annotation tool
  const annotRes = await mcpClient.executeTool('grafana_annotate_dashboard', {
    dashboardId: 'vfx-render-farm-live',
    text: 'Test annotation marker',
    tags: 'test,showrunner'
  });
  assert.equal(annotRes.success, true);
  assert.ok(annotRes.data.annotationId);
});

test('Grafana REST Driver & Protocol Bridge Architecture', async () => {
  const { GrafanaRestDriver } = await import('../src/mcp/grafana-rest-driver.ts');
  const { McpProtocolBridge } = await import('../src/mcp/mcp-protocol-bridge.ts');

  const restDriver = GrafanaRestDriver.getInstance();
  const bridge = McpProtocolBridge.getInstance();

  assert.ok(restDriver, 'Rest driver singleton must be initialized');
  assert.ok(bridge, 'Protocol bridge singleton must be initialized');

  // Verify unconfigured connectivity check handles gracefully without throwing
  const connTest = await restDriver.testConnection();
  assert.ok('connected' in connTest);
  assert.ok('status' in connTest);

  // Bridge endpoint should default to official Grafana MCP endpoint or env
  assert.ok(bridge.getEndpoint().includes('mcp.grafana.com'));
});
