const test = require('node:test');
const assert = require('node:assert/strict');

const COMBINATORIAL_MATRIX = [
  {
    category: 'CUDA_OOM_MEMORY_LEAK',
    nodeId: 'gpu-node-04',
    expectedAction: 'SPLIT_RENDER_TILES',
    mode: 'AUTONOMOUS'
  },
  {
    category: 'CUDA_OOM_MEMORY_LEAK',
    nodeId: 'gpu-node-04',
    expectedAction: 'SPLIT_RENDER_TILES',
    mode: 'SUPERVISED'
  },
  {
    category: 'UNREAL_NANITE_SHADER_HANG',
    nodeId: 'gpu-node-11',
    expectedAction: 'HOT_RELOAD_SHADER',
    mode: 'AUTONOMOUS'
  },
  {
    category: 'UNREAL_NANITE_SHADER_HANG',
    nodeId: 'gpu-node-11',
    expectedAction: 'HOT_RELOAD_SHADER',
    mode: 'SUPERVISED'
  },
  {
    category: 'STORAGE_IOPS_JITTER',
    nodeId: 'gpu-node-15',
    expectedAction: 'FAILOVER_GPU_NODE',
    mode: 'AUTONOMOUS'
  },
  {
    category: 'STORAGE_IOPS_JITTER',
    nodeId: 'gpu-node-15',
    expectedAction: 'FAILOVER_GPU_NODE',
    mode: 'SUPERVISED'
  }
];

for (const combo of COMBINATORIAL_MATRIX) {
  test(`Tier 3 [Pairwise]: ${combo.category} on ${combo.nodeId} [Mode: ${combo.mode}]`, async () => {
    const { StudioStateManager } = await import('../src/telemetry/studio-state.ts');
    const { ShowrunnerOrchestrator } = await import('../src/agent/orchestrator.ts');

    const state = StudioStateManager.getInstance();
    const orchestrator = ShowrunnerOrchestrator.getInstance();

    state.resetToHealthy();

    // 1. Inject incident
    const incident = state.triggerIncident(combo.category, combo.nodeId);
    assert.equal(incident.affectedNodeId, combo.nodeId);

    // 2. Run Orchestration Pipeline
    const session = await orchestrator.investigateAndRemediateIncident(incident, combo.mode);
    assert.ok(session.sessionId);
    assert.ok(session.steps.length >= 2, 'Must include at least Sentinel and Diagnostician steps');

    if (combo.mode === 'AUTONOMOUS') {
      assert.equal(session.status, 'COMPLETED');
      assert.equal(session.activeAgent, 'EXECUTIVE');
      assert.equal(incident.status, 'RESOLVED');

      // Verify node normalized
      const nodeStatus = state.getSnapshot().nodes.find(n => n.id === combo.nodeId);
      assert.equal(nodeStatus.status, 'HEALTHY');
    } else {
      // SUPERVISED mode: must pause for human operator approval
      assert.equal(session.status, 'WAITING_FOR_APPROVAL');
      assert.equal(session.activeAgent, 'DIAGNOSTICIAN');
      assert.equal(incident.status, 'AWAITING_APPROVAL');

      // Execute approved remediation via orchestrator
      await orchestrator.executeApprovedRemediation(incident, session, combo.expectedAction);
      assert.equal(incident.status, 'RESOLVED');
    }
  });
}
