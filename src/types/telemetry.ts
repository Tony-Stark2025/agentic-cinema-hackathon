export type NodeStatus = 'HEALTHY' | 'WARNING' | 'CRITICAL' | 'REMEDIATING' | 'OFFLINE';

export type PipelineStage = 'INGEST' | 'ASSEMBLY' | 'SHADER_COMPILE' | 'RAYTRACING' | 'COMPOSITING' | 'ENCODE';

export interface GpuNode {
  id: string;
  name: string;
  cluster: string;
  gpuModel: string;
  vramTotalGb: number;
  vramUsedGb: number;
  gpuUtilizationPct: number;
  temperatureC: number;
  powerWatts: number;
  status: NodeStatus;
  currentJob?: {
    id: string;
    project: string;
    shot: string;
    frame: number;
    tileIndex: number;
    totalTiles: number;
    pipelineStage: PipelineStage;
    elapsedSec: number;
  };
}

export interface MetricSample {
  timestamp: number;
  renderTileLatencyMs: number;
  activeRenderNodes: number;
  clusterVramUtilizationPct: number;
  frameDropRatePct: number;
  thermalThrottledNodes: number;
  completedFramesLastHour: number;
}

export interface StudioLogEntry {
  id: string;
  timestamp: number;
  level: 'DEBUG' | 'INFO' | 'WARN' | 'ERROR' | 'FATAL';
  nodeId: string;
  service: 'blender-cycles' | 'unreal-nanite' | 'nuke-compositor' | 'asset-cache' | 'render-dispatcher';
  message: string;
  traceId?: string;
  spanId?: string;
  metadata?: Record<string, string | number | boolean>;
}

export interface DistributedTraceSpan {
  traceId: string;
  spanId: string;
  parentSpanId?: string;
  serviceName: string;
  operationName: string;
  startTime: number;
  durationMs: number;
  statusCode: 'OK' | 'ERROR';
  attributes: Record<string, string | number>;
  errorMessage?: string;
}

export interface StudioTelemetrySnapshot {
  timestamp: number;
  stageName: string;
  projectName: string;
  activeSequence: string;
  nodes: GpuNode[];
  recentMetrics: MetricSample[];
  recentLogs: StudioLogEntry[];
  activeTraces: DistributedTraceSpan[];
  alerts: {
    id: string;
    severity: 'critical' | 'warning' | 'info';
    name: string;
    summary: string;
    nodeId?: string;
    timestamp: number;
    active: boolean;
  }[];
}
