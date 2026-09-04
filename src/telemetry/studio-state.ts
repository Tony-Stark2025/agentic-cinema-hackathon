import { GpuNode, MetricSample, StudioLogEntry, DistributedTraceSpan, StudioTelemetrySnapshot } from '../types/telemetry';
import { StudioIncident } from '../types/incident';
import { MetricsGenerator } from './metrics-generator';
import { LogsGenerator } from './logs-generator';
import { TraceGenerator } from './trace-generator';
import { TelemetryAnalyticsEngine, TelemetryMetricSample, NodeAnomalyEvaluation } from './analytics-engine';

export class StudioStateManager {
  private static instance: StudioStateManager;

  private nodes: GpuNode[] = [];
  private metrics: MetricSample[] = [];
  private logs: StudioLogEntry[] = [];
  private traces: DistributedTraceSpan[] = [];
  private activeIncidents: StudioIncident[] = [];
  private nodeHistory: Map<string, TelemetryMetricSample[]> = new Map();
  private analyticsEngine: TelemetryAnalyticsEngine;
  private lastUpdated: number = Date.now();

  private constructor() {
    this.analyticsEngine = TelemetryAnalyticsEngine.getInstance();
    this.resetToHealthy();
  }

  public static getInstance(): StudioStateManager {
    if (!StudioStateManager.instance) {
      StudioStateManager.instance = new StudioStateManager();
    }
    return StudioStateManager.instance;
  }

  public resetToHealthy(): void {
    this.nodes = MetricsGenerator.createInitialNodes();
    this.metrics = MetricsGenerator.generateTimeSeriesMetrics();
    this.logs = LogsGenerator.generateBaselineLogs();
    this.traces = TraceGenerator.generateRenderPipelineTrace();
    this.activeIncidents = [];
    this.nodeHistory.clear();

    const now = Date.now();
    for (const node of this.nodes) {
      this.nodeHistory.set(node.id, [
        { timestamp: now - 30000, vramUsedGb: node.vramUsedGb - 1.2, temperatureC: node.temperatureC - 2 },
        { timestamp: now - 20000, vramUsedGb: node.vramUsedGb - 0.6, temperatureC: node.temperatureC - 1 },
        { timestamp: now - 10000, vramUsedGb: node.vramUsedGb - 0.1, temperatureC: node.temperatureC },
        { timestamp: now, vramUsedGb: node.vramUsedGb, temperatureC: node.temperatureC }
      ]);
    }

    this.lastUpdated = Date.now();
  }

  public getSnapshot(): StudioTelemetrySnapshot {
    return {
      timestamp: Date.now(),
      stageName: process.env.SHOWRUNNER_STAGE || 'STG-VIRTUAL-STAGE-A (ILM Backlot)',
      projectName: 'CHRONOS: BEYOND THE HORIZON ($185M Feature)',
      activeSequence: 'SQ_04_CITY_BATTLE / Frame 842',
      nodes: this.nodes,
      recentMetrics: this.metrics,
      recentLogs: this.logs.slice(-20),
      activeTraces: this.traces,
      alerts: this.activeIncidents.map(inc => ({
        id: `alert-${inc.id}`,
        severity: inc.severity === 'P1_CRITICAL' ? 'critical' : 'warning',
        name: inc.title,
        summary: `Affects ${inc.affectedNodeId} on ${inc.affectedShot} (Frame ${inc.affectedFrame})`,
        nodeId: inc.affectedNodeId,
        timestamp: inc.detectedAt,
        active: inc.status !== 'RESOLVED'
      }))
    };
  }

  public getNodeEvaluation(nodeId: string): NodeAnomalyEvaluation {
    return this.analyticsEngine.evaluateNode(nodeId, this.nodes, this.nodeHistory.get(nodeId) || []);
  }

  public getClusterAnalytics(): {
    anomalies: NodeAnomalyEvaluation[];
    criticalCount: number;
    warningCount: number;
    clusterMeanVramRatio: number;
    traceBottleneck: any;
  } {
    const evaluations = this.nodes.map(n => this.getNodeEvaluation(n.id));
    const anomalies = evaluations.filter(e => e.severity !== 'NORMAL');
    const criticalCount = evaluations.filter(e => e.severity === 'CRITICAL').length;
    const warningCount = evaluations.filter(e => e.severity === 'WARNING').length;
    
    const vramRatios = this.nodes.map(n => n.vramUsedGb / n.vramTotalGb);
    const clusterMeanVramRatio = Number((vramRatios.reduce((a, b) => a + b, 0) / vramRatios.length).toFixed(4));
    
    const traceAnalysis = this.analyticsEngine.analyzeTraceSpans(this.traces);

    return {
      anomalies,
      criticalCount,
      warningCount,
      clusterMeanVramRatio,
      traceBottleneck: traceAnalysis.bottleneckSpan
    };
  }

  public getActiveIncidents(): StudioIncident[] {
    return this.activeIncidents;
  }

  public triggerIncident(
    category: 'CUDA_OOM_MEMORY_LEAK' | 'UNREAL_NANITE_SHADER_HANG' | 'STORAGE_IOPS_JITTER' = 'CUDA_OOM_MEMORY_LEAK',
    targetNodeId = 'gpu-node-04'
  ): StudioIncident {
    const targetNode = this.nodes.find(n => n.id === targetNodeId) || this.nodes[3];
    const now = Date.now();

    if (category === 'CUDA_OOM_MEMORY_LEAK') {
      targetNode.status = 'CRITICAL';
      targetNode.vramUsedGb = Number((targetNode.vramTotalGb - 0.2).toFixed(1)); // 99.4% VRAM
      targetNode.gpuUtilizationPct = 99;
      targetNode.temperatureC = 84;

      // Create high-velocity memory leak history (+480 MB/s)
      this.nodeHistory.set(targetNode.id, [
        { timestamp: now - 30000, vramUsedGb: 32.0, temperatureC: 66 },
        { timestamp: now - 20000, vramUsedGb: 38.5, temperatureC: 72 },
        { timestamp: now - 10000, vramUsedGb: 43.8, temperatureC: 79 },
        { timestamp: now, vramUsedGb: targetNode.vramUsedGb, temperatureC: 84 }
      ]);
    } else if (category === 'UNREAL_NANITE_SHADER_HANG') {
      targetNode.status = 'CRITICAL';
      targetNode.vramUsedGb = Number((targetNode.vramTotalGb * 0.88).toFixed(1));
      targetNode.gpuUtilizationPct = 100;
      targetNode.temperatureC = 88; // Thermal throttling

      this.nodeHistory.set(targetNode.id, [
        { timestamp: now - 30000, vramUsedGb: targetNode.vramUsedGb, temperatureC: 70 },
        { timestamp: now - 20000, vramUsedGb: targetNode.vramUsedGb, temperatureC: 76 },
        { timestamp: now - 10000, vramUsedGb: targetNode.vramUsedGb, temperatureC: 83 },
        { timestamp: now, vramUsedGb: targetNode.vramUsedGb, temperatureC: 88 }
      ]);
    } else {
      // Storage IOPS jitter / Demuxer starvation
      targetNode.status = 'WARNING';
      targetNode.gpuUtilizationPct = 12; // Starved for frames
      targetNode.temperatureC = 55;
    }

    const incidentId = `inc-${Date.now().toString(36)}`;
    const titles: Record<string, string> = {
      'CUDA_OOM_MEMORY_LEAK': `CUDA VRAM OOM Memory Spike on ${targetNode.id} (Arrakis 8K Raymarching)`,
      'UNREAL_NANITE_SHADER_HANG': `Unreal Engine Nanite Shader Compilation Deadlock on ${targetNode.id}`,
      'STORAGE_IOPS_JITTER': `NFS Storage IOPS Demuxer Starvation on ${targetNode.id}`
    };

    const newIncident: StudioIncident = {
      id: incidentId,
      title: titles[category] || `Incident on ${targetNode.id}`,
      category: category as any,
      severity: category === 'STORAGE_IOPS_JITTER' ? 'P2_HIGH' : 'P1_CRITICAL',
      affectedNodeId: targetNode.id,
      affectedShot: targetNode.currentJob?.shot || 'SH_04_CITY_BATTLE_04',
      affectedFrame: targetNode.currentJob?.frame || 842,
      detectedAt: Date.now(),
      status: 'DETECTED'
    };

    // Inject incident logs and error traces
    const incidentLogs = LogsGenerator.generateIncidentLogs(targetNode.id, category as any);
    this.logs.push(...incidentLogs);
    this.traces = TraceGenerator.generateRenderPipelineTrace(`trace-err-${incidentId}`, true, targetNode.id);
    
    // Prepend active incident
    this.activeIncidents.unshift(newIncident);
    this.lastUpdated = Date.now();

    return newIncident;
  }

  public updateIncident(incident: StudioIncident): void {
    const idx = this.activeIncidents.findIndex(i => i.id === incident.id);
    if (idx >= 0) {
      this.activeIncidents[idx] = incident;
    } else {
      this.activeIncidents.unshift(incident);
    }
  }

  public executeNodeRemediation(nodeId: string, actionType: string): { success: boolean; message: string } {
    const node = this.nodes.find(n => n.id === nodeId);
    if (!node) {
      return { success: false, message: `Node ${nodeId} not found in cluster.` };
    }

    node.status = 'HEALTHY';
    node.vramUsedGb = Math.floor(node.vramTotalGb * 0.38);
    node.gpuUtilizationPct = 70;
    node.temperatureC = 64;

    const now = Date.now();
    this.nodeHistory.set(nodeId, [
      { timestamp: now - 15000, vramUsedGb: node.vramUsedGb + 2, temperatureC: 68 },
      { timestamp: now, vramUsedGb: node.vramUsedGb, temperatureC: 64 }
    ]);

    // Log the remediation action in Loki logs
    this.logs.push({
      id: `log-rem-${Date.now()}`,
      timestamp: Date.now(),
      level: 'INFO',
      nodeId,
      service: 'render-dispatcher',
      message: `REMEDIATION SUCCESS: Executed [${actionType}] on ${nodeId}. VRAM flushed, tile size downscaled ($4\\times4 \\rightarrow 8\\times8$), frame 842 rescheduled.`
    });

    // Mark active incident as resolved
    const activeInc = this.activeIncidents.find(i => i.affectedNodeId === nodeId && i.status !== 'RESOLVED');
    if (activeInc) {
      activeInc.status = 'RESOLVED';
    }

    this.lastUpdated = Date.now();
    return {
      success: true,
      message: `Node ${nodeId} remediated via ${actionType}. Cluster load normalized.`
    };
  }

  public ingestExternalGpuTelemetry(data: {
    nodeId?: string;
    vramUsedGb: number;
    vramTotalGb?: number;
    temperatureC?: number;
    powerWatts?: number;
    gpuUtilizationPct?: number;
    gpuModel?: string;
  }): GpuNode {
    const targetId = data.nodeId || 'gpu-node-01';
    let targetNode = this.nodes.find(n => n.id === targetId);

    if (!targetNode) {
      targetNode = this.nodes[0];
    }

    targetNode.vramUsedGb = Number(data.vramUsedGb.toFixed(2));
    if (data.vramTotalGb) targetNode.vramTotalGb = Number(data.vramTotalGb.toFixed(2));
    if (data.temperatureC) targetNode.temperatureC = Math.round(data.temperatureC);
    if (data.powerWatts) targetNode.powerWatts = Math.round(data.powerWatts);
    if (data.gpuUtilizationPct !== undefined) targetNode.gpuUtilizationPct = Math.round(data.gpuUtilizationPct);
    if (data.gpuModel) targetNode.gpuModel = data.gpuModel;

    // Check if real GPU is hitting an OOM spike (> 92% VRAM)
    const ratio = targetNode.vramUsedGb / targetNode.vramTotalGb;
    if (ratio > 0.92 && targetNode.status !== 'CRITICAL') {
      this.triggerIncident('CUDA_OOM_MEMORY_LEAK', targetNode.id);
    } else if (ratio <= 0.85 && targetNode.status === 'CRITICAL') {
      targetNode.status = 'HEALTHY';
    }

    // Append to rolling history for dV/dt calculus
    const history = this.nodeHistory.get(targetNode.id) || [];
    history.push({
      timestamp: Date.now(),
      vramUsedGb: targetNode.vramUsedGb,
      temperatureC: targetNode.temperatureC
    });
    if (history.length > 20) history.shift();
    this.nodeHistory.set(targetNode.id, history);

    this.lastUpdated = Date.now();
    return targetNode;
  }
}
