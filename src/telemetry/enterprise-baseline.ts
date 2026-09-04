import { GpuNode, StudioTelemetrySnapshot, DistributedTraceSpan } from '../types/telemetry';

export function getEnterpriseBaselineNodes(): GpuNode[] {
  const nodes: GpuNode[] = [];
  const baseTemperatures = [61, 64, 62, 65, 63, 62, 66, 64, 60, 63, 65, 62, 64, 63, 62, 61];
  const baseVramUsage = [26.4, 28.2, 24.8, 31.5, 27.1, 29.4, 25.8, 30.2, 26.9, 28.7, 31.0, 25.4, 27.8, 29.1, 26.2, 24.5];
  const basePower = [310, 335, 295, 345, 320, 340, 305, 350, 315, 330, 348, 300, 325, 338, 312, 290];

  for (let i = 1; i <= 16; i++) {
    const id = `gpu-node-${i.toString().padStart(2, '0')}`;
    const tileIdx = i;
    nodes.push({
      id,
      name: `Blade-Worker-${i.toString().padStart(2, '0')}`,
      cluster: 'STG-VIRTUAL-STAGE-A',
      gpuModel: 'NVIDIA RTX 6000 Ada (48GB GDDR6X)',
      vramTotalGb: 48,
      vramUsedGb: baseVramUsage[i - 1],
      gpuUtilizationPct: 78 + (i % 15),
      temperatureC: baseTemperatures[i - 1],
      powerWatts: basePower[i - 1],
      status: 'HEALTHY',
      currentJob: {
        id: `job-cycles-${840 + i}`,
        project: 'CHRONOS: BEYOND THE HORIZON',
        shot: 'SH_04_CITY_BATTLE',
        frame: 842,
        tileIndex: tileIdx,
        totalTiles: 64,
        pipelineStage: i % 2 === 0 ? 'RAYTRACING' : 'SHADER_COMPILE',
        elapsedSec: 14 + (i * 2)
      }
    });
  }

  return nodes;
}

export function getEnterpriseBaselineTraces(): DistributedTraceSpan[] {
  const traceId = 'tr-4k-render-842-live';
  const now = 1788463427652;

  return [
    {
      traceId,
      spanId: 'span-root-chronos',
      serviceName: 'studio-pipeline-orchestrator',
      operationName: 'RenderFrame_SH_04_CITY_BATTLE_Frame842',
      startTime: now,
      durationMs: 3850,
      statusCode: 'OK',
      attributes: {
        'cinema.project': 'CHRONOS',
        'cinema.resolution': '3840x2160 (4K DCI)',
        'cinema.samples': 512
      }
    },
    {
      traceId,
      spanId: 'span-usd-cache',
      parentSpanId: 'span-root-chronos',
      serviceName: 'asset-cache-service',
      operationName: 'FetchUSDStageAndTextures',
      startTime: now + 50,
      durationMs: 420,
      statusCode: 'OK',
      attributes: {
        'usd.prim_count': 84200,
        'cache.hit_ratio': 0.96
      }
    },
    {
      traceId,
      spanId: 'span-nanite-compile',
      parentSpanId: 'span-root-chronos',
      serviceName: 'unreal-nanite-compiler',
      operationName: 'CompileMaterialShaders',
      startTime: now + 500,
      durationMs: 580,
      statusCode: 'OK',
      attributes: {
        'shader.variant_count': 32,
        'shader.pipeline': 'OptiX_Raytracing'
      }
    },
    {
      traceId,
      spanId: 'span-bvh-raytrace',
      parentSpanId: 'span-root-chronos',
      serviceName: 'blender-cycles-engine',
      operationName: 'ComputeBvhRayIntersections [gpu-node-04]',
      startTime: now + 1100,
      durationMs: 2450,
      statusCode: 'OK',
      attributes: {
        'gpu.node_id': 'gpu-node-04',
        'gpu.cuda_cores_active': 18432,
        'vram.peak_allocated_gb': 31.5
      }
    },
    {
      traceId,
      spanId: 'span-nuke-comp',
      parentSpanId: 'span-root-chronos',
      serviceName: 'nuke-compositor',
      operationName: 'StitchTileBuffersAndApplyGrade',
      startTime: now + 3550,
      durationMs: 300,
      statusCode: 'OK',
      attributes: {
        'comp.color_space': 'ACEScg',
        'comp.layer_count': 12
      }
    }
  ];
}

export function getEnterpriseBaselineTelemetry(): StudioTelemetrySnapshot {
  return {
    timestamp: Date.now(),
    stageName: 'STG-VIRTUAL-STAGE-A (Hollywood LED Volume)',
    projectName: 'CHRONOS: BEYOND THE HORIZON ($185M Feature)',
    activeSequence: 'SQ_04_DESERT_AMBUSH &bull; Shot SH_04 &bull; Frame 842',
    nodes: getEnterpriseBaselineNodes(),
    recentMetrics: [
      {
        timestamp: Date.now() - 60000,
        renderTileLatencyMs: 310,
        activeRenderNodes: 16,
        clusterVramUtilizationPct: 58.4,
        frameDropRatePct: 0.01,
        thermalThrottledNodes: 0,
        completedFramesLastHour: 412
      }
    ],
    recentLogs: [
      {
        id: 'log-base-1',
        timestamp: Date.now() - 8000,
        level: 'INFO',
        nodeId: 'gpu-node-04',
        service: 'blender-cycles',
        message: 'OptiX BVH buffer generated (14.8M triangles) in 410ms on gpu-node-04'
      },
      {
        id: 'log-base-2',
        timestamp: Date.now() - 4000,
        level: 'INFO',
        nodeId: 'gpu-node-01',
        service: 'render-dispatcher',
        message: 'Tile chunk 14/64 completed at 128 samples/px; buffer streamed to compositor'
      }
    ],
    activeTraces: getEnterpriseBaselineTraces(),
    alerts: []
  };
}

export function getEnterpriseBaselineAnalytics() {
  return {
    anomalies: [],
    criticalCount: 0,
    warningCount: 0,
    clusterMeanVramRatio: 0.584,
    traceBottleneck: {
      spanId: 'span-bvh-raytrace',
      name: 'ComputeBvhRayIntersections [gpu-node-04]',
      durationMs: 2450,
      nominalMs: 1400,
      ratioOverNominal: 1.75,
      isBottleneck: false,
      service: 'blender-cycles-engine'
    }
  };
}
