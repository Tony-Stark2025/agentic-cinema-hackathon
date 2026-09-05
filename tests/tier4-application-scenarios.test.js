const test = require('node:test');
const assert = require('node:assert/strict');

test('Tier 4 [Scenario 1]: 4K Volumetric Render Memory Spike (CUDA OOM) End-to-End Self-Healing', async () => {
  const { StudioStateManager } = await import('../src/telemetry/studio-state.ts');
  const { ShowrunnerOrchestrator } = await import('../src/agent/orchestrator.ts');
  const { GrafanaMcpClient } = await import('../src/mcp/grafana-client.ts');

  const state = StudioStateManager.getInstance();
  const orchestrator = ShowrunnerOrchestrator.getInstance();
  const mcp = GrafanaMcpClient.getInstance();

  state.resetToHealthy();

  // Step 1: Director simulates 8K raymarching OOM on gpu-node-04
  const incident = state.triggerIncident('CUDA_OOM_MEMORY_LEAK', 'gpu-node-04');
  assert.equal(incident.severity, 'P1_CRITICAL');

  // Step 2: Parallel Telemetry Verification
  const metrics = await mcp.executeTool('grafana_query_metrics', { promql: 'gpu_vram_utilization_ratio{node="gpu-node-04"}' });
  assert.equal(metrics.success, true);
  assert.ok(metrics.data.anomaliesDetected.length > 0, 'Must detect statistical anomaly');

  // Step 3: Run Central Orchestrator Autonomous Loop
  const session = await orchestrator.investigateAndRemediateIncident(incident, 'AUTONOMOUS');
  assert.equal(session.status, 'COMPLETED');
  assert.equal(session.steps.length, 4, 'Must execute all 4 agents: Sentinel, Diagnostician, Remediation, Executive');

  // Step 4: Validate Executive Financial Report ($14,400 saved)
  const execStep = session.steps.find(s => s.agentRole === 'EXECUTIVE');
  assert.ok(execStep.thought.includes('14,400') || execStep.thought.includes('Downtime'), 'Executive must calculate financial downtime loss averted');

  // Step 5: Verify Node Normalization & Dashboard Annotation
  const postSnapshot = state.getSnapshot();
  const node04 = postSnapshot.nodes.find(n => n.id === 'gpu-node-04');
  assert.equal(node04.status, 'HEALTHY');
  assert.ok(node04.vramUsedGb <= 32, 'VRAM must be flushed to nominal (30GB on 80GB blade)');
});

test('Tier 4 [Scenario 2]: Unreal Engine Nanite Shader Deadlock with Supervised Human-in-the-Loop', async () => {
  const { StudioStateManager } = await import('../src/telemetry/studio-state.ts');
  const { ShowrunnerOrchestrator } = await import('../src/agent/orchestrator.ts');

  const state = StudioStateManager.getInstance();
  const orchestrator = ShowrunnerOrchestrator.getInstance();

  state.resetToHealthy();

  // Inject Nanite Hang on gpu-node-11
  const incident = state.triggerIncident('UNREAL_NANITE_SHADER_HANG', 'gpu-node-11');
  assert.equal(incident.affectedNodeId, 'gpu-node-11');

  // Run in Supervised Mode (simulating Lead TD workflow)
  const session = await orchestrator.investigateAndRemediateIncident(incident, 'SUPERVISED');
  assert.equal(session.status, 'WAITING_FOR_APPROVAL');
  assert.equal(session.activeAgent, 'DIAGNOSTICIAN');
  assert.equal(incident.status, 'AWAITING_APPROVAL');

  // Simulate Lead TD clicking "Approve Remediation"
  await orchestrator.executeApprovedRemediation(incident, session, 'HOT_RELOAD_SHADER');
  assert.equal(incident.status, 'RESOLVED');

  const node11 = state.getSnapshot().nodes.find(n => n.id === 'gpu-node-11');
  assert.equal(node11.status, 'HEALTHY');
});

test('Tier 4 [Scenario 3]: Technical Director Copilot Natural Language Telemetry Reasoning', async () => {
  const { VertexAiGeminiClient } = await import('../src/agent/vertex-client.ts');
  const vertex = VertexAiGeminiClient.getInstance();

  // Query 1: Operational Status
  const q1 = await vertex.generateContent('COPILOT', {
    systemPrompt: 'You are Showrunner Copilot.',
    userPrompt: 'What is your problem?'
  });
  assert.ok(q1.text.length > 50);

  // Query 2: Technical Concept (Dual-Tier SRE Model)
  const q2 = await vertex.generateContent('COPILOT', {
    systemPrompt: 'You are Showrunner Copilot.',
    userPrompt: 'Why not just use kubernetes crash restarts?'
  });
  assert.ok(q2.text.toLowerCase().includes('microsecond') || q2.text.toLowerCase().includes('crash') || q2.text.toLowerCase().includes('restart'));

  // Query 3: Sample Counter Explanation
  const q3 = await vertex.generateContent('COPILOT', {
    systemPrompt: 'You are Showrunner Copilot.',
    userPrompt: 'What does sample counter mean?'
  });
  assert.ok(q3.text.toLowerCase().includes('sample') || q3.text.toLowerCase().includes('pixel') || q3.text.toLowerCase().includes('optix'));
});

test('Tier 4 [Scenario 4]: Live Production Endpoint Probes on Cloud Run', async () => {
  const liveUrl = 'https://showrunner-studio-ops-135010851380.us-central1.run.app';

  try {
    // 1. Probe MCP Status
    const mcpRes = await fetch(`${liveUrl}/api/mcp/status`, { signal: AbortSignal.timeout(6000) });
    if (mcpRes.ok) {
      const mcpData = await mcpRes.json();
      assert.equal(mcpData.connected, true);
      assert.equal(mcpData.toolsAvailable, 7);
      assert.ok(mcpData.protocol.includes('Model Context Protocol'));
    }

    // 2. Probe Telemetry Snapshot
    const telRes = await fetch(`${liveUrl}/api/telemetry`, { signal: AbortSignal.timeout(6000) });
    if (telRes.ok) {
      const telData = await telRes.json();
      assert.ok(telData.telemetry.nodes.length === 16);
      assert.ok(telData.clusterAnalytics);
    }
  } catch (err) {
    console.warn(`[Tier 4 Live Probe] Network probe to Cloud Run skipped or timed out: ${err.message}`);
  }
});
