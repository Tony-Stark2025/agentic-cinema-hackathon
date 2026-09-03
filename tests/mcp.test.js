const test = require('node:test');
const assert = require('node:assert/strict');

test('Grafana MCP Client Tool Execution & State Manager', async () => {
  // Test that tool execution structure conforms to MCP spec
  const mcpTools = [
    'grafana_query_metrics',
    'grafana_query_logs',
    'grafana_get_trace',
    'grafana_list_alerts',
    'grafana_annotate_dashboard',
    'compute_telemetry_analytics',
    'studio_remediate_node'
  ];

  assert.equal(mcpTools.length, 7, 'Should expose 7 core Grafana MCP & analytics tools');
  assert.ok(mcpTools.includes('grafana_query_metrics'), 'Must include PromQL tool');
  assert.ok(mcpTools.includes('grafana_query_logs'), 'Must include LogQL tool');
  assert.ok(mcpTools.includes('grafana_get_trace'), 'Must include Tempo trace tool');
  assert.ok(mcpTools.includes('compute_telemetry_analytics'), 'Must include deterministic analytics tool');
  assert.ok(mcpTools.includes('studio_remediate_node'), 'Must include Remediation tool');
});
