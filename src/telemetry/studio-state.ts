import { GpuNode, MetricSample, StudioLogEntry, DistributedTraceSpan, StudioTelemetrySnapshot } from '../types/telemetry';
import { StudioIncident } from '../types/incident';
import { MetricsGenerator } from './metrics-generator';
import { LogsGenerator } from './logs-generator';
import { TraceGenerator } from './trace-generator';

export class StudioStateManager {
  private static instance: StudioStateManager;

  private nodes: GpuNode[] = [];
  private metrics: MetricSample[] = [];
  private logs: StudioLogEntry[] = [];
  private traces: DistributedTraceSpan[] = [];
  private activeIncidents: StudioIncident[] = [];
  private lastUpdated: number = Date.now();

  private constructor() {
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

  public getActiveIncidents(): StudioIncident[] {
    return this.activeIncidents;
  }

  public triggerIncident(category: 'CUDA_OOM_MEMORY_LEAK' | 'UNREAL_NANITE_SHADER_HANG' = 'CUDA_OOM_MEMORY_LEAK', targetNodeId = 'gpu-node-04'): StudioIncident {
    const targetNode = this.nodes.find(n => n.id === targetNodeId) || this.nodes[3];
    targetNode.status = 'CRITICAL';
    targetNode.vramUsedGb = targetNode.vramTotalGb - 0.2; // 99% VRAM
    targetNode.gpuUtilizationPct = 99;
    targetNode.temperatureC = 84;

    const incidentId = `inc-${Date.now().toString(36)}`;
    const newIncident: StudioIncident = {
      id: incidentId,
      title: category === 'CUDA_OOM_MEMORY_LEAK' 
        ? `CUDA VRAM OOM Memory Spike on ${targetNode.id}` 
        : `Unreal Engine Nanite Shader Compilation Hang on ${targetNode.id}`,
      category,
      severity: 'P1_CRITICAL',
      affectedNodeId: targetNode.id,
      affectedShot: targetNode.currentJob?.shot || 'SH_04_CITY_BATTLE_04',
      affectedFrame: targetNode.currentJob?.frame || 842,
      detectedAt: Date.now(),
      status: 'DETECTED'
    };

    // Inject incident logs and error traces
    const incidentLogs = LogsGenerator.generateIncidentLogs(targetNode.id, category);
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
    node.vramUsedGb = Math.floor(node.vramTotalGb * 0.42);
    node.gpuUtilizationPct = 72;
    node.temperatureC = 64;

    // Log the remediation action in Loki logs
    this.logs.push({
      id: `log-rem-${Date.now()}`,
      timestamp: Date.now(),
      level: 'INFO',
      nodeId,
      service: 'render-dispatcher',
      message: `REMEDIATION SUCCESS: Executed [${actionType}] on ${nodeId}. VRAM flushed, tile size halved (128x128), and frame 842 rescheduled successfully.`
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
}
