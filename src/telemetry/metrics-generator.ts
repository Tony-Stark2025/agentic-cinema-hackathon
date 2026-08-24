import { GpuNode, MetricSample } from '../types/telemetry';

export class MetricsGenerator {
  static createInitialNodes(): GpuNode[] {
    const gpuModels = ['NVIDIA RTX 6000 Ada (48GB)', 'NVIDIA A100 SXM4 (80GB)', 'NVIDIA H100 NVL (94GB)'];
    const nodes: GpuNode[] = [];

    for (let i = 1; i <= 16; i++) {
      const id = `gpu-node-${String(i).padStart(2, '0')}`;
      const model = gpuModels[i % gpuModels.length];
      const vramTotal = model.includes('48GB') ? 48 : model.includes('80GB') ? 80 : 94;
      const baseUsage = Math.floor(vramTotal * (0.45 + (Math.sin(i) * 0.15)));
      
      nodes.push({
        id,
        name: `Blender/UE5 Render Worker ${String(i).padStart(2, '0')}`,
        cluster: i <= 8 ? 'Cluster-Alpha (Main VFX)' : 'Cluster-Beta (Virtual Stage)',
        gpuModel: model,
        vramTotalGb: vramTotal,
        vramUsedGb: baseUsage,
        gpuUtilizationPct: Math.min(98, Math.max(55, Math.floor(75 + (Math.cos(i) * 15)))),
        temperatureC: Math.floor(62 + (i % 6) * 2),
        powerWatts: Math.floor(280 + (i % 8) * 12),
        status: 'HEALTHY',
        currentJob: {
          id: `job-seq-${100 + i}`,
          project: 'PROJECT_CHRONOS_BLOCKBUSTER',
          shot: `SH_04_CITY_BATTLE_${String(i).padStart(2, '0')}`,
          frame: 840 + (i * 2),
          tileIndex: (i % 4) + 1,
          totalTiles: 8,
          pipelineStage: i % 3 === 0 ? 'RAYTRACING' : i % 3 === 1 ? 'SHADER_COMPILE' : 'COMPOSITING',
          elapsedSec: 14 + (i * 3)
        }
      });
    }

    return nodes;
  }

  static generateTimeSeriesMetrics(historyCount = 20): MetricSample[] {
    const samples: MetricSample[] = [];
    const now = Date.now();

    for (let i = historyCount; i >= 0; i--) {
      const ts = now - (i * 15000);
      samples.push({
        timestamp: ts,
        renderTileLatencyMs: Math.floor(320 + Math.sin(i * 0.5) * 45),
        activeRenderNodes: 16,
        clusterVramUtilizationPct: Math.floor(68 + Math.cos(i * 0.4) * 8),
        frameDropRatePct: Number((0.02 + Math.random() * 0.04).toFixed(3)),
        thermalThrottledNodes: 0,
        completedFramesLastHour: 342 + (historyCount - i) * 3
      });
    }

    return samples;
  }
}
