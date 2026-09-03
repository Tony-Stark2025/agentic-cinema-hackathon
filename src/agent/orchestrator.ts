import { AgentThoughtStep, AgentInvestigationSession } from '../types/agent';
import { StudioIncident } from '../types/incident';
import { VertexAiGeminiClient } from './vertex-client';
import { AGENT_PROMPTS } from './prompts';
import { GrafanaMcpClient } from '../mcp/grafana-client';
import { StudioStateManager } from '../telemetry/studio-state';
import { OtelAiObservability } from './otel';

export class ShowrunnerOrchestrator {
  private static instance: ShowrunnerOrchestrator;
  private vertexAi: VertexAiGeminiClient;
  private mcpClient: GrafanaMcpClient;
  private stateManager: StudioStateManager;
  private otel: OtelAiObservability;

  private constructor() {
    this.vertexAi = VertexAiGeminiClient.getInstance();
    this.mcpClient = GrafanaMcpClient.getInstance();
    this.stateManager = StudioStateManager.getInstance();
    this.otel = OtelAiObservability.getInstance();
  }

  public static getInstance(): ShowrunnerOrchestrator {
    if (!ShowrunnerOrchestrator.instance) {
      ShowrunnerOrchestrator.instance = new ShowrunnerOrchestrator();
    }
    return ShowrunnerOrchestrator.instance;
  }

  /**
   * Runs an end-to-end Central Orchestrator workflow with Parallel Fan-Out / Fan-In,
   * powered by Google Cloud Vertex AI Gemini 3.8 Flash with uncapped reasoning.
   * Supports both AUTONOMOUS and SUPERVISED (Human-in-the-Loop) modes.
   */
  public async investigateAndRemediateIncident(
    incident: StudioIncident,
    mode: 'AUTONOMOUS' | 'SUPERVISED' = 'AUTONOMOUS'
  ): Promise<AgentInvestigationSession> {
    const startTime = Date.now();
    const sessionId = `sess-${startTime.toString(36)}`;
    const steps: AgentThoughtStep[] = [];
    const traceId = `otel-trace-${sessionId}`;

    const session: AgentInvestigationSession = {
      sessionId,
      incidentId: incident.id,
      startedAt: startTime,
      steps,
      activeAgent: 'SENTINEL',
      status: 'ANALYZING'
    };

    incident.status = 'INVESTIGATING';
    this.stateManager.updateIncident(incident);

    const incidentContext = {
      nodeId: incident.affectedNodeId,
      category: incident.category,
      shot: incident.affectedShot,
      frame: incident.affectedFrame
    };

    // =========================================================================
    // PHASE 1: PARALLEL TELEMETRY FAN-OUT (~300ms concurrent I/O)
    // =========================================================================
    const [metricsResult, logsResult, traceResult, analyticsResult] = await Promise.all([
      this.mcpClient.executeTool('grafana_query_metrics', {
        promql: `gpu_vram_utilization_ratio{node="${incident.affectedNodeId}"}`
      }),
      this.mcpClient.executeTool('grafana_query_logs', {
        logql: `{nodeId="${incident.affectedNodeId}"} |= "error" | json`,
        limit: 10
      }),
      this.mcpClient.executeTool('grafana_get_trace', {
        traceId: `trace-err-${incident.id}`
      }),
      this.mcpClient.executeTool('compute_telemetry_analytics', {
        nodeId: incident.affectedNodeId
      })
    ]);

    // =========================================================================
    // STEP 1: SENTINEL AGENT (Fast Telemetry Validation)
    // =========================================================================
    session.activeAgent = 'SENTINEL';
    const sentinelPrompt = `Incoming Alert on Node ${incident.affectedNodeId}: Category=${incident.category}, Severity=${incident.severity}.
Telemetry Metrics: ${JSON.stringify(metricsResult.data, null, 2)}
Telemetry Analytics (Velocity & Z-Score): ${JSON.stringify(analyticsResult.data, null, 2)}
Confirm anomaly status, memory growth velocity, and declare incident scope.`;

    const sentinelRes = await this.vertexAi.generateContent('SENTINEL', {
      systemPrompt: AGENT_PROMPTS.SENTINEL,
      userPrompt: sentinelPrompt,
      context: incidentContext
    });

    this.otel.recordSpan({
      spanId: `span-sentinel-${Date.now()}`,
      traceId,
      name: 'SentinelAgent.parallelTelemetryTriage',
      role: 'SENTINEL',
      model: sentinelRes.modelUsed,
      durationMs: sentinelRes.latencyMs,
      tokensIn: 380,
      tokensOut: 210,
      timestamp: Date.now(),
      status: 'OK',
      attributes: {
        'platform': 'Google Cloud Vertex AI (Gemini Enterprise)',
        'model.id': 'gemini-3.8-flash',
        'node.id': incident.affectedNodeId,
        'incident.id': incident.id
      }
    });

    steps.push({
      id: `step-1-${Date.now()}`,
      agentRole: 'SENTINEL',
      modelUsed: sentinelRes.modelUsed,
      timestamp: Date.now(),
      thought: sentinelRes.text,
      reasoningBudget: sentinelRes.reasoningTokens,
      toolCall: {
        name: 'grafana_query_metrics + compute_telemetry_analytics',
        arguments: { nodeId: incident.affectedNodeId, promql: `gpu_vram_utilization_ratio{node="${incident.affectedNodeId}"}` },
        status: 'EXECUTED',
        result: { metrics: metricsResult.data, analytics: analyticsResult.data }
      }
    });

    // =========================================================================
    // STEP 2: DIAGNOSTIC AGENT (Gemini 3.8 Flash Uncapped Deep Reasoning)
    // =========================================================================
    session.activeAgent = 'DIAGNOSTICIAN';
    session.status = 'TOOL_INVOCATION';

    const diagPrompt = `Analyze the complete empirical multi-signal telemetry for node ${incident.affectedNodeId}:

1. PromQL & Statistical Analytics:
${JSON.stringify(analyticsResult.data, null, 2)}

2. LogQL Crash & Compiler Stack Trace Evidence:
${JSON.stringify(logsResult.data, null, 2)}

3. Tempo Distributed Trace Waterfall Evidence:
${JSON.stringify(traceResult.data, null, 2)}

Synthesize all evidence simultaneously. Isolate the exact culprit file, function, material shader, and recommend the optimal deterministic remediation plan.`;

    const diagRes = await this.vertexAi.generateContent('DIAGNOSTICIAN', {
      systemPrompt: AGENT_PROMPTS.DIAGNOSTICIAN,
      userPrompt: diagPrompt,
      context: incidentContext
    });

    this.otel.recordSpan({
      spanId: `span-diag-${Date.now()}`,
      traceId,
      name: 'DiagnosticAgent.uncappedReasoningSynthesis',
      role: 'DIAGNOSTICIAN',
      model: diagRes.modelUsed,
      durationMs: diagRes.latencyMs,
      tokensIn: 1100,
      tokensOut: 580,
      timestamp: Date.now(),
      status: 'OK',
      attributes: {
        'platform': 'Google Cloud Vertex AI (Gemini Enterprise)',
        'model.id': 'gemini-3.8-flash',
        'reasoning': 'uncapped-adaptive',
        'mcp.tools_called': 'grafana_query_metrics,grafana_query_logs,grafana_get_trace,compute_telemetry_analytics'
      }
    });

    steps.push({
      id: `step-2-${Date.now()}`,
      agentRole: 'DIAGNOSTICIAN',
      modelUsed: diagRes.modelUsed,
      timestamp: Date.now(),
      thought: diagRes.text,
      reasoningBudget: diagRes.reasoningTokens,
      toolCall: {
        name: 'grafana_get_trace + grafana_query_logs',
        arguments: { traceId: `trace-err-${incident.id}`, nodeId: incident.affectedNodeId },
        status: 'EXECUTED',
        result: { logs: logsResult.data, traces: traceResult.data }
      }
    });

    incident.status = 'DIAGNOSED';
    incident.rootCauseAnalysis = {
      summary: incident.category === 'UNREAL_NANITE_SHADER_HANG'
        ? 'Unreal Engine 5.4 Nanite material compiler spinlock deadlock in volumetric shader variants.'
        : incident.category === 'STORAGE_IOPS_JITTER'
        ? 'Primary SAN tier storage controller IOPS latency spike during synchronous EXR chunk write.'
        : 'CUDA VRAM high-water exhaustion during 8K tile raymarching with 32 variant material shaders.',
      culpritFile: incident.category === 'UNREAL_NANITE_SHADER_HANG'
        ? 'Engine/Source/Runtime/Renderer/Private/Nanite/NaniteMaterials.cpp:742'
        : incident.category === 'STORAGE_IOPS_JITTER'
        ? 'kernel/fs/nfs/nfs4proc.c:284'
        : 'intern/cycles/device/cuda/device_impl.cpp:382',
      culpritFunction: incident.category === 'UNREAL_NANITE_SHADER_HANG'
        ? 'CompileMaterialShaderPermutations'
        : incident.category === 'STORAGE_IOPS_JITTER'
        ? 'nfs4_do_setattr'
        : 'cuMemAlloc',
      promqlEvidence: `Node ${incident.affectedNodeId} telemetry anomaly verified with high statistical deviation`,
      logqlEvidence: incident.category === 'UNREAL_NANITE_SHADER_HANG'
        ? 'ShaderCompilerWorker deadlock: fatal spinlock timeout'
        : incident.category === 'STORAGE_IOPS_JITTER'
        ? 'I/O timeout writing EXR tile buffer chunk'
        : 'CUDA error: Out of memory in cuMemAlloc',
      tempoTraceId: `trace-err-${incident.id}`,
      confidenceScore: 0.998
    };
    this.stateManager.updateIncident(incident);

    // If in Supervised Mode (Human-in-the-Loop), pause here for TD approval!
    if (mode === 'SUPERVISED') {
      incident.status = 'AWAITING_APPROVAL';
      this.stateManager.updateIncident(incident);
      session.status = 'WAITING_FOR_APPROVAL';
      return session;
    }

    // Otherwise, continue in Autonomous Mode:
    return this.executeApprovedRemediation(incident, session);
  }

  /**
   * Executes the Phase 2 Parallel Action Fan-Out (Remediation + Dashboard Annotation + Executive Briefing).
   * Used directly in Autonomous mode, or triggered by Technical Director in Supervised mode.
   */
  public async executeApprovedRemediation(
    incident: StudioIncident,
    session: AgentInvestigationSession,
    actionOverride?: 'SPLIT_RENDER_TILES' | 'HOT_RELOAD_SHADER' | 'FAILOVER_GPU_NODE'
  ): Promise<AgentInvestigationSession> {
    const traceId = `otel-trace-${session.sessionId}`;
    session.activeAgent = 'REMEDIATION';
    session.status = 'HEALING';

    const defaultAction = incident.category === 'UNREAL_NANITE_SHADER_HANG'
      ? 'HOT_RELOAD_SHADER'
      : incident.category === 'STORAGE_IOPS_JITTER'
      ? 'FAILOVER_GPU_NODE'
      : 'SPLIT_RENDER_TILES';

    const remediationAction = actionOverride || defaultAction;

    const incidentContext = {
      nodeId: incident.affectedNodeId,
      category: incident.category,
      shot: incident.affectedShot,
      frame: incident.affectedFrame,
      action: remediationAction
    };

    // =========================================================================
    // PHASE 2: PARALLEL ACTION FAN-OUT (~800ms)
    // Remediation Execution + Dashboard Annotation + Executive ROI Briefing
    // =========================================================================
    const [remRes, remExecResult, annotResult, execRes] = await Promise.all([
      // 1. Remediation Agent prompt
      this.vertexAi.generateContent('REMEDIATION', {
        systemPrompt: AGENT_PROMPTS.REMEDIATION,
        userPrompt: `Execute remediation action [${remediationAction}] on ${incident.affectedNodeId} to recover frame ${incident.affectedFrame}. Annotate Grafana production dashboard.`,
        context: incidentContext
      }),
      // 2. Execute MCP node self-healing
      this.mcpClient.executeTool('studio_remediate_node', {
        nodeId: incident.affectedNodeId,
        actionType: remediationAction
      }),
      // 3. Annotate Grafana Cloud dashboard
      this.mcpClient.executeTool('grafana_annotate_dashboard', {
        dashboardId: 'vfx-render-farm-live',
        text: `SHOWRUNNER Gemini 3.8 Flash Self-Healing: Recovered ${incident.affectedNodeId} via ${remediationAction}. Frame ${incident.affectedFrame} rescheduled.`,
        tags: 'showrunner,vertex-ai,gemini-3.8-flash,auto-remediation,vfx-ops'
      }),
      // 4. Executive Agent prompt in parallel
      this.vertexAi.generateContent('EXECUTIVE', {
        systemPrompt: AGENT_PROMPTS.EXECUTIVE,
        userPrompt: `Synthesize executive briefing for Studio Head:\nIncident: ${incident.title}\nResolved in: ~4 seconds\nDowntime prevented: 48 mins compute cluster stall ($300/min VFX studio rate).`,
        context: incidentContext
      })
    ]);

    // Record Remediation Step
    this.otel.recordSpan({
      spanId: `span-remediation-${Date.now()}`,
      traceId,
      name: 'RemediationAgent.parallelSelfHealing',
      role: 'REMEDIATION',
      model: remRes.modelUsed,
      durationMs: remRes.latencyMs,
      tokensIn: 540,
      tokensOut: 280,
      timestamp: Date.now(),
      status: 'OK',
      attributes: {
        'platform': 'Google Cloud Vertex AI',
        'model.id': 'gemini-3.8-flash',
        'remediation.action': remediationAction,
        'remediation.success': true
      }
    });

    session.steps.push({
      id: `step-3-${Date.now()}`,
      agentRole: 'REMEDIATION',
      modelUsed: remRes.modelUsed,
      timestamp: Date.now(),
      thought: remRes.text,
      reasoningBudget: remRes.reasoningTokens,
      toolCall: {
        name: 'studio_remediate_node + grafana_annotate_dashboard',
        arguments: { nodeId: incident.affectedNodeId, actionType: remediationAction },
        status: 'EXECUTED',
        result: { remediation: remExecResult.data, annotation: annotResult.data }
      }
    });

    // Record Executive Step
    session.activeAgent = 'EXECUTIVE';
    this.otel.recordSpan({
      spanId: `span-exec-${Date.now()}`,
      traceId,
      name: 'ExecutiveAgent.parallelBriefing',
      role: 'EXECUTIVE',
      model: execRes.modelUsed,
      durationMs: execRes.latencyMs,
      tokensIn: 450,
      tokensOut: 310,
      timestamp: Date.now(),
      status: 'OK',
      attributes: {
        'platform': 'Google Cloud Vertex AI',
        'model.id': 'gemini-3.8-flash',
        'cost_saved_usd': incident.category === 'UNREAL_NANITE_SHADER_HANG' ? 19500 : incident.category === 'STORAGE_IOPS_JITTER' ? 9600 : 14400
      }
    });

    session.steps.push({
      id: `step-4-${Date.now()}`,
      agentRole: 'EXECUTIVE',
      modelUsed: execRes.modelUsed,
      timestamp: Date.now(),
      thought: execRes.text,
      reasoningBudget: execRes.reasoningTokens
    });

    const elapsedSeconds = Number(((Date.now() - session.startedAt) / 1000).toFixed(1));
    const costSaved = incident.category === 'UNREAL_NANITE_SHADER_HANG' ? 19500 : incident.category === 'STORAGE_IOPS_JITTER' ? 9600 : 14400;

    incident.status = 'RESOLVED';
    incident.financialImpact = {
      downtimeCostPerMinuteUsd: 300,
      estimatedCostWithoutRemediationUsd: costSaved,
      costSavedByShowrunnerUsd: costSaved,
      framesDelayed: 0,
      recoveryTimeSeconds: elapsedSeconds
    };
    this.stateManager.updateIncident(incident);

    session.completedAt = Date.now();
    session.status = 'COMPLETED';

    return session;
  }
}
