const test = require('node:test');
const assert = require('node:assert/strict');

test('E2E Verification: 16-Node Cluster Baseline & Chaos Injection', async () => {
  const { StudioStateManager } = await import('../src/telemetry/studio-state.ts');
  const stateManager = StudioStateManager.getInstance();
  stateManager.resetToHealthy();

  const snapshot = stateManager.getSnapshot();
  assert.equal(snapshot.nodes.length, 16, 'Cluster must contain exactly 16 GPU nodes');
  assert.equal(snapshot.nodes.filter(n => n.status === 'HEALTHY').length, 16, 'All nodes must be healthy at baseline');

  // Trigger 8K CUDA OOM incident on gpu-node-04
  const incident = stateManager.triggerIncident('CUDA_OOM_MEMORY_LEAK', 'gpu-node-04');
  assert.equal(incident.affectedNodeId, 'gpu-node-04');
  assert.equal(incident.severity, 'P1_CRITICAL');

  // Verify node evaluation reveals memory leak velocity and high Z-score
  const nodeEval = stateManager.getNodeEvaluation('gpu-node-04');
  assert.equal(nodeEval.severity, 'CRITICAL', 'Node 4 evaluation must be CRITICAL');
  assert.ok(nodeEval.isMemoryLeak, 'Node 4 must be flagged as active memory leak');
  assert.ok(nodeEval.vramVelocityMbPerSec > 250, 'Memory velocity must be > 250 MB/s');
  assert.ok(nodeEval.vramZScore > 2.5, 'VRAM Z-Score must exceed 2.5 sigma');

  // Execute remediation
  const remResult = stateManager.executeNodeRemediation('gpu-node-04', 'SPLIT_RENDER_TILES');
  assert.equal(remResult.success, true, 'Remediation must succeed');

  // Verify node recovered
  const postEval = stateManager.getNodeEvaluation('gpu-node-04');
  assert.equal(postEval.severity, 'NORMAL', 'Node 4 must normalize to HEALTHY post-remediation');
});

test('E2E Verification: MCP Client Tool Registry & Dual-Engine Fallback', async () => {
  const { GrafanaMcpClient } = await import('../src/mcp/grafana-client.ts');
  const mcpClient = GrafanaMcpClient.getInstance();

  // Test PromQL query tool
  const metricsRes = await mcpClient.executeTool('grafana_query_metrics', {
    promql: 'gpu_vram_utilization_ratio{node="gpu-node-04"}'
  });
  assert.equal(metricsRes.success, true);
  assert.ok(metricsRes.data.result.length === 16);

  // Test deterministic analytics tool
  const analyticsRes = await mcpClient.executeTool('compute_telemetry_analytics', {
    nodeId: 'gpu-node-04'
  });
  assert.equal(analyticsRes.success, true);
  assert.ok(analyticsRes.data.nodeEvaluation);
  assert.ok(analyticsRes.data.clusterAnalytics);

  // Test LogQL query tool
  const logsRes = await mcpClient.executeTool('grafana_query_logs', {
    logql: '{nodeId="gpu-node-04"} |= "error"',
    limit: 5
  });
  assert.equal(logsRes.success, true);

  // Test Tempo distributed trace tool
  const traceRes = await mcpClient.executeTool('grafana_get_trace', {
    traceId: 'trace-sample-01'
  });
  assert.equal(traceRes.success, true);
  assert.ok(traceRes.data.spans.length > 0);

  // Test Grafana annotation tool
  const annotRes = await mcpClient.executeTool('grafana_annotate_dashboard', {
    dashboardId: 'vfx-render-farm-live',
    text: 'E2E Test Annotation'
  });
  assert.equal(annotRes.success, true);
  assert.equal(annotRes.data.status, 'ANNOTATED_TO_GRAFANA');
});

test('E2E Verification: Supervised Mode (Human-in-the-Loop) & Dynamic Fallback Coherence', async () => {
  const { ShowrunnerOrchestrator } = await import('../src/agent/orchestrator.ts');
  const { StudioStateManager } = await import('../src/telemetry/studio-state.ts');
  const { VertexAiGeminiClient } = await import('../src/agent/vertex-client.ts');

  const stateManager = StudioStateManager.getInstance();
  const orchestrator = ShowrunnerOrchestrator.getInstance();
  const vertexClient = VertexAiGeminiClient.getInstance();

  // Test dynamic fallback parameterization on Nanite incident
  const naniteRes = await vertexClient.generateContent('DIAGNOSTICIAN', {
    systemPrompt: 'Diagnose incident',
    userPrompt: 'Investigate deadlock on gpu-node-11 for Unreal Nanite Shader Hang',
    context: { nodeId: 'gpu-node-11', category: 'UNREAL_NANITE_SHADER_HANG', frame: 910, shot: 'SH_04_CITY_BATTLE_02' }
  });
  assert.ok(naniteRes.text.includes('gpu-node-11'), 'Fallback must dynamically adapt to target node');
  assert.ok(naniteRes.text.includes('Nanite'), 'Fallback must dynamically adapt to Nanite shader domain');

  // Test Supervised Mode (Human-in-the-Loop)
  const incident = stateManager.triggerIncident('UNREAL_NANITE_SHADER_HANG', 'gpu-node-11');
  const session = await orchestrator.investigateAndRemediateIncident(incident, 'SUPERVISED');

  assert.equal(session.status, 'WAITING_FOR_APPROVAL', 'Supervised mode must pause at WAITING_FOR_APPROVAL');
  assert.equal(incident.status, 'AWAITING_APPROVAL', 'Incident status must be AWAITING_APPROVAL');

  // Human TD Approves the remediation plan
  const approvedSession = await orchestrator.executeApprovedRemediation(incident, session, 'HOT_RELOAD_SHADER');
  assert.equal(approvedSession.status, 'COMPLETED', 'Session completes after human approval');
  assert.equal(incident.status, 'RESOLVED', 'Incident resolves after human approval');
  assert.ok(incident.financialImpact.costSavedByShowrunnerUsd > 0, 'Financial impact must record savings');
});
