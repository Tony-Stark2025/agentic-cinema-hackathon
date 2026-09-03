export type IncidentSeverity = 'P1_CRITICAL' | 'P2_HIGH' | 'P3_MEDIUM' | 'P4_LOW';

export type IncidentCategory = 
  | 'CUDA_OOM_MEMORY_LEAK' 
  | 'UNREAL_NANITE_SHADER_HANG' 
  | 'STORAGE_IOPS_JITTER'
  | 'ASSET_CACHE_CORRUPTION' 
  | 'TILE_RASTER_TIMEOUT' 
  | 'COMPOSITOR_COLOR_MISMATCH';

export interface StudioIncident {
  id: string;
  title: string;
  category: IncidentCategory;
  severity: IncidentSeverity;
  affectedNodeId: string;
  affectedShot: string;
  affectedFrame: number;
  detectedAt: number;
  status: 'DETECTED' | 'INVESTIGATING' | 'DIAGNOSED' | 'AWAITING_APPROVAL' | 'REMEDIATING' | 'RESOLVED';
  
  // Agentic Root-Cause & Action Plan
  rootCauseAnalysis?: {
    summary: string;
    culpritFile?: string;
    culpritFunction?: string;
    promqlEvidence: string;
    logqlEvidence: string;
    tempoTraceId: string;
    confidenceScore: number;
  };

  remediationActions?: {
    id: string;
    actionType: 'SPLIT_RENDER_TILES' | 'PURGE_NODE_VRAM' | 'FAILOVER_GPU_NODE' | 'HOT_RELOAD_SHADER' | 'SCALE_CLUSTER';
    description: string;
    status: 'PENDING' | 'EXECUTING' | 'SUCCESS' | 'FAILED';
    executedAt?: number;
    resultMessage?: string;
  }[];

  financialImpact?: {
    downtimeCostPerMinuteUsd: number;
    estimatedCostWithoutRemediationUsd: number;
    costSavedByShowrunnerUsd: number;
    framesDelayed: number;
    recoveryTimeSeconds: number;
  };
}
