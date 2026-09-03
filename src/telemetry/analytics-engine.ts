/**
 * TelemetryAnalyticsEngine
 * 
 * Performs deterministic statistical analysis on raw telemetry before
 * presenting structured evidence to Gemini 3.8 Flash:
 * - Memory Velocity (dV/dt) to detect runaway VRAM allocations
 * - 16-Node Cluster Z-Score to isolate statistical anomalies
 * - Tempo Trace Span Delta to isolate exact pipeline bottlenecks
 */

export interface TelemetryMetricSample {
  timestamp: number;
  vramUsedGb: number;
  temperatureC: number;
}

export interface NodeAnomalyEvaluation {
  nodeId: string;
  vramRatio: number;
  vramVelocityMbPerSec: number;
  vramZScore: number;
  temperatureZScore: number;
  isMemoryLeak: boolean;
  isThermalOutlier: boolean;
  severity: 'NORMAL' | 'WARNING' | 'CRITICAL';
  diagnosticNote: string;
}

export interface TraceSpanAnomaly {
  spanId: string;
  name: string;
  durationMs: number;
  nominalMs: number;
  ratioOverNominal: number;
  isBottleneck: boolean;
  service: string;
}

export class TelemetryAnalyticsEngine {
  private static instance: TelemetryAnalyticsEngine;

  public static getInstance(): TelemetryAnalyticsEngine {
    if (!TelemetryAnalyticsEngine.instance) {
      TelemetryAnalyticsEngine.instance = new TelemetryAnalyticsEngine();
    }
    return TelemetryAnalyticsEngine.instance;
  }

  /**
   * Computes first-order derivative of VRAM usage (dV/dt) in MB/s
   * over a rolling sample window.
   */
  public computeMemoryVelocity(samples: TelemetryMetricSample[]): number {
    if (!samples || samples.length < 2) return 0;
    
    const first = samples[0];
    const last = samples[samples.length - 1];
    
    const deltaSeconds = (last.timestamp - first.timestamp) / 1000;
    if (deltaSeconds <= 0) return 0;

    const deltaGb = last.vramUsedGb - first.vramUsedGb;
    const deltaMb = deltaGb * 1024;
    
    return Number((deltaMb / deltaSeconds).toFixed(2));
  }

  /**
   * Calculates population mean and standard deviation for a numeric array.
   */
  private calculateStats(values: number[]): { mean: number; stdDev: number } {
    if (values.length === 0) return { mean: 0, stdDev: 0 };
    const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
    const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
    const stdDev = Math.sqrt(variance);
    return { mean, stdDev: stdDev || 0.0001 };
  }

  /**
   * Evaluates a node's statistical position relative to the 16-node cluster
   * using standard Z-scores (Z = (x - mean) / stdDev).
   */
  public evaluateNode(
    targetNodeId: string,
    nodes: Array<{ id: string; vramUsedGb: number; vramTotalGb: number; temperatureC: number }>,
    history: TelemetryMetricSample[] = []
  ): NodeAnomalyEvaluation {
    const targetNode = nodes.find(n => n.id === targetNodeId);
    if (!targetNode) {
      return {
        nodeId: targetNodeId,
        vramRatio: 0,
        vramVelocityMbPerSec: 0,
        vramZScore: 0,
        temperatureZScore: 0,
        isMemoryLeak: false,
        isThermalOutlier: false,
        severity: 'NORMAL',
        diagnosticNote: 'Node not found in cluster topology'
      };
    }

    const vramRatios = nodes.map(n => n.vramUsedGb / n.vramTotalGb);
    const temperatures = nodes.map(n => n.temperatureC);

    const vramStats = this.calculateStats(vramRatios);
    const tempStats = this.calculateStats(temperatures);

    const targetVramRatio = targetNode.vramUsedGb / targetNode.vramTotalGb;
    const vramZScore = Number(((targetVramRatio - vramStats.mean) / vramStats.stdDev).toFixed(2));
    const temperatureZScore = Number(((targetNode.temperatureC - tempStats.mean) / tempStats.stdDev).toFixed(2));

    const vramVelocityMbPerSec = this.computeMemoryVelocity(history);

    const isMemoryLeak = (targetVramRatio > 0.88 && vramVelocityMbPerSec > 150) || vramZScore > 3.0;
    const isThermalOutlier = targetNode.temperatureC > 82 || temperatureZScore > 2.8;

    let severity: 'NORMAL' | 'WARNING' | 'CRITICAL' = 'NORMAL';
    let diagnosticNote = 'Telemetry within nominal cluster bounds.';

    if (targetVramRatio > 0.95 || (isMemoryLeak && targetVramRatio > 0.90)) {
      severity = 'CRITICAL';
      diagnosticNote = `CUDA VRAM high-water exhaustion: ${targetNode.vramUsedGb.toFixed(1)}GB/${targetNode.vramTotalGb}GB (${(targetVramRatio * 100).toFixed(1)}%). Memory velocity +${vramVelocityMbPerSec} MB/s (Z=${vramZScore}). Immediate OOM crash imminent.`;
    } else if (isThermalOutlier) {
      severity = 'WARNING';
      diagnosticNote = `Thermal junction alert: ${targetNode.temperatureC}°C exceeds cluster baseline (${tempStats.mean.toFixed(1)}°C, Z=${temperatureZScore}). Hardware clock down-throttling active.`;
    } else if (targetVramRatio > 0.85 || isMemoryLeak) {
      severity = 'WARNING';
      diagnosticNote = `Elevated VRAM allocation pressure: ${(targetVramRatio * 100).toFixed(1)}% with +${vramVelocityMbPerSec} MB/s growth rate.`;
    }

    return {
      nodeId: targetNodeId,
      vramRatio: Number(targetVramRatio.toFixed(4)),
      vramVelocityMbPerSec,
      vramZScore,
      temperatureZScore,
      isMemoryLeak,
      isThermalOutlier,
      severity,
      diagnosticNote
    };
  }

  /**
   * Inspects distributed trace spans to isolate microservice latency bottlenecks.
   */
  public analyzeTraceSpans(spans: Array<{
    spanId?: string;
    name?: string;
    operationName?: string;
    durationMs: number;
    nominalMs?: number;
    statusCode?: string;
    service?: string;
    serviceName?: string;
  }>): { anomalousSpans: TraceSpanAnomaly[]; bottleneckSpan: TraceSpanAnomaly | null } {
    const nominalDefaults: Record<string, number> = {
      'IngestGeometryAndTextures': 220,
      'CompileMaterialShaders': 180,
      'RaytraceTile': 1400,
      'DenoiseAndGradeOptiX': 350,
      'WriteEXRChunkToNFS': 120
    };

    const evaluated: TraceSpanAnomaly[] = spans.map(s => {
      const opName = s.operationName || s.name || 'UnknownSpan';
      const svcName = s.serviceName || s.service || 'vfx-render-pipeline';
      const nominal = s.nominalMs || nominalDefaults[opName] || 250;
      const ratio = Number((s.durationMs / nominal).toFixed(2));
      const isError = s.statusCode === 'ERROR';
      const isExtremeLatency = ratio > 2.5;

      return {
        spanId: s.spanId || `span-${Math.random().toString(36).slice(2, 7)}`,
        name: opName,
        durationMs: s.durationMs,
        nominalMs: nominal,
        ratioOverNominal: ratio,
        isBottleneck: isError || isExtremeLatency,
        service: svcName
      };
    });

    const anomalousSpans = evaluated.filter(s => s.isBottleneck);
    const bottleneckSpan = anomalousSpans.sort((a, b) => b.ratioOverNominal - a.ratioOverNominal)[0] || null;

    return { anomalousSpans, bottleneckSpan };
  }
}
